function updateAppHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

updateAppHeight();
window.addEventListener("resize", updateAppHeight);
window.addEventListener("orientationchange", () => setTimeout(updateAppHeight, 150));
window.visualViewport?.addEventListener("resize", updateAppHeight);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Не удалось зарегистрировать Service Worker:", error);
    });
  });
}
