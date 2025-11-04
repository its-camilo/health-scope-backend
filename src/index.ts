import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Configurar permisos por defecto para los roles
    await configurePermissions(strapi);
  },
};

async function configurePermissions(strapi: Core.Strapi) {
  try {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    // Obtener los roles
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    const authenticatedRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!publicRole || !authenticatedRole) {
      console.log('Roles not found, permissions will need to be configured manually');
      return;
    }

    // Configurar permisos para el rol Public
    const publicPermissions = {
      'plugin::users-permissions': {
        controllers: {
          auth: {
            register: {
              enabled: true,
            },
            callback: {
              enabled: true,
            },
          },
        },
      },
    };

    // Configurar permisos para el rol Authenticated
    const authenticatedPermissions = {
      'plugin::users-permissions': {
        controllers: {
          user: {
            me: {
              enabled: true,
            },
          },
        },
      },
      'plugin::upload': {
        controllers: {
          content: {
            upload: {
              enabled: true,
            },
          },
        },
      },
      'api::user-file': {
        controllers: {
          'user-file': {
            find: {
              enabled: true,
            },
            create: {
              enabled: true,
            },
            delete: {
              enabled: true,
            },
          },
        },
      },
      'api::analysis-result': {
        controllers: {
          'analysis-result': {
            find: {
              enabled: true,
            },
            findOne: {
              enabled: true,
            },
          },
        },
      },
      'api::analysis': {
        controllers: {
          analysis: {
            run: {
              enabled: true,
            },
            reset: {
              enabled: true,
            },
          },
        },
      },
    };

    // Aplicar permisos al rol Public
    await strapi.query('plugin::users-permissions.role').update({
      where: { id: publicRole.id },
      data: {
        permissions: publicPermissions,
      },
    });

    // Aplicar permisos al rol Authenticated
    await strapi.query('plugin::users-permissions.role').update({
      where: { id: authenticatedRole.id },
      data: {
        permissions: authenticatedPermissions,
      },
    });

    console.log('✅ Permissions configured successfully');
  } catch (error) {
    console.error('Error configuring permissions:', error);
  }
}
