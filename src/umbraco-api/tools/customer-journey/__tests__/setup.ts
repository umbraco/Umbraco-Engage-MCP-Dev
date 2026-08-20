import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import {
  CustomerJourneyBuilder,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
} from "./helpers/customer-journey-builder.js";
import { CustomerJourneyTestHelper } from "./helpers/customer-journey-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult };
export {
  CustomerJourneyBuilder,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
  CustomerJourneyTestHelper,
};
