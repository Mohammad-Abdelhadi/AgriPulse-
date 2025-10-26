import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { AppRole } from '../types';
import { FARMER_LEGACY_LEVELS, INVESTOR_IMPACT_LEVELS } from '../constants';

type TransactionType = 'Credit Purchase' | 'NFT Mint' | 'Credit Retirement';

interface TransactionItem {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  details: string;
  actions: { label: string, url?: string }[];
}


const ICONS: Record<TransactionType, { component: React.ReactNode, bgColor: string }> = {
    'Credit Purchase': {
        component: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
        bgColor: 'bg-blue-100'
    },
    'NFT Mint': {
        component: <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>,
        bgColor: 'bg-yellow-100'
    },
    'Credit Retirement': {
        component: <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
        bgColor: 'bg-red-100'
    }
};


const TransactionHistory: React.FC = () => {
    const { user } = useAuth();
    const { farms, purchases, farmerNfts, investorNfts, retirements } = useFarm();

    const historyItems = useMemo(() => {
        if (!user) return [];

        const items: TransactionItem[] = [];

        if (user.role === AppRole.INVESTOR) {
            purchases.filter(p => p.investorId === user.id).forEach(p => {
                const farm = farms.find(f => f.id === p.farmId);
                const purchaseActions = [{ label: 'View HBAR Payment', url: p.hashscanUrl }];
                if (p.tokenTransferStatus === 'COMPLETED') {
                    purchaseActions.push({ label: 'View Token Receipt', url: p.tokenTransferTxUrl });
                }
                items.push({
                    id: `p-${p.id}`, date: p.purchaseDate, type: 'Credit Purchase',
                    description: `From ${farm?.name || 'Unknown Farm'}`,
                    details: `${p.tonsPurchased.toLocaleString()} CO₂e credits for $${p.totalPrice.toFixed(2)}`,
                    actions: purchaseActions
                });
            });

            retirements.filter(r => r.investorId === user.id).forEach(r => {
                items.push({
                    id: `r-${r.id}`, date: r.retirementDate, type: 'Credit Retirement',
                    description: `Retired credits to offset emissions`,
                    details: `${r.amount.toLocaleString()} CO₂e credits permanently retired`,
                    actions: [{ label: 'View Retirement TX', url: r.hashscanUrl }]
                });
            });

            investorNfts.filter(n => n.investorId === user.id).forEach(n => {
                const level = INVESTOR_IMPACT_LEVELS.find(l => l.id === n.nftLevelId);
                items.push({
                    id: `inft-${n.id}`, date: n.mintDate, type: 'NFT Mint',
                    description: `Earned a new Impact Certificate!`,
                    details: `${level?.name || 'NFT'} (S/N: ${n.hederaSerialNumber})`,
                    actions: [{ label: 'View Mint Transaction', url: n.hashscanUrl }],
                });
            });
        }

        if (user.role === AppRole.FARMER) {
            farmerNfts.filter(n => n.farmerId === user.id).forEach(n => {
                const level = FARMER_LEGACY_LEVELS.find(l => l.id === n.nftLevelId);
                items.push({
                    id: `fnft-${n.id}`, date: n.mintDate, type: 'NFT Mint',
                    description: `Earned a new Legacy Badge!`,
                    details: `${level?.name || 'NFT'} Badge (S/N: ${n.hederaSerialNumber})`,
                    actions: [{ label: 'View Mint Transaction', url: n.hashscanUrl }],
                });
            });
        }

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [user, purchases, farmerNfts, investorNfts, farms, retirements]);


    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Transaction History</h1>
                <p className="mt-4 text-lg text-text-secondary">A chronological log of your on-chain and platform activities.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                {historyItems.length > 0 ? (
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {historyItems.map((item, itemIdx) => (
                                <li key={item.id}>
                                    <div className="relative pb-8">
                                        {itemIdx !== historyItems.length - 1 ? (
                                            <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex items-start space-x-4">
                                            <div>
                                                <div className={`h-10 w-10 ${ICONS[item.type].bgColor} rounded-full flex items-center justify-center ring-8 ring-white`}>
                                                    {ICONS[item.type].component}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-semibold text-text-primary">{item.type}</p>

                                                    <p className="text-sm text-text-secondary">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                                                <p className="font-medium text-text-primary">{item.details}</p>
                                                <div className="mt-2">
                                                    {item.actions.map((action, idx) => action.url && (
                                                        <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mr-4">
                                                            {action.label}
                                                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Your recent activities will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;