export default function CLIUsagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CLI Usage</h1>
        <p className="mt-2 text-muted-foreground">
          Detailed guide on using FixSEO from the command line.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Installation</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`# Install globally
npm install -g fixseo

# Or use npx without installing
npx fixseo <url>`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Usage</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`# Default: terminal-friendly output (nice to read)
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
                <td className="py-2">Serve interactive HTML report locally (opens browser)</td>
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
            <code>{`# Default: terminal output (readable in terminal)
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">SEO Checks</h2>
        <p className="text-muted-foreground">
          FixSEO performs the following checks:
        </p>

        <h3 className="font-semibold">High Priority</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Check</th>
                <th className="pb-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing &lt;title&gt;</td>
                <td className="py-2">Page has no &lt;title&gt; tag in &lt;head&gt;</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">noindex</td>
                <td className="py-2">Page is marked with robots noindex</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">noindex_header</td>
                <td className="py-2">Page has X-Robots-Tag: noindex header</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">robots_blocked</td>
                <td className="py-2">Page is blocked by robots.txt</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">non_html_content</td>
                <td className="py-2">Content-Type is not text/html</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">canonical_non_200</td>
                <td className="py-2">Canonical URL returns error/redirect</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mt-6">Medium Priority</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Check</th>
                <th className="pb-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing meta description</td>
                <td className="py-2">Page has no meta description</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing H1</td>
                <td className="py-2">Page has no H1 heading</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">HTTP not HTTPS</td>
                <td className="py-2">HTTP page exists but site supports HTTPS</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Duplicate title</td>
                <td className="py-2">Same title used on multiple pages</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Duplicate canonical</td>
                <td className="py-2">Same canonical URL used on multiple pages</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Broken canonical</td>
                <td className="py-2">Canonical URL points to non-existent page</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">missing_sitemap</td>
                <td className="py-2">No sitemap.xml found</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">sitemap_urls_error</td>
                <td className="py-2">URLs in sitemap return errors</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mt-6">Low Priority</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left">Check</th>
                <th className="pb-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing OG title</td>
                <td className="py-2">No Open Graph title (og:title)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing OG description</td>
                <td className="py-2">No Open Graph description (og:description)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing OG image</td>
                <td className="py-2">No Open Graph image (og:image)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing Twitter Card</td>
                <td className="py-2">No Twitter Card meta tags</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing image alt</td>
                <td className="py-2">Images missing alt attributes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing JSON-LD</td>
                <td className="py-2">No structured data (JSON-LD)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono">Missing canonical</td>
                <td className="py-2">No canonical URL specified</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">Missing hreflang</td>
                <td className="py-2">No hreflang tags for internationalization</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
