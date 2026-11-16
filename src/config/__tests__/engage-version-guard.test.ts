import { describe, it, expect, jest } from "@jest/globals";
import {
  checkEngageVersion,
  guardVersionSensitiveHandler,
  engageVersionWarning,
  ENGAGE_VERSION_NOT_CHECKED,
  type EngageVersionStatus,
} from "../engage-version-guard.js";
import { MIN_ENGAGE_VERSION, VERSION_SENSITIVE_TOOLS } from "../engage-version.js";
import { collections } from "../../collections.js";

const tooOld: EngageVersionStatus = { state: "too-old", version: "17.2.1", minimum: "17.5.0" };
const supported: EngageVersionStatus = { state: "supported", version: "17.5.0", minimum: "17.5.0" };
const unknown: EngageVersionStatus = { state: "unknown", reason: "boom" };

function fakeTool(name: string) {
  const handler = jest.fn(async () => ({ content: [{ type: "text" as const, text: "real result" }] }));
  return { name, handler };
}

describe("guardVersionSensitiveHandler", () => {
  it("blocks a version-sensitive tool on every call when Engage is too old", async () => {
    const tool = fakeTool("post-applied-personalization");
    const handler = guardVersionSensitiveHandler(tool, tooOld);

    for (let i = 0; i < 3; i++) {
      const result = await handler();
      expect(result).toEqual({
        isError: true,
        content: [{
          type: "text",
          text: "Umbraco Engage 17.2.1 is older than 17.5.0, which this tool needs. Upgrade Umbraco Engage to 17.5.0 or later.",
        }],
      });
    }
    expect(tool.handler).not.toHaveBeenCalled();
  });

  it("passes the tool's own handler through when Engage is supported", () => {
    const tool = fakeTool("post-applied-personalization");
    expect(guardVersionSensitiveHandler(tool, supported)).toBe(tool.handler);
  });

  it("passes the tool's own handler through when the version is unknown", () => {
    const tool = fakeTool("get-ab-test-empty");
    expect(guardVersionSensitiveHandler(tool, unknown)).toBe(tool.handler);
    expect(guardVersionSensitiveHandler(tool, ENGAGE_VERSION_NOT_CHECKED)).toBe(tool.handler);
  });

  it("never blocks a tool outside the version-sensitive set", () => {
    for (const name of ["get-package", "get-persona-all", "post-annotations"]) {
      const tool = fakeTool(name);
      expect(guardVersionSensitiveHandler(tool, tooOld)).toBe(tool.handler);
    }
  });

  it("only names tools that exist", () => {
    const names = new Set(collections.flatMap((c) => c.tools({}).map((t) => t.name)));
    expect([...VERSION_SENSITIVE_TOOLS].filter((n) => !names.has(n))).toEqual([]);
  });
});

describe("checkEngageVersion", () => {
  const quiet = () => undefined;

  it("reports too-old for an older Engage, ignoring the +build suffix", async () => {
    const log = jest.fn();
    const status = await checkEngageVersion({ readVersion: async () => "17.2.1+cb3108d", minimum: "17.5.0", log });
    expect(status).toEqual(tooOld);
    expect(log).toHaveBeenCalledTimes(1);
    expect(engageVersionWarning(status)).toContain("Umbraco Engage 17.2.1 is older than 17.5.0");
  });

  it("reports supported for the minimum or newer", async () => {
    expect(await checkEngageVersion({ readVersion: async () => "17.5.0+49e5bc0", minimum: "17.5.0", log: quiet }))
      .toEqual(supported);
    expect((await checkEngageVersion({ readVersion: async () => "17.6.0", minimum: "17.5.0", log: quiet })).state)
      .toBe("supported");
    expect(engageVersionWarning(supported)).toBeNull();
  });

  it("treats a prerelease of the minimum as too old", async () => {
    const status = await checkEngageVersion({ readVersion: async () => "17.5.0-rc1", minimum: "17.5.0", log: quiet });
    expect(status).toEqual({ state: "too-old", version: "17.5.0-rc1", minimum: "17.5.0" });
  });

  it("fails open with one stderr line when the lookup throws", async () => {
    const log = jest.fn();
    const status = await checkEngageVersion({ readVersion: async () => { throw new Error("ECONNREFUSED"); }, log });
    expect(status).toEqual({ state: "unknown", reason: "ECONNREFUSED" });
    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0][0])).toContain("version-sensitive tools are not blocked");
  });

  it("fails open on an unrecognised version", async () => {
    const status = await checkEngageVersion({ readVersion: async () => undefined, log: quiet });
    expect(status.state).toBe("unknown");
  });

  it("gives up after the deadline and aborts the lookup", async () => {
    let aborted = false;
    const status = await checkEngageVersion({
      readVersion: (signal) => new Promise((_, reject) => {
        signal.addEventListener("abort", () => { aborted = true; reject(new Error("aborted")); });
      }),
      timeoutMs: 50,
      log: quiet,
    });
    expect(status).toEqual({ state: "unknown", reason: "no response within 50ms" });
    expect(aborted).toBe(true);
  });

  it("gives up after the deadline even if the lookup ignores the signal", async () => {
    const status = await checkEngageVersion({
      readVersion: () => new Promise(() => undefined),
      timeoutMs: 50,
      log: quiet,
    });
    expect(status.state).toBe("unknown");
  });

  it("uses MIN_ENGAGE_VERSION by default", async () => {
    const status = await checkEngageVersion({ readVersion: async () => MIN_ENGAGE_VERSION, log: quiet });
    expect(status.state).toBe("supported");
  });
});
