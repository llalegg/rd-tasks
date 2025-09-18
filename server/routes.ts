import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertUserSchema, insertAthleteSchema } from "@shared/schema";
import { db } from "./db";
import { users, tasks, athletes, taskAthletes } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { mockUsers, mockAthletes, mockTasks, mockTaskAthletes } from "../client/src/data/mockData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      // Extract relatedAthleteIds since it's not part of the task schema
      const { relatedAthleteIds, ...taskData } = req.body;
      
      const validatedTask = insertTaskSchema.parse(taskData);
      
      // Add back relatedAthleteIds for storage layer
      const taskWithAthletes = {
        ...validatedTask,
        relatedAthleteIds: relatedAthleteIds || []
      };
      
      const task = await storage.createTask(taskWithAthletes);
      res.status(201).json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(400).json({ error: "Invalid task data", details: error.message });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      // Validate that the task exists first
      const existingTask = await storage.getTask(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      const task = await storage.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      console.error('Failed to update task:', error);
      res.status(500).json({ error: "Failed to update task", details: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Seed database endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      console.log("🌱 Seeding database...");
      
      // Clear existing data
      await db.delete(taskAthletes);
      await db.delete(tasks);
      await db.delete(athletes);
      await db.delete(users);
      
      // Insert users
      console.log("📝 Inserting users...");
      await db.insert(users).values(mockUsers);
      
      // Insert athletes
      console.log("🏃 Inserting athletes...");
      await db.insert(athletes).values(mockAthletes);
      
      // Insert tasks
      console.log("📋 Inserting tasks...");
      const tasksToInsert = mockTasks.map(({ relatedAthleteIds, ...task }) => task);
      await db.insert(tasks).values(tasksToInsert);
      
      // Insert task-athlete relationships
      console.log("🔗 Inserting task-athlete relationships...");
      await db.insert(taskAthletes).values(mockTaskAthletes);
      
      console.log("✅ Database seeded successfully!");
      res.json({ message: "Database seeded successfully!" });
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Athlete routes
  app.get("/api/athletes", async (req, res) => {
    try {
      const athletes = await storage.getAllAthletes();
      res.json(athletes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch athletes" });
    }
  });

  app.get("/api/athletes/:id", async (req, res) => {
    try {
      const athlete = await storage.getAthlete(req.params.id);
      if (!athlete) {
        return res.status(404).json({ error: "Athlete not found" });
      }
      res.json(athlete);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch athlete" });
    }
  });

  app.post("/api/athletes", async (req, res) => {
    try {
      const validatedAthlete = insertAthleteSchema.parse(req.body);
      const athlete = await storage.createAthlete(validatedAthlete);
      res.status(201).json(athlete);
    } catch (error) {
      res.status(400).json({ error: "Invalid athlete data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
