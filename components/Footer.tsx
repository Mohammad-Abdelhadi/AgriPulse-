import React from 'react';
import { LeafIcon } from './icons';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {

    const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (window.location.hash.includes('landing') || window.location.pathname === '/') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
        // Otherwise, it will navigate via react-router-dom Link and then scroll, which requires more complex logic.
        // For now, this works for the landing page.
    };
    
    return (
        <footer className="border-t border-gray-200 py-12 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <LeafIcon className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">AgriPulse</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Transparent carbon credits on Hedera Hashgraph.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                            <li><a href="#how-it-works" onClick={(e) => handleScrollLink(e, '#how-it-works')} className="hover:text-primary transition-colors">For Farmers</a></li>
                            <li><a href="#how-it-works" onClick={(e) => handleScrollLink(e, '#how-it-works')} className="hover:text-primary transition-colors">For Investors</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                             <li><Link to="/our-process" className="hover:text-primary transition-colors">Our Process</Link></li>
                             <li><a href="#technology" onClick={(e) => handleScrollLink(e, '#technology')} className="hover:text-primary transition-colors">Technology</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#solution" onClick={(e) => handleScrollLink(e, '#solution')} className="hover:text-primary transition-colors">About</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AgriPulse. Built on Hedera Hashgraph. Powered by Google Gemini AI.</p>
                </div>
            </div>
      </footer>
    );
};

export default Footer;
