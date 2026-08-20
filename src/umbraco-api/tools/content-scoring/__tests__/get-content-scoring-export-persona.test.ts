import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-content-scoring-export-persona.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// The tool declares no input params (`z.object({})`) and, like its
// customer-journey sibling, always succeeds — verified empirically it
// returns a CSV export as plain text (structuredContent is the raw CSV
// string, not an object; the generated output schema's
// `zod.instanceof(File)` doesn't reflect what the handler actually returns
// to the MCP client). On a fresh instance with no scored persona documents,
// this is just the header row ("ContentLink,ContentName") with no data
// rows, which is stable across runs. `normalizeVolatileFields` is applied
// defensively in case a data row is ever present when this runs against a
// seeded instance.
describe("get-content-scoring-export-persona", () => {
  setupTestEnvironment();

  it("returns the persona content scoring CSV export", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    expect(
      normalizeVolatileFields(createSnapshotResult(result))
    ).toMatchSnapshot();
  });
});
