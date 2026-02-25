import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { type ViteDevServer } from 'vite'

let reportData: unknown = null

export const setReportData = (data: unknown) => {
  reportData = data
}

export const getReportData = () => reportData

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-handler',
      configureServer(server: ViteDevServer) {
        server.middlewares.use('/api/report', async (req, res) => {
          if (req.method === 'GET') {
            if (reportData) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(reportData))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'No report data' }))
            }
          } else if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                reportData = JSON.parse(body)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
          }
        })
      },
    },
  ],
  server: {
    port: 5354,
    strictPort: true,
  },
})
