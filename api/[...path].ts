import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
let routesRegistered = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Register routes only once
    if (!routesRegistered) {
      await registerRoutes(app);
      routesRegistered = true;
    }

    // Create a mock request/response that Express can handle
    const expressReq = req as any;
    const expressRes = res as any;

    // For Vercel catch-all routes, we need to reconstruct the proper API path
    // When a request comes to /api/tasks, Vercel routes it to this handler
    // The req.query.path contains the captured path segments
    const pathSegments = req.query.path as string[] || [];
    const url = '/api/' + pathSegments.join('/');
    
    
    expressReq.url = url;
    expressReq.method = req.method || 'GET';
    
    // Copy query parameters (excluding the path segments used for routing)
    const { path, ...restQuery } = req.query || {};
    expressReq.query = restQuery;
    
    // Copy body
    expressReq.body = req.body || {};

    // Handle the request with Express
    app(expressReq, expressRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

