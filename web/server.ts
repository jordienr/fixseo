import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

let reportData: unknown = null;

const baseDir = dirname(fileURLToPath(import.meta.url));
const candidateDistPaths = [
  join(baseDir, "web-dist"),
  join(baseDir, "../web/dist"),
];
const demoDataPath = join(baseDir, "../web/demo.json");

function resolveDistPath(): string {
  for (const candidate of candidateDistPaths) {
    if (existsSync(join(candidate, "index.html"))) {
      return candidate;
    }
  }
  throw new Error(
    `Web report assets not found. Expected one of: ${candidateDistPaths.join(", ")}`,
  );
}

function getContentType(path: string): string {
  const ext = extname(path);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".ico") return "image/x-icon";
  return "application/octet-stream";
}

export async function startServer(
  port = 5354,
): Promise<{ url: string; setReportData: (data: unknown) => void }> {
  const distPath = resolveDistPath();

  const server = createServer((req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");

    if (requestUrl.pathname === "/api/report") {
      if (req.method === "GET") {
        if (reportData) {
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(reportData));
          return;
        }
        if (existsSync(demoDataPath)) {
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(readFileSync(demoDataPath, "utf-8"));
          return;
        }
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(
          JSON.stringify({
            error:
              "No report data. Run fixseo with --serve to generate a report, or add demo.json to web/ folder.",
          }),
        );
        return;
      }

      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            reportData = JSON.parse(body);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ success: true }));
          } catch {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: "Invalid JSON" }));
          }
        });
        return;
      }

      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const normalizedPath = normalize(decodeURIComponent(requestUrl.pathname));
    const filePath = normalizedPath === "/" ? "index.html" : normalizedPath.replace(/^\/+/, "");
    const fullPath = join(distPath, filePath);

    if (existsSync(fullPath)) {
      res.writeHead(200, { "Content-Type": getContentType(fullPath) });
      res.end(readFileSync(fullPath));
      return;
    }

    const indexPath = join(distPath, "index.html");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(indexPath));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });

  console.log(`\n🚀 Server running at http://localhost:${port}\n`);

  return {
    url: `http://localhost:${port}`,
    setReportData: (data: unknown) => {
      reportData = data;
    },
  };
}
