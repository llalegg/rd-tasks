import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { people } from "../shared/simple-schema";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('People API - Method:', req.method);
    
    if (req.method === 'GET') {
      const allPeople = await db.select().from(people);
      res.json(allPeople);
    }
    else {
      res.status(405).json({ error: `Method ${req.method} not allowed. Supported methods: GET` });
    }
    
  } catch (error) {
    console.error('People API error:', error);
    res.status(500).json({ 
      error: "Failed to fetch people", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
