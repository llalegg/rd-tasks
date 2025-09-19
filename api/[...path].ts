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

    // Set the URL to match the API path
    expressReq.url = req.url || '';
    expressReq.method = req.method || 'GET';

    // Handle the request with Express
    app(expressReq, expressRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

