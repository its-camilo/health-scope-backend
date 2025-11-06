import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::analysis-result.analysis-result",
  ({ strapi }) => ({
    async find(ctx) {
      // Asegurar que solo obtenga el resultado del usuario autenticado
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
      } as typeof ctx.query;

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      const { id } = ctx.params;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      // Verificar que el resultado pertenece al usuario
      const result = (await strapi.entityService.findOne(
        "api::analysis-result.analysis-result",
        id,
        {
          populate: ["user"],
        }
      )) as { user?: { id: number } } | null;

      if (!result) {
        return ctx.notFound("Analysis result not found");
      }

      if (!result.user || result.user.id !== user.id) {
        return ctx.forbidden("You can only access your own analysis results");
      }

      return { data: result };
    },
  })
);
