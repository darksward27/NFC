import express from 'express';
import AttendanceSettings from '../models/AttendanceSettings.js';

const router = express.Router();

// Get settings for an organization
router.get('/attendance/settings/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        let settings = await AttendanceSettings.findOne({ organizationId });
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = new AttendanceSettings({
                organizationId,
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
            });
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching attendance settings:', error);
        res.status(500).json({ error: 'Failed to fetch attendance settings' });
    }
});

// Update settings for an organization
router.post('/attendance/settings/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        const settings = await AttendanceSettings.findOneAndUpdate(
            { organizationId },
            req.body,
            { new: true, upsert: true }
        );

        res.json(settings);
    } catch (error) {
        console.error('Error updating attendance settings:', error);
        res.status(500).json({ error: 'Failed to update attendance settings' });
    }
});

export default router; 