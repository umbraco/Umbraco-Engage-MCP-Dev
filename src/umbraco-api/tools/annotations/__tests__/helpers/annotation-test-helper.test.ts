import { AnnotationTestHelper } from "../setup.js";

describe("AnnotationTestHelper", () => {
  // listAll()/findByDescription()/cleanupTestAnnotations() all depend on
  // GET /annotations/all, which deterministically 500s (SqlDateTime
  // overflow) when called with no from/to range on this instance - see the
  // same documented finding in annotation-builder.test.ts and
  // get-annotations-all.test.ts. listAll() swallows that error and returns
  // [], so these three methods can't be meaningfully exercised against the
  // real API until they're updated to pass an explicit range.
  it.skip("listAll/findByDescription/cleanupTestAnnotations - blocked on GET /annotations/all's SqlDateTime overflow with no date range", () => {});

  describe("normalizeAnnotation", () => {
    it("blanks id/created/timestamp to fixed placeholder values", () => {
      const input = {
        id: 42,
        created: "2026-08-21T14:13:27Z",
        timestamp: "2026-08-21T14:13:27Z",
        description: "Real description - not touched",
      };

      expect(AnnotationTestHelper.normalizeAnnotation(input)).toEqual({
        id: 0,
        created: "1970-01-01T00:00:00.000Z",
        timestamp: "1970-01-01T00:00:00.000Z",
        description: "Real description - not touched",
      });
    });

    it("passes null/undefined through unchanged", () => {
      expect(AnnotationTestHelper.normalizeAnnotation(null)).toBeNull();
      expect(AnnotationTestHelper.normalizeAnnotation(undefined)).toBeUndefined();
    });
  });
});
