#!/usr/bin/env node

/**
 * Remote database seeding script
 * This script will call the /api/seed endpoint on your deployed Vercel app
 * to populate the database with initial data.
 */

// Replace this with your actual Vercel deployment URL
const VERCEL_URL = process.argv[2];

if (!VERCEL_URL) {
  console.error('❌ Please provide your Vercel deployment URL as an argument');
  console.error('Usage: node scripts/remote-seed.js https://your-app.vercel.app');
  process.exit(1);
}

async function testHealth() {
  console.log('🔍 Testing API health...');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.error('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database remotely...');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database seeded successfully:', data);
      return true;
    } else {
      console.error('❌ Seeding failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    return false;
  }
}

async function main() {
  console.log(`🚀 Remote seeding for: ${VERCEL_URL}`);
  console.log('');
  
  // Test health first
  const healthOk = await testHealth();
  console.log('');
  
  if (!healthOk) {
    console.error('❌ Health check failed. Please ensure:');
    console.error('1. DATABASE_URL is set in Vercel environment variables');
    console.error('2. Your app has been deployed');
    console.error('3. The database is accessible');
    process.exit(1);
  }
  
  // Seed database
  const seedOk = await seedDatabase();
  console.log('');
  
  if (seedOk) {
    console.log('🎉 Remote seeding completed successfully!');
    console.log('You can now use the app with populated data.');
  } else {
    console.error('❌ Remote seeding failed.');
    console.error('Check the Vercel function logs for more details.');
    process.exit(1);
  }
}

main().catch(console.error);
