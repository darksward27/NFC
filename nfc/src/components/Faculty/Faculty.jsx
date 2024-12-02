import React, { useState, useEffect } from 'react';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyModal from './FacultyModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Faculty({ organizationId }) {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [showFacultyModal, setShowFacultyModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [error, setError] = useState('');

    const [facultyFormData, setFacultyFormData] = useState({
        personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: 'male',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        },
        academicInfo: {
            qualification: [{
                degree: '',
                field: '',
                institution: '',
                year: new Date().getFullYear()
            }],
            specialization: [],
            experience: {
                teaching: 0,
                industry: 0,
                research: 0
            },
            publications: []
        },
        employmentDetails: {
            employeeId: '',
            designation: '',
            joiningDate: new Date().toISOString().split('T')[0],
            status: 'active',
            salary: {
                basic: 0,
                allowances: 0,
                deductions: 0
            },
            contracts: []
        },
        nfcCard: {
            cardNumber: '',
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            status: 'active'
        }
    });

    useEffect(() => {
        fetchDepartments();
    }, [organizationId]);

    useEffect(() => {
        if (selectedDept) {
            fetchFaculty();
        }
    }, [selectedDept]);

    const fetchDepartments = async () => {
        setDepartmentsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/departments?organizationId=${organizationId}`);
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load departments');
        } finally {
            setDepartmentsLoading(false);
        }
    };
// Update the fetchFaculty function
const fetchFaculty = async () => {
    if (!selectedDept) return;
    
    try {
        setLoading(true);
        const response = await fetch(`/api/faculty/department/${selectedDept._id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch faculty');
        const data = await response.json();
        setFaculty(data);
    } catch (error) {
        console.error('Error:', error);
        setError('Failed to load faculty');
    } finally {
        setLoading(false);
    }
};

// Update the handleSubmit function
const handleSubmit = async (formData) => {
    try {
        const response = await fetch('/api/faculty', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                employmentDetails: {
                    ...formData.employmentDetails,
                    department: selectedDept._id,
                    organizationId: selectedDept.organizationId
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create faculty');
        }

        const data = await response.json();
        await fetchFaculty(); // Refresh the faculty list
        return data;
    } catch (error) {
        console.error('Error saving faculty:', error);
        throw error;
    }
};

// Update the handleDelete function
const handleDelete = async (facultyId) => {
    try {
        const response = await fetch(`/api/faculty/${facultyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete faculty member');
        }

        await fetchFaculty(); // Refresh the faculty list
    } catch (error) {
        setError(error.message);
        console.error('Error deleting faculty:', error);
    }
};

    const resetFormData = () => {
        setFacultyFormData({
            personalInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: 'male',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                }
            },
            academicInfo: {
                qualification: [{
                    degree: '',
                    field: '',
                    institution: '',
                    year: new Date().getFullYear()
                }],
                specialization: [],
                experience: {
                    teaching: 0,
                    industry: 0,
                    research: 0
                },
                publications: []
            },
            employmentDetails: {
                employeeId: '',
                designation: '',
                joiningDate: new Date().toISOString().split('T')[0],
                status: 'active',
                salary: {
                    basic: 0,
                    allowances: 0,
                    deductions: 0
                },
                contracts: []
            },
            nfcCard: {
                cardNumber: '',
                issueDate: new Date().toISOString().split('T')[0],
                expiryDate: '',
                status: 'active'
            }
        });
    };

    useEffect(() => {
        const fetchFaculty = async () => {
            if (selectedDept) {
                try {
                    setLoading(true);
                    const response = await fetch(
                        `http://localhost:3000/api/faculty?departmentId=${selectedDept._id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch faculty data');
                    }

                    const data = await response.json();
                    setFaculty(data);
                } catch (error) {
                    setError(error.message);
                    console.error('Error fetching faculty:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFaculty();
    }, [selectedDept]);


    // Update the faculty card display
    const renderFacultyCard = (faculty) => {
        return (
            <div key={faculty._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {faculty.personalInfo.firstName} {faculty.personalInfo.lastName}
                        </h3>
                        <p className="text-gray-600">{faculty.employmentDetails.designation}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(faculty)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => handleDelete(faculty._id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm">{faculty.personalInfo.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm">{faculty.personalInfo.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-sm">{faculty.employmentDetails.department?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="text-sm">
                            {faculty.academicInfo?.experience ? 
                                `${faculty.academicInfo.experience.teaching || 0} years teaching` : 
                                'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-2 py-1 text-xs rounded ${
                            faculty.employmentDetails.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {faculty.employmentDetails.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Joined</p>
                        <p className="text-sm">
                            {faculty.employmentDetails.joiningDate ? 
                                new Date(faculty.employmentDetails.joiningDate).toLocaleDateString() : 
                                'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-lg font-semibold">Faculty Management</h2>
                        <p className="text-sm text-gray-500">Manage faculty members and their information</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="min-w-[200px]">
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={selectedDept?._id || ''}
                                onChange={(e) => {
                                    const dept = departments.find(d => d._id === e.target.value);
                                    setSelectedDept(dept);
                                }}
                                disabled={departmentsLoading}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedDept && (
                            <button
                                onClick={() => {
                                    setEditingFaculty(null);
                                    setShowFacultyModal(true);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Add Faculty
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {selectedDept ? (
                    <>
                        <FacultyAnalytics faculty={faculty} />
                        <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {faculty.map(renderFacultyCard)}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <i className="bi bi-person-workspace text-4xl text-gray-400"></i>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No Department Selected</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Please select a department to view and manage faculty members.
                        </p>
                    </div>
                )}
            </div>

            {showFacultyModal && (
                <FacultyModal
                    faculty={editingFaculty}
                    onClose={() => {
                        setShowFacultyModal(false);
                        setEditingFaculty(null);
                        resetFormData();
                    }}
                    onSave={handleSubmit}
                    formData={facultyFormData}
                    setFormData={setFacultyFormData}
                    loading={loading}
                />
            )}
        </div>
    );
}

export default Faculty; 