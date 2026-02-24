// .opencode/plugins/seo-scan.ts
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

type Severity = "high" | "medium" | "low"
type Issue = { severity: Severity; code: string; message: string; url?: string; recommendation?: string }

const RECOMMENDATIONS: Record<string, string> = {
  missing_title: "Add a descriptive <title> tag in the <head> section. Format: 'Page Title - Site Name'",
  missing_meta_description: "Add a meta description (150-160 chars) that summarizes the page content",
  missing_h1: "Add an H1 heading that includes your main keyword",
  missing_og_title: "Add <meta property='og:title' content='...'> for social sharing",
  missing_og_description: "Add <meta property='og:description' content='...'> for social sharing",
  missing_og_image: "Add <meta property='og:image' content='...'> (1200x630px recommended)",
  missing_twitter_card: "Add <meta name='twitter:card' content='summary_large_image'>",
  missing_image_alt: "Add alt attributes to all images for accessibility and SEO",
  some_images_missing_alt: "Add alt attributes to remaining images",
  missing_json_ld: "Add JSON-LD structured data (e.g., Organization, Article, FAQ schemas)",
  missing_canonical: "Add <link rel='canonical' href='...'> to prevent duplicate content issues",
  missing_hreflang: "Add hreflang tags for international SEO if you have multiple language versions",
  noindex: "Remove 'noindex' from robots meta if you want this page indexed",
  http_error: "Fix the broken link or server error",
  fetch_timeout: "Optimize server response time or check for DDoS protection",
  fetch_failed: "Verify the URL is accessible",
  duplicate_title: "Use unique titles for each page",
  duplicate_meta_description: "Use unique meta descriptions for each page",
  duplicate_canonical: "Each page should have its own canonical URL",
  broken_canonical: "Update the canonical URL to point to an existing page",
  redirect: "Consider using 301 redirect or removing unnecessary redirects",
  http_not_ttps: "Implement HTTP to HTTPS redirect at server level",
}

type PageData = {
  url: string
  status: number
  contentType?: string
  title: string | null
  metaDescription: string | null
  canonical: string | null
  h1: string | null
  robotsMeta: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  jsonLd: string[] | null
  imagesTotal: number
  imagesWithAlt: number
  h2Count: number
  cacheControl: string | null
  hreflangs: string[] | null
}

type ScanResult = {
  scanned: { startUrl: string; pagesScanned: number; maxPages: number; scannedAt: string }
  summary: { high: number; medium: number; low: number }
  groupedIssues: (Issue & { count: number; urls: string[] })[]
  topIssues: Issue[]
  pages: PageData[]
}

const REQUEST_TIMEOUT = 10000
const SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/en/sitemap.xml",
  "/en-us/sitemap.xml",
  "/robots.txt",
]

function normalizeUrl(u: string) {
  try { return new URL(u).toString() } catch { return u }
}

function sameOrigin(a: string, b: string) {
  try { return new URL(a).origin === new URL(b).origin } catch { return false }
}

function getDepth(url: string, baseUrl: string): number {
  try {
    const u = new URL(url)
    const b = new URL(baseUrl)
    return u.pathname.split("/").filter(Boolean).length
  } catch { return 0 }
}

export const SeoScanPlugin: Plugin = async () => {
  return {
    tool: {
      "seo.scan": tool({
        description:
          "Crawl a website (stack-agnostic) and return a basic SEO report: status codes, titles/meta, canonicals, H1, robots directives, Open Graph, Twitter Cards, image alt text, heading hierarchy, JSON-LD, hreflang, cache-control, broken internal links, and duplicates. Use noCache: true to get fresh results.",
        args: {
          url: tool.schema.string(),
          maxPages: tool.schema.number().optional(),
          maxDepth: tool.schema.number().optional(),
          includeSitemap: tool.schema.boolean().optional(),
          noCache: tool.schema.boolean().optional(),
        },
        async execute(args, opts) {
          console.log("seo.scan called with args:", JSON.stringify(args))
          try {
          const abortController = new AbortController()
          console.log("after abortController")
          const startUrl = normalizeUrl(args.url)
          console.log("startUrl:", startUrl)
          const maxPages = args.maxPages ?? 25
          const maxDepth = args.maxDepth ?? 10
          const includeSitemap = args.includeSitemap ?? true
          const noCache = args.noCache ?? true

          const cacheKey = noCache ? `_=${Date.now()}` : ""

          if (opts?.abortSignal) {
            opts.abortSignal.addEventListener("abort", () => abortController.abort())
          }

          const origin = new URL(startUrl).origin
          const isHttps = origin.startsWith("https://")
          const visited = new Set<string>()
          
          // Skip sitemap/robots for debugging
          const queue: { url: string; depth: number }[] = [{ url: startUrl + (cacheKey ? (startUrl.includes('?') ? '&' : '?') + cacheKey : ""), depth: 0 }]

          // robots.txt - skip for debugging
          /*
          let robots: ReturnType<typeof robotsParser> | null = null
          try {
            const robotsRes = await fetch(`${origin}/robots.txt`)
            if (robotsRes.ok) {
              const robotsTxt = await robotsRes.text()
              robots = robotsParser(`${origin}/robots.txt`, robotsTxt)
            }
          } catch (e) {
            console.error("Failed to fetch robots.txt:", e)
          }

          // optional sitemap seed
          if (includeSitemap) {
            for (const path of SITEMAP_PATHS) {
              try {
                const res = await fetch(`${origin}${path}`, { signal: abortController.signal })
                if (!res.ok) continue
                const xml = await res.text()
                if (!xml || typeof xml !== "string" || !xml.trim().startsWith("<")) continue
                
                const parser = new XMLParser({ ignoreAttributes: false })
                const parsed = parser.parse(xml)

                const urls: string[] =
                  parsed?.urlset?.url?.map((u: any) => u.loc).filter(Boolean) ??
                  parsed?.sitemapindex?.sitemap?.map((s: any) => s.loc).filter(Boolean) ??
                  []

                for (const u of urls.slice(0, maxPages)) {
                  const nu = normalizeUrl(u)
                  if (sameOrigin(nu, startUrl) && getDepth(nu, startUrl) <= maxDepth) queue.push({ url: nu, depth: getDepth(nu, startUrl) })
                }
                break
              } catch (e) {
                console.error(`Failed to parse sitemap at ${path}:`, e)
              }
            }
          }
          */

          const pages: PageData[] = []
          const issues: Issue[] = []
          const titleMap = new Map<string, string[]>()
          const metaMap = new Map<string, string[]>()
          const canonicalMap = new Map<string, string[]>()

          while (queue.length && visited.size < maxPages) {
            const { url, depth } = queue.shift()!
            if (visited.has(url)) continue
            if (!sameOrigin(url, startUrl)) continue
            if (depth > maxDepth) continue
            // if (robots && !robots.isAllowed(url, "opencode-seo-scan")) continue

            visited.add(url)

            let res: Response
            try {
              res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(REQUEST_TIMEOUT) })
            } catch (e) {
              if (e instanceof Error && e.name === "TimeoutError") {
                issues.push({ severity: "high", code: "fetch_timeout", message: "Request timed out", url, recommendation: RECOMMENDATIONS.fetch_timeout })
              } else {
                issues.push({ severity: "high", code: "fetch_failed", message: "Failed to fetch URL", url, recommendation: RECOMMENDATIONS.fetch_failed })
              }
              continue
            }

            const status = res.status
            const contentType = res.headers.get("content-type") ?? ""
            const cacheControl = res.headers.get("cache-control") ?? null
            const isHtml = contentType.includes("text/html")

            if (status >= 400) {
              issues.push({ severity: "high", code: "http_error", message: `HTTP ${status}`, url, recommendation: RECOMMENDATIONS.http_error })
              pages.push({
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
              })
              continue
            }

            if (!isHtml) {
              pages.push({
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
              })
              continue
            }

            const html = await res.text()
            if (!html || html.length < 10) {
              pages.push({
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
              })
              continue
            }
            
            let doc: Document
            try {
              const parser = new DOMParser()
              doc = parser.parseFromString(html, "text/html")
            } catch (e) {
              console.error("Failed to parse HTML:", e)
              continue
            }

            const getMetaContent = (name: string, isProperty = false): string | null => {
              const el = isProperty 
                ? doc.querySelector(`meta[property="${name}"]`)
                : doc.querySelector(`meta[name="${name}"]`)
              return el?.getAttribute("content")?.trim() ?? null
            }

            const getLinkHref = (rel: string): string | null => {
              const el = doc.querySelector(`link[rel="${rel}"]`)
              return el?.getAttribute("href") ?? null
            }

            const getFirstText = (selector: string): string | null => {
              const el = doc.querySelector(selector)
              return el?.textContent?.trim() ?? null
            }

            const title = getFirstText("title")
            const metaDescription = getMetaContent("description")
            const canonical = getLinkHref("canonical")
            const h1 = getFirstText("h1")
            const robotsMeta = getMetaContent("robots")

            // Open Graph
            const ogTitle = getMetaContent("og:title", true)
            const ogDescription = getMetaContent("og:description", true)
            const ogImage = getMetaContent("og:image", true)

            // Twitter Cards
            const twitterCard = getMetaContent("twitter:card")
            const twitterTitle = getMetaContent("twitter:title")
            const twitterDescription = getMetaContent("twitter:description")
            const twitterImage = getMetaContent("twitter:image")

            // JSON-LD
            const jsonLd: string[] = []
            doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
              const content = el.textContent?.trim()
              if (content) jsonLd.push(content)
            })

            // Image alt text
            let imagesTotal = 0
            let imagesWithAlt = 0
            doc.querySelectorAll("img").forEach((el) => {
              imagesTotal++
              if (el.getAttribute("alt")?.trim()) imagesWithAlt++
            })

            // Heading hierarchy
            const h2Count = doc.querySelectorAll("h2").length

            // Hreflang
            const hreflangs: string[] = []
            doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
              const hl = el.getAttribute("hreflang")
              if (hl) hreflangs.push(hl)
            })

            // Issues
            if (!title) issues.push({ severity: "high", code: "missing_title", message: "Missing <title>", url, recommendation: RECOMMENDATIONS.missing_title })
            if (!metaDescription) issues.push({ severity: "medium", code: "missing_meta_description", message: "Missing meta description", url, recommendation: RECOMMENDATIONS.missing_meta_description })
            if (!h1) issues.push({ severity: "medium", code: "missing_h1", message: "Missing H1", url, recommendation: RECOMMENDATIONS.missing_h1 })
            if (!ogTitle) issues.push({ severity: "low", code: "missing_og_title", message: "Missing Open Graph title", url, recommendation: RECOMMENDATIONS.missing_og_title })
            if (!ogDescription) issues.push({ severity: "low", code: "missing_og_description", message: "Missing Open Graph description", url, recommendation: RECOMMENDATIONS.missing_og_description })
            if (!ogImage) issues.push({ severity: "low", code: "missing_og_image", message: "Missing Open Graph image", url, recommendation: RECOMMENDATIONS.missing_og_image })
            if (!twitterCard) issues.push({ severity: "low", code: "missing_twitter_card", message: "Missing Twitter Card", url, recommendation: RECOMMENDATIONS.missing_twitter_card })
            if (imagesTotal > 0 && imagesWithAlt === 0) issues.push({ severity: "medium", code: "missing_image_alt", message: "All images missing alt text", url, recommendation: RECOMMENDATIONS.missing_image_alt })
            else if (imagesTotal > imagesWithAlt) issues.push({ severity: "low", code: "some_images_missing_alt", message: ` ${imagesTotal - imagesWithAlt} images missing alt text`, url, recommendation: RECOMMENDATIONS.some_images_missing_alt })
            if (jsonLd.length === 0) issues.push({ severity: "low", code: "missing_json_ld", message: "No structured data (JSON-LD)", url, recommendation: RECOMMENDATIONS.missing_json_ld })
            if (!canonical) issues.push({ severity: "low", code: "missing_canonical", message: "Missing canonical URL", url, recommendation: RECOMMENDATIONS.missing_canonical })
            if (hreflangs.length === 0) issues.push({ severity: "low", code: "missing_hreflang", message: "Missing hreflang tags", url, recommendation: RECOMMENDATIONS.missing_hreflang })
            if (robotsMeta?.toLowerCase().includes("noindex")) issues.push({ severity: "high", code: "noindex", message: "Page is marked noindex", url, recommendation: RECOMMENDATIONS.noindex })
            if (status >= 300 && status < 400) issues.push({ severity: "low", code: "redirect", message: `Redirect (${status})`, url, recommendation: RECOMMENDATIONS.redirect })

            if (title) titleMap.set(title, [...(titleMap.get(title) ?? []), url])
            if (metaDescription) metaMap.set(metaDescription, [...(metaMap.get(metaDescription) ?? []), url])
            if (canonical) canonicalMap.set(canonical, [...(canonicalMap.get(canonical) ?? []), url])

            // HTTPS validation
            if (url.startsWith("http://") && isHttps) {
              issues.push({ severity: "medium", code: "http_not_https", message: "HTTP page exists but site supports HTTPS", url, recommendation: RECOMMENDATIONS.http_not_https })
            }

            // discover internal links
            doc.querySelectorAll("a[href]").forEach((el) => {
              const href = el.getAttribute("href")
              if (!href) return
              try {
                const next = new URL(href, url).toString()
                const nextDepth = getDepth(next, startUrl)
                if (sameOrigin(next, startUrl) && !visited.has(next) && nextDepth <= maxDepth) queue.push({ url: next, depth: nextDepth })
              } catch {}
            })

            pages.push({
              url,
              status,
              contentType,
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
              cacheControl,
              hreflangs: hreflangs.length ? hreflangs : null,
            })
          }

          // duplicates
          for (const [t, urls] of titleMap.entries()) {
            if (urls.length > 1) issues.push({ severity: "medium", code: "duplicate_title", message: `Duplicate title: "${t}"`, url: urls[0], recommendation: RECOMMENDATIONS.duplicate_title })
          }
          for (const [d, urls] of metaMap.entries()) {
            if (urls.length > 1) issues.push({ severity: "low", code: "duplicate_meta_description", message: "Duplicate meta description", url: urls[0], recommendation: RECOMMENDATIONS.duplicate_meta_description })
          }
          for (const [c, urls] of canonicalMap.entries()) {
            if (urls.length > 1) issues.push({ severity: "medium", code: "duplicate_canonical", message: `Canonical "${c}" used on multiple pages`, url: urls[0], recommendation: RECOMMENDATIONS.duplicate_canonical })
          }

          // canonical chain validation
          for (const page of pages) {
            if (page.canonical && page.canonical !== page.url) {
              const canonicalPage = pages.find(p => p.url === page.canonical)
              if (!canonicalPage) {
                issues.push({ severity: "medium", code: "broken_canonical", message: "Canonical URL points to non-existent page", url: page.url, recommendation: RECOMMENDATIONS.broken_canonical })
              }
            }
          }

          // prioritize: high -> medium -> low
          const rank = { high: 0, medium: 1, low: 2 } as const
          issues.sort((a, b) => rank[a.severity] - rank[b.severity])

          const groupedIssues = issues.reduce((acc, issue) => {
            const key = `${issue.severity}-${issue.code}`
            if (!acc[key]) {
              acc[key] = { ...issue, count: 0, urls: [] }
            }
            acc[key].count++
            if (issue.url) acc[key].urls.push(issue.url)
            return acc
          }, {} as Record<string, Issue & { count: number; urls: string[] }>)

          const result: ScanResult = {
            scanned: { startUrl, pagesScanned: pages.length, maxPages, scannedAt: new Date().toISOString() },
            summary: {
              high: issues.filter(i => i.severity === "high").length,
              medium: issues.filter(i => i.severity === "medium").length,
              low: issues.filter(i => i.severity === "low").length,
            },
            groupedIssues: Object.values(groupedIssues),
            topIssues: issues.slice(0, 20),
            pages,
          }
          return result
          } catch (e) {
            console.error("SEO scan error:", e)
            throw new Error(`SEO scan failed: ${e instanceof Error ? e.message : String(e)}`)
          }
        },
      }),
    },
  }
}