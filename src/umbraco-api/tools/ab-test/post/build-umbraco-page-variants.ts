import { ToolValidationError } from "@umbraco-cms/mcp-server-sdk";
import type { postAbTestBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { z } from "zod";

type FullBody = z.infer<typeof postAbTestBody>;
type UmbracoPageVariant = FullBody["test"]["umbracoPageVariants"][number];

/**
 * Validates and builds the `umbracoPageVariants` array post-ab-test's save
 * endpoint requires for a given testType, shared by post-ab-test (create)
 * and post-ab-test-start/post-ab-test-stop (update an existing test).
 *
 * SplitUrl needs exactly two distinct pages, one per variant (confirmed via
 * decompiling the real Engage server - AbTestValidator.Validate requires
 * UmbracoPageVariants.Count >= 2 for SplitUrl); every other supported
 * testType (SinglePage/MultiPage) needs exactly the one page. ContentType
 * isn't handled here - this collection's tools don't populate `contentTypes`
 * so a ContentType test can't be created/updated as valid through them.
 */
export function buildUmbracoPageVariants(
  testType: FullBody["test"]["testType"],
  pageUnique: string,
  secondVariantPageUnique: string | null | undefined,
): UmbracoPageVariant[] {
  const isSplitUrl = testType === "SplitUrl";
  if (isSplitUrl && !secondVariantPageUnique) {
    throw new ToolValidationError({
      title: "secondVariantPageUnique is required for testType SplitUrl",
      status: 400,
      detail:
        "testType 'SplitUrl' requires `secondVariantPageUnique` to give the second variant its own redirect page - the real server requires at least two pages configured for a SplitUrl test.",
    });
  }
  if (!isSplitUrl && secondVariantPageUnique) {
    throw new ToolValidationError({
      title: "secondVariantPageUnique is only valid for testType SplitUrl",
      status: 400,
      detail: `secondVariantPageUnique was provided but testType is '${testType}', which shows both variants on the same page(s) rather than redirecting - remove secondVariantPageUnique or set testType to 'SplitUrl'.`,
    });
  }
  if (isSplitUrl && secondVariantPageUnique === pageUnique) {
    throw new ToolValidationError({
      title: "secondVariantPageUnique must differ from pageUnique",
      status: 400,
      detail:
        "A SplitUrl test's two variants must redirect to two different pages - pageUnique and secondVariantPageUnique were the same guid.",
    });
  }

  const makePage = (unique: string): UmbracoPageVariant => ({
    id: 0,
    unique,
    nodeName: null,
    culture: null,
    abTestId: null,
    variesBySegment: false,
  });

  return isSplitUrl
    ? [makePage(pageUnique), makePage(secondVariantPageUnique as string)]
    : [makePage(pageUnique)];
}
