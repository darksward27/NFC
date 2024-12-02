import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['Faculty', 'Student']
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'absent'
    },
    time: Date,
    deviceId: {
        type: String,
        ref: 'Device'
    },
    location: String,
    remarks: String,
    verificationMethod: {
        type: String,
        enum: ['nfc', 'manual', 'biometric', 'geolocation'],
        default: 'manual'
    }
}, {
    timestamps: true
});

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance; 