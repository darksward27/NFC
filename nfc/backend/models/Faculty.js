const mongoose = require('mongoose');

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

// Indexes
FacultySchema.index({ 'personalInfo.email': 1 });
FacultySchema.index({ 'employmentDetails.employeeId': 1 });
FacultySchema.index({ 'employmentDetails.department': 1 });
FacultySchema.index({ 'nfcCard.cardNumber': 1 });
FacultySchema.index({ 'employmentDetails.status': 1 });

// Pre-save middleware
FacultySchema.pre('save', async function(next) {
    if (this.isModified('personalInfo.email')) {
        this.personalInfo.email = this.personalInfo.email.toLowerCase();
    }
    
    if (this.isModified('employmentDetails.salary')) {
        const { basic, allowances, deductions } = this.employmentDetails.salary;
        if (basic < 0 || allowances < 0 || deductions < 0) {
            throw new Error('Salary components cannot be negative');
        }
    }

    next();
});

// Virtual fields
FacultySchema.virtual('fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

FacultySchema.virtual('age').get(function() {
    return Math.floor((new Date() - this.personalInfo.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

FacultySchema.virtual('totalExperience').get(function() {
    const { teaching, industry, research } = this.academicInfo.experience;
    return teaching + industry + research;
});

// Methods
FacultySchema.methods.calculateTotalSalary = function() {
    const { basic, allowances, deductions } = this.employmentDetails.salary;
    return (basic + allowances - deductions);
};

FacultySchema.methods.isCardValid = function() {
    if (!this.nfcCard || this.nfcCard.status !== 'active') {
        return false;
    }
    const now = new Date();
    return now >= this.nfcCard.issueDate && now <= this.nfcCard.expiryDate;
};

FacultySchema.methods.addAccessLog = function(accessPointId, status, reason = '') {
    this.accessLogs.push({
        accessPoint: accessPointId,
        status,
        reason
    });
    return this.save();
};

const Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = Faculty; 