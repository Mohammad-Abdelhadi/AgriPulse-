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
}

const ipfsToGateway = (ipfsUrl: string) => {
    if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
        return '';
    }
    const cid = ipfsUrl.substring(7);
    // FIX: Switched to a more permissive public IPFS gateway to resolve CORS issues.
    return `https://ipfs.io/ipfs/${cid}`;
};

const NftCard: React.FC<NftCardProps> = ({ metadataUrl, rarity, rarityStyles, onVerify }) => {
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
                const gatewayUrl = ipfsToGateway(metadataUrl);
                const response = await fetch(gatewayUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch from IPFS gateway: ${response.statusText}`);
                }
                const data: NftMetadata = await response.json();
                setMetadata(data);
            } catch (err: any) {
                console.error("Failed to fetch or parse NFT metadata from IPFS:", err);
                setError("Could not load NFT details.");
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
                <img src={metadata.image} alt={metadata.name} className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"/>
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