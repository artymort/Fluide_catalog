const assert = require("node:assert/strict");
const fragrances = require("../fragrances.json");
const engine = require("../wardrobe-engine.js");

const roleDefinitions = {
  base: { target: { freshness: 3, sweetness: 3, warmth: 3, intensity: 3, formality: 3, unusual: 2 } },
  composure: { target: { freshness: 4, sweetness: 2, warmth: 2, intensity: 3, formality: 5, unusual: 2 } },
  reset: { target: { freshness: 5, sweetness: 2, warmth: 1, intensity: 2, formality: 2, unusual: 2 } },
  attraction: { target: { freshness: 2, sweetness: 4, warmth: 4, intensity: 4, formality: 3, unusual: 3 } },
  accent: { target: { freshness: 2, sweetness: 3, warmth: 4, intensity: 5, formality: 4, unusual: 5 } },
};

const profiles = [
  { gender: "female", favorites: [], dislikes: ["tooSweet", "heavy"], moods: ["clean", "energetic"] },
  { gender: "female", favorites: ["087"], dislikes: [], moods: ["attractive", "elegant"] },
  { gender: "female", favorites: ["049"], dislikes: ["tooFresh"], moods: ["mysterious", "bold"] },
  { gender: "female", favorites: ["018"], dislikes: ["heavy"], moods: ["free", "clean"] },
  { gender: "male", favorites: [], dislikes: ["tooSweet"], moods: ["confident", "collected"] },
  { gender: "male", favorites: ["015"], dislikes: ["smoky"], moods: ["clean", "free"] },
  { gender: "male", favorites: ["090"], dislikes: ["heavy"], moods: ["energetic", "clean"] },
  { gender: "male", favorites: ["071"], dislikes: [], moods: ["bold", "unusual"] },
  { gender: "unisex", favorites: [], dislikes: [], moods: ["unusual", "bold"] },
  { gender: "unisex", favorites: ["025"], dislikes: [], moods: ["attractive", "elegant"] },
  { gender: "unisex", favorites: ["129"], dislikes: ["tooSweet"], moods: ["collected", "confident"] },
  { gender: "unisex", favorites: ["041"], dislikes: ["tooFresh"], moods: ["soft", "mysterious"] },
];

const prepared = engine.prepareItems(fragrances);
const roles = ["base", "reset", "attraction", "accent"];
const resultSets = profiles.map((profile) => {
  const state = { ...profile, roles };
  const result = engine.buildRecommendations(prepared, state, roleDefinitions);
  assert.equal(result.length, 4, "Каждый профиль должен получить четыре аромата");
  assert.equal(new Set(result.map((item) => item.id)).size, 4, "В одном гардеробе не должно быть повторов");
  result.forEach((item) => assert.equal(engine.genderMatches(item.gender, profile.gender), true));
  profile.favorites.forEach((id) => assert.equal(result.some((item) => item.id === id), false));
  return result.map((item) => item.id).join(",");
});

assert.ok(new Set(resultSets).size >= 10, "Разные профили должны давать заметно разные гардеробы");

const priorityA = { gender: "unisex", favorites: [], dislikes: [], moods: ["clean", "bold"], roles };
const priorityB = { ...priorityA, moods: ["bold", "clean"] };
const setA = engine.buildRecommendations(prepared, priorityA, roleDefinitions).map((item) => item.id).join(",");
const setB = engine.buildRecommendations(prepared, priorityB, roleDefinitions).map((item) => item.id).join(",");
assert.notEqual(setA, setB, "Первое выбранное состояние должно менять приоритет выдачи");

const moods = [
  "confident", "calm", "attractive", "free", "energetic", "soft",
  "collected", "mysterious", "unusual", "elegant", "clean", "bold",
];
const moodWardrobes = moods.map((mood) => engine.buildRecommendations(prepared, {
  gender: "unisex",
  favorites: [],
  dislikes: [],
  moods: [mood],
  roles,
}, roleDefinitions).map((item) => item.id).join(","));
assert.ok(new Set(moodWardrobes).size >= 8, "Эмоциональные состояния должны заметно менять гардероб");

function emotionCandidate(traits, profile, occasionScores = {}, rarity = .2) {
  return {
    _wardrobeTraits: traits,
    _wardrobeProfile: {
      freshness: 3, sweetness: 3, warmth: 3, intensity: 3, formality: 3, unusual: 3,
      ...profile,
    },
    occasionScores,
    _wardrobeRarity: rarity,
  };
}

const freshCandidate = emotionCandidate(
  { fresh: 5, citrus: 5, green: 4.5, aromatic: 4, fruity: 2 },
  { freshness: 5, sweetness: 1.3, warmth: 1.5, intensity: 2.8 },
  { everyday: 90, gym: 95, walk: 90 },
);
const heavyCandidate = emotionCandidate(
  { gourmand: 5, amber: 5, smoky: 4, tobacco: 3 },
  { freshness: 1.2, sweetness: 5, warmth: 5, intensity: 4.5 },
  { evening: 90 },
);
assert.ok(engine.emotionFit(freshCandidate, "energetic") > engine.emotionFit(heavyCandidate, "energetic"));
assert.ok(engine.emotionFit(freshCandidate, "clean") > engine.emotionFit(heavyCandidate, "clean"));

const delicateCandidate = emotionCandidate(
  { floral: 5, powdery: 4.5, musky: 4, gourmand: 2 },
  { intensity: 1.9, warmth: 3.4, sweetness: 3.3, unusual: 1.8 },
  { everyday: 85, date: 70 },
);
const abrasiveCandidate = emotionCandidate(
  { spicy: 5, mineral: 5, smoky: 4, leather: 3 },
  { intensity: 4.8, warmth: 4, unusual: 4.5 },
  { evening: 90 },
);
assert.ok(engine.emotionFit(delicateCandidate, "soft") > engine.emotionFit(abrasiveCandidate, "soft"));
assert.ok(engine.emotionFit(abrasiveCandidate, "bold") > engine.emotionFit(delicateCandidate, "bold"));

const rareCandidate = emotionCandidate({ mineral: 3 }, { unusual: 5, formality: 2.2 }, {}, .95);
const commonCandidate = emotionCandidate({ mineral: 3 }, { unusual: 5, formality: 2.2 }, {}, .05);
assert.ok(engine.emotionFit(rareCandidate, "unusual") > engine.emotionFit(commonCandidate, "unusual"));
moods.forEach((mood) => {
  const score = engine.emotionFit(freshCandidate, mood);
  assert.ok(Number.isFinite(score) && score >= 0 && score <= 1, `${mood}: некорректная оценка`);
});

const lux = fragrances.find((item) => item.category === "Люкс");
const superLux = fragrances.find((item) => item.category === "Суперлюкс");
const selective = fragrances.find((item) => item.category === "Селектив");
assert.equal(engine.fragrancePrice(lux, 30), 1990);
assert.equal(engine.fragrancePrice(lux, 50), 2990);
assert.equal(engine.fragrancePrice(superLux, 30), 2490);
assert.equal(engine.fragrancePrice(selective, 50), 4990);
const priceSeeds = [lux, superLux, selective];
const fourthPriceItem = fragrances.find((item) => !priceSeeds.some((seed) => seed.id === item.id));
const priceItems = [...priceSeeds, fourthPriceItem];
const volumes = {
  [priceItems[0].id]: 30,
  [priceItems[1].id]: 50,
  [priceItems[2].id]: 50,
  [priceItems[3].id]: 30,
};
assert.equal(
  engine.wardrobePrice(priceItems, volumes),
  priceItems.reduce((sum, item) => sum + engine.fragrancePrice(item, volumes[item.id]), 0),
);
assert.equal(engine.volumeSummary(priceItems, volumes), "2 × 30 мл · 2 × 50 мл");
assert.ok(prepared.every((item) => item._wardrobeFamilies && item._wardrobeAccords));
assert.ok(prepared.every((item) => Number.isFinite(item._wardrobeRarity)));

console.log(`Проверено профилей: ${profiles.length}; состояний: ${moods.length}; уникальных гардеробов состояний: ${new Set(moodWardrobes).size}`);
profiles.forEach((profile, index) => console.log(`${profile.gender}\t${profile.favorites.join("+") || "новичок"}\t${profile.moods.join("+")}\t${resultSets[index]}`));
