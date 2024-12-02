import React, { useState, useEffect } from 'react';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyModal from './FacultyModal';

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
                pincode: '',
                country: 'India'
            }
        },
        employmentDetails: {
            employeeId: '',
            designation: '',
            department: '',
            organizationId: organizationId,
            joiningDate: new Date().toISOString().split('T')[0],
            status: 'active',
            employmentType: 'full-time'
        },
        academicInfo: {
            qualification: [],
            specialization: [],
            experience: {
                teaching: 0,
                industry: 0,
                research: 0
            },
            subjects: []
        },
        nfcCard: {
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

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/faculty?departmentId=${selectedDept._id}`);
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

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            const url = editingFaculty 
                ? `http://localhost:5000/api/faculty/${editingFaculty._id}`
                : 'http://localhost:5000/api/faculty';

            const response = await fetch(url, {
                method: editingFaculty ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    organizationId,
                    departmentId: selectedDept?._id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save faculty');
            }

            const savedFaculty = await response.json();

            // Update the faculty list
            setFaculty(prev => {
                if (editingFaculty) {
                    return prev.map(f => f._id === savedFaculty._id ? savedFaculty : f);
                }
                return [...prev, savedFaculty];
            });

            // Reset form and close modal
            setShowFacultyModal(false);
            setEditingFaculty(null);
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
                    qualification: [],
                    specialization: [],
                    experience: {
                        teaching: 0,
                        industry: 0,
                        research: 0
                    }
                },
                employmentDetails: {
                    employeeId: '',
                    designation: '',
                    joiningDate: '',
                    status: 'active'
                }
            });

        } catch (error) {
            setError(error.message || 'Failed to save faculty member');
            console.error('Error saving faculty:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFaculty = async () => {
            if (selectedDept) {
                try {
                    setLoading(true);
                    const response = await fetch(
                        `http://localhost:5000/api/faculty?departmentId=${selectedDept._id}`,
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

    const handleDelete = async (facultyId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/faculty/${facultyId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete faculty member');
            }

            setFaculty(prev => prev.filter(f => f._id !== facultyId));
        } catch (error) {
            setError(error.message);
            console.error('Error deleting faculty:', error);
        }
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
                {selectedDept ? (
                    <>
                        <FacultyAnalytics faculty={faculty} />
                        <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {faculty.map(member => (
                                    <div key={member._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {member.personalInfo.firstName} {member.personalInfo.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {member.employmentDetails.designation}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingFaculty(member);
                                                            setFacultyFormData(member);
                                                            setShowFacultyModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex space-x-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        member.employmentDetails.status === 'active' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {member.employmentDetails.status}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {member.employmentDetails.employmentType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Email:</span> {member.personalInfo.email}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Employee ID:</span> {member.employmentDetails.employeeId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                    }}
                    onSave={handleSubmit}
                    formData={facultyFormData}
                    setFormData={setFacultyFormData}
                />
            )}
        </div>
    );
}

export default Faculty; 