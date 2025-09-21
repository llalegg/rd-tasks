import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import { users, athletes, tasks, taskAthletes } from "../shared/schema.js";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Seed API - Method:', req.method);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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
      },
      {
        id: crypto.randomUUID(),
        name: "Performance Analysis",
        description: "Analyze recent performance metrics",
        type: "analysis",
        status: "pending" as const,
        priority: "low" as const,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        assigneeId: "3",
        creatorId: "2",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.insert(tasks).values(sampleTasks);
    
    // Add some task-athlete relationships
    const taskAthleteRelations = [
      { taskId: sampleTasks[0].id, athleteId: "1" },
      { taskId: sampleTasks[1].id, athleteId: "2" },
      { taskId: sampleTasks[1].id, athleteId: "3" },
      { taskId: sampleTasks[2].id, athleteId: "4" },
    ];
    
    await db.insert(taskAthletes).values(taskAthleteRelations);
    
    console.log("✅ Database seeded successfully!");
    res.json({ 
      message: "Database seeded successfully!",
      data: {
        users: mockUsers.length,
        athletes: mockAthletes.length,
        tasks: sampleTasks.length,
        taskAthleteRelations: taskAthleteRelations.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    res.status(500).json({ 
      error: "Failed to seed database", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
