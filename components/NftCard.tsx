import React, { useState, useEffect } from 'react';
import { NftRarity } from '../types';

interface NftMetadata {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string | number }[];
}

interface NftCardProps {
    metadataUrl?: string;
    rarity: NftRarity;
    rarityStyles: { border: string; bg: string; text: string };
    onVerify: () => void;
    showImage?: boolean;
}

// A list of public IPFS gateways to try in order of preference for resilience.
const IPFS_GATEWAYS = [
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
];

/**
 * Fetches a file from IPFS using a CID, trying multiple public gateways for resilience.
 * Implements an exponential backoff retry mechanism if all gateways fail.
 * @param cid The IPFS Content Identifier (CID).
 * @param retries The number of times to retry the entire loop of gateways.
 * @param delay The initial delay between retry attempts in milliseconds.
 * @returns A Promise that resolves to the fetch Response.
 */
const fetchWithRetry = async (cid: string, retries = 3, delay = 1000): Promise<Response> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        for (const gateway of IPFS_GATEWAYS) {
            const url = `${gateway}${cid}`;
            try {
                // Use AbortController for fetch timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout per gateway
                
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (response.ok) {
                    console.log(`Successfully fetched from ${url}`);
                    return response;
                }
                console.warn(`Attempt ${attempt + 1} failed for gateway ${gateway}: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.warn(`Attempt ${attempt + 1} failed for gateway ${gateway} with network error:`, error);
            }
        }
        if (attempt < retries - 1) {
            const backoffDelay = delay * Math.pow(2, attempt);
            console.log(`All gateways failed. Retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
    throw new Error(`Failed to fetch from all IPFS gateways after ${retries} attempts.`);
};


const NftCard: React.FC<NftCardProps> = ({ metadataUrl, rarity, rarityStyles, onVerify, showImage = true }) => {
    const [metadata, setMetadata] = useState<NftMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!metadataUrl) {
                setLoading(false);
                setError("No metadata URL provided.");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                if (!metadataUrl.startsWith('ipfs://')) {
                    throw new Error("Invalid IPFS URL format. Expected 'ipfs://...'");
                }
                const cid = metadataUrl.substring(7);
                
                const response = await fetchWithRetry(cid);
                const data: NftMetadata = await response.json();
                
                // If the image URL within the metadata is also an IPFS link, convert it using the first (primary) gateway.
                if (data.image && data.image.startsWith('ipfs://')) {
                    const imageCid = data.image.substring(7);
                    data.image = `${IPFS_GATEWAYS[0]}${imageCid}`;
                }
                setMetadata(data);
            } catch (err: any) {
                console.error("Failed to fetch or parse NFT metadata from IPFS:", err);
                setError(err.message || "Could not load NFT details.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [metadataUrl]);

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-lg border-2 ${rarityStyles.border} ${rarityStyles.bg} p-6 animate-pulse`}>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }
    
    if (error || !metadata) {
         return (
            <div className={`bg-white rounded-xl shadow-lg border-2 border-red-400 bg-red-50 p-6 flex flex-col items-center justify-center`}>
                <p className="font-bold text-red-600">Error Loading NFT</p>
                <p className="text-sm text-red-500 text-center">{error}</p>
                <button onClick={onVerify} className="mt-4 w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors">
                    Verify on HashScan
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${rarityStyles.border} ${rarityStyles.bg} flex flex-col`}>
            <div className="p-6 flex-grow flex flex-col">
                {showImage ? (
                    <img src={metadata.image} alt={metadata.name} className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"/>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-4 shadow-inner">
                        <svg className="w-24 h-24 text-primary opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    </div>
                )}
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-primary">{metadata.name}</h3>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${rarityStyles.border} ${rarityStyles.text}`}>{rarity}</span>
                </div>
                <p className="text-md text-text-secondary mt-2 text-sm flex-grow">{metadata.description}</p>
                <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                    {metadata.attributes?.map((attr) => (
                         <div className="flex justify-between" key={attr.trait_type}><span>{attr.trait_type}:</span> <span className="font-semibold truncate">{attr.value}</span></div>
                    ))}
                </div>
            </div>
            <div className="p-6 bg-gray-50 mt-auto">
                <button onClick={onVerify} className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors">
                    Verify on HashScan
                </button>
            </div>
        </div>
    );
};

export default NftCard;