import React, { useState } from 'react';

function AccessControls() {
    const [activeTab, setActiveTab] = useState('points');
    const [accessPoints, setAccessPoints] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        status: 'active',
        allowedDepartments: [],
        scheduleEnabled: false,
        schedule: {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false }
        }
    });

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'points'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('points')}
                        >
                            Access Points
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${
                                activeTab === 'logs'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('logs')}
                        >
                            Access Logs
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'points' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Access Points</h2>
                                <button
                                    onClick={() => {
                                        setSelectedPoint(null);
                                        setShowModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Add Access Point
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {accessPoints.map(point => (
                                    <div key={point._id} className="bg-white rounded-lg shadow border p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{point.name}</h3>
                                                <p className="text-sm text-gray-500">{point.location}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                point.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {point.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{point.description}</p>
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPoint(point);
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePoint(point._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Access Logs</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                        <option value="">All Points</option>
                                        {accessPoints.map(point => (
                                            <option key={point._id} value={point._id}>
                                                {point.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Access Point
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {accessLogs.map(log => (
                                            <tr key={log._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.accessPoint.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        log.status === 'granted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccessControls; 