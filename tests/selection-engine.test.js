const assert = require("node:assert/strict");
const fragrances = require("../fragrances.json");
const engine = require("../selection-engine.js");

const profiles = [
  { gender: "женский", occasions: ["everyday"], families: ["Цветочные"], seasons: ["spring"] },
  { gender: "женский", occasions: ["date"], families: ["Сладкие"], seasons: ["winter"] },
  { gender: "мужской", occasions: ["everyday"], families: ["Свежие"], seasons: ["summer"] },
  { gender: "мужской", occasions: ["evening"], families: ["Древесные"], seasons: ["autumn"] },
  { gender: "унисекс", occasions: ["walk"], families: ["Цитрусовые"], seasons: ["summer"] },
  { gender: "унисекс", occasions: ["evening"], families: ["Пряные и восточные"], seasons: ["winter"] },
];

profiles.forEach((criteria) => {
  const result = engine.rankRecommendations(fragrances, criteria);
  assert.ok(result.items.length <= 6, "Подбор не должен показывать больше шести ароматов");
  assert.equal(new Set(result.items.map((item) => item.id)).size, result.items.length, "В выдаче не должно быть повторов");
  result.items.forEach((item) => {
    assert.equal(engine.isEligible(item, criteria), true, "Каждый результат должен соответствовать выбранным критериям");
    assert.equal(engine.genderMatches(item.gender, criteria.gender), true, "Пол должен учитывать унисекс-ароматы");
  });
  const scores = result.items.map((item) => engine.scoreItem(item, criteria));
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a), "Результаты должны идти по убыванию рейтинга");
});

const female = engine.rankRecommendations(fragrances, { gender: "женский" }).items;
assert.ok(female.some((item) => item.gender === "унисекс"), "К женским должны подключаться унисекс-ароматы");
assert.ok(female.every((item) => ["женский", "унисекс"].includes(item.gender)));

const male = engine.rankRecommendations(fragrances, { gender: "мужской" }).items;
assert.ok(male.some((item) => item.gender === "унисекс"), "К мужским должны подключаться унисекс-ароматы");
assert.ok(male.every((item) => ["мужской", "унисекс"].includes(item.gender)));

const unisex = engine.rankRecommendations(fragrances, { gender: "унисекс" }).items;
assert.ok(unisex.every((item) => item.gender === "унисекс"), "Выбор унисекс не должен добавлять мужские или женские ароматы");

const synthetic = fragrances.slice(0, 4).map((item, index) => ({
  ...item,
  id: `test-${index}`,
  gender: "унисекс",
  families: ["Свежие"],
  groupFamilies: ["Свежие"],
  occasion: ["walk"],
  season: ["summer"],
}));
const shortResult = engine.rankRecommendations(synthetic, {
  gender: "унисекс",
  families: ["Свежие"],
  occasions: ["walk"],
  seasons: ["summer"],
});
assert.equal(shortResult.items.length, 4, "Если подходят только четыре аромата, нельзя дополнять выдачу случайными");

assert.equal(fragrances.length, 99);
assert.ok(fragrances.every((item) => item.group && item.groupFamilies.length && item.season.length));
console.log(`Проверено профилей: ${profiles.length}; лимит: 6; ароматов в базе: ${fragrances.length}`);
