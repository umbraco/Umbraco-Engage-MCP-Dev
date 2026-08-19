import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postHeatmapsGenerateScrollHeatmapTool from "../post/post-heatmaps-generate-scroll-heatmap.js";

describe("post-heatmaps-generate-scroll-heatmap", () => {
  setupTestEnvironment();

  it("returns an empty heatmap for an unknown page", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postHeatmapsGenerateScrollHeatmapTool.handler(
      {
        unique: "00000000-0000-0000-0000-000000000000",
        from: undefined,
        to: undefined,
        deviceTypes: undefined,
        culture: undefined,
        segment: undefined,
        borderLines: undefined,
      },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
