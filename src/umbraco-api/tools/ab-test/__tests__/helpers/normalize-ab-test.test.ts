import { normalizeAbTestIdentifiers } from "./normalize-ab-test.js";

describe("normalizeAbTestIdentifiers", () => {
  it("blanks numeric id-shaped fields to 0 and guid-shaped fields to the placeholder guid", () => {
    const input = {
      id: 42,
      unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
      key: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
      goalId: 7,
      goalTypeId: "61917a08-aeed-4e75-9b92-b7fe38af089a",
      name: "Real name - not touched",
    };

    expect(normalizeAbTestIdentifiers(input)).toEqual({
      id: 0,
      unique: "00000000-0000-0000-0000-000000000000",
      key: "00000000-0000-0000-0000-000000000000",
      goalId: 0,
      goalTypeId: "00000000-0000-0000-0000-000000000000",
      name: "Real name - not touched",
    });
  });

  it("blanks createdBy/updatedBy/disabledBy-prefixed fields", () => {
    const input = {
      createdByUmbracoUserKey: "489a71d6-c06e-404f-a053-06c7febaa539",
      updatedByUmbracoUserKey: "489a71d6-c06e-404f-a053-06c7febaa539",
      disabledByUmbracoUserKey: "489a71d6-c06e-404f-a053-06c7febaa539",
    };

    expect(normalizeAbTestIdentifiers(input)).toEqual({
      createdByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
      updatedByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
      disabledByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
    });
  });

  it("passes null/undefined through untouched rather than blanking them", () => {
    const input = { id: null, unique: undefined };
    expect(normalizeAbTestIdentifiers(input)).toEqual({ id: null, unique: undefined });
  });

  it("normalizes the auto-generated ab-testing segment string", () => {
    const input = { segment: "engage_ab-testing_123" };
    expect(normalizeAbTestIdentifiers(input)).toEqual({
      segment: "engage_ab-testing_NORMALIZED_ID",
    });
  });

  it("leaves a segment string that doesn't match the auto-generated shape untouched", () => {
    const input = { segment: "some-custom-segment" };
    expect(normalizeAbTestIdentifiers(input)).toEqual({ segment: "some-custom-segment" });
  });

  it("re-keys variantStatus by ascending numeric variant id into stable placeholders", () => {
    const input = { variantStatus: { "69": "Draft", "12": "Running" } };
    expect(normalizeAbTestIdentifiers(input)).toEqual({
      variantStatus: { VARIANT_0: "Running", VARIANT_1: "Draft" },
    });
  });

  it("recurses into arrays and nested objects", () => {
    const input = {
      variants: [
        { id: 1, name: "Original" },
        { id: 2, name: "Variant B" },
      ],
    };
    expect(normalizeAbTestIdentifiers(input)).toEqual({
      variants: [
        { id: 0, name: "Original" },
        { id: 0, name: "Variant B" },
      ],
    });
  });
});
