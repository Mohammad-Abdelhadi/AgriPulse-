import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { Link } from 'react-router-dom';
import { hederaService } from '../services/hederaService';
import { useToast } from '../contexts/ToastContext';
import { INVESTOR_IMPACT_LEVELS } from '../constants';
import QrCodeModal from '../components/QrCodeModal';
import { NftRarity } from '../types';
import NftCard from '../components/NftCard';

const InvestorDashboard: React.FC = () => {
    const { user } = useAuth();
    const { 
        purchases, retirements, retireCredits, loading, investorNfts, 
        platformTokenInfo, associateWithPlatformToken,
        investorNftCollectionInfo, associateWithInvestorNftCollection 
    } = useFarm();
    const { showToast } = useToast();
    
    const [isTokenAssociated, setIsTokenAssociated] = useState(false);
    const [isNftAssociated, setIsNftAssociated] = useState(false);
    const [checkingAssociation, setCheckingAssociation] = useState(true);
    const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, url: '' });
    const [retireAmount, setRetireAmount] = useState(1);
    const [balance, setBalance] = useState(0);

    const fetchBalanceAndAssociations = async () => {
        if (user?.hederaAccountId) {
            setCheckingAssociation(true);
            const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
            
            if (platformTokenInfo) {
                const token = balanceInfo.tokens.find(t => t.tokenId === platformTokenInfo.id);
                setIsTokenAssociated(!!token);
                setBalance(token?.balance || 0);
            }
            if (investorNftCollectionInfo) {
                setIsNftAssociated(balanceInfo.tokens.some(t => t.tokenId === investorNftCollectionInfo.id));
            }
            setCheckingAssociation(false);
        } else {
            setCheckingAssociation(false);
        }
    };
    
    useEffect(() => {
        fetchBalanceAndAssociations();
    }, [user, platformTokenInfo, investorNftCollectionInfo, purchases, retirements]);

    const myPurchases = useMemo(() => {
        if (!user) return [];
        return purchases.filter(p => p.investorId === user.id);
    }, [purchases, user]);

    const totalCreditsPurchased = myPurchases.reduce((sum, p) => sum + p.tonsPurchased, 0);
    const totalSpent = myPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalRetired = useMemo(() => retirements.filter(r => r.investorId === user?.id).reduce((sum, r) => sum + r.amount, 0), [retirements, user]);
    const liquidCredits = balance;
    const myNfts = useMemo(() => investorNfts.filter(n => n.investorId === user?.id).sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()), [investorNfts, user]);


    const handleRetire = async () => {
        if (retireAmount > liquidCredits) {
            showToast("Cannot retire more credits than you own.", "error");
            return;
        }
        await retireCredits(retireAmount);
        setIsRetireModalOpen(false);
        setRetireAmount(1);
    };
    
    const getRarityStyles = (rarity: NftRarity) => {
        switch (rarity) {
            case NftRarity.BRONZE: return { border: 'border-amber-500', bg: 'bg-amber-800/10', text: 'text-amber-500' };
            case NftRarity.SILVER: return { border: 'border-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-500' };
            case NftRarity.GOLD: return { border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-500' };
            default: return { border: 'border-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-500' };
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <QrCodeModal 
                isOpen={qrCodeModal.isOpen} 
                onClose={() => setQrCodeModal({ isOpen: false, url: ''})} 
                url={qrCodeModal.url}
                title="Verify on HashScan"
            />

            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Investor Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Review your investments, manage your credits, and track your contribution.</p>
            </div>

            {!user?.hederaAccountId && (
                 <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Action Required: Connect Your Wallet</p>
                    <p>To purchase and manage assets, please connect your Hedera account on the <Link to="/wallet" className="underline font-semibold">Wallet page</Link>.</p>
                </div>
            )}
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-6 border-b pb-4">My Credits ({platformTokenInfo?.symbol})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg text-center"><p className="text-text-secondary font-semibold">Liquid Credits</p><p className="text-3xl font-bold text-primary mt-2">{liquidCredits.toLocaleString()}</p></div>
                    <div className="bg-gray-50 p-6 rounded-lg text-center"><p className="text-text-secondary font-semibold">Retired Credits</p><p className="text-3xl font-bold text-text-primary mt-2">{totalRetired.toLocaleString()}</p></div>
                    <div className="bg-gray-50 p-6 rounded-lg text-center flex flex-col justify-center"><button onClick={() => setIsRetireModalOpen(true)} disabled={liquidCredits === 0} className="bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Retire Credits</button></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Total Credits Purchased</p><p className="text-4xl font-bold text-primary mt-2">{totalCreditsPurchased.toLocaleString()} CO₂e</p></div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p className="text-text-secondary font-semibold">Total Amount Invested</p><p className="text-4xl font-bold text-primary mt-2">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-text-secondary font-semibold text-center mb-2">Required Associations</h3>
                    <div className="text-center space-y-2">
                         <div>
                            {platformTokenInfo && user?.hederaAccountId ? (
                                checkingAssociation ? (<p className="text-sm text-text-secondary">Checking token status...</p>)
                                : isTokenAssociated ? (<div className="text-sm font-semibold text-green-600">✅ Credits Token Associated</div>)
                                : (<div><p className="text-sm text-yellow-700 mb-1">Associate to receive credits.</p><button onClick={associateWithPlatformToken} className="text-xs bg-primary text-white font-bold py-1 px-2 rounded-lg hover:bg-primary-dark transition-colors">Associate</button></div>)
                            ) : (<p className="text-sm text-text-secondary">Credit token not ready.</p>)}
                        </div>
                         <div>
                            {investorNftCollectionInfo && user?.hederaAccountId ? (
                                checkingAssociation ? (<p className="text-sm text-text-secondary">Checking NFT status...</p>)
                                : isNftAssociated ? (<div className="text-sm font-semibold text-green-600">✅ NFT Collection Associated</div>)
                                : (<div><p className="text-sm text-yellow-700 mb-1">Associate to receive NFTs.</p><button onClick={associateWithInvestorNftCollection} className="text-xs bg-primary text-white font-bold py-1 px-2 rounded-lg hover:bg-primary-dark transition-colors">Associate</button></div>)
                            ) : (<p className="text-sm text-text-secondary">NFT collection not ready.</p>)}
                        </div>
                    </div>
                </div>
            </div>

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

            {isRetireModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full m-4">
                        <h2 className="text-2xl font-bold mb-4">Retire Carbon Credits</h2>
                        <p className="mb-4 text-text-secondary text-sm">Retiring credits permanently removes them from circulation to claim them against your carbon footprint. This action is irreversible.</p>
                        <p className="mb-6 font-semibold">Available to Retire: {liquidCredits.toLocaleString()}</p>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Amount to Retire:</label>
                            <input type="number" min="1" max={liquidCredits} value={retireAmount} onChange={(e) => setRetireAmount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="flex justify-end space-x-4 mt-8">
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