import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import LandingNavbar from './LandingNavbar';
import Footer from './Footer';

const AppLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Pages that should not have the main container applied, as they manage their own layout.
    const fullWidthPages = ['/landing', '/our-process', '/auth'];
    const isFullWidthPage = fullWidthPages.includes(location.pathname);

    // Apply container and padding to pages that need it, otherwise let the page component handle its own layout.
    const mainClassName = `flex-grow ${isFullWidthPage ? '' : 'container mx-auto px-4 py-8'}`;

    return (
        <div className="flex flex-col min-h-screen bg-surface text-text-primary font-sans">
            {user ? <Header /> : <LandingNavbar />}
            <main className={mainClassName}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppLayout;