import { randomUUID } from "crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { AppliedPersonalizationTestHelper } from "./helpers/applied-personalization-test-helper.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../post/post-applied-personalization.js";

describe("post-applied-personalization", () => {
  setupTestEnvironment();

  afterEach(async () => {
    if (createdUnique != null) {
      const client = getUmbracoEngageManagementAPI();
      try {
        await client.deleteAppliedPersonalization(
          { id: createdUnique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
      createdUnique = undefined;
    }
  });

  let createdUnique: string | undefined;

  it("should create a new applied personalization", async () => {
    const context = createMockRequestHandlerExtra();
    const unique = randomUUID();

    const result = await tool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        segmentId: null,
        segment: null,
        type: "SinglePage",
        umbracoSegmentAlias: null,
        name: null,
        description: null,
        css: null,
        javascript: null,
        started: null,
        isActive: true,
        createdByUmbracoUserName: null,
        updatedByUmbracoUserName: null,
        pages: [],
        contentTypes: [],
        previewUrl: null,
      },
      context,
    );

    createdUnique = unique;

    expect(
      normalizeVolatileFields(
        AppliedPersonalizationTestHelper.normalizeIds(
          createSnapshotResult(result),
        ),
      ),
    ).toMatchSnapshot();
  });
});
