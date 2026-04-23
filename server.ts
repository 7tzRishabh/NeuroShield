import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as pdfParse from "pdf-parse";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for large files (e.g. PDFs)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API routes
  app.post("/api/codeshield-scan", async (req, res) => {
    try {
      let { code, isPdf } = req.body;
      
      if (isPdf && code) {
        try {
          // Expects a base64 data URL: data:application/pdf;base64,.....
          const base64Data = code.includes(',') ? code.split(',')[1] : code;
          const buffer = Buffer.from(base64Data, 'base64');
          // Support CommonJS default export resolution for pdf-parse
          const parser = (pdfParse as any).default || pdfParse;
          const pdfData = await parser(buffer);
          code = pdfData.text;
        } catch (err) {
          console.error("PDF Parse error:", err);
          return res.status(500).json({ error: "Failed to parse PDF document." });
        }
      }

      if (typeof code !== 'string') {
        return res.status(400).json({ error: "Code input must be a string." });
      }

      let sanitized = code;
      let threats = 0;
      
      const patterns = [
        // AWS
        { regex: /(AKIA[0-9A-Z]{16})/g, replace: "[REDACTED]" },
        // GCP
        { regex: /(AIza[0-9A-Za-z-_]{35})/g, replace: "[REDACTED]" },
        // OpenAI
        { regex: /(sk-[A-Za-z0-9_-]{48})/g, replace: "[REDACTED]" },
        // GitHub
        { regex: /(ghp_[0-9a-zA-Z]{36})/g, replace: "[REDACTED]" },
        // JWT
        { regex: /(ey[a-zA-Z0-9_-]+\.ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g, replace: "[REDACTED]" },
        // Private Key
        { regex: /(-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----)/g, replace: "[REDACTED]" },
        // URL Creds
        { regex: /([a-zA-Z]+:\/\/[^:]+:)(.+?)(@)/g, replace: "$1[REDACTED]$3" },
        // Bearer Token
        { regex: /(Bearer\s+)[A-Za-z0-9\-._~+/]+/ig, replace: "$1[REDACTED]" },
        // Generic Passwords/Secrets
        { regex: /((?:password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*['"]?)([^'"\n\r\s]{8,})(['"]?)/gi, replace: "$1[REDACTED]$3"}
      ];

      patterns.forEach(({ regex, replace }) => {
        sanitized = sanitized.replace(regex, (...args) => {
          threats++;
          if (replace.includes('$1')) {
            let res = replace;
            res = res.replace('$1', args[1] || '');
            res = res.replace('$2', args[2] || '');
            res = res.replace('$3', args[3] || '');
            return res;
          }
          return replace;
        });
      });

      res.json({
        summary: threats > 0 
          ? `Found ${threats} potential secret(s)/credential(s).`
          : "No sensitive data or secrets detected. Output is clean.",
        threats,
        sanitized
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "An unexpected error occurred during scanning." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
