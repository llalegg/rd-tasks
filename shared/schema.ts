import { z } from "zod";
import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Enums
export const taskTypeEnum = pgEnum('task_type', [
  // Manual tasks (user-created)
  'mechanical_analysis', 
  'data_reporting', 
  'injury', 
  'general_to_do',
  // Automatic tasks (system-generated)
  'schedule_call_injury',
  'schedule_call_onboarding',
  'coach_assignment',
  'create_program',
  'assessment_review'
]);
export const taskStatusEnum = pgEnum('task_status', ['new', 'in_progress', 'pending', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'coach', 'analyst', 'therapist', 'athlete', 'parent', 'staff']);

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

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: taskTypeEnum('type').notNull(),
  description: text('description').notNull(),
  comment: text('comment'),
  assigneeId: text('assignee_id').references(() => users.id).notNull(),
  creatorId: text('creator_id').references(() => users.id).notNull(),
  relatedAthleteIds: text('related_athlete_ids').array(),
  deadline: timestamp('deadline'),
  status: taskStatusEnum('status').notNull().default('new'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  historyLog: text('history_log').array().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
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
}));

// Zod schemas
export const insertTaskSchema = createInsertSchema(tasks, {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserSchema = createInsertSchema(users, {
  id: z.string().optional(),
}).omit({ id: true });

export const insertAthleteSchema = createInsertSchema(athletes, {
  id: z.string().optional(),
}).omit({ id: true });

export const taskSchema = createSelectSchema(tasks);
export const userSchema = createSelectSchema(users);
export const athleteSchema = createSelectSchema(athletes);

// Types
export type Task = typeof tasks.$inferSelect;
export type User = typeof users.$inferSelect;
export type Athlete = typeof athletes.$inferSelect;
export type InsertTask = Omit<typeof tasks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUser = Omit<typeof users.$inferInsert, 'id'>;
export type InsertAthlete = Omit<typeof athletes.$inferInsert, 'id'>;