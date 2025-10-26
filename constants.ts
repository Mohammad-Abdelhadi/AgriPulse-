import { FarmerNftLevel, InvestorNftLevel, NftRarity } from './types';

// A single, unified image for all achievement NFTs to ensure brand consistency.
// FIX: Export UNIFIED_NFT_IMAGE_URL to make it available for import.
export const UNIFIED_NFT_IMAGE_URL = 'https://i.ibb.co/68yL2q0/nft-badge-unified.png';

export const HECTARE_TO_DUNUM = 10;

export const PRACTICES = [
    { id: 'no_till', name: 'No-till/Minimum tillage', emissionFactor: 0.4 },
    { id: 'reduced_fertilizer', name: 'Reduced chemical fertilizer', emissionFactor: 0.3 },
    { id: 'cover_cropping', name: 'Cover cropping', emissionFactor: 0.5 },
    { id: 'efficient_irrigation', name: 'Efficient irrigation', emissionFactor: 0.2 },
    { id: 'managed_grazing', name: 'Managed grazing', emissionFactor: 0.6 },
];

export const APPROVAL_THRESHOLD = 70;

export const FARMER_LEGACY_LEVELS: FarmerNftLevel[] = [
    {
        id: 'fl_bronze', name: 'Bronze Sale Badge', tonsThreshold: 100,
        rarity: NftRarity.BRONZE, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for a single sale of over 100 tons of CO₂e credits.'
    },
    {
        id: 'fl_silver', name: 'Silver Sale Badge', tonsThreshold: 500,
        rarity: NftRarity.SILVER, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for a landmark single sale of over 500 tons of CO₂e credits.'
    },
    {
        id: 'fl_gold', name: 'Gold Sale Badge', tonsThreshold: 1000,
        rarity: NftRarity.GOLD, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'A prestigious award for a landmark single sale of over 1,000 tons of CO₂e credits.'
    }
];

export const INVESTOR_IMPACT_LEVELS: InvestorNftLevel[] = [
    {
        id: 'il_bronze', name: 'Bronze Purchase Certificate', tonsThreshold: 100,
        rarity: NftRarity.BRONZE, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for a single purchase of over 100 tons of CO₂e credits.'
    },
    {
        id: 'il_silver', name: 'Silver Purchase Certificate', tonsThreshold: 500,
        rarity: NftRarity.SILVER, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Recognizes a significant contribution through a single purchase of 500 tons of CO₂e credits.'
    },
    {
        id: 'il_gold', name: 'Gold Purchase Certificate', tonsThreshold: 1000,
        rarity: NftRarity.GOLD, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'The highest honor for a landmark single purchase of over 1,000 tons of CO₂e credits.'
    }
];