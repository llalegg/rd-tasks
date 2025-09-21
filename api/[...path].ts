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
    // Check database connection
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    
    // Register routes only once
    if (!routesRegistered) {
      console.log('Registering Express routes...');
      await registerRoutes(app);
      routesRegistered = true;
      console.log('Routes registered successfully');
      
      // Log all registered routes for debugging
      console.log('Registered routes:');
      app._router.stack.forEach((layer: any) => {
        if (layer.route) {
          console.log(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
        }
      });
    }

    // Create a mock request/response that Express can handle
    const expressReq = req as any;
    const expressRes = res as any;

    // For Vercel catch-all routes, we need to reconstruct the proper API path
    // When a request comes to /api/tasks, Vercel routes it to this handler
    // The req.query.path contains the captured path segments
    const pathSegments = req.query.path as string[] || [];
    const url = '/api/' + pathSegments.join('/');
    
    // Temporary debug logging for deployment troubleshooting
    console.log('=== API Handler Debug ===');
    console.log('Original req.url:', req.url);
    console.log('req.query:', JSON.stringify(req.query));
    console.log('pathSegments:', pathSegments);
    console.log('Reconstructed URL:', url);
    console.log('Method:', req.method);
    console.log('========================');
    
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

