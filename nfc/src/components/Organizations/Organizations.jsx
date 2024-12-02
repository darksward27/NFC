import React from 'react';

function Organizations({ organizations, selectedOrg, setSelectedOrg, setShowOrgModal, setEditingOrg, setOrgFormData, handleDeleteOrganization }) {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Organizations</h2>
                <button
                    onClick={() => {
                        setEditingOrg(null);
                        setShowOrgModal(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Add Organization
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map(org => (
                    <div
                        key={org._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedOrg?._id === org._id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                        onClick={() => setSelectedOrg(org)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{org.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{org.type}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingOrg(org);
                                        setOrgFormData({
                                            name: org.name,
                                            type: org.type,
                                            address: org.address,
                                            contactEmail: org.contactEmail,
                                            contactPhone: org.contactPhone,
                                            active: org.active
                                        });
                                        setShowOrgModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this organization?')) {
                                            handleDeleteOrganization(org._id);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm mt-2">{org.address}</p>
                        <div className="mt-3 text-sm text-gray-500">
                            <p>{org.contactEmail}</p>
                            <p>{org.contactPhone}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Organizations; 