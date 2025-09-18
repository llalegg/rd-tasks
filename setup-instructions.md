# Tread Task Manager Setup Instructions

## Prerequisites
- Node.js (v18 or later)
- PostgreSQL database (local or cloud-hosted like Neon DB)

## Environment Setup

1. Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
# Replace with your actual PostgreSQL database URL
DATABASE_URL="postgresql://username:password@localhost:5432/tread_tasks"

# Development Configuration
NODE_ENV=development

# Optional: Leave empty for local development
REPL_ID=
```

### Database URL Examples:
- **Local PostgreSQL**: `postgresql://postgres:password@localhost:5432/tread_tasks`
- **Neon DB**: `postgresql://username:password@host/database_name?sslmode=require`

## Database Setup

1. Create a PostgreSQL database named `tread_tasks` (or your preferred name)
2. Update the `DATABASE_URL` in your `.env` file with your database credentials
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Development Server

**Important:** You need to set up a PostgreSQL database and configure the `DATABASE_URL` environment variable before starting the server.

Once your database is configured:

1. Run database migrations:
   ```bash
   npm run db:push
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript schemas and types
- `/attached_assets` - Project assets and documentation

## Key Features

This is a task management application with:
- List and Kanban board views
- Task creation, editing, and status management
- User and athlete management
- PostgreSQL database with Drizzle ORM
- Modern React with TypeScript
- Tailwind CSS with shadcn/ui components

## Setup Completed

✅ **Dependencies Installed**: All npm packages are installed successfully  
✅ **TypeScript Configuration**: All type errors have been resolved  
✅ **Schema Updates**: Added missing fields (priority, comment, blocked status)  
✅ **Replit Adaptations**: Removed Replit-specific scripts for local development  
✅ **Build Configuration**: TypeScript compilation passes without errors  

## Next Steps

1. **Database Setup**: Create a PostgreSQL database and update the `.env` file with your `DATABASE_URL`
2. **Run Migrations**: Use `npm run db:push` to create the database tables
3. **Start Development**: Run `npm run dev` to start the application

The application is ready to run once you configure your database connection.
