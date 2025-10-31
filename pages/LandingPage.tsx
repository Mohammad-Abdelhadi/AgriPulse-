import React from 'react';
import { Link } from "react-router-dom";
// import { heroImage } from "../assets/heroImage.jpg";
import { 
  SproutIcon, 
  TrendingUpIcon, 
  ShieldIcon, 
  ZapIcon, 
  GlobeIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  LeafIcon,
  NetworkIcon,
  AwardIcon,
  LockIcon,
  BarChart3Icon
} from "../components/icons";

const LandingPage = () => {
  return (
    <div className="bg-white text-text-primary font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50/50">
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center md:text-left">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary border border-primary/20">
                Powered by Hedera Hashgraph
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tighter">
                Transparent Carbon Credits for a{" "}
                <span className="text-primary">
                  Sustainable Future
                </span>
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed max-w-xl mx-auto md:mx-0">
                Connecting sustainable farmers with ESG-focused investors through AI-verified carbon credits on the Hedera Hashgraph. Real impact, radical transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/auth" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:bg-primary-dark transition-transform transform hover:scale-105">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex gap-8 pt-4 justify-center md:justify-start">
                <div>
                  <div className="text-3xl font-bold text-primary">1.2M+</div>
                  <div className="text-sm text-muted-foreground">Credits Listed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">240+</div>
                  <div className="text-sm text-muted-foreground">Verified Farms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">1,500+</div>
                  <div className="text-sm text-muted-foreground">Active Farmers</div>
                </div>
              </div>
            </div>
            <div className="relative mt-12 md:mt-0 rounded-[124px]">
              <img 
                src="https://copper-careful-dragonfly-654.mypinata.cloud/ipfs/bafybeid2h6frz7iwmas4gq4w7dtkaocnvg3degdqnljc33yccf2wvyw7oq"
                alt="Sustainable farming meets blockchain technology" 
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="solution" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-text-secondary">The Challenge</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              The Broken Carbon Market
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional carbon markets exclude smallholder farmers and lack transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 space-y-4 border rounded-xl hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <ShieldIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Lack of Trust</h3>
              <p className="text-muted-foreground">
                "Greenwashing" undermines credibility with unverifiable claims and opaque reporting.
              </p>
            </div>

            <div className="p-8 space-y-4 border rounded-xl hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">High Costs</h3>
              <p className="text-muted-foreground">
                Intermediaries take 40-60% of a credit's value, leaving farmers with minimal compensation.
              </p>
            </div>

            <div className="p-8 space-y-4 border rounded-xl hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <LockIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Barriers to Entry</h3>
              <p className="text-muted-foreground">
                Small farmers face thousands in certification costs, excluding them from the market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
             <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary border border-primary/20">Our Solution</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Hedera-Verified Carbon Trading
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multi-layered verification with AI-powered dMRV and immutable on-chain records.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="p-6 space-y-4 border rounded-xl bg-white hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Client Validation</h3>
              <p className="text-sm text-muted-foreground">
                HTML5 validation ensures data quality at submission.
              </p>
            </div>

            <div className="p-6 space-y-4 border rounded-xl bg-white hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <NetworkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered dMRV</h3>
              <p className="text-sm text-muted-foreground">
                Google Gemini API analyzes plausibility and prevents fraud.
              </p>
            </div>

            <div className="p-6 space-y-4 border rounded-xl bg-white hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">On-Chain Audit</h3>
              <p className="text-sm text-muted-foreground">
                Hedera Consensus Service provides immutable verification records.
              </p>
            </div>

            <div className="p-6 space-y-4 border rounded-xl bg-white hover:border-primary/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ZapIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Instant Settlement</h3>
              <p className="text-sm text-muted-foreground">
                Atomic swaps enable trustless, instant transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-text-secondary">Platform Journey</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              How AgriPulse Works
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Farmers */}
            <div className="p-8 space-y-6 border rounded-xl bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <SproutIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">For Farmers</h3>
              </div>
              
              <div className="space-y-4">
                <Step number={1} title="Register & Connect" description="Create an account and connect your Hedera wallet to get started." />
                <Step number={2} title="Submit for Verification" description="Detail your farm's sustainable practices and let our AI-powered dMRV system verify your impact." />
                <Step number={3} title="List & Get Certified" description="Upon approval, receive a unique Farm NFT and get listed on our transparent marketplace." />
                <Step number={4} title="Earn Instantly" description="Receive 95% of every sale directly to your wallet via secure, instant atomic swaps." />
              </div>
            </div>

            {/* Investors */}
            <div className="p-8 space-y-6 border rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <BarChart3Icon className="h-6 w-6 text-text-primary" />
                </div>
                <h3 className="text-2xl font-bold">For Investors</h3>
              </div>
              
              <div className="space-y-4">
                <Step number={1} title="Join & Define Goals" description="Create your corporate account and set your ESG goals to track your climate impact." isSecondary />
                <Step number={2} title="Browse Verified Farms" description="Explore farms with publicly auditable verification records on the Hedera Consensus Service." isSecondary />
                <Step number={3} title="Purchase with Confidence" description="Buy tokenized carbon credits instantly and securely using Hedera's atomic swaps." isSecondary />
                <Step number={4} title="Retire & Claim Impact" description="Permanently retire credits to offset your carbon footprint and receive unique achievement NFTs." isSecondary />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-text-secondary">Technology Stack</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Built on Hedera Hashgraph
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leveraging enterprise-grade DLT for speed, security, and sustainability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 space-y-4 text-center border rounded-xl bg-white hover:shadow-medium transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <NetworkIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Hedera Token Service</h3>
              <p className="text-muted-foreground">
                Native token creation and atomic swaps without smart contracts.
              </p>
            </div>

            <div className="p-8 space-y-4 text-center border rounded-xl bg-white hover:shadow-medium transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <GlobeIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Consensus Service</h3>
              <p className="text-muted-foreground">
                Immutable audit trail for verification records and transparency.
              </p>
            </div>

            <div className="p-8 space-y-4 text-center border rounded-xl bg-white hover:shadow-medium transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <SproutIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Carbon Neutral</h3>
              <p className="text-muted-foreground">
                Proof-of-stake with minimal energy footprint, perfect for climate solutions.
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="p-8 border-2 border-primary/20 rounded-xl bg-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <AwardIcon className="h-8 w-8 text-text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Google Gemini AI Integration</h3>
                  <p className="text-muted-foreground">
                    AI-powered verification analyzes farm data plausibility and generates unique achievement NFT artwork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-12 text-center space-y-8 shadow-2xl rounded-2xl border bg-gray-50">
            <h2 className="text-4xl md:text-5xl font-bold">
              Join the Carbon Revolution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a farmer looking to monetize sustainable practices or an investor seeking verified impact, AgriPulse connects you to real climate action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="group inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:bg-primary-dark transition-transform transform hover:scale-105">
                Register as Farmer
                <SproutIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/auth" className="group inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-text-primary bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                Invest in Credits
                <TrendingUpIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Step: React.FC<{number: number, title: string, description: string, isSecondary?: boolean}> = ({ number, title, description, isSecondary }) => (
    <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${isSecondary ? 'bg-gray-700 text-white' : 'bg-primary text-primary-foreground'} flex items-center justify-center text-sm font-bold`}>
            {number}
        </div>
        <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </div>
    </div>
);

export default LandingPage;
