const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || [
        'http://localhost:3000', 
        'https://projectmanagement.wewake.in',
        'https://synergysphere-production.up.railway.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected (${socket.userId})`);

    // Join user-specific room for notifications
    socket.join(`user_${socket.userId}`);

    // Join project rooms based on user's project memberships
    joinUserProjects(socket);

    // Handle joining specific project room
    socket.on('join_project', async (projectId) => {
      try {
        // Verify user is member of the project
        const membership = await prisma.teamMembership.findFirst({
          where: {
            projectId: parseInt(projectId),
            userId: socket.userId
          }
        });

        if (membership) {
          socket.join(`project_${projectId}`);
          socket.emit('joined_project', { projectId });
          console.log(`User ${socket.userId} joined project ${projectId}`);
        } else {
          socket.emit('error', { message: 'Access denied to project' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Handle leaving project room
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      socket.emit('left_project', { projectId });
      console.log(`User ${socket.userId} left project ${projectId}`);
    });

    // Handle typing indicator for messages
    socket.on('typing_start', (data) => {
      const { projectId } = data;
      socket.to(`project_${projectId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        projectId
      });
    });

    socket.on('typing_stop', (data) => {
      const { projectId } = data;
      socket.to(`project_${projectId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        projectId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected (${socket.userId})`);
    });
  });

  return io;
};

// Helper function to join user's project rooms
const joinUserProjects = async (socket) => {
  try {
    const memberships = await prisma.teamMembership.findMany({
      where: { userId: socket.userId },
      select: { projectId: true }
    });

    memberships.forEach(membership => {
      socket.join(`project_${membership.projectId}`);
    });
  } catch (error) {
    console.error('Error joining user projects:', error);
  }
};

// Emit real-time updates
const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project_${projectId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitTaskUpdate = (projectId, task) => {
  emitToProject(projectId, 'task_updated', {
    type: 'task_update',
    data: task,
    timestamp: new Date().toISOString()
  });
};

const emitNewMessage = (projectId, message) => {
  emitToProject(projectId, 'new_message', {
    type: 'new_message',
    data: message,
    timestamp: new Date().toISOString()
  });
};

const emitNewNotification = (userId, notification) => {
  emitToUser(userId, 'new_notification', {
    type: 'new_notification',
    data: notification,
    timestamp: new Date().toISOString()
  });
};

const emitProjectUpdate = (projectId, project) => {
  emitToProject(projectId, 'project_updated', {
    type: 'project_update',
    data: project,
    timestamp: new Date().toISOString()
  });
};

const emitTeamMemberAdded = (projectId, membership) => {
  emitToProject(projectId, 'team_member_added', {
    type: 'team_member_added',
    data: membership,
    timestamp: new Date().toISOString()
  });
};

const emitTeamMemberRemoved = (projectId, userId) => {
  emitToProject(projectId, 'team_member_removed', {
    type: 'team_member_removed',
    data: { userId, projectId },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  initializeWebSocket,
  emitToProject,
  emitToUser,
  emitTaskUpdate,
  emitNewMessage,
  emitNewNotification,
  emitProjectUpdate,
  emitTeamMemberAdded,
  emitTeamMemberRemoved
};
