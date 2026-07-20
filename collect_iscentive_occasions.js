const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const FRAGRANCES_PATH = path.join(ROOT, "fragrances.json");
const OUTPUT_PATH = path.join(ROOT, "iscentive_occasions.json");
const SITEMAPS = [0, 1, 2, 3].map((index) => `https://iscentive.com/sitemap/${index}.xml`);

const URL_OVERRIDES = {
  "003": "https://iscentive.com/fragrance/banderas/blue-seduction-for-men-eau-de-toilette.html",
  "012": "https://iscentive.com/fragrance/chanel/bleu-de-chanel-eau-de-toilette.html",
  "014": "https://iscentive.com/fragrance/chanel/chance-eau-tendre-eau-de-toilette.html",
  "015": "https://iscentive.com/fragrance/dior/sauvage-eau-de-toilette.html",
  "025": "https://iscentive.com/fragrance/maison-francis-kurkdjian/baccarat-rouge-540-eau-de-parfum.html",
  "034": "https://iscentive.com/fragrance/rabanne/1-million-eau-de-toilette.html",
  "035": "https://iscentive.com/fragrance/rabanne/black-xs-l-exces-for-him.html",
  "036": "https://iscentive.com/fragrance/rabanne/invictus-eau-de-toilette.html",
  "037": "https://iscentive.com/fragrance/xerjoff/accento.html",
  "038": "https://iscentive.com/fragrance/xerjoff/erba-pura.html",
  "040": "https://iscentive.com/fragrance/tiziana-terenzi/kirke-extrait-de-parfum.html",
  "042": "https://iscentive.com/fragrance/tom-ford/tobacco-vanille-eau-de-parfum.html",
  "044": "https://iscentive.com/fragrance/versace/bright-crystal-eau-de-toilette.html",
  "045": "https://iscentive.com/fragrance/versace/eros-eau-de-toilette.html",
  "049": "https://iscentive.com/fragrance/yves-saint-laurent/black-opium-eau-de-parfum.html",
  "081": "https://iscentive.com/fragrance/carolina-herrera/212-vip-men-eau-de-toilette.html",
  "096": "https://iscentive.com/fragrance/dior/fahrenheit-eau-de-toilette.html",
  "111": "https://iscentive.com/fragrance/dolce-gabbana/the-one-for-men-eau-de-toilette.html",
  "129": "https://iscentive.com/fragrance/essential-parfums/bois-imperial-eau-de-parfum.html",
  "153": "https://iscentive.com/fragrance/hugo-boss/boss-bottled-eau-de-toilette.html",
  "179": "https://iscentive.com/fragrance/kilian/i-dont-need-a-prince-by-my-side-to-be-a-princess.html",
  "185": "https://iscentive.com/fragrance/lacoste/l1212-blanc-eau-de-toilette.html",
  "334": "https://iscentive.com/fragrance/ajmal/aurum-eau-de-parfum.html",
  "507": "https://iscentive.com/fragrance/attar-collection/crystal-love-for-her.html",
  "526": "https://iscentive.com/fragrance/matiere-premiere/vanilla-powder-eau-de-parfum.html",
  "532": "https://iscentive.com/fragrance/clive-christian/jump-up-and-kiss-me-hedonistic.html",
  "502": "https://iscentive.com/fragrance/tom-ford/ombre-leather-2018-eau-de-parfum.html",
};

// Эти названия имеют близкие, но другие версии в Iscentive. Лучше оценить их
// по нескольким соседям, чем незаметно подставить данные другого аромата.
const FORCE_ESTIMATE_IDS = new Set(["156", "282", "541"]);

const STOP_WORDS = new Set([
  "a", "and", "by", "de", "des", "du", "eau", "edp", "edt", "elixir",
  "for", "la", "le", "les", "lotion", "men", "parfum", "perfume", "pour",
  "spray", "the", "toilette", "women",
]);

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function diceCoefficient(leftTokens, rightTokens) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) overlap += 1;
  });
  return (2 * overlap) / (left.size + right.size);
}

function compact(value) {
  return tokens(value).join("");
}

function similarity(original, url) {
  const urlParts = new URL(url).pathname
    .replace(/^\/fragrance\//, "")
    .replace(/\.html$/, "")
    .split("/")
    .map((part) => decodeURIComponent(part).replace(/-/g, " "));
  const candidate = urlParts.join(" ");
  const originalTokens = tokens(original);
  const candidateTokens = tokens(candidate);
  let score = diceCoefficient(originalTokens, candidateTokens);

  const originalCompact = compact(original);
  const candidateCompact = compact(candidate);
  if (originalCompact === candidateCompact) score += 0.35;
  else if (candidateCompact.includes(originalCompact) || originalCompact.includes(candidateCompact)) score += 0.18;

  const perfumeName = urlParts.slice(1).join(" ");
  const perfumeTokens = tokens(perfumeName);
  const nameOverlap = diceCoefficient(originalTokens, perfumeTokens);
  score += nameOverlap * 0.15;
  return score;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; FLUIDE catalog data verification)",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/iscentive\.com\/fragrance\/[^<]+\.html)<\/loc>/g)]
    .map((match) => match[1]);
}

function numberField(html, field) {
  const pattern = new RegExp(`(?:\\\\)?"${field}(?:\\\\)?":(-?\\d+(?:\\.\\d+)?)`);
  const match = html.match(pattern);
  return match ? Number(match[1]) : null;
}

function booleanField(html, field) {
  const pattern = new RegExp(`(?:\\\\)?"${field}(?:\\\\)?":(true|false)`);
  const match = html.match(pattern);
  return match ? match[1] === "true" : null;
}

function parseOccasions(html) {
  const raw = {
    everyday: numberField(html, "everyday"),
    office: numberField(html, "office"),
    gym: numberField(html, "gym"),
    special: numberField(html, "special"),
    date: numberField(html, "date"),
    night: numberField(html, "night"),
  };
  if (Object.values(raw).some((value) => value === null)) return null;
  return {
    raw,
    voteCount: numberField(html, "voteCount"),
    isEstimated: booleanField(html, "isEstimated"),
  };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function mapToFluide(raw) {
  return {
    everyday: round(Math.max(raw.everyday, raw.office) * 10),
    evening: round(raw.night * 10),
    date: round(raw.date * 10),
    gym: round(raw.gym * 10),
    // В источнике нет отдельного пункта «прогулка». Это спокойная повседневная
    // активность, поэтому оценка сочетает Everyday и Gym без использования нот.
    walk: round((raw.everyday * 0.7 + raw.gym * 0.3) * 10),
  };
}

function jaccard(leftValues, rightValues) {
  const left = new Set(leftValues || []);
  const right = new Set(rightValues || []);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let overlap = 0;
  left.forEach((value) => {
    if (right.has(value)) overlap += 1;
  });
  return overlap / union.size;
}

function accordCosine(leftAccords, rightAccords) {
  const left = new Map((leftAccords || []).map((accord) => [normalize(accord.name), Number(accord.weight) || 0]));
  const right = new Map((rightAccords || []).map((accord) => [normalize(accord.name), Number(accord.weight) || 0]));
  const names = new Set([...left.keys(), ...right.keys()]);
  let dot = 0;
  let leftLength = 0;
  let rightLength = 0;
  names.forEach((name) => {
    const leftValue = left.get(name) || 0;
    const rightValue = right.get(name) || 0;
    dot += leftValue * rightValue;
    leftLength += leftValue * leftValue;
    rightLength += rightValue * rightValue;
  });
  if (!leftLength || !rightLength) return 0;
  return dot / Math.sqrt(leftLength * rightLength);
}

function profileSimilarity(left, right) {
  const accord = accordCosine(left.accords, right.accords);
  const family = jaccard(left.groupFamilies, right.groupFamilies);
  const season = jaccard(left.season, right.season);
  return accord * 0.75 + family * 0.15 + season * 0.1;
}

function selectedOccasions(scores) {
  const entries = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  const selected = entries.filter(([, score]) => score >= 60).map(([key]) => key);
  return selected.length ? selected : entries.slice(0, 1).map(([key]) => key);
}

async function main() {
  const fragrances = JSON.parse(fs.readFileSync(FRAGRANCES_PATH, "utf8"));
  const sitemapDocuments = await Promise.all(SITEMAPS.map(fetchText));
  const urls = sitemapDocuments.flatMap(sitemapUrls);
  const result = {
    source: "Iscentive",
    sourceDefinition: "occasion suitability values exposed on fragrance profile pages",
    mapping: {
      everyday: "max(Everyday, Office)",
      evening: "Night Out",
      date: "Date Night",
      gym: "Gym",
      walk: "70% Everyday + 30% Gym (closest available source categories for a casual walk)",
    },
    items: {},
  };

  for (const fragrance of fragrances) {
    const candidates = urls
      .map((url) => ({ url, score: similarity(fragrance.original, url) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
    const best = candidates[0];
    const runnerUp = candidates[1];
    const matchIsStrong = best && best.score >= 0.72 && (!runnerUp || best.score - runnerUp.score >= 0.04);
    const overrideUrl = URL_OVERRIDES[fragrance.id];
    const shouldEstimate = FORCE_ESTIMATE_IDS.has(fragrance.id);
    result.items[fragrance.id] = {
      original: fragrance.original,
      matchedUrl: shouldEstimate ? null : (overrideUrl || (matchIsStrong ? best.url : null)),
      matchScore: best ? round(best.score) : 0,
      matchMethod: shouldEstimate
        ? "forced_estimate_to_avoid_wrong_version"
        : (overrideUrl ? "verified_override" : (matchIsStrong ? "automatic" : "unresolved")),
      candidates,
    };
  }

  const matchedItems = Object.entries(result.items).filter(([, item]) => item.matchedUrl);
  let completed = 0;
  for (const [id, item] of matchedItems) {
    try {
      const html = await fetchText(item.matchedUrl);
      const parsed = parseOccasions(html);
      if (!parsed) {
        item.status = "occasion_data_not_found";
        continue;
      }
      item.sourceOccasions = parsed.raw;
      item.occasionScores = mapToFluide(parsed.raw);
      item.occasions = selectedOccasions(item.occasionScores);
      item.voteCount = parsed.voteCount;
      item.isEstimated = parsed.isEstimated;
      item.dataMethod = parsed.isEstimated ? "source_estimated" : "source_profile";
      item.status = "ok";
      completed += 1;
    } catch (error) {
      item.status = "fetch_error";
      item.error = error.message;
    }
  }

  const fragranceById = new Map(fragrances.map((fragrance) => [fragrance.id, fragrance]));
  const sourcedIds = Object.entries(result.items)
    .filter(([, item]) => item.status === "ok")
    .map(([id]) => id);
  for (const [id, item] of Object.entries(result.items)) {
    if (item.status === "ok") continue;
    const fragrance = fragranceById.get(id);
    const neighbors = sourcedIds
      .map((sourceId) => ({
        id: sourceId,
        similarity: profileSimilarity(fragrance, fragranceById.get(sourceId)),
        scores: result.items[sourceId].occasionScores,
      }))
      .filter((neighbor) => neighbor.similarity >= 0.25)
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, 5);
    const totalWeight = neighbors.reduce((sum, neighbor) => sum + neighbor.similarity, 0);
    const estimates = {};
    for (const occasion of ["everyday", "evening", "date", "gym", "walk"]) {
      estimates[occasion] = totalWeight
        ? round(neighbors.reduce((sum, neighbor) => (
          sum + neighbor.scores[occasion] * neighbor.similarity
        ), 0) / totalWeight)
        : 0;
    }
    item.occasionScores = estimates;
    item.occasions = selectedOccasions(item.occasionScores);
    item.dataMethod = "nearest_neighbors_estimate";
    item.estimatedFrom = neighbors.map((neighbor) => ({
      id: neighbor.id,
      similarity: round(neighbor.similarity * 100),
    }));
    item.isEstimated = true;
    item.status = "ok";
    completed += 1;
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  const unresolved = Object.values(result.items).filter((item) => item.status !== "ok").length;
  console.log(`Iscentive: ${completed}/${fragrances.length} профилей случаев, не подтверждено: ${unresolved}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
