import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import {
  ReferralGroupBuilder,
  TEST_REFERRAL_GROUP_NAME,
} from "./helpers/referral-group-builder.js";
import { ReferralGroupTestHelper } from "./helpers/referral-group-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ReferralGroupBuilder,
  ReferralGroupTestHelper,
  TEST_REFERRAL_GROUP_NAME,
};
