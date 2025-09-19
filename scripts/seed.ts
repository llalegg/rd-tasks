import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - remove in production)
    console.log('Clearing existing data...');
    await db.delete(schema.taskAthletes);
    await db.delete(schema.taskComments);
    await db.delete(schema.taskHistory);
    await db.delete(schema.tasks);
    await db.delete(schema.athletes);
    await db.delete(schema.users);

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
