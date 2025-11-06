import { factories } from "@strapi/strapi";
import fs from "fs";
import path from "path";

type PopulatedUploadFile = {
  id: number;
  file_name?: string;
  file_type?: "photo" | "pdf";
  file_data?: {
    url: string;
    mime?: string;
  } | null;
};

export default factories.createCoreController(
  "api::analysis-result.analysis-result",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      console.log("=== ANALYSIS RESULT FIND DEBUG ===");
      console.log("Authenticated user ID:", user.id);

      // Filter to only get the current user's analysis results
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

      console.log("Modified query:", JSON.stringify(ctx.query, null, 2));

      const { data, meta } = await super.find(ctx);

      console.log("Found analysis results count:", data?.length || 0);
      console.log("Response data:", JSON.stringify(data, null, 2));

      return { data, meta };
    },

    async run(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      try {
        // 1. Obtener todos los archivos del usuario
        const userFiles = (await strapi.entityService.findMany(
          "api::user-file.user-file",
          {
            filters: {
              user: {
                id: user.id,
              },
            },
            populate: ["file_data"],
          }
        )) as unknown as PopulatedUploadFile[];

        if (!userFiles || userFiles.length === 0) {
          return ctx.badRequest("No files found. Please upload files first.");
        }

        // 2. Preparar datos para la IA
        const filesData: Array<
          | {
              type: "image";
              name?: string;
              data: string;
              mimeType?: string;
            }
          | {
              type: "pdf";
              name?: string;
              path: string;
            }
        > = [];

        for (const file of userFiles) {
          if (!file.file_data || !file.file_data.url) {
            continue;
          }

          const filePath = path.join(
            process.cwd(),
            "public",
            file.file_data.url
          );

          if (file.file_type === "photo") {
            // Convertir imagen a base64
            try {
              const fileBuffer = fs.readFileSync(filePath);
              const base64 = fileBuffer.toString("base64");
              filesData.push({
                type: "image",
                name: file.file_name,
                data: base64,
                mimeType: file.file_data.mime,
              });
            } catch (error) {
              strapi.log.error(`Error reading image file: ${error.message}`);
            }
          } else if (file.file_type === "pdf") {
            // Para PDFs, almacenar la ruta para procesamiento posterior
            filesData.push({
              type: "pdf",
              name: file.file_name,
              path: filePath,
            });
          }
        }

        // 3. Llamar al servicio de análisis (Gemini)
        const analysisService = strapi.service("api::analysis.analysis");
        const analysisData = await analysisService.runAnalysis(filesData);

        // 4. Buscar si existe un resultado previo
        const existingResult = await strapi.entityService.findMany(
          "api::analysis-result.analysis-result",
          {
            filters: {
              user: {
                id: user.id,
              },
            },
          }
        );

        let result;

        if (existingResult && existingResult.length > 0) {
          // Actualizar resultado existente
          result = await strapi.entityService.update(
            "api::analysis-result.analysis-result",
            existingResult[0].id,
            {
              data: {
                analysis_data: analysisData,
              },
            }
          );
        } else {
          // Crear nuevo resultado
          result = await strapi.entityService.create(
            "api::analysis-result.analysis-result",
            {
              data: {
                analysis_data: analysisData,
                user: user.id,
              },
            }
          );
        }

        // Sanitize the output to match Strapi v5 REST API format
        const sanitizedResult = await this.sanitizeOutput(result, ctx);

        return ctx.send({
          data: sanitizedResult,
          message: "Analysis completed successfully",
        });
      } catch (error) {
        strapi.log.error("Error running analysis:", error);
        return ctx.internalServerError(
          "Error running analysis: " + error.message
        );
      }
    },

    async reset(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      try {
        // 1. Eliminar todos los archivos del usuario
        const userFiles = (await strapi.entityService.findMany(
          "api::user-file.user-file",
          {
            filters: {
              user: {
                id: user.id,
              },
            },
          }
        )) as Array<{ id: number }>;

        for (const file of userFiles) {
          await strapi.entityService.delete(
            "api::user-file.user-file",
            file.id
          );
        }

        // 2. Eliminar el resultado de análisis del usuario
        const existingResult = await strapi.entityService.findMany(
          "api::analysis-result.analysis-result",
          {
            filters: {
              user: {
                id: user.id,
              },
            },
          }
        );

        if (existingResult && existingResult.length > 0) {
          await strapi.entityService.delete(
            "api::analysis-result.analysis-result",
            existingResult[0].id
          );
        }

        return ctx.send({
          message: "All data has been reset successfully",
          deletedFiles: userFiles.length,
          deletedAnalysis: existingResult.length > 0 ? 1 : 0,
        });
      } catch (error) {
        strapi.log.error("Error resetting data:", error);
        return ctx.internalServerError(
          "Error resetting data: " + error.message
        );
      }
    },
  })
);
