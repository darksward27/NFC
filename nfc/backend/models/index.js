import mongoose from 'mongoose';
import '../models/Faculty.js';  // Just import the file to ensure it runs once
import '../models/AccessLog.js';  // Import AccessLog model file

// Export existing models
export const Faculty = mongoose.models.Faculty;
export const AccessLog = mongoose.models.AccessLog; 