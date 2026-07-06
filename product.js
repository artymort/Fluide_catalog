const detail = document.querySelector("#product-detail");
const productParams = new URLSearchParams(window.location.search);
const id = productParams.get("id");
const returnUrl = productParams.get("return");
const backLink = document.querySelector(".detail-back");
const fragrancePrices = {
  "Люкс": { 30: 1990, 50: 2990 },
  "Суперлюкс": { 30: 2490, 50: 3490 },
  "Селектив": { 30: 3490, 50: 4990 },
};

if (returnUrl && /^(?:all|results)\.html(?:\?|$)/.test(returnUrl)) {
  backLink.href = returnUrl;
}

const noteLabels = {
  top: "Верхние",
  middle: "Средние",
  base: "Базовые",
  main: "Основные",
};

function notesMarkup(notes) {
  return Object.entries(notes)
    .filter(([, values]) => values.length)
    .map(([key, values]) => `
      <div class="note-row">
        <h3>${noteLabels[key]}</h3>
        <p>${values.join(", ")}</p>
      </div>`)
    .join("");
}

function renderProduct(item) {
  const prices = fragrancePrices[item.category];
  const visual = item.image
    ? `<img class="detail-visual__image" src="${item.image}" alt="Флакон ${item.title}" />
       <span class="detail-visual__number detail-visual__number--with-image">${item.id}</span>`
    : `<span class="detail-visual__number">${item.id}</span>`;
  document.title = `FLUIDE ${item.title}`;
  detail.innerHTML = `
    <div class="detail-visual">
      <span class="detail-visual__brand">FLUIDE Atelier</span>
      ${visual}
      <span class="detail-visual__caption">30 мл</span>
    </div>
    <div class="detail-content">
      <p class="detail-kicker">Аромат № ${item.id}</p>
      <h1>${item.title}</h1>
      <p class="detail-original">Ольфакторное направление: ${item.original}</p>

      <div class="detail-facts">
        <div class="detail-fact"><span>Пол</span><strong>${item.gender}</strong></div>
        <div class="detail-fact"><span>Категория</span><strong>${item.category}</strong></div>
        <div class="detail-fact"><span>Концентрация</span><strong>${item.concentration}</strong></div>
        <div class="detail-fact"><span>Парфюмерное масло</span><strong>${item.oilPercent}%</strong></div>
        ${prices ? `<div class="detail-fact"><span>30 мл</span><strong>${prices[30].toLocaleString("ru-RU")} ₽</strong></div><div class="detail-fact"><span>50 мл</span><strong>${prices[50].toLocaleString("ru-RU")} ₽</strong></div>` : ""}
      </div>

      <section class="detail-notes">
        <h2>Композиция аромата</h2>
        ${notesMarkup(item.notes)}
      </section>
      <div class="detail-families">${item.families.map((family) => `<span>${family}</span>`).join("")}</div>
    </div>`;
}

function renderCatalogProduct(item) {
  document.title = `FLUIDE — ${item.title}`;
  detail.innerHTML = `
    <div class="detail-visual"><span class="detail-visual__brand">${item.typeLabel}</span><span class="detail-visual__number">${item.id.slice(-2)}</span><span class="detail-visual__caption">${item.volume || "FLUIDE"}</span></div>
    <div class="detail-content"><p class="detail-kicker">${item.typeLabel}</p><h1>${item.title}</h1><p class="detail-original">Продукция FLUIDE Atelier</p>
      <div class="detail-facts">${item.volume ? `<div class="detail-fact"><span>Объём</span><strong>${item.volume}</strong></div>` : ""}<div class="detail-fact"><span>Цена</span><strong>${item.price.toLocaleString("ru-RU")} ₽</strong></div></div>
    </div>`;
}

fetch("./fragrances.json")
  .then((response) => response.json())
  .then(async (items) => {
    const item = items.find((fragrance) => fragrance.id === id);
    if (item) return renderProduct(item);
    const response = await fetch("./products.json");
    const products = await response.json();
    const product = products.find((entry) => entry.id === id);
    if (!product) throw new Error("Товар не найден");
    renderCatalogProduct(product);
  })
  .catch(() => {
    detail.innerHTML = '<p class="detail-loading">Аромат не найден. Вернитесь в каталог.</p>';
  });
