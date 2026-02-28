# FixSEO Claude Code Plugin

A Claude Code plugin for scanning websites for SEO issues.

## Installation

```bash
# Clone this repository or copy the fixseo-claude folder
# Then load the plugin with:
claude --plugin-dir ./fixseo-claude
```

Or add it to your Claude Code plugins:

```bash
# Create a marketplace or install from local directory
/claude plugin install ./fixseo-claude
```

## Usage

Once installed, you can ask Claude to analyze a website's SEO:

- "Check SEO for example.com"
- "Scan my website for SEO issues"
- "What SEO problems does example.com have?"

## Features

- **Quick SEO scan** - Check a website for common SEO issues
- **Detailed reports** - Get comprehensive analysis with severity levels
- **Multiple output formats** - JSON, Markdown, or terminal output
- **Configurable depth** - Control how many pages to crawl

## Requirements

- Node.js (for npx to work)
- Internet connection (to fetch the fixseo package)

## License

MIT
