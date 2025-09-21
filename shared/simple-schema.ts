import { z } from "zod";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Simple People table (combines athletes and coaches)
export const people = pgTable('people', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'athlete' or 'coach'
  sport: text('sport'),
  position: text('position'),
});

// Simple Tasks table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // injury, training, analysis, etc.
  status: text('status').notNull(), // new, in_progress, pending, completed
  priority: text('priority').notNull(), // low, medium, high
  deadline: timestamp('deadline'),
  assigneeId: text('assignee_id'), // references people.id (coach)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Task-Athletes relationship (many-to-many)
export const taskAthletes = pgTable('task_athletes', {
  taskId: text('task_id').notNull(),
  athleteId: text('athlete_id').notNull(), // references people.id where type='athlete'
});

// Types
export type Person = typeof people.$inferSelect;
export type InsertPerson = typeof people.$inferInsert;
export type Task = typeof tasks.$inferSelect & { relatedAthleteIds?: string[] };
export type InsertTask = typeof tasks.$inferInsert;

// Schemas
export const insertPersonSchema = createInsertSchema(people);
export const selectPersonSchema = createSelectSchema(people);
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
