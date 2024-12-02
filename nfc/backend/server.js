// File: server.js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createServer as createNetServer } from 'net';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import attendanceRoutes from './routes/attendance.js';
import AccessLog from './models/AccessLog.js';
import classRoutes from './routes/classes.js';
import attendanceSettingsRoutes from './routes/attendanceSettings.js';
import Faculty from './models/Faculty.js';  // Import the model instead of the schema file
import facultyRoutes from './routes/faculty.js';
const upload = multer({ storage: multer.memoryStorage() });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', attendanceRoutes);
app.use('/api', classRoutes);
app.use('/api', attendanceSettingsRoutes);
app.use('/api', facultyRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Enhanced MongoDB Schemas
const DeviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    isRegistrationMode: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['university', 'company'], required: true },
    address: String,
    contactEmail: String,
    contactPhone: String,
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
});

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    description: String,
    location: String,
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
});

const BiometricDataSchema = new mongoose.Schema({
    cardId: { type: String, required: true, unique: true },
    templateData: { type: String, required: true },
    created: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});


const CardSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    holderName: { type: String, required: true },
    biometricId: { type: mongoose.Schema.Types.ObjectId, ref: 'BiometricData' },
    fingerprintId: { type: Number, required: true },
    type: { type: String, enum: ['student', 'faculty', 'staff', 'employee', 'visitor'], required: true },
    email: String,
    phone: String,
    studentInfo: {
        rollNumber: { type: String, unique: true, sparse: true },
        semester: { type: Number, min: 1, max: 8 },
        branch: String,
        section: String,
        batch: String,
        admissionYear: Number,
        guardianName: String,
        guardianPhone: String,
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: 'India' }
        },
        academicDetails: {
            cgpa: { type: Number, min: 0, max: 10 },
            attendance: { type: Number, default: 0 },
            subjects: [{
                name: String,
                code: String,
                credits: Number
            }]
        },
        nfcCard: {
            cardNumber: { type: String, unique: true, sparse: true },
            issueDate: { type: Date },
            lastReplaced: { type: Date },
            status: {
                type: String,
                enum: ['active', 'lost', 'damaged', 'replaced', 'expired'],
                default: 'active'
            }
        },
        attendance: {
            lastTapIn: Date,
            lastTapOut: Date,
            totalPresent: { type: Number, default: 0 },
            totalAbsent: { type: Number, default: 0 },
            totalLate: { type: Number, default: 0 },
            status: {
                type: String,
                enum: ['present', 'absent', 'late'],
                default: 'absent'
            },
            history: [{
                date: Date,
                status: String,
                inTime: Date,
                outTime: Date,
                duration: Number, // in minutes
                location: String
            }]
        },
        library: {
            membershipId: String,
            booksIssued: [{
                bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
                issuedDate: Date,
                dueDate: Date,
                returnDate: Date,
                fineAmount: Number
            }],
            finesPending: { type: Number, default: 0 }
        },
        fees: {
            totalAmount: Number,
            paidAmount: Number,
            pendingAmount: Number,
            lastPaymentDate: Date,
            payments: [{
                amount: Number,
                date: Date,
                transactionId: String,
                mode: {
                    type: String,
                    enum: ['cash', 'online', 'cheque']
                },
                status: {
                    type: String,
                    enum: ['pending', 'completed', 'failed']
                }
            }]
        }
    },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    active: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
});

// Add middleware to update lastModified
CardSchema.pre('save', function (next) {
    this.lastModified = new Date();
    next();
});

// Add virtual for age calculation
CardSchema.virtual('studentInfo.age').get(function () {
    if (this.studentInfo?.admissionYear) {
        return new Date().getFullYear() - this.studentInfo.admissionYear + 18; // Approximate age
    }
    return null;
});

// Add methods for attendance management
CardSchema.methods.recordAttendance = async function (type, location) {
    const now = new Date();
    if (type === 'in') {
        this.studentInfo.attendance.lastTapIn = now;
        this.studentInfo.attendance.status = 'present';
    } else if (type === 'out') {
        this.studentInfo.attendance.lastTapOut = now;

        // Calculate duration
        const duration = Math.round(
            (now - this.studentInfo.attendance.lastTapIn) / (1000 * 60)
        );

        // Add to history
        this.studentInfo.attendance.history.push({
            date: now,
            status: this.studentInfo.attendance.status,
            inTime: this.studentInfo.attendance.lastTapIn,
            outTime: now,
            duration,
            location
        });
    }
    await this.save();
};

// Add method for fee payment
CardSchema.methods.recordPayment = async function (amount, transactionId, mode) {
    const payment = {
        amount,
        date: new Date(),
        transactionId,
        mode,
        status: 'completed'
    };

    this.studentInfo.fees.payments.push(payment);
    this.studentInfo.fees.paidAmount += amount;
    this.studentInfo.fees.pendingAmount =
        this.studentInfo.fees.totalAmount - this.studentInfo.fees.paidAmount;
    this.studentInfo.fees.lastPaymentDate = new Date();

    await this.save();
    return payment;
};

// Add indexes for better query performance
CardSchema.index({ 'studentInfo.rollNumber': 1 });
CardSchema.index({ 'studentInfo.nfcCard.cardNumber': 1 });
CardSchema.index({ departmentId: 1, type: 1 });
CardSchema.index({ 'studentInfo.attendance.lastTapIn': -1 });

const Card = mongoose.model('Card', CardSchema);

const FacultySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    personalInfo: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        bloodGroup: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: {
                type: String,
                default: 'India'
            }
        }
    },
    employmentDetails: {
        employeeId: {
            type: String,
            required: true,
            unique: true
        },
        designation: {
            type: String,
            required: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        joiningDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'on-leave', 'inactive', 'terminated'],
            default: 'active'
        },
        employmentType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'visiting'],
            default: 'full-time'
        },
        salary: {
            basic: Number,
            allowances: Number,
            deductions: Number
        }
    },
    academicInfo: {
        qualification: [{
            degree: String,
            field: String,
            institution: String,
            year: Number,
            score: String
        }],
        specialization: [String],
        experience: {
            teaching: Number,
            industry: Number,
            research: Number
        },
        subjects: [{
            name: String,
            code: String,
            semester: Number,
            department: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Department'
            }
        }]
    },
    research: {
        publications: [{
            title: String,
            type: {
                type: String,
                enum: ['journal', 'conference', 'book', 'patent', 'other']
            },
            date: Date,
            publisher: String,
            authors: [String],
            doi: String,
            url: String,
            citations: Number
        }],
        projects: [{
            title: String,
            description: String,
            status: {
                type: String,
                enum: ['ongoing', 'completed', 'planned']
            },
            role: String,
            fundingAgency: String,
            fundingAmount: Number,
            startDate: Date,
            endDate: Date,
            team: [String]
        }],
        achievements: [{
            title: String,
            description: String,
            date: Date,
            category: {
                type: String,
                enum: ['award', 'recognition', 'certification', 'grant']
            },
            issuingAuthority: String
        }]
    },
    attendance: {
        currentStatus: {
            type: String,
            enum: ['present', 'absent', 'on-leave'],
            default: 'absent'
        },
        lastTapIn: Date,
        lastTapOut: Date,
        statistics: {
            totalPresent: { type: Number, default: 0 },
            totalAbsent: { type: Number, default: 0 },
            totalLeaves: { type: Number, default: 0 }
        },
        leaves: [{
            type: {
                type: String,
                enum: ['casual', 'sick', 'earned', 'duty', 'other']
            },
            startDate: Date,
            endDate: Date,
            reason: String,
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            documents: [String] // URLs to uploaded documents
        }]
    },
    nfcCard: {
        cardNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        issueDate: Date,
        expiryDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'lost', 'expired'],
            default: 'active'
        },
        accessPoints: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessPoint'
        }]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
FacultySchema.index({ 'personalInfo.email': 1 });
FacultySchema.index({ 'employmentDetails.employeeId': 1 });
FacultySchema.index({ 'employmentDetails.department': 1 });
FacultySchema.index({ 'nfcCard.cardNumber': 1 });
FacultySchema.index({ 'employmentDetails.status': 1 });

// Auto-generate faculty ID
FacultySchema.pre('save', async function (next) {
    if (!this.id) {
        const department = await mongoose.model('Department').findById(this.employmentDetails.department);
        const deptCode = department ? department.code : 'FAC';
        const count = await mongoose.model('Faculty').countDocuments({
            'employmentDetails.department': this.employmentDetails.department
        });
        this.id = `${deptCode}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Virtual for full name
FacultySchema.virtual('fullName').get(function () {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to calculate total salary
FacultySchema.methods.calculateTotalSalary = function () {
    const { basic, allowances, deductions } = this.employmentDetails.salary;
    return (basic + allowances - deductions);
};

const AccessLogSchema = new mongoose.Schema({
    cardId: { type: String, required: true },
    fingerprintId: { type: Number, required: true },
    fingerprintAccuracy: { type: Number },
    location: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    holderName: String,
    timestamp: { type: Date, default: Date.now },
    authorized: { type: Boolean, default: false },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device',required: true },
    verificationMethod: { type: String, enum: ['card_only', 'card_and_fingerprint'], default: 'card_and_fingerprint' },
    ipAddress: String
});

const PendingRegistrationSchema = new mongoose.Schema({
    cardId: { type: String, required: true },
    fingerprintId: { type: Number, required: true },
    deviceId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    processed: { type: Boolean, default: false }
});

const BookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // NFC sticker ID
    title: { type: String, required: true },
    author: String,
    isbn: String,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    status: { type: String, enum: ['available', 'borrowed', 'maintenance'], default: 'available' },
    location: String,
    created: { type: Date, default: Date.now }
});

const BookLoanSchema = new mongoose.Schema({
    bookId: { type: String, required: true },
    cardId: { type: String, required: true }, // Student/Faculty card ID
    checkoutTime: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnTime: { type: Date },
    status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
});
const attendanceSettingsSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    workingHours: {
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        graceTime: { type: Number, default: 15 },
        halfDayThreshold: { type: Number, default: 240 }
    },
    policies: {
        lateMarkAfter: { type: Number, default: 15 },
        absentMarkAfter: { type: Number, default: 240 },
        minimumWorkHours: { type: Number, default: 8 },
        allowFlexibleTiming: { type: Boolean, default: false },
        requireGeolocation: { type: Boolean, default: true },
        allowRemoteCheckin: { type: Boolean, default: false }
    },
    notifications: {
        sendEmailAlerts: { type: Boolean, default: true },
        sendSMSAlerts: { type: Boolean, default: false },
        alertSupervisor: { type: Boolean, default: true },
        dailyReport: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true }
    }
});
// Indexes
DeviceSchema.index({ deviceId: 1 }, { unique: true });
BiometricDataSchema.index({ fingerprintId: 1 }, { unique: true });
CardSchema.index({ id: 1 }, { unique: true });
CardSchema.index({ fingerprintId: 1 }, { unique: true });
AccessLogSchema.index({ timestamp: -1 });
AccessLogSchema.index({ deviceId: 1, timestamp: -1 });
PendingRegistrationSchema.index({ cardId: 1, fingerprintId: 1 }, { unique: true });

// Models

const Device = mongoose.model('Device', DeviceSchema);
const Organization = mongoose.model('Organization', OrganizationSchema);
const Department = mongoose.model('Department', DepartmentSchema);
const BiometricData = mongoose.model('BiometricData', BiometricDataSchema);
const PendingRegistration = mongoose.model('PendingRegistration', PendingRegistrationSchema);
const Book = mongoose.model('Book', BookSchema);
const BookLoan = mongoose.model('BookLoan', BookLoanSchema);

// Default settings object
const defaultSettings = {
    workingHours: {
        startTime: '09:00',
        endTime: '17:00',
        graceTime: 15,
        halfDayThreshold: 240
    },
    policies: {
        lateMarkAfter: 15,
        absentMarkAfter: 240,
        minimumWorkHours: 8,
        allowFlexibleTiming: false,
        requireGeolocation: true,
        allowRemoteCheckin: false
    },
    notifications: {
        sendEmailAlerts: true,
        sendSMSAlerts: false,
        alertSupervisor: true,
        dailyReport: true,
        weeklyReport: true
    }
};

// WebSocket Management
const clients = new Set();
const connectedDevices = new Map();

function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocketServer.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket Connection Handler
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Web client connected');

    // Initial device status
    const deviceStatus = Array.from(connectedDevices.values());
    ws.send(JSON.stringify({
        type: 'deviceStatus',
        devices: deviceStatus
    }));

    // Send system health metrics
    const systemHealth = {
        type: 'systemHealth',
        status: mongoose.connection.readyState === 1 ? 'operational' : 'degraded',
        metrics: {
            devices: {
                active: deviceStatus.filter(d => d.active).length,
                total: deviceStatus.length
            }
        }
    };

    // Fetch additional metrics for system health
    Promise.all([
        Card.countDocuments({ active: true }),
        Card.countDocuments(),
        PendingRegistration.countDocuments({ status: 'pending' })
    ]).then(([activeCards, totalCards, pendingRegs]) => {
        systemHealth.metrics.cards = {
            active: activeCards,
            total: totalCards
        };
        systemHealth.metrics.pendingRegistrations = pendingRegs;
        ws.send(JSON.stringify(systemHealth));
    });

    // Send pending registrations
    PendingRegistration.find({ status: 'pending' })
        .then(registrations => {
            ws.send(JSON.stringify({
                type: 'pendingRegistrations',
                registrations
            }));
        });

    // Send recent access logs with enhanced information
    AccessLog.find({})
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('departmentId')
        .populate('deviceId')
        .then(logs => {
            ws.send(JSON.stringify({
                type: 'accessLogs',
                logs: logs.map(log => ({
                    ...log.toObject(),
                    department: log.departmentId?.name || 'Unknown',
                    location: log.deviceId?.location || 'Unknown',
                    verificationMethod: log.fingerprintId ? 'card_and_fingerprint' : 'card_only'
                }))
            }));
        });

    // Handle incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
    
            switch (data.type) {
                case 'GET_ACCESS_STATS':
                    const stats = await AccessLog.aggregate([
                        {
                            $group: {
                                _id: "$deviceId",
                                total: { $sum: 1 },
                                authorized: {
                                    $sum: { $cond: ["$authorized", 1, 0] }
                                }
                            }
                        }
                    ]);
                    
                    ws.send(JSON.stringify({ 
                        type: 'accessStats', 
                        stats 
                    }));
                    break;
    
                case 'TOGGLE_REGISTRATION_MODE':
                    // Validate input
                    if (!data.deviceId) {
                        throw new Error('deviceId is required');
                    }
                    if (typeof data.enabled !== 'boolean') {
                        throw new Error('enabled must be a boolean value');
                    }
    
                    const device = await Device.findOneAndUpdate(
                        { deviceId: data.deviceId },
                        { isRegistrationMode: data.enabled },
                        { new: true }
                    );
    
                    if (!device) {
                        throw new Error('Device not found');
                    }
    
                    broadcast({
                        type: 'deviceUpdated',
                        device: device.toObject()
                    });
                    break;
    
                default:
                    throw new Error(`Unsupported message type: ${data.type}`);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message || 'Failed to process request'
            }));
        }
    });
    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Web client disconnected');
    });
});

// TCP Server Message Handlers
async function handleDeviceInfo(message, socket) {
    const device = await Device.findOneAndUpdate(
        { deviceId: message.device_id },
        {
            deviceId: message.device_id,
            location: message.location,
            lastSeen: new Date(),
            active: true
        },
        { upsert: true, new: true }
    );

    connectedDevices.set(message.device_id, {
        ...device.toObject(),
        socket
    });

    broadcast({
        type: 'deviceConnected',
        device: device.toObject()
    });

    return device;
}
async function handleRegistration(message) {
    try {
        console.log('Registration message received:', message);

        const existingRegistration = await PendingRegistration.findOne({
            cardId: message.card_id,
            status: 'pending'
        });

        if (existingRegistration) {
            return 'DUPLICATE';
        }

        // Store biometric data
        const biometric = new BiometricData({
            cardId: message.card_id,
            templateData: message.template_data // Store as array
        });

        await biometric.save();

        const pendingReg = new PendingRegistration({
            cardId: message.card_id,
            deviceId: message.device_id,
            timestamp: new Date(message.timestamp * 1000)
        });

        await pendingReg.save();

        broadcast({
            type: 'newRegistration',
            registration: pendingReg.toObject()
        });

        return 'OK';
    } catch (error) {
        console.error('Error processing registration:', error);
        return 'ERROR';
    }
}

// Update handleAccessAttempt function
async function handleAccessAttempt(message, socket) {
    try {
        const biometric = await BiometricData.findOne({
            cardId: message.card_id
        });

        const card = await Card.findOne({
            id: message.card_id,
            active: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        }).populate('departmentId');

        const device = await Device.findOne({ deviceId: message.device_id });

        const accessData = {
            cardId: message.card_id,
            deviceId: message.device_id,
            location: device?.location || 'Unknown',
            organizationId: card?.organizationId,
            departmentId: card?.departmentId?._id,
            holderName: card?.holderName || 'Unknown',
            timestamp: new Date(message.timestamp * 1000),
            authorized: message.authorized && !!card && !!biometric,
            accuracy: message.accuracy || 0,
            verificationMethod: 'card_and_fingerprint',
            ipAddress: socket.remoteAddress
        };

        const accessLog = new AccessLog(accessData);
        await accessLog.save();

        broadcast({
            type: 'accessAttempt',
            ...accessData,
            department: card?.departmentId?.name || 'Unknown'
        });

        return accessData.authorized ? 'OK' : 'UNAUTHORIZED';
    } catch (error) {
        console.error('Error processing access:', error);
        return 'ERROR';
    }
}

async function getNextFingerprintId() {
    const lastBiometric = await BiometricData.findOne().sort('-fingerprintId');
    return (lastBiometric?.fingerprintId || 0) + 1;
}

// TCP Server
const tcpServer = createNetServer((socket) => {
    let deviceInfo = null;
    console.log('Device connected from:', socket.remoteAddress);

    socket.on('data', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            let response = 'ERROR';

            switch (message.type) {
                case 'DEVICE_INFO':
                    deviceInfo = await handleDeviceInfo(message, socket);
                    response = 'OK';
                    break;

                case 'HEARTBEAT':
                    await Device.findOneAndUpdate(
                        { deviceId: message.device_id },
                        { lastSeen: new Date() }
                    );
                    response = 'OK';
                    break;

                case 'ACCESS':
                    response = await handleAccessAttempt(message, socket);
                    break;

                case 'REGISTRATION':
                    response = await handleRegistration(message);
                    break;

                case 'GET_NEXT_FINGER_ID':
                    const nextId = await getNextFingerprintId();
                    response = nextId.toString();
                    break;

                default:
                    response = 'INVALID_COMMAND';
            }

            socket.write(response);
        } catch (error) {
            console.error('Error processing message:', error);
            socket.write('ERROR');
        }
    });

    socket.on('close', async () => {
        if (deviceInfo) {
            await Device.findOneAndUpdate(
                { deviceId: deviceInfo.deviceId },
                { active: false }
            );

            connectedDevices.delete(deviceInfo.deviceId);
            broadcast({
                type: 'deviceDisconnected',
                deviceId: deviceInfo.deviceId
            });
        }
        console.log('Device disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Simple auth middleware (temporary)
const auth = (req, res, next) => {
    next(); // For development, just pass through
};


// Faculty Attendance Endpoints
app.get('/api/faculty-attendance', async (req, res) => {
    try {
        const { departmentId, date } = req.query;

        // First get all faculty members from the department
        const faculty = await Faculty.find({ departmentId });

        // Then get their attendance records for the specified date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await AccessLog.find({
            userId: { $in: faculty.map(f => f._id) },
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Combine faculty data with attendance records
        const facultyWithAttendance = faculty.map(f => {
            const attendance = attendanceRecords.find(
                record => record.userId.toString() === f._id.toString()
            );

            return {
                _id: f._id,
                name: f.name,
                employeeId: f.employeeId,
                department: f.department,
                status: attendance ? attendance.status : 'absent',
                time: attendance ? attendance.timestamp : null
            };
        });

        res.json(facultyWithAttendance);

    } catch (error) {
        console.error('Faculty attendance fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty attendance' });
    }
});

app.post('/api/faculty-attendance', async (req, res) => {
    try {
        const { facultyId, status, date } = req.body;

        const accessLog = new AccessLog({
            userId: facultyId,
            status,
            timestamp: new Date(date),
            type: 'faculty'
        });

        await accessLog.save();
        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error('Faculty attendance marking error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Student Attendance Endpoints
app.get('/api/student-attendance', async (req, res) => {
    try {
        const { departmentId, classId, date } = req.query;

        // Get all students from the specified class and department
        const students = await Student.find({
            departmentId,
            classId
        });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await AccessLog.find({
            userId: { $in: students.map(s => s._id) },
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        const studentsWithAttendance = students.map(s => {
            const attendance = attendanceRecords.find(
                record => record.userId.toString() === s._id.toString()
            );

            return {
                _id: s._id,
                name: s.name,
                rollNumber: s.rollNumber,
                status: attendance ? attendance.status : 'absent',
                time: attendance ? attendance.timestamp : null
            };
        });

        res.json(studentsWithAttendance);

    } catch (error) {
        console.error('Student attendance fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch student attendance' });
    }
});

app.post('/api/student-attendance', async (req, res) => {
    try {
        const { studentId, status, date, classId, departmentId } = req.body;

        const accessLog = new AccessLog({
            userId: studentId,
            status,
            timestamp: new Date(date),
            type: 'student',
            classId,
            departmentId
        });

        await accessLog.save();
        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error('Student attendance marking error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Export endpoint
app.get('/api/student-attendance/export', async (req, res) => {
    try {
        const { departmentId, classId, date } = req.query;

        // Fetch attendance data
        const students = await Student.find({ departmentId, classId });
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await AccessLog.find({
            userId: { $in: students.map(s => s._id) },
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        // Create CSV content
        const csvRows = ['Name,Roll Number,Status,Time'];
        students.forEach(student => {
            const attendance = attendanceRecords.find(
                record => record.userId.toString() === student._id.toString()
            );

            csvRows.push(`${student.name},${student.rollNumber},${attendance ? attendance.status : 'absent'},${attendance ? attendance.timestamp : '-'}`);
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-${date}.csv`);
        res.send(csvRows.join('\n'));

    } catch (error) {
        console.error('Attendance export error:', error);
        res.status(500).json({ error: 'Failed to export attendance' });
    }
});


app.get('/api/attendance/settings', async (req, res) => {
    try {
        const settings = await AttendanceSettings.findOne({
            organizationId: req.query.organizationId
        });
        res.json(settings || defaultSettings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attendance/settings', async (req, res) => {
    try {
        const { organizationId } = req.body;
        const settings = await AttendanceSettings.findOneAndUpdate(
            { organizationId },
            { ...req.body },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attendance Analytics
app.get('/api/attendance/analytics', async (req, res) => {
    try {
        const { timeRange, department, organizationId } = req.query;
        let startDate = new Date();

        // Calculate date range
        switch (timeRange) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Build query
        const query = {
            timestamp: { $gte: startDate },
            organizationId
        };
        if (department !== 'all') {
            query.departmentId = department;
        }

        // Get attendance data
        const accessLogs = await AccessLog.find(query)
            .populate('cardId')
            .populate('departmentId');

        // Calculate real-time stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLogs = accessLogs.filter(log => log.timestamp >= today);

        const realTimeStats = {
            present: todayLogs.filter(log => log.status === 'present').length,
            late: todayLogs.filter(log => log.status === 'late').length,
            absent: todayLogs.filter(log => log.status === 'absent').length,
            onLeave: todayLogs.filter(log => log.status === 'leave').length
        };

        // Calculate trends
        const trends = [];
        let currentDate = new Date(startDate);
        while (currentDate <= new Date()) {
            const dayLogs = accessLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.toDateString() === currentDate.toDateString();
            });

            trends.push({
                date: currentDate.toISOString().split('T')[0],
                present: dayLogs.filter(log => log.status === 'present').length,
                late: dayLogs.filter(log => log.status === 'late').length,
                absent: dayLogs.filter(log => log.status === 'absent').length
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Department comparison
        const departments = await Department.find({ organizationId });
        const departmentComparison = await Promise.all(
            departments.map(async (dept) => {
                const deptLogs = accessLogs.filter(log =>
                    log.departmentId && log.departmentId._id.toString() === dept._id.toString()
                );
                const totalPresent = deptLogs.filter(log =>
                    log.status === 'present' || log.status === 'late'
                ).length;
                const total = deptLogs.length || 1; // Avoid division by zero

                return {
                    department: dept.name,
                    attendance: (totalPresent / total) * 100
                };
            })
        );

        // Attendance by time
        const attendanceByTime = Array(24).fill(0).map((_, hour) => ({
            time: `${hour.toString().padStart(2, '0')}:00`,
            checkIns: accessLogs.filter(log => {
                const logHour = new Date(log.timestamp).getHours();
                return logHour === hour;
            }).length
        }));

        res.json({
            realTimeStats,
            trends,
            departmentComparison,
            attendanceByTime
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk Upload
app.post('/api/attendance/bulk-upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileContent = req.file.buffer.toString();
        const rows = fileContent.split('\n').slice(1); // Skip header row

        const results = await Promise.all(rows.map(async (row) => {
            const [id, name, date, status, time] = row.split(',');

            if (!id || !date || !status) {
                return { error: 'Invalid row data', row };
            }

            try {
                const timestamp = new Date(`${date} ${time || '00:00'}`);

                const accessLog = new AccessLog({
                    cardId: id.trim(),
                    status: status.trim().toLowerCase(),
                    timestamp,
                    type: 'bulk',
                    departmentId: req.body.departmentId
                });

                await accessLog.save();
                return { success: true, id };
            } catch (error) {
                return { error: error.message, row };
            }
        }));

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => r.error).length;

        res.json({
            message: `Processed ${results.length} records. Success: ${successful}, Failed: ${failed}`,
            details: results
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Faculty Routes
app.get('/api/faculty', auth, async (req, res) => {
    try {
        const { departmentId, status, search } = req.query;
        let query = {};

        if (departmentId) {
            query['employmentDetails.department'] = departmentId;
        }
        if (status) {
            query['employmentDetails.status'] = status;
        }
        if (search) {
            query.$or = [
                { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
                { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
                { 'personalInfo.email': { $regex: search, $options: 'i' } }
            ];
        }

        const faculty = await Faculty.find(query)
            .populate('employmentDetails.department')
            .sort('personalInfo.firstName');
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Failed to fetch faculty' });
    }
});

app.post('/api/faculty', auth, async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log('Received faculty data:', req.body);

        // Validate required fields
        if (!req.body.id) {
            return res.status(400).json({ message: 'Faculty ID is required' });
        }

        if (!req.body.employmentDetails?.department) {
            return res.status(400).json({ message: 'Department is required' });
        }

        if (!req.body.employmentDetails?.organizationId) {
            return res.status(400).json({ message: 'Organization ID is required' });
        }

        // Create new faculty member
        const faculty = new Faculty({
            id: req.body.id,
            personalInfo: {
                firstName: req.body.personalInfo.firstName,
                lastName: req.body.personalInfo.lastName,
                email: req.body.personalInfo.email,
                phone: req.body.personalInfo.phone,
                dateOfBirth: req.body.personalInfo.dateOfBirth,
                gender: req.body.personalInfo.gender,
            },
            employmentDetails: {
                employeeId: req.body.employmentDetails.employeeId,
                designation: req.body.employmentDetails.designation,
                department: req.body.employmentDetails.department,
                organizationId: req.body.employmentDetails.organizationId,
                joiningDate: req.body.employmentDetails.joiningDate,
                employmentType: req.body.employmentDetails.employmentType,
                status: 'active'
            }
        });

        // Save to database
        await faculty.save();

        // Return the created faculty member
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Error creating faculty:', error);

        // Send more detailed error message
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(400).json({
            message: error.message || 'Failed to create faculty member',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Add this with your other faculty routes
app.delete('/api/faculty/:id', auth, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty member not found' });
        }

        await Faculty.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Faculty member deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({
            message: 'Failed to delete faculty member',
            error: error.message
        });
    }
});

// ... other faculty routes ...

// Dashboard Stats Endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { organizationId } = req.query;

        // Get total students
        const totalStudents = await Card.countDocuments({
            organizationId,
            type: 'student'
        });

        // Get new students this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newStudents = await Card.countDocuments({
            organizationId,
            type: 'student',
            created: { $gte: startOfMonth }
        });

        // Get today's attendance
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayLogs = await AccessLog.find({
            organizationId,
            timestamp: { $gte: startOfDay },
            authorized: true
        });

        // Calculate attendance percentage
        const presentToday = new Set(todayLogs.map(log => log.cardId)).size;
        const todayAttendance = totalStudents ? Math.round((presentToday / totalStudents) * 100) : 0;

        // Get active cards and biometric registration
        const activeCards = await Card.countDocuments({
            organizationId,
            active: true
        });
        const biometricRegistered = await Card.countDocuments({
            organizationId,
            biometricRegistered: true
        });

        // Get system health metrics
        const devices = await Device.find({ organizationId });
        const activeDevices = devices.filter(device => device.status === 'online').length;
        const systemHealth = devices.length ? Math.round((activeDevices / devices.length) * 100) : 0;

        res.json({
            totalStudents,
            newStudents,
            todayAttendance,
            presentToday,
            totalExpected: totalStudents,
            activeCards,
            biometricRegistered,
            systemHealth,
            activeDevices
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Recent Alerts Endpoint
app.get('/api/dashboard/alerts', async (req, res) => {
    try {
        const { organizationId } = req.query;
        const alerts = await Alert.find({ organizationId })
            .sort({ timestamp: -1 })
            .limit(10);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Device Status Endpoint
app.get('/api/devices', async (req, res) => {
    try {
        const { organizationId } = req.query;
        const devices = await Device.find({ organizationId });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});
// Library Management Endpoints
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({}).sort({ title: 1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        broadcast({ type: 'bookAdded', book });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create book' });
    }
});

app.get('/api/book-loans', async (req, res) => {
    try {
        const loans = await BookLoan.find({})
            .sort({ checkoutTime: -1 })
            .populate('departmentId');
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book loans' });
    }
});

app.post('/api/book-loans/checkout', async (req, res) => {
    try {
        const { bookId, cardId, dueDate } = req.body;

        // Check if book exists and is available
        const book = await Book.findOne({ id: bookId });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.status !== 'available') {
            return res.status(400).json({ error: 'Book is not available' });
        }

        // Create loan record
        const loan = new BookLoan({
            bookId,
            cardId,
            dueDate: new Date(dueDate),
            status: 'active'
        });

        // Update book status
        book.status = 'borrowed';

        await Promise.all([
            loan.save(),
            book.save()
        ]);

        broadcast({ type: 'bookLoaned', loan, book });
        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to checkout book' });
    }
});

app.post('/api/book-loans/:id/return', async (req, res) => {
    try {
        const loan = await BookLoan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan record not found' });
        }

        loan.returnTime = new Date();
        loan.status = 'returned';

        const book = await Book.findOne({ id: loan.bookId });
        if (book) {
            book.status = 'available';
            await book.save();
        }

        await loan.save();
        broadcast({ type: 'bookReturned', loan, book });
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to return book' });
    }
});

app.get('/api/devices', async (req, res) => {
    try {
        const devices = await Device.find({}).sort({ location: 1 });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

app.post('/api/devices/:deviceId/registration-mode', async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { deviceId: req.params.deviceId },
            { isRegistrationMode: req.body.enabled },
            { new: true }
        );

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const deviceConnection = connectedDevices.get(req.params.deviceId);
        if (!deviceConnection?.socket) {
            return res.status(400).json({ error: 'Device not connected' });
        }

        deviceConnection.socket.write(JSON.stringify({
            type: 'REGISTRATION_MODE',
            enabled: req.body.enabled
        }));

        broadcast({
            type: 'deviceUpdated',
            device: device.toObject()
        });

        res.json(device);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update device mode' });
    }
});

app.get('/api/pending-registrations', async (req, res) => {
    try {
        const registrations = await PendingRegistration.find({ status: 'pending' })
            .sort({ timestamp: -1 });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending registrations' });
    }
});

app.post('/api/pending-registrations/:id/approve', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const registration = await PendingRegistration.findById(req.params.id).session(session);
        if (!registration) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Registration not found' });
        }

        if (registration.status !== 'pending') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Registration is no longer pending' });
        }

        if (!req.body.templateData) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Biometric template data is required' });
        }

        const cardData = {
            holderName: req.body.cardData.holderName,
            type: req.body.cardData.type,
            departmentId: req.body.cardData.departmentId,
            organizationId: req.body.cardData.organizationId,
            validFrom: req.body.cardData.validFrom || new Date(),
            validUntil: req.body.cardData.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active'
        };

        const biometric = new BiometricData({
            fingerprintId: registration.fingerprintId,
            templateData: req.body.templateData,
            createdAt: new Date()
        });

        try {
            await biometric.save({ session });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error creating BiometricData:', error);
            return res.status(500).json({ error: 'Failed to save biometric data' });
        }

        const card = new Card({
            id: registration.cardId,
            biometricId: biometric._id,
            fingerprintId: registration.fingerprintId,
            ...cardData,
            createdAt: new Date()
        });

        try {
            await card.validate();
        } catch (validationError) {
            await session.abortTransaction();
            console.error('Card validation error:', validationError);
            return res.status(400).json({
                error: 'Invalid card data',
                details: Object.keys(validationError.errors).map(field => ({
                    field,
                    message: validationError.errors[field].message
                }))
            });
        }

        try {
            await card.save({ session });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error saving card:', error);
            return res.status(500).json({ error: 'Failed to save card data' });
        }

        registration.status = 'approved';
        registration.processed = true;
        registration.processedAt = new Date();
        registration.processedBy = req.user?.id;

        try {
            await registration.save({ session });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error updating registration:', error);
            return res.status(500).json({ error: 'Failed to update registration status' });
        }

        await session.commitTransaction();

        if (typeof broadcast === 'function') {
            broadcast({
                type: 'registrationApproved',
                registration: registration.toObject()
            });
        }

        res.json({
            message: 'Registration approved successfully',
            registration: registration.toObject(),
            card: card.toObject(),
            biometric: biometric.toObject()
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in registration approval process:', error);
        res.status(500).json({
            error: 'Failed to complete registration approval',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
});

app.get('/api/biometric/:cardId', async (req, res) => {
    try {
        const biometric = await BiometricData.findOne({ cardId: req.params.cardId });
        if (!biometric) {
            return res.status(404).json({ error: 'Biometric data not found' });
        }
        res.json({ templateData: biometric.templateData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch biometric data' });
    }
});

// Update registration approval endpoint
app.post('/api/pending-registrations/:id/approve', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const registration = await PendingRegistration.findById(req.params.id).session(session);
        if (!registration) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Registration not found' });
        }

        if (registration.status !== 'pending') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Registration is no longer pending' });
        }

        // Verify biometric data exists
        const biometric = await BiometricData.findOne({ cardId: registration.cardId });
        if (!biometric) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Biometric data not found' });
        }

        const cardData = {
            id: registration.cardId,
            holderName: req.body.cardData.holderName,
            type: req.body.cardData.type,
            departmentId: req.body.cardData.departmentId,
            organizationId: req.body.cardData.organizationId,
            validFrom: req.body.cardData.validFrom || new Date(),
            validUntil: req.body.cardData.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            active: true
        };

        const card = new Card(cardData);

        try {
            await card.save({ session });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error saving card:', error);
            return res.status(500).json({ error: 'Failed to save card data' });
        }

        registration.status = 'approved';
        registration.processed = true;
        registration.processedAt = new Date();
        registration.processedBy = req.user?.id;

        try {
            await registration.save({ session });
        } catch (error) {
            await session.abortTransaction();
            console.error('Error updating registration:', error);
            return res.status(500).json({ error: 'Failed to update registration status' });
        }

        await session.commitTransaction();

        broadcast({
            type: 'registrationApproved',
            registration: registration.toObject()
        });

        res.json({
            message: 'Registration approved successfully',
            registration: registration.toObject(),
            card: card.toObject(),
            biometric: biometric.toObject()
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in registration approval process:', error);
        res.status(500).json({
            error: 'Failed to complete registration approval',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
});

// Add biometric data management endpoints
app.get('/api/biometric-stats', async (req, res) => {
    try {
        const stats = await BiometricData.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    lastRegistered: { $max: '$created' }
                }
            }
        ]);

        const activeCards = await Card.countDocuments({ active: true });

        res.json({
            totalBiometrics: stats[0]?.total || 0,
            lastRegistered: stats[0]?.lastRegistered,
            activeCards,
            registrationRate: activeCards ? (stats[0]?.total / activeCards) * 100 : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch biometric statistics' });
    }
});

// Add endpoint to check if card has biometric data
app.get('/api/cards/:cardId/has-biometric', async (req, res) => {
    try {
        const biometric = await BiometricData.findOne({ cardId: req.params.cardId });
        const card = await Card.findOne({ id: req.params.cardId });

        res.json({
            hasBiometric: !!biometric,
            cardExists: !!card,
            isActive: card?.active || false
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check biometric status' });
    }
});

// Add endpoint to delete biometric data
app.delete('/api/biometric/:cardId', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const biometric = await BiometricData.findOneAndDelete(
            { cardId: req.params.cardId },
            { session }
        );

        if (!biometric) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Biometric data not found' });
        }

        // Update card status
        await Card.findOneAndUpdate(
            { id: req.params.cardId },
            { $set: { biometricRegistered: false } },
            { session }
        );

        await session.commitTransaction();

        broadcast({
            type: 'biometricDeleted',
            cardId: req.params.cardId
        });

        res.json({ message: 'Biometric data deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: 'Failed to delete biometric data' });
    } finally {
        session.endSession();
    }
});


app.post('/api/pending-registrations/:id/reject', async (req, res) => {
    try {
        const registration = await PendingRegistration.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', processed: true },
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        broadcast({
            type: 'registrationRejected',
            registration: registration.toObject()
        });

        res.json({ message: 'Registration rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject registration' });
    }
});

// Access Statistics Endpoints
app.get('/api/access-stats/daily', async (req, res) => {
    try {
        const { start, end, departmentId } = req.query;
        const match = {};

        if (departmentId) {
            match.departmentId = new mongoose.Types.ObjectId(departmentId);
        }

        if (start || end) {
            match.timestamp = {};
            if (start) match.timestamp.$gte = new Date(start);
            if (end) match.timestamp.$lte = new Date(end);
        }

        const stats = await AccessLog.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        authorized: "$authorized"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    authorized: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.authorized", true] }, "$count", 0]
                        }
                    },
                    unauthorized: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.authorized", false] }, "$count", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily statistics' });
    }
});

app.get('/api/access-stats/devices', async (req, res) => {
    try {
        const stats = await AccessLog.aggregate([
            {
                $group: {
                    _id: "$deviceId",
                    location: { $first: "$location" },
                    total: { $sum: 1 },
                    authorized: {
                        $sum: { $cond: ["$authorized", 1, 0] }
                    },
                    unauthorized: {
                        $sum: { $cond: ["$authorized", 0, 1] }
                    }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device statistics' });
    }
});

// System Health Endpoints
app.get('/api/system/health', async (req, res) => {
    try {
        const [
            totalDevices,
            activeDevices,
            totalCards,
            activeCards,
            pendingRegistrations
        ] = await Promise.all([
            Device.countDocuments(),
            Device.countDocuments({ active: true }),
            Card.countDocuments(),
            Card.countDocuments({ active: true }),
            PendingRegistration.countDocuments({ status: 'pending' })
        ]);

        const health = {
            status: 'operational',
            uptime: process.uptime(),
            timestamp: new Date(),
            database: {
                status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            },
            metrics: {
                devices: {
                    total: totalDevices,
                    active: activeDevices
                },
                cards: {
                    total: totalCards,
                    active: activeCards
                },
                pendingRegistrations
            },
            connectedDevices: connectedDevices.size,
            webClients: clients.size
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch system health'
        });
    }
});


// Organization endpoints
app.get('/api/organizations', async (req, res) => {
    try {
        const organizations = await Organization.find({})
            .sort({ name: 1 });
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

app.post('/api/organizations', async (req, res) => {
    try {
        const organization = new Organization(req.body);
        await organization.save();
        broadcast({ type: 'organizationAdded', organization });
        res.status(201).json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create organization' });
    }
});

app.put('/api/organizations/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        broadcast({ type: 'organizationUpdated', organization });
        res.json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update organization' });
    }
});

app.delete('/api/organizations/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndDelete(req.params.id);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Cascade delete departments and cards
        const departments = await Department.find({ organizationId: req.params.id });
        const departmentIds = departments.map(dept => dept._id);

        await Department.deleteMany({ organizationId: req.params.id });
        await Card.deleteMany({ departmentId: { $in: departmentIds } });

        broadcast({ type: 'organizationDeleted', id: req.params.id });
        res.json({ message: 'Organization and associated data deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete organization' });
    }
});

// Department endpoints
app.get('/api/departments', async (req, res) => {
    try {
        const { organizationId } = req.query;
        const query = organizationId ? { organizationId } : {};
        const departments = await Department.find(query)
            .sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

app.post('/api/departments', async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();
        broadcast({ type: 'departmentAdded', department });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});

app.put('/api/departments/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        broadcast({ type: 'departmentUpdated', department });
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update department' });
    }
});

app.delete('/api/departments/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Delete associated cards
        await Card.deleteMany({ departmentId: req.params.id });

        broadcast({ type: 'departmentDeleted', id: req.params.id });
        res.json({ message: 'Department and associated cards deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// Card endpoints
app.get('/api/cards', async (req, res) => {
    try {
        const { departmentId } = req.query;
        const query = departmentId ? { departmentId } : {};
        const cards = await Card.find(query)
            .sort({ holderName: 1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

app.post('/api/cards', async (req, res) => {
    try {
        const card = new Card(req.body);
        await card.save();
        broadcast({ type: 'cardAdded', card });
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create card' });
    }
});

app.put('/api/cards/:id', async (req, res) => {
    try {
        // Remove _id and id from the update data
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;

        // First find the card using the string ID
        const card = await Card.findOne({ id: req.params.id });

        if (!card) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Then update using the MongoDB _id
        const updatedCard = await Card.findByIdAndUpdate(
            card._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedCard);
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({
            message: 'Failed to update member',
            error: error.message
        });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        const card = await Card.findOne({ id: req.params.id });

        if (!card) {
            return res.status(404).json({ message: 'Member not found' });
        }

        await Card.findByIdAndDelete(card._id);
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({
            message: 'Failed to delete member',
            error: error.message
        });
    }
});
// Access logs endpoints
app.get('/api/access-logs', async (req, res) => {
    try {
        const { start, end, departmentId } = req.query;
        const query = {};

        if (departmentId) {
            query.departmentId = departmentId;
        }

        if (start || end) {
            query.timestamp = {};
            if (start) query.timestamp.$gte = new Date(start);
            if (end) query.timestamp.$lte = new Date(end);
        }

        const logs = await AccessLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100)
            .populate('departmentId');

        res.json(logs.map(log => ({
            ...log.toObject(),
            department: log.departmentId?.name || 'Unknown'
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch access logs' });
    }
});

// Access statistics endpoint
app.get('/api/access-stats', async (req, res) => {
    try {
        const stats = await AccessLog.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: {
                    path: '$department',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$department.name',
                    total: { $sum: 1 },
                    authorized: {
                        $sum: { $cond: [{ $eq: ['$authorized', true] }, 1, 0] }
                    },
                    unauthorized: {
                        $sum: { $cond: [{ $eq: ['$authorized', false] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch access statistics' });
    }
});
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Server Startup
const WS_PORT = process.env.WS_PORT || 3000;
const TCP_PORT = process.env.TCP_PORT || 12345;

server.listen(WS_PORT, () => {
    console.log(`WebSocket/HTTP server running on port ${WS_PORT}`);
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server running on port ${TCP_PORT}`);
});

// Graceful Shutdown Handler
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Initiating graceful shutdown...');

    // Close WebSocket server
    wss.close(() => {
        console.log('WebSocket server closed');
    });

    // Close HTTP server
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Close TCP server
    tcpServer.close(() => {
        console.log('TCP server closed');
    });

    // Update all connected devices as inactive
    if (connectedDevices.size > 0) {
        await Device.updateMany(
            { deviceId: { $in: Array.from(connectedDevices.keys()) } },
            { active: false }
        );
    }

    // Close MongoDB connection
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }

    process.exit(0);
});

export default {
    app,
    server,
    wss,
    tcpServer,
    mongoose,
    models: {
        Device,
        Organization,
        Department,
        BiometricData,
        Card,
        AccessLog,
        PendingRegistration,
        Faculty  // This will now use the imported model
    }
};
