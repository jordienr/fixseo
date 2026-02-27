import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'

let reportData: unknown = null
const distPath = join(dirname(fileURLToPath(import.meta.url)), 'dist')
const demoDataPath = join(dirname(fileURLToPath(import.meta.url)), 'demo.json')

function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html'
  if (path.endsWith('.js')) return 'application/javascript'
  if (path.endsWith('.css')) return 'text/css'
  if (path.endsWith('.json')) return 'application/json'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  return 'text/plain'
}

export async function startServer(port = 5354): Promise<{ url: string; setReportData: (data: unknown) => void }> {
  console.log(`\n🚀 Server running at http://localhost:${port}\n`);
  
  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url)
      
      if (url.pathname === '/api/report') {
        if (req.method === 'GET') {
          if (reportData) {
            return new Response(JSON.stringify(reportData), {
              headers: { 'Content-Type': 'application/json' }
            })
          }
          if (existsSync(demoDataPath)) {
            const demo = JSON.parse(readFileSync(demoDataPath, 'utf-8'))
            return new Response(JSON.stringify(demo), {
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return new Response(JSON.stringify({ error: 'No report data. Run fixseo with --serve to generate a report, or add demo.json to web/ folder.' }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        if (req.method === 'POST') {
          const body = await req.text()
          try {
            reportData = JSON.parse(body)
            return new Response(JSON.stringify({ success: true }), {
              headers: { 'Content-Type': 'application/json' }
            })
          } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }
      }

      let filePath = url.pathname === '/' ? '/index.html' : url.pathname
      const fullPath = join(distPath, filePath)
      
      if (existsSync(fullPath)) {
        return new Response(readFileSync(fullPath), {
          headers: { 'Content-Type': getContentType(fullPath) }
        })
      }
      
      return new Response(readFileSync(join(distPath, 'index.html')), {
        headers: { 'Content-Type': 'text/html' }
      })
    },
  })

  return {
    url: `http://localhost:${server.port}`,
    setReportData: (data: unknown) => { reportData = data }
  }
}
