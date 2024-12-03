import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const LibraryAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        booksByStatus: {
            available: 0,
            borrowed: 0,
            maintenance: 0
        },
        loansByMonth: [],
        popularBooks: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch books
            const booksResponse = await fetch('http://localhost:3000/api/books');
            if (!booksResponse.ok) throw new Error('Failed to fetch books');
            const books = await booksResponse.json();

            // Calculate book status counts
            const booksByStatus = books.reduce((acc, book) => {
                acc[book.status] = (acc[book.status] || 0) + 1;
                return acc;
            }, { available: 0, borrowed: 0, maintenance: 0 });

            // Fetch book loans
            const loansResponse = await fetch('http://localhost:3000/api/book-loans');
            if (!loansResponse.ok) throw new Error('Failed to fetch book loans');
            const loans = await loansResponse.json();

            // Calculate loans by month
            const loansByMonth = loans.reduce((acc, loan) => {
                const date = new Date(loan.checkoutTime);
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

            // Calculate popular books
            const bookLoanCounts = loans.reduce((acc, loan) => {
                acc[loan.bookId] = (acc[loan.bookId] || 0) + 1;
                return acc;
            }, {});

            const popularBooks = Object.entries(bookLoanCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([bookId, loanCount]) => {
                    const book = books.find(b => b.id === bookId);
                    return { title: book?.title || 'Unknown', author: book?.author || 'Unknown', loanCount };
                });

            setAnalytics({
                booksByStatus,
                loansByMonth: Object.entries(loansByMonth).map(([month, count]) => ({ month, count })),
                popularBooks
            });
        } catch (error) {
            console.error('Error fetching library analytics:', error);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
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

    const bookStatusData = {
        labels: ['Available', 'Borrowed', 'Maintenance'],
        datasets: [{
            data: [
                analytics.booksByStatus.available || 0,
                analytics.booksByStatus.borrowed || 0,
                analytics.booksByStatus.maintenance || 0
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ]
        }]
    };

    const loansTrendData = {
        labels: analytics.loansByMonth.map(item => item.month),
        datasets: [{
            label: 'Number of Loans',
            data: analytics.loansByMonth.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Library Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Book Status Distribution</h3>
                    <div className="h-64">
                        <Pie data={bookStatusData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Monthly Loans Trend */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Monthly Loans Trend</h3>
                    <div className="h-64">
                        <Bar 
                            data={loansTrendData} 
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>

                {/* Popular Books */}
                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Most Popular Books</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Times Borrowed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {analytics.popularBooks.map((book, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.loanCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryAnalytics; 