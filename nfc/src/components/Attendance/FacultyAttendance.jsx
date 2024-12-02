import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCheck, FaTimes, FaClock, FaFileDownload } from 'react-icons/fa';
import AttendanceSettings from './Settings/AttendanceSettings';

const FacultyAttendance = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [date, setDate] = useState(new Date());
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchFacultyAttendance();
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

    const fetchFacultyAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/faculty-attendance?` +
                `departmentId=${selectedDepartment}&` +
                `date=${format(date, 'yyyy-MM-dd')}`
            );
            if (!response.ok) throw new Error('Failed to fetch attendance');
            const data = await response.json();
            setFaculty(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (facultyId, status) => {
        try {
            const response = await fetch('http://localhost:3000/api/faculty-attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facultyId,
                    status,
                    date: format(date, 'yyyy-MM-dd')
                })
            });
            if (!response.ok) throw new Error('Failed to mark attendance');
            fetchFacultyAttendance();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id || dept.id} value={dept._id || dept.id}>
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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
                                    Employee ID
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
                            {faculty.map((member) => (
                                <tr key={member._id || member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {member.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {member.employeeId || member.id || 'N/A'}
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
                                                onClick={() => markAttendance(member._id || member.id, 'present')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Mark Present"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => markAttendance(member._id || member.id, 'late')}
                                                className="text-yellow-600 hover:text-yellow-900"
                                                title="Mark Late"
                                            >
                                                <FaClock />
                                            </button>
                                            <button
                                                onClick={() => markAttendance(member._id || member.id, 'absent')}
                                                className="text-red-600 hover:text-red-900"
                                                title="Mark Absent"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showSettings && (
                <AttendanceSettings
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};

export default FacultyAttendance; 