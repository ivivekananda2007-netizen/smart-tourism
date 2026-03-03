const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const mongoose = require("mongoose");
const Place = require("./models/Place");
const dns = require("dns");

function setupDnsResolvers() {
  const servers = ["8.8.8.8", "1.1.1.1"];
  dns.setServers(servers);
}

async function check() {
  setupDnsResolvers();
  
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true
  };
  
  try {
    await mongoose.connect(process.env.MONGO_URI, connectOptions);
    
    // Check all hidden gems
    const allGems = await Place.countDocuments({ hiddenGem: true });
    console.log("\n✓ Total hidden gems:", allGems);
    
    // Check by crowd level
    const lowCrowd = await Place.countDocuments({ hiddenGem: true, crowdLevel: "low" });
    const mediumCrowd = await Place.countDocuments({ hiddenGem: true, crowdLevel: "medium" });
    const highCrowd = await Place.countDocuments({ hiddenGem: true, crowdLevel: "high" });
    
    console.log("  - Low crowd:", lowCrowd);
    console.log("  - Medium crowd:", mediumCrowd);
    console.log("  - High crowd:", highCrowd);
    
    // Check crowd level values in database
    const crowdLevels = await Place.find({ hiddenGem: true }).select("crowdLevel").limit(10).lean();
    console.log("\n✓ Sample crowd levels from hidden gems:");
    crowdLevels.forEach((p, i) => {
      console.log(`  ${i + 1}. crowdLevel: "${p.crowdLevel}"`);
    });
    
    // Get the actual filter result
    const filtered = await Place.countDocuments({ hiddenGem: true, crowdLevel: { $in: ["low", "medium"] } });
    console.log("\n✓ Hidden gems with low/medium crowd:", filtered);
    
    // Sample of what would be returned
    const samples = await Place.find({ hiddenGem: true, crowdLevel: { $in: ["low", "medium"] } }).limit(5).lean();
    console.log("\n✓ Sample results that would be returned:");
    samples.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.placeTown}, ${p.cityTown}, ${p.state} (crowd: ${p.crowdLevel})`);
    });
    
    await mongoose.disconnect();
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

check();
