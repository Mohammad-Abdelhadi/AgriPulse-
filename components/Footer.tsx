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
            <div className="py-10">

                <div className=" text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AgriPulse. Built on Hedera Hashgraph. Powered by Google Gemini AI.</p>
                </div>
            </div>
    );
};

export default Footer;
