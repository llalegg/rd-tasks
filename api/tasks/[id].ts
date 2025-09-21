import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (req.method === 'GET') {
      // Get specific task
      const [task] = await sql(`
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
      `, [id]);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } 
    else if (req.method === 'PUT') {
      // Update task
      const { relatedAthleteIds, ...updateData } = req.body;
      
      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (updateData.name) {
        updates.push(`name = $${paramCount++}`);
        values.push(updateData.name);
      }
      if (updateData.description) {
        updates.push(`description = $${paramCount++}`);
        values.push(updateData.description);
      }
      if (updateData.status) {
        updates.push(`status = $${paramCount++}`);
        values.push(updateData.status);
      }
      if (updateData.priority) {
        updates.push(`priority = $${paramCount++}`);
        values.push(updateData.priority);
      }
      if (updateData.type) {
        updates.push(`type = $${paramCount++}`);
        values.push(updateData.type);
      }
      if (updateData.assigneeId) {
        updates.push(`assignee_id = $${paramCount++}`);
        values.push(updateData.assigneeId);
      }
      if (updateData.deadline !== undefined) {
        updates.push(`deadline = $${paramCount++}`);
        values.push(updateData.deadline);
      }
      
      updates.push(`updated_at = NOW()`);
      values.push(id);
      
      if (updates.length > 1) { // More than just updated_at
        await sql(`
          UPDATE tasks 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
        `, values);
      }

      // Update related athletes if provided
      if (relatedAthleteIds !== undefined) {
        // Remove existing relations
        await sql(`DELETE FROM task_athletes WHERE task_id = $1`, [id]);
        
        // Add new relations
        if (relatedAthleteIds.length > 0) {
          for (const athleteId of relatedAthleteIds) {
            await sql(`
              INSERT INTO task_athletes (task_id, athlete_id)
              VALUES ($1, $2)
            `, [id, athleteId]);
          }
        }
      }

      // Get updated task
      const [updatedTask] = await sql(`
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
      `, [id]);

      res.json(updatedTask);
    }
    else if (req.method === 'DELETE') {
      // Delete task
      await sql(`DELETE FROM task_athletes WHERE task_id = $1`, [id]);
      await sql(`DELETE FROM tasks WHERE id = $1`, [id]);
      
      res.status(204).send();
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    
  } catch (error) {
    console.error('Task API error:', error);
    res.status(500).json({ 
      error: "Failed to handle task request", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}