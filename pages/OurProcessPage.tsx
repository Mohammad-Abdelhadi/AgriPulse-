import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    UserPlusIcon, WalletIcon, ClipboardListIcon, SparklesIcon, CircleDollarSignIcon,
    BuildingIcon, SearchIcon, ShoppingCartIcon, RecycleIcon, TrendingUpIcon, ShieldIcon, LockIcon, ZapIcon, NetworkIcon, CheckCircleIcon
} from '../components/icons';

const SectionHeader: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
    <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">{subtitle}</p>
    </div>
);

const FeatureCard: React.FC<{ icon: React.FC<{className?: string}>, title: string, children: React.ReactNode, iconBg?: string, iconColor?: string }> = ({ icon: Icon, title, children, iconBg = 'bg-primary/10', iconColor = 'text-primary' }) => (
    <div className="p-6 space-y-2 border rounded-xl bg-background hover:shadow-medium transition-shadow duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{children}</p>
    </div>
);


const FarmerJourney: React.FC = () => {
    const timelineSteps = [
        { title: "Quick Registration", description: "Create your account in seconds by choosing the 'Farmer' role and providing your email and password.", icon: UserPlusIcon },
        { title: "Connect Your Wallet", description: "Securely connect your Hedera wallet. This is where you'll receive payments for your carbon credits instantly.", icon: WalletIcon },
        { title: "Register Your Farm", description: "Fill out our guided form with your farm's details and sustainable practices. Our AI can even help you generate a compelling story!", icon: ClipboardListIcon },
        { title: "AI-Powered Verification", description: "Our automated system analyzes your data for plausibility and calculates your farm's carbon credit potential, recording the result transparently on Hedera.", icon: SparklesIcon },
        { title: "Get Paid Instantly", description: "Once approved, your farm is listed. When an investor buys your credits, payment is transferred to your wallet instantly via Hedera's atomic swaps.", icon: CircleDollarSignIcon }
    ];

    return (
        <div className="space-y-20 animate-fade-in">
            <section>
                <SectionHeader title="Overcoming the Barriers" subtitle="Traditional carbon markets were not built for smallholder farmers. We're changing that." />
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <FeatureCard icon={TrendingUpIcon} title="High Costs" iconBg="bg-red-100" iconColor="text-red-600">Intermediaries take 40-60% of a credit's value, leaving you with minimal compensation for your hard work.</FeatureCard>
                    <FeatureCard icon={LockIcon} title="Barriers to Entry" iconBg="bg-red-100" iconColor="text-red-600">Small farmers face thousands in certification costs, effectively excluding them from the market.</FeatureCard>
                    <FeatureCard icon={CircleDollarSignIcon} title="Delayed Payments" iconBg="bg-red-100" iconColor="text-red-600">Complex settlement processes mean payments can take months, creating critical cash flow problems.</FeatureCard>
                </div>
            </section>
            
            <section>
                <SectionHeader title="Your Gateway to the Global Market" subtitle="AgriPulse provides the tools and technology to monetize your sustainable practices fairly and efficiently."/>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <FeatureCard icon={CheckCircleIcon} title="Direct Market Access">Our platform connects you directly to ESG-focused investors, cutting out the costly middlemen.</FeatureCard>
                    <FeatureCard icon={SparklesIcon} title="AI-Powered Verification">Our automated dMRV system uses AI to verify your farm data quickly and at no cost to you, making certification accessible.</FeatureCard>
                    <FeatureCard icon={ZapIcon} title="Instant Settlement">Receive 95% of every sale directly to your wallet via Hedera's secure, instant atomic swaps the moment a purchase is made.</FeatureCard>
                </div>
            </section>

            <section>
                <SectionHeader title="Your Step-by-Step Journey" subtitle="From registration to getting paid, our process is designed to be simple, fast, and transparent."/>
                <Timeline steps={timelineSteps} />
            </section>
        </div>
    );
};

const InvestorJourney: React.FC = () => {
    const timelineSteps = [
        { title: "Create Your Account", description: "Join by choosing the 'Investor' role. After signing up, set up your company profile to track your ESG goals.", icon: BuildingIcon },
        { title: "Explore Verified Farms", description: "Browse our marketplace of sustainable farms. Each listing includes a link to its on-chain verification receipt for ultimate transparency.", icon: SearchIcon },
        { title: "Purchase Credits Instantly", description: "Buy tokenized carbon credits directly from farmers through a secure, instant atomic swap on Hedera—no intermediaries, no delays.", icon: ShoppingCartIcon },
        { title: "Retire Credits for Impact", description: "To offset your carbon footprint, 'retire' your credits. This permanently removes them from circulation and records the action on-chain.", icon: RecycleIcon }
    ];

    return (
        <div className="space-y-20 animate-fade-in">
            <section>
                <SectionHeader title="The Challenge of Credibility" subtitle="Traditional carbon markets are opaque, making it difficult to verify the real-world impact of your investment." />
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <FeatureCard icon={ShieldIcon} title="Lack of Trust" iconBg="bg-red-100" iconColor="text-red-600">"Greenwashing" undermines market credibility with unverifiable claims and opaque reporting standards.</FeatureCard>
                    <FeatureCard icon={NetworkIcon} title="Inefficient Markets" iconBg="bg-red-100" iconColor="text-red-600">High intermediary costs and slow settlement processes mean less of your investment goes towards actual climate action.</FeatureCard>
                </div>
            </section>
            
            <section>
                <SectionHeader title="Investing in Verifiable Impact" subtitle="AgriPulse leverages blockchain and AI to provide radical transparency and ensure your investment makes a real difference."/>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <FeatureCard icon={ShieldIcon} title="On-Chain Audit Trail">Every farm verification is logged on the Hedera Consensus Service, providing an immutable, publicly auditable proof of authenticity.</FeatureCard>
                    <FeatureCard icon={ZapIcon} title="Efficient & Direct Funding">Hedera's atomic swaps enable instant, low-fee transactions that send the vast majority of your funds directly to the farmer.</FeatureCard>
                    <FeatureCard icon={CheckCircleIcon} title="Verifiable Retirement">Retiring credits is an on-chain action that permanently destroys the tokens, providing cryptographic proof of your offset.</FeatureCard>
                </div>
            </section>
            
            <section>
                <SectionHeader title="Your Step-by-Step Journey" subtitle="From discovery to impact, our platform ensures every step is transparent, secure, and meaningful."/>
                <Timeline steps={timelineSteps} />
            </section>
        </div>
    );
};


const Timeline: React.FC<{ steps: { title: string, description: string, icon: React.FC<{className?: string}> }[] }> = ({ steps }) => (
    <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-6 top-6 h-full w-0.5 bg-border -translate-x-1/2"></div>
        {steps.map((step, index) => (
            <div key={index} className="relative pl-16 pb-12">
                <div className="absolute left-6 top-1 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white -translate-x-1/2 ring-8 ring-background">
                    <step.icon className="w-6 h-6" />
                </div>
                <div className="p-6 rounded-xl shadow-lg bg-white border">
                    <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                    <p className="text-text-secondary">{step.description}</p>
                </div>
            </div>
        ))}
    </div>
);


const OurProcessPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('farmer');

    const TabButton = ({ id, label }: { id: string, label: string }) => (
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
                        <div className="flex justify-center space-x-4 bg-muted p-2 rounded-full max-w-md mx-auto mb-16">
                            <TabButton id="farmer" label="Farmer's Journey" />
                            <TabButton id="investor" label="Investor's Journey" />
                        </div>

                        {activeTab === 'farmer' ? <FarmerJourney /> : <InvestorJourney />}
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
