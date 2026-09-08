import { defineConfig, type HookFunction } from "orval";
import { orvalImportFixer, postProcessZodFiles } from "@umbraco-cms/mcp-server-sdk/orval";

/**
 * Orval Configuration
 *
 * This generates TypeScript API clients from OpenAPI specs.
 *
 * The template includes a sample OpenAPI spec (src/umbraco-api/api/openapi.yaml) that
 * demonstrates the patterns. Replace it with your add-on's spec.
 *
 * Example OpenAPI spec sources:
 * - Local file: "./src/umbraco-api/api/openapi.yaml"
 * - Local Umbraco: "http://localhost:44391/umbraco/swagger/management/swagger.json"
 * - Remote URL: "https://api.example.com/swagger.json"
 */
export default defineConfig({
  // Main API client generation
  umbracoEngageManagementApi: {
    input: {
      // Replace with your local Umbraco instance URL before running npm run generate
      target: "https://localhost:{port}/umbraco/swagger/engage-management/swagger.json",
      unsafeDisableValidation: true,
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
      target: "https://localhost:{port}/umbraco/swagger/engage-management/swagger.json",
      unsafeDisableValidation: true,
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
