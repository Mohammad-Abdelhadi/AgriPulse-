import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppRole, NotificationType } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { LeafIcon } from './icons';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markAllAsRead } = useNotification();

    const baseLinks = [
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/our-process', label: 'Our Process' },
        { path: '/nft-gallery', label: 'NFT Gallery' },
    ];

    const farmerLinks = [{ path: '/farmer', label: 'My Farm' }];
    const investorLinks = [{ path: '/investor', label: 'My Dashboard' }];
    const adminLinks = [{ path: '/admin', label: 'Admin Dashboard' }];
    const serviceProviderLinks = [{ path: '/service-provider', label: 'My Services' }];

    let links = [...baseLinks];
    if (user?.role === AppRole.FARMER) links.push(...farmerLinks);
    if (user?.role === AppRole.INVESTOR) links.push(...investorLinks);
    if (user?.role === AppRole.ADMIN) links.push(...adminLinks);
    if (user?.role === AppRole.SERVICE_PROVIDER) links.push(...serviceProviderLinks);

    const activeLinkClass = "text-primary font-bold";
    const inactiveLinkClass = "text-text-primary hover:text-primary transition-colors";

    const handleNotificationsToggle = () => {
        setNotificationsOpen(prev => !prev);
        if (!notificationsOpen) {
            markAllAsRead();
        }
    };
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const ICONS: Record<NotificationType, React.ReactNode> = {
        success: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
        error: <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
        info: <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>,
    };

    return (
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <LeafIcon className="w-7 h-7 text-primary" />
                    <span className="text-2xl font-bold text-text-primary">AgriPulse</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    {links.map(({ path, label }) => (
                        <NavLink key={path} to={path} className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    <div className="relative" ref={notificationsRef}>
                        <button onClick={handleNotificationsToggle} className="relative p-2 text-text-secondary hover:text-primary transition-colors">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                             {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span></span>}
                        </button>
                        {notificationsOpen && (
                             <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border origin-top-right animate-fade-in">
                                <div className="p-3 border-b font-semibold text-text-primary">Notifications</div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                         <div key={n.id} className={`p-3 border-b flex items-start space-x-3 transition-colors ${!n.read ? 'bg-blue-50' : 'bg-white'}`}>
                                            <div className="flex-shrink-0 mt-0.5">{ICONS[n.type]}</div>
                                            <div>
                                                 <p className="text-sm text-text-primary">{n.message}</p>
                                                 {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">View on HashScan</a>}
                                                 <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                            </div>
                                         </div>
                                    )) : <p className="text-sm text-center text-text-secondary p-8">No notifications yet.</p>}
                                </div>
                             </div>
                        )}
                    </div>
                    
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setProfileOpen(prev => !prev)} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-lg hover:bg-secondary-dark transition-colors">
                            {user?.email.charAt(0).toUpperCase()}
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border origin-top-right animate-fade-in">
                                <div className="py-1">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-semibold text-text-primary">Signed in as</p>
                                        <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100" onClick={() => setProfileOpen(false)}>My Profile</Link>
                                    <Link to="/wallet" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100" onClick={() => setProfileOpen(false)}>Wallet Settings</Link>
                                    <Link to="/transaction-history" className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-100" onClick={() => setProfileOpen(false)}>History</Link>
                                    <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t">Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden bg-white py-4 px-4 animate-fade-in">
                    <nav className="flex flex-col space-y-4">
                        {links.map(({ path, label }) => (
                            <NavLink key={path} to={path} className={({ isActive }) => `text-lg ${isActive ? activeLinkClass : inactiveLinkClass}`} onClick={() => setMobileMenuOpen(false)}>
                                {label}
                            </NavLink>
                        ))}
                         <div className="border-t pt-4 space-y-2">
                             <Link to="/profile" className="block text-lg" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                             <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left text-lg text-red-600">Logout</button>
                         </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;