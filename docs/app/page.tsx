import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Code2, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="">fixseo</h1>
        <p className="">
          A command-line SEO analysis tool that crawls websites and generates
          structured reports with SEO improvements. Like Ahrefs for your CLI -
          perfect for agents to analyze and fix SEO issues.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/docs/guides/cli">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs/guides/api">API Reference</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2 rounded-lg border bg-card p-6">
          <Terminal className="size-4" />
          <h3 className="font-semibold">CLI Tool</h3>
          <p className="text-sm text-muted-foreground">
            Install globally or use npx to run SEO audits from your terminal.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border bg-card p-6">
          <Code2 className="size-4" />
          <h3 className="font-semibold">OpenCode Tool</h3>
          <p className="text-sm text-muted-foreground">
            Use as an AI agent tool - tell your agent to check SEO issues.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border bg-card p-6">
          <Zap className="size-4" />
          <h3 className="font-semibold">Fast & Comprehensive</h3>
          <p className="text-sm text-muted-foreground">
            Checks titles, meta, OG tags, JSON-LD, canonical URLs, and more.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Features</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Multi-format output (JSON,
            Markdown, HTML)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Interactive browser preview
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Comprehensive SEO checks
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Duplicate detection
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Broken link detection
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Agent-friendly output
          </li>
        </ul>
      </section>
    </div>
  );
}
