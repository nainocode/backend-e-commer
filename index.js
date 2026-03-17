import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';


// Load environment variables
dotenv.config();


const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: process.env.FRONTEND_URL, // Replace with your client's origin
    credentials: true
  }
));

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// ==================== Cloudinary Configuration ====================
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==================== Database Connection ====================
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// ==================== Routes ====================
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to the E-Commerce API' });
// });

// Product Routes
app.use('/api', productRoutes);
// Auth / User Routes
app.use('/api/auth', authRoutes);
// Admin Routes
app.use('/api/admin', adminRoutes);

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// ==================== Start Server ====================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});