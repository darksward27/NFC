import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function StudentAnalytics({ students }) {
    const [showCharts, setShowCharts] = useState(false);
    const [summary, setSummary] = useState({
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        averageCGPA: 0,
        branchDistribution: {},
        semesterDistribution: {}
    });

    useEffect(() => {
        calculateSummary();
    }, [students]);

    const calculateSummary = () => {
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.active).length;
        const inactiveStudents = totalStudents - activeStudents;
        const averageCGPA = (students.reduce((sum, s) => sum + (s.studentInfo?.academicDetails?.cgpa || 0), 0) / totalStudents).toFixed(2);

        const branchDistribution = students.reduce((acc, s) => {
            const branch = s.studentInfo?.branch || 'Unknown';
            acc[branch] = (acc[branch] || 0) + 1;
            return acc;
        }, {});

        const semesterDistribution = students.reduce((acc, s) => {
            const semester = s.studentInfo?.semester || 'Unknown';
            acc[semester] = (acc[semester] || 0) + 1;
            return acc;
        }, {});

        setSummary({
            totalStudents,
            activeStudents,
            inactiveStudents,
            averageCGPA,
            branchDistribution,
            semesterDistribution
        });
    };

    const branchData = {
        labels: Object.keys(summary.branchDistribution),
        datasets: [{
            label: 'Branch Distribution',
            data: Object.values(summary.branchDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
    };

    const semesterData = {
        labels: Object.keys(summary.semesterDistribution),
        datasets: [{
            label: 'Semester Distribution',
            data: Object.values(summary.semesterDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
                <button
                    onClick={() => setShowCharts(!showCharts)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                    {showCharts ? 'Hide Charts' : 'Show Charts'}
                </button>
            </div>

            <div className={`grid ${showCharts ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                {/* Summary Cards */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Active Students</h3>
                    <p className="text-2xl font-bold text-green-600">{summary.activeStudents}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Inactive Students</h3>
                    <p className="text-2xl font-bold text-red-600">{summary.inactiveStudents}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Average CGPA</h3>
                    <p className="text-2xl font-bold text-blue-600">{summary.averageCGPA}</p>
                </div>

                {/* Charts Section */}
                {showCharts && (
                    <>
                        <div className="bg-white p-4 rounded-lg shadow lg:col-span-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-[200px]">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Branch Distribution</h3>
                                    <Pie data={branchData} options={chartOptions} />
                                </div>
                                <div className="h-[200px]">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Semester Distribution</h3>
                                    <Bar data={semesterData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default StudentAnalytics; 