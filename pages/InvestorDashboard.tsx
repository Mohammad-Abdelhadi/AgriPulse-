import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { INVESTOR_IMPACT_LEVELS } from '../constants';
import QrCodeModal from '../components/QrCodeModal';
import { NftRarity, CompanyProfile } from '../types';
import NftCard from '../components/NftCard';

const InvestorDashboard: React.FC = () => {
    const { user, updateCompanyProfile } = useAuth();
    const { 
        purchases, retirements, retireCredits, loading, investorNfts, 
        platformTokenInfo, associateWithPlatformToken,
        investorNftCollectionInfo, associateWithInvestorNftCollection,
        userBalance // Consume centralized balance state
    } = useFarm();
    const { addNotification: showToast } = useNotification();
    
    const [associationLoading, setAssociationLoading] = useState(false);
    const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, url: '' });
    const [retireAmount, setRetireAmount] = useState(1);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(
        user?.companyProfile || { name: '', location: '', industry: '', annualCarbonFootprint: 1000 }
    );

    useEffect(() => {
        setCompanyProfile(user?.companyProfile || { name: '', location: '', industry: '', annualCarbonFootprint: 1000 });
    }, [user]);

    // Derived state from context - this ensures automatic UI updates
    const isTokenAssociated = useMemo(() => {
        if (!platformTokenInfo || !userBalance) return false;
        return userBalance.tokens.some(t => t.tokenId === platformTokenInfo.id);
    }, [userBalance, platformTokenInfo]);
    
    const isNftAssociated = useMemo(() => {
        if (!investorNftCollectionInfo || !userBalance) return false;
        return userBalance.tokens.some(t => t.tokenId === investorNftCollectionInfo.id);
    }, [userBalance, investorNftCollectionInfo]);

    const liquidCredits = useMemo(() => {
        if (!platformTokenInfo || !userBalance) return 0;
        const token = userBalance.tokens.find(t => t.tokenId === platformTokenInfo.id);
        return token?.balance || 0;
    }, [userBalance, platformTokenInfo]);

    const myPurchases = useMemo(() => {
        if (!user) return [];
        return purchases.filter(p => p.investorId === user.id);
    }, [purchases, user]);

    const totalCreditsPurchased = myPurchases.reduce((sum, p) => sum + p.tonsPurchased, 0);
    const totalSpent = myPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalRetired = useMemo(() => retirements.filter(r => r.investorId === user?.id).reduce((sum, r) => sum + r.amount, 0), [retirements, user]);
    const myNfts = useMemo(() => investorNfts.filter(n => n.investorId === user?.id).sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()), [investorNfts, user]);

    const netFootprintRemaining = (user?.companyProfile?.annualCarbonFootprint || 0) - totalRetired;

    const handleCompleteSetup = async () => {
        setAssociationLoading(true);
        showToast("Starting one-time account setup...", "info");
        try {
            if (!isTokenAssociated) {
                showToast("Step 1/2: Associating with platform token...", "info");
                const tokenSuccess = await associateWithPlatformToken();
                if (!tokenSuccess) throw new Error("Failed to associate with the platform token.");
            }
    
            if (!isNftAssociated) {
                showToast("Step 2/2: Associating with Impact NFTs...", "info");
                const nftSuccess = await associateWithInvestorNftCollection();
                if (!nftSuccess) throw new Error("Failed to associate with the Impact NFT collection.");
            }
            showToast("Account setup complete! Your wallet is ready.", "success");
    
        } catch (error: any) {
            console.error("Account setup failed:", error);
        } finally {
            // No need to manually fetch balance, context handles it.
            setAssociationLoading(false);
        }
    };

    const handleRetire = async () => {
        if (retireAmount > liquidCredits) {
            showToast("Cannot retire more credits than you own.", "error");
            return;
        }
        await retireCredits(retireAmount);
        setIsRetireModalOpen(false);
        setRetireAmount(1);
    };
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const message = await updateCompanyProfile(companyProfile);
            showToast(message, 'success');
            setIsProfileModalOpen(false);
        } catch (error: any) {
            showToast(error.message, 'error');
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

    const isSetupComplete = isTokenAssociated && isNftAssociated;

    return (
        <div className="space-y-8 animate-fade-in">
            <QrCodeModal 
                isOpen={qrCodeModal.isOpen} 
                onClose={() => setQrCodeModal({ isOpen: false, url: ''})} 
                url={qrCodeModal.url}
                title="Verify on HashScan"
            />

            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Corporate Sustainability Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your carbon credit portfolio and track progress towards your ESG goals.</p>
            </div>

            {!user?.hederaAccountId && (
                 <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Action Required: Connect Your Wallet</p>
                    <p>To purchase and manage assets, please connect your Hedera account on the <Link to="/wallet" className="underline font-semibold">Wallet page</Link>.</p>
                </div>
            )}
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton id="portfolio" label="Portfolio" />
                    <TabButton id="certificates" label="My Impact Certificates" />
                </nav>
            </div>
            
            {activeTab === 'portfolio' && (
                 <div className="space-y-8">
                    {!user?.companyProfile && user?.role === 'INVESTOR' && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-xl shadow-lg flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Set Up Your Company Profile</h2>
                                <p>Define your annual carbon footprint to start tracking your progress.</p>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(true)} className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
                                Set Up Profile
                            </button>
                        </div>
                    )}

                    {user?.companyProfile && (
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-text-primary">ESG Goal Tracker: {user.companyProfile.name}</h2>
                                <button onClick={() => setIsProfileModalOpen(true)} className="text-sm text-primary hover:underline font-semibold">Edit Profile</button>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-red-700 font-semibold">Annual Carbon Footprint</p>
                                    <p className="text-4xl font-extrabold text-red-600 mt-2">{user.companyProfile.annualCarbonFootprint.toLocaleString()} <span className="text-xl font-bold">CO₂e</span></p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-700 font-semibold">Credits Retired This Year</p>
                                    <p className="text-4xl font-extrabold text-blue-600 mt-2">{totalRetired.toLocaleString()} <span className="text-xl font-bold">CO₂e</span></p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-green-700 font-semibold">Net Footprint Remaining</p>
                                    <p className={`text-4xl font-extrabold mt-2 ${netFootprintRemaining > 0 ? 'text-green-600' : 'text-green-700'}`}>
                                        {netFootprintRemaining.toLocaleString()} <span className="text-xl font-bold">CO₂e</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}


                    {user?.hederaAccountId && !isSetupComplete && (
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-text-primary">Complete Your Account Setup</h2>
                            <p className="text-text-secondary mt-1 mb-6">A one-time setup is required to interact with the marketplace and receive NFTs.</p>
                            
                            <div className="space-y-3 my-4">
                                <div className={`flex items-center transition-opacity duration-300 ${isTokenAssociated ? 'opacity-100' : 'opacity-70'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isTokenAssociated ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        {isTokenAssociated ? '✓' : '1'}
                                    </div>
                                    <span className={`ml-3 font-medium ${isTokenAssociated ? 'text-text-primary' : 'text-text-secondary'}`}>Associate with Platform Token ({platformTokenInfo?.symbol || '...'})</span>
                                </div>
                                <div className={`flex items-center transition-opacity duration-300 ${isNftAssociated ? 'opacity-100' : 'opacity-70'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isNftAssociated ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        {isNftAssociated ? '✓' : '2'}
                                    </div>
                                    <span className={`ml-3 font-medium ${isNftAssociated ? 'text-text-primary' : 'text-text-secondary'}`}>Associate with Impact NFTs ({investorNftCollectionInfo?.symbol || '...'})</span>
                                </div>
                            </div>
                            
                            {!isSetupComplete ? (
                                <button
                                    onClick={handleCompleteSetup}
                                    disabled={associationLoading}
                                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
                                >
                                    {associationLoading ? 'Processing...' : 'Complete Account Setup'}
                                </button>
                            ) : (
                                <div className="mt-4 text-center font-semibold bg-green-100 text-green-800 py-3 rounded-lg">
                                    ✓ Account Setup Complete
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Liquid Credits</p><p className="text-3xl font-bold text-primary mt-2">{liquidCredits.toLocaleString()}</p></div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Retired Credits</p><p className="text-3xl font-bold text-text-primary mt-2">{totalRetired.toLocaleString()}</p></div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Total Purchased</p><p className="text-3xl font-bold text-primary mt-2">{totalCreditsPurchased.toLocaleString()} <span className="text-xl">CO₂e</span></p></div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Total Invested</p><p className="text-3xl font-bold text-primary mt-2">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary">Retire Your Credits</h2>
                                <p className="text-text-secondary mt-1">Permanently remove your credits from circulation to claim your environmental impact.</p>
                            </div>
                            <button onClick={() => setIsRetireModalOpen(true)} disabled={liquidCredits === 0} className="mt-4 md:mt-0 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Retire Credits</button>
                        </div>
                    </div>
                 </div>
            )}
            
            {activeTab === 'certificates' && (
                <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-6">My Impact Certificates</h2>
                    {myNfts.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myNfts.map(nft => {
                                const level = INVESTOR_IMPACT_LEVELS.find(l => l.id === nft.nftLevelId);
                                if (!level) return null;

                                const rarityStyles = getRarityStyles(level.rarity);
                                
                                return (
                                    <NftCard
                                        key={nft.id}
                                        metadataUrl={nft.metadataUrl}
                                        rarity={level.rarity}
                                        rarityStyles={rarityStyles}
                                        onVerify={() => setQrCodeModal({ isOpen: true, url: nft.hashscanUrl || '' })}
                                        showImage={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-text-secondary">
                            <p>You haven't earned any transaction NFTs yet. They are awarded for significant single purchases.</p>
                            <Link to="/marketplace" className="mt-4 inline-block font-bold text-primary underline hover:text-primary-dark transition-colors">
                                Make an Impact
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {isProfileModalOpen && (
                 <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                     <form onSubmit={handleProfileUpdate} className="bg-white rounded-lg shadow-2xl max-w-lg w-full m-4">
                         <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-text-primary">Manage Company Profile</h2>
                         </div>
                         <div className="p-6 space-y-4">
                            <div>
                                 <label className="block text-sm font-medium text-text-primary">Company Name</label>
                                 <input type="text" value={companyProfile.name} onChange={(e) => setCompanyProfile(p => ({...p, name: e.target.value}))} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-text-primary">Location</label>
                                 <input type="text" value={companyProfile.location} onChange={(e) => setCompanyProfile(p => ({...p, location: e.target.value}))} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-text-primary">Industry</label>
                                 <input type="text" value={companyProfile.industry} onChange={(e) => setCompanyProfile(p => ({...p, industry: e.target.value}))} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-text-primary">Annual Carbon Footprint (CO₂e tons)</label>
                                 <input type="number" value={companyProfile.annualCarbonFootprint} onChange={(e) => setCompanyProfile(p => ({...p, annualCarbonFootprint: parseInt(e.target.value) || 0}))} required min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                             </div>
                         </div>
                         <div className="flex justify-end space-x-4 p-6 bg-gray-50 rounded-b-lg">
                             <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300">Cancel</button>
                             <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark">Save Profile</button>
                         </div>
                     </form>
                 </div>
            )}

            {isRetireModalOpen && (
                 <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
                        <div className="flex justify-between items-center p-6 border-b">
                            <div className="flex items-center space-x-3">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary">Retire Carbon Credits</h2>
                            </div>
                           <button onClick={() => setIsRetireModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>

                        <div className="p-6">
                            <p className="mb-4 text-text-secondary text-sm">Retiring credits permanently removes them from circulation to claim them against your carbon footprint. This action is irreversible.</p>
                            <p className="mb-6 font-semibold">Available to Retire: {liquidCredits.toLocaleString()}</p>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Amount to Retire:</label>
                                <input type="number" min="1" max={liquidCredits} value={retireAmount} onChange={(e) => setRetireAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 p-6 bg-gray-50 rounded-b-lg">
                            <button onClick={() => setIsRetireModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={handleRetire} disabled={loading} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-wait">{loading ? 'Processing...' : 'Confirm & Retire'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorDashboard;