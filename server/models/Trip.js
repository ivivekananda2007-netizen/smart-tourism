const mongoose = require("mongoose");

const itineraryPlaceSchema = new mongoose.Schema(
  {
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
    placeName: String,
    cityTown: String,
    type: String,
    visitDuration: Number,
    suggestedTime: String,
    budgetINR: Number,
    latitude: Number,
    longitude: Number,
    hiddenGem: Boolean,
    description: String,
    sequence: Number,
    isIndoor: { type: Boolean, default: false },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day: Number,
    date: String,
    places: [itineraryPlaceSchema],
    travelDistance: Number,
    travelTimeMinutes: Number,
    dayBudget: Number,
    weatherNote: { type: String, default: "" }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    destination: { type: String, required: true },
    state: String,
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, required: true },
    budget: { type: Number, required: true },
    travelStyle: { type: String, enum: ["luxury", "budget", "solo", "family"], default: "budget" },
    interests: [String],
    itinerary: [dayPlanSchema],
    recommendedHotels: [
      {
        hotelId: String,
        name: String,
        city: String,
        state: String,
        pricePerNight: Number,
        rating: Number,
        category: String,
        amenities: [String],
        website: String,
        phone: String,
        email: String
      }
    ],
    budgetBreakdown: {
      accommodation: Number,
      food: Number,
      transport: Number,
      activities: Number,
      buffer: Number,
      total: Number
    },
    optimizationMeta: {
      totalDistanceKm: { type: Number, default: 0 },
      totalTravelMinutes: { type: Number, default: 0 },
      optimizationVersion: { type: String, default: "v1.0.0" }
    },
    actualSpend: { type: Number, default: 0 },
    spendLog: [
      {
        date: String,
        category: String,
        amount: Number,
        note: String
      }
    ],
    status: { type: String, enum: ["planned", "ongoing", "completed"], default: "planned" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
