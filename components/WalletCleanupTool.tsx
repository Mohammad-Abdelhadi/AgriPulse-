import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { hederaService } from '../services/hederaService';
import { AppRole } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface AssociatedToken {
    token_id: string;
    name: string;
    symbol: string;
}

const WalletCleanupTool: React.FC = () => {
    const { user } = useAuth();
    const { deleteMultipleTokens, dissociateMultipleTokens } = useFarm();
    const { addNotification } = useNotification();
    
    const [tokens, setTokens] = useState<AssociatedToken[]>([]);
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleScan = useCallback(async () => {
        if (!user?.hederaAccountId) {
            addNotification("Please connect your wallet first.", "error");
            return;
        }
        setLoading(true);
        setLogs(['Scanning wallet for all associated tokens...']);
        setTokens([]);
        setSelectedTokens(new Set());
        try {
            const associatedTokens = await hederaService.getAccountAssociatedTokens(user.hederaAccountId);
            setTokens(associatedTokens);
            const message = `Found ${associatedTokens.length} associated tokens.`;
            setLogs(prev => [...prev, message]);
            addNotification(message, 'success');
        } catch (error: any) {
            const errorMessage = `ERROR: ${error.message}`;
            setLogs(prev => [...prev, errorMessage]);
            addNotification("Failed to scan wallet.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addNotification]);

    const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allTokenIds = new Set(tokens.map(t => t.token_id));
            setSelectedTokens(allTokenIds);
        } else {
            setSelectedTokens(new Set());
        }
    };

    const handleToggleSelect = (tokenId: string) => {
        setSelectedTokens(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tokenId)) {
                newSet.delete(tokenId);
            } else {
                newSet.add(tokenId);
            }
            return newSet;
        });
    };
    
    const logCallback = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const handleAction = async () => {
        if (selectedTokens.size === 0) {
            addNotification("Please select at least one token.", "info");
            return;
        }

        setLoading(true);
        setLogs([]);
        
        // FIX: Explicitly type `tokenIdsToProcess` as `string[]` to avoid type inference issues.
        const tokenIdsToProcess: string[] = Array.from(selectedTokens);

        try {
            if (user?.role === AppRole.ADMIN) {
                logCallback(`Starting DELETE operation for ${tokenIdsToProcess.length} token(s)...`);
                const result = await deleteMultipleTokens(tokenIdsToProcess, logCallback);
                 logCallback(`--- OPERATION COMPLETE ---`);
                 logCallback(result.summary);
                 addNotification(result.summary, result.success > 0 ? 'success' : 'error');

            } else if (user) {
                 logCallback(`Starting DISSOCIATE operation for ${tokenIdsToProcess.length} token(s)...`);
                 const result = await dissociateMultipleTokens(tokenIdsToProcess, user.role, logCallback);
                 logCallback(`--- OPERATION COMPLETE ---`);
                 logCallback(result.summary);
                 addNotification(result.summary, result.success > 0 ? 'success' : 'error');
            }
            
            // Refresh the list after the operation
            await handleScan();

        } catch (error: any) {
            logCallback(`FATAL ERROR: ${error.message}`);
            addNotification("An unexpected error occurred during the operation.", "error");
        } finally {
            setLoading(false);
            setSelectedTokens(new Set());
        }
    };

    const isSelectAllChecked = tokens.length > 0 && selectedTokens.size === tokens.length;
    const actionText = user?.role === AppRole.ADMIN ? 'Delete' : 'Disassociate';
    const actionButtonColor = user?.role === AppRole.ADMIN ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';

    return (
        <details className="bg-white p-6 rounded-xl shadow-lg" open>
            <summary className="font-bold text-xl cursor-pointer text-text-primary">Wallet Cleanup Tool</summary>
            <div className="mt-4 border-t pt-4">
                <p className="text-sm text-text-secondary mb-4">This tool scans your wallet for all tokens and allows you to clean them up. Use with caution.</p>
                <div className="p-4 bg-gray-100 rounded-lg text-sm text-text-secondary mb-4">
                     <p className="font-bold mb-2">
                        {user?.role === AppRole.ADMIN 
                         ? <><span className="text-green-600 font-bold">You can DELETE tokens.</span> This is a permanent, destructive action.</> 
                         : <><span className="text-green-600 font-bold">You can DISSOCIATE tokens.</span> This removes them from your wallet.</>}
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong className="text-red-600">Delete (Admin):</strong> Permanently destroys the token after burning/wiping all assets. Requires you to be the token's Admin.</li>
                        <li><strong className="text-blue-600">Disassociate (Farmer/Investor):</strong> Removes the token from your wallet. First, it will automatically transfer any remaining balance back to the treasury.</li>
                    </ul>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                    <button onClick={handleScan} disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        {loading ? 'Scanning...' : 'Scan My Wallet'}
                    </button>
                    {tokens.length > 0 && (
                        <button onClick={handleAction} disabled={loading || selectedTokens.size === 0} className={`${actionButtonColor} text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                            {loading ? 'Processing...' : `${actionText} Selected (${selectedTokens.size})`}
                        </button>
                    )}
                </div>

                {tokens.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <label className="flex items-center space-x-2 font-semibold">
                                <input type="checkbox" checked={isSelectAllChecked} onChange={handleToggleSelectAll} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                <span>Select All</span>
                            </label>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {tokens.map(token => (
                                <div key={token.token_id} className="p-4 border-b last:border-b-0 flex items-center space-x-3">
                                    <input type="checkbox" checked={selectedTokens.has(token.token_id)} onChange={() => handleToggleSelect(token.token_id)} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                    <div>
                                        <p className="font-bold text-text-primary">{token.name} ({token.symbol})</p>
                                        <p className="text-sm font-mono text-text-secondary">{token.token_id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {logs.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Live Console</h4>
                        <textarea
                            readOnly
                            value={logs.join('\n')}
                            className="w-full h-48 p-2 bg-gray-900 text-green-400 font-mono text-xs rounded-lg border border-gray-700"
                        />
                    </div>
                )}
            </div>
        </details>
    );
};

export default WalletCleanupTool;