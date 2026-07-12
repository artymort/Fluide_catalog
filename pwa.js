function updateAppHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

updateAppHeight();
window.addEventListener("resize", updateAppHeight);
window.addEventListener("orientationchange", () => setTimeout(updateAppHeight, 150));
window.visualViewport?.addEventListener("resize", updateAppHeight);

function updateSiteCart(count = Number(localStorage.getItem("fluide-cart-count") || 0)) {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  document.querySelectorAll(".site-cart").forEach((cart) => {
    const countLabel = cart.querySelector(".site-cart__count");
    if (countLabel) countLabel.textContent = String(safeCount);
    cart.setAttribute("aria-label", `Выбранные товары: ${safeCount}`);
  });
}

updateSiteCart();
document.addEventListener("fluide-cart-change", (event) => updateSiteCart(Number(event.detail?.count)));

let screenWakeLock = null;

async function keepScreenAwake() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible" || screenWakeLock) {
    return;
  }

  try {
    screenWakeLock = await navigator.wakeLock.request("screen");
    screenWakeLock.addEventListener("release", () => {
      screenWakeLock = null;
    });
  } catch (error) {
    console.warn("Не удалось запретить отключение экрана:", error);
  }
}

keepScreenAwake();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") keepScreenAwake();
});
window.addEventListener("pageshow", keepScreenAwake);

if ("serviceWorker" in navigator) {
  let serviceWorkerRegistration = null;
  const serviceWorkerUrl = "./sw.js?v=47";

  async function registerAndUpdateServiceWorker() {
    try {
      serviceWorkerRegistration ||= await navigator.serviceWorker.register(serviceWorkerUrl, {
        scope: "./",
        updateViaCache: "none",
      });
      await serviceWorkerRegistration.update();
      serviceWorkerRegistration.waiting?.postMessage({ type: "SKIP_WAITING" });
    } catch (error) {
      console.error("Не удалось обновить Service Worker:", error);
    }
  }

  if (document.readyState === "complete") {
    registerAndUpdateServiceWorker();
  } else {
    window.addEventListener("load", registerAndUpdateServiceWorker, { once: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registerAndUpdateServiceWorker();
  });
  window.addEventListener("pageshow", registerAndUpdateServiceWorker);
  window.setInterval(registerAndUpdateServiceWorker, 60 * 1000);

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
