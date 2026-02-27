import { useEffect, useState } from 'react'
import Report from './components/Report'
import demoData from '../demo.json'
import { Search, AlertTriangle } from 'lucide-react'

function initTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
}

initTheme()

export type ScanResult = {
  scanned: {
    startUrl: string
    pagesScanned: number
    maxPages: number
    scannedAt: string
    score?: number
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
          <Search className="w-10 h-10 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-amber-500" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return <Report data={data} />
}

export default App
