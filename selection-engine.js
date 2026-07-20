(function initializeSelectionEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FluideSelectionEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSelectionEngine() {
  const FAMILY_WEIGHT = 6;
  const GROUP_FAMILY_WEIGHT = 12;
  const OCCASION_WEIGHT = 8;
  const SEASON_WEIGHT = 10;

  function values(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }

  function intersection(left, right) {
    const allowed = new Set(values(right));
    return values(left).filter((value) => allowed.has(value));
  }

  function genderValuesForSelection(gender) {
    if (gender === "мужской") return ["мужской", "унисекс"];
    if (gender === "женский") return ["женский", "унисекс"];
    if (gender === "унисекс") return ["унисекс"];
    return [];
  }

  function genderMatches(itemGender, selectedGender) {
    const allowed = genderValuesForSelection(selectedGender);
    return !allowed.length || allowed.includes(itemGender);
  }

  function matchesAny(itemValues, selectedValues) {
    const selected = values(selectedValues);
    return !selected.length || intersection(itemValues, selected).length > 0;
  }

  function isEligible(item, criteria) {
    return genderMatches(item.gender, criteria.gender)
      && matchesAny(item.families, criteria.families)
      && matchesAny(item.occasion, criteria.occasions)
      && matchesAny(item.season, criteria.seasons);
  }

  function scoreItem(item, criteria) {
    let score = 0;
    const selectedFamilies = values(criteria.families);
    const selectedOccasions = values(criteria.occasions);
    const selectedSeasons = values(criteria.seasons);
    const groupMatches = intersection(item.groupFamilies, selectedFamilies);
    const familyMatches = intersection(item.families, selectedFamilies)
      .filter((family) => !groupMatches.includes(family));
    const occasionMatches = intersection(item.occasion, selectedOccasions);
    const seasonMatches = intersection(item.season, selectedSeasons);

    if (criteria.gender && genderMatches(item.gender, criteria.gender)) score += 20;
    score += groupMatches.length * GROUP_FAMILY_WEIGHT;
    score += familyMatches.length * FAMILY_WEIGHT;
    score += occasionMatches.length * OCCASION_WEIGHT;
    score += seasonMatches.length * SEASON_WEIGHT;

    if (groupMatches.length) score += Math.max(0, 4 - values(item.groupFamilies).length);
    if (seasonMatches.length) score += Math.max(0, 4 - values(item.season).length) * 2;
    if (occasionMatches.length) score += Math.max(0, 5 - values(item.occasion).length);
    return score;
  }

  function rankRecommendations(items, criteria, limit = 6) {
    const eligible = items.filter((item) => isEligible(item, criteria));
    const ranked = eligible
      .map((item) => ({ item, score: scoreItem(item, criteria) }))
      .sort((left, right) => right.score - left.score
        || left.item.id.localeCompare(right.item.id, "ru", { numeric: true }));
    return {
      total: eligible.length,
      items: ranked.slice(0, Math.max(0, limit)).map((entry) => entry.item),
    };
  }

  return {
    genderValuesForSelection,
    genderMatches,
    isEligible,
    scoreItem,
    rankRecommendations,
  };
});
