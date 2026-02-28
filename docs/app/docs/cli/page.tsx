import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

export default function CLIPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CLI</h1>
        <p className="mt-2 text-muted-foreground">
          Use fixseo directly from the command line to audit your website's SEO
          without needing to write any code. Perfect for quick checks, CI
          integration, or generating reports for non-developers.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Running fixseo</h2>
        <p>
          Change <span className="bg-accent">fixseo.com</span> for your
          website's URL.
        </p>
        <CodeBlock
          language="bash"
          code={{
            npm: "npx fixseo@latest fixseo.com",
            pnpm: "pnpm dlx fixseo@latest fixseo.com",
            bun: "bunx fixseo@latest fixseo.com",
          }}
        ></CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Usage</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`# Default: terminal-friendly output
npx fixseo https://example.com

# After installing globally
fixseo https://example.com`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Options</h2>
        <div className="overflow-x-auto">
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
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Examples</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`# Default: terminal output
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
  --max-depth=5`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
