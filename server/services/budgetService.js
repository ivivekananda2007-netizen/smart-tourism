const STYLE_SPLITS = {
  luxury: { accommodation: 0.4, food: 0.25, transport: 0.2, activities: 0.1, buffer: 0.05 },
  budget: { accommodation: 0.3, food: 0.25, transport: 0.25, activities: 0.15, buffer: 0.05 },
  solo: { accommodation: 0.28, food: 0.22, transport: 0.28, activities: 0.17, buffer: 0.05 },
  family: { accommodation: 0.38, food: 0.28, transport: 0.2, activities: 0.1, buffer: 0.04 }
};

function calculateBudget(totalBudget, totalDays, travelStyle, itinerary) {
  const style = STYLE_SPLITS[travelStyle] || STYLE_SPLITS.budget;
  const activityPlan = itinerary.reduce((sum, d) => sum + (d.dayBudget || 0), 0);
  const dailyEnvelope = Math.round(totalBudget / Math.max(totalDays, 1));
  const emergencyBuffer = Math.max(Math.round(totalBudget * style.buffer), Math.round(dailyEnvelope * 0.2));

  return {
    accommodation: Math.round(totalBudget * style.accommodation),
    food: Math.round(totalBudget * style.food),
    transport: Math.round(totalBudget * style.transport),
    activities: Math.max(Math.round(totalBudget * style.activities), Math.round(activityPlan)),
    buffer: emergencyBuffer,
    total: totalBudget
  };
}

function normalizeExpenseCategory(input) {
  const c = String(input || "other").toLowerCase();
  if (["accommodation", "food", "transport", "activities", "entertainment", "shopping", "other"].includes(c)) {
    return c;
  }
  return "other";
}

module.exports = { calculateBudget, normalizeExpenseCategory };
