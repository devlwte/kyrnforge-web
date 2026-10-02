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

        const appsPublicPath = path.resolve(__dirname, 'public/data/apps.json');
        const appsSrcPath = path.resolve(__dirname, 'src/data/apps.json');
        const projectsPublicPath = path.resolve(__dirname, 'public/data/projects.json');
        const projectsSrcPath = path.resolve(__dirname, 'src/data/projects.json');
        const settingsPublicPath = path.resolve(__dirname, 'public/data/settings.json');
        const settingsSrcPath = path.resolve(__dirname, 'src/data/settings.json');

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

        // --- 1. /api/v1/apps (Manage carousel apps in JSON) ---
        if (url === '/api/v1/apps' || url.startsWith('/api/v1/apps?')) {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(appsPublicPath)) {
                const data = fs.readFileSync(appsPublicPath, 'utf8');
                return res.end(data);
              }
            } catch (e) {
              // fallback
            }
            return res.end(JSON.stringify({ status: 'ok', source: 'local-json' }));
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
              return res.end(JSON.stringify({ success: false, error: 'Se esperaba un array de apps en formato JSON.' }));
            }

            // Write to both public/data/apps.json and src/data/apps.json on disk!
            const jsonStr = JSON.stringify(apps, null, 2);
            fs.writeFileSync(appsPublicPath, jsonStr, 'utf8');
            fs.writeFileSync(appsSrcPath, jsonStr, 'utf8');

            return res.end(JSON.stringify({
              success: true,
              message: 'Aplicaciones guardadas directamente en apps.json del proyecto.',
              file: 'public/data/apps.json',
              count: apps.length,
              timestamp: new Date().toISOString()
            }));
          }
        }

        // --- 2. /api/v1/content (Full site content: apps.json, projects.json, settings.json) ---
        if (url === '/api/v1/content' || url.startsWith('/api/v1/content?')) {
          if (req.method === 'GET') {
            try {
              const apps = fs.existsSync(appsPublicPath) ? JSON.parse(fs.readFileSync(appsPublicPath, 'utf8')) : [];
              const projects = fs.existsSync(projectsPublicPath) ? JSON.parse(fs.readFileSync(projectsPublicPath, 'utf8')) : [];
              const siteSettings = fs.existsSync(settingsPublicPath) ? JSON.parse(fs.readFileSync(settingsPublicPath, 'utf8')) : {};
              return res.end(JSON.stringify({ availableApps: apps, projects, siteSettings }, null, 2));
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

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
              const jsonStr = JSON.stringify(body.availableApps, null, 2);
              fs.writeFileSync(appsPublicPath, jsonStr, 'utf8');
              fs.writeFileSync(appsSrcPath, jsonStr, 'utf8');
            }

            // Save projects if provided
            if (Array.isArray(body.projects)) {
              const jsonStr = JSON.stringify(body.projects, null, 2);
              fs.writeFileSync(projectsPublicPath, jsonStr, 'utf8');
              fs.writeFileSync(projectsSrcPath, jsonStr, 'utf8');
            }

            // Save siteSettings if provided
            if (body.siteSettings && typeof body.siteSettings === 'object') {
              const jsonStr = JSON.stringify(body.siteSettings, null, 2);
              fs.writeFileSync(settingsPublicPath, jsonStr, 'utf8');
              fs.writeFileSync(settingsSrcPath, jsonStr, 'utf8');
            }

            return res.end(JSON.stringify({
              success: true,
              message: 'Contenido completo guardado en los archivos reales JSON del servidor (public/data/).',
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
