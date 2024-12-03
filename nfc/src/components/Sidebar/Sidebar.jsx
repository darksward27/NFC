import React from 'react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
    { id: 'departments', label: 'Departments', icon: 'bi-diagram-3' },
    { id: 'students', label: 'Students', icon: 'bi-person' },
    { id: 'faculty', label: 'Faculty', icon: 'bi-person-workspace' },
    { id: 'attendance', label: 'Attendance', icon: 'bi-calendar-check' },
    { id: 'library', label: 'Library', icon: 'bi-book' },
    { id: 'cards', label: 'Cards', icon: 'bi-credit-card' },
    { id: 'reports', label: 'Reports', icon: 'bi-file-text' },
    { id: 'settings', label: 'Settings', icon: 'bi-gear' },

];

function Sidebar({ activeMenu, setActiveMenu, showSidebar }) {
    return (
        <aside className={`bg-white w-64 min-h-screen shadow-lg transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center space-x-3">
                    <i className="bi bi-building text-2xl text-blue-600"></i>
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
            </div>

            <nav className="mt-6">
                {menuItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveMenu(item.id);
                        }}
                        className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors duration-200 ${activeMenu === item.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                    >
                        <i className={`${item.icon} text-lg mr-3 text-gray-600`}></i>
                        <span className="text-gray-700">{item.label}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar; 