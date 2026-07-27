const assert = require("node:assert/strict");
const fragrances = require("../fragrances.json");
const engine = require("../similarity-engine.js");

const allowedGenders = {
  мужской: new Set(["мужской", "унисекс"]),
  женский: new Set(["женский", "унисекс"]),
  унисекс: new Set(["унисекс"]),
};

fragrances.forEach((source) => {
  const result = engine.rankSimilar(source, fragrances, 4);
  assert.equal(result.length, 4, `${source.id}: должны выводиться четыре похожих аромата`);
  assert.equal(new Set(result.map((item) => item.id)).size, result.length, `${source.id}: не должно быть повторов`);
  assert.ok(result.every((item) => item.id !== source.id), `${source.id}: исходный аромат не должен повторяться`);
  assert.ok(
    result.every((item) => allowedGenders[source.gender].has(item.gender)),
    `${source.id}: в похожих ароматах найден несовместимый пол`
  );

  const scores = result.map((item) => engine.scoreSimilarity(source, item));
  assert.deepEqual(
    scores,
    [...scores].sort((first, second) => second - first),
    `${source.id}: похожие ароматы должны идти по убыванию сходства`
  );
});

const blueSeduction = fragrances.find((item) => item.id === "003");
const blueSeductionSimilar = engine.rankSimilar(blueSeduction, fragrances, 4);
assert.ok(
  blueSeductionSimilar.every((item) => item.gender !== "женский"),
  "В карточке мужского BLUE SEDUCTION не должно быть женских ароматов"
);
assert.equal(
  blueSeductionSimilar[0].id,
  "156",
  "Ближайшим к BLUE SEDUCTION должен быть мужской водяной HB NOW"
);

const imperatrice = fragrances.find((item) => item.id === "017");
assert.ok(
  engine.rankSimilar(imperatrice, fragrances, 4).every((item) => item.gender !== "мужской"),
  "В карточке женского IMPERATRICE не должно быть мужских ароматов"
);

const baccarat = fragrances.find((item) => item.id === "025");
assert.ok(
  engine.rankSimilar(baccarat, fragrances, 4).every((item) => item.gender === "унисекс"),
  "В карточке унисекс BACCARAT должны оставаться только унисекс-ароматы"
);

console.log(`Проверено похожих ароматов: ${fragrances.length} карточек; пол, порядок и лимит корректны`);
