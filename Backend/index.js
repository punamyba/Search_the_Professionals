import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// ✅ Fixed imports to match your actual file names
import authRoutes from './routes/auth.route.js';     // Changed from authRoutes.js
import userRoutes from './routes/user.route.js';     // Changed from userRoutes.js

// Load environment variables
dotenv.config();

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

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

// ✅ MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb+srv://punamwaiba2:PunamWaiba2004@cluster0.zh0mrow.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0";

async function connectDatabase() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// ✅ Start Server with Database Connection
async function startServer() {
    try {
        await connectDatabase();
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ Health check: http://localhost:${PORT}/health`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Add this temporary route to your backend to check all users
// Add this to your index.js or create a separate route file

app.get('/api/debug/users', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const allUsers = await User.find({}, '-password').sort({ createdAt: -1 });
        
        console.log('🔍 Database Debug Info:');
        console.log('📊 Total users in database:', totalUsers);
        console.log('👥 All users:', allUsers.map(u => ({ 
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

// Also add this to check database connection
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