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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
CardSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

// Add virtual for age calculation
CardSchema.virtual('studentInfo.age').get(function() {
    if (this.studentInfo?.admissionYear) {
        return new Date().getFullYear() - this.studentInfo.admissionYear + 18; // Approximate age
    }
    return null;
});

// Add methods for attendance management
CardSchema.methods.recordAttendance = async function(type, location) {
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
CardSchema.methods.recordPayment = async function(amount, transactionId, mode) {
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
FacultySchema.pre('save', async function(next) {
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
FacultySchema.virtual('fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to calculate total salary
FacultySchema.methods.calculateTotalSalary = function() {
    const { basic, allowances, deductions } = this.employmentDetails.salary;
    return (basic + allowances - deductions);
};

const Faculty = mongoose.model('Faculty', FacultySchema);


const AccessLogSchema = new mongoose.Schema({
    cardId: { type: String, required: true },
    fingerprintId: { type: Number, required: true },
    fingerprintAccuracy: { type: Number },
    deviceId: { type: String, required: true },
    location: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    holderName: String,
    timestamp: { type: Date, default: Date.now },
    authorized: { type: Boolean, default: false },
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
const AccessLog = mongoose.model('AccessLog', AccessLogSchema);
const PendingRegistration = mongoose.model('PendingRegistration', PendingRegistrationSchema);
const Book = mongoose.model('Book', BookSchema);
const BookLoan = mongoose.model('BookLoan', BookLoanSchema);
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
                                authorized: { $sum: { $cond: ["$authorized", 1, 0] } }
                            }
                        }
                    ]);
                    ws.send(JSON.stringify({ type: 'accessStats', stats }));
                    break;

                case 'TOGGLE_REGISTRATION_MODE':
                    const device = await Device.findOneAndUpdate(
                        { deviceId: data.deviceId },
                        { isRegistrationMode: data.enabled },
                        { new: true }
                    );
                    broadcast({
                        type: 'deviceUpdated',
                        device: device.toObject()
                    });
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process request'
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

// API Routes

// Example API endpoints for Faculty
app.get('/api/faculty', async (req, res) => {
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
                { 'personalInfo.email': { $regex: search, $options: 'i' } },
                { 'employmentDetails.employeeId': { $regex: search, $options: 'i' } }
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

// ... add other faculty-related endpoints ...

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
                $unwind: '$department'
            },
            {
                $group: {
                    _id: '$department.name',
                    total: { $sum: 1 },
                    authorized: {
                        $sum: { $cond: ['$authorized', 1, 0] }
                    },
                    unauthorized: {
                        $sum: { $cond: ['$authorized', 0, 1] }
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
        PendingRegistration
    }
};