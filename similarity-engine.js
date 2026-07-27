(function attachSimilarityEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FluideSimilarity = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSimilarityEngine() {
  const MALE = "мужской";
  const FEMALE = "женский";
  const UNISEX = "унисекс";

  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase("ru-RU")
      .replaceAll("ё", "е")
      .trim();
  }

  function vectorFromAccords(accords) {
    return Object.fromEntries((accords || []).map((accord) => [
      normalize(accord.name),
      Number(accord.weight) || 0,
    ]));
  }

  function normalizeVector(vector) {
    return Object.fromEntries(Object.entries(vector || {}).map(([key, value]) => [
      normalize(key),
      Number(value) || 0,
    ]));
  }

  function weightedJaccard(first, second) {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
    let intersection = 0;
    let union = 0;
    keys.forEach((key) => {
      intersection += Math.min(first[key] || 0, second[key] || 0);
      union += Math.max(first[key] || 0, second[key] || 0);
    });
    return union ? intersection / union : 0;
  }

  function setJaccard(first, second) {
    const firstSet = new Set((first || []).map(normalize).filter(Boolean));
    const secondSet = new Set((second || []).map(normalize).filter(Boolean));
    const union = new Set([...firstSet, ...secondSet]);
    if (!union.size) return 0;
    let intersection = 0;
    firstSet.forEach((value) => {
      if (secondSet.has(value)) intersection += 1;
    });
    return intersection / union.size;
  }

  function groupWords(group) {
    return normalize(group).split(/[\s/-]+/).filter(Boolean);
  }

  function fragranceNotes(item) {
    return Object.values(item.notes || {}).flat();
  }

  function genderCompatible(sourceGender, candidateGender) {
    const source = normalize(sourceGender);
    const candidate = normalize(candidateGender);
    if (source === MALE) return candidate === MALE || candidate === UNISEX;
    if (source === FEMALE) return candidate === FEMALE || candidate === UNISEX;
    return candidate === UNISEX;
  }

  function scoreSimilarity(source, candidate) {
    const exactGroup = normalize(source.group) === normalize(candidate.group) ? 18 : 0;
    const groupShape = setJaccard(groupWords(source.group), groupWords(candidate.group)) * 16;
    const accords = weightedJaccard(
      vectorFromAccords(source.accords),
      vectorFromAccords(candidate.accords)
    ) * 36;
    const familyProfile = weightedJaccard(
      normalizeVector(source.familyScores),
      normalizeVector(candidate.familyScores)
    ) * 15;
    const groupFamilies = setJaccard(source.groupFamilies, candidate.groupFamilies) * 6;
    const notes = setJaccard(fragranceNotes(source), fragranceNotes(candidate)) * 7;
    const seasons = setJaccard(source.season, candidate.season) * 5;
    const occasions = weightedJaccard(
      normalizeVector(source.occasionScores),
      normalizeVector(candidate.occasionScores)
    ) * 5;
    const sameGender = normalize(source.gender) === normalize(candidate.gender) ? 4 : 0;
    const sameCategory = normalize(source.category) === normalize(candidate.category) ? 1 : 0;

    return exactGroup
      + groupShape
      + accords
      + familyProfile
      + groupFamilies
      + notes
      + seasons
      + occasions
      + sameGender
      + sameCategory;
  }

  function rankSimilar(source, items, limit = 4) {
    return items
      .filter((candidate) => (
        candidate.id !== source.id
        && genderCompatible(source.gender, candidate.gender)
      ))
      .map((candidate) => ({
        item: candidate,
        score: scoreSimilarity(source, candidate),
      }))
      .sort((first, second) => (
        second.score - first.score
        || first.item.id.localeCompare(second.item.id, "ru")
      ))
      .slice(0, Math.max(0, limit))
      .map((entry) => entry.item);
  }

  return Object.freeze({
    genderCompatible,
    rankSimilar,
    scoreSimilarity,
  });
});
