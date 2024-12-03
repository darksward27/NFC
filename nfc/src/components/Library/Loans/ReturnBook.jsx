import React from 'react';

const ReturnBook = ({ loanId, onReturn }) => {
    const handleReturn = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/book-loans/${loanId}/return`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to return book');
            onReturn();
        } catch (error) {
            console.error('Error returning book:', error);
        }
    };

    return (
        <button
            onClick={handleReturn}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
            Return Book
        </button>
    );
};

export default ReturnBook; 