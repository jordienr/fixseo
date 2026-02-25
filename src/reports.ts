import type { ScanResult } from "./types";

export function generateTerminalReport(result: ScanResult): string {
  const { scanned, summary, groupedIssues, pages } = result;
  const total = summary.high + summary.medium + summary.low;

  const escape = (s: string) => s.replace(/</g, "‹").replace(/>/g, "›");

  const lines: string[] = [];

  lines.push(`🔍 SEO Scan Report`);
  lines.push(`   Scanned: ${scanned.pagesScanned} pages`);
  lines.push(`   URL: ${scanned.startUrl}`);
  lines.push(``);
  lines.push(`📊 Summary`);
  lines.push(`   🔴 High:   ${summary.high}`);
  lines.push(`   🟡 Medium: ${summary.medium}`);
  lines.push(`   🔵 Low:    ${summary.low}`);
  lines.push(`   ─────────────────`);
  lines.push(`   Total:   ${total} issues`);
  lines.push(``);

  if (groupedIssues.length === 0) {
    lines.push(`✅ No issues found!`);
  } else {
    lines.push(`📋 Issues`);
    lines.push(``);
    for (const issue of groupedIssues) {
      const icon = issue.severity === "high" ? "🔴" : issue.severity === "medium" ? "🟡" : "🔵";
      lines.push(`   ${icon} ${escape(issue.message)}`);
      lines.push(`      Count: ${issue.count}`);
      if (issue.urls.length <= 3) {
        for (const u of issue.urls) {
          lines.push(`      → ${u}`);
        }
      } else {
        for (const u of issue.urls.slice(0, 3)) {
          lines.push(`      → ${u}`);
        }
        lines.push(`      → ...and ${issue.urls.length - 3} more`);
      }
      lines.push(``);
    }
  }

  return lines.join("\n");
}

export function generateMarkdownReport(result: ScanResult): string {
  const { scanned, summary, groupedIssues, pages } = result;

  const severityEmoji = (severity: string) => {
    switch (severity) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const lines: string[] = [];

  lines.push(`# 🔍 SEO Scan Report`);
  lines.push(``);
  lines.push(
    `**Scanned:** ${scanned.pagesScanned} pages from ${scanned.startUrl}`,
  );
  lines.push(`**Date:** ${new Date(scanned.scannedAt).toLocaleString()}`);
  if (scanned.pagesScanned >= scanned.maxPages) {
    lines.push(
      `⚠️ **Reached max pages limit (${scanned.maxPages}). More pages may exist.**`,
    );
  }
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Priority | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| 🔴 High | ${summary.high} |`);
  lines.push(`| 🟡 Medium | ${summary.medium} |`);
  lines.push(`| 🔵 Low | ${summary.low} |`);
  lines.push(``);
  lines.push(`## Scanned URLs`);
  lines.push(``);
  for (const page of pages) {
    lines.push(`- [${page.url}](${page.url})`);
  }
  lines.push(``);
  lines.push(`## Issues`);
  lines.push(``);

  for (const issue of groupedIssues) {
    lines.push(`### ${severityEmoji(issue.severity)} ${issue.message}`);
    lines.push(``);
    lines.push(`- **Count:** ${issue.count}`);
    lines.push(`- **Severity:** ${issue.severity}`);
    if (issue.recommendation) {
      lines.push(`- **Recommendation:** ${issue.recommendation}`);
    }
    lines.push(`- **Affected URLs:**`);
    for (const url of issue.urls.slice(0, 10)) {
      lines.push(`  - [${url}](${url})`);
    }
    if (issue.urls.length > 10) {
      lines.push(`  - ...and ${issue.urls.length - 10} more`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export function generateHtmlReport(result: ScanResult): string {
  const { scanned, summary, groupedIssues, pages } = result;

  const severityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getUrlPath = (url: string) => {
    try {
      return new URL(url).pathname || "/";
    } catch {
      return url;
    }
  };

  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const issueRows = groupedIssues
    .map(
      (issue) => `
    <tr>
      <td><span class="severity-badge" style="background: ${severityColor(issue.severity)}">${issue.severity}</span></td>
      <td>${escapeHtml(issue.message)}</td>
      <td>${issue.count}</td>
      <td>${issue.urls
        .slice(0, 5)
        .map(
          (url) =>
            `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(getUrlPath(url))}</a>`,
        )
        .join(
          "<br>",
        )}${issue.urls.length > 5 ? `<br><em>...and ${issue.urls.length - 5} more</em>` : ""}</td>
      <td>${issue.recommendation ? escapeHtml(issue.recommendation) : ""}</td>
    </tr>
  `,
    )
    .join("");

  const pageRows = pages
    .map(
      (page) => `
    <tr>
      <td><a href="${escapeHtml(page.url)}" target="_blank">${escapeHtml(getUrlPath(page.url))}</a></td>
      <td>${page.status}</td>
      <td>${page.title ? escapeHtml(page.title.substring(0, 50) + (page.title.length > 50 ? "..." : "")) : "<span class='missing'>Missing</span>"}</td>
      <td>${page.metaDescription ? escapeHtml(page.metaDescription.substring(0, 40) + (page.metaDescription.length > 40 ? "..." : "")) : "<span class='missing'>Missing</span>"}</td>
      <td>${page.h1 ? escapeHtml(page.h1.substring(0, 30) + (page.h1.length > 30 ? "..." : "")) : "<span class='missing'>Missing</span>"}</td>
      <td>${page.ogTitle ? "✓" : "<span class='missing'>✗</span>"}</td>
      <td>${page.jsonLd ? "✓" : "<span class='missing'>✗</span>"}</td>
    </tr>
  `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Scan Report - ${scanned.startUrl}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 2rem; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .summary-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .summary-card .count { font-size: 2.5rem; font-weight: 700; }
    .summary-card.high .count { color: #ef4444; }
    .summary-card.medium .count { color: #f59e0b; }
    .summary-card.low .count { color: #3b82f6; }
    .summary-card .label { color: #64748b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 1rem 0; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; font-size: 0.875rem; color: #475569; }
    tr:hover { background: #f8fafc; }
    .severity-badge { color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .missing { color: #ef4444; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    .limit-warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; margin: 1rem 0; color: #92400e; }
    .url-list { max-height: 300px; overflow-y: auto; background: white; border-radius: 8px; padding: 0.5rem; border: 1px solid #e2e8f0; }
    .url-list a { display: block; padding: 0.25rem 0; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 SEO Scan Report</h1>
    <p class="meta">
      Scanned <strong>${scanned.pagesScanned}</strong> pages from 
      <a href="${scanned.startUrl}" target="_blank">${scanned.startUrl}</a>
      at ${new Date(scanned.scannedAt).toLocaleString()}
      ${scanned.pagesScanned >= scanned.maxPages ? `<br><strong style="color: #f59e0b;">⚠️ Reached max pages limit (${scanned.maxPages}). More pages may exist.</strong>` : ""}
    </p>

    <div class="summary">
      <div class="summary-card high">
        <div class="count">${summary.high}</div>
        <div class="label">High Priority</div>
      </div>
      <div class="summary-card medium">
        <div class="count">${summary.medium}</div>
        <div class="label">Medium Priority</div>
      </div>
      <div class="summary-card low">
        <div class="count">${summary.low}</div>
        <div class="label">Low Priority</div>
      </div>
    </div>

    <h2>📄 Scanned URLs (${pages.length})</h2>
    <div class="url-list">
      ${pages.map((p) => `<a href="${escapeHtml(p.url)}" target="_blank">${escapeHtml(getUrlPath(p.url))}</a>`).join("")}
    </div>

    <h2>📋 Issues</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Issue</th>
          <th>Count</th>
          <th>Affected URLs</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${issueRows || "<tr><td colspan='5' style='text-align:center'>No issues found!</td></tr>"}
      </tbody>
    </table>

    <h2>📄 Pages</h2>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
          <th>Title</th>
          <th>Meta Description</th>
          <th>H1</th>
          <th>OG</th>
          <th>JSON-LD</th>
        </tr>
      </thead>
      <tbody>
        ${pageRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

export async function serveReactReport(result: ScanResult, port = 5354) {
  const { startServer } = await import("../web/server");
  
  const { url, setReportData } = await startServer(port);
  
  await setReportData(result);
  
  console.log(`\n🌐 Opening SEO report at ${url}\n`);

  try {
    await Bun.spawn(["open", url]);
  } catch {
    // Ignore if can't open
  }
}
