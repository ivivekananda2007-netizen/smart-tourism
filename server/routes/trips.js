const express = require("express");
const Trip = require("../models/Trip");
const Place = require("../models/Place");
const Hotel = require("../models/Hotel");
const { protect } = require("../middleware/auth");
const { generateItinerary } = require("../services/itineraryService");
const { calculateBudget, normalizeExpenseCategory } = require("../services/budgetService");
const { getWeather, weatherReplanHint } = require("../services/weatherService");
const { hasHotelApiConfig, fetchRecommendedHotelsFromApi } = require("../services/hotelApiService");
const { fetchHotelsByDestination } = require("../services/osmHotelService");
const { getDatasetHotels } = require("../services/localHotelsService");
const { validateTripGenerationInput, validateExpenseInput } = require("../utils/validators");

const router = express.Router();

const REGION_ALIASES = {
  maharashtra: ["maharashtra", "maharastra", "maharashatra", "mh"],
  karnataka: ["karnataka"],
  kerala: ["kerala"],
  goa: ["goa"],
  rajasthan: ["rajasthan"],
  gujarat: ["gujarat"],
  "uttarpradesh": ["uttarpradesh", "up"],
  "madhyapradesh": ["madhyapradesh", "mp"],
  "himachalpradesh": ["himachalpradesh", "hp"],
  "andamanandnicobarislands": ["andamanandnicobarislands", "andamannicobar", "andaman"]
};

function normalizeText(v) {
  return String(v || "").toLowerCase().replace(/[^a-z]/g, "");
}

function canonicalRegion(v) {
  const normalized = normalizeText(v);
  if (!normalized) return "";
  const key = Object.keys(REGION_ALIASES).find((region) => REGION_ALIASES[region].includes(normalized));
  return key || normalized;
}

function filterHotelsByDestination(hotels, destination, itinerary) {
  if (!Array.isArray(hotels)) return [];
  const destinationCanonical = canonicalRegion(destination);
  const destinationNormalized = normalizeText(destination);
  const planCities = new Set();
  (itinerary || []).forEach((d) => {
    (d.places || []).forEach((p) => {
      const city = canonicalRegion(p.cityTown);
      if (city) planCities.add(city);
    });
  });

  const strict = hotels.filter((h) => {
    const hotelCity = canonicalRegion(h.city);
    const hotelState = canonicalRegion(h.state);
    if (!hotelCity && !hotelState) return false;
    if (hotelState && hotelState === destinationCanonical) return true;
    if (hotelCity && hotelCity === destinationCanonical) return true;
    if (planCities.has(hotelCity)) return true;
    if (destinationNormalized && (hotelState.includes(destinationNormalized) || hotelCity.includes(destinationNormalized))) return true;
    return false;
  });

  return strict;
}

async function getHotelsDataForTrips() {
  const datasetHotels = getDatasetHotels();
  if (Hotel?.db?.readyState !== 1) return datasetHotels;
  try {
    const hotels = await Hotel.find({}).lean();
    if (!Array.isArray(hotels) || hotels.length === 0) return datasetHotels;
    const merged = new Map();
    [...datasetHotels, ...hotels].forEach((h) => {
      const key = `${h.name}|${h.city}|${h.state}`.toLowerCase();
      merged.set(key, h);
    });
    return Array.from(merged.values());
  } catch (_) {
    return datasetHotels;
  }
}

async function getRecommendedHotelsForTrip(destination, itinerary, budget, totalDays, travelStyle, startDate, endDate) {
  const useDynamicHotels = String(process.env.HOTELS_SOURCE || "local").toLowerCase() === "dynamic";
  if (useDynamicHotels) {
    try {
      const dynamicHotels = await fetchHotelsByDestination(destination, 28000);
      if (Array.isArray(dynamicHotels) && dynamicHotels.length > 0) {
        const perNightBudget = Math.max(1200, Math.floor(Number(budget || 0) / Math.max(1, Number(totalDays || 1))));
        const normalized = filterHotelsByDestination(dynamicHotels, destination, itinerary)
          .filter((h) => Number(h.pricePerNight || 0) <= perNightBudget * 1.8)
          .sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)) || (Number(a.pricePerNight || 0) - Number(b.pricePerNight || 0)))
          .slice(0, 12)
          .map((h) => ({
            hotelId: String(h.hotelId || h._id || ""),
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
        if (normalized.length > 0) return normalized;
      }
    } catch (_) {
      // fallback below
    }

    if (hasHotelApiConfig()) {
      try {
        const hotelsFromApi = await fetchRecommendedHotelsFromApi({
          destination,
          budget,
          totalDays,
          startDate,
          endDate
        });
        const matchingApiHotels = filterHotelsByDestination(hotelsFromApi, destination, itinerary);
        if (Array.isArray(matchingApiHotels) && matchingApiHotels.length > 0) {
          return matchingApiHotels;
        }
      } catch (_) {
        // fallback handled below
      }
    }
  }

  const allHotels = await getHotelsDataForTrips();
  if (!Array.isArray(allHotels) || allHotels.length === 0) return [];

  const styleFactor = travelStyle === "luxury" ? 1.2 : travelStyle === "family" ? 1.0 : 0.9;
  const perNightBudget = Math.max(500, Math.floor((Number(budget) / Math.max(1, Number(totalDays))) * styleFactor));
  let matching = filterHotelsByDestination(allHotels, destination, itinerary).filter((h) => Number(h.pricePerNight || 0) <= perNightBudget);

  // Final fallback: show affordable hotels only (still within budget cap).
  if (matching.length === 0) {
    matching = filterHotelsByDestination(allHotels, destination, itinerary).filter((h) => Number(h.pricePerNight || 0) <= perNightBudget * 1.5);
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
    const recommendedHotels = await getRecommendedHotelsForTrip(destination, itinerary, budget, totalDays, travelStyle, startDate, endDate);

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
      trip.travelStyle,
      trip.startDate,
      trip.endDate
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
