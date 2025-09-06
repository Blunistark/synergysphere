const request = require('supertest');
const app = require('../src/server').app;
const prisma = require('../src/config/database');

describe('Projects API', () => {
  let authToken;
  let userId;
  let testProject;

  const testUser = {
    name: 'Project Test User',
    email: 'project.test@example.com',
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
    // Clean up test projects
    await prisma.project.deleteMany({
      where: { createdBy: userId }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.project.deleteMany({
      where: { createdBy: userId }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        summary: 'A test project for API testing'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Project created successfully');
      expect(response.body).toHaveProperty('project');
      expect(response.body.project.name).toBe(projectData.name);
      expect(response.body.project.summary).toBe(projectData.summary);
      expect(response.body.project.createdBy).toBe(userId);

      testProject = response.body.project;
    });

    it('should not create project without name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ summary: 'Project without name' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Project name is required');
    });

    it('should not create project without authentication', async () => {
      const projectData = {
        name: 'Unauthorized Project',
        summary: 'This should fail'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create a test project
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for GET',
          summary: 'Project for GET endpoint testing'
        });
      testProject = response.body.project;
    });

    it('should get user projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects.length).toBeGreaterThan(0);
      expect(response.body.projects[0]).toHaveProperty('name');
      expect(response.body.projects[0]).toHaveProperty('creator');
    });

    it('should not get projects without authentication', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('GET /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a test project
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for GET by ID',
          summary: 'Project for single GET endpoint testing'
        });
      testProject = response.body.project;
    });

    it('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('project');
      expect(response.body.project.id).toBe(testProject.id);
      expect(response.body.project.name).toBe(testProject.name);
      expect(response.body.project).toHaveProperty('tasks');
      expect(response.body.project).toHaveProperty('messages');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Project not found or access denied');
    });

    it('should not get project without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('PUT /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a test project
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for PUT',
          summary: 'Project for PUT endpoint testing'
        });
      testProject = response.body.project;
    });

    it('should update project successfully', async () => {
      const updateData = {
        name: 'Updated Project Name',
        summary: 'Updated project summary'
      };

      const response = await request(app)
        .put(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Project updated successfully');
      expect(response.body.project.name).toBe(updateData.name);
      expect(response.body.project.summary).toBe(updateData.summary);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Project not found or access denied');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a test project
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for DELETE',
          summary: 'Project for DELETE endpoint testing'
        });
      testProject = response.body.project;
    });

    it('should delete project successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Project deleted successfully');

      // Verify project is deleted
      const getResponse = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Project not found or access denied');
    });
  });
});
