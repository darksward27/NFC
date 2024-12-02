import express from 'express';
import Faculty from '../models/Faculty.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all faculty members for a department
router.get('/api/faculty/department/:departmentId', async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({ error: 'Invalid department ID' });
        }

        const faculty = await Faculty.find({ 
            'employmentDetails.department': departmentId 
        })
        .populate('employmentDetails.department')
        .populate('organizationId')
        .sort({ 'personalInfo.firstName': 1 });
        
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
});

// Create new faculty member
router.post('/api/faculty', async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();
        await faculty.populate('employmentDetails.department organizationId');
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Error creating faculty:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({ 
                error: `A faculty member with this ${field} already exists` 
            });
        } else {
            res.status(500).json({ error: 'Failed to create faculty member' });
        }
    }
});

// Delete faculty member
router.delete('/api/faculty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid faculty ID' });
        }

        const faculty = await Faculty.findByIdAndDelete(id);
        
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty member not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ error: 'Failed to delete faculty member' });
    }
});

export default router; 