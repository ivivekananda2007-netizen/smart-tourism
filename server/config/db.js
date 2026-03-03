const dns = require("dns");
const mongoose = require("mongoose");

function setupDnsResolvers() {
  const configured = process.env.DNS_SERVERS;
  const servers = configured
    ? configured.split(",").map((x) => x.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];
  dns.setServers(servers);
}

module.exports = async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }
  setupDnsResolvers();
  
  // Add connection options to handle DNS issues
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip IPv6
    retryWrites: true
  };
  
  // Try to convert SRV to standard URI if needed
  let uri = mongoUri;
  if (uri.startsWith("mongodb+srv://")) {
    // For SRV URIs with DNS issues, try with direct connection
    connectOptions.directConnection = false;
  }
  
  await mongoose.connect(uri, connectOptions);
  console.log(`Mongo connected: ${mongoose.connection.host}`);
};
