const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// Get all faculty (your existing route)
router.get('/', async (req, res) => {
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

// Get single faculty member
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .populate('employmentDetails.department');
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty member:', error);
        res.status(500).json({ message: 'Failed to fetch faculty member' });
    }
});

// Create new faculty member
router.post('/', async (req, res) => {
    try {
        const faculty = new Faculty({
            ...req.body,
            'employmentDetails.department': req.body.departmentId,
            organizationId: req.body.organizationId
        });
        await faculty.save();
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update faculty member
router.put('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                'employmentDetails.department': req.body.departmentId
            },
            { new: true, runValidators: true }
        ).populate('employmentDetails.department');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete faculty member
router.delete('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ message: 'Failed to delete faculty' });
    }
});

// Update faculty card status
router.patch('/:id/card-status', async (req, res) => {
    try {
        const { status } = req.body;
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            { 'nfcCard.status': status },
            { new: true }
        );
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        console.error('Error updating card status:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;