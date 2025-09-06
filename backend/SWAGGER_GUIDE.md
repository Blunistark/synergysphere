# 📚 SynergySphere API Testing with Swagger

## 🚀 Quick Start

### Access Swagger UI
1. **Open your browser** and navigate to: `http://localhost:3000/api-docs`
2. **Alternative access**: Go to `http://localhost:3000/` (automatically redirects to API docs)

---

## 🔧 How to Test APIs with Swagger

### Step 1: Authentication First! 🔐

Before testing most endpoints, you need to authenticate:

1. **Register a new user** (if you don't have one):
   - Find the **Authentication** section
   - Click on `POST /api/auth/register`
   - Click **"Try it out"**
   - Fill in the request body:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - Click **"Execute"**
   - Copy the `token` from the response

2. **Or Login with existing user**:
   - Use `POST /api/auth/login`
   - Provide email and password
   - Copy the `token` from the response

### Step 2: Authorize Swagger 🔑

1. **Click the "Authorize" button** at the top of the Swagger page
2. **Enter your token** in the format: `Bearer YOUR_JWT_TOKEN_HERE`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Click "Authorize"**
4. **Click "Close"**

Now you're authenticated and can test protected endpoints!

---

## 🎯 Testing Different API Sections

### 1. **Authentication APIs** 🔐
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (requires auth)

**Example Test Flow:**
1. Register → Get token
2. Login → Verify token works
3. Get profile → Confirm user data

### 2. **Project Management APIs** 📁
- `POST /api/projects` - Create new project
- `GET /api/projects` - List user's projects
- `GET /api/projects/{id}` - Get specific project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

**Example Test Flow:**
1. Create project → Note the project ID
2. List projects → Verify it appears
3. Get project details → Check all data
4. Update project → Modify name/description
5. Add team members → Invite users

### 3. **Task Management APIs** ✅
- `POST /api/projects/{id}/tasks` - Create task in project
- `GET /api/projects/{id}/tasks` - List project tasks
- `PUT /api/tasks/{id}` - Update task status/details
- `DELETE /api/tasks/{id}` - Delete task

**Example Test Flow:**
1. Create task → Set title, description, status
2. List tasks → Filter by status
3. Update task → Change status to "In Progress"
4. Assign task → Set assigneeId

### 4. **Team Collaboration APIs** 👥
- `POST /api/projects/{id}/members` - Add team member
- `GET /api/projects/{id}/members` - List team members
- `DELETE /api/projects/{id}/members/{userId}` - Remove member
- `POST /api/projects/{id}/messages` - Send project message
- `GET /api/projects/{id}/messages` - Get project messages

### 5. **Notification APIs** 🔔
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

### 6. **File Upload APIs** 📎
- `POST /api/files/upload` - Upload files to project
- `GET /api/files/project/{projectId}` - List project files
- `GET /api/files/{id}/download` - Download file
- `DELETE /api/files/{id}` - Delete file

---

## 💡 Pro Testing Tips

### 1. **Test Complete Workflows**
```
Register User → Create Project → Add Tasks → Invite Team → Upload Files → Send Messages
```

### 2. **Test Error Scenarios**
- Try accessing endpoints without authentication
- Use invalid IDs (999999)
- Send incomplete data
- Test validation rules

### 3. **Check Response Codes**
- ✅ `200` - Success
- ✅ `201` - Created
- ❌ `400` - Bad Request (validation error)
- ❌ `401` - Unauthorized (no/invalid token)
- ❌ `403` - Forbidden (no permission)
- ❌ `404` - Not Found
- ❌ `409` - Conflict (duplicate data)

### 4. **Use Response Data**
- Copy IDs from responses to use in subsequent requests
- Note the data structure for frontend integration
- Check included relationships (user, project, task data)

---

## 🔄 Real-time Features Testing

While Swagger tests the REST API, our WebSocket features can be tested separately:

### WebSocket Test Client
1. **Open**: `file:///d:/odoo/SynergySphere/websocket-test.html` in browser
2. **Enter JWT token** (from Swagger login)
3. **Connect** to WebSocket server
4. **Join project rooms** using project IDs from Swagger
5. **Test real-time updates** by making changes via Swagger APIs

### What to Test:
- Task updates broadcast to project members
- New message notifications
- Team member additions/removals
- Typing indicators

---

## 📊 Rate Limiting Info

Our API has built-in rate limiting:
- **General APIs**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes  
- **Write Operations**: 50 requests per 5 minutes

You'll see rate limit headers in responses:
```
ratelimit-limit: 100
ratelimit-remaining: 95
ratelimit-reset: 900
```

---

## 🐛 Common Issues & Solutions

### Issue: "Access denied. No token provided"
**Solution**: Make sure you've authorized Swagger with your JWT token

### Issue: "Project not found or access denied"
**Solution**: Use a project ID that belongs to your authenticated user

### Issue: Rate limit exceeded
**Solution**: Wait for the reset time or use different endpoint categories

### Issue: Validation errors
**Solution**: Check the schema requirements in Swagger UI

---

## 🎯 Quick Test Checklist

✅ **Authentication**
- [ ] Register new user
- [ ] Login successfully  
- [ ] Get user profile

✅ **Project Management**
- [ ] Create project
- [ ] List projects
- [ ] Update project details
- [ ] Add team members

✅ **Task Management**  
- [ ] Create tasks
- [ ] Update task status
- [ ] Assign tasks to users
- [ ] Filter tasks by status

✅ **Communication**
- [ ] Send project messages
- [ ] View message history
- [ ] Check notifications

✅ **File Management**
- [ ] Upload files
- [ ] Download files
- [ ] List project attachments

---

## 🚀 Advanced Testing

### Automated Testing with Swagger
You can export API definitions and use tools like:
- **Postman** (import OpenAPI spec)
- **Insomnia** (import from URL)
- **curl** commands (copy from Swagger)

### API Integration Examples
Check our test files for integration examples:
- `tests/integration.test.js` - Working API calls
- `websocket-test.html` - Real-time features

---

**Happy Testing! 🎉**

*The Swagger UI provides interactive documentation where you can test every endpoint, see request/response examples, and understand the complete API structure.*
