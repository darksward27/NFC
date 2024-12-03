import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

const Notifications = ({ settings, onUpdate }) => {
    const defaultNotifications = {
        sendEmailAlerts: true,
        sendSMSAlerts: false,
        alertSupervisor: true,
        dailyReport: true,
        weeklyReport: true,
        alertSettings: {
            lateArrival: true,
            earlyDeparture: true,
            absence: true,
            overtime: true,
            consecutiveAbsences: true
        },
        reportRecipients: []
    };

    const [formData, setFormData] = useState({...defaultNotifications});

    useEffect(() => {
        if (settings) {
            setFormData({
                ...defaultNotifications,
                ...settings,
                alertSettings: {
                    ...defaultNotifications.alertSettings,
                    ...(settings.alertSettings || {})
                }
            });
        }
    }, [settings]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAlertSettingChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            alertSettings: {
                ...prev.alertSettings,
                [field]: value
            }
        }));
    };

    const addRecipient = () => {
        setFormData(prev => ({
            ...prev,
            reportRecipients: [
                ...prev.reportRecipients,
                { email: '', reportTypes: [], role: 'supervisor' }
            ]
        }));
    };

    const removeRecipient = (index) => {
        setFormData(prev => ({
            ...prev,
            reportRecipients: prev.reportRecipients.filter((_, i) => i !== index)
        }));
    };

    const updateRecipient = (index, field, value) => {
        const updatedRecipients = [...formData.reportRecipients];
        updatedRecipients[index] = {
            ...updatedRecipients[index],
            [field]: value
        };
        handleChange('reportRecipients', updatedRecipients);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Notification Settings */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">General Settings</h3>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.sendEmailAlerts}
                            onChange={(e) => handleChange('sendEmailAlerts', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Send Email Alerts</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.sendSMSAlerts}
                            onChange={(e) => handleChange('sendSMSAlerts', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Send SMS Alerts</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.alertSupervisor}
                            onChange={(e) => handleChange('alertSupervisor', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Alert Supervisor</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Report Generation</h3>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.dailyReport}
                            onChange={(e) => handleChange('dailyReport', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Generate Daily Reports</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.weeklyReport}
                            onChange={(e) => handleChange('weeklyReport', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Generate Weekly Reports</span>
                    </label>
                </div>
            </div>

            {/* Alert Settings */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Alert Triggers</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formData.alertSettings).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleAlertSettingChange(key, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Report Recipients */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Report Recipients</h3>
                    <button
                        type="button"
                        onClick={addRecipient}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Add Recipient
                    </button>
                </div>
                <div className="space-y-4">
                    {formData.reportRecipients.map((recipient, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
                            <input
                                type="email"
                                placeholder="Email"
                                value={recipient.email}
                                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <select
                                value={recipient.role}
                                onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="supervisor">Supervisor</option>
                                <option value="hr">HR</option>
                                <option value="management">Management</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeRecipient(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default Notifications; 