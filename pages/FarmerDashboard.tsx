import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { Farm, FarmStatus, AppRole, NftRarity } from '../types';
import { FARMER_LEGACY_LEVELS, PRACTICES, HECTARE_TO_DUNUM } from '../constants';
import { Link } from 'react-router-dom';
import { hederaService } from '../services/hederaService';
import QrCodeModal from '../components/QrCodeModal';
import NftCard from '../components/NftCard';
import { geminiService } from '../services/geminiService';
import { useNotification } from '../contexts/NotificationContext';

const FarmerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { farms, registerFarm, error, hbarToUsdRate, farmerNftCollectionInfo, associateWithFarmerNftCollection, farmerNfts } = useFarm();
    const { addNotification: showToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssociated, setIsAssociated] = useState(false);
    const [associationLoading, setAssociationLoading] = useState(false);
    const [checkingAssociation, setCheckingAssociation] = useState(true);
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, url: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('farms');

    // New Farm State
    const [farmName, setFarmName] = useState('');
    const [location, setLocation] = useState('');
    const [story, setStory] = useState('');
    const [landArea, setLandArea] = useState<number>(10);
    const [areaUnit, setAreaUnit] = useState<'dunum' | 'hectare'>('dunum');
    const [cropType, setCropType] = useState('');
    const [selectedPractices, setSelectedPractices] = useState<Set<string>>(new Set());
    const [pricePerTon, setPricePerTon] = useState(0.01);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [certificateBase64, setCertificateBase64] = useState<string | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);


    const myFarms = useMemo(() => farms.filter(f => f.farmerId === user?.id), [farms, user]);
    const myNfts = useMemo(() => farmerNfts.filter(n => n.farmerId === user?.id).sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()), [farmerNfts, user]);
    
    const totalTonsSold = useMemo(() => 
        myFarms.reduce((sum: number, f: Farm) => sum + (f.totalTons - f.availableTons), 0),
    [myFarms]);

    const estimatedCredits = useMemo(() => {
        const areaInDunums = areaUnit === 'hectare' ? landArea * HECTARE_TO_DUNUM : landArea;
        const totalEmissionFactor = Array.from(selectedPractices).reduce((sum: number, practiceId: string) => {
            const practice = PRACTICES.find(p => p.id === practiceId);
            return sum + (practice?.emissionFactor || 0);
        }, 0);
        return Math.round(areaInDunums * totalEmissionFactor);
    }, [landArea, areaUnit, selectedPractices]);
    
    const checkAssociationStatus = async () => {
        if (user?.hederaAccountId && farmerNftCollectionInfo) {
            setCheckingAssociation(true);
            try {
                const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
                const associated = balanceInfo.tokens.some(t => t.tokenId === farmerNftCollectionInfo.id);
                setIsAssociated(associated);
            } catch (e) {
                console.error("Failed to check association status", e);
                setIsAssociated(false);
            } finally {
                setCheckingAssociation(false);
            }
        } else {
            setCheckingAssociation(false);
        }
    };

    useEffect(() => {
        checkAssociationStatus();
    }, [user, farmerNftCollectionInfo]);

    const resetForm = () => {
        setFarmName(''); setLocation(''); setStory(''); setLandArea(10);
        setAreaUnit('dunum'); setCropType(''); setSelectedPractices(new Set());
        setPricePerTon(0.01);
        setCertificateFile(null);
        setCertificateBase64(null);
    };

    const handlePracticeToggle = (practiceId: string) => {
        setSelectedPractices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(practiceId)) {
                newSet.delete(practiceId);
            } else {
                newSet.add(practiceId);
            }
            return newSet;
        });
    };
    
    const handleAssociation = async () => {
        showToast("One-time wallet setup required. Please confirm the transaction...", "info");
        setAssociationLoading(true);
        try {
            const success = await associateWithFarmerNftCollection();
            if (success) {
                setIsAssociated(true);
                showToast("Wallet association successful! You can now register farms.", "success");
            }
        } finally {
            setAssociationLoading(false);
        }
    };


    const handleRegisterFarm = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            const certificatePayload = certificateFile && certificateBase64 
                ? { mimeType: certificateFile.type, data: certificateBase64 } 
                : null;
            
            registerFarm({
                name: farmName, location, story, landArea, areaUnit, cropType,
                practices: Array.from(selectedPractices), pricePerTon,
            }, certificatePayload).then(newlyRegisteredFarm => {
                if (newlyRegisteredFarm) {
                    setIsModalOpen(false);
                    resetForm();
                }
            });
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showToast("Only PDF files are accepted.", "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast("File size must be under 5MB.", "error");
                return;
            }
            setIsProcessingFile(true);
            setCertificateFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = (event.target?.result as string).split(',')[1];
                setCertificateBase64(base64);
                setIsProcessingFile(false);
                showToast("Certificate loaded successfully.", "success");
            };
            reader.onerror = () => {
                showToast("Failed to read the file.", "error");
                setIsProcessingFile(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateWithAI = async () => {
        setIsGenerating(true);
        showToast("Generating farm data with AI... This may take a moment.", "info");
        try {
            const data = await geminiService.generateFarmData();
            
            setFarmName(data.name);
            setLocation(data.location);
            setStory(data.story);
            setLandArea(data.landArea);
            setAreaUnit(data.areaUnit);
            setCropType(data.cropType);
            setSelectedPractices(new Set(data.practices));
            setPricePerTon(data.pricePerTon);
            
            showToast("AI-generated farm data populated successfully!", "success");
        } catch (error: any) {
            console.error("Failed to generate farm with AI", error);
            showToast(error.message || "An error occurred while generating AI data.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const getStatusPill = (status: FarmStatus) => {
        switch (status) {
            case FarmStatus.APPROVED: return 'bg-green-100 text-green-800';
            case FarmStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case FarmStatus.REJECTED: return 'bg-red-100 text-red-800';
            case FarmStatus.SOLD_OUT: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getRarityStyles = (rarity: NftRarity) => {
        switch (rarity) {
            case NftRarity.BRONZE: return { border: 'border-amber-500', bg: 'bg-amber-800/10', text: 'text-amber-500' };
            case NftRarity.SILVER: return { border: 'border-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-500' };
            case NftRarity.GOLD: return { border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-500' };
            default: return { border: 'border-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-500' };
        }
    };
    
    const TabButton: React.FC<{ id: string; label: string }> = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );

    const inputStyle = "px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-text-primary";

    return (
        <div className="space-y-8 animate-fade-in">
            <QrCodeModal 
                isOpen={qrCodeModal.isOpen} 
                onClose={() => setQrCodeModal({ isOpen: false, url: ''})} 
                url={qrCodeModal.url}
                title="Verify on HashScan"
            />
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Farmer Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your farms, mint new carbon credits, and track your NFT achievements.</p>
            </div>
            
             {!user?.hederaAccountId && (
                 <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Action Required: Connect Your Wallet</p>
                    <p>To register farms and receive payments, please connect your Hedera account on the <Link to="/wallet" className="underline font-semibold">Wallet page</Link>.</p>
                </div>
            )}
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton id="farms" label="My Farms" />
                    <TabButton id="badges" label="My Legacy Badges" />
                </nav>
            </div>

            {activeTab === 'farms' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-text-primary">My Farms</h2>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            disabled={!user?.hederaAccountId || !isAssociated || checkingAssociation}
                            title={!isAssociated ? "Please complete account setup first" : ""}
                        >
                            Register New Farm
                        </button>
                    </div>

                    {user?.hederaAccountId && !isAssociated && !checkingAssociation && farmerNftCollectionInfo && (
                        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-primary">
                            <h2 className="text-2xl font-bold text-text-primary">Complete Your Account Setup</h2>
                            <p className="text-text-secondary mt-1 mb-4">A one-time wallet association is required to enable farm registration. Please complete this step to continue.</p>
                            <button
                                onClick={handleAssociation}
                                disabled={associationLoading}
                                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                            >
                                {associationLoading ? 'Processing...' : 'Step 1: Associate Wallet'}
                            </button>
                        </div>
                    )}
                    
                    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                        {myFarms.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farm Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Annual Credits (Est.)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price/Ton</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">On-Chain</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myFarms.map(farm => (
                                        <tr key={farm.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{farm.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-primary">{farm.availableTons.toLocaleString()} / {farm.totalTons.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                                                <div>${farm.pricePerTon.toFixed(2)}</div>
                                                {hbarToUsdRate > 0 && <div className="text-xs text-text-secondary">~ {(farm.pricePerTon / hbarToUsdRate).toFixed(2)} ℏ</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusPill(farm.status)}`}>
                                                    {farm.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {farm.farmNftHashscanUrl ? (
                                                    <a href={farm.farmNftHashscanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                                        Verified
                                                    </a>
                                                ) : (
                                                    farm.rejectionReason || '—'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-8 text-center text-text-secondary">You haven't registered any farms yet. Click "Register New Farm" to get started!</p>
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'badges' && (
                <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">My Legacy Badges</h2>
                    {myNfts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myNfts.map(nft => {
                                const level = FARMER_LEGACY_LEVELS.find(l => l.id === nft.nftLevelId);
                                if (!level) return null;
                                
                                const rarityStyles = getRarityStyles(level.rarity);
                                
                                return (
                                    <NftCard
                                        key={nft.id}
                                        metadataUrl={nft.metadataUrl}
                                        rarity={level.rarity}
                                        rarityStyles={rarityStyles}
                                        onVerify={() => setQrCodeModal({ isOpen: true, url: nft.hashscanUrl || '' })}
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-text-secondary">
                            <p>You haven't earned any transaction NFTs yet. They are awarded for significant single sales.</p>
                            <Link to="/nft-gallery" className="mt-4 inline-block font-bold text-primary underline hover:text-primary-dark transition-colors">
                                Learn More About NFTs
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 grid place-items-center p-4 animate-fade-in" 
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-surface rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-lg">
                            <h2 className="text-2xl font-bold text-text-primary">Register a New Farm</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegisterFarm} id="farm-registration-form" className="flex-1 overflow-hidden flex flex-col">
                            <div className="p-8 space-y-6 bg-white overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary">Farm Name</label>
                                        <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} required minLength={5} title="Please enter a name at least 5 characters long." className={`mt-1 block w-full ${inputStyle}`}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary">Location (e.g., Governorate, GPS)</label>
                                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required minLength={5} title="Please enter a location at least 5 characters long." className={`mt-1 block w-full ${inputStyle}`}/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary">Land Area</label>
                                        <div className="flex items-center mt-1">
                                            <input type="number" value={landArea} min="1" onChange={(e) => setLandArea(parseInt(e.target.value) || 1)} required className={`block w-full ${inputStyle} rounded-r-none`} />
                                            <select value={areaUnit} onChange={e => setAreaUnit(e.target.value as any)} className={`${inputStyle} rounded-l-none border-l-0`}>
                                                <option value="dunum">dunum</option>
                                                <option value="hectare">hectare</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary">Agricultural Type (e.g., Wheat, Olives)</label>
                                        <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} required minLength={3} title="Please enter a crop type at least 3 characters long." className={`mt-1 block w-full ${inputStyle}`}/>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary">My Farm's Story</label>
                                    <textarea value={story} onChange={(e) => setStory(e.target.value)} required rows={4} minLength={50} title="Please provide a story at least 50 characters long." className={`mt-1 block w-full ${inputStyle}`} placeholder="Tell us about your farm, its history, and your sustainability goals."></textarea>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-primary">Farm Ownership Certificate (PDF, max 5MB)</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <input type="file" id="certificate-upload" accept="application/pdf" onChange={handleFileChange} className="hidden"/>
                                        <label htmlFor="certificate-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                            {isProcessingFile ? 'Loading...' : certificateFile ? 'Change File' : 'Upload PDF'}
                                        </label>
                                        {certificateFile && <span className="text-sm text-text-secondary truncate">{certificateFile.name}</span>}
                                    </div>
                                </div>

                                <fieldset>
                                    <legend className="block text-sm font-medium text-text-primary">Carbon Reduction Practices</legend>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        {PRACTICES.map(p => (
                                            <label key={p.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                                                <input type="checkbox" checked={selectedPractices.has(p.id)} onChange={() => handlePracticeToggle(p.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                                <span className="text-sm">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-primary">Price per Credit ($)</label>
                                    <input type="number" value={pricePerTon} min="0.01" step="0.01" onChange={(e) => setPricePerTon(parseFloat(e.target.value) || 0)} required className={`mt-1 block w-full ${inputStyle}`} />
                                </div>
                            </div>

                            <div className="p-6 border-t bg-gray-50 rounded-b-lg space-y-4">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                                    <p className="font-semibold text-text-primary">Estimated Annual Credits: <span className="text-primary text-xl font-bold">{estimatedCredits.toLocaleString()} CO₂e</span></p>
                                    <p className="text-xs text-text-secondary">(Calculated based on your land area and practices)</p>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <div className="flex justify-between items-center">
                                    <div>
                                        {isGenerating ? (
                                            <div className="flex items-center space-x-2 text-sm text-yellow-800 bg-yellow-100 font-semibold py-2 px-4 rounded-lg">
                                                <svg className="animate-spin h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Generating...</span>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={handleGenerateWithAI} 
                                                className="flex items-center space-x-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                                <span>Generate with AI</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} disabled={isGenerating || isProcessingFile} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors disabled:opacity-50">Cancel</button>
                                        <button type="submit" disabled={isGenerating || isProcessingFile} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">Submit for Verification</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;