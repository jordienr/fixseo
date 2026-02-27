import type { PageData, Issue, Severity } from "./types";
import { RECOMMENDATIONS } from "./types";
import { normalizeUrlKey } from "./utils";

export function analyzePage(page: PageData, isHttps: boolean): Issue[] {
  const issues: Issue[] = [];
  const {
    url,
    title,
    metaDescription,
    h1,
    canonical,
    robotsMeta,
    xRobotsTag,
    contentType,
    jsonLd,
    imagesTotal,
    imagesWithAlt,
    status,
    hreflangs,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    robotsBlocked,
    isPagination,
    isFeed,
    lang,
    appleTouchIcon,
    wordCount,
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
  if (canonical) {
    try {
      const currentUrl = new URL(url);
      const canonicalUrl = new URL(canonical);
      if (canonicalUrl.origin !== currentUrl.origin) {
        issues.push({
          severity: "high",
          code: "canonical_wrong_host",
          message: `Canonical points to different host: ${canonicalUrl.origin}`,
          url,
          recommendation: RECOMMENDATIONS.canonical_wrong_host,
        });
      } else if (canonicalUrl.pathname !== currentUrl.pathname) {
        issues.push({
          severity: "medium",
          code: "canonical_wrong_path",
          message: `Canonical points to different path`,
          url,
          recommendation: RECOMMENDATIONS.canonical_wrong_path,
        });
      }
    } catch {}
  }
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
  if (xRobotsTag?.toLowerCase().includes("noindex"))
    issues.push({
      severity: "high",
      code: "noindex_header",
      message: "Page has X-Robots-Tag: noindex",
      url,
      recommendation: RECOMMENDATIONS.noindex_header,
    });
  if (!contentType?.includes("text/html"))
    issues.push({
      severity: "high",
      code: "non_html_content",
      message: `Non-HTML content-type: ${contentType}`,
      url,
      recommendation: RECOMMENDATIONS.non_html_content,
    });
  if (robotsBlocked)
    issues.push({
      severity: "high",
      code: "robots_blocked",
      message: "Page blocked by robots.txt",
      url,
      recommendation: RECOMMENDATIONS.robots_blocked,
    });
  if (robotsBlocked && (isPagination || isFeed))
    issues.push({
      severity: "medium",
      code: "pagination_blocked",
      message: isPagination ? "Pagination URL blocked by robots.txt" : "Feed URL blocked by robots.txt",
      url,
      recommendation: RECOMMENDATIONS.pagination_blocked,
    });
  if (status === 200 && !title && !h1 && !metaDescription)
    issues.push({
      severity: "medium",
      code: "soft_404",
      message: "Possible soft 404 (200 status but no content)",
      url,
      recommendation: RECOMMENDATIONS.soft_404,
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

  if (title) {
    if (title.length < 50)
      issues.push({
        severity: "low",
        code: "title_too_short",
        message: `Title too short (${title.length} chars). Recommended: 50-60 characters`,
        url,
        recommendation: RECOMMENDATIONS.title_too_short,
      });
    if (title.length > 60)
      issues.push({
        severity: "medium",
        code: "title_too_long",
        message: `Title too long (${title.length} chars). Recommended: under 60 characters`,
        url,
        recommendation: RECOMMENDATIONS.title_too_long,
      });
  }

  if (metaDescription) {
    if (metaDescription.length < 150)
      issues.push({
        severity: "low",
        code: "description_too_short",
        message: `Meta description too short (${metaDescription.length} chars). Recommended: 150-160 characters`,
        url,
        recommendation: RECOMMENDATIONS.description_too_short,
      });
    if (metaDescription.length > 160)
      issues.push({
        severity: "medium",
        code: "description_too_long",
        message: `Meta description too long (${metaDescription.length} chars). Recommended: under 160 characters`,
        url,
        recommendation: RECOMMENDATIONS.description_too_long,
      });
  }

  if (wordCount > 0 && wordCount < 300)
    issues.push({
      severity: "medium",
      code: "content_too_short",
      message: `Content too short (${wordCount} words). Recommended: 300-500 words`,
      url,
      recommendation: RECOMMENDATIONS.content_too_short,
    });

  if (!lang)
    issues.push({
      severity: "medium",
      code: "missing_lang",
      message: "Missing lang attribute on <html>",
      url,
      recommendation: RECOMMENDATIONS.missing_lang,
    });

  if (!appleTouchIcon)
    issues.push({
      severity: "low",
      code: "missing_apple_touch_icon",
      message: "Missing Apple touch icon",
      url,
      recommendation: RECOMMENDATIONS.missing_apple_touch_icon,
    });

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
  const normalizedPageUrls = new Set(pages.map((p) => normalizeUrlKey(p.url)));
  const pageUrlsWithStatus = new Map(pages.filter(p => p.status).map((p) => [p.url, p.status]));
  const normalizedPageUrlsWithStatus = new Map(pages.filter(p => p.status).map((p) => [normalizeUrlKey(p.url), p.status]));

  const hasStatusData = pageUrlsWithStatus.size > 0;

  for (const page of pages) {
    if (page.canonical && page.canonical !== page.url) {
      const canonicalStatus = pageUrlsWithStatus.get(page.canonical) ?? normalizedPageUrlsWithStatus.get(normalizeUrlKey(page.canonical));
      const canonicalExists = pageUrls.has(page.canonical) || normalizedPageUrls.has(normalizeUrlKey(page.canonical));
      
      if (hasStatusData) {
        if (canonicalStatus !== undefined) {
          if (canonicalStatus >= 400) {
            issues.push({
              severity: "high",
              code: "canonical_non_200",
              message: `Canonical URL returns HTTP ${canonicalStatus}`,
              url: page.url,
              recommendation: RECOMMENDATIONS.canonical_non_200,
            });
          } else if (canonicalStatus >= 300 && canonicalStatus < 400) {
            issues.push({
              severity: "medium",
              code: "canonical_non_200",
              message: `Canonical URL redirects (HTTP ${canonicalStatus})`,
              url: page.url,
              recommendation: RECOMMENDATIONS.canonical_non_200,
            });
          }
        } else if (!canonicalExists) {
          issues.push({
            severity: "medium",
            code: "broken_canonical",
            message: "Canonical URL points to non-existent page",
            url: page.url,
            recommendation: RECOMMENDATIONS.broken_canonical,
          });
        }
      } else {
        if (!canonicalExists) {
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
        acc[key] = { ...issue, count: 0, urls: new Set() };
      }
      if (issue.url) {
        const normalized = normalizeUrlKey(issue.url);
        if (!acc[key].urls.has(normalized)) {
          acc[key].count++;
        }
        acc[key].urls.add(normalized);
      }
      return acc;
    },
    {} as Record<string, Issue & { count: number; urls: Set<string> }>,
  );
  return Object.values(grouped).map((g) => ({
    ...g,
    urls: Array.from(g.urls),
  }));
}

export function prioritizeIssues(issues: Issue[]): Issue[] {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...issues].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function findSitemapIssues(
  hasSitemap: boolean,
  referencedInRobots: boolean,
  urlsInSitemap: number,
  urlsTested: number,
  urlsWithErrors: string[],
  crawledUrls: string[],
  startUrl: string,
): Issue[] {
  const issues: Issue[] = [];

  if (!hasSitemap) {
    issues.push({
      severity: "medium",
      code: "missing_sitemap",
      message: "No sitemap.xml found",
      recommendation: RECOMMENDATIONS.missing_sitemap,
      url: startUrl,
    });
  } else if (!referencedInRobots) {
    issues.push({
      severity: "low",
      code: "sitemap_not_in_robots",
      message: "Sitemap not referenced in robots.txt",
      recommendation: RECOMMENDATIONS.sitemap_not_in_robots,
      url: startUrl,
    });
  }

  if (urlsWithErrors.length > 0) {
    issues.push({
      severity: "medium",
      code: "sitemap_urls_error",
      message: `${urlsWithErrors.length} URLs in sitemap return errors`,
      recommendation: RECOMMENDATIONS.sitemap_urls_error,
      url: urlsWithErrors[0],
    });
  }

  return issues;
}
