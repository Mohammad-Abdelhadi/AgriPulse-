

import React, { useState, useMemo } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { Farm, FarmStatus, User, AppRole, NftCollectionInfo } from '../types';
import { APPROVAL_THRESHOLD } from '../constants';

const AdminDashboard: React.FC = () => {
    const { 
        farms, platformTokenInfo, createPlatformToken, loading, purchases, 
        createFarmerNftCollection, farmerNftCollectionInfo,
        investorNftCollectionInfo, createInvestorNftCollection,
        farmNftCollectionInfo, createFarmNftCollection,
        deletePlatformToken, deleteNftCollection
    } = useFarm();
    const [activeTab, setActiveTab] = useState('approvedFarms');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any; type: 'token' | 'nft' }>({ open: false, item: null, type: 'token' });
    const [tokenName, setTokenName] = useState('JOR-CO2');
    const [tokenSymbol, setTokenSymbol] = useState('JCO2');
    const [initialSupply, setInitialSupply] = useState(1000000);
    
    // State for NFT Collection metadata
    const [farmerNftName, setFarmerNftName] = useState('AgriPulse Legacy');
    const [farmerNftSymbol, setFarmerNftSymbol] = useState('APL');
    const [farmerNftDescription, setFarmerNftDescription] = useState('NFTs awarded to farmers for significant sales of CO₂e credits on the AgriPulse platform.');

    const [investorNftName, setInvestorNftName] = useState('AgriPulse Impact');
    const [investorNftSymbol, setInvestorNftSymbol] = useState('API');
    const [investorNftDescription, setInvestorNftDescription] = useState('NFTs awarded to investors for significant purchases of CO₂e credits on the AgriPulse platform.');
    
    const [farmNftName, setFarmNftName] = useState('AgriPulse Farms');
    const [farmNftSymbol, setFarmNftSymbol] = useState('APF');
    const [farmNftDescription, setFarmNftDescription] = useState('Unique NFTs representing verified, on-chain farm registrations on the AgriPulse platform.');


    const inputStyle = "px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-text-primary";

    const filteredFarms = useMemo(() => farms.filter(f => f.status === activeTab.replace('Farms', '')), [farms, activeTab]);
    
    const approvedSupply = useMemo(() => farms.filter(f => f.status === FarmStatus.APPROVED).reduce((sum: number, f: Farm) => sum + f.totalTons, 0), [farms]);
    const circulatingSupply = useMemo(() => purchases.filter(p => p.tokenTransferStatus === 'COMPLETED').reduce((sum: number, p: any) => sum + p.tonsPurchased, 0), [purchases]);
    const treasuryBalance = platformTokenInfo ? platformTokenInfo.initialSupply - circulatingSupply : 0;
    
    const commissionHistory = useMemo(() => {
        return purchases.map(p => {
            const farm = farms.find(f => f.id === p.farmId);
            const commission = (p.totalPriceInHbar || 0) * 0.02;
            return {
                id: p.id,
                date: p.purchaseDate,
                farmName: farm?.name || 'Unknown Farm',
                investorId: p.investorId,
                totalHbar: p.totalPriceInHbar || 0,
                commissionHbar: commission,
                hashscanUrl: p.hashscanUrl
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [purchases, farms]);

    const totalCommissionEarned = useMemo(() => {
        return commissionHistory.reduce((sum, item) => sum + item.commissionHbar, 0);
    }, [commissionHistory]);

    const handleDeleteSubmit = () => {
        if (!deleteModal.item) return;
        if (deleteModal.type === 'token') {
            deletePlatformToken();
        } else {
            deleteNftCollection(deleteModal.item.id);
        }
        setDeleteModal({ open: false, item: null, type: 'token' });
    };
    
    const handleCreateTokenSubmit = (e: React.FormEvent) => { e.preventDefault(); createPlatformToken(tokenName, tokenSymbol, initialSupply); };
    const handleCreateFarmerNft = (e: React.FormEvent) => { e.preventDefault(); createFarmerNftCollection(farmerNftName, farmerNftSymbol, farmerNftDescription); }
    const handleCreateInvestorNft = (e: React.FormEvent) => { e.preventDefault(); createInvestorNftCollection(investorNftName, investorNftSymbol, investorNftDescription); }
    const handleCreateFarmNft = (e: React.FormEvent) => { e.preventDefault(); createFarmNftCollection(farmNftName, farmNftSymbol, farmNftDescription); }
    
    const getStatusPill = (status: FarmStatus) => {
        switch (status) {
            case FarmStatus.APPROVED: return 'bg-green-100 text-green-800';
            case FarmStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case FarmStatus.REJECTED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const tabs = [
        { id: 'approvedFarms', label: 'Approved Farms' },
        { id: 'rejectedFarms', label: 'Rejected Farms' }
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage platform tokens and monitor automated farm verifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Platform Token</h2>
                    {platformTokenInfo ? (
                        <div className="space-y-3">
                             <div><span className="text-text-secondary font-medium">Token ID:</span><a href={`https://hashscan.io/testnet/token/${platformTokenInfo.id}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary font-bold ml-2 hover:underline block truncate">{platformTokenInfo.id}</a></div>
                            <div className="pt-4 border-t mt-4"><h3 className="text-lg font-semibold text-text-primary">Tokenomics</h3><div className="mt-2 space-y-2 text-sm"><div className="flex justify-between"><span>Total Supply:</span><span className="font-semibold">{platformTokenInfo.initialSupply.toLocaleString()} {platformTokenInfo.symbol}</span></div><div className="flex justify-between"><span>Treasury:</span><span className="font-semibold">{treasuryBalance.toLocaleString()}</span></div><div className="flex justify-between"><span>Circulating:</span><span className="font-semibold">{circulatingSupply.toLocaleString()}</span></div><div className="flex justify-between"><span>On Marketplace:</span><span className="font-semibold">{approvedSupply.toLocaleString()}</span></div></div></div>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateTokenSubmit} className="space-y-4"><p className="text-text-secondary text-sm">Create the fungible token to enable the marketplace.</p><div><label className="block text-sm font-medium">Name</label><input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Symbol</label><input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Initial Supply</label><input type="number" value={initialSupply} min="1" onChange={(e) => setInitialSupply(parseInt(e.target.value))} required className={`mt-1 block w-full ${inputStyle}`} /></div><div className="pt-2"><button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{loading ? 'Creating...' : 'Create Token'}</button></div></form>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Farmer NFT Collection</h2>
                     {farmerNftCollectionInfo ? (
                        <div className="space-y-2"><p className="text-green-600 font-semibold text-sm">✅ Farmer Legacy collection is active.</p><div><span className="text-text-secondary font-medium">ID:</span><a href={`https://hashscan.io/testnet/token/${farmerNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary font-bold ml-2 hover:underline block truncate">{farmerNftCollectionInfo.id}</a><a href={`https://hashscan.io/testnet/token/${farmerNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-2">View All Farm NFTs on HashScan</a></div></div>
                    ) : (
                         <form onSubmit={handleCreateFarmerNft} className="space-y-4"><p className="text-text-secondary text-sm">Create the collection for Farmer Legacy Badges.</p><div><label className="block text-sm font-medium">Name</label><input type="text" value={farmerNftName} onChange={(e) => setFarmerNftName(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Symbol</label><input type="text" value={farmerNftSymbol} onChange={(e) => setFarmerNftSymbol(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Description (Memo)</label><textarea value={farmerNftDescription} onChange={(e) => setFarmerNftDescription(e.target.value)} required rows={2} className={`mt-1 block w-full ${inputStyle} text-xs`} /></div><div className="pt-2"><button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{loading ? 'Creating...' : 'Create Collection'}</button></div></form>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Investor NFT Collection</h2>
                     {investorNftCollectionInfo ? (
                         <div className="space-y-2"><p className="text-green-600 font-semibold text-sm">✅ Investor Impact collection is active.</p><div><span className="text-text-secondary font-medium">ID:</span><a href={`https://hashscan.io/testnet/token/${investorNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary font-bold ml-2 hover:underline block truncate">{investorNftCollectionInfo.id}</a><a href={`https://hashscan.io/testnet/token/${investorNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-2">View All Investor NFTs on HashScan</a></div></div>
                    ) : (
                         <form onSubmit={handleCreateInvestorNft} className="space-y-4"><p className="text-text-secondary text-sm">Create the collection for Investor Impact Certificates.</p><div><label className="block text-sm font-medium">Name</label><input type="text" value={investorNftName} onChange={(e) => setInvestorNftName(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Symbol</label><input type="text" value={investorNftSymbol} onChange={(e) => setInvestorNftSymbol(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Description (Memo)</label><textarea value={investorNftDescription} onChange={(e) => setInvestorNftDescription(e.target.value)} required rows={2} className={`mt-1 block w-full ${inputStyle} text-xs`} /></div><div className="pt-2"><button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{loading ? 'Creating...' : 'Create Collection'}</button></div></form>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Farm NFT Collection</h2>
                     {farmNftCollectionInfo ? (
                         <div className="space-y-2"><p className="text-green-600 font-semibold text-sm">✅ Farm Verification collection is active.</p><div><span className="text-text-secondary font-medium">ID:</span><a href={`https://hashscan.io/testnet/token/${farmNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary font-bold ml-2 hover:underline block truncate">{farmNftCollectionInfo.id}</a><a href={`https://hashscan.io/testnet/token/${farmNftCollectionInfo.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-2">View All Farm NFTs on HashScan</a></div></div>
                    ) : (
                         <form onSubmit={handleCreateFarmNft} className="space-y-4"><p className="text-text-secondary text-sm">Create the collection for on-chain Farm verification NFTs.</p><div><label className="block text-sm font-medium">Name</label><input type="text" value={farmNftName} onChange={(e) => setFarmNftName(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Symbol</label><input type="text" value={farmNftSymbol} onChange={(e) => setFarmNftSymbol(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`} /></div><div><label className="block text-sm font-medium">Description (Memo)</label><textarea value={farmNftDescription} onChange={(e) => setFarmNftDescription(e.target.value)} required rows={2} className={`mt-1 block w-full ${inputStyle} text-xs`} /></div><div className="pt-2"><button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{loading ? 'Creating...' : 'Create Collection'}</button></div></form>
                    )}
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Total Commissions</h2>
                    <p className="text-4xl font-extrabold text-primary">{totalCommissionEarned.toFixed(4)} ℏ</p>
                    <p className="text-sm text-text-secondary mt-2">from {commissionHistory.length} transactions</p>
                </div>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold text-text-primary mb-6">Farm Verification Log</h2>
                <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab.label}</button>))}</nav></div>
                
                <div className="bg-white rounded-lg shadow-md overflow-x-auto mt-6">
                    {filteredFarms.length > 0 ? (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farm Name</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farmer</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Requested Credits</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">dMRV Score</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reason/On-Chain ID</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredFarms.map(farm => (<tr key={farm.id}><td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{farm.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{farm.farmerName}</td><td className="px-6 py-4 whitespace-nowrap text-text-primary ">{farm.totalTons.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-text-primary"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusPill(farm.status)}`}>{farm.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{farm.approvalScore ? `${farm.approvalScore}/100` : 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">{farm.farmNftHashscanUrl ? <a href={farm.farmNftHashscanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Verified NFT</a> : farm.rejectionReason}</td></tr>))}</tbody></table>) : (<p className="p-8 text-center text-text-secondary">No farms with status "{activeTab.replace('Farms', '')}".</p>)}
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-text-primary mb-6">Platform Commission History</h2>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    {commissionHistory.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farm Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Investor ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total ℏ Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commission (2%) ℏ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Transaction</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {commissionHistory.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{item.farmName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary truncate" title={item.investorId}>{item.investorId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.totalHbar.toFixed(4)} ℏ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{item.commissionHbar.toFixed(4)} ℏ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {item.hashscanUrl && (
                                                <a href={item.hashscanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                                                    View Receipt
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-8 text-center text-text-secondary">No commissions earned yet.</p>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-dashed border-red-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
                <p className="text-red-700 text-sm mt-2">These actions are irreversible and will permanently delete on-chain assets. Use with caution.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platformTokenInfo && (
                        <div className="bg-white p-4 rounded-lg border border-red-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{platformTokenInfo.name} ({platformTokenInfo.symbol})</h3>
                                <p className="text-xs text-text-secondary truncate">ID: {platformTokenInfo.id}</p>
                            </div>
                            <button onClick={() => setDeleteModal({ open: true, item: platformTokenInfo, type: 'token' })} disabled={loading} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">Delete</button>
                        </div>
                    )}
                     {[farmerNftCollectionInfo, investorNftCollectionInfo, farmNftCollectionInfo].map(collection => collection && (
                        <div key={collection.id} className="bg-white p-4 rounded-lg border border-red-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{collection.name} ({collection.symbol})</h3>
                                <p className="text-xs text-text-secondary truncate">ID: {collection.id}</p>
                            </div>
                            <button onClick={() => setDeleteModal({ open: true, item: collection, type: 'nft' })} disabled={loading} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">Delete</button>
                        </div>
                    ))}
                </div>
            </div>

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full m-4">
                        <h2 className="text-2xl font-bold text-red-700">Confirm Deletion</h2>
                        <p className="mt-4 text-text-secondary">
                            Are you sure you want to delete the <span className="font-bold">{deleteModal.item.name}</span> {deleteModal.type}?
                            This action will first wipe/burn all associated assets from user accounts and then permanently delete the token from the Hedera network.
                            <strong className="block mt-2">This action is irreversible.</strong>
                        </p>
                        <div className="flex justify-end space-x-4 mt-8">
                            <button type="button" onClick={() => setDeleteModal({ open: false, item: null, type: 'token' })} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={handleDeleteSubmit} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                                {loading ? 'Deleting...' : 'Yes, Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;