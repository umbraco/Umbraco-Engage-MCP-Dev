import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postPersonaBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import getPersonaDetailsTool from "../../../persona/get/get-persona-details.js";
import type { z } from "zod";

// Deliberately duplicated (not imported) from the sibling `persona`
// collection's own `PersonaBuilder` (persona/__tests__/helpers/persona-builder.ts)
// per this repo's one-builder-per-collection convention. This variant always
// posts one real nested segment in `personas[]`, because content-scoring's
// `entityId` needs a real numeric SUB-ENTITY id (a `personas[N].id`), not the
// top-level persona's own id/unique.
export const TEST_PERSONA_SEGMENT_NAME = "_Test Persona Segment";

type PersonaModel = z.infer<typeof postPersonaBody>;

export class PersonaSegmentBuilder {
  // Mirrors get-persona-empty's server-provided default template
  // (minimumParticipationScoreThreshold: 25, upperScoreLimit: 10) rather than
  // leaving those fields undefined — see create() for why.
  private model: PersonaModel = {
    id: 0,
    unique: crypto.randomUUID(),
    title: TEST_PERSONA_SEGMENT_NAME,
    description: null,
    personas: [
      {
        id: 0,
        unique: crypto.randomUUID(),
        title: TEST_PERSONA_SEGMENT_NAME,
        description: null,
        icon: null,
        iconUrl: null,
        color: null,
      },
    ],
    minimumParticipationScoreThreshold: 25,
    minimumDeviationType: "Absolute",
    minimumDeviation: 0,
    expirationType: "never",
    expiration: null,
    upperScoreLimit: 10,
  };

  private createdUnique?: string;
  private createdEntityId?: number;

  withTitle(title: string): this {
    this.model.title = title;
    // Keep the nested segment's title in sync so it's easy to find/verify.
    if (this.model.personas[0]) {
      this.model.personas[0].title = title;
    }
    return this;
  }

  build(): PersonaModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postPersonaBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postPersona(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create persona with segment: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    // The server assigns its own `unique` and does not honor the one
    // supplied in the request body (same behavior as PersonaBuilder) —
    // always capture the real value from the response.
    const createdUnique = response.data?.persona?.unique;
    if (!createdUnique) {
      throw new Error(
        `Persona creation response did not include a persona.unique: ${JSON.stringify(response.data)}`,
      );
    }
    this.createdUnique = createdUnique;

    // CRITICAL: the create response's nested personas[0].id is ALWAYS 0 -
    // it's an echo of what was sent, not the real persisted id. Passing that
    // fake 0 as content-scoring's `entityId` with type "Persona" triggers a
    // genuine server-side NullReferenceException in
    // ContentScoringPersonaRepository.Save (confirmed empirically - it tries
    // to look up a persona-segment row with id=0, finds none, and
    // dereferences null). The REAL numeric id is only available via a
    // follow-up get-persona-details lookup.
    const details = await getPersonaDetailsTool.handler(
      { id: createdUnique },
      createMockRequestHandlerExtra(),
    );
    if (details.isError) {
      throw new Error(
        `Failed to resolve persona details for real entityId: ${JSON.stringify(details.content)}`,
      );
    }
    const createdEntityId = (
      details.structuredContent as { personas?: { id: number }[] } | undefined
    )?.personas?.[0]?.id;
    if (createdEntityId === undefined || createdEntityId === null) {
      throw new Error(
        `get-persona-details did not include a real personas[0].id: ${JSON.stringify(details.structuredContent)}`,
      );
    }
    this.createdEntityId = createdEntityId;

    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      // Deleting the persona cascades to delete its nested segments.
      await client.deletePersona(
        { id: this.createdUnique },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdUnique = undefined;
      this.createdEntityId = undefined;
    }
  }

  getUnique(): string {
    if (!this.createdUnique) {
      throw new Error("Persona segment not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  /** The real numeric id of the nested persona segment (personas[0].id). */
  getEntityId(): number {
    if (this.createdEntityId === undefined) {
      throw new Error("Persona segment not created yet. Call create() first.");
    }
    return this.createdEntityId;
  }
}
