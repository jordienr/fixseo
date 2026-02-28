---
description: Scan a website for SEO issues and get a detailed report
---

You have access to the fixseo tool.

To scan a website for SEO issues, use npx to run fixseo:

```bash
npx fixseo <url> [options]
```

When the user asks you to check SEO for a website:
1. Extract the URL they want to scan
2. Run: npx fixseo \$ARGUMENTS --max-pages=5
3. Present the results in a clear, organized way
4. Highlight the most critical issues first

Common options:
- --max-pages=1 (quick scan)
- --json (machine-readable output)
- --markdown (markdown report)

If the user doesn't provide a URL, ask them to specify which website to scan.
