import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { elm } from 'vite.elm'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig(({ command }) => ({
  plugins: [
    elm({ mode: command === 'build' ? 'optimize' : 'debug', fallback: 'companion' }),
    tailwindcss(),
    {
      name: 'save-post-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-post' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const post = JSON.parse(body);
                const articlesDir = path.resolve(process.cwd(), 'blog/articles');
                if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir, { recursive: true });
                const filePath = path.join(articlesDir, `${post.id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                res.statusCode = 500;
                res.end(JSON.stringify({ error: message }));
              }
            });
          } else if (req.url?.startsWith('/api/upload-media') && req.method === 'POST') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filename = url.searchParams.get('filename');
            const folder = url.searchParams.get('folder');

            if (!filename || !folder) {
              res.statusCode = 400;
              res.end('Missing filename or folder');
              return;
            }

            const targetDir = path.resolve(process.cwd(), `blog/medias/${folder}`);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            const filePath = path.join(targetDir, filename);
            const fileStream = fs.createWriteStream(filePath);

            req.pipe(fileStream);

            fileStream.on('finish', () => {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, url: `/blog/medias/${folder}/${filename}` }));
            });

            fileStream.on('error', (err) => {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 8806,
    strictPort: true,
    host: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    }
  },
  preview: {
    allowedHosts: true,
  }
}))
