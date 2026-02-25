---
title: CLI Usage
description: How to use FixSEO from the command line
---

# CLI Usage

## Installation

```bash
# Install globally
npm install -g fixseo

# Or use npx without installing
npx fixseo <url>
```

## Basic Usage

```bash
# Default: terminal-friendly output (nice to read)
npx fixseo https://example.com

# After installing globally
fixseo https://example.com
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--json` | `-j` | Output JSON | - |
| `--markdown` | `-m` | Output Markdown | - |
| `--serve` | `-s` | Serve interactive HTML report locally (opens browser) | - |
| `--output=<path>` | - | Save output to file | stdout |
| `--format=<type>` | - | Export format: json\|markdown | terminal |
| `--max-pages=<n>` | - | Maximum pages to crawl | 25 |
| `--max-depth=<n>` | - | Maximum crawl depth | 10 |
| `--no-sitemap` | - | Disable sitemap crawling | enabled |

## Examples

```bash
# Default: terminal output (readable in terminal)
fixseo https://example.com

# Export to Markdown file
fixseo https://example.com --output=report.md --format=markdown

# Export to JSON
fixseo https://example.com --output=report.json --format=json

# Interactive HTML report in browser
fixseo https://example.com --serve

# Full options
fixseo https://example.com \
  --output=seo-report.md \
  --format=markdown \
  --max-pages=50 \
  --max-depth=5
```

## SEO Checks

FixSEO performs the following checks:

### High Priority
| Check | Description |
|-------|-------------|
| Missing `<title>` | Page has no `<title>` tag in `<head>` |
| noindex | Page is marked with robots noindex |
| noindex_header | Page has X-Robots-Tag: noindex header |
| robots_blocked | Page is blocked by robots.txt |
| non_html_content | Content-Type is not text/html |
| canonical_non_200 | Canonical URL returns error/redirect |

### Medium Priority
| Check | Description |
|-------|-------------|
| Missing meta description | Page has no meta description |
| Missing H1 | Page has no H1 heading |
| HTTP not HTTPS | HTTP page exists but site supports HTTPS |
| Duplicate title | Same title used on multiple pages |
| Duplicate canonical | Same canonical URL used on multiple pages |
| Broken canonical | Canonical URL points to non-existent page |
| canonical_wrong_host | Canonical points to different host/protocol |
| canonical_wrong_path | Canonical points to different path |
| soft_404 | 200 status but no content (possible soft 404) |
| pagination_blocked | Pagination/feed URL blocked by robots.txt |

### Low Priority
| Check | Description |
|-------|-------------|
| Missing OG title | No Open Graph title (`og:title`) |
| Missing OG description | No Open Graph description (`og:description`) |
| Missing OG image | No Open Graph image (`og:image`) |
| Missing Twitter Card | No Twitter Card meta tags |
| Missing image alt | Images missing alt attributes |
| Missing JSON-LD | No structured data (JSON-LD) |
| Missing canonical | No canonical URL specified |
| Missing hreflang | No hreflang tags for internationalization |
| Redirect | Page returns 3xx redirect status |

### Errors
| Check | Description |
|-------|-------------|
| HTTP error | Page returned 4xx or 5xx status |
| Fetch timeout | Request timed out |
| Fetch failed | Failed to fetch page |
