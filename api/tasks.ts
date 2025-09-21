import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Get all tasks (simple version)
      const tasks = await sql(`SELECT * FROM tasks ORDER BY created_at DESC`);
      
      // Get related athletes for each task
      const tasksWithAthletes = [];
      for (const task of tasks) {
        const athletes = await sql(`SELECT athlete_id FROM task_athletes WHERE task_id = $1`, [task.id]);
        tasksWithAthletes.push({
          ...task,
          relatedAthleteIds: athletes.map((a: any) => a.athlete_id)
        });
      }
      
      res.json(tasksWithAthletes);
    } 
    else if (req.method === 'POST') {
      // Create new task
      const { relatedAthleteIds, ...taskData } = req.body;
      const taskId = 'task_' + Date.now();
      
      await sql(`
        INSERT INTO tasks (id, name, description, type, status, priority, deadline, assignee_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        taskId,
        taskData.name || 'New Task',
        taskData.description || 'Task description',
        taskData.type || 'general',
        taskData.status || 'new',
        taskData.priority || 'medium',
        taskData.deadline || null,
        taskData.assigneeId || 'coach1'
      ]);
      
      // Add related athletes
      if (relatedAthleteIds && relatedAthleteIds.length > 0) {
        for (const athleteId of relatedAthleteIds) {
          await sql(`
            INSERT INTO task_athletes (task_id, athlete_id)
            VALUES ($1, $2)
          `, [taskId, athleteId]);
        }
      }

      // Get the created task
      const [newTask] = await sql(`SELECT * FROM tasks WHERE id = $1`, [taskId]);
      const athletes = await sql(`SELECT athlete_id FROM task_athletes WHERE task_id = $1`, [taskId]);
      
      const taskWithAthletes = {
        ...newTask,
        relatedAthleteIds: athletes.map((a: any) => a.athlete_id)
      };

      res.status(201).json(taskWithAthletes);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    
  } catch (error) {
    console.error('Tasks API error:', error);
    res.status(500).json({ 
      error: "Failed to handle tasks request", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}