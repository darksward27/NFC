import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaQrcode } from 'react-icons/fa';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        Promise.all([fetchBooks(), fetchDepartments()]);
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/books');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            const data = await response.json();
            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to load books. Please try again.');
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/departments');
            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleDelete = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete book');
            setBooks(books.filter(book => book._id !== bookId));
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || book.departmentId === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    if (error) return (
        <div className="text-red-500 text-center p-4">
            {error}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search books..."
                    className="flex-1 p-2 border rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="p-2 border rounded-md"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Books Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredBooks.map((book) => (
                            <tr key={book._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{book.isbn}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {departments.find(dept => dept._id === book.departmentId)?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${book.status === 'available' ? 'bg-green-100 text-green-800' : 
                                          book.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{book.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(book._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button className="text-green-600 hover:text-green-900">
                                            <FaQrcode />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookList; 