import { useState } from "react";
import type { ScanResult } from "../App";

interface Props {
  data: ScanResult;
}

type PageData = ScanResult["pages"][0];

const severityConfig = {
  high: { color: "bg-red-500", text: "text-red-600", label: "High" },
  medium: { color: "bg-amber-500", text: "text-amber-600", label: "Medium" },
  low: { color: "bg-blue-500", text: "text-blue-600", label: "Low" },
};

function getUrlPath(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

function PageDetailModal({
  page,
  onClose,
}: {
  page: PageData;
  onClose: () => void;
}) {
  const seoFields: { label: string; value: string | null | undefined; missing?: string }[] = [
    { label: "Title", value: page.title, missing: "Missing <title> tag" },
    { label: "Meta Description", value: page.metaDescription, missing: "Missing meta description" },
    { label: "H1", value: page.h1, missing: "Missing H1 heading" },
    { label: "Canonical", value: page.canonical, missing: "Missing canonical URL" },
    { label: "Robots Meta", value: page.robotsMeta || "index", missing: undefined },
    { label: "OG Title", value: page.ogTitle, missing: "Missing Open Graph title" },
    { label: "OG Description", value: page.ogDescription, missing: "Missing Open Graph description" },
    { label: "OG Image", value: page.ogImage, missing: "Missing Open Graph image" },
    { label: "Twitter Card", value: page.twitterCard, missing: "Missing Twitter Card" },
    { label: "JSON-LD", value: page.jsonLd ? `${page.jsonLd.length} schema(s)` : null, missing: "No structured data" },
    { label: "Images", value: `${page.imagesWithAlt}/${page.imagesTotal} have alt text`, missing: page.imagesTotal > 0 && page.imagesWithAlt === 0 ? "All images missing alt text" : undefined },
    { label: "H2 Headings", value: `${page.h2Count}`, missing: undefined },
    { label: "Hreflang", value: page.hreflangs ? `${page.hreflangs.length} languages` : null, missing: "Missing hreflang tags" },
  ];

  const missingCount = seoFields.filter(
    (f) => f.missing && !f.value
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Page Details</h2>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {getUrlPath(page.url)}
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                page.status < 400 ? "bg-green-500" : "bg-red-500"
              }`}
            >
              HTTP {page.status}
            </span>
            {page.robotsBlocked && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                Blocked by robots.txt
              </span>
            )}
            {page.robotsMeta?.toLowerCase().includes("noindex") && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                noindex
              </span>
            )}
            {missingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                {missingCount} missing
              </span>
            )}
          </div>

          {page.ogImage && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Open Graph Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                {page.ogImage.startsWith("http") ? (
                  <img
                    src={page.ogImage}
                    alt="OG Preview"
                    className="w-full max-h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="bg-slate-100 p-8 text-center text-slate-500">
                    {page.ogImage}
                  </div>
                )}
                <div className="p-3 bg-slate-50">
                  <div className="font-semibold text-slate-800">{page.ogTitle || page.title || "No Title"}</div>
                  <div className="text-sm text-slate-600">{page.ogDescription || page.metaDescription || "No description"}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {seoFields.map((field) => (
              <div key={field.label} className="flex border-b pb-2">
                <div className="w-40 flex-shrink-0 text-sm text-slate-500">
                  {field.label}
                </div>
                <div className="flex-1 text-sm text-slate-800">
                  {field.value ? (
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {field.value}
                    </span>
                  ) : field.missing ? (
                    <span className="text-red-500">{field.missing}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateFixPrompt(
  issue: ScanResult["groupedIssues"][0],
  baseUrl: string,
): string {
  const urlsList = issue.urls
    .slice(0, 10)
    .map((url) => `- ${url}`)
    .join("\n");

  return `Fix this SEO issue on the website ${baseUrl}:

Issue: ${issue.message}
Severity: ${issue.severity}
${issue.recommendation ? `Recommendation: ${issue.recommendation}` : ""}

Affected URLs (${issue.count} total):
${urlsList}
${issue.urls.length > 10 ? `- ...and ${issue.urls.length - 10} more` : ""}

Please provide the specific code changes needed to fix this issue.`;
}

export default function Report({ data }: Props) {
  const [activeTab, setActiveTab] = useState<"issues" | "pages">("issues");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const { scanned, summary, groupedIssues, pages } = data;

  const handleCopy = async (
    issue: ScanResult["groupedIssues"][0],
    idx: number,
  ) => {
    const prompt = generateFixPrompt(issue, scanned.startUrl);
    await navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen text-white bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">FIXSEO</h1>
          <p className="text-slate-300">
            Scanned <strong>{scanned.pagesScanned}</strong> pages from{" "}
            <a
              href={scanned.startUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {scanned.startUrl}
            </a>
          </p>
          <p className="text-slate-300 text-sm mt-1">
            {new Date(scanned.scannedAt).toLocaleString()}
            {scanned.pagesScanned >= scanned.maxPages && (
              <span className="ml-2 text-amber-600">
                ⚠️ Reached max pages limit ({scanned.maxPages})
              </span>
            )}
          </p>
        </header>

        <section className="grid grid-cols-3 gap-4 mb-8 border border-slate-700 divide-x divide-slate-700">
          <div className="p-6 text-center">
            <div className="text-2xl">{summary.high}</div>
            <div className="text-slate-400 text-sm uppercase tracking-wide mt-1">
              High Priority
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="text-2xl">{summary.medium}</div>
            <div className="text-slate-400 text-sm uppercase tracking-wide mt-1">
              Medium Priority
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="text-2xl">{summary.low}</div>
            <div className="text-slate-400 text-sm uppercase tracking-wide mt-1">
              Low Priority
            </div>
          </div>
        </section>

        <div className="border border-slate-700 overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "issues"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              Issues ({groupedIssues.length})
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "pages"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              Pages ({pages.length})
            </button>
          </div>

          <div className="">
            {activeTab === "issues" ? (
              groupedIssues.length === 0 ? (
                <div className="text-center py-12 text-green-600 text-lg">
                  ✅ No issues found!
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {groupedIssues.map((issue, idx) => (
                    <div key={idx} className="p-5">
                      <div className="flex items-start gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold uppercase ${
                            severityConfig[issue.severity].color
                          }`}
                        >
                          {severityConfig[issue.severity].label}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-100">
                            {issue.message}
                          </h3>
                          <p className="text-slate-300 text-sm mt-1">
                            Affects <strong>{issue.count}</strong> page
                            {issue.count !== 1 ? "s" : ""}
                          </p>
                          {issue.recommendation && (
                            <p className="text-slate-600 text-sm mt-2 bg-slate-50 p-2 rounded">
                              💡 {issue.recommendation}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {issue.urls.slice(0, 5).map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {getUrlPath(url)}
                              </a>
                            ))}
                            {issue.urls.length > 5 && (
                              <span className="text-sm text-slate-500">
                                ...and {issue.urls.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(issue, idx)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                            copiedIdx === idx
                              ? "bg-green-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {copiedIdx === idx ? "✓ Copied" : "📋 Fix Prompt"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">
                        URL
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">
                        Title
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">
                        Description
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">
                        H1
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-600">
                        OG
                      </th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-600">
                        JSON-LD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedPage(page)}
                      >
                        <td className="py-2 px-2">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getUrlPath(page.url)}
                          </a>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={
                              page.status >= 400
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {page.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {page.title || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {page.metaDescription || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-2 max-w-[150px] truncate">
                          {page.h1 || (
                            <span className="text-red-500">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {page.ogTitle ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {page.jsonLd && page.jsonLd.length > 0 ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPage && (
        <PageDetailModal
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
        />
      )}
    </div>
  );
}
