import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { hederaService } from '../services/hederaService';
import { Link } from 'react-router-dom';
import WalletCleanupTool from '../components/WalletCleanupTool';

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
);

interface BalanceState {
    hbar: number;
    tokens: { tokenId: string, balance: number }[];
}

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { platformTokenInfo } = useFarm();
    const [balance, setBalance] = useState<BalanceState | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBalance = useCallback(async () => {
        if (user?.hederaAccountId) {
            setLoading(true);
            try {
                const fetchedBalance = await hederaService.getRealAccountBalance(user.hederaAccountId);
                setBalance(fetchedBalance);
            } catch (error) {
                console.error("Failed to fetch balance:", error);
                // Optionally show a toast message to the user
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const carbonCreditBalance = useMemo(() => {
        if (!balance || !platformTokenInfo) return 0;
        const token = balance.tokens.find(t => t.tokenId === platformTokenInfo.id);
        return token ? token.balance : 0;
    }, [balance, platformTokenInfo]);


    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">My Profile</h1>
                <p className="mt-4 text-lg text-text-secondary">Your personal hub for account details and wallet balances.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-6 border-b pb-4">Account Information</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-secondary">Email:</span>
                        <span className="font-medium text-text-primary">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-secondary">Role:</span>
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary-light bg-opacity-20 text-primary capitalize">{user?.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-secondary">Hedera Account ID:</span>
                        {user?.hederaAccountId ? (
                            <span className="font-mono text-primary font-bold">{user.hederaAccountId}</span>
                        ) : (
                            <span className="text-yellow-600 font-semibold">Not Connected</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-text-primary">Wallet Balance (Live from Testnet)</h2>
                    <button onClick={fetchBalance} disabled={loading} className="text-sm bg-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center space-x-2">
                         <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5"></path></svg>
                        <span>Refresh</span>
                    </button>
                </div>

                {user?.hederaAccountId ? (
                    loading ? ( 
                        <div className="flex justify-center items-center py-8">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-text-secondary font-semibold">HBAR Balance</p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {balance?.hbar.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xl">ℏ</span>
                                </p>
                            </div>
                             <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-text-secondary font-semibold">Carbon Credits ({platformTokenInfo?.symbol || 'N/A'})</p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {carbonCreditBalance.toLocaleString()}
                                </p>
                                <p className="text-xs text-text-secondary mt-1 truncate">Token ID: {platformTokenInfo?.id || 'N/A'}</p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-center py-8">
                        <p className="text-text-secondary mb-4">Connect your Hedera wallet to view your balances.</p>
                        <Link to="/wallet" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-md">
                            Connect Wallet
                        </Link>
                    </div>
                )}
            </div>

            {/* Wallet Cleanup Tool */}
            {user?.hederaAccountId && <WalletCleanupTool />}
        </div>
    );
};

export default ProfilePage;