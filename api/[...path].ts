import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import { users, tasks, athletes, taskAthletes } from "../shared/schema.js";
import { eq } from "drizzle-orm";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes only once
let routesRegistered = false;

async function registerRoutes() {
  if (routesRegistered) return;

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const testQuery = await db.select().from(users).limit(1);
      res.json({ 
        status: 'ok', 
        database: 'connected',
        userCount: testQuery.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        status: 'error', 
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
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
    } catch (error) {
      console.error('Tasks fetch error:', error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
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
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(400).json({ 
        error: "Invalid task data", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { relatedAthleteIds, ...updateData } = req.body;
      
      // Convert date strings to Date objects if present
      if (updateData.deadline && typeof updateData.deadline === 'string') {
        updateData.deadline = new Date(updateData.deadline);
      }
      
      updateData.updatedAt = new Date();

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update related athletes if provided
      if (relatedAthleteIds !== undefined) {
        // Remove existing relations
        await db.delete(taskAthletes).where(eq(taskAthletes.taskId, id));
        
        // Add new relations
        if (relatedAthleteIds.length > 0) {
          const athleteRelations = relatedAthleteIds.map((athleteId: string) => ({
            taskId: id,
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
    } catch (error) {
      console.error('Failed to update task:', error);
      res.status(500).json({ 
        error: "Failed to update task", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete related athlete relations first
      await db.delete(taskAthletes).where(eq(taskAthletes.taskId, id));
      
      // Delete the task
      await db.delete(tasks).where(eq(tasks.id, id));
      
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Users fetch error:', error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Athlete routes
  app.get("/api/athletes", async (req, res) => {
    try {
      const allAthletes = await db.select().from(athletes);
      res.json(allAthletes);
    } catch (error) {
      console.error('Athletes fetch error:', error);
      res.status(500).json({ error: "Failed to fetch athletes" });
    }
  });

  // Seed endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      // Import mock data dynamically to avoid module resolution issues
      const mockUsers = [
        { id: "1", name: "Alex Johnson", email: "alex@example.com", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
        { id: "2", name: "Sarah Chen", email: "sarah@example.com", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=32&h=32&fit=crop&crop=face" },
        { id: "3", name: "Mike Davis", email: "mike@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
        { id: "4", name: "Emily Rodriguez", email: "emily@example.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
        { id: "5", name: "David Wilson", email: "david@example.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" }
      ];

      const mockAthletes = [
        { id: "1", name: "John Smith", sport: "Football", position: "Quarterback", dateOfBirth: "1995-03-15", height: "6'2\"", weight: "210 lbs" },
        { id: "2", name: "Maria Garcia", sport: "Basketball", position: "Point Guard", dateOfBirth: "1998-07-22", height: "5'6\"", weight: "140 lbs" },
        { id: "3", name: "James Brown", sport: "Baseball", position: "Pitcher", dateOfBirth: "1996-11-08", height: "6'1\"", weight: "195 lbs" },
        { id: "4", name: "Lisa Wang", sport: "Soccer", position: "Midfielder", dateOfBirth: "1997-09-14", height: "5'5\"", weight: "125 lbs" },
        { id: "5", name: "Robert Taylor", sport: "Track", position: "Sprinter", dateOfBirth: "1999-01-30", height: "5'10\"", weight: "165 lbs" }
      ];

      console.log("🌱 Seeding database...");
      
      // Clear existing data
      await db.delete(taskAthletes);
      await db.delete(tasks);
      await db.delete(athletes);
      await db.delete(users);
      
      // Insert users
      await db.insert(users).values(mockUsers);
      
      // Insert athletes
      await db.insert(athletes).values(mockAthletes);
      
      // Insert some sample tasks
      const sampleTasks = [
        {
          id: crypto.randomUUID(),
          name: "Injury Assessment",
          description: "Complete assessment for knee injury",
          type: "injury",
          status: "new" as const,
          priority: "high" as const,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          assigneeId: "1",
          creatorId: "1",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: crypto.randomUUID(),
          name: "Training Plan Review",
          description: "Review and update training plan",
          type: "training",
          status: "in_progress" as const,
          priority: "medium" as const,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          assigneeId: "2",
          creatorId: "1",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.insert(tasks).values(sampleTasks);
      
      console.log("✅ Database seeded successfully!");
      res.json({ message: "Database seeded successfully!" });
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  routesRegistered = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Register routes
    await registerRoutes();

    // For Vercel catch-all routes, we need to reconstruct the proper API path
    const pathSegments = req.query.path as string[] || [];
    let url = '/api/' + pathSegments.join('/');
    
    // Handle case where pathSegments is empty (root /api/ request)
    if (pathSegments.length === 0) {
      url = '/api/health'; // Default to health check
    }
    
    console.log('Path segments:', pathSegments);
    console.log('Reconstructed URL:', url);
    
    // Create Express-compatible request/response
    const expressReq = req as any;
    const expressRes = res as any;
    
    expressReq.url = url;
    expressReq.method = req.method || 'GET';
    
    // Copy query parameters (excluding the path segments used for routing)
    const { path, ...restQuery } = req.query || {};
    expressReq.query = restQuery;
    
    // Copy body
    expressReq.body = req.body || {};

    // Handle the request with Express
    app(expressReq, expressRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}