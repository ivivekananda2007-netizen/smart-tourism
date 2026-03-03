const express = require("express");
const Place = require("../models/Place");

const router = express.Router();

function hiddenGemScore(p) {
  const crowdWeight = p.crowdLevel === "low" ? 1 : p.crowdLevel === "medium" ? 0.5 : 0.2;
  return (p.authenticityScore || 0.6) - (p.socialHypeScore || 0.4) + crowdWeight + (p.localPopularityScore || 0.5);
}

router.get("/hidden-gems", async (req, res, next) => {
  try {
    const { state, type, crowdLevel, search, preset } = req.query;
    console.log("🔍 /hidden-gems request:", { state, type, crowdLevel, search, preset });
    
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

    console.log("📋 Applying filter:", JSON.stringify(filter));
    const places = await Place.find(filter).lean();
    console.log(`✅ Found ${places.length} places`);
    
    if (!places || places.length === 0) {
      console.warn("⚠️ No hidden gems found with filter:", filter);
      return res.json([]);
    }
    res.json(places.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a)));
  } catch (e) {
    console.error("❌ Error in hidden-gems endpoint:", e.message);
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { state, type, hiddenGem, crowdLevel, search, preset } = req.query;
    const filter = {};
    if (state) filter.state = new RegExp(String(state), "i");
    if (type) filter.type = String(type).toLowerCase();
    if (hiddenGem !== undefined) filter.hiddenGem = hiddenGem === "true";
    if (crowdLevel) filter.crowdLevel = crowdLevel;
    if (search) {
      filter.$or = [
        { placeTown: new RegExp(String(search), "i") },
        { cityTown: new RegExp(String(search), "i") },
        { state: new RegExp(String(search), "i") }
      ];
    }

    if (preset === "quiet") {
      filter.crowdLevel = "low";
      filter.hiddenGem = true;
    } else if (preset === "photography") {
      filter.type = "photography";
    } else if (preset === "local-food") {
      filter.type = "food";
    }

    const places = await Place.find(filter).lean();
    const sorted = places.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a));
    res.json(sorted);
  } catch (e) {
    next(e);
  }
});

router.get("/states", async (req, res, next) => {
  try {
    const states = await Place.distinct("state");
    res.json(states.sort());
  } catch (e) {
    next(e);
  }
});

router.get("/by-destination/:destination", async (req, res, next) => {
  try {
    const d = String(req.params.destination);
    const items = await Place.find({
      $or: [{ state: new RegExp(d, "i") }, { cityTown: new RegExp(d, "i") }, { placeTown: new RegExp(d, "i") }]
    }).lean();

    const byCity = {};
    for (const p of items) {
      const k = p.cityTown;
      if (!byCity[k]) byCity[k] = [];
      byCity[k].push(p);
    }

    const recommendations = [];
    Object.values(byCity).forEach((list) => {
      const crowded = list.find((x) => !x.hiddenGem && x.crowdLevel === "high");
      const calm = list.find((x) => x.hiddenGem || x.crowdLevel === "low");
      if (crowded && calm) {
        recommendations.push({
          insteadOf: crowded.placeTown,
          tryThis: calm.placeTown,
          cityTown: crowded.cityTown,
          reason: "Less crowded and more authentic local experience"
        });
      }
    });

    res.json({ places: items.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a)), recommendations });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
