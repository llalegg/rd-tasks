# Tread EL Task Manager - Deployment Guide

## Database Deployment & Configuration

### Prerequisites
- Neon Database account (or PostgreSQL provider)
- Vercel account for hosting
- Node.js 18+ for local development

---

## Database Setup

### 1. Neon Database Configuration

#### Create Database
1. Go to [Neon Console](https://console.neon.tech)
2. Create new project: "tread-el-task-manager"
3. Copy the connection string format:
```
postgresql://username:password@hostname/database?sslmode=require
```

#### Environment Variables
Set in Vercel dashboard and local environment:
```bash
# Required for application
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# Optional for development
NODE_ENV=production
PORT=3000
```

### 2. Migration Deployment

#### Run Database Migrations
```bash
# Local development setup
npm install
vercel env pull .env.development.local

# Apply schema to database
npm run db:push

# Or run structured migrations
npm run db:migrate
```

#### Verify Migration Status
```bash
# Check migration history
ls -la migrations/
cat migrations/meta/_journal.json
```

---

## Vercel Deployment Configuration

### 1. Project Configuration

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    },
    {
      "src": "api/[...path].ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/[...path]"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

#### package.json Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "build:full": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "postdeploy": "node scripts/migrate.js"
  }
}
```

### 2. Environment Configuration

#### Production Environment Variables (Vercel Dashboard)
```bash
DATABASE_URL=postgresql://your_neon_connection_string
NODE_ENV=production
```

#### Development Environment Variables
```bash
DATABASE_URL=postgresql://your_local_or_dev_connection_string
NODE_ENV=development
PORT=3000
```

---

## Deployment Process

### 1. Initial Deployment

#### Step 1: Database Setup
```bash
# 1. Create Neon database
# 2. Add DATABASE_URL to Vercel environment variables
# 3. Deploy to trigger initial build
git push origin main
```

#### Step 2: Run Initial Migration
```bash
# Connect to production and run migrations
vercel env pull .env.production.local
npm run db:migrate
```

#### Step 3: Verify Deployment
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/tasks
curl https://your-app.vercel.app/api/users  
curl https://your-app.vercel.app/api/athletes
```

### 2. Subsequent Deployments

#### Database Schema Changes
```bash
# 1. Modify schema in shared/schema.ts
# 2. Generate migration
npm run db:push

# 3. Commit and deploy
git add .
git commit -m "feat: update database schema"
git push origin main

# 4. Run migrations on production (if needed)
npm run postdeploy
```

#### Application Updates
```bash
# Standard deployment
git add .
git commit -m "feat: add new feature"
git push origin main
# Vercel auto-deploys on push to main
```

---

## Database Seeding

### Production Data Setup

#### Create Initial Users
```sql
INSERT INTO users (id, name, email, role) VALUES
('1', 'Sarah Johnson', 'sarah@treadel.com', 'coach'),
('2', 'Michael Chen', 'michael@treadel.com', 'analyst'),
('3', 'Emma Davis', 'emma@treadel.com', 'therapist'),
('4', 'James Wilson', 'james@treadel.com', 'admin'),
('5', 'Lisa Rodriguez', 'lisa@treadel.com', 'coach');
```

#### Create Sample Athletes
```sql
INSERT INTO athletes (id, name, sport, team, position) VALUES
('1', 'Alex Thompson', 'Basketball', 'Lakers', 'Point Guard'),
('2', 'Jordan Martinez', 'Soccer', 'United', 'Forward'),
('3', 'Taylor Kim', 'Tennis', NULL, NULL),
('4', 'Casey Brown', 'Swimming', 'Sharks', 'Freestyle'),
('5', 'Morgan Lee', 'Track', 'Eagles', 'Sprinter');
```

#### Create Sample Tasks
```sql
INSERT INTO tasks (id, name, type, description, assignee_id, creator_id, status, priority) VALUES
('1', 'Initial Assessment', 'injury', 'Complete initial injury assessment for new athlete', '3', '1', 'new', 'high'),
('2', 'Performance Analysis', 'mechanicalanalysis', 'Analyze recent performance data', '2', '1', 'in_progress', 'medium'),
('3', 'Recovery Program', 'createprogram', 'Design recovery program for injured athlete', '3', '4', 'new', 'high');
```

---

## Monitoring & Maintenance

### 1. Health Checks

#### API Health Check
```bash
# Test all endpoints
curl -f https://your-app.vercel.app/api/tasks || echo "API Down"
curl -f https://your-app.vercel.app/api/users || echo "Users API Down"
curl -f https://your-app.vercel.app/api/athletes || echo "Athletes API Down"
```

#### Database Health Check
```bash
# Connection test
npm run check-db-connection
```

### 2. Backup Strategy

#### Neon Database Backups
- Automatic backups enabled by default
- Point-in-time recovery available
- Manual backup commands:
```bash
# Export schema
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Export data
pg_dump $DATABASE_URL --data-only > data_backup.sql
```

### 3. Performance Monitoring

#### Key Metrics to Monitor
- API response times
- Database query performance
- Error rates
- User activity levels

#### Recommended Tools
- Vercel Analytics
- Neon monitoring dashboard
- Custom logging in application

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check environment variables
vercel env ls

# Test connection locally
npm run dev
curl http://localhost:3000/api/tasks
```

#### 2. Migration Failures
```bash
# Check migration status
cat migrations/meta/_journal.json

# Reset if needed (DANGER: will lose data)
npm run db:push --force
```

#### 3. Vercel Build Errors
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency conflicts
```

#### 4. API 404 Errors
```bash
# Verify vercel.json configuration
# Check API handler in api/[...path].ts
# Ensure routes are properly registered
```

---

## Security Checklist

### Database Security
- [ ] DATABASE_URL uses SSL connection
- [ ] Database credentials are secure
- [ ] Regular security updates applied
- [ ] Access logs monitored

### Application Security
- [ ] Environment variables properly set
- [ ] No sensitive data in client code
- [ ] Input validation implemented
- [ ] CORS properly configured

### Deployment Security
- [ ] Vercel team access controlled
- [ ] GitHub repository access limited
- [ ] Production deployment protected
- [ ] Monitoring and alerting configured

---

## Support & Resources

### Documentation
- [Neon Database Docs](https://neon.tech/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### Team Contacts
- Database Administrator: [Contact]
- DevOps Lead: [Contact]
- Product Owner: [Contact]

### Emergency Procedures
- Database outage: [Escalation process]
- Application down: [Recovery steps]
- Data loss: [Backup restoration process]
