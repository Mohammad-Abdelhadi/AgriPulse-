export enum AppRole {
    FARMER = 'FARMER',
    INVESTOR = 'INVESTOR',
    ADMIN = 'ADMIN',
    SERVICE_PROVIDER = 'SERVICE_PROVIDER',
}

export interface CompanyProfile {
    name: string;
    location: string;
    industry: string;
    annualCarbonFootprint: number;
}

export interface User {
    id: string;
    email: string;
    role: AppRole;
    hederaAccountId?: string;
    hederaPrivateKey?: string;
    companyProfile?: CompanyProfile;
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
    farmNftMetadataUrl?: string; // URL to the rich IPFS metadata for the farm NFT
    hcsLog?: string; // URL to the HCS transaction receipt for verification
    certificateIpfsUrl?: string; // URL to the uploaded ownership certificate on IPFS
}

export interface Purchase {
    id: string;
    farmId: string;
    investorId: string;
    investorEmail: string; // Added to enable farmer transaction history
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
    farmerHederaAccountId: string;
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
    investorHederaAccountId: string;
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

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  timestamp: number;
}

export interface PlatformTokenInfo {
  id: string;
  name: string;
  symbol: string;
  initialSupply: number;
  totalSupply: number; // Added to track the dynamic total supply after minting
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

export interface PlatformInitializationDetails {
    tokenName: string;
    tokenSymbol: string;
    initialSupply: number;
    farmerNftName: string;
    farmerNftSymbol: string;
    farmerNftDescription: string;
    investorNftName: string;
    investorNftSymbol: string;
    investorNftDescription: string;
    farmNftName: string;
    farmNftSymbol: string;
    farmNftDescription: string;
    hcsTopicId: string; // Added for the HCS audit trail
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
    hcsTopicId: string | null; // Added for HCS audit trail
    loading: boolean;
    error: string | null;
    hbarToUsdRate: number;
    userBalance: { hbar: number, tokens: { tokenId: string, balance: number }[] } | null;
    refreshUserBalance: () => Promise<void>;
    registerFarm: (farmData: Omit<Farm, 'id' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId' | 'totalTons' | 'availableTons' | 'status' | 'investorCount' | 'certificateIpfsUrl'>, certificate: { mimeType: string; data: string; } | null) => Promise<Farm | null>;
    purchaseCredits: (farmId: string, tons: number) => Promise<void>;
    createPlatformToken: (name: string, symbol: string, initialSupply: number) => Promise<void>;
    associateWithPlatformToken: () => Promise<boolean>;
    createFarmerNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    associateWithFarmerNftCollection: () => Promise<boolean>;
    createInvestorNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    associateWithInvestorNftCollection: () => Promise<boolean>;
    createFarmNftCollection: (name: string, symbol: string, description: string) => Promise<void>;
    initializePlatform: (details: Omit<PlatformInitializationDetails, 'hcsTopicId'>) => Promise<void>;
    retireCredits: (amount: number) => Promise<void>;
    addService: (serviceData: Omit<Service, 'id' | 'providerId'>) => Promise<boolean>;
    deletePlatformToken: () => Promise<void>;
    deleteNftCollection: (collectionId: string) => Promise<void>;
    deleteMultipleTokens: (tokenIds: string[], logCallback: (message: string) => void) => Promise<{ success: number; failed: number; summary: string }>;
    dissociateMultipleTokens: (tokenIds: string[], userRole: AppRole, logCallback: (message: string) => void) => Promise<{ success: number; failed: number; summary: string }>;
}

export interface NotificationContextType {
    toasts: Notification[];
    notifications: Notification[];
    unreadCount: number;
    isMuted: boolean;
    toggleMute: () => void;
    addNotification: (message: string, type: NotificationType, link?: string) => void;
    removeToast: (id: number) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}