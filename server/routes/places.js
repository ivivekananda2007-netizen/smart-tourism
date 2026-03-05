const express = require("express");
const Place = require("../models/Place");
const { enrichPlacesWithWikipedia } = require("../services/wikipediaService");

const router = express.Router();
const hiddenGemsCache = new Map();
const HIDDEN_GEMS_CACHE_TTL_MS = 120000;
const DEFAULT_HIDDEN_GEMS_LIMIT = 120;
const MAX_HIDDEN_GEMS_LIMIT = 200;

function hiddenGemScore(p) {
  const crowdWeight = p.crowdLevel === "low" ? 1 : p.crowdLevel === "medium" ? 0.5 : 0.2;
  return (p.authenticityScore || 0.6) - (p.socialHypeScore || 0.4) + crowdWeight + (p.localPopularityScore || 0.5);
}

router.get("/hidden-gems", async (req, res, next) => {
  try {
    const { state, type, crowdLevel, search, preset } = req.query;
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(20, Math.min(MAX_HIDDEN_GEMS_LIMIT, Math.floor(requestedLimit)))
      : DEFAULT_HIDDEN_GEMS_LIMIT;

    const cacheKey = JSON.stringify({ state, type, crowdLevel, search, preset, limit });
    const cached = hiddenGemsCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < HIDDEN_GEMS_CACHE_TTL_MS) {
      return res.json(cached.data);
    }

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

    const places = await Place.find(filter).lean();
    if (!places || places.length === 0) {
      hiddenGemsCache.set(cacheKey, { ts: Date.now(), data: [] });
      return res.json([]);
    }

    const sorted = places.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a)).slice(0, limit);
    const enriched = await enrichPlacesWithWikipedia(sorted, { blocking: false });
    hiddenGemsCache.set(cacheKey, { ts: Date.now(), data: enriched });
    res.json(enriched);
  } catch (e) {
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
    const enriched = await enrichPlacesWithWikipedia(sorted);
    res.json(enriched);
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

    const sortedPlaces = items.sort((a, b) => hiddenGemScore(b) - hiddenGemScore(a));
    const enrichedPlaces = await enrichPlacesWithWikipedia(sortedPlaces);
    res.json({ places: enrichedPlaces, recommendations });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
