import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import {
  PageLayout,
  PageTitle,
  PageSection,
  PageHeading,
  PageText,
} from "@/components/layout/page-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI - FixSEO",
  description:
    "Use FixSEO directly from the command line to audit your website's SEO",
  openGraph: {
    title: "CLI - FixSEO",
    description:
      "Use FixSEO directly from the command line to audit your website's SEO",
    url: "https://fixseo.dev/docs/cli",
    siteName: "FixSEO",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLI - FixSEO",
    description:
      "Use FixSEO directly from the command line to audit your website's SEO",
  },
};

export default function CLIPage() {
  return (
    <PageLayout>
      <PageTitle>Command Line Interface (CLI)</PageTitle>
      <PageText>
        Use fixseo directly from the command line to audit your website's SEO
        without needing to write any code. Perfect for quick checks, CI
        integration, or generating reports for non-developers.
      </PageText>

      <PageSection>
        <PageHeading>Basic usage</PageHeading>
        <PageText>
          Run the CLI, it will ask you to input your site and it will give you
          the SEO report.
        </PageText>
        <CodeBlock
          language="bash"
          code={{
            npm: "npx fixseo@latest",
            pnpm: "pnpm dlx fixseo@latest",
            bun: "bunx fixseo@latest",
          }}
        ></CodeBlock>
        <PageText className="text-muted-foreground my-4">
          Optionally, skip the prompt by providing your URL directly:
        </PageText>
        <CodeBlock
          language="bash"
          code={{
            npm: "npx fixseo@latest example.com",
            pnpm: "pnpm dlx fixseo@latest example.com",
            bun: "bunx fixseo@latest example.com",
          }}
        ></CodeBlock>
      </PageSection>

      <PageSection>
        <PageHeading>Terminal report</PageHeading>
        <PageText>
          The default command will print the SEO report directly in the
          terminal.
        </PageText>
        <CodeBlock
          className="mt-4"
          language="terminal"
          code={`➜  fixseo git:(main) ✗ npx fixseo@latest fixseo.dev
🔍 Starting SEO scan...
   URL: fixseo.dev
   Max pages: 25
   Max depth: 10
   Sitemap: yes

📄 Scanned: 5 pages | Queue: 8
✅ Scan complete! Found 54 issues across 5 pages.

🔍 SEO Scan Report
   Scanned: 5 pages
   URL: https://fixseo.dev/

📊 Summary
   🔴 High:   0
   🟡 Medium: 3
   🔵 Low:    51
   ─────────────────
   Total:   54 issues

📋 Issues

   🟡 Content too short (219 words). Recommended: 300-500 words
      Count: 1
      → https://fixseo.dev/docs/opencode

   🟡 Duplicate title: "FixSEO - CLI & OpenCode Tool for SEO analysis"
      Count: 1
      → https://fixseo.dev/

   🟡 No sitemap.xml found
      Count: 1
      → https://fixseo.dev/
          `}
        />
      </PageSection>

      <PageSection>
        <PageHeading as="h2">Options</PageHeading>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Option</th>
                <th className="pb-2 text-left">Short</th>
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">--json</td>
                <td className="py-2 font-mono">-j</td>
                <td className="py-2">Output JSON</td>
                <td className="py-2">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--markdown</td>
                <td className="py-2 font-mono">-m</td>
                <td className="py-2">Output Markdown</td>
                <td className="py-2">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--serve</td>
                <td className="py-2 font-mono">-s</td>
                <td className="py-2">Serve interactive HTML report locally</td>
                <td className="py-2">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--output=&lt;path&gt;</td>
                <td className="py-2">-</td>
                <td className="py-2">Save output to file</td>
                <td className="py-2">stdout</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--format=&lt;type&gt;</td>
                <td className="py-2">-</td>
                <td className="py-2">Export format: json|markdown</td>
                <td className="py-2">terminal</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--max-pages=&lt;n&gt;</td>
                <td className="py-2">-</td>
                <td className="py-2">Maximum pages to crawl</td>
                <td className="py-2">25</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">--max-depth=&lt;n&gt;</td>
                <td className="py-2">-</td>
                <td className="py-2">Maximum crawl depth</td>
                <td className="py-2">10</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">--no-sitemap</td>
                <td className="py-2">-</td>
                <td className="py-2">Disable sitemap crawling</td>
                <td className="py-2">enabled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection>
        <PageHeading as="h2">Examples</PageHeading>
        <CodeBlock
          className="mt-4"
          language="bash"
          code={`# Default: terminal output
fixseo https://example.com

# Export to Markdown file
fixseo https://example.com --output=report.md --format=markdown

# Export to JSON
fixseo https://example.com --output=report.json --format=json

# Interactive HTML report in browser
fixseo https://example.com --serve

# Full options
fixseo https://example.com \\
  --output=seo-report.md \\
  --format=markdown \\
  --max-pages=50 \\
  --max-depth=5`}
        />
      </PageSection>
    </PageLayout>
  );
}
