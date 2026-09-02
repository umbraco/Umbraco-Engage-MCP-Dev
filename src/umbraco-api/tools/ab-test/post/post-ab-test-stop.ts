import {
  withStandardDecorators,
  executeGetApiCall,
  createToolResultError,
  getApiClient,
  ToolValidationError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestBody, postAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { buildUmbracoPageVariants } from "./build-umbraco-page-variants.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAbTestBody>;

const inputSchema = z.object({
  unique: z
    .uuid()
    .describe("The real, existing A/B test's `unique` guid (from post-ab-test's response, or get-ab-test-all) - NOT a page or goal unique."),
  endTime: z
    .iso.datetime()
    .nullish()
    .describe("When to end the test. Defaults to now if omitted, ending it immediately."),
  isCompleted: z
    .boolean()
    .nullish()
    .describe(
      "Whether this is a natural completion (computed status becomes Completed) vs a manual halt (Stopped) - both stop serving variants to visitors the same way; this only changes the computed status label. Defaults to false (Stopped).",
    ),
  pageUnique: z
    .uuid()
    .describe(
      "The SAME real page unique originally passed to post-ab-test's own `pageUnique` when this test was created. Required (even though this tool otherwise only changes endTime/isCompleted) because this test's existing page configuration cannot be read back reliably - resubmitting it without this would wipe the test's real page configuration, so this tool asks you to resupply it instead.",
    ),
  secondVariantPageUnique: z
    .uuid()
    .nullish()
    .describe(
      "Required only if this test's testType is SplitUrl: the same real second page unique originally passed to post-ab-test's own `secondVariantPageUnique`. Omit for SinglePage/MultiPage tests.",
    ),
});
const outputSchema = postAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-stop",
  description:
    "Stop (or mark complete) an existing, already-started A/B test by setting its `endTime`. Same mechanism as post-ab-test-start (see its description for why there's no dedicated endpoint, and why `pageUnique`/`secondVariantPageUnique` must be resupplied) - fetches the test's current full state, resubmits it with `endTime`/`isCompleted` changed and its page configuration rebuilt from the supplied page unique(s). Requires the test to already have a real `startTime` (use post-ab-test-start first) - a test that was never started has no computed status to stop and this returns a validation error rather than silently no-opping.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();
    const current: any = await client.getAbTestViewModel(
      { unique: params.unique },
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (current.status >= 400) {
      return createToolResultError(current.data);
    }
    const test = current.data.test as FullBody["test"];

    if (!test.startTime) {
      throw new ToolValidationError({
        title: "Cannot stop a test that was never started",
        status: 400,
        detail:
          "This A/B test has no startTime (its computed status is still Draft) - there is nothing running to stop. Call post-ab-test-start first.",
      });
    }

    const umbracoPageVariants = buildUmbracoPageVariants(
      test.testType,
      params.pageUnique,
      params.secondVariantPageUnique,
    );

    const body: FullBody = {
      test: {
        ...test,
        endTime: params.endTime ?? new Date().toISOString(),
        isCompleted: params.isCompleted ?? false,
        umbracoPageVariants,
      },
      indication: null,
      variants: null,
      isInvertedGoal: test.goal?.isInverted ?? false,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAbTest"]>, ApiClient>(
      (client) => client.postAbTest(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
