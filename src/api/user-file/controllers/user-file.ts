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

      // Extract file from request
      const files = ctx.request.files || {};
      console.log("Files object keys:", Object.keys(files));

      // Check for file - it might come as 'files.file_data' or 'file_data'
      const fileKey = Object.keys(files).find(key =>
        key === 'file_data' || key === 'files.file_data'
      );

      console.log("File key found:", fileKey);

      if (!fileKey) {
        console.error("No file found in request");
        return ctx.badRequest("File is required");
      }

      const fileOrFiles = files[fileKey];

      // Ensure we have a single file, not an array
      const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;

      if (!file) {
        console.error("No file found after extraction");
        return ctx.badRequest("File is required");
      }

      console.log("File to upload:", {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      });

      try {
        // Upload file to Strapi media library
        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
          data: {
            fileInfo: {
              name: file.originalFilename,
              caption: data?.file_name || file.originalFilename,
            }
          },
          files: file,
        });

        console.log("Uploaded files:", uploadedFiles);

        if (!uploadedFiles || uploadedFiles.length === 0) {
          console.error("File upload failed - no files returned");
          return ctx.badRequest("File upload failed");
        }

        const uploadedFile = uploadedFiles[0];
        console.log("Uploaded file ID:", uploadedFile.id);

        // Create the user-file entity with the uploaded file
        const entity = await strapi.entityService.create(
          "api::user-file.user-file",
          {
            data: {
              file_name: data?.file_name || file.originalFilename,
              file_type: data?.file_type || 'photo',
              user: user.id,
              file_data: uploadedFile.id,
            },
            populate: ['file_data', 'user'],
          }
        );

        console.log("Created entity:", JSON.stringify(entity, null, 2));

        // Use Strapi's sanitization to format the response correctly
        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        console.log("Sanitized entity:", JSON.stringify(sanitizedEntity, null, 2));

        // Return in standard Strapi format
        return { data: sanitizedEntity };
      } catch (error) {
        console.error("Error creating user file:", error);
        return ctx.badRequest(`Failed to create user file: ${error.message}`);
      }
    },

    async delete(ctx) {
      const user = ctx.state.user;
      const { id } = ctx.params;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      console.log("=== USER FILE DELETE DEBUG ===");
      console.log("Deleting user-file ID:", id);
      console.log("Authenticated user ID:", user.id);

      // Verificar que el archivo pertenece al usuario y obtener file_data
      const file = (await strapi.entityService.findOne(
        "api::user-file.user-file",
        id,
        {
          populate: ["user", "file_data"],
        }
      )) as { user?: { id: number }; file_data?: { id: number } } | null;

      if (!file) {
        console.log("File not found");
        return ctx.notFound("File not found");
      }

      if (!file.user || file.user.id !== user.id) {
        console.log("User does not own this file");
        return ctx.forbidden("You can only delete your own files");
      }

      console.log("File data:", JSON.stringify(file, null, 2));

      // Delete the physical file from media library FIRST
      if (file.file_data && file.file_data.id) {
        try {
          console.log("Deleting file_data from media library, ID:", file.file_data.id);
          await strapi.plugins.upload.services.upload.remove({ id: file.file_data.id });
          console.log("File_data deleted successfully");
        } catch (error) {
          console.error("Error deleting file_data:", error);
          // Continue anyway to delete the user-file record
        }
      } else {
        console.log("No file_data to delete");
      }

      // Delete the user-file record
      console.log("Deleting user-file record");
      const response = await super.delete(ctx);
      console.log("User-file deleted successfully");

      return response;
    },
  })
);
