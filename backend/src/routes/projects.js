const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectMembers,
  addProjectMessage,
  getProjectMessages
} = require('../controllers/projectController');
const {
  createTask,
  getProjectTasks
} = require('../controllers/taskController');

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD
router.get('/', getUserProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project tasks
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createTask);

// Team management
router.get('/:id/members', getProjectMembers);
router.post('/:id/members', addTeamMember);
router.delete('/:id/members/:userId', removeTeamMember);

// Project messaging
router.get('/:id/messages', getProjectMessages);
router.post('/:id/messages', addProjectMessage);

module.exports = router;
