# Tread EL Task Manager - Database Schema Documentation

## Overview
This document describes the database schema for the Tread EL Task Manager application. The database is designed to support a comprehensive task management system for sports teams and athletic organizations.

## Database Technology
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Migration Tool:** Drizzle Kit
- **Validation:** Zod schemas

## Schema Structure

### Enums

#### `task_type`
Defines the different types of tasks in the system:
- **Manual Tasks (User-created):**
  - `mechanicalanalysis` - Biomechanical analysis tasks
  - `datareporting` - Data analysis and reporting tasks
  - `injury` - Injury-related tasks and assessments
  - `generaltodo` - General administrative tasks

- **Automatic Tasks (System-generated):**
  - `schedulecall` - Call scheduling (injury + onboarding calls)
  - `coachassignment` - Coach assignment tasks
  - `createprogram` - Program creation tasks
  - `assessmentreview` - Assessment review tasks

#### `task_status`
Task lifecycle status:
- `new` - Newly created task (default)
- `in_progress` - Task currently being worked on
- `pending` - Task blocked or waiting
- `completed` - Task finished

#### `task_priority`
Task priority levels:
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

#### `user_role`
User roles in the system:
- `admin` - System administrator
- `coach` - Team coach
- `analyst` - Data analyst
- `therapist` - Physical therapist
- `athlete` - Athlete user
- `parent` - Parent of athlete
- `staff` - General staff member

#### `media_type`
Media attachment categories:
- `description` - Descriptive media
- `comment` - Comment attachments

#### `history_action`
Task history action types:
- `created` - Task creation
- `status_changed` - Status updates
- `comment_added` - Comment additions
- `media_added` - Media attachments
- `assigned` - Assignment changes
- `deadline_changed` - Deadline modifications

---

## Core Tables

### `users`
User account management and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique user identifier |
| `name` | text | NOT NULL | Full user name |
| `email` | text | NOT NULL, UNIQUE | User email address |
| `role` | user_role | NOT NULL | User role in system |

**Relationships:**
- One-to-many with `tasks` (as assignee)
- One-to-many with `tasks` (as creator)
- One-to-many with `task_history`
- One-to-many with `task_comments`

### `athletes`
Athlete profiles and information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique athlete identifier |
| `name` | text | NOT NULL | Athlete full name |
| `sport` | text | NOT NULL | Primary sport |
| `team` | text | NULLABLE | Team name |
| `position` | text | NULLABLE | Playing position |

**Relationships:**
- Many-to-many with `tasks` through `task_athletes`

### `tasks`
Core task management entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique task identifier |
| `name` | text | NOT NULL | Task title/name |
| `type` | task_type | NOT NULL | Task category |
| `description` | text | NULLABLE | Detailed task description |
| `assignee_id` | text | NULLABLE, FK → users.id | Assigned user |
| `creator_id` | text | NULLABLE, FK → users.id | Task creator |
| `deadline` | timestamp | NULLABLE | Task deadline |
| `status` | task_status | NOT NULL, DEFAULT 'new' | Current status |
| `priority` | task_priority | NOT NULL, DEFAULT 'medium' | Task priority |
| `comment` | text | NULLABLE | General comments |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with `users` (assignee)
- Many-to-one with `users` (creator)
- Many-to-many with `athletes` through `task_athletes`
- One-to-many with `task_media`
- One-to-many with `task_history`
- One-to-many with `task_comments`

---

## Supporting Tables

### `media_files`
File attachment management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique file identifier |
| `filename` | text | NOT NULL | Stored filename |
| `original_name` | text | NOT NULL | Original upload filename |
| `mime_type` | text | NOT NULL | File MIME type |
| `file_size` | integer | NOT NULL | File size in bytes |
| `file_path` | text | NOT NULL | Storage file path |
| `uploaded_at` | timestamp | NOT NULL, DEFAULT NOW() | Upload timestamp |

### `task_media`
Junction table linking tasks to media files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique relationship ID |
| `task_id` | text | NOT NULL, FK → tasks.id | Referenced task |
| `media_id` | text | NOT NULL, FK → media_files.id | Referenced media file |
| `media_type` | media_type | NOT NULL | Media categorization |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Association timestamp |

### `task_athletes`
Junction table linking tasks to athletes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | text | NOT NULL, FK → tasks.id | Referenced task |
| `athlete_id` | text | NOT NULL, FK → athletes.id | Referenced athlete |

**Primary Key:** Composite key on (`task_id`, `athlete_id`)

### `task_comments`
Task discussion and commentary system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique comment identifier |
| `task_id` | text | NOT NULL, FK → tasks.id | Parent task |
| `text` | text | NOT NULL | Comment content |
| `author_id` | text | NOT NULL, FK → users.id | Comment author |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW() | Last edit timestamp |

### `task_history`
Audit trail for task changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Unique history entry ID |
| `task_id` | text | NOT NULL, FK → tasks.id | Referenced task |
| `action` | history_action | NOT NULL | Type of change |
| `old_value` | text | NULLABLE | Previous value |
| `new_value` | text | NULLABLE | New value |
| `user_id` | text | NOT NULL, FK → users.id | User who made change |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW() | Change timestamp |

---

## Migration History

### Migration 0000: Initial Schema
- Created base tables for users, athletes, tasks
- Established core enums and relationships
- Set up initial foreign key constraints

### Migration 0001: Enhanced Task Features
- Added media file support
- Implemented task-athlete relationships
- Added comment and history tracking

### Migration 0002: Schema Refinements (Latest)
- Made `description`, `assignee_id`, and `creator_id` nullable in tasks table
- Updated task status enum to include 'pending' status
- Improved flexibility for task creation workflow

---

## Indexes and Performance

### Recommended Indexes
```sql
-- Task queries by status and assignee
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- History and comments by task
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Junction table performance
CREATE INDEX idx_task_athletes_task ON task_athletes(task_id);
CREATE INDEX idx_task_athletes_athlete ON task_athletes(athlete_id);
```

---

## API Integration

### TypeScript Types
The schema generates fully typed interfaces:
- `Task`, `User`, `Athlete` - Select types
- `InsertTask`, `InsertUser`, `InsertAthlete` - Insert types
- Zod validation schemas for runtime validation

### Query Examples
```typescript
// Get all tasks with relationships
const tasksWithDetails = await db.select()
  .from(tasks)
  .leftJoin(users, eq(tasks.assigneeId, users.id))
  .leftJoin(taskAthletes, eq(tasks.id, taskAthletes.taskId))
  .leftJoin(athletes, eq(taskAthletes.athleteId, athletes.id));

// Create task with athlete associations
const newTask = await db.insert(tasks).values(taskData).returning();
await db.insert(taskAthletes).values(
  relatedAthleteIds.map(id => ({ taskId: newTask[0].id, athleteId: id }))
);
```

---

## Security Considerations

### Data Protection
- All user emails are unique and indexed
- Foreign key constraints ensure referential integrity
- Timestamps track all changes for audit trails

### Access Control
- User roles determine system permissions
- Task assignments control access to sensitive data
- Media files are tracked with full provenance

---

## Deployment Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### Migration Commands
```bash
# Generate migration
npm run db:push

# Run migrations
npm run db:migrate

# Post-deployment migration
npm run postdeploy
```

---

## Future Enhancements

### Planned Features
1. **Task Templates** - Predefined task structures
2. **Notification System** - Real-time task updates
3. **File Versioning** - Media file version control
4. **Advanced Permissions** - Role-based access control
5. **Task Dependencies** - Task prerequisite relationships

### Schema Considerations
- Prepare for multi-tenancy (organization isolation)
- Plan for performance at scale (partitioning strategies)
- Consider GDPR compliance (data retention policies)
