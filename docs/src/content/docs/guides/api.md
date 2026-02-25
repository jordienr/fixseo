---
title: API Reference
description: FixSEO API reference for programmatic usage
---

# API Reference

## execute

Crawls a website and returns SEO analysis.

```typescript
import execute from "fixseo";

const result = await execute({
  url: "https://example.com",
  maxPages: 25,
  maxDepth: 10,
  includeSitemap: true,
});
```

### Args

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | URL to scan |
| `maxPages` | `number` | Max pages to crawl (default: 25) |
| `maxDepth` | `number` | Max crawl depth (default: 10) |
| `includeSitemap` | `boolean` | Use sitemap to seed URLs (default: true) |

### Returns

```typescript
type ScanResult = {
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
};
```

## generateHtmlReport

Generates an HTML report from scan results.

```typescript
import { generateHtmlReport } from "fixseo";

const html = generateHtmlReport(result);
```

## generateMarkdownReport

Generates a Markdown report from scan results.

```typescript
import { generateMarkdownReport } from "fixseo";

const markdown = generateMarkdownReport(result);
```
