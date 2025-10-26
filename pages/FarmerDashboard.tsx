import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { Farm, FarmStatus, AppRole, NftRarity } from '../types';
import { FARMER_LEGACY_LEVELS, PRACTICES, HECTARE_TO_DUNUM } from '../constants';
import { Link } from 'react-router-dom';
import { hederaService } from '../services/hederaService';
import QrCodeModal from '../components/QrCodeModal';
import NftCard from '../components/NftCard';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

const FarmerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { farms, registerFarm, error, hbarToUsdRate, farmerNftCollectionInfo, associateWithFarmerNftCollection, farmerNfts } = useFarm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssociated, setIsAssociated] = useState(false);
    const [checkingAssociation, setCheckingAssociation] = useState(true);
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, url: '' });


    // New Farm State
    const [farmName, setFarmName] = useState('');
    const [location, setLocation] = useState('');
    const [story, setStory] = useState('');
    const [landArea, setLandArea] = useState(10);
    const [areaUnit, setAreaUnit] = useState<'dunum' | 'hectare'>('dunum');
    const [cropType, setCropType] = useState('');
    const [selectedPractices, setSelectedPractices] = useState<Set<string>>(new Set());
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [pricePerTon, setPricePerTon] = useState(0.01);

    const myFarms = useMemo(() => farms.filter(f => f.farmerId === user?.id), [farms, user]);
    const myNfts = useMemo(() => farmerNfts.filter(n => n.farmerId === user?.id).sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()), [farmerNfts, user]);
    
    const totalTonsSold = useMemo(() => 
        myFarms.reduce((sum, f) => sum + (f.totalTons - f.availableTons), 0),
    [myFarms]);

    const estimatedCredits = useMemo(() => {
        const areaInDunums = areaUnit === 'hectare' ? landArea * HECTARE_TO_DUNUM : landArea;
        // FIX: Add explicit types for the reduce function accumulator and value to prevent type inference errors.
        const totalEmissionFactor = Array.from(selectedPractices).reduce((sum: number, practiceId: string) => {
            const practice = PRACTICES.find(p => p.id === practiceId);
            return sum + (practice?.emissionFactor || 0);
        }, 0);
        return Math.round(areaInDunums * totalEmissionFactor);
    }, [landArea, areaUnit, selectedPractices]);

    useEffect(() => {
        const checkAssociation = async () => {
            if (user?.hederaAccountId && farmerNftCollectionInfo) {
                setCheckingAssociation(true);
                const balanceInfo = await hederaService.getRealAccountBalance(user.hederaAccountId);
                const associated = balanceInfo.tokens.some(t => t.tokenId === farmerNftCollectionInfo.id);
                setIsAssociated(associated);
                setCheckingAssociation(false);
            } else {
                setCheckingAssociation(false);
            }
        };
        checkAssociation();
    }, [user, farmerNftCollectionInfo]);

    const resetForm = () => {
        setFarmName(''); setLocation(''); setStory(''); setLandArea(10);
        setAreaUnit('dunum'); setCropType(''); setSelectedPractices(new Set());
        setImageUrl(undefined); setPricePerTon(0.01);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setImageUrl(base64);
        }
    };

    const handleRegisterFarm = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            registerFarm({
                name: farmName, location, story, landArea, areaUnit, cropType,
                practices: Array.from(selectedPractices), imageUrl, pricePerTon,
            }).then(success => {
                if (success) {
                    setIsModalOpen(false);
                    resetForm();
                }
            });
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

    const inputStyle = "px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-text-primary";

    return (
        <div className="space-y-12 animate-fade-in">
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
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-text-secondary font-semibold text-center mb-2">Farmer Legacy NFT Collection ({farmerNftCollectionInfo?.symbol || 'N/A'})</h3>
                <div className="text-center">
                    {farmerNftCollectionInfo && user?.hederaAccountId ? (
                        checkingAssociation ? (
                            <p className="text-sm text-text-secondary">Checking association status...</p>
                        ) : isAssociated ? (
                            <div className="text-sm font-semibold text-green-600">✅ Associated & Ready for Achievements</div>
                        ) : (
                            <div>
                                <p className="text-sm text-yellow-700 mb-2">Association required to receive achievement NFTs.</p>
                                <button
                                    onClick={associateWithFarmerNftCollection}
                                    className="text-sm bg-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    Associate NFT Collection
                                </button>
                            </div>
                        )
                    ) : (
                        <p className="text-sm text-text-secondary">Connect wallet to see NFT collection status.</p>
                    )}
                </div>
            </div>

            {/* My Farms Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-text-primary">My Farms</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!user?.hederaAccountId}>
                        Register New Farm
                    </button>
                </div>
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
            
             {/* Transaction NFT Gallery */}
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Register a New Farm</h2>
                        <form onSubmit={handleRegisterFarm} className="space-y-4">
                            
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Farm Name</label>
                                <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`}/>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Location (e.g., Governorate, GPS)</label>
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary text-gray-400">Farmer Legacy NFT Collection (N/A)</label>
                                <input type="text" disabled value="Connect wallet to see NFT eligibility" className={`mt-1 block w-full ${inputStyle} bg-gray-100 cursor-not-allowed`}/>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} required className={`mt-1 block w-full ${inputStyle}`}/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary">My Farm's Story</label>
                                <textarea value={story} onChange={(e) => setStory(e.target.value)} required rows={3} className={`mt-1 block w-full ${inputStyle}`}></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Carbon Reduction Practices</label>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PRACTICES.map(p => (
                                        <label key={p.id} className="flex items-center space-x-2">
                                            <input type="checkbox" checked={selectedPractices.has(p.id)} onChange={() => handlePracticeToggle(p.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                            <span>{p.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary">Upload Farm Photo</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} required className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:bg-opacity-20 file:text-primary hover:file:bg-opacity-30"/>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Price per Credit ($)</label>
                                <input type="number" value={pricePerTon} min="0.01" step="0.01" onChange={(e) => setPricePerTon(parseFloat(e.target.value) || 0)} required className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                            
                            <div className="bg-gray-100 p-4 rounded-lg mt-6 text-center">
                                <p className="font-semibold text-text-primary">Estimated Annual Credits: <span className="text-primary text-xl font-bold">{estimatedCredits.toLocaleString()} CO₂e</span></p>
                                <p className="text-xs text-text-secondary">(Calculated based on your land area and practices)</p>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">Submit for Verification</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
