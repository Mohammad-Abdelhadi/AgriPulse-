

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppRole } from '../types';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const baseLinks = [
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/nft-gallery', label: 'NFT Gallery' },
    ];

    const userLinks = user ? [
        { path: '/profile', label: 'Profile' },
        { path: '/wallet', label: 'Wallet' },
        { path: '/transaction-history', label: 'History' },
    ] : [];

    const farmerLinks = [
        { path: '/farmer', label: 'My Farm' },
    ];

    const investorLinks = [
        { path: '/investor', label: 'My Investments' }
    ];
    
    const adminLinks = [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/contract-builder', label: 'Contract Details' }
    ];

    const serviceProviderLinks = [
        { path: '/service-provider', label: 'My Services' }
    ];

    let links = [...baseLinks];
    if (user) {
        links = [...links, ...userLinks];
        if (user.role === AppRole.FARMER) {
            links = [...links, ...farmerLinks];
        }
        if (user.role === AppRole.INVESTOR) {
            links = [...links, ...investorLinks];
        }
        if (user.role === AppRole.ADMIN) {
            links = [...links, ...adminLinks];
        }
        if (user.role === AppRole.SERVICE_PROVIDER) {
            links = [...links, ...serviceProviderLinks];
        }
    }
    
    const activeLinkClass = "text-primary font-bold";
    const inactiveLinkClass = "text-text-primary hover:text-primary transition-colors";

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span className="text-2xl font-extrabold text-primary">AgriPulse</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    {links.map(({ path, label }) => (
                        <NavLink 
                            key={path} 
                            to={path} 
                            className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-text-secondary text-sm">Welcome, {user.email}</span>
                            <button onClick={logout} className="bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors font-semibold">Logout</button>
                        </>
                    ) : (
                        <Link to="/auth" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">Login / Sign Up</Link>
                    )}
                </div>

                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden bg-white py-4 px-4 animate-fade-in">
                    <nav className="flex flex-col space-y-4">
                        {links.map(({ path, label }) => (
                            <NavLink 
                                key={path} 
                                to={path} 
                                className={({ isActive }) => `text-lg ${isActive ? activeLinkClass : inactiveLinkClass}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </NavLink>
                        ))}
                         <div className="border-t pt-4">
                            {user ? (
                                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors font-semibold">Logout</button>
                            ) : (
                                <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-center w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">Login / Sign Up</Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;