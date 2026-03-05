const fs = require("fs");
const path = require("path");

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

function hashOffset(seed, min, max) {
  let h = 0;
  const text = String(seed || "");
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  const normalized = Math.abs(h % 100000) / 100000;
  return min + (max - min) * normalized;
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

function getDatasetHotels() {
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

      const extracted = extractHotelsFromAccommodation(accommodation);
      for (const h of extracted) {
        const key = `${state}|${city}|${h.name}`.toLowerCase();
        if (dedupe.has(key)) continue;

        const pricePerNight = Number(h.price || 2200);
        const category = inferCategoryFromTier(h.tier, pricePerNight);
        const lat = Number.isFinite(baseLat) ? baseLat + hashOffset(`${h.name}:lat`, -0.03, 0.03) : null;
        const lon = Number.isFinite(baseLon) ? baseLon + hashOffset(`${h.name}:lon`, -0.03, 0.03) : null;
        dedupe.set(key, {
          _id: `dataset-${Buffer.from(key).toString("base64").replace(/=+$/g, "").slice(0, 24)}`,
          hotelId: `dataset-${Buffer.from(key).toString("base64").replace(/=+$/g, "").slice(0, 24)}`,
          name: h.name,
          city,
          state,
          location: {
            latitude: Number.isFinite(lat) ? lat : 0,
            longitude: Number.isFinite(lon) ? lon : 0
          },
          pricePerNight,
          rating: ratingFromCategory(category),
          category,
          amenities: ["WiFi", "AC"],
          roomTypes: [{ type: "Standard", basePrice: pricePerNight, capacity: 2, available: true }],
          description: `Hotel in ${city}, ${state}`
        });
      }
    }
  }

  datasetHotelsCache = Array.from(dedupe.values());
  datasetHotelsCacheTs = now;
  return datasetHotelsCache;
}

module.exports = { getDatasetHotels };
