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
