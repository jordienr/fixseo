import { describe, it, expect, beforeAll } from "vitest";
import { spawn } from "child_process";
import {
  normalizeUrl,
  sameOrigin,
  getDepth,
  createEmptyPageData,
  parsePageHtml,
  analyzePage,
  findDuplicateIssues,
  findBrokenCanonicalIssues,
  groupIssues,
  prioritizeIssues,
  installOpenCodeTool,
} from "./index";

describe("normalizeUrl", () => {
  it("should normalize a valid URL", () => {
    expect(normalizeUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeUrl("https://example.com/path")).toBe(
      "https://example.com/path",
    );
  });

  it("should return the input for invalid URLs", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
    expect(normalizeUrl("")).toBe("");
  });
});

describe("sameOrigin", () => {
  it("should return true for same origin URLs", () => {
    expect(
      sameOrigin("https://example.com/page1", "https://example.com/page2"),
    ).toBe(true);
  });

  it("should return false for different origin URLs", () => {
    expect(sameOrigin("https://example.com", "https://other.com")).toBe(false);
  });

  it("should return false for invalid URLs", () => {
    expect(sameOrigin("not-a-url", "https://example.com")).toBe(false);
  });
});

describe("getDepth", () => {
  it("should return correct depth for URLs", () => {
    expect(getDepth("https://example.com", "https://example.com")).toBe(0);
    expect(getDepth("https://example.com/a", "https://example.com")).toBe(1);
    expect(getDepth("https://example.com/a/b", "https://example.com")).toBe(2);
    expect(getDepth("https://example.com/a/b/c", "https://example.com")).toBe(
      3,
    );
  });

  it("should return 0 for invalid URLs", () => {
    expect(getDepth("not-a-url", "https://example.com")).toBe(0);
  });
});

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
    // JSDOM is forgiving and parses most HTML
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

describe("analyzePage", () => {
  it("should detect missing title", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: null,
      metaDescription: "Description",
      h1: "Heading",
      canonical: "https://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_title")).toBe(true);
  });

  it("should detect missing meta description", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: null,
      h1: "Heading",
      canonical: "https://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_meta_description")).toBe(
      true,
    );
  });

  it("should detect missing H1", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: null,
      canonical: "https://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_h1")).toBe(true);
  });

  it("should detect missing OG tags", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: "Heading",
      canonical: "https://example.com",
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      twitterCard: null,
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_og_title")).toBe(true);
    expect(issues.some((i) => i.code === "missing_og_description")).toBe(true);
    expect(issues.some((i) => i.code === "missing_og_image")).toBe(true);
    expect(issues.some((i) => i.code === "missing_twitter_card")).toBe(true);
  });

  it("should detect missing image alt text", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: "Heading",
      canonical: "https://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 2,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_image_alt")).toBe(true);
  });

  it("should detect missing JSON-LD", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: "Heading",
      canonical: "https://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: null,
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_json_ld")).toBe(true);
  });

  it("should detect noindex", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: "Heading",
      canonical: "https://example.com",
      robotsMeta: "noindex",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "noindex")).toBe(true);
  });

  it("should detect HTTP when HTTPS available", () => {
    const page: any = {
      url: "http://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Description",
      h1: "Heading",
      canonical: "http://example.com",
      ogTitle: "OG",
      ogDescription: "OG Desc",
      ogImage: "img.jpg",
      twitterCard: "summary",
      jsonLd: ["{}"],
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "http_not_https")).toBe(true);
  });
});

describe("findDuplicateIssues", () => {
  it("should detect duplicate titles", () => {
    const pages = [
      {
        url: "https://example.com/page1",
        title: "Same Title",
        metaDescription: "Desc 1",
        canonical: "url1",
      } as any,
      {
        url: "https://example.com/page2",
        title: "Same Title",
        metaDescription: "Desc 2",
        canonical: "url2",
      } as any,
      {
        url: "https://example.com/page3",
        title: "Unique Title",
        metaDescription: "Desc 3",
        canonical: "url3",
      } as any,
    ];
    const issues = findDuplicateIssues(pages);
    expect(issues.some((i) => i.code === "duplicate_title")).toBe(true);
  });

  it("should detect duplicate meta descriptions", () => {
    const pages = [
      {
        url: "https://example.com/page1",
        title: "Title 1",
        metaDescription: "Same Desc",
        canonical: "url1",
      } as any,
      {
        url: "https://example.com/page2",
        title: "Title 2",
        metaDescription: "Same Desc",
        canonical: "url2",
      } as any,
    ];
    const issues = findDuplicateIssues(pages);
    expect(issues.some((i) => i.code === "duplicate_meta_description")).toBe(
      true,
    );
  });

  it("should detect duplicate canonical URLs", () => {
    const pages = [
      {
        url: "https://example.com/page1",
        title: "Title 1",
        metaDescription: "Desc 1",
        canonical: "https://example.com/canonical",
      } as any,
      {
        url: "https://example.com/page2",
        title: "Title 2",
        metaDescription: "Desc 2",
        canonical: "https://example.com/canonical",
      } as any,
    ];
    const issues = findDuplicateIssues(pages);
    expect(issues.some((i) => i.code === "duplicate_canonical")).toBe(true);
  });
});

describe("findBrokenCanonicalIssues", () => {
  it("should detect broken canonical URLs", () => {
    const pages = [
      {
        url: "https://example.com/page1",
        canonical: "https://example.com/nonexistent",
      },
      {
        url: "https://example.com/page2",
        canonical: "https://example.com/page1",
      },
    ] as any;
    const issues = findBrokenCanonicalIssues(pages);
    expect(issues.some((i) => i.code === "broken_canonical")).toBe(true);
  });

  it("should not flag valid canonical URLs", () => {
    const pages = [
      {
        url: "https://example.com/page1",
        canonical: "https://example.com/page1",
      },
      {
        url: "https://example.com/page2",
        canonical: "https://example.com/page1",
      },
    ] as any;
    const issues = findBrokenCanonicalIssues(pages);
    expect(issues.some((i) => i.code === "broken_canonical")).toBe(false);
  });
});

describe("groupIssues", () => {
  it("should group issues by severity and code", () => {
    const issues = [
      {
        severity: "high",
        code: "missing_title",
        message: "Missing <title>",
        url: "https://example.com/1",
      },
      {
        severity: "high",
        code: "missing_title",
        message: "Missing <title>",
        url: "https://example.com/2",
      },
      {
        severity: "medium",
        code: "missing_h1",
        message: "Missing H1",
        url: "https://example.com/1",
      },
    ];
    const grouped = groupIssues(issues);
    expect(grouped).toHaveLength(2);
    const missingTitle = grouped.find((g) => g.code === "missing_title");
    expect(missingTitle?.count).toBe(2);
    expect(missingTitle?.urls).toHaveLength(2);
  });
});

describe("prioritizeIssues", () => {
  it("should sort issues by severity (high, medium, low)", () => {
    const issues = [
      {
        severity: "low",
        code: "low",
        message: "Low",
        url: "https://example.com",
      },
      {
        severity: "high",
        code: "high",
        message: "High",
        url: "https://example.com",
      },
      {
        severity: "medium",
        code: "medium",
        message: "Medium",
        url: "https://example.com",
      },
    ];
    const sorted = prioritizeIssues(issues);
    expect(sorted[0].severity).toBe("high");
    expect(sorted[1].severity).toBe("medium");
    expect(sorted[2].severity).toBe("low");
  });
});

describe("installOpenCodeTool", () => {
  it("should generate valid TypeScript code", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "fixseo-test-"));
    const originalCwd = process.cwd();
    
    try {
      process.chdir(tmpDir);
      await installOpenCodeTool();
      
      const toolPath = path.join(tmpDir, ".opencode/tools/fixseo.ts");
      const content = await fs.readFile(toolPath, "utf-8");
      
      // Verify key parts of the generated code exist
      expect(content).toContain('import { tool } from "@opencode-ai/plugin"');
      expect(content).toContain("export default tool(");
      expect(content).toContain("args.url");
      expect(content).toContain("fixseo");
      expect(content).toContain("--markdown");
      
      // Verify it's valid TypeScript by checking it compiles
      // We use bun build to check syntax (will fail if syntax is invalid)
      const proc = spawn("bun", ["build", toolPath, "--no-bundle", "--outfile=/dev/null"]);
      
      // Wait for the process to complete
      await new Promise<void>((resolve) => {
        proc.on("close", () => resolve());
        proc.on("error", () => resolve());
      });
      
      // Read stderr to check for syntax errors
      const stderr = await new Response(proc.stderr).text();
      expect(stderr).not.toContain("error:");
      expect(stderr).not.toContain("Expected");
      expect(stderr).not.toContain("Unterminated");
    } finally {
      process.chdir(originalCwd);
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
