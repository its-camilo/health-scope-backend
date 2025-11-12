import { factories } from "@strapi/strapi";
import fs from "fs";
import path from "path";
import os from "os";

type PopulatedUploadFile = {
  id: number;
  file_name?: string;
  file_type?: "photo" | "pdf";
  file_data?: {
    url: string;
    mime?: string;
  } | null;
};

// Helper: Detecta si una URL es externa (http/https)
function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

// Helper: Descarga un archivo desde una URL y retorna un buffer
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

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
      // Este endpoint ejecuta un análisis con los archivos ACTUALES del usuario
      // y crea/actualiza el resultado de análisis de forma PERSISTENTE.
      // El resultado permanecerá visible hasta que se ejecute un nuevo análisis o se reseteen los datos.

      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be authenticated");
      }

      console.log("=== ANALYSIS RUN - START ===");
      console.log("User ID:", user.id);
      console.log("Running new analysis with current user files");

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

        // Array para guardar archivos temporales y limpiarlos después
        const tempFiles: string[] = [];

        try {
          for (const file of userFiles) {
            if (!file.file_data || !file.file_data.url) {
              continue;
            }

            if (file.file_type === "photo") {
              // Convertir imagen a base64
              try {
                let fileBuffer: Buffer;

                if (isExternalUrl(file.file_data.url)) {
                  // Descargar desde URL externa (Strapi Cloud)
                  console.log(`Downloading image from external URL: ${file.file_data.url}`);
                  fileBuffer = await downloadFile(file.file_data.url);
                } else {
                  // Leer desde sistema de archivos local
                  const filePath = path.join(
                    process.cwd(),
                    "public",
                    file.file_data.url
                  );
                  fileBuffer = fs.readFileSync(filePath);
                }

                const base64 = fileBuffer.toString("base64");
                filesData.push({
                  type: "image",
                  name: file.file_name,
                  data: base64,
                  mimeType: file.file_data.mime,
                });
                console.log(`Image processed successfully: ${file.file_name}`);
              } catch (error) {
                strapi.log.error(`Error reading image file: ${error.message}`);
              }
            } else if (file.file_type === "pdf") {
              // Para PDFs, necesitamos una ruta local para Gemini File API
              try {
                let filePath: string;

                if (isExternalUrl(file.file_data.url)) {
                  // Descargar desde URL externa a un archivo temporal
                  console.log(`Downloading PDF from external URL: ${file.file_data.url}`);
                  const fileBuffer = await downloadFile(file.file_data.url);

                  // Crear archivo temporal
                  const tempPath = path.join(
                    os.tmpdir(),
                    `pdf_${Date.now()}_${file.file_name || "document.pdf"}`
                  );
                  fs.writeFileSync(tempPath, fileBuffer);
                  filePath = tempPath;
                  tempFiles.push(tempPath);
                  console.log(`PDF downloaded to temp file: ${tempPath}`);
                } else {
                  // Usar ruta local
                  filePath = path.join(
                    process.cwd(),
                    "public",
                    file.file_data.url
                  );
                }

                filesData.push({
                  type: "pdf",
                  name: file.file_name,
                  path: filePath,
                });
                console.log(`PDF processed successfully: ${file.file_name}`);
              } catch (error) {
                strapi.log.error(`Error processing PDF file: ${error.message}`);
              }
            }
          }
        } catch (error) {
          // Limpiar archivos temporales en caso de error
          for (const tempFile of tempFiles) {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
            } catch (cleanupError) {
              strapi.log.error(`Error cleaning up temp file: ${cleanupError.message}`);
            }
          }
          throw error;
        }

        console.log(`Total files prepared for analysis: ${filesData.length}`);

        // 3. Llamar al servicio de análisis (Gemini)
        const analysisService = strapi.service("api::analysis.analysis");
        let analysisData;
        try {
          analysisData = await analysisService.runAnalysis(filesData);
        } finally {
          // Limpiar archivos temporales después del análisis
          for (const tempFile of tempFiles) {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
                console.log(`Temp file cleaned up: ${tempFile}`);
              }
            } catch (cleanupError) {
              strapi.log.error(`Error cleaning up temp file: ${cleanupError.message}`);
            }
          }
        }

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

        console.log("Analysis result saved successfully");
        console.log("Result ID:", result.id);
        console.log("=== ANALYSIS RUN - END (SUCCESS) ===");

        return ctx.send({
          data: sanitizedResult,
          message: "Analysis completed successfully",
        });
      } catch (error) {
        strapi.log.error("Error running analysis:", error);
        console.log("=== ANALYSIS RUN - END (ERROR) ===");
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
