import { XMLParser } from "fast-xml-parser";
import robotsParser from "robots-parser";
import { parseHTML } from "linkedom";

type Severity = "high" | "medium" | "low";
type Issue = {
  severity: Severity;
  code: string;
  message: string;
  url?: string;
  recommendation?: string;
};

const RECOMMENDATIONS: Record<string, string> = {
  missing_title:
    "Add a descriptive <title> tag in the <head> section. Format: 'Page Title - Site Name'",
  missing_meta_description:
    "Add a meta description (150-160 chars) that summarizes the page content",
  missing_h1: "Add an H1 heading that includes your main keyword",
  missing_og_title:
    "Add <meta property='og:title' content='...'> for social sharing",
  missing_og_description:
    "Add <meta property='og:description' content='...'> for social sharing",
  missing_og_image:
    "Add <meta property='og:image' content='...'> (1200x630px recommended)",
  missing_twitter_card:
    "Add <meta name='twitter:card' content='summary_large_image'>",
  missing_image_alt:
    "Add alt attributes to all images for accessibility and SEO",
  some_images_missing_alt: "Add alt attributes to remaining images",
  missing_json_ld:
    "Add JSON-LD structured data (e.g., Organization, Article, FAQ schemas)",
  missing_canonical:
    "Add <link rel='canonical' href='...'> to prevent duplicate content issues",
  missing_hreflang:
    "Add hreflang tags for international SEO if you have multiple language versions",
  noindex: "Remove 'noindex' from robots meta if you want this page indexed",
  http_error: "Fix the broken link or server error",
  fetch_timeout: "Optimize server response time or check for DDoS protection",
  fetch_failed: "Verify the URL is accessible",
  duplicate_title: "Use unique titles for each page",
  duplicate_meta_description: "Use unique meta descriptions for each page",
  duplicate_canonical: "Each page should have its own canonical URL",
  broken_canonical: "Update the canonical URL to point to an existing page",
  redirect: "Consider using 301 redirect or removing unnecessary redirects",
  http_not_https: "Implement HTTP to HTTPS redirect at server level",
};

type PageData = {
  url: string;
  status: number;
  contentType?: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1: string | null;
  robotsMeta: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  jsonLd: string[] | null;
  imagesTotal: number;
  imagesWithAlt: number;
  h2Count: number;
  cacheControl: string | null;
  hreflangs: string[] | null;
};

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

const REQUEST_TIMEOUT = 10000;
const SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/en/sitemap.xml",
  "/en-us/sitemap.xml",
  "/robots.txt",
];

export function normalizeUrl(u: string): string {
  try {
    return new URL(u).toString();
  } catch {
    return u;
  }
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function getDepth(url: string, baseUrl: string): number {
  try {
    const u = new URL(url);
    return u.pathname.split("/").filter(Boolean).length;
  } catch {
    return 0;
  }
}

export function createEmptyPageData(
  url: string,
  status: number,
  contentType: string,
  cacheControl: string | null,
): PageData {
  return {
    url,
    status,
    contentType,
    title: null,
    metaDescription: null,
    canonical: null,
    h1: null,
    robotsMeta: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterCard: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    jsonLd: null,
    imagesTotal: 0,
    imagesWithAlt: 0,
    h2Count: 0,
    cacheControl,
    hreflangs: null,
  };
}

export function parsePageHtml(html: string, url: string): PageData | null {
  try {
    const { document } = parseHTML(html);
    return extractPageData(document, url);
  } catch {
    return null;
  }
}

function extractPageData(doc: Document, url: string): PageData {
  const getMetaContent = (name: string, isProperty = false): string | null => {
    const el = isProperty
      ? doc.querySelector(`meta[property="${name}"]`)
      : doc.querySelector(`meta[name="${name}"]`);
    return el?.getAttribute("content")?.trim() ?? null;
  };

  const getLinkHref = (rel: string): string | null => {
    const el = doc.querySelector(`link[rel="${rel}"]`);
    return el?.getAttribute("href") ?? null;
  };

  const getFirstText = (selector: string): string | null => {
    const el = doc.querySelector(selector);
    return el?.textContent?.trim() ?? null;
  };

  const title = getFirstText("title");
  const metaDescription = getMetaContent("description");
  const canonical = getLinkHref("canonical");
  const h1 = getFirstText("h1");
  const robotsMeta = getMetaContent("robots");

  const ogTitle = getMetaContent("og:title", true);
  const ogDescription = getMetaContent("og:description", true);
  const ogImage = getMetaContent("og:image", true);

  const twitterCard = getMetaContent("twitter:card");
  const twitterTitle = getMetaContent("twitter:title");
  const twitterDescription = getMetaContent("twitter:description");
  const twitterImage = getMetaContent("twitter:image");

  const jsonLd: string[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    const content = el.textContent?.trim();
    if (content) jsonLd.push(content);
  });

  let imagesTotal = 0;
  let imagesWithAlt = 0;
  doc.querySelectorAll("img").forEach((el) => {
    imagesTotal++;
    if (el.getAttribute("alt")?.trim()) imagesWithAlt++;
  });

  const h2Count = doc.querySelectorAll("h2").length;

  const hreflangs: string[] = [];
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
    const hl = el.getAttribute("hreflang");
    if (hl) hreflangs.push(hl);
  });

  return {
    url,
    status: 200,
    contentType: "text/html",
    title,
    metaDescription,
    canonical,
    h1,
    robotsMeta,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd: jsonLd.length ? jsonLd : null,
    imagesTotal,
    imagesWithAlt,
    h2Count,
    cacheControl: null,
    hreflangs: hreflangs.length ? hreflangs : null,
  };
}

export function analyzePage(page: PageData, isHttps: boolean): Issue[] {
  const issues: Issue[] = [];
  const {
    url,
    title,
    metaDescription,
    h1,
    canonical,
    robotsMeta,
    jsonLd,
    imagesTotal,
    imagesWithAlt,
    status,
    hreflangs,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
  } = page;

  if (!title)
    issues.push({
      severity: "high",
      code: "missing_title",
      message: "Missing <title>",
      url,
      recommendation: RECOMMENDATIONS.missing_title,
    });
  if (!metaDescription)
    issues.push({
      severity: "medium",
      code: "missing_meta_description",
      message: "Missing meta description",
      url,
      recommendation: RECOMMENDATIONS.missing_meta_description,
    });
  if (!h1)
    issues.push({
      severity: "medium",
      code: "missing_h1",
      message: "Missing H1",
      url,
      recommendation: RECOMMENDATIONS.missing_h1,
    });
  if (!ogTitle)
    issues.push({
      severity: "low",
      code: "missing_og_title",
      message: "Missing Open Graph title",
      url,
      recommendation: RECOMMENDATIONS.missing_og_title,
    });
  if (!ogDescription)
    issues.push({
      severity: "low",
      code: "missing_og_description",
      message: "Missing Open Graph description",
      url,
      recommendation: RECOMMENDATIONS.missing_og_description,
    });
  if (!ogImage)
    issues.push({
      severity: "low",
      code: "missing_og_image",
      message: "Missing Open Graph image",
      url,
      recommendation: RECOMMENDATIONS.missing_og_image,
    });
  if (!twitterCard)
    issues.push({
      severity: "low",
      code: "missing_twitter_card",
      message: "Missing Twitter Card",
      url,
      recommendation: RECOMMENDATIONS.missing_twitter_card,
    });
  if (imagesTotal > 0 && imagesWithAlt === 0)
    issues.push({
      severity: "medium",
      code: "missing_image_alt",
      message: "All images missing alt text",
      url,
      recommendation: RECOMMENDATIONS.missing_image_alt,
    });
  else if (imagesTotal > imagesWithAlt)
    issues.push({
      severity: "low",
      code: "some_images_missing_alt",
      message: ` ${imagesTotal - imagesWithAlt} images missing alt text`,
      url,
      recommendation: RECOMMENDATIONS.some_images_missing_alt,
    });
  if (!jsonLd || jsonLd.length === 0)
    issues.push({
      severity: "low",
      code: "missing_json_ld",
      message: "No structured data (JSON-LD)",
      url,
      recommendation: RECOMMENDATIONS.missing_json_ld,
    });
  if (!canonical)
    issues.push({
      severity: "low",
      code: "missing_canonical",
      message: "Missing canonical URL",
      url,
      recommendation: RECOMMENDATIONS.missing_canonical,
    });
  if (!hreflangs || hreflangs.length === 0)
    issues.push({
      severity: "low",
      code: "missing_hreflang",
      message: "Missing hreflang tags",
      url,
      recommendation: RECOMMENDATIONS.missing_hreflang,
    });
  if (robotsMeta?.toLowerCase().includes("noindex"))
    issues.push({
      severity: "high",
      code: "noindex",
      message: "Page is marked noindex",
      url,
      recommendation: RECOMMENDATIONS.noindex,
    });
  if (status >= 300 && status < 400)
    issues.push({
      severity: "low",
      code: "redirect",
      message: `Redirect (${status})`,
      url,
      recommendation: RECOMMENDATIONS.redirect,
    });

  if (url.startsWith("http://") && isHttps) {
    issues.push({
      severity: "medium",
      code: "http_not_https",
      message: "HTTP page exists but site supports HTTPS",
      url,
      recommendation: RECOMMENDATIONS.http_not_https,
    });
  }

  return issues;
}

export function findDuplicateIssues(pages: PageData[]): Issue[] {
  const issues: Issue[] = [];
  const titleMap = new Map<string, string[]>();
  const metaMap = new Map<string, string[]>();
  const canonicalMap = new Map<string, string[]>();

  for (const page of pages) {
    if (page.title) {
      const urls = titleMap.get(page.title) ?? [];
      urls.push(page.url);
      titleMap.set(page.title, urls);
    }
    if (page.metaDescription) {
      const urls = metaMap.get(page.metaDescription) ?? [];
      urls.push(page.url);
      metaMap.set(page.metaDescription, urls);
    }
    if (page.canonical) {
      const urls = canonicalMap.get(page.canonical) ?? [];
      urls.push(page.url);
      canonicalMap.set(page.canonical, urls);
    }
  }

  for (const [t, urls] of titleMap.entries()) {
    if (urls.length > 1)
      issues.push({
        severity: "medium",
        code: "duplicate_title",
        message: `Duplicate title: "${t}"`,
        url: urls[0],
        recommendation: RECOMMENDATIONS.duplicate_title,
      });
  }
  for (const [d, urls] of metaMap.entries()) {
    if (urls.length > 1)
      issues.push({
        severity: "low",
        code: "duplicate_meta_description",
        message: "Duplicate meta description",
        url: urls[0],
        recommendation: RECOMMENDATIONS.duplicate_meta_description,
      });
  }
  for (const [c, urls] of canonicalMap.entries()) {
    if (urls.length > 1)
      issues.push({
        severity: "medium",
        code: "duplicate_canonical",
        message: `Canonical "${c}" used on multiple pages`,
        url: urls[0],
        recommendation: RECOMMENDATIONS.duplicate_canonical,
      });
  }

  return issues;
}

export function findBrokenCanonicalIssues(pages: PageData[]): Issue[] {
  const issues: Issue[] = [];
  const pageUrls = new Set(pages.map((p) => p.url));

  for (const page of pages) {
    if (page.canonical && page.canonical !== page.url) {
      if (!pageUrls.has(page.canonical)) {
        issues.push({
          severity: "medium",
          code: "broken_canonical",
          message: "Canonical URL points to non-existent page",
          url: page.url,
          recommendation: RECOMMENDATIONS.broken_canonical,
        });
      }
    }
  }

  return issues;
}

export function groupIssues(
  issues: Issue[],
): (Issue & { count: number; urls: string[] })[] {
  const grouped = issues.reduce(
    (acc, issue) => {
      const key = `${issue.severity}-${issue.code}`;
      if (!acc[key]) {
        acc[key] = { ...issue, count: 0, urls: [] };
      }
      acc[key].count++;
      if (issue.url) acc[key].urls.push(issue.url);
      return acc;
    },
    {} as Record<string, Issue & { count: number; urls: string[] }>,
  );
  return Object.values(grouped);
}

export function prioritizeIssues(issues: Issue[]): Issue[] {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export async function fetchSitemapUrls(
  origin: string,
  maxPages: number,
  maxDepth: number,
  startUrl: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const urls: string[] = [];

  for (const path of SITEMAP_PATHS) {
    try {
      const res = await fetch(`${origin}${path}`, { signal });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml || typeof xml !== "string" || !xml.trim().startsWith("<"))
        continue;

      const parser = new XMLParser({ ignoreAttributes: false });
      const parsed = parser.parse(xml);

      const sitemapUrls: string[] =
        parsed?.urlset?.url?.map((u: any) => u.loc).filter(Boolean) ??
        parsed?.sitemapindex?.sitemap?.map((s: any) => s.loc).filter(Boolean) ??
        [];

      for (const u of sitemapUrls.slice(0, maxPages)) {
        const nu = normalizeUrl(u);
        if (sameOrigin(nu, startUrl) && getDepth(nu, startUrl) <= maxDepth)
          urls.push(nu);
      }
      break;
    } catch {
      continue;
    }
  }

  return urls;
}

type Args = {
  url: string;
  maxPages?: number;
  maxDepth?: number;
  includeSitemap?: boolean;
};
export default async function execute(args: Args) {
  try {
    const abortController = new AbortController();
    const startUrl = normalizeUrl(args.url);
    const maxPages = args.maxPages ?? 25;
    const maxDepth = args.maxDepth ?? 10;
    const includeSitemap = args.includeSitemap ?? true;

    const cacheKey = `_=${Date.now()}`;

    const origin = new URL(startUrl).origin;
    const isHttps = origin.startsWith("https://");
    const visited = new Set<string>();

    const queue: { url: string; depth: number }[] = [
      {
        url:
          startUrl +
          (cacheKey ? (startUrl.includes("?") ? "&" : "?") + cacheKey : ""),
        depth: 0,
      },
    ];

    try {
      const robotsRes = await fetch(`${origin}/robots.txt`);
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text();
        robotsParser(`${origin}/robots.txt`, robotsTxt);
      }
    } catch {
      // Silently fail - robots.txt is optional
    }

    if (includeSitemap) {
      const sitemapUrls = await fetchSitemapUrls(
        origin,
        maxPages,
        maxDepth,
        startUrl,
        abortController.signal,
      );
      for (const url of sitemapUrls) {
        queue.push({ url, depth: getDepth(url, startUrl) });
      }
    }

    const pages: PageData[] = [];
    const issues: Issue[] = [];

    while (queue.length && visited.size < maxPages) {
      const { url, depth } = queue.shift()!;
      if (visited.has(url)) continue;
      if (!sameOrigin(url, startUrl)) continue;
      if (depth > maxDepth) continue;

      visited.add(url);
      process.stdout.write(
        `\r📄 Scanned: ${visited.size} pages | Queue: ${queue.length}    `,
      );

      let res: Response;
      try {
        res = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT),
        });
      } catch (e) {
        if (e instanceof Error && e.name === "TimeoutError") {
          issues.push({
            severity: "high",
            code: "fetch_timeout",
            message: "Request timed out",
            url,
            recommendation: RECOMMENDATIONS.fetch_timeout,
          });
        } else {
          issues.push({
            severity: "high",
            code: "fetch_failed",
            message: "Failed to fetch URL",
            url,
            recommendation: RECOMMENDATIONS.fetch_failed,
          });
        }
        continue;
      }

      const status = res.status;
      const contentType = res.headers.get("content-type") ?? "";
      const cacheControl = res.headers.get("cache-control") ?? null;
      const isHtml = contentType.includes("text/html");

      if (status >= 400) {
        issues.push({
          severity: "high",
          code: "http_error",
          message: `HTTP ${status}`,
          url,
          recommendation: RECOMMENDATIONS.http_error,
        });
        pages.push(createEmptyPageData(url, status, contentType, cacheControl));
        continue;
      }

      if (!isHtml) {
        pages.push(createEmptyPageData(url, status, contentType, cacheControl));
        continue;
      }

      const html = await res.text();
      if (!html || html.length < 10) {
        pages.push(createEmptyPageData(url, status, contentType, cacheControl));
        continue;
      }

      const page = parsePageHtml(html, url);
      if (!page) {
        continue;
      }

      page.status = status;
      page.contentType = contentType;
      page.cacheControl = cacheControl;

      const pageIssues = analyzePage(page, isHttps);
      issues.push(...pageIssues);

      try {
        const { document } = parseHTML(html);
        document.querySelectorAll("a[href]").forEach((el: any) => {
          const href = el.getAttribute("href");
          if (!href) return;
          try {
            const next = new URL(href, url).toString();
            const nextDepth = getDepth(next, startUrl);
            if (
              sameOrigin(next, startUrl) &&
              !visited.has(next) &&
              nextDepth <= maxDepth
            )
              queue.push({ url: next, depth: nextDepth });
          } catch {}
        });
      } catch {}

      pages.push(page);
    }

    const duplicateIssues = findDuplicateIssues(pages);
    issues.push(...duplicateIssues);

    const brokenCanonicalIssues = findBrokenCanonicalIssues(pages);
    issues.push(...brokenCanonicalIssues);

    const prioritizedIssues = prioritizeIssues(issues);

    const result: ScanResult = {
      scanned: {
        startUrl,
        pagesScanned: pages.length,
        maxPages,
        scannedAt: new Date().toISOString(),
      },
      summary: {
        high: prioritizedIssues.filter((i) => i.severity === "high").length,
        medium: prioritizedIssues.filter((i) => i.severity === "medium").length,
        low: prioritizedIssues.filter((i) => i.severity === "low").length,
      },
      groupedIssues: groupIssues(prioritizedIssues),
      topIssues: prioritizedIssues.slice(0, 20),
      pages,
    };
    return result;
  } catch (e) {
    console.error("SEO scan error:", e);
    throw new Error(
      `SEO scan failed: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
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

export async function serveHtmlReport(html: string, port = 5353) {
  const server = Bun.serve({
    port,
    async fetch(req) {
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    },
  });

  const url = `http://localhost:${server.port}`;
  console.log(`\n🌐 Opening SEO report at ${url}\n`);

  // Open in browser (macOS)
  try {
    await Bun.spawn(["open", url]);
  } catch {
    // Ignore if can't open
  }

  return server;
}

async function installOpenCodeTool() {
  const fs = await import("fs/promises");
  const path = await import("path");

  const toolCode = `import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Scan a website for SEO issues and get a detailed report",
  args: {
    url: tool.schema.string().describe("The URL to scan for SEO issues"),
    maxPages: tool.schema.number().optional().describe("Maximum pages to crawl (default: 25)"),
    maxDepth: tool.schema.number().optional().describe("Maximum crawl depth (default: 10)"),
    includeSitemap: tool.schema.boolean().optional().describe("Use sitemap to discover pages (default: true)"),
  },
  async execute(args) {
    const cmd = ["npx", "-y", "fixseo", args.url, "--markdown"]
    if (args.maxPages) cmd.push(\`--max-pages=\${args.maxPages}\`)
    if (args.maxDepth) cmd.push(\`--max-depth=\${args.maxDepth}\`)
    if (args.includeSitemap === false) cmd.push("--no-sitemap")

    const result = await Bun.\`\${cmd}\`.text()
    return result
  },
})
`;

  const toolDir = path.join(process.cwd(), ".opencode/tools");
  const toolPath = path.join(toolDir, "fixseo.ts");

  try {
    await fs.mkdir(toolDir, { recursive: true });
    await fs.writeFile(toolPath, toolCode);
    console.log("✅ OpenCode tool installed!");
    console.log(`   Created: ${toolPath}`);
    console.log("");
    console.log("Usage in OpenCode: fixseo https://example.com");
  } catch (e) {
    console.error("Failed to install OpenCode tool:", e);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "opencode") {
    await installOpenCodeTool();
    return;
  }

  const outputHtml = args.includes("--html") || args.includes("-h");
  const outputMarkdown = args.includes("--markdown") || args.includes("-m");
  const serve = args.includes("--serve") || args.includes("-s");
  const outputPath = args.find((a) => a.startsWith("--output="))?.split("=")[1];

  let url: string | undefined;
  let maxPages = 25;
  let maxDepth = 10;
  let includeSitemap = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("-")) {
      url = arg;
    } else if (arg.startsWith("--max-pages=")) {
      maxPages = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--max-depth=")) {
      maxDepth = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--no-sitemap") {
      includeSitemap = false;
    }
  }

  if (!url) {
    console.error("Usage: fixseo <url> [options]");
    console.error("       npx fixseo <url> [options]");
    console.error("       npx fixseo opencode  # Install OpenCode tool");
    console.error("Options:");
    console.error("  --html, -h         Output HTML report");
    console.error("  --markdown, -m     Output Markdown report");
    console.error("  --serve, -s        Serve HTML report locally");
    console.error("  --output=<path>    Save output to file");
    console.error("  --max-pages=<n>    Max pages to crawl (default: 25)");
    console.error("  --max-depth=<n>    Max crawl depth (default: 10)");
    console.error("  --no-sitemap       Disable sitemap crawling");
    process.exit(1);
  }

  console.log("🔍 Starting SEO scan...");
  console.log(`   URL: ${url}`);
  console.log(`   Max pages: ${maxPages}`);
  console.log(`   Max depth: ${maxDepth}`);
  console.log(`   Sitemap: ${includeSitemap ? "yes" : "no"}`);
  console.log("");

  const result = await execute({ url, maxPages, maxDepth, includeSitemap });

  console.log(
    `\n✅ Scan complete! Found ${result.summary.high + result.summary.medium + result.summary.low} issues across ${result.pages.length} pages.\n`,
  );

  if (serve) {
    const html = generateHtmlReport(result);
    await serveHtmlReport(html);
    return;
  }

  if (outputMarkdown) {
    const md = generateMarkdownReport(result);
    if (outputPath) {
      const fs = await import("fs/promises");
      await fs.writeFile(outputPath, md);
      console.log(`Markdown report saved to ${outputPath}`);
    } else {
      console.log(md);
    }
    return;
  }

  if (outputHtml) {
    const html = generateHtmlReport(result);
    if (outputPath) {
      const fs = await import("fs/promises");
      await fs.writeFile(outputPath, html);
      console.log(`HTML report saved to ${outputPath}`);
    } else {
      console.log(html);
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
