import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CampaignGroupBuilder, TEST_CAMPAIGN_GROUP_PREFIX } from "./helpers/campaign-group-builder.js";
import { CampaignGroupTestHelper } from "./helpers/campaign-group-test-helper.js";

configureApiClient(() => getUmbracoEngageManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CampaignGroupBuilder,
  CampaignGroupTestHelper,
  TEST_CAMPAIGN_GROUP_PREFIX,
};
