import Link from "next/link";
import { ArrowRight, Terminal, Code2, Zap, CheckIcon } from "lucide-react";
import {
  PageLayout,
  PageTitle,
  PageSection,
  PageText,
} from "@/components/layout/page-layout";

export default function Home() {
  const links = [
    {
      href: "/docs/cli",
      title: "CLI Tool",
      description:
        "Install globally or use npx to run SEO audits from your terminal.",
    },
    {
      href: "/docs/opencode",
      title: "OpenCode",
      description: "Use as an OpenCode tool for AI agents.",
    },
    {
      href: "/docs/claude-code",
      title: "Claude Code",
      description: "Install as a skill for Claude Code.",
    },
  ];

  const features = [
    {
      title: "Multi-format Output",
      description: "Get results in JSON, Markdown, or HTML formats.",
    },
    {
      title: "Agent-friendly Output",
      description: "Designed for easy integration with AI agents.",
    },
    {
      title: "Interactive Preview",
      description: "View results in an interactive browser interface.",
    },
    {
      title: "Comprehensive SEO Checks",
      description: "Perform in-depth SEO analysis for your projects.",
    },
    {
      title: "Duplicate Detection",
      description: "Identify and resolve duplicate content issues.",
    },
    {
      title: "Broken Link Detection",
      description: "Find and fix broken links on your website.",
    },
  ];

  return (
    <PageLayout>
      <PageTitle>Introduction</PageTitle>
      <PageText>fixseo is ahrefs for your CLI and coding agent.</PageText>

      <PageSection>
        <ul className="grid gap-3">
          {features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <CheckIcon className="size-4 m-0.5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection>
        <div className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex h-full justify-between items-start rounded-xl p-4 bg-muted/60 hover:bg-muted"
            >
              <div>
                <h3 className="text-lg font-semibold">{link.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="size-4 mt-4 self-end text-muted-foreground" />
            </Link>
          ))}
        </div>
      </PageSection>
    </PageLayout>
  );
}
