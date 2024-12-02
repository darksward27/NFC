import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import TopNav from '../TopNav/TopNav';
import StatsCards from '../StatsCards/StatsCards';
import AccessLogsTable from '../AccessLogsTable/AccessLogsTable';
import Charts from '../Charts/Charts';
import Organizations from '../Organizations/Organizations';
import Departments from '../Departments/Departments';
import Cards from '../Cards/Cards';
import { OrganizationModal, DepartmentModal, CardModal } from '../Modals/Modals';
import { organizationsApi, departmentsApi, cardsApi, accessLogsApi } from '../../services/api';
import { wsClient } from '../../utils/websocket';

function Dashboard() {
    // State Management
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [organizations, setOrganizations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [stats, setStats] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [devicesData, setDevicesData] = useState([]);

    // Modal States
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [editingDept, setEditingDept] = useState(null);
    const [editingCard, setEditingCard] = useState(null);

    // Form Data States
    const [orgFormData, setOrgFormData] = useState({
        name: '',
        type: 'university',
        address: '',
        contactEmail: '',
        contactPhone: '',
        active: true
    });

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

    // WebSocket Event Handlers
    useEffect(() => {
        wsClient.connect();
        const unsubscribe = wsClient.subscribe((data) => {
            switch (data.type) {
                case 'accessStats':
                    updateStats(data.stats);
                    break;
                case 'accessLogs':
                    setAccessLogs(data.logs);
                    break;
                case 'registrationApproved':
                case 'registrationRejected':
                    fetchPendingRegistrations();
                    break;
            }
        });

        return () => unsubscribe();
    }, []);

    // Initial Data Fetching
    useEffect(() => {
        fetchOrganizations();
        fetchAccessLogs();
        fetchAccessStats();
    }, []);

    // Fetch Organizations
    async function fetchOrganizations() {
        try {
            const data = await organizationsApi.getAll();
            setOrganizations(data);
        } catch (error) {
            console.error('Error fetching organizations:', error);
        }
    }

    // Fetch Departments when Organization is selected
    useEffect(() => {
        if (selectedOrg) {
            fetchDepartments(selectedOrg._id);
        }
    }, [selectedOrg]);

    // Fetch Cards when Department is selected
    useEffect(() => {
        if (selectedDept) {
            fetchCards(selectedDept._id);
        }
    }, [selectedDept]);

    // API Calls
    async function fetchDepartments(orgId) {
        try {
            const response = await departmentsApi.getAll(orgId);
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    async function fetchCards(deptId) {
        try {
            const response = await cardsApi.getAll(deptId);
            const data = await response.json();
            setCards(data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    async function fetchAccessLogs() {
        try {
            const response = await accessLogsApi.getAll();
            const data = await response.json();
            setAccessLogs(data);
        } catch (error) {
            console.error('Error fetching access logs:', error);
        }
    }

    async function fetchAccessStats() {
        try {
            const response = await accessLogsApi.getStats();
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching access stats:', error);
        }
    }

    // Form Handlers
    async function handleOrgSubmit(e) {
        e.preventDefault();
        try {
            const url = editingOrg ? `/api/organizations/${editingOrg._id}` : '/api/organizations';
            const method = editingOrg ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orgFormData)
            });

            if (response.ok) {
                await fetchOrganizations();
                setShowOrgModal(false);
                setEditingOrg(null);
                setOrgFormData({
                    name: '',
                    type: 'university',
                    address: '',
                    contactEmail: '',
                    contactPhone: '',
                    active: true
                });
            }
        } catch (error) {
            console.error('Error saving organization:', error);
        }
    }

    async function handleDeptSubmit(e) {
        e.preventDefault();
        try {
            const url = editingDept ? `/api/departments/${editingDept._id}` : '/api/departments';
            const method = editingDept ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...deptFormData, organizationId: selectedOrg._id })
            });

            if (response.ok) {
                await fetchDepartments(selectedOrg._id);
                setShowDeptModal(false);
                setEditingDept(null);
                setDeptFormData({
                    name: '',
                    description: '',
                    location: '',
                    active: true
                });
            }
        } catch (error) {
            console.error('Error saving department:', error);
        }
    }

    async function handleCardSubmit(e) {
        e.preventDefault();
        try {
            const url = editingCard ? `/api/cards/${editingCard._id}` : '/api/cards';
            const method = editingCard ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...cardFormData,
                    organizationId: selectedOrg._id,
                    departmentId: selectedDept._id
                })
            });

            if (response.ok) {
                await fetchCards(selectedDept._id);
                setShowCardModal(false);
                setEditingCard(null);
                setCardFormData({
                    id: '',
                    holderName: '',
                    type: 'student',
                    email: '',
                    phone: '',
                    validFrom: '',
                    validUntil: '',
                    active: true
                });
            }
        } catch (error) {
            console.error('Error saving card:', error);
        }
    }

    // Delete Handlers
    async function handleDeleteOrganization(orgId) {
        try {
            const response = await fetch(`/api/organizations/${orgId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchOrganizations();
                if (selectedOrg?._id === orgId) {
                    setSelectedOrg(null);
                    setSelectedDept(null);
                }
            }
        } catch (error) {
            console.error('Error deleting organization:', error);
        }
    }

    async function handleDeleteDepartment(deptId) {
        try {
            const response = await fetch(`/api/departments/${deptId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchDepartments(selectedOrg._id);
                if (selectedDept?._id === deptId) {
                    setSelectedDept(null);
                }
            }
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    }

    async function handleDeleteCard(cardId) {
        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchCards(selectedDept._id);
            }
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    }

    // Utility Functions
    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            )}

            <div className="flex">
                <Sidebar
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    showSidebar={showSidebar}
                />

                <main className="flex-1">
                    <TopNav setShowSidebar={setShowSidebar} />

                    <div className="p-6">
                        {activeMenu === 'dashboard' && (
                            <>
                                <StatsCards stats={stats} />
                                <AccessLogsTable
                                    accessLogs={accessLogs}
                                    formatDate={formatDate}
                                />
                                <Charts dailyData={dailyData} devicesData={devicesData} />
                            </>
                        )}

                        {activeMenu === 'organizations' && (
                            <>
                                <Organizations
                                    organizations={organizations}
                                    selectedOrg={selectedOrg}
                                    setSelectedOrg={setSelectedOrg}
                                    setShowOrgModal={setShowOrgModal}
                                    setEditingOrg={setEditingOrg}
                                    setOrgFormData={setOrgFormData}
                                    handleDeleteOrganization={handleDeleteOrganization}
                                />
                                {selectedOrg && (
                                    <Departments
                                        departments={departments}
                                        selectedOrg={selectedOrg}
                                        selectedDept={selectedDept}
                                        setSelectedDept={setSelectedDept}
                                        setShowDeptModal={setShowDeptModal}
                                        setEditingDept={setEditingDept}
                                        setDeptFormData={setDeptFormData}
                                        handleDeleteDepartment={handleDeleteDepartment}
                                    />
                                )}
                                {selectedDept && (
                                    <Cards
                                        cards={cards}
                                        selectedOrg={selectedOrg}
                                        selectedDept={selectedDept}
                                        setEditingCard={setEditingCard}
                                        setCardFormData={setCardFormData}
                                        setShowCardModal={setShowCardModal}
                                        handleDeleteCard={handleDeleteCard}
                                        formatDate={formatDate}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            <OrganizationModal
                showOrgModal={showOrgModal}
                setShowOrgModal={setShowOrgModal}
                editingOrg={editingOrg}
                orgFormData={orgFormData}
                setOrgFormData={setOrgFormData}
                handleOrgSubmit={handleOrgSubmit}
            />

            <DepartmentModal
                showDeptModal={showDeptModal}
                setShowDeptModal={setShowDeptModal}
                editingDept={editingDept}
                deptFormData={deptFormData}
                setDeptFormData={setDeptFormData}
                handleDeptSubmit={handleDeptSubmit}
            />

            <CardModal
                showCardModal={showCardModal}
                setShowCardModal={setShowCardModal}
                editingCard={editingCard}
                cardFormData={cardFormData}
                setCardFormData={setCardFormData}
                handleCardSubmit={handleCardSubmit}
            />
        </div>
    );
}

export default Dashboard;