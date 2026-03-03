const EARTH_RADIUS_KM = 6371;
const DAY_START_HOUR = 8;
const MAX_DAY_HOURS = 9;
const CLUSTER_DISTANCE_THRESHOLD_KM = 90;

function toRad(v) {
  return (v * Math.PI) / 180;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeType(rawType) {
  const t = String(rawType || "").toLowerCase();
  if (t.includes("fort") || t.includes("heritage") || t.includes("temple")) return "historical";
  if (t.includes("trek") || t.includes("adventure") || t.includes("water sport")) return "adventure";
  if (t.includes("food") || t.includes("cafe") || t.includes("market")) return "food";
  if (t.includes("beach")) return "beach";
  if (t.includes("wildlife")) return "wildlife";
  if (t.includes("hill")) return "hill";
  if (t.includes("religious") || t.includes("shrine")) return "religious";
  if (t.includes("photo") || t.includes("view")) return "photography";
  if (t.includes("culture")) return "culture";
  return "nature";
}

function scorePlace(place, interests, monthTag) {
  const type = normalizeType(place.type);
  const interestMatch = interests.includes(type) ? 2.0 : 0;
  const hiddenGemBoost = place.hiddenGem ? 1.0 : 0;
  const lowCrowdBoost = place.crowdLevel === "low" ? 0.8 : place.crowdLevel === "medium" ? 0.3 : 0;
  const seasonMatch = place.bestSeason?.includes(monthTag) || place.seasonTags?.includes(monthTag) ? 0.8 : 0;
  return (place.rating || 4) + interestMatch + hiddenGemBoost + lowCrowdBoost + seasonMatch;
}

function buildDayGroups(sortedPlaces, totalDays) {
  const used = new Set();
  const groups = Array.from({ length: totalDays }, () => []);

  for (let day = 0; day < totalDays; day += 1) {
    let usedHours = 0;
    let anchor = null;

    for (let i = 0; i < sortedPlaces.length; i += 1) {
      if (used.has(i)) continue;
      const p = sortedPlaces[i];
      if (usedHours + p.visitDuration > MAX_DAY_HOURS) continue;
      if (anchor) {
        const d = getDistance(anchor.latitude, anchor.longitude, p.latitude, p.longitude);
        if (d > CLUSTER_DISTANCE_THRESHOLD_KM) continue;
      }
      groups[day].push(p);
      used.add(i);
      usedHours += p.visitDuration;
      anchor = p;
    }
  }

  return groups;
}

function nearestNeighborOrder(places) {
  if (places.length < 3) return places;
  const ordered = [places[0]];
  const rest = places.slice(1);
  while (rest.length > 0) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < rest.length; i += 1) {
      const d = getDistance(last.latitude, last.longitude, rest[i].latitude, rest[i].longitude);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    ordered.push(rest.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateItinerary(places, totalDays, interests, startDate) {
  const monthTag = new Date(startDate).toLocaleDateString("en-US", { month: "short" });
  const scored = places
    .map((p) => ({ ...p.toObject(), score: scorePlace(p, interests, monthTag), type: normalizeType(p.type) }))
    .sort((a, b) => b.score - a.score);

  const grouped = buildDayGroups(scored, totalDays);
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  const itinerary = grouped.map((dayPlaces, dayIdx) => {
    const ordered = nearestNeighborOrder(dayPlaces);
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIdx);

    let cursor = DAY_START_HOUR;
    let travelDistance = 0;
    const placesOut = ordered.map((p, idx) => {
      if (idx > 0) {
        travelDistance += getDistance(
          ordered[idx - 1].latitude,
          ordered[idx - 1].longitude,
          p.latitude,
          p.longitude
        );
        cursor += 0.4;
      }
      const out = {
        placeId: p._id,
        placeName: p.placeTown,
        cityTown: p.cityTown,
        type: p.type,
        visitDuration: p.visitDuration,
        suggestedTime: formatTime(cursor),
        budgetINR: p.budgetINR,
        latitude: p.latitude,
        longitude: p.longitude,
        hiddenGem: p.hiddenGem,
        description: p.description,
        sequence: idx + 1,
        isIndoor: ["historical", "culture", "religious"].includes(p.type),
        notes: ""
      };
      cursor += p.visitDuration;
      return out;
    });

    const travelTimeMinutes = Math.round((travelDistance / 38) * 60);
    totalDistanceKm += travelDistance;
    totalTravelMinutes += travelTimeMinutes;

    return {
      day: dayIdx + 1,
      date: date.toISOString().slice(0, 10),
      places: placesOut,
      travelDistance: Math.round(travelDistance),
      travelTimeMinutes,
      dayBudget: placesOut.reduce((sum, x) => sum + (x.budgetINR || 0), 0),
      weatherNote: ""
    };
  });

  return {
    itinerary,
    optimizationMeta: {
      totalDistanceKm: Math.round(totalDistanceKm),
      totalTravelMinutes: Math.round(totalTravelMinutes),
      optimizationVersion: "v1.0.0"
    }
  };
}

module.exports = { generateItinerary, getDistance, normalizeType };
