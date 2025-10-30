import React from 'react';
import { Link } from 'react-router-dom';
import { DatabaseIcon, LayersIcon, UsersIcon, CheckCircleIcon } from '../components/icons';

const AdminProcessPage: React.FC = () => {
    const initializationSteps = [
        {
            icon: LayersIcon,
            title: "Create Platform Tokens",
            description: "The Admin initiates the platform by creating all necessary on-chain assets using the Admin Dashboard. This includes the main carbon credit token (e.g., JCO2) and the three distinct NFT collections for farm verification, farmer achievements, and investor certificates."
        },
        {
            icon: DatabaseIcon,
            title: "Establish the Audit Trail",
            description: "A crucial step is creating the Hedera Consensus Service (HCS) topic. This acts as a permanent, tamper-proof logbook where every farm verification decision is recorded, ensuring radical transparency for all platform users."
        },
        {
            icon: CheckCircleIcon,
            title: "Configure the Treasury",
            description: "The newly created carbon credit tokens are held in the Admin's account, which functions as the platform treasury. Credits are only transferred from this treasury to an investor's wallet during a verified purchase, backed by a registered farm."
        }
    ];

    const managementRoles = [
        {
            icon: UsersIcon,
            title: "Facilitating User Interactions",
            description: "The Admin's treasury account is a key participant in every atomic swap. By holding the platform's token supply, the Admin enables the instant, trustless exchange of HBAR from an investor for carbon credit tokens, which are then sent to the investor."
        },
        {
            icon: LayersIcon,
            title: "Awarding On-Chain Achievements",
            description: "Following a significant transaction, the platform automatically triggers the minting of achievement NFTs. The Admin's account, as the supply key holder for the NFT collections, executes these minting operations, rewarding both farmers and investors."
        },
        {
            icon: CheckCircleIcon,
            title: "Platform Oversight",
            description: "While the dMRV process is automated with AI, the Admin provides oversight for the platform's health. This includes monitoring transaction flows, managing platform-level documentation, and using the Admin Dashboard to ensure all systems are functioning correctly."
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
