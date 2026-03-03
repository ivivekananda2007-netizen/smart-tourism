#!/usr/bin/env node

/**
 * Backend Connection Test
 * Tests if MongoDB connection and API endpoints are working
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:5000/api';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function testBackend() {
  console.log('🧪 Testing Backend Connectivity...\n');

  // Test 1: Health Check
  try {
    console.log('📋 Test 1: Health Check');
    const result = await makeRequest(`${API_BASE_URL}/health`);
    console.log(`✅ Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data)}\n`);
  } catch (err) {
    console.log(`❌ Failed: ${err.message}\n`);
  }

  // Test 2: Hidden Gems Endpoint
  try {
    console.log('📋 Test 2: Hidden Gems Endpoint');
    const result = await makeRequest(`${API_BASE_URL}/places/hidden-gems`);
    console.log(`✅ Status: ${result.status}`);
    console.log(`   Found ${Array.isArray(result.data) ? result.data.length : 'N/A'} items\n`);
  } catch (err) {
    console.log(`❌ Failed: ${err.message}\n`);
  }

  // Test 3: States Endpoint
  try {
    console.log('📋 Test 3: States Endpoint');
    const result = await makeRequest(`${API_BASE_URL}/places/states`);
    console.log(`✅ Status: ${result.status}`);
    console.log(`   Found ${Array.isArray(result.data) ? result.data.length : 'N/A'} states\n`);
  } catch (err) {
    console.log(`❌ Failed: ${err.message}\n`);
  }

  console.log('✅ Backend connectivity test complete!');
}

testBackend().catch(console.error);
