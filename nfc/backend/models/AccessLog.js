import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
    cardId: { 
        type: String, 
        required: true 
    },
    fingerprintId: { 
        type: Number, 
        required: true 
    },
    fingerprintAccuracy: { 
        type: Number 
    },
    deviceId: { 
        type: mongoose.Schema.Types.ObjectId,  // Change this line
        ref: 'Device',                         // Add this line
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    organizationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization' 
    },
    departmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Department' 
    },
    holderName: String,
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    authorized: { 
        type: Boolean, 
        default: false 
    },
    verificationMethod: { 
        type: String, 
        enum: ['card_only', 'card_and_fingerprint'], 
        default: 'card_and_fingerprint' 
    },
    ipAddress: String
});

// Use existing model if it's already compiled
const AccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);

export default AccessLog; 