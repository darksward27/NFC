import React, { useState, useEffect } from 'react';

function DepartmentDetail({ department, onClose, onEditMember, onDeleteMember, stats }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        if (department) {
            fetchMembers();
        }
    }, [department]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/cards?departmentId=${department._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member => 
        filterType === 'all' ? true : member.type === filterType
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{department.name}</h2>
                    <p className="text-gray-600">{department.description}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <i className="bi bi-x-lg text-xl"></i>
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{stats?.studentCount || 0}</div>
                    <div className="text-sm text-blue-600">Students</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{stats?.facultyCount || 0}</div>
                    <div className="text-sm text-green-600">Faculty</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">{stats?.staffCount || 0}</div>
                    <div className="text-sm text-purple-600">Staff</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{stats?.accessCount || 0}</div>
                    <div className="text-sm text-gray-600">Access Logs</div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border rounded-md px-3 py-1"
                    >
                        <option value="all">All Members</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{member.holderName}</h3>
                                    <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEditMember(member)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        onClick={() => onDeleteMember(member.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                    member.type === 'student' ? 'bg-blue-100 text-blue-800' :
                                    member.type === 'faculty' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                    {member.type}
                                </span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {member.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DepartmentDetail; 