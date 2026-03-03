const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const dns = require("dns");
const mongoose = require("mongoose");
const Place = require("../models/Place");
const { parseDatasetFolder } = require("../utils/parseDataset");

function setupDnsResolvers() {
  const configured = process.env.DNS_SERVERS;
  const servers = configured
    ? configured.split(",").map((x) => x.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];
  dns.setServers(servers);
}

async function seed() {
  const datasetDir = path.resolve(__dirname, "../../datasets");
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI_MISSING");
  }
  setupDnsResolvers();
  
  // Add connection options
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true
  };
  
  await mongoose.connect(process.env.MONGO_URI, connectOptions);
  const places = parseDatasetFolder(datasetDir);
  await Place.deleteMany({});
  if (places.length > 0) {
    await Place.insertMany(places, { ordered: false });
  }
  console.log(`Seeded ${places.length} places`);
  await mongoose.disconnect();
}

function printActionableError(error) {
  if (error.message === "MONGO_URI_MISSING") {
    console.error("MONGO_URI is missing in server/.env");
    console.error("Create server/.env and set MONGO_URI=<your_mongodb_connection_string>");
    return;
  }

  if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
    console.error("MongoDB SRV DNS lookup failed.");
    console.error("Your network/DNS is blocking _mongodb._tcp SRV resolution.");
    console.error("Try: change DNS to 8.8.8.8/1.1.1.1, disable VPN/proxy, or use another network.");
    return;
  }

  if (error.code === "ENOTFOUND" && error.syscall === "querySrv") {
    console.error("MongoDB SRV hostname not found.");
    console.error("Verify your Atlas cluster URL in MONGO_URI and check internet/DNS settings.");
    return;
  }

  if (error.name === "MongoServerSelectionError") {
    console.error("Could not connect to MongoDB cluster.");
    console.error("Check Atlas Network Access (allow your IP) and cluster status.");
    return;
  }

  if (error.name === "MongoServerError" && error.code === 8000) {
    console.error("MongoDB authentication failed.");
    console.error("Verify Atlas database user credentials in MONGO_URI.");
    return;
  }

  console.error(error);
}

seed().catch(async (e) => {
  printActionableError(e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
