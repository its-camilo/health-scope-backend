/**
 * Backend URLs Configuration
 *
 * Este archivo centraliza las URLs del backend para diferentes entornos.
 * Descomenta la URL que necesites usar según tu entorno actual.
 */

// ========================================
// CONFIGURACIÓN ACTIVA
// ========================================
// Cambia esta variable para seleccionar el entorno activo

const ACTIVE_ENVIRONMENT = 'codespaces'; // Opciones: 'local', 'codespaces', 'strapi-cloud'

// ========================================
// URLs POR ENTORNO
// ========================================

const BACKEND_URLS = {
  // Desarrollo Local
  local: {
    url: 'http://localhost:1337',
    description: 'Servidor local de desarrollo'
  },

  // GitHub Codespaces
  codespaces: {
    // Reemplaza YOUR-CODESPACE-NAME con el nombre de tu codespace
    // url: 'https://YOUR-CODESPACE-NAME-1337.app.github.dev',
    url: 'https://improved-space-system-x4x479r5wgqh659p-1337.app.github.dev/', // Completar cuando tengas el codespace activo
    description: 'GitHub Codespaces (actualiza con tu URL de codespace)'
  },

  // Strapi Cloud (Producción)
  'strapi-cloud': {
    // url: 'https://your-project-name.strapiapp.com',
    url: '', // Completar cuando despliegues a Strapi Cloud
    description: 'Strapi Cloud (actualiza con tu URL de producción)'
  }
};

// ========================================
// EXPORTACIÓN
// ========================================

const activeConfig = BACKEND_URLS[ACTIVE_ENVIRONMENT];

if (!activeConfig) {
  throw new Error(`Entorno "${ACTIVE_ENVIRONMENT}" no encontrado en la configuración`);
}

if (!activeConfig.url) {
  console.warn(`⚠️  ADVERTENCIA: La URL para el entorno "${ACTIVE_ENVIRONMENT}" está vacía. Por favor configúrala.`);
}

module.exports = {
  ACTIVE_ENVIRONMENT,
  BACKEND_URL: activeConfig.url,
  BACKEND_URLS,

  // Helper para obtener URL de un entorno específico
  getUrlForEnvironment: (env) => {
    const config = BACKEND_URLS[env];
    return config ? config.url : null;
  },

  // Helper para mostrar información del entorno activo
  getActiveInfo: () => {
    return {
      environment: ACTIVE_ENVIRONMENT,
      url: activeConfig.url,
      description: activeConfig.description
    };
  }
};

// ========================================
// EJEMPLO DE USO
// ========================================

/*
// En tu archivo de configuración del frontend:
const { BACKEND_URL } = require('./backend-urls.config');

// Luego usa BACKEND_URL en tus peticiones:
fetch(`${BACKEND_URL}/api/auth/local`, { ... });

// O para React:
const API_BASE_URL = BACKEND_URL;
export default API_BASE_URL;
*/
