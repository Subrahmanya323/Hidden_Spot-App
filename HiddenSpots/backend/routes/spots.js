const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Spot = require('../models/Spot');
const { uploadBase64Image } = require('../config/cloudinary');

// GET /spots/nearby - Get spots within radius
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be between 0.1 and 50 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, radius = 5 } = req.query;
    const maxDistance = radius * 1000; // Convert km to meters

    const spots = await Spot.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance
        }
      }
    })
    .select('name coordinates category images avgRatings createdAt')
    .limit(50)
    .sort({ createdAt: -1 });

    res.json(spots);
  } catch (error) {
    console.error('Error fetching nearby spots:', error);
    res.status(500).json({ error: 'Failed to fetch nearby spots' });
  }
});

// GET /spots - Get spots with filtering and sorting
router.get('/', [
  query('filter.category').optional().isString(),
  query('filter.minVibe').optional().isFloat({ min: 0, max: 5 }),
  query('filter.minSafety').optional().isFloat({ min: 0, max: 5 }),
  query('filter.minUniqueness').optional().isFloat({ min: 0, max: 5 }),
  query('filter.minCrowd').optional().isFloat({ min: 0, max: 5 }),
  query('sort').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filter = {}, sort, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter query
    let query = {};
    
    if (filter.category) {
      const categories = filter.category.split(',');
      query.category = { $in: categories };
    }

    if (filter.minVibe) query['avgRatings.vibe'] = { $gte: parseFloat(filter.minVibe) };
    if (filter.minSafety) query['avgRatings.safety'] = { $gte: parseFloat(filter.minSafety) };
    if (filter.minUniqueness) query['avgRatings.uniqueness'] = { $gte: parseFloat(filter.minUniqueness) };
    if (filter.minCrowd) query['avgRatings.crowd'] = { $gte: parseFloat(filter.minCrowd) };

    // Build sort query
    let sortQuery = { createdAt: -1 }; // Default sort by newest
    
    if (sort) {
      const [field, order] = sort.split(':');
      const sortOrder = order === 'desc' ? -1 : 1;
      
      if (field === 'distance' && filter.nearby) {
        // Handle distance sorting if coordinates provided
        const { lat, lng } = filter.nearby;
        if (lat && lng) {
          query.coordinates = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              }
            }
          };
        }
      } else if (field.startsWith('avgRatings.')) {
        sortQuery = { [field]: sortOrder };
      } else {
        sortQuery = { [field]: sortOrder };
      }
    }

    const spots = await Spot.find(query)
      .populate('comments', 'text isAnonymous username createdAt')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Spot.countDocuments(query);

    res.json({
      spots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ error: 'Failed to fetch spots' });
  }
});

// GET /spots/:id - Get specific spot details
router.get('/:id', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id)
      .populate('comments', 'text isAnonymous username createdAt displayName')
      .sort({ 'comments.createdAt': -1 });

    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    res.json(spot);
  } catch (error) {
    console.error('Error fetching spot:', error);
    res.status(500).json({ error: 'Failed to fetch spot' });
  }
});

// POST /spots - Create new spot
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('category').isIn(['Romantic', 'Serene', 'Creative', 'Adventure', 'Food', 'Other']).withMessage('Invalid category'),
  body('story').trim().isLength({ min: 1, max: 2000 }).withMessage('Story is required and must be less than 2000 characters'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of 2 numbers'),
  body('coordinates.*').isFloat({ min: -180, max: 180 }).withMessage('Invalid coordinate values'),
  body('ratings.vibe').optional().isFloat({ min: 1, max: 5 }),
  body('ratings.safety').optional().isFloat({ min: 1, max: 5 }),
  body('ratings.uniqueness').optional().isFloat({ min: 1, max: 5 }),
  body('ratings.crowd').optional().isFloat({ min: 1, max: 5 }),
  body('creatorInfo.isAnonymous').optional().isBoolean(),
  body('creatorInfo.username').optional().trim().isLength({ max: 50 }),
  body('images').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category,
      story,
      coordinates,
      ratings = {},
      creatorInfo = {},
      images = []
    } = req.body;

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (const imageData of images) {
      try {
        const imageUrl = await uploadBase64Image(imageData);
        uploadedImages.push(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(400).json({ error: 'Failed to upload one or more images' });
      }
    }

    // Create spot data
    const spotData = {
      name,
      category,
      story,
      coordinates: {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]] // [lng, lat]
      },
      images: uploadedImages,
      creatorInfo
    };

    // Add initial ratings if provided
    if (Object.keys(ratings).length > 0) {
      spotData.ratings = {};
      Object.keys(ratings).forEach(key => {
        if (ratings[key] !== undefined) {
          spotData.ratings[key] = [ratings[key]];
        }
      });
    }

    const spot = new Spot(spotData);
    await spot.save();

    res.status(201).json(spot);
  } catch (error) {
    console.error('Error creating spot:', error);
    res.status(500).json({ error: 'Failed to create spot' });
  }
});

// POST /spots/:id/rate - Add rating to spot
router.post('/:id/rate', [
  body('vibe').optional().isFloat({ min: 1, max: 5 }),
  body('safety').optional().isFloat({ min: 1, max: 5 }),
  body('uniqueness').optional().isFloat({ min: 1, max: 5 }),
  body('crowd').optional().isFloat({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    const ratingData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        ratingData[key] = req.body[key];
      }
    });

    if (Object.keys(ratingData).length === 0) {
      return res.status(400).json({ error: 'At least one rating must be provided' });
    }

    await spot.addRating(ratingData);
    res.json(spot);
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

module.exports = router; 