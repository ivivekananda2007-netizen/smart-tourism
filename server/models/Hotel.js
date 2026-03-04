const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    pricePerNight: { type: Number, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, default: 4.0 },
    amenities: [String],
    roomTypes: [
      {
        type: { type: String, required: true },
        basePrice: { type: Number, required: true },
        capacity: { type: Number, default: 2 },
        available: { type: Boolean, default: true }
      }
    ],
    description: { type: String, default: "" },
    category: { 
      type: String, 
      enum: ["budget", "mid-range", "luxury", "luxury-plus"],
      default: "mid-range",
      index: true
    },
    checkInTime: { type: String, default: "2:00 PM" },
    checkOutTime: { type: String, default: "11:00 AM" },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    image: { type: String, default: "" },
    reviews: [
      {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        author: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

hotelSchema.index({ city: 1, state: 1, pricePerNight: 1 });
hotelSchema.index({ "location.latitude": 1, "location.longitude": 1 });

module.exports = mongoose.model("Hotel", hotelSchema);
