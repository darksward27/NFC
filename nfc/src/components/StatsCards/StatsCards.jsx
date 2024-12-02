import React from 'react';

function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map(stat => (
                <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-full ${stat.iconBg}`}>
                            <i className={`${stat.icon} text-xl`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsCards; 