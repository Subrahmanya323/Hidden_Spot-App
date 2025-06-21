const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  coordinates: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      required: true 
    } // [longitude, latitude]
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Romantic', 'Serene', 'Creative', 'Adventure', 'Food', 'Other'],
    default: 'Other'
  },
  story: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{ 
    type: String 
  }], // Array of Cloudinary URLs
  ratings: {
    vibe: [{ 
      type: Number, 
      min: 1, 
      max: 5 
    }],
    safety: [{ 
      type: Number, 
      min: 1, 
      max: 5 
    }],
    uniqueness: [{ 
      type: Number, 
      min: 1, 
      max: 5 
    }],
    crowd: [{ 
      type: Number, 
      min: 1, 
      max: 5 
    }]
  },
  avgRatings: {
    vibe: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    safety: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    uniqueness: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    crowd: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    }
  },
  comments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  creatorInfo: {
    isAnonymous: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      trim: true,
      maxlength: 50
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
spotSchema.index({ coordinates: '2dsphere' });

// Pre-save middleware to update average ratings
spotSchema.pre('save', function(next) {
  this.updateAverageRatings();
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update average ratings
spotSchema.pre('findOneAndUpdate', function(next) {
  this.updateAverageRatings();
  next();
});

// Method to calculate and update average ratings
spotSchema.methods.updateAverageRatings = function() {
  const ratingFields = ['vibe', 'safety', 'uniqueness', 'crowd'];
  
  ratingFields.forEach(field => {
    const ratings = this.ratings[field];
    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      this.avgRatings[field] = Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
    } else {
      this.avgRatings[field] = 0;
    }
  });
};

// Method to add a new rating
spotSchema.methods.addRating = function(ratingData) {
  const { vibe, safety, uniqueness, crowd } = ratingData;
  
  if (vibe !== undefined) this.ratings.vibe.push(vibe);
  if (safety !== undefined) this.ratings.safety.push(safety);
  if (uniqueness !== undefined) this.ratings.uniqueness.push(uniqueness);
  if (crowd !== undefined) this.ratings.crowd.push(crowd);
  
  this.updateAverageRatings();
  return this.save();
};

// Virtual for overall rating
spotSchema.virtual('overallRating').get(function() {
  const ratings = Object.values(this.avgRatings).filter(rating => rating > 0);
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Ensure virtual fields are serialized
spotSchema.set('toJSON', { virtuals: true });
spotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Spot', spotSchema); 