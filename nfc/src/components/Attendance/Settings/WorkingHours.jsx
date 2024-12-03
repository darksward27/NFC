import React, { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const WorkingHours = ({ settings, onUpdate }) => {
    const defaultWorkingHours = {
        startTime: '09:00',
        endTime: '17:00',
        graceTime: 15,
        halfDayThreshold: 240,
        workingDays: {
            sunday: false,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false
        },
        breaks: []
    };

    const [formData, setFormData] = useState({...defaultWorkingHours});

    useEffect(() => {
        if (settings) {
            setFormData({
                ...defaultWorkingHours,
                ...settings,
                workingDays: {
                    ...defaultWorkingHours.workingDays,
                    ...(settings.workingDays || {})
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

    const handleWorkingDayChange = (day) => {
        setFormData(prev => ({
            ...prev,
            workingDays: {
                ...prev.workingDays,
                [day]: !prev.workingDays[day]
            }
        }));
    };

    const handleBreakChange = (index, field, value) => {
        const updatedBreaks = [...formData.breaks];
        updatedBreaks[index] = {
            ...updatedBreaks[index],
            [field]: value
        };
        handleChange('breaks', updatedBreaks);
    };

    const addBreak = () => {
        handleChange('breaks', [
            ...formData.breaks,
            {
                name: '',
                startTime: '12:00',
                endTime: '13:00',
                duration: 60
            }
        ]);
    };

    const removeBreak = (index) => {
        handleChange('breaks', formData.breaks.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                {/* Basic Working Hours */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Working Hours</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <TimePicker
                                onChange={(value) => handleChange('startTime', value)}
                                value={formData?.startTime || defaultWorkingHours.startTime}
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <TimePicker
                                onChange={(value) => handleChange('endTime', value)}
                                value={formData?.endTime || defaultWorkingHours.endTime}
                                className="mt-1 block w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Grace Period (minutes)</label>
                        <input
                            type="number"
                            value={formData.graceTime}
                            onChange={(e) => handleChange('graceTime', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Half Day Threshold (minutes)</label>
                        <input
                            type="number"
                            value={formData.halfDayThreshold}
                            onChange={(e) => handleChange('halfDayThreshold', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Working Days */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Working Days</h3>
                    <div className="space-y-2">
                        {Object.entries(formData?.workingDays || defaultWorkingHours.workingDays).map(([day, isWorking]) => (
                            <label key={day} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isWorking}
                                    onChange={() => handleWorkingDayChange(day)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 capitalize">{day}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breaks */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Breaks</h3>
                    <button
                        type="button"
                        onClick={addBreak}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Add Break
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.breaks.map((breakItem, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Break Name"
                                    value={breakItem.name}
                                    onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <TimePicker
                                    onChange={(value) => handleBreakChange(index, 'startTime', value)}
                                    value={breakItem.startTime}
                                />
                            </div>
                            <div>
                                <TimePicker
                                    onChange={(value) => handleBreakChange(index, 'endTime', value)}
                                    value={breakItem.endTime}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeBreak(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
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

export default WorkingHours; 