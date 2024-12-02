import React from 'react';

function FacultyModal({ faculty, onClose, onSave, formData, setFormData }) {
    const handleInputChange = (e, section, subsection = null) => {
        const { name, value } = e.target;
        
        if (section && subsection) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [subsection]: {
                        ...prev[section][subsection],
                        [name]: value
                    }
                }
            }));
        } else if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {faculty ? 'Edit Faculty' : 'Add Faculty'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.personalInfo.firstName}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.personalInfo.lastName}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.personalInfo.email}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.personalInfo.phone}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.personalInfo.dateOfBirth}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.personalInfo.gender}
                                    onChange={(e) => handleInputChange(e, 'personalInfo')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Employment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employmentDetails.employeeId}
                                    onChange={(e) => handleInputChange(e, 'employmentDetails')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.employmentDetails.designation}
                                    onChange={(e) => handleInputChange(e, 'employmentDetails')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={formData.employmentDetails.joiningDate}
                                    onChange={(e) => handleInputChange(e, 'employmentDetails')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentDetails.employmentType}
                                    onChange={(e) => handleInputChange(e, 'employmentDetails')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="visiting">Visiting</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="status"
                                    value={formData.employmentDetails.status}
                                    onChange={(e) => handleInputChange(e, 'employmentDetails')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="on-leave">On Leave</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Academic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teaching Experience (Years)</label>
                                <input
                                    type="number"
                                    name="teaching"
                                    value={formData.academicInfo.experience.teaching}
                                    onChange={(e) => handleInputChange(e, 'academicInfo', 'experience')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Industry Experience (Years)</label>
                                <input
                                    type="number"
                                    name="industry"
                                    value={formData.academicInfo.experience.industry}
                                    onChange={(e) => handleInputChange(e, 'academicInfo', 'experience')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Research Experience (Years)</label>
                                <input
                                    type="number"
                                    name="research"
                                    value={formData.academicInfo.experience.research}
                                    onChange={(e) => handleInputChange(e, 'academicInfo', 'experience')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {faculty ? 'Save Changes' : 'Add Faculty'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FacultyModal; 