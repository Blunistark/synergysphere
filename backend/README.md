# SynergySphere - Project Management API

A modern, scalable REST API for project management built with Express.js and PostgreSQL. Perfect for hackathons and production-ready applications.

## 🚀 Features

- **User Authentication** - JWT-based registration and login
- **Project Management** - Create, manage, and collaborate on projects
- **Task Management** - Kanban-style task tracking with assignments and deadlines
- **Team Collaboration** - Invite team members and manage project roles
- **Threaded Messaging** - Project-based communication system
- **Real-time Notifications** - Stay updated on project activities
- **Progress Tracking** - Visual task completion summaries

## 📋 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt hashing
- **Containerization**: Docker & Docker Compose
- **API Security**: Helmet, CORS, rate limiting

## 🏗️ Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Route handlers and business logic
├── middleware/      # Authentication and validation
├── routes/          # API route definitions
├── utils/           # Helper functions (JWT, password hashing)
└── server.js        # Main application entry point

prisma/
├── schema.prisma    # Database schema
└── seed.js          # Sample data for development
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HackstersJr/odoo-synergysphere.git
   cd SynergySphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Using Docker (Recommended for Development)

1. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

This will start both the API server and PostgreSQL database with sample data.

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Projects

#### Get User Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My New Project",
  "summary": "A brief description of the project"
}
```

#### Get Project Details
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "summary": "Updated description"
}
```

### Tasks

#### Get Project Tasks
```http
GET /api/projects/:id/tasks
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/projects/:id/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth system",
  "assigneeId": 1,
  "status": "To-Do",
  "dueDate": "2025-09-15T00:00:00.000Z"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress"
}
```

### Team Management

#### Add Team Member
```http
POST /api/projects/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "teammate@example.com",
  "role": "member"
}
```

#### Get Project Members
```http
GET /api/projects/:id/members
Authorization: Bearer <token>
```

### Messaging

#### Get Project Messages
```http
GET /api/projects/:id/messages
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/projects/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "body": "Hello team! Let's discuss the project timeline.",
  "threadId": null
}
```

### Notifications

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

## 📊 Database Schema

### Core Entities

- **User**: User accounts with secure authentication
- **Project**: Project containers with metadata
- **TeamMembership**: Many-to-many relationship between users and projects
- **Task**: Work items with assignments and status tracking
- **Message**: Threaded communication within projects
- **Notification**: User alerts and updates

### Key Relationships

- Users can be members of multiple projects
- Projects can have multiple team members with different roles
- Tasks belong to projects and can be assigned to team members
- Messages are organized by project and support threading
- Notifications are delivered to individual users

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-restart)
npm start           # Production start

# Database
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run database migrations
npm run db:deploy   # Deploy migrations (production)
npm run db:studio   # Open Prisma Studio (GUI)
npm run db:seed     # Seed database with sample data
```

## 🐳 Production Deployment

### Using Docker

1. **Build the image**
   ```bash
   docker build -t synergysphere-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

## 🧪 Testing

The application includes comprehensive error handling and validation. Sample data is provided via the seed script for easy testing.

### Demo Accounts (after seeding)

- **john.doe@example.com** (Admin) - password: `password123`
- **jane.smith@example.com** (Member) - password: `password123`
- **mike.wilson@example.com** (Member) - password: `password123`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)

## 🚀 Performance Features

- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient queries with Prisma relations
- Connection pooling
- Health check endpoint for monitoring

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the hackathon community**
