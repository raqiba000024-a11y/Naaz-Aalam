import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes.js';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Static SEO endpoints
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://aura-atelier.store/sitemap.xml\n');
  });

  app.get('/sitemap.xml', (_req, res) => {
    const products = db.getProducts();
    const categories = db.getCategories();
    const baseUrl = process.env.APP_URL || 'https://aura-atelier.store';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/shop</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    
    for (const cat of categories) {
      xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    for (const prod of products) {
      xml += `  <url><loc>${baseUrl}/product/${prod.slug}</loc><changefreq>daily</changefreq><priority>0.85</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.type('application/xml');
    res.send(xml);
  });

  // Mount API router
  app.use('/api', apiRouter);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ AURA Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
