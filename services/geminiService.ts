import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PRACTICES } from '../constants';
import { Farm } from "../types";

// An array of API keys for resilience. The primary is from the environment, and the second is a fallback.
const API_KEYS = [
    process.env.API_KEY,
    "AIzaSyBHOgfRTd3qiVhAJRa0-Z98-TYS1XoQnhE"
].filter(Boolean); // Filter out any null/undefined keys, ensuring the array only contains valid strings.

let currentKeyIndex = 0;
let ai: GoogleGenAI | null = null;

const getAiClient = (forceRotate: boolean = false): GoogleGenAI => {
    if (forceRotate && API_KEYS.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        console.log(`Rotating to API key index: ${currentKeyIndex}`);
        ai = null; // Force re-initialization with the new key on the next call.
    }

    if (!ai) {
        const apiKey = API_KEYS[currentKeyIndex];
        if (!apiKey) {
            throw new Error("No valid Gemini API key is available.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

async function withApiKeyRotation<T>(apiCall: (client: GoogleGenAI) => Promise<T>, attempt: number = 0): Promise<T> {
    try {
        // Use a new client for each attempt in case the key needs to be rotated
        const client = getAiClient(attempt > 0);
        return await apiCall(client);
    } catch (error: any) {
        let errorDetails = {};
        try {
            if (typeof error.message === 'string' && error.message.startsWith('{')) {
                errorDetails = JSON.parse(error.message);
            } else {
                errorDetails = error;
            }
        } catch (e) { /* Not a JSON error */ }

        const statusCode = (errorDetails as any)?.error?.code;
        const status = (errorDetails as any)?.error?.status;
        const isRateLimitError = statusCode === 429 || status === 'RESOURCE_EXHAUSTED';

        if (isRateLimitError && attempt < API_KEYS.length - 1) {
            console.warn(`API rate limit on key index ${currentKeyIndex}. Switching to fallback.`);
            return withApiKeyRotation(apiCall, attempt + 1);
        } else {
            if (isRateLimitError) {
                const finalError = new Error("All available API keys are rate-limited. Please try again later.");
                console.error(finalError.message, error);
                throw finalError;
            }
            throw error;
        }
    }
}

const generateImage = async (prompt: string): Promise<string> => {
    console.log("Generating NFT Image with Gemini using a text-only prompt...");
    try {
      return await withApiKeyRotation(async (client) => {
        const textPart = { text: prompt };
  
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [textPart] },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });
  
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log("Successfully generated NFT image.");
            return part.inlineData.data;
          }
        }
        throw new Error("Gemini did not return an image.");
      });
    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      throw error;
    }
};

export const geminiService = {
    async generateInvestorNftImage(tons: number): Promise<string> {
        const prompt = `Create a visually striking digital certificate for a carbon credit NFT from AgriPulse. The design should be clean, professional, and trustworthy, with a green and white color palette inspired by nature and technology. The image MUST prominently and clearly display the text '${tons} TONS PURCHASED'. Do not include any logos or external branding unless specifically asked.`;
        return generateImage(prompt);
    },

    async generateFarmerNftImage(tons: number): Promise<string> {
        const prompt = `Create a visually striking digital award badge for a farmer's achievement NFT from AgriPulse. The design should feel prestigious, like a medal of honor, with a green and white color palette inspired by nature and sustainability. The image MUST prominently and clearly display the text '${tons} TONS SOLD'. Do not include any logos or external branding unless specifically asked.`;
        return generateImage(prompt);
    },
    
    async analyzeFarmData(farmData: { name: string, location: string, story: string, cropType: string, landArea: number, areaUnit: string, practices: string[] }): Promise<{ plausibilityScore: number, consistencyScore: number, justification: string }> {
        console.log("Analyzing farm data quality with Gemini...");
        try {
            return await withApiKeyRotation(async (client) => {
                const dataToAnalyze = {
                    ...farmData,
                    practices: farmData.practices.map(pId => PRACTICES.find(p => p.id === pId)?.name || pId)
                };

                const prompt = `
                    You are an expert agricultural data analyst. Your task is to evaluate the plausibility and consistency of the following farm data.
                    - Check if the name, location, and story seem like genuine entries or random spam characters (e.g., "ssssss").
                    - Check if the crop type, land area, and selected practices are consistent with the geographical location and the farm's story.
                    - Provide your analysis ONLY in the following JSON format.
                    - IMPORTANT: The 'justification' field must be a concise, direct summary of your findings, strictly under 150 characters. For example: "Inconsistent crop type for location." or "Plausible data with strong narrative."
                    
                    Data: ${JSON.stringify(dataToAnalyze, null, 2)}
                `;

                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        plausibilityScore: { type: Type.NUMBER, description: "A score from 0 (spam/random) to 100 (highly plausible)." },
                        consistencyScore: { type: Type.NUMBER, description: "A score from 0 (inconsistent) to 100 (highly consistent)." },
                        justification: { type: Type.STRING, description: "A brief justification for your scores, maximum 150 characters." }
                    }
                };
                
                const response = await client.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: responseSchema,
                    },
                });

                const analysisResult = JSON.parse(response.text);
                console.log("Successfully analyzed farm data:", analysisResult);
                return analysisResult;
            });
        } catch (error) {
            console.error("Error analyzing farm data with Gemini:", error);
            throw new Error("AI data quality analysis failed.");
        }
    },
    
    async analyzeCertificate(certificate: { mimeType: 'application/pdf'; data: string; }): Promise<{ score: number; justification: string; extractedData: object; }> {
        console.log("Analyzing PDF certificate with Gemini...");
        try {
            return await withApiKeyRotation(async (client) => {
                const prompt = `
                    You are an agricultural land registrar. Analyze the provided PDF document.
                    1.  Confirm if it appears to be a legitimate Farm Ownership Certificate or similar official land document.
                    2.  Extract the following information if available: 'Farmer Name', 'National ID', 'Location', and 'Total Area'. If a field is not found, return 'N/A'.
                    3.  Provide a confidence score from 0 to 100 on the document's authenticity. A low score (0-40) for documents that are clearly not certificates. A medium score (41-70) for plausible but simple documents. A high score (71-100) for documents that look official with clear formatting, seals, or signatures.
                    4.  Provide a brief justification for your score (max 150 characters).
                    5.  Return your analysis ONLY in the specified JSON format.
                `;

                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        justification: { type: Type.STRING },
                        extractedData: {
                            type: Type.OBJECT,
                            properties: {
                                "Farmer Name": { type: Type.STRING },
                                "National ID": { type: Type.STRING },
                                "Location": { type: Type.STRING },
                                "Total Area": { type: Type.STRING }
                            }
                        }
                    }
                };
                
                const response = await client.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: certificate.mimeType, data: certificate.data } },
                            { text: prompt }
                        ]
                    },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: responseSchema,
                    },
                });

                const analysisResult = JSON.parse(response.text);
                console.log("Successfully analyzed certificate:", analysisResult);
                return analysisResult;
            });
        } catch (error) {
            console.error("Error analyzing certificate with Gemini:", error);
            throw new Error("AI certificate analysis failed.");
        }
    },
};