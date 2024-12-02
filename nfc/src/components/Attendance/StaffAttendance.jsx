import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCheck, FaTimes, FaClock, FaFileDownload, FaEdit } from 'react-icons/fa';

const StaffAttendance = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [date, setDate] = useState(new Date());
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchStaffAttendance();
        }
    }, [selectedDepartment, date]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/departments');
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchStaffAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/access-logs?departmentId=${selectedDepartment}&date=${format(date, 'yyyy-MM-dd')}&type=staff`
            );
            if (!response.ok) throw new Error('Failed to fetch staff attendance');
            const data = await response.json();
            setStaff(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (staffId, status) => {
        try {
            const response = await fetch('http://localhost:3000/api/access-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardId: staffId,
                    status,
                    timestamp: new Date(),
                    type: 'manual',
                    departmentId: selectedDepartment
                })
            });

            if (!response.ok) throw new Error('Failed to mark attendance');
            fetchStaffAttendance();
        } catch (error) {
            setError(error.message);
        }
    };

    const exportAttendance = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/access-logs/export?departmentId=${selectedDepartment}&date=${format(date, 'yyyy-MM-dd')}&type=staff`,
                { responseType: 'blob' }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `staff-attendance-${format(date, 'yyyy-MM-dd')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError('Failed to export attendance');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Staff Attendance</h2>
                <button
                    onClick={exportAttendance}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <FaFileDownload />
                    <span>Export</span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={format(date, 'yyyy-MM-dd')}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-600 text-center">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staff.map((member) => (
                                <tr key={member.id || member._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {member.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {member.department}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${member.status === 'present' ? 'bg-green-100 text-green-800' : 
                                              member.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {member.status || 'Not Marked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.time ? format(new Date(member.time), 'HH:mm') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => markAttendance(member.id, 'present')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Mark Present"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => markAttendance(member.id, 'late')}
                                                className="text-yellow-600 hover:text-yellow-900"
                                                title="Mark Late"
                                            >
                                                <FaClock />
                                            </button>
                                            <button
                                                onClick={() => markAttendance(member.id, 'absent')}
                                                className="text-red-600 hover:text-red-900"
                                                title="Mark Absent"
                                            >
                                                <FaTimes />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedStaff(member);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit Attendance"
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StaffAttendance; 