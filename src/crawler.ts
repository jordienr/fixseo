import { XMLParser } from "fast-xml-parser";
import robotsParser from "robots-parser";
import { parseHTML } from "linkedom";
import type { ScanResult, PageData, Issue, Args } from "./types";
import { RECOMMENDATIONS } from "./types";
import { normalizeUrl, normalizeUrlKey, sameOrigin, getDepth } from "./utils";
import { createEmptyPageData, parsePageHtml } from "./parser";
import { analyzePage, findDuplicateIssues, findBrokenCanonicalIssues, groupIssues, prioritizeIssues } from "./analyzer";

const REQUEST_TIMEOUT = 10000;
const SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/en/sitemap.xml",
  "/en-us/sitemap.xml",
  "/robots.txt",
];

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

export default async function execute(args: Args): Promise<ScanResult> {
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
      const key = normalizeUrlKey(url);
      if (visited.has(key)) continue;
      if (!sameOrigin(url, startUrl)) continue;
      if (depth > maxDepth) continue;

      visited.add(key);
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
              !visited.has(normalizeUrlKey(next)) &&
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
