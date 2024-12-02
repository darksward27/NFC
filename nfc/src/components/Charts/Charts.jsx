import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import PropTypes from 'prop-types';

function Charts({ dailyData = [], devicesData = [] }) {
    const accessChartRef = useRef(null);
    const deptChartRef = useRef(null);
    const accessChart = useRef(null);
    const deptChart = useRef(null);

    useEffect(() => {
        if (accessChartRef.current) {
            if (accessChart.current) {
                accessChart.current.destroy();
            }
            accessChart.current = new Chart(accessChartRef.current, {
                type: 'line',
                data: {
                    labels: dailyData.map(stat => stat._id),
                    datasets: [
                        {
                            label: 'Authorized',
                            data: dailyData.map(stat => stat.authorized),
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Unauthorized',
                            data: dailyData.map(stat => stat.unauthorized),
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Daily Access Statistics'
                        }
                    }
                }
            });
        }

        if (deptChartRef.current) {
            if (deptChart.current) {
                deptChart.current.destroy();
            }
            deptChart.current = new Chart(deptChartRef.current, {
                type: 'bar',
                data: {
                    labels: devicesData.map(stat => `${stat.location} (${stat._id})`),
                    datasets: [
                        {
                            label: 'Total Access',
                            data: devicesData.map(stat => stat.total),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        },
                        {
                            label: 'Authorized',
                            data: devicesData.map(stat => stat.authorized),
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        }
                    ]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Access by Device/Location'
                        },
                    },
                    responsive: true,
                }
            });
        }
    }, [dailyData, devicesData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <canvas ref={accessChartRef}></canvas>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <canvas ref={deptChartRef}></canvas>
            </div>
        </div>
    );
}

Charts.propTypes = {
    dailyData: PropTypes.array,
    devicesData: PropTypes.array,
};

export default Charts; 