function validateTripGenerationInput(body) {
  const required = ["destination", "startDate", "endDate", "budget"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`;
  if (Number(body.budget) <= 0) return "Budget must be greater than zero";
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Invalid date input";
  if (end < start) return "End date cannot be before start date";
  return "";
}

function validateExpenseInput(body) {
  if (!body.date) return "Expense date is required";
  if (!body.category) return "Expense category is required";
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return "Expense amount must be a positive number";
  return "";
}

module.exports = { validateTripGenerationInput, validateExpenseInput };
