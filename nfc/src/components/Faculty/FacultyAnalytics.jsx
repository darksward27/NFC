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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function FacultyAnalytics({ faculty }) {
    const [showCharts, setShowCharts] = useState(false);
    const [summary, setSummary] = useState({
        totalFaculty: 0,
        activeFaculty: 0,
        onLeaveFaculty: 0,
        inactiveFaculty: 0,
        designationDistribution: {},
        specializationDistribution: {},
        qualificationDistribution: {}
    });

    useEffect(() => {
        calculateSummary();
    }, [faculty]);

    const calculateSummary = () => {
        const totalFaculty = faculty.length;
        const activeFaculty = faculty.filter(f => f.employmentDetails.status === 'active').length;
        const onLeaveFaculty = faculty.filter(f => f.employmentDetails.status === 'on-leave').length;
        const inactiveFaculty = faculty.filter(f => f.employmentDetails.status === 'inactive').length;

        const designationDistribution = faculty.reduce((acc, f) => {
            const designation = f.employmentDetails.designation || 'Unknown';
            acc[designation] = (acc[designation] || 0) + 1;
            return acc;
        }, {});

        const specializationDistribution = faculty.reduce((acc, f) => {
            f.academicInfo.specialization.forEach(spec => {
                acc[spec] = (acc[spec] || 0) + 1;
            });
            return acc;
        }, {});

        const qualificationDistribution = faculty.reduce((acc, f) => {
            f.academicInfo.qualification.forEach(qual => {
                const degree = qual.degree || 'Unknown';
                acc[degree] = (acc[degree] || 0) + 1;
            });
            return acc;
        }, {});

        setSummary({
            totalFaculty,
            activeFaculty,
            onLeaveFaculty,
            inactiveFaculty,
            designationDistribution,
            specializationDistribution,
            qualificationDistribution
        });
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
                    font: { size: 10 }
                }
            }
        }
    };

    const designationData = {
        labels: Object.keys(summary.designationDistribution),
        datasets: [{
            label: 'Designation Distribution',
            data: Object.values(summary.designationDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
    };

    const specializationData = {
        labels: Object.keys(summary.specializationDistribution),
        datasets: [{
            label: 'Specialization Distribution',
            data: Object.values(summary.specializationDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
    };

    const qualificationData = {
        labels: Object.keys(summary.qualificationDistribution),
        datasets: [{
            label: 'Qualification Distribution',
            data: Object.values(summary.qualificationDistribution),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Faculty Analytics</h2>
                <button
                    onClick={() => setShowCharts(!showCharts)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                    {showCharts ? 'Hide Charts' : 'Show Charts'}
                </button>
            </div>

            <div className={`grid ${showCharts ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Total Faculty</h3>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalFaculty}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Active Faculty</h3>
                    <p className="text-2xl font-bold text-green-600">{summary.activeFaculty}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">On Leave</h3>
                    <p className="text-2xl font-bold text-yellow-600">{summary.onLeaveFaculty}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-600">Inactive</h3>
                    <p className="text-2xl font-bold text-red-600">{summary.inactiveFaculty}</p>
                </div>

                {showCharts && (
                    <>
                        <div className="bg-white p-4 rounded-lg shadow lg:col-span-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-[200px]">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Designation Distribution</h3>
                                    <Pie data={designationData} options={chartOptions} />
                                </div>
                                <div className="h-[200px]">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Specialization Distribution</h3>
                                    <Bar data={specializationData} options={chartOptions} />
                                </div>
                                <div className="h-[200px]">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Qualification Distribution</h3>
                                    <Pie data={qualificationData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FacultyAnalytics; 