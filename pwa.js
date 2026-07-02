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
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Не удалось зарегистрировать Service Worker:", error);
      });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
