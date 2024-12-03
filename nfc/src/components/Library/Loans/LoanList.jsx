import React, { useState, useEffect } from 'react';
import { FaUndo } from 'react-icons/fa';

const LoanList = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/book-loans');
            if (!response.ok) {
                throw new Error('Failed to fetch book loans');
            }
            const data = await response.json();
            setLoans(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching loans:', error);
            setError('Failed to load book loans. Please try again.');
            setLoading(false);
        }
    };

    const handleReturn = async (loanId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/book-loans/${loanId}/return`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to return book');
            setLoans(loans.map(loan => loan._id === loanId ? { ...loan, status: 'returned', returnTime: new Date() } : loan));
        } catch (error) {
            console.error('Error returning book:', error);
        }
    };

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
            <h2 className="text-xl font-bold mb-4">Book Loans</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loans.map((loan) => (
                            <tr key={loan._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{loan.bookId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{loan.cardId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(loan.checkoutTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(loan.dueDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${loan.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                        {loan.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {loan.status === 'active' && (
                                        <button 
                                            onClick={() => handleReturn(loan._id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FaUndo />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanList; 