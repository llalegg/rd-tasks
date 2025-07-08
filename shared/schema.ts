import { z } from "zod";

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  type: z.string(),
  assigneeId: z.string(),
  relatedAthleteIds: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  watcherIds: z.array(z.string()).optional(),
  creatorId: z.string(),
  status: z.enum(["new", "in_progress", "pending", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Athlete schema
export const athleteSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Insert schemas
export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Task = z.infer<typeof taskSchema>;
export type User = z.infer<typeof userSchema>;
export type Athlete = z.infer<typeof athleteSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
