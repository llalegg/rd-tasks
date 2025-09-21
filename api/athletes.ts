import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Return athletes
      const athletes = await sql(`
        SELECT id, name, sport, position, type
        FROM people 
        WHERE type = 'athlete'
        ORDER BY name
      `);
      
      res.json(athletes);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    
  } catch (error) {
    console.error('Athletes API error:', error);
    res.status(500).json({ 
      error: "Failed to fetch athletes", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}