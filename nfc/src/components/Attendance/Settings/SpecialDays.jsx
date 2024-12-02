import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import TimePicker from 'react-time-picker';
import { format } from 'date-fns';

const SpecialDays = ({ settings, organizationId, onUpdate }) => {
    const [specialDays, setSpecialDays] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDay, setEditingDay] = useState(null);
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'holiday',
        description: '',
        workingHours: {
            startTime: '09:00',
            endTime: '17:00'
        }
    });

    useEffect(() => {
        if (settings) {
            setSpecialDays(settings);
        }
    }, [settings]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [section, subfield] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [subfield]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `http://localhost:3000/api/attendance-settings/${organizationId}/special-days${editingDay ? `/${editingDay._id}` : ''}`;
            const method = editingDay ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save special day');
            
            onUpdate();
            resetForm();
        } catch (error) {
            console.error('Error saving special day:', error);
        }
    };

    const handleEdit = (day) => {
        setEditingDay(day);
        setFormData({
            date: format(new Date(day.date), 'yyyy-MM-dd'),
            type: day.type,
            description: day.description,
            workingHours: day.workingHours
        });
        setShowForm(true);
    };

    const handleDelete = async (dayId) => {
        if (!window.confirm('Are you sure you want to delete this special day?')) return;
        
        try {
            const response = await fetch(
                `http://localhost:3000/api/attendance-settings/${organizationId}/special-days/${dayId}`,
                { method: 'DELETE' }
            );
            if (!response.ok) throw new Error('Failed to delete special day');
            onUpdate();
        } catch (error) {
            console.error('Error deleting special day:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            type: 'holiday',
            description: '',
            workingHours: {
                startTime: '09:00',
                endTime: '17:00'
            }
        });
        setEditingDay(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Special Days</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {showForm ? 'Cancel' : 'Add Special Day'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="holiday">Holiday</option>
                                <option value="event">Event</option>
                                <option value="half-day">Half Day</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {formData.type !== 'holiday' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <TimePicker
                                    onChange={(value) => handleInputChange('workingHours.startTime', value)}
                                    value={formData.workingHours.startTime}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <TimePicker
                                    onChange={(value) => handleInputChange('workingHours.endTime', value)}
                                    value={formData.workingHours.endTime}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            {editingDay ? 'Update' : 'Add'} Special Day
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {specialDays.map(day => (
                    <div key={day._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">
                                {format(new Date(day.date), 'MMMM d, yyyy')} - {day.description}
                            </h4>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(day)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(day._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Type: {day.type}</p>
                            {day.type !== 'holiday' && (
                                <p>Working Hours: {day.workingHours.startTime} - {day.workingHours.endTime}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialDays; 