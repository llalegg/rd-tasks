import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ 
    message: 'API is working!', 
    method: req.method,
    timestamp: new Date().toISOString(),
    hasDatabase: !!process.env.DATABASE_URL
  });
}
