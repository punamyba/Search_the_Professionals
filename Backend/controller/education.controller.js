// backend/controllers/education.controller.js
import mongoose from 'mongoose';
import Education from '../models/education.model.js';
import User from '../models/user.model.js'; 
// Get all education records for a specific user
export async function getUserEducation(req, res) {
    try {
        const { userId } = req.params;
        
        console.log('Getting education for user ID:', userId);

        // Find education records for the user, sorted by most recent first
        const education = await Education.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Education records retrieved successfully",
            education: education.map(edu => ({
                id: edu._id,
                school: edu.school,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: edu.startDate,
                endDate: edu.endDate,
                grade: edu.grade,
                activities: edu.activities
            }))
        });
    } catch (error) {
        console.error('Get user education error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Create new education record
export async function createEducation(req, res) {
    try {
        const userId = req.user.id;
        const educationData = {
            ...req.body,
            userId
        };

        console.log('Creating education for user:', userId);
        console.log('Education data:', educationData);

        const education = new Education(educationData);
        await education.save();

        // adding education id in user model
        await User.findByIdAndUpdate(userId, {
            $addToSet: { educationIds: education._id }
        });

        res.status(201).json({
            message: "Education created successfully",
            education: {
                id: education._id,
                school: education.school,
                degree: education.degree,
                fieldOfStudy: education.fieldOfStudy,
                startDate: education.startDate,
                endDate: education.endDate,
                grade: education.grade,
                activities: education.activities
            }
        });
    } catch (error) {
        console.error('Create education error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle custom validation errors from pre-save middleware
        if (error.message.includes('End year must be after start year') || 
            error.message.includes('End date must be after start date')) {
            return res.status(400).json({
                message: 'Date validation failed',
                error: error.message
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Update existing education record
export async function updateEducation(req, res) {
    try {
        const { educationId } = req.params;
        const userId = req.user.id;

        console.log('Updating education:', educationId, 'for user:', userId);

        // Check if education exists and belongs to the user
        const existingEducation = await Education.findOne({
            _id: educationId,
            userId: userId
        });

        if (!existingEducation) {
            return res.status(404).json({
                message: 'Education record not found or you do not have permission to edit it'
            });
        }

        // Update the education record
        const updatedEducation = await Education.findByIdAndUpdate(
            educationId,
            req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            message: "Education updated successfully",
            education: {
                id: updatedEducation._id,
                school: updatedEducation.school,
                degree: updatedEducation.degree,
                fieldOfStudy: updatedEducation.fieldOfStudy,
                startDate: updatedEducation.startDate,
                endDate: updatedEducation.endDate,
                grade: updatedEducation.grade,
                activities: updatedEducation.activities
            }
        });
    } catch (error) {
        console.error('Update education error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle custom validation errors
        if (error.message.includes('End year must be after start year') || 
            error.message.includes('End date must be after start date')) {
            return res.status(400).json({
                message: 'Date validation failed',
                error: error.message
            });
        }

        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid education ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Delete education record
export async function deleteEducation(req, res) {
    try {
        const { educationId } = req.params;
        const userId = req.user.id;

        console.log('Deleting education:', educationId, 'for user:', userId);

        // Check if education exists and belongs to the user
        const education = await Education.findOne({
            _id: educationId,
            userId: userId
        });

        if (!education) {
            return res.status(404).json({
                message: 'Education record not found or you do not have permission to delete it'
            });
        }

        // Delete the education record
        await Education.findByIdAndDelete(educationId);

        //removing education id from user model
        await User.findByIdAndUpdate(userId, {
            $pull: { educationIds: educationId }
        });

        res.status(200).json({
            message: "Education deleted successfully"
        });
    } catch (error) {
        console.error('Delete education error:', error);
        
        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid education ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Get single education record by ID
export async function getEducationById(req, res) {
    try {
        const { educationId } = req.params;
        const userId = req.user.id;

        console.log('Getting education:', educationId, 'for user:', userId);

        const education = await Education.findOne({
            _id: educationId,
            userId: userId
        });

        if (!education) {
            return res.status(404).json({
                message: 'Education record not found'
            });
        }

        res.status(200).json({
            message: "Education retrieved successfully",
            education: {
                id: education._id,
                school: education.school,
                degree: education.degree,
                fieldOfStudy: education.fieldOfStudy,
                startDate: education.startDate,
                endDate: education.endDate,
                grade: education.grade,
                activities: education.activities
            }
        });
    } catch (error) {
        console.error('Get education by ID error:', error);
        
        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid education ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}