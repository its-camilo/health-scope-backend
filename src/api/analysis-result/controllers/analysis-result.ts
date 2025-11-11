import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::analysis-result.analysis-result",
  ({ strapi }) => ({
    async find(ctx) {
      // IMPORTANTE: Este endpoint devuelve el resultado de análisis del usuario,
      // que es PERSISTENTE e INDEPENDIENTE de los cambios en los archivos del usuario.
      // El análisis solo debe ser modificado cuando:
      // 1. El usuario ejecuta un nuevo análisis (POST /api/analysis/run)
      // 2. Se eliminan todos los datos del usuario (POST /api/analysis/reset)

      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      console.log("=== ANALYSIS RESULT FIND - START ===");
      console.log("User ID:", user.id);
      console.log("Fetching persistent analysis result (independent of current files)");

      const existingQuery =
        (ctx.query as Record<string, unknown> | undefined) ?? {};
      const currentFilters =
        (typeof existingQuery["filters"] === "object" &&
        existingQuery["filters"] !== null
          ? (existingQuery["filters"] as Record<string, unknown>)
          : {}) ?? {};

      // Configurar query para obtener el análisis del usuario
      // ORDENADO por updatedAt DESC para asegurar que siempre obtenemos el más reciente
      ctx.query = {
        ...(existingQuery as Record<string, unknown>),
        filters: {
          ...(currentFilters as Record<string, unknown>),
          user: {
            id: user.id,
          },
        },
        sort: { updatedAt: 'desc' },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      } as typeof ctx.query;

      console.log("Query configured:", JSON.stringify(ctx.query, null, 2));

      const { data, meta } = await super.find(ctx);

      console.log("Analysis results found:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Returning persistent analysis result");
        console.log("Analysis data:", JSON.stringify(data[0], null, 2));
      } else {
        console.log("No analysis result found for user");
      }
      console.log("=== ANALYSIS RESULT FIND - END ===");

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
