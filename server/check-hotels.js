// Test if hotels are in database
require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");

async function checkHotels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count total hotels
    const count = await Hotel.countDocuments();
    console.log(`\n📊 Total hotels in database: ${count}`);

    // Get all hotels
    const allHotels = await Hotel.find({}).lean();
    console.log(`\n📋 All Hotels:`);
    allHotels.forEach(h => {
      console.log(`  - ${h.name} (${h.city}, ${h.state})`);
      console.log(`    Location: ${h.location.latitude}, ${h.location.longitude}`);
      console.log(`    Price: ₹${h.pricePerNight}, Rating: ${h.rating}`);
    });

    // Test near-gem query for Chidiya Tapu (11.71, 92.77)
    console.log(`\n🧪 Testing near-gem query for Chidiya Tapu (11.71, 92.77)`);
    console.log(`   Max distance: 15km, Max price: ₹8000`);

    const lat = 11.71;
    const lon = 92.77;
    const maxBudget = 8000;

    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const nearbyHotels = allHotels.filter(h => {
      const dist = calculateDistance(lat, lon, h.location.latitude, h.location.longitude);
      return h.pricePerNight <= maxBudget && dist <= 15;
    });

    console.log(`\n✅ Found ${nearbyHotels.length} hotels near Chidiya Tapu within budget`);
    nearbyHotels.forEach(h => {
      const dist = calculateDistance(lat, lon, h.location.latitude, h.location.longitude);
      console.log(`  - ${h.name}: ${dist.toFixed(2)}km away, ₹${h.pricePerNight}/night`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkHotels();
