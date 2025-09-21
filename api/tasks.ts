import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { tasks, taskAthletes } from "../shared/schema";
import { eq } from "drizzle-orm";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Tasks API - Method:', req.method, 'Body:', req.body);
    
    if (req.method === 'GET') {
      // Get all tasks
      const allTasks = await db.select().from(tasks);
      const tasksWithAthletes = await Promise.all(
        allTasks.map(async (task) => {
          const taskAthleteIds = await db
            .select({ athleteId: taskAthletes.athleteId })
            .from(taskAthletes)
            .where(eq(taskAthletes.taskId, task.id));
          
          return {
            ...task,
            relatedAthleteIds: taskAthleteIds.map(ta => ta.athleteId)
          };
        })
      );
      res.json(tasksWithAthletes);
    } 
    else if (req.method === 'POST') {
      // Create new task
      const { relatedAthleteIds, ...taskData } = req.body;
      
      // Convert date strings to Date objects if present
      if (taskData.deadline && typeof taskData.deadline === 'string') {
        taskData.deadline = new Date(taskData.deadline);
      }
      if (taskData.createdAt && typeof taskData.createdAt === 'string') {
        taskData.createdAt = new Date(taskData.createdAt);
      }
      if (taskData.updatedAt && typeof taskData.updatedAt === 'string') {
        taskData.updatedAt = new Date(taskData.updatedAt);
      }

      // Create task with auto-generated ID
      const taskToInsert = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: taskData.createdAt || new Date(),
        updatedAt: taskData.updatedAt || new Date()
      };

      const [newTask] = await db.insert(tasks).values(taskToInsert).returning();
      
      // Handle related athletes
      if (relatedAthleteIds && relatedAthleteIds.length > 0) {
        const athleteRelations = relatedAthleteIds.map((athleteId: string) => ({
          taskId: newTask.id,
          athleteId: athleteId
        }));
        await db.insert(taskAthletes).values(athleteRelations);
      }

      const result = {
        ...newTask,
        relatedAthleteIds: relatedAthleteIds || []
      };

      res.status(201).json(result);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed. Supported methods: GET, POST` });
    }
    
  } catch (error) {
    console.error('Tasks API error:', error);
    res.status(500).json({ 
      error: "Failed to handle tasks request", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
