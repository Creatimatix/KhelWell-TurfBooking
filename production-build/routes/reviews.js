const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Turf = require('../models/Turf');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @desc    Get reviews for a turf
// @route   GET /api/reviews/turf/:turfId
// @access  Public
router.get('/turf/:turfId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: {
        turf_id: req.params.turfId,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    // Calculate average rating
    const avgRatingResult = await Review.findOne({
      where: {
        turf_id: req.params.turfId,
        is_active: true
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ]
    });

    const averageRating = avgRatingResult ? parseFloat(avgRatingResult.getDataValue('average') || 0) : 0;
    const totalReviews = avgRatingResult ? parseInt(avgRatingResult.getDataValue('count') || 0) : 0;

    res.json({
      reviews: reviews.rows.map(review => review.toJSON()),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(reviews.count / limit),
        totalItems: reviews.count,
        itemsPerPage: Number(limit)
      },
      summary: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews
      }
    });
  } catch (error) {
    console.error('Get turf reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a review for a turf
// @route   POST /api/reviews
// @access  Private (User only)
router.post('/', protect, authorize('user'), [
  body('turf_id').isInt().withMessage('Valid turf ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { turf_id, rating, comment } = req.body;

    // Check if turf exists
    const turf = await Turf.findByPk(turf_id);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check if user has booked this turf before (optional requirement)
    const hasBooked = await Booking.findOne({
      where: {
        user_id: req.user.id,
        turf_id: turf_id,
        status: { [Op.in]: ['confirmed', 'completed'] }
      }
    });

    if (!hasBooked) {
      return res.status(400).json({ 
        message: 'You can only review turfs that you have booked and used' 
      });
    }

    // Check if user has already reviewed this turf
    const existingReview = await Review.findOne({
      where: {
        user_id: req.user.id,
        turf_id: turf_id
      }
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this turf. You can update your existing review.' 
      });
    }

    // Create the review
    const review = await Review.create({
      user_id: req.user.id,
      turf_id: turf_id,
      rating: rating,
      comment: comment || null
    });

    // Update turf's average rating
    await updateTurfRating(turf_id);

    // Get the created review with user info
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        }
      ]
    });

    res.status(201).json({
      message: 'Review submitted successfully!',
      review: reviewWithUser.toJSON()
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to submit review. Please try again later.' });
  }
});

// @desc    Update user's review for a turf
// @route   PUT /api/reviews/:id
// @access  Private (User only)
router.put('/:id', protect, authorize('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { rating, comment } = req.body;

    // Find the review
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update the review
    await review.update({
      rating: rating,
      comment: comment || null
    });

    // Update turf's average rating
    await updateTurfRating(review.turf_id);

    // Get the updated review with user info
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        }
      ]
    });

    res.json({
      message: 'Review updated successfully!',
      review: updatedReview.toJSON()
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review. Please try again later.' });
  }
});

// @desc    Delete user's review
// @route   DELETE /api/reviews/:id
// @access  Private (User only)
router.delete('/:id', protect, authorize('user'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const turfId = review.turf_id;

    // Soft delete the review
    await review.update({ is_active: false });

    // Update turf's average rating
    await updateTurfRating(turfId);

    res.json({ message: 'Review deleted successfully!' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review. Please try again later.' });
  }
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private (User only)
router.get('/user', protect, authorize('user'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: {
        user_id: req.user.id,
        is_active: true
      },
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'sport_type', 'location_city', 'images']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      reviews: reviews.rows.map(review => review.toJSON()),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(reviews.count / limit),
        totalItems: reviews.count,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update turf's average rating
async function updateTurfRating(turfId) {
  try {
    const ratingStats = await Review.findOne({
      where: {
        turf_id: turfId,
        is_active: true
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ]
    });

    const averageRating = ratingStats ? parseFloat(ratingStats.getDataValue('average') || 0) : 0;
    const totalReviews = ratingStats ? parseInt(ratingStats.getDataValue('count') || 0) : 0;

    await Turf.update(
      {
        rating_average: Math.round(averageRating * 10) / 10,
        rating_count: totalReviews
      },
      {
        where: { id: turfId }
      }
    );
  } catch (error) {
    console.error('Update turf rating error:', error);
  }
}

module.exports = router; 