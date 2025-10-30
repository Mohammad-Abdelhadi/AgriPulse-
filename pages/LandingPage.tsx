import React from 'react';
import { Link } from "react-router-dom";
import { 
  CheckCircleIcon,
  ShieldIcon, 
  ZapIcon,
} from "../components/icons";

const LandingPage = () => {
  return (
    <div className="bg-white text-text-primary font-sans">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-4 leading-tight tracking-tighter animate-fade-in">
                    The Future of <span className="text-primary">Carbon Credits</span> is Transparent.
                </h1>
                <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-xl mx-auto md:mx-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    AgriPulse is a decentralized marketplace that connects sustainable farmers directly with investors, powered by AI verification and the Hedera blockchain.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <Link 
                      to="/auth" 
                      className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-lg text-lg"
                    >
                      Get Started
                    </Link>
                    <Link 
                      to="/marketplace" 
                      className="inline-block bg-gray-200 text-text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors shadow-lg text-lg"
                    >
                      Explore Marketplace
                    </Link>
                </div>
            </div>
             <div className="md:w-1/2 mt-12 md:mt-0">
                <img src="https://i.ibb.co/pnv1b9m/kenya-farm.jpg" alt="Sustainable farming" className="rounded-2xl shadow-2xl mx-auto" />
             </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why AgriPulse?</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-12">We replace bureaucracy and middlemen with code and transparency.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    icon={<CheckCircleIcon className="w-10 h-10 text-primary" />}
                    title="AI-Powered Verification"
                    description="Our automated dMRV process uses Google Gemini to ensure every carbon credit is legitimate and trustworthy."
                />
                <FeatureCard
                    icon={<ZapIcon className="w-10 h-10 text-primary" />}
                    title="Instant Payments"
                    description="Hedera's low-cost atomic swaps mean farmers get paid instantly, and investors get their credits immediately."
                />
                 <FeatureCard
                    icon={<ShieldIcon className="w-10 h-10 text-primary" />}
                    title="Radical Transparency"
                    description="Every verification and transaction is recorded on the Hedera Consensus Service, creating an immutable audit trail."
                />
            </div>
        </div>
      </section>

      {/* How It Works Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">A Simple Path to Impact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img src="https://i.ibb.co/N1p29M1/jordan-olives.jpg" alt="Farmer working" className="rounded-2xl shadow-xl w-full" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4">For Farmers</h3>
                        <ul className="space-y-4">
                            <StepItem number="1" text="Register your farm with our simple, guided process." />
                            <StepItem number="2" text="Our AI verifies your data and calculates your carbon credits." />
                            <StepItem number="3" text="Get listed on the marketplace and receive instant payments when your credits sell." />
                        </ul>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-20">
                     <div className="md:order-2">
                        <img src="https://i.ibb.co/M9BPhH5/investor-meeting.jpg" alt="Investor meeting" className="rounded-2xl shadow-xl w-full" />
                    </div>
                    <div className="md:order-1 text-right">
                        <h3 className="text-2xl font-bold text-primary mb-4">For Investors</h3>
                         <ul className="space-y-4">
                            <StepItem number="1" text="Create an account and browse verified, high-impact farm projects." />
                            <StepItem number="2" text="Purchase credits instantly and securely with HBAR." />
                            <StepItem number="3" text="Retire credits to offset your carbon footprint, all with on-chain proof." />
                        </ul>
                    </div>
                </div>
            </div>
        </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="p-12 bg-primary text-white text-center rounded-xl shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Join the Movement.</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Be a part of a fair, transparent, and effective carbon market.
            </p>
            <Link to="/auth" className="text-lg h-14 px-8 bg-white text-primary font-bold rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-105 inline-flex items-center">
                Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-6">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>
    </div>
);

const StepItem: React.FC<{ number: string, text: string }> = ({ number, text }) => (
    <li className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">
            {number}
        </div>
        <p className="text-lg text-text-secondary">{text}</p>
    </li>
);

export default LandingPage;