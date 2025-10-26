import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client.
// The API key must be sourced from environment variables for security.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


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
            const response = await ai.models.generateImages({
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