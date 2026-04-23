import { describe, expect, it } from "vitest";
import { createOutputFilePath } from "../../src/output-file.js";
import * as path from "node:path";
import * as os from "node:os";

describe("Windows path normalization", () => {
  it("strips backslashes and drive letters from cwd in the encoded portion", () => {
    const result = createOutputFilePath("C:\\Users\\babys\\project", "agent-123", "session-456");
    // The encoded cwd portion should have no colons or backslashes
    const relative = path.relative(os.tmpdir(), result).replace(/\\/g, "/");
    expect(relative).not.toContain(":");
    expect(relative).not.toContain("\\");
    expect(result).toContain("agent-123.output");
  });

  it("handles Unix paths without mangling", () => {
    const result = createOutputFilePath("/home/user/project", "agent-456", "session-789");
    expect(result).toContain("agent-456.output");
    expect(path.dirname(result)).toBeTruthy();
  });
});
