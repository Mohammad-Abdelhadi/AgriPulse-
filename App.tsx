import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import NftGallery from './pages/NftGallery';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppRole } from './types';
import { FarmProvider } from './contexts/FarmContext';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WalletPage from './pages/WalletPage';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ToastContainer';
import TransactionHistory from './pages/TransactionHistory';
import ServiceProviderDashboard from './pages/ServiceProviderDashboard';
import LandingPage from './pages/LandingPage';
import OurProcessPage from './pages/OurProcessPage';
import AppLayout from './components/AppLayout';
import ProfilePage from './pages/ProfilePage';
import AdminProcessPage from './pages/AdminProcessPage';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FarmProvider>
          <HashRouter>
            <AppRoutes />
            <ToastContainer />
          </HashRouter>
        </FarmProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();
  
    if (loading) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
  
    return (
      <Routes>
        <Route element={<AppLayout />}>
            {/* Publicly accessible routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/our-process" element={<OurProcessPage />} />
            <Route path="/admin-process" element={<AdminProcessPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/marketplace" />} />

            {/* Protected Routes */}
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" />} />
            <Route path="/nft-gallery" element={user ? <NftGallery /> : <Navigate to="/auth" />} />
            <Route path="/wallet" element={user ? <WalletPage /> : <Navigate to="/auth" />} />
            <Route path="/transaction-history" element={user ? <TransactionHistory /> : <Navigate to="/auth" />} />

            {/* Role-specific routes */}
            <Route path="/farmer" element={user?.role === AppRole.FARMER ? <FarmerDashboard /> : <Navigate to={user ? "/marketplace" : "/auth"} />} />
            <Route path="/investor" element={user?.role === AppRole.INVESTOR ? <InvestorDashboard /> : <Navigate to={user ? "/marketplace" : "/auth"} />} />
            <Route path="/admin" element={user?.role === AppRole.ADMIN ? <AdminDashboard /> : <Navigate to={user ? "/marketplace" : "/auth"} />} />
            <Route path="/service-provider" element={user?.role === AppRole.SERVICE_PROVIDER ? <ServiceProviderDashboard /> : <Navigate to={user ? "/marketplace" : "/auth"} />} />

            {/* Default and wildcard routes */}
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    );
  };
  
const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
);
  
export default App;