import React from 'react';
import { FARMER_SHARE_PERCENT, PLATFORM_COMMISSION_PERCENT } from '../constants';

const ContractBuilderPage: React.FC = () => {
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Contract Builder Details (Admin View)</h1>
                <p className="mt-2 text-lg text-text-secondary">This is a temporary view for the admin to inspect contract logic and details.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-6 border-b pb-4">Simulated Smart Contract Logic</h2>
                <div className="space-y-4 text-text-secondary">
                    <p><strong className="text-text-primary">Workflow:</strong> Atomic Swap (Instant Exchange)</p>
                    <p><strong className="text-text-primary">Trigger:</strong> Investor `purchaseCredits` function call.</p>
                    <p><strong className="text-text-primary">Process:</strong></p>
                    <ol className="list-decimal list-inside ml-4 space-y-2">
                        <li>Farmer's approved credits are represented by the platform's fungible token, held in the Admin/Treasury account.</li>
                        <li>Investor selects credits and initiates the purchase.</li>
                        <li>A single, multi-party Hedera `TransferTransaction` is created.</li>
                        <li>The transaction requires signatures from both the Investor (for their HBAR) and the Admin/Treasury (for the platform's CO2 tokens).</li>
                        <li>Upon execution, the investor's HBAR is automatically split: <strong className="text-text-primary">{FARMER_SHARE_PERCENT}%</strong> is sent to the Farmer, and <strong className="text-text-primary">{PLATFORM_COMMISSION_PERCENT}%</strong> is sent to the Admin as a platform commission. Simultaneously, the CO2 tokens are sent from the Admin/Treasury to the Investor.</li>
                        <li>The transaction is instantly marked as `Completed`, ensuring all parties receive their assets in a single, trustless step.</li>
                    </ol>
                    <p className="mt-4 bg-yellow-100 p-4 rounded-md text-yellow-800">
                        <strong className="block">Note:</strong> This simulates a trustless escrow contract by leveraging Hedera's multi-signature transaction capabilities. The Admin is removed as a manual intermediary for settlements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContractBuilderPage;