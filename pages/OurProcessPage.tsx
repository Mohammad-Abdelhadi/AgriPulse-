import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    UserPlusIcon, WalletIcon, ClipboardListIcon, SparklesIcon, CircleDollarSignIcon,
    BuildingIcon, SearchIcon, ShoppingCartIcon, RecycleIcon
} from '../components/icons';

const OurProcessPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('farmer');

    const farmerSteps = [
        { title: "Quick Registration", description: "Create your account in seconds by choosing the 'Farmer' role and providing your email and password.", icon: UserPlusIcon },
        { title: "Connect Your Wallet", description: "Securely connect your Hedera wallet. This is where you'll receive payments for your carbon credits instantly.", icon: WalletIcon },
        { title: "Register Your Farm", description: "Fill out our guided form with your farm's details and sustainable practices. Our AI can even help you generate a compelling story!", icon: ClipboardListIcon },
        { title: "AI-Powered Verification", description: "Our automated system analyzes your data for plausibility and calculates your farm's carbon credit potential, recording the result transparently on Hedera.", icon: SparklesIcon },
        { title: "Get Paid Instantly", description: "Once approved, your farm is listed. When an investor buys your credits, payment is transferred to your wallet instantly via Hedera's atomic swaps.", icon: CircleDollarSignIcon }
    ];

    const investorSteps = [
        { title: "Create Your Account", description: "Join by choosing the 'Investor' role. After signing up, set up your company profile to track your ESG goals.", icon: BuildingIcon },
        { title: "Explore Verified Farms", description: "Browse our marketplace of sustainable farms. Each listing includes a link to its on-chain verification receipt for ultimate transparency.", icon: SearchIcon },
        { title: "Purchase Credits Instantly", description: "Buy tokenized carbon credits directly from farmers through a secure, instant atomic swap on Hedera—no intermediaries, no delays.", icon: ShoppingCartIcon },
        { title: "Retire Credits for Impact", description: "To offset your carbon footprint, 'retire' your credits. This permanently removes them from circulation and records the action on-chain.", icon: RecycleIcon }
    ];
    
    const renderTimeline = (steps: typeof farmerSteps) => (
        <div className="relative max-w-3xl mx-auto mt-16">
            <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-0.5 bg-border -translate-x-1/2"></div>
            {steps.map((step, index) => (
                <div key={index} className="relative mb-12">
                    <div className="absolute left-1/2 top-4 w-4 h-4 bg-primary rounded-full -translate-x-1/2 border-4 border-background"></div>
                    <div className={`p-8 rounded-xl shadow-lg w-[calc(50%-2rem)] ${index % 2 === 0 ? 'ml-auto text-left' : 'mr-auto text-right'}`}>
                        <div className={`absolute top-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white ${index % 2 === 0 ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}>
                            <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                        <p className="text-text-secondary">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
    
     const TabButton = ({ id, label, activeTab, setActiveTab }: { id: string, label: string, activeTab: string, setActiveTab: (id: string) => void }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-8 py-3 font-bold text-lg rounded-full transition-all duration-300 ${activeTab === id ? 'bg-primary text-white shadow-lg' : 'bg-muted text-text-secondary hover:bg-secondary-dark'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-background">
            <main>
                <section className="py-20 text-center container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Process</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        A transparent, efficient, and secure journey from farm to impact, powered by Hedera and AI.
                    </p>
                </section>
                
                <section className="pb-20">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-center space-x-4 bg-muted p-2 rounded-full max-w-md mx-auto">
                            <TabButton id="farmer" label="Farmer's Journey" activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="investor" label="Investor's Journey" activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>

                        {activeTab === 'farmer' ? renderTimeline(farmerSteps) : renderTimeline(investorSteps)}
                    </div>
                </section>
                
                 <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-text-primary">The Platform Steward</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Curious about how the platform is managed? Learn about the crucial role of the platform administrator in maintaining integrity and enabling the marketplace.
                        </p>
                        <Link to="/admin-process">
                            <button className="mt-8 text-lg h-14 px-8 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Explore the Admin's Role
                            </button>
                        </Link>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                      <div className="p-12 shadow-medium bg-gradient-to-br from-primary to-primary-dark text-primary-foreground text-center rounded-xl">
                        <h2 className="text-4xl font-bold mb-4">
                          Join the Future of Sustainable Agriculture
                        </h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                          Register today to start your journey with AgriPulse.
                        </p>
                        <Link to="/auth">
                           <button className="text-lg h-14 px-8 bg-white text-primary font-bold rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto">
                              Get Started
                            </button>
                        </Link>
                      </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OurProcessPage;