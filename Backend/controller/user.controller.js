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

        // Debug logs for skills
        console.log('User skillsIds array:', user.skillsIds);
        console.log('Skills count:', user.skillsIds?.length || 0);
        
        // Also check skills directly from Skills collection
        const directSkills = await Skill.find({ userId: id });
        console.log('Direct skills from Skills collection:', directSkills);
        
        // If skillsIds is empty but skills exist, fix the linking
        if ((!user.skillsIds || user.skillsIds.length === 0) && directSkills.length > 0) {
            console.log('Found orphaned skills, fixing links...');
            user.skillsIds = directSkills.map(skill => skill._id);
            await user.save();
            console.log('Fixed skill links for user');
        }
                                  
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

// Fix skills linking endpoint
export async function fixUserSkills(req, res) {
    try {
        const { userId } = req.params;
        
        console.log('Fixing skills for user:', userId);
        
        // Find all skills for this user
        const skills = await Skill.find({ userId });
        console.log('Found skills:', skills);
        
        if (skills.length === 0) {
            return res.json({
                success: true,
                message: 'No skills found for this user',
                fixedCount: 0
            });
        }
        
        const skillIds = skills.map(skill => skill._id);
        
        // Update user with skill IDs
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { skillsIds: skillIds },
            { new: true }
        ).populate('skillsIds');
        
        console.log('Updated user skillsIds:', updatedUser.skillsIds);
        
        res.json({
            success: true,
            message: `Fixed ${skillIds.length} skills for user`,
            fixedCount: skillIds.length,
            skills: updatedUser.skillsIds
        });
    } catch (error) {
        console.error('Fix skills error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

// Add skill to user (FIXED VERSION)
export async function addUserSkill(req, res) {
    try {
        const userId = req.user.id;
        const { skillName, level } = req.body;

        console.log('Adding skill for user:', userId);
        console.log('Skill data:', { skillName, level });

        // Validate required fields
        if (!skillName || skillName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Skill name is required'
            });
        }

        // Check if skill already exists in Skills collection
        const existingSkillInDB = await Skill.findOne({
            userId,
            skillName: new RegExp(`^${skillName.trim()}$`, 'i')
        });

        if (existingSkillInDB) {
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
        console.log('New skill created:', newSkill);

        // Find user and update skillsIds array
        const user = await User.findById(userId);
        if (!user) {
            // Clean up the skill if user not found
            await Skill.findByIdAndDelete(newSkill._id);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add skill ID to user's skillsIds array if not already there
        if (!user.skillsIds.includes(newSkill._id)) {
            user.skillsIds.push(newSkill._id);
            await user.save();
            console.log('Skill added to user skillsIds array');
        }

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

        // Find skill and verify it belongs to user
        const skill = await Skill.findOne({ _id: skillId, userId });
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found or you do not have permission to update it'
            });
        }

        // Check for duplicate skill name (if updating name)
        if (skillName && skillName.trim() && skillName.trim().toLowerCase() !== skill.skillName.toLowerCase()) {
            const duplicateSkill = await Skill.findOne({
                userId,
                _id: { $ne: skillId },
                skillName: new RegExp(`^${skillName.trim()}$`, 'i')
            });

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

        // Find and delete skill
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

        // Remove skill ID from user's skillsIds array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { skillsIds: skillId } }
        );

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