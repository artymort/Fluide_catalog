const placeholderSections = {
  actions: {
    title: "Акции",
    description: "Скоро здесь появятся актуальные предложения FLUIDE\u00a0ATELIER.",
  },
  exclusive: {
    title: "Эксклюзивные ароматы",
    description: "Мы готовим отдельную подборку редких композиций FLUIDE\u00a0ATELIER.",
  },
};

const sectionKey = new URLSearchParams(window.location.search).get("section");
const section = placeholderSections[sectionKey] || placeholderSections.actions;

document.querySelector("#placeholder-title").textContent = section.title;
document.querySelector("#placeholder-description").textContent = section.description;
document.title = `FLUIDE — ${section.title}`;
