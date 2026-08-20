import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import {
  AppliedPersonalizationBuilder,
  TEST_APPLIED_PERSONALIZATION_PREFIX,
} from "./helpers/applied-personalization-builder.js";
import { AppliedPersonalizationTestHelper } from "./helpers/applied-personalization-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AppliedPersonalizationBuilder,
  AppliedPersonalizationTestHelper,
  TEST_APPLIED_PERSONALIZATION_PREFIX,
};
