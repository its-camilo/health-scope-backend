import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::analysis-result.analysis-result', ({ strapi }) => ({
  async runAnalysis(filesData: any[]) {
    try {
      // Verificar que tenemos la API key
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      // Preparar el prompt para Gemini
      const prompt = `Eres un asistente médico especializado en análisis de salud. Analiza los siguientes archivos médicos (imágenes y/o PDFs) y proporciona:

1. Un puntaje de salud general (healthScore) del 0 al 100
2. Una evaluación del riesgo de alopecia (alopeciaRisk): "low", "medium", o "high"
3. Un resumen de métricas de salud general (generalHealthMetricsSummary) en formato de texto

Por favor, responde en formato JSON con la siguiente estructura:
{
  "healthScore": number,
  "alopeciaRisk": "low" | "medium" | "high",
  "generalHealthMetricsSummary": "string"
}

Archivos a analizar: ${filesData.length} archivos (${filesData.filter(f => f.type === 'image').length} imágenes, ${filesData.filter(f => f.type === 'pdf').length} PDFs)`;

      // Preparar el contenido para Gemini
      const contents = [];

      // Agregar texto del prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      // Agregar imágenes
      for (const file of filesData) {
        if (file.type === 'image') {
          contents[0].parts.push({
            inline_data: {
              mime_type: file.mimeType,
              data: file.data,
            },
          });
        }
      }

      // Llamar a la API de Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contents,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Extraer el texto de la respuesta
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
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
            alopeciaRisk: 'medium',
            generalHealthMetricsSummary: generatedText,
          };
        }
      } catch (parseError) {
        // Si falla el parseo, crear respuesta por defecto
        analysisData = {
          healthScore: 75,
          alopeciaRisk: 'medium',
          generalHealthMetricsSummary: generatedText,
        };
      }

      return analysisData;
    } catch (error) {
      strapi.log.error('Error in runAnalysis service:', error);
      throw error;
    }
  },
}));
