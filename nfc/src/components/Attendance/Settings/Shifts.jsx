import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import TimePicker from 'react-time-picker';

const Shifts = ({ settings, organizationId, onUpdate }) => {
    const defaultShift = {
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        graceTime: 15,
        departments: []
    };

    const [shifts, setShifts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [editingShift, setEditingShift] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({...defaultShift});

    useEffect(() => {
        if (settings) {
            setShifts(settings.map(shift => ({
                ...defaultShift,
                ...shift
            })));
        }
        fetchDepartments();
    }, [settings]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/departments');
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDepartmentChange = (deptId) => {
        setFormData(prev => {
            const departments = prev.departments.includes(deptId)
                ? prev.departments.filter(id => id !== deptId)
                : [...prev.departments, deptId];
            return { ...prev, departments };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `http://localhost:3000/api/attendance-settings/${organizationId}/shifts${editingShift ? `/${editingShift._id}` : ''}`;
            const method = editingShift ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save shift');
            
            onUpdate();
            resetForm();
        } catch (error) {
            console.error('Error saving shift:', error);
        }
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setFormData({
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            graceTime: shift.graceTime,
            departments: shift.departments
        });
        setShowForm(true);
    };

    const handleDelete = async (shiftId) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;
        
        try {
            const response = await fetch(
                `http://localhost:3000/api/attendance-settings/${organizationId}/shifts/${shiftId}`,
                { method: 'DELETE' }
            );
            if (!response.ok) throw new Error('Failed to delete shift');
            onUpdate();
        } catch (error) {
            console.error('Error deleting shift:', error);
        }
    };

    const resetForm = () => {
        setFormData({...defaultShift});
        setEditingShift(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Shifts</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {showForm ? 'Cancel' : 'Add Shift'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shift Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grace Time (minutes)</label>
                            <input
                                type="number"
                                value={formData.graceTime}
                                onChange={(e) => handleInputChange('graceTime', parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <TimePicker
                                onChange={(value) => handleInputChange('startTime', value)}
                                value={formData.startTime}
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <TimePicker
                                onChange={(value) => handleInputChange('endTime', value)}
                                value={formData.endTime}
                                className="mt-1 block w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                        <div className="grid grid-cols-3 gap-2">
                            {departments.map(dept => (
                                <label key={dept._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.departments.includes(dept._id)}
                                        onChange={() => handleDepartmentChange(dept._id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2">{dept.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

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
                            {editingShift ? 'Update' : 'Add'} Shift
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {shifts.map(shift => (
                    <div key={shift._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{shift.name}</h4>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(shift)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(shift._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Time: {shift.startTime} - {shift.endTime}</p>
                            <p>Grace Period: {shift.graceTime} minutes</p>
                            <p>Departments: {departments
                                .filter(dept => shift.departments.includes(dept._id))
                                .map(dept => dept.name)
                                .join(', ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shifts; 