const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getUserTasks
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// Get all tasks assigned to current user
router.get('/', getUserTasks);

// Individual task operations
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
