import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { FaUsers, FaClock, FaChartLine, FaCalendarCheck } from 'react-icons/fa';

const AttendanceAnalytics = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        realTimeStats: {
            present: 0,
            late: 0,
            absent: 0,
            onLeave: 0
        },
        trends: [],
        departmentComparison: [],
        attendanceByTime: []
    });

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        fetchAnalyticsData();
        // Set up real-time updates
        const ws = new WebSocket('ws://localhost:3000/ws/attendance');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateRealTimeStats(data);
        };

        return () => ws.close();
    }, [timeRange, selectedDepartment]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/attendance/analytics?` +
                `timeRange=${timeRange}&department=${selectedDepartment}`
            );
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRealTimeStats = (newData) => {
        setAnalyticsData(prev => ({
            ...prev,
            realTimeStats: newData
        }));
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                    </select>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Departments</option>
                        {/* Add department options dynamically */}
                    </select>
                </div>
            </div>

            {/* Real-time Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Present Today</p>
                            <h3 className="text-2xl font-bold text-green-600">
                                {analyticsData.realTimeStats.present}
                            </h3>
                        </div>
                        <FaUsers className="text-3xl text-green-500" />
                    </div>
                </div>
                {/* Add similar cards for Late, Absent, and On Leave */}
            </div>

            {/* Attendance Trends */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Attendance Trends</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="present" 
                                stackId="1"
                                stroke="#4CAF50" 
                                fill="#4CAF50" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="late" 
                                stackId="1"
                                stroke="#FFC107" 
                                fill="#FFC107" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="absent" 
                                stackId="1"
                                stroke="#F44336" 
                                fill="#F44336" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Department Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Department Comparison</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.departmentComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendance" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Attendance by Time</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.attendanceByTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="checkIns" 
                                    stroke="#3B82F6" 
                                    activeDot={{ r: 8 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAnalytics; 