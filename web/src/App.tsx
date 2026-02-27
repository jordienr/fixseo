import { useEffect, useState } from 'react'
import Report from './components/Report'
import demoData from '../demo.json'

export type ScanResult = {
  scanned: {
    startUrl: string
    pagesScanned: number
    maxPages: number
    scannedAt: string
  }
  summary: {
    high: number
    medium: number
    low: number
  }
  groupedIssues: {
    severity: 'high' | 'medium' | 'low'
    message: string
    count: number
    urls: string[]
    recommendation?: string
  }[]
  pages: {
    url: string
    status: number
    contentType?: string
    title: string | null
    metaDescription: string | null
    canonical: string | null
    h1: string | null
    robotsMeta: string | null
    xRobotsTag: string | null
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
    robotsBlocked: boolean
    isPagination: boolean
    isFeed: boolean
  }[]
}

function App() {
  const [data, setData] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV) {
      setData(demoData as ScanResult)
      setLoading(false)
      return
    }
    
    fetch('/api/report')
      .then(res => {
        if (!res.ok) throw new Error('No report data')
        return res.json()
      })
      .then(setData)
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return <Report data={data} />
}

export default App
