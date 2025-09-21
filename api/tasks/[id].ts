import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../shared/schema";
import { tasks, taskAthletes } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    console.log('Tasks/[id] API - Method:', req.method, 'ID:', id);
    
    if (req.method === 'GET') {
      // Get specific task
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id as string));
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Get related athletes
      const taskAthleteIds = await db
        .select({ athleteId: taskAthletes.athleteId })
        .from(taskAthletes)
        .where(eq(taskAthletes.taskId, task.id));
      
      const result = {
        ...task,
        relatedAthleteIds: taskAthleteIds.map(ta => ta.athleteId)
      };

      res.json(result);
    } 
    else if (req.method === 'PUT') {
      // Update task
      const { relatedAthleteIds, ...updateData } = req.body;
      
      // Convert date strings to Date objects if present
      if (updateData.deadline && typeof updateData.deadline === 'string') {
        updateData.deadline = new Date(updateData.deadline);
      }
      
      updateData.updatedAt = new Date();

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id as string))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update related athletes if provided
      if (relatedAthleteIds !== undefined) {
        // Remove existing relations
        await db.delete(taskAthletes).where(eq(taskAthletes.taskId, id as string));
        
        // Add new relations
        if (relatedAthleteIds.length > 0) {
          const athleteRelations = relatedAthleteIds.map((athleteId: string) => ({
            taskId: id as string,
            athleteId: athleteId
          }));
          await db.insert(taskAthletes).values(athleteRelations);
        }
      }

      const result = {
        ...updatedTask,
        relatedAthleteIds: relatedAthleteIds || []
      };

      res.json(result);
    }
    else if (req.method === 'DELETE') {
      // Delete task
      // Delete related athlete relations first
      await db.delete(taskAthletes).where(eq(taskAthletes.taskId, id as string));
      
      // Delete the task
      const deletedRows = await db.delete(tasks).where(eq(tasks.id, id as string));
      
      res.status(204).send();
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed. Supported methods: GET, PUT, DELETE` });
    }
    
  } catch (error) {
    console.error('Tasks/[id] API error:', error);
    res.status(500).json({ 
      error: "Failed to handle task request", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
