import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppRole } from '../types';

const AuthPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<AppRole>(AppRole.INVESTOR);
    const [isLogin, setIsLogin] = useState(true);
    const { login, signup } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            login(email, password);
        } else {
            signup(email, password, role);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full animate-fade-in">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">{isLogin ? 'Welcome Back!' : 'Join AgriPulse'}</h1>
                    <p className="text-text-secondary mt-2">{isLogin ? 'Login to your account' : 'Create an account to get started'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary">I am a...</label>
                            <div className="mt-2 grid grid-cols-3 rounded-md shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setRole(AppRole.INVESTOR)}
                                    className={`py-2 px-4 rounded-l-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${role === AppRole.INVESTOR ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                                >
                                    Investor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole(AppRole.FARMER)}
                                    className={`-ml-px py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${role === AppRole.FARMER ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                                >
                                    Farmer
                                </button>
                                 <button
                                    type="button"
                                    onClick={() => setRole(AppRole.SERVICE_PROVIDER)}
                                    className={`-ml-px py-2 px-4 rounded-r-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${role === AppRole.SERVICE_PROVIDER ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                                >
                                    Service Provider
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;