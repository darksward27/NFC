import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    section: String,
    capacity: Number,
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);

export default Class; 