import {
  setupTestEnvironment,
  AnnotationBuilder,
  AnnotationTestHelper,
  TEST_ANNOTATION_PREFIX,
} from "../setup.js";

const DESCRIPTION = `${TEST_ANNOTATION_PREFIX} Builder`;

describe("AnnotationBuilder", () => {
  setupTestEnvironment();

  let builder: AnnotationBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await AnnotationTestHelper.cleanupTestAnnotations();
  });

  // Skipped: this Umbraco Engage instance returns SqlDateTime overflow on
  // annotation INSERT even with current-date values, due to an internal
  // TimeSpan computation on the server. Re-enable once the API accepts the
  // minimal annotation payload.
  it.skip("creates an annotation and exposes its id", async () => {
    builder = await new AnnotationBuilder()
      .withDescription(DESCRIPTION)
      .create();

    expect(builder.getId()).toBeGreaterThan(0);

    const found = await AnnotationTestHelper.findByDescription(DESCRIPTION);
    expect(found).toBeDefined();
    expect(found?.description).toBe(DESCRIPTION);
  });
});
