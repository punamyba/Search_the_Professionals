import mongoose from 'mongoose';
import User from "../models/user.model.js";

export async function getUserList(req, res) {
    try {
        const users = await User.find({}, { password: 0 });
        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        console.error(' Get users error:', error);
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
        }, { password: 0 });
        
        res.status(200).json({
            message: "Search results",
            users
        });
    } catch (error) {
        console.error(' Search users error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}

export async function getUserProfile(req, res) {
    try {
        const { id } = req.params;
        
        console.log(' Getting profile for user ID:', id);
        console.log(' User ID length:', id.length);
        
        // TEMPORARY: ObjectId validation removed
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     console.log(' Invalid ObjectId format:', id);
        //     return res.status(400).json({ message: 'Invalid user ID format' });
        // }
        
        const user = await User.findById(id, { password: 0 });
        
        if (!user) {
            console.log(' User not found with ID:', id);
            
            // Debug: Show all users in database
            const allUsers = await User.find({}, { _id: 1, username: 1 });
            console.log(' Available users:', allUsers);
            
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log(' User found:', { username: user.username, email: user.email });
        
        res.status(200).json({
            message: "User profile retrieved",
            user
        });
    } catch (error) {
        console.error(' Get profile error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}