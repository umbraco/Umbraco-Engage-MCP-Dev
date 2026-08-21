import { normalizeAbTestVariantIdentifiers } from "./normalize-ab-test-variant.js";

describe("normalizeAbTestVariantIdentifiers", () => {
  it("blanks numeric id-shaped fields to 0 and guid-shaped fields to the placeholder guid", () => {
    const input = {
      id: 42,
      unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
      abTestId: 7,
      name: "Real name - not touched",
    };

    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({
      id: 0,
      unique: "00000000-0000-0000-0000-000000000000",
      abTestId: 0,
      name: "Real name - not touched",
    });
  });

  it("blanks createdBy/disabledBy-prefixed guid fields", () => {
    const input = {
      createdByUmbracoUserKey: "489a71d6-c06e-404f-a053-06c7febaa539",
      disabledByUmbracoUserKey: "489a71d6-c06e-404f-a053-06c7febaa539",
    };

    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({
      createdByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
      disabledByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
    });
  });

  it("normalizes created/disabled to NORMALIZED_DATE", () => {
    const input = { created: "2026-08-21T14:13:27Z", disabled: "2026-08-21T14:13:27Z" };
    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({
      created: "NORMALIZED_DATE",
      disabled: "NORMALIZED_DATE",
    });
  });

  it("passes null/undefined through untouched rather than blanking or dating them", () => {
    const input = { id: null, disabled: undefined };
    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({ id: null, disabled: undefined });
  });

  it("normalizes the auto-generated ab-testing segment string", () => {
    const input = { segment: "engage_ab-testing_456" };
    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({
      segment: "engage_ab-testing_NORMALIZED_ID",
    });
  });

  it("leaves a segment string that doesn't match the auto-generated shape untouched", () => {
    const input = { segment: "some-custom-segment" };
    expect(normalizeAbTestVariantIdentifiers(input)).toEqual({ segment: "some-custom-segment" });
  });

  it("recurses into arrays", () => {
    const input = [{ id: 1 }, { id: 2 }];
    expect(normalizeAbTestVariantIdentifiers(input)).toEqual([{ id: 0 }, { id: 0 }]);
  });
});
