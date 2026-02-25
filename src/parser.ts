import { parseHTML } from "linkedom";
import type { PageData } from "./types";

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
