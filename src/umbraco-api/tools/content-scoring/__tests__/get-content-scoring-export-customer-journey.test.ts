import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-content-scoring-export-customer-journey.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// The tool declares no input params (`z.object({})`) and the endpoint always
// succeeds — verified empirically it returns a CSV export as plain text
// (structuredContent is the raw CSV string, not an object; the generated
// output schema's `zod.instanceof(File)` doesn't reflect what the handler
// actually returns to the MCP client). On a fresh instance with no scored
// customer-journey documents, this is just the header row with no data rows,
// which is stable across runs — no volatile fields (dates/ids) appear in this
// response, but `normalizeVolatileFields` is still applied defensively in
// case a data row is ever present when this runs against a seeded instance.
describe("get-content-scoring-export-customer-journey", () => {
  setupTestEnvironment();

  it("returns the customer journey content scoring CSV export", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    expect(
      normalizeVolatileFields(createSnapshotResult(result))
    ).toMatchSnapshot();
  });
});
