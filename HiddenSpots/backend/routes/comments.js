const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Spot = require('../models/Spot');

// GET /comments/:spotId - Get comments for a specific spot
router.get('/:spotId', async (req, res) => {
  try {
    const { spotId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Verify spot exists
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    const comments = await Comment.find({ spotId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ spotId });

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /comments - Add comment to a spot
router.post('/', [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment text is required and must be less than 500 characters'),
  body('spotId').isMongoId().withMessage('Valid spot ID is required'),
  body('isAnonymous').optional().isBoolean(),
  body('username').optional().trim().isLength({ max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, spotId, isAnonymous = false, username } = req.body;

    // Verify spot exists
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    // Create comment
    const comment = new Comment({
      text,
      spotId,
      isAnonymous,
      username: isAnonymous ? undefined : username
    });

    await comment.save();

    // Add comment reference to spot
    spot.comments.push(comment._id);
    await spot.save();

    // Populate virtual fields for response
    await comment.populate('displayName');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// DELETE /comments/:id - Delete a comment (optional feature for future)
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove comment reference from spot
    await Spot.findByIdAndUpdate(comment.spotId, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router; 