# Tread Task Manager Prototype

## Overview
This project is a full-stack web application prototype for Tread's task management system. It aims to compare the effectiveness of List and Kanban user interfaces for task management. The application provides comprehensive task management capabilities, allowing users to track tasks, assign them, set deadlines, and manage their status and priority. The business vision is to develop an intuitive and efficient tool that enhances productivity for users managing diverse tasks.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Core Design
The application is built as a full-stack web application with a clear separation of concerns between the frontend and backend. It employs a modern component-based architecture for the UI and a RESTful API for data management.

### Frontend
- **Framework**: React 18 with TypeScript, using Vite for bundling.
- **Styling**: Tailwind CSS with shadcn/ui for components, ensuring a consistent and modern UI.
- **State Management**: TanStack Query manages server state, including optimistic updates.
- **Routing**: Wouter provides lightweight client-side navigation.
- **UI/UX**: Features a dark theme with a focus on clean, minimalist design, consistent typography (Montserrat), and intuitive interactions. UI components are built using Radix UI primitives.
- **Key UI/UX Decisions**:
    - Dual view interface (List and Kanban) for task management.
    - Persistent panel layout for task details (Jira-style sliding sidebar in List view, modal in Kanban view).
    - Consistent button styling with pill shapes and custom color palette.
    - Dark theme with specific color values for backgrounds (`#1c1c1c`, `#292928`, `#171716`), table rows (`#1C1C1B`), and Kanban columns (e.g., `#31180F` for To-Do).
    - Responsive design for mobile compatibility.
    - Use of Phosphor Icons for actions and visual cues.
    - Priority visibility enhanced with color-coded badges (red, yellow, grey) and icons.
    - Compact layouts for modals and sidebars with reduced padding and spacing.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL, accessed via Drizzle ORM for type-safe operations.
- **API**: RESTful endpoints prefixed with `/api`.
- **Session Management**: In-memory storage with PostgreSQL session store.

### Data Models
- **Task**: Core unified entity with the following fields:
  - ID (system generated)
  - Name (string, required) - task title
  - Type (enum, required) - classifies task (mechanical_analysis, data_reporting, injury, general_to_do for manual; schedule_call_injury, etc. for system-generated)
  - Description (text, required) - short explanation of the task
  - Comment (text, optional) - additional notes, editable after creation
  - Assignee (user ID, required) - primary responsible person
  - Creator (user ID, required) - who created the task
  - Related Athletes (0..N, optional) - links to athletes
  - Deadline (datetime, optional) - for urgency and color coding
  - Status (enum, required) - new, in_progress, pending, completed
  - History Log (system, required) - creation date/time, status changes, posted comments/media
  - Priority (enum) - low, medium, high for color coding and sorting
- **User**: System users (athlete, coach, parent, staff, admin, analyst, therapist) who can be assigned tasks
- **Athlete**: Athletes linked to tasks
- **Validation**: Zod schemas are used for runtime type checking of data models

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL client.
- **@tanstack/react-query**: Server state management library.
- **@radix-ui/**: Headless UI component primitives.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **wouter**: Lightweight client-side router.
- **Vite**: Frontend build tool.
- **TypeScript**: Programming language providing type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **ESBuild**: Fast JavaScript bundler for the backend.