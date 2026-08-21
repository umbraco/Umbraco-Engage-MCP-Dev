import { jest } from "@jest/globals";
import { setupTestEnvironment } from "../setup.js";
import { PersonaSegmentBuilder, TEST_PERSONA_SEGMENT_NAME } from "./persona-segment-builder.js";
import getPersonaDetailsTool from "../../../persona/get/get-persona-details.js";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

// Real API calls: create + a follow-up get-persona-details lookup +
// delete - the default 5s Jest timeout is too tight.
jest.setTimeout(30000);

describe("PersonaSegmentBuilder", () => {
  setupTestEnvironment();

  let builder: PersonaSegmentBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  it("creates a persona with a real nested segment and resolves its real numeric entityId", async () => {
    builder = await new PersonaSegmentBuilder().create();

    expect(builder.getUnique()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    // The whole point of this builder over the plain PersonaBuilder: the
    // segment's real numeric id (not the fake 0 the create response echoes
    // back) - see the builder's own comments for the NullReferenceException
    // this avoids downstream.
    expect(builder.getEntityId()).toBeGreaterThan(0);

    const details = await getPersonaDetailsTool.handler(
      { id: builder.getUnique() },
      createMockRequestHandlerExtra(),
    );
    expect(details.isError).toBeFalsy();
    const personas = (details.structuredContent as { personas?: { id: number; title: string | null }[] })
      .personas;
    expect(personas?.[0]?.id).toBe(builder.getEntityId());
    expect(personas?.[0]?.title).toBe(TEST_PERSONA_SEGMENT_NAME);
  });

  it("build() returns a snapshot of the current model without creating it", () => {
    const fresh = new PersonaSegmentBuilder().withTitle("_Test Persona Segment Custom Title");
    const model = fresh.build();
    expect(model.title).toBe("_Test Persona Segment Custom Title");
    expect(model.personas[0].title).toBe("_Test Persona Segment Custom Title");
  });

  it("throws when getUnique()/getEntityId() are called before create()", () => {
    const fresh = new PersonaSegmentBuilder();
    expect(() => fresh.getUnique()).toThrow();
    expect(() => fresh.getEntityId()).toThrow();
  });

  it("deletes the created persona, cascading to its nested segment", async () => {
    builder = await new PersonaSegmentBuilder().create();
    const unique = builder.getUnique();

    await builder.delete();
    builder = undefined;

    const details = await getPersonaDetailsTool.handler(
      { id: unique },
      createMockRequestHandlerExtra(),
    );
    expect(details.isError).toBe(true);
  });
});
