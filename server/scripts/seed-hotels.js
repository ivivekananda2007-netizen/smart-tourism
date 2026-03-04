require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const connectDB = require("../config/db");

// Sample hotel data covering major Indian cities
const hotelsData = [
  // Andaman & Nicobar
  {
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
    name: "Budget Lodging Port Blair",
    city: "Port Blair",
    state: "Andaman and Nicobar Islands",
    location: { latitude: 11.7300, longitude: 92.7400 },
    pricePerNight: 1200,
    rating: 3.8,
    category: "budget",
    amenities: ["WiFi", "AC", "Shared Kitchen"],
    roomTypes: [
      { type: "Basic", basePrice: 1200, capacity: 2, available: true },
      { type: "Shared Dorm", basePrice: 600, capacity: 4, available: true }
    ],
    description: "Affordable accommodation for budget travelers"
  },

  // Kerala
  {
    name: "Backwater Breeze Kochi",
    city: "Kochi",
    state: "Kerala",
    location: { latitude: 9.9312, longitude: 76.2673 },
    pricePerNight: 3000,
    rating: 4.5,
    category: "mid-range",
    amenities: ["WiFi", "Restaurant", "Backwater View", "Ayurveda Massage"],
    roomTypes: [
      { type: "Deluxe", basePrice: 3000, capacity: 2, available: true },
      { type: "Standard", basePrice: 2200, capacity: 2, available: true }
    ],
    description: "Beautiful backwater views with traditional Kerala hospitality"
  },
  {
    name: "Taj Malabar Resort & Spa",
    city: "Kochi",
    state: "Kerala",
    location: { latitude: 9.9400, longitude: 76.2700 },
    pricePerNight: 8000,
    rating: 4.8,
    category: "luxury-plus",
    amenities: ["WiFi", "Pool", "Spa", "Multi-cuisine Restaurant", "Beach Access"],
    roomTypes: [
      { type: "Royal Suite", basePrice: 8000, capacity: 2, available: true },
      { type: "Palatial Suite", basePrice: 12000, capacity: 4, available: true }
    ],
    description: "5-star luxury resort on the backwaters"
  },
  {
    name: "Alleppey Homestay",
    city: "Alleppey",
    state: "Kerala",
    location: { latitude: 9.4867, longitude: 76.3289 },
    pricePerNight: 1800,
    rating: 4.4,
    category: "budget",
    amenities: ["WiFi", "Home-cooked Meals", "Backwater Tour", "Houseboat Access"],
    roomTypes: [
      { type: "Room", basePrice: 1800, capacity: 2, available: true }
    ],
    description: "Authentic Kerala homestay experience"
  },

  // Rajasthan
  {
    name: "Palace Heritage Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    location: { latitude: 26.9124, longitude: 75.7873 },
    pricePerNight: 3500,
    rating: 4.6,
    category: "mid-range",
    amenities: ["WiFi", "Restaurant", "Rooftop", "City Tour Desk"],
    roomTypes: [
      { type: "Deluxe", basePrice: 3500, capacity: 2, available: true },
      { type: "Standard", basePrice: 2500, capacity: 2, available: true }
    ],
    description: "Heritage hotel in the heart of Pink City"
  },
  {
    name: "Oberoi Rajvilas",
    city: "Jaipur",
    state: "Rajasthan",
    location: { latitude: 26.8900, longitude: 75.8200 },
    pricePerNight: 10000,
    rating: 4.9,
    category: "luxury-plus",
    amenities: ["WiFi", "Pool", "Spa", "Fine Dining", "Palace Rooms"],
    roomTypes: [
      { type: "Suite", basePrice: 10000, capacity: 2, available: true },
      { type: "Palace Room", basePrice: 15000, capacity: 2, available: true }
    ],
    description: "Ultra-luxury palace resort with royal experience"
  },
  {
    name: "Student Hostel Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    location: { latitude: 26.9200, longitude: 75.7800 },
    pricePerNight: 800,
    rating: 3.7,
    category: "budget",
    amenities: ["WiFi", "Common Kitchen", "Backpacker Info"],
    roomTypes: [
      { type: "Dorm Bed", basePrice: 800, capacity: 6, available: true },
      { type: "Private Room", basePrice: 2000, capacity: 2, available: true }
    ],
    description: "Popular hostel for budget travelers and backpackers"
  },

  // Goa
  {
    name: "Beachfront Resort Goa",
    city: "Panaji",
    state: "Goa",
    location: { latitude: 15.2993, longitude: 73.8243 },
    pricePerNight: 4000,
    rating: 4.5,
    category: "mid-range",
    amenities: ["WiFi", "Beach Access", "Restaurant", "Water Sports"],
    roomTypes: [
      { type: "Deluxe", basePrice: 4000, capacity: 2, available: true },
      { type: "Garden Room", basePrice: 3000, capacity: 2, available: true }
    ],
    description: "Beachfront resort with water sports and vibrant nightlife"
  },
  {
    name: "Taj Exotica Resort & Spa",
    city: "Goa",
    state: "Goa",
    location: { latitude: 15.3000, longitude: 73.8000 },
    pricePerNight: 9000,
    rating: 4.7,
    category: "luxury",
    amenities: ["WiFi", "Private Beach", "Spa", "Multi-cuisine", "Nightclub"],
    roomTypes: [
      { type: "Deluxe", basePrice: 9000, capacity: 2, available: true },
      { type: "Suite", basePrice: 13000, capacity: 4, available: true }
    ],
    description: "Premium beach resort with comprehensive facilities"
  },
  {
    name: "Goa Budget Beds",
    city: "Panaji",
    state: "Goa",
    location: { latitude: 15.3100, longitude: 73.8300 },
    pricePerNight: 1000,
    rating: 3.6,
    category: "budget",
    amenities: ["WiFi", "Common Area", "Kitchen Access"],
    roomTypes: [
      { type: "Dorm", basePrice: 1000, capacity: 8, available: true },
      { type: "Private", basePrice: 2200, capacity: 2, available: true }
    ],
    description: "Backpacker-friendly budget accommodation"
  },

  // Himachal Pradesh
  {
    name: "Mountain View Hotel Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    location: { latitude: 31.7724, longitude: 77.1737 },
    pricePerNight: 2800,
    rating: 4.4,
    category: "mid-range",
    amenities: ["WiFi", "Fireplace", "Mountain View", "Restaurant"],
    roomTypes: [
      { type: "Deluxe", basePrice: 2800, capacity: 2, available: true },
      { type: "Standard", basePrice: 2000, capacity: 2, available: true }
    ],
    description: "Comfortable mountain retreat with stunning views"
  },
  {
    name: "Wildflower Hall",
    city: "Shimla",
    state: "Himachal Pradesh",
    location: { latitude: 31.7600, longitude: 77.1800 },
    pricePerNight: 7500,
    rating: 4.6,
    category: "luxury",
    amenities: ["WiFi", "Pool", "Spa", "Fine Dining", "Forest Walks"],
    roomTypes: [
      { type: "Deluxe", basePrice: 7500, capacity: 2, available: true },
      { type: "Suite", basePrice: 11000, capacity: 2, available: true }
    ],
    description: "Luxury hill station resort amidst forests"
  },
  {
    name: "Backpacker Haven Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    location: { latitude: 31.7800, longitude: 77.1600 },
    pricePerNight: 1000,
    rating: 3.9,
    category: "budget",
    amenities: ["WiFi", "Common Kitchen", "Tour Desk"],
    roomTypes: [
      { type: "Dorm Bed", basePrice: 1000, capacity: 6, available: true },
      { type: "Private", basePrice: 2500, capacity: 2, available: true }
    ],
    description: "Budget-friendly accommodation for travelers"
  },

  // Uttarakhand
  {
    name: "Valley Resort Rishikesh",
    city: "Rishikesh",
    state: "Uttarakhand",
    location: { latitude: 30.0889, longitude: 78.2707 },
    pricePerNight: 3200,
    rating: 4.4,
    category: "mid-range",
    amenities: ["WiFi", "Yoga Classes", "Restaurant", "River View"],
    roomTypes: [
      { type: "Deluxe", basePrice: 3200, capacity: 2, available: true },
      { type: "Standard", basePrice: 2300, capacity: 2, available: true }
    ],
    description: "Yoga and wellness resort on the Ganges"
  },
  {
    name: "Ananda in the Himalayas",
    city: "Rishikesh",
    state: "Uttarakhand",
    location: { latitude: 30.1000, longitude: 78.2800 },
    pricePerNight: 12000,
    rating: 4.9,
    category: "luxury-plus",
    amenities: ["WiFi", "Spa", "Yoga", "Multi-cuisine", "Ayurveda"],
    roomTypes: [
      { type: "Spa Villa", basePrice: 12000, capacity: 2, available: true },
      { type: "Palace Room", basePrice: 18000, capacity: 2, available: true }
    ],
    description: "Premier wellness and spiritual retreat"
  }
];

async function seedHotels() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("🧹 Clearing existing hotels...");
    await Hotel.deleteMany({});

    console.log("📝 Seeding hotel data...");
    const result = await Hotel.insertMany(hotelsData);
    console.log(`✅ Successfully seeded ${result.length} hotels`);

    // Display summary
    const byCity = {};
    result.forEach((hotel) => {
      if (!byCity[hotel.city]) byCity[hotel.city] = 0;
      byCity[hotel.city]++;
    });

    console.log("\n📊 Hotels by City:");
    Object.entries(byCity).forEach(([city, count]) => {
      console.log(`   ${city}: ${count} hotels`);
    });

    console.log("\n✅ Hotel seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding hotels:", error.message);
    process.exit(1);
  }
}

seedHotels();
