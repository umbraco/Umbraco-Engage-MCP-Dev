import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import tool from "../post/post-segments.js";

describe("post-segments", () => {
  setupTestEnvironment();

  let createdUnique: string | undefined;

  afterEach(async () => {
    if (!createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteSegments({ id: createdUnique }, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // ignore cleanup errors
    } finally {
      createdUnique = undefined;
    }
  });

  it("should create a segment", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        id: undefined,
        unique: undefined,
        name: "_Test Segment Create",
        description: null,
        endTime: null,
        isTemporary: false,
        sortOrder: 0,
        rules: [],
        controlGroupSize: 0,
      },
      context,
    );

    createdUnique = (result.structuredContent as { unique?: string } | undefined)?.unique;

    // The response's top-level `id` is the real numeric internal id (not a
    // guid), so it isn't matched by `idToReplace`; omit it and instead let
    // createSnapshotResult's no-idToReplace path blank it, then manually
    // normalize `unique` (a different field to the literal "id" the SDK
    // normalizer inspects) since it's a fresh random guid every run.
    const snapshot = createSnapshotResult(result);
    if (snapshot.structuredContent) {
      snapshot.structuredContent = {
        ...snapshot.structuredContent,
        unique: "00000000-0000-0000-0000-000000000000",
      };
    }

    expect(snapshot).toMatchSnapshot();
  });
});
