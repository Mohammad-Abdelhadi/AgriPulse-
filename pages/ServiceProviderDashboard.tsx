import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { Service, ServiceCategory } from '../types';

const ServiceProviderDashboard: React.FC = () => {
    const { user } = useAuth();
    // FIX: Destructure loading from useFarm to disable submit button during processing
    const { services, addService, loading } = useFarm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.EQUIPMENT);
    const [price, setPrice] = useState(0);
    const [priceUnit, setPriceUnit] = useState<'per hour' | 'per day' | 'per item'>('per day');
    
    const myServices = useMemo(() => {
        if (!user) return [];
        return services.filter(s => s.providerId === user.id)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [services, user]);
    
    const resetForm = () => {
        setName('');
        setDescription('');
        setCategory(ServiceCategory.EQUIPMENT);
        setPrice(0);
        setPriceUnit('per day');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addService({
            name, description, category, price, priceUnit
        });
        if (success) {
            resetForm();
            setIsModalOpen(false);
        }
    };
    
    const inputStyle = "w-full px-3 py-2 bg-white text-text-primary border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary";

    const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-primary">{service.name}</h3>
                    <span className="text-xs font-semibold bg-primary-light bg-opacity-20 text-primary px-2 py-1 rounded-full">{service.category}</span>
                </div>
                <p className="text-text-secondary mt-2 text-sm flex-grow min-h-[40px]">{service.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t">
                <p className="text-2xl font-bold text-text-primary text-right">${service.price.toFixed(2)} <span className="text-sm font-normal text-text-secondary">/{service.priceUnit.split(' ')[1]}</span></p>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Service Provider Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your services, equipment, and livestock listings for the AgriPulse community.</p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-text-primary">My Listings</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-md"
                >
                    + List New Service
                </button>
            </div>

            {myServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myServices.map(service => <ServiceCard key={service.id} service={service} />)}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-xl shadow-lg text-center border-2 border-dashed">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-text-primary">No services listed yet</h2>
                    <p className="text-text-secondary mt-2">Click "List New Service" to add your first offering to the platform.</p>
                </div>
            )}
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">List a New Service</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Service Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className={`mt-1 ${inputStyle}`} placeholder="e.g., Tractor Plowing (Per Day)" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className={`mt-1 ${inputStyle}`} placeholder="Describe the service you offer, including any specific details or equipment models..."></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value as ServiceCategory)} className={`mt-1 ${inputStyle}`}>
                                        {Object.values(ServiceCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary">Price ($)</label>
                                    <input type="number" value={price} min="0" step="0.01" onChange={e => setPrice(parseFloat(e.target.value) || 0)} required className={`mt-1 ${inputStyle}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary">Unit</label>
                                    <select value={priceUnit} onChange={e => setPriceUnit(e.target.value as any)} className={`mt-1 ${inputStyle}`}>
                                        <option value="per hour">per hour</option>
                                        <option value="per day">per day</option>
                                        <option value="per item">per item</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-text-secondary hover:bg-gray-300 transition-colors">Cancel</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-wait">
                                    {loading ? 'Submitting...' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceProviderDashboard;
