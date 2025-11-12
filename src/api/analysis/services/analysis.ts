import { factories } from "@strapi/strapi";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

type PreparedFileData =
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
    };

type GeminiContentPart =
  | {
      text: string;
    }
  | {
      inline_data: {
        mime_type?: string;
        data: string;
      };
    }
  | {
      file_data: {
        mime_type: string;
        file_uri: string;
      };
    };

type GeminiContent = {
  role: "user";
  parts: GeminiContentPart[];
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiFileUploadResponse = {
  file: {
    name: string;
    displayName?: string;
    mimeType: string;
    sizeBytes: string;
    createTime: string;
    updateTime: string;
    expirationTime: string;
    sha256Hash: string;
    uri: string;
    state: string;
  };
};

export default factories.createCoreService(
  "api::analysis-result.analysis-result",
  ({ strapi }) => ({
    async uploadPdfToGemini(
      filePath: string,
      displayName: string,
      apiKey: string
    ): Promise<string> {
      try {
        // Crear FormData y agregar el archivo
        const formData = new FormData();
        const fileStream = fs.createReadStream(filePath);
        formData.append("file", fileStream, {
          filename: displayName,
          contentType: "application/pdf",
        });

        // Subir el archivo a Gemini File API usando axios
        const uploadResponse = await axios.post(
          `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );

        const uploadResult = uploadResponse.data as GeminiFileUploadResponse;

        // Esperar a que el archivo esté procesado
        let file = uploadResult.file;
        while (file.state === "PROCESSING") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const statusResponse = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/${file.name}?key=${apiKey}`
          );
          file = statusResponse.data as GeminiFileUploadResponse["file"];
        }

        if (file.state === "FAILED") {
          throw new Error("PDF processing failed in Gemini");
        }

        return file.uri;
      } catch (error) {
        strapi.log.error("Error uploading PDF to Gemini:", error);
        throw error;
      }
    },

    async runAnalysis(filesData: PreparedFileData[]) {
      try {
        // Verificar que tenemos la API key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not configured");
        }

        // Preparar el prompt para Gemini
        const prompt = `Eres un asistente médico especializado en análisis de salud capilar y alopecia. Analiza los siguientes archivos médicos (fotografías del cuero cabelludo, imágenes de exámenes médicos y/o PDFs con resultados de laboratorio o reportes médicos) y proporciona un análisis ORIENTATIVO:

IMPORTANTE:
- Este análisis es ORIENTATIVO e INFORMATIVO, no constituye un diagnóstico médico definitivo
- Puedes realizar evaluaciones basadas en fotografías del cuero cabelludo, patrones de pérdida de cabello visibles, y documentos médicos proporcionados
- Para un diagnóstico definitivo, el usuario debe consultar con un médico dermatólogo
- Proporciona valores realistas basados en lo que observas en las imágenes y documentos

Tu tarea es proporcionar:

1. Un puntaje de salud general (healthScore) del 0 al 100 basado en:
   - Análisis de fotografías del cuero cabelludo (densidad capilar, zonas de adelgazamiento)
   - Resultados de exámenes de laboratorio si están disponibles
   - Factores de riesgo visibles o mencionados en los documentos

2. Una evaluación ORIENTATIVA del riesgo de alopecia (alopeciaRisk) con porcentajes de probabilidad a 1 año, 3 años y 5 años. Cada porcentaje debe estar entre 0 y 100. Considera:
   - Patrón de pérdida de cabello visible en fotografías
   - Tipo de alopecia (androgénica, areata, difusa, etc.)
   - Factores hormonales, nutricionales o de salud en los reportes médicos
   - Edad y género del paciente si es identificable

3. Un resumen detallado de métricas de salud general (generalHealthMetricsSummary) que incluya:
   - Descripción de lo observado en las fotografías del cuero cabelludo
   - Resumen de hallazgos en exámenes médicos o reportes
   - Factores de riesgo identificados
   - Recomendaciones orientativas (siempre indicando que debe consultar a un médico)

Por favor, responde en formato JSON con la siguiente estructura:
{
  "healthScore": number,
  "alopeciaRisk": {
    "oneYear": number,
    "threeYears": number,
    "fiveYears": number
  },
  "generalHealthMetricsSummary": "string detallado que SIEMPRE inicie con: 'Análisis orientativo basado en la información proporcionada: ' seguido del análisis completo"
}

Archivos a analizar: ${filesData.length} archivos (${filesData.filter((f) => f.type === "image").length} imágenes, ${filesData.filter((f) => f.type === "pdf").length} PDFs)`;

        // Preparar el contenido para Gemini
        const contents: GeminiContent[] = [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ];

        // Subir PDFs a Gemini File API y obtener URIs
        const pdfUris: string[] = [];
        for (const file of filesData) {
          if (file.type === "pdf") {
            try {
              strapi.log.info(`Uploading PDF to Gemini: ${file.name}`);
              const uri = await this.uploadPdfToGemini(
                file.path,
                file.name || "document.pdf",
                apiKey
              );
              pdfUris.push(uri);
              strapi.log.info(`PDF uploaded successfully: ${uri}`);
            } catch (error) {
              strapi.log.error(`Failed to upload PDF ${file.name}:`, error);
              // Continuar con otros archivos aunque uno falle
            }
          }
        }

        // Agregar imágenes (inline_data)
        for (const file of filesData) {
          if (file.type === "image") {
            contents[0].parts.push({
              inline_data: {
                mime_type: file.mimeType,
                data: file.data,
              },
            });
          }
        }

        // Agregar PDFs (file_data)
        for (const uri of pdfUris) {
          contents[0].parts.push({
            file_data: {
              mime_type: "application/pdf",
              file_uri: uri,
            },
          });
        }

        // Llamar a la API de Gemini
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: contents,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Gemini API error: ${response.status} - ${errorText}`
          );
        }

        const result = (await response.json()) as GeminiGenerateContentResponse;

        // Extraer el texto de la respuesta
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error("No response from Gemini API");
        }

        // Intentar parsear el JSON de la respuesta
        let analysisData;
        try {
          // Buscar JSON en la respuesta (puede venir con markdown)
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0]);
          } else {
            // Si no hay JSON, crear una respuesta por defecto
            analysisData = {
              healthScore: 75,
              alopeciaRisk: {
                oneYear: 15,
                threeYears: 25,
                fiveYears: 35,
              },
              generalHealthMetricsSummary: generatedText,
            };
          }
        } catch (parseError) {
          // Si falla el parseo, crear respuesta por defecto
          analysisData = {
            healthScore: 75,
            alopeciaRisk: {
              oneYear: 15,
              threeYears: 25,
              fiveYears: 35,
            },
            generalHealthMetricsSummary: generatedText,
          };
        }

        return analysisData;
      } catch (error) {
        strapi.log.error("Error in runAnalysis service:", error);
        throw error;
      }
    },
  })
);
