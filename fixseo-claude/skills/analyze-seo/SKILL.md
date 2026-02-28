---
description: Scan a website for SEO issues and get a detailed report. Use this when the user wants to analyze a website's SEO, check for SEO problems, or get recommendations for improving search engine optimization.
---

You have access to the `fixseo` tool which scans websites for SEO issues.

To use this skill, you need to run the fixseo CLI tool. The tool is available via npx:

```bash
npx fixseo <url> [options]
```

## Available Options

- `--json, -j` - Output JSON (useful for parsing)
- `--markdown, -m` - Output Markdown report
- `--serve, -s` - Serve interactive HTML report locally
- `--output=<path>` - Save output to file
- `--max-pages=<n>` - Maximum pages to crawl (default: 25)
- `--max-depth=<n>` - Maximum crawl depth (default: 10)
- `--no-sitemap` - Disable sitemap crawling

## Examples

1. Basic SEO scan:
```bash
npx fixseo https://example.com
```

2. Quick scan (1 page):
```bash
npx fixseo https://example.com --max-pages=1
```

3. JSON output for parsing:
```bash
npx fixseo https://example.com --json
```

4. Markdown report:
```bash
npx fixseo https://example.com --markdown
```

When the user asks you to check SEO for a website:
1. Extract the URL they want to scan
2. Run fixseo with appropriate options (default to terminal output for readability)
3. Present the results in a clear, organized way
4. Highlight the most critical issues first
5. Provide actionable recommendations

If the user doesn't provide a URL, ask them to specify which website to scan.
