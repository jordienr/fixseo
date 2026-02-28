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
  title: "Claude Code - FixSEO",
  description: "Use FixSEO as a Claude Code skill for AI agents",
  openGraph: {
    title: "Claude Code - FixSEO",
    description: "Use FixSEO as a Claude Code skill for AI agents",
    url: "https://fixseo.dev/docs/claude-code",
    siteName: "FixSEO",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code - FixSEO",
    description: "Use FixSEO as a Claude Code skill for AI agents",
  },
};

export default function ClaudeCodePage() {
  return (
    <PageLayout>
      <PageSection>
        <PageTitle>Claude Code</PageTitle>
        <PageText>Use fixseo as a Claude Code skill.</PageText>
      </PageSection>

      <PageSection>
        <PageHeading>Installation</PageHeading>
        <CodeBlock language="bash" code={`npx fixseo claude`}></CodeBlock>

        <PageText>
          This installs the fixseo skill in <code>.claude/skills/fixseo/</code>{" "}
          in your current directory.
        </PageText>
      </PageSection>

      <PageSection className="space-y-3">
        <PageHeading>Usage</PageHeading>
        <PageText>
          After installing, ask Claude to analyze a website's SEO:
        </PageText>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>{'"Check SEO for example.com"'}</li>
          <li>{'"Scan my website for issues"'}</li>
          <li>{'"What SEO problems does example.com have?"'}</li>
        </ul>
      </PageSection>

      <PageSection>
        <PageHeading>How it works</PageHeading>
        <PageText>
          The skill tells Claude Code to run <code>npx fixseo</code> and present
          the results in a clear, organized way. Issues are categorized by
          severity (high, medium, low) with actionable recommendations.
        </PageText>
      </PageSection>

      <PageSection>
        <PageHeading>Options</PageHeading>
        <PageText>
          The skill uses sensible defaults but you can customize by specifying
          options in your prompt:
        </PageText>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>{'"Check SEO for example.com with max 5 pages"'}</li>
          <li>{'"Quick scan - just 1 page"'}</li>
        </ul>
      </PageSection>
    </PageLayout>
  );
}
