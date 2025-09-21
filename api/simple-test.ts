import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ error: "No DATABASE_URL" });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT COUNT(*) as count FROM tasks`;
    
    res.json({ 
      message: "Simple test works!",
      taskCount: result[0].count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Failed", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
