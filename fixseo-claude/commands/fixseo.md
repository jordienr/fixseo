# FixSEO Command

Scans a website for SEO issues.

## Usage

```
/fixseo <url> [options]
```

## Arguments

- `<url>` - The website URL to scan (e.g., https://example.com)

## Options

- `--json` - Output JSON format
- `--markdown` - Output Markdown format  
- `--serve` - Open interactive HTML report
- `--max-pages=<n>` - Maximum pages to crawl (default: 25)
- `--max-depth=<n>` - Maximum crawl depth (default: 10)
- `--no-sitemap` - Disable sitemap crawling

## Examples

```
/fixseo https://example.com
/fixseo https://example.com --max-pages=1
/fixseo https://example.com --json
```

## Description

Runs a FixSEO scan on the specified URL and displays SEO issues found on the website. Issues are categorized by severity (high, medium, low) and include recommendations for fixes.
