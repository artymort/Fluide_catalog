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

  const ACCORD_TRAITS = {
    "цветочный": ["floral"], "белые цветы": ["floral"], "розовый": ["floral"],
    "желтые цветы": ["floral"], "тубероза": ["floral"], "фиалковый": ["floral", "powdery"],
    "ирис": ["floral", "powdery"], "фруктовый": ["fruity"], "тропический": ["fruity"],
    "вишневый": ["fruity"], "кокосовый": ["fruity", "gourmand"], "цитрусовый": ["citrus", "fresh"],
    "древесный": ["woody"], "пачулиевый": ["woody"], "землистый": ["woody"],
    "мшистый": ["woody", "green"], "хвойный": ["woody", "green"], "сладкий": ["gourmand"],
    "ванильный": ["gourmand"], "карамельный": ["gourmand"], "какао": ["gourmand"],
    "ореховый": ["gourmand"], "кофейный": ["gourmand"], "шоколад": ["gourmand"],
    "медовый": ["gourmand"], "миндальный": ["gourmand"], "лактонный": ["gourmand"],
    "свежий": ["fresh"], "фужерный": ["fresh", "aromatic"], "зеленый": ["green", "fresh"],
    "акватический": ["fresh"], "морской": ["fresh", "mineral"], "озоновый": ["fresh", "mineral"],
    "лаванда": ["aromatic"], "травяной": ["green", "aromatic"], "соленый": ["mineral", "fresh"],
    "минеральный": ["mineral"], "мыльный": ["fresh"], "альдегидный": ["fresh"],
    "металлический": ["mineral"], "камфорный": ["aromatic"], "каннабис": ["green", "aromatic"],
    "свежий пряный": ["spicy"], "теплый пряный": ["spicy", "amber"],
    "мягкий пряный": ["spicy"], "амбровый": ["amber"], "мускусный": ["musky"],
    "животный": ["musky"], "бальзамический": ["amber"], "кожаный": ["leather"],
    "табачный": ["tobacco", "smoky"], "дымный": ["smoky"], "коричный": ["spicy", "gourmand"],
    "удовый": ["oud", "woody"], "пудровый": ["powdery"],
  };

  const FAMILY_KEYS = [
    "Цветочные", "Фруктовые", "Цитрусовые", "Древесные",
    "Сладкие", "Свежие", "Пряные и восточные",
  ];

  const NOTE_WEIGHTS = { top: 1.05, middle: 1.15, base: 1.3, main: 1.2 };
  const ROLE_CONTEXT = {
    base: { families: [], occasions: ["everyday"], seasons: ["spring", "autumn"] },
    composure: { families: ["Свежие", "Древесные", "Цитрусовые"], occasions: ["everyday"], seasons: ["spring", "autumn"] },
    reset: { families: ["Свежие", "Цитрусовые"], occasions: ["walk", "gym"], seasons: ["summer", "spring"] },
    attraction: { families: ["Цветочные", "Сладкие", "Пряные и восточные"], occasions: ["date", "evening"], seasons: ["autumn", "winter"] },
    accent: { families: ["Пряные и восточные", "Древесные", "Сладкие"], occasions: ["evening"], seasons: ["autumn", "winter"] },
    comfort: { families: ["Сладкие", "Древесные", "Цветочные"], occasions: ["everyday", "date"], seasons: ["autumn", "winter"] },
    vacation: { families: ["Цитрусовые", "Фруктовые", "Свежие"], occasions: ["walk"], seasons: ["summer"] },
    warmWeather: { families: ["Свежие", "Цитрусовые", "Цветочные"], occasions: ["everyday", "walk"], seasons: ["summer"] },
    coldWeather: { families: ["Сладкие", "Древесные", "Пряные и восточные"], occasions: ["evening"], seasons: ["winter"] },
    creative: { families: ["Пряные и восточные", "Древесные", "Цветочные"], occasions: ["evening", "walk"], seasons: ["spring", "autumn"] },
    maximumFreshness: { families: ["Свежие", "Цитрусовые"], occasions: ["gym", "walk"], seasons: ["summer"] },
    experiment: { families: ["Пряные и восточные", "Древесные", "Сладкие"], occasions: ["evening"], seasons: ["autumn", "winter"] },
  };

  const MOOD_CONTEXT = {
    confident: { families: ["Древесные", "Пряные и восточные"], occasions: ["everyday", "evening"] },
    calm: { families: ["Цветочные", "Древесные"], occasions: ["everyday"] },
    attractive: { families: ["Цветочные", "Сладкие", "Пряные и восточные"], occasions: ["date", "evening"] },
    free: { families: ["Свежие", "Цитрусовые", "Фруктовые"], occasions: ["walk"] },
    energetic: { families: ["Свежие", "Цитрусовые", "Фруктовые"], occasions: ["gym", "walk"] },
    soft: { families: ["Цветочные", "Сладкие"], occasions: ["date", "everyday"] },
    collected: { families: ["Древесные", "Свежие"], occasions: ["everyday"] },
    mysterious: { families: ["Пряные и восточные", "Древесные", "Сладкие"], occasions: ["evening"] },
    unusual: { families: ["Пряные и восточные", "Древесные"], occasions: ["evening", "walk"] },
    elegant: { families: ["Цветочные", "Древесные"], occasions: ["evening", "date"] },
    clean: { families: ["Свежие", "Цитрусовые"], occasions: ["gym", "walk", "everyday"] },
    bold: { families: ["Пряные и восточные", "Древесные"], occasions: ["evening"] },
  };

  const FRAGRANCE_PRICES = {
    "Люкс": { 30: 1990, 50: 2990 },
    "Суперлюкс": { 30: 2490, 50: 3490 },
    "Селектив": { 30: 3490, 50: 4990 },
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

  function noteTraitStrengths(item) {
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

  function accordTraitStrengths(item) {
    const weights = Object.fromEntries(Object.keys(TRAIT_KEYWORDS).map((trait) => [trait, []]));
    (item.accords || []).forEach((accord) => {
      const traits = ACCORD_TRAITS[normalizeText(accord.name)] || [];
      const weight = Math.max(0, Math.min(100, Number(accord.weight) || 0));
      traits.forEach((trait) => weights[trait].push(weight));
    });
    return Object.fromEntries(Object.entries(weights).map(([trait, values]) => {
      const ranked = [...values].sort((a, b) => b - a);
      const strength = (ranked[0] || 0) + (ranked[1] || 0) * .35 + (ranked[2] || 0) * .15;
      return [trait, Math.min(5, strength / 100 * 5)];
    }));
  }

  function traitStrengths(item) {
    const notes = noteTraitStrengths(item);
    if (!(item.accords || []).length) return notes;
    const accords = accordTraitStrengths(item);
    return Object.fromEntries(Object.keys(TRAIT_KEYWORDS).map((trait) => [
      trait,
      accords[trait] * .78 + notes[trait] * .22,
    ]));
  }

  function normalizedAccords(item) {
    return Object.fromEntries((item.accords || []).map((accord) => [
      normalizeText(accord.name),
      Math.max(0, Math.min(100, Number(accord.weight) || 0)) / 100,
    ]));
  }

  function normalizedFamilies(item) {
    return Object.fromEntries(FAMILY_KEYS.map((family) => [
      family,
      Math.max(0, Math.min(100, Number(item.familyScores?.[family]) || 0)) / 100,
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
      return {
        ...item,
        _wardrobeTraits: traits,
        _wardrobeProfile: profileFor(item, traits),
        _wardrobeAccords: normalizedAccords(item),
        _wardrobeFamilies: normalizedFamilies(item),
      };
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

  function vectorSimilarity(first, second, keys) {
    const dot = keys.reduce((sum, key) => sum + (Number(first[key]) || 0) * (Number(second[key]) || 0), 0);
    const firstLength = Math.sqrt(keys.reduce((sum, key) => sum + (Number(first[key]) || 0) ** 2, 0));
    const secondLength = Math.sqrt(keys.reduce((sum, key) => sum + (Number(second[key]) || 0) ** 2, 0));
    return firstLength && secondLength ? dot / (firstLength * secondLength) : 0;
  }

  function cosineSimilarity(first, second) {
    return vectorSimilarity(first, second, Object.keys(TRAIT_KEYWORDS));
  }

  function accordSimilarity(first, second) {
    const keys = [...new Set([
      ...Object.keys(first._wardrobeAccords || {}),
      ...Object.keys(second._wardrobeAccords || {}),
    ])];
    return keys.length ? vectorSimilarity(first._wardrobeAccords, second._wardrobeAccords, keys) : 0;
  }

  function familySimilarity(first, second) {
    return vectorSimilarity(first._wardrobeFamilies, second._wardrobeFamilies, FAMILY_KEYS);
  }

  function noteSimilarity(first, second) {
    const a = new Set(noteEntries(first).map((entry) => entry.text));
    const b = new Set(noteEntries(second).map((entry) => entry.text));
    const union = new Set([...a, ...b]);
    if (!union.size) return 0;
    return [...a].filter((note) => b.has(note)).length / union.size;
  }

  function favoriteSimilarity(item, favorite) {
    const components = [
      [(Object.keys(item._wardrobeAccords).length && Object.keys(favorite._wardrobeAccords).length) ? .5 : 0, accordSimilarity(item, favorite)],
      [.25, familySimilarity(item, favorite)],
      [.15, profileSimilarity(item._wardrobeProfile, favorite._wardrobeProfile)],
      [.1, noteSimilarity(item, favorite)],
    ];
    const totalWeight = components.reduce((sum, [weight]) => sum + weight, 0);
    return totalWeight
      ? components.reduce((sum, [weight, value]) => sum + weight * value, 0) / totalWeight
      : 0;
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

  function preferenceStrength(scores, requestedValues) {
    const values = requestedValues.map((key) => Number(scores?.[key]) || 0);
    if (!values.length) return 0;
    const best = Math.max(...values);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return (best * .75 + average * .25) / 100;
  }

  function moodScore(item, moods, moodTargets) {
    const profileWeights = [18, 5, 2.5];
    const dataWeights = [10, 3, 1.5];
    return moods.reduce((score, mood, index) => {
      const target = moodTargets[mood];
      const context = MOOD_CONTEXT[mood];
      const profileScore = target
        ? profileSimilarity(item._wardrobeProfile, target) * profileWeights[index]
        : 0;
      const familyScore = context ? preferenceStrength(item.familyScores || {}, context.families) : 0;
      const occasionScore = context ? preferenceStrength(item.occasionScores || {}, context.occasions) : 0;
      return score + profileScore + (familyScore * .62 + occasionScore * .38) * dataWeights[index];
    }, 0);
  }

  function contextScore(item, roleId) {
    const context = ROLE_CONTEXT[roleId];
    if (!context) return 0;
    const familyFit = preferenceStrength(item.familyScores || {}, context.families);
    const occasionFit = preferenceStrength(item.occasionScores || {}, context.occasions);
    const seasonHits = context.seasons.filter((value) => (item.season || []).includes(value)).length;
    const seasonFit = seasonHits / Math.max(1, context.seasons.length);
    return familyFit * 10 + occasionFit * 12 + seasonFit * 6;
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
      ? (Math.max(...favoriteScores) * .7 + favoriteScores.reduce((sum, value) => sum + value, 0) / favoriteScores.length * .3) * 24
      : 0;
    const diversityPenalty = selectedItems.reduce((penalty, selected) => {
      const accordMatch = accordSimilarity(item, selected);
      const familyMatch = familySimilarity(item, selected);
      const closeProfile = profileSimilarity(item._wardrobeProfile, selected._wardrobeProfile);
      return penalty
        + Math.max(0, accordMatch - .68) * 13
        + Math.max(0, familyMatch - .76) * 7
        + Math.max(0, closeProfile - .8) * 5;
    }, 0);
    return roleScore
      + tasteScore
      + moodScore(item, state.moods, moodTargets)
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

  function fragrancePrice(item, volume) {
    return FRAGRANCE_PRICES[item.category]?.[Number(volume)] || 0;
  }

  function wardrobePrice(items, volumes) {
    return items.reduce((total, item) => total + fragrancePrice(item, volumes[item.id] || 30), 0);
  }

  function volumeSummary(items, volumes) {
    const counts = items.reduce((result, item) => {
      const volume = Number(volumes[item.id]) === 50 ? 50 : 30;
      result[volume] = (result[volume] || 0) + 1;
      return result;
    }, {});
    return [30, 50]
      .filter((volume) => counts[volume])
      .map((volume) => `${counts[volume]} × ${volume} мл`)
      .join(" · ");
  }

  const api = {
    buildRecommendations,
    candidateScore,
    accordSimilarity,
    familySimilarity,
    favoriteSimilarity,
    fragrancePrice,
    genderMatches,
    prepareItems,
    profileDistance,
    profileFor,
    traitStrengths,
    volumeSummary,
    wardrobePrice,
  };

  globalScope.FluideWardrobeEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
