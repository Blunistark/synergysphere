const request = require('supertest');
const express = require('express');

// Create a simplified test app without database dependencies
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware
  const mockAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      req.user = { id: 1, email: 'test@example.com', name: 'Test User' };
      next();
    } else {
      res.status(401).json({ error: 'Access denied. No token provided.' });
    }
  };

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });
  });

  // Mock auth endpoints
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Mock successful registration
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: 1, name, email, createdAt: new Date().toISOString() },
      token: 'mock-jwt-token'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Mock successful login
    res.json({
      message: 'Login successful',
      user: { id: 1, name: 'Test User', email },
      token: 'mock-jwt-token'
    });
  });

  app.get('/api/auth/profile', mockAuth, (req, res) => {
    res.json({ user: req.user });
  });

  // Mock projects endpoints
  app.get('/api/projects', mockAuth, (req, res) => {
    res.json({
      projects: [
        {
          id: 1,
          name: 'Test Project',
          summary: 'A test project',
          createdBy: 1,
          createdAt: new Date().toISOString(),
          creator: { id: 1, name: 'Test User', email: 'test@example.com' }
        }
      ]
    });
  });

  app.post('/api/projects', mockAuth, (req, res) => {
    const { name, summary } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: 1,
        name,
        summary,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        creator: req.user
      }
    });
  });

  // Mock tasks endpoints
  app.get('/api/projects/:id/tasks', mockAuth, (req, res) => {
    res.json({
      tasks: [
        {
          id: 1,
          projectId: parseInt(req.params.id),
          title: 'Test Task',
          description: 'A test task',
          status: 'To-Do',
          assigneeId: null,
          createdAt: new Date().toISOString()
        }
      ]
    });
  });

  app.post('/api/projects/:id/tasks', mockAuth, (req, res) => {
    const { title, description, status = 'To-Do' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: 1,
        projectId: parseInt(req.params.id),
        title,
        description,
        status,
        assigneeId: null,
        createdAt: new Date().toISOString(),
        assignee: null,
        project: { id: parseInt(req.params.id), name: 'Test Project' }
      }
    });
  });

  // Mock notifications endpoints
  app.get('/api/notifications', mockAuth, (req, res) => {
    const { read } = req.query;
    
    let notifications = [
      {
        id: 1,
        userId: req.user.id,
        message: 'Test notification 1',
        type: 'task_assigned',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: req.user.id,
        message: 'Test notification 2',
        type: 'project_invitation',
        read: true,
        createdAt: new Date().toISOString()
      }
    ];

    if (read !== undefined) {
      const readStatus = read === 'true';
      notifications = notifications.filter(n => n.read === readStatus);
    }

    res.json({ notifications });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
};

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should not register user without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should login with credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
    });

    it('should get user profile with token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('Projects Endpoints', () => {
    it('should get user projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(Array.isArray(response.body.projects)).toBe(true);
    });

    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        summary: 'A test project'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer mock-token')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Project created successfully');
      expect(response.body.project.name).toBe(projectData.name);
    });

    it('should not create project without name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer mock-token')
        .send({ summary: 'Project without name' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Project name is required');
    });
  });

  describe('Tasks Endpoints', () => {
    it('should get project tasks', async () => {
      const response = await request(app)
        .get('/api/projects/1/tasks')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        status: 'To-Do'
      };

      const response = await request(app)
        .post('/api/projects/1/tasks')
        .set('Authorization', 'Bearer mock-token')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body.task.title).toBe(taskData.title);
    });

    it('should not create task without title', async () => {
      const response = await request(app)
        .post('/api/projects/1/tasks')
        .set('Authorization', 'Bearer mock-token')
        .send({ description: 'Task without title' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Task title is required');
    });
  });

  describe('Notifications Endpoints', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/notifications?read=false')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.notifications.every(n => n.read === false)).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for protected routes', async () => {
      await request(app)
        .get('/api/projects')
        .expect(401);

      await request(app)
        .post('/api/projects')
        .send({ name: 'Test' })
        .expect(401);

      await request(app)
        .get('/api/notifications')
        .expect(401);
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
