import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
import execute, { generateMarkdownReport } from "./index";

export const FixSeoPlugin: Plugin = async () => {
  return {
    tool: {
      "fixseo.scan": tool({
        description:
          "Scan a website for SEO issues and get a detailed report with recommendations. Use this to analyze any URL for SEO improvements like missing titles, meta descriptions, Open Graph tags, JSON-LD structured data, canonical URLs, hreflang, image alt text, and more. Returns a markdown-formatted report that can be used to fix issues.",
        args: {
          url: tool.schema.string().describe("The URL to scan for SEO issues"),
          maxPages: tool.schema
            .number()
            .optional()
            .default(25)
            .describe("Maximum number of pages to crawl"),
          maxDepth: tool.schema
            .number()
            .optional()
            .default(10)
            .describe("Maximum crawl depth"),
          includeSitemap: tool.schema
            .boolean()
            .optional()
            .default(true)
            .describe("Whether to use sitemap to discover pages"),
        },
        async execute(args, context) {
          context.metadata({ title: `Scanning ${args.url} for SEO issues...` });

          const result = await execute({
            url: args.url,
            maxPages: args.maxPages,
            maxDepth: args.maxDepth,
            includeSitemap: args.includeSitemap,
          });

          const report = generateMarkdownReport(result);

          const summary = `Scanned ${result.pages.length} pages. Found ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low priority issues.`;

          context.metadata({
            title: `SEO Scan Complete: ${args.url}`,
            metadata: {
              pagesScanned: result.pages.length,
              issuesFound:
                result.summary.high +
                result.summary.medium +
                result.summary.low,
            },
          });

          return `${summary}\n\n${report}`;
        },
      }),
    },
  };
};

export default FixSeoPlugin;
