import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Get all tasks with related athletes
      const tasks = await sql(`
        SELECT 
          t.*,
          COALESCE(
            ARRAY_AGG(ta.athlete_id) FILTER (WHERE ta.athlete_id IS NOT NULL), 
            ARRAY[]::text[]
          ) as related_athlete_ids
        FROM tasks t
        LEFT JOIN task_athletes ta ON t.id = ta.task_id
        GROUP BY t.id, t.name, t.description, t.type, t.status, t.priority, t.deadline, t.assignee_id, t.created_at, t.updated_at
        ORDER BY t.created_at DESC
      `);
      
      res.json(tasks);
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
      const [newTask] = await sql(`
        SELECT 
          t.*,
          COALESCE(
            ARRAY_AGG(ta.athlete_id) FILTER (WHERE ta.athlete_id IS NOT NULL), 
            ARRAY[]::text[]
          ) as related_athlete_ids
        FROM tasks t
        LEFT JOIN task_athletes ta ON t.id = ta.task_id
        WHERE t.id = $1
        GROUP BY t.id, t.name, t.description, t.type, t.status, t.priority, t.deadline, t.assignee_id, t.created_at, t.updated_at
      `, [taskId]);

      res.status(201).json(newTask);
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