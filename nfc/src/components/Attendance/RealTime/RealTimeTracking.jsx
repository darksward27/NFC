import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa';

const RealTimeTracking = () => {
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats] = useState({
        present: 0,
        late: 0,
        absent: 0
    });

    useEffect(() => {
        // Connect to WebSocket for real-time updates
        const ws = new WebSocket('ws://localhost:3000/ws/attendance-tracking');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'activity') {
                setRecentActivity(prev => [data, ...prev].slice(0, 10));
            } else if (data.type === 'stats') {
                setStats(data.stats);
            }
        };

        return () => ws.close();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <FaUserCheck className="text-green-500" />;
            case 'late':
                return <FaUserClock className="text-yellow-500" />;
            case 'absent':
                return <FaUserTimes className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <motion.div 
                className="bg-white rounded-lg shadow-lg p-6"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Present</p>
                        <motion.h3 
                            className="text-2xl font-bold text-green-600"
                            animate={{ scale: [1, 1.1, 1] }}
                        >
                            {stats.present}
                        </motion.h3>
                    </div>
                    <FaUserCheck className="text-3xl text-green-500" />
                </div>
            </motion.div>
            {/* Similar cards for Late and Absent */}

            {/* Recent Activity Feed */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Real-time Activity</h3>
                <div className="space-y-4">
                    <AnimatePresence>
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    {getStatusIcon(activity.status)}
                                    <div>
                                        <p className="font-medium">{activity.userName}</p>
                                        <p className="text-sm text-gray-600">
                                            {activity.department}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(activity.timestamp), 'HH:mm:ss')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {activity.location}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default RealTimeTracking; 