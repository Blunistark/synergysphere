# 🚀 Railway Deployment Guide for SynergySphere

## Prerequisites
- GitHub account with your code pushed
- Railway account (free tier available)

## Step 1: Deploy to Railway Dashboard

### 1.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your email

### 1.2 Deploy from GitHub
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `synergysphere` repository
4. Railway will automatically detect the Dockerfile

### 1.3 Add PostgreSQL Database
1. In your project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL` environment variable

### 1.4 Configure Environment Variables
Go to your service settings and add these environment variables:

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-32-chars-minimum
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app-name.railway.app
```

**To generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5 Update CORS_ORIGIN
1. After deployment, note your Railway app URL (e.g., `https://synergysphere-production.railway.app`)
2. Update the `CORS_ORIGIN` environment variable with this URL
3. Redeploy

## Step 2: Monitor Deployment

### 2.1 Watch Build Logs
- In Railway dashboard, go to "Deployments" tab
- Watch the build process
- Look for "✅ SynergySphere is running!" message

### 2.2 Check Health
- Your app will be available at the Railway-provided URL
- Health check: `https://your-app.railway.app/health`
- API docs: `https://your-app.railway.app/api-docs`

## Step 3: Configure Auto-Deploy (Optional)

### 3.1 GitHub Actions Setup
1. In GitHub repository, go to Settings → Secrets and variables → Actions
2. Add new secret: `RAILWAY_TOKEN`
3. Get Railway token:
   - In Railway dashboard, go to Account Settings
   - Generate new token
   - Copy and paste into GitHub secret

### 3.2 Auto-Deploy Trigger
- Now every push to `main` branch will auto-deploy to Railway
- GitHub Actions will run tests and deploy automatically

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Railway service settings, go to "Settings" tab
2. Scroll to "Domains" section
3. Add your custom domain
4. Update DNS records as instructed

### 4.2 Update Environment Variables
- Update `CORS_ORIGIN` to your custom domain
- Update any hardcoded URLs in your frontend

## Step 5: Database Management

### 5.1 Run Migrations
Railway will automatically run `npx prisma migrate deploy` on startup.

### 5.2 Seed Database
To seed the database manually:
1. Go to Railway dashboard
2. Open service terminal (if available)
3. Run: `cd /app/backend && npm run db:seed`

### 5.3 Database Access
- Railway provides direct database connection details
- Use any PostgreSQL client to connect
- Connection details available in service environment variables

## Troubleshooting

### Common Issues:

1. **Build fails**: Check Dockerfile and dependencies
2. **Database connection fails**: Ensure PostgreSQL service is running
3. **CORS errors**: Update CORS_ORIGIN environment variable
4. **Port issues**: Railway automatically assigns port 8080

### Debug Commands:
```bash
# Check logs
railway logs

# Connect to service
railway shell

# Check environment variables
railway variables
```

### Health Check Endpoints:
- Main health: `https://your-app.railway.app/health`
- API status: `https://your-app.railway.app/api/health`

## Cost Estimation

### Railway Free Tier:
- $5 free credits per month
- Enough for development and small production apps
- No time limits

### Production Usage:
- Typically $10-20/month for a full application
- Includes PostgreSQL database
- Automatic HTTPS and custom domains

## Success Checklist

- [ ] Railway project created
- [ ] PostgreSQL service added
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Health check returns 200 OK
- [ ] Frontend loads correctly
- [ ] API endpoints working
- [ ] Database migrations completed
- [ ] WebSocket connections working (if applicable)

Your SynergySphere application should now be live at:
**https://your-app-name.railway.app**

🎉 Congratulations! Your application is now deployed to production.
