import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { people, tasks, taskAthletes } from "../shared/simple-schema";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Simple Seed API - Method:', req.method);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create simple schema first
    await sql(`
      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        sport TEXT,
        position TEXT
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        deadline TIMESTAMP,
        assignee_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS task_athletes (
        task_id TEXT NOT NULL,
        athlete_id TEXT NOT NULL
      );
    `);

    // Clear existing data
    await sql('DELETE FROM task_athletes');
    await sql('DELETE FROM tasks');
    await sql('DELETE FROM people');

    // Insert people (coaches and athletes)
    const samplePeople = [
      // Coaches
      { id: "coach1", name: "Coach Sarah Johnson", type: "coach", sport: "General", position: "Head Coach" },
      { id: "coach2", name: "Coach Mike Davis", type: "coach", sport: "Strength", position: "Strength Coach" },
      { id: "coach3", name: "Dr. Emily Rodriguez", type: "coach", sport: "Medical", position: "Sports Medicine" },
      
      // Athletes
      { id: "athlete1", name: "John Smith", type: "athlete", sport: "Football", position: "Quarterback" },
      { id: "athlete2", name: "Maria Garcia", type: "athlete", sport: "Basketball", position: "Point Guard" },
      { id: "athlete3", name: "James Brown", type: "athlete", sport: "Baseball", position: "Pitcher" },
      { id: "athlete4", name: "Lisa Wang", type: "athlete", sport: "Soccer", position: "Midfielder" },
      { id: "athlete5", name: "Robert Taylor", type: "athlete", sport: "Track", position: "Sprinter" },
      { id: "athlete6", name: "Anna Wilson", type: "athlete", sport: "Swimming", position: "Freestyle" },
      { id: "athlete7", name: "David Lee", type: "athlete", sport: "Tennis", position: "Singles" },
    ];

    await db.insert(people).values(samplePeople);

    // Insert 10 sample tasks
    const sampleTasks = [
      {
        id: "task1",
        name: "Knee Injury Assessment",
        description: "Complete assessment for athlete's knee injury",
        type: "injury",
        status: "new",
        priority: "high",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        assigneeId: "coach3", // Dr. Emily Rodriguez
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task2",
        name: "Training Plan Review",
        description: "Review and update weekly training plan",
        type: "training",
        status: "in_progress",
        priority: "medium",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        assigneeId: "coach1", // Coach Sarah Johnson
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task3",
        name: "Performance Analysis Report",
        description: "Analyze last game performance metrics",
        type: "analysis",
        status: "pending",
        priority: "medium",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        assigneeId: "coach1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task4",
        name: "Strength Training Program",
        description: "Design new strength training program",
        type: "training",
        status: "new",
        priority: "high",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        assigneeId: "coach2", // Coach Mike Davis
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task5",
        name: "Team Meeting Preparation",
        description: "Prepare agenda and materials for team meeting",
        type: "meeting",
        status: "new",
        priority: "low",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        assigneeId: "coach1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task6",
        name: "Recovery Protocol Review",
        description: "Review and update recovery protocols",
        type: "medical",
        status: "completed",
        priority: "medium",
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        assigneeId: "coach3",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task7",
        name: "Equipment Inventory",
        description: "Check and update equipment inventory",
        type: "admin",
        status: "in_progress",
        priority: "low",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        assigneeId: "coach2",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task8",
        name: "Nutrition Plan Update",
        description: "Update nutrition plans for athletes",
        type: "nutrition",
        status: "new",
        priority: "medium",
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        assigneeId: "coach3",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task9",
        name: "Season Planning Meeting",
        description: "Plan upcoming season schedule and goals",
        type: "planning",
        status: "pending",
        priority: "high",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        assigneeId: "coach1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task10",
        name: "Injury Prevention Workshop",
        description: "Conduct injury prevention workshop for athletes",
        type: "education",
        status: "new",
        priority: "medium",
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
        assigneeId: "coach3",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.insert(tasks).values(sampleTasks);
    
    // Add some task-athlete relationships
    const taskAthleteRelations = [
      { taskId: "task1", athleteId: "athlete1" }, // Knee injury for John Smith
      { taskId: "task2", athleteId: "athlete2" }, // Training plan for Maria Garcia
      { taskId: "task2", athleteId: "athlete3" }, // Training plan for James Brown
      { taskId: "task3", athleteId: "athlete1" }, // Performance analysis for John Smith
      { taskId: "task4", athleteId: "athlete4" }, // Strength training for Lisa Wang
      { taskId: "task4", athleteId: "athlete5" }, // Strength training for Robert Taylor
      { taskId: "task6", athleteId: "athlete6" }, // Recovery protocol for Anna Wilson
      { taskId: "task8", athleteId: "athlete1" }, // Nutrition plan for John Smith
      { taskId: "task8", athleteId: "athlete7" }, // Nutrition plan for David Lee
      { taskId: "task10", athleteId: "athlete2" }, // Injury prevention for Maria Garcia
      { taskId: "task10", athleteId: "athlete3" }, // Injury prevention for James Brown
      { taskId: "task10", athleteId: "athlete4" }, // Injury prevention for Lisa Wang
    ];
    
    await db.insert(taskAthletes).values(taskAthleteRelations);
    
    console.log("✅ Simple database seeded successfully!");
    res.json({ 
      message: "Simple database seeded successfully!",
      data: {
        people: samplePeople.length,
        tasks: sampleTasks.length,
        taskAthleteRelations: taskAthleteRelations.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error seeding simple database:", error);
    res.status(500).json({ 
      error: "Failed to seed simple database", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
