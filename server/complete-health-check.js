#!/usr/bin/env node

/**
 * Complete Health Check & Diagnostic Tool
 * Tests: Database, API endpoints, CORS, hidden gems loading
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

console.log('\n🔍 SMART TOURISM - COMPLETE HEALTH CHECK\n');
console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log(`📍 MongoDB URI: ${process.env.MONGO_URI ? '✅ Configured' : '❌ Missing'}`);
console.log(`📍 Weather API Key: ${process.env.WEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);

let passCount = 0;
let failCount = 0;

// Test 1: Server Health
async function testServerHealth() {
  console.log('\n1️⃣  Testing Server Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    console.log('   ✅ Server is running');
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    passCount++;
  } catch (error) {
    console.log('   ❌ Server not responding');
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

// Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('\n2️⃣  Testing Database Connection...');
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4,
      retryWrites: true
    });
    console.log('   ✅ Database connected successfully');
    
    // Count collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   📊 Collections found: ${collections.length}`);
    collections.forEach(c => console.log(`      • ${c.name}`));
    
    // Count hidden gems
    const Place = require('./models/Place');
    const hiddenGemsCount = await Place.countDocuments({ hiddenGem: true });
    const totalPlacesCount = await Place.countDocuments();
    
    console.log(`   📍 Total places: ${totalPlacesCount}`);
    console.log(`   💎 Hidden gems: ${hiddenGemsCount}`);
    
    if (hiddenGemsCount > 0) {
      console.log('   ✅ Hidden gems data is loaded');
      passCount++;
    } else {
      console.log('   ❌ No hidden gems found in database');
      failCount++;
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.log('   ❌ Database connection failed');
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

// Test 3: Hidden Gems API
async function testHiddenGemsAPI() {
  console.log('\n3️⃣  Testing Hidden Gems API...');
  try {
    const response = await axios.get(`${API_BASE}/places/hidden-gems`, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('   ✅ API endpoint responding');
    
    if (Array.isArray(response.data)) {
      console.log(`   📊 Hidden gems returned: ${response.data.length}`);
      if (response.data.length > 0) {
        console.log('   ✅ Data is being returned');
        console.log(`   Example: ${response.data[0].placeTown || 'N/A'} (${response.data[0].state || 'N/A'})`);
        passCount++;
      } else {
        console.log('   ⚠️  API returned empty array');
        failCount++;
      }
    } else {
      console.log('   ❌ API returned invalid data format');
      failCount++;
    }
  } catch (error) {
    console.log('   ❌ API request failed');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    failCount++;
  }
}

// Test 4: CORS Configuration
async function testCORS() {
  console.log('\n4️⃣  Testing CORS Configuration...');
  try {
    const response = await axios.get(`${API_BASE}/places/hidden-gems`, {
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`   ✅ CORS enabled`);
      console.log(`   Allowed origin: ${corsHeader}`);
      passCount++;
    } else {
      console.log('   ⚠️  CORS headers not found');
      failCount++;
    }
  } catch (error) {
    console.log('   ❌ CORS test failed');
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

// Test 5: States API
async function testStatesAPI() {
  console.log('\n5️⃣  Testing States API...');
  try {
    const response = await axios.get(`${API_BASE}/places/states`, { timeout: 5000 });
    
    if (Array.isArray(response.data)) {
      console.log(`   ✅ States API working`);
      console.log(`   States found: ${response.data.length}`);
      console.log(`   Examples: ${response.data.slice(0, 3).join(', ')}`);
      passCount++;
    } else {
      console.log('   ❌ Invalid states data');
      failCount++;
    }
  } catch (error) {
    console.log('   ❌ States API failed');
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

// Run all tests
async function runAllTests() {
  await testServerHealth();
  await testDatabaseConnection();
  await testHiddenGemsAPI();
  await testCORS();
  await testStatesAPI();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(50));
  
  if (failCount === 0) {
    console.log('\n🎉 Everything looks good! Hidden gems should load properly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.\n');
  }
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error('Diagnostic tool error:', err);
  process.exit(1);
});
