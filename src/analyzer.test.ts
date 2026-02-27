import { describe, it, expect } from "vitest";
import {
  analyzePage,
  findDuplicateIssues,
  findBrokenCanonicalIssues,
  groupIssues,
  prioritizeIssues,
} from "./analyzer";

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

  it("should detect title too short", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Short",
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
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "title_too_short")).toBe(true);
  });

  it("should detect title too long", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "This is a very long title that exceeds the recommended limit of 60 characters for SEO",
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
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "title_too_long")).toBe(true);
  });

  it("should detect description too short", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "Short description",
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
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "description_too_short")).toBe(true);
  });

  it("should detect description too long", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Title",
      metaDescription: "This is a very long meta description that exceeds the recommended limit of 160 characters which can lead to truncation in search engine results pages and reduced click-through rates from users",
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
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "description_too_long")).toBe(true);
  });

  it("should detect content too short", () => {
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
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 150,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "content_too_short")).toBe(true);
  });

  it("should detect missing lang attribute", () => {
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
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
      lang: null,
      appleTouchIcon: "icon.png",
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_lang")).toBe(true);
  });

  it("should detect missing apple touch icon", () => {
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
      imagesTotal: 0,
      imagesWithAlt: 0,
      hreflangs: ["en"],
      lang: "en",
      appleTouchIcon: null,
      wordCount: 500,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "missing_apple_touch_icon")).toBe(true);
  });

  it("should not flag good content length", () => {
    const page: any = {
      url: "https://example.com",
      status: 200,
      title: "Best SEO Services for Your Business Success Online",
      metaDescription: "This is a meta description that is just right at around 155 characters for optimal SEO performance in search results to attract more visitors to your site.",
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
      lang: "en",
      appleTouchIcon: "icon.png",
      wordCount: 400,
    };
    const issues = analyzePage(page, true);
    expect(issues.some((i) => i.code === "title_too_short")).toBe(false);
    expect(issues.some((i) => i.code === "title_too_long")).toBe(false);
    expect(issues.some((i) => i.code === "description_too_short")).toBe(false);
    expect(issues.some((i) => i.code === "description_too_long")).toBe(false);
    expect(issues.some((i) => i.code === "content_too_short")).toBe(false);
    expect(issues.some((i) => i.code === "missing_lang")).toBe(false);
    expect(issues.some((i) => i.code === "missing_apple_touch_icon")).toBe(false);
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
