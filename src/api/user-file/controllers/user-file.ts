import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-file.user-file', ({ strapi }) => ({
  async find(ctx) {
    // Asegurar que solo obtenga los archivos del usuario autenticado
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    ctx.query = {
      ...ctx.query,
      filters: {
        ...ctx.query.filters,
        user: {
          id: user.id,
        },
      },
      populate: {
        file_data: true,
      },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Agregar el usuario automáticamente
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Verificar que el archivo pertenece al usuario
    const file = await strapi.entityService.findOne('api::user-file.user-file', id, {
      populate: ['user'],
    });

    if (!file) {
      return ctx.notFound('File not found');
    }

    if (file.user.id !== user.id) {
      return ctx.forbidden('You can only delete your own files');
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
