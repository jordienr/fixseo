# FixSEO - CLI & OpenCode Tool

A command-line SEO analysis tool that crawls websites and generates structured reports with SEO improvements. Like Ahrefs for your CLI - perfect for agents to analyze and fix SEO issues.

Also works as an OpenCode tool for AI agents.

## Features

- **Multi-format output**: JSON, HTML, Markdown
- **Interactive UI**: Serve results locally with live browser preview
- **Comprehensive SEO checks**: Titles, meta descriptions, H1, OG tags, Twitter Cards, JSON-LD, canonical URLs, hreflang, image alt text
- **Duplicate detection**: Find duplicate titles, meta descriptions, canonical URLs
- **Broken link detection**: Validate canonical URLs point to existing pages
- **Agent-friendly**: Markdown output designed for AI agents to read and fix issues

## Installation

```bash
# Install globally
npm install -g fixseo

# Or use npx without installing
npx fixseo <url>
```

## CLI Usage

```bash
# Using npx (no installation needed)
npx fixseo https://example.com

# After installing globally
fixseo https://example.com

# HTML report in browser
fixseo https://example.com --serve

# Save HTML to file
fixseo https://example.com --html --output=report.html

# Markdown report (agent-friendly)
fixseo https://example.com --markdown

# Full options
fixseo https://example.com \
  --markdown \
  --output=seo-report.md \
  --max-pages=50 \
  --max-depth=5
```

## OpenCode Tool Usage

Import and use in your OpenCode project:

```typescript
import { FixSeoPlugin } from "fixseo/tool";

// Or use the tool directly
// The tool is registered as "fixseo.scan"
```

Tool name: `fixseo.scan`

Parameters:
- `url` (required): The URL to scan for SEO issues
- `maxPages` (optional): Maximum number of pages to crawl (default: 25)
- `maxDepth` (optional): Maximum crawl depth (default: 10)
- `includeSitemap` (optional): Use sitemap to discover pages (default: true)

## CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--html` | `-h` | Output HTML report | - |
| `--markdown` | `-m` | Output Markdown report | - |
| `--serve` | `-s` | Serve HTML report locally (opens browser) | - |
| `--output=<path>` | - | Save output to file | stdout |
| `--max-pages=<n>` | - | Maximum pages to crawl | 25 |
| `--max-depth=<n>` | - | Maximum crawl depth | 10 |
| `--no-sitemap` | - | Disable sitemap crawling | enabled |

## Output Formats

### JSON
Structured data for programmatic use:
```bash
bun run execute.ts https://example.com
```

### HTML
Beautiful browser-friendly report:
```bash
bun run execute.ts https://example.com --serve
# Opens http://localhost:5353 in your browser
```

### Markdown
Agent-friendly format with clickable links:
```bash
bun run execute.ts https://example.com --markdown
```

## Programmatic Usage

```typescript
import execute, { generateHtmlReport, generateMarkdownReport } from "fixseo";

// Run a scan
const result = await execute({
  url: "https://example.com",
  maxPages: 25,
  maxDepth: 10,
  includeSitemap: true,
});

// Generate reports
const html = generateHtmlReport(result);
const markdown = generateMarkdownReport(result);
```

## API

### `execute(args: Args): Promise<ScanResult>`

Crawls a website and returns SEO analysis.

**Args:**
```typescript
type Args = {
  url: string;           // URL to scan
  maxPages?: number;     // Max pages to crawl (default: 25)
  maxDepth?: number;     // Max crawl depth (default: 10)
  includeSitemap?: boolean; // Use sitemap to seed URLs (default: true)
};
```

**Returns:**
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

### `generateHtmlReport(result: ScanResult): string`

Generates an HTML report from scan results.

### `generateMarkdownReport(result: ScanResult): string`

Generates a Markdown report from scan results.

## SEO Checks

The tool checks for:

### High Priority
- Missing `<title>` tag
- HTTP errors (4xx, 5xx)
- Pages marked `noindex`
- Fetch timeouts

### Medium Priority
- Missing meta description
- Missing H1 heading
- Duplicate titles
- Duplicate canonical URLs
- Broken canonical URLs
- HTTP available but page on HTTP

### Low Priority
- Missing Open Graph tags (title, description, image)
- Missing Twitter Card
- Missing JSON-LD structured data
- Missing canonical URL
- Missing hreflang tags
- Images missing alt text
- Duplicate meta descriptions
- Redirect status codes

## Development

```bash
# Run tests
bun test
# or
npm test

# Watch mode
bun test --watch

# Run with coverage
npm run coverage
```

## Test Coverage

Unit tests cover all pure functions:
- URL helpers (normalizeUrl, sameOrigin, getDepth)
- HTML parsing (parsePageHtml)
- SEO analysis (analyzePage)
- Issue detection (findDuplicateIssues, findBrokenCanonicalIssues)
- Report generation (groupIssues, prioritizeIssues)

Run `npm run coverage` to see detailed coverage.

## Architecture

```
fixseo
├── bin/main               # CLI entry point
├── src/
│   ├── index.ts          # Main code
│   ├── tool.ts           # OpenCode tool plugin
│   └── execute.test.ts   # Tests
```

## Tech Stack

- **Runtime**: Bun
- **Testing**: Vitest
- **HTML Parsing**: linkedom
- **Sitemap Parsing**: fast-xml-parser
- **Robots.txt**: robots-parser

## License

MIT
