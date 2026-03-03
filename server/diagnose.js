const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const dns = require("dns").promises;

async function diagnose() {
  console.log("=== MongoDB Connection Diagnosis ===\n");
  
  const mongoUri = process.env.MONGO_URI;
  console.log("1. MONGO_URI configured:", !!mongoUri);
  
  if (!mongoUri) {
    console.error("ERROR: MONGO_URI not set in .env");
    return;
  }
  
  console.log("2. Extracted hostname from URI...");
  const urlMatch = mongoUri.match(/mongodb\+srv:\/\/[^@]+@([^/?]+)/);
  const hostname = urlMatch ? urlMatch[1] : null;
  console.log("   Hostname:", hostname);
  
  if (hostname) {
    console.log("\n3. Testing DNS resolution...");
    try {
      const addresses = await dns.resolve4(hostname);
      console.log("   ✓ DNS resolved to:", addresses);
    } catch (e) {
      console.log("   ✗ DNS resolution failed:", e.message);
    }
    
    console.log("\n4. Attempting MongoDB connection...");
    try {
      const mongoose = require("mongoose");
      const setupDnsResolvers = () => {
        const dns = require("dns");
        const configured = process.env.DNS_SERVERS;
        const servers = configured
          ? configured.split(",").map((x) => x.trim()).filter(Boolean)
          : ["8.8.8.8", "1.1.1.1"];
        dns.setServers(servers);
      };
      
      setupDnsResolvers();
      console.log("   DNS servers configured: 8.8.8.8, 1.1.1.1");
      
      const conn = await mongoose.connect(mongoUri);
      console.log("   ✓ Connected to MongoDB");
      
      const Place = require("./models/Place");
      const count = await Place.countDocuments();
      const gemCount = await Place.countDocuments({ hiddenGem: true });
      
      console.log("\n5. Database statistics:");
      console.log(`   Total places: ${count}`);
      console.log(`   Hidden gems: ${gemCount}`);
      
      await mongoose.disconnect();
    } catch (e) {
      console.log("   ✗ Connection failed:", e.message);
      console.log("   Code:", e.code);
    }
  }
}

diagnose().catch(console.error);
