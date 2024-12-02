import React from 'react';

function FacultyModal({ faculty, onClose, onSave, formData, setFormData, loading }) {
    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                address: {
                    ...prev.personalInfo.address,
                    [field]: value
                }
            }
        }));
    };

    const handleExperienceChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            academicInfo: {
                ...prev.academicInfo,
                experience: {
                    ...prev.academicInfo.experience,
                    [field]: parseInt(value) || 0
                }
            }
        }));
    };

    const handleSalaryChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            employmentDetails: {
                ...prev.employmentDetails,
                salary: {
                    ...prev.employmentDetails.salary,
                    [field]: parseFloat(value) || 0
                }
            }
        }));
    };

    const handleQualificationChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            academicInfo: {
                ...prev.academicInfo,
                qualification: prev.academicInfo.qualification.map((qual, i) => 
                    i === index ? { ...qual, [field]: value } : qual
                )
            }
        }));
    };

    const addQualification = () => {
        setFormData(prev => ({
            ...prev,
            academicInfo: {
                ...prev.academicInfo,
                qualification: [
                    ...prev.academicInfo.qualification,
                    { degree: '', field: '', institution: '', year: new Date().getFullYear() }
                ]
            }
        }));
    };

    const removeQualification = (index) => {
        setFormData(prev => ({
            ...prev,
            academicInfo: {
                ...prev.academicInfo,
                qualification: prev.academicInfo.qualification.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSpecializationChange = (value) => {
        const specializations = value.split(',').map(s => s.trim());
        setFormData(prev => ({
            ...prev,
            academicInfo: {
                ...prev.academicInfo,
                specialization: specializations
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Log the form data before submission
        console.log('Submitting form data:', formData);
        
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {faculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                    </h2>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.firstName}
                                        onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.lastName}
                                        onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.email}
                                        onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.phone}
                                        onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.dateOfBirth}
                                        onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender *</label>
                                    <select
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.gender}
                                        onChange={(e) => handleChange('personalInfo', 'gender', e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address Fields */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Street</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.address.street}
                                        onChange={(e) => handleAddressChange('street', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.address.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.address.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.address.zipCode}
                                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.personalInfo.address.country}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">Employment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Employee ID *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.employeeId}
                                        onChange={(e) => handleChange('employmentDetails', 'employeeId', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Designation *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.designation}
                                        onChange={(e) => handleChange('employmentDetails', 'designation', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Joining Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.joiningDate}
                                        onChange={(e) => handleChange('employmentDetails', 'joiningDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.status}
                                        onChange={(e) => handleChange('employmentDetails', 'status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </div>
                            </div>

                            {/* Salary Details */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Basic Salary *</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.salary.basic}
                                        onChange={(e) => handleSalaryChange('basic', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Allowances</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.salary.allowances}
                                        onChange={(e) => handleSalaryChange('allowances', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Deductions</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.employmentDetails.salary.deductions}
                                        onChange={(e) => handleSalaryChange('deductions', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">Academic Information</h3>
                            
                            {/* Qualifications */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">Qualifications</label>
                                    <button
                                        type="button"
                                        onClick={addQualification}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="bi bi-plus-circle"></i> Add
                                    </button>
                                </div>
                                {formData.academicInfo.qualification.map((qual, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Degree"
                                            className="rounded-md border-gray-300"
                                            value={qual.degree}
                                            onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Field"
                                            className="rounded-md border-gray-300"
                                            value={qual.field}
                                            onChange={(e) => handleQualificationChange(index, 'field', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Institution"
                                            className="rounded-md border-gray-300"
                                            value={qual.institution}
                                            onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Year"
                                                className="rounded-md border-gray-300 w-full"
                                                value={qual.year}
                                                onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeQualification(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Specializations */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Specializations (comma-separated)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300"
                                    value={formData.academicInfo.specialization.join(', ')}
                                    onChange={(e) => handleSpecializationChange(e.target.value)}
                                    placeholder="e.g., Machine Learning, Data Science, AI"
                                />
                            </div>

                            {/* Experience */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teaching Experience (years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.academicInfo.experience.teaching}
                                        onChange={(e) => handleExperienceChange('teaching', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Industry Experience (years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.academicInfo.experience.industry}
                                        onChange={(e) => handleExperienceChange('industry', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Research Experience (years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.academicInfo.experience.research}
                                        onChange={(e) => handleExperienceChange('research', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* NFC Card Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">NFC Card Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.nfcCard.cardNumber}
                                        onChange={(e) => handleChange('nfcCard', 'cardNumber', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Card Status</label>
                                    <select
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.nfcCard.status}
                                        onChange={(e) => handleChange('nfcCard', 'status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="lost">Lost</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.nfcCard.issueDate}
                                        onChange={(e) => handleChange('nfcCard', 'issueDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border-gray-300"
                                        value={formData.nfcCard.expiryDate}
                                        onChange={(e) => handleChange('nfcCard', 'expiryDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FacultyModal; 