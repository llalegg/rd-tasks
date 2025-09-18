# Environment Variables Setup

## Required Environment Variables

Copy these environment variables to your Vercel project settings:

### Database Configuration
```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

### Application Configuration  
```
NODE_ENV=production
```

## Database Provider Setup

### Neon (Recommended - Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string from dashboard
4. Use as `DATABASE_URL`

### Vercel Postgres
1. In Vercel dashboard → Storage → Create Database
2. Choose Postgres
3. Copy connection string
4. Use as `DATABASE_URL`

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Settings → Database
4. Copy connection string (make sure to use the connection pooling URL)
5. Use as `DATABASE_URL`

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click Settings → Environment Variables
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: `your_postgresql_connection_string`
   - Environment: All (Production, Preview, Development)
4. Redeploy your application

## Local Development

For local development, create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager
NODE_ENV=development
```

**Never commit the `.env` file to version control.**
