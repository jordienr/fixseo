export default function APIPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">API Reference</h1>
        <p className="mt-2 text-muted-foreground">
          Programmatic usage of FixSEO.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">execute</h2>
        <p className="text-muted-foreground">
          Crawls a website and returns SEO analysis.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`import execute from "fixseo";

const result = await execute({
  url: "https://example.com",
  maxPages: 25,
  maxDepth: 10,
  includeSitemap: true,
});`}</code>
          </pre>
        </div>

        <h3 className="font-semibold mt-4">Args</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Parameter</th>
                <th className="pb-2 text-left">Type</th>
                <th className="pb-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">url</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">URL to scan</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">maxPages</td>
                <td className="py-2 font-mono">number</td>
                <td className="py-2">Max pages to crawl (default: 25)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">maxDepth</td>
                <td className="py-2 font-mono">number</td>
                <td className="py-2">Max crawl depth (default: 10)</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">includeSitemap</td>
                <td className="py-2 font-mono">boolean</td>
                <td className="py-2">Use sitemap to seed URLs (default: true)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mt-4">Returns</h3>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`type ScanResult = {
  scanned: {
    startUrl: string;
    pagesScanned: number;
    maxPages: number;
    scannedAt: string;
  };
  summary: { high: number; medium: number; low: number };
  groupedIssues: (Issue & { count: number; urls: string[] })[];
  topIssues: Issue[];
  pages: PageData[];
};`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">generateMarkdownReport</h2>
        <p className="text-muted-foreground">
          Generates a Markdown report from scan results.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`import { generateMarkdownReport } from "fixseo";

const markdown = generateMarkdownReport(result);`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">generateJsonReport</h2>
        <p className="text-muted-foreground">
          Generates a JSON report from scan results.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`import { generateJsonReport } from "fixseo";

const json = generateJsonReport(result);`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">generateTerminalReport</h2>
        <p className="text-muted-foreground">
          Generates a terminal-friendly report from scan results.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`import { generateTerminalReport } from "fixseo";

const terminal = generateTerminalReport(result);`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
