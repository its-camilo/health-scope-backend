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

      console.log("=== USER FILES FIND DEBUG ===");
      console.log("Authenticated user ID:", user.id);
      console.log("Original query:", JSON.stringify(ctx.query, null, 2));

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
        // Force populate for file_data - don't merge with existing populate
        populate: ['file_data'],
      } as typeof ctx.query;

      console.log("Modified query:", JSON.stringify(ctx.query, null, 2));

      const { data, meta } = await super.find(ctx);

      console.log("Found files count:", data?.length || 0);
      console.log("Response data:", JSON.stringify(data, null, 2));
      console.log("Response meta:", JSON.stringify(meta, null, 2));

      return { data, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      // Log incoming request for debugging
      console.log("=== USER FILE CREATE DEBUG ===");
      console.log("ctx.request.body:", JSON.stringify(ctx.request.body, null, 2));
      console.log("ctx.request.files:", JSON.stringify(ctx.request.files, null, 2));

      // Parse the data field if it's a string (from FormData)
      let data = ctx.request.body.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse data field:", e);
          return ctx.badRequest("Invalid data format");
        }
      }

      // Ensure data is an object, not an array
      if (Array.isArray(data)) {
        console.error("Data is an array, expected object:", data);
        return ctx.badRequest("Data must be an object, not an array");
      }

      // Remove user from data if it was sent from frontend (we'll add it from auth)
      if (data && data.user) {
        delete data.user;
      }

      // Set the body data with authenticated user
      ctx.request.body.data = {
        ...(data || {}),
        user: user.id,
      };

      console.log("Final ctx.request.body.data:", JSON.stringify(ctx.request.body.data, null, 2));

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
