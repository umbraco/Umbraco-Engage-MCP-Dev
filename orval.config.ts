// Loads .env, so the target-major transformer below can ask the connected
// Umbraco which version it is (it needs UMBRACO_BASE_URL / UMBRACO_CLIENT_ID /
// UMBRACO_CLIENT_SECRET), and so the spec URL comes from the same instance.
import "dotenv/config";

import { defineConfig, type HookFunction } from "orval";
import {
  orvalImportFixer,
  relaxUntypedArrays,
  postProcessZodFiles,
  createUmbracoTargetMajorTransformer,
} from "@umbraco-cms/mcp-server-sdk/orval";

/**
 * Stamps the Umbraco major version this server targets into
 * src/config/umbraco-target.generated.ts, read from an authenticated
 * `GET /umbraco/management/api/v1/server/information` against the instance in
 * `.env` (the spec can't supply it: Umbraco hard-codes `info.version` to
 * "Latest"). It sits in orval's input-transformer slot so the constant and the
 * generated client can't drift apart; it leaves the spec untouched.
 */
const stampTargetMajor = createUmbracoTargetMajorTransformer({
  outputPath: "./src/config/umbraco-target.generated.ts",
});

/**
 * Orval Configuration
 *
 * This is the Umbraco 18 line (branches v18/main, v18/dev), generated against
 * Umbraco 18 + Umbraco Engage 18.x. Umbraco 18 serves its specs at
 * /umbraco/openapi/<document>.json (OpenAPI 3.1); Umbraco 17 (the main/dev
 * branches) serves them through Swashbuckle at
 * /umbraco/swagger/<document>/swagger.json (OpenAPI 3.0).
 *
 * The spec is read from the same instance as the target major
 * (UMBRACO_BASE_URL in .env, defaulting to the demo-site's
 * https://localhost:44448), so the generated client and the stamped
 * UMBRACO_TARGET_MAJOR cannot come from two different Umbraco installs.
 *
 * `relaxUntypedArrays` works around Umbraco 18 schemas that declare
 * `type: array` with no `items` (e.g. AnalyticsQueryResultModel.rows), which
 * orval would otherwise turn into an uncompilable `zod.array()`.
 */
const ENGAGE_MANAGEMENT_SPEC_URL = `${(process.env.UMBRACO_BASE_URL ?? "https://localhost:44448").replace(/\/+$/, "")}/umbraco/openapi/engage-management.json`;

export default defineConfig({
  // Main API client generation
  umbracoEngageManagementApi: {
    input: {
      target: ENGAGE_MANAGEMENT_SPEC_URL,
      unsafeDisableValidation: true,
      override: {
        // Orval awaits input transformers, so returning the promise is correct.
        transformer: (spec) => stampTargetMajor(relaxUntypedArrays(spec)),
      },
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoEngageManagementApi.ts",
      client: "axios",
      mode: "single",
      clean: false,
      override: {
        mutator: {
          path: "./src/umbraco-api/api/client.ts",
          name: "customInstance",
        },
        // These endpoints declare their binary response under a `oneOf: [{
        // type: string, format: binary }]` wrapper rather than a bare `format:
        // binary` schema. Orval 8 only detects blob responses on the bare
        // form, so without this override it stops emitting `responseType:
        // 'blob'` here and axios would try to parse the downloaded
        // file as JSON.
        operations: {
          GetContentScoringExportCustomerJourney: { requestOptions: { responseType: "blob" } },
          GetContentScoringExportPersona: { requestOptions: { responseType: "blob" } },
          PostProfileExportCsv: { requestOptions: { responseType: "blob" } },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer as HookFunction,
    },
  },

  // Zod schema generation for validation
  umbracoEngageManagementApiZod: {
    input: {
      target: ENGAGE_MANAGEMENT_SPEC_URL,
      unsafeDisableValidation: true,
      override: {
        transformer: (spec) => relaxUntypedArrays(spec),
      },
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoEngageManagementApi.zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
    },
    hooks: {
      // postProcessZodFiles bundles three fixes:
      // - relaxUuidToGuid: Umbraco returns GUIDs that aren't RFC 4122 compliant
      //   (e.g. sequential version ids like `0000003f-0000-0000-0000-000000000000`).
      //   Zod's uuid() rejects these; guid() validates the 8-4-4-4-12 hex shape
      //   without the RFC 4122 constraint. Only relaxes output-schema usage -
      //   hand-written tool input schemas should keep using uuid() directly.
      // - camelCaseZodExports: Orval 8 keeps Umbraco's PascalCase operationIds
      //   (e.g. `GetAbTestProject`) when naming zod exports; every tool imports
      //   these by their orval-7 camelCase name (`getAbTestProject`).
      // - restoreV7OptionalDefaults: orval 8 emits `.default(<falsyConst>)` for
      //   query params with a falsy spec default (e.g. `foldersOnly: false`)
      //   instead of orval 7's `.optional()`, which would make the inferred
      //   type required.
      afterAllFilesWrite: postProcessZodFiles as HookFunction,
    },
  },
});
