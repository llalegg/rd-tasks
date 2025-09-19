import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
let routesRegistered = false;
let server: any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Register routes only once
  if (!routesRegistered) {
    server = await registerRoutes(app);
    routesRegistered = true;
  }

  // Handle the request
  app(req as any, res as any);
}

