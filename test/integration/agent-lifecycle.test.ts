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

describe("Agent lifecycle", () => {
  it("spawns a foreground agent that calls bash and returns result", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    await t.run(
      when("List files via agent", [
        calls("Agent", {
          prompt: "List files in the project",
          description: "List files",
          subagent_type: "general-purpose",
        }),
        says("Done."),
      ]),
    );

    expect(t.events.toolResultsFor("Agent")).toHaveLength(1);
    t.dispose();
  });

  it("spawns a background agent and retrieves result", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    await t.run(
      when("Launch background agent", [
        calls("Agent", {
          prompt: "Count to 3",
          description: "Count",
          subagent_type: "general-purpose",
          run_in_background: true,
        }),
        says("Launched."),
      ]),
    );

    // Background agent should have returned immediately
    expect(t.events.toolResultsFor("Agent")).toHaveLength(1);
    t.dispose();
  });

  it("stops a running agent via stop_subagent", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    await t.run(
      when("Launch and stop agent", [
        calls("Agent", {
          prompt: "Long running task",
          description: "Long task",
          subagent_type: "general-purpose",
          run_in_background: true,
        }),
        says("Launched."),
      ]),
    );

    const agentResult = t.events.toolResultsFor("Agent")[0];
    expect(agentResult).toBeDefined();

    // Extract agent ID from result text
    const idMatch = agentResult.text.match(/Agent ID: ([a-z0-9-]+)/);
    expect(idMatch).toBeTruthy();

    await t.run(
      when("Stop the agent", [
        calls("stop_subagent", { agent_id: idMatch![1] }),
        says("Stopped."),
      ]),
    );

    expect(t.events.toolResultsFor("stop_subagent")).toHaveLength(1);
    t.dispose();
  });

  it("retrieves result via get_subagent_result", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    await t.run(
      when("Launch background agent", [
        calls("Agent", {
          prompt: "Say hello",
          description: "Say hello",
          subagent_type: "general-purpose",
          run_in_background: true,
        }),
        says("Launched."),
      ]),
    );

    const agentResult = t.events.toolResultsFor("Agent")[0];
    const idMatch = agentResult.text.match(/Agent ID: ([a-z0-9-]+)/);
    expect(idMatch).toBeTruthy();

    await t.run(
      when("Get result", [
        calls("get_subagent_result", { agent_id: idMatch![1] }),
        says("Got it."),
      ]),
    );

    expect(t.events.toolResultsFor("get_subagent_result")).toHaveLength(1);
    t.dispose();
  });
});
