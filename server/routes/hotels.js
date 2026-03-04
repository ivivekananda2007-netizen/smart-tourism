const express = require("express");
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

async function getHotelsData() {
  if (Hotel?.db?.readyState === 1) {
    try {
      const hotels = await Hotel.find({}).lean();
      if (Array.isArray(hotels) && hotels.length > 0) {
        return hotels;
      }
    } catch (error) {
      console.warn("Using fallback hotel dataset due to DB read error:", error.message);
    }
  }
  return FALLBACK_HOTELS;
}

// Get hotels near a specific location (hidden gem)
router.get("/near-gem", async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 15, maxPrice, minRating = 3, category, sortBy = "distance" } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const maxDist = parseFloat(maxDistance);
    const maxBudget = maxPrice ? parseFloat(maxPrice) : 10000;
    const minRatingValue = parseFloat(minRating);
    const allHotels = await getHotelsData();

    // Calculate distance and filter using hotel dataset
    const hotelsNearby = allHotels
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
      })
      ;

    sortHotels(hotelsNearby, sortBy);

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
