const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  username: { 
    type: String,
    trim: true,
    maxlength: 50
  },
  spotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Spot', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ spotId: 1, createdAt: -1 });

// Virtual for display name
commentSchema.virtual('displayName').get(function() {
  if (this.isAnonymous) {
    return 'Anonymous';
  }
  return this.username || 'Unknown User';
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema); 