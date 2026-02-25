import { describe, it, expect } from "vitest";
import { createEmptyPageData, parsePageHtml } from "./parser";

describe("createEmptyPageData", () => {
  it("should create empty page data with correct values", () => {
    const page = createEmptyPageData(
      "https://example.com",
      200,
      "text/html",
      "max-age=3600",
    );
    expect(page.url).toBe("https://example.com");
    expect(page.status).toBe(200);
    expect(page.contentType).toBe("text/html");
    expect(page.cacheControl).toBe("max-age=3600");
    expect(page.title).toBeNull();
    expect(page.metaDescription).toBeNull();
    expect(page.imagesTotal).toBe(0);
  });
});

describe("parsePageHtml", () => {
  const validHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
      <meta name="description" content="Test description">
      <link rel="canonical" href="https://example.com/page">
      <meta property="og:title" content="OG Title">
      <meta property="og:description" content="OG Description">
      <meta property="og:image" content="https://example.com/image.jpg">
      <meta name="twitter:card" content="summary_large_image">
      <script type="application/ld+json">{"@type": "WebPage"}</script>
    </head>
    <body>
      <h1>Main Heading</h1>
      <h2>Subheading 1</h2>
      <h2>Subheading 2</h2>
      <img src="img1.jpg" alt="Image 1">
      <img src="img2.jpg">
      <a href="/page1">Link 1</a>
      <a href="/page2">Link 2</a>
      <link rel="alternate" hreflang="en" href="https://example.com/page">
      <link rel="alternate" hreflang="es" href="https://example.com/page-es">
    </body>
    </html>
  `;

  it("should parse valid HTML correctly", () => {
    const page = parsePageHtml(validHtml, "https://example.com");
    expect(page).not.toBeNull();
    expect(page?.title).toBe("Test Page");
    expect(page?.metaDescription).toBe("Test description");
    expect(page?.canonical).toBe("https://example.com/page");
    expect(page?.h1).toBe("Main Heading");
    expect(page?.ogTitle).toBe("OG Title");
    expect(page?.ogDescription).toBe("OG Description");
    expect(page?.ogImage).toBe("https://example.com/image.jpg");
    expect(page?.twitterCard).toBe("summary_large_image");
    expect(page?.jsonLd).toHaveLength(1);
    expect(page?.imagesTotal).toBe(2);
    expect(page?.imagesWithAlt).toBe(1);
    expect(page?.h2Count).toBe(2);
    expect(page?.hreflangs).toEqual(["en", "es"]);
  });

  it("should parse HTML even if minimal", () => {
    const page = parsePageHtml(
      "<html><head><title>Test</title></head><body></body></html>",
      "https://example.com",
    );
    expect(page).not.toBeNull();
    expect(page?.title).toBe("Test");
  });

  it("should handle missing meta tags gracefully", () => {
    const minimalHtml =
      "<!DOCTYPE html><html><head><title>Minimal</title></head><body></body></html>";
    const page = parsePageHtml(minimalHtml, "https://example.com");
    expect(page).not.toBeNull();
    expect(page?.title).toBe("Minimal");
    expect(page?.metaDescription).toBeNull();
    expect(page?.canonical).toBeNull();
  });
});
