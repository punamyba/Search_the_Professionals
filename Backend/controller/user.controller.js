// backend/controllers/user.controller.js
import mongoose from 'mongoose';
import User from "../models/user.model.js";
import Skill from "../models/skill.model.js";

export async function getUserList(req, res) {
    try {
        const users = await User.find({}, { password: 0 })
            .populate('experienceIds')
            .populate('educationIds')
            .populate('skillsIds')
            .populate('editProfileId');
                      
        res.status(200).json({
            message: "Users retrieved successfully",
            users: users.map(user => ({
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
                skills: user.skillsIds,
                editProfile: user.editProfileId
            }))
        });
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
}

export async function searchUsers(req, res) {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }, { password: 0 })
        .populate('experienceIds')
        .populate('educationIds')
        .populate('skillsIds')
        .populate('editProfileId');
                                  
        res.status(200).json({
            message: "Search results",
            users: users.map(user => ({
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
                skills: user.skillsIds,
                editProfile: user.editProfileId
            }))
        });
    } catch (error) {
        console.error('Search users error:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
}

export async function getUserProfile(req, res) {
    try {
        const { id } = req.params;
                                  
        console.log('Getting profile for user ID:', id);
                                           
        const user = await User.findById(id, { password: 0 })
            .populate('experienceIds')
            .populate('educationIds')
            .populate('skillsIds')
            .populate('editProfileId');
                                  
        if (!user) {
            console.log('User not found with ID:', id);
            return res.status(404).json({ message: 'User not found' });
        }
                                  
        console.log('User found with populated data:', { 
            username: user.username,
            email: user.email,
            experienceCount: user.experienceIds?.length || 0,
            educationCount: user.educationIds?.length || 0,
            skillsCount: user.skillsIds?.length || 0,
            hasEditProfile: !!user.editProfileId
        });
                                  
        res.status(200).json({
            message: "User profile retrieved with all data",
            user: {
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
                skills: user.skillsIds,
                editProfile: user.editProfileId
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
}

// ===== SKILLS MANAGEMENT FUNCTIONS =====

// Add skill to user
export async function addUserSkill(req, res) {
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

        // Find user
        const user = await User.findById(userId).populate('skillsIds');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if skill already exists
        const existingSkill = user.skillsIds.find(skill => 
            skill.skillName.toLowerCase() === skillName.trim().toLowerCase()
        );

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

        // Add skill to user's skillsIds array
        user.skillsIds.push(newSkill._id);
        await user.save();

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

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This skill already exists in your profile'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Update user skill
export async function updateUserSkill(req, res) {
    try {
        const userId = req.user.id;
        const { skillId } = req.params;
        const { skillName, level } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid skill ID'
            });
        }

        // Find user and check if skill belongs to them
        const user = await User.findById(userId).populate('skillsIds');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skillExists = user.skillsIds.find(skill => skill._id.toString() === skillId);
        if (!skillExists) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found or you do not have permission to update it'
            });
        }

        // Check for duplicate skill name (if updating name)
        if (skillName && skillName.trim()) {
            const duplicateSkill = user.skillsIds.find(skill => 
                skill._id.toString() !== skillId && 
                skill.skillName.toLowerCase() === skillName.trim().toLowerCase()
            );

            if (duplicateSkill) {
                return res.status(400).json({
                    success: false,
                    message: 'A skill with this name already exists'
                });
            }
        }

        // Update the skill
        const updateData = {};
        if (skillName && skillName.trim()) updateData.skillName = skillName.trim();
        if (level) updateData.level = level;

        const updatedSkill = await Skill.findByIdAndUpdate(
            skillId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            skill: updatedSkill
        });

    } catch (error) {
        console.error('Update skill error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A skill with this name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Delete user skill
export async function deleteUserSkill(req, res) {
    try {
        const userId = req.user.id;
        const { skillId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid skill ID'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if skill belongs to user
        const skillIndex = user.skillsIds.findIndex(id => id.toString() === skillId);
        if (skillIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found or you do not have permission to delete it'
            });
        }

        // Delete skill from Skills collection
        const deletedSkill = await Skill.findByIdAndDelete(skillId);
        
        if (!deletedSkill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Remove skill ID from user's skillsIds array
        user.skillsIds.splice(skillIndex, 1);
        await user.save();

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