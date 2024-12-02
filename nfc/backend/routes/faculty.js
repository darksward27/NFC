const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// Get all faculty
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

// Add more routes here...

module.exports = router; 