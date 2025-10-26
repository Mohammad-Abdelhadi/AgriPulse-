
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-text-secondary">
                <p>&copy; {new Date().getFullYear()} AgriPulse. All rights reserved.</p>
                <p className="text-sm mt-1">Empowering a sustainable future, one carbon credit at a time.</p>
            </div>
        </footer>
    );
};

export default Footer;
