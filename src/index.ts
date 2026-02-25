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

export default tool({
  description: "Scan a website for SEO issues and get a detailed report",
  args: {
    url: tool.schema.string().describe("The URL to scan for SEO issues"),
    maxPages: tool.schema.number().optional().describe("Maximum pages to crawl (default: 25)"),
    maxDepth: tool.schema.number().optional().describe("Maximum crawl depth (default: 10)"),
    includeSitemap: tool.schema.boolean().optional().describe("Use sitemap to discover pages (default: true)"),
  },
  async execute(args) {
    const cmd = ["npx", "-y", "fixseo", args.url, "--json"]
    if (args.maxPages) cmd.push("--max-pages=" + args.maxPages)
    if (args.maxDepth) cmd.push("--max-depth=" + args.maxDepth)
    if (args.includeSitemap === false) cmd.push("--no-sitemap")

    const proc = Bun.spawn(cmd)
    const result = await new Response(proc.stdout).text()
    return JSON.parse(result)
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
    console.log("Usage in OpenCode: fixseo https://example.com");
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
    console.error("  --markdown, -m     Output Markdown (for copy/paste)");
    console.error("  --serve, -s        Serve interactive HTML report locally");
    console.error("  --output=<path>    Save output to file");
    console.error("  --format=<type>    Output format: json|markdown (used with --output)");
    console.error("  --max-pages=<n>    Max pages to crawl (default: 25)");
    console.error("  --max-depth=<n>    Max crawl depth (default: 10)");
    console.error("  --no-sitemap       Disable sitemap crawling");
    process.exit(1);
  }

  console.log("🔍 Starting SEO scan...");
  console.log(`   URL: ${url}`);
  console.log(`   Max pages: ${maxPages}`);
  console.log(`   Max depth: ${maxDepth}`);
  console.log(`   Sitemap: ${includeSitemap ? "yes" : "no"}`);
  console.log("");

  const result = await execute({ url, maxPages, maxDepth, includeSitemap });

  console.log(
    `\n✅ Scan complete! Found ${result.summary.high + result.summary.medium + result.summary.low} issues across ${result.pages.length} pages.\n`,
  );

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

main().catch(console.error);
