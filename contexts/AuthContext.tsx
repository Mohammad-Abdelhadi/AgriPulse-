import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppRole } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => void;
    signup: (email: string, pass: string, role: AppRole) => void;
    logout: () => void;
    updateUserWallet: (hederaAccountId: string, hederaPrivateKey: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setupInitialUsers = () => {
    const existingUsers = localStorage.getItem('agripulse_users');
    if (!existingUsers) {
        const initialUsers = {
            'admin@admin.com': {
                id: 'user_admin',
                email: 'admin@admin.com',
                role: AppRole.ADMIN,
                hederaAccountId: '0.0.6928173',
                hederaPrivateKey: '302e020100300506032b657004220420e1ee943a8de34d62da506b0512e6641eaed1850670577341f7cfc9c1f73245ce'
            },
            'inv@inv.com': {
                id: 'user_investor',
                email: 'inv@inv.com',
                role: AppRole.INVESTOR,
                hederaAccountId: '0.0.7085970',
                hederaPrivateKey: '302e020100300506032b6570042204206c23a08e9dc11cbb48eacd1a9071883f601a0ccc18845956ad67f4e3a95c7742'
            },
            'farmer@farm.com': {
                id: 'user_farmer',
                email: 'farmer@farm.com',
                role: AppRole.FARMER,
                hederaAccountId: '0.0.7099230',
                hederaPrivateKey: '302e020100300506032b657004220420c3d3e5dd8a0b57aaa5e50db9e243d031d8426a014bf691c8e514178f81298613'
            }
        };
        localStorage.setItem('agripulse_users', JSON.stringify(initialUsers));
        console.log("Initial users have been seeded into local storage. Password for all is 'password'.");
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        try {
            setupInitialUsers(); // Seed users if they don't exist
            const storedUser = localStorage.getItem('agripulse_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('agripulse_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (email: string, pass: string) => {
        setLoading(true);
        // Note: Password is not being checked for this demo app
        const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        if (storedUsers[email]) {
            const loggedInUser = storedUsers[email];
            setUser(loggedInUser);
            localStorage.setItem('agripulse_user', JSON.stringify(loggedInUser));
            showToast(`Welcome back, ${email}!`, 'success');
        } else {
            showToast('User not found. Please sign up.', 'error');
        }
        setLoading(false);
    };

    const signup = (email: string, pass: string, role: AppRole) => {
        setLoading(true);
        const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        if (storedUsers[email]) {
            showToast('User with this email already exists.', 'error');
            setLoading(false);
            return;
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            email,
            role,
        };
        
        storedUsers[email] = newUser;
        localStorage.setItem('agripulse_users', JSON.stringify(storedUsers));
        localStorage.setItem('agripulse_user', JSON.stringify(newUser));
        setUser(newUser);
        showToast('Account created successfully!', 'success');
        setLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('agripulse_user');
        showToast("You've been logged out.", 'info');
    };

    const updateUserWallet = (hederaAccountId: string, hederaPrivateKey: string) => {
        if (!user) return;
        
        const updatedUser = { ...user, hederaAccountId, hederaPrivateKey };
        setUser(updatedUser);
        localStorage.setItem('agripulse_user', JSON.stringify(updatedUser));
        
        const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        storedUsers[user.email] = updatedUser;
        localStorage.setItem('agripulse_users', JSON.stringify(storedUsers));
        
        showToast('Wallet information saved successfully!', 'success');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserWallet }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};