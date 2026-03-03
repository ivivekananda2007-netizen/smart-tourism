const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateBudget, normalizeExpenseCategory } = require("../services/budgetService");

test("calculateBudget returns total and positive segments", () => {
  const result = calculateBudget(20000, 4, "budget", [{ dayBudget: 1000 }, { dayBudget: 800 }]);
  assert.equal(result.total, 20000);
  assert.ok(result.accommodation > 0);
  assert.ok(result.food > 0);
});

test("normalizeExpenseCategory maps unknown to other", () => {
  assert.equal(normalizeExpenseCategory("Flights"), "other");
  assert.equal(normalizeExpenseCategory("food"), "food");
});
