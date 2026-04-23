import { describe, expect, it, vi } from "vitest";

const {
  createAgentSession,
  getAgentDir,
} = vi.hoisted(() => ({
  createAgentSession: vi.fn(),
  getAgentDir: vi.fn(() => "/mock/agent-dir"),
}));

vi.mock("@mariozechner/pi-coding-agent", () => ({
  createAgentSession,
  DefaultResourceLoader: class {
    constructor() {}
    async reload() {}
  },
  getAgentDir,
  SessionManager: { inMemory: vi.fn(() => ({ kind: "memory-session-manager" })) },
  SettingsManager: { create: vi.fn(() => ({ kind: "settings-manager" })) },
}));

import { runAgent } from "../../src/agent-runner.js";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

describe("Agent lifecycle", () => {
  it("spawns an agent with mocked session", async () => {
    const mockSession = {
      subscribe: vi.fn(() => () => {}),
      abort: vi.fn(),
      dispose: vi.fn(),
      messages: [],
      getSessionStats: vi.fn(() => ({ tokens: { input: 0, output: 0, total: 0 } })),
      prompt: vi.fn().mockResolvedValue(undefined),
      setActiveToolsByName: vi.fn(),
      getActiveToolNames: vi.fn(() => ["read", "bash"]),
      bindExtensions: vi.fn().mockResolvedValue(undefined),
    };

    createAgentSession.mockResolvedValue({ session: mockSession });

    const mockCtx = {
      cwd: "/test",
      model: { id: "test-model", provider: "test" },
      modelRegistry: { find: vi.fn(), hasConfiguredAuth: vi.fn(() => true) },
      getSystemPrompt: vi.fn(() => "system prompt"),
      ui: { notify: vi.fn() },
      sessionManager: { getSessionFile: vi.fn(() => "/tmp/session.jsonl") },
    } as unknown as ExtensionContext;

    const result = await runAgent(mockCtx, "general-purpose", "Say hello", {
      pi: {} as any,
      model: undefined,
    });

    expect(createAgentSession).toHaveBeenCalled();
    expect(result.session).toBe(mockSession);
    expect(result.aborted).toBe(false);
  });

  it("passes agentDir to createAgentSession for Windows compatibility", async () => {
    const mockSession = {
      subscribe: vi.fn(() => () => {}),
      abort: vi.fn(),
      dispose: vi.fn(),
      messages: [],
      getSessionStats: vi.fn(() => ({ tokens: { input: 0, output: 0, total: 0 } })),
      prompt: vi.fn().mockResolvedValue(undefined),
      setActiveToolsByName: vi.fn(),
      getActiveToolNames: vi.fn(() => ["read"]),
      bindExtensions: vi.fn().mockResolvedValue(undefined),
    };

    createAgentSession.mockResolvedValue({ session: mockSession });

    const mockCtx = {
      cwd: "/test",
      model: { id: "test-model", provider: "test" },
      modelRegistry: { find: vi.fn(), hasConfiguredAuth: vi.fn(() => true) },
      getSystemPrompt: vi.fn(() => "system prompt"),
      ui: { notify: vi.fn() },
      sessionManager: { getSessionFile: vi.fn(() => "/tmp/session.jsonl") },
    } as unknown as ExtensionContext;

    await runAgent(mockCtx, "Explore", "Explore codebase", {
      pi: {} as any,
      model: undefined,
    });

    const callArgs = createAgentSession.mock.calls[0][0];
    expect(callArgs.agentDir).toBeDefined();
    expect(callArgs.settingsManager).toBeDefined();
    expect(callArgs.cwd).toBe("/test");
  });
});
