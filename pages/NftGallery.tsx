import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { FARMER_LEGACY_LEVELS, INVESTOR_IMPACT_LEVELS } from '../constants';
import { NftRarity, AppRole } from '../types';

const MedalIcon: React.FC<{ rarity: NftRarity }> = ({ rarity }) => {
    const colors = {
        [NftRarity.BRONZE]: { fill: 'fill-amber-500', stroke: 'stroke-amber-700' },
        [NftRarity.SILVER]: { fill: 'fill-gray-400', stroke: 'stroke-gray-600' },
        [NftRarity.GOLD]: { fill: 'fill-yellow-400', stroke: 'stroke-yellow-600' },
    };
    const color = colors[rarity];

    return (
        <svg className={`w-24 h-24 ${color.fill}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fillOpacity="0.3" />
            <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" stroke={color.stroke} strokeWidth="1.5" strokeOpacity="0.5" />
            <path d="M15.293 10.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L10.5 12.586l3.293-3.293a1 1 0 111.414 1.414zM9 22v-3.5h6V22L12 20l-3 2z" className={color.stroke} strokeWidth="1.5" />
            <path d="M12 6a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zM12 4a1 1 0 100-2 1 1 0 000 2z" fillOpacity="0.8" />
        </svg>
    );
};

const NftGallery: React.FC = () => {
    const { user } = useAuth();
    const { farmerNfts, investorNfts } = useFarm();

    const isFarmer = user?.role === AppRole.FARMER;

    // Set up dynamic content based on user role
    const pageTitle = isFarmer ? "Farmer Achievement Gallery" : "Impact Certificate Gallery";
    const pageDescription = isFarmer
        ? "A collection of on-chain badges awarded for your significant sales."
        : "A collection of on-chain certificates recognizing your significant purchases.";
    const levels = isFarmer ? FARMER_LEGACY_LEVELS : INVESTOR_IMPACT_LEVELS;
    const myNfts = isFarmer
        ? farmerNfts.filter(nft => nft.farmerId === user.id)
        : investorNfts.filter(nft => nft.investorId === user?.id);


    const getRarityStyles = (rarity: NftRarity) => {
        switch (rarity) {
            case NftRarity.BRONZE: return {
                gradient: 'bg-gradient-to-br from-amber-100 to-amber-200',
                border: 'border-amber-400',
                text: 'text-amber-800',
                shadow: 'shadow-amber-500/20'
            };
            case NftRarity.SILVER: return {
                gradient: 'bg-gradient-to-br from-gray-200 to-gray-300',
                border: 'border-gray-400',
                text: 'text-gray-800',
                shadow: 'shadow-gray-500/20'
            };
            case NftRarity.GOLD: return {
                gradient: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
                border: 'border-yellow-500',
                text: 'text-yellow-800',
                shadow: 'shadow-yellow-500/30'
            };
            default: return {
                gradient: 'bg-gray-100',
                border: 'border-gray-300',
                text: 'text-gray-800',
                shadow: 'shadow-gray-400/20'
            };
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">{pageTitle}</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">{pageDescription}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {levels.map(level => {
                    const myNftInstances = myNfts.filter(n => n.nftLevelId === level.id);
                    const isUnlocked = myNftInstances.length > 0;
                    const rarityStyles = getRarityStyles(level.rarity);
                    
                    return (
                        <div key={level.id} className={`relative rounded-2xl overflow-hidden shadow-2xl ${rarityStyles.gradient} flex flex-col p-8 text-center border-2 ${isUnlocked ? rarityStyles.border : 'border-gray-300'} ${isUnlocked ? '' : 'grayscale'} transition-all duration-300 ${rarityStyles.shadow}`}>
                           <div className="flex justify-center items-center h-32">
                                <MedalIcon rarity={level.rarity} />
                           </div>
                           
                           <h3 className={`text-2xl font-bold mt-4 ${rarityStyles.text}`}>{level.name}</h3>
                           
                           <p className="text-sm text-text-secondary mt-2 flex-grow min-h-[60px]">{level.description}</p>
                            
                            <div className="mt-6">
                                {isUnlocked ? (
                                    <div className="bg-white/50 rounded-lg p-4">
                                        <p className="font-bold text-lg text-green-700">UNLOCKED</p>
                                        <p className="text-sm font-semibold text-green-600 mt-1">Earned {myNftInstances.length} time(s)</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-500/10 rounded-lg p-4">
                                        <p className="font-bold text-lg text-gray-500">LOCKED</p>
                                        <p className="text-xs text-text-secondary mt-1">Requires a {isFarmer ? 'sale' : 'purchase'} of {level.tonsThreshold.toLocaleString()}+ CO₂e</p>
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