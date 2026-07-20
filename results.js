const grid = document.querySelector("#products-grid");
const countLabel = document.querySelector("#result-count");
const searchInput = document.querySelector("#search");
const familyFilter = document.querySelector("#family-filter");
const sortSelect = document.querySelector("#sort-products");
const resetButton = document.querySelector("#reset-filters");
const pageTitle = document.querySelector("#results-title");
const backLink = document.querySelector("#results-back");
const recommendedSort = document.querySelector("#recommended-sort");
const productTypeFilter = document.querySelector("#product-type-filter");
const sectionButtons = [...document.querySelectorAll(".catalog-section")];
const sectionFilterGroups = [...document.querySelectorAll("[data-filter-section]")];
const selectionEngine = window.FluideSelectionEngine;
const recommendationParams = new URLSearchParams(window.location.search);
const isAllMode = document.body.dataset.catalogMode === "all" || recommendationParams.get("mode") === "all";
const usesCatalogSections = sectionButtons.length > 0;
const catalogPage = isAllMode ? "all.html" : "results.html";
const catalogStateKeys = ["catalogState", "q", "type", "section", "subtype", "catalogGender", "catalogFamily", "occasion", "season", "filterFamily", "sort", "filterGender", "filterCategory", "filterConcentration", "filterIntensity", "gender", "family"];
const catalogSections = {
  perfume: ["fragrance", "solid-perfume"],
  care: ["body-cream", "hair-spray", "hand-soap"],
  home: ["home-fragrance", "candle", "diffuser"],
  car: ["car-fragrance"],
};

let fragrances = [];
let activeSection = catalogSections[recommendationParams.get("section")] ? recommendationParams.get("section") : "perfume";
const fragrancePrices = {
  "Люкс": { 30: 1990, 50: 2990 },
  "Суперлюкс": { 30: 2490, 50: 3490 },
  "Селектив": { 30: 3490, 50: 4990 },
};

function configurePageMode() {
  if (!isAllMode) return;
  document.title = "FLUIDE — каталог";
  pageTitle.textContent = "Каталог";
  backLink.href = "index.html";
  backLink.setAttribute("aria-label", "Вернуться в главное меню");
  recommendedSort?.remove();
}

function intensityMatches(item, intensity) {
  if (intensity === "light") return item.oilPercent <= 22;
  if (intensity === "balanced") return item.oilPercent >= 25 && item.oilPercent <= 28;
  return item.oilPercent >= 30;
}

function genderValuesForSelection(gender) {
  return selectionEngine.genderValuesForSelection(gender);
}

function recommendationValues(key) {
  return recommendationParams.getAll(key).filter(Boolean);
}

function metadataMatches(item, key, selectedValues) {
  if (!selectedValues.length) return true;
  const itemValues = Array.isArray(item[key]) ? item[key] : [];
  if (!itemValues.length) return true;
  return selectedValues.some((value) => itemValues.includes(value));
}

function selectedValues(name) {
  return [...document.querySelectorAll(`.filters input[name="${name}"]:checked`)].map((input) => input.value);
}

function setRepeatedParam(params, key, values) {
  params.delete(key);
  values.forEach((value) => params.append(key, value));
}

function saveCatalogState() {
  const params = new URLSearchParams(window.location.search);
  params.set("catalogState", "1");
  if (usesCatalogSections) {
    ["type", "filterFamily", "sort", "filterGender", "filterCategory", "filterConcentration", "filterIntensity", "gender", "family"].forEach((key) => params.delete(key));
    params.set("section", activeSection);
    const query = searchInput?.value.trim() || "";
    if (query) params.set("q", query);
    else params.delete("q");
    ["subtype", "catalogGender", "catalogFamily", "occasion", "season"].forEach((key) => {
      setRepeatedParam(params, key, selectedValues(key));
    });
    history.replaceState(null, "", `${catalogPage}?${params.toString()}`);
    return;
  }
  const scalarState = {
    q: searchInput?.value.trim() || "",
    type: productTypeFilter?.value || "",
    filterFamily: familyFilter?.value || "",
    sort: sortSelect?.value || "recommended",
  };
  Object.entries(scalarState).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  setRepeatedParam(params, "filterGender", selectedValues("gender"));
  setRepeatedParam(params, "filterCategory", selectedValues("category"));
  setRepeatedParam(params, "filterConcentration", selectedValues("concentration"));
  setRepeatedParam(params, "filterIntensity", selectedValues("intensity"));
  const query = params.toString();
  history.replaceState(null, "", `${catalogPage}${query ? `?${query}` : ""}`);
}

function recommendationScore(item) {
  let score = 0;
  const families = recommendationValues("family");
  const occasions = recommendationValues("occasion");
  const seasons = recommendationValues("season");
  const concentration = recommendationParams.get("concentration");
  if (families.some((family) => item.families.includes(family))) score += 4;
  if (metadataMatches(item, "occasion", occasions) && occasions.length) score += 2;
  if (metadataMatches(item, "season", seasons) && seasons.length) score += 2;
  if (concentration && item.concentration === concentration) score += 1;
  return score;
}

function cardMarkup(item) {
  if (item.kind === "product") {
    const returnUrl = `${catalogPage}${window.location.search}`;
    const details = [item.typeLabel, item.volume].filter(Boolean);
    return `
      <a class="product-card" href="product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent(returnUrl)}">
        <div class="product-card__visual"><span class="product-card__meta">FLUIDE Atelier</span><span class="product-card__number">${item.id.slice(-2)}</span></div>
        <div class="product-card__body"><h2>${item.title}</h2><p class="product-card__original">Продукция FLUIDE Atelier</p>
          <div class="product-card__meta-lines">
            <div class="product-card__tags">${details.map((value) => `<span>${value}</span>`).join("")}</div>
            <p class="product-card__price">${item.price.toLocaleString("ru-RU")} ₽</p>
          </div>
        </div>
      </a>`;
  }
  const group = item.group || item.families[0] || "Аромат";
  const price = fragrancePrices[item.category]?.[30];
  const returnUrl = `${catalogPage}${window.location.search}`;
  const cardImage = item.thumbnail || item.image;
  const visual = cardImage
    ? `<img class="product-card__image" src="${cardImage}" alt="Флакон ${item.title}" loading="lazy" decoding="async" />
        <span class="product-card__number product-card__number--with-image">${item.id}</span>`
    : `<span class="product-card__number">${item.id}</span>`;
  return `
    <a class="product-card" href="product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent(returnUrl)}">
      <div class="product-card__visual">
        <span class="product-card__meta">FLUIDE Atelier</span>
        ${visual}
      </div>
      <div class="product-card__body">
        <h2>${item.title}</h2>
        <p class="product-card__original">${item.original}</p>
        <div class="product-card__meta-lines">
          <div class="product-card__tags">
            <span>${item.gender}</span><span>${item.category}</span><span>${group}</span>
          </div>
          ${price ? `<p class="product-card__price">от ${price.toLocaleString("ru-RU")} ₽</p>` : ""}
        </div>
      </div>
    </a>`;
}

function applyFilters() {
  saveCatalogState();
  const query = searchInput?.value.trim().toLowerCase() || "";
  if (usesCatalogSections) {
    const allowedTypes = catalogSections[activeSection];
    const subtypes = selectedValues("subtype");
    const catalogGender = selectedValues("catalogGender")[0] || "";
    const catalogFamilies = selectedValues("catalogFamily");
    const occasions = selectedValues("occasion");
    const seasons = selectedValues("season");
    const fragranceMetadataActive = Boolean(catalogGender || catalogFamilies.length || occasions.length || seasons.length);
    if (!isAllMode && activeSection === "perfume") {
      const candidates = fragrances.filter((item) => {
        const haystack = `${item.id} ${item.title} ${item.original || ""}`.toLowerCase();
        if (item.kind !== "fragrance") return false;
        if (subtypes.length && !subtypes.includes(item.productType)) return false;
        return !query || haystack.includes(query);
      });
      const ranked = selectionEngine.rankRecommendations(candidates, {
        gender: catalogGender,
        families: catalogFamilies,
        occasions,
        seasons,
      }, 6);
      countLabel.textContent = `Подходит ароматов: ${ranked.items.length}`;
      grid.innerHTML = ranked.items.length
        ? ranked.items.map(cardMarkup).join("")
        : '<p class="products-empty">По выбранным параметрам ароматов не найдено. Измените фильтры.</p>';
      return;
    }
    const filtered = fragrances.filter((item) => {
      const haystack = `${item.id} ${item.title} ${item.original || ""} ${item.typeLabel || ""}`.toLowerCase();
      if (!allowedTypes.includes(item.productType)) return false;
      if (subtypes.length && !subtypes.includes(item.productType)) return false;
      if (query && !haystack.includes(query)) return false;
      if (item.kind === "product") return item.productType === "solid-perfume" ? !fragranceMetadataActive : true;
      if (catalogGender && !genderValuesForSelection(catalogGender).includes(item.gender)) return false;
      return (!catalogFamilies.length || catalogFamilies.some((family) => item.families.includes(family)))
        && metadataMatches(item, "occasion", occasions)
        && metadataMatches(item, "season", seasons);
    });
    filtered.sort((a, b) => (a.kind === "fragrance" ? 0 : 1) - (b.kind === "fragrance" ? 0 : 1)
      || a.id.localeCompare(b.id, "ru", { numeric: true }));
    countLabel.textContent = `Найдено: ${filtered.length}`;
    grid.innerHTML = filtered.length
      ? filtered.map(cardMarkup).join("")
      : '<p class="products-empty">По выбранным параметрам товаров не найдено. Измените фильтры.</p>';
    return;
  }
  const genders = selectedValues("gender");
  const categories = selectedValues("category");
  const concentrations = selectedValues("concentration");
  const intensities = selectedValues("intensity");
  const family = familyFilter?.value || "";
  const productType = productTypeFilter?.value || "";
  const hasSavedState = recommendationParams.get("catalogState") === "1";
  const selectionGenders = !isAllMode && !hasSavedState ? genderValuesForSelection(recommendationParams.get("gender")) : [];
  const selectionFamilies = !isAllMode ? recommendationValues("family") : [];
  const selectionOccasions = !isAllMode ? recommendationValues("occasion") : [];
  const selectionSeasons = !isAllMode ? recommendationValues("season") : [];
  const hasFragranceFilters = genders.length || categories.length || concentrations.length || intensities.length || family;
  const filtered = fragrances.filter((item) => {
    const haystack = `${item.id} ${item.title} ${item.original || ""} ${item.typeLabel || ""}`.toLowerCase();
    if (productType && item.productType !== productType) return false;
    if (item.kind === "product") return !hasFragranceFilters && (!query || haystack.includes(query));
    return (!genders.length || genders.includes(item.gender))
      && (!selectionGenders.length || selectionGenders.includes(item.gender))
      && (!categories.length || categories.includes(item.category))
      && (!concentrations.length || concentrations.includes(item.concentration))
      && (!family || item.families.includes(family))
      && (!selectionFamilies.length || selectionFamilies.some((selectedFamily) => item.families.includes(selectedFamily)))
      && metadataMatches(item, "occasion", selectionOccasions)
      && metadataMatches(item, "season", selectionSeasons)
      && (!query || haystack.includes(query))
      && (!intensities.length || intensities.some((intensity) => intensityMatches(item, intensity)));
  });

  filtered.sort((a, b) => {
    if (sortSelect?.value === "recommended") {
      return recommendationScore(b) - recommendationScore(a)
        || a.id.localeCompare(b.id, "ru", { numeric: true });
    }
    if (sortSelect?.value === "name") return a.title.localeCompare(b.title, "ru");
    if (sortSelect?.value === "oil-desc") return (b.oilPercent || 0) - (a.oilPercent || 0);
    return (a.kind === "fragrance" ? 0 : 1) - (b.kind === "fragrance" ? 0 : 1)
      || a.id.localeCompare(b.id, "ru", { numeric: true });
  });

  countLabel.textContent = `Найдено: ${filtered.length}`;
  grid.innerHTML = filtered.length
    ? filtered.map(cardMarkup).join("")
    : '<p class="products-empty">По выбранным параметрам ароматов не найдено. Измените фильтры.</p>';
}

function applyQueryDefaults() {
  const params = new URLSearchParams(window.location.search);
  if (usesCatalogSections) {
    activeSection = catalogSections[params.get("section")] ? params.get("section") : "perfume";
    sectionButtons.forEach((button) => {
      const selected = button.dataset.section === activeSection;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    sectionFilterGroups.forEach((group) => { group.hidden = group.dataset.filterSection !== activeSection; });
    const hasSavedState = params.get("catalogState") === "1";
    const initialValues = {
      subtype: params.getAll("subtype"),
      catalogGender: params.getAll("catalogGender"),
      catalogFamily: params.getAll("catalogFamily"),
      occasion: params.getAll("occasion"),
      season: params.getAll("season"),
    };
    if (!hasSavedState && !isAllMode) {
      if (!initialValues.catalogGender.length && params.get("gender")) {
        initialValues.catalogGender = [params.get("gender")];
      }
      if (!initialValues.catalogFamily.length) initialValues.catalogFamily = params.getAll("family");
    }
    Object.entries(initialValues).forEach(([name, values]) => {
      document.querySelectorAll(`.filters input[name="${name}"]`).forEach((input) => {
        input.checked = values.includes(input.value);
      });
    });
    if (searchInput) searchInput.value = params.get("q") || "";
    return;
  }
  const hasSavedState = params.get("catalogState") === "1";
  const gender = params.get("gender");
  const families = params.getAll("family");
  const selectionGenders = genderValuesForSelection(gender);
  const savedFilters = {
    gender: params.getAll("filterGender"),
    category: params.getAll("filterCategory"),
    concentration: params.getAll("filterConcentration"),
    intensity: params.getAll("filterIntensity"),
  };
  document.querySelectorAll('.filters input[type="checkbox"]').forEach((input) => {
    const savedValues = savedFilters[input.name] || [];
    if (savedValues.includes(input.value) || (!hasSavedState && input.name === "gender" && selectionGenders.includes(input.value))) {
      input.checked = true;
    }
  });
  if (familyFilter) familyFilter.value = params.get("filterFamily") || (!hasSavedState && families.length === 1 ? families[0] : "") || "";
  if (searchInput) searchInput.value = params.get("q") || "";
  if (productTypeFilter) productTypeFilter.value = params.get("type") || "";
  if (params.get("sort") && sortSelect) sortSelect.value = params.get("sort");
}

document.querySelectorAll('.filters input').forEach((input) => input.addEventListener("change", applyFilters));
[searchInput, familyFilter, sortSelect, productTypeFilter].filter(Boolean)
  .forEach((control) => control.addEventListener("input", applyFilters));

sectionButtons.forEach((button) => button.addEventListener("click", () => {
  activeSection = button.dataset.section;
  document.querySelectorAll(".filters input").forEach((input) => { input.checked = false; });
  sectionButtons.forEach((entry) => {
    const selected = entry === button;
    entry.classList.toggle("is-active", selected);
    entry.setAttribute("aria-pressed", String(selected));
  });
  sectionFilterGroups.forEach((group) => { group.hidden = group.dataset.filterSection !== activeSection; });
  applyFilters();
}));

resetButton.addEventListener("click", () => {
  document.querySelectorAll(".filters input").forEach((input) => { input.checked = false; });
  if (familyFilter) familyFilter.value = "";
  if (productTypeFilter) productTypeFilter.value = "";
  if (searchInput) searchInput.value = "";
  [...recommendationParams.keys()].forEach((key) => {
    if (key !== "mode") recommendationParams.delete(key);
  });
  catalogStateKeys.forEach((key) => recommendationParams.delete(key));
  history.replaceState(null, "", usesCatalogSections
    ? `${catalogPage}?${isAllMode ? "" : "mode=selection&"}section=${activeSection}`
    : "results.html?mode=selection");
  applyFilters();
});

configurePageMode();

const requests = [fetch("./fragrances.json?v=2").then((response) => {
  if (!response.ok) throw new Error("Не удалось загрузить каталог");
  return response.json();
})];
if (usesCatalogSections) requests.push(fetch("./products.json").then((response) => response.json()));

Promise.all(requests)
  .then(([fragranceData, productData = []]) => {
    fragrances = [
      ...fragranceData.map((item) => ({ ...item, kind: "fragrance", productType: "fragrance" })),
      ...productData,
    ];
    applyQueryDefaults();
    applyFilters();
  })
  .catch(() => {
    countLabel.textContent = "Ошибка загрузки каталога";
    grid.innerHTML = '<p class="products-empty">Перезапустите приложение при подключённом интернете.</p>';
  });
