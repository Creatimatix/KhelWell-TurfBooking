const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true
      },
      include: [
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'date', 'start_time', 'end_time', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ data: notifications.map(notification => notification.toJSON()) });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { 
        id: id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ is_read: true });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      {
        where: { 
          user_id: req.user.id,
          is_read: false
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { 
        user_id: req.user.id,
        is_read: false,
        is_active: true
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 