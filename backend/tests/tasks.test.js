const request = require('supertest');
const app = require('../src/server').app;
const prisma = require('../src/config/database');

describe('Tasks API', () => {
  let authToken;
  let userId;
  let testProject;
  let testTask;

  const testUser = {
    name: 'Task Test User',
    email: 'task.test@example.com',
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

    // Create a test project
    const projectResponse = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Project for Tasks',
        summary: 'Project for task testing'
      });
    testProject = projectResponse.body.project;
  });

  beforeEach(async () => {
    // Clean up test tasks
    await prisma.task.deleteMany({
      where: { projectId: testProject.id }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.task.deleteMany({
      where: { projectId: testProject.id }
    });
    await prisma.project.deleteMany({
      where: { id: testProject.id }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/projects/:id/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task for API testing',
        status: 'To-Do'
      };

      const response = await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.description).toBe(taskData.description);
      expect(response.body.task.status).toBe(taskData.status);
      expect(response.body.task.projectId).toBe(testProject.id);

      testTask = response.body.task;
    });

    it('should not create task without title', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Task without title' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Task title is required');
    });

    it('should not create task for non-existent project', async () => {
      const response = await request(app)
        .post('/api/projects/99999/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task for non-existent project' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should not create task without authentication', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .send({ title: 'Unauthorized task' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('GET /api/projects/:id/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task 1',
          description: 'First test task',
          status: 'To-Do'
        });

      await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task 2',
          description: 'Second test task',
          status: 'In Progress'
        });
    });

    it('should get all tasks for a project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.tasks.length).toBe(2);
      expect(response.body.tasks[0]).toHaveProperty('title');
      expect(response.body.tasks[0]).toHaveProperty('status');
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}/tasks?status=To-Do`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks.length).toBe(1);
      expect(response.body.tasks[0].status).toBe('To-Do');
    });

    it('should not get tasks without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}/tasks`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task for Update',
          description: 'Task for update testing',
          status: 'To-Do'
        });
      testTask = response.body.task;
    });

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated task description',
        status: 'In Progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(response.body.task.title).toBe(updateData.title);
      expect(response.body.task.description).toBe(updateData.description);
      expect(response.body.task.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found or access denied');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      const response = await request(app)
        .post(`/api/projects/${testProject.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task for Delete',
          description: 'Task for delete testing',
          status: 'To-Do'
        });
      testTask = response.body.task;
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found or access denied');
    });
  });
});
