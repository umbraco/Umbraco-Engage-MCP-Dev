#!/usr/bin/env node
/**
 * Bulk codegen for Umbraco Engage MCP tool collections.
 *
 * Reads the swagger spec + Orval-generated client/zod, and writes one tool
 * file per operation into src/umbraco-api/tools/{collection}/{verb}/.
 *
 * Run with: node scripts/gen-tools.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const swagger = require(path.join(root, "swagger-engage.json"));
const collMap = require(path.join(root, "collection-map.json"));
const voidMethods = new Set(require(path.join(root, "void-methods.json")));

const zodSrc = fs.readFileSync(
  path.join(root, "src/umbraco-api/api/generated/umbracoEngageManagementApi.zod.ts"),
  "utf8",
);
const apiSrc = fs.readFileSync(
  path.join(root, "src/umbraco-api/api/generated/umbracoEngageManagementApi.ts"),
  "utf8",
);

const zodNames = new Set();
const zodArrayNames = new Set();
{
  const re = /^export const ([a-zA-Z0-9_]+) = (zod\.[a-zA-Z]+)/gm;
  let m;
  while ((m = re.exec(zodSrc))) {
    zodNames.add(m[1]);
    if (m[2] === "zod.array") zodArrayNames.add(m[1]);
  }
}

// Map: collection folder name (slashes stripped) -> tag in swagger
function folderName(coll) {
  return coll.replace(/\//g, "");
}

function kebab(s) {
  // Convert "GetAbTestProject" -> "get-ab-test-project"
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function titleCase(s) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function methodHasPathParam(methodName) {
  // Find the method declaration and check if first parameter is a non-options arg
  // Pattern: "const NAME = (\n    paramName: type,\n options?..."
  const re = new RegExp(
    `const ${methodName} = \\(\\s*([a-zA-Z0-9_]+)?:?\\s*([^,)]+)?`,
    "m",
  );
  const m = re.exec(apiSrc);
  if (!m) return null;
  const firstParam = (m[1] || "").trim();
  if (!firstParam || firstParam === "options") return null;
  return firstParam;
}

// Build per-collection op buckets
const opsByCollection = {};
for (const [coll, tag] of Object.entries(collMap)) {
  opsByCollection[coll] = [];
}
for (const p of Object.keys(swagger.paths)) {
  for (const m of Object.keys(swagger.paths[p])) {
    const op = swagger.paths[p][m];
    const tag = (op.tags || ["untagged"])[0];
    const coll = Object.entries(collMap).find(([, t]) => t === tag)?.[0];
    if (!coll) continue;
    opsByCollection[coll].push({ path: p, method: m.toUpperCase(), op });
  }
}

function buildToolFile({ coll, p, method, op }) {
  const opId = op.operationId;
  const methodName = opId.charAt(0).toLowerCase() + opId.slice(1);
  const isVoid = voidMethods.has(methodName);
  const hasBody = !!op.requestBody;
  const params = op.parameters || [];
  const queryParams = params.filter((x) => x.in === "query");
  const pathParams = params.filter((x) => x.in === "path");
  const hasQuery = queryParams.length > 0;
  const hasPath = pathParams.length > 0;

  const bodyZod = methodName + "Body";
  const queryZod = methodName + "QueryParams";
  const respZod = methodName + "Response";

  const verbFolder = method.toLowerCase();
  const toolName = kebab(opId);
  const fileName = toolName + ".ts";

  // Slice
  let slice = "read";
  if (method === "DELETE") slice = "delete";
  else if (method === "PUT") slice = "update";
  else if (method === "POST") slice = "create";
  else if (method === "GET") {
    // List if response is an array OR path ends in /all
    const resp = op.responses && (op.responses["200"] || op.responses["201"]);
    const respSchema = resp && resp.content && resp.content["application/json"] && resp.content["application/json"].schema;
    const isArray = respSchema && respSchema.type === "array";
    if (isArray || /\/all$/i.test(p)) slice = "list";
  }

  // Annotations
  const annotationsLine =
    method === "GET"
      ? "{ readOnlyHint: true }"
      : method === "DELETE"
        ? "{ destructiveHint: true }"
        : method === "PUT"
          ? "{ idempotentHint: true }"
          : "{ destructiveHint: false, idempotentHint: false }";

  // Input schema
  // Priority: body > query > path > empty
  let inputSchemaImport = null;
  let inputSchemaExpr = null;
  let bodyIsArray = false;
  let useLocalZ = false;
  if (hasBody && zodNames.has(bodyZod)) {
    inputSchemaImport = bodyZod;
    if (zodArrayNames.has(bodyZod)) {
      bodyIsArray = true;
      // Wrap array body so the tool input has a `.shape`
      inputSchemaExpr = `z.object({ items: ${bodyZod} })`;
      useLocalZ = true;
    } else {
      inputSchemaExpr = bodyZod;
    }
  } else if (hasQuery && zodNames.has(queryZod)) {
    inputSchemaImport = queryZod;
    inputSchemaExpr = queryZod;
  } else if (hasPath) {
    inputSchemaExpr = "z.object({ " +
      pathParams.map((pp) => {
        const t = pp.schema && pp.schema.type;
        const z = t === "integer" || t === "number" ? "z.number()" : "z.string()";
        return `${pp.name}: ${z}`;
      }).join(", ") + " })";
    useLocalZ = true;
  } else {
    inputSchemaExpr = "z.object({})";
    useLocalZ = true;
  }

  // Output schema
  // The MCP spec requires `structuredContent` to be a JSON object — arrays are
  // rejected by clients with "expected record, received array". For ZodArray
  // responses we wrap in `z.object({ items: arrayZod })` and the handler also
  // wraps the structuredContent the same way at runtime.
  let outputSchemaImport = null;
  let outputSchemaExpr = null;
  let outputIsArray = false;
  if (!isVoid && zodNames.has(respZod)) {
    outputSchemaImport = respZod;
    if (zodArrayNames.has(respZod)) {
      outputIsArray = true;
      outputSchemaExpr = `z.object({ items: ${respZod} })`;
      useLocalZ = true;
    } else {
      outputSchemaExpr = respZod;
    }
  }

  // Build call expression args
  const firstParamName = methodHasPathParam(methodName);
  // For path-param ops: arg = params.<paramName>, plus possibly query/body after
  // For body ops: arg = params (whole body)
  // For query ops: arg = params (query bag)
  // For no-arg ops: nothing
  let callArgs;
  if (firstParamName && firstParamName !== "options") {
    if (hasBody) {
      callArgs = bodyIsArray
        ? `params.items, CAPTURE_RAW_HTTP_RESPONSE`
        : `params, CAPTURE_RAW_HTTP_RESPONSE`;
    } else if (hasPath && !hasQuery) {
      callArgs = `params.${pathParams[0].name}, CAPTURE_RAW_HTTP_RESPONSE`;
    } else if (hasPath && hasQuery) {
      const queryOnly = `{ ${queryParams.map((q) => `${q.name}: params.${q.name}`).join(", ")} }`;
      callArgs = `params.${pathParams[0].name}, ${queryOnly}, CAPTURE_RAW_HTTP_RESPONSE`;
    } else if (hasQuery) {
      callArgs = `params, CAPTURE_RAW_HTTP_RESPONSE`;
    } else {
      callArgs = `CAPTURE_RAW_HTTP_RESPONSE`;
    }
  } else {
    callArgs = `CAPTURE_RAW_HTTP_RESPONSE`;
  }

  // Imports
  const helperImports = isVoid
    ? "executeVoidApiCall"
    : "executeGetApiCall";

  const zImport = useLocalZ ? `import { z } from "zod";\n` : "";
  const zodImports = [inputSchemaImport, outputSchemaImport].filter(Boolean);
  let zodImportLine = "";
  if (zodImports.length > 0) {
    zodImportLine = `import { ${zodImports.join(", ")} } from "../../../api/generated/umbracoEngageManagementApi.zod.js";\n`;
  }

  // Description
  const summary = (op.summary || "").trim();
  const verb = method === "GET" ? (slice === "list" ? "List" : "Get") : method === "POST" ? "Post" : method === "PUT" ? "Update" : "Delete";
  const phrase = opId.replace(/^(Get|Post|Put|Delete|Patch)/, "");
  const human = phrase.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const baseDesc = summary || `${verb} the Umbraco Engage ${human} resource. Calls ${method} ${p}.`;

  // ToolDefinition generic — for non-void outputs we declare an `outputSchema`
  // const so the type reference is stable even when the schema is an inline
  // `z.object({ items: ... })` wrapper.
  const toolDef = outputSchemaExpr
    ? `ToolDefinition<typeof inputSchema.shape, typeof outputSchema>`
    : `ToolDefinition<typeof inputSchema.shape>`;

  const handlerParam = callArgs.includes("params") ? "params" : "";
  let handlerSig;
  if (isVoid) {
    handlerSig = `async (${handlerParam}) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.${methodName}(${callArgs}),
    );
  }`;
  } else if (outputIsArray) {
    handlerSig = `async (${handlerParam}) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["${methodName}"]>, ApiClient>(
      (client) => client.${methodName}(${callArgs}),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  }`;
  } else {
    handlerSig = `async (${handlerParam}) => {
    return executeGetApiCall<ReturnType<ApiClient["${methodName}"]>, ApiClient>(
      (client) => client.${methodName}(${callArgs}),
    );
  }`;
  }

  const file = `import {
  withStandardDecorators,
  ${helperImports},
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
${zImport}${zodImportLine}import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = ${inputSchemaExpr};
${outputSchemaExpr ? `const outputSchema = ${outputSchemaExpr};\n` : ""}
const tool: ${toolDef} = {
  name: "${toolName}",
  description:
    "${baseDesc.replace(/"/g, '\\"')}",
  inputSchema: inputSchema.shape,${outputSchemaExpr ? `\n  outputSchema,` : ""}
  slices: ["${slice}"],
  annotations: ${annotationsLine},
  handler: ${handlerSig},
};

export default withStandardDecorators(tool);
`;

  return { verbFolder, fileName, file, toolName };
}

// Generate all
const collectionRegistrations = [];
for (const [coll, ops] of Object.entries(opsByCollection)) {
  if (ops.length === 0) continue;
  const folder = folderName(coll);
  const dir = path.join(root, "src/umbraco-api/tools", folder);
  if (fs.existsSync(path.join(dir, "index.ts"))) {
    console.log("SKIP", folder, "(index.ts exists)");
    continue;
  }
  fs.mkdirSync(dir, { recursive: true });

  const toolEntries = [];
  for (const { path: p, method, op } of ops) {
    const { verbFolder, fileName, file, toolName } = buildToolFile({
      coll,
      p,
      method,
      op,
    });
    const verbDir = path.join(dir, verbFolder);
    fs.mkdirSync(verbDir, { recursive: true });
    fs.writeFileSync(path.join(verbDir, fileName), file);
    toolEntries.push({ verbFolder, fileName, toolName });
  }

  // Build index.ts
  const importStmts = toolEntries
    .map((t, i) => {
      const ident = `tool${i}`;
      return `import ${ident} from "./${t.verbFolder}/${t.fileName.replace(/\.ts$/, ".js")}";`;
    })
    .join("\n");
  const refs = toolEntries.map((_, i) => `tool${i}`).join(", ");

  const displayName = titleCase(folder.replace(/-/g, "-"));
  const indexFile = `import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
${importStmts}

const collection: ToolCollectionExport = {
  metadata: {
    name: "${folder}",
    displayName: "${displayName}",
    description: "Umbraco Engage ${displayName} tools",
  },
  tools: () => [${refs}],
};

export default collection;
`;
  fs.writeFileSync(path.join(dir, "index.ts"), indexFile);
  collectionRegistrations.push(folder);
  console.log("GEN", folder, "(" + toolEntries.length + " tools)");
}

fs.writeFileSync(
  path.join(root, "generated-collections.json"),
  JSON.stringify(collectionRegistrations, null, 2),
);
console.log("Done. Wrote", collectionRegistrations.length, "collections.");
