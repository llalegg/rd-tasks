# Vercel Deployment Guide

This guide will help you deploy the Task Manager application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (we recommend Neon, Supabase, or Vercel Postgres)
3. Git repository pushed to GitHub, GitLab, or Bitbucket

## Database Setup

### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard

### Option 2: Vercel Postgres
1. In your Vercel dashboard, go to Storage tab
2. Create a new Postgres database
3. Copy the connection string

### Option 3: Supabase
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings > Database
3. Copy the connection string

## Deployment Steps

### 1. Environment Variables

In your Vercel project settings, add these environment variables:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
PORT=3000
```

### 2. Deploy to Vercel

#### Option A: Deploy from Git (Recommended)
1. Push your code to a Git repository
2. In Vercel dashboard, click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Add your environment variables in the project settings
6. Deploy!

#### Option B: Deploy from CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Follow the prompts to set up your project

### 3. Database Migration

After deployment, you need to run database migrations:

1. Install Vercel CLI if not already installed
2. Run: `vercel env pull .env.local` to get your environment variables
3. Run: `npm run db:push` to apply database schema

### 4. Seed Database (Optional)

To populate your database with sample data:

1. Make a POST request to `https://your-app.vercel.app/api/seed`
2. Or use curl: `curl -X POST https://your-app.vercel.app/api/seed`

## Project Structure

```
├── client/                 # Frontend React app
├── server/                 # Backend Express server
├── shared/                 # Shared schemas and types
├── dist/                   # Build output
│   ├── index.js           # Server bundle
│   └── public/            # Client assets
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## Configuration Files

### vercel.json
- Configures serverless functions and routing
- Sets up static file serving
- Defines build commands

### Build Process
1. `npm run build` runs both client and server builds
2. Client assets go to `dist/public/`
3. Server bundle goes to `dist/index.js`
4. Vercel serves static files and routes API calls to the serverless function

## Troubleshooting

### Build Errors
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify TypeScript compilation with `npm run check`
- Check Vercel build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Ensure database allows connections from Vercel's IP ranges
- Check database credentials and permissions

### Static Asset Issues
- Verify build outputs are in the correct directories
- Check that asset paths are relative, not absolute
- Ensure Vite build configuration matches deployment structure

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Set to "production" | Yes |
| `PORT` | Server port (Vercel sets this automatically) | No |

## Post-Deployment

1. Test all API endpoints work correctly
2. Verify database operations (create, read, update, delete tasks)
3. Check that static assets load properly
4. Test the application's core functionality

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check Vercel Function logs for server errors
- Set up error tracking (Sentry, etc.) if needed

## Support

For deployment issues:
1. Check Vercel build logs
2. Review this documentation
3. Check the application logs in Vercel dashboard
4. Consult Vercel documentation at [vercel.com/docs](https://vercel.com/docs)
