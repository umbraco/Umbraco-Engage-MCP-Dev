import { describe, it, expect } from "@jest/globals";
import {
  MIN_ENGAGE_VERSION,
  VERSION_SENSITIVE_TOOLS,
  parseEngageVersion,
  compareEngageVersions,
  isEngageVersionBelow,
} from "../engage-version.js";

describe("parseEngageVersion", () => {
  it("parses a release and drops the +build suffix", () => {
    expect(parseEngageVersion("17.2.1+cb3108d")).toEqual({
      major: 17, minor: 2, patch: 1, prerelease: null, text: "17.2.1",
    });
  });

  it("keeps a prerelease tag", () => {
    expect(parseEngageVersion("17.5.0-rc1+abc")).toEqual({
      major: 17, minor: 5, patch: 0, prerelease: "rc1", text: "17.5.0-rc1",
    });
  });

  it("returns null for anything that isn't a version", () => {
    expect(parseEngageVersion(undefined)).toBeNull();
    expect(parseEngageVersion(null)).toBeNull();
    expect(parseEngageVersion("")).toBeNull();
    expect(parseEngageVersion("latest")).toBeNull();
    expect(parseEngageVersion(18)).toBeNull();
  });
});

describe("compareEngageVersions / isEngageVersionBelow", () => {
  const v = (s: string) => parseEngageVersion(s)!;

  it("orders by major, minor and patch", () => {
    expect(compareEngageVersions(v("17.2.1"), v("17.5.0"))).toBeLessThan(0);
    expect(compareEngageVersions(v("18.0.0"), v("17.9.9"))).toBeGreaterThan(0);
    expect(compareEngageVersions(v("17.5.1"), v("17.5.0"))).toBeGreaterThan(0);
  });

  it("treats older as below the minimum", () => {
    expect(isEngageVersionBelow("17.2.1+cb3108d", "17.5.0")).toBe(true);
    expect(isEngageVersionBelow("18.1.0", "18.2.0")).toBe(true);
  });

  it("treats equal (ignoring +build) as not below", () => {
    expect(isEngageVersionBelow("17.5.0+49e5bc0", "17.5.0")).toBe(false);
    expect(isEngageVersionBelow("18.2.0+1aa412a", "18.2.0")).toBe(false);
  });

  it("treats newer as not below", () => {
    expect(isEngageVersionBelow("17.6.0", "17.5.0")).toBe(false);
    expect(isEngageVersionBelow("18.3.0+abc", "18.2.0")).toBe(false);
  });

  it("treats a prerelease of the minimum as below it", () => {
    expect(isEngageVersionBelow("17.5.0-rc1", "17.5.0")).toBe(true);
    expect(isEngageVersionBelow("18.2.0-rc1+abc", "18.2.0")).toBe(true);
    expect(compareEngageVersions(v("17.5.0-rc1"), v("17.5.0-rc2"))).toBeLessThan(0);
  });

  it("returns null when a version can't be parsed", () => {
    expect(isEngageVersionBelow("not-a-version", "17.5.0")).toBeNull();
    expect(isEngageVersionBelow(undefined)).toBeNull();
  });

  it("compares against MIN_ENGAGE_VERSION by default", () => {
    expect(isEngageVersionBelow(MIN_ENGAGE_VERSION)).toBe(false);
  });
});

describe("VERSION_SENSITIVE_TOOLS", () => {
  it("is the 31 tools whose schemas changed in the Engage 17.5.0 alignment", () => {
    expect(VERSION_SENSITIVE_TOOLS.size).toBe(31);
    expect(VERSION_SENSITIVE_TOOLS.has("post-applied-personalization")).toBe(true);
    expect(VERSION_SENSITIVE_TOOLS.has("get-ab-test-empty")).toBe(true);
    expect(VERSION_SENSITIVE_TOOLS.has("get-package")).toBe(false);
    expect(VERSION_SENSITIVE_TOOLS.has("get-persona-all")).toBe(false);
  });
});
