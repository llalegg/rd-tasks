# Tread Task Manager Prototype

## Overview

This is a full-stack web application built as a prototype for Tread's task management system. The application provides two distinct views (List and Kanban) for managing tasks with a focus on comparing user interface effectiveness. The project uses a modern React frontend with a Node.js/Express backend and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Font**: Montserrat (Google Fonts)
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage with PostgreSQL session store
- **API Design**: RESTful endpoints with /api prefix

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema**: Centralized in shared/schema.ts with Zod validation
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Task Management System
- **Dual View Interface**: Tab-based navigation between List and Kanban views
- **Task Model**: Comprehensive task structure with assignees, athletes, deadlines, and priorities
- **Status Workflow**: Four-stage status system (new, in_progress, pending, completed)
- **Priority System**: Three-tier priority levels (low, medium, high)

### Data Models
- **Task**: Core entity with relationships to users and athletes
- **User**: System users who can be assigned tasks
- **Athlete**: Athletes that can be related to tasks
- **Validation**: Zod schemas for runtime type checking

### UI Components
- **TaskManager**: Main orchestrator component
- **TaskList**: Table-based view with sorting and filtering
- **TaskKanban**: Column-based drag-and-drop interface
- **TaskModal**: Detailed task view with editing capabilities
- **TaskForm**: Create/edit task form with validation

## Data Flow

1. **Client Request**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes handle CRUD operations
3. **Database Layer**: Drizzle ORM manages PostgreSQL interactions
4. **Response**: Type-safe data flows back through the stack
5. **UI Updates**: React components re-render with fresh data

### State Management
- **Server State**: TanStack Query with optimistic updates
- **Local State**: React hooks for form data and UI state
- **Mock Data**: In-memory data for prototyping (client/src/data/mockData.ts)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL client for serverless environments
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **drizzle-orm**: Type-safe database ORM
- **wouter**: Lightweight routing library

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast backend bundling

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to dist/public
2. **Backend**: ESBuild bundles server code to dist/index.js
3. **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment detection (development/production)
- **Port**: Configurable via environment variables

### Production Setup
- Static file serving from dist/public
- Express server handles API routes and SPA fallback
- Database migrations run via `npm run db:push`

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Replaced user avatars with realistic Unsplash profile images
- July 08, 2025. Enhanced navigation bar with search field and filters button
- July 08, 2025. Added view toggle switch for List/Kanban views
- July 08, 2025. Removed navigation bar border for cleaner design
- July 08, 2025. Implemented live search functionality for task filtering
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```