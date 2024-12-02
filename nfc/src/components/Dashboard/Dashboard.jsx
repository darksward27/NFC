import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopNav from '../TopNav';
import StatsCards from '../StatsCards';
import AccessLogsTable from '../AccessLogsTable';
import Charts from '../Charts';
import Departments from '../Departments';
import Cards from '../Cards';
import { DepartmentModal, CardModal } from '../Modals';
import Students from '../Students';

function Dashboard({ organizationId, onLogout }) {
    // State Management
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [departments, setDepartments] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [stats, setStats] = useState([
        { label: 'Total Access Today', value: '0', icon: 'bi-door-open', iconBg: 'bg-blue-100 text-blue-500' },
        { label: 'Authorized Access', value: '0', icon: 'bi-check-circle', iconBg: 'bg-green-100 text-green-500' },
        { label: 'Unauthorized Attempts', value: '0', icon: 'bi-x-circle', iconBg: 'bg-red-100 text-red-500' },
        { label: 'Active Cards', value: '0', icon: 'bi-credit-card', iconBg: 'bg-purple-100 text-purple-500' }
    ]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [devicesData, setDevicesData] = useState([]);

    // Modal States
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [editingCard, setEditingCard] = useState(null);

    // Form Data States
    const [deptFormData, setDeptFormData] = useState({
        name: '',
        description: '',
        location: '',
        active: true
    });

    const [cardFormData, setCardFormData] = useState({
        id: '',
        holderName: '',
        type: 'student',
        email: '',
        phone: '',
        validFrom: '',
        validUntil: '',
        active: true
    });

    // Add debug logs
    useEffect(() => {
        console.log('Active Menu:', activeMenu);
        console.log('Selected Department:', selectedDept);
    }, [activeMenu, selectedDept]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch departments
                const deptResponse = await fetch(`http://localhost:3000/api/departments?organizationId=${organizationId}`);
                const deptData = await deptResponse.json();
                setDepartments(deptData);

                // Fetch access stats
                const statsResponse = await fetch(`http://localhost:3000/api/access-stats?organizationId=${organizationId}`);
                const statsData = await statsResponse.json();
                
                // Update stats with actual data
                setStats(prevStats => [
                    { ...prevStats[0], value: statsData.totalToday || '0' },
                    { ...prevStats[1], value: statsData.authorized || '0' },
                    { ...prevStats[2], value: statsData.unauthorized || '0' },
                    { ...prevStats[3], value: statsData.activeCards || '0' }
                ]);

                // Fetch access logs
                const logsResponse = await fetch(`http://localhost:3000/api/access-logs?organizationId=${organizationId}`);
                const logsData = await logsResponse.json();
                setAccessLogs(logsData);

                // Set chart data
                setDailyData(statsData.dailyData || []);
                setDevicesData(statsData.devicesData || []);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (organizationId) {
            fetchData();
        }
    }, [organizationId]);

    // Fetch cards when department is selected
    useEffect(() => {
        const fetchCards = async () => {
            if (selectedDept) {
                try {
                    const response = await fetch(`http://localhost:3000/api/cards?departmentId=${selectedDept._id}`);
                    const data = await response.json();
                    setCards(data);
                } catch (error) {
                    console.error('Error fetching cards:', error);
                }
            }
        };

        fetchCards();
    }, [selectedDept]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleDepartmentUpdate = (updatedDept) => {
        if (updatedDept._id) {
            setDepartments(prevDepts => 
                prevDepts.map(dept => 
                    dept._id === updatedDept._id ? updatedDept : dept
                )
            );
        } else {
            setDepartments(prevDepts => [...prevDepts, updatedDept]);
        }
    };

    const handleDeleteDepartment = (deptId) => {
        setDepartments(prevDepts => prevDepts.filter(dept => dept._id !== deptId));
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar 
                    activeMenu={activeMenu} 
                    setActiveMenu={setActiveMenu} 
                    showSidebar={showSidebar} 
                />

                <main className="flex-1">
                    <TopNav setShowSidebar={setShowSidebar} onLogout={onLogout} />

                    <div className="p-6">
                        {activeMenu === 'dashboard' && (
                            <>
                                <StatsCards stats={stats} />
                                <AccessLogsTable accessLogs={accessLogs} formatDate={formatDate} />
                                <Charts dailyData={dailyData} devicesData={devicesData} />
                            </>
                        )}

                        {activeMenu === 'departments' && (
                            <Departments
                                departments={departments}
                                selectedDept={selectedDept}
                                setSelectedDept={setSelectedDept}
                                setShowDeptModal={setShowDeptModal}
                                setEditingDept={setEditingDept}
                                setDeptFormData={setDeptFormData}
                                organizationId={organizationId}
                                onDeleteDepartment={handleDeleteDepartment}
                            />
                        )}

                        {activeMenu === 'students' && (
                            <Students organizationId={organizationId} />
                        )}

                        {activeMenu === 'cards' && selectedDept && (
                            <Cards
                                cards={cards}
                                selectedDept={selectedDept}
                                setEditingCard={setEditingCard}
                                setCardFormData={setCardFormData}
                                setShowCardModal={setShowCardModal}
                                formatDate={formatDate}
                            />
                        )}
                    </div>
                </main>
            </div>

            <DepartmentModal
                showDeptModal={showDeptModal}
                setShowDeptModal={setShowDeptModal}
                editingDept={editingDept}
                deptFormData={deptFormData}
                setDeptFormData={setDeptFormData}
                organizationId={organizationId}
                onDepartmentUpdate={handleDepartmentUpdate}
            />

            <CardModal
                showCardModal={showCardModal}
                setShowCardModal={setShowCardModal}
                editingCard={editingCard}
                cardFormData={cardFormData}
                setCardFormData={setCardFormData}
                departmentId={selectedDept?._id}
            />
        </div>
    );
}

export default Dashboard;