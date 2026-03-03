const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const mongoose = require("mongoose");
const Place = require("./models/Place");
const dns = require("dns");

// Setup DNS with fallback
function setupDnsResolvers() {
  const configured = process.env.DNS_SERVERS;
  const servers = configured
    ? configured.split(",").map((x) => x.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];
  dns.setServers(servers);
}

async function verify() {
  setupDnsResolvers();
  
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true
  };
  
  try {
    await mongoose.connect(process.env.MONGO_URI, connectOptions);
    
    const samples = await Place.find({ hiddenGem: true }).limit(5).lean();
    console.log("Sample hidden gems:");
    samples.forEach(p => {
      console.log(`- ${p.placeTown}, ${p.cityTown}, ${p.state} (crowd: ${p.crowdLevel}, type: ${p.type})`);
    });
    
    await mongoose.disconnect();
  } catch (e) {
    console.error("Connection error:", e.message);
    process.exit(1);
  }
}

verify();
