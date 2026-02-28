export * from "./types";
export * from "./utils";
export * from "./parser";
export * from "./analyzer";
export { default as execute, fetchSitemapUrls } from "./crawler";
export * from "./reports";

import execute from "./crawler";
import { generateTerminalReport, generateMarkdownReport, generateJsonReport, serveReactReport } from "./reports";

export async function installOpenCodeTool() {
  const fs = await import("fs/promises");
  const path = await import("path");

  const toolCode = `import { tool } from "@opencode-ai/plugin"
import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default tool({
  description: "Scan a website for SEO issues and get a detailed report",
  args: {
    url: tool.schema.string().describe("The URL to scan for SEO issues"),
    maxPages: tool.schema.number().optional().describe("Maximum pages to crawl (default: 25)"),
    maxDepth: tool.schema.number().optional().describe("Maximum crawl depth (default: 10)"),
    includeSitemap: tool.schema.boolean().optional().describe("Use sitemap to discover pages (default: true)"),
    outputFormat: tool.schema.enum(["json", "markdown", "terminal"]).optional().describe("Output format: json, markdown, or terminal (default: json)"),
    serve: tool.schema.boolean().optional().describe("Serve interactive HTML report locally (default: false)"),
    outputPath: tool.schema.string().optional().describe("Save report to file path"),
  },
  async execute(args) {
    const isLocal = process.cwd().includes("fixseo")
    const fixseoPath = isLocal 
      ? join(__dirname, "../../src/index.ts")
      : "fixseo"

    const cmd = isLocal ? ["bun", "run", fixseoPath] : ["npx", "-y", fixseoPath]
    cmd.push(args.url)
    
    if (args.maxPages) cmd.push("--max-pages=" + args.maxPages)
    if (args.maxDepth) cmd.push("--max-depth=" + args.maxDepth)
    if (args.includeSitemap === false) cmd.push("--no-sitemap")
    
    if (args.serve) {
      cmd.push("--serve")
    } else if (args.outputFormat === "markdown") {
      cmd.push("--markdown")
    } else if (args.outputFormat === "terminal") {
      // terminal is default when not json
    } else {
      cmd.push("--json")
    }
    
    if (args.outputPath) {
      cmd.push("--output=" + args.outputPath)
      if (args.outputFormat === "markdown" || !args.outputFormat) {
        cmd.push("--format=markdown")
      }
    }

    return new Promise((resolve) => {
      const proc = spawn(cmd[0], cmd.slice(1), { shell: true })
      let stdout = ""
      let stderr = ""
      
      proc.stdout.on("data", (data) => { stdout += data.toString() })
      proc.stderr.on("data", (data) => { stderr += data.toString() })
      
      proc.on("close", (code) => {
        if (code !== 0 && stderr) {
          resolve("Error: " + stderr)
        } else if (args.serve) {
          resolve("Server started. Check the URL in the output above.")
        } else if (args.outputPath) {
          resolve("Report saved to " + args.outputPath + "\\n\\n" + stdout)
        } else {
          // Try to extract JSON from output
          const jsonMatch = stdout.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              resolve(JSON.parse(jsonMatch[0]))
            } catch {
              resolve(stdout)
            }
          } else {
            resolve(stdout)
          }
        }
      })
    })
  },
})
`;

  const toolDir = path.join(process.cwd(), ".opencode/tools");
  const toolPath = path.join(toolDir, "fixseo.ts");

  try {
    await fs.mkdir(toolDir, { recursive: true });
    await fs.writeFile(toolPath, toolCode);
    console.log("✅ OpenCode tool installed!");
    console.log(`   Created: ${toolPath}`);
    console.log("");
    console.log("Usage examples:");
    console.log("  \"Hey OpenCode, scan and fix SEO issues for mywebsite.com\"");
    console.log("  fixseo https://example.com");
    console.log("Options:");
    console.log("  fixseo <url>, outputFormat: 'markdown'  # Markdown report");
    console.log("  fixseo <url>, serve: true               # Open web UI");
    console.log("  fixseo <url>, outputPath: './seo.md'    # Save to file");
  } catch (e) {
    console.error("Failed to install OpenCode tool:", e);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "opencode") {
    await installOpenCodeTool();
    return;
  }

  const outputMarkdown = args.includes("--markdown") || args.includes("-m");
  const outputJson = args.includes("--json") || args.includes("-j");
  const serve = args.includes("--serve") || args.includes("-s");
  
  let outputPath: string | undefined;
  let outputFormat: "terminal" | "json" | "markdown" = "terminal";
  
  const outputArg = args.find((a) => a.startsWith("--output="));
  if (outputArg) {
    const parts = outputArg.split("=");
    outputPath = parts[1];
    const formatArg = args.find((a) => a.startsWith("--format="));
    if (formatArg) {
      const format = formatArg.split("=")[1];
      if (format === "json" || format === "markdown") {
        outputFormat = format;
      }
    }
  }

  let url: string | undefined;
  let maxPages = 25;
  let maxDepth = 10;
  let includeSitemap = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("-")) {
      url = arg;
    } else if (arg.startsWith("--max-pages=")) {
      maxPages = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--max-depth=")) {
      maxDepth = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--no-sitemap") {
      includeSitemap = false;
    }
  }

  if (!url) {
    console.error("Usage: fixseo <url> [options]");
    console.error("       npx fixseo <url> [options]");
    console.error("       npx fixseo opencode  # Install OpenCode tool");
    console.error("Options:");
    console.error("  --json, -j         Output JSON");
    console.error("  --markdown, -m     Output Markdown report");
    console.error("  --serve, -s        Serve interactive HTML report locally");
    console.error("  --output=<path>    Save output to file");
    console.error("  --format=<type>    Output format: json|markdown (used with --output)");
    console.error("  --max-pages=<n>    Max pages to crawl (default: 25)");
    console.error("  --max-depth=<n>    Max crawl depth (default: 10)");
    console.error("  --no-sitemap       Disable sitemap crawling");
    process.exit(1);
  }

  const isJsonOutput = outputJson || outputFormat === "json";
  
  if (!isJsonOutput) {
    console.log("🔍 Starting SEO scan...");
    console.log(`   URL: ${url}`);
    console.log(`   Max pages: ${maxPages}`);
    console.log(`   Max depth: ${maxDepth}`);
    console.log(`   Sitemap: ${includeSitemap ? "yes" : "no"}`);
    console.log("");
  }

  const result = await execute({ url, maxPages, maxDepth, includeSitemap, silent: isJsonOutput });

  if (!isJsonOutput) {
    console.log(
      `\n✅ Scan complete! Found ${result.summary.high + result.summary.medium + result.summary.low} issues across ${result.pages.length} pages.\n`,
    );
  }

  if (outputPath) {
    const fs = await import("fs/promises");
    let content: string;
    
    if (outputFormat === "json" || outputJson) {
      content = JSON.stringify(result, null, 2);
    } else if (outputFormat === "markdown" || outputMarkdown) {
      content = generateMarkdownReport(result);
    } else {
      content = generateTerminalReport(result);
    }
    
    await fs.writeFile(outputPath, content);
    console.log(`Report saved to ${outputPath}`);
    return;
  }

  if (serve) {
    const { existsSync } = await import("fs");
    const webDistPath = new URL("../web/dist", import.meta.url).pathname;
    if (!existsSync(webDistPath)) {
      console.log("Building web app...");
      await Bun.spawn(["npm", "run", "build"], {
        cwd: new URL("../web", import.meta.url).pathname,
        stdio: "inherit",
      });
    }
    await serveReactReport(result);
    return;
  }

  if (outputJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (outputMarkdown) {
    console.log(generateMarkdownReport(result));
    return;
  }

  console.log(generateTerminalReport(result));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
