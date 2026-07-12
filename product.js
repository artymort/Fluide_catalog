const detail = document.querySelector("#product-detail");
const productParams = new URLSearchParams(window.location.search);
const id = productParams.get("id");
const returnUrl = productParams.get("return");
const backLink = document.querySelector(".detail-back");
// Source: "Цены FLUIDE - Лист1.csv".
const fragrancePrices = {
  "Люкс": { 30: 1990, 50: 2990 },
  "Суперлюкс": { 30: 2490, 50: 3490 },
  "Селектив": { 30: 3490, 50: 4990 },
};

if (returnUrl && /^(?:all|results|wardrobe|product|cart)\.html(?:\?|$)/.test(returnUrl)) {
  backLink.href = returnUrl;
  if (returnUrl === "wardrobe.html?view=final") backLink.setAttribute("aria-label", "Вернуться к готовому гардеробу");
  else if (returnUrl.startsWith("wardrobe.html")) backLink.setAttribute("aria-label", "Вернуться к примерке");
  else if (returnUrl.startsWith("cart.html")) backLink.setAttribute("aria-label", "Вернуться в корзину");
  else if (returnUrl.startsWith("product.html")) backLink.setAttribute("aria-label", "Вернуться к предыдущему аромату");
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
        <p>${values.map(capitalizeNote).join(", ")}</p>
      </div>`)
    .join("");
}

function capitalizeNote(value) {
  const note = String(value).trim();
  return note ? `${note.charAt(0).toLocaleUpperCase("ru-RU")}${note.slice(1)}` : note;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function overlapCount(first, second) {
  const secondSet = new Set(second.map((value) => String(value).toLocaleLowerCase("ru-RU")));
  return first.reduce((count, value) => count + Number(secondSet.has(String(value).toLocaleLowerCase("ru-RU"))), 0);
}

function fragranceNotes(item) {
  return Object.values(item.notes || {}).flat();
}

function similarFragrances(item, items) {
  return items
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => ({
      item: candidate,
      score:
        overlapCount(item.families || [], candidate.families || []) * 12
        + overlapCount(fragranceNotes(item), fragranceNotes(candidate)) * 2
        + overlapCount(item.occasion || [], candidate.occasion || []) * 2
        + overlapCount(item.season || [], candidate.season || []) * 2
        + Number(item.gender === candidate.gender) * 5
        + Number(item.category === candidate.category) * 4,
    }))
    .sort((first, second) => second.score - first.score || first.item.id.localeCompare(second.item.id, "ru"))
    .slice(0, 4)
    .map((entry) => entry.item);
}

function similarCardMarkup(item) {
  const prices = fragrancePrices[item.category];
  const cardReturn = `product.html?id=${encodeURIComponent(id)}${returnUrl ? `&return=${encodeURIComponent(returnUrl)}` : ""}`;
  const productUrl = `product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent(cardReturn)}`;
  const image = item.thumbnail || item.image;
  return `<a class="similar-card" href="${productUrl}">
    <div class="similar-card__visual">
      <span>FLUIDE Atelier</span>
      ${image ? `<img src="${escapeHtml(image)}" alt="Флакон ${escapeHtml(item.title)}" loading="lazy" decoding="async" />` : `<strong>${escapeHtml(item.id)}</strong>`}
      <i>${escapeHtml(item.id)}</i>
    </div>
    <div class="similar-card__body">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.original)}</p>
      <div><span>${escapeHtml(item.category)}</span>${prices ? `<strong>от ${formatPrice(prices[30])}</strong>` : ""}</div>
    </div>
  </a>`;
}

function readCartItems() {
  return window.FluideCart.read();
}

function renderProduct(item, items) {
  const prices = fragrancePrices[item.category];
  const similarItems = similarFragrances(item, items);
  const visual = item.image
    ? `<img class="detail-visual__image" src="${escapeHtml(item.image)}" alt="Флакон ${escapeHtml(item.title)}" />
       <span class="detail-visual__number detail-visual__number--with-image">${escapeHtml(item.id)}</span>`
    : `<span class="detail-visual__number">${escapeHtml(item.id)}</span>`;
  document.title = `FLUIDE ${item.title}`;
  detail.innerHTML = `
    <div class="detail-visual">
      <span class="detail-visual__brand">FLUIDE Atelier</span>
      ${visual}
      <span class="detail-visual__caption" id="detail-volume-caption">30 мл</span>
    </div>
    <div class="detail-content">
      <h1>${escapeHtml(item.title)}</h1>
      <p class="detail-original">По мотивам: ${escapeHtml(item.original)}</p>

      <div class="detail-facts">
        <div class="detail-fact"><span>Пол</span><strong>${escapeHtml(item.gender)}</strong></div>
        <div class="detail-fact"><span>Категория</span><strong>${escapeHtml(item.category)}</strong></div>
      </div>

      ${prices ? `<section class="purchase-panel" aria-labelledby="volume-title">
        <div class="purchase-panel__heading">
          <div><span>Выберите объём</span><strong id="volume-title">Парфюмерная вода</strong></div>
          <div class="volume-options" role="group" aria-label="Объём аромата">
            <button class="volume-option is-active" type="button" data-volume="30" aria-pressed="true">30 мл</button>
            <button class="volume-option" type="button" data-volume="50" aria-pressed="false">50 мл</button>
          </div>
        </div>
        <div class="purchase-panel__action">
          <div><span>Стоимость</span><strong id="selected-price">${formatPrice(prices[30])}</strong></div>
          <button class="add-to-cart" id="add-to-cart" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16l-1.4 12H5.4L4 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
            <span>Добавить в корзину</span>
          </button>
        </div>
      </section>` : ""}

      <section class="detail-notes">
        <h2>Ноты аромата</h2>
        ${notesMarkup(item.notes)}
      </section>
      <div class="detail-families">${item.families.map((family) => `<span>${escapeHtml(family)}</span>`).join("")}</div>
    </div>
    <section class="similar-products" aria-labelledby="similar-title">
      <div class="similar-products__heading"><h2 id="similar-title">Похожие ароматы</h2></div>
      <div class="similar-grid">${similarItems.map(similarCardMarkup).join("")}</div>
    </section>`;

  if (!prices) return;
  let selectedVolume = 30;
  const priceLabel = document.querySelector("#selected-price");
  const volumeCaption = document.querySelector("#detail-volume-caption");
  const addButton = document.querySelector("#add-to-cart");
  const addButtonLabel = addButton.querySelector("span");

  function variantInCart(volume) {
    return readCartItems().some((entry) => entry.id === item.id && Number(entry.volume) === volume);
  }

  function syncPurchaseState() {
    priceLabel.textContent = formatPrice(prices[selectedVolume]);
    volumeCaption.textContent = `${selectedVolume} мл`;
    document.querySelectorAll("[data-volume]").forEach((button) => {
      const active = Number(button.dataset.volume) === selectedVolume;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const alreadyAdded = variantInCart(selectedVolume);
    addButton.disabled = alreadyAdded;
    addButtonLabel.textContent = alreadyAdded ? "Уже в корзине" : "Добавить в корзину";
  }

  document.querySelectorAll("[data-volume]").forEach((button) => button.addEventListener("click", () => {
    selectedVolume = Number(button.dataset.volume);
    syncPurchaseState();
  }));

  addButton.addEventListener("click", () => {
    if (variantInCart(selectedVolume)) return;
    window.FluideCart.add({
      kind: "fragrance",
      id: item.id,
      title: item.title,
      typeLabel: "Парфюмерная вода",
      category: item.category,
      volume: selectedVolume,
      price: prices[selectedVolume],
      quantity: 1,
      image: item.thumbnail || item.image || "",
    });
    syncPurchaseState();
  });

  syncPurchaseState();
}

function renderCatalogProduct(item) {
  const visual = item.image
    ? `<img class="detail-visual__image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />`
    : `<img class="detail-visual__fallback" src="app-icon.svg" alt="" />`;
  document.title = `FLUIDE — ${item.title}`;
  detail.innerHTML = `
    <div class="detail-visual"><span class="detail-visual__brand">${escapeHtml(item.typeLabel)}</span>${visual}<span class="detail-visual__caption">${escapeHtml(item.volume || "FLUIDE")}</span></div>
    <div class="detail-content"><p class="detail-kicker">${escapeHtml(item.typeLabel)}</p><h1>${escapeHtml(item.title)}</h1><p class="detail-original">Продукция FLUIDE Atelier</p>
      <div class="detail-facts">${item.volume ? `<div class="detail-fact"><span>Объём</span><strong>${escapeHtml(item.volume)}</strong></div>` : ""}<div class="detail-fact"><span>Категория</span><strong>${escapeHtml(item.typeLabel)}</strong></div></div>
      <section class="purchase-panel product-purchase">
        <div class="purchase-panel__action">
          <div><span>Стоимость</span><strong>${formatPrice(item.price)}</strong></div>
          <button class="add-to-cart" id="add-product-to-cart" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16l-1.4 12H5.4L4 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg>
            <span>Добавить в корзину</span>
          </button>
        </div>
      </section>
    </div>`;

  const cartKey = `product:${item.id}${item.volume ? `:${item.volume}` : ""}`;
  const addButton = document.querySelector("#add-product-to-cart");
  const addButtonLabel = addButton.querySelector("span");
  const syncButton = () => {
    const added = window.FluideCart.has(cartKey);
    addButton.disabled = added;
    addButtonLabel.textContent = added ? "Уже в корзине" : "Добавить в корзину";
  };
  addButton.addEventListener("click", () => {
    window.FluideCart.add({
      key: cartKey,
      kind: "product",
      id: item.id,
      title: item.title,
      typeLabel: item.typeLabel,
      volume: item.volume || "",
      price: item.price,
      quantity: 1,
      image: item.image || "",
    });
    syncButton();
  });
  syncButton();
}

fetch("./fragrances.json")
  .then((response) => response.json())
  .then(async (items) => {
    const item = items.find((fragrance) => fragrance.id === id);
    if (item) return renderProduct(item, items);
    const response = await fetch("./products.json");
    const products = await response.json();
    const product = products.find((entry) => entry.id === id);
    if (!product) throw new Error("Товар не найден");
    renderCatalogProduct(product);
  })
  .catch(() => {
    detail.innerHTML = '<p class="detail-loading">Аромат не найден. Вернитесь в каталог.</p>';
  });
