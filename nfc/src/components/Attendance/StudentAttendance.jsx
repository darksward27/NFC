import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCheck, FaTimes, FaClock, FaFileDownload } from 'react-icons/fa';

const StudentAttendance = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchClasses();
        }
    }, [selectedDepartment]);

    useEffect(() => {
        if (selectedDepartment && selectedClass) {
            fetchStudentAttendance();
        }
    }, [selectedDepartment, selectedClass, date]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/departments');
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepartments(data || []);
        } catch (error) {
            setError(error.message);
            setDepartments([]);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/classes?departmentId=${selectedDepartment}`);
            if (!response.ok) throw new Error('Failed to fetch classes');
            const data = await response.json();
            setClasses(data || []);
        } catch (error) {
            setError(error.message);
            setClasses([]);
        }
    };

    const fetchStudentAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/student-attendance?` +
                `departmentId=${selectedDepartment}&` +
                `classId=${selectedClass}&` +
                `date=${format(date, 'yyyy-MM-dd')}`
            );
            if (!response.ok) throw new Error('Failed to fetch attendance');
            const data = await response.json();
            setStudents(data || []);
            setError(null);
        } catch (error) {
            setError(error.message);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (studentId, status) => {
        try {
            const response = await fetch('http://localhost:3000/api/student-attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    status,
                    date: format(date, 'yyyy-MM-dd'),
                    classId: selectedClass,
                    departmentId: selectedDepartment
                })
            });
            if (!response.ok) throw new Error('Failed to mark attendance');
            await fetchStudentAttendance();
        } catch (error) {
            setError(error.message);
        }
    };

    const exportAttendance = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/student-attendance/export?` +
                `departmentId=${selectedDepartment}&` +
                `classId=${selectedClass}&` +
                `date=${format(date, 'yyyy-MM-dd')}`
            );
            if (!response.ok) throw new Error('Failed to export attendance');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-${format(date, 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => {
                            setSelectedDepartment(e.target.value);
                            setSelectedClass('');
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id || dept.id} value={dept._id || dept.id}>
                                {dept.name || 'Unnamed Department'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={!selectedDepartment}
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls._id || cls.id} value={cls._id || cls.id}>
                                {cls.name || 'Unnamed Class'}
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
                <div className="text-red-600 text-center p-4 bg-red-50 rounded-md">
                    {error}
                </div>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={exportAttendance}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            disabled={!students.length}
                        >
                            <FaFileDownload className="mr-2" />
                            Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Roll Number
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
                                {students.map((student) => (
                                    <tr key={student._id || student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {student.rollNumber || student.id || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${student.status === 'present' ? 'bg-green-100 text-green-800' : 
                                                  student.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                {student.status || 'Not Marked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.time ? format(new Date(student.time), 'HH:mm') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => markAttendance(student._id || student.id, 'present')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Mark Present"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(student._id || student.id, 'late')}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Mark Late"
                                                >
                                                    <FaClock />
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(student._id || student.id, 'absent')}
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
                </>
            )}
        </div>
    );
};

export default StudentAttendance; 