import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Load environment variables - try multiple sources
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });
dotenv.config({ path: '.env.development.local' });

// Fallback to Neon database URL if not set
if (!process.env.DATABASE_URL) {
  console.log('Using fallback DATABASE_URL...');
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_QDAz4B6KYZyo@ep-dry-lake-adrd3nf5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Drop and recreate tables to ensure clean schema
    console.log('Recreating database schema...');
    
    // Drop tables in reverse order of dependencies
    await pool.query('DROP TABLE IF EXISTS task_media CASCADE');
    await pool.query('DROP TABLE IF EXISTS task_athletes CASCADE');
    await pool.query('DROP TABLE IF EXISTS task_comments CASCADE');
    await pool.query('DROP TABLE IF EXISTS task_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS media_files CASCADE');
    await pool.query('DROP TABLE IF EXISTS athletes CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Drop existing enums
    await pool.query('DROP TYPE IF EXISTS task_type CASCADE');
    await pool.query('DROP TYPE IF EXISTS task_status CASCADE');
    await pool.query('DROP TYPE IF EXISTS task_priority CASCADE');
    await pool.query('DROP TYPE IF EXISTS user_role CASCADE');
    await pool.query('DROP TYPE IF EXISTS media_type CASCADE');
    await pool.query('DROP TYPE IF EXISTS history_action CASCADE');
    
    // Create enums
    await pool.query(`CREATE TYPE task_type AS ENUM('mechanicalanalysis', 'datareporting', 'injury', 'generaltodo', 'schedulecall', 'coachassignment', 'createprogram', 'assessmentreview')`);
    await pool.query(`CREATE TYPE task_status AS ENUM('new', 'in_progress', 'pending', 'completed')`);
    await pool.query(`CREATE TYPE task_priority AS ENUM('low', 'medium', 'high')`);
    await pool.query(`CREATE TYPE user_role AS ENUM('admin', 'coach', 'analyst', 'therapist', 'athlete', 'parent', 'staff')`);
    await pool.query(`CREATE TYPE media_type AS ENUM('description', 'comment')`);
    await pool.query(`CREATE TYPE history_action AS ENUM('created', 'status_changed', 'comment_added', 'media_added', 'assigned', 'deadline_changed')`);
    
    // Create tables
    await pool.query(`
      CREATE TABLE users (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        role user_role NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE athletes (
        id text PRIMARY KEY,
        name text NOT NULL,
        sport text NOT NULL,
        team text,
        position text
      )
    `);
    
    await pool.query(`
      CREATE TABLE media_files (
        id text PRIMARY KEY,
        filename text NOT NULL,
        original_name text NOT NULL,
        mime_type text NOT NULL,
        file_size integer NOT NULL,
        file_path text NOT NULL,
        uploaded_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE tasks (
        id text PRIMARY KEY,
        name text NOT NULL,
        type task_type NOT NULL,
        description text,
        assignee_id text REFERENCES users(id),
        creator_id text REFERENCES users(id),
        deadline timestamp,
        status task_status NOT NULL DEFAULT 'new',
        priority task_priority NOT NULL DEFAULT 'medium',
        comment text,
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE task_athletes (
        task_id text REFERENCES tasks(id) NOT NULL,
        athlete_id text REFERENCES athletes(id) NOT NULL,
        PRIMARY KEY (task_id, athlete_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE task_comments (
        id text PRIMARY KEY,
        task_id text REFERENCES tasks(id) NOT NULL,
        text text NOT NULL,
        author_id text REFERENCES users(id) NOT NULL,
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE task_history (
        id text PRIMARY KEY,
        task_id text REFERENCES tasks(id) NOT NULL,
        action history_action NOT NULL,
        old_value text,
        new_value text,
        user_id text REFERENCES users(id) NOT NULL,
        created_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE task_media (
        id text PRIMARY KEY,
        task_id text REFERENCES tasks(id) NOT NULL,
        media_id text REFERENCES media_files(id) NOT NULL,
        media_type media_type NOT NULL,
        created_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('✅ Database schema created successfully!');
    console.log('Inserting seed data...');

    // Seed Users
    console.log('Seeding users...');
    await db.insert(schema.users).values([
      { 
        id: "1", 
        name: "John Withington", 
        email: "john@treadel.com", 
        role: "admin" 
      },
      { 
        id: "2", 
        name: "Sarah Coach", 
        email: "sarah@treadel.com", 
        role: "coach" 
      },
      { 
        id: "3", 
        name: "Mike Manager", 
        email: "mike@treadel.com", 
        role: "analyst" 
      },
      { 
        id: "4", 
        name: "Emma Therapist", 
        email: "emma@treadel.com", 
        role: "therapist" 
      },
      { 
        id: "5", 
        name: "Lisa Rodriguez", 
        email: "lisa@treadel.com", 
        role: "coach" 
      }
    ]);

    // Seed Athletes
    console.log('Seeding athletes...');
    await db.insert(schema.athletes).values([
      { 
        id: "1", 
        name: "Christopher Harris", 
        sport: "Basketball", 
        team: "Lakers", 
        position: "Point Guard" 
      },
      { 
        id: "2", 
        name: "Samanta Harris", 
        sport: "Soccer", 
        team: "United", 
        position: "Forward" 
      },
      { 
        id: "3", 
        name: "Randy Harris", 
        sport: "Tennis", 
        team: null, 
        position: null 
      },
      { 
        id: "4", 
        name: "Michael Johnson", 
        sport: "Swimming", 
        team: "Sharks", 
        position: "Freestyle" 
      },
      { 
        id: "5", 
        name: "Sarah Williams", 
        sport: "Track", 
        team: "Eagles", 
        position: "Sprinter" 
      },
      { 
        id: "6", 
        name: "David Brown", 
        sport: "Baseball", 
        team: "Tigers", 
        position: "Pitcher" 
      },
      { 
        id: "7", 
        name: "Emma Davis", 
        sport: "Football", 
        team: "Hawks", 
        position: "Quarterback" 
      },
      { 
        id: "8", 
        name: "James Wilson", 
        sport: "Hockey", 
        team: "Wolves", 
        position: "Center" 
      },
      { 
        id: "9", 
        name: "Olivia Martinez", 
        sport: "Volleyball", 
        team: "Storms", 
        position: "Setter" 
      },
      { 
        id: "10", 
        name: "Alexander Garcia", 
        sport: "Golf", 
        team: null, 
        position: null 
      }
    ]);

    // Seed Tasks
    console.log('Seeding tasks...');
    const taskData = [
      {
        id: "1",
        name: "Schedule a call (Injury)",
        description: "Schedule call with athlete to discuss injury recovery plan",
        type: "injury",
        priority: "medium",
        status: "new",
        creatorId: "1",
        assigneeId: "4", // Emma Therapist
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      },
      {
        id: "2", 
        name: "Mechanical Analysis Review",
        description: "Review latest biomechanical analysis data and provide recommendations",
        type: "mechanicalanalysis",
        priority: "high",
        status: "in_progress",
        creatorId: "2", // Sarah Coach
        assigneeId: "3", // Mike Manager
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        id: "3",
        name: "Create Training Program",
        description: "Design personalized training program for recovering athlete",
        type: "createprogram",
        priority: "high",
        status: "new",
        creatorId: "2",
        assigneeId: "2",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        id: "4",
        name: "Performance Data Report",
        description: "Compile weekly performance metrics and analysis report",
        type: "datareporting",
        priority: "medium",
        status: "new",
        creatorId: "1",
        assigneeId: "3",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
      },
      {
        id: "5",
        name: "Assessment Review Meeting",
        description: "Review quarterly assessment results with coaching staff",
        type: "assessmentreview",
        priority: "low",
        status: "completed",
        creatorId: "1",
        assigneeId: "2",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago (completed)
      }
    ];

    await db.insert(schema.tasks).values(taskData);

    // Seed Task-Athlete relationships
    console.log('Seeding task-athlete relationships...');
    await db.insert(schema.taskAthletes).values([
      { taskId: "1", athleteId: "1" }, // Christopher Harris - injury call
      { taskId: "1", athleteId: "2" }, // Samanta Harris - injury call
      { taskId: "2", athleteId: "3" }, // Randy Harris - mechanical analysis
      { taskId: "3", athleteId: "1" }, // Christopher Harris - training program
      { taskId: "3", athleteId: "4" }, // Michael Johnson - training program
      { taskId: "4", athleteId: "5" }, // Sarah Williams - performance report
      { taskId: "4", athleteId: "6" }, // David Brown - performance report
      { taskId: "4", athleteId: "7" }, // Emma Davis - performance report
      { taskId: "5", athleteId: "8" }, // James Wilson - assessment review
      { taskId: "5", athleteId: "9" }, // Olivia Martinez - assessment review
    ]);

    // Seed Task Comments
    console.log('Seeding task comments...');
    await db.insert(schema.taskComments).values([
      {
        id: "1",
        taskId: "1",
        text: "Initial assessment shows minor strain. Should recover within 2-3 weeks with proper rest.",
        authorId: "4"
      },
      {
        id: "2", 
        taskId: "2",
        text: "Analysis shows improvement in running form. Recommend continuing current training protocol.",
        authorId: "3"
      },
      {
        id: "3",
        taskId: "3",
        text: "Program should focus on gradually building strength while avoiding re-injury.",
        authorId: "2"
      }
    ]);

    // Seed Task History
    console.log('Seeding task history...');
    await db.insert(schema.taskHistory).values([
      {
        id: "1",
        taskId: "1",
        action: "created",
        oldValue: null,
        newValue: "new",
        userId: "1"
      },
      {
        id: "2",
        taskId: "2", 
        action: "status_changed",
        oldValue: "new",
        newValue: "in_progress",
        userId: "3"
      },
      {
        id: "3",
        taskId: "5",
        action: "status_changed", 
        oldValue: "in_progress",
        newValue: "completed",
        userId: "2"
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Seeded data:');
    console.log('  - 5 users');
    console.log('  - 10 athletes');
    console.log('  - 5 tasks');
    console.log('  - 10 task-athlete relationships');
    console.log('  - 3 comments');
    console.log('  - 3 history entries');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
