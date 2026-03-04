require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Hotel = require("./models/Hotel");

async function testHotelsAPI() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Test 1: Check total hotels
    console.log("📊 Test 1: Counting hotels...");
    const totalHotels = await Hotel.countDocuments();
    console.log(`   Total hotels: ${totalHotels}`);
    if (totalHotels === 0) {
      console.log("   ⚠️  No hotels found. Run: node scripts/seed-hotels.js");
    }

    // Test 2: Sample hotels by category
    console.log("\n📊 Test 2: Hotels by category...");
    const categories = ["budget", "mid-range", "luxury", "luxury-plus"];
    for (const category of categories) {
      const count = await Hotel.countDocuments({ category });
      console.log(`   ${category}: ${count}`);
    }

    // Test 3: Hotels by city
    console.log("\n📊 Test 3: Hotels by city...");
    const cities = await Hotel.distinct("city");
    for (const city of cities) {
      const count = await Hotel.countDocuments({ city });
      console.log(`   ${city}: ${count}`);
    }

    // Test 4: Budget filter test
    console.log("\n📊 Test 4: Budget filtering...");
    const budgetLimit = 5000;
    const budgetHotels = await Hotel.find({ pricePerNight: { $lte: budgetLimit } }).lean();
    console.log(`   Hotels ≤ ₹${budgetLimit}/night: ${budgetHotels.length}`);

    // Test 5: Rating filter test
    console.log("\n📊 Test 5: Rating filtering...");
    const minRating = 4;
    const ratedHotels = await Hotel.find({ rating: { $gte: minRating } }).lean();
    console.log(`   Hotels with rating ≥ ${minRating}: ${ratedHotels.length}`);

    // Test 6: Sample hotel details
    if (totalHotels > 0) {
      console.log("\n📊 Test 6: Sample hotel details...");
      const sampleHotel = await Hotel.findOne().lean();
      console.log(`   Name: ${sampleHotel.name}`);
      console.log(`   City: ${sampleHotel.city}, ${sampleHotel.state}`);
      console.log(`   Price: ₹${sampleHotel.pricePerNight}/night`);
      console.log(`   Category: ${sampleHotel.category}`);
      console.log(`   Rating: ${sampleHotel.rating}⭐`);
      console.log(`   Amenities: ${sampleHotel.amenities.join(", ")}`);
      console.log(`   Room Types: ${sampleHotel.roomTypes.map((r) => `${r.type} (₹${r.basePrice})`).join(", ")}`);
    }

    // Test 7: Location data check
    console.log("\n📊 Test 7: Location coordinates...");
    const hotelWithLocation = await Hotel.findOne({ "location.latitude": { $exists: true } }).lean();
    if (hotelWithLocation) {
      console.log(`   Sample: ${hotelWithLocation.name}`);
      console.log(`   Latitude: ${hotelWithLocation.location.latitude}`);
      console.log(`   Longitude: ${hotelWithLocation.location.longitude}`);
    }

    console.log("\n✅ All tests completed!");
    console.log("\n📝 API Endpoints to test:");
    console.log("   GET  /api/hotels");
    console.log("   GET  /api/hotels/by-city?city=Jaipur&maxPrice=5000");
    console.log("   GET  /api/hotels/near-gem?latitude=26.9124&longitude=75.7873&maxPrice=5000");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testHotelsAPI();
