const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, index: true },
    placeTown: { type: String, required: true },
    cityTown: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    hiddenGem: { type: Boolean, default: false, index: true },
    visitDuration: { type: Number, required: true },
    budgetINR: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    description: { type: String, default: "" },
    crowdLevel: { type: String, enum: ["low", "medium", "high"], default: "medium", index: true },
    rating: { type: Number, min: 1, max: 5, default: 4.2 },
    bestSeason: [String],
    seasonTags: [String],
    localPopularityScore: { type: Number, default: 0.5 },
    socialHypeScore: { type: Number, default: 0.4 },
    authenticityScore: { type: Number, default: 0.6 }
  },
  { timestamps: true }
);

placeSchema.index({ state: 1, cityTown: 1, placeTown: 1 }, { unique: true });

module.exports = mongoose.model("Place", placeSchema);
