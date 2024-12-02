import React, { useState, useEffect } from 'react';
import DepartmentDetail from './DepartmentDetail';

function Departments({
    departments,
    selectedDept,
    setSelectedDept,
    setShowDeptModal,
    setEditingDept,
    setDeptFormData,
    organizationId,
    onDeleteDepartment
}) {
    const [departmentStats, setDepartmentStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterActive, setFilterActive] = useState('all');
    const [showDetail, setShowDetail] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    useEffect(() => {
        if (departments.length > 0) {
            fetchDepartmentStats();
        }
    }, [departments]);

    const fetchDepartmentStats = async () => {
        setLoading(true);
        try {
            const statsPromises = departments.map(async (dept) => {
                const membersResponse = await fetch(`http://localhost:3000/api/cards?departmentId=${dept._id}`);
                const members = await membersResponse.json();
                
                const logsResponse = await fetch(`http://localhost:3000/api/access-logs?departmentId=${dept._id}`);
                const logs = await logsResponse.json();

                return {
                    memberCount: members.length,
                    accessCount: logs.length,
                    studentCount: members.filter(m => m.type === 'student').length,
                    facultyCount: members.filter(m => m.type === 'faculty').length,
                    staffCount: members.filter(m => m.type === 'staff').length
                };
            });

            const stats = await Promise.all(statsPromises);
            const statsMap = {};
            departments.forEach((dept, index) => {
                statsMap[dept._id] = stats[index];
            });
            setDepartmentStats(statsMap);
        } catch (error) {
            console.error('Error fetching department stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setShowMemberModal(true);
    };

    const handleDeleteMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/cards/${memberId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchDepartmentStats();
                } else {
                    throw new Error('Failed to delete member');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete member');
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Departments</h2>
                    <p className="text-sm text-gray-500">Manage department records</p>
                </div>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">View:</label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="text-sm border rounded-md"
                        >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setEditingDept(null);
                            setDeptFormData({
                                name: '',
                                description: '',
                                location: '',
                                active: true
                            });
                            setShowDeptModal(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Add Department
                    </button>
                </div>
            </div>

            <div className="p-6">
                {showDetail ? (
                    <DepartmentDetail 
                        department={selectedDept}
                        onClose={() => setShowDetail(false)}
                        onEditMember={handleEditMember}
                        onDeleteMember={handleDeleteMember}
                        stats={departmentStats[selectedDept._id]}
                    />
                ) : (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                        {departments.map(dept => (
                            <div key={dept._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{dept.name}</h3>
                                        <p className="text-sm text-gray-500">{dept.location}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setShowDetail(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingDept(dept);
                                                setDeptFormData({
                                                    name: dept.name,
                                                    description: dept.description,
                                                    location: dept.location,
                                                    active: dept.active
                                                });
                                                setShowDeptModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => onDeleteDepartment(dept._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">{dept.description}</p>
                                </div>
                                {departmentStats[dept._id] && (
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-blue-50 p-2 rounded">
                                            <div className="text-sm font-medium text-blue-800">
                                                {departmentStats[dept._id].studentCount}
                                            </div>
                                            <div className="text-xs text-blue-600">Students</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                            <div className="text-sm font-medium text-green-800">
                                                {departmentStats[dept._id].facultyCount}
                                            </div>
                                            <div className="text-xs text-green-600">Faculty</div>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                            <div className="text-sm font-medium text-purple-800">
                                                {departmentStats[dept._id].staffCount}
                                            </div>
                                            <div className="text-xs text-purple-600">Staff</div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        dept.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {dept.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Departments; 