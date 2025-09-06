const request = require('supertest');
const app = require('../src/server').app;
const prisma = require('../src/config/database');

describe('Notifications API', () => {
  let authToken;
  let userId;
  let testNotification;

  const testUser = {
    name: 'Notification Test User',
    email: 'notification.test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Clean up and create test user
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  beforeEach(async () => {
    // Clean up test notifications
    await prisma.notification.deleteMany({
      where: { userId: userId }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.notification.deleteMany({
      where: { userId: userId }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: userId,
            message: 'Test notification 1',
            type: 'task_assigned',
            read: false
          },
          {
            userId: userId,
            message: 'Test notification 2',
            type: 'project_invitation',
            read: true
          }
        ]
      });
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBe(2);
      expect(response.body.notifications[0]).toHaveProperty('message');
      expect(response.body.notifications[0]).toHaveProperty('type');
      expect(response.body.notifications[0]).toHaveProperty('read');
    });

    it('should filter unread notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?read=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.notifications.length).toBe(1);
      expect(response.body.notifications[0].read).toBe(false);
    });

    it('should not get notifications without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    beforeEach(async () => {
      // Create a test notification
      const notification = await prisma.notification.create({
        data: {
          userId: userId,
          message: 'Test notification for mark as read',
          type: 'task_assigned',
          read: false
        }
      });
      testNotification = notification;
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/notifications/${testNotification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification marked as read');
      expect(response.body.notification.read).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/notifications/99999/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Notification not found');
    });
  });
});
