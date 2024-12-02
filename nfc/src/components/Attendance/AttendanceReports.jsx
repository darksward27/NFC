import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
    FaFileDownload, 
    FaChartBar, 
    FaCalendarAlt,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaUserTie
} from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const AttendanceReports = () => {
    const [reportType, setReportType] = useState('daily');
    const [userType, setUserType] = useState('student');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
    const [departments, setDepartments] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchReportData();
        }
    }, [selectedDepartment, reportType, userType, dateRange]);

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

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/access-logs/report?` +
                `departmentId=${selectedDepartment}&` +
                `type=${userType}&` +
                `reportType=${reportType}&` +
                `startDate=${dateRange.start}&` +
                `endDate=${dateRange.end}`
            );
            if (!response.ok) throw new Error('Failed to fetch report data');
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format = 'xlsx') => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/access-logs/export?` +
                `departmentId=${selectedDepartment}&` +
                `type=${userType}&` +
                `reportType=${reportType}&` +
                `startDate=${dateRange.start}&` +
                `endDate=${dateRange.end}&` +
                `format=${format}`,
                { responseType: 'blob' }
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError('Failed to export report');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Attendance Reports</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => exportReport('xlsx')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <FaFileDownload />
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={() => exportReport('pdf')}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        <FaFileDownload />
                        <span>Export PDF</span>
                    </button>
                </div>
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
                    <label className="block text-sm font-medium text-gray-700">Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="daily">Daily Report</option>
                        <option value="weekly">Weekly Report</option>
                        <option value="monthly">Monthly Report</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                    <div className="mt-1 flex space-x-4">
                        <button
                            onClick={() => setUserType('student')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                                userType === 'student' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <FaUserGraduate />
                            <span>Students</span>
                        </button>
                        <button
                            onClick={() => setUserType('faculty')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                                userType === 'faculty' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <FaChalkboardTeacher />
                            <span>Faculty</span>
                        </button>
                        <button
                            onClick={() => setUserType('staff')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                                userType === 'staff' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <FaUserTie />
                            <span>Staff</span>
                        </button>
                    </div>
                </div>

                {reportType === 'custom' && (
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-600 text-center">{error}</div>
            ) : reportData ? (
                <div className="space-y-6">
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" fill="#4CAF50" />
                                <Bar dataKey="late" fill="#FFC107" />
                                <Bar dataKey="absent" fill="#F44336" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-green-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800">Present</h3>
                            <p className="text-2xl font-bold text-green-600">{reportData.summary.present}</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-yellow-800">Late</h3>
                            <p className="text-2xl font-bold text-yellow-600">{reportData.summary.late}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-red-800">Absent</h3>
                            <p className="text-2xl font-bold text-red-600">{reportData.summary.absent}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800">Total</h3>
                            <p className="text-2xl font-bold text-blue-600">{reportData.summary.total}</p>
                        </div>
                    </div>

                    {/* Detailed Report Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Add table headers and rows based on reportData.details */}
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AttendanceReports; 