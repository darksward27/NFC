import express from 'express';
import Class from '../models/Class.js';

const router = express.Router();

// Get classes by department
router.get('/classes', async (req, res) => {
    try {
        const { departmentId } = req.query;
        console.log('Fetching classes for department:', departmentId); // Debug log
        const classes = await Class.find({ departmentId });
        console.log('Found classes:', classes); // Debug log
        res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error); // Debug log
        res.status(500).json({ error: error.message });
    }
});

export default router; 