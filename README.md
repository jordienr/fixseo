# FixSEO

SEO analysis CLI - scan websites for SEO issues directly from your terminal.

## Quick Start

```bash
# Scan a website (default: terminal-friendly output)
npx fixseo https://example.com

# Install as global CLI
npm install -g fixseo
fixseo https://example.com
```

## Features

- **Terminal-friendly output** - Read results directly in your terminal
- **Multiple export formats** - JSON, Markdown, HTML
- **OpenCode tool** - Works with AI agents
- **Comprehensive checks** - Titles, meta, OG tags, canonical URLs, hreflang, images, JSON-LD, and more

## Usage

```bash
# Default: terminal output (nice to read)
npx fixseo https://example.com

# Export to file with format
npx fixseo https://example.com --output=report.md --format=markdown
npx fixseo https://example.com --output=report.html --format=html
npx fixseo https://example.com --output=report.json --format=json

# Other options
npx fixseo https://example.com --serve        # Open HTML report in browser
npx fixseo https://example.com --max-pages=50 # Limit pages
npx fixseo opencode                            # Install OpenCode tool
```

For complete documentation, see: https://fixseo.deno.dev/docs

## Development

```bash
npm test        # Run tests
npm run pub     # Publish to npm
```

## License

MIT
