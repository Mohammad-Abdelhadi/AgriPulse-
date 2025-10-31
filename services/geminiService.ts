import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PRACTICES } from '../constants';
import { Farm } from "../types";

// Per guidelines, the API key is sourced EXCLUSIVELY from the environment.
// No fallbacks, rotation, or other complex logic is needed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateImage = async (prompt: string): Promise<string> => {
    console.log("Generating NFT Image with Gemini using a text-only prompt...");
    try {
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
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
            
            const response = await ai.models.generateContent({
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
        } catch (error) {
            console.error("Error analyzing farm data with Gemini:", error);
            throw new Error("AI data quality analysis failed.");
        }
    },
    
    async analyzeCertificate(certificate: { mimeType: 'application/pdf'; data: string; }): Promise<{ score: number; justification: string; extractedData: object; }> {
        console.log("Analyzing PDF certificate with Gemini...");
        try {
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
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
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
        } catch (error) {
            console.error("Error analyzing certificate with Gemini:", error);
            throw new Error("AI certificate analysis failed.");
        }
    },
};