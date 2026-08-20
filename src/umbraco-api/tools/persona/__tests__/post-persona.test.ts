import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PersonaTestHelper,
  TEST_PERSONA_NAME,
} from "./setup.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../post/post-persona.js";

const TEST_PERSONA_TITLE = `${TEST_PERSONA_NAME} Post`;

describe("post-persona", () => {
  setupTestEnvironment();

  // The server assigns its own `unique` on create, ignoring whatever is
  // supplied in the request body — capture the server-assigned value from
  // the response for cleanup.
  let createdUnique: string | undefined;

  afterEach(async () => {
    if (createdUnique) {
      const client = getUmbracoEngageManagementAPI();
      try {
        await client.deletePersona(
          { id: createdUnique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
      createdUnique = undefined;
    }
    await PersonaTestHelper.cleanup(TEST_PERSONA_NAME);
  });

  it("should create a new persona", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        id: 0,
        unique: randomUUID(),
        title: TEST_PERSONA_TITLE,
        description: null,
        personas: [],
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
      persona?: { unique?: string };
    };
    createdUnique = structuredContent.persona?.unique;

    expect(
      normalizeVolatileFields(
        PersonaTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
