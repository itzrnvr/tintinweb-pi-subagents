import { describe, expect, it } from "vitest";
import {
  createTestSession,
  when,
  calls,
  says,
  type TestSession,
} from "@marcfargas/pi-test-harness";
import * as path from "node:path";

const EXTENSION = path.resolve(__dirname, "../../src/index.ts");
const MOCKS = {
  bash: (p: Record<string, unknown>) => `mock: ${p.command}`,
  read: "mock contents",
  write: "mock written",
  edit: "mock edited",
};

describe("Model swap", () => {
  it("spawns agent with explicit model parameter", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    await t.run(
      when("Launch agent with model", [
        calls("Agent", {
          prompt: "Say hello",
          description: "Hello",
          subagent_type: "general-purpose",
          model: "fireworks/accounts/fireworks/models/kimi-k2p6",
        }),
        says("Done."),
      ]),
    );

    expect(t.events.toolResultsFor("Agent")).toHaveLength(1);
    t.dispose();
  });
});
