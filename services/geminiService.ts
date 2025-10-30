import { GoogleGenAI, Type } from "@google/genai";
import { PRACTICES } from '../constants';
import { Farm } from "../types";

// An array of API keys for resilience. The primary is from the environment, and the second is a fallback.
const API_KEYS = [
    process.env.API_KEY,
    "AIzaSyBHOgfRTd3qiVhAJRa0-Z98-TYS1XoQnhE"
].filter(Boolean); // Filter out any null/undefined keys, ensuring the array only contains valid strings.

let currentKeyIndex = 0;
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * Supports rotating to a fallback key if the current one is rate-limited.
 * @param forceRotate If true, moves to the next key in the API_KEYS array.
 */
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
        // Initialize the Google GenAI client with the current key.
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};


/**
 * A higher-order function that wraps a Gemini API call with retry logic.
 * If the initial call fails with a rate-limit error, it rotates the API key and retries once.
 * @param apiCall The function that makes the actual call to the Gemini API.
 * @param attempt The current attempt number to prevent infinite recursion.
 */
async function withApiKeyRotation<T>(apiCall: (client: GoogleGenAI) => Promise<T>, attempt: number = 0): Promise<T> {
    try {
        const client = getAiClient();
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

        // Check if it's a rate limit error and if we have more keys to try.
        if (isRateLimitError && attempt < API_KEYS.length - 1) {
            console.warn(`API rate limit on key index ${currentKeyIndex}. Switching to fallback.`);
            return withApiKeyRotation(apiCall, attempt + 1); // Recursively retry with the next key
        } else {
            if (isRateLimitError) {
                console.error("All available API keys are rate-limited. Please try again later.");
            }
            throw error; // Re-throw the error if it's not a rate limit issue or if all keys have failed.
        }
    }
}


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
     * Generates farm data using Gemini with a structured JSON output.
     */
    async generateFarmData(): Promise<any> {
        console.log("Generating farm data with Gemini...");
        try {
            return await withApiKeyRotation(async (client) => {
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
            });
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
            return await withApiKeyRotation(async (client) => {
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