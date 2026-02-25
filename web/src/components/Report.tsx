import { useState } from 'react'
import type { ScanResult } from '../App'

interface Props {
  data: ScanResult
}

const severityConfig = {
  high: { color: 'bg-red-500', text: 'text-red-600', label: 'High' },
  medium: { color: 'bg-amber-500', text: 'text-amber-600', label: 'Medium' },
  low: { color: 'bg-blue-500', text: 'text-blue-600', label: 'Low' },
}

function getUrlPath(url: string): string {
  try {
    return new URL(url).pathname || '/'
  } catch {
    return url
  }
}

function generateFixPrompt(issue: ScanResult['groupedIssues'][0], baseUrl: string): string {
  const urlsList = issue.urls.slice(0, 10).map(url => `- ${url}`).join('\n')
  
  return `Fix this SEO issue on the website ${baseUrl}:

Issue: ${issue.message}
Severity: ${issue.severity}
${issue.recommendation ? `Recommendation: ${issue.recommendation}` : ''}

Affected URLs (${issue.count} total):
${urlsList}
${issue.urls.length > 10 ? `- ...and ${issue.urls.length - 10} more` : ''}

Please provide the specific code changes needed to fix this issue.`
}

export default function Report({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'issues' | 'pages'>('issues')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const { scanned, summary, groupedIssues, pages } = data

  const handleCopy = async (issue: ScanResult['groupedIssues'][0], idx: number) => {
    const prompt = generateFixPrompt(issue, scanned.startUrl)
    await navigator.clipboard.writeText(prompt)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">🔍 SEO Scan Report</h1>
          <p className="text-slate-600">
            Scanned <strong>{scanned.pagesScanned}</strong> pages from{' '}
            <a href={scanned.startUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {scanned.startUrl}
            </a>
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(scanned.scannedAt).toLocaleString()}
            {scanned.pagesScanned >= scanned.maxPages && (
              <span className="ml-2 text-amber-600">⚠️ Reached max pages limit ({scanned.maxPages})</span>
            )}
          </p>
        </header>

        <section className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center border-t-4 border-red-500">
            <div className="text-4xl font-bold text-red-600">{summary.high}</div>
            <div className="text-slate-500 text-sm uppercase tracking-wide mt-1">High Priority</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center border-t-4 border-amber-500">
            <div className="text-4xl font-bold text-amber-600">{summary.medium}</div>
            <div className="text-slate-500 text-sm uppercase tracking-wide mt-1">Medium Priority</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center border-t-4 border-blue-500">
            <div className="text-4xl font-bold text-blue-600">{summary.low}</div>
            <div className="text-slate-500 text-sm uppercase tracking-wide mt-1">Low Priority</div>
          </div>
        </section>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'issues'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Issues ({groupedIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'pages'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Pages ({pages.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'issues' ? (
              groupedIssues.length === 0 ? (
                <div className="text-center py-12 text-green-600 text-lg">✅ No issues found!</div>
              ) : (
                <div className="space-y-6">
                  {groupedIssues.map((issue, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold uppercase ${
                            severityConfig[issue.severity].color
                          }`}
                        >
                          {severityConfig[issue.severity].label}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{issue.message}</h3>
                          <p className="text-slate-500 text-sm mt-1">
                            Affects <strong>{issue.count}</strong> page{issue.count !== 1 ? 's' : ''}
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
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {copiedIdx === idx ? '✓ Copied' : '📋 Fix Prompt'}
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
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">URL</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Title</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Description</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">H1</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-600">OG</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-600">JSON-LD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2">
                          <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {getUrlPath(page.url)}
                          </a>
                        </td>
                        <td className="py-2 px-2">
                          <span className={page.status >= 400 ? 'text-red-600' : 'text-green-600'}>
                            {page.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {page.title || <span className="text-red-500">Missing</span>}
                        </td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {page.metaDescription || <span className="text-red-500">Missing</span>}
                        </td>
                        <td className="py-2 px-2 max-w-[150px] truncate">
                          {page.h1 || <span className="text-red-500">Missing</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {page.ogTitle ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {page.jsonLd ? (
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
    </div>
  )
}
