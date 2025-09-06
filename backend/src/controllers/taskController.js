const prisma = require('../config/database');
const { emitTaskUpdate, emitNewNotification } = require('../config/websocket');

const createTask = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, assigneeId, status = 'To-Do', dueDate } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If assigneeId is provided, check if assignee is project member
    if (assigneeId) {
      const assigneeMembership = await prisma.teamMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: parseInt(assigneeId)
        }
      });

      if (!assigneeMembership) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId: parseInt(projectId),
        title,
        description,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        status,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Emit real-time task creation
    emitTaskUpdate(parseInt(projectId), task);

    // Create notification for assignee if different from creator
    if (assigneeId && parseInt(assigneeId) !== userId) {
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(assigneeId),
          content: `You have been assigned a new task: ${title}`,
          type: 'task_assigned'
        }
      });
      emitNewNotification(parseInt(assigneeId), notification);
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { status, assigneeId } = req.query;
    const userId = req.user.id;

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const whereConditions = {
      projectId: parseInt(projectId)
    };

    if (status) {
      whereConditions.status = status;
    }

    if (assigneeId) {
      whereConditions.assigneeId = parseInt(assigneeId);
    }

    const tasks = await prisma.task.findMany({
      where: whereConditions,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      tasks
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(id),
        project: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    res.json({
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigneeId, status, dueDate } = req.body;
    const userId = req.user.id;

    // Check if task exists and user has access
    const existingTask = await prisma.task.findFirst({
      where: {
        id: parseInt(id),
        project: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        project: true
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // If assigneeId is provided, check if assignee is project member
    if (assigneeId !== undefined && assigneeId !== null) {
      const assigneeMembership = await prisma.teamMembership.findFirst({
        where: {
          projectId: existingTask.projectId,
          userId: parseInt(assigneeId)
        }
      });

      if (!assigneeMembership) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId ? parseInt(assigneeId) : null;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Emit real-time task update
    emitTaskUpdate(existingTask.projectId, task);

    // Create notification for new assignee if changed
    if (assigneeId !== undefined && assigneeId !== existingTask.assigneeId) {
      if (assigneeId && parseInt(assigneeId) !== userId) {
        const notification = await prisma.notification.create({
          data: {
            userId: parseInt(assigneeId),
            content: `You have been assigned to task: ${task.title}`,
            type: 'task_assigned'
          }
        });
        emitNewNotification(parseInt(assigneeId), notification);
      }
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if task exists and user has access (project member)
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(id),
        project: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereConditions = {
      assigneeId: userId
    };

    if (status) {
      whereConditions.status = status;
    }

    const tasks = await prisma.task.findMany({
      where: whereConditions,
      include: {
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json({
      tasks
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getUserTasks
};
