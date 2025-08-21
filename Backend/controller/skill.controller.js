// backend/controllers/skills.controller.js
import Skill from '../models/skill.model.js';
import User from '../models/user.model.js';

// Get all skills for a user
export async function getUserSkills(req, res) {
    try {
        const { userId } = req.params;
        
        const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            skills
        });
    } catch (error) {
        console.error('Get user skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Add a new skill
export async function addSkill(req, res) {
    try {
        const userId = req.user.id; // From auth middleware
        const { skillName, level } = req.body;

        // Validate required fields
        if (!skillName || skillName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Skill name is required'
            });
        }

        // Check if skill already exists for this user
        const existingSkill = await Skill.findOne({ 
            userId, 
            skillName: new RegExp(`^${skillName.trim()}$`, 'i') 
        });

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                message: 'This skill already exists in your profile'
            });
        }

        // Create new skill
        const newSkill = new Skill({
            userId,
            skillName: skillName.trim(),
            level: level || 'Intermediate'
        });

        await newSkill.save();

        res.status(201).json({
            success: true,
            message: 'Skill added successfully',
            skill: newSkill
        });

    } catch (error) {
        console.error('Add skill error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Update a skill
export async function updateSkill(req, res) {
    try {
        const userId = req.user.id;
        const { skillId } = req.params;
        const { skillName, level } = req.body;

        // Find and update skill
        const updatedSkill = await Skill.findOneAndUpdate(
            { _id: skillId, userId },
            { 
                skillName: skillName?.trim(),
                level: level || 'Intermediate'
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedSkill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found or you do not have permission to update it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            skill: updatedSkill
        });

    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Delete a skill
export async function deleteSkill(req, res) {
    try {
        const userId = req.user.id;
        const { skillId } = req.params;

        const deletedSkill = await Skill.findOneAndDelete({ 
            _id: skillId, 
            userId 
        });

        if (!deletedSkill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found or you do not have permission to delete it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully'
        });

    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}