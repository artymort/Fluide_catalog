const form = document.querySelector("#selection-form");
const options = [...form.querySelectorAll('input[name="gender"]')];
const nextButton = form.querySelector(".selection-next");
const status = form.querySelector(".selection-status");
const savedGender = sessionStorage.getItem("fluide-selection-gender");

function updateSelectedCard(selectedInput) {
  options.forEach((option) => {
    option.closest(".selection-option").classList.toggle("is-selected", option === selectedInput);
  });
}

if (savedGender) {
  const savedOption = options.find((option) => option.value === savedGender);
  if (savedOption) {
    savedOption.checked = true;
    updateSelectedCard(savedOption);
    nextButton.disabled = false;
  }
}

options.forEach((option) => {
  option.addEventListener("change", () => {
    sessionStorage.setItem("fluide-selection-gender", option.value);
    updateSelectedCard(option);
    nextButton.disabled = false;
    status.textContent = "";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  document.dispatchEvent(
    new CustomEvent("fluide:selection-step-complete", {
      detail: { gender: sessionStorage.getItem("fluide-selection-gender") },
    })
  );
  status.textContent = "Выбор сохранён. Следующий вопрос будет добавлен на следующем этапе.";
});
