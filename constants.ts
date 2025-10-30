import { FarmerNftLevel, InvestorNftLevel, NftRarity } from './types';

// A single, unified image for all achievement NFTs to ensure brand consistency.
// FIX: Export UNIFIED_NFT_IMAGE_URL to make it available for import.
export const UNIFIED_NFT_IMAGE_URL = 'https://copper-careful-dragonfly-654.mypinata.cloud/ipfs/bafkreihj5zrzybxgowttek6nsvrxafksuh5hakci47ouduunxa34cjg3p4';

export const HECTARE_TO_DUNUM = 10;

export const PLATFORM_COMMISSION_RATE = 0.05; // 5%
export const PLATFORM_COMMISSION_PERCENT = PLATFORM_COMMISSION_RATE * 100;
export const FARMER_SHARE_PERCENT = 100 - PLATFORM_COMMISSION_PERCENT;


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
        id: 'fl_bronze', name: 'Bronze Sale Badge', tonsThreshold: 1,
        rarity: NftRarity.BRONZE, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for every single sale of 1-99 tons of CO₂e credits.'
    },
    {
        id: 'fl_silver', name: 'Silver Sale Badge', tonsThreshold: 100,
        rarity: NftRarity.SILVER, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for a landmark single sale between 100 and 999 tons of CO₂e credits.'
    },
    {
        id: 'fl_gold', name: 'Gold Sale Badge', tonsThreshold: 1000,
        rarity: NftRarity.GOLD, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'A prestigious award for a landmark single sale of over 1,000 tons of CO₂e credits.'
    }
];

export const INVESTOR_IMPACT_LEVELS: InvestorNftLevel[] = [
    {
        id: 'il_bronze', name: 'Bronze Purchase Certificate', tonsThreshold: 1,
        rarity: NftRarity.BRONZE, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Awarded for every single purchase of 1-99 tons of CO₂e credits.'
    },
    {
        id: 'il_silver', name: 'Silver Purchase Certificate', tonsThreshold: 100,
        rarity: NftRarity.SILVER, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'Recognizes a significant contribution through a single purchase between 100 and 999 tons of CO₂e credits.'
    },
    {
        id: 'il_gold', name: 'Gold Purchase Certificate', tonsThreshold: 1000,
        rarity: NftRarity.GOLD, imageUrl: UNIFIED_NFT_IMAGE_URL,
        description: 'The highest honor for a landmark single purchase of over 1,000 tons of CO₂e credits.'
    }
];

export const DEDICATED_IPFS_GATEWAY_URL = 'https://copper-careful-dragonfly-654.mypinata.cloud/ipfs/';
