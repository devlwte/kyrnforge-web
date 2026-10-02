import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom local API Middleware for Vite dev server:
// Intercepts /api/v1 calls and writes directly to local source files (src/data/)
function kyrnforgeApiPlugin() {
  return {
    name: 'kyrnforge-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
          res.statusCode = 204;
          return res.end();
        }

        // Only intercept /api/v1 requests
        if (!url.startsWith('/api/v1/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const defaultAppsPath = path.resolve(__dirname, 'src/data/defaultApps.js');
        const defaultSiteDataPath = path.resolve(__dirname, 'src/data/defaultSiteData.js');

        const readBody = () => new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });

        const checkAuth = () => {
          const auth = req.headers['authorization'] || req.headers['x-admin-key'] || '';
          const token = auth.replace('Bearer ', '').trim();
          return token === 'kyrnforge2026' || token === 'admin';
        };

        // --- 1. /api/v1/apps (Manage carousel apps) ---
        if (url === '/api/v1/apps' || url.startsWith('/api/v1/apps?')) {
          if (req.method === 'GET') {
            try {
              const fileContent = fs.readFileSync(defaultAppsPath, 'utf8');
              const jsonMatch = fileContent.match(/export const initialAvailableApps = (\[[\s\S]*?\]);/);
              if (jsonMatch) {
                return res.end(jsonMatch[1]);
              }
            } catch (e) {
              // fallback
            }
            return res.end(JSON.stringify({ status: 'ok', source: 'local-file' }));
          }

          if (req.method === 'POST') {
            if (!checkAuth()) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'No autorizado. Clave incorrecta.' }));
            }

            const body = await readBody();
            const apps = Array.isArray(body) ? body : body?.apps;
            if (!Array.isArray(apps)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Se esperaba un array de apps.' }));
            }

            // Write to src/data/defaultApps.js on disk!
            const newContent = `// Default applications for the KyrnForge Downloads Carousel\nexport const initialAvailableApps = ${JSON.stringify(apps, null, 2)};\n`;
            fs.writeFileSync(defaultAppsPath, newContent, 'utf8');

            return res.end(JSON.stringify({
              success: true,
              message: 'Aplicaciones guardadas y aplicadas a los archivos del servidor local.',
              count: apps.length,
              timestamp: new Date().toISOString()
            }));
          }
        }

        // --- 2. /api/v1/content (Full site content: apps, projects, settings) ---
        if (url === '/api/v1/content' || url.startsWith('/api/v1/content?')) {
          if (req.method === 'POST') {
            if (!checkAuth()) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'No autorizado. Clave incorrecta.' }));
            }

            const body = await readBody();
            if (!body) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Payload JSON invalido.' }));
            }

            // Save apps if provided
            if (Array.isArray(body.availableApps)) {
              const newAppsContent = `// Default applications for the KyrnForge Downloads Carousel\nexport const initialAvailableApps = ${JSON.stringify(body.availableApps, null, 2)};\n`;
              fs.writeFileSync(defaultAppsPath, newAppsContent, 'utf8');
            }

            // Save projects and siteSettings if provided
            if (Array.isArray(body.projects) || body.siteSettings) {
              let existingProjects = [];
              let existingSettings = {};
              try {
                const siteDataContent = fs.readFileSync(defaultSiteDataPath, 'utf8');
                const pMatch = siteDataContent.match(/export const initialProjects = (\[[\s\S]*?\]);/);
                if (pMatch) existingProjects = JSON.parse(pMatch[1]);
                const sMatch = siteDataContent.match(/export const initialSiteSettings = (\{[\s\S]*?\});/);
                if (sMatch) existingSettings = JSON.parse(sMatch[1]);
              } catch (e) {
                // ignore
              }

              const finalProjects = body.projects || existingProjects;
              const finalSettings = body.siteSettings || existingSettings;

              const newSiteDataContent = `import { initialAvailableApps } from './defaultApps';\n\nexport { initialAvailableApps };\n\n// Initial projects for the KyrnForge Ecosystem catalog\nexport const initialProjects = ${JSON.stringify(finalProjects, null, 2)};\n\n// Initial Site Settings (Hero, Metrics, Footer)\nexport const initialSiteSettings = ${JSON.stringify(finalSettings, null, 2)};\n`;
              fs.writeFileSync(defaultSiteDataPath, newSiteDataContent, 'utf8');
            }

            return res.end(JSON.stringify({
              success: true,
              message: 'Contenido completo guardado en los archivos reales del servidor (src/data/).',
              timestamp: new Date().toISOString()
            }));
          }
        }

        // --- 3. /api/v1/status & /api/v1/health ---
        if (url.includes('/status')) {
          return res.end(JSON.stringify({
            status: "operational",
            service: "KyrnForge Core API (Local Dev Server)",
            version: "1.0.0",
            gateway: "Local Edge Serverless",
            timestamp: new Date().toISOString()
          }, null, 2));
        }

        if (url.includes('/health')) {
          return res.end(JSON.stringify({ status: "healthy", uptime: "100%" }));
        }

        return next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), kyrnforgeApiPlugin()],
});
