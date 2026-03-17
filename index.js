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
app.get('/', (req, res) => {
  // Check if request accepts HTML (browser) or prefers JSON (API client)
  const acceptsHtml = req.accepts('html');
  const acceptsJson = req.accepts('json');
  
  if (acceptsHtml && !acceptsJson) {
    // Serve HTML page with Vercel Analytics for browser visitors
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-Commerce API</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 { color: #0070f3; }
          .endpoint {
            background: #f5f5f5;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-family: monospace;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            background: #0070f3;
            color: white;
            border-radius: 3px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>🛍️ E-Commerce API</h1>
        <p><span class="status">✓ Online</span></p>
        <p>Welcome to the E-Commerce API. This is a RESTful API built with Express.js.</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint">GET /api - Product endpoints</div>
        <div class="endpoint">POST /api/auth - Authentication endpoints</div>
        <div class="endpoint">GET /api/admin - Admin endpoints</div>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          For API documentation and usage, please refer to the project repository.
        </p>
        
        <script type="module">
          import { inject } from '@vercel/analytics';
          inject();
        </script>
      </body>
      </html>
    `);
  } else {
    // Return JSON for API clients
    res.json({ message: 'Welcome to the E-Commerce API' });
  }
});

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