import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestVariantTool from "../get/get-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestVariantBuilder } from "./helpers/ab-test-variant-builder.js";
import { normalizeAbTestVariantIdentifiers } from "./helpers/normalize-ab-test-variant.js";

jest.setTimeout(60000);

// A non-existent id case, documented alongside the real happy path below.
const TEST_NON_EXISTENT_ID = 999999999;

describe("get-ab-test-variant", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns an empty body rather than throwing for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestVariantTool.handler(
      { id: TEST_NON_EXISTENT_ID },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and no body for
    // a non-existent id (not a 404) — so this is not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  it("returns the real, persisted variant data for a real id", async () => {
    builder = await new AbTestVariantBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestVariantTool.handler(
      { id: builder.getVariantId() },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(
      normalizeAbTestVariantIdentifiers(
        normalizeVolatileFields(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
