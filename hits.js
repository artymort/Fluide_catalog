const hitIds = [
  "198", "195", "503", "071", "091",
  "505", "018", "518", "516", "129",
  "007", "024", "022", "148", "032",
  "031", "017", "014", "044", "016",
];

const grid = document.querySelector("#hits-grid");
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

function capitalizeLabel(value, fallback = "") {
  const label = String(value || fallback).trim();
  return label ? `${label.charAt(0).toLocaleUpperCase("ru-RU")}${label.slice(1)}` : "";
}

function groupToneClass(value) {
  const group = String(value || "").toLocaleLowerCase("ru-RU");
  if (group.startsWith("цветоч")) return "fragrance-group--floral";
  if (group.startsWith("древес")) return "fragrance-group--wood";
  if (group.startsWith("восточ")) return "fragrance-group--amber";
  if (group.startsWith("фужер")) return "fragrance-group--fougere";
  if (group.startsWith("шипров")) return "fragrance-group--chypre";
  if (group.startsWith("цитрус")) return "fragrance-group--citrus";
  if (group.startsWith("кожан")) return "fragrance-group--leather";
  return "fragrance-group--neutral";
}

function cardMarkup(item) {
  const image = item.thumbnail || item.image;
  const gender = capitalizeLabel(item.gender);
  const category = capitalizeLabel(item.category);
  const group = capitalizeLabel(item.group || item.families?.[0], "Аромат");
  const groupTone = groupToneClass(group);
  const price = fragrancePrices[item.category];
  const productUrl = `product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent("hits.html")}`;
  const visual = image
    ? `<img class="product-card__image" src="${escapeHtml(image)}" alt="Флакон ${escapeHtml(item.title)}" loading="lazy" decoding="async" />`
    : '<span class="season-card__fallback">FLUIDE<small>ATELIER</small></span>';

  return `<a class="product-card season-card" href="${productUrl}">
    <div class="product-card__visual">
      <span class="product-card__meta">Хит сезона</span>
      ${visual}
    </div>
    <div class="product-card__body">
      <h2>${escapeHtml(item.title)}</h2>
      <p class="product-card__original">${escapeHtml(item.original)}</p>
      <div class="product-card__meta-lines">
        <div class="product-card__tags product-card__tags--fragrance">
          <div class="product-card__tag-row">
            <span>${escapeHtml(gender)}</span>
            <span>${escapeHtml(category)}</span>
          </div>
          <span class="fragrance-group ${groupTone}">${escapeHtml(group)}</span>
        </div>
        ${price ? `<p class="product-card__price">от ${price.toLocaleString("ru-RU")} ₽</p>` : ""}
      </div>
    </div>
  </a>`;
}

fetch("./fragrances.json?v=6")
  .then((response) => {
    if (!response.ok) throw new Error("Не удалось загрузить каталог");
    return response.json();
  })
  .then((items) => {
    const byId = new Map(items.map((item) => [item.id, item]));
    const hits = hitIds.map((id) => byId.get(id)).filter(Boolean);
    grid.innerHTML = hits.map(cardMarkup).join("");
  })
  .catch(() => {
    grid.innerHTML = '<p class="products-empty">Не удалось загрузить подборку. Попробуйте открыть страницу ещё раз.</p>';
  });
