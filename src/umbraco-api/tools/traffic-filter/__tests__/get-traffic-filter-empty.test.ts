import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-traffic-filter-empty.js";

describe("get-traffic-filter-empty", () => {
  setupTestEnvironment();

  it("returns a blank traffic filter template with default field values", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const snapshot = createSnapshotResult(result) as { structuredContent?: { key: string } };
    // `key` is a fresh guid generated per call even on this blank template
    // (not a real persisted entity) - blank it before snapshotting.
    if (snapshot.structuredContent) {
      snapshot.structuredContent = {
        ...snapshot.structuredContent,
        key: "00000000-0000-0000-0000-000000000000",
      };
    }
    expect(snapshot).toMatchSnapshot();
  });
});
