import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
    FaUserGraduate, 
    FaChalkboardTeacher, 
    FaUserTie, 
    FaChartBar, 
    FaClock, 
    FaCalendarAlt, 
    FaCog 
} from 'react-icons/fa';

import StudentAttendance from './StudentAttendance';
import FacultyAttendance from './FacultyAttendance';
import StaffAttendance from './StaffAttendance';
import AttendanceAnalytics from './Analytics/AttendanceAnalytics';
import RealTimeTracking from './RealTime/RealTimeTracking';
import HolidayCalendar from './HolidayCalendar/HolidayCalendar';
import AttendanceSettings from './Settings/AttendanceSettings';
import BulkAttendanceUpload from './BulkAttendanceUpload';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const AttendanceManagement = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const tabs = [
        { name: 'Student Attendance', icon: FaUserGraduate, component: StudentAttendance },
        { name: 'Faculty Attendance', icon: FaChalkboardTeacher, component: FacultyAttendance },
        { name: 'Staff Attendance', icon: FaUserTie, component: StaffAttendance },
        { name: 'Analytics', icon: FaChartBar, component: AttendanceAnalytics },
        { name: 'Real-time Tracking', icon: FaClock, component: RealTimeTracking },
        { name: 'Holiday Calendar', icon: FaCalendarAlt, component: HolidayCalendar },
        { name: 'Settings', icon: FaCog, component: AttendanceSettings }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
                <button
                    onClick={() => setShowBulkUpload(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Bulk Upload
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

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BulkAttendanceUpload onClose={() => setShowBulkUpload(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement; 