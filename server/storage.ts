import { users, tasks, athletes, taskComments, taskAthletes, type User, type Task, type Athlete, type TaskComment, type InsertUser, type InsertTask, type InsertAthlete, type InsertTaskComment } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Task methods
  getAllTasks(): Promise<(Task & { relatedAthleteIds: string[] })[]>;
  getTask(id: string): Promise<(Task & { relatedAthleteIds: string[] }) | undefined>;
  createTask(task: InsertTask & { relatedAthleteIds?: string[] }): Promise<Task & { relatedAthleteIds: string[] }>;
  updateTask(id: string, updates: Partial<Task & { relatedAthleteIds?: string[] }>): Promise<Task & { relatedAthleteIds: string[] }>;
  deleteTask(id: string): Promise<void>;
  
  // Athlete methods
  getAllAthletes(): Promise<Athlete[]>;
  getAthlete(id: string): Promise<Athlete | undefined>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  
  // Comment methods
  getTaskComments(taskId: string): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  deleteTaskComment(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id: crypto.randomUUID() })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Task methods
  async getAllTasks(): Promise<(Task & { relatedAthleteIds: string[] })[]> {
    // Get all tasks
    const allTasks = await db.select().from(tasks);
    
    // Get all task-athlete relationships
    const allTaskAthletes = await db.select().from(taskAthletes);
    
    // Combine tasks with their athlete relationships
    const tasksWithAthletes = allTasks.map(task => ({
      ...task,
      relatedAthleteIds: allTaskAthletes
        .filter(ta => ta.taskId === task.id)
        .map(ta => ta.athleteId)
    }));
    
    return tasksWithAthletes;
  }

  async getTask(id: string): Promise<(Task & { relatedAthleteIds: string[] }) | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;
    
    // Get athlete relationships for this task
    const taskAthleteRelations = await db.select().from(taskAthletes).where(eq(taskAthletes.taskId, id));
    
    return {
      ...task,
      relatedAthleteIds: taskAthleteRelations.map(ta => ta.athleteId)
    };
  }

  async createTask(insertTask: InsertTask & { relatedAthleteIds?: string[] }): Promise<Task & { relatedAthleteIds: string[] }> {
    const { relatedAthleteIds, ...taskData } = insertTask;
    
    const taskId = crypto.randomUUID();
    const [task] = await db
      .insert(tasks)
      .values({ 
        ...taskData, 
        id: taskId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Handle athlete relationships if provided
    if (relatedAthleteIds && relatedAthleteIds.length > 0) {
      const athleteRelations = relatedAthleteIds.map(athleteId => ({
        taskId,
        athleteId
      }));
      await db.insert(taskAthletes).values(athleteRelations);
    }
    
    return {
      ...task,
      relatedAthleteIds: relatedAthleteIds || []
    };
  }

  async updateTask(id: string, updates: Partial<Task & { relatedAthleteIds?: string[] }>): Promise<Task & { relatedAthleteIds: string[] }> {
    // First check if task exists
    const existingTask = await this.getTask(id);
    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }

    // Extract relatedAthleteIds and deadline for special handling
    const { relatedAthleteIds, deadline, ...taskUpdates } = updates;

    // Filter out undefined values and ensure we don't overwrite required fields with null/undefined
    const filteredUpdates = Object.fromEntries(
      Object.entries(taskUpdates).filter(([_, value]) => value !== undefined)
    );

    // Handle deadline separately if it's being updated
    if (deadline !== undefined) {
      if (deadline === null) {
        filteredUpdates.deadline = null;
      } else if (typeof deadline === 'string') {
        // For string dates, convert to Date object explicitly
        const dateObj = new Date(deadline);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid deadline date: ${deadline}`);
        }
        filteredUpdates.deadline = dateObj;
      } else {
        // If it's already a Date object or other type, use as-is
        filteredUpdates.deadline = deadline;
      }
    }

    try {
      // Update the task itself
      // Separate the updatedAt to avoid any issues
      const updateSet = { ...filteredUpdates };
      updateSet.updatedAt = new Date();
      
      const [task] = await db
        .update(tasks)
        .set(updateSet)
        .where(eq(tasks.id, id))
        .returning();
      
      if (!task) {
        throw new Error(`Failed to update task with id ${id} - no task returned`);
      }

      // Handle athlete relationships if provided
      if (relatedAthleteIds !== undefined) {
        // Delete existing relationships
        await db.delete(taskAthletes).where(eq(taskAthletes.taskId, id));
        
        // Insert new relationships
        if (relatedAthleteIds.length > 0) {
          const athleteRelations = relatedAthleteIds.map(athleteId => ({
            taskId: id,
            athleteId
          }));
          await db.insert(taskAthletes).values(athleteRelations);
        }
      }
      
      // Get the current athlete relationships
      const currentTaskAthletes = await db.select().from(taskAthletes).where(eq(taskAthletes.taskId, id));
      const currentRelatedAthleteIds = currentTaskAthletes.map(ta => ta.athleteId);
      
      return {
        ...task,
        relatedAthleteIds: currentRelatedAthleteIds
      };
    } catch (dbError) {
      console.error('Database error updating task:', dbError);
      throw new Error(`Database error updating task: ${dbError.message}`);
    }
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Athlete methods
  async getAllAthletes(): Promise<Athlete[]> {
    return await db.select().from(athletes);
  }

  async getAthlete(id: string): Promise<Athlete | undefined> {
    const [athlete] = await db.select().from(athletes).where(eq(athletes.id, id));
    return athlete || undefined;
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const [athlete] = await db
      .insert(athletes)
      .values({ ...insertAthlete, id: crypto.randomUUID() })
      .returning();
    return athlete;
  }

  // Comment methods
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return await db.select().from(taskComments).where(eq(taskComments.taskId, taskId));
  }

  async createTaskComment(insertComment: InsertTaskComment): Promise<TaskComment> {
    const [comment] = await db
      .insert(taskComments)
      .values({ ...insertComment, id: crypto.randomUUID() })
      .returning();
    return comment;
  }

  async deleteTaskComment(id: string): Promise<void> {
    await db.delete(taskComments).where(eq(taskComments.id, id));
  }
}

export const storage = new DatabaseStorage();