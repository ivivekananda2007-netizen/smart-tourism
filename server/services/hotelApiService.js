const axios = require("axios");

function getRapidApiConfig() {
  const key = String(process.env.HOTELS_API_KEY || "").trim();
  const host = String(process.env.HOTELS_API_HOST || "booking-com15.p.rapidapi.com").trim();
  return { key, host };
}

function hasHotelApiConfig() {
  const { key, host } = getRapidApiConfig();
  return Boolean(key && host);
}

function getDefaultDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function normalizeCategory(pricePerNight) {
  const price = Number(pricePerNight || 0);
  if (price >= 8000) return "luxury-plus";
  if (price >= 5000) return "luxury";
  if (price >= 2200) return "mid-range";
  return "budget";
}

function parseHotelsFromSearchResponse(payload) {
  const rows = payload?.data?.hotels || payload?.data?.result || payload?.result || payload?.hotels || [];
  if (!Array.isArray(rows)) return [];

  return rows.map((h, idx) => {
    const name =
      h?.hotel_name ||
      h?.name ||
      h?.property?.name ||
      h?.accessibilityLabel ||
      `Hotel ${idx + 1}`;
    const city = h?.city || h?.cityName || h?.address?.city || h?.district || "";
    const state = h?.state || h?.address?.state || h?.country_trans || h?.country || "";
    const priceRaw =
      h?.min_total_price ||
      h?.priceBreakdown?.grossPrice?.value ||
      h?.composite_price_breakdown?.all_inclusive_amount?.value ||
      h?.price ||
      0;
    const pricePerNight = Math.max(1000, Math.round(Number(priceRaw || 0)));
    const ratingRaw = h?.review_score || h?.reviewScore || h?.rating || h?.property?.reviewScore || 4.1;
    const rating = Math.min(5, Math.max(2.5, Number(ratingRaw || 4.1)));
    const amenities = Array.isArray(h?.facility) ? h.facility.slice(0, 6) : ["WiFi", "AC"];
    const category = normalizeCategory(pricePerNight);
    return {
      hotelId: String(h?.hotel_id || h?.id || `${name}-${idx}`),
      name: String(name),
      city: String(city),
      state: String(state),
      pricePerNight,
      rating: Number(rating.toFixed(1)),
      category,
      amenities,
      website: String(h?.url || ""),
      phone: "",
      email: ""
    };
  });
}

async function fetchRecommendedHotelsFromApi({
  destination,
  budget,
  totalDays,
  startDate,
  endDate
}) {
  if (!hasHotelApiConfig()) return [];
  const { key, host } = getRapidApiConfig();
  const client = axios.create({
    baseURL: `https://${host}`,
    timeout: 15000,
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host
    }
  });

  const destinationRes = await client.get("/api/v1/hotels/searchDestination", {
    params: { query: destination }
  });
  const destinations = destinationRes?.data?.data || destinationRes?.data?.result || [];
  if (!Array.isArray(destinations) || destinations.length === 0) return [];

  const pick = destinations[0];
  const destId = pick?.dest_id || pick?.id || pick?.destId;
  const searchType = pick?.search_type || pick?.searchType || "CITY";
  if (!destId) return [];

  const perNightCap = Math.max(1000, Math.floor(Number(budget || 0) / Math.max(1, Number(totalDays || 1))));
  const arrival = String(startDate || "").trim() || getDefaultDate(14);
  const departure = String(endDate || "").trim() || getDefaultDate(17);

  const hotelsRes = await client.get("/api/v1/hotels/searchHotels", {
    params: {
      dest_id: destId,
      search_type: searchType,
      arrival_date: arrival,
      departure_date: departure,
      adults: 2,
      room_qty: 1,
      page_number: 1,
      units: "metric",
      temperature_unit: "c",
      languagecode: "en-us",
      currency_code: "INR"
    }
  });

  const hotels = parseHotelsFromSearchResponse(hotelsRes?.data)
    .filter((h) => Number(h.pricePerNight || 0) <= perNightCap * 2)
    .sort((a, b) => (b.rating - a.rating) || (a.pricePerNight - b.pricePerNight))
    .slice(0, 8);

  return hotels;
}

module.exports = {
  hasHotelApiConfig,
  fetchRecommendedHotelsFromApi
};
