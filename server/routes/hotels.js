const express = require("express");
const fs = require("fs");
const path = require("path");
const Hotel = require("../models/Hotel");

const router = express.Router();

// Fallback hotel data (in case database is unavailable)
const FALLBACK_HOTELS = [
  {
    _id: "port-blair-1",
    name: "Andaman Heritage Hotel",
    city: "Port Blair",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.7401, longitude: 92.7460 },
    pricePerNight: 2500,
    rating: 4.3,
    category: "mid-range",
    amenities: ["WiFi", "AC", "Restaurant", "Beach Access"],
    roomTypes: [
      { type: "Deluxe", basePrice: 2500, capacity: 2, available: true },
      { type: "Standard", basePrice: 1800, capacity: 2, available: true }
    ],
    description: "Comfortable hotel near Port Blair beaches with local cuisine"
  },
  {
    _id: "port-blair-2",
    name: "Coral Island Resort",
    city: "Port Blair",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.7500, longitude: 92.7550 },
    pricePerNight: 4500,
    rating: 4.6,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Spa", "Beach Access", "Water Sports"],
    roomTypes: [
      { type: "Deluxe", basePrice: 4500, capacity: 2, available: true },
      { type: "Suite", basePrice: 7000, capacity: 4, available: true }
    ],
    description: "Luxury resort with water sports and island activities"
  },
  {
    _id: "port-blair-3",
    name: "Budget Lodging Port Blair",
    city: "Port Blair",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.7300, longitude: 92.7400 },
    pricePerNight: 1200,
    rating: 3.8,
    category: "budget",
    amenities: ["WiFi", "AC", "Common Kitchen"],
    roomTypes: [
      { type: "Dorm", basePrice: 600, capacity: 4, available: true },
      { type: "Private", basePrice: 1200, capacity: 2, available: true }
    ],
    description: "Budget-friendly accommodation in Port Blair"
  },
  {
    _id: "kochi-1",
    name: "Fort Kochi Heritage",
    city: "Kochi",
    state: "Kerala",
    location: { latitude: 9.9673, longitude: 76.2553 },
    pricePerNight: 3000,
    rating: 4.5,
    category: "mid-range",
    amenities: ["WiFi", "Restaurant", "Backwater View", "Heritage Tour"],
    roomTypes: [
      { type: "Deluxe", basePrice: 3000, capacity: 2, available: true }
    ],
    description: "Historic hotel in Fort Kochi with colonial charm"
  },
  {
    _id: "kochi-2",
    name: "Lagoon Escape",
    city: "Kochi",
    state: "Kerala",
    location: { latitude: 9.9700, longitude: 76.2600 },
    pricePerNight: 5000,
    rating: 4.7,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Spa", "Backwater Cruise", "Restaurant"],
    roomTypes: [
      { type: "Suite", basePrice: 5000, capacity: 2, available: true }
    ],
    description: "Luxury backwater resort with ayurvedic treatments"
  },
  {
    _id: "jaipur-1",
    name: "Pink City Palace",
    city: "Jaipur",
    state: "Rajasthan",
    location: { latitude: 26.9124, longitude: 75.7873 },
    pricePerNight: 3500,
    rating: 4.4,
    category: "mid-range",
    amenities: ["WiFi", "AC", "Restaurant", "Heritage Tour"],
    roomTypes: [
      { type: "Deluxe", basePrice: 3500, capacity: 2, available: true }
    ],
    description: "Hotel with pink city heritage theme"
  },
  {
    _id: "jaipur-2",
    name: "Regal Rajasthan",
    city: "Jaipur",
    state: "Rajasthan",
    location: { latitude: 26.9200, longitude: 75.7950 },
    pricePerNight: 6000,
    rating: 4.8,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Royal Theme"],
    roomTypes: [
      { type: "Suite", basePrice: 6000, capacity: 2, available: true }
    ],
    description: "Royal-themed luxury hotel in Jaipur"
  },
  {
    _id: "shimla-1",
    name: "Hill Station Retreat",
    city: "Shimla",
    state: "Himachal Pradesh",
    location: { latitude: 31.7775, longitude: 77.1577 },
    pricePerNight: 2800,
    rating: 4.2,
    category: "mid-range",
    amenities: ["WiFi", "Fireplace", "Mountain View", "Restaurant"],
    roomTypes: [
      { type: "Standard", basePrice: 2800, capacity: 2, available: true }
    ],
    description: "Cozy mountain retreat with panoramic views"
  },
  {
    _id: "shimla-2",
    name: "Alpine Luxury",
    city: "Shimla",
    state: "Himachal Pradesh",
    location: { latitude: 31.7850, longitude: 77.1650 },
    pricePerNight: 5500,
    rating: 4.6,
    category: "luxury",
    amenities: ["WiFi", "Spa", "Snow View", "Restaurant", "Adventure"],
    roomTypes: [
      { type: "Suite", basePrice: 5500, capacity: 2, available: true }
    ],
    description: "Alpine resort with snow views and adventure activities"
  },
  {
    _id: "andaman-1",
    name: "Neil Island Beachside",
    city: "Neil Island",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.8722, longitude: 92.9300 },
    pricePerNight: 2200,
    rating: 4.1,
    category: "mid-range",
    amenities: ["WiFi", "Beach Access", "Water Sports", "Restaurant"],
    roomTypes: [
      { type: "Standard", basePrice: 2200, capacity: 2, available: true }
    ],
    description: "Beachside hotel on Neil Island with water sports facilities"
  },
  {
    _id: "andaman-2",
    name: "Island Paradise Resort",
    city: "Neil Island",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.8690, longitude: 92.9250 },
    pricePerNight: 4200,
    rating: 4.5,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Beach Access", "Diving Center", "Spa"],
    roomTypes: [
      { type: "Deluxe", basePrice: 4200, capacity: 2, available: true }
    ],
    description: "Luxury island resort with diving and water sports"
  },
  {
    _id: "andaman-3",
    name: "Budget Beach Huts",
    city: "Neil Island",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.8760, longitude: 92.9350 },
    pricePerNight: 1500,
    rating: 3.9,
    category: "budget",
    amenities: ["WiFi", "Beach Access", "Common Kitchen"],
    roomTypes: [
      { type: "Private Hut", basePrice: 1500, capacity: 2, available: true }
    ],
    description: "Budget beach huts near Laxmanpur Beach"
  },
  {
    _id: "andaman-4",
    name: "Havelock Island Retreat",
    city: "Havelock Island",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 12.0250, longitude: 92.9850 },
    pricePerNight: 3800,
    rating: 4.4,
    category: "mid-range",
    amenities: ["WiFi", "Beach Access", "Snorkeling", "Restaurant"],
    roomTypes: [
      { type: "Standard", basePrice: 3800, capacity: 2, available: true }
    ],
    description: "Beachfront hotel on famous Havelock Island"
  },
  {
    _id: "andaman-5",
    name: "Radhanagar Luxury",
    city: "Havelock Island",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 12.0320, longitude: 92.9920 },
    pricePerNight: 6000,
    rating: 4.7,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Spa", "Beach Access", "Fine Dining"],
    roomTypes: [
      { type: "Suite", basePrice: 6000, capacity: 2, available: true }
    ],
    description: "Ultra-luxury resort near Radhanagar Beach"
  }
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sortHotels(hotels, sortBy) {
  switch (sortBy) {
    case "price":
    case "price_asc":
      return hotels.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case "price_desc":
      return hotels.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case "rating":
      return hotels.sort((a, b) => b.rating - a.rating);
    case "distance":
    default:
      return hotels.sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER));
  }
}

function valueFromKeys(obj, keys) {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") return val;
  }
  return "";
}

function parsePriceToNumber(value, fallback = 2000) {
  const nums = String(value || "")
    .match(/\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return fallback;
  const parts = nums.map(Number).filter(Number.isFinite);
  if (parts.length === 0) return fallback;
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
        // ignore malformed object chunks
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

function hashOffset(seed, min, max) {
  let h = 0;
  const text = String(seed || "");
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  const normalized = Math.abs(h % 100000) / 100000;
  return min + (max - min) * normalized;
}

let datasetHotelsCache = null;
let datasetHotelsCacheTs = 0;

function loadDatasetHotels() {
  const now = Date.now();
  if (datasetHotelsCache && now - datasetHotelsCacheTs < 10 * 60 * 1000) {
    return datasetHotelsCache;
  }

  const datasetDir = path.resolve(__dirname, "../../datasets");
  let files = [];
  try {
    files = fs.readdirSync(datasetDir).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch (error) {
    console.warn("Dataset folder not readable for hotels extraction:", error.message);
    datasetHotelsCache = [];
    datasetHotelsCacheTs = now;
    return datasetHotelsCache;
  }

  const dedupe = new Map();

  for (const file of files) {
    let records = [];
    try {
      const raw = fs.readFileSync(path.join(datasetDir, file), "utf8");
      records = parseRecordsFromFile(raw);
    } catch (_) {
      continue;
    }

    for (const rec of records) {
      const state = String(valueFromKeys(rec, ["state", "State"])).trim();
      const city = String(valueFromKeys(rec, ["city", "city_town", "cityTown", "CityTown", "town"])).trim();
      const baseLat = Number(valueFromKeys(rec, ["latitude", "Latitude"]));
      const baseLon = Number(valueFromKeys(rec, ["longitude", "Longitude"]));
      const accommodation = rec?.accommodation;
      if (!state || !city || !accommodation || typeof accommodation !== "object") continue;
      if (!Number.isFinite(baseLat) || !Number.isFinite(baseLon)) continue;

      const extractedHotels = extractHotelsFromAccommodation(accommodation);
      for (const h of extractedHotels) {
        const hotelName = h.name;
        const price = h.price;
        const tier = h.tier;
        const category = inferCategoryFromTier(tier, price);
        const key = `${state}|${city}|${hotelName}`.toLowerCase();

        const existing = dedupe.get(key);
        if (existing) {
          existing.pricePerNight = Math.round((existing.pricePerNight + price) / 2);
          continue;
        }

        const lat = baseLat + hashOffset(`${hotelName}:lat`, -0.03, 0.03);
        const lon = baseLon + hashOffset(`${hotelName}:lon`, -0.03, 0.03);

        dedupe.set(key, {
          _id: `dataset-${Buffer.from(key).toString("base64").replace(/=+$/g, "").slice(0, 24)}`,
          name: hotelName,
          city,
          state,
          location: { latitude: lat, longitude: lon },
          pricePerNight: price,
          rating: ratingFromCategory(category),
          category,
          amenities: ["WiFi", "AC"],
          roomTypes: [{ type: "Standard", basePrice: price, capacity: 2, available: true }],
          description: `Hotel in ${city}, ${state}`
        });
      }
    }
  }

  datasetHotelsCache = Array.from(dedupe.values());
  datasetHotelsCacheTs = now;
  return datasetHotelsCache;
}

async function getHotelsData() {
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
    } catch (error) {
      console.warn("Using fallback hotel dataset due to DB read error:", error.message);
    }
  }

  const merged = new Map();
  [...datasetHotels, ...FALLBACK_HOTELS].forEach((h) => {
    const key = `${h.name}|${h.city}|${h.state}`.toLowerCase();
    merged.set(key, h);
  });
  return Array.from(merged.values());
}

// Get hotels near a specific location (hidden gem)
router.get("/near-gem", async (req, res, next) => {
  const { latitude, longitude, maxDistance = 15, maxPrice, minRating = 3, category, sortBy = "distance" } = req.query;
  try {

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const maxDist = parseFloat(maxDistance);
    const maxBudget = maxPrice ? parseFloat(maxPrice) : 10000;
    const minRatingValue = parseFloat(minRating);
    const allHotels = await getHotelsData();

    // Pass 1: strict filter (distance + budget + rating + category)
    let hotelsNearby = allHotels
      .map((hotel) => ({
        ...hotel,
        distance: calculateDistance(lat, lon, hotel.location.latitude, hotel.location.longitude)
      }))
      .filter((hotel) => {
        const withinDistance = hotel.distance <= maxDist;
        const withinBudget = hotel.pricePerNight <= maxBudget;
        const withinRating = hotel.rating >= minRatingValue;
        const withinCategory = !category || hotel.category === category.toLowerCase();
        return withinDistance && withinBudget && withinRating && withinCategory;
      });

    // Pass 2: relax budget if strict filter returns empty.
    if (hotelsNearby.length === 0) {
      hotelsNearby = allHotels
        .map((hotel) => ({
          ...hotel,
          distance: calculateDistance(lat, lon, hotel.location.latitude, hotel.location.longitude)
        }))
        .filter((hotel) => {
          const withinDistance = hotel.distance <= maxDist;
          const withinRating = hotel.rating >= minRatingValue;
          const withinCategory = !category || hotel.category === category.toLowerCase();
          return withinDistance && withinRating && withinCategory;
        });
    }

    // Pass 3: widen radius so nearby city hotels are included for sparse areas.
    if (hotelsNearby.length === 0) {
      const expandedDistance = Math.max(maxDist * 6, 120);
      hotelsNearby = allHotels
        .map((hotel) => ({
          ...hotel,
          distance: calculateDistance(lat, lon, hotel.location.latitude, hotel.location.longitude)
        }))
        .filter((hotel) => {
          const withinDistance = hotel.distance <= expandedDistance;
          const withinCategory = !category || hotel.category === category.toLowerCase();
          return withinDistance && withinCategory;
        });
    }

    // Final fallback: return nearest hotels overall to avoid empty UI responses.
    if (hotelsNearby.length === 0) {
      hotelsNearby = allHotels.map((hotel) => ({
        ...hotel,
        distance: calculateDistance(lat, lon, hotel.location.latitude, hotel.location.longitude)
      }));
    }

    sortHotels(hotelsNearby, sortBy);
    hotelsNearby = hotelsNearby.slice(0, 20);

    console.log(`✅ Found ${hotelsNearby.length} hotels within ${maxDist}km and ₹${maxBudget} budget`);
    console.log(`   Details: ${hotelsNearby.map(h => `${h.name}(${h.distance.toFixed(1)}km)`).join(", ") || "No hotels found"}`);
    res.json(hotelsNearby);
  } catch (error) {
    console.error("❌ Error fetching nearby hotels:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch hotels",
      message: error.message,
      params: { latitude, longitude, maxDistance, maxPrice }
    });
  }
});

// Get hotels in a city with budget filter
router.get("/by-city", async (req, res, next) => {
  try {
    const { city, state, maxPrice, minRating = 3, category, sortBy = "rating" } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City required" });
    }

    const maxBudget = maxPrice ? parseFloat(maxPrice) : 10000;
    const minRatingValue = parseFloat(minRating);
    const cityRegex = new RegExp(city, "i");
    const stateRegex = state ? new RegExp(state, "i") : null;
    const allHotels = await getHotelsData();

    // Filter using hotel dataset
    const hotels = allHotels.filter(h => {
      const matchCity = cityRegex.test(h.city);
      const matchState = !stateRegex || stateRegex.test(h.state);
      const matchPrice = h.pricePerNight <= maxBudget;
      const matchRating = h.rating >= minRatingValue;
      const matchCategory = !category || h.category === category.toLowerCase();
      return matchCity && matchState && matchPrice && matchRating && matchCategory;
    });

    sortHotels(hotels, sortBy);

    console.log(`✅ Found ${hotels.length} hotels in ${city} within budget`);
    res.json(hotels);
  } catch (error) {
    console.error("❌ Error fetching hotels by city:", error.message);
    res.status(500).json({ error: "Failed to fetch hotels", message: error.message });
  }
});

// Get all hotels with filters
router.get("/", async (req, res, next) => {
  try {
    const { city, state, maxPrice, minRating = 3, category, search, sortBy = "rating" } = req.query;
    const allHotels = await getHotelsData();

    // Filter using hotel dataset
    let hotels = allHotels.filter(h => {
      const matchRating = h.rating >= parseFloat(minRating);
      const matchPrice = !maxPrice || h.pricePerNight <= parseFloat(maxPrice);
      const matchCity = !city || new RegExp(city, "i").test(h.city);
      const matchState = !state || new RegExp(state, "i").test(h.state);
      const matchCategory = !category || h.category === category.toLowerCase();
      const matchSearch = !search || 
        new RegExp(search, "i").test(h.name) ||
        new RegExp(search, "i").test(h.city) ||
        new RegExp(search, "i").test(h.state);

      return matchRating && matchPrice && matchCity && matchState && matchCategory && matchSearch;
    });

    sortHotels(hotels, sortBy);

    console.log(`✅ Found ${hotels.length} hotels matching criteria`);
    res.json(hotels);
  } catch (error) {
    console.error("❌ Error fetching hotels:", error.message);
    res.status(500).json({ error: "Failed to fetch hotels", message: error.message });
  }
});

// Get hotel by ID
router.get("/:id", async (req, res, next) => {
  try {
    const hotel = FALLBACK_HOTELS.find(h => h._id === req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json(hotel);
  } catch (error) {
    console.error("❌ Error fetching hotel:", error.message);
    res.status(500).json({ error: "Failed to fetch hotel", message: error.message });
  }
});

module.exports = router;
