import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // if it exists
import experienceRoutes from './routes/experience.route.js';

// Routes
app.use('/api/user/experience', experienceRoutes);

const app = express();

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5175',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // only if you have this

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
