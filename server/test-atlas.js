// Switch back to MongoDB Atlas and test with longer timeout
require("dotenv").config();
const mongoose = require("mongoose");

const atlasUri = "mongodb+srv://ivivekananda2007_db_user:lzo6fv2F4ib1xRmz@cluster0.anuubzo.mongodb.net/?appName=Cluster0";

async function testConnection() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log("⏱️ Timeout: 30 seconds");

    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
    });

    console.log("✅ Connected to MongoDB!");

    const Hotel = require("./models/Hotel");
    const count = await Hotel.countDocuments();
    console.log(`📊 Hotels in database: ${count}`);

    if (count > 0) {
      const hotels = await Hotel.find({}).limit(3).lean();
      console.log("\n🏨 Sample hotels:");
      hotels.forEach(h => {
        console.log(`  - ${h.name} (${h.city})`);
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Test complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    
    // Provide troubleshooting
    if (err.message.includes("ECONNREFUSED")) {
      console.error("\n💡 MongoDB Atlas cluster might be paused.");
      console.error("   Go to https://cloud.mongodb.com → Resume cluster");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 Network/DNS issue. Check:");
      console.error("   - Internet connection");
      console.error("   - Firewall settings");
      console.error("   - IP whitelist in MongoDB Atlas");
    } else if (err.message.includes("auth")) {
      console.error("\n💡 Authentication failed. Check credentials in .env");
    }
    
    process.exit(1);
  }
}

testConnection();
