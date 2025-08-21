// backend/controllers/edit.controller.js
import User from '../models/user.model.js';
import EditProfile from '../models/editProfile.model.js';

// Get current user profile for editing
export async function getCurrentUserProfile(req, res) {
    try {
        const userId = req.user.id; // From auth middleware
        
        const user = await User.findById(userId, { password: 0 })
            .populate('experienceIds')
            .populate('educationIds')
            .populate('editProfileId');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),
                experiences: user.experienceIds,
                educations: user.educationIds,
                editProfile: user.editProfileId
            }
        });
    } catch (error) {
        console.error('Get current user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Update user profile
export async function updateProfile(req, res) {
    try {
        const userId = req.user.id; // From auth middleware
        const {
            fullName,
            username,
            email,
            phone,
            bio,
            address,
            dateOfBirth,
            gender,
            employmentType,
            expectedSalary
        } = req.body;

        // Validate required fields
        const requiredFields = {
            fullName: 'Full name is required',
            username: 'Username is required',
            email: 'Email is required',
            phone: 'Phone number is required',
            dateOfBirth: 'Date of birth is required',
            employmentType: 'Employment type is required',
            address: 'Address is required'
        };

        const errors = {};
        for (const [field, message] of Object.entries(requiredFields)) {
            if (!req.body[field] || req.body[field].toString().trim() === '') {
                errors[field] = message;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Check if username is unique (excluding current user)
        if (username) {
            const existingUser = await User.findOne({ 
                username: new RegExp(`^${username}$`, 'i'),
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { username: 'Username is already taken' }
                });
            }
        }

        // Check if email is unique (excluding current user)
        if (email) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { email: 'Email is already taken' }
                });
            }
        }

        // Validate phone number
        if (phone) {
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            
            if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 7) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { phone: 'Please enter a valid phone number' }
                });
            }
        }

        // Validate date of birth
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (isNaN(birthDate.getTime()) || birthDate > today) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { dateOfBirth: 'Please enter a valid date of birth' }
                });
            }
            
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
                ? age - 1 
                : age;
            
            if (actualAge < 16 || actualAge > 65) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: { dateOfBirth: 'Age must be between 16-65 years' }
                });
            }
        }

        // Update basic user info (username, email, phone, bio, address)
        const userUpdateData = {
            username: username?.trim(),
            email: email?.trim().toLowerCase(),
            phone: phone?.trim(),
            bio: bio?.trim() || '',
            address: address?.trim()
        };

        // Update or create edit profile data
        const editProfileData = {
            userId,
            fullName: fullName?.trim(),
            dateOfBirth: new Date(dateOfBirth),
            gender: gender || '',
            employmentType,
            expectedSalary: expectedSalary || ''
        };

        // Update user basic info
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            userUpdateData,
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update or create edit profile
        let editProfile = await EditProfile.findOneAndUpdate(
            { userId },
            editProfileData,
            { 
                new: true, 
                upsert: true, 
                runValidators: true 
            }
        );

        // Update user's editProfileId if it's not set
        if (!updatedUser.editProfileId) {
            updatedUser.editProfileId = editProfile._id;
            await updatedUser.save();
        }

        // Get the complete updated user with populated data
        const finalUser = await User.findById(userId, { password: 0 })
            .populate('experienceIds')
            .populate('educationIds')
            .populate('editProfileId');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                ...finalUser.toObject(),
                experiences: finalUser.experienceIds,
                educations: finalUser.educationIds,
                editProfile: finalUser.editProfileId
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // Handle mongoose validation errors
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

// Check username availability
export async function checkUsernameAvailability(req, res) {
    try {
        const { username } = req.params;
        const userId = req.user?.id; // Optional, from auth middleware

        if (!username || username.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }

        const query = { username: new RegExp(`^${username}$`, 'i') };
        if (userId) {
            query._id = { $ne: userId };
        }

        const existingUser = await User.findOne(query);
        const isAvailable = !existingUser;

        res.status(200).json({
            success: true,
            available: isAvailable,
            message: isAvailable ? 'Username is available' : 'Username is already taken'
        });

    } catch (error) {
        console.error('Check username availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}