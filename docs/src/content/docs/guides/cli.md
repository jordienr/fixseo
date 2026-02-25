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
| `--html` | `-h` | Output HTML report | - |
| `--serve` | `-s` | Serve HTML report locally (opens browser) | - |
| `--output=<path>` | - | Save output to file | stdout |
| `--format=<type>` | - | Export format: json\|markdown\|html | terminal |
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

# Export to HTML
fixseo https://example.com --output=report.html --format=html

# HTML report in browser
fixseo https://example.com --serve

# Full options
fixseo https://example.com \
  --output=seo-report.md \
  --format=markdown \
  --max-pages=50 \
  --max-depth=5
```
