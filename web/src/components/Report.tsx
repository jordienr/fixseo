import { useState } from "react";
import type { ScanResult } from "../App";
import {
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ClipboardCopy,
  Check,
  CircleCheck,
  CircleX,
  Globe,
  Calendar,
  FileText,
  ClipboardIcon,
  BrainIcon,
  LightbulbIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gauge } from "@/components/ui/gauge";
import { MetricBlock, MetricGrid } from "@/components/ui/metric";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

interface Props {
  data: ScanResult;
}

type PageData = ScanResult["pages"][0];

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
  const seoFields: {
    label: string;
    value: string | null | undefined;
    missing?: string;
  }[] = [
    { label: "Title", value: page.title, missing: "Missing <title> tag" },
    {
      label: "Meta Description",
      value: page.metaDescription,
      missing: "Missing meta description",
    },
    { label: "H1", value: page.h1, missing: "Missing H1 heading" },
    {
      label: "Canonical",
      value: page.canonical,
      missing: "Missing canonical URL",
    },
    {
      label: "Robots Meta",
      value: page.robotsMeta || "index",
      missing: undefined,
    },
    {
      label: "OG Title",
      value: page.ogTitle,
      missing: "Missing Open Graph title",
    },
    {
      label: "OG Description",
      value: page.ogDescription,
      missing: "Missing Open Graph description",
    },
    {
      label: "OG Image",
      value: page.ogImage,
      missing: "Missing Open Graph image",
    },
    {
      label: "Twitter Card",
      value: page.twitterCard,
      missing: "Missing Twitter Card",
    },
    {
      label: "JSON-LD",
      value: page.jsonLd ? `${page.jsonLd.length} schema(s)` : null,
      missing: "No structured data",
    },
    {
      label: "Images",
      value: `${page.imagesWithAlt}/${page.imagesTotal} have alt text`,
      missing:
        page.imagesTotal > 0 && page.imagesWithAlt === 0
          ? "All images missing alt text"
          : undefined,
    },
    { label: "H2 Headings", value: `${page.h2Count}`, missing: undefined },
    {
      label: "Hreflang",
      value: page.hreflangs ? `${page.hreflangs.length} languages` : null,
      missing: "Missing hreflang tags",
    },
  ];

  const missingCount = seoFields.filter((f) => f.missing && !f.value).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Page Details</h2>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {getUrlPath(page.url)}
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Open Graph Preview
              </h3>
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
                  <div className="bg-muted p-8 text-center text-muted-foreground">
                    {page.ogImage}
                  </div>
                )}
                <div className="p-3 bg-muted">
                  <div className="font-semibold">
                    {page.ogTitle || page.title || "No Title"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {page.ogDescription ||
                      page.metaDescription ||
                      "No description"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {seoFields.map((field) => (
              <div
                key={field.label}
                className="flex border-b border-border pb-2"
              >
                <div className="w-40 flex-shrink-0 text-sm text-muted-foreground">
                  {field.label}
                </div>
                <div className="flex-1 text-sm">
                  {field.value ? (
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">
                      {field.value}
                    </span>
                  ) : field.missing ? (
                    <span className="text-destructive">{field.missing}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [checkedIssues, setCheckedIssues] = useState<Set<number>>(new Set());
  const { scanned, summary, groupedIssues, pages } = data;

  const score =
    scanned.score ??
    Math.max(
      0,
      100 - (summary.high * 10 + summary.medium * 5 + summary.low * 2),
    );

  function getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const handleCopy = async (
    issue: ScanResult["groupedIssues"][0],
    idx: number,
  ) => {
    const prompt = generateFixPrompt(issue, scanned.startUrl);
    await navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleIssue = (idx: number) => {
    const newChecked = new Set(checkedIssues);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
    } else {
      newChecked.add(idx);
    }
    setCheckedIssues(newChecked);
  };

  // Group issues by severity
  const issuesBySeverity = {
    high: groupedIssues.filter((i) => i.severity === "high"),
    medium: groupedIssues.filter((i) => i.severity === "medium"),
    low: groupedIssues.filter((i) => i.severity === "low"),
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header with circular score */}
        <header className="mb-8">
          <div className="flex items-center gap-8">
            <Gauge value={score} size={100} strokeWidth={12} />
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-medium text-foreground">
                  {getDomain(scanned.startUrl)}
                </h1>
                <ThemeToggle />
              </div>
              <div className="text-muted-foreground mb-1">
                {scanned.pagesScanned} pages scanned
              </div>
              <div className="text-muted-foreground">
                {new Date(scanned.scannedAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <Tabs
          defaultValue="issues"
          className="bg-card border border-border overflow-hidden mb-8"
        >
          <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0">
            <TabsTrigger
              value="issues"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground font-semibold"
            >
              Issues
            </TabsTrigger>
            <TabsTrigger
              value="pages"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground font-semibold"
            >
              Pages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            {/* Severity count boxes */}
            <div className="grid grid-cols-3 border-b py-3">
              <MetricBlock
                label="High"
                value={summary.high}
                className="border-destructive"
              />
              <MetricBlock
                label="Medium"
                value={summary.medium}
                className="border-amber-500"
              />
              <MetricBlock
                label="Low"
                value={summary.low}
                className="border-green-500"
              />
            </div>
            <div className="">
              {/* Issues grouped by severity */}
              {groupedIssues.length === 0 ? (
                <div className="text-center py-12 text-green-600 text-lg flex items-center justify-center gap-2">
                  <CheckCircle size={24} /> No issues found!
                </div>
              ) : (
                <div className="space-y-4 divide-y">
                  {(["high", "medium", "low"] as const).map((severity) => {
                    const severityIssues = issuesBySeverity[severity];
                    if (severityIssues.length === 0) return null;

                    return (
                      <div className="" key={severity}>
                        <h2 className="font-medium text-foreground p-4 border-b capitalize">
                          {severity} ({severityIssues.length})
                        </h2>
                        <div className="">
                          {severityIssues.map((issue, idx) => {
                            const globalIdx = groupedIssues.indexOf(issue);
                            return (
                              <div
                                key={globalIdx}
                                className="border-b border-border px-4 py-3"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className=" text-foreground mb-2">
                                      {issue.message}
                                    </h3>

                                    <div className="mb-2">
                                      <TooltipProvider>
                                        <Tooltip delayDuration={300}>
                                          <TooltipTrigger>
                                            <div className="text-sm  text-muted-foreground mb-1 underline decoration-dashed">
                                              {issue.urls.length} affected page
                                              {issue.urls.length > 1 ? "s" : ""}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {issue.urls.map((url, urlIdx) => (
                                              <a
                                                key={urlIdx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-sm  hover:underline"
                                              >
                                                {getUrlPath(url)}
                                              </a>
                                            ))}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      {issue.recommendation && (
                                        <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-xl flex items-start gap-2">
                                          <Lightbulb
                                            size={16}
                                            className="mt-0.5 flex-shrink-0"
                                          />
                                          {issue.recommendation}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-shrink-0"
                                    onClick={() => handleCopy(issue, globalIdx)}
                                  >
                                    <LightbulbIcon />
                                    Copy prompt
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      URL
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      H1
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      OG
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      JSON-LD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedPage(page)}
                    >
                      <td className="py-3 px-4">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getUrlPath(page.url)}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            page.status >= 400
                              ? "text-destructive font-semibold"
                              : "text-green-600"
                          }
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate">
                        {page.title || (
                          <span className="text-destructive">Missing</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate">
                        {page.metaDescription || (
                          <span className="text-destructive">Missing</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate">
                        {page.h1 || (
                          <span className="text-destructive">Missing</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {page.ogTitle ? (
                          <CircleCheck
                            className="text-green-600 mx-auto"
                            size={18}
                          />
                        ) : (
                          <CircleX
                            className="text-destructive mx-auto"
                            size={18}
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {page.jsonLd && page.jsonLd.length > 0 ? (
                          <CircleCheck
                            className="text-green-600 mx-auto"
                            size={18}
                          />
                        ) : (
                          <CircleX
                            className="text-destructive mx-auto"
                            size={18}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
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
