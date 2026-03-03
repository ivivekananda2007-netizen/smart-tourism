#!/usr/bin/env node

/**
 * Quick Verification Script
 * Checks if everything is configured correctly for hidden gems to load
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 HIDDEN GEMS CONFIGURATION CHECK\n');

let issues = [];
let fixes = [];

// Check 1: Server .env exists
console.log('1️⃣  Checking server/.env...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  if (envContent.includes('MONGO_URI')) {
    console.log('   ✅ Server .env exists with MONGO_URI');
  } else {
    console.log('   ❌ Server .env missing MONGO_URI');
    issues.push('Server .env missing MONGO_URI');
  }
} else {
  console.log('   ❌ Server .env not found');
  issues.push('Server .env not found');
}

// Check 2: Client .env exists
console.log('\n2️⃣  Checking client/.env...');
if (fs.existsSync(path.join(__dirname, '../client/.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '../client/.env'), 'utf-8');
  if (envContent.includes('VITE_API_BASE_URL')) {
    console.log('   ✅ Client .env exists with VITE_API_BASE_URL');
  } else {
    console.log('   ❌ Client .env missing VITE_API_BASE_URL');
    issues.push('Client .env missing VITE_API_BASE_URL');
    fixes.push('Add VITE_API_BASE_URL=http://localhost:5000/api to client/.env');
  }
} else {
  console.log('   ❌ Client .env not found');
  issues.push('Client .env not found');
  fixes.push('Create client/.env with: VITE_API_BASE_URL=http://localhost:5000/api');
}

// Check 3: Server dependencies
console.log('\n3️⃣  Checking server dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ Server node_modules exists');
} else {
  console.log('   ❌ Server node_modules not found');
  issues.push('Server dependencies not installed');
  fixes.push('Run: cd server && npm install');
}

// Check 4: Client dependencies
console.log('\n4️⃣  Checking client dependencies...');
if (fs.existsSync(path.join(__dirname, '../client/node_modules'))) {
  console.log('   ✅ Client node_modules exists');
} else {
  console.log('   ❌ Client node_modules not found');
  issues.push('Client dependencies not installed');
  fixes.push('Run: cd client && npm install');
}

// Check 5: Key server files
console.log('\n5️⃣  Checking server files...');
const requiredFiles = [
  'index.js',
  'routes/places.js',
  'models/Place.js',
  'config/db.js'
];
let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});
if (missingFiles.length === 0) {
  console.log('   ✅ All required server files exist');
} else {
  console.log('   ❌ Missing files:', missingFiles.join(', '));
  issues.push('Missing server files: ' + missingFiles.join(', '));
}

// Check 6: Key client files
console.log('\n6️⃣  Checking client files...');
const clientFiles = [
  'src/api.js',
  'src/pages/HiddenGems.jsx'
];
let missingClientFiles = [];
clientFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, '../client', file))) {
    missingClientFiles.push(file);
  }
});
if (missingClientFiles.length === 0) {
  console.log('   ✅ All required client files exist');
} else {
  console.log('   ❌ Missing files:', missingClientFiles.join(', '));
  issues.push('Missing client files: ' + missingClientFiles.join(', '));
}

// Summary
console.log('\n' + '='.repeat(50));
if (issues.length === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nYour setup is correct. To get hidden gems working:');
  console.log('\n1️⃣  Start backend:');
  console.log('   cd server && npm run dev');
  console.log('\n2️⃣  In new terminal, start frontend:');
  console.log('   cd client && npm run dev');
  console.log('\n3️⃣  Open browser:');
  console.log('   http://localhost:5173/hidden-gems');
  console.log('\n✨ Hidden gems should load with 943 places!');
} else {
  console.log(`❌ FOUND ${issues.length} ISSUE(S)\n`);
  console.log('Issues:');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  console.log('\nQuick Fixes:');
  fixes.forEach((fix, i) => {
    console.log(`${i + 1}. ${fix}`);
  });
}
console.log('='.repeat(50) + '\n');

process.exit(issues.length === 0 ? 0 : 1);
