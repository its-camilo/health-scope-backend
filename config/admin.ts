export default ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  app: {
    keys: env.array("APP_KEYS"),
  },
  url: env("PUBLIC_URL", "https://health-scope-backend-1337.app.github.dev"),
  serveAdminPanel: true,
});
