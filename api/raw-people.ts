import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Raw People API - Method:', req.method, 'Query:', req.query);
    
    if (req.method === 'GET') {
      const { type } = req.query;
      
      let query = 'SELECT * FROM people';
      let params: any[] = [];
      
      if (type) {
        query += ' WHERE type = $1';
        params.push(type);
      }
      
      query += ' ORDER BY name';
      
      const people = await sql(query, params);
      res.json(people);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed. Supported methods: GET` });
    }
    
  } catch (error) {
    console.error('Raw People API error:', error);
    res.status(500).json({ 
      error: "Failed to fetch people", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
