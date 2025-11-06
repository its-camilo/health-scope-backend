import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::user-file.user-file",
  ({ strapi }) => ({
    async find(ctx) {
      // Asegurar que solo obtenga los archivos del usuario autenticado
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      const existingQuery =
        (ctx.query as Record<string, unknown> | undefined) ?? {};
      const currentFilters =
        (typeof existingQuery["filters"] === "object" &&
        existingQuery["filters"] !== null
          ? (existingQuery["filters"] as Record<string, unknown>)
          : {}) ?? {};

      ctx.query = {
        ...(existingQuery as Record<string, unknown>),
        filters: {
          ...(currentFilters as Record<string, unknown>),
          user: {
            id: user.id,
          },
        },
        populate: {
          ...(typeof existingQuery["populate"] === "object" &&
          existingQuery["populate"] !== null
            ? (existingQuery["populate"] as Record<string, unknown>)
            : {}),
          file_data: true,
        },
      } as typeof ctx.query;

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
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
        return ctx.unauthorized("You must be authenticated");
      }

      // Verificar que el archivo pertenece al usuario
      const file = (await strapi.entityService.findOne(
        "api::user-file.user-file",
        id,
        {
          populate: ["user"],
        }
      )) as { user?: { id: number } } | null;

      if (!file) {
        return ctx.notFound("File not found");
      }

      if (!file.user || file.user.id !== user.id) {
        return ctx.forbidden("You can only delete your own files");
      }

      const response = await super.delete(ctx);
      return response;
    },
  })
);
