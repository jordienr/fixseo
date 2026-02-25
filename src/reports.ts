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

export function generateJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
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
