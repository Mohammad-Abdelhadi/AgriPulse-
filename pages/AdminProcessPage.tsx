import React from 'react';
import { Link } from 'react-router-dom';
import { DatabaseIcon, LayersIcon, UsersIcon, CheckCircleIcon, NetworkIcon, SparklesIcon } from '../components/icons';

const AdminProcessPage: React.FC = () => {
    const initializationSteps = [
        {
            icon: LayersIcon,
            title: "Establishing the Marketplace with HTS",
            description: "The Admin uses the Hedera Token Service (HTS) to create the foundational on-chain assets: the main carbon credit token (e.g., JCO2) and the three distinct NFT collections that represent farm verifications, farmer achievements, and investor certificates."
        },
        {
            icon: DatabaseIcon,
            title: "Building Trust with HCS",
            description: "To solve the market's trust deficit, the Admin creates a Hedera Consensus Service (HCS) topic. This becomes the immutable, public logbook where every AI-powered dMRV decision is recorded, providing radical transparency for all users."
        },
        {
            icon: NetworkIcon,
            title: "Enabling Instant Liquidity",
            description: "The newly created carbon credit tokens are held in the Admin's account, which acts as the platform treasury. This enables instant, trustless settlement via Atomic Swaps, as the treasury can guarantee the availability of tokens for every purchase."
        }
    ];

    const managementRoles = [
        {
            icon: UsersIcon,
            title: "Powering the Economy via Atomic Swaps",
            description: "The Admin's treasury account is a key, automated participant in every purchase. It facilitates the instant, three-party atomic swap that simultaneously pays the farmer, takes a platform commission, and delivers carbon credits to the investor."
        },
        {
            icon: SparklesIcon,
            title: "Minting Verifiable Achievements",
            description: "Following a significant transaction, the platform automatically triggers the minting of AI-generated achievement NFTs. The Admin's account, holding the NFT supply keys, executes these minting operations to reward users."
        },
        {
            icon: CheckCircleIcon,
            title: "Ensuring Marketplace Integrity",
            description: "While most processes are automated, the Admin provides crucial oversight. This involves monitoring transaction flows via the dashboard, managing platform documentation, and ensuring all on-chain and off-chain systems function correctly."
        }
    ];

    return (
        <div className="bg-background animate-fade-in">
            <main>
                <section className="py-20 text-center container mx-auto px-4 bg-muted/30">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">The Admin: Steward of the Platform</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        The Platform Administrator is the leader responsible for establishing the on-chain infrastructure and ensuring the smooth, transparent operation of the AgriPulse marketplace.
                    </p>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Phase 1: Platform Initialization</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Before the marketplace can operate, the Admin must create the foundational assets on the Hedera network.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {initializationSteps.map((step, index) => (
                                <div key={index} className="p-8 shadow-soft text-center bg-white rounded-lg border">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Phase 2: Ongoing Management & Oversight</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Once initialized, the Admin's role shifts to facilitating marketplace activity and maintaining platform integrity.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {managementRoles.map((role, index) => (
                                <div key={index} className="p-8 shadow-soft text-center bg-white rounded-lg border">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                        <role.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{role.title}</h3>
                                    <p className="text-muted-foreground">{role.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-text-primary">A Commitment to Transparency</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                            The Admin's functions are designed to be as automated and transparent as possible. By leveraging native Hedera services like HCS and Atomic Swaps, we minimize manual intervention and maximize trust, ensuring AgriPulse remains a fair and efficient platform for everyone.
                        </p>
                        <Link to="/our-process">
                            <button className="mt-8 text-lg h-14 px-8 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg">
                                Back to Our Process
                            </button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminProcessPage;
