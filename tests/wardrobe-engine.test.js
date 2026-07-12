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

const moodTargets = {
  confident: { intensity: 4, formality: 4 },
  calm: { intensity: 2, sweetness: 3, warmth: 3 },
  attractive: { sweetness: 4, warmth: 4, intensity: 4 },
  free: { freshness: 4, formality: 1, unusual: 3 },
  energetic: { freshness: 5, intensity: 3 },
  soft: { sweetness: 4, intensity: 2, warmth: 4 },
  collected: { freshness: 3, formality: 5, intensity: 3 },
  mysterious: { warmth: 5, unusual: 4, intensity: 4 },
  unusual: { unusual: 5 },
  elegant: { formality: 5, sweetness: 3, intensity: 3 },
  clean: { freshness: 5, sweetness: 1, warmth: 1 },
  bold: { intensity: 5, unusual: 5 },
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
const roles = ["base", "composure", "reset", "attraction", "accent"];
const resultSets = profiles.map((profile) => {
  const state = { ...profile, roles };
  const result = engine.buildRecommendations(prepared, state, roleDefinitions, moodTargets);
  assert.equal(result.length, 5, "Каждый профиль должен получить пять ароматов");
  assert.equal(new Set(result.map((item) => item.id)).size, 5, "В одном гардеробе не должно быть повторов");
  result.forEach((item) => assert.equal(engine.genderMatches(item.gender, profile.gender), true));
  profile.favorites.forEach((id) => assert.equal(result.some((item) => item.id === id), false));
  return result.map((item) => item.id).join(",");
});

assert.ok(new Set(resultSets).size >= 10, "Разные профили должны давать заметно разные гардеробы");

const priorityA = { gender: "unisex", favorites: [], dislikes: [], moods: ["clean", "bold"], roles };
const priorityB = { ...priorityA, moods: ["bold", "clean"] };
const setA = engine.buildRecommendations(prepared, priorityA, roleDefinitions, moodTargets).map((item) => item.id).join(",");
const setB = engine.buildRecommendations(prepared, priorityB, roleDefinitions, moodTargets).map((item) => item.id).join(",");
assert.notEqual(setA, setB, "Первое выбранное состояние должно менять приоритет выдачи");

console.log(`Проверено профилей: ${profiles.length}; уникальных пятёрок: ${new Set(resultSets).size}`);
profiles.forEach((profile, index) => console.log(`${profile.gender}\t${profile.favorites.join("+") || "новичок"}\t${profile.moods.join("+")}\t${resultSets[index]}`));
