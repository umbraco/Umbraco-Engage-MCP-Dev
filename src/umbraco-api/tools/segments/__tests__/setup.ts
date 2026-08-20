import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { SegmentsBuilder, TEST_SEGMENT_NAME_PREFIX } from "./helpers/segments-builder.js";
import { SegmentsTestHelper } from "./helpers/segments-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SegmentsBuilder,
  SegmentsTestHelper,
  TEST_SEGMENT_NAME_PREFIX,
};
