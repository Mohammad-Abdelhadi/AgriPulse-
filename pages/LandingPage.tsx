import React from 'react';
import { Link } from "react-router-dom";
import { 
  LeafIcon, 
  TrendingUpIcon, 
  ShieldIcon, 
  GlobeIcon, 
  ArrowRightIcon,
  ZapIcon
} from "../components/icons";

const heroImage = "https://images.pexels.com/photos/158826/field-corn-air-frisch-158826.jpeg";

const LandingPage = () => {
  const features = [
    {
      icon: ShieldIcon,
      title: "Auditable Verification",
      description: "Every verification step is recorded on the Hedera Consensus Service (HCS) for an immutable audit trail."
    },
    {
      icon: GlobeIcon,
      title: "Blockchain Transparency",
      description: "All transactions and verifications are recorded on the Hedera DLT for complete traceability."
    },
    {
      icon: TrendingUpIcon,
      title: "Real Impact",
      description: "Create a direct connection between sustainable farmers and global investors."
    },
    {
      icon: ZapIcon,
      title: "Instant Settlement",
      description: "Hedera's atomic swaps automate payments and credit transfers instantly."
    }
  ];

  const stats = [
    { label: "Total Credits Listed", value: "1.2M tons" },
    { label: "Verified Farms", value: "240+" },
    { label: "Active Farmers", value: "1,500+" },
    { label: "Investors", value: "300+" }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* LandingNavbar component is removed to fix the duplicate header issue */}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-black opacity-80" />
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
              <LeafIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Hedera</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              A Decentralized Carbon Credit Marketplace
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Connect sustainable farmers with global investors. 
              Trade verified, tokenized carbon credits with complete transparency on the blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <button className="w-full sm:w-auto text-lg h-14 px-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link to="/marketplace">
                 <button className="w-full sm:w-auto text-lg h-14 px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors">
                  Explore Credits
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose AgriPulse?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on cutting-edge technology with a focus on trust, transparency, and real environmental impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 border-border/50 rounded-lg bg-white">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 shadow-soft text-center bg-white rounded-lg">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Farmers Register</h3>
              <p className="text-muted-foreground">
                Sustainable farms register their projects and carbon-sequestering activities.
              </p>
            </div>

            <div className="p-8 shadow-soft text-center bg-white rounded-lg">
              <div className="w-16 h-16 bg-text-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">On-Chain Verification (dMRV)</h3>
              <p className="text-muted-foreground">
                Our platform verifies the project's data and records the proof on the Hedera DLT.
              </p>
            </div>

            <div className="p-8 shadow-soft text-center bg-white rounded-lg">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Trade Credits</h3>
              <p className="text-muted-foreground">
                Investors purchase verified credits instantly, funding real environmental projects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
