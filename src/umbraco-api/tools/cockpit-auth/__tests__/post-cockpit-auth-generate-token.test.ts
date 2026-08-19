import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import postCockpitAuthGenerateTokenTool from "../post/post-cockpit-auth-generate-token.js";

describe("post-cockpit-auth-generate-token", () => {
  setupTestEnvironment();

  it("generates a Cockpit token with token + expires fields", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postCockpitAuthGenerateTokenTool.handler({}, context);
    expect(result.isError).toBeFalsy();
    const data = result.structuredContent as { token: string; expires: string };
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(20);
    expect(typeof data.expires).toBe("string");
    expect(new Date(data.expires).getTime()).toBeGreaterThan(Date.now());
  });
});
