import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getHeatmapsVariantsTool from "../get/get-heatmaps-variants.js";

describe("get-heatmaps-variants", () => {
  setupTestEnvironment();

  it("returns heatmap variants for an unknown page", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getHeatmapsVariantsTool.handler(
      { unique: "00000000-0000-0000-0000-000000000000", culture: "en-US" },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
