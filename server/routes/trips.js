const express = require("express");
const fs = require("fs");
const path = require("path");
const Trip = require("../models/Trip");
const Place = require("../models/Place");
const Hotel = require("../models/Hotel");
const { protect } = require("../middleware/auth");
const { generateItinerary } = require("../services/itineraryService");
const { calculateBudget, normalizeExpenseCategory } = require("../services/budgetService");
const { getWeather, weatherReplanHint } = require("../services/weatherService");
const { validateTripGenerationInput, validateExpenseInput } = require("../utils/validators");

const router = express.Router();

let datasetHotelsCache = null;
let datasetHotelsCacheTs = 0;

function valueFromKeys(obj, keys) {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") return val;
  }
  return "";
}

function parsePriceToNumber(value, fallback = 2000) {
  const nums = String(value || "").match(/\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return fallback;
  const parts = nums.map(Number).filter(Number.isFinite);
  if (parts.length === 1) return Math.round(parts[0]);
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function parseRecordsFromFile(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
    return [];
  } catch (_) {
    const chunks = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < raw.length; i += 1) {
      if (raw[i] === "{") {
        if (depth === 0) start = i;
        depth += 1;
      } else if (raw[i] === "}") {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          chunks.push(raw.slice(start, i + 1));
          start = -1;
        }
      }
    }
    const records = [];
    for (const chunk of chunks) {
      try {
        records.push(JSON.parse(chunk));
      } catch (_) {
        // ignore malformed chunk
      }
    }
    return records;
  }
}

function inferCategoryFromTier(tierKey, price) {
  const t = String(tierKey || "").toLowerCase();
  if (t.includes("luxury") || price >= 8000) return "luxury-plus";
  if (t.includes("premium") || t.includes("deluxe") || price >= 5000) return "luxury";
  if (t.includes("normal") || t.includes("standard") || price >= 2200) return "mid-range";
  return "budget";
}

function ratingFromCategory(category) {
  if (category === "luxury-plus") return 4.8;
  if (category === "luxury") return 4.6;
  if (category === "mid-range") return 4.3;
  return 3.9;
}

function extractHotelsFromAccommodation(accommodation) {
  if (!accommodation || typeof accommodation !== "object") return [];
  const out = [];

  for (const [tier, info] of Object.entries(accommodation)) {
    if (Array.isArray(info)) {
      info.forEach((entry) => {
        const name = String(valueFromKeys(entry, ["hotel_name", "hotelName", "name"])).trim();
        if (!name) return;
        const price = parsePriceToNumber(
          valueFromKeys(entry, ["price_per_night_inr", "avg_price_per_night", "price", "pricePerNight"]),
          2200
        );
        out.push({ tier, name, price });
      });
      continue;
    }

    const name = String(valueFromKeys(info, ["hotel_name", "hotelName", "name"])).trim();
    if (!name) continue;
    const price = parsePriceToNumber(
      valueFromKeys(info, ["price_per_night_inr", "avg_price_per_night", "price", "pricePerNight"]),
      2200
    );
    out.push({ tier, name, price });
  }

  return out;
}

function loadDatasetHotels() {
  const now = Date.now();
  if (datasetHotelsCache && now - datasetHotelsCacheTs < 10 * 60 * 1000) {
    return datasetHotelsCache;
  }

  const datasetDir = path.resolve(__dirname, "../../datasets");
  let files = [];
  try {
    files = fs.readdirSync(datasetDir).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch (_) {
    datasetHotelsCache = [];
    datasetHotelsCacheTs = now;
    return datasetHotelsCache;
  }

  const dedupe = new Map();
  for (const file of files) {
    let records = [];
    try {
      records = parseRecordsFromFile(fs.readFileSync(path.join(datasetDir, file), "utf8"));
    } catch (_) {
      continue;
    }

    for (const rec of records) {
      const state = String(valueFromKeys(rec, ["state", "State"])).trim();
      const city = String(valueFromKeys(rec, ["city", "city_town", "cityTown", "CityTown", "town"])).trim();
      const accommodation = rec?.accommodation;
      if (!state || !city || !accommodation || typeof accommodation !== "object") continue;

      const extractedHotels = extractHotelsFromAccommodation(accommodation);
      for (const h of extractedHotels) {
        const hotelName = h.name;
        const price = h.price;
        const tier = h.tier;
        const category = inferCategoryFromTier(tier, price);
        const key = `${state}|${city}|${hotelName}`.toLowerCase();
        if (!dedupe.has(key)) {
          dedupe.set(key, {
            _id: `dataset-${Buffer.from(key).toString("base64").replace(/=+$/g, "").slice(0, 24)}`,
            name: hotelName,
            city,
            state,
            pricePerNight: price,
            rating: ratingFromCategory(category),
            category,
            amenities: ["WiFi", "AC"]
          });
        }
      }
    }
  }

  datasetHotelsCache = Array.from(dedupe.values());
  datasetHotelsCacheTs = now;
  return datasetHotelsCache;
}

async function getHotelsDataForTrips() {
  const datasetHotels = loadDatasetHotels();
  if (Hotel?.db?.readyState === 1) {
    try {
      const hotels = await Hotel.find({}).lean();
      if (Array.isArray(hotels) && hotels.length > 0) {
        const merged = new Map();
        [...datasetHotels, ...hotels].forEach((h) => {
          const key = `${h.name}|${h.city}|${h.state}`.toLowerCase();
          merged.set(key, h);
        });
        return Array.from(merged.values());
      }
    } catch (_) {
      return datasetHotels;
    }
  }
  return datasetHotels;
}

async function getRecommendedHotelsForTrip(destination, itinerary, budget, totalDays, travelStyle) {
  const allHotels = await getHotelsDataForTrips();
  if (!Array.isArray(allHotels) || allHotels.length === 0) return [];

  const styleFactor = travelStyle === "luxury" ? 1.2 : travelStyle === "family" ? 1.0 : 0.9;
  const perNightBudget = Math.max(500, Math.floor((Number(budget) / Math.max(1, Number(totalDays))) * styleFactor));
  const destinationRegex = new RegExp(String(destination), "i");
  const citiesFromPlan = new Set();
  (itinerary || []).forEach((d) => (d.places || []).forEach((p) => citiesFromPlan.add(String(p.cityTown || "").toLowerCase())));

  let matching = allHotels.filter((h) => {
    const city = String(h.city || "");
    const state = String(h.state || "");
    const inDestination = destinationRegex.test(city) || destinationRegex.test(state) || citiesFromPlan.has(city.toLowerCase());
    return inDestination && Number(h.pricePerNight || 0) <= perNightBudget;
  });

  if (matching.length === 0) {
    matching = allHotels.filter((h) => {
      const city = String(h.city || "");
      const state = String(h.state || "");
      const inDestination = destinationRegex.test(city) || destinationRegex.test(state) || citiesFromPlan.has(city.toLowerCase());
      return inDestination && Number(h.pricePerNight || 0) <= perNightBudget;
    });
  }

  // Final fallback: show affordable hotels only (still within budget cap).
  if (matching.length === 0) {
    matching = allHotels.filter((h) => Number(h.pricePerNight || 0) <= perNightBudget);
  }

  return matching
    .sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)) || (Number(a.pricePerNight || 0) - Number(b.pricePerNight || 0)))
    .slice(0, 8)
    .map((h) => ({
      hotelId: String(h._id || ""),
      name: h.name,
      city: h.city,
      state: h.state,
      pricePerNight: Number(h.pricePerNight || 0),
      rating: Number(h.rating || 0),
      category: h.category || "mid-range",
      amenities: Array.isArray(h.amenities) ? h.amenities : [],
      website: h.website || "",
      phone: h.phone || "",
      email: h.email || ""
    }));
}

router.post("/generate", protect, async (req, res, next) => {
  try {
    const err = validateTripGenerationInput(req.body);
    if (err) {
      res.status(400);
      throw new Error(err);
    }

    const destination = String(req.body.destination).trim();
    const startDate = String(req.body.startDate);
    const endDate = String(req.body.endDate);
    const interests = (req.body.interests || []).map((x) => String(x).toLowerCase());
    const travelStyle = String(req.body.travelStyle || "budget");
    const budget = Number(req.body.budget);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const baseQuery = {
      $or: [
        { state: new RegExp(destination, "i") },
        { cityTown: new RegExp(destination, "i") },
        { placeTown: new RegExp(destination, "i") }
      ]
    };
    if (interests.length > 0) baseQuery.type = { $in: interests };

    let places = await Place.find(baseQuery);
    if (places.length < totalDays * 2) {
      places = await Place.find({
        $or: [{ state: new RegExp(destination, "i") }, { cityTown: new RegExp(destination, "i") }]
      });
    }
    if (places.length === 0) {
      res.status(404);
      throw new Error(`No places found for destination: ${destination}`);
    }

    const { itinerary, optimizationMeta } = generateItinerary(places, totalDays, interests, startDate, budget);
    const budgetBreakdown = calculateBudget(budget, totalDays, travelStyle, itinerary);
    const recommendedHotels = await getRecommendedHotelsForTrip(destination, itinerary, budget, totalDays, travelStyle);

    let weatherNote = "";
    try {
      const weather = await getWeather(destination);
      weatherNote = weatherReplanHint(weather.forecast?.[0], itinerary[0]?.places || []);
    } catch (_) {
      weatherNote = "";
    }
    if (weatherNote && itinerary[0]) itinerary[0].weatherNote = weatherNote;

    const trip = await Trip.create({
      user: req.user.id,
      destination,
      state: destination,
      startDate,
      endDate,
      totalDays,
      budget,
      travelStyle,
      interests,
      itinerary,
      recommendedHotels,
      budgetBreakdown,
      optimizationMeta,
      status: "planned"
    });

    res.status(201).json(trip);
  } catch (e) {
    next(e);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/spend", protect, async (req, res, next) => {
  try {
    const err = validateExpenseInput(req.body);
    if (err) {
      res.status(400);
      throw new Error(err);
    }
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }
    trip.spendLog.push({
      date: String(req.body.date),
      category: normalizeExpenseCategory(req.body.category),
      amount: Number(req.body.amount),
      note: String(req.body.note || "")
    });
    trip.actualSpend = trip.spendLog.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    await trip.save();
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/replan", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    const mode = String(req.query.mode || "manual");
    if (mode === "manual") {
      const { day, orderedPlaceIds } = req.body;
      const dayIdx = Number(day) - 1;
      if (!Number.isInteger(dayIdx) || dayIdx < 0 || dayIdx >= trip.itinerary.length) {
        res.status(400);
        throw new Error("Invalid day");
      }
      const byId = new Map(trip.itinerary[dayIdx].places.map((p) => [String(p.placeId), p]));
      const reordered = [];
      orderedPlaceIds.forEach((id, idx) => {
        const p = byId.get(String(id));
        if (p) {
          p.sequence = idx + 1;
          reordered.push(p);
        }
      });
      if (reordered.length === trip.itinerary[dayIdx].places.length) {
        trip.itinerary[dayIdx].places = reordered;
      }
    } else if (mode === "weather") {
      const weather = await getWeather(trip.destination);
      const forecastByDate = new Map((weather.forecast || []).map((f) => [f.date, f]));
      trip.itinerary = trip.itinerary.map((day) => {
        const hint = weatherReplanHint(forecastByDate.get(day.date), day.places);
        return { ...day.toObject(), weatherNote: hint || day.weatherNote };
      });
    }

    await trip.save();
    res.json(trip);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/recommend-hotels", protect, async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    const hotels = await getRecommendedHotelsForTrip(
      trip.destination,
      trip.itinerary || [],
      Number(trip.budget),
      Number(trip.totalDays),
      trip.travelStyle
    );

    trip.recommendedHotels = hotels;
    await trip.save();
    res.json({ recommendedHotels: hotels });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const deleted = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) {
      res.status(404);
      throw new Error("Trip not found");
    }
    res.json({ message: "Trip deleted" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
