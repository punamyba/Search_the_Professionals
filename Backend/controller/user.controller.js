// backend/controllers/user.controller.js
import mongoose from 'mongoose';
import User from "../models/user.model.js";

export async function getUserList(req, res) {
    try {
        const users = await User.find({}, { password: 0 })
            .populate('experienceIds')
            .populate('educationIds')
            .populate('editProfileId');
                     
        res.status(200).json({
            message: "Users retrieved successfully",
            users: users.map(user => ({
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
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
        .populate('editProfileId');
                         
        res.status(200).json({
            message: "Search results",
            users: users.map(user => ({
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
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
            hasEditProfile: !!user.editProfileId
        });
                         
        res.status(200).json({
            message: "User profile retrieved with all data",
            user: {
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
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