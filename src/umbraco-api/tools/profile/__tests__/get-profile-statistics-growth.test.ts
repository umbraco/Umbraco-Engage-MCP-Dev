import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import tool from "../get/get-profile-statistics-growth.js";

const TEST_NUMBER_OF_MONTHS = 12;

// The response is a rolling window of the last `numberOfMonths` calendar
// months anchored to "now" (verified: year/month values shift every run
// depending on the current date), so it can never be a stable snapshot.
// Assert shape/length instead, same pattern as post-goal-all.test.ts.
describe("get-profile-statistics-growth", () => {
  setupTestEnvironment();

  it("returns a rolling window of monthly identified/unknown counts", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { numberOfMonths: TEST_NUMBER_OF_MONTHS },
      context,
    );

    expect(result.isError).toBeFalsy();

    const content = result.structuredContent as {
      identified: { year: number; month: number; count: number }[];
      unknown: { year: number; month: number; count: number }[];
    };

    expect(content.identified).toHaveLength(TEST_NUMBER_OF_MONTHS);
    expect(content.unknown).toHaveLength(TEST_NUMBER_OF_MONTHS);
    for (const entry of [...content.identified, ...content.unknown]) {
      expect(typeof entry.year).toBe("number");
      expect(typeof entry.month).toBe("number");
      expect(typeof entry.count).toBe("number");
    }
  });
});
