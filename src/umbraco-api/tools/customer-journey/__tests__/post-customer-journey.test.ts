import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CustomerJourneyTestHelper,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
} from "./setup.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../post/post-customer-journey.js";

const TEST_CUSTOMER_JOURNEY_TITLE = `${TEST_CUSTOMER_JOURNEY_TITLE_PREFIX} Post`;

describe("post-customer-journey", () => {
  setupTestEnvironment();

  // The server assigns its own `unique` on create, ignoring whatever is
  // supplied in the request body — capture the server-assigned value from
  // the response for cleanup.
  let createdUnique: string | undefined;

  afterEach(async () => {
    if (createdUnique) {
      const client = getUmbracoEngageManagementAPI();
      try {
        await client.deleteCustomerJourney(
          { id: createdUnique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
      createdUnique = undefined;
    }
    await CustomerJourneyTestHelper.cleanup();
  });

  it("should create a new customer journey", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        id: 0,
        unique: randomUUID(),
        title: TEST_CUSTOMER_JOURNEY_TITLE,
        description: null,
        steps: [],
        createdOn: null,
        createdByUmbracoUserKey: null,
        createdByUmbracoUserName: null,
        updatedOn: null,
        updatedByUmbracoUserKey: null,
        updatedByUmbracoUserName: null,
        minimumParticipationScoreThreshold: null,
        minimumDeviationType: "Absolute",
        minimumDeviation: null,
        expirationType: "never",
        expiration: null,
        upperScoreLimit: null,
      },
      context,
    );

    const structuredContent = result.structuredContent as {
      journey?: { unique?: string };
    };
    createdUnique = structuredContent.journey?.unique;

    expect(
      normalizeVolatileFields(
        CustomerJourneyTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
