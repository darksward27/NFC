import React from 'react';

function TopNav({ setShowSidebar, onLogout }) {
    return (
        <nav className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center">
                <button onClick={() => setShowSidebar(prev => !prev)} className="md:hidden">
                    <i className="bi bi-list text-2xl"></i>
                </button>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>

                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default TopNav; 