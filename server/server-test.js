const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Place = require("./models/Place");

function setupDnsResolvers() {
  const configured = process.env.DNS_SERVERS;
  const servers = configured
    ? configured.split(",").map((x) => x.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];
  dns.setServers(servers);
}

function hiddenGemScore(p) {
  const crowdWeight = p.crowdLevel === "low" ? 1 : p.crowdLevel === "medium" ? 0.5 : 0.2;
  return (p.authenticityScore || 0.6) - (p.socialHypeScore || 0.4) + crowdWeight + (p.localPopularityScore || 0.5);
}

const app = express();
app.use(cors());
app.use(express.json());

let dbConnected = false;

async function connectDB() {
  setupDnsResolvers();
  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true
  };
  await mongoose.connect(process.env.MONGO_URI, connectOptions);
  dbConnected = true;
  console.log("✓ MongoDB connected");
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: dbConnected });
});

app.get("/api/places/hidden-gems", async (req, res, next) => {
  try {
    const { state, type, crowdLevel, search, preset } = req.query;
    const filter = { hiddenGem: true, crowdLevel: { $in: ["low", "medium"] } };
    if (state) filter.state = new RegExp(String(state), "i");
    if (type) filter.type = String(type).toLowerCase();
    if (crowdLevel) filter.crowdLevel = crowdLevel;
    if (search) {
      filter.$or = [
        { placeTown: new RegExp(String(search), "i") },
        { cityTown: new RegExp(String(search), "i") },
        { state: new RegExp(String(search), "i") }
      ];
    }
    if (preset === "photography") {
      filter.type = "photography";
    } else if (preset === "local-food") {
      filter.type = "food";
    }

    console.log("Fetching hidden gems with filter:", filter);
    const places = await Place.find(filter).lean();
    console.log(`Found ${places.length} hidden gems`);
    res.json(places.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a)));
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/places/states", async (req, res, next) => {
  try {
    const states = await Place.distinct("state");
    res.json(states.sort());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}/api/places/hidden-gems`);
  });
}).catch(e => {
  console.error("Failed to connect to database:", e.message);
  process.exit(1);
});
