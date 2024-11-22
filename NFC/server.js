import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createServer as createNetServer } from 'net';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Enable CORS
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Constants
const CARD_DATA_FILE = 'card_data.json';
const ACCESS_LOG_FILE = 'access_log.json';

// Store connected WebSocket clients
const clients = new Set();

// Track ESP32 status
let espStatus = {
    nfc: false,
    wifi: false,
    encryption: false
};

// Helper Functions
async function loadCardData() {
    try {
        const data = await fs.readFile(CARD_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default data if file doesn't exist
        return {
            cardholders: [
                {
                    id: "0xc97be5a2",
                    name: "John Doe",
                    department: "Computer Science",
                    type: "Student",
                    email: "john.doe@college.edu",
                    active: true,
                    validUntil: "2024-12-31",
                    created: "2024-01-01"
                }
            ]
        };
    }
}

async function saveCardData(data) {
    await fs.writeFile(CARD_DATA_FILE, JSON.stringify(data, null, 2));
}

async function logAccess(accessData) {
    try {
        let logs = [];
        try {
            const existingLogs = await fs.readFile(ACCESS_LOG_FILE, 'utf8');
            logs = JSON.parse(existingLogs);
        } catch (error) {
            // File doesn't exist or is invalid
        }

        logs.push({
            ...accessData,
            timestamp: new Date().toISOString()
        });

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }

        await fs.writeFile(ACCESS_LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Error logging access:', error);
    }
}

function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocketServer.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API Endpoints
app.get('/api/cardholders', async (req, res) => {
    try {
        const cardData = await loadCardData();
        res.json({ cardholders: cardData.cardholders });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching cardholders' });
    }
});

app.post('/api/cardholders', async (req, res) => {
    try {
        const cardData = await loadCardData();
        const newCardholder = {
            ...req.body,
            active: true,
            created: new Date().toISOString()
        };
        cardData.cardholders.push(newCardholder);
        await saveCardData(cardData);
        res.status(201).json(newCardholder);
    } catch (error) {
        res.status(500).json({ error: 'Error adding cardholder' });
    }
});

app.put('/api/cardholders/:id', async (req, res) => {
    try {
        const cardData = await loadCardData();
        const index = cardData.cardholders.findIndex(
            card => card.id === req.params.id
        );
        if (index !== -1) {
            cardData.cardholders[index] = {
                ...cardData.cardholders[index],
                ...req.body
            };
            await saveCardData(cardData);
            res.json(cardData.cardholders[index]);
        } else {
            res.status(404).json({ error: 'Cardholder not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating cardholder' });
    }
});

app.post('/api/cardholders/:id/:action', async (req, res) => {
    try {
        const cardData = await loadCardData();
        const index = cardData.cardholders.findIndex(
            card => card.id === req.params.id
        );
        if (index !== -1) {
            switch (req.params.action) {
                case 'activate':
                    cardData.cardholders[index].active = true;
                    break;
                case 'deactivate':
                    cardData.cardholders[index].active = false;
                    break;
                case 'delete':
                    cardData.cardholders.splice(index, 1);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
            await saveCardData(cardData);
            res.json(cardData.cardholders[index]);
        } else {
            res.status(404).json({ error: 'Cardholder not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error performing action on cardholder' });
    }
});

// WebSocket Server
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Web client connected');

    // Send initial status
    ws.send(JSON.stringify({
        type: 'status',
        status: {
            server: true,
            nfc: espStatus.nfc,
            wifi: espStatus.wifi,
            encryption: espStatus.encryption
        }
    }));

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'getCardholders':
                    const cardData = await loadCardData();
                    ws.send(JSON.stringify({
                        type: 'cardholders',
                        cardholders: cardData.cardholders
                    }));
                    break;

                case 'getAccessLogs':
                    try {
                        const logs = await fs.readFile(ACCESS_LOG_FILE, 'utf8');
                        ws.send(JSON.stringify({
                            type: 'accessLogs',
                            logs: JSON.parse(logs)
                        }));
                    } catch (error) {
                        ws.send(JSON.stringify({
                            type: 'accessLogs',
                            logs: []
                        }));
                    }
                    break;

                case 'sendNFCData':
                    await handleNFCData(data.uid, data.name, ws);
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Web client disconnected');
    });
});

// TCP Server for ESP32
const tcpServer = createNetServer((socket) => {
    console.log('ESP32 connected from:', socket.remoteAddress);

    // Update ESP32 connection status
    espStatus.nfc = true;
    espStatus.wifi = true;
    
    // Broadcast updated status
    broadcast({
        type: 'status',
        status: {
            server: true,
            nfc: espStatus.nfc,
            wifi: espStatus.wifi,
            encryption: espStatus.encryption
        }
    });

    socket.on('data', async (data) => {
        try {
            // Handle heartbeat
            if (data.toString() === 'HEARTBEAT') {
                socket.write('OK');
                return;
            }

            // Handle NFC data
            const [uid, name, timestamp] = data.toString().split(',');
            
            // Load card data to verify access
            const cardData = await loadCardData();
            const cardholder = cardData.cardholders.find(
                card => card.id === uid && card.active
            );

            // Check if card is expired
            const isExpired = cardholder && new Date(cardholder.validUntil) < new Date();

            const nfcData = {
                type: 'nfcData',
                uid,
                timestamp: parseInt(timestamp) * 1000,
                name: cardholder ? cardholder.name : name,
                department: cardholder ? cardholder.department : 'Unknown',
                authorized: Boolean(cardholder) && !isExpired,
                type: cardholder ? cardholder.type : 'Unknown',
                signal: -1 * (Math.random() * 30 + 50),
                location: 'Main Entrance'
            };

            // Log access attempt
            await logAccess({
                ...nfcData,
                ipAddress: socket.remoteAddress
            });

            broadcast(nfcData);
            
            if (!cardholder) {
                socket.write('UNAUTHORIZED');
            } else if (isExpired) {
                socket.write('EXPIRED');
            } else {
                socket.write('OK');
            }

        } catch (error) {
            console.error('Error processing data:', error);
            socket.write('ERROR');
        }
    });

    socket.on('close', () => {
        console.log('ESP32 disconnected');
        espStatus.nfc = false;
        espStatus.wifi = false;
        espStatus.encryption = false;
        
        broadcast({
            type: 'status',
            status: {
                server: true,
                nfc: espStatus.nfc,
                wifi: espStatus.wifi,
                encryption: espStatus.encryption
            }
        });
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Start servers on different ports
const WS_PORT = 3000;    // WebSocket port for web interface
const TCP_PORT = 12345;  // TCP port for ESP32

// Start WebSocket server
server.listen(WS_PORT, () => {
    console.log(`WebSocket server running on port ${WS_PORT}`);
});

// Start TCP server
tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server running on port ${TCP_PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down servers...');
    server.close(() => {
        console.log('WebSocket server closed');
    });
    tcpServer.close(() => {
        console.log('TCP server closed');
    });
});

async function handleNFCData(uid, name, ws) {
    try {
        // Load card data to verify access
        const cardData = await loadCardData();
        const cardholder = cardData.cardholders.find(
            card => card.id === uid && card.active
        );

        // Check if card is expired
        const isExpired = cardholder && new Date(cardholder.validUntil) < new Date();

        if (!cardholder) {
            // Broadcast 'UNAUTHORIZED' to all connected clients
            broadcast({
                type: 'nfcData',
                uid,
                name: 'Unknown',
                department: 'Unknown',
                authorized: false,
                type: 'Unknown',
                signal: -1 * (Math.random() * 30 + 50),
                location: 'Main Entrance'
            });

            // Send 'UNAUTHORIZED' response to the specific WebSocket connection
            if (ws) {
                ws.send('UNAUTHORIZED');
            }
        } else if (isExpired) {
            // Broadcast 'EXPIRED' to all connected clients
            broadcast({
                type: 'nfcData',
                uid,
                name: cardholder.name,
                department: cardholder.department,
                authorized: false,
                type: cardholder.type,
                signal: -1 * (Math.random() * 30 + 50),
                location: 'Main Entrance'
            });

            // Send 'EXPIRED' response to the specific WebSocket connection
            if (ws) {
                ws.send('EXPIRED');
            }
        } else {
            // Broadcast authorized NFC data to all connected clients
            broadcast({
                type: 'nfcData',
                uid,
                name: cardholder.name,
                department: cardholder.department,
                authorized: true,
                type: cardholder.type,
                signal: -1 * (Math.random() * 30 + 50),
                location: 'Main Entrance'
            });

            // Send 'OK' response to the specific WebSocket connection
            if (ws) {
                ws.send('OK');
            }
        }
    } catch (error) {
        console.error('Error handling NFC data:', error);
    }
}