export default ({ env }) => {
  // Configuración base
  const config: any = {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS'),
    },
  };

  // Si estamos en Codespaces, configurar URL pública
  if (env('CODESPACE_NAME')) {
    const codespace = env('CODESPACE_NAME');
    const domain = env('GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN');
    config.url = `https://${codespace}-1337.${domain}`;
  }

  return config;
};
