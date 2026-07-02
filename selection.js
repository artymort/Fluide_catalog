const form = document.querySelector("#selection-form");
const optionsContainer = document.querySelector("#selection-options");
const title = document.querySelector("#selection-title");
const help = document.querySelector("#selection-help");
const stepCounter = document.querySelector(".selection-step");
const nextButton = form.querySelector(".selection-next");
const previousButton = form.querySelector(".selection-previous");
const status = form.querySelector(".selection-status");

const steps = [
  {
    key: "gender",
    title: "Для кого выбираем аромат?",
    help: "Выберите один вариант",
    options: [
      { value: "женский", label: "Женский", caption: "34 аромата", tone: "pink" },
      { value: "мужской", label: "Мужской", caption: "24 аромата", tone: "blue" },
      { value: "унисекс", label: "Унисекс", caption: "41 аромат", tone: "ink" },
    ],
  },
  {
    key: "family",
    title: "Какие ноты вам ближе?",
    help: "Выберите главное направление",
    compact: true,
    options: [
      { value: "Цветочные", label: "Цветочные", caption: "Роза, жасмин, пион", tone: "pink" },
      { value: "Фруктовые", label: "Фруктовые", caption: "Ягоды, персик, груша", tone: "peach" },
      { value: "Цитрусовые", label: "Цитрусовые", caption: "Бергамот, лимон, мандарин", tone: "cream" },
      { value: "Древесные", label: "Древесные", caption: "Кедр, сандал, ветивер", tone: "ink" },
      { value: "Сладкие", label: "Сладкие", caption: "Ваниль, пралине, какао", tone: "pink" },
      { value: "Свежие", label: "Свежие", caption: "Морские, зелёные, чайные", tone: "blue" },
      { value: "Пряные и восточные", label: "Пряные", caption: "Перец, амбра, шафран", tone: "peach" },
      { value: "", label: "Неважно", caption: "Покажем все направления", tone: "cream" },
    ],
  },
  {
    key: "intensity",
    title: "Какую насыщенность предпочитаете?",
    help: "Ориентируемся на долю парфюмерного масла",
    options: [
      { value: "light", label: "Лёгкая", caption: "20–22% масла", tone: "cream" },
      { value: "balanced", label: "Сбалансированная", caption: "25–28% масла", tone: "blue" },
      { value: "intense", label: "Насыщенная", caption: "30–35% масла", tone: "ink" },
    ],
  },
  {
    key: "concentration",
    title: "Какой формат вам ближе?",
    help: "Последний шаг",
    options: [
      { value: "Eau de parfum", label: "Парфюмерная вода", caption: "Eau de parfum", tone: "pink" },
      { value: "Eau de extrait", label: "Парфюмерный экстракт", caption: "Eau de extrait", tone: "ink" },
      { value: "", label: "Неважно", caption: "Показать оба формата", tone: "cream" },
    ],
  },
];

const answers = JSON.parse(sessionStorage.getItem("fluide-selection") || "{}");
let currentStep = 0;

function optionMarkup(option, index, key, selected) {
  const checked = selected === option.value ? " checked" : "";
  const selectedClass = selected === option.value ? " is-selected" : "";
  return `
    <label class="selection-option selection-option--${option.tone}${selectedClass}">
      <input type="radio" name="${key}" value="${option.value}"${checked} />
      <span class="selection-option__number">${String(index + 1).padStart(2, "0")}</span>
      <span class="selection-option__mark" aria-hidden="true"></span>
      <span class="selection-option__title">${option.label}</span>
      <span class="selection-option__caption">${option.caption}</span>
    </label>`;
}

function renderStep() {
  const step = steps[currentStep];
  const selected = Object.prototype.hasOwnProperty.call(answers, step.key) ? answers[step.key] : null;
  title.textContent = step.title;
  help.textContent = step.help;
  stepCounter.textContent = `${String(currentStep + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  stepCounter.setAttribute("aria-label", `Шаг ${currentStep + 1} из ${steps.length}`);
  optionsContainer.dataset.compact = step.compact ? "true" : "false";
  optionsContainer.innerHTML = step.options
    .map((option, index) => optionMarkup(option, index, step.key, selected))
    .join("");
  previousButton.hidden = currentStep === 0;
  nextButton.disabled = selected === null;
  nextButton.firstChild.textContent = currentStep === steps.length - 1 ? "Показать ароматы " : "Продолжить ";
  status.textContent = "";

  optionsContainer.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      answers[step.key] = input.value;
      sessionStorage.setItem("fluide-selection", JSON.stringify(answers));
      optionsContainer.querySelectorAll(".selection-option").forEach((card) => card.classList.remove("is-selected"));
      input.closest(".selection-option").classList.add("is-selected");
      nextButton.disabled = false;
    });

    input.addEventListener("focus", () => {
      if (input.matches(":focus-visible")) input.closest(".selection-option").classList.add("is-keyboard-focused");
    });
    input.addEventListener("blur", () => input.closest(".selection-option").classList.remove("is-keyboard-focused"));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
    return;
  }

  const params = new URLSearchParams();
  Object.entries(answers).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  window.location.href = `results.html?${params.toString()}`;
});

previousButton.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

renderStep();
