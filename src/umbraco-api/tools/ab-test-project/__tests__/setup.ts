import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import {
  AbTestProjectBuilder,
  TEST_AB_TEST_PROJECT_UNIQUE,
  TEST_AB_TEST_PROJECT_NAME,
} from "./helpers/ab-test-project-builder.js";
import { AbTestProjectTestHelper } from "./helpers/ab-test-project-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_UNIQUE,
  TEST_AB_TEST_PROJECT_NAME,
};
