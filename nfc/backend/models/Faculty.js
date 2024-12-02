import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
    personalInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    academicInfo: {
        qualification: [{
            degree: String,
            field: String,
            institution: String,
            year: Number
        }],
        specialization: [String],
        experience: {
            teaching: {
                type: Number,
                default: 0
            },
            industry: {
                type: Number,
                default: 0
            },
            research: {
                type: Number,
                default: 0
            }
        },
        publications: [{
            title: String,
            journal: String,
            year: Number,
            url: String
        }]
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
        joiningDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'on_leave', 'terminated'],
            default: 'active'
        },
        salary: {
            basic: {
                type: Number,
                required: true
            },
            allowances: {
                type: Number,
                default: 0
            },
            deductions: {
                type: Number,
                default: 0
            }
        },
        contracts: [{
            startDate: Date,
            endDate: Date,
            type: String,
            document: String
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
        }
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    accessLogs: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        accessPoint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessPoint'
        },
        status: {
            type: String,
            enum: ['granted', 'denied'],
            required: true
        },
        reason: String
    }],
    documents: [{
        type: {
            type: String,
            required: true
        },
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Faculty = mongoose.model('Faculty', FacultySchema);

export default Faculty; 