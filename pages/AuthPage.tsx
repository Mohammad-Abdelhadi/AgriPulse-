import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppRole } from '../types';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

type AuthView = 'role_select' | 'signup_form' | 'login_form';

const AuthPage: React.FC = () => {
    const [view, setView] = useState<AuthView>('role_select');
    const [selectedRole, setSelectedRole] = useState<AppRole>(AppRole.INVESTOR);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, signup, loading } = useAuth();
    const { addNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (view === 'login_form') {
                const message = await login(email, password);
                addNotification(message, 'success');
            } else if (view === 'signup_form') {
                const message = await signup(email, password, selectedRole);
                addNotification(message, 'success');
            }
        } catch (error: any) {
            addNotification(error.message, 'error');
        }
    };

    const getRoleName = (role: AppRole) => {
        return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderRoleSelection = () => (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Join AgriPulse</h1>
            <p className="text-text-secondary mt-2 mb-8">Choose your role to get started</p>

            <div className="space-y-4">
                <RoleButton 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H17v5m-5 0h-2"></path></svg>}
                    title="I'm a Company"
                    subtitle="Invest in sustainable farms"
                    onClick={() => setSelectedRole(AppRole.INVESTOR)}
                    isSelected={selectedRole === AppRole.INVESTOR}
                />
                 <RoleButton 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                    title="I'm a Farmer"
                    subtitle="Register your farm for CO₂ credits"
                    onClick={() => setSelectedRole(AppRole.FARMER)}
                    isSelected={selectedRole === AppRole.FARMER}
                />
                 <RoleButton 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                    title="I'm a Service Provider"
                    subtitle="Coming Soon"
                    onClick={() => {}}
                    disabled={true}
                />
            </div>

            <button
                onClick={() => setView('signup_form')}
                className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
            >
                Continue
            </button>

            <p className="mt-6 text-sm text-text-secondary">
                Already have an account?{' '}
                <button onClick={() => setView('login_form')} className="font-semibold text-primary hover:underline">
                    Sign in
                </button>
            </p>
        </div>
    );
    
    const renderForm = () => {
        const isLogin = view === 'login_form';
        return (
            <div>
                 <Link to="/landing" className="flex items-center text-sm font-semibold text-primary hover:underline mb-6">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back to Home
                </Link>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">{isLogin ? 'Welcome Back' : `Join as a ${getRoleName(selectedRole)}`}</h1>
                    <p className="text-text-secondary mt-2">{isLogin ? 'Login to your account' : 'Create an account to get started'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105 disabled:bg-gray-400">
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-secondary">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => setView(isLogin ? 'role_select' : 'login_form')} className="font-semibold text-primary hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Sign in'}
                    </button>
                </p>
            </div>
        );
    };

    const renderContent = () => {
        switch(view) {
            case 'login_form': return renderForm();
            case 'signup_form': return renderForm();
            case 'role_select':
            default:
                return renderRoleSelection();
        }
    }

    return (
        <div className="flex items-center justify-center min-h-full animate-fade-in py-12">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg transition-all duration-500">
                {renderContent()}
            </div>
        </div>
    );
};

const RoleButton: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, isSelected?: boolean, disabled?: boolean }> = ({ icon, title, subtitle, onClick, isSelected = false, disabled = false }) => {
    const baseClasses = "w-full p-4 rounded-lg border-2 text-left transition-all duration-300 flex items-center space-x-4";
    const selectedClasses = "bg-primary text-white border-primary-dark shadow-lg cursor-pointer";
    const unselectedClasses = "bg-white text-text-primary border-gray-200 hover:border-primary hover:shadow-md cursor-pointer";
    const disabledClasses = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed grayscale";
    
    const handleClick = () => {
        if (disabled) return;
        onClick();
    };

    return (
        <div onClick={handleClick} className={`${baseClasses} ${disabled ? disabledClasses : isSelected ? selectedClasses : unselectedClasses}`}>
            <div className={`flex-shrink-0 p-2 rounded-full ${disabled ? 'bg-gray-200' : isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className={`text-sm ${disabled ? 'text-gray-400' : isSelected ? 'text-white/80' : 'text-text-secondary'}`}>{subtitle}</p>
            </div>
        </div>
    );
};

export default AuthPage;