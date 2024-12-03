import React, { useState, useEffect } from 'react';

const Policies = ({ settings, onUpdate }) => {
    const defaultPolicies = {
        lateMarkAfter: 15,
        absentMarkAfter: 240,
        minimumWorkHours: 8,
        allowFlexibleTiming: false,
        requireGeolocation: true,
        allowRemoteCheckin: false,
        overtimeSettings: {
            allowOvertime: false,
            maxOvertimeHours: 2,
            overtimeRate: 1.5
        },
        leaveDeduction: {
            deductFromLeave: true,
            halfDayDeduction: true,
            consecutiveAbsences: 3
        },
        holidayWork: {
            allowHolidayWork: false,
            compensatoryOff: true,
            holidayRate: 2.0
        }
    };

    const [formData, setFormData] = useState({...defaultPolicies});

    useEffect(() => {
        if (settings) {
            setFormData({
                ...defaultPolicies,
                ...settings,
                overtimeSettings: {
                    ...defaultPolicies.overtimeSettings,
                    ...(settings.overtimeSettings || {})
                },
                leaveDeduction: {
                    ...defaultPolicies.leaveDeduction,
                    ...(settings.leaveDeduction || {})
                },
                holidayWork: {
                    ...defaultPolicies.holidayWork,
                    ...(settings.holidayWork || {})
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

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Policies */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Policies</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Late Mark After (minutes)</label>
                        <input
                            type="number"
                            value={formData.lateMarkAfter}
                            onChange={(e) => handleChange('lateMarkAfter', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Absent Mark After (minutes)</label>
                        <input
                            type="number"
                            value={formData.absentMarkAfter}
                            onChange={(e) => handleChange('absentMarkAfter', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Work Hours</label>
                        <input
                            type="number"
                            value={formData.minimumWorkHours}
                            onChange={(e) => handleChange('minimumWorkHours', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Attendance Options</h3>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.allowFlexibleTiming}
                            onChange={(e) => handleChange('allowFlexibleTiming', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Allow Flexible Timing</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.requireGeolocation}
                            onChange={(e) => handleChange('requireGeolocation', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Require Geolocation</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.allowRemoteCheckin}
                            onChange={(e) => handleChange('allowRemoteCheckin', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Allow Remote Check-in</span>
                    </label>
                </div>
            </div>

            {/* Overtime Settings */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Overtime Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={formData?.overtimeSettings?.allowOvertime || false}
                                onChange={(e) => handleNestedChange('overtimeSettings', 'allowOvertime', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Allow Overtime</span>
                        </label>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Overtime Hours</label>
                                <input
                                    type="number"
                                    value={formData.overtimeSettings.maxOvertimeHours}
                                    onChange={(e) => handleNestedChange('overtimeSettings', 'maxOvertimeHours', parseFloat(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Overtime Rate</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.overtimeSettings.overtimeRate}
                                    onChange={(e) => handleNestedChange('overtimeSettings', 'overtimeRate', parseFloat(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Deduction Settings */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Leave Deduction</h3>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.leaveDeduction.deductFromLeave}
                            onChange={(e) => handleNestedChange('leaveDeduction', 'deductFromLeave', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Deduct from Leave Balance</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.leaveDeduction.halfDayDeduction}
                            onChange={(e) => handleNestedChange('leaveDeduction', 'halfDayDeduction', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Allow Half Day Deduction</span>
                    </label>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Consecutive Absences Threshold</label>
                        <input
                            type="number"
                            value={formData.leaveDeduction.consecutiveAbsences}
                            onChange={(e) => handleNestedChange('leaveDeduction', 'consecutiveAbsences', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
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

export default Policies; 