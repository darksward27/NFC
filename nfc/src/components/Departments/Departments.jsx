import React from 'react';

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
    const handleEditDepartment = (dept) => {
        setEditingDept(dept);
        setDeptFormData({
            name: dept.name,
            description: dept.description,
            location: dept.location,
            active: dept.active
        });
        setShowDeptModal(true);
    };

    const handleDeleteDepartment = async (deptId) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/departments/${deptId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    onDeleteDepartment(deptId);
                    if (selectedDept?._id === deptId) {
                        setSelectedDept(null);
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete department');
                }
            } catch (error) {
                console.error('Error deleting department:', error);
                alert('Failed to delete department');
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Departments</h2>
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

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map(dept => (
                    <div
                        key={dept._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedDept?._id === dept._id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                            }`}
                        onClick={() => setSelectedDept(dept)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{dept.name}</h3>
                                <p className="text-sm text-gray-500">{dept.location}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditDepartment(dept);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDepartment(dept._id);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm mt-2">{dept.description}</p>
                        <div className="mt-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${dept.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {dept.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Departments; 