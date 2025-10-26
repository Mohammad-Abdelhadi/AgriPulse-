

export enum AppRole {
    FARMER = 'FARMER',
    INVESTOR = 'INVESTOR',
    ADMIN = 'ADMIN',
    SERVICE_PROVIDER = 'SERVICE_PROVIDER',
}

export interface User {
    id: string;
    email: string;
    role: AppRole;
    hederaAccountId?: string;
    hederaPrivateKey?: string;
}

export enum FarmStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    SOLD_OUT = 'sold_out',
    REJECTED = 'rejected',
}

export interface Farm {
    id: string;
    name: string;
    farmerId: string;
    farmerName: string;
    farmerHederaAccountId: string;
    location: string;
    story: string;
    landArea: number;
    areaUnit: 'dunum' | 'hectare';
    cropType: string;
    practices: string[];
    imageUrl?: string;
    totalTons: number;
    availableTons: number;
    pricePerTon: number;
    status: FarmStatus;
    investorCount: number;
    hederaTokenId?: string;
    rejectionReason?: string;
    approvalDate?: string;
    approvalScore?: number;
    farmNftTokenId?: string;
    farmNftSerialNumber?: number;
    farmNftHashscanUrl?: string;
}

export interface Purchase {
    id: string;
    farmId: string;
    investorId: string;
    tonsPurchased: number;
    totalPrice: number;
    purchaseDate: string;
    totalPriceInHbar?: number;
    hashscanUrl?: string;
    tokenTransferStatus: 'PENDING' | 'COMPLETED';
    tokenTransferTxUrl?: string;
}

export enum NftRarity {
    BRONZE = 'Bronze',
    SILVER = 'Silver',
    GOLD = 'Gold',
}

// For Farmer Badges, now based on single transactions
export interface FarmerNftLevel {
    id: string;
    name: string;
    tonsThreshold: number; // Changed from tonsSoldThreshold
    rarity: NftRarity;
    imageUrl: string;
    description: string;
}

export interface FarmerNft {
    id: string;
    farmerId: string;
    nftLevelId: string;
    mintDate: string;
    hederaTokenId: string;
    hederaSerialNumber: number;
    hashscanUrl?: string;
    purchaseId: string; // Link to the specific purchase
    tons: number;
    investorEmail: string;
    metadataUrl?: string; // To store the IPFS URL for the rich metadata
}

// For Investor Certificates, now based on single transactions
export interface InvestorNftLevel {
    id: string;
    name: string;
    tonsThreshold: number; // Changed from tonsPurchasedThreshold
    rarity: NftRarity;
    imageUrl: string;
    description: string;
}

export interface InvestorNft {
    id: string;
    investorId: string;
    nftLevelId: string;
    mintDate: string;
    hederaTokenId: string;
    hederaSerialNumber: number;
    hashscanUrl?: string;
    purchaseId: string; // Link to the specific purchase
    tons: number;
    farmName: string;
    metadataUrl?: string; // To store the IPFS URL for the rich metadata
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  link?: string;
}

export interface PlatformTokenInfo {
  id: string;
  name: string;
  symbol: string;
  initialSupply: number;
}

export interface NftCollectionInfo {
  id: string;
  name: string;
  symbol: string;
}

export interface Retirement {
  id: string;
  investorId: string;
  amount: number;
  retirementDate: string;
  hashscanUrl: string;
}

export enum ServiceCategory {
    EQUIPMENT = 'Equipment Rental',
    LIVESTOCK = 'Livestock Services',
    CONSULTATION = 'Expert Consultation',
    LABOR = 'Manual Labor'
}

export interface Service {
    id: string;
    providerId: string;
    name: string;
    description: string;
    category: ServiceCategory;
    price: number;
    priceUnit: 'per hour' | 'per day' | 'per item';
}

export interface FarmContextType {
    farms: Farm[];
    purchases: Purchase[];
    retirements: Retirement[];
    farmerNfts: FarmerNft[];
    investorNfts: InvestorNft[];
    services: Service[];
    platformTokenInfo: PlatformTokenInfo | null;
    farmerNftCollectionInfo: NftCollectionInfo | null;
    investorNftCollectionInfo: NftCollectionInfo | null;
    farmNftCollectionInfo: NftCollectionInfo | null;
    loading: boolean;
    error: string | null;
    hbarToUsdRate: number;
    registerFarm: (farmData: Omit<Farm, 'id' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId' | 'totalTons' | 'availableTons' | 'status' | 'investorCount'>) => Promise<boolean>;
    purchaseCredits: (farmId: string, tons: number) => Promise<void>;
    createPlatformToken: (name: string, symbol: string, initialSupply: number) => Promise<void>;
    associateWithPlatformToken: () => Promise<void>;
    createFarmerNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    associateWithFarmerNftCollection: () => Promise<void>;
    createInvestorNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    associateWithInvestorNftCollection: () => Promise<void>;
    createFarmNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    retireCredits: (amount: number) => Promise<void>;
    addService: (serviceData: Omit<Service, 'id' | 'providerId'>) => Promise<boolean>;
    deletePlatformToken: () => Promise<void>;
    deleteNftCollection: (collectionId: string) => Promise<void>;
    deleteMultipleTokens: (tokenIds: string[], logCallback: (message: string) => void) => Promise<{ success: number; failed: number; summary: string }>;
    dissociateMultipleTokens: (tokenIds: string[], userRole: AppRole, logCallback: (message: string) => void) => Promise<{ success: number; failed: number; summary: string }>;
}