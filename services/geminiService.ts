import { GoogleGenAI, Type } from "@google/genai";
import { PRACTICES } from '../constants';
import { Farm } from "../types";

// The GoogleGenAI client instance. It's initialized lazily to prevent startup crashes.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents a startup crash if process.env.API_KEY is not available immediately,
 * by deferring the initialization until the client is actually needed.
 */
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        // Initialize the Google GenAI client.
        // The API key must be sourced from environment variables for security.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};


interface NftMetadataInput {
    purchaseId: string;
    farmName: string;
    tons: number;
    nftType: 'investor' | 'farmer';
    recipientEmail: string;
    imageUrl: string; // Now requires the IPFS image URL
    investorAccountId: string;
    farmerAccountId: string;
}

// Helper to truncate strings with ellipsis
const truncate = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
};

export const geminiService = {
    /**
     * Generates a unique NFT image using the Gemini API (Imagen model).
     * @param prompt The prompt for the image generation.
     * @returns A Base64 encoded string of the generated PNG image.
     */
    async generateNftImage(prompt: string): Promise<string> {
        console.log("Generating unique NFT image with Gemini...");
        try {
            const client = getAiClient();
            const response = await client.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Gemini did not return any images.");
            }

            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            console.log("Successfully generated image from Gemini.");
            return base64ImageBytes;
        } catch (error) {
            console.error("Error generating image with Gemini:", error);
            throw new Error("Failed to generate NFT artwork.");
        }
    },

    /**
     * Generates farm data using Gemini with a structured JSON output.
     */
    async generateFarmData(): Promise<any> {
        console.log("Generating farm data with Gemini...");
        try {
            const client = getAiClient();
            const practiceIds = PRACTICES.map(p => p.id).join(', ');
            const prompt = `Generate realistic data for a sustainable farm. The farm should be located in the Middle East or Africa. Provide the following fields in JSON format: name (string), location (string, e.g., City, Country), story (string, 2-3 sentences), landArea (number between 10 and 200), areaUnit ('dunum' or 'hectare'), cropType (string), practices (an array of 2-3 practice IDs from this list: ${practiceIds}), and pricePerTon (number between 0.5 and 1.5, with 2 decimal places).`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    location: { type: Type.STRING },
                    story: { type: Type.STRING },
                    landArea: { type: Type.NUMBER },
                    areaUnit: { type: Type.STRING },
                    cropType: { type: Type.STRING },
                    practices: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    pricePerTon: { type: Type.NUMBER },
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
            
            const farmData = JSON.parse(response.text);
            console.log("Successfully generated farm data:", farmData);
            return farmData;

        } catch (error) {
            console.error("Error generating farm data with Gemini:", error);
            throw new Error("Failed to generate farm data.");
        }
    },

    /**
     * Analyzes farm data for plausibility and consistency using Gemini.
     */
    async analyzeFarmData(farmData: { name: string, location: string, story: string, cropType: string, landArea: number, areaUnit: string, practices: string[] }): Promise<{ plausibilityScore: number, consistencyScore: number, justification: string }> {
        console.log("Analyzing farm data quality with Gemini...");
        try {
            const client = getAiClient();
            const dataToAnalyze = {
                ...farmData,
                practices: farmData.practices.map(pId => PRACTICES.find(p => p.id === pId)?.name || pId) // Convert IDs to names for clarity
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

        } catch (error) {
            console.error("Error analyzing farm data with Gemini:", error);
            throw new Error("AI data quality analysis failed.");
        }
    },
    
    async analyzeCertificate(certificate: { mimeType: 'application/pdf'; data: string; }): Promise<{ score: number; justification: string; extractedData: object; }> {
        console.log("Analyzing PDF certificate with Gemini...");
        try {
            const client = getAiClient();
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

        } catch (error) {
            console.error("Error analyzing certificate with Gemini:", error);
            throw new Error("AI certificate analysis failed.");
        }
    },


    /**
     * Generates a standards-compliant NFT metadata JSON object.
     */
    generateNftMetadata({ purchaseId, farmName, tons, nftType, recipientEmail, imageUrl, investorAccountId, farmerAccountId }: NftMetadataInput): object {
        
        const shortPurchaseId = purchaseId.split('_').pop() || '';
        const name = nftType === 'investor' 
            ? `Impact Certificate #${shortPurchaseId}`
            : `Legacy Badge #${shortPurchaseId}`;
        
        const description = nftType === 'investor'
            ? `A tokenized certificate representing a landmark purchase of ${tons} tons of CO₂e credits from the farm "${farmName}".`
            : `A tokenized badge awarded for a landmark sale of ${tons} tons of CO₂e credits to ${truncate(recipientEmail, 25)}.`;

        const metadata = {
            name,
            description,
            image: imageUrl, 
            attributes: [
                { "trait_type": "Farm", "value": farmName },
                { "trait_type": "Tons", "value": tons.toString() },
                { "trait_type": "Purchase ID", "value": purchaseId },
                { "trait_type": "Investor Account ID", "value": investorAccountId },
                { "trait_type": "Farmer Account ID", "value": farmerAccountId },
            ]
        };
        
        return metadata;
    }
};