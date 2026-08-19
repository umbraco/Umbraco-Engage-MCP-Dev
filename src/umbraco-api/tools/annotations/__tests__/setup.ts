import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { AnnotationBuilder, TEST_ANNOTATION_PREFIX } from "./helpers/annotation-builder.js";
import { AnnotationTestHelper } from "./helpers/annotation-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AnnotationBuilder,
  AnnotationTestHelper,
  TEST_ANNOTATION_PREFIX,
};
