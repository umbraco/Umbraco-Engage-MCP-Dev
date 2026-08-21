import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ReferralGroupTestHelper,
  TEST_REFERRAL_GROUP_NAME,
} from "./setup.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../post/post-referral-group.js";

const TEST_REFERRAL_GROUP_TITLE = `${TEST_REFERRAL_GROUP_NAME} Post`;

describe("post-referral-group", () => {
  setupTestEnvironment();

  // post-referral-group honors the client-supplied `unique` rather than
  // generating/overriding it server-side (verified empirically) — capture it
  // directly for cleanup.
  let createdUnique: string | undefined;

  afterEach(async () => {
    if (createdUnique) {
      const client = getUmbracoEngageManagementAPI();
      try {
        await client.deleteReferralGroup(
          { id: createdUnique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
      createdUnique = undefined;
    }
    await ReferralGroupTestHelper.cleanup(TEST_REFERRAL_GROUP_NAME);
  });

  it("should create a new referral group", async () => {
    const context = createMockRequestHandlerExtra();
    const unique = randomUUID();

    const result = await tool.handler(
      {
        id: undefined,
        unique,
        name: TEST_REFERRAL_GROUP_TITLE,
        description: null,
        invalid: false,
        pages: [],
        customerJourneyScoring: [],
        personaScoring: [],
      },
      context,
    );

    createdUnique = unique;

    expect(
      normalizeVolatileFields(
        ReferralGroupTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
