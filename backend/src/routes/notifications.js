const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', getUserNotifications);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

module.exports = router;
