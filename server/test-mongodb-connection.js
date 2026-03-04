#!/usr/bin/env node

/**
 * MongoDB Connection Diagnostics & Setup
 * 
 * This script tests your MongoDB connection and provides solutions
 * Run: node test-mongodb-connection.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\n❌ ERROR: MONGO_URI not found in .env file');
  console.error('   Please create .env with MONGO_URI');
  console.log('\n📋 Example .env:');
  console.log('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  console.log('   OR');
  console.log('   MONGO_URI=mongodb://localhost:27017/trip-planner\n');
  process.exit(1);
}

console.log('\n🔍 MongoDB Connection Test\n');
console.log('=' .repeat(60));

// Hide sensitive parts of URI
const displayURI = MONGO_URI
  .replace(/:[^:@]+@/, ':****@')
  .replace(/\/\/.+?@/, '//****@');

console.log(`📍 Connection String: ${displayURI}`);
console.log(`⏱️  Timeout: 10 seconds`);
console.log('=' .repeat(60));

// Test connection
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  maxPoolSize: 2
})
  .then(async () => {
    console.log('\n✅ SUCCESS: MongoDB is Connected!\n');

    try {
      // Get connection details
      const conn = mongoose.connection;
      console.log('📊 Connection Details:');
      console.log(`   Host: ${conn.host}`);
      console.log(`   Port: ${conn.port}`);
      console.log(`   Database: ${conn.name}`);
      console.log(`   State: ${conn.readyState === 1 ? 'Connected' : 'Not Connected'}`);

      // Test database operations
      console.log('\n🧪 Testing Database Operations...\n');

      // Create test collection
      const testDb = conn.db;
      const collections = await testDb.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      console.log(`📚 Existing Collections: ${collectionNames.length}`);
      collectionNames.forEach(name => {
        console.log(`   • ${name}`);
      });

      // Check if hotels collection exists
      if (collectionNames.includes('hotels')) {
        const hotelCount = await conn.collection('hotels').countDocuments();
        console.log(`\n🏨 Hotels Collection: ${hotelCount} documents`);
        
        if (hotelCount === 0) {
          console.log('\n⚠️  Hotels collection is empty!');
          console.log('   Run: node scripts/seed-hotels.js');
        } else {
          console.log('   ✅ Hotels data is available');
        }
      } else {
        console.log('\n⚠️  Hotels collection does not exist yet');
        console.log('   Run: node scripts/seed-hotels.js');
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ All tests passed! Your MongoDB is ready to use.\n');
      
      console.log('🚀 Next Steps:');
      console.log('   1. Seed hotels: node scripts/seed-hotels.js');
      console.log('   2. Start server: npm run dev');
      console.log('   3. Open browser: http://localhost:5173\n');

      process.exit(0);
    } catch (err) {
      throw err;
    }
  })
  .catch(err => {
    console.log('\n❌ ERROR: Cannot Connect to MongoDB\n');
    console.log('Error Details:');
    console.log(`   ${err.message}\n`);

    // Provide specific solutions based on error type
    if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 Solutions for "Connection Refused":');
      console.log('   This usually means MongoDB is not running or not accessible.\n');
      console.log('   Option 1: Use Local MongoDB');
      console.log('   • Install MongoDB: https://docs.mongodb.com/manual/installation/');
      console.log('   • Start MongoDB: mongod');
      console.log('   • Update .env: MONGO_URI=mongodb://localhost:27017/trip-planner\n');
      
      console.log('   Option 2: Use MongoDB Atlas (Cloud)');
      console.log('   • Go to: https://www.mongodb.com/cloud/atlas');
      console.log('   • Create free account and cluster');
      console.log('   • Update .env with new connection string');
      console.log('   • Allow your IP in MongoDB Atlas security settings\n');

      console.log('   Option 3: Check MongoDB Atlas Cluster');
      console.log('   • Log in to https://cloud.mongodb.com');
      console.log('   • Check if cluster is running (should say "Available")');
      console.log('   • If paused, click "Resume Cluster"\n');
    } 
    else if (err.message.includes('getaddrinfo') || err.message.includes('ENOTFOUND')) {
      console.log('💡 Solutions for "DNS Resolution Error":');
      console.log('   This means your computer cannot reach the MongoDB server.\n');
      console.log('   Option 1: Check Internet Connection');
      console.log('   • Verify you have internet access');
      console.log('   • Check if firewall is blocking MongoDB ports\n');
      
      console.log('   Option 2: Check MongoDB Atlas Settings');
      console.log('   • Log in to https://cloud.mongodb.com');
      console.log('   • Go to Security → Network Access');
      console.log('   • Add your IP address to whitelist');
      console.log('   • Wait a few minutes for changes to take effect\n');
      
      console.log('   Option 3: Try Local MongoDB');
      console.log('   • Install and start local MongoDB');
      console.log('   • Update .env: MONGO_URI=mongodb://localhost:27017/trip-planner\n');
    }
    else if (err.message.includes('auth') || err.message.includes('permission')) {
      console.log('💡 Solutions for "Authentication Error":');
      console.log('   This means your credentials are incorrect.\n');
      console.log('   Option 1: Verify Username and Password');
      console.log('   • Check MongoDB Atlas credentials');
      console.log('   • Verify special characters are URL encoded');
      console.log('   • Update .env with correct credentials\n');
      
      console.log('   Option 2: Reset Password');
      console.log('   • Go to https://cloud.mongodb.com');
      console.log('   • Database Access → Reset Password');
      console.log('   • Update connection string in .env\n');
    }
    else {
      console.log('💡 General Troubleshooting:');
      console.log('   • Check your internet connection');
      console.log('   • Verify .env file has MONGO_URI');
      console.log('   • Test MongoDB is running (local or cloud)');
      console.log('   • Try with local MongoDB first\n');
    }

    console.log('='.repeat(60));
    console.log('📞 Need More Help?');
    console.log('   1. Read HOTELS_ERROR_ANALYSIS.md');
    console.log('   2. Check server logs for more details');
    console.log('   3. Try local MongoDB setup\n');

    process.exit(1);
  });
