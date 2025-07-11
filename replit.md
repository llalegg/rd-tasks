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
- July 08, 2025. Redesigned Kanban with dark theme (#1c1c1c columns, #2a2a2a cards)
- July 08, 2025. Enhanced drag-and-drop with improved visual feedback and smooth animations
- July 08, 2025. Replaced modal with sliding sidebar for task details (500px width)
- July 08, 2025. Added push-content-left effect when sidebar opens
- July 08, 2025. Implemented ESC-to-close and enhanced drop zone indicators
- July 08, 2025. Reordered List View columns - Priority first (icon-only), then Name, Type, Deadline, Assignee, Related Athletes, Status
- July 08, 2025. Made sidebar content more compact with smaller fonts and tighter spacing
- July 08, 2025. Removed backdrop overlay to allow interaction with main content while sidebar is open (Jira-style)
- July 08, 2025. Fixed Kanban drag-and-drop status updates to work properly with database persistence
- July 08, 2025. Implemented persistent panel layout for task details - shifts main content left, no overlay
- July 08, 2025. Fixed column header text from "SINE" to "Assignee" in List View
- July 10, 2025. Added inline status change functionality to Kanban cards with dropdown menus
- July 10, 2025. Implemented comprehensive Task Modal improvements with enhanced UX and visual feedback
- July 10, 2025. Added status change feedback with loading states, success toasts, and visual indicators
- July 10, 2025. Improved priority visibility with color-coded badges (green/yellow/red) and enhanced urgency grouping
- July 10, 2025. Implemented visual section grouping with background containers and clear separators
- July 10, 2025. Enhanced action buttons with tooltips ("Edit task") and proper icon sizing
- July 10, 2025. Improved date formatting (Jul 11, 2025) and added hover tooltips for timestamps
- July 10, 2025. Added scroll support for long content with fixed header and sticky footer
- July 10, 2025. Replaced status buttons with elegant dropdown selects in Task Modal and Task Panel
- July 10, 2025. Enhanced status dropdowns with icons, loading states, and better visual feedback
- July 10, 2025. Completed comprehensive mobile optimization with responsive layout and touch interactions
- July 11, 2025. Simplified drag-and-drop experience with clean Trello-style interactions
- July 11, 2025. Removed flashy placeholders and implemented subtle visual feedback
- July 11, 2025. Enhanced card shifting behavior with smooth animations and predictable drop positioning
- July 11, 2025. Applied professional dark theme table styling to List View with consistent colors and typography
- July 11, 2025. Implemented Phosphor Icons for dropdown actions and improved badge styling with transparent backgrounds
- July 11, 2025. Enhanced table accessibility with proper hover states and visual hierarchy using specific color values
- July 11, 2025. Applied consistent button styling system across all components with proper variants and typography
- July 11, 2025. Implemented pill-shaped buttons (rounded-[9999px]) with Montserrat font and proper sizing
- July 11, 2025. Updated button colors to match design system: primary (#E5E4E1), secondary (#292928), tertiary, and ghost variants
- July 11, 2025. Updated sidebar to highlight "To-Do's" as selected menu item and removed "Athlete View" option
- July 11, 2025. Cleaned up table styling by removing header backgrounds and outer borders for minimalist appearance
- July 11, 2025. Made top navigation bar fixed position with matching background color
- July 11, 2025. Applied full rounded corners (pill-shaped) to all form inputs and dropdown selects for design consistency
- July 11, 2025. Updated search input with proper flex layout, 32px height, tertiary background (#292928), and 10px gap spacing
- July 11, 2025. Enhanced table styling with proper row heights (48px), modal background color (#1C1C1B), and flex layout
- July 11, 2025. Updated table headers with proper typography (Montserrat, 12px, medium weight, #BCBBB7 color)
- July 11, 2025. Refined Add Task button styling with proper dimensions and gap spacing
- July 11, 2025. Modified Assignee and Related Athletes columns to display avatars only without text labels
- July 11, 2025. Added ghost buttons to bottom left of each Kanban column for quick task creation with pre-selected status
- July 11, 2025. Updated table height to use full page height with proper padding for better space utilization
- July 11, 2025. Applied custom column colors to Kanban board: To-Do (#31180F), In Progress (#162949), Pending (#302608), Completed (#072A15)
- July 11, 2025. Added 64% opacity to all Kanban column background colors using hex alpha values for proper color rendering
- July 11, 2025. Applied custom card styling with 16px border-radius and #171716 background using CSS variables
- July 11, 2025. Updated toast component styling with custom CSS variables for consistent design system integration
- July 11, 2025. Removed description from Kanban cards for cleaner appearance
- July 11, 2025. Made avatars smaller (xs size) on Kanban cards and added semitransparent white borders to all avatars
- July 11, 2025. Restructured header layout to group search input and filters on the right with view toggle and add task button
- July 11, 2025. Updated Add Task button font size to 12px and adjusted search input padding for 6px spacing between icon and text
- July 11, 2025. Updated red deadline badge styling with custom background (#321A1A), text color (#F87171), and Montserrat typography
- July 11, 2025. Updated yellow badge styling with custom background (#302608) and text color (#EAB308)
- July 11, 2025. Changed green badge to grey badge with transparent background, backdrop blur, and secondary text color (#979795)
- July 11, 2025. Made all badges hugged by width (fit-content) instead of filling available space for better visual balance
- July 11, 2025. Updated all buttons to have consistent 6px spacing between icons and text labels
- July 11, 2025. Updated table rows to 48px height and added colored priority icons (red for high, yellow for medium, grey for low)
- July 11, 2025. Adjusted priority icon and task name spacing, updated dropdown menus with #292928 background
- July 11, 2025. Made status select dropdown with transparent black background (25% opacity) and no borders
- July 11, 2025. Enhanced Kanban card interactions with white border on hover and actions menu visibility toggle
- July 11, 2025. Restructured card layout: priority icon and deadline moved to same line with related athletes
- July 11, 2025. Updated drag overlay to match new card layout structure for consistency
- July 11, 2025. Simplified actions dropdown menu to show only Edit and Delete options without icons
- July 11, 2025. Added white outline on hover for better visual feedback using CSS outline properties
- July 11, 2025. Implemented modal window for task details in Kanban board (centered dialog with scroll area)
- July 11, 2025. Created shared TaskDetails component for common task information display across views
- July 11, 2025. Unified task details layout between modal (Kanban) and sidebar (List) views with consistent data presentation
- July 11, 2025. Enhanced task details with proper status dropdowns, priority badges, and visual grouping sections
- July 11, 2025. Improved modal styling with custom background color (#1C1C1B) and proper spacing for optimal readability
- July 11, 2025. Made task details modal more compact with reduced padding and spacing between sections
- July 11, 2025. Added Edit button (secondary variant) positioned left of X close icon in modal header
- July 11, 2025. Removed icons from all section labels for cleaner appearance
- July 11, 2025. Enhanced activity history to show creator and updater information with detailed timestamps
- July 11, 2025. Removed colored circles from activity history for minimal design approach
- July 11, 2025. Made modal layout more compact with reduced spacing (space-y-2) and smaller text labels
- July 11, 2025. Moved Edit button under task type badge and removed X close button from modal
- July 11, 2025. Reduced grid gaps and label text size for denser information display
- July 11, 2025. Added green checkmark icon to success toast messages and moved toast position to bottom left
- July 11, 2025. Made description text secondary color (text-muted-foreground) for better visual hierarchy
- July 11, 2025. Added priority sort dropdown to top navigation bar (only visible on Kanban view)
- July 11, 2025. Removed Plus icons from Add Task buttons for cleaner button appearance
- July 11, 2025. Added sort by priority/deadline dropdown to top navigation (replaced priority filter)
- July 11, 2025. Made table header fixed position and reduced space between table and navigation
- July 11, 2025. Updated sidebar styling to match modal window (background #1C1C1B, border #292928)
- July 11, 2025. Replaced TaskPanelContent with shared TaskDetails component in sidebar for consistency
- July 11, 2025. Removed sort controls from Kanban board component (moved to top navigation)
- July 11, 2025. Fixed search input spacing by increasing paddingLeft from 22px to 32px for proper icon clearance
- July 11, 2025. Removed "no sort" option from dropdown, changed default sort to "deadline"
- July 11, 2025. Made sort dropdown only visible in Kanban view with Priority and Deadline options only
- July 11, 2025. Added tooltips to priority column in List view showing priority level names
- July 11, 2025. Updated TaskSidebar header to match modal styling with simplified close button
- July 11, 2025. Reduced toast message padding to 12px for more compact appearance
- July 11, 2025. Updated TaskSidebar header to exactly match modal header with task name, type badge, and edit button
- July 11, 2025. Updated Task Detail Panel header to remove status indicator and move edit button under task type as secondary button
- July 11, 2025. Changed Task Detail Panel background to #1C1C1B with #292928 border to match modal styling
- July 11, 2025. Added formatTaskType function to TaskManager component to fix missing function error
- July 11, 2025. Removed Task Title section from TaskDetails component (title/badge/edit button now only in panel header)
- July 11, 2025. Positioned close button at top right corner of Task Detail Panel with absolute positioning
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```