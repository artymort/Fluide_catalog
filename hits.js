const hitIds = [
  "198", "195", "503", "071", "091",
  "505", "018", "518", "516", "129",
  "007", "024", "022", "148", "032",
  "031", "017", "014", "044", "016",
];

const grid = document.querySelector("#hits-grid");
const countLabel = document.querySelector("#hits-count");
const fragrancePrices = {
  "Люкс": 1990,
  "Суперлюкс": 2490,
  "Селектив": 3490,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayTitle(item) {
  return item.title.replace(/^\d+\s+/, "");
}

function cardMarkup(item, position) {
  const image = item.thumbnail || item.image;
  const family = item.families?.[0] || "Аромат";
  const price = fragrancePrices[item.category];
  const productUrl = `product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent("hits.html")}`;
  const visual = image
    ? `<img class="product-card__image" src="${escapeHtml(image)}" alt="Флакон ${escapeHtml(displayTitle(item))}" loading="lazy" decoding="async" />
       <span class="product-card__number product-card__number--with-image">${escapeHtml(item.id)}</span>`
    : `<span class="product-card__number">${escapeHtml(item.id)}</span>`;

  return `<a class="product-card season-card" href="${productUrl}">
    <div class="product-card__visual">
      <span class="product-card__meta">Хит сезона</span>
      <span class="season-card__rank">${String(position).padStart(2, "0")}</span>
      ${visual}
    </div>
    <div class="product-card__body">
      <h2>${escapeHtml(displayTitle(item))}</h2>
      <p class="product-card__original">${escapeHtml(item.original)}</p>
      <div class="product-card__tags">
        <span>${escapeHtml(item.gender)}</span>
        <span>${escapeHtml(item.category)}</span>
        <span>${escapeHtml(family)}</span>
        ${price ? `<span>от ${price.toLocaleString("ru-RU")} ₽</span>` : ""}
      </div>
    </div>
  </a>`;
}

fetch("./fragrances.json")
  .then((response) => {
    if (!response.ok) throw new Error("Не удалось загрузить каталог");
    return response.json();
  })
  .then((items) => {
    const byId = new Map(items.map((item) => [item.id, item]));
    const hits = hitIds.map((id) => byId.get(id)).filter(Boolean);
    grid.innerHTML = hits.map((item, index) => cardMarkup(item, index + 1)).join("");
    countLabel.textContent = `${hits.length} ароматов`;
  })
  .catch(() => {
    grid.innerHTML = '<p class="products-empty">Не удалось загрузить подборку. Попробуйте открыть страницу ещё раз.</p>';
    countLabel.textContent = "Подборка недоступна";
  });
