const grid = document.querySelector("#products-grid");
const countLabel = document.querySelector("#result-count");
const searchInput = document.querySelector("#search");
const familyFilter = document.querySelector("#family-filter");
const sortSelect = document.querySelector("#sort-products");
const resetButton = document.querySelector("#reset-filters");
const pageTitle = document.querySelector("#results-title");
const backLink = document.querySelector("#results-back");
const recommendedSort = document.querySelector("#recommended-sort");
const checkboxFilters = [...document.querySelectorAll('.filters input[type="checkbox"]')];
const recommendationParams = new URLSearchParams(window.location.search);
const isAllMode = document.body.dataset.catalogMode === "all" || recommendationParams.get("mode") === "all";
const catalogPage = isAllMode ? "all.html" : "results.html";

let fragrances = [];

function configurePageMode() {
  if (!isAllMode) return;
  document.title = "FLUIDE — все ароматы";
  pageTitle.textContent = "Все ароматы";
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
  const family = item.families[0] || "Аромат";
  const returnUrl = `${catalogPage}${window.location.search}`;
  return `
    <a class="product-card" href="product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent(returnUrl)}">
      <div class="product-card__visual">
        <span class="product-card__meta">FLUIDE Atelier</span>
        <span class="product-card__number">${item.id}</span>
      </div>
      <div class="product-card__body">
        <h2>${item.title}</h2>
        <p class="product-card__original">${item.original}</p>
        <div class="product-card__tags">
          <span>${item.gender}</span><span>${item.category}</span><span>${family}</span>
        </div>
      </div>
    </a>`;
}

function applyFilters() {
  const genders = selectedValues("gender");
  const categories = selectedValues("category");
  const concentrations = selectedValues("concentration");
  const intensities = selectedValues("intensity");
  const family = familyFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const filtered = fragrances.filter((item) => {
    const haystack = `${item.id} ${item.title} ${item.original}`.toLowerCase();
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
    if (sortSelect.value === "oil-desc") return b.oilPercent - a.oilPercent;
    return a.id.localeCompare(b.id, "ru", { numeric: true });
  });

  countLabel.textContent = `Найдено: ${filtered.length}`;
  grid.innerHTML = filtered.length
    ? filtered.map(cardMarkup).join("")
    : '<p class="products-empty">По выбранным параметрам ароматов не найдено. Измените фильтры.</p>';
}

function applyQueryDefaults() {
  const params = new URLSearchParams(window.location.search);
  const gender = params.get("gender");
  const family = params.get("family");
  checkboxFilters.forEach((input) => {
    if (input.name === "gender" && input.value === gender) input.checked = true;
  });
  if (family) familyFilter.value = family;
}

checkboxFilters.forEach((input) => input.addEventListener("change", applyFilters));
[searchInput, familyFilter, sortSelect].forEach((control) => control.addEventListener("input", applyFilters));

resetButton.addEventListener("click", () => {
  checkboxFilters.forEach((input) => { input.checked = false; });
  familyFilter.value = "";
  searchInput.value = "";
  [...recommendationParams.keys()].forEach((key) => {
    if (key !== "mode") recommendationParams.delete(key);
  });
  history.replaceState(null, "", isAllMode ? "all.html" : "results.html?mode=selection");
  applyFilters();
});

configurePageMode();

fetch("./fragrances.json")
  .then((response) => {
    if (!response.ok) throw new Error("Не удалось загрузить каталог");
    return response.json();
  })
  .then((data) => {
    fragrances = data;
    applyQueryDefaults();
    applyFilters();
  })
  .catch(() => {
    countLabel.textContent = "Ошибка загрузки каталога";
    grid.innerHTML = '<p class="products-empty">Перезапустите приложение при подключённом интернете.</p>';
  });
