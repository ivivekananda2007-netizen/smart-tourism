const fs = require("fs");
const path = require("path");
const { normalizeType } = require("../services/itineraryService");

function parseDurationToHours(text) {
  const raw = String(text || "").toLowerCase();
  const nums = (raw.match(/\d+(\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return 2;
  let val = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (raw.includes("minute")) val /= 60;
  return Math.max(0.5, Math.round(val * 10) / 10);
}

function parseBudgetToINR(text) {
  const nums = (String(text || "").match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return 300;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

function inferCrowdLevel(hiddenGem, type) {
  if (hiddenGem) return "low";
  const t = String(type).toLowerCase();
  if (t.includes("market") || t.includes("beach") || t.includes("fort")) return "high";
  return "medium";
}

function inferScores(hiddenGem, crowdLevel) {
  const localPopularityScore = hiddenGem ? 0.8 : 0.55;
  const socialHypeScore = hiddenGem ? 0.35 : crowdLevel === "high" ? 0.85 : 0.6;
  const authenticityScore = hiddenGem ? 0.82 : 0.6;
  return { localPopularityScore, socialHypeScore, authenticityScore };
}

function valueFromKeys(obj, keys) {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") return val;
  }
  return "";
}

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const v = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(v)) return true;
  if (["false", "no", "n", "0"].includes(v)) return false;
  return defaultValue;
}

function parseNumber(value, fallback = NaN) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseObjectsFromFile(content) {
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (content[i] === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(content.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}

function parseDatasetFolder(datasetDir) {
  const files = fs.readdirSync(datasetDir);
  const dedupe = new Set();
  const places = [];

  files
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .forEach((file) => {
      const full = path.join(datasetDir, file);
      const raw = fs.readFileSync(full, "utf8");
      let records = [];

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) records = parsed;
        else if (parsed && typeof parsed === "object") records = [parsed];
      } catch (_) {
        // Fallback for loose JSON-like files that still contain valid object chunks.
        const chunks = parseObjectsFromFile(raw);
        records = chunks.map((chunk) => JSON.parse(chunk));
      }

      records.forEach((x) => {
        const state = String(valueFromKeys(x, ["State", "state"])).trim();
        const placeTown = String(valueFromKeys(x, ["PlaceName", "place_name", "placeTown", "place_town"])).trim();
        const cityTown = String(valueFromKeys(x, ["CityTown", "city_town", "cityTown", "city", "town"])).trim();
        if (!state || !placeTown || !cityTown) return;
        const key = `${state}|${cityTown}|${placeTown}`.toLowerCase();
        if (dedupe.has(key)) return;
        dedupe.add(key);

        const rawType = String(valueFromKeys(x, ["Type", "type"]) || "nature");
        const type = normalizeType(rawType);
        const hiddenGem = parseBoolean(valueFromKeys(x, ["HiddenGem", "hidden_gem"]), false);
        const crowdLevel = inferCrowdLevel(hiddenGem, rawType);
        const scoreDefaults = inferScores(hiddenGem, crowdLevel);

        places.push({
          state,
          placeTown,
          cityTown,
          type,
          hiddenGem,
          visitDuration: parseDurationToHours(valueFromKeys(x, ["VisitDuration", "visit_duration", "duration"])),
          budgetINR: parseBudgetToINR(
            valueFromKeys(x, [
              "BudgetINR",
              "budget",
              "budget_in_inr",
              "place_budget_inr",
              "budget_inr",
              "estimated_daily_budget_inr"
            ])
          ),
          latitude: parseNumber(valueFromKeys(x, ["Latitude", "latitude"])),
          longitude: parseNumber(valueFromKeys(x, ["Longitude", "longitude"])),
          description: `${placeTown} in ${cityTown}, ${state}`,
          crowdLevel,
          rating: hiddenGem ? 4.5 : 4.1,
          bestSeason: [],
          seasonTags: [],
          ...scoreDefaults
        });
      });
    });

  return places.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
}

module.exports = { parseDatasetFolder };
