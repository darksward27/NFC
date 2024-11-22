import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, ShieldCheck, Wifi, Shield, Database, UserPlus, Users, BookOpen, GraduationCap, Building2 } from 'lucide-react';

const App = () => {
  const [readings, setReadings] = useState([]);
  const [lastReading, setLastReading] = useState(null);
  const [status, setStatus] = useState({
    server: false,
    encryption: false,
    nfc: false,
    wifi: false
  });
  const [cardholders, setCardholders] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  // College departments
  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Business Administration',
    'Faculty',
    'Staff'
  ];

  // Card types and their access levels
  const cardTypes = [
    { type: 'Student', accessLevel: 1 },
    { type: 'Faculty', accessLevel: 2 },
    { type: 'Staff', accessLevel: 1 },
    { type: 'Administrator', accessLevel: 3 },
    { type: 'Guest', accessLevel: 0 }
  ];

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      setStatus(prev => ({ ...prev, server: true }));
      // Request initial data
      ws.send(JSON.stringify({ type: 'getCardholders' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
          case 'status':
            setStatus(prev => ({ ...prev, ...data.status }));
            break;
          
          case 'nfcData':
            handleNFCData(data);
            break;
          
          case 'cardholders':
            setCardholders(data.cardholders);
            break;
          
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    return () => ws.close();
  }, []);

  const handleNFCData = (data) => {
    const newReading = {
      ...data,
      timestamp: new Date(data.timestamp).toLocaleTimeString()
    };
    
    setLastReading(newReading);
    setReadings(prev => [...prev.slice(-19), newReading]);
  };

  const handleAddCardholder = (formData) => {
    // Send new cardholder data to server
    const ws = new WebSocket('ws://localhost:3000');
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'addCardholder',
        data: formData
      }));
    };
    setShowAddModal(false);
  };

  const handleCardAction = (action, cardId) => {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'cardAction',
        action,
        cardId
      }));
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">College NFC Management System</h1>
              <p className="text-gray-500">Access Control and Attendance Management</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add New Card
              </button>
              <button
                onClick={() => setShowManageModal(true)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Users size={20} />
                Manage Cards
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatusCard 
            title="System Status" 
            active={status.server}
            icon={<Database className={status.server ? "text-green-500" : "text-red-500"} />}
          />
          <StatusCard 
            title="Security" 
            active={status.encryption}
            icon={<ShieldCheck className={status.encryption ? "text-green-500" : "text-red-500"} />}
          />
          <StatusCard 
            title="NFC Reader" 
            active={status.nfc}
            icon={<Shield className={status.nfc ? "text-green-500" : "text-red-500"} />}
          />
          <StatusCard 
            title="Network" 
            active={status.wifi}
            icon={<Wifi className={status.wifi ? "text-green-500" : "text-red-500"} />}
          />
        </div>

        {/* Latest Access */}
        {lastReading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Latest Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600">Card Holder</p>
                <p className="text-lg font-semibold">{lastReading.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Department</p>
                <p className="text-lg">{lastReading.department}</p>
              </div>
              <div>
                <p className="text-gray-600">Access Point</p>
                <p className="text-lg">{lastReading.location || 'Main Entrance'}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="text-lg">{lastReading.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Department Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Access Records</h2>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings
                  .filter(reading => selectedDepartment === 'all' || reading.department === selectedDepartment)
                  .map((reading, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reading.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.location || 'Main Entrance'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Authorized
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <AddCardModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCardholder}
          departments={departments}
          cardTypes={cardTypes}
        />
      )}

      {/* Manage Cards Modal */}
      {showManageModal && (
        <ManageCardsModal
          onClose={() => setShowManageModal(false)}
          cardholders={cardholders}
          onAction={handleCardAction}
          departments={departments}
        />
      )}
    </div>
  );
};

const StatusCard = ({ title, active, icon }) => (
  <div className={`p-4 rounded-lg border ${active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
    <div className="flex items-center">
      {icon}
      <div className="ml-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className={`text-xs ${active ? 'text-green-700' : 'text-red-700'}`}>
          {active ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  </div>
);

const AddCardModal = ({ onClose, onSubmit, departments, cardTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: departments[0],
    type: cardTypes[0].type,
    id: '',
    email: '',
    validUntil: ''
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Card</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Card Type</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {cardTypes.map(type => (
                <option key={type.type} value={type.type}>{type.type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Number</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Until</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>
          {/* Previous code remains the same until the AddCardModal's last input field */}
          
          <div className="mt-6 flex justify-end gap-4">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              onClick={() => onSubmit(formData)}
            >
              Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageCardsModal = ({ onClose, cardholders, onAction, departments }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredCardholders = cardholders.filter(card => {
    const matchesFilter = filter === 'all' || card.department === filter;
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase()) ||
                         card.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Cards</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCardholders.map((card, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{card.name}</div>
                    <div className="text-sm text-gray-500">{card.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {card.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {card.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {card.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${card.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {card.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAction('edit', card.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onAction(card.active ? 'deactivate' : 'activate', card.id)}
                        className={`${card.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {card.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => onAction('delete', card.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Mount the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);