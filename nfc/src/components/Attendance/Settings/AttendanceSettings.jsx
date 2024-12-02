import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import WorkingHours from './WorkingHours';
import Policies from './Policies';
import Notifications from './Notifications';
import Shifts from './Shifts';
import SpecialDays from './SpecialDays';

const AttendanceSettings = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [activeTab, setActiveTab] = useState('workingHours');

    // Fetch organizations first
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/organizations');
                if (!response.ok) {
                    throw new Error('Failed to fetch organizations');
                }
                const data = await response.json();
                setOrganizations(data);
                
                // Set the first organization as default if available
                if (data.length > 0) {
                    setSelectedOrgId(data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching organizations:', error);
                setError('Failed to load organizations. Please try again.');
            }
        };

        fetchOrganizations();
    }, []);

    // Fetch settings when organization is selected
    useEffect(() => {
        const fetchSettings = async () => {
            if (!selectedOrgId) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/attendance/settings/${selectedOrgId}`);
                setSettings(response.data);
            } catch (err) {
                console.error('Error fetching settings:', err);
                setError('Failed to load settings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [selectedOrgId]);

    const handleSave = async (updatedSettings) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('/api/attendance/settings', {
                ...updatedSettings,
                organizationId: '123' // Replace with actual organization ID
            });
            setSettings(response.data);
            // Optional: Show success message
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">Attendance Settings</h2>

                {/* Organization Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={selectedOrgId || ''}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                    >
                        <option value="">Select Organization</option>
                        {organizations.map((org) => (
                            <option key={org._id} value={org._id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading settings...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && settings && (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b mb-6">
                            {['workingHours', 'policies', 'notifications', 'shifts', 'specialDays'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 ${
                                        activeTab === tab
                                            ? 'border-b-2 border-blue-500 text-blue-500'
                                            : 'text-gray-500'
                                    }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="mt-6">
                            {activeTab === 'workingHours' && (
                                <WorkingHours
                                    settings={settings?.workingHours}
                                    onUpdate={(data) => handleSave('workingHours', data)}
                                />
                            )}
                            {activeTab === 'policies' && (
                                <Policies
                                    settings={settings?.policies}
                                    onUpdate={(data) => handleSave('policies', data)}
                                />
                            )}
                            {activeTab === 'notifications' && (
                                <Notifications
                                    settings={settings?.notifications}
                                    onUpdate={(data) => handleSave('notifications', data)}
                                />
                            )}
                            {activeTab === 'shifts' && (
                                <Shifts
                                    settings={settings?.shifts}
                                    organizationId={settings?.organizationId}
                                    onUpdate={handleSave}
                                />
                            )}
                            {activeTab === 'specialDays' && (
                                <SpecialDays
                                    settings={settings?.specialDays}
                                    organizationId={settings?.organizationId}
                                    onUpdate={handleSave}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceSettings; 