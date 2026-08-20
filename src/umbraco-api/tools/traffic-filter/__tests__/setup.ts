import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import {
  TrafficFilterBuilder,
  TEST_TRAFFIC_FILTER_NAME,
} from "./helpers/traffic-filter-builder.js";
import { TrafficFilterTestHelper } from "./helpers/traffic-filter-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  TrafficFilterBuilder,
  TrafficFilterTestHelper,
  TEST_TRAFFIC_FILTER_NAME,
};
