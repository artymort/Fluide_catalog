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
const checkboxFilters = [...document.querySelectorAll('.filters input[type="checkbox"]')];
const recommendationParams = new URLSearchParams(window.location.search);
const isAllMode = document.body.dataset.catalogMode === "all" || recommendationParams.get("mode") === "all";
const catalogPage = isAllMode ? "all.html" : "results.html";
const catalogStateKeys = ["catalogState", "q", "type", "filterFamily", "sort", "filterGender", "filterCategory", "filterConcentration", "filterIntensity"];

let fragrances = [];
const fragrancePrices = {
  "Люкс": { 30: 1990, 50: 2990 },
  "Суперлюкс": { 30: 2490, 50: 3490 },
  "Селектив": { 30: 3490, 50: 4990 },
};

function configurePageMode() {
  if (!isAllMode) return;
  document.title = "FLUIDE — каталог";
  pageTitle.textContent = "Каталог";
  backLink.href = "catalog.html";
  backLink.setAttribute("aria-label", "Вернуться в главное меню");
  recommendedSort.remove();
  sortSelect.value = "number";
}

function intensityMatches(item, intensity) {
  if (intensity === "light") return item.oilPercent <= 22;
  if (intensity === "balanced") return item.oilPercent >= 25 && item.oilPercent <= 28;
  return item.oilPercent >= 30;
}

function selectedValues(name) {
  return checkboxFilters.filter((input) => input.name === name && input.checked).map((input) => input.value);
}

function setRepeatedParam(params, key, values) {
  params.delete(key);
  values.forEach((value) => params.append(key, value));
}

function saveCatalogState() {
  const params = new URLSearchParams(window.location.search);
  params.set("catalogState", "1");
  const scalarState = {
    q: searchInput.value.trim(),
    type: productTypeFilter?.value || "",
    filterFamily: familyFilter.value,
    sort: sortSelect.value,
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
  const family = recommendationParams.get("family");
  const intensity = recommendationParams.get("intensity");
  const concentration = recommendationParams.get("concentration");
  if (family && item.families.includes(family)) score += 4;
  if (intensity && intensityMatches(item, intensity)) score += 2;
  if (concentration && item.concentration === concentration) score += 1;
  return score;
}

function cardMarkup(item) {
  if (item.kind === "product") {
    const returnUrl = `${catalogPage}${window.location.search}`;
    const details = [item.volume, `${item.price.toLocaleString("ru-RU")} ₽`].filter(Boolean);
    return `
      <a class="product-card" href="product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent(returnUrl)}">
        <div class="product-card__visual"><span class="product-card__meta">${item.typeLabel}</span><span class="product-card__number">${item.id.slice(-2)}</span></div>
        <div class="product-card__body"><h2>${item.title}</h2><p class="product-card__original">Продукция FLUIDE Atelier</p>
          <div class="product-card__tags">${details.map((value) => `<span>${value}</span>`).join("")}</div></div>
      </a>`;
  }
  const family = item.families[0] || "Аромат";
  const price = fragrancePrices[item.category]?.[30];
  const returnUrl = `${catalogPage}${window.location.search}`;
  const visual = item.image
    ? `<img class="product-card__image" src="${item.image}" alt="Флакон ${item.title}" loading="lazy" decoding="async" />
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
        <div class="product-card__tags">
          <span>${item.gender}</span><span>${item.category}</span><span>${family}</span>${price ? `<span>от ${price.toLocaleString("ru-RU")} ₽</span>` : ""}
        </div>
      </div>
    </a>`;
}

function applyFilters() {
  saveCatalogState();
  const genders = selectedValues("gender");
  const categories = selectedValues("category");
  const concentrations = selectedValues("concentration");
  const intensities = selectedValues("intensity");
  const family = familyFilter.value;
  const productType = productTypeFilter?.value || "";
  const query = searchInput.value.trim().toLowerCase();
  const hasFragranceFilters = genders.length || categories.length || concentrations.length || intensities.length || family;
  const filtered = fragrances.filter((item) => {
    const haystack = `${item.id} ${item.title} ${item.original || ""} ${item.typeLabel || ""}`.toLowerCase();
    if (productType && item.productType !== productType) return false;
    if (item.kind === "product") return !hasFragranceFilters && (!query || haystack.includes(query));
    return (!genders.length || genders.includes(item.gender))
      && (!categories.length || categories.includes(item.category))
      && (!concentrations.length || concentrations.includes(item.concentration))
      && (!family || item.families.includes(family))
      && (!query || haystack.includes(query))
      && (!intensities.length || intensities.some((intensity) => intensityMatches(item, intensity)));
  });

  filtered.sort((a, b) => {
    if (sortSelect.value === "recommended") {
      return recommendationScore(b) - recommendationScore(a)
        || a.id.localeCompare(b.id, "ru", { numeric: true });
    }
    if (sortSelect.value === "name") return a.title.localeCompare(b.title, "ru");
    if (sortSelect.value === "oil-desc") return (b.oilPercent || 0) - (a.oilPercent || 0);
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
  const hasSavedState = params.get("catalogState") === "1";
  const gender = params.get("gender");
  const family = params.get("family");
  const savedFilters = {
    gender: params.getAll("filterGender"),
    category: params.getAll("filterCategory"),
    concentration: params.getAll("filterConcentration"),
    intensity: params.getAll("filterIntensity"),
  };
  checkboxFilters.forEach((input) => {
    const savedValues = savedFilters[input.name] || [];
    if (savedValues.includes(input.value) || (!hasSavedState && input.name === "gender" && input.value === gender)) {
      input.checked = true;
    }
  });
  familyFilter.value = params.get("filterFamily") || (!hasSavedState ? family : "") || "";
  searchInput.value = params.get("q") || "";
  if (productTypeFilter) productTypeFilter.value = params.get("type") || "";
  if (params.get("sort")) sortSelect.value = params.get("sort");
}

checkboxFilters.forEach((input) => input.addEventListener("change", applyFilters));
[searchInput, familyFilter, sortSelect, productTypeFilter].filter(Boolean)
  .forEach((control) => control.addEventListener("input", applyFilters));

resetButton.addEventListener("click", () => {
  checkboxFilters.forEach((input) => { input.checked = false; });
  familyFilter.value = "";
  if (productTypeFilter) productTypeFilter.value = "";
  searchInput.value = "";
  [...recommendationParams.keys()].forEach((key) => {
    if (key !== "mode") recommendationParams.delete(key);
  });
  catalogStateKeys.forEach((key) => recommendationParams.delete(key));
  history.replaceState(null, "", isAllMode ? "all.html" : "results.html?mode=selection");
  applyFilters();
});

configurePageMode();

const requests = [fetch("./fragrances.json").then((response) => {
  if (!response.ok) throw new Error("Не удалось загрузить каталог");
  return response.json();
})];
if (isAllMode) requests.push(fetch("./products.json").then((response) => response.json()));

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
