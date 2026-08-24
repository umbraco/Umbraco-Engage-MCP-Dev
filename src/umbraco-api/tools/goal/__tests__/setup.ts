import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { GoalBuilder, TEST_GOAL_NAME, TEST_GOAL_TYPE_ID } from "./helpers/goal-builder.js";
import { GoalTestHelper } from "./helpers/goal-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  GoalBuilder,
  GoalTestHelper,
  TEST_GOAL_NAME,
  TEST_GOAL_TYPE_ID,
};
