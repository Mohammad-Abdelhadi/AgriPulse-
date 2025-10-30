import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farm, FarmStatus, Purchase, FarmerNft, AppRole, PlatformTokenInfo, NftCollectionInfo, FarmerNftLevel, Retirement, InvestorNft, InvestorNftLevel, FarmContextType, User, PlatformInitializationDetails } from '../types';
import { useAuth } from './AuthContext';
import { hederaService } from '../services/hederaService';
import { useNotification } from './NotificationContext';
import { PRACTICES, HECTARE_TO_DUNUM, INVESTOR_IMPACT_LEVELS, FARMER_LEGACY_LEVELS, APPROVAL_THRESHOLD, UNIFIED_NFT_IMAGE_URL, DEDICATED_IPFS_GATEWAY_URL } from '../constants';
import { geminiService } from '../services/geminiService';
import { pinataService } from '../services/pinataService';
import { dMRVService } from '../services/dMRVService';

// MOCK DATA REMOVED FOR DYNAMIC PLATFORM
const initialFarmerNfts: FarmerNft[] = [];
const initialInvestorNfts: InvestorNft[] = [];
const initialPurchases: Purchase[] = [];
const initialRetirements: Retirement[] = [];

type RegisterFarmData = Omit<Farm, 'id' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId' | 'totalTons' | 'availableTons' | 'status' | 'investorCount' | 'certificateIpfsUrl'>;

const FarmContext = createContext<FarmContextType | undefined>(undefined);

// Helper function to safely parse JSON from localStorage, preventing crashes from corrupted data.
const safeJsonParse = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;
        return JSON.parse(item) as T;
    } catch (e) {
        console.warn(`Could not parse JSON from localStorage for key "${key}". Clearing corrupted data and using default value.`, e);
        // Clear the corrupted item to prevent future errors
        localStorage.removeItem(key); 
        return defaultValue;
    }
};


export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [retirements, setRetirements] = useState<Retirement[]>([]);
    const [farmerNfts, setFarmerNfts] = useState<FarmerNft[]>([]);
    const [investorNfts, setInvestorNfts] = useState<InvestorNft[]>([]);
    const [platformTokenInfo, setPlatformTokenInfo] = useState<PlatformTokenInfo | null>(null);
    const [farmerNftCollectionInfo, setFarmerNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [investorNftCollectionInfo, setInvestorNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [farmNftCollectionInfo, setFarmNftCollectionInfo] = useState<NftCollectionInfo | null>(null);
    const [hcsTopicId, setHcsTopicId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hbarToUsdRate, setHbarToUsdRate] = useState(0);
    const [userBalance, setUserBalance] = useState<{ hbar: number, tokens: { tokenId: string, balance: number }[] } | null>(null);

    const refreshUserBalance = async () => {
        if (user?.hederaAccountId) {
            console.log("Refreshing user balance...");
            const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
            setUserBalance(balanceInfo);
        } else {
            setUserBalance(null);
        }
    };

    useEffect(() => {
        // FIX: Replaced direct JSON.parse with a safe parsing utility to prevent app crashes from corrupted localStorage data.
        setFarms(safeJsonParse('agripulse_farms', []));
        setPurchases(safeJsonParse('agripulse_purchases', initialPurchases));
        setRetirements(safeJsonParse('agripulse_retirements', initialRetirements));
        setFarmerNfts(safeJsonParse('agripulse_farmer_nfts', initialFarmerNfts));
        setInvestorNfts(safeJsonParse('agripulse_investor_nfts', initialInvestorNfts));
        setPlatformTokenInfo(safeJsonParse<PlatformTokenInfo | null>('agripulse_platform_token_info', null));
        setFarmerNftCollectionInfo(safeJsonParse<NftCollectionInfo | null>('agripulse_farmer_nft_collection_info', null));
        setInvestorNftCollectionInfo(safeJsonParse<NftCollectionInfo | null>('agripulse_investor_nft_collection_info', null));
        setFarmNftCollectionInfo(safeJsonParse<NftCollectionInfo | null>('agripulse_farm_nft_collection_info', null));
        setHcsTopicId(safeJsonParse<string | null>('agripulse_hcs_topic_id', null));
        
        const fetchRate = async () => {
            const rate = await hederaService.getHbarToUsdRate();
            setHbarToUsdRate(rate);
        };
        fetchRate();

        setLoading(false);
    }, []);

    useEffect(() => {
        refreshUserBalance();
    }, [user]);
    
    useEffect(() => { localStorage.setItem('agripulse_farms', JSON.stringify(farms)); }, [farms]);
    useEffect(() => { localStorage.setItem('agripulse_purchases', JSON.stringify(purchases)); }, [purchases]);
    useEffect(() => { localStorage.setItem('agripulse_retirements', JSON.stringify(retirements)); }, [retirements]);
    useEffect(() => { localStorage.setItem('agripulse_farmer_nfts', JSON.stringify(farmerNfts)); }, [farmerNfts]);
    useEffect(() => { localStorage.setItem('agripulse_investor_nfts', JSON.stringify(investorNfts)); }, [investorNfts]);
    useEffect(() => { localStorage.setItem('agripulse_platform_token_info', JSON.stringify(platformTokenInfo)); }, [platformTokenInfo]);
    useEffect(() => { localStorage.setItem('agripulse_farmer_nft_collection_info', JSON.stringify(farmerNftCollectionInfo)); }, [farmerNftCollectionInfo]);
    useEffect(() => { localStorage.setItem('agripulse_investor_nft_collection_info', JSON.stringify(investorNftCollectionInfo)); }, [investorNftCollectionInfo]);
    useEffect(() => { localStorage.setItem('agripulse_farm_nft_collection_info', JSON.stringify(farmNftCollectionInfo)); }, [farmNftCollectionInfo]);
    useEffect(() => { localStorage.setItem('agripulse_hcs_topic_id', JSON.stringify(hcsTopicId)); }, [hcsTopicId]);

    const registerFarm = async (farmData: RegisterFarmData, certificate: { mimeType: string; data: string; } | null): Promise<Farm | null> => {
        setError(null);
        if (!user || user.role !== AppRole.FARMER || !user.hederaAccountId) {
            addNotification("Only connected farmers can register farms.", "error"); return null;
        }
        if (!platformTokenInfo || !farmNftCollectionInfo || !hcsTopicId) {
             addNotification("Platform has not been fully initialized by the admin yet.", "error"); return null;
        }
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            addNotification("Platform admin account not found or configured for minting.", "error"); return null;
        }
    
        setLoading(true);
        addNotification("Submitting farm for automated dMRV verification...", "info");
    
        try {
            const areaInDunums = farmData.areaUnit === 'hectare' ? farmData.landArea * HECTARE_TO_DUNUM : farmData.landArea;
            const totalEmissionFactor = farmData.practices.reduce((sum, practiceId) => {
                const practice = PRACTICES.find(p => p.id === practiceId);
                return sum + (practice?.emissionFactor || 0);
            }, 0);
            const calculatedTotalTons = Math.round(areaInDunums * totalEmissionFactor);
    
            const tempFarmDataForVerification = { ...farmData, totalTons: calculatedTotalTons, availableTons: calculatedTotalTons, investorCount: 0 };
            const verificationResult = await dMRVService.verifyFarm(tempFarmDataForVerification, certificate);
    
            const farmId = `farm_${Date.now()}`;

            addNotification("Recording verification decision on-chain...", "info");
            
            const hcsSummaryMessage = {
                farmId: farmId,
                farmer: user.hederaAccountId,
                decision: verificationResult.isApproved ? 'APPROVED' : 'REJECTED',
                score: verificationResult.score,
                reason: verificationResult.reason,
                timestamp: new Date().toISOString(),
            };

            const finalMessageString = JSON.stringify(hcsSummaryMessage);
            
            const hcsResponse = await hederaService.submitHcsMessage(hcsTopicId, finalMessageString, adminUser.hederaAccountId, adminUser.hederaPrivateKey);

            if (verificationResult.isApproved) {
                addNotification(`Verification score: ${verificationResult.score}. Approved! Storing data on IPFS...`, "info");
                
                let certificateIpfsUrl: string | undefined = undefined;
                if (certificate) {
                    addNotification("Uploading ownership certificate to IPFS...", "info");
                    const certCid = await pinataService.uploadFileToIpfs(certificate.data, `certificate_${farmId}.pdf`, certificate.mimeType);
                    certificateIpfsUrl = `${DEDICATED_IPFS_GATEWAY_URL}${certCid}`;
                }

                const farmOffChainData = { name: farmData.name, story: farmData.story, location: farmData.location, cropType: farmData.cropType, landArea: farmData.landArea, areaUnit: farmData.areaUnit, practices: farmData.practices.map(pId => PRACTICES.find(p => p.id === pId)?.name || pId), certificateIpfsUrl };
                const farmDataCid = await pinataService.uploadJsonToIpfs(farmOffChainData);
                const practicesString = farmData.practices.map(pId => PRACTICES.find(p => p.id === pId)?.name || pId).join(', ');

                const nftMetadata = {
                    name: `AgriPulse Farm Certificate: ${farmData.name}`, description: `A unique, on-chain certificate verifying that "${farmData.name}" has been approved on the AgriPulse platform. This NFT represents the farm's identity and its commitment to sustainable agriculture. Full story: ${farmData.story}`, image: UNIFIED_NFT_IMAGE_URL,
                    attributes: [
                        { "trait_type": "Farm ID", "value": farmId }, { "trait_type": "Farmer Account", "value": user.hederaAccountId }, { "trait_type": "Location", "value": farmData.location }, { "trait_type": "Crop Type", "value": farmData.cropType }, { "trait_type": "Land Area", "value": `${farmData.landArea} ${farmData.areaUnit}(s)` }, { "trait_type": "Sustainable Practices", "value": practicesString }, { "trait_type": "Est. Annual Credits", "value": `${calculatedTotalTons} CO₂e` }, { "trait_type": "Price per Credit", "value": `$${farmData.pricePerTon.toFixed(2)}` }, { "trait_type": "Approval Score", "value": verificationResult.score }, { "trait_type": "dMRV HCS Log", "value": hcsResponse.hashscanUrl }, { "trait_type": "Full Data CID", "value": `ipfs://${farmDataCid}` },
                         ...(certificateIpfsUrl ? [{ "trait_type": "Ownership Certificate", "value": certificateIpfsUrl }] : [])
                    ]
                };
                const metadataCid = await pinataService.uploadJsonToIpfs(nftMetadata);
                const onChainMetadataUrl = `ipfs://${metadataCid}`;
                
                addNotification("Minting Farm Verification NFT...", "info");
                const nftResponse = await hederaService.mintAndTransferNft(farmNftCollectionInfo.id, adminUser.hederaAccountId, adminUser.hederaPrivateKey, user.hederaAccountId, onChainMetadataUrl);
    
                addNotification("Minting new carbon credits to treasury...", "info");
                const mintResponse = await hederaService.mintFungibleTokens(platformTokenInfo.id, calculatedTotalTons, adminUser.hederaAccountId, adminUser.hederaPrivateKey);
                setPlatformTokenInfo(prev => prev ? ({ ...prev, totalSupply: mintResponse.newTotalSupply }) : null);

                const newFarm: Farm = {
                    ...farmData, id: farmId, farmerId: user.id, farmerName: user.email, farmerHederaAccountId: user.hederaAccountId, totalTons: calculatedTotalTons, availableTons: calculatedTotalTons, status: FarmStatus.APPROVED, investorCount: 0, hederaTokenId: platformTokenInfo.id, approvalDate: new Date().toISOString(), approvalScore: verificationResult.score, farmNftTokenId: farmNftCollectionInfo.id, farmNftSerialNumber: nftResponse.serialNumber, farmNftHashscanUrl: nftResponse.hashscanUrl, farmNftMetadataUrl: onChainMetadataUrl, hcsLog: hcsResponse.hashscanUrl, certificateIpfsUrl: certificateIpfsUrl,
                };
                
                setFarms(prev => [...prev, newFarm]);
                addNotification(`Farm registered & credits minted!`, 'success', nftResponse.hashscanUrl);
                return newFarm;
    
            } else {
                const newFarm: Farm = {
                    ...farmData, id: farmId, farmerId: user.id, farmerName: user.email, farmerHederaAccountId: user.hederaAccountId, totalTons: calculatedTotalTons, availableTons: 0, status: FarmStatus.REJECTED, investorCount: 0, hederaTokenId: platformTokenInfo.id, rejectionReason: verificationResult.reason, approvalScore: verificationResult.score, hcsLog: hcsResponse.hashscanUrl
                };
    
                setFarms(prev => [...prev, newFarm]);
                addNotification(verificationResult.reason, 'error', hcsResponse.hashscanUrl);
                return null;
            }
        } catch (e: any) {
            addNotification(e.message || "Failed to register farm.", "error"); 
            console.error(e); 
            return null;
        } finally { 
            setLoading(false); 
        }
    };

    const purchaseCredits = async (farmId: string, tons: number) => {
        if (!user || user.role !== AppRole.INVESTOR || !user.hederaAccountId || !user.hederaPrivateKey) {
            addNotification("Only connected investors can purchase credits.", "error"); return;
        }
        const farm = farms.find(f => f.id === farmId);
        if (!farm || farm.availableTons < tons) {
            addNotification("Not enough credits available or farm not found.", "error"); return;
        }
        if (!platformTokenInfo) {
            addNotification("Platform token not configured. Contact admin.", "error"); return;
        }

        const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
        const isAssociated = balanceInfo.tokens.some(t => t.tokenId === platformTokenInfo?.id);
        if (!isAssociated) {
            addNotification("You must associate with the platform token first. Go to your dashboard.", "error"); return;
        }
        
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            addNotification("Platform admin account not found or configured for transactions.", "error"); return;
        }

        const totalPriceUsd = tons * farm.pricePerTon;
        const totalPriceInHbar = hbarToUsdRate > 0 ? totalPriceUsd / hbarToUsdRate : 0;
        if (totalPriceInHbar <= 0) { addNotification("Could not calculate HBAR price.", "error"); return; }
        
        setLoading(true);
        
        try {
            const totalPriceInTinybars = Math.ceil(totalPriceInHbar * 100_000_000);
            const swapResponse = await hederaService.executeAtomicSwap(user.hederaAccountId, user.hederaPrivateKey, farm.farmerHederaAccountId, adminUser.hederaAccountId, adminUser.hederaPrivateKey, totalPriceInTinybars, platformTokenInfo.id, tons);

            const newPurchase: Purchase = {
                id: `purchase_${Date.now()}`, farmId, investorId: user.id, tonsPurchased: tons, totalPrice: totalPriceUsd, totalPriceInHbar: totalPriceInHbar, purchaseDate: new Date().toISOString(), hashscanUrl: swapResponse.hashscanUrl, tokenTransferStatus: 'COMPLETED', tokenTransferTxUrl: swapResponse.hashscanUrl, investorEmail: user.email,
            };
            setPurchases(prev => [...prev, newPurchase]);
            setFarms(prev => prev.map(f => f.id === farmId ? { ...f, availableTons: f.availableTons - tons } : f));
            
            addNotification(`Purchase and credit transfer successful!`, 'success', swapResponse.hashscanUrl);
            
            await new Promise(resolve => setTimeout(resolve, 4000));
            await refreshUserBalance();

            addNotification("Checking for achievement NFTs...", "info");
            
            const getUser = (id: string): User | undefined => Object.values(allUsers).find((u: any) => u.id === id) as User;
            const investor = getUser(newPurchase.investorId);
            const farmer = getUser(farm.farmerId);

            let investorNftImageUrl = UNIFIED_NFT_IMAGE_URL;
            try {
                addNotification("Generating unique investor NFT certificate with AI...", "info");
                const generatedImageB64 = await geminiService.generateInvestorNftImage(tons);
                addNotification("Uploading unique artwork to IPFS...", "info");
                const nftImageCid = await pinataService.uploadFileToIpfs(generatedImageB64, `investor_nft_${newPurchase.id}.png`, 'image/png');
                investorNftImageUrl = `${DEDICATED_IPFS_GATEWAY_URL}${nftImageCid}`;
            } catch (e: any) {
                addNotification(`Investor AI artwork failed, using default image. Reason: ${e.message}`, "error");
            }
            
            const investorLevel = [...INVESTOR_IMPACT_LEVELS].reverse().find(l => tons >= l.tonsThreshold);
            if (investorLevel && investorNftCollectionInfo && investor?.hederaAccountId) {
                const investorMetadataObject = {
                    name: `Impact Certificate: ${tons} Tons`, description: `A tokenized certificate representing a landmark purchase of ${tons} tons of CO₂e credits from the farm "${farm.name}".`, image: investorNftImageUrl,
                    attributes: [
                        { "trait_type": "Farm", "value": farm.name }, { "trait_type": "Tons Purchased", "value": tons.toString() }, { "trait_type": "Purchase ID", "value": newPurchase.id }, { "trait_type": "Investor Account", "value": investor.hederaAccountId }, { "trait_type": "Farmer Account", "value": farm.farmerHederaAccountId },
                    ]
                };
                addNotification('Uploading investor metadata to IPFS...', 'info');
                const investorMetadataCid = await pinataService.uploadJsonToIpfs(investorMetadataObject);
                const investorOnChainMetadata = `ipfs://${investorMetadataCid}`;
                addNotification('Minting investor NFT on Hedera...', 'info');
                const investorNftResponse = await hederaService.mintAndTransferNft(investorNftCollectionInfo.id, adminUser.hederaAccountId, adminUser.hederaPrivateKey, investor.hederaAccountId, investorOnChainMetadata);
                const newInvestorNft: InvestorNft = {
                    id: `inft_${Date.now()}`, investorId: newPurchase.investorId, investorHederaAccountId: investor.hederaAccountId, nftLevelId: investorLevel.id, mintDate: new Date().toISOString(), hederaTokenId: investorNftCollectionInfo.id, hederaSerialNumber: investorNftResponse.serialNumber, hashscanUrl: investorNftResponse.hashscanUrl, purchaseId: newPurchase.id, tons: tons, farmName: farm.name, metadataUrl: investorOnChainMetadata
                };
                setInvestorNfts(prev => [...prev, newInvestorNft]);
                addNotification(`Awarded ${investorLevel.name} to investor!`, 'success', investorNftResponse.hashscanUrl);
            }
            
            let farmerNftImageUrl = UNIFIED_NFT_IMAGE_URL;
             try {
                addNotification("Generating unique farmer NFT badge with AI...", "info");
                const generatedImageB64 = await geminiService.generateFarmerNftImage(tons);
                addNotification("Uploading unique artwork to IPFS...", "info");
                const nftImageCid = await pinataService.uploadFileToIpfs(generatedImageB64, `farmer_nft_${newPurchase.id}.png`, 'image/png');
                farmerNftImageUrl = `${DEDICATED_IPFS_GATEWAY_URL}${nftImageCid}`;
            } catch (e: any) {
                addNotification(`Farmer AI artwork failed, using default image. Reason: ${e.message}`, "error");
            }

            const farmerLevel = [...FARMER_LEGACY_LEVELS].reverse().find(l => tons >= l.tonsThreshold);
            if (farmerLevel && farmerNftCollectionInfo && farmer?.hederaAccountId) {
                const farmerMetadataObject = {
                    name: `Legacy Badge: ${tons} Tons`, description: `A tokenized badge awarded for a landmark sale of ${tons} tons of CO₂e credits to ${investor?.email || 'an investor'}.`, image: farmerNftImageUrl,
                    attributes: [
                        { "trait_type": "Farm", "value": farm.name }, { "trait_type": "Tons Sold", "value": tons.toString() }, { "trait_type": "Purchase ID", "value": newPurchase.id }, { "trait_type": "Investor Account", "value": investor?.hederaAccountId || 'N/A' }, { "trait_type": "Farmer Account", "value": farmer.hederaAccountId },
                    ]
                };
                addNotification('Uploading farmer metadata to IPFS...', 'info');
                const farmerMetadataCid = await pinataService.uploadJsonToIpfs(farmerMetadataObject);
                const farmerOnChainMetadata = `ipfs://${farmerMetadataCid}`;
                addNotification('Minting farmer NFT on Hedera...', 'info');
                const farmerNftResponse = await hederaService.mintAndTransferNft(farmerNftCollectionInfo.id, adminUser.hederaAccountId, adminUser.hederaPrivateKey, farmer.hederaAccountId, farmerOnChainMetadata);
                const newFarmerNft: FarmerNft = {
                    id: `fnft_${Date.now()}`, farmerId: farm.farmerId, farmerHederaAccountId: farm.farmerHederaAccountId, nftLevelId: farmerLevel.id, mintDate: new Date().toISOString(), hederaTokenId: farmerNftCollectionInfo.id, hederaSerialNumber: farmerNftResponse.serialNumber, hashscanUrl: farmerNftResponse.hashscanUrl, purchaseId: newPurchase.id, tons: tons, investorEmail: investor?.email || 'N/A', metadataUrl: farmerOnChainMetadata
                };
                setFarmerNfts(prev => [...prev, newFarmerNft]);
                addNotification(`Awarded ${farmerLevel.name} to farmer!`, 'success', farmerNftResponse.hashscanUrl);
            }

        } catch (e: any) {
            addNotification(e.message || "Purchase failed.", "error");
        } finally {
            setLoading(false);
        }
    };
    
    // --- PLATFORM SETUP (ADMIN) ---

    const initializePlatform = async (details: Omit<PlatformInitializationDetails, 'hcsTopicId'>) => {
        if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            addNotification("Only connected admins can initialize the platform.", "error"); return;
        }
        setLoading(true);
        try {
            addNotification("Creating HCS Audit Topic...", "info");
            const hcsRes = await hederaService.createHcsTopic(user.hederaAccountId, user.hederaPrivateKey, "AgriPulse dMRV Audit Trail");
            setHcsTopicId(hcsRes.topicId);
            addNotification("HCS Topic created.", "success", hcsRes.hashscanUrl);

            addNotification("Creating Platform Token...", "info");
            const tokenRes = await hederaService.createRealFungibleToken(details.tokenName, details.tokenSymbol, details.initialSupply, user.hederaAccountId, user.hederaPrivateKey);
            setPlatformTokenInfo({ id: tokenRes.tokenId, name: details.tokenName, symbol: details.tokenSymbol, initialSupply: details.initialSupply, totalSupply: details.initialSupply });
            addNotification("Platform Token created.", "success", tokenRes.hashscanUrl);

            addNotification("Creating Farm NFT Collection...", "info");
            const farmNftRes = await hederaService.createRealNftCollection(details.farmNftName, details.farmNftSymbol, details.farmNftDescription, user.hederaAccountId, user.hederaPrivateKey);
            setFarmNftCollectionInfo({ id: farmNftRes.tokenId, name: details.farmNftName, symbol: details.farmNftSymbol });
            addNotification("Farm NFT Collection created.", "success", farmNftRes.hashscanUrl);

            addNotification("Creating Farmer NFT Collection...", "info");
            const farmerNftRes = await hederaService.createRealNftCollection(details.farmerNftName, details.farmerNftSymbol, details.farmerNftDescription, user.hederaAccountId, user.hederaPrivateKey);
            setFarmerNftCollectionInfo({ id: farmerNftRes.tokenId, name: details.farmerNftName, symbol: details.farmerNftSymbol });
            addNotification("Farmer NFT Collection created.", "success", farmerNftRes.hashscanUrl);

            addNotification("Creating Investor NFT Collection...", "info");
            const investorNftRes = await hederaService.createRealNftCollection(details.investorNftName, details.investorNftSymbol, details.investorNftDescription, user.hederaAccountId, user.hederaPrivateKey);
            setInvestorNftCollectionInfo({ id: investorNftRes.tokenId, name: details.investorNftName, symbol: details.investorNftSymbol });
            addNotification("Investor NFT Collection created.", "success", investorNftRes.hashscanUrl);

            addNotification("Platform initialization complete!", "success");

        } catch (e: any) {
            addNotification(`Initialization Failed: ${e.message}`, "error");
        } finally { setLoading(false); }
    };

    const createPlatformToken = async (name: string, symbol: string, initialSupply: number) => {
        if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            addNotification("Only admins can create tokens.", "error"); return;
        }
        setLoading(true);
        try {
            const res = await hederaService.createRealFungibleToken(name, symbol, initialSupply, user.hederaAccountId, user.hederaPrivateKey);
            setPlatformTokenInfo({ id: res.tokenId, name, symbol, initialSupply, totalSupply: initialSupply });
            addNotification("Platform token created successfully!", 'success', res.hashscanUrl);
        } catch (e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };
    
    const deletePlatformToken = async () => {
         if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey || !platformTokenInfo) return;
         setLoading(true);
         try {
             await hederaService.deleteToken(platformTokenInfo.id, user.hederaAccountId, user.hederaPrivateKey);
             setPlatformTokenInfo(null);
             addNotification("Platform token deleted.", "success");
         } catch(e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };

    const deleteNftCollection = async (collectionId: string) => {
        if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
        setLoading(true);
        try {
            await hederaService.deleteToken(collectionId, user.hederaAccountId, user.hederaPrivateKey);
            if (collectionId === farmerNftCollectionInfo?.id) setFarmerNftCollectionInfo(null);
            if (collectionId === investorNftCollectionInfo?.id) setInvestorNftCollectionInfo(null);
             if (collectionId === farmNftCollectionInfo?.id) setFarmNftCollectionInfo(null);
            addNotification("NFT Collection deleted.", "success");
        } catch(e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };

    const associateWithToken = async (tokenId: string) => {
        if (!user?.hederaAccountId || !user.hederaPrivateKey) {
            addNotification("Wallet not connected.", 'error');
            return false;
        }
        setLoading(true);
        try {
            const res = await hederaService.associateToken(user.hederaAccountId, user.hederaPrivateKey, tokenId);
            if (res.alreadyAssociated) {
                 addNotification("Already associated with this asset.", 'info');
            } else {
                 addNotification("Wallet association successful!", 'success', res.hashscanUrl);
            }
            // Wait for mirror node, then refresh
            await new Promise(resolve => setTimeout(resolve, 4000));
            await refreshUserBalance();
            return true;
        } catch (e: any) {
            addNotification(e.message, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    const associateWithPlatformToken = () => associateWithToken(platformTokenInfo!.id);
    const associateWithFarmerNftCollection = () => associateWithToken(farmerNftCollectionInfo!.id);
    const associateWithInvestorNftCollection = () => associateWithToken(investorNftCollectionInfo!.id);

    const createFarmerNftCollection = async (name: string, symbol: string, description: string) => {
         if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
         setLoading(true);
         try {
             const res = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
             setFarmerNftCollectionInfo({ id: res.tokenId, name, symbol });
             addNotification("Farmer NFT Collection created.", 'success', res.hashscanUrl);
         } catch(e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };
    const createInvestorNftCollection = async (name: string, symbol: string, description: string) => {
         if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
         setLoading(true);
         try {
             const res = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
             setInvestorNftCollectionInfo({ id: res.tokenId, name, symbol });
             addNotification("Investor NFT Collection created.", 'success', res.hashscanUrl);
         } catch(e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };
    const createFarmNftCollection = async (name: string, symbol: string, description: string) => {
         if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) return;
         setLoading(true);
         try {
             const res = await hederaService.createRealNftCollection(name, symbol, description, user.hederaAccountId, user.hederaPrivateKey);
             setFarmNftCollectionInfo({ id: res.tokenId, name, symbol });
             addNotification("Farm NFT Collection created.", 'success', res.hashscanUrl);
         } catch(e: any) { addNotification(e.message, 'error'); } finally { setLoading(false); }
    };
    
    const retireCredits = async (amount: number) => {
        if (!user || user.role !== AppRole.INVESTOR || !user.hederaAccountId || !user.hederaPrivateKey) {
            addNotification("Only connected investors can retire credits.", "error"); return;
        }
        if (!platformTokenInfo) { addNotification("Platform token not found.", "error"); return; }
        
        const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
        if (!adminUser || !adminUser.hederaAccountId || !adminUser.hederaPrivateKey) {
            addNotification("Platform admin account not found or configured for transactions.", "error"); return;
        }

        setLoading(true);
        try {
            const res = await hederaService.wipeTokens(adminUser.hederaAccountId, adminUser.hederaPrivateKey, user.hederaAccountId, platformTokenInfo.id, amount);
            const newRetirement: Retirement = {
                id: `retire_${Date.now()}`, investorId: user.id, amount, retirementDate: new Date().toISOString(), hashscanUrl: res.hashscanUrl
            };
            setRetirements(prev => [...prev, newRetirement]);
            addNotification(`${amount} credits successfully retired!`, 'success', res.hashscanUrl);
            // Wait for mirror node to update, then refresh balance
            await new Promise(resolve => setTimeout(resolve, 4000));
            await refreshUserBalance();
        } catch (e: any) {
            addNotification(e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- CLEANUP ---
    const deleteMultipleTokens = async (tokenIds: string[], logCallback: (message: string) => void): Promise<{ success: number; failed: number, summary: string }> => {
        if (!user || user.role !== AppRole.ADMIN || !user.hederaAccountId || !user.hederaPrivateKey) {
            logCallback("ERROR: Admin privileges required for deletion.");
            return { success: 0, failed: tokenIds.length, summary: "Admin privileges required." };
        }
        
        let successCount = 0;
        for (const tokenId of tokenIds) {
            try {
                logCallback(`Processing DELETE for ${tokenId}...`);
                const tokenInfo = await hederaService.getTokenInfo(tokenId);
                
                if (tokenInfo.type === 'FUNGIBLE_COMMON' && tokenInfo.total_supply > 0) {
                     logCallback(`Token ${tokenId} has a supply. Wiping treasury balance...`);
                     const adminBalance = await hederaService.getRealAccountBalance(user.hederaAccountId);
                     const tokenBalance = adminBalance.tokens.find(t => t.tokenId === tokenId)?.balance || 0;
                     if (tokenBalance > 0) {
                        await hederaService.wipeTokens(user.hederaAccountId, user.hederaPrivateKey, user.hederaAccountId, tokenId, tokenBalance);
                        logCallback(`Wiped ${tokenBalance} from treasury.`);
                     } else {
                        logCallback(`Treasury balance is already zero.`);
                     }
                } else if (tokenInfo.type === 'NON_FUNGIBLE_UNIQUE') {
                    logCallback(`Token ${tokenId} is an NFT. Burning all serials...`);
                    const allNfts = await hederaService.getAllNftsForCollection(tokenId);
                    if (allNfts.length > 0) {
                         const serials = allNfts.map(n => n.serial_number);
                         await hederaService.burnNftBatch(tokenId, serials, user.hederaAccountId, user.hederaPrivateKey);
                         logCallback(`Burned ${serials.length} NFTs.`);
                    } else {
                        logCallback(`No NFTs to burn.`);
                    }
                }
                
                await hederaService.deleteToken(tokenId, user.hederaAccountId, user.hederaPrivateKey);
                logCallback(`SUCCESS: Token ${tokenId} deleted.`);
                successCount++;
            } catch (e: any) {
                logCallback(`FAILED to delete ${tokenId}: ${e.message}`);
            }
        }
        const summary = `Operation Complete: ${successCount} deleted, ${tokenIds.length - successCount} failed.`;
        return { success: successCount, failed: tokenIds.length - successCount, summary };
    };
    
    const dissociateMultipleTokens = async (tokenIds: string[], userRole: AppRole, logCallback: (message: string) => void): Promise<{ success: number; failed: number, summary: string }> => {
        if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
            logCallback("ERROR: User wallet not connected.");
            return { success: 0, failed: tokenIds.length, summary: "Wallet not connected." };
        }
        
        let successCount = 0;
        for (const tokenId of tokenIds) {
            try {
                logCallback(`Attempting to dissociate from ${tokenId}...`);
                const allUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
                const adminUser = Object.values(allUsers).find((u: any) => u.role === AppRole.ADMIN) as User;
                if (!adminUser || !adminUser.hederaAccountId) {
                    throw new Error("Admin account not found for asset return.");
                }

                const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
                const assetsToTransfer = [];

                const tokenBalance = balanceInfo.tokens.find(t => t.tokenId === tokenId);
                if (tokenBalance && tokenBalance.balance > 0) {
                    assetsToTransfer.push({ tokenId: tokenId, amount: tokenBalance.balance });
                    logCallback(`Found ${tokenBalance.balance} of ${tokenId} to transfer.`);
                }
                const nftSerials = await hederaService.getNftsForAccountInCollection(user.hederaAccountId, tokenId);
                if (nftSerials.length > 0) {
                    assetsToTransfer.push({ tokenId: tokenId, serials: nftSerials.map(n => n.serial_number) });
                     logCallback(`Found ${nftSerials.length} NFTs from ${tokenId} to transfer.`);
                }
                if (assetsToTransfer.length > 0) {
                    await hederaService.transferAssetsBackToAdmin(user.hederaAccountId, user.hederaPrivateKey, adminUser.hederaAccountId, assetsToTransfer);
                    logCallback(`Assets for ${tokenId} transferred back to admin.`);
                }

                await hederaService.dissociateTokens(user.hederaAccountId, user.hederaPrivateKey, [tokenId]);
                logCallback(`SUCCESS: Dissociated from ${tokenId}.`);
                successCount++;
            } catch (e: any)
            {
                logCallback(`FAILED to dissociate from ${tokenId}: ${e.message}`);
            }
        }

        const summary = `Operation Complete: ${successCount} dissociated, ${tokenIds.length - successCount} failed.`;
        return { success: successCount, failed: tokenIds.length - successCount, summary };
    };

    return (
        <FarmContext.Provider value={{
            farms, purchases, retirements, farmerNfts, investorNfts, platformTokenInfo, 
            farmerNftCollectionInfo, investorNftCollectionInfo, farmNftCollectionInfo, hcsTopicId,
            loading, error, hbarToUsdRate, userBalance, refreshUserBalance,
            registerFarm, purchaseCredits,
            createPlatformToken, associateWithPlatformToken,
            createFarmerNftCollection, associateWithFarmerNftCollection,
            createInvestorNftCollection, associateWithInvestorNftCollection,
            createFarmNftCollection, initializePlatform,
            retireCredits, deletePlatformToken, deleteNftCollection,
            deleteMultipleTokens, dissociateMultipleTokens
        }}>
            {children}
        </FarmContext.Provider>
    );
};

export const useFarm = (): FarmContextType => {
    const context = useContext(FarmContext);
    if (context === undefined) {
        throw new Error('useFarm must be used within a Farm-context-provider');
    }
    return context;
};