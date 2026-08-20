import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { PersonaBuilder, TEST_PERSONA_NAME } from "./helpers/persona-builder.js";
import { PersonaTestHelper } from "./helpers/persona-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PersonaBuilder,
  PersonaTestHelper,
  TEST_PERSONA_NAME,
};
