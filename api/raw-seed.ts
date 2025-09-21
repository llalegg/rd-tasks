import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Raw Seed API - Method:', req.method);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create simple schema
    console.log('Creating tables...');
    
    await sql(`
      DROP TABLE IF EXISTS task_athletes;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS people;
    `);

    await sql(`
      CREATE TABLE people (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        sport TEXT,
        position TEXT
      );
    `);

    await sql(`
      CREATE TABLE tasks (
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
      CREATE TABLE task_athletes (
        task_id TEXT NOT NULL,
        athlete_id TEXT NOT NULL
      );
    `);

    console.log('Inserting people...');
    
    // Insert people
    await sql(`
      INSERT INTO people (id, name, type, sport, position) VALUES
      ('coach1', 'Coach Sarah Johnson', 'coach', 'General', 'Head Coach'),
      ('coach2', 'Coach Mike Davis', 'coach', 'Strength', 'Strength Coach'),
      ('coach3', 'Dr. Emily Rodriguez', 'coach', 'Medical', 'Sports Medicine'),
      ('athlete1', 'John Smith', 'athlete', 'Football', 'Quarterback'),
      ('athlete2', 'Maria Garcia', 'athlete', 'Basketball', 'Point Guard'),
      ('athlete3', 'James Brown', 'athlete', 'Baseball', 'Pitcher'),
      ('athlete4', 'Lisa Wang', 'athlete', 'Soccer', 'Midfielder'),
      ('athlete5', 'Robert Taylor', 'athlete', 'Track', 'Sprinter'),
      ('athlete6', 'Anna Wilson', 'athlete', 'Swimming', 'Freestyle'),
      ('athlete7', 'David Lee', 'athlete', 'Tennis', 'Singles')
    `);

    console.log('Inserting tasks...');
    
    // Insert tasks
    await sql(`
      INSERT INTO tasks (id, name, description, type, status, priority, deadline, assignee_id) VALUES
      ('task1', 'Knee Injury Assessment', 'Complete assessment for athlete knee injury', 'injury', 'new', 'high', NOW() + INTERVAL '2 days', 'coach3'),
      ('task2', 'Training Plan Review', 'Review and update weekly training plan', 'training', 'in_progress', 'medium', NOW() + INTERVAL '5 days', 'coach1'),
      ('task3', 'Performance Analysis Report', 'Analyze last game performance metrics', 'analysis', 'pending', 'medium', NOW() + INTERVAL '7 days', 'coach1'),
      ('task4', 'Strength Training Program', 'Design new strength training program', 'training', 'new', 'high', NOW() + INTERVAL '3 days', 'coach2'),
      ('task5', 'Team Meeting Preparation', 'Prepare agenda and materials for team meeting', 'meeting', 'new', 'low', NOW() + INTERVAL '1 day', 'coach1'),
      ('task6', 'Recovery Protocol Review', 'Review and update recovery protocols', 'medical', 'completed', 'medium', NOW() - INTERVAL '1 day', 'coach3'),
      ('task7', 'Equipment Inventory', 'Check and update equipment inventory', 'admin', 'in_progress', 'low', NOW() + INTERVAL '10 days', 'coach2'),
      ('task8', 'Nutrition Plan Update', 'Update nutrition plans for athletes', 'nutrition', 'new', 'medium', NOW() + INTERVAL '4 days', 'coach3'),
      ('task9', 'Season Planning Meeting', 'Plan upcoming season schedule and goals', 'planning', 'pending', 'high', NOW() + INTERVAL '14 days', 'coach1'),
      ('task10', 'Injury Prevention Workshop', 'Conduct injury prevention workshop for athletes', 'education', 'new', 'medium', NOW() + INTERVAL '6 days', 'coach3')
    `);

    console.log('Inserting task-athlete relationships...');
    
    // Insert task-athlete relationships
    await sql(`
      INSERT INTO task_athletes (task_id, athlete_id) VALUES
      ('task1', 'athlete1'),
      ('task2', 'athlete2'),
      ('task2', 'athlete3'),
      ('task3', 'athlete1'),
      ('task4', 'athlete4'),
      ('task4', 'athlete5'),
      ('task6', 'athlete6'),
      ('task8', 'athlete1'),
      ('task8', 'athlete7'),
      ('task10', 'athlete2'),
      ('task10', 'athlete3'),
      ('task10', 'athlete4')
    `);
    
    console.log("✅ Database seeded successfully!");
    res.json({ 
      message: "Database seeded successfully!",
      data: {
        people: 10,
        tasks: 10,
        taskAthleteRelations: 12
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
