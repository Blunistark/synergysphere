const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SynergySphere API',
      version: '1.0.0',
      description: 'A comprehensive project management API built with Express.js and PostgreSQL',
      contact: {
        name: 'SynergySphere Team',
        url: 'https://github.com/HackstersJr/odoo-synergysphere',
        email: 'support@synergysphere.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My Project' },
            summary: { type: 'string', example: 'Project description' },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            creator: { $ref: '#/components/schemas/User' },
            taskProgress: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 5 },
                completed: { type: 'integer', example: 2 },
                percentage: { type: 'integer', example: 40 }
              }
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            projectId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Implement authentication' },
            description: { type: 'string', example: 'Add JWT-based auth system' },
            assigneeId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['To-Do', 'In Progress', 'Done'], example: 'To-Do' },
            dueDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            assignee: { $ref: '#/components/schemas/User' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            projectId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            threadId: { type: 'integer', nullable: true },
            body: { type: 'string', example: 'Hello team!' },
            createdAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            type: { type: 'string', example: 'task_assigned' },
            content: { type: 'string', example: 'You have been assigned a new task' },
            read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation successful' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration'
      },
      {
        name: 'Projects',
        description: 'Project management operations'
      },
      {
        name: 'Tasks',
        description: 'Task management operations'
      },
      {
        name: 'Team Management',
        description: 'Team member management'
      },
      {
        name: 'Messaging',
        description: 'Project messaging system'
      },
      {
        name: 'Notifications',
        description: 'User notification management'
      },
      {
        name: 'System',
        description: 'System health and monitoring'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
