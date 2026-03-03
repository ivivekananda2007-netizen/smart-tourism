const express = require("express");
const Trip = require("../models/Trip");
const Place = require("../models/Place");
const { protect } = require("../middleware/auth");
const { generateItinerary } = require("../services/itineraryService");
const { calculateBudget, normalizeExpenseCategory } = require("../services/budgetService");
const { getWeather, weatherReplanHint } = require("../services/weatherService");
const { validateTripGenerationInput, validateExpenseInput } = require("../utils/validators");

const router = express.Router();

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

    const { itinerary, optimizationMeta } = generateItinerary(places, totalDays, interests, startDate);
    const budgetBreakdown = calculateBudget(budget, totalDays, travelStyle, itinerary);

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
