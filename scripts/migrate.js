#!/usr/bin/env node

/**
 * Production database migration script
 * Run this after deployment to set up the database schema
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔄 Starting database migration...');

try {
  // Change to project directory
  process.chdir(projectRoot);
  
  // Run drizzle migrations
  console.log('📦 Applying database schema...');
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Database migration completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Test your API endpoints');
  console.log('2. Optionally seed the database with: curl -X POST https://your-app.vercel.app/api/seed');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
