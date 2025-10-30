import React, { useState, useMemo } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { Farm, FarmStatus, PlatformInitializationDetails } from '../types';
import { PLATFORM_COMMISSION_PERCENT, PLATFORM_COMMISSION_RATE } from '../constants';

const AdminDashboard: React.FC = () => {
    const { 
        farms, platformTokenInfo, loading, purchases, 
        farmerNftCollectionInfo, investorNftCollectionInfo, farmNftCollectionInfo,
        hcsTopicId,
        deletePlatformToken, deleteNftCollection, initializePlatform
    } = useFarm();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any; type: 'token' | 'nft' }>({ open: false, item: null, type: 'token' });
    const [initModalOpen, setInitModalOpen] = useState(false);
    
    const [initDetails, setInitDetails] = useState<Omit<PlatformInitializationDetails, 'hcsTopicId'>>({
        tokenName: 'JOR-CO2', tokenSymbol: 'JCO2', initialSupply: 0,
        farmerNftName: 'AgriPulse Legacy', farmerNftSymbol: 'APL', farmerNftDescription: 'NFTs awarded to farmers for significant sales of CO₂e credits on the AgriPulse platform.',
        investorNftName: 'AgriPulse Impact', investorNftSymbol: 'API', investorNftDescription: 'NFTs awarded to investors for significant purchases of CO₂e credits on the AgriPulse platform.',
        farmNftName: 'AgriPulse Farms', farmNftSymbol: 'APF', farmNftDescription: 'Unique NFTs representing verified, on-chain farm registrations on the AgriPulse platform.'
    });
    
    const handleInitDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setInitDetails(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const approvedFarms = useMemo(() => farms.filter(f => f.status === FarmStatus.APPROVED), [farms]);
    const rejectedFarms = useMemo(() => farms.filter(f => f.status === FarmStatus.REJECTED), [farms]);
    
    const totalSupply = useMemo(() => platformTokenInfo?.totalSupply || 0, [platformTokenInfo]);
    const circulatingSupply = useMemo(() => purchases.filter(p => p.tokenTransferStatus === 'COMPLETED').reduce((sum: number, p: any) => sum + p.tonsPurchased, 0), [purchases]);
    const treasuryBalance = totalSupply - circulatingSupply;
    
    const commissionHistory = useMemo(() => {
        return purchases.map(p => {
            const farm = farms.find(f => f.id === p.farmId);
            const commission = (p.totalPriceInHbar || 0) * PLATFORM_COMMISSION_RATE;
            return {
                id: p.id, date: p.purchaseDate, farmName: farm?.name || 'Unknown Farm', investorId: p.investorId,
                totalHbar: p.totalPriceInHbar || 0, commissionHbar: commission, hashscanUrl: p.hashscanUrl
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [purchases, farms]);

    const totalCommissionEarned = useMemo(() => commissionHistory.reduce((sum, item) => sum + item.commissionHbar, 0), [commissionHistory]);

    const handleDeleteSubmit = () => {
        if (!deleteModal.item) return;
        if (deleteModal.type === 'token') {
            deletePlatformToken();
        } else {
            deleteNftCollection(deleteModal.item.id);
        }
        setDeleteModal({ open: false, item: null, type: 'token' });
    };
    
    const handleInitializePlatform = () => {
        initializePlatform(initDetails);
        setInitModalOpen(false);
    };
    
    const getStatusPill = (status: FarmStatus) => {
        switch (status) {
            case FarmStatus.APPROVED: return 'bg-green-100 text-green-800';
            case FarmStatus.REJECTED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const isPlatformInitialized = platformTokenInfo && farmerNftCollectionInfo && investorNftCollectionInfo && farmNftCollectionInfo && hcsTopicId;
    
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'farmVerifications', label: 'Farm Verifications' },
        { id: 'commissionHistory', label: 'Commission History' },
        { id: 'dangerZone', label: 'Danger Zone' }
    ];

    const TabButton: React.FC<{ id: string; label: string }> = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );
    
    const KpiCard: React.FC<{ title: string; value: string; subtext?: string }> = ({ title, value, subtext }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <p className="text-text-secondary font-semibold">{title}</p>
            <p className="text-4xl font-extrabold text-primary mt-2">{value}</p>
            {subtext && <p className="text-sm text-text-secondary mt-2">{subtext}</p>}
        </div>
    );

    const TokenInfoCard: React.FC<{ title: string; collection: { id: string; name?: string; symbol?: string } | null, type?: 'token' | 'topic' }> = ({ title, collection, type = 'token' }) => (
         <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-bold text-lg text-text-primary">{title}</h3>
            {collection ? (
                <>
                    {'name' in collection && <p className="text-sm text-text-secondary">{collection.name} ({collection.symbol})</p>}
                    <a href={`https://hashscan.io/testnet/${type}/${collection.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline block truncate mt-1">{collection.id}</a>
                </>
            ) : <p className="text-sm text-gray-400">Not Created</p>}
        </div>
    );
    
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage platform tokens, monitor verifications, and track commissions.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => <TabButton key={tab.id} {...tab} />)}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'dashboard' && (
                     <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KpiCard title="Total Supply" value={totalSupply.toLocaleString()} subtext="CO₂e credits minted" />
                            <KpiCard title="Circulating Supply" value={circulatingSupply.toLocaleString()} subtext="CO₂e sold to investors" />
                            <KpiCard title="Treasury Balance" value={treasuryBalance.toLocaleString()} subtext="CO₂e credits remaining" />
                            <KpiCard title="Commissions Earned" value={`${totalCommissionEarned.toFixed(2)} ℏ`} subtext={`from ${commissionHistory.length} transactions`} />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Platform Assets</h2>
                            {isPlatformInitialized ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <TokenInfoCard title="Platform Token" collection={platformTokenInfo} />
                                    <TokenInfoCard title="HCS Audit Trail" collection={hcsTopicId ? { id: hcsTopicId } : null} type="topic" />
                                    <TokenInfoCard title="Farm NFT Collection" collection={farmNftCollectionInfo} />
                                    <TokenInfoCard title="Farmer NFT Collection" collection={farmerNftCollectionInfo} />
                                    <TokenInfoCard title="Investor NFT Collection" collection={investorNftCollectionInfo} />
                                </div>
                            ) : (
                                <div className="text-center bg-gray-50 p-8 rounded-lg">
                                    <h3 className="text-xl font-bold text-text-primary">Platform Not Initialized</h3>
                                    <p className="text-text-secondary mt-2 mb-6">Create all required on-chain tokens and NFT collections in one step.</p>
                                    <button onClick={() => setInitModalOpen(true)} disabled={loading} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 text-lg shadow-md">
                                        {loading ? 'Initializing...' : 'Initialize Platform'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {activeTab === 'farmVerifications' && (
                     <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-text-primary">Farm Verification Log</h2>
                        {/* FIX: Replaced array of arrays with an array of objects for mapping to fix TypeScript type inference issues. */}
                        {[{ title: 'Approved', farmList: approvedFarms }, { title: 'Rejected', farmList: rejectedFarms }].map(({ title, farmList }) => (
                            <div key={title}>
                                <h3 className="text-xl font-semibold mb-2">{title} Farms ({farmList.length})</h3>
                                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                    {farmList.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farm</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Credits</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Score</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reason/On-Chain ID</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">HCS Receipt</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{farmList.map(farm => (<tr key={farm.id}><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-text-primary">{farm.name}</div><div className="text-sm text-text-secondary">{farm.farmerName}</div></td><td className="px-6 py-4 whitespace-nowrap text-text-primary">{farm.totalTons.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{farm.approvalScore ? `${farm.approvalScore}/100` : 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">{farm.farmNftHashscanUrl ? <a href={farm.farmNftHashscanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Verified NFT</a> : farm.rejectionReason}</td><td className="px-6 py-4 whitespace-nowrap text-xs">{farm.hcsLog ? <a href={farm.hcsLog} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Log</a> : '—'}</td></tr>))}</tbody></table>
                                    ) : <p className="p-8 text-center text-text-secondary">No {title.toLowerCase()} farms.</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'commissionHistory' && (
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary mb-6">Platform Commission History</h2>
                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            {commissionHistory.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Farm</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total ℏ</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commission ({PLATFORM_COMMISSION_PERCENT}%)</th><th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Transaction</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{commissionHistory.map(item => (<tr key={item.id}><td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(item.date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{item.farmName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.totalHbar.toFixed(2)} ℏ</td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{item.commissionHbar.toFixed(4)} ℏ</td><td className="px-6 py-4 whitespace-nowrap text-sm">{item.hashscanUrl && (<a href={item.hashscanUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Receipt</a>)}</td></tr>))}</tbody></table>
                            ) : <p className="p-8 text-center text-text-secondary">No commissions earned yet.</p>}
                        </div>
                    </div>
                )}
                
                {activeTab === 'dangerZone' && (
                    <div className="bg-red-50 border-2 border-dashed border-red-200 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
                        <p className="text-red-700 text-sm mt-2">These actions are irreversible and will permanently delete on-chain assets. Use with caution.</p>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[platformTokenInfo, farmerNftCollectionInfo, investorNftCollectionInfo, farmNftCollectionInfo].map(collection => collection && (
                                <div key={collection.id} className="bg-white p-4 rounded-lg border border-red-200 flex justify-between items-center">
                                    <div><h3 className="font-bold">{collection.name} ({collection.symbol})</h3><p className="text-xs text-text-secondary truncate">ID: {collection.id}</p></div>
                                    <button onClick={() => setDeleteModal({ open: true, item: collection, type: 'token' })} disabled={loading} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {initModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full m-4 max-h-[90vh] flex flex-col">
                        <h2 className="text-2xl font-bold text-text-primary p-6 border-b">Confirm Platform Initialization</h2>
                        <div className="p-6 space-y-6 overflow-y-auto">
                             <p className="text-text-secondary text-sm">Review and edit the details for the on-chain assets before creation. This action costs HBAR and is irreversible.</p>
                             <fieldset className="border p-4 rounded-lg space-y-4">
                                <legend className="font-semibold px-2">Platform Token</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-text-primary">Name</label><input type="text" name="tokenName" value={initDetails.tokenName} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                    <div><label className="block text-sm font-medium text-text-primary">Symbol</label><input type="text" name="tokenSymbol" value={initDetails.tokenSymbol} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                </div>
                                 <div><label className="block text-sm font-medium text-text-primary">Initial Supply (will be 0 for mint-on-demand)</label><input type="number" name="initialSupply" value={initDetails.initialSupply} readOnly className={`${inputStyle} bg-gray-100`} /></div>
                             </fieldset>
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <fieldset className="border p-4 rounded-lg space-y-4">
                                    <legend className="font-semibold px-2">Farm NFTs</legend>
                                    <div><label className="block text-sm font-medium text-text-primary">Name</label><input type="text" name="farmNftName" value={initDetails.farmNftName} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                    <div><label className="block text-sm font-medium text-text-primary">Symbol</label><input type="text" name="farmNftSymbol" value={initDetails.farmNftSymbol} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                </fieldset>
                                <fieldset className="border p-4 rounded-lg space-y-4">
                                    <legend className="font-semibold px-2">Farmer NFTs</legend>
                                    <div><label className="block text-sm font-medium text-text-primary">Name</label><input type="text" name="farmerNftName" value={initDetails.farmerNftName} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                    <div><label className="block text-sm font-medium text-text-primary">Symbol</label><input type="text" name="farmerNftSymbol" value={initDetails.farmerNftSymbol} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                </fieldset>
                                <fieldset className="border p-4 rounded-lg space-y-4">
                                    <legend className="font-semibold px-2">Investor NFTs</legend>
                                    <div><label className="block text-sm font-medium text-text-primary">Name</label><input type="text" name="investorNftName" value={initDetails.investorNftName} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                    <div><label className="block text-sm font-medium text-text-primary">Symbol</label><input type="text" name="investorNftSymbol" value={initDetails.investorNftSymbol} onChange={handleInitDetailsChange} className={inputStyle} /></div>
                                </fieldset>
                             </div>
                        </div>
                        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50 rounded-b-lg">
                            <button type="button" onClick={() => setInitModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={handleInitializePlatform} disabled={loading} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">{loading ? 'Processing...' : 'Confirm & Create'}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"><div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full m-4"><div className="sm:flex sm:items-start"><div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"><h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Confirm Deletion</h3><div className="mt-2"><p className="text-sm text-gray-500">Are you sure you want to delete <span className="font-bold">{deleteModal.item.name}</span>? This will wipe/burn all associated assets and permanently delete the token from Hedera. <strong className="block mt-2">This action is irreversible.</strong></p></div></div></div><div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"><button onClick={handleDeleteSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">{loading ? 'Deleting...' : 'Yes, Delete'}</button><button type="button" onClick={() => setDeleteModal({ open: false, item: null, type: 'token' })} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm">Cancel</button></div></div></div>
            )}
        </div>
    );
};

export default AdminDashboard;