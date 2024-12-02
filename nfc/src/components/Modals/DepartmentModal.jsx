import React from 'react';

function DepartmentModal({
    showDeptModal,
    setShowDeptModal,
    editingDept,
    deptFormData,
    setDeptFormData,
    organizationId,
    onDepartmentUpdate
}) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingDept 
                ? `http://localhost:3000/api/departments/${editingDept._id}`
                : 'http://localhost:3000/api/departments';
            
            const method = editingDept ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...deptFormData,
                    organizationId: organizationId
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save department');
            }

            const savedDept = await response.json();
            onDepartmentUpdate(savedDept);
            setShowDeptModal(false);
            
        } catch (error) {
            console.error('Error saving department:', error);
            alert(error.message || 'Failed to save department');
        }
    };

    if (!showDeptModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {editingDept ? 'Edit Department' : 'Add Department'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={deptFormData.name}
                                onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={deptFormData.description}
                                onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                value={deptFormData.location}
                                onChange={(e) => setDeptFormData({ ...deptFormData, location: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={deptFormData.active}
                                onChange={(e) => setDeptFormData({ ...deptFormData, active: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Active
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowDeptModal(false)}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {editingDept ? 'Save Changes' : 'Add Department'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DepartmentModal; 