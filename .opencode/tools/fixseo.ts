import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Scan a website for SEO issues and get a detailed report",
  args: {
    url: tool.schema.string().describe("The URL to scan for SEO issues"),
    maxPages: tool.schema.number().optional().describe("Maximum pages to crawl (default: 25)"),
    maxDepth: tool.schema.number().optional().describe("Maximum crawl depth (default: 10)"),
    includeSitemap: tool.schema.boolean().optional().describe("Use sitemap to discover pages (default: true)"),
  },
  async execute(args, context) {
    const cmd = ["npx", "fixseo", args.url, "--markdown"]
    if (args.maxPages) cmd.push(`--max-pages=${args.maxPages}`)
    if (args.maxDepth) cmd.push(`--max-depth=${args.maxDepth}`)
    if (args.includeSitemap === false) cmd.push("--no-sitemap")

    const result = await Bun.$`${cmd}`.text()
    return result
  },
})
