import { describe, it, expect } from "vitest";
import { spawn } from "child_process";
import { installOpenCodeTool } from "./index";

describe("installOpenCodeTool", () => {
  it("should generate valid TypeScript code", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "fixseo-test-"));
    const originalCwd = process.cwd();
    
    try {
      process.chdir(tmpDir);
      await installOpenCodeTool();
      
      const toolPath = path.join(tmpDir, ".opencode/tools/fixseo.ts");
      const content = await fs.readFile(toolPath, "utf-8");
      
      expect(content).toContain('import { tool } from "@opencode-ai/plugin"');
      expect(content).toContain("export default tool(");
      expect(content).toContain("args.url");
      expect(content).toContain("fixseo");
      expect(content).toContain("--json");
      
      const proc = spawn("bun", ["build", toolPath, "--no-bundle", "--outfile=/dev/null"]);
      
      await new Promise<void>((resolve) => {
        proc.on("close", () => resolve());
        proc.on("error", () => resolve());
      });
      
      const stderr = await new Response(proc.stderr).text();
      expect(stderr).not.toContain("error:");
      expect(stderr).not.toContain("Expected");
      expect(stderr).not.toContain("Unterminated");
    } finally {
      process.chdir(originalCwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
