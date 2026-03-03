const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { parseDatasetFolder } = require("../utils/parseDataset");

test("parseDatasetFolder returns normalized places", () => {
  const datasetDir = path.resolve(__dirname, "../../datasets");
  const places = parseDatasetFolder(datasetDir);
  assert.ok(places.length > 0);
  assert.ok(places.length > 1000);
  assert.ok(new Set(places.map((p) => p.state)).size >= 30);
  assert.ok(typeof places[0].state === "string");
  assert.ok(Number.isFinite(places[0].latitude));
  assert.ok(["low", "medium", "high"].includes(places[0].crowdLevel));
});
