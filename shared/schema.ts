import { z } from "zod";
import { pgTable, text, timestamp, pgEnum, json, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Enums
export const taskTypeEnum = pgEnum('task_type', [
  // Manual tasks (user-created)
  'mechanicalanalysis', 
  'datareporting', 
  'injury', 
  'generaltodo',
  // Automatic tasks (system-generated)
  'schedulecall', // Combined injury_call + onboarding_call
  'coachassignment',
  'createprogram',
  'assessmentreview'
]);
export const taskStatusEnum = pgEnum('task_status', ['new', 'in_progress', 'blocked', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'coach', 'analyst', 'therapist', 'athlete', 'parent', 'staff']);
export const mediaTypeEnum = pgEnum('media_type', ['description', 'comment']);
export const historyActionEnum = pgEnum('history_action', ['created', 'status_changed', 'comment_added', 'media_added', 'assigned', 'deadline_changed']);

// Tables
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull(),
});

export const athletes = pgTable('athletes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sport: text('sport').notNull(),
  team: text('team'),
  position: text('position'),
});

// Media files table for mock attachments
export const mediaFiles = pgTable('media_files', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  filePath: text('file_path').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// Junction table for task-media relationships
export const taskMedia = pgTable('task_media', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  mediaId: text('media_id').references(() => mediaFiles.id).notNull(),
  mediaType: mediaTypeEnum('media_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table for task-athlete relationships
export const taskAthletes = pgTable('task_athletes', {
  taskId: text('task_id').references(() => tasks.id).notNull(),
  athleteId: text('athlete_id').references(() => athletes.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.taskId, table.athleteId] }),
}));

// Task comments table
export const taskComments = pgTable('task_comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  text: text('text').notNull(),
  authorId: text('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Task history for structured logging
export const taskHistory = pgTable('task_history', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  action: historyActionEnum('action').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  userId: text('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: taskTypeEnum('type').notNull(),
  description: text('description'), // Made optional
  assigneeId: text('assignee_id').references(() => users.id), // Made optional
  creatorId: text('creator_id').references(() => users.id), // Made optional
  deadline: timestamp('deadline'), // Already optional
  status: taskStatusEnum('status').notNull().default('new'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
  taskHistory: many(taskHistory),
  taskComments: many(taskComments),
}));

export const athletesRelations = relations(athletes, ({ many }) => ({
  taskAthletes: many(taskAthletes),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'assignedTasks',
  }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: 'createdTasks',
  }),
  taskAthletes: many(taskAthletes),
  taskMedia: many(taskMedia),
  taskHistory: many(taskHistory),
  taskComments: many(taskComments),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ many }) => ({
  taskMedia: many(taskMedia),
}));

export const taskMediaRelations = relations(taskMedia, ({ one }) => ({
  task: one(tasks, {
    fields: [taskMedia.taskId],
    references: [tasks.id],
  }),
  mediaFile: one(mediaFiles, {
    fields: [taskMedia.mediaId],
    references: [mediaFiles.id],
  }),
}));

export const taskAthletesRelations = relations(taskAthletes, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAthletes.taskId],
    references: [tasks.id],
  }),
  athlete: one(athletes, {
    fields: [taskAthletes.athleteId],
    references: [athletes.id],
  }),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
  task: one(tasks, {
    fields: [taskHistory.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskHistory.userId],
    references: [users.id],
  }),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [taskComments.authorId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertTaskSchema = createInsertSchema(tasks, {
  id: z.string().optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  creatorId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserSchema = createInsertSchema(users, {
  id: z.string().optional(),
}).omit({ id: true });

export const insertAthleteSchema = createInsertSchema(athletes, {
  id: z.string().optional(),
}).omit({ id: true });

export const insertMediaFileSchema = createInsertSchema(mediaFiles, {
  id: z.string().optional(),
  uploadedAt: z.date().optional(),
}).omit({ id: true, uploadedAt: true });

export const insertTaskMediaSchema = createInsertSchema(taskMedia, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
}).omit({ id: true, createdAt: true });

export const insertTaskAthleteSchema = createInsertSchema(taskAthletes);

export const insertTaskHistorySchema = createInsertSchema(taskHistory, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
}).omit({ id: true, createdAt: true });

export const insertTaskCommentSchema = createInsertSchema(taskComments, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const taskSchema = createSelectSchema(tasks);
export const userSchema = createSelectSchema(users);
export const athleteSchema = createSelectSchema(athletes);
export const mediaFileSchema = createSelectSchema(mediaFiles);
export const taskMediaSchema = createSelectSchema(taskMedia);
export const taskAthleteSchema = createSelectSchema(taskAthletes);
export const taskHistorySchema = createSelectSchema(taskHistory);
export const taskCommentSchema = createSelectSchema(taskComments);

// Types
export type Task = typeof tasks.$inferSelect;
export type User = typeof users.$inferSelect;
export type Athlete = typeof athletes.$inferSelect;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type TaskMedia = typeof taskMedia.$inferSelect;
export type TaskAthlete = typeof taskAthletes.$inferSelect;
export type TaskHistory = typeof taskHistory.$inferSelect;

export type InsertTask = Omit<typeof tasks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUser = Omit<typeof users.$inferInsert, 'id'>;
export type InsertAthlete = Omit<typeof athletes.$inferInsert, 'id'>;
export type InsertMediaFile = Omit<typeof mediaFiles.$inferInsert, 'id' | 'uploadedAt'>;
export type InsertTaskMedia = Omit<typeof taskMedia.$inferInsert, 'id' | 'createdAt'>;
export type InsertTaskAthlete = typeof taskAthletes.$inferInsert;
export type InsertTaskHistory = Omit<typeof taskHistory.$inferInsert, 'id' | 'createdAt'>;

// Comment types
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = Omit<typeof taskComments.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;