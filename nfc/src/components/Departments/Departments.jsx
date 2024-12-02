import React from 'react';

function Departments({ departments, selectedOrg, selectedDept, setSelectedDept, setShowDeptModal, setEditingDept, setDeptFormData, handleDeleteDepartment }) {
    if (!selectedOrg) {
        return (
            <div className="text-center py-8 text-gray-500">
                Please select an organization to view departments
            </div>
        );
    }

    return (
        <div className="mt-6 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Departments</h2>
                    <p className="text-sm text-gray-500">
                        {selectedOrg.name}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingDept(null);
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
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedDept?._id === dept._id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this department?')) {
                                            handleDeleteDepartment(selectedOrg._id, dept._id);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm mt-2">{dept.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Departments; 