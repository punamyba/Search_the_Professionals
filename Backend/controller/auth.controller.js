import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// backend/controller/auth.controller.js (Only the register function part)
export async function register(req, res) {
    try {
      const { username, email, password, phone, address, jobCategory, interests, bio } = req.body;
  
      if (!username || !email || !password || !phone || !address || !jobCategory) {
        return res.status(400).json({ message: 'All required fields must be filled' });
      }
  
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone,
        address,
        jobCategory,
        interests: interests || [],
        bio: bio || ""
      };
  
      const user = new User(userData);
      const validationError = user.validateSync();
      if (validationError) {
        return res.status(400).json({ message: 'Validation failed', error: validationError.message });
      }
  
      await user.save();
  
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
      console.error('❌ Registration error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
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