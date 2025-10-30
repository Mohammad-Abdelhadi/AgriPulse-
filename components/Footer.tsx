
import React from 'react';
import { LeafIcon } from './icons';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <LeafIcon className="w-6 h-6 text-primary" />
                    <span className="font-bold text-text-primary">AgriPulse</span>
                </div>
                <div className="text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AgriPulse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;