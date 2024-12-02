import express from 'express';
import AccessLog from '../models/AccessLog.js';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Faculty Attendance
router.get('/faculty-attendance', async (req, res) => {
    try {
        const { departmentId, date } = req.query;
        const faculty = await Faculty.find({ 
            'employmentDetails.department': departmentId,
            'employmentDetails.status': 'active'
        });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await AccessLog.find({
            userId: { $in: faculty.map(f => f._id) },
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        const facultyWithAttendance = faculty.map(f => ({
            _id: f._id,
            name: f.fullName,
            employeeId: f.employmentDetails.employeeId,
            department: f.employmentDetails.department,
            status: attendanceRecords.find(r => r.userId.toString() === f._id.toString())?.status || 'absent',
            time: attendanceRecords.find(r => r.userId.toString() === f._id.toString())?.timestamp || null
        }));

        res.json(facultyWithAttendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark Faculty Attendance
router.post('/mark-attendance', async (req, res) => {
    try {
        const { userId, status, date, type } = req.body;
        
        // First verify if the faculty exists and is active
        const faculty = await Faculty.findOne({
            _id: userId,
            'employmentDetails.status': 'active'
        });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found or inactive' });
        }

        const accessLog = new AccessLog({
            userId,
            status,
            timestamp: new Date(date),
            type: 'faculty',
            departmentId: faculty.employmentDetails.department
        });

        await accessLog.save();

        // Update faculty's accessLogs
        await faculty.addAccessLog(null, 'granted', `Attendance marked as ${status}`);

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;