const prisma = require('../config/database');
const { emitProjectUpdate, emitTeamMemberAdded, emitTeamMemberRemoved, emitNewNotification, emitNewMessage } = require('../config/websocket');

const createProject = async (req, res) => {
  try {
    const { name, summary } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        summary,
        createdBy: userId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Add creator as project admin
    const membership = await prisma.teamMembership.create({
      data: {
        projectId: project.id,
        userId: userId,
        role: 'admin'
      }
    });

    // Emit project creation (only to creator for now)
    emitProjectUpdate(project.id, project);

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add task progress summary
    const projectsWithProgress = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        taskProgress: {
          total: totalTasks,
          completed: completedTasks,
          percentage: progress
        }
      };
    });

    res.json({
      projects: projectsWithProgress
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        messages: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, summary } = req.body;
    const userId = req.user.id;

    // Check if user is project admin
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId,
        role: 'admin'
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Only project admins can update project details' });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(summary !== undefined && { summary })
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is project creator
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        createdBy: userId
      }
    });

    if (!project) {
      return res.status(403).json({ error: 'Only project creators can delete projects' });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;
    const userId = req.user.id;

    // Check if user is project admin
    const adminMembership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId,
        role: 'admin'
      }
    });

    if (!adminMembership) {
      return res.status(403).json({ error: 'Only project admins can add team members' });
    }

    // Find user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userToAdd.id
      }
    });

    if (existingMembership) {
      return res.status(409).json({ error: 'User is already a team member' });
    }

    const membership = await prisma.teamMembership.create({
      data: {
        projectId: parseInt(id),
        userId: userToAdd.id,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Emit team member addition
    emitTeamMemberAdded(parseInt(id), membership);

    // Create notification for new member
    const notification = await prisma.notification.create({
      data: {
        userId: userToAdd.id,
        content: `You have been added to project: ${membership.project.name}`,
        type: 'project_invitation'
      }
    });
    emitNewNotification(userToAdd.id, notification);

    res.status(201).json({
      message: 'Team member added successfully',
      membership
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.user.id;

    // Check if user is project admin or removing themselves
    const adminMembership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId,
        role: 'admin'
      }
    });

    const isSelfRemoval = userId === parseInt(memberUserId);

    if (!adminMembership && !isSelfRemoval) {
      return res.status(403).json({ error: 'Only project admins can remove team members' });
    }

    // Don't allow removing project creator
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      select: { createdBy: true }
    });

    if (project.createdBy === parseInt(memberUserId)) {
      return res.status(403).json({ error: 'Cannot remove project creator' });
    }

    const deletedMembership = await prisma.teamMembership.delete({
      where: {
        projectId_userId: {
          projectId: parseInt(id),
          userId: parseInt(memberUserId)
        }
      }
    });

    res.json({
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await prisma.teamMembership.findMany({
      where: {
        projectId: parseInt(id)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    res.json({
      members
    });
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
};

const addProjectMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, threadId } = req.body;
    const userId = req.user.id;

    if (!body) {
      return res.status(400).json({ error: 'Message body is required' });
    }

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        projectId: parseInt(id),
        userId: userId,
        body,
        threadId: threadId ? parseInt(threadId) : null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Emit real-time message
    emitNewMessage(parseInt(id), message);

    res.status(201).json({
      message: 'Message added successfully',
      data: message
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

const getProjectMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(id),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await prisma.message.findMany({
      where: {
        projectId: parseInt(id)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    const totalMessages = await prisma.message.count({
      where: {
        projectId: parseInt(id)
      }
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports = {
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
};
