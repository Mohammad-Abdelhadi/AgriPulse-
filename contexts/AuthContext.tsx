import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppRole, CompanyProfile } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<string>;
    signup: (email: string, pass: string, role: AppRole, companyProfile?: CompanyProfile) => Promise<string>;
    logout: () => Promise<string>;
    updateUserWallet: (hederaAccountId: string, hederaPrivateKey: string) => Promise<string>;
    updateCompanyProfile: (profile: CompanyProfile) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setupInitialUsers = () => {
    const existingUsers = localStorage.getItem('agripulse_users');
    if (!existingUsers) {
        const initialUsers = {
            'admin@admin.com': {
                id: 'user_admin',
                email: 'admin@admin.com',
                password: 'password',
                role: AppRole.ADMIN,
                hederaAccountId: '0.0.6928173',
                hederaPrivateKey: '302e020100300506032b657004220420e1ee943a8de34d62da506b0512e6641eaed1850670577341f7cfc9c1f73245ce'
            },
            'inv@inv.com': {
                id: 'user_investor',
                email: 'inv@inv.com',
                password: 'password',
                role: AppRole.INVESTOR,
                hederaAccountId: '0.0.7085970',
                hederaPrivateKey: '302e020100300506032b6570042204206c23a08e9dc11cbb48eacd1a9071883f601a0ccc18845956ad67f4e3a95c7742',
                companyProfile: {
                    name: 'GreenShift Ventures',
                    location: 'Dubai, UAE',
                    industry: 'Impact Investment & ESG',
                    annualCarbonFootprint: 7500
                }
            },
            'farmer@farm.com': {
                id: 'user_farmer',
                email: 'farmer@farm.com',
                password: 'password',
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

    const login = async (email: string, pass: string): Promise<string> => {
        setLoading(true);
        try {
            const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
            const userFromStorage = storedUsers[email];

            if (userFromStorage && userFromStorage.password === pass) {
                const { password, ...userWithoutPassword } = userFromStorage;
                const loggedInUser = userWithoutPassword as User;
                setUser(loggedInUser);
                localStorage.setItem('agripulse_user', JSON.stringify(loggedInUser));
                return `Welcome back, ${email}!`;
            } else if (userFromStorage) {
                throw new Error('Incorrect password. Please try again.');
            } else {
                throw new Error('User not found. Please sign up.');
            }
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, pass: string, role: AppRole, companyProfile?: CompanyProfile): Promise<string> => {
        setLoading(true);
        try {
            const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
            if (storedUsers[email]) {
                throw new Error('User with this email already exists.');
            }

            const newUser: User = {
                id: `user_${Date.now()}`,
                email,
                role,
                ...(role === AppRole.INVESTOR && companyProfile && { companyProfile }),
            };

            const userWithPassword = {
                ...newUser,
                password: pass,
            };
            
            storedUsers[email] = userWithPassword;
            localStorage.setItem('agripulse_users', JSON.stringify(storedUsers));
            localStorage.setItem('agripulse_user', JSON.stringify(newUser));
            setUser(newUser);
            return 'Account created successfully!';
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<string> => {
        setUser(null);
        localStorage.removeItem('agripulse_user');
        return "You've been logged out.";
    };
    
    const updateUserWallet = async (hederaAccountId: string, hederaPrivateKey: string): Promise<string> => {
        if (!user) throw new Error("User not authenticated.");
        
        const updatedUser = { ...user, hederaAccountId, hederaPrivateKey };
        setUser(updatedUser);
        localStorage.setItem('agripulse_user', JSON.stringify(updatedUser));
        
        const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        storedUsers[user.email] = { ...storedUsers[user.email], ...updatedUser };
        localStorage.setItem('agripulse_users', JSON.stringify(storedUsers));
        
        return 'Wallet information saved successfully!';
    };

    const updateCompanyProfile = async (profile: CompanyProfile): Promise<string> => {
        if (!user || user.role !== AppRole.INVESTOR) {
            throw new Error("User is not an investor.");
        }

        const updatedUser = { ...user, companyProfile: profile };
        setUser(updatedUser);
        localStorage.setItem('agripulse_user', JSON.stringify(updatedUser));
        
        const storedUsers = JSON.parse(localStorage.getItem('agripulse_users') || '{}');
        storedUsers[user.email] = { ...storedUsers[user.email], ...updatedUser };
        localStorage.setItem('agripulse_users', JSON.stringify(storedUsers));
        
        return 'Company profile updated successfully!';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserWallet, updateCompanyProfile }}>
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