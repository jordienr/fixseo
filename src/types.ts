export type Severity = "high" | "medium" | "low";

export type Issue = {
  severity: Severity;
  code: string;
  message: string;
  url?: string;
  recommendation?: string;
};

export const RECOMMENDATIONS: Record<string, string> = {
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
  noindex_header: "Remove 'noindex' from X-Robots-Tag header if you want this page indexed",
  http_error: "Fix the broken link or server error",
  fetch_timeout: "Optimize server response time or check for DDoS protection",
  fetch_failed: "Verify the URL is accessible",
  duplicate_title: "Use unique titles for each page",
  duplicate_meta_description: "Use unique meta descriptions for each page",
  duplicate_canonical: "Each page should have its own canonical URL",
  broken_canonical: "Update the canonical URL to point to an existing page",
  redirect: "Consider using 301 redirect or removing unnecessary redirects",
  http_not_https: "Implement HTTP to HTTPS redirect at server level",
  canonical_wrong_host: "Update canonical URL to match the current host/protocol",
  canonical_wrong_path: "Update canonical URL to match the current path",
  canonical_non_200: "Update canonical URL to point to a working page",
  non_html_content: "Ensure pages are served with Content-Type: text/html",
  soft_404: "Either return 404 for missing content or improve the page",
  robots_blocked: "Update robots.txt to allow crawling of important pages",
  pagination_blocked: "Allow crawling of pagination URLs in robots.txt",
  missing_sitemap: "Create a sitemap.xml file and submit it to Google Search Console",
  sitemap_not_in_robots: "Add Sitemap: directive to robots.txt",
  sitemap_urls_error: "Fix or remove broken URLs from sitemap",
  orphan_pages: "Add internal links to these pages or remove from sitemap",
  title_too_short: "Expand your title to 50-60 characters. Include your main keyword and a compelling reason to click.",
  title_too_long: "Shorten your title to under 60 characters for better display in search results.",
  description_too_short: "Expand to 150-160 characters with a clear value proposition and call-to-action.",
  description_too_long: "Shorten your meta description to under 160 characters to avoid truncation in search results.",
  content_too_short: "Expand your content to at least 300-500 words with valuable information.",
  missing_lang: "Add lang attribute to <html> element (e.g., lang='en') for proper language declaration.",
  missing_apple_touch_icon: "Add Apple touch icon and consider modern formats like PNG and SVG for better display.",
};

export type PageData = {
  url: string;
  status: number;
  contentType?: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1: string | null;
  robotsMeta: string | null;
  xRobotsTag: string | null;
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
  robotsBlocked: boolean;
  isPagination: boolean;
  isFeed: boolean;
  lang: string | null;
  appleTouchIcon: string | null;
  wordCount: number;
};

export type ScanResult = {
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
  sitemap?: {
    url?: string;
    urlsInSitemap: number;
    urlsTested: number;
    urlsWithErrors: number;
    referencedInRobots: boolean;
    orphanUrls: string[];
  };
};

export type Args = {
  url: string;
  maxPages?: number;
  maxDepth?: number;
  includeSitemap?: boolean;
  silent?: boolean;
};
