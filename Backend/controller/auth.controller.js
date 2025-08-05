import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        
        // Validate required fields
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        //  Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email' });
        }

        //  Check if user exists by username OR email
        const existing = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        //  Create user with proper data formatting
        const userData = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        };
        
        const user = new User(userData);
        
        //  Validate before saving
        const validationError = user.validateSync();
        if (validationError) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                error: validationError.message 
            });
        }
        
        await user.save();

        //  Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            process.env.JWT_SECRET || 'fallback_secret_key', 
            { expiresIn: "24h" }
        );

        return res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('❌ Registration error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        //  Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: messages 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'User already exists (duplicate key error)' 
            });
        }
        
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}

export async function login(req, res) {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        //  Allow login with username OR email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            process.env.JWT_SECRET || 'fallback_secret_key', 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}