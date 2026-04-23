import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/model-resolver.js", () => ({
  resolveModel: vi.fn((input: string) => {
    if (input === "invalid") return "Model not found";
    return { provider: "fireworks", id: "kimi-k2p6", name: "Kimi" };
  }),
}));

import { swapAgentModel } from "../../src/agent-runner.js";

describe("Model swap", () => {
  it("swaps to a valid model", async () => {
    const mockSession = {
      setModel: vi.fn().mockResolvedValue(undefined),
    };

    const msg = await swapAgentModel(mockSession as any, "kimi-k2p6", { find: vi.fn(), getAll: vi.fn() });

    expect(mockSession.setModel).toHaveBeenCalled();
    expect(msg).toContain("Model swapped");
  });

  it("returns error for invalid model", async () => {
    const mockSession = {
      setModel: vi.fn(),
    };

    const msg = await swapAgentModel(mockSession as any, "invalid", { find: vi.fn(), getAll: vi.fn() });

    expect(mockSession.setModel).not.toHaveBeenCalled();
    expect(msg).toContain("not found");
  });
});
