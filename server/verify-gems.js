const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const mongoose = require("mongoose");
const Place = require("./models/Place");

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const total = await Place.countDocuments();
  const gems = await Place.countDocuments({ hiddenGem: true });
  
  console.log(`Total places: ${total}`);
  console.log(`Hidden gems: ${gems}`);
  console.log(`Regular places: ${total - gems}`);
  
  // Sample hidden gems
  const sampleGems = await Place.find({ hiddenGem: true }).limit(5).lean();
  console.log("\nSample hidden gems:");
  sampleGems.forEach(g => {
    console.log(`  - ${g.placeTown}, ${g.cityTown}, ${g.state}`);
  });
  
  await mongoose.disconnect();
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
