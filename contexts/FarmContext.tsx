

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farm, FarmStatus, Purchase, FarmerNft, AppRole, PlatformTokenInfo, NftCollectionInfo, FarmerNftLevel, Retirement, InvestorNft, InvestorNftLevel, Service, FarmContextType, User } from '../types';
import { useAuth } from './AuthContext';
import { hederaService } from '../services/hederaService';
import { useToast } from './ToastContext';
import { PRACTICES, HECTARE_TO_DUNUM, INVESTOR_IMPACT_LEVELS, FARMER_LEGACY_LEVELS, APPROVAL_THRESHOLD } from '../constants';
import { geminiService } from '../services/geminiService';
import { pinataService } from '../services/pinataService';
import { dMRVService } from '../services/dMRVService';

// MOCK DATA
const initialFarms: Farm[] = [
    {
        id: 'farm_initial_1',
        name: 'Jordan Valley Dates (Sample)',
        farmerId: 'user_farmer', // Belongs to farmer@farm.com
        farmerName: 'farmer@farm.com',
        farmerHederaAccountId: '0.0.7099230',
        location: 'Jericho, Palestine',
        story: 'A sample farm pre-loaded into the system to demonstrate an approved listing.',
        landArea: 120,
        areaUnit: 'dunum',
        cropType: 'Medjool Dates',
        practices: ['efficient_irrigation', 'reduced_fertilizer'],
        imageUrl: 'https://i.ibb.co/68Qx1yY/jordan-valley-dates.jpg',
        totalTons: 150,
        availableTons: 125,
        pricePerTon: 0.85,
        status: FarmStatus.APPROVED,
        investorCount: 1, // Simulating a purchase has happened
        hederaTokenId: '0.0.12345', // Placeholder
        approvalDate: '2024-01-15T10:00:00.000Z',
        approvalScore: 85,
        farmNftTokenId: '0.0.54321', // Placeholder
        farmNftSerialNumber: 1,
        farmNftHashscanUrl: 'https://hashscan.io/testnet/dashboard'
    },
    {
        id: 'farm_initial_2',
        name: 'Ajloun Highlands Orchard (Sample)',
        farmerId: 'user_farmer', // Belongs to farmer@farm.com
        farmerName: 'farmer@farm.com',
        farmerHederaAccountId: '0.0.7099230',
        location: 'Ajloun, Jordan',
        story: 'This is a sample of a farm that was automatically rejected by the dMRV system due to incomplete data.',
        landArea: 30,
        areaUnit: 'dunum',
        cropType: 'Apples',
        practices: [],
        totalTons: 20,
        availableTons: 0,
        pricePerTon: 0.70,
        status: FarmStatus.REJECTED,
        investorCount: 0,
        rejectionReason: 'Farm rejected. Score of 40 is below the required 70.',
        approvalScore: 40
    }
];
const initialFarmerNfts: FarmerNft[] = [];
const initialInvestorNfts: InvestorNft[] = [];
const initialPurchases: Purchase[] = [];
const initialRetirements: Retirement[] = [];
const initialServices: Service[] = [];

type RegisterFarmData = Omit<Farm, 'id' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId' | 'totalTons' | 'availableTons' | 'status' | 'investorCount'>;

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [retirements, setRetirements] = useState<Retirement[]>([]);
    const [farmerNfts, setFarmerNfts] = useState<FarmerNft[]>([]);
    const [investorNfts, setInvestorNfts] = useState<InvestorNft[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [platformTokenInfo, setPlatformTokenInfo] = useState<PlatformTokenInfo | null>(null);
    const [farmerNftCollectionInfo, setFarmerNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [investorNftCollectionInfo, setInvestorNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [farmNftCollectionInfo, setFarmNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hbarToUsdRate, setHbarToUsdRate] = useState(0);

    useEffect(() => {
        setFarms(JSON.parse(localStorage.getItem('agripulse_farms') || JSON.stringify(initialFarms)));
        setPurchases(JSON.parse(localStorage.getItem('agripulse_purchases') || JSON.stringify(initialPurchases)));
        setRetirements(JSON.parse(localStorage.getItem('agripulse_retirements') || JSON.stringify(initialRetirements)));
        setFarmerNfts(JSON.parse(localStorage.getItem('agripulse_farmer_nfts') || JSON.stringify(initialFarmerNfts)));
        setInvestorNfts(JSON.parse(localStorage.getItem('agripulse_investor_nfts') || JSON.stringify(initialInvestorNfts)));
        setServices(JSON.parse(localStorage.getItem('agripulse_services') || JSON.stringify(initialServices)));
        setPlatformTokenInfo(JSON.parse(localStorage.getItem('agripulse_platform_token_info') || 'null'));
        setFarmerNftCollectionInfo(JSON.parse(localStorage.getItem('agripulse_farmer_nft_collection_info') || 'null'));
        setInvestorNftCollectionInfo(JSON.parse(localStorage.getItem('agripulse_investor_nft_collection_info') || 'null'));
        setFarmNftCollectionInfo(JSON.parse(localStorage.getItem('agripulse_farm_nft_collection_info') || 'null'));
        
        const fetchRate = async () => {
            const rate = await hederaService.getHbarToUsdRate();
            setHbarToUsdRate(rate);
        };
        fetchRate();

        setLoading(false);
    }, []);
    
    useEffect(() => { localStorage.setItem('agripulse_farms', JSON.stringify(farms)); }, [farms]);
    useEffect(() => { localStorage.setItem('agripulse_purchases', JSON.stringify(purchases)); }, [purchases]);
    useEffect(() => { localStorage.setItem('agripulse_retirements', JSON.stringify(retirements)); }, [retirements]);
    useEffect(() => { localStorage.setItem('agripulse_farmer_nfts', JSON.stringify(farmerNfts)); }, [farmerNfts]);
    useEffect(() => { localStorage.setItem('agripulse_investor_nfts', JSON.stringify(investorNfts)); }, [investorNfts]);
    useEffect(() => { localStorage.setItem('agripulse_services', JSON.stringify(services)); }, [services]);
    useEffect(() => { localStorage.setItem('agripulse_platform_token_info', JSON.stringify(platformTokenInfo)); }, [platformTokenInfo]);
    useEffect(() => { localStorage.setItem('agripulse_farmer_nft_collection_info', JSON.stringify(farmerNftCollectionInfo)); }, [farmerNftCollectionInfo]);
    useEffect(() => { localStorage.setItem('agripulse_investor_nft_collection_info', JSON.stringify(investorNftCollectionInfo)); }, [investorNftCollectionInfo]);
    useEffect(() => { localStorage.setItem('agripulse_farm_nft_collection_info', JSON.stringify(farmNftCollectionInfo)); }, [farmNftCollectionInfo]);


    const registerFarm = async (farmData: RegisterFarmData) => {
        setError(null);
        if (!user || user.role !== AppRole.FARMER || !user.hederaAccountId) {
            showToast("Only connected farmers can register farms.", "error"); return false;
        }
        if (!platformTokenInfo) {
             showToast("Platform token not created by admin yet.", "error"); return false;
        }
         if (!farmNftCollectionInfo) {
            showToast("Farm NFT Collection for verification has not been created by the admin yet.", "error"); return false;
        }
        // Admin credentials are needed to mint the Farm NFT on behalf of the platform
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            showToast("Platform admin account not found or configured for minting.", "error"); return false;
        }
    
        setLoading(true);
        showToast("Submitting farm for automated dMRV verification...", "info");
    
        try {
            // Step 1: Calculate total tons
            const areaInDunums = farmData.areaUnit === 'hectare' ? farmData.landArea * HECTARE_TO_DUNUM : farmData.landArea;
            const totalEmissionFactor = farmData.practices.reduce((sum, practiceId) => {
                const practice = PRACTICES.find(p => p.id === practiceId);
                return sum + (practice?.emissionFactor || 0);
            }, 0);
            const calculatedTotalTons = Math.round(areaInDunums * totalEmissionFactor);
    
            // Create a complete data object to pass to the verification service
            const tempFarmDataForVerification = {
                ...farmData,
                totalTons: calculatedTotalTons,
                availableTons: calculatedTotalTons, // Assumed for verification logic
                investorCount: 0,
            };
    
            // Step 2: Call dMRV service for automated verification
            const verificationResult = dMRVService.verifyFarm(tempFarmDataForVerification);
    
            const farmId = `farm_${Date.now()}`;
    
            if (verificationResult.isApproved) {
                // Step 3a: If approved, mint the on-chain Farm Verification NFT
                const approvedSupply = farms.filter(f => f.status === FarmStatus.APPROVED).reduce((sum, f) => sum + f.totalTons, 0);
                if (approvedSupply + calculatedTotalTons > platformTokenInfo.initialSupply) {
                    throw new Error(`Approval failed: Requested credits (${calculatedTotalTons}) exceed total token supply.`);
                }
                
                showToast(`Verification score: ${verificationResult.score}/${APPROVAL_THRESHOLD}. Approved! Minting verification NFT...`, "info");
                
                // In a real app, metadata would be more detailed and pinned to IPFS.
                const farmMetadata = `ipfs://AgriPulse-Farm-Verification-v1-${farmId}`; 
    
                const nftResponse = await hederaService.mintAndTransferNft(
                    farmNftCollectionInfo.id,
                    adminUser.hederaAccountId,
                    adminUser.hederaPrivateKey,
                    user.hederaAccountId, // The farmer receives their own farm's NFT
                    farmMetadata
                );
    
                const newFarm: Farm = {
                    ...farmData,
                    id: farmId, farmerId: user.id, farmerName: user.email, farmerHederaAccountId: user.hederaAccountId,
                    totalTons: calculatedTotalTons, availableTons: calculatedTotalTons, status: FarmStatus.APPROVED, investorCount: 0,
                    hederaTokenId: platformTokenInfo.id,
                    approvalDate: new Date().toISOString(),
                    approvalScore: verificationResult.score,
                    farmNftTokenId: farmNftCollectionInfo.id,
                    farmNftSerialNumber: nftResponse.serialNumber,
                    farmNftHashscanUrl: nftResponse.hashscanUrl
                };
                
                setFarms(prev => [...prev, newFarm]);
                showToast(`Farm registered & approved! On-chain verification complete.`, 'success', nftResponse.hashscanUrl);
    
            } else {
                // Step 3b: If rejected, create a rejected record without minting
                const newFarm: Farm = {
                    ...farmData,
                    id: farmId, farmerId: user.id, farmerName: user.email, farmerHederaAccountId: user.hederaAccountId,
                    totalTons: calculatedTotalTons, availableTons: 0, status: FarmStatus.REJECTED, investorCount: 0,
                    hederaTokenId: platformTokenInfo.id,
                    rejectionReason: verificationResult.reason,
                    approvalScore: verificationResult.score,
                };
    
                setFarms(prev => [...prev, newFarm]);
                showToast(verificationResult.reason, 'error');
            }
            
            return true;
        } catch (e: any) {
            showToast(e.message || "Failed to register farm.", "error"); 
            console.error(e); 
            return false;
        } finally { 
            setLoading(false); 
        }
    };

    const purchaseCredits = async (farmId: string, tons: number) => {
        if (!user || user.role !== AppRole.INVESTOR || !user.hederaAccountId || !user.hederaPrivateKey) {
            showToast("Only connected investors can purchase credits.", "error"); return;
        }
        const farm = farms.find(f => f.id === farmId);
        if (!farm || farm.availableTons < tons) {
            showToast("Not enough credits available or farm not found.", "error"); return;
        }
        if (!platformTokenInfo) {
            showToast("Platform token not configured. Contact admin.", "error"); return;
        }

        const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
        const isAssociated = balanceInfo.tokens.some(t => t.tokenId === platformTokenInfo?.id);
        if (!isAssociated) {
            showToast("You must associate with the platform token first. Go to your dashboard.", "error"); return;
        }
        
        // Get Admin credentials from localStorage for the atomic swap.
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            showToast("Platform admin account not found or configured for transactions.", "error"); return;
        }

        const totalPriceUsd = tons * farm.pricePerTon;
        const totalPriceInHbar = hbarToUsdRate > 0 ? totalPriceUsd / hbarToUsdRate : 0;
        if (totalPriceInHbar <= 0) { showToast("Could not calculate HBAR price.", "error"); return; }
        
        setLoading(true);
        
        try {
            // Step 1: Perform Atomic Swap
            const totalPriceInTinybars = Math.ceil(totalPriceInHbar * 100_000_000);
            const swapResponse = await hederaService.executeAtomicSwap(
                user.hederaAccountId,
                user.hederaPrivateKey,
                farm.farmerHederaAccountId,
                adminUser.hederaAccountId,
                adminUser.hederaPrivateKey,
                totalPriceInTinybars,
                platformTokenInfo.id,
                tons
            );

            // Step 2: Create purchase record (now completed)
            const newPurchase: Purchase = {
                id: `purchase_${Date.now()}`, farmId, investorId: user.id, tonsPurchased: tons, totalPrice: totalPriceUsd, totalPriceInHbar: totalPriceInHbar,
                purchaseDate: new Date().toISOString(), 
                hashscanUrl: swapResponse.hashscanUrl, // This is the swap transaction
                tokenTransferStatus: 'COMPLETED',
                tokenTransferTxUrl: swapResponse.hashscanUrl // Both transfers are in one tx
            };
            setPurchases(prev => [...prev, newPurchase]);
            setFarms(prev => prev.map(f => f.id === farmId ? { ...f, availableTons: f.availableTons - tons } : f));
            showToast(`Purchase and credit transfer successful!`, 'success', swapResponse.hashscanUrl);
            
            // Step 3: Award NFTs for the transaction
            showToast("Checking for achievement NFTs...", "info");
            
            const getEmail = (id: string): string => {
                const userEntry = Object.values(allUsers).find((u: any) => u.id === id) as any;
                return userEntry?.email || 'Unknown';
            }
            const getUser = (id: string) => {
                 const email = getEmail(id);
                 return allUsers[email];
            }
            const investor = getUser(newPurchase.investorId);

            // Award Investor NFT
            const investorLevel = [...INVESTOR_IMPACT_LEVELS].reverse().find(l => tons >= l.tonsThreshold);
            if (investorLevel && investorNftCollectionInfo) {
                try {
                    showToast('Generating unique artwork for investor...', 'info');
                    const investorPrompt = `NFT artwork for a digital certificate representing a farm purchase of ${tons} tons from '${farm.name}'. Clean, elegant blockchain certificate style with ${investorLevel.rarity.toLowerCase()} tones, futuristic layout, abstract farm background.`;
                    const base64Image = await geminiService.generateNftImage(investorPrompt);

                    showToast('Uploading investor artwork to IPFS...', 'info');
                    const imageCid = await pinataService.uploadImageToIpfs(base64Image, `investor_nft_${newPurchase.id}.png`);
                    const imageUrl = `ipfs://${imageCid}`;

                    const metadataObject = geminiService.generateNftMetadata({
                        purchaseId: newPurchase.id, farmName: farm.name, tons, nftType: 'investor', recipientEmail: investor.email, imageUrl,
                        investorAccountId: investor.hederaAccountId,
                        farmerAccountId: farm.farmerHederaAccountId
                    });
                    
                    showToast('Uploading investor metadata to IPFS...', 'info');
                    const metadataCid = await pinataService.uploadJsonToIpfs(metadataObject);
                    const onChainMetadata = `ipfs://${metadataCid}`;

                    showToast('Minting investor NFT on Hedera...', 'info');
                    const nftResponse = await hederaService.mintAndTransferNft(investorNftCollectionInfo.id, adminUser.hederaAccountId, adminUser.hederaPrivateKey, investor.hederaAccountId, onChainMetadata);
                    
                    const newNft: InvestorNft = {
                        id: `inft_${Date.now()}`, investorId: newPurchase.investorId, nftLevelId: investorLevel.id, 
                        mintDate: new Date().toISOString(), hederaTokenId: investorNftCollectionInfo.id,
                        hederaSerialNumber: nftResponse.serialNumber, hashscanUrl: nftResponse.hashscanUrl,
                        purchaseId: newPurchase.id, tons: tons, farmName: farm.name,
                        metadataUrl: onChainMetadata
                    };
                    setInvestorNfts(prev => [...prev, newNft]);
                    showToast(`Awarded ${investorLevel.name} to investor!`, 'success', nftResponse.hashscanUrl);

                } catch (e: any) { showToast(`Investor NFT Award Failed: ${e.message}`, "error"); }
            }
            
            // Award Farmer NFT
            const farmerLevel = [...FARMER_LEGACY_LEVELS].reverse().find(l => tons >= l.tonsThreshold);
            if (farmerLevel && farmerNftCollectionInfo) {
                const farmer = getUser(farm.farmerId);
                if (farmer && farmer.hederaAccountId) {
                    try {
                        showToast('Generating unique artwork for farmer...', 'info');
                        const farmerPrompt = `NFT artwork for a digital badge representing a farm sale of ${tons} tons from '${farm.name}'. Clean, elegant blockchain badge style with ${farmerLevel.rarity.toLowerCase()} tones, futuristic layout, abstract farm background.`;
                        const base64Image = await geminiService.generateNftImage(farmerPrompt);

                        showToast('Uploading farmer artwork to IPFS...', 'info');
                        const imageCid = await pinataService.uploadImageToIpfs(base64Image, `farmer_nft_${newPurchase.id}.png`);
                        const imageUrl = `ipfs://${imageCid}`;

                        const metadataObject = geminiService.generateNftMetadata({
                            purchaseId: newPurchase.id, farmName: farm.name, tons, nftType: 'farmer', recipientEmail: getEmail(newPurchase.investorId), imageUrl,
                            investorAccountId: investor.hederaAccountId,
                            farmerAccountId: farm.farmerHederaAccountId
                        });

                        showToast('Uploading farmer metadata to IPFS...', 'info');
                        const metadataCid = await pinataService.uploadJsonToIpfs(metadataObject);
                        const onChainMetadata = `ipfs://${metadataCid}`;

                        showToast('Minting farmer NFT on Hedera...', 'info');
                        const nftResponse = await hederaService.mintAndTransferNft(farmerNftCollectionInfo.id, adminUser.hederaAccountId, adminUser.hederaPrivateKey, farmer.hederaAccountId, onChainMetadata);
                        
                        const newNft: FarmerNft = {
                            id: `fnft_${Date.now()}`, farmerId: farm.farmerId, nftLevelId: farmerLevel.id,
                            mintDate: new Date().toISOString(), hederaTokenId: farmerNftCollectionInfo.id,
                            hederaSerialNumber: nftResponse.serialNumber, hashscanUrl: nftResponse.hashscanUrl,
                            purchaseId: newPurchase.id, tons: tons, investorEmail: getEmail(newPurchase.investorId),
                            metadataUrl: onChainMetadata
                        };
                        setFarmerNfts(prev => [...prev, newNft]);
                        showToast(`Awarded ${farmerLevel.name} to farmer!`, 'success', nftResponse.hashscanUrl);
                    } catch (e: any) { showToast(`Farmer NFT Award Failed: ${e.message}`, "error"); }
                }
            }
        } catch (e: any) {
            showToast(e.message || "Purchase failed.", "error"); console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const createPlatformToken = async (name: string, symbol: string, initialSupply: number) => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            showToast("Only a connected Admin can create the token.", "error"); return;
        }
        setLoading(true);
        try {
            const response = await hederaService.createRealFungibleToken(name, symbol, initialSupply, user.hederaAccountId, user.hederaPrivateKey);
            const newPlatformToken: PlatformTokenInfo = { id: response.tokenId, name, symbol, initialSupply };
            setPlatformTokenInfo(newPlatformToken);
            setFarms([]); setPurchases([]); setFarmerNfts([]); setRetirements([]); setInvestorNfts([]);
            showToast(`Token ${response.tokenId} created & marketplace reset!`, 'success', response.hashscanUrl);
        } catch(e: any) {
            showToast(e.message || "Failed to create platform token.", "error"); console.error(e);
        } finally { setLoading(false); }
    }

    const associateWithPlatformToken = async () => {
        if (!user || !user.hederaAccountId || !user.hederaPrivateKey || !platformTokenInfo) {
            showToast("Connect wallet first; token must exist.", "error"); return;
        }
        setLoading(true);
        try {
            const response = await hederaService.associateToken(user.hederaAccountId, user.hederaPrivateKey, platformTokenInfo.id);
            if (response.alreadyAssociated) {
                 showToast("You are already associated with the platform token.", 'info');
            } else {
                 showToast("Successfully associated with platform token!", 'success', response.hashscanUrl);
            }
        } catch(e: any) { showToast(e.message || "Association failed.", "error");
        } finally { setLoading(false); }
    };
    
    // --- FARMER NFT ---
    const createFarmerNftCollection = async (name: string, symbol: string, description: string) => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
        setLoading(true);
        try {
            const response = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
            setFarmerNftCollectionInfo({ id: response.tokenId, name, symbol });
            showToast(`Farmer NFT Collection created!`, 'success', response.hashscanUrl);
        } catch (e: any) { showToast(e.message || "Failed to create NFT collection.", "error"); } 
        finally { setLoading(false); }
    };
    
    const associateWithFarmerNftCollection = async () => {
        if (!user || !user.hederaAccountId || !user.hederaPrivateKey || !farmerNftCollectionInfo) return;
        setLoading(true);
        try {
            const response = await hederaService.associateToken(user.hederaAccountId, user.hederaPrivateKey, farmerNftCollectionInfo.id);
            if (response.alreadyAssociated) {
                 showToast("Already associated with Farmer NFT collection.", 'info');
            } else {
                 showToast("Associated with Farmer NFT collection!", 'success', response.hashscanUrl);
            }
        } catch (e: any) { showToast(e.message || "Association failed.", "error"); } 
        finally { setLoading(false); }
    };
    
    // --- INVESTOR NFT ---
    const createInvestorNftCollection = async (name: string, symbol: string, description: string) => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
        setLoading(true);
        try {
            const response = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
            setInvestorNftCollectionInfo({ id: response.tokenId, name, symbol });
            showToast(`Investor NFT Collection created!`, 'success', response.hashscanUrl);
        } catch (e: any) { showToast(e.message || "Failed to create NFT collection.", "error"); }
        finally { setLoading(false); }
    };

    const associateWithInvestorNftCollection = async () => {
        if (!user || !user.hederaAccountId || !user.hederaPrivateKey || !investorNftCollectionInfo) return;
        setLoading(true);
        try {
            const response = await hederaService.associateToken(user.hederaAccountId, user.hederaPrivateKey, investorNftCollectionInfo.id);
            if (response.alreadyAssociated) {
                 showToast("Already associated with Investor NFT collection.", 'info');
            } else {
                showToast("Associated with Investor NFT collection!", 'success', response.hashscanUrl);
            }
        } catch (e: any) { showToast(e.message || "Association failed.", "error"); }
        finally { setLoading(false); }
    };

    // --- FARM NFT ---
    const createFarmNftCollection = async (name: string, symbol: string, description: string) => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
        setLoading(true);
        try {
            const response = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
            setFarmNftCollectionInfo({ id: response.tokenId, name, symbol });
            showToast(`Farm NFT Collection created!`, 'success', response.hashscanUrl);
        } catch (e: any) { showToast(e.message || "Failed to create Farm NFT collection.", "error"); } 
        finally { setLoading(false); }
    };


    const retireCredits = async (amount: number) => {
        if (user?.role !== AppRole.INVESTOR || !user.hederaAccountId || !user.hederaPrivateKey || !platformTokenInfo) {
            showToast("Only a connected investor can retire credits.", "error"); return;
        }
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as any;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            showToast("Admin credentials not found for wiping. This is a demo limitation.", "error"); return;
        }
        setLoading(true);
        try {
            const response = await hederaService.wipeTokens(adminUser.hederaAccountId, adminUser.hederaPrivateKey, user.hederaAccountId, platformTokenInfo.id, amount);
            const newRetirement: Retirement = {
                id: `retire_${Date.now()}`, investorId: user.id, amount, retirementDate: new Date().toISOString(), hashscanUrl: response.hashscanUrl,
            };
            setRetirements(prev => [...prev, newRetirement]);
            showToast(`${amount} credits successfully retired!`, 'success', response.hashscanUrl);
        } catch (e: any) {
            showToast(e.message || "Failed to retire credits.", "error");
        } finally { setLoading(false); }
    };

    const addService = async (serviceData: Omit<Service, 'id' | 'providerId'>) => {
        if (!user || user.role !== AppRole.SERVICE_PROVIDER) {
            showToast("Only Service Providers can add services.", "error");
            return false;
        }
        setLoading(true);
        try {
            const newService: Service = {
                ...serviceData,
                id: `service_${Date.now()}`,
                providerId: user.id,
            };
            setServices(prev => [...prev, newService]);
            showToast("Service listed successfully!", "success");
            return true;
        } catch (e) {
            console.error(e);
            showToast("Failed to list service.", "error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deletePlatformToken = async () => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey || !platformTokenInfo) {
            showToast("Only a connected Admin can delete the token.", "error"); return;
        }
        setLoading(true);
        try {
            const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
            const tokenHolders = new Set<string>();
            purchases.forEach(p => {
                const investor = Object.values(allUsers).find((u: any) => u.id === p.investorId) as any;
                if (investor && investor.hederaAccountId) {
                    tokenHolders.add(investor.hederaAccountId);
                }
            });

            for (const accountId of tokenHolders) {
                const balanceInfo = await hederaService.getRealAccountBalance(accountId);
                const token = balanceInfo.tokens.find(t => t.tokenId === platformTokenInfo.id);
                if (token && token.balance > 0) {
                    showToast(`Wiping ${token.balance} ${platformTokenInfo.symbol} from ${accountId}...`, 'info');
                    await hederaService.wipeTokens(user.hederaAccountId, user.hederaPrivateKey, accountId, platformTokenInfo.id, token.balance);
                }
            }
            
            showToast('All circulating tokens wiped. Now deleting token...', 'info');
            const response = await hederaService.deleteToken(platformTokenInfo.id, user.hederaAccountId, user.hederaPrivateKey);
            showToast(`Platform token ${platformTokenInfo.symbol} deleted successfully!`, 'success', response.hashscanUrl);
            
            // Reset state
            setPlatformTokenInfo(null);
            setFarms([]); setPurchases([]); setFarmerNfts([]); setInvestorNfts([]); setRetirements([]);

        } catch (e: any) {
            showToast(e.message || "Failed to delete platform token.", "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteNftCollection = async (collectionId: string) => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            showToast("Only a connected Admin can delete collections.", "error"); return;
        }
        setLoading(true);
        try {
            let nftsToBurn: { serial: number }[] = [];
            let collectionName = '';

            if (collectionId === farmerNftCollectionInfo?.id) {
                nftsToBurn = farmerNfts.map(n => ({ serial: n.hederaSerialNumber }));
                collectionName = farmerNftCollectionInfo.name;
            } else if (collectionId === investorNftCollectionInfo?.id) {
                nftsToBurn = investorNfts.map(n => ({ serial: n.hederaSerialNumber }));
                 collectionName = investorNftCollectionInfo.name;
            } else if (collectionId === farmNftCollectionInfo?.id) {
                nftsToBurn = farms.filter(f => f.farmNftSerialNumber).map(f => ({ serial: f.farmNftSerialNumber! }));
                 collectionName = farmNftCollectionInfo.name;
            }
            
            if (nftsToBurn.length > 0) {
                showToast(`Burning ${nftsToBurn.length} NFTs from ${collectionName}...`, 'info');
                // Batch burn in chunks of 10
                for (let i = 0; i < nftsToBurn.length; i += 10) {
                    const batch = nftsToBurn.slice(i, i + 10).map(n => n.serial);
                    await hederaService.burnNftBatch(collectionId, batch, user.hederaAccountId, user.hederaPrivateKey);
                }
            }


            showToast('All NFTs burned. Now deleting collection...', 'info');
            const response = await hederaService.deleteToken(collectionId, user.hederaAccountId, user.hederaPrivateKey);
            showToast(`NFT Collection ${collectionName} deleted successfully!`, 'success', response.hashscanUrl);
            
            // Reset state
            if (collectionId === farmerNftCollectionInfo?.id) { setFarmerNftCollectionInfo(null); setFarmerNfts([]); }
            if (collectionId === investorNftCollectionInfo?.id) { setInvestorNftCollectionInfo(null); setInvestorNfts([]); }
            if (collectionId === farmNftCollectionInfo?.id) { setFarmNftCollectionInfo(null); setFarms(farms.map(f => ({...f, farmNftSerialNumber: undefined, farmNftHashscanUrl: undefined, farmNftTokenId: undefined}))); }

        } catch (e: any) {
            showToast(e.message || "Failed to delete NFT collection.", "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteMultipleTokens = async (tokenIds: string[], logCallback: (message: string) => void): Promise<{ success: number; failed: number; summary: string }> => {
        if (user?.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            const message = "ERROR: Only a connected Admin can delete tokens.";
            logCallback(message);
            return { success: 0, failed: tokenIds.length, summary: message };
        }
    
        let successCount = 0;
        let failedCount = 0;
    
        for (const tokenId of tokenIds) {
            try {
                logCallback(`Analyzing token ${tokenId}...`);
                const tokenInfo = await hederaService.getTokenInfo(tokenId);
                
                const adminKey = await hederaService.getPublicKey(user.hederaPrivateKey);
                if (tokenInfo.admin_key?.key !== adminKey) {
                    throw new Error("KEY MISMATCH. You are not the admin for this token.");
                }

                if (tokenInfo.type === 'NON_FUNGIBLE_UNIQUE') {
                    logCallback(`NFT Collection detected. Fetching all serials...`);
                    const allNfts = await hederaService.getAllNftsForCollection(tokenId);
                    logCallback(`Found ${allNfts.length} NFTs to burn.`);
                    if (allNfts.length > 0) {
                        for (let i = 0; i < allNfts.length; i += 10) {
                            const batch = allNfts.slice(i, i + 10).map(n => n.serial_number);
                            logCallback(`Burning NFT batch ${i/10 + 1}...`);
                            await hederaService.burnNftBatch(tokenId, batch, user.hederaAccountId, user.hederaPrivateKey);
                        }
                    }
                } else if (tokenInfo.type === 'FUNGIBLE_COMMON') {
                    logCallback(`Fungible Token detected. Fetching all holders...`);
                    const allHolders = await hederaService.getAllTokenHolders(tokenId);
                    logCallback(`Found ${allHolders.length} holders to wipe.`);
                    for (const holder of allHolders) {
                        if (holder.account_id !== tokenInfo.treasury_account_id) {
                            logCallback(`Wiping ${holder.balance} from ${holder.account_id}...`);
                            await hederaService.wipeTokens(user.hederaAccountId, user.hederaPrivateKey, holder.account_id, tokenId, holder.balance);
                        }
                    }
                }
    
                logCallback(`All assets cleared for ${tokenId}. Deleting token definition...`);
                await hederaService.deleteToken(tokenId, user.hederaAccountId, user.hederaPrivateKey);
                logCallback(`SUCCESS: Token ${tokenId} deleted successfully!`);
                successCount++;
    
            } catch (err: any) {
                logCallback(`ERROR deleting ${tokenId}: ${err.message}`);
                failedCount++;
            }
        }
    
        const summary = `Operation finished. Successfully deleted: ${successCount}. Failed: ${failedCount}.`;
        return { success: successCount, failed: failedCount, summary };
    };

    const dissociateMultipleTokens = async (tokenIds: string[], userRole: AppRole, logCallback: (message: string) => void): Promise<{ success: number; failed: number; summary: string }> => {
        if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
            const message = "ERROR: You must be logged in and have a wallet connected.";
            logCallback(message);
            return { success: 0, failed: tokenIds.length, summary: message };
        }
    
        let successCount = 0;
        let failedCount = 0;
    
        // Find the admin user to transfer assets back to them
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as any;
        if (!adminUser || !adminUser.hederaAccountId) {
            const message = "Could not find platform admin account to return assets to.";
            logCallback(message);
            return { success: 0, failed: tokenIds.length, summary: message };
        }
    
        logCallback("Analyzing assets to return to treasury...");
        const assetsToTransfer: { tokenId: string; amount?: number; serials?: number[] }[] = [];
    
        for (const tokenId of tokenIds) {
            try {
                const tokenInfo = await hederaService.getTokenInfo(tokenId);
                if (tokenInfo.type === 'FUNGIBLE_COMMON') {
                    const balance = await hederaService.getRealAccountBalance(user.hederaAccountId);
                    const tokenBalance = balance.tokens.find(t => t.tokenId === tokenId)?.balance || 0;
                    if (tokenBalance > 0) {
                        logCallback(`Found ${tokenBalance} of fungible token ${tokenId} to transfer.`);
                        assetsToTransfer.push({ tokenId, amount: tokenBalance });
                    }
                } else if (tokenInfo.type === 'NON_FUNGIBLE_UNIQUE') {
                    const nfts = await hederaService.getNftsForAccountInCollection(user.hederaAccountId, tokenId);
                    if (nfts.length > 0) {
                        logCallback(`Found ${nfts.length} NFTs from collection ${tokenId} to transfer.`);
                        assetsToTransfer.push({ tokenId, serials: nfts.map(n => n.serial_number) });
                    }
                }
            } catch (err: any) {
                logCallback(`ERROR analyzing token ${tokenId}: ${err.message}`);
            }
        }
    
        try {
            if (assetsToTransfer.length > 0) {
                logCallback(`Transferring ${assetsToTransfer.length} asset type(s) back to admin treasury...`);
                await hederaService.transferAssetsBackToAdmin(user.hederaAccountId, user.hederaPrivateKey, adminUser.hederaAccountId, assetsToTransfer);
                logCallback("Asset transfer successful.");
            } else {
                logCallback("No assets with a balance found. Proceeding to dissociation.");
            }
    
            logCallback(`Attempting to DISSOCIATE ${tokenIds.length} token(s)...`);
            await hederaService.dissociateTokens(user.hederaAccountId, user.hederaPrivateKey, tokenIds);
            logCallback("Dissociation transaction submitted successfully.");
            successCount = tokenIds.length;
    
        } catch (err: any) {
            logCallback(`ERROR during operation: ${err.message}`);
            failedCount = tokenIds.length;
        }
    
        const summary = `Operation finished. Successfully dissociated: ${successCount}. Failed: ${failedCount}.`;
        return { success: successCount, failed: failedCount, summary };
    };
    
    return (
        <FarmContext.Provider value={{ 
            farms, purchases, retirements, farmerNfts, investorNfts, services,
            platformTokenInfo, farmerNftCollectionInfo, investorNftCollectionInfo, farmNftCollectionInfo,
            loading, error, hbarToUsdRate, 
            registerFarm, purchaseCredits, 
            createPlatformToken, associateWithPlatformToken,
            createFarmerNftCollection, associateWithFarmerNftCollection,
            createInvestorNftCollection, associateWithInvestorNftCollection,
            createFarmNftCollection,
            retireCredits,
            addService,
            deletePlatformToken,
            deleteNftCollection,
            deleteMultipleTokens,
            dissociateMultipleTokens
        }}>
            {children}
        </FarmContext.Provider>
    );
};

export const useFarm = (): FarmContextType => {
    const context = useContext(FarmContext);
    if (context === undefined) {
        throw new Error('useFarm must be used within a FarmProvider');
    }
    return context;
};