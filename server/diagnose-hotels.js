#!/usr/bin/env node

/**
 * Hotels Feature - Comprehensive Error Diagnostic
 * Checks all aspects of the implementation
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(60));
console.log("🔍 HOTELS FEATURE - ERROR DIAGNOSIS");
console.log("=".repeat(60) + "\n");

const errors = [];
const warnings = [];
const successes = [];

// 1. Check files exist
console.log("📁 Checking files...");
const requiredFiles = [
  "server/models/Hotel.js",
  "server/routes/hotels.js",
  "server/scripts/seed-hotels.js",
  "client/src/components/HotelsNearby.jsx",
  "client/src/styles/HotelsNearby.css",
  "client/src/pages/HiddenGems.jsx"
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, "/../", file);
  if (fs.existsSync(fullPath)) {
    successes.push(`✅ ${file} exists`);
  } else {
    errors.push(`❌ ${file} NOT FOUND`);
  }
});

// 2. Check imports
console.log("📦 Checking imports...");
try {
  require("./models/Hotel");
  successes.push("✅ Hotel model imports correctly");
} catch (e) {
  errors.push(`❌ Hotel model import error: ${e.message}`);
}

try {
  require("./routes/hotels");
  successes.push("✅ Hotels routes import correctly");
} catch (e) {
  errors.push(`❌ Hotels routes import error: ${e.message}`);
}

// 3. Check database
console.log("🗄️  Checking database...");
const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");

async function checkDatabase() {
  try {
    const hotelCount = await Hotel.countDocuments();
    if (hotelCount > 0) {
      successes.push(`✅ Hotel database has ${hotelCount} documents`);
    } else {
      warnings.push(`⚠️  Hotel database is empty (${hotelCount} documents)`);
    }
  } catch (e) {
    errors.push(`❌ Database error: ${e.message}`);
  }
}

// 4. Check API endpoints
console.log("🔗 Checking API configuration...");
try {
  const hotelRoutes = require("./routes/hotels");
  successes.push("✅ Hotel routes loaded");
} catch (e) {
  errors.push(`❌ Hotel routes error: ${e.message}`);
}

// 5. Check environment
console.log("⚙️  Checking environment...");
if (process.env.MONGO_URI) {
  successes.push("✅ MONGO_URI configured");
} else {
  warnings.push("⚠️  MONGO_URI not set in .env");
}

if (process.env.PORT) {
  successes.push(`✅ PORT configured: ${process.env.PORT}`);
} else {
  successes.push("✅ PORT will default to 5000");
}

// 6. Print results
console.log("\n" + "=".repeat(60));
console.log("DIAGNOSTIC RESULTS");
console.log("=".repeat(60) + "\n");

if (successes.length > 0) {
  console.log("✅ SUCCESSES:");
  successes.forEach(s => console.log(`   ${s}`));
  console.log();
}

if (warnings.length > 0) {
  console.log("⚠️  WARNINGS:");
  warnings.forEach(w => console.log(`   ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.log("❌ ERRORS:");
  errors.forEach(e => console.log(`   ${e}`));
  console.log();
}

// 7. Database check
console.log("🔄 Connecting to database...");
checkDatabase().then(() => {
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successes: ${successes.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log("\n🎉 ALL CHECKS PASSED!");
  } else if (errors.length === 0) {
    console.log("\n✅ NO ERRORS (warnings can usually be ignored)");
  } else {
    console.log("\n❌ ERRORS FOUND - See above for details");
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
  process.exit(errors.length > 0 ? 1 : 0);
}).catch(err => {
  console.error("❌ Diagnostic failed:", err.message);
  process.exit(1);
});
