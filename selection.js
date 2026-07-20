const form = document.querySelector("#selection-form");
const optionsContainer = document.querySelector("#selection-options");
const title = document.querySelector("#selection-title");
const help = document.querySelector("#selection-help");
const stepCounter = document.querySelector(".selection-step");
const nextButton = form.querySelector(".selection-next");
const previousButton = form.querySelector(".selection-previous");
const skipButton = form.querySelector(".selection-skip");
const status = form.querySelector(".selection-status");

const steps = [
  {
    key: "gender",
    title: "Кому подбираем аромат?",
    help: "Выберите один вариант",
    type: "single",
    options: [
      { value: "женский", label: "Женские", caption: "Покажем женские и унисекс", tone: "pink" },
      { value: "мужской", label: "Мужские", caption: "Покажем мужские и унисекс", tone: "blue" },
      { value: "унисекс", label: "Унисекс", caption: "Только универсальные ароматы", tone: "ink" },
    ],
  },
  {
    key: "occasion",
    title: "Для какого случая?",
    help: "Можно выбрать несколько вариантов",
    type: "multi",
    compact: true,
    options: [
      { value: "everyday", label: "На каждый день", caption: "Спокойные и универсальные", tone: "cream" },
      { value: "evening", label: "Вечерние", caption: "Более выразительные", tone: "ink" },
      { value: "date", label: "Свидание", caption: "Мягкие и запоминающиеся", tone: "pink" },
      { value: "gym", label: "Спортзал", caption: "Чистые и лёгкие", tone: "blue" },
      { value: "walk", label: "Прогулка", caption: "Свежие и непринуждённые", tone: "peach" },
    ],
  },
  {
    key: "family",
    title: "Какие ноты вам ближе?",
    help: "Можно выбрать несколько направлений",
    type: "multi",
    compact: true,
    options: [
      { value: "Цветочные", label: "Цветочные", caption: "Роза, жасмин, пион", tone: "pink" },
      { value: "Фруктовые", label: "Фруктовые", caption: "Ягоды, персик, груша", tone: "peach" },
      { value: "Цитрусовые", label: "Цитрусовые", caption: "Бергамот, лимон, мандарин", tone: "cream" },
      { value: "Древесные", label: "Древесные", caption: "Кедр, сандал, ветивер", tone: "ink" },
      { value: "Сладкие", label: "Сладкие", caption: "Ваниль, пралине, какао", tone: "pink" },
      { value: "Свежие", label: "Свежие", caption: "Морские, зелёные, чайные", tone: "blue" },
      { value: "Пряные и восточные", label: "Пряные", caption: "Перец, амбра, шафран", tone: "peach" },
    ],
  },
  {
    key: "season",
    title: "Для какого времени года?",
    help: "Можно выбрать несколько сезонов",
    type: "multi",
    options: [
      { value: "summer", label: "Лето", caption: "Лёгкие и свежие", tone: "blue" },
      { value: "autumn", label: "Осень", caption: "Тёплые и мягкие", tone: "peach" },
      { value: "winter", label: "Зима", caption: "Плотные и стойкие", tone: "ink" },
      { value: "spring", label: "Весна", caption: "Цветочные и чистые", tone: "pink" },
    ],
  },
];

const answers = JSON.parse(sessionStorage.getItem("fluide-selection") || "{}");
let currentStep = 0;
let fragrances = [];

function activeStepKeys() {
  return steps.slice(0, currentStep + 1).map((step) => step.key);
}

function answerValues(key) {
  const value = answers[key];
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

function setAnswer(key, value, type) {
  if (type === "single") {
    answers[key] = value;
  } else {
    const values = new Set(answerValues(key));
    if (values.has(value)) values.delete(value);
    else values.add(value);
    answers[key] = [...values];
  }
  sessionStorage.setItem("fluide-selection", JSON.stringify(answers));
}

function clearStepAnswer(key) {
  delete answers[key];
  sessionStorage.setItem("fluide-selection", JSON.stringify(answers));
}

function genderMatches(item, selectedGender) {
  if (!selectedGender) return true;
  if (selectedGender === "унисекс") return item.gender === "унисекс";
  return item.gender === selectedGender || item.gender === "унисекс";
}

function metadataMatches(item, key, selectedValues) {
  if (!selectedValues.length) return true;
  const itemValues = Array.isArray(item[key]) ? item[key] : [];
  if (!itemValues.length) return true;
  return selectedValues.some((value) => itemValues.includes(value));
}

function countMatches() {
  if (!fragrances.length) return null;
  const activeKeys = activeStepKeys();
  const gender = activeKeys.includes("gender") ? answers.gender : "";
  const families = activeKeys.includes("family") ? answerValues("family") : [];
  const occasions = activeKeys.includes("occasion") ? answerValues("occasion") : [];
  const seasons = activeKeys.includes("season") ? answerValues("season") : [];
  return fragrances.filter((item) => (
    genderMatches(item, gender)
    && (!families.length || families.some((family) => item.families.includes(family)))
    && metadataMatches(item, "occasion", occasions)
    && metadataMatches(item, "season", seasons)
  )).length;
}

function updateStatus() {
  if (currentStep !== steps.length - 1) {
    status.textContent = "";
    return;
  }
  const count = countMatches();
  if (count === null) {
    status.textContent = "Считаем подходящие ароматы…";
    return;
  }
  status.textContent = `Подходит ароматов: ${Math.min(6, count)}`;
}

function optionMarkup(option, index, step, selectedValues) {
  const selected = selectedValues.includes(option.value);
  const checked = selected ? " checked" : "";
  const selectedClass = selected ? " is-selected" : "";
  const inputType = step.type === "single" ? "radio" : "checkbox";
  return `
    <label class="selection-option selection-option--${option.tone}${selectedClass}">
      <input type="${inputType}" name="${step.key}" value="${option.value}"${checked} />
      <span class="selection-option__number">${String(index + 1).padStart(2, "0")}</span>
      <span class="selection-option__mark" aria-hidden="true"></span>
      <span class="selection-option__title">${option.label}</span>
      <span class="selection-option__caption">${option.caption}</span>
    </label>`;
}

function updateNextState(step) {
  nextButton.disabled = answerValues(step.key).length === 0;
}

function renderStep() {
  const step = steps[currentStep];
  const selectedValues = answerValues(step.key);
  title.textContent = step.title;
  help.textContent = step.help;
  stepCounter.textContent = `Шаг ${String(currentStep + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  stepCounter.setAttribute("aria-label", `Шаг ${currentStep + 1} из ${steps.length}`);
  optionsContainer.dataset.compact = step.compact ? "true" : "false";
  optionsContainer.innerHTML = step.options
    .map((option, index) => optionMarkup(option, index, step, selectedValues))
    .join("");
  previousButton.hidden = currentStep === 0;
  nextButton.firstChild.textContent = currentStep === steps.length - 1 ? "Показать ароматы " : "Продолжить ";
  updateNextState(step);
  updateStatus();

  optionsContainer.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      setAnswer(step.key, input.value, step.type);
      if (step.type === "single") {
        optionsContainer.querySelectorAll(".selection-option").forEach((card) => card.classList.remove("is-selected"));
      }
      input.closest(".selection-option").classList.toggle("is-selected", input.checked);
      updateNextState(step);
      updateStatus();
    });

    input.addEventListener("focus", () => {
      if (input.matches(":focus-visible")) input.closest(".selection-option").classList.add("is-keyboard-focused");
    });
    input.addEventListener("blur", () => input.closest(".selection-option").classList.remove("is-keyboard-focused"));
  });
}

function goNext() {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
    return;
  }

  const params = new URLSearchParams();
  params.set("mode", "selection");
  if (answers.gender) params.set("gender", answers.gender);
  ["occasion", "family", "season"].forEach((key) => {
    answerValues(key).forEach((value) => params.append(key, value));
  });
  window.location.href = `results.html?${params.toString()}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  goNext();
});

skipButton.addEventListener("click", () => {
  clearStepAnswer(steps[currentStep].key);
  goNext();
});

previousButton.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

fetch("./fragrances.json?v=2")
  .then((response) => {
    if (!response.ok) throw new Error("Не удалось загрузить каталог");
    return response.json();
  })
  .then((data) => {
    fragrances = data;
    updateStatus();
  })
  .catch(() => {
    status.textContent = "Не удалось посчитать ароматы. Подбор всё равно доступен.";
  });

renderStep();
