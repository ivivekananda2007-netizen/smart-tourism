#!/usr/bin/env node

/**
 * MongoDB Setup Wizard
 * Helps you set up MongoDB connection for the hotel feature
 * 
 * Usage:
 *   - Windows: node setup-mongodb.js
 *   - Mac/Linux: node setup-mongodb.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.clear();
  console.log('\n' + '='.repeat(60));
  console.log('   🏨 MongoDB Setup Wizard for Hotel Feature');
  console.log('='.repeat(60) + '\n');

  console.log('Choose your MongoDB setup:\n');
  console.log('1️⃣  Local MongoDB (Fast, No Setup Required)');
  console.log('     • Must have MongoDB installed locally');
  console.log('     • Run: mongod\n');

  console.log('2️⃣  MongoDB Atlas (Cloud, Free Tier Available)');
  console.log('     • https://www.mongodb.com/cloud/atlas');
  console.log('     • Create free account and cluster\n');

  console.log('3️⃣  Already Have Connection String');
  console.log('     • Enter your MONGO_URI directly\n');

  const choice = await question('Choose option (1-3): ');

  let mongoUri = '';

  if (choice === '1') {
    console.log('\n✅ Local MongoDB Setup\n');
    console.log('Make sure MongoDB is running:');
    console.log('  Windows: mongod (in cmd or PowerShell)');
    console.log('  Mac: mongod (requires installation)');
    console.log('  Linux: sudo systemctl start mongod\n');

    mongoUri = 'mongodb://localhost:27017/trip-planner';
    console.log(`Connection String: ${mongoUri}\n`);
  } 
  else if (choice === '2') {
    console.log('\n✅ MongoDB Atlas Setup\n');
    
    const username = await question('Username (from MongoDB Atlas): ');
    const password = await question('Password (from MongoDB Atlas): ');
    const cluster = await question('Cluster address (e.g., cluster0.xxxxx.mongodb.net): ');
    const dbName = await question('Database name (default: trip-planner): ') || 'trip-planner';

    mongoUri = `mongodb+srv://${username}:${password}@${cluster}/?appName=Cluster0`;

    console.log('\n✅ MongoDB Atlas Connection String created\n');
    console.log('IMPORTANT: Whitelist Your IP');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Database Access → Network Access');
    console.log('3. Add your IP address (0.0.0.0/0 for testing only)\n');
  }
  else if (choice === '3') {
    mongoUri = await question('Enter MongoDB URI: ');
    console.log('\n');
  }
  else {
    console.log('❌ Invalid choice. Exiting.\n');
    rl.close();
    process.exit(1);
  }

  // Read existing .env
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Update or add MONGO_URI
  if (envContent.includes('MONGO_URI=')) {
    envContent = envContent.replace(/MONGO_URI=.*/, `MONGO_URI=${mongoUri}`);
  } else {
    envContent += `\n# MongoDB Connection\nMONGO_URI=${mongoUri}\n`;
  }

  // Save .env
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env file updated successfully!\n');
  console.log('Next steps:');
  console.log('1. Test connection: node test-mongodb-connection.js');
  console.log('2. Seed hotels: node scripts/seed-hotels.js');
  console.log('3. Start server: npm run dev\n');

  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
