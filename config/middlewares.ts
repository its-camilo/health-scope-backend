// Ruta del archivo: backend/config/middlewares.ts

module.exports = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "http:", "https:", "ws:", "wss:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "res.cloudinary.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      // =================================================================
      // ESTA ES LA CONFIGURACIÓN CORREGIDA Y ROBUSTA
      // =================================================================
      // Lee la variable FRONTEND_URL de tu .env.
      // El .split(',') es una buena práctica que te permite añadir
      // múltiples URLs en el futuro, separadas por comas.
      origin: (ctx) => {
  const origin = ctx.request.header.origin;
  if (!origin) return '*';
  if (typeof origin !== 'string') return false;
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return origin;
  if (origin.includes('.scf.usercontent.goog')) return origin;
  if (origin.includes('localhost')) return origin;
  return false;
},
      // =================================================================
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];