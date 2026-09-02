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
  startTime: z
    .iso.datetime()
    .nullish()
    .describe(
      "When to start the test. Defaults to now if omitted, putting the test into Running immediately. Pass a future ISO datetime to schedule it instead - the test's computed status is Scheduled until that time arrives. Calling this tool again with a different value reschedules an already-Scheduled/Running test that hasn't been stopped yet.",
    ),
  pageUnique: z
    .uuid()
    .describe(
      "The SAME real page unique originally passed to post-ab-test's own `pageUnique` when this test was created. Required (even though this tool otherwise only changes startTime) because get-ab-test-view-model cannot reliably read this test's existing page configuration back - confirmed via decompiling the real Engage server: AbTestUmbracoPageVariantDtoMapper resolves each page through the front-end published-content-cache accessor, which isn't populated in this Management API context, so `umbracoPageVariants` silently comes back empty even though the real page association is intact (verified independently via get-ab-test-page, which uses a different, unaffected lookup and still finds the test). Blindly resubmitting that empty array would wipe the test's real page configuration, so this tool asks you to resupply it instead.",
    ),
  secondVariantPageUnique: z
    .uuid()
    .nullish()
    .describe(
      "Required only if this test's testType is SplitUrl: the same real second page unique originally passed to post-ab-test's own `secondVariantPageUnique`. See `pageUnique`'s description for why this must be resupplied. Omit for SinglePage/MultiPage tests.",
    ),
});
const outputSchema = postAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-start",
  description:
    "Start, schedule, or reschedule a not-yet-stopped A/B test by setting its `startTime`. Confirmed via decompiling the real Engage server: an A/B test's Draft/Scheduled/Running/Stopped/Completed status is not a stored field at all - it's entirely computed from `startTime`/`endTime`/`isCompleted` (AbTest.Status => DetermineAbTestStatus(...)), and no dedicated start/schedule endpoint exists. This tool fetches the test's current full state (the same data get-ab-test-view-model returns) and resubmits it through post-ab-test's own save endpoint with `startTime` changed and its page configuration rebuilt from `pageUnique`/`secondVariantPageUnique` (see their own descriptions for why those must be resupplied). Cannot restart an already-stopped test - confirmed there is no such feature anywhere in Engage, not just this API: the real backoffice UI offers no resume action on a Stopped test (only 'Select winner', which finalizes it as Completed), so this tool rejects that case with a clear error rather than silently no-opping. Returns a real error if `unique` doesn't match an existing test.",
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

    if (test.endTime) {
      throw new ToolValidationError({
        title: "Cannot restart an already-stopped test",
        status: 400,
        detail:
          "This A/B test already has an endTime (it was stopped or completed). Engage has no way to resume a stopped test - confirmed by inspecting the real backoffice UI: a Stopped test's only available action is 'Select winner', which finalizes it as Completed. Create a new test instead.",
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
        startTime: params.startTime ?? new Date().toISOString(),
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
