const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users with different roles
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

  const demoUser4 = await prisma.user.upsert({
    where: { email: 'sarah.connor@example.com' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      passwordHash: await hashPassword('password123')
    }
  });

  const demoUser5 = await prisma.user.upsert({
    where: { email: 'alex.chen@example.com' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      passwordHash: await hashPassword('password123')
    }
  });

  // Create multiple demo projects with different characteristics
  const project1 = await prisma.project.create({
    data: {
      name: 'SynergySphere MVP',
      summary: 'Building the minimum viable product for our project management platform with core features including user authentication, project management, and task tracking.',
      createdBy: demoUser1.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      summary: 'Complete e-commerce solution with shopping cart, payment integration, inventory management, and customer support system.',
      createdBy: demoUser2.id
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      summary: 'Secure mobile banking application with account management, transfers, bill payments, and investment tracking.',
      createdBy: demoUser3.id
    }
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Healthcare Portal',
      summary: 'Patient management system for healthcare providers with appointment scheduling, medical records, and telehealth features.',
      createdBy: demoUser4.id
    }
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'AI Analytics Dashboard',
      summary: 'Advanced analytics platform using machine learning for business intelligence and predictive insights.',
      createdBy: demoUser5.id
    }
  });

  const project6 = await prisma.project.create({
    data: {
      name: 'Social Learning Platform',
      summary: 'Educational platform with course management, student progress tracking, and collaborative learning tools.',
      createdBy: demoUser1.id
    }
  });

  // Add team memberships for all projects
  await prisma.teamMembership.createMany({
    data: [
      // SynergySphere MVP Team
      { projectId: project1.id, userId: demoUser1.id, role: 'admin' },
      { projectId: project1.id, userId: demoUser2.id, role: 'member' },
      { projectId: project1.id, userId: demoUser3.id, role: 'member' },
      
      // E-Commerce Platform Team
      { projectId: project2.id, userId: demoUser2.id, role: 'admin' },
      { projectId: project2.id, userId: demoUser1.id, role: 'member' },
      { projectId: project2.id, userId: demoUser4.id, role: 'member' },
      { projectId: project2.id, userId: demoUser5.id, role: 'member' },
      
      // Mobile Banking App Team
      { projectId: project3.id, userId: demoUser3.id, role: 'admin' },
      { projectId: project3.id, userId: demoUser1.id, role: 'member' },
      { projectId: project3.id, userId: demoUser5.id, role: 'member' },
      
      // Healthcare Portal Team
      { projectId: project4.id, userId: demoUser4.id, role: 'admin' },
      { projectId: project4.id, userId: demoUser2.id, role: 'member' },
      { projectId: project4.id, userId: demoUser3.id, role: 'member' },
      
      // AI Analytics Dashboard Team
      { projectId: project5.id, userId: demoUser5.id, role: 'admin' },
      { projectId: project5.id, userId: demoUser1.id, role: 'member' },
      { projectId: project5.id, userId: demoUser3.id, role: 'member' },
      
      // Social Learning Platform Team
      { projectId: project6.id, userId: demoUser1.id, role: 'admin' },
      { projectId: project6.id, userId: demoUser2.id, role: 'member' },
      { projectId: project6.id, userId: demoUser4.id, role: 'member' },
      { projectId: project6.id, userId: demoUser5.id, role: 'member' }
    ]
  });

  // Create diverse demo tasks across all projects
  await prisma.task.createMany({
    data: [
      // SynergySphere MVP Tasks
      {
        projectId: project1.id,
        title: 'Set up database schema',
        description: 'Design and implement the PostgreSQL database schema with Prisma ORM for user management, projects, and tasks.',
        assigneeId: demoUser1.id,
        status: 'done',
        dueDate: new Date('2025-09-05')
      },
      {
        projectId: project1.id,
        title: 'Implement authentication API',
        description: 'Create secure user registration and login endpoints with JWT authentication and password hashing.',
        assigneeId: demoUser1.id,
        status: 'done',
        dueDate: new Date('2025-09-06')
      },
      {
        projectId: project1.id,
        title: 'Build project management API',
        description: 'Implement CRUD operations for projects and team management with proper authorization.',
        assigneeId: demoUser2.id,
        status: 'in-progress',
        dueDate: new Date('2025-09-08')
      },
      {
        projectId: project1.id,
        title: 'Create task management system',
        description: 'Implement task CRUD operations with status tracking, assignments, and due date management.',
        assigneeId: demoUser3.id,
        status: 'review',
        dueDate: new Date('2025-09-10')
      },
      {
        projectId: project1.id,
        title: 'Implement real-time messaging',
        description: 'Add WebSocket-based messaging system for project communication and notifications.',
        assigneeId: demoUser2.id,
        status: 'todo',
        dueDate: new Date('2025-09-12')
      },

      // E-Commerce Platform Tasks
      {
        projectId: project2.id,
        title: 'Product catalog setup',
        description: 'Create product database schema and admin interface for catalog management.',
        assigneeId: demoUser2.id,
        status: 'Done',
        dueDate: new Date('2025-08-20')
      },
      {
        projectId: project2.id,
        title: 'Shopping cart functionality',
        description: 'Implement add to cart, quantity updates, and cart persistence across sessions.',
        assigneeId: demoUser4.id,
        status: 'Done',
        dueDate: new Date('2025-08-25')
      },
      {
        projectId: project2.id,
        title: 'Payment gateway integration',
        description: 'Integrate Stripe payment processing with secure checkout flow and order confirmation.',
        assigneeId: demoUser1.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-15')
      },
      {
        projectId: project2.id,
        title: 'Inventory management system',
        description: 'Build inventory tracking with low stock alerts and automated reorder points.',
        assigneeId: demoUser5.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-20')
      },
      {
        projectId: project2.id,
        title: 'Customer review system',
        description: 'Implement product reviews and ratings with moderation capabilities.',
        assigneeId: demoUser4.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-25')
      },

      // Mobile Banking App Tasks
      {
        projectId: project3.id,
        title: 'Security architecture design',
        description: 'Design multi-layer security with encryption, fraud detection, and compliance standards.',
        assigneeId: demoUser3.id,
        status: 'Done',
        dueDate: new Date('2025-08-15')
      },
      {
        projectId: project3.id,
        title: 'Account balance APIs',
        description: 'Create secure APIs for account balance retrieval with real-time updates.',
        assigneeId: demoUser1.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-10')
      },
      {
        projectId: project3.id,
        title: 'Transfer functionality',
        description: 'Implement money transfers between accounts with transaction limits and verification.',
        assigneeId: demoUser5.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-18')
      },
      {
        projectId: project3.id,
        title: 'Bill payment system',
        description: 'Add utility bill payments with saved payees and scheduled payments.',
        assigneeId: demoUser3.id,
        status: 'To-Do',
        dueDate: new Date('2025-10-01')
      },

      // Healthcare Portal Tasks
      {
        projectId: project4.id,
        title: 'Patient registration system',
        description: 'Create secure patient onboarding with HIPAA-compliant data handling.',
        assigneeId: demoUser4.id,
        status: 'Done',
        dueDate: new Date('2025-08-30')
      },
      {
        projectId: project4.id,
        title: 'Appointment scheduling',
        description: 'Build calendar-based appointment booking with provider availability management.',
        assigneeId: demoUser2.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-12')
      },
      {
        projectId: project4.id,
        title: 'Medical records system',
        description: 'Implement secure medical record storage with access controls and audit trails.',
        assigneeId: demoUser3.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-22')
      },
      {
        projectId: project4.id,
        title: 'Telehealth integration',
        description: 'Add video consultation capabilities with session recording and notes.',
        assigneeId: demoUser4.id,
        status: 'To-Do',
        dueDate: new Date('2025-10-05')
      },

      // AI Analytics Dashboard Tasks
      {
        projectId: project5.id,
        title: 'Data pipeline architecture',
        description: 'Design scalable data ingestion and processing pipeline for real-time analytics.',
        assigneeId: demoUser5.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-14')
      },
      {
        projectId: project5.id,
        title: 'Machine learning models',
        description: 'Develop predictive models for sales forecasting and customer behavior analysis.',
        assigneeId: demoUser1.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-28')
      },
      {
        projectId: project5.id,
        title: 'Interactive dashboards',
        description: 'Create customizable dashboards with drill-down capabilities and real-time updates.',
        assigneeId: demoUser3.id,
        status: 'To-Do',
        dueDate: new Date('2025-10-10')
      },

      // Social Learning Platform Tasks
      {
        projectId: project6.id,
        title: 'Course management system',
        description: 'Build instructor tools for course creation, content upload, and student enrollment.',
        assigneeId: demoUser1.id,
        status: 'In Progress',
        dueDate: new Date('2025-09-16')
      },
      {
        projectId: project6.id,
        title: 'Student progress tracking',
        description: 'Implement learning analytics with progress visualization and achievement badges.',
        assigneeId: demoUser2.id,
        status: 'To-Do',
        dueDate: new Date('2025-09-30')
      },
      {
        projectId: project6.id,
        title: 'Collaborative tools',
        description: 'Add discussion forums, group projects, and peer review functionality.',
        assigneeId: demoUser4.id,
        status: 'To-Do',
        dueDate: new Date('2025-10-15')
      },
      {
        projectId: project6.id,
        title: 'Mobile app development',
        description: 'Create native mobile apps for iOS and Android with offline content access.',
        assigneeId: demoUser5.id,
        status: 'To-Do',
        dueDate: new Date('2025-11-01')
      }
    ]
  });

  // Create demo messages across projects
  await prisma.message.createMany({
    data: [
      // SynergySphere MVP Messages
      {
        projectId: project1.id,
        userId: demoUser1.id,
        body: 'Welcome to the SynergySphere MVP project! Let\'s build something amazing together. Our goal is to create a robust project management platform.',
        threadId: null
      },
      {
        projectId: project1.id,
        userId: demoUser2.id,
        body: 'Excited to be part of this team! The project scope looks comprehensive. I\'ll start working on the project management APIs.',
        threadId: null
      },
      {
        projectId: project1.id,
        userId: demoUser3.id,
        body: 'Great to be working with you all! I\'ve reviewed the task management requirements and will begin implementation soon.',
        threadId: null
      },

      // E-Commerce Platform Messages
      {
        projectId: project2.id,
        userId: demoUser2.id,
        body: 'E-commerce project kickoff! We\'ve completed the product catalog setup. Next priority is the payment integration.',
        threadId: null
      },
      {
        projectId: project2.id,
        userId: demoUser4.id,
        body: 'Shopping cart functionality is working well. Added persistent cart and quantity management features.',
        threadId: null
      },
      {
        projectId: project2.id,
        userId: demoUser1.id,
        body: 'Working on Stripe integration. Security tests are passing and we\'re on track for the deadline.',
        threadId: null
      },

      // Mobile Banking Messages
      {
        projectId: project3.id,
        userId: demoUser3.id,
        body: 'Security architecture review completed. All compliance requirements have been addressed.',
        threadId: null
      },
      {
        projectId: project3.id,
        userId: demoUser5.id,
        body: 'Transfer functionality is progressing well. Implementing additional security layers for high-value transactions.',
        threadId: null
      },

      // Healthcare Portal Messages
      {
        projectId: project4.id,
        userId: demoUser4.id,
        body: 'Patient registration system is live! HIPAA compliance audit completed successfully.',
        threadId: null
      },
      {
        projectId: project4.id,
        userId: demoUser2.id,
        body: 'Appointment scheduling system integration with provider calendars is almost complete.',
        threadId: null
      },

      // AI Analytics Messages
      {
        projectId: project5.id,
        userId: demoUser5.id,
        body: 'Data pipeline architecture design is in progress. Evaluating different ML frameworks for optimal performance.',
        threadId: null
      },

      // Social Learning Messages
      {
        projectId: project6.id,
        userId: demoUser1.id,
        body: 'Social learning platform development started! Course management system mockups are ready for review.',
        threadId: null
      }
    ]
  });

  // Create comprehensive demo notifications
  await prisma.notification.createMany({
    data: [
      // Task assignment notifications
      {
        userId: demoUser2.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Build project management API in SynergySphere MVP'
      },
      {
        userId: demoUser3.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Create task management system in SynergySphere MVP'
      },
      {
        userId: demoUser4.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Shopping cart functionality in E-Commerce Platform'
      },
      {
        userId: demoUser5.id,
        type: 'task_assigned',
        content: 'You have been assigned to task: Transfer functionality in Mobile Banking App'
      },

      // Project message notifications
      {
        userId: demoUser1.id,
        type: 'project_message',
        content: 'New message in SynergySphere MVP project from Jane Smith'
      },
      {
        userId: demoUser2.id,
        type: 'project_message',
        content: 'New message in E-Commerce Platform project from Alex Chen'
      },
      {
        userId: demoUser3.id,
        type: 'project_message',
        content: 'New message in Mobile Banking App project from Sarah Connor'
      },

      // Project updates
      {
        userId: demoUser4.id,
        type: 'project_update',
        content: 'Healthcare Portal project milestone completed: Patient Registration System'
      },
      {
        userId: demoUser5.id,
        type: 'project_update',
        content: 'AI Analytics Dashboard project: Data pipeline design phase started'
      },

      // Due date reminders
      {
        userId: demoUser1.id,
        type: 'due_reminder',
        content: 'Task "Payment gateway integration" is due in 3 days'
      },
      {
        userId: demoUser2.id,
        type: 'due_reminder',
        content: 'Task "Appointment scheduling" is due in 5 days'
      },
      {
        userId: demoUser3.id,
        type: 'due_reminder',
        content: 'Task "Create task management system" is due in 4 days'
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Sample data created:');
  console.log('👥 5 Demo users:');
  console.log('   - john.doe@example.com (password: password123)');
  console.log('   - jane.smith@example.com (password: password123)');
  console.log('   - mike.wilson@example.com (password: password123)');
  console.log('   - sarah.connor@example.com (password: password123)');
  console.log('   - alex.chen@example.com (password: password123)');
  console.log('📁 6 Sample projects:');
  console.log('   - SynergySphere MVP (Project Management Platform)');
  console.log('   - E-Commerce Platform (Online Shopping Solution)');
  console.log('   - Mobile Banking App (Financial Services)');
  console.log('   - Healthcare Portal (Patient Management)');
  console.log('   - AI Analytics Dashboard (Business Intelligence)');
  console.log('   - Social Learning Platform (Educational Technology)');
  console.log('✅ 24 Sample tasks with various statuses and due dates');
  console.log('💬 12 Project messages for team communication');
  console.log('🔔 12 Notifications for task assignments and updates');
  console.log('');
  console.log('🚀 You can now log in and explore the different projects!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
