import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import { athletes } from "../shared/schema.js";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Athletes API - Method:', req.method);
    
    if (req.method === 'GET') {
      const allAthletes = await db.select().from(athletes);
      res.json(allAthletes);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Athletes API error:', error);
    res.status(500).json({ 
      error: "Failed to fetch athletes", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
