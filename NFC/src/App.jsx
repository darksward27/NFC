import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Shield, Database, Activity, Wifi, UserPlus, Users, Calendar, UserCheck, Building2 } from 'lucide-react';
import { StatusCard } from './components/StatusCard';
import { AccessInfoCard } from './components/AccessInfoCard';
import { AddCardModal } from './components/AddCardModal';
import { ManageCardsModal } from './components/ManageCardsModal';
import { AccessLogsTable } from './components/AccessLogsTable';

const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Business Administration',
  'Faculty',
  'Staff'
];

const cardTypes = [
  { type: 'Student', accessLevel: 1 },
  { type: 'Faculty', accessLevel: 2 },
  { type: 'Staff', accessLevel: 1 },
  { type: 'Administrator', accessLevel: 3 },
  { type: 'Guest', accessLevel: 0 }
];

export default function App() {
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
  const wsRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus(prev => ({ ...prev, server: true }));
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
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onclose = () => {
        setStatus({
          server: false,
          nfc: false,
          wifi: false,
          encryption: false
        });
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'addCardholder',
        data: formData
      }));
    }
    setShowAddModal(false);
  };

  const handleCardAction = (action, cardId, updates) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cardAction',
        action,
        cardId,
        updates
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">College NFC System</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
              >
                <UserPlus size={20} />
                Add Card
              </button>
              <button
                onClick={() => setShowManageModal(true)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
              >
                <Users size={20} />
                Manage Cards
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard 
            title="System Status"
            value={status.server ? "Online" : "Offline"}
            icon={<Database size={24} />}
            color="blue"
            active={status.server}
          />
          <StatusCard 
            title="Security"
            value={status.encryption ? "Encrypted" : "Unsecured"}
            icon={<Shield size={24} />}
            color="green"
            active={status.encryption}
          />
          <StatusCard 
            title="NFC Reader"
            value={status.nfc ? "Connected" : "Disconnected"}
            icon={<Activity size={24} />}
            color="purple"
            active={status.nfc}
          />
          <StatusCard 
            title="Network"
            value={status.wifi ? "Connected" : "Disconnected"}
            icon={<Wifi size={24} />}
            color="indigo"
            active={status.wifi}
          />
        </div>

        {/* Latest Access */}
        {lastReading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Latest Access</h2>
              <Calendar className="text-gray-500" size={20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <AccessInfoCard
                title="Card Holder"
                value={lastReading.name}
                icon={<UserCheck size={20} />}
                subtext="Verified User"
              />
              <AccessInfoCard
                title="Department"
                value={lastReading.department}
                icon={<Building2 size={20} />}
                subtext="Academic Unit"
              />
              <AccessInfoCard
                title="Access Point"
                value={lastReading.location || 'Main Entrance'}
                icon={<Shield size={20} />}
                subtext="Entry Point"
              />
              <AccessInfoCard
                title="Time"
                value={lastReading.timestamp}
                icon={<Calendar size={20} />}
                subtext="Access Time"
              />
            </div>
          </div>
        )}

        {/* Access Logs */}
        <AccessLogsTable
          readings={readings}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={departments}
        />
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddCardModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCardholder}
          departments={departments}
          cardTypes={cardTypes}
        />
      )}

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
}