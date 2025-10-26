import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { FARMER_LEGACY_LEVELS } from '../constants';
import { NftRarity, AppRole } from '../types';
import QrCodeModal from '../components/QrCodeModal';

const NftGallery: React.FC = () => {
    const { user } = useAuth();
    const { farmerNfts } = useFarm();
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, url: '' });
    
    // This gallery is now just for farmers, showing their transaction NFTs.
    const myNfts = user?.role === AppRole.FARMER 
        ? farmerNfts.filter(nft => nft.farmerId === user.id)
            .map(nft => ({ ...nft, level: FARMER_LEGACY_LEVELS.find(l => l.id === nft.nftLevelId) }))
            .filter(nft => nft.level)
            .sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime())
        : [];

    const getRarityStyles = (rarity: NftRarity) => {
        switch (rarity) {
            case NftRarity.BRONZE: return { border: 'border-amber-500', bg: 'bg-amber-800/10' };
            case NftRarity.SILVER: return { border: 'border-gray-400', bg: 'bg-gray-500/10' };
            case NftRarity.GOLD: return { border: 'border-yellow-400', bg: 'bg-yellow-500/10' };
            default: return { border: 'border-gray-400', bg: 'bg-gray-500/10' };
        }
    };
    
    return (
        <div className="animate-fade-in">
            <QrCodeModal 
                isOpen={qrCodeModal.isOpen} 
                onClose={() => setQrCodeModal({ isOpen: false, url: ''})} 
                url={qrCodeModal.url}
                title="Verify on HashScan"
            />
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Farmer Achievement Gallery</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">A collection of unique on-chain NFTs awarded for significant individual sales.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {FARMER_LEGACY_LEVELS.map(level => {
                    const myNftInstances = myNfts.filter(n => n.nftLevelId === level.id);
                    const isUnlocked = myNftInstances.length > 0;
                    
                    return (
                        <div key={level.id} className={`relative rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col`}>
                           <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold text-primary">{level.name}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getRarityStyles(level.rarity).border}`}>
                                        {level.rarity}
                                    </span>
                                </div>
                                <div className="my-6 mx-auto">
                                    <img src={level.imageUrl} alt={level.name} className={`w-48 h-48 rounded-full object-cover border-4 ${isUnlocked ? getRarityStyles(level.rarity).border : 'border-gray-200'} ${isUnlocked ? '' : 'grayscale'}`} />
                                </div>
                                <p className="text-center text-text-secondary flex-grow">{level.description}</p>
                            </div>
                            
                            <div className="mt-auto bg-gray-50 p-6">
                                {isUnlocked ? (
                                    <div className="text-center">
                                        <p className="font-bold text-lg text-green-600">UNLOCKED ({myNftInstances.length})</p>
                                        <p className="text-xs text-text-secondary mt-1">You have earned this badge {myNftInstances.length} time(s).</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="font-bold text-lg text-gray-400">LOCKED</p>
                                        <p className="text-xs text-text-secondary mt-1">Requires a single sale of {level.tonsThreshold.toLocaleString()} CO₂e credits</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NftGallery;
