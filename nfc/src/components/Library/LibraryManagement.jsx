import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import {
    FaBook,
    FaExchangeAlt,
    FaChartBar,
} from 'react-icons/fa';

import BookList from './Books/BookList';
import LoanList from './Loans/LoanList';
import LibraryAnalytics from './Analytics/LibraryAnalytics';
import AddBook from './Books/AddBook';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const LibraryManagement = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [showAddBook, setShowAddBook] = useState(false);

    const tabs = [
        { name: 'Books', icon: FaBook, component: BookList },
        { name: 'Loans', icon: FaExchangeAlt, component: LoanList },
        { name: 'Analytics', icon: FaChartBar, component: LibraryAnalytics },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Library Management</h1>
                <button
                    onClick={() => setShowAddBook(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Add New Book
                </button>
            </div>

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white text-blue-700 shadow'
                                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                )
                            }
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <tab.icon className="h-5 w-5" />
                                <span>{tab.name}</span>
                            </div>
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels className="mt-4">
                    {tabs.map((tab, idx) => (
                        <Tab.Panel key={idx}>
                            <tab.component />
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>

            {/* Add Book Modal */}
            {showAddBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <AddBook onClose={() => setShowAddBook(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryManagement; 