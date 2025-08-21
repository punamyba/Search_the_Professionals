import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/user.model.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import experienceRoutes from './routes/experience.route.js';
import educationRoutes from './routes/education.route.js';
import EditProfile from './models/editProfile.model.js';
import { authMiddleware } from './middleware/auth.middleware.js';

// Load environment variables
dotenv.config();

const app = express();


// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Added PATCH
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/experience', experienceRoutes);
app.use('/api/user/education', educationRoutes); // Add this line
// Make sure this line is added:
app.use('/api/user', EditProfile);
// Test auth route to verify JWT token is working
app.get('/api/user/test-auth', authMiddleware, (req, res) => {
    res.json({ 
        message: 'Auth working', 
        user: req.user 
    });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb+srv://punamwaiba2:PunamWaiba2004@cluster0.zh0mrow.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0";

async function connectDatabase() {
    try {
        await mongoose.connect(uri);
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Start Server with Database Connection
async function startServer() {
    try {
        await connectDatabase();
                
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Experience API: http://localhost:${PORT}/api/user/experience`);
            console.log(`Test Auth: http://localhost:${PORT}/api/user/test-auth`);
        });
            
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Debug routes
app.get('/api/debug/users', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const allUsers = await User.find({}, '-password').sort({ createdAt: -1 });
                
        console.log(' Database Debug Info:');
        console.log(' Total users in database:', totalUsers);
        console.log(' All users:', allUsers.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            createdAt: u.createdAt
        })));
                
        res.json({
            totalCount: totalUsers,
            users: allUsers,
            message: `Found ${totalUsers} users in database`
        });
            
    } catch (error) {
        console.error('Database check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Database status check
app.get('/api/debug/db-status', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected', 
            2: 'connecting',
            3: 'disconnecting'
        };
                
        res.json({
            status: states[dbState],
            database: mongoose.connection.name,
            host: mongoose.connection.host
        });
            
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

startServer();