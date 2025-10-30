// In a real-world application, this JWT would be stored securely as an environment variable.
// For this demo, it is included directly in the code.
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0YWFjMjlhNi00NWI2LTQ5OWYtYTViYy1hYTNmNzA3MGZlOWMiLCJlbWFpbCI6Im1vaGFtbWFkLmIuYWJkZWxoYWRpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNTc2ZmNmMWI4MGI2ZTdkZmJhOCIsInNjb3BlZEtleVNlY3JldCI6ImVhYmYwYWMyOWI1NWJlNTdmNjJmNjNiNjU1NWZjNTJmOWQ4NTRjNWMxOTM0NGU1ZDE2NTJkMDljY2ExYzE4NmYiLCJleHAiOjE3OTI3ODY0NzF9.VluNvSqkbdim0WUGWhgz0E1y2ScaGnVBZl_CDhOTyNo';
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

// Helper to convert Base64 to Blob
const base64ToBlob = (base64: string, contentType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};


class PinataService {
    async uploadJsonToIpfs(jsonData: object): Promise<string> {
        console.log("Uploading metadata to IPFS via Pinata...");
        try {
            const response = await fetch(PINATA_JSON_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_JWT}`
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Pinata API Error (JSON): ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            if (!result.IpfsHash) {
                throw new Error("IPFS hash not found in Pinata JSON response.");
            }
            
            console.log("Successfully pinned JSON to IPFS. CID:", result.IpfsHash);
            return result.IpfsHash;

        } catch (error) {
            console.error("Failed to upload JSON to IPFS:", error);
            throw error;
        }
    }

    async uploadFileToIpfs(base64Data: string, fileName: string, contentType: string): Promise<string> {
        console.log(`Uploading file (${fileName}) to IPFS via Pinata...`);
        try {
            const blob = base64ToBlob(base64Data, contentType);
            const formData = new FormData();
            formData.append('file', blob, fileName);

            const response = await fetch(PINATA_FILE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Pinata API Error (File): ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            if (!result.IpfsHash) {
                throw new Error("IPFS hash not found in Pinata file response.");
            }

            console.log("Successfully pinned file to IPFS. CID:", result.IpfsHash);
            return result.IpfsHash;

        } catch (error) {
            console.error("Failed to upload file to IPFS:", error);
            throw error;
        }
    }
}

export const pinataService = new PinataService();