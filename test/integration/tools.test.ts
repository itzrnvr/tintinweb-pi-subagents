import { describe, expect, it } from "vitest";
import {
  createTestSession,
  when,
  calls,
  says,
} from "@marcfargas/pi-test-harness";
import * as path from "node:path";

const EXTENSION = path.resolve(__dirname, "../../src/index.ts");
const MOCKS = {
  bash: (p: Record<string, unknown>) => `mock: ${p.command}`,
  read: "mock contents",
  write: "mock written",
  edit: "mock edited",
};

describe("Tool registration", () => {
  it("registers all expected tools", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: MOCKS,
    });

    const tools = t.session.getAllTools().map((t) => t.name);
    expect(tools).toContain("Agent");
    expect(tools).toContain("get_subagent_result");
    expect(tools).toContain("stop_subagent");
    expect(tools).toContain("steer_subagent");
    expect(tools).toContain("list_models");

    t.dispose();
  });
});
