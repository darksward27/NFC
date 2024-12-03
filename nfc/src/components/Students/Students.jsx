import React, { useState, useEffect } from 'react';
import StudentAnalytics from './StudentAnalytics';

const getAttendanceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'present':
            return 'bg-green-100 text-green-800';
        case 'absent':
            return 'bg-red-100 text-red-800';
        case 'late':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function Students({ organizationId }) {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentFormData, setStudentFormData] = useState({
        holderName: '',
        email: '',
        phone: '',
        type: 'student',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true,
        studentInfo: {
            rollNumber: '',
            semester: 1,
            branch: '',
            section: '',
            batch: new Date().getFullYear().toString(),
            admissionYear: new Date().getFullYear(),
            guardianName: '',
            guardianPhone: '',
            bloodGroup: '',
            address: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            },
            academicDetails: {
                cgpa: 0,
                attendance: 0,
                subjects: []
            },
            nfcCard: {
                cardNumber: '',
                issueDate: new Date().toISOString().split('T')[0],
                lastReplaced: null,
                status: 'active'
            },
            attendance: {
                lastTapIn: null,
                lastTapOut: null,
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                status: 'absent',
                history: []
            },
            library: {
                membershipId: '',
                booksIssued: [],
                finesPending: 0
            },
            fees: {
                totalAmount: 0,
                paidAmount: 0,
                pendingAmount: 0,
                lastPaymentDate: null,
                payments: []
            }
        }
    });

    useEffect(() => {
        fetchDepartments();
    }, [organizationId]);

    useEffect(() => {
        if (selectedDept) {
            fetchStudents();
        }
    }, [selectedDept]);

    const fetchDepartments = async () => {
        setDepartmentsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/departments?organizationId=${organizationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await response.json();
            setDepartments(data);
            setDepartmentsLoading(false);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to load departments');
            setDepartmentsLoading(false);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/cards?departmentId=${selectedDept._id}&type=student`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setStudentFormData({
            holderName: student.holderName,
            email: student.email,
            phone: student.phone,
            type: 'student',
            validFrom: new Date(student.validFrom).toISOString().split('T')[0],
            validUntil: new Date(student.validUntil).toISOString().split('T')[0],
            active: student.active,
            studentInfo: student.studentInfo
        });
        setShowStudentModal(true);
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/cards/${studentId}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete student');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingStudent ? 'PUT' : 'POST';
            const url = editingStudent 
                ? `http://localhost:3000/api/cards/${editingStudent.id}`
                : 'http://localhost:3000/api/cards';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...studentFormData,
                    departmentId: selectedDept._id,
                    organizationId: selectedDept.organizationId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save student');
            }

            const updatedStudent = await response.json();
            setStudents(prevStudents => {
                if (editingStudent) {
                    return prevStudents.map(student => 
                        student.id === updatedStudent.id ? updatedStudent : student
                    );
                } else {
                    return [...prevStudents, updatedStudent];
                }
            });
            setShowStudentModal(false);
        } catch (error) {
            console.error('Error saving student:', error);
            alert('Failed to save student');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-lg font-semibold">Students</h2>
                        <p className="text-sm text-gray-500">Manage student records</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Department
                            </label>
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
                                    setEditingStudent(null);
                                    setStudentFormData({
                                        holderName: '',
                                        email: '',
                                        phone: '',
                                        type: 'student',
                                        departmentId: selectedDept._id,
                                        validFrom: new Date().toISOString().split('T')[0],
                                        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                        active: true,
                                        studentInfo: {
                                            rollNumber: '',
                                            semester: 1,
                                            branch: selectedDept.name,
                                            section: '',
                                            batch: new Date().getFullYear().toString(),
                                            admissionYear: new Date().getFullYear(),
                                            guardianName: '',
                                            guardianPhone: '',
                                            bloodGroup: '',
                                            address: {
                                                street: '',
                                                city: '',
                                                state: '',
                                                pincode: '',
                                                country: 'India'
                                            }
                                        }
                                    });
                                    setShowStudentModal(true);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
                            >
                                Add Student
                            </button>
                        )}
                    </div>
                </div>

                {selectedDept && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900">{selectedDept.name}</h3>
                                <p className="text-sm text-gray-500">{selectedDept.description}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                selectedDept.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {selectedDept.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6">
                {departmentsLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : !selectedDept ? (
                    <div className="text-center py-12">
                        <i className="bi bi-diagram-3 text-4xl text-gray-400"></i>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No Department Selected</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Please select a department to view and manage students.
                        </p>
                    </div>
                ) : (
                    <>
                        <StudentAnalytics students={students} />
                        <div className="mt-6">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map(student => (
                                        <div key={student.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{student.holderName}</h3>
                                                        <p className="text-sm text-gray-500">{student.studentInfo?.rollNumber || 'No Roll Number'}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditStudent(student)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStudent(student.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex space-x-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {student.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            getAttendanceStatusColor(student.studentInfo?.attendance?.status)
                                                        }`}>
                                                            {student.studentInfo?.attendance?.status || 'No Status'}
                                                        </span>
                                                    </div>
                                                    {student.studentInfo?.nfcCard?.cardNumber && (
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">NFC Card:</span> {student.studentInfo.nfcCard.cardNumber}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Semester:</span> {student.studentInfo?.semester || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showStudentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingStudent ? 'Edit Student' : 'Add Student'}
                        </h2>
                        <form onSubmit={handleStudentSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={studentFormData.holderName}
                                            onChange={(e) => setStudentFormData({ 
                                                ...studentFormData, 
                                                holderName: e.target.value 
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                                        <input
                                            type="text"
                                            value={studentFormData.studentInfo.rollNumber}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    rollNumber: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Academic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Semester</label>
                                        <select
                                            value={studentFormData.studentInfo.semester}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    semester: parseInt(e.target.value)
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {[1,2,3,4,5,6,7,8].map(sem => (
                                                <option key={sem} value={sem}>Semester {sem}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Branch</label>
                                        <input
                                            type="text"
                                            value={studentFormData.studentInfo.branch}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    branch: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Section</label>
                                        <input
                                            type="text"
                                            value={studentFormData.studentInfo.section}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    section: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={studentFormData.email}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                email: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="tel"
                                            value={studentFormData.phone}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                phone: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">Guardian Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                                        <input
                                            type="text"
                                            value={studentFormData.studentInfo.guardianName}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    guardianName: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
                                        <input
                                            type="tel"
                                            value={studentFormData.studentInfo.guardianPhone}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    guardianPhone: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* NFC Card Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-4">NFC Card Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">NFC Card Number</label>
                                        <input
                                            type="text"
                                            value={studentFormData.studentInfo.nfcCard.cardNumber}
                                            onChange={(e) => setStudentFormData({
                                                ...studentFormData,
                                                studentInfo: {
                                                    ...studentFormData.studentInfo,
                                                    nfcCard: {
                                                        ...studentFormData.studentInfo.nfcCard,
                                                        cardNumber: e.target.value
                                                    }
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <div className="mt-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={studentFormData.active}
                                                    onChange={(e) => setStudentFormData({
                                                        ...studentFormData,
                                                        active: e.target.checked
                                                    })}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Active</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowStudentModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    {editingStudent ? 'Save Changes' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students; 