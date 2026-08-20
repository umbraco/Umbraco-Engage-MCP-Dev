import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postPersonaBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

export const TEST_PERSONA_NAME = "_Test Persona";

type PersonaModel = z.infer<typeof postPersonaBody>;

export class PersonaBuilder {
  private model: PersonaModel = {
    id: 0,
    unique: crypto.randomUUID(),
    title: TEST_PERSONA_NAME,
    personas: [],
    minimumDeviationType: "Absolute",
    expirationType: "never",
  };

  private createdId?: string;

  withTitle(title: string): this {
    this.model.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
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
        `Failed to create persona: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    // The server assigns its own `unique` and does not honor the one
    // supplied in the request body — always capture the real value from
    // the response, never the one we sent.
    const createdUnique = response.data?.persona?.unique;
    if (!createdUnique) {
      throw new Error(
        `Persona creation response did not include a persona.unique: ${JSON.stringify(response.data)}`,
      );
    }
    this.createdId = createdUnique;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deletePersona(
        { id: this.createdId },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdId = undefined;
    }
  }

  getUnique(): string {
    if (!this.createdId) {
      throw new Error("Persona not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
