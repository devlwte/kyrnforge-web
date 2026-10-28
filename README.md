# kyrnforge-web

Sitio de [kyrnforge.dev](https://kyrnforge.dev): catálogo de creaciones, acortador de enlaces y KyrnForge Skins.

React + Vite + Tailwind, desplegado en Cloudflare Pages con funciones en `functions/` y datos en KV.

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/
deploy.bat       # compila y publica en Cloudflare Pages
```

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Portada y catálogo |
| `/app/:id` | Ficha de una creación (con versión prerenderizada en `functions/app/[id].js`) |
| `/links` | Acortador; los enlaces se sirven desde `functions/l/[slug].js` |
| `/skins` | KyrnForge Skins |
| `/acerca`, `/privacidad` | Páginas informativas |
| `/mod` | Panel de administración |

Los colores del tema claro y oscuro están en `src/index.css` como variables y se usan desde Tailwind (`bg-bg`, `text-muted`, `bg-accent`…).
