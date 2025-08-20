// backend/controllers/experience.controller.js
import mongoose from 'mongoose';
import Experience from '../models/experience.model.js';

// Get all experiences for a specific user
export async function getUserExperiences(req, res) {
    try {
        const { userId } = req.params;
        
        console.log('Getting experiences for user ID:', userId);

        // Find experiences for the user, sorted by most recent first
        const experiences = await Experience.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Experiences retrieved successfully",
            experiences: experiences.map(exp => ({
                id: exp._id,
                title: exp.title,
                company: exp.company,
                employmentType: exp.employmentType,
                startMonth: exp.startMonth,       // Change gareko
                startYear: exp.startYear,         // Change gareko
                endMonth: exp.endMonth || '',     // Change gareko
                endYear: exp.endYear || '',       // Change gareko
                location: exp.location,
                locationType: exp.locationType,
                description: exp.description || '',
                isCurrentRole: exp.isCurrentRole
            }))
        });
    } catch (error) {
        console.error('Get user experiences error:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Create new experience
export async function createExperience(req, res) {
    try {
        const userId = req.user.id; // Fixed: using id instead of userId
        const experienceData = {
            ...req.body,
            userId
        };

        console.log('Creating experience for user:', userId);
        console.log('Experience data:', experienceData);

        const experience = new Experience(experienceData);
        await experience.save();

        res.status(201).json({
            message: "Experience created successfully",
            experience
        });
    } catch (error) {
        console.error('Create experience error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Update existing experience
export async function updateExperience(req, res) {
    try {
        const { experienceId } = req.params;
        const userId = req.user.id; // Fixed: using id instead of userId

        console.log('Updating experience:', experienceId, 'for user:', userId);

        // Check if experience exists and belongs to the user
        const existingExperience = await Experience.findOne({
            _id: experienceId,
            userId: userId
        });

        if (!existingExperience) {
            return res.status(404).json({
                message: 'Experience not found or you do not have permission to edit it'
            });
        }

        // Update the experience
        const updatedExperience = await Experience.findByIdAndUpdate(
            experienceId,
            req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            message: "Experience updated successfully",
            experience: updatedExperience
        });
    } catch (error) {
        console.error('Update experience error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid experience ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Delete experience
export async function deleteExperience(req, res) {
    try {
        const { experienceId } = req.params;
        const userId = req.user.id; // Fixed: using id instead of userId

        console.log('Deleting experience:', experienceId, 'for user:', userId);

        // Check if experience exists and belongs to the user
        const experience = await Experience.findOne({
            _id: experienceId,
            userId: userId
        });

        if (!experience) {
            return res.status(404).json({
                message: 'Experience not found or you do not have permission to delete it'
            });
        }

        // Delete the experience
        await Experience.findByIdAndDelete(experienceId);

        res.status(200).json({
            message: "Experience deleted successfully"
        });
    } catch (error) {
        console.error('Delete experience error:', error);
        
        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid experience ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

// Get single experience by ID
export async function getExperienceById(req, res) {
    try {
        const { experienceId } = req.params;
        const userId = req.user.id; // Fixed: using id instead of userId

        console.log('Getting experience:', experienceId, 'for user:', userId);

        const experience = await Experience.findOne({
            _id: experienceId,
            userId: userId
        });

        if (!experience) {
            return res.status(404).json({
                message: 'Experience not found'
            });
        }

        res.status(200).json({
            message: "Experience retrieved successfully",
            experience
        });
    } catch (error) {
        console.error('Get experience by ID error:', error);
        
        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid experience ID format'
            });
        }

        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}