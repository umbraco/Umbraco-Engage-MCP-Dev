import { setupTestEnvironment, GoalBuilder, GoalTestHelper } from "../setup.js";

// Requires the `sql` docker container to be running (see sql-cleanup.ts) -
// cleanup() bypasses the Management API's missing delete-goal endpoint via
// a direct SQL delete.
const NAME = "_Test Goal Test Helper";

describe("GoalTestHelper", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await GoalTestHelper.cleanup();
  });

  it("getDetails returns the full details of a created goal", async () => {
    const builder = await new GoalBuilder().withName(NAME).withValue(7).create();

    const details = await GoalTestHelper.getDetails(builder.getId());

    expect(details.unique).toBe(builder.getId());
    expect(details.name).toBe(NAME);
    expect(details.value).toBe(7);
  });

  it("listAll returns an array including a freshly created goal", async () => {
    const builder = await new GoalBuilder().withName(NAME).create();

    const all = await GoalTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((row) => row.unique === builder.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await GoalTestHelper.findByName("_Nonexistent Goal Name");
    expect(found).toBeUndefined();
  });

  it("findByName returns a freshly created goal by name", async () => {
    const builder = await new GoalBuilder().withName(NAME).create();

    const found = await GoalTestHelper.findByName(NAME);
    expect(found).toBeDefined();
    expect(found?.unique).toBe(builder.getId());
  });

  it("cleanup removes goals matching the _Test/_Probe name prefixes", async () => {
    await new GoalBuilder().withName(NAME).create();

    GoalTestHelper.cleanup();

    const found = await GoalTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
  });
});
