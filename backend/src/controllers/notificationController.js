const prisma = require('../config/database');

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {
      userId: userId
    };

    if (unreadOnly === 'true') {
      whereConditions.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    const totalNotifications = await prisma.notification.count({
      where: whereConditions
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

const createNotification = async (userId, type, content) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        content
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
};
