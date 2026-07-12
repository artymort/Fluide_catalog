const content = document.querySelector("#wardrobe-content");
const dialog = document.querySelector("#wardrobe-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogClose = document.querySelector(".dialog-close");
const progressItems = [...document.querySelectorAll("[data-progress]")];

const roleDefinitions = {
  base: {
    name: "Основа",
    description: "Универсальный аромат, к которому хочется возвращаться.",
    reason: "Станет спокойной и универсальной основой вашего гардероба.",
    target: { freshness: 3, sweetness: 3, warmth: 3, intensity: 3, formality: 3, unusual: 2 },
  },
  composure: {
    name: "Собранность",
    description: "Чистый и уверенный аромат для делового и городского ритма.",
    reason: "Поможет звучать собранно на работе, встречах и в городском ритме.",
    target: { freshness: 4, sweetness: 2, warmth: 2, intensity: 3, formality: 5, unusual: 2 },
  },
  reset: {
    name: "Перезагрузка",
    description: "Лёгкий аромат для отдыха, движения и ощущения свежести.",
    reason: "Добавит лёгкости, воздуха и ощущения нового начала.",
    target: { freshness: 5, sweetness: 2, warmth: 1, intensity: 2, formality: 2, unusual: 2 },
  },
  attraction: {
    name: "Притяжение",
    description: "Близкий, чувственный и запоминающийся образ.",
    reason: "Раскроет более близкую, чувственную сторону вашего образа.",
    target: { freshness: 2, sweetness: 4, warmth: 4, intensity: 4, formality: 3, unusual: 3 },
  },
  accent: {
    name: "Акцент",
    description: "Выразительный аромат для события или особого настроения.",
    reason: "Станет выразительным акцентом для вечера и особого настроения.",
    target: { freshness: 2, sweetness: 3, warmth: 4, intensity: 5, formality: 4, unusual: 5 },
  },
  comfort: {
    name: "Уют",
    description: "Мягкий аромат для спокойных вечеров и близкого круга.",
    reason: "Создаст ощущение мягкости, тепла и личного пространства.",
    target: { freshness: 2, sweetness: 4, warmth: 5, intensity: 2, formality: 1, unusual: 2 },
  },
  vacation: {
    name: "Отпуск",
    description: "Беззаботный аромат для отдыха и смены обстановки.",
    reason: "Будет напоминать об отдыхе, свободе и смене ритма.",
    target: { freshness: 4, sweetness: 3, warmth: 3, intensity: 2, formality: 1, unusual: 3 },
  },
  warmWeather: {
    name: "Тёплая погода",
    description: "Прозрачный аромат для солнца и высокой температуры.",
    reason: "Сохранит свежесть и прозрачность в тёплую погоду.",
    target: { freshness: 5, sweetness: 2, warmth: 2, intensity: 1, formality: 2, unusual: 2 },
  },
  coldWeather: {
    name: "Холодная погода",
    description: "Тёплый и стойкий аромат для прохладных дней.",
    reason: "Даст объём, тепло и стойкость в холодную погоду.",
    target: { freshness: 1, sweetness: 4, warmth: 5, intensity: 5, formality: 3, unusual: 3 },
  },
  creative: {
    name: "Творческий образ",
    description: "Необычная композиция для свободного самовыражения.",
    reason: "Подчеркнёт индивидуальность и творческую свободу.",
    target: { freshness: 3, sweetness: 3, warmth: 3, intensity: 4, formality: 2, unusual: 5 },
  },
  maximumFreshness: {
    name: "Максимальная свежесть",
    description: "Чистый и прохладный аромат с ощущением воздуха.",
    reason: "Даст максимально чистое, прохладное и воздушное звучание.",
    target: { freshness: 5, sweetness: 1, warmth: 1, intensity: 2, formality: 2, unusual: 2 },
  },
  experiment: {
    name: "Смелый эксперимент",
    description: "Самый неожиданный аромат в вашей коллекции.",
    reason: "Позволит выйти за привычные границы и попробовать новое.",
    target: { freshness: 3, sweetness: 3, warmth: 4, intensity: 5, formality: 2, unusual: 5 },
  },
};

const defaultRoles = ["base", "composure", "reset", "attraction", "accent"];
const dislikeOptions = [
  ["tooSweet", "Слишком сладкие"],
  ["heavy", "Тяжёлые"],
  ["sharp", "Резкие"],
  ["powdery", "Пудровые"],
  ["tooFresh", "Слишком свежие"],
  ["smoky", "Дымные"],
  ["loud", "Громкие"],
  ["floral", "Не люблю цветочные"],
];
const moodOptions = [
  ["confident", "Уверенно"], ["calm", "Спокойно"], ["attractive", "Притягательно"],
  ["free", "Свободно"], ["energetic", "Энергично"], ["soft", "Мягко"],
  ["collected", "Собранно"], ["mysterious", "Загадочно"], ["unusual", "Необычно"],
  ["elegant", "Элегантно"], ["clean", "Чисто"], ["bold", "Смело"],
];
const moodTargets = {
  confident: { intensity: 4, formality: 4 },
  calm: { intensity: 2, sweetness: 3, warmth: 3 },
  attractive: { sweetness: 4, warmth: 4, intensity: 4 },
  free: { freshness: 4, formality: 1, unusual: 3 },
  energetic: { freshness: 5, intensity: 3 },
  soft: { sweetness: 4, intensity: 2, warmth: 4 },
  collected: { freshness: 3, formality: 5, intensity: 3 },
  mysterious: { warmth: 5, unusual: 4, intensity: 4 },
  unusual: { unusual: 5 },
  elegant: { formality: 5, sweetness: 3, intensity: 3 },
  clean: { freshness: 5, sweetness: 1, warmth: 1 },
  bold: { intensity: 5, unusual: 5 },
};

let fragrances = [];
let currentScreen = "welcome";
const storedState = JSON.parse(sessionStorage.getItem("fluide-wardrobe") || "null");
const storedRecommendationIds = Array.isArray(storedState?.recommendations) ? storedState.recommendations : [];
const requestedView = new URLSearchParams(window.location.search).get("view");
const state = {
  favorites: Array.isArray(storedState?.favorites) ? storedState.favorites : [],
  novice: Boolean(storedState?.novice),
  dislikes: Array.isArray(storedState?.dislikes) ? storedState.dislikes : [],
  moods: Array.isArray(storedState?.moods) ? storedState.moods : [],
  roles: Array.isArray(storedState?.roles) && storedState.roles.length === 5 ? storedState.roles : [...defaultRoles],
  recommendations: [],
  reactions: storedState?.reactions && typeof storedState.reactions === "object" ? storedState.reactions : {},
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveState() {
  sessionStorage.setItem("fluide-wardrobe", JSON.stringify({
    favorites: state.favorites,
    novice: state.novice,
    dislikes: state.dislikes,
    moods: state.moods,
    roles: state.roles,
    recommendations: state.recommendations.map((item) => item.id),
    reactions: state.reactions,
  }));
}

function resetState() {
  state.favorites = [];
  state.novice = false;
  state.dislikes = [];
  state.moods = [];
  state.roles = [...defaultRoles];
  state.recommendations = [];
  state.reactions = {};
  saveState();
}

function setProgress(stage) {
  const order = ["profile", "fitting", "wardrobe"];
  const activeIndex = order.indexOf(stage);
  progressItems.forEach((item, index) => item.classList.toggle("is-active", activeIndex >= index));
}

function setScreen(screen) {
  currentScreen = screen;
  content.scrollTop = 0;
  content.classList.toggle("wardrobe-content--fitting", screen === "fitting");
  const progressStage = ["welcome", "profile", "dislikes", "moods", "roles", "processing"].includes(screen)
    ? "profile"
    : screen === "fitting" ? "fitting" : "wardrobe";
  setProgress(progressStage);
}

function renderWelcome() {
  setScreen("welcome");
  content.innerHTML = `
    <div class="wardrobe-welcome">
      <p class="wardrobe-kicker">Цифровой парфюмерный стилист FLUIDE</p>
      <h1 class="wardrobe-title">Парфюмерный гардероб</h1>
      <p class="wardrobe-lead">Расскажите, какие ароматы вам нравятся и как вы хотите звучать. Стилист соберёт пять разных ароматов, а консультант подготовит их к примерке.</p>
      <div class="wardrobe-actions wardrobe-actions--centered">
        <button class="wardrobe-button" id="start-wardrobe" type="button">Начать подбор</button>
        <button class="wardrobe-button wardrobe-button--secondary" id="show-how" type="button">Как это работает</button>
      </div>
      <div class="welcome-bottles" aria-hidden="true">
        <img src="images/fragrances/thumbs/129.webp" alt="" loading="eager" />
        <img src="images/fragrances/thumbs/029.webp" alt="" loading="eager" />
        <img src="images/fragrances/thumbs/195.webp" alt="" loading="eager" />
        <img src="images/fragrances/thumbs/087.webp" alt="" loading="eager" />
        <img src="images/fragrances/thumbs/041.webp" alt="" loading="eager" />
      </div>
      <div class="welcome-process" aria-label="Как проходит подбор">
        <div class="welcome-process__step">
          <span>01</span><div><h2>Опишите свой вкус</h2><p>Любимые ароматы и границы вкуса.</p></div>
        </div>
        <div class="welcome-process__step">
          <span>02</span><div><h2>Получите пять образов</h2><p>Пять разных задач без повторов.</p></div>
        </div>
        <div class="welcome-process__step">
          <span>03</span><div><h2>Примерьте в бутике</h2><p>Пять блоттеров у консультанта.</p></div>
        </div>
      </div>
    </div>`;
  document.querySelector("#start-wardrobe").addEventListener("click", () => {
    resetState();
    renderProfile();
  });
  document.querySelector("#show-how").addEventListener("click", showHowDialog);
}

function showHowDialog() {
  dialogContent.innerHTML = `<h2>Персональная примерка</h2>
    <p>Сначала определим границы вашего вкуса и желаемое впечатление. Затем соберём пять разных ролей и подготовим по одному аромату для каждой.</p>
    <div class="dialog-options">
      <div class="dialog-option"><strong>01. Профиль</strong><span>Любимые ароматы и границы вкуса</span></div>
      <div class="dialog-option"><strong>02. Примерка</strong><span>Пять пронумерованных блоттеров</span></div>
      <div class="dialog-option"><strong>03. Гардероб</strong><span>Готовый комплект со специальной ценой</span></div>
    </div>`;
  dialog.showModal();
}

function selectedFavoriteItems() {
  return state.favorites.map((id) => fragrances.find((item) => item.id === id)).filter(Boolean);
}

function favoriteListMarkup() {
  return selectedFavoriteItems().map((item) => `<div class="favorite-item">
    <span>№ ${escapeHtml(item.id)}</span>
    <strong>${escapeHtml(item.title)}</strong>
    <button class="favorite-remove" type="button" data-remove-favorite="${escapeHtml(item.id)}" aria-label="Удалить ${escapeHtml(item.title)}" title="Удалить">×</button>
  </div>`).join("");
}

function choiceMarkup([value, label], selectedValues, groupName, disabled = false) {
  const selected = selectedValues.includes(value);
  return `<label class="choice-card${selected ? " is-selected" : ""}${disabled && !selected ? " is-disabled" : ""}">
    <input type="checkbox" name="${groupName}" value="${value}"${selected ? " checked" : ""}${disabled && !selected ? " disabled" : ""} />
    <span>${label}</span>
  </label>`;
}

function moodChoiceMarkup([value, label], disabled = false) {
  const priorityIndex = state.moods.indexOf(value);
  const selected = priorityIndex !== -1;
  return `<label class="choice-card mood-choice${selected ? " is-selected" : ""}${disabled && !selected ? " is-disabled" : ""}">
    <input type="checkbox" name="mood" value="${value}"${selected ? " checked" : ""}${disabled && !selected ? " disabled" : ""} />
    ${selected ? `<span class="mood-choice__priority">${priorityIndex + 1}</span>` : ""}
    <span>${label}</span>
  </label>`;
}

function renderProfile() {
  setScreen("profile");
  const canContinue = state.favorites.length > 0 || state.novice;
  content.innerHTML = `
    <div class="question-heading">
      <p class="wardrobe-kicker">Профиль вкуса · 01</p>
      <h1 class="wardrobe-title">Какие ароматы вам уже нравятся?</h1>
      <p class="wardrobe-lead">Добавьте до трёх знакомых ароматов. Они станут отправной точкой, но мы не будем искать их копии.</p>
    </div>
    <div class="profile-focus">
      <section class="profile-search-panel">
        <div class="favorite-search">
          <input id="favorite-search" type="search" placeholder="Например, Good Girl или FLUIDE 128" autocomplete="off" ${state.favorites.length >= 3 || state.novice ? "disabled" : ""} />
          <div class="search-results" id="favorite-results" hidden></div>
        </div>
        <p class="favorite-search-hint">Поиск по названию FLUIDE, номеру или оригинальному аромату</p>
        <div class="favorite-list favorite-list--profile">${favoriteListMarkup()}</div>
        <div class="profile-or"><span>или</span></div>
        <label class="novice-option${state.novice ? " is-selected" : ""}">
          <input id="novice-toggle" type="checkbox" ${state.novice ? "checked" : ""} />
          <span class="novice-option__mark" aria-hidden="true"></span>
          <span><strong>Не знаю знакомых ароматов</strong><small>Собираю свой первый парфюмерный гардероб</small></span>
        </label>
      </section>
    </div>
    <div class="wardrobe-actions wardrobe-actions--centered">
      <button class="wardrobe-button wardrobe-button--secondary" id="profile-back" type="button">Назад</button>
      <button class="wardrobe-button" id="profile-next" type="button" ${canContinue ? "" : "disabled"}>Продолжить</button>
    </div>`;
  attachProfileEvents();
}

function attachProfileEvents() {
  const search = document.querySelector("#favorite-search");
  const results = document.querySelector("#favorite-results");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    if (!query) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }
    const matches = fragrances.filter((item) => !state.favorites.includes(item.id)
      && `fluide ${item.id} ${item.title} ${item.original}`.toLowerCase().includes(query)).slice(0, 8);
    results.innerHTML = matches.length ? matches.map((item) => `<button class="search-result" type="button" data-favorite-id="${escapeHtml(item.id)}">
      <span>№ ${escapeHtml(item.id)}</span><strong>${escapeHtml(item.title)}<small>${escapeHtml(item.original)}</small></strong>
    </button>`).join("") : '<div class="search-result"><span></span><strong>Ничего не найдено</strong></div>';
    results.hidden = false;
  });
  results?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-id]");
    if (!button || state.favorites.length >= 3) return;
    state.favorites.push(button.dataset.favoriteId);
    state.novice = false;
    saveState();
    renderProfile();
  });
  document.querySelectorAll("[data-remove-favorite]").forEach((button) => button.addEventListener("click", () => {
    state.favorites = state.favorites.filter((id) => id !== button.dataset.removeFavorite);
    saveState();
    renderProfile();
  }));
  document.querySelector("#novice-toggle").addEventListener("change", (event) => {
    state.novice = event.target.checked;
    if (state.novice) state.favorites = [];
    saveState();
    renderProfile();
  });
  document.querySelector("#profile-back").addEventListener("click", renderWelcome);
  document.querySelector("#profile-next").addEventListener("click", renderDislikes);
}

function renderDislikes() {
  setScreen("dislikes");
  const limitReached = state.dislikes.length >= 3;
  content.innerHTML = `
    <div class="question-heading">
      <p class="wardrobe-kicker">Профиль вкуса · 02</p>
      <h1 class="wardrobe-title">Что вам обычно не нравится?</h1>
      <p class="wardrobe-lead">Выберите до трёх характеристик. Если ограничений нет, можно продолжить без выбора.</p>
    </div>
    <div class="choice-grid choice-grid--dislikes">${dislikeOptions.map((option) => choiceMarkup(option, state.dislikes, "dislike", limitReached)).join("")}</div>
    <p class="selection-limit selection-limit--centered">Выбрано: ${state.dislikes.length} из 3</p>
    <div class="wardrobe-actions wardrobe-actions--centered">
      <button class="wardrobe-button wardrobe-button--secondary" id="dislikes-back" type="button">Назад</button>
      <button class="wardrobe-button" id="dislikes-next" type="button">Продолжить</button>
    </div>`;
  document.querySelectorAll('input[name="dislike"]').forEach((input) => input.addEventListener("change", () => {
    if (input.checked && state.dislikes.length < 3) state.dislikes.push(input.value);
    else state.dislikes = state.dislikes.filter((value) => value !== input.value);
    saveState();
    renderDislikes();
  }));
  document.querySelector("#dislikes-back").addEventListener("click", renderProfile);
  document.querySelector("#dislikes-next").addEventListener("click", renderMoods);
}

function renderMoods() {
  setScreen("moods");
  const limitReached = state.moods.length >= 3;
  content.innerHTML = `
    <p class="wardrobe-kicker">Желаемое впечатление</p>
    <h1 class="wardrobe-title">Как вы хотите звучать в аромате?</h1>
    <p class="wardrobe-lead">Выберите состояния, которые вам ближе.</p>
    <div class="choice-grid choice-grid--moods">${moodOptions.map((option) => moodChoiceMarkup(option, limitReached)).join("")}</div>
    <p class="selection-limit">Выбрано: ${state.moods.length} из 3</p>
    <div class="wardrobe-actions">
      <button class="wardrobe-button wardrobe-button--secondary" id="moods-back" type="button">Назад</button>
      <button class="wardrobe-button" id="moods-next" type="button" ${state.moods.length === 0 ? "disabled" : ""}>Продолжить</button>
    </div>`;
  document.querySelectorAll('input[name="mood"]').forEach((input) => input.addEventListener("change", () => {
    if (input.checked && state.moods.length < 3) state.moods.push(input.value);
    else state.moods = state.moods.filter((value) => value !== input.value);
    saveState();
    renderMoods();
  }));
  document.querySelector("#moods-back").addEventListener("click", renderDislikes);
  document.querySelector("#moods-next").addEventListener("click", renderRoles);
}

function renderRoles() {
  setScreen("roles");
  content.innerHTML = `
    <p class="wardrobe-kicker">Каркас гардероба</p>
    <h1 class="wardrobe-title">Ваш гардероб будет состоять из пяти образов</h1>
    <p class="wardrobe-lead">Каждый аромат получит собственную задачу. Ненужную роль можно заменить.</p>
    <div class="roles-grid">${state.roles.map((roleId, index) => {
      const role = roleDefinitions[roleId];
      return `<article class="role-card">
        <span class="role-card__number">${String(index + 1).padStart(2, "0")}</span>
        <h2>${role.name}</h2><p>${role.description}</p>
        <button type="button" data-change-role="${index}">Заменить роль</button>
      </article>`;
    }).join("")}</div>
    <div class="wardrobe-actions">
      <button class="wardrobe-button wardrobe-button--secondary" id="roles-back" type="button">Назад</button>
      <button class="wardrobe-button" id="roles-next" type="button">Собрать мой гардероб</button>
    </div>`;
  document.querySelectorAll("[data-change-role]").forEach((button) => button.addEventListener("click", () => showRoleDialog(Number(button.dataset.changeRole))));
  document.querySelector("#roles-back").addEventListener("click", renderMoods);
  document.querySelector("#roles-next").addEventListener("click", renderProcessing);
}

function showRoleDialog(index) {
  const currentRole = state.roles[index];
  const unavailable = new Set(state.roles.filter((_, roleIndex) => roleIndex !== index));
  const options = Object.entries(roleDefinitions).filter(([id]) => !unavailable.has(id));
  dialogContent.innerHTML = `<h2>Заменить роль «${roleDefinitions[currentRole].name}»</h2>
    <p>Выберите задачу, которая действительно нужна в вашей коллекции.</p>
    <div class="dialog-options">${options.map(([id, role]) => `<button class="dialog-option" type="button" data-role-option="${id}">
      <strong>${role.name}</strong><span>${role.description}</span>
    </button>`).join("")}</div>`;
  dialog.showModal();
  dialogContent.querySelectorAll("[data-role-option]").forEach((button) => button.addEventListener("click", () => {
    state.roles[index] = button.dataset.roleOption;
    saveState();
    dialog.close();
    renderRoles();
  }));
}

function clamp(value) {
  return Math.max(1, Math.min(5, value));
}

function itemText(item) {
  return Object.values(item.notes || {}).flat().join(" ").toLowerCase();
}

function hasFamily(item, family) {
  return item.families.includes(family);
}

function profileFor(item) {
  const notes = itemText(item);
  const freshness = clamp(2
    + (hasFamily(item, "Свежие") ? 2 : 0)
    + (hasFamily(item, "Цитрусовые") ? 1 : 0)
    + (/морск|озон|мят|зелён|чай|бергамот|лимон/.test(notes) ? 1 : 0)
    - (item.oilPercent >= 30 ? 1 : 0));
  const sweetness = clamp(2
    + (hasFamily(item, "Сладкие") ? 2 : 0)
    + (/ванил|карамел|пралине|шоколад|мёд|сахар|тонка/.test(notes) ? 1 : 0)
    - (hasFamily(item, "Свежие") ? 1 : 0));
  const warmth = clamp(2
    + (hasFamily(item, "Пряные и восточные") ? 2 : 0)
    + (/амбр|уд|кож|табак|корица|шафран|сандал/.test(notes) ? 1 : 0)
    + (item.season?.includes("winter") ? 1 : 0)
    - (item.season?.includes("summer") ? 1 : 0));
  const intensity = clamp(Math.round(1 + (item.oilPercent - 18) / 3));
  const formality = clamp(2
    + (item.category === "Селектив" ? 1 : 0)
    + (hasFamily(item, "Древесные") ? 1 : 0)
    + (item.occasion?.includes("evening") ? 1 : 0)
    - (item.occasion?.includes("gym") ? 1 : 0));
  const unusual = clamp(2
    + (item.category === "Селектив" ? 1 : 0)
    + (hasFamily(item, "Пряные и восточные") ? 1 : 0)
    + (/уд|ладан|кож|табак|каннабис|металл|порох/.test(notes) ? 1 : 0));
  return { freshness, sweetness, warmth, intensity, formality, unusual };
}

function profileDistance(profile, target) {
  const entries = Object.entries(target);
  return entries.reduce((sum, [key, value]) => sum + Math.abs(profile[key] - value), 0) / entries.length;
}

function favoriteSimilarity(item, favorite) {
  const familyOverlap = item.families.filter((family) => favorite.families.includes(family)).length;
  const itemNotes = new Set(Object.values(item.notes || {}).flat().map((note) => note.toLowerCase()));
  const favoriteNotes = new Set(Object.values(favorite.notes || {}).flat().map((note) => note.toLowerCase()));
  const noteOverlap = [...itemNotes].filter((note) => favoriteNotes.has(note)).length;
  return familyOverlap * 2.4 + Math.min(noteOverlap, 5) * .55;
}

function dislikePenalty(item, profile) {
  const notes = itemText(item);
  return state.dislikes.reduce((penalty, dislike) => {
    if (dislike === "tooSweet") return penalty + Math.max(0, profile.sweetness - 2) * 1.8;
    if (dislike === "heavy") return penalty + Math.max(0, profile.intensity + profile.warmth - 6) * 1.3;
    if (dislike === "sharp") return penalty + Math.max(0, profile.intensity - 3) + (/перец|имбир|альдегид/.test(notes) ? 2 : 0);
    if (dislike === "powdery") return penalty + (/пудр|ирис|фиалк|мускус/.test(notes) ? 4 : 0);
    if (dislike === "tooFresh") return penalty + Math.max(0, profile.freshness - 3) * 1.6;
    if (dislike === "smoky") return penalty + (/дым|ладан|табак|берёз|кож/.test(notes) ? 4 : 0);
    if (dislike === "loud") return penalty + Math.max(0, profile.intensity - 3) * 2;
    if (dislike === "floral") return penalty + (hasFamily(item, "Цветочные") ? 4 : 0);
    return penalty;
  }, 0);
}

function tasteScore(item) {
  const favoriteItems = selectedFavoriteItems();
  if (!favoriteItems.length) return 0;
  return Math.max(...favoriteItems.map((favorite) => favoriteSimilarity(item, favorite)));
}

function moodScore(profile) {
  if (!state.moods.length) return 0;
  const priorityWeights = [1.2, .65, .4];
  return state.moods.reduce((score, mood, index) => (
    score + (5 - profileDistance(profile, moodTargets[mood])) * priorityWeights[index]
  ), 0);
}

function candidateScore(item, roleId, selectedItems = []) {
  const profile = item._wardrobeProfile;
  const roleFit = (5 - profileDistance(profile, roleDefinitions[roleId].target)) * 7;
  let diversityPenalty = 0;
  selectedItems.forEach((selected) => {
    const sharedFamilies = item.families.filter((family) => selected.families.includes(family)).length;
    const distance = profileDistance(profile, selected._wardrobeProfile);
    diversityPenalty += sharedFamilies * 3.2 + Math.max(0, 2.2 - distance) * 2.4;
  });
  const primaryFamilyCount = selectedItems.filter((selected) => selected.families[0] === item.families[0]).length;
  if (primaryFamilyCount >= 2) diversityPenalty += 12;
  return roleFit + tasteScore(item) + moodScore(profile) - dislikePenalty(item, profile) - diversityPenalty;
}

function roleEligible(item, roleId) {
  const profile = item._wardrobeProfile;
  if (["reset", "warmWeather", "maximumFreshness"].includes(roleId)) return profile.freshness >= 4 && profile.intensity <= 3;
  if (roleId === "base") return profile.intensity >= 2 && profile.intensity <= 4 && profile.unusual <= 4;
  if (roleId === "composure") return profile.formality >= 3 && profile.intensity <= 4;
  if (roleId === "attraction") return profile.sweetness + profile.warmth >= 7 && profile.intensity >= 3;
  if (["accent", "experiment", "creative"].includes(roleId)) return profile.unusual >= 4 && profile.intensity >= 3;
  if (roleId === "comfort") return profile.warmth >= 4 && profile.intensity <= 3;
  if (roleId === "coldWeather") return profile.warmth >= 4 && profile.intensity >= 3;
  return true;
}

function buildRecommendations() {
  const selected = [];
  state.roles.forEach((roleId) => {
    const candidates = fragrances.filter((item) => !selected.some((entry) => entry.id === item.id));
    const diverseCandidates = candidates.filter((item) => selected.filter((entry) => entry.families[0] === item.families[0]).length < 2);
    const roleCandidates = diverseCandidates.filter((item) => roleEligible(item, roleId));
    const pool = roleCandidates.length ? roleCandidates : (diverseCandidates.length ? diverseCandidates : candidates);
    pool.sort((a, b) => candidateScore(b, roleId, selected) - candidateScore(a, roleId, selected)
      || a.id.localeCompare(b.id, "ru", { numeric: true }));
    selected.push(pool[0]);
  });
  state.recommendations = selected;
  saveState();
}

function descriptorsFor(item) {
  const profile = item._wardrobeProfile;
  const values = [
    [profile.freshness, "свежий"], [profile.sweetness, "мягкий"], [profile.warmth, "тёплый"],
    [profile.intensity, "выразительный"], [profile.formality, "элегантный"], [profile.unusual, "необычный"],
  ].sort((a, b) => b[0] - a[0]);
  return values.slice(0, 3).map((entry) => entry[1]);
}

function renderProcessing() {
  setScreen("processing");
  content.innerHTML = `<div class="stylist-work"><div>
    <p class="wardrobe-kicker">Цифровой парфюмерный стилист FLUIDE</p>
    <h1>Собираем ваш гардероб</h1>
    <div class="stylist-lines">
      <p class="stylist-line">Анализируем любимые ароматы</p>
      <p class="stylist-line">Подбираем разные характеры</p>
      <p class="stylist-line">Исключаем похожие композиции</p>
      <p class="stylist-line">Проверяем баланс гардероба</p>
      <p class="stylist-line">Готовим ароматы к примерке</p>
    </div>
  </div></div>`;
  const lines = [...document.querySelectorAll(".stylist-line")];
  lines.forEach((line, index) => setTimeout(() => line.classList.add("is-active"), index * 420));
  setTimeout(() => {
    buildRecommendations();
    renderFitting();
  }, 2400);
}

function fragranceVisual(item, className) {
  const image = item.thumbnail || item.image;
  return image
    ? `<img src="${escapeHtml(image)}" alt="Флакон ${escapeHtml(item.title)}" />`
    : `<strong>${escapeHtml(item.id)}</strong>`;
}

function fittingCardMarkup(item, index) {
  const role = roleDefinitions[state.roles[index]];
  const reaction = state.reactions[index] || "";
  const productUrl = `product.html?id=${encodeURIComponent(item.id)}&return=${encodeURIComponent("wardrobe.html?view=fitting")}`;
  return `<article class="fitting-card">
    <a class="fitting-card__link" href="${productUrl}">
      <div class="fitting-visual"><span class="fitting-role">${String(index + 1).padStart(2, "0")} · ${role.name}</span>${fragranceVisual(item)}</div>
      <div class="fitting-body">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="fitting-tags">${descriptorsFor(item).join(" · ")}</p>
        <p class="fitting-reason">${role.reason}</p>
        <span class="fitting-card__open">Подробнее <span aria-hidden="true">→</span></span>
      </div>
    </a>
    <div class="reactions">
      <button class="reaction${reaction === "fit" ? " is-active" : ""}" type="button" data-reaction="fit" data-slot="${index}">Подходит</button>
      <button class="reaction${reaction === "doubt" ? " is-active" : ""}" type="button" data-reaction="doubt" data-slot="${index}">Сомневаюсь</button>
      <button class="reaction reaction--replace" type="button" data-replace-slot="${index}">Заменить аромат</button>
    </div>
  </article>`;
}

function renderFitting() {
  setScreen("fitting");
  content.innerHTML = `
    <div class="fitting-screen">
      <div class="fitting-heading">
        <p class="wardrobe-kicker">Первая примерка</p>
        <h1 class="wardrobe-title">Ваши пять ароматов готовы</h1>
        <p class="wardrobe-lead">Покажите экран консультанту: он подготовит пять блоттеров, по одному на каждую роль.</p>
      </div>
      <div class="fitting-grid">${state.recommendations.map(fittingCardMarkup).join("")}</div>
      <div class="wardrobe-actions fitting-actions">
        <button class="wardrobe-button wardrobe-button--secondary" id="fitting-back" type="button">Изменить роли</button>
        <button class="wardrobe-button" id="finish-wardrobe" type="button">Завершить гардероб</button>
      </div>
    </div>`;
  document.querySelectorAll("[data-reaction]").forEach((button) => button.addEventListener("click", () => {
    state.reactions[button.dataset.slot] = button.dataset.reaction;
    saveState();
    renderFitting();
  }));
  document.querySelectorAll("[data-replace-slot]").forEach((button) => button.addEventListener("click", () => showReplacementDialog(Number(button.dataset.replaceSlot))));
  document.querySelector("#fitting-back").addEventListener("click", renderRoles);
  document.querySelector("#finish-wardrobe").addEventListener("click", renderFinal);
}

function replacementCandidates(slot) {
  const roleId = state.roles[slot];
  const currentIds = new Set(state.recommendations.map((item) => item.id));
  const others = state.recommendations.filter((_, index) => index !== slot);
  const candidates = fragrances.filter((item) => !currentIds.has(item.id));
  const roleCandidates = candidates.filter((item) => roleEligible(item, roleId));
  return (roleCandidates.length >= 2 ? roleCandidates : candidates)
    .sort((a, b) => candidateScore(b, roleId, others) - candidateScore(a, roleId, others)
      || a.id.localeCompare(b.id, "ru", { numeric: true })).slice(0, 2);
}

function showReplacementDialog(slot) {
  const role = roleDefinitions[state.roles[slot]];
  const alternatives = replacementCandidates(slot);
  dialogContent.innerHTML = `<h2>Заменим аромат «${role.name}»</h2>
    <p>Два варианта сохраняют роль и не повторяют остальные четыре аромата.</p>
    <div class="dialog-options">${alternatives.map((item, index) => `<button class="dialog-option" type="button" data-replacement-id="${escapeHtml(item.id)}">
      <strong>Вариант ${index === 0 ? "A" : "B"}: ${escapeHtml(item.title)}</strong>
      <span>${descriptorsFor(item).join(" · ")}</span>
    </button>`).join("")}
      <button class="dialog-option" type="button" data-keep-current><strong>Оставить первоначальный</strong><span>${escapeHtml(state.recommendations[slot].title)}</span></button>
    </div>`;
  dialog.showModal();
  dialogContent.querySelectorAll("[data-replacement-id]").forEach((button) => button.addEventListener("click", () => {
    const replacement = fragrances.find((item) => item.id === button.dataset.replacementId);
    if (replacement) state.recommendations[slot] = replacement;
    state.reactions[slot] = "fit";
    saveState();
    dialog.close();
    renderFitting();
  }));
  dialogContent.querySelector("[data-keep-current]").addEventListener("click", () => dialog.close());
}

function finalCardMarkup(item, index) {
  const role = roleDefinitions[state.roles[index]];
  return `<article class="final-card">
    <div class="final-visual"><span class="final-role">${role.name}</span>${fragranceVisual(item)}</div>
    <div class="final-body"><h2>${escapeHtml(item.title)}</h2><p class="final-reason">${role.reason}</p></div>
  </article>`;
}

function renderFinal() {
  setScreen("final");
  content.innerHTML = `
    <p class="wardrobe-kicker">Персональная коллекция</p>
    <h1 class="wardrobe-title">Ваш парфюмерный гардероб готов</h1>
    <div class="final-layout">
      <div class="final-grid">${state.recommendations.map(finalCardMarkup).join("")}</div>
      <aside class="offer">
        <p class="offer-kicker">Персональный комплект</p>
        <h2>5 ароматов</h2>
        <p class="offer-volume">5 флаконов × 30 мл</p>
        <div class="offer-price"><span>Обычная стоимость</span><s>15 000 ₽</s></div>
        <div class="offer-price"><span>Стоимость гардероба</span><strong>9 900 ₽</strong></div>
        <div class="offer-price"><span>Ваша выгода</span><strong>5 100 ₽</strong></div>
        <div class="offer-price"><span>Персональный подбор</span><strong>0 ₽</strong></div>
        <button class="wardrobe-button" id="add-wardrobe" type="button">Добавить весь гардероб</button>
      </aside>
    </div>
    <div class="wardrobe-actions">
      <button class="wardrobe-button wardrobe-button--secondary" id="final-back" type="button">Вернуться к примерке</button>
      <button class="wardrobe-button wardrobe-button--secondary" id="restart-wardrobe" type="button">Собрать заново</button>
    </div>`;
  document.querySelector("#add-wardrobe").addEventListener("click", (event) => {
    localStorage.setItem("fluide-cart-count", "5");
    document.dispatchEvent(new CustomEvent("fluide-cart-change", { detail: { count: 5 } }));
    event.currentTarget.textContent = "Гардероб добавлен";
    event.currentTarget.disabled = true;
  });
  document.querySelector("#final-back").addEventListener("click", renderFitting);
  document.querySelector("#restart-wardrobe").addEventListener("click", () => {
    resetState();
    renderProfile();
  });
}

dialogClose.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

fetch("./fragrances.json")
  .then((response) => {
    if (!response.ok) throw new Error("Не удалось загрузить ароматы");
    return response.json();
  })
  .then((items) => {
    fragrances = items.map((item) => ({ ...item, _wardrobeProfile: profileFor(item) }));
    state.favorites = state.favorites.filter((id) => fragrances.some((item) => item.id === id));
    state.recommendations = storedRecommendationIds
      .map((id) => fragrances.find((item) => item.id === id))
      .filter(Boolean);
    if (requestedView === "fitting" && state.recommendations.length === 5) renderFitting();
    else renderWelcome();
  })
  .catch(() => {
    content.innerHTML = '<p class="wardrobe-loading">Не удалось загрузить ароматы. Перезапустите приложение при подключённом интернете.</p>';
  });
