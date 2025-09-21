import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Return coaches (since we removed users, but frontend expects this endpoint)
      const coaches = await sql(`
        SELECT id, name, type as role, '' as email, '' as avatar
        FROM people 
        WHERE type = 'coach'
        ORDER BY name
      `);
      
      res.json(coaches);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ 
      error: "Failed to fetch users", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}