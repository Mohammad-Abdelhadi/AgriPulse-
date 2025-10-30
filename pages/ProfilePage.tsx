import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { AppRole, CompanyProfile } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const ProfilePage: React.FC = () => {
    const { user, updateCompanyProfile } = useAuth();
    const { userBalance, platformTokenInfo, refreshUserBalance } = useFarm();
    const { addNotification } = useNotification();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(
        user?.companyProfile || { name: '', location: '', industry: '', annualCarbonFootprint: 1000 }
    );

    useEffect(() => {
        refreshUserBalance();
        setCompanyProfile(user?.companyProfile || { name: '', location: '', industry: '', annualCarbonFootprint: 1000 });
    }, [user]);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanyProfile(companyProfile);
        setIsProfileModalOpen(false);
    };

    const carbonCredits = userBalance?.tokens.find(t => t.tokenId === platformTokenInfo?.id)?.balance || 0;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">My Profile</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your account details and view your on-chain assets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-text-primary mb-4 border-b pb-3">Account Details</h2>
                        <div className="space-y-3 text-sm">
                            <p><strong className="text-text-secondary block">Email:</strong> <span className="text-text-primary break-all">{user?.email}</span></p>
                            <p><strong className="text-text-secondary block">Role:</strong> <span className="text-text-primary capitalize">{user?.role.toLowerCase().replace('_', ' ')}</span></p>
                            <p><strong className="text-text-secondary block">Hedera Account:</strong> <span className="text-primary font-mono">{user?.hederaAccountId || 'Not Connected'}</span></p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-text-primary mb-4 border-b pb-3">Wallet Balance</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-text-secondary">HBAR Balance</p>
                                <p className="text-3xl font-bold text-primary">{userBalance?.hbar.toFixed(4) || '0.00'} ℏ</p>
                            </div>
                             <div>
                                <p className="text-sm text-text-secondary">Carbon Credits ({platformTokenInfo?.symbol})</p>
                                <p className="text-3xl font-bold text-primary">{carbonCredits.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {user?.role === AppRole.INVESTOR && (
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                             <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-text-primary">Company Profile</h2>
                                <button onClick={() => setIsProfileModalOpen(true)} className="text-sm text-primary hover:underline font-semibold">Edit Profile</button>
                            </div>

                            {user.companyProfile ? (
                                <div className="mt-4 space-y-3">
                                    <p><strong className="text-text-secondary w-40 inline-block">Company Name:</strong> <span className="text-text-primary">{user.companyProfile.name}</span></p>
                                    <p><strong className="text-text-secondary w-40 inline-block">Location:</strong> <span className="text-text-primary">{user.companyProfile.location}</span></p>
                                    <p><strong className="text-text-secondary w-40 inline-block">Industry:</strong> <span className="text-text-primary">{user.companyProfile.industry}</span></p>
                                    <p><strong className="text-text-secondary w-40 inline-block">Annual Footprint:</strong> <span className="text-text-primary font-bold">{user.companyProfile.annualCarbonFootprint.toLocaleString()} CO₂e</span></p>
                                </div>
                            ) : (
                                <div className="mt-6 text-center text-text-secondary">
                                    <p>Your company profile is not set up yet.</p>
                                    <button onClick={() => setIsProfileModalOpen(true)} className="mt-2 text-primary font-bold hover:underline">Set it up now</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isProfileModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
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
        </div>
    );
};

export default ProfilePage;
