const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const demoUser1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: await hashPassword('password123')
    }
  });

  const demoUser2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      passwordHash: await hashPassword('password123')
    }
  });

  const demoUser3 = await prisma.user.upsert({
    where: { email: 'mike.wilson@example.com' },
    update: {},
    create: {
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      passwordHash: await hashPassword('password123')
    }
  });

  // Create demo project
  const demoProject = await prisma.project.create({
    data: {
      name: 'SynergySphere MVP',
      summary: 'Building the minimum viable product for our project management platform',
      createdBy: demoUser1.id
    }
  });

  // Add team memberships
  await prisma.teamMembership.createMany({
    data: [
      {
        projectId: demoProject.id,
        userId: demoUser1.id,
        role: 'admin'
      },
      {
        projectId: demoProject.id,
        userId: demoUser2.id,
        role: 'member'
      },
      {
        projectId: demoProject.id,
        userId: demoUser3.id,
        role: 'member'
      }
    ]
  });

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: demoProject.id,
        title: 'Set up database schema',
        description: 'Design and implement the PostgreSQL database schema with Prisma',
        assigneeId: demoUser1.id,
        status: 'Done',
        dueDate: new Date('2025-09-05')
      },
      {
        projectId: demoProject.id,
        title: 'Implement authentication API',
        description: 'Create user registration and login endpoints with JWT authentication',
        assigneeId: demoUser1.id,
        status: 'Done',
        dueDate: new Date('2025-09-06')
      },
      {
        projectId: demoProject.id,
        title: 'Build project management API',
        description: 'Implement CRUD operations for projects and team management',
        assigneeId: demoUser2.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-08')
      },
      {
        projectId: demoProject.id,
        title: 'Create task management system',
        description: 'Implement task CRUD with status tracking and assignments',
        assigneeId: demoUser3.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-10')
      },
      {
        projectId: demoProject.id,
        title: 'Implement messaging system',
        description: 'Add threaded messaging functionality for project communication',
        assigneeId: demoUser2.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-12')
      }
    ]
  });

  // Create demo messages
  await prisma.message.createMany({
    data: [
      {
        projectId: demoProject.id,
        userId: demoUser1.id,
        body: 'Welcome to the SynergySphere MVP project! Let\'s build something amazing together.',
        threadId: null
      },
      {
        projectId: demoProject.id,
        userId: demoUser2.id,
        body: 'Excited to be part of this team! The project scope looks great.',
        threadId: null
      },
      {
        projectId: demoProject.id,
        userId: demoUser3.id,
        body: 'I\'ve started working on the task management system. Will have updates soon.',
        threadId: null
      }
    ]
  });

  // Create demo notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser2.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Build project management API'
      },
      {
        userId: demoUser3.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Create task management system'
      },
      {
        userId: demoUser1.id,
        type: 'project_message',
        content: 'New message in SynergySphere MVP project'
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('Demo users created:');
  console.log('- john.doe@example.com (password: password123)');
  console.log('- jane.smith@example.com (password: password123)');
  console.log('- mike.wilson@example.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
