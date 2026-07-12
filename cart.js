const cartList = document.querySelector("#cart-list");
const cartStatus = document.querySelector("#cart-status");
const clearCartButton = document.querySelector("#clear-cart");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("ru-RU")} ₽`;
}

function productUrl(item) {
  if (item.kind === "wardrobe") return "wardrobe.html?view=final";
  if (item.kind === "fragrance" || item.kind === "product") {
    return `product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent("cart.html")}`;
  }
  return "all.html";
}

function itemVisual(item) {
  if (item.image) return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />`;
  return `<div class="cart-card__placeholder"><img src="app-icon.svg" alt="" /><span>${escapeHtml(item.typeLabel || "FLUIDE Atelier")}</span></div>`;
}

function cardMarkup(item) {
  return `<article class="cart-card">
    <a class="cart-card__link" href="${productUrl(item)}" aria-label="Открыть ${escapeHtml(item.title)}">${itemVisual(item)}</a>
    <div class="cart-card__body">
      <h2>${escapeHtml(item.title)}</h2>
      <div class="cart-card__meta">${item.volume ? `<span>${escapeHtml(item.volume)}${typeof item.volume === "number" ? " мл" : ""}</span>` : ""}${item.category ? `<span>${escapeHtml(item.category)}</span>` : ""}</div>
      <strong class="cart-card__price">${formatPrice(item.price)}</strong>
    </div>
    <button class="cart-card__remove" type="button" data-remove-key="${escapeHtml(item.key)}" aria-label="Удалить ${escapeHtml(item.title)}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>
      <span>Удалить</span>
    </button>
  </article>`;
}

function renderCart() {
  const items = window.FluideCart.read();
  const count = window.FluideCart.count(items);
  clearCartButton.disabled = items.length === 0;
  cartStatus.innerHTML = `<span>${count ? `Добавлено позиций: ${count}` : "Корзина пуста"}</span><strong>${count ? formatPrice(window.FluideCart.total(items)) : "0 ₽"}</strong>`;
  cartList.innerHTML = items.length
    ? items.map(cardMarkup).join("")
    : `<div class="empty-cart"><div><h2>Здесь пока ничего нет</h2><p>Добавьте ароматы или другую продукцию из каталога.</p><a href="all.html">Перейти в каталог</a></div></div>`;
  document.querySelectorAll("[data-remove-key]").forEach((button) => button.addEventListener("click", () => {
    window.FluideCart.remove(button.dataset.removeKey);
    renderCart();
  }));
}

clearCartButton.addEventListener("click", () => {
  window.FluideCart.clear();
  renderCart();
});

document.querySelector("#cart-back").addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "index.html";
});

renderCart();
window.addEventListener("pageshow", renderCart);
