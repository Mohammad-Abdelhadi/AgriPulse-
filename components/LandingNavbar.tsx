import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LeafIcon } from './icons';

const LandingNavbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/our-process', label: 'Our Process' },
    ];
    
    const activeLinkClass = "text-primary font-semibold";
    const inactiveLinkClass = "text-text-secondary hover:text-primary transition-colors";

    return (
        <header className="bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/landing" className="flex items-center space-x-2">
                    <LeafIcon className="w-7 h-7 text-primary" />
                    <span className="text-2xl font-bold text-text-primary">AgriPulse</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
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
                    <Link to="/auth" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                        Login / Sign Up
                    </Link>
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
                            <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-center w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                                Login / Sign Up
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default LandingNavbar;
