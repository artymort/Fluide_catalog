const detail = document.querySelector("#product-detail");
const productParams = new URLSearchParams(window.location.search);
const id = productParams.get("id");
const returnUrl = productParams.get("return");
const backLink = document.querySelector(".detail-back");

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
  document.title = `FLUIDE ${item.title}`;
  detail.innerHTML = `
    <div class="detail-visual">
      <span class="detail-visual__brand">FLUIDE Atelier</span>
      <span class="detail-visual__number">${item.id}</span>
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
      </div>

      <section class="detail-notes">
        <h2>Композиция аромата</h2>
        ${notesMarkup(item.notes)}
      </section>
      <div class="detail-families">${item.families.map((family) => `<span>${family}</span>`).join("")}</div>
    </div>`;
}

fetch("./fragrances.json")
  .then((response) => response.json())
  .then((items) => {
    const item = items.find((fragrance) => fragrance.id === id);
    if (!item) throw new Error("Аромат не найден");
    renderProduct(item);
  })
  .catch(() => {
    detail.innerHTML = '<p class="detail-loading">Аромат не найден. Вернитесь в каталог.</p>';
  });
