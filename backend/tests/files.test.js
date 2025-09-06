const request = require('supertest');
const app = require('../src/server').app;
const prisma = require('../src/config/database');
const fs = require('fs');
const path = require('path');

describe('File Upload API', () => {
  let authToken;
  let userId;
  let testProject;

  const testUser = {
    name: 'File Test User',
    email: 'file.test@example.com',
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
        name: 'Test Project for Files',
        summary: 'Project for file testing'
      });
    testProject = projectResponse.body.project;

    // Create a test file for upload testing
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing.');
  });

  beforeEach(async () => {
    // Clean up test attachments
    await prisma.attachment.deleteMany({
      where: { projectId: testProject.id }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.attachment.deleteMany({
      where: { projectId: testProject.id }
    });
    await prisma.project.deleteMany({
      where: { id: testProject.id }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });

    // Clean up test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    await prisma.$disconnect();
  });

  describe('POST /api/files/upload', () => {
    it('should upload file successfully', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('projectId', testProject.id.toString())
        .attach('files', testFilePath)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Files uploaded successfully');
      expect(response.body).toHaveProperty('attachments');
      expect(Array.isArray(response.body.attachments)).toBe(true);
      expect(response.body.attachments.length).toBe(1);
      expect(response.body.attachments[0]).toHaveProperty('filename');
      expect(response.body.attachments[0]).toHaveProperty('originalName');
      expect(response.body.attachments[0]).toHaveProperty('size');
    });

    it('should not upload without file', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('projectId', testProject.id.toString())
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No files uploaded');
    });

    it('should not upload without project ID', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Project ID is required');
    });

    it('should not upload without authentication', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');

      const response = await request(app)
        .post('/api/files/upload')
        .field('projectId', testProject.id.toString())
        .attach('files', testFilePath)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('GET /api/files/project/:projectId', () => {
    let testAttachment;

    beforeEach(async () => {
      // Upload a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('projectId', testProject.id.toString())
        .attach('files', testFilePath);
      
      testAttachment = uploadResponse.body.attachments[0];
    });

    it('should get project files', async () => {
      const response = await request(app)
        .get(`/api/files/project/${testProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('attachments');
      expect(Array.isArray(response.body.attachments)).toBe(true);
      expect(response.body.attachments.length).toBe(1);
      expect(response.body.attachments[0]).toHaveProperty('filename');
      expect(response.body.attachments[0]).toHaveProperty('originalName');
    });

    it('should not get files without authentication', async () => {
      const response = await request(app)
        .get(`/api/files/project/${testProject.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });

  describe('DELETE /api/files/:id', () => {
    let testAttachment;

    beforeEach(async () => {
      // Upload a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('projectId', testProject.id.toString())
        .attach('files', testFilePath);
      
      testAttachment = uploadResponse.body.attachments[0];
    });

    it('should delete file successfully', async () => {
      const response = await request(app)
        .delete(`/api/files/${testAttachment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'File deleted successfully');
    });

    it('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .delete('/api/files/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'File not found or access denied');
    });
  });
});
