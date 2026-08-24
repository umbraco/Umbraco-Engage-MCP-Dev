import { defineConfig } from "orval";
import { orvalImportFixer, relaxUuidToGuid } from "@umbraco-cms/mcp-server-sdk/orval";

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
      validation: false,
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
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer,
    },
  },

  // Zod schema generation for validation
  umbracoEngageManagementApiZod: {
    input: {
      target: "https://localhost:{port}/umbraco/swagger/engage-management/swagger.json",
      validation: false,
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoEngageManagementApi.zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
    },
    hooks: {
      // Umbraco returns GUIDs that aren't RFC 4122 compliant (e.g. sequential
      // version ids like `0000003f-0000-0000-0000-000000000000`). Zod's
      // uuid() rejects these; guid() validates the 8-4-4-4-12 hex shape
      // without the RFC 4122 constraint. Only relaxes output-schema usage -
      // hand-written tool input schemas should keep using uuid() directly.
      afterAllFilesWrite: relaxUuidToGuid,
    },
  },
});
