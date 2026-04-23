# Testing pi-subagents

Uses `@marcfargas/pi-test-harness` for integration tests with real pi runtime + mocked LLM.

## Quick Start

```bash
npm install
npm run test:integration
```

## Test Structure

```
test/
├── integration/
│   ├── agent-lifecycle.test.ts    # Spawn, stop, retrieve agents
│   ├── model-swap.test.ts        # Model parameter handling
│   ├── tools.test.ts             # Tool registration verification
│   └── windows-paths.test.ts     # Windows path normalization
└── (existing unit tests...)
```

## Running Tests

```bash
# All tests (unit + integration)
npm test

# Integration only
npm run test:integration

# Watch mode
npm run test:watch
```

## Playbook DSL

Tests use `when()`, `calls()`, `says()` to script the LLM:

```typescript
import { createTestSession, when, calls, says } from "@marcfargas/pi-test-harness";

const t = await createTestSession({
  extensions: ["./src/index.ts"],
  mockTools: { bash: "mock output", read: "contents" },
});

await t.run(
  when("Launch agent", [
    calls("Agent", { prompt: "Say hello", subagent_type: "general-purpose" }),
    says("Done."),
  ]),
);

expect(t.events.toolResultsFor("Agent")).toHaveLength(1);
t.dispose();
```

## Key Test Patterns

| What | How |
|------|-----|
| Assert tool was called | `t.events.toolResultsFor("Agent")` |
| Extract agent ID | `result.text.match(/Agent ID: ([a-z0-9-]+)/)` |
| Mock tool output | `mockTools: { bash: (p) => \`mock: ${p.command}\` }` |
| Assert UI notify | `t.events.uiCallsFor("notify")` |

## Dev Workflow

1. Edit `src/*.ts`
2. `npm run build`
3. `npm run test:integration`
4. In pi session: `/reload` (no restart needed)
5. Manual test: `Agent(prompt="...", run_in_background=true)`

See [pi-test-harness docs](https://www.npmjs.com/package/@marcfargas/pi-test-harness) for full API.
