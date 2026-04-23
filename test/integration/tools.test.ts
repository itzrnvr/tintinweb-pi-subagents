import { describe, expect, it } from "vitest";
import {
  createTestSession,
} from "@marcfargas/pi-test-harness";
import * as path from "node:path";

const EXTENSION = path.resolve(__dirname, "../../src/index.ts");

describe("Tool registration", () => {
  it("registers all expected tools", async () => {
    const t = await createTestSession({
      extensions: [EXTENSION],
      mockTools: { bash: "mock", read: "contents" },
    });

    const tools = t.session.getAllTools().map((t) => t.name);
    expect(tools).toContain("Agent");
    expect(tools).toContain("get_subagent_result");
    expect(tools).toContain("steer_subagent");
    expect(tools).toContain("stop_subagent");

    t.dispose();
  });
});
