import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
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
import ProfilePage from './pages/ProfilePage';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import TransactionHistory from './pages/TransactionHistory';
import QrCodeModal from './components/QrCodeModal';
import ServiceProviderDashboard from './pages/ServiceProviderDashboard';
import ContractBuilderPage from './pages/ContractBuilderPage';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <FarmProvider>
          <HashRouter>
            <div className="flex flex-col min-h-screen bg-secondary text-text-primary font-sans">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                <AppRoutes />
              </main>
              <Footer />
              <ToastContainer />
            </div>
          </HashRouter>
        </FarmProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();
  
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
  
    return (
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/marketplace" : "/auth"} />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/marketplace" />} />
        
        {/* Protected Routes */}
        <Route path="/marketplace" element={user ? <Marketplace /> : <Navigate to="/auth" />} />
        <Route path="/nft-gallery" element={user ? <NftGallery /> : <Navigate to="/auth" />} />
        <Route path="/wallet" element={user ? <WalletPage /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" />} />
        <Route path="/transaction-history" element={user ? <TransactionHistory /> : <Navigate to="/auth" />} />

        {/* Role-specific routes */}
        <Route path="/farmer" element={user?.role === AppRole.FARMER ? <FarmerDashboard /> : <Navigate to="/marketplace" />} />
        <Route path="/investor" element={user?.role === AppRole.INVESTOR ? <InvestorDashboard /> : <Navigate to="/marketplace" />} />
        <Route path="/admin" element={user?.role === AppRole.ADMIN ? <AdminDashboard /> : <Navigate to="/marketplace" />} />
        <Route path="/service-provider" element={user?.role === AppRole.SERVICE_PROVIDER ? <ServiceProviderDashboard /> : <Navigate to="/marketplace" />} />
        <Route path="/contract-builder" element={user?.role === AppRole.ADMIN ? <ContractBuilderPage /> : <Navigate to="/marketplace" />} />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  };
  
const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
);
  
export default App;
