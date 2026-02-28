export default function OpenCodePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">OpenCode Tool</h1>
        <p className="mt-2 text-muted-foreground">
          Use FixSEO as an OpenCode tool for AI agents.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Installation</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>npx fixseo opencode</code>
          </pre>
        </div>
        <p className="text-sm text-muted-foreground">
          This installs the OpenCode tool in <code>.opencode/tools/</code>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Usage</h2>
        <p className="text-muted-foreground">
          After installing, tell your agent to check SEO for a URL:
        </p>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm">
            <code>{`Run a FixSEO scan on https://example.com and show me the results.`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Natural Language Prompts</h2>
        <p className="text-muted-foreground">
          You can use natural language with the tool:
        </p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>{"\"Hey OpenCode, scan and fix SEO issues for mywebsite.com\""}</li>
          <li>{"\"Check the SEO on https://example.com and save a report\""}</li>
          <li>{"\"Analyze my site for SEO problems\""}</li>
        </ul>
      </section>
    </div>
  );
}
