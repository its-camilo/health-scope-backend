export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env(
    "PUBLIC_URL",
    `https://${env("CODESPACE_NAME")}-${env("PORT", 1337)}.app.github.dev`
  ),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: false,
  },
});
