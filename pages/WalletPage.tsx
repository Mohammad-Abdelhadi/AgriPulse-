import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const WalletPage: React.FC = () => {
    const { user, updateUserWallet } = useAuth();
    const { addNotification } = useNotification();
    const [accountId, setAccountId] = useState('');
    const [privateKey, setPrivateKey] = useState('');

    useEffect(() => {
        if (user?.hederaAccountId) {
            setAccountId(user.hederaAccountId);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const message = await updateUserWallet(accountId, privateKey);
            addNotification(message, 'success');
            setPrivateKey(''); // Clear private key from state after submission for security
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Connect Your Wallet</h1>
                <p className="mt-4 text-lg text-text-secondary">Connect your Hedera Testnet account to participate in the marketplace.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8" role="alert">
                    <p className="font-bold">Security Warning</p>
                    <p>Never share your private key. For this demo, we store it locally, but in a real application, you should use a secure wallet extension like HashPack.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="accountId" className="block text-sm font-medium text-text-primary">Hedera Account ID</label>
                        <input
                            type="text"
                            id="accountId"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="0.0.12345"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="privateKey" className="block text-sm font-medium text-text-primary">Hedera Private Key</label>
                        <input
                            type="password"
                            id="privateKey"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="••••••••••••••••••••••••••••"
                            required
                        />
                         <p className="mt-2 text-xs text-text-secondary">Your private key is used for this session only and will not be displayed again.</p>
                    </div>
                    
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
                        >
                            Save Credentials
                        </button>
                    </div>
                </form>

                {user?.hederaAccountId && (
                     <div className="mt-8 border-t pt-6">
                         <h3 className="text-lg font-bold text-text-primary">Connected Account</h3>
                         <p className="text-text-secondary mt-2">Your account <span className="font-mono text-primary">{user.hederaAccountId}</span> is connected.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage;