const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const {
  uploadProjectFile,
  uploadTaskFile,
  getProjectFiles,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');

const router = express.Router();

// All file routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/files/projects/{id}/upload:
 *   post:
 *     summary: Upload file to project
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 *       403:
 *         description: Access denied
 */
router.post('/projects/:id/upload', uploadSingle, handleUploadError, uploadProjectFile);

/**
 * @swagger
 * /api/files/tasks/{id}/upload:
 *   post:
 *     summary: Upload file to task
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 *       404:
 *         description: Task not found
 */
router.post('/tasks/:id/upload', uploadSingle, handleUploadError, uploadTaskFile);

/**
 * @swagger
 * /api/files/projects/{id}:
 *   get:
 *     summary: Get project files
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Project files retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/projects/:id', getProjectFiles);

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Download file
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/:id/download', downloadFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete file (uploader only)
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found or access denied
 */
router.delete('/:id', deleteFile);

module.exports = router;
