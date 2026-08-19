import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export class PersonaBuilder {
  private createdUnique?: string;

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postPersona(
      {
        id: 0,
        unique: crypto.randomUUID(),
        personas: [],
        minimumDeviationType: "Absolute",
        expirationType: "never",
      } as any,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create persona group: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // The server assigns its own unique — it does not honor the one supplied
    // in the request body.
    this.createdUnique = response.data?.persona?.unique;
    return this;
  }

  getUnique(): string {
    if (!this.createdUnique) {
      throw new Error("Persona group not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  async delete(): Promise<void> {
    if (!this.createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deletePersona({ id: this.createdUnique } as any, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // ignore cleanup errors
    }
    this.createdUnique = undefined;
  }
}
