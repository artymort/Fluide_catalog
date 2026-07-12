(function initWardrobeEngine(globalScope) {
  "use strict";

  const TRAIT_KEYWORDS = {
    floral: ["роз", "жасмин", "пион", "ирис", "фиал", "ландыш", "тубероз", "магнол", "орхиде", "лаванд", "нероли", "гардени", "османт", "фрез", "геран", "липа", "мимоз", "цвет"],
    fruity: ["яблок", "груш", "персик", "абрикос", "слив", "виш", "череш", "ананас", "манго", "маракуй", "ягод", "смород", "малин", "клубник", "гранат", "дын", "арбуз", "инжир", "личи", "кокос"],
    citrus: ["бергамот", "лимон", "мандарин", "апельсин", "грейпфрут", "лайм", "цитрус", "юдзу", "помело"],
    woody: ["кедр", "сандал", "древес", "ветивер", "пачули", "мох", "кипарис", "гуаяк", "кашмеран", "аkigalawood", "акигалавуд"],
    gourmand: ["ванил", "карамел", "шоколад", "какао", "мед", "мёд", "пралине", "сахар", "зефир", "тонка", "кофе", "миндаль", "печенье", "молоко"],
    fresh: ["морск", "водн", "озон", "акват", "свеж", "лед", "лёд", "калон", "альдегид", "соль"],
    green: ["зелен", "зелён", "мят", "чай", "базилик", "шалфей", "трава", "листь", "огур", "конопл", "каннабис"],
    aromatic: ["лаванд", "шалфей", "розмарин", "базилик", "можжевельник", "полын", "мят", "чай", "геран"],
    spicy: ["перец", "имбир", "кардамон", "шафран", "гвоздик", "мускат", "корица", "анис"],
    amber: ["амбр", "лабданум", "бензоин", "смол", "мирр"],
    smoky: ["дым", "ладан", "берез", "берёз", "деготь", "дёготь", "порох", "абсент"],
    powdery: ["пудр", "ирис", "фиал", "гелиотроп", "мускус"],
    leather: ["кож", "замш"],
    tobacco: ["табак", "сигар"],
    oud: ["уд", "агар"],
    musky: ["мускус", "амброксан", "амбретт"],
    mineral: ["минерал", "металл", "чернил", "озон", "соль", "камень", "порох"],
  };

  const NOTE_WEIGHTS = { top: 1.05, middle: 1.15, base: 1.3, main: 1.2 };
  const ROLE_CONTEXT = {
    base: { occasions: ["everyday"], seasons: ["spring", "autumn"] },
    composure: { occasions: ["everyday"], seasons: ["spring", "autumn"] },
    reset: { occasions: ["walk", "gym"], seasons: ["summer", "spring"] },
    attraction: { occasions: ["date", "evening"], seasons: ["autumn", "winter"] },
    accent: { occasions: ["evening"], seasons: ["autumn", "winter"] },
    comfort: { occasions: ["everyday", "date"], seasons: ["autumn", "winter"] },
    vacation: { occasions: ["walk"], seasons: ["summer"] },
    warmWeather: { occasions: ["everyday", "walk"], seasons: ["summer"] },
    coldWeather: { occasions: ["evening"], seasons: ["winter"] },
    creative: { occasions: ["evening", "walk"], seasons: ["spring", "autumn"] },
    maximumFreshness: { occasions: ["gym", "walk"], seasons: ["summer"] },
    experiment: { occasions: ["evening"], seasons: ["autumn", "winter"] },
  };

  function clamp(value, min = 1, max = 5) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replaceAll("ё", "е").replace(/[^a-zа-я0-9]+/gi, " ").trim();
  }

  function noteEntries(item) {
    return Object.entries(item.notes || {}).flatMap(([level, notes]) => (
      (notes || []).map((note) => ({ text: normalizeText(note), weight: NOTE_WEIGHTS[level] || 1 }))
    ));
  }

  function traitStrengths(item) {
    const raw = Object.fromEntries(Object.keys(TRAIT_KEYWORDS).map((trait) => [trait, 0]));
    noteEntries(item).forEach(({ text, weight }) => {
      Object.entries(TRAIT_KEYWORDS).forEach(([trait, keywords]) => {
        if (keywords.some((keyword) => text.includes(normalizeText(keyword)))) raw[trait] += weight;
      });
    });
    return Object.fromEntries(Object.entries(raw).map(([trait, value]) => [
      trait,
      Math.min(5, Math.sqrt(value) * 1.7),
    ]));
  }

  function profileFor(item, traits = traitStrengths(item)) {
    const oil = Number(item.oilPercent) || 25;
    const selective = item.category === "Селектив" ? 0.45 : item.category === "Суперлюкс" ? 0.25 : 0;
    return {
      freshness: clamp(1.35 + traits.fresh * .55 + traits.citrus * .38 + traits.green * .26 + traits.aromatic * .18 - traits.gourmand * .16 - traits.smoky * .12),
      sweetness: clamp(1.25 + traits.gourmand * .55 + traits.fruity * .24 + traits.floral * .12 + traits.amber * .12 - traits.citrus * .1),
      warmth: clamp(1.35 + traits.amber * .35 + traits.spicy * .28 + traits.woody * .2 + traits.tobacco * .24 + traits.oud * .26 + traits.gourmand * .15 - traits.fresh * .22),
      intensity: clamp(1.35 + (oil - 20) / 5 + traits.amber * .1 + traits.smoky * .12 + traits.oud * .12 + traits.tobacco * .1),
      formality: clamp(1.75 + selective + traits.woody * .18 + traits.powdery * .15 + traits.leather * .14 + traits.floral * .08 + ((item.occasion || []).includes("evening") ? .28 : 0) - ((item.occasion || []).includes("gym") ? .35 : 0)),
      unusual: clamp(1.35 + selective + traits.mineral * .42 + traits.smoky * .28 + traits.oud * .25 + traits.leather * .17 + traits.tobacco * .16 + traits.green * .08),
    };
  }

  function prepareItems(items) {
    return items.map((item) => {
      const traits = traitStrengths(item);
      return { ...item, _wardrobeTraits: traits, _wardrobeProfile: profileFor(item, traits) };
    });
  }

  function profileDistance(profile, target) {
    const entries = Object.entries(target || {});
    if (!entries.length) return 0;
    return entries.reduce((sum, [key, value]) => sum + Math.abs((profile[key] || 1) - value), 0) / entries.length;
  }

  function profileSimilarity(first, second) {
    return clamp(1 - profileDistance(first, second) / 4, 0, 1);
  }

  function cosineSimilarity(first, second) {
    const keys = Object.keys(TRAIT_KEYWORDS);
    const dot = keys.reduce((sum, key) => sum + first[key] * second[key], 0);
    const firstLength = Math.sqrt(keys.reduce((sum, key) => sum + first[key] ** 2, 0));
    const secondLength = Math.sqrt(keys.reduce((sum, key) => sum + second[key] ** 2, 0));
    return firstLength && secondLength ? dot / (firstLength * secondLength) : 0;
  }

  function noteSimilarity(first, second) {
    const a = new Set(noteEntries(first).map((entry) => entry.text));
    const b = new Set(noteEntries(second).map((entry) => entry.text));
    const union = new Set([...a, ...b]);
    if (!union.size) return 0;
    return [...a].filter((note) => b.has(note)).length / union.size;
  }

  function favoriteSimilarity(item, favorite) {
    return cosineSimilarity(item._wardrobeTraits, favorite._wardrobeTraits) * .5
      + profileSimilarity(item._wardrobeProfile, favorite._wardrobeProfile) * .35
      + noteSimilarity(item, favorite) * .15;
  }

  function genderMatches(itemGender, selectedGender) {
    if (!selectedGender) return false;
    if (selectedGender === "female") return itemGender === "женский" || itemGender === "унисекс";
    if (selectedGender === "male") return itemGender === "мужской" || itemGender === "унисекс";
    return itemGender === "унисекс";
  }

  function dislikePenalty(item, dislikes) {
    const profile = item._wardrobeProfile;
    const traits = item._wardrobeTraits;
    return dislikes.reduce((penalty, dislike) => {
      if (dislike === "tooSweet") return penalty + Math.max(0, profile.sweetness - 2.25) * 5 + traits.gourmand * 1.2;
      if (dislike === "heavy") return penalty + Math.max(0, profile.intensity + profile.warmth - 5.5) * 4;
      if (dislike === "sharp") return penalty + Math.max(0, profile.intensity - 3) * 3 + traits.spicy * 1.7 + traits.mineral * .8;
      if (dislike === "powdery") return penalty + traits.powdery * 3.2;
      if (dislike === "tooFresh") return penalty + Math.max(0, profile.freshness - 2.8) * 5 + traits.fresh;
      if (dislike === "smoky") return penalty + traits.smoky * 3.5 + traits.tobacco * 1.4;
      if (dislike === "loud") return penalty + Math.max(0, profile.intensity - 2.7) * 5;
      if (dislike === "floral") return penalty + traits.floral * 3;
      return penalty;
    }, 0);
  }

  function moodScore(profile, moods, moodTargets) {
    const weights = [18, 5, 2.5];
    return moods.reduce((score, mood, index) => {
      const target = moodTargets[mood];
      return target ? score + profileSimilarity(profile, target) * weights[index] : score;
    }, 0);
  }

  function contextScore(item, roleId) {
    const context = ROLE_CONTEXT[roleId];
    if (!context) return 0;
    const occasionHits = context.occasions.filter((value) => (item.occasion || []).includes(value)).length;
    const seasonHits = context.seasons.filter((value) => (item.season || []).includes(value)).length;
    return Math.min(4, occasionHits * 2) + Math.min(3, seasonHits * 1.5);
  }

  function stableTieBreak(item, roleId, state) {
    const source = `${state.gender}|${state.favorites.join(",")}|${state.dislikes.join(",")}|${state.moods.join(",")}|${roleId}|${item.id}`;
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 1000) / 4000;
  }

  function candidateScore(item, roleId, selectedItems, state, roleDefinitions, moodTargets, favoriteItems) {
    const role = roleDefinitions[roleId];
    const roleScore = profileSimilarity(item._wardrobeProfile, role.target) * 24;
    const favoriteScores = favoriteItems.map((favorite) => favoriteSimilarity(item, favorite));
    const tasteScore = favoriteScores.length
      ? (Math.max(...favoriteScores) * .7 + favoriteScores.reduce((sum, value) => sum + value, 0) / favoriteScores.length * .3) * 22
      : 0;
    const diversityPenalty = selectedItems.reduce((penalty, selected) => {
      const traitSimilarity = cosineSimilarity(item._wardrobeTraits, selected._wardrobeTraits);
      const closeProfile = profileSimilarity(item._wardrobeProfile, selected._wardrobeProfile);
      return penalty + Math.max(0, traitSimilarity - .62) * 9 + Math.max(0, closeProfile - .72) * 7;
    }, 0);
    return roleScore
      + tasteScore
      + moodScore(item._wardrobeProfile, state.moods, moodTargets)
      + contextScore(item, roleId)
      - dislikePenalty(item, state.dislikes)
      - diversityPenalty
      + stableTieBreak(item, roleId, state);
  }

  function buildRecommendations(items, state, roleDefinitions, moodTargets) {
    const favoriteIds = new Set(state.favorites || []);
    const favoriteItems = (state.favorites || []).map((id) => items.find((item) => item.id === id)).filter(Boolean);
    const eligible = items.filter((item) => genderMatches(item.gender, state.gender) && !favoriteIds.has(item.id));
    const selected = [];
    state.roles.forEach((roleId) => {
      const pool = eligible.filter((item) => !selected.some((chosen) => chosen.id === item.id));
      pool.sort((a, b) => candidateScore(b, roleId, selected, state, roleDefinitions, moodTargets, favoriteItems)
        - candidateScore(a, roleId, selected, state, roleDefinitions, moodTargets, favoriteItems));
      if (pool[0]) selected.push(pool[0]);
    });
    return selected;
  }

  const api = {
    buildRecommendations,
    candidateScore,
    favoriteSimilarity,
    genderMatches,
    prepareItems,
    profileDistance,
    profileFor,
    traitStrengths,
  };

  globalScope.FluideWardrobeEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
