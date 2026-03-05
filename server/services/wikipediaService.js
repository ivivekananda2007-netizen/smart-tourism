const axios = require("axios");

const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";
const wikiCache = new Map();
const wikiInFlight = new Set();

function cleanName(name) {
  return String(name || "").trim();
}

function getCacheKey(placeName) {
  return cleanName(placeName).toLowerCase();
}

function buildGeneratedDescription(place) {
  const placeName = cleanName(place?.placeTown) || "This location";
  const city = cleanName(place?.cityTown);
  const state = cleanName(place?.state);
  const type = cleanName(place?.type);
  const locationText = [city, state].filter(Boolean).join(", ");
  const segmentA = `${placeName} is a notable travel attraction${locationText ? ` in ${locationText}` : ""}.`;
  const segmentB = type
    ? ` It is known as a ${type} destination and is valued by visitors for its local character.`
    : " It is known as a local destination and is valued by visitors for its character and atmosphere.";
  const segmentC = " Travelers can include it in day plans for sightseeing, photography, and regional exploration.";
  return `${segmentA}${segmentB}${segmentC}`;
}

function makeCacheResult({ title, extract, thumbnail }) {
  return {
    title: String(title || ""),
    extract: String(extract || "").trim(),
    thumbnail: String(thumbnail || "")
  };
}

async function fetchSummaryByTitle(title) {
  const normalizedTitle = cleanName(title);
  if (!normalizedTitle) return null;
  const encoded = encodeURIComponent(normalizedTitle.replace(/\s+/g, "_"));
  try {
    const { data } = await axios.get(`${WIKI_BASE}/${encoded}`, {
      timeout: 6000,
      headers: {
        "User-Agent": "TripGenius/1.0 (wikipedia-enrichment)"
      }
    });
    if (!data || !data.extract) return null;
    return makeCacheResult({
      title: data?.title || normalizedTitle,
      extract: data?.extract || "",
      thumbnail: data?.thumbnail?.source || ""
    });
  } catch (_) {
    return null;
  }
}

async function searchBestWikipediaTitle(query) {
  const q = cleanName(query);
  if (!q) return "";
  try {
    const { data } = await axios.get(WIKI_API_BASE, {
      params: {
        action: "query",
        list: "search",
        srsearch: q,
        srlimit: 1,
        format: "json",
        utf8: 1
      },
      timeout: 7000,
      headers: {
        "User-Agent": "TripGenius/1.0 (wikipedia-enrichment)"
      }
    });
    const hit = data?.query?.search?.[0];
    return cleanName(hit?.title || "");
  } catch (_) {
    return "";
  }
}

async function fetchExtractByTitle(title) {
  const normalizedTitle = cleanName(title);
  if (!normalizedTitle) return null;
  try {
    const { data } = await axios.get(WIKI_API_BASE, {
      params: {
        action: "query",
        prop: "extracts|pageimages",
        exintro: 1,
        explaintext: 1,
        piprop: "thumbnail",
        pithumbsize: 800,
        titles: normalizedTitle,
        format: "json",
        utf8: 1
      },
      timeout: 7000,
      headers: {
        "User-Agent": "TripGenius/1.0 (wikipedia-enrichment)"
      }
    });
    const pages = data?.query?.pages || {};
    const firstPage = Object.values(pages)[0];
    if (!firstPage || firstPage?.missing) return null;
    const extract = String(firstPage?.extract || "").trim();
    if (!extract) return null;
    return makeCacheResult({
      title: firstPage?.title || normalizedTitle,
      extract,
      thumbnail: firstPage?.thumbnail?.source || ""
    });
  } catch (_) {
    return null;
  }
}

async function fetchWikipediaSummary(place) {
  const placeName = cleanName(place?.placeTown);
  const cacheKey = getCacheKey(placeName);
  if (!placeName) {
    return makeCacheResult({
      title: "",
      extract: buildGeneratedDescription(place),
      thumbnail: ""
    });
  }
  if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey);

  const city = cleanName(place?.cityTown);
  const state = cleanName(place?.state);
  const directCandidates = [
    placeName,
    city ? `${placeName}, ${city}` : "",
    state ? `${placeName}, ${state}` : "",
    city && state ? `${placeName}, ${city}, ${state}` : ""
  ].filter(Boolean);

  for (const candidate of directCandidates) {
    const summary = await fetchSummaryByTitle(candidate);
    if (summary?.extract) {
      wikiCache.set(cacheKey, summary);
      return summary;
    }
  }

  for (const candidate of directCandidates) {
    const searchedTitle = await searchBestWikipediaTitle(candidate);
    if (!searchedTitle) continue;

    const summaryFromSearch = await fetchSummaryByTitle(searchedTitle);
    if (summaryFromSearch?.extract) {
      wikiCache.set(cacheKey, summaryFromSearch);
      return summaryFromSearch;
    }

    const extractFallback = await fetchExtractByTitle(searchedTitle);
    if (extractFallback?.extract) {
      wikiCache.set(cacheKey, extractFallback);
      return extractFallback;
    }
  }

  const fallback = makeCacheResult({
    title: placeName,
    extract: buildGeneratedDescription(place),
    thumbnail: ""
  });
  wikiCache.set(cacheKey, fallback);
  return fallback;
}

function enrichFromCacheOrFallback(place) {
  const key = getCacheKey(place?.placeTown);
  const cached = key ? wikiCache.get(key) : null;
  const extract = cached?.extract || buildGeneratedDescription(place);
  return {
    ...place,
    description: extract,
    wikipediaTitle: cached?.title || cleanName(place?.placeTown),
    wikipediaExtract: extract,
    wikipediaThumbnail: cached?.thumbnail || ""
  };
}

function primeWikipediaCache(places) {
  const uniquePlaces = Array.isArray(places)
    ? Array.from(
        new Map(
          places
            .filter((p) => p && cleanName(p.placeTown))
            .map((p) => [getCacheKey(p.placeTown), p])
        ).values()
      )
    : [];

  const queue = uniquePlaces.filter((p) => {
    const key = getCacheKey(p.placeTown);
    return key && !wikiCache.has(key) && !wikiInFlight.has(key);
  });
  if (queue.length === 0) return;

  const runWorker = async () => {
    while (queue.length > 0) {
      const place = queue.shift();
      if (!place) continue;
      const key = getCacheKey(place.placeTown);
      if (!key) continue;
      wikiInFlight.add(key);
      try {
        await fetchWikipediaSummary(place);
      } finally {
        wikiInFlight.delete(key);
      }
    }
  };

  const workers = Array.from({ length: 3 }, () => runWorker());
  Promise.all(workers).catch(() => {
    // background warm-up errors should not affect API responses
  });
}

async function enrichPlacesWithWikipedia(places, options = {}) {
  if (!Array.isArray(places) || places.length === 0) return [];
  const blocking = options.blocking !== false;

  if (!blocking) {
    primeWikipediaCache(places);
    return places.map((place) => enrichFromCacheOrFallback(place));
  }

  const queue = places.map((place, index) => ({ place, index }));
  const enriched = new Array(places.length);

  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;
      const { place, index } = item;
      const summary = await fetchWikipediaSummary(place);
      enriched[index] = {
        ...place,
        description: summary.extract || buildGeneratedDescription(place),
        wikipediaTitle: summary.title || place.placeTown || "",
        wikipediaExtract: summary.extract || buildGeneratedDescription(place),
        wikipediaThumbnail: summary.thumbnail || ""
      };
    }
  });
  await Promise.all(workers);

  return enriched.map((p, idx) => {
    if (p) return p;
    const place = places[idx] || {};
    return {
      ...place,
      description: buildGeneratedDescription(place),
      wikipediaTitle: cleanName(place.placeTown),
      wikipediaExtract: buildGeneratedDescription(place),
      wikipediaThumbnail: ""
    };
  });
}

module.exports = {
  enrichPlacesWithWikipedia
};
