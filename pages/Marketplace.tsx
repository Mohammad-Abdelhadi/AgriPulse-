import React, { useState, useEffect } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { useAuth } from '../contexts/AuthContext';
import { Farm, FarmStatus } from '../types';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { PLATFORM_COMMISSION_PERCENT, PLATFORM_COMMISSION_RATE, FARMER_SHARE_PERCENT } from '../constants';

const Marketplace: React.FC = () => {
    const { user } = useAuth();
    const { farms, purchaseCredits, hbarToUsdRate } = useFarm();
    const { addNotification } = useNotification();
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [purchaseAmount, setPurchaseAmount] = useState(1);
    const [purchaseDetails, setPurchaseDetails] = useState({ totalHbar: 0, farmerReceives: 0, commission: 0 });

    const approvedFarms = farms.filter(farm => farm.status === FarmStatus.APPROVED);

    useEffect(() => {
        if (selectedFarm && hbarToUsdRate > 0) {
            const totalUsd = purchaseAmount * selectedFarm.pricePerTon;
            const totalHbar = totalUsd / hbarToUsdRate;
            const commission = totalHbar * PLATFORM_COMMISSION_RATE;
            const farmerReceives = totalHbar - commission;
            setPurchaseDetails({ totalHbar, farmerReceives, commission });
        }
    }, [purchaseAmount, selectedFarm, hbarToUsdRate]);


    const handlePurchase = () => {
        if (selectedFarm && user?.hederaAccountId) {
            purchaseCredits(selectedFarm.id, purchaseAmount);
            setSelectedFarm(null);
            setPurchaseAmount(1);
        } else if (!user?.hederaAccountId) {
            addNotification("Please connect your Hedera wallet before making a purchase.", "error");
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Carbon Credit Marketplace</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">Invest in a greener future by purchasing carbon credits directly from our trusted farmers.</p>
            </div>
            
            {!user ? (
                 <div className="mb-8 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Welcome, Guest!</p>
                    <p>To participate in the marketplace, please <Link to="/auth" className="underline font-semibold">create an account</Link> and connect your wallet.</p>
                </div>
            ) : !user.hederaAccountId && (
                 <div className="mb-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Connect Your Wallet</p>
                    <p>To purchase carbon credits, please connect your Hedera account on the <Link to="/wallet" className="underline font-semibold">Wallet page</Link>.</p>
                </div>
            )}

            {approvedFarms.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-text-primary">No Farms Available</h2>
                    <p className="text-text-secondary mt-2">Check back soon! New farms are being approved regularly.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {approvedFarms.map(farm => (
                        <div key={farm.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            {farm.imageUrl && <img src={farm.imageUrl} alt={farm.name} className="h-48 w-full object-cover" />}
                            <div className="p-6 flex-grow">
                                <h3 className="text-2xl font-bold text-primary">{farm.name}</h3>
                                <p className="text-sm text-text-secondary mt-1">by {farm.farmerName}</p>
                                <div className="mt-2 flex items-center text-xs text-text-secondary">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span>{farm.location}</span>
                                    <span className="mx-2">|</span>
                                    <span>{farm.cropType}</span>
                                </div>
                                
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-text-secondary">Available Credits:</span>
                                        <span className="font-bold text-lg text-text-primary">{farm.availableTons.toLocaleString()} CO₂e</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-text-secondary">Price per Credit:</span>
                                        <div className="text-right">
                                            <span className="font-bold text-lg text-primary">${farm.pricePerTon.toFixed(2)}</span>
                                            {hbarToUsdRate > 0 && <p className="text-xs text-text-secondary">~ {(farm.pricePerTon / hbarToUsdRate).toFixed(2)} ℏ</p>}
                                        </div>
                                    </div>
                                </div>
                                {farm.hcsLog && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <a href={farm.hcsLog} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                                             <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            On-Chain Verification Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 p-6">
                                <button 
                                    onClick={() => { setSelectedFarm(farm); setPurchaseAmount(1); }}
                                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={farm.availableTons === 0 || !user?.hederaAccountId}
                                >
                                    {farm.availableTons === 0 ? 'Sold Out' : 'Purchase Credits'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedFarm && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
                        <div className="flex justify-between items-center p-6 border-b">
                           <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary">Purchase Credits</h2>
                           </div>
                           <button onClick={() => setSelectedFarm(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <div className="p-6">
                             <p className="mb-4 font-semibold text-text-primary">You are purchasing from <span className="text-primary">{selectedFarm.name}</span>.</p>
                            
                            <div className="my-6">
                                <label className="block text-sm font-medium text-text-primary mb-2">Number of Credits (CO₂e tons):</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={selectedFarm.availableTons}
                                    value={purchaseAmount}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        const maxAmount = selectedFarm.availableTons;
                                        setPurchaseAmount(Math.max(1, Math.min(value, maxAmount)));
                                    }}
                                    className="w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            
                            <div className="bg-gray-100 p-4 rounded-lg mt-6 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Farmer Receives ({FARMER_SHARE_PERCENT}%):</span>
                                    <span className="font-semibold text-text-primary">~ {purchaseDetails.farmerReceives.toFixed(4)} ℏ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Platform Commission ({PLATFORM_COMMISSION_PERCENT}%):</span>
                                    <span className="font-semibold text-text-primary">~ {purchaseDetails.commission.toFixed(4)} ℏ</span>
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                    <span className="text-text-primary">Total Payment:</span>
                                    <span className="text-primary">~ {purchaseDetails.totalHbar.toFixed(4)} ℏ</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 p-6 bg-gray-50 rounded-b-lg">
                            <button onClick={() => setSelectedFarm(null)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={handlePurchase} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">Confirm Purchase</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;