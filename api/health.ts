import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import { users } from "../shared/schema.js";

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Health check - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('Health check - Method:', req.method);
    
    const testQuery = await db.select().from(users).limit(1);
    res.json({ 
      status: 'ok', 
      database: 'connected',
      userCount: testQuery.length,
      timestamp: new Date().toISOString(),
      env: {
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
