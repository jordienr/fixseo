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
  title: "OpenCode - FixSEO",
  description: "Use FixSEO as an OpenCode tool for AI agents",
  openGraph: {
    title: "OpenCode - FixSEO",
    description: "Use FixSEO as an OpenCode tool for AI agents",
    url: "https://fixseo.dev/docs/opencode",
    siteName: "FixSEO",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCode - FixSEO",
    description: "Use FixSEO as an OpenCode tool for AI agents",
  },
};

export default function OpenCodePage() {
  return (
    <PageLayout>
      <PageSection>
        <PageTitle>OpenCode Tool</PageTitle>
        <PageText>Use fixseo as an OpenCode tool for AI agents.</PageText>
      </PageSection>
      <PageSection>
        <PageHeading>Installation</PageHeading>
        <CodeBlock
          language="bash"
          code={`npx fixseo@latest opencode`}
        ></CodeBlock>
        <PageText>
          This installs the OpenCode tool in <code>.opencode/tools/</code>.
        </PageText>
      </PageSection>

      <PageSection>
        <PageHeading>Usage</PageHeading>
        <PageText>
          After installing, tell your agent to check SEO for a URL:
        </PageText>
        <CodeBlock
          language="opencode"
          code={`> Run a fixseo scan on localhost:3000 and fix any issues it finds.`}
        ></CodeBlock>
      </PageSection>

      <PageSection>
        <PageHeading>Natural Language Prompts</PageHeading>
        <PageText>You can use natural language with the tool:</PageText>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>{'"Hey OpenCode, scan and fix SEO issues for mywebsite.com"'}</li>
          <li>{'"Check the SEO on https://example.com and save a report"'}</li>
          <li>{'"Analyze my site for SEO problems"'}</li>
        </ul>
      </PageSection>
    </PageLayout>
  );
}
