
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FileFormat } from "../types";

export const convertDocument = async (
  fileBase64: string,
  mimeType: string,
  targetFormat: FileFormat,
  options: { summarize?: boolean; translateTo?: string; highPrecision?: boolean } = {}
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use Flash for standard conversion (very fast), Pro for High Precision (slower but deeper)
  const selectedModel = options.highPrecision ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  let formatSpecificInstructions = "";
  
  switch(targetFormat) {
    case FileFormat.RTF:
      formatSpecificInstructions = "Output a complete, valid RTF 1.5 document string. Include correct control words for bold, italic, and tables.";
      break;
    case FileFormat.DOCX:
      formatSpecificInstructions = "Create a sophisticated HTML5 wrapper optimized for Word compatibility. Use inline CSS for layout preservation.";
      break;
    case FileFormat.PDF:
      formatSpecificInstructions = "Construct a professional print-ready HTML5 document designed for high-quality A4 PDF export.";
      break;
    case FileFormat.HTML:
      formatSpecificInstructions = "Produce a clean, accessible HTML5 structure using semantic tags.";
      break;
    case FileFormat.JSON:
      formatSpecificInstructions = "Extract and map document sections to a clean JSON schema.";
      break;
    case FileFormat.CSV:
      formatSpecificInstructions = "Identify tabular data and generate a standard CSV output with headers.";
      break;
    default:
      formatSpecificInstructions = `Return the output strictly as valid ${targetFormat.toUpperCase()}.`;
  }

  const systemInstruction = `
    You are an Ultra-Fast Document Processing Engine.
    Task: Convert to ${targetFormat.toUpperCase()}.
    
    Rules:
    1. ${formatSpecificInstructions}
    2. Maintain layout and emphasis.
    3. ${options.summarize ? 'MISSION: Generate a concise executive summary.' : 'MISSION: Convert full content.'}
    4. ${options.translateTo && options.translateTo !== 'original' ? `TRANSLATION: Output language: ${options.translateTo}.` : ''}
    
    Return ONLY the document content. No chat, no markdown fences (except for Markdown format).
  `;

  const prompt = `Convert this file. Format: ${targetFormat}. Speed and structure are priority.`;

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: {
      parts: [
        {
          inlineData: { mimeType, data: fileBase64 },
        },
        { text: prompt },
      ],
    },
    config: {
      systemInstruction,
      temperature: 0.1,
      // Only use thinking budget if High Precision is selected, otherwise disable for speed
      thinkingConfig: options.highPrecision ? { thinkingBudget: 2000 } : { thinkingBudget: 0 }
    },
  });

  return response.text || "Error: Conversion returned empty results.";
};
