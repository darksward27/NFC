import React from 'react';

export function OrganizationModal({
    showOrgModal,
    setShowOrgModal,
    editingOrg,
    orgFormData,
    setOrgFormData,
    handleOrgSubmit
}) {
    if (!showOrgModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {editingOrg ? 'Edit Organization' : 'Add Organization'}
                </h2>

                <form onSubmit={handleOrgSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={orgFormData.name}
                                onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={orgFormData.type}
                                onChange={(e) => setOrgFormData({ ...orgFormData, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="university">University</option>
                                <option value="company">Company</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                value={orgFormData.address}
                                onChange={(e) => setOrgFormData({ ...orgFormData, address: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={orgFormData.contactEmail}
                                onChange={(e) => setOrgFormData({ ...orgFormData, contactEmail: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={orgFormData.contactPhone}
                                onChange={(e) => setOrgFormData({ ...orgFormData, contactPhone: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={orgFormData.active}
                                onChange={(e) => setOrgFormData({ ...orgFormData, active: e.target.checked })}
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
                            onClick={() => {
                                setShowOrgModal(false);
                            }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {editingOrg ? 'Save Changes' : 'Add Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function DepartmentModal({
    showDeptModal,
    setShowDeptModal,
    editingDept,
    deptFormData,
    setDeptFormData,
    handleDeptSubmit
}) {
    if (!showDeptModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {editingDept ? 'Edit Department' : 'Add Department'}
                </h2>

                <form onSubmit={handleDeptSubmit}>
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
                                rows={3}
                            ></textarea>
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
                            onClick={() => {
                                setShowDeptModal(false);
                            }}
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

export function CardModal({
    showCardModal,
    setShowCardModal,
    editingCard,
    cardFormData,
    setCardFormData,
    handleCardSubmit
}) {
    if (!showCardModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {editingCard ? 'Edit Card' : 'Add Card'}
                </h2>

                <form onSubmit={handleCardSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card ID
                            </label>
                            <input
                                type="text"
                                value={cardFormData.id}
                                onChange={(e) => setCardFormData({ ...cardFormData, id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Holder Name
                            </label>
                            <input
                                type="text"
                                value={cardFormData.holderName}
                                onChange={(e) => setCardFormData({ ...cardFormData, holderName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={cardFormData.type}
                                onChange={(e) => setCardFormData({ ...cardFormData, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="staff">Staff</option>
                                <option value="employee">Employee</option>
                                <option value="visitor">Visitor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={cardFormData.email}
                                onChange={(e) => setCardFormData({ ...cardFormData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={cardFormData.phone}
                                onChange={(e) => setCardFormData({ ...cardFormData, phone: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valid From
                                </label>
                                <input
                                    type="date"
                                    value={cardFormData.validFrom}
                                    onChange={(e) => setCardFormData({ ...cardFormData, validFrom: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valid Until
                                </label>
                                <input
                                    type="date"
                                    value={cardFormData.validUntil}
                                    onChange={(e) => setCardFormData({ ...cardFormData, validUntil: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={cardFormData.active}
                                onChange={(e) => setCardFormData({ ...cardFormData, active: e.target.checked })}
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
                            onClick={() => {
                                setShowCardModal(false);
                            }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {editingCard ? 'Save Changes' : 'Add Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 