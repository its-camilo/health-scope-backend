export default ({ env }) => {
  // Detectar URL de Codespaces automáticamente
  let url = env('URL') || env('STRAPI_ADMIN_BACKEND_URL');

  // Si estamos en Codespaces, construir la URL correcta
  if (env('CODESPACE_NAME')) {
    const codespace = env('CODESPACE_NAME');
    const domain = env('GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN');
    url = `https://${codespace}-1337.${domain}`;
  }

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    url: url,
  };
};
