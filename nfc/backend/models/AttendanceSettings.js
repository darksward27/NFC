import mongoose from 'mongoose';

const attendanceSettingsSchema = new mongoose.Schema({
    organizationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Organization'
    },
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
}, {
    timestamps: true  // Add timestamps
});

// Check if model exists before creating it
const AttendanceSettings = mongoose.models.AttendanceSettings || 
    mongoose.model('AttendanceSettings', attendanceSettingsSchema);

export default AttendanceSettings; 