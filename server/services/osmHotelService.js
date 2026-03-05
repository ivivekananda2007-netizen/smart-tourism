const axios = require("axios");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const APP_USER_AGENT = "TripGenius/1.0 (hotel-discovery)";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function hashNumber(seed, min, max) {
  let h = 0;
  const text = String(seed || "");
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  const normalized = Math.abs(h % 100000) / 100000;
  return min + (max - min) * normalized;
}

function estimatePricePerNight(tags, seed) {
  const stars = toNumber(tags?.stars, 0);
  if (stars >= 5) return Math.round(hashNumber(seed, 7000, 12000));
  if (stars >= 4) return Math.round(hashNumber(seed, 4500, 8000));
  if (stars >= 3) return Math.round(hashNumber(seed, 2800, 5000));
  return Math.round(hashNumber(seed, 1400, 3500));
}

function estimateRating(tags, seed) {
  const stars = toNumber(tags?.stars, 0);
  if (stars >= 5) return 4.8;
  if (stars >= 4) return 4.5;
  if (stars >= 3) return 4.2;
  return Number(hashNumber(seed, 3.6, 4.4).toFixed(1));
}

function inferCategory(pricePerNight) {
  if (pricePerNight >= 8000) return "luxury-plus";
  if (pricePerNight >= 5000) return "luxury";
  if (pricePerNight >= 2200) return "mid-range";
  return "budget";
}

function makeAmenities(tags) {
  const out = [];
  if (String(tags?.internet_access || "").toLowerCase().includes("wlan") || tags?.wifi === "yes") out.push("WiFi");
  if (tags?.air_conditioning === "yes") out.push("AC");
  if (tags?.parking === "yes") out.push("Parking");
  if (tags?.swimming_pool === "yes") out.push("Pool");
  if (tags?.restaurant === "yes") out.push("Restaurant");
  if (out.length === 0) out.push("WiFi", "AC");
  return out.slice(0, 6);
}

function mapOverpassElements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.map((el, idx) => {
    const tags = el.tags || {};
    const lat = toNumber(el.lat ?? el.center?.lat);
    const lon = toNumber(el.lon ?? el.center?.lon);
    const seed = `${el.id || idx}-${tags.name || ""}`;
    const pricePerNight = estimatePricePerNight(tags, seed);
    const rating = estimateRating(tags, seed);
    const category = inferCategory(pricePerNight);
    const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "";
    const state = tags["addr:state"] || tags["addr:province"] || "";

    return {
      _id: `osm-${el.type || "n"}-${el.id || idx}`,
      hotelId: `osm-${el.type || "n"}-${el.id || idx}`,
      name: tags.name || `Hotel ${idx + 1}`,
      city,
      state,
      location: { latitude: lat, longitude: lon },
      pricePerNight,
      rating,
      category,
      amenities: makeAmenities(tags),
      roomTypes: [{ type: "Standard", basePrice: pricePerNight, capacity: 2, available: true }],
      description: tags.description || `Hotel near destination`,
      website: tags.website || "",
      phone: tags.phone || "",
      email: tags.email || ""
    };
  }).filter((h) => Number.isFinite(h.location.latitude) && Number.isFinite(h.location.longitude));
}

async function geocodePlace(query) {
  const q = String(query || "").trim();
  if (!q) return null;
  const res = await axios.get(NOMINATIM_URL, {
    params: { q, format: "jsonv2", limit: 1, countrycodes: "in" },
    timeout: 12000,
    headers: { "User-Agent": APP_USER_AGENT }
  });
  const row = Array.isArray(res.data) ? res.data[0] : null;
  if (!row) return null;
  return {
    latitude: Number(row.lat),
    longitude: Number(row.lon)
  };
}

async function fetchOverpassHotelsAround({ latitude, longitude, radiusMeters = 15000 }) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];

  const radius = Math.max(1000, Math.min(50000, Number(radiusMeters) || 15000));
  const query = `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})["tourism"~"hotel|guest_house|hostel|motel|resort"];
  way(around:${radius},${lat},${lon})["tourism"~"hotel|guest_house|hostel|motel|resort"];
  relation(around:${radius},${lat},${lon})["tourism"~"hotel|guest_house|hostel|motel|resort"];
);
out center tags;
`;

  const res = await axios.post(OVERPASS_URL, query, {
    timeout: 20000,
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": APP_USER_AGENT
    }
  });

  return mapOverpassElements(res.data?.elements || []);
}

async function fetchHotelsByDestination(destination, radiusMeters = 22000) {
  const geo = await geocodePlace(destination);
  if (!geo) return [];
  return fetchOverpassHotelsAround({
    latitude: geo.latitude,
    longitude: geo.longitude,
    radiusMeters
  });
}

module.exports = {
  fetchHotelsByDestination,
  fetchOverpassHotelsAround
};
