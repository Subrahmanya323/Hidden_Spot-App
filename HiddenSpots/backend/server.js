const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import models
const Spot = require('./models/Spot');
const Comment = require('./models/Comment');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hidden_spots', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple distance calculation function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Routes
app.get('/api/spots/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = parseFloat(radius);

      // Use MongoDB geospatial query
      const nearbySpots = await Spot.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            $maxDistance: maxDistance * 1000 // Convert km to meters
          }
        }
      }).sort({ createdAt: -1 });

      res.json(nearbySpots);
    } else {
      // If no coordinates provided, return all spots
      const allSpots = await Spot.find().sort({ createdAt: -1 });
      res.json(allSpots);
    }
  } catch (error) {
    console.error('Error fetching nearby spots:', error);
    res.status(500).json({ error: 'Failed to fetch nearby spots' });
  }
});

app.get('/api/spots/:id', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }
    res.json(spot);
  } catch (error) {
    console.error('Error fetching spot:', error);
    res.status(500).json({ error: 'Failed to fetch spot' });
  }
});

// POST endpoint to create a new spot
app.post('/api/spots', async (req, res) => {
  try {
    const {
      name,
      story,
      category,
      coordinates,
      ratings,
      creatorInfo,
      images = []
    } = req.body;

    // Validate required fields
    if (!name || !story || !category || !coordinates || !ratings) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new spot with ratings
    const newSpot = new Spot({
      name,
      story,
      category,
      coordinates: {
        type: 'Point',
        coordinates: coordinates
      },
      images,
      ratings: {
        vibe: [ratings.vibe],
        safety: [ratings.safety],
        uniqueness: [ratings.uniqueness],
        crowd: [ratings.crowd]
      },
      creatorInfo: {
        isAnonymous: creatorInfo.isAnonymous || false,
        username: creatorInfo.isAnonymous ? null : (creatorInfo.username || 'Anonymous')
      }
    });

    await newSpot.save();
    console.log('✅ New spot added:', newSpot.name);
    res.status(201).json(newSpot);
  } catch (error) {
    console.error('Error creating spot:', error);
    res.status(500).json({ error: 'Failed to create spot' });
  }
});

app.get('/api/spots', async (req, res) => {
  try {
    const { filter = {}, sort, page = 1, limit = 20 } = req.query;
    let query = {};

    // Apply filters
    if (filter.category) {
      const categories = filter.category.split(',');
      query.category = { $in: categories };
    }

    if (filter.minVibe) {
      query['avgRatings.vibe'] = { $gte: parseFloat(filter.minVibe) };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default sort
    if (sort) {
      const [field, order] = sort.split(':');
      const sortOrder = order === 'desc' ? -1 : 1;
      
      if (field.startsWith('avgRatings.')) {
        sortObj = { [field]: sortOrder };
      } else {
        sortObj = { [field]: sortOrder };
      }
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const spots = await Spot.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Spot.countDocuments(query);

    res.json({
      spots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ error: 'Failed to fetch spots' });
  }
});

// GET comments for a spot
app.get('/api/spots/:spotId/comments', async (req, res) => {
  try {
    const { spotId } = req.params;
    const comments = await Comment.find({ spotId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a new comment
app.post('/api/spots/:spotId/comments', async (req, res) => {
  try {
    const { spotId } = req.params;
    const { text, creatorInfo } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const newComment = new Comment({
      spotId,
      text,
      isAnonymous: creatorInfo.isAnonymous || false,
      username: creatorInfo.isAnonymous ? null : (creatorInfo.username || 'Anonymous')
    });

    await newComment.save();
    console.log('✅ New comment added to spot:', spotId);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hidden Spots API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Using MongoDB for data persistence`);
}); 