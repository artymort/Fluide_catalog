function updateAppHeight() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

updateAppHeight();
window.addEventListener("resize", updateAppHeight);
window.addEventListener("orientationchange", () => setTimeout(updateAppHeight, 150));
window.visualViewport?.addEventListener("resize", updateAppHeight);

const cartStorageKey = "fluide-cart-items";

function cartItemKey(item) {
  if (item.key) return String(item.key);
  const kind = item.kind || (/^\d+$/.test(String(item.id)) ? "fragrance" : "product");
  const variant = item.volume ? `:${item.volume}` : "";
  return `${kind}:${item.id}${variant}`;
}

function readCartItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((item) => item && item.id && item.title)
      .map((item) => {
        const kind = item.kind || (/^\d+$/.test(String(item.id)) ? "fragrance" : "product");
        return { ...item, kind, key: cartItemKey({ ...item, kind }), quantity: Math.max(1, Number(item.quantity) || 1) };
      });
  } catch {
    return [];
  }
}

function cartCount(items = readCartItems()) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function writeCartItems(items) {
  localStorage.setItem(cartStorageKey, JSON.stringify(items));
  const count = cartCount(items);
  localStorage.setItem("fluide-cart-count", String(count));
  document.dispatchEvent(new CustomEvent("fluide-cart-change", { detail: { count } }));
  return count;
}

window.FluideCart = {
  read: readCartItems,
  count: cartCount,
  total(items = readCartItems()) {
    return items.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  },
  has(key) {
    return readCartItems().some((item) => item.key === key);
  },
  add(item) {
    const items = readCartItems();
    const normalized = { ...item, key: cartItemKey(item), quantity: Math.max(1, Number(item.quantity) || 1) };
    if (items.some((entry) => entry.key === normalized.key)) return false;
    writeCartItems([...items, normalized]);
    return true;
  },
  remove(key) {
    const items = readCartItems().filter((item) => item.key !== key);
    writeCartItems(items);
  },
  clear() {
    writeCartItems([]);
  },
};

function updateSiteCart(count = window.FluideCart.count()) {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  localStorage.setItem("fluide-cart-count", String(safeCount));
  document.querySelectorAll(".site-cart").forEach((cart) => {
    const countLabel = cart.querySelector(".site-cart__count");
    if (countLabel) countLabel.textContent = String(safeCount);
    cart.setAttribute("aria-label", `Выбранные товары: ${safeCount}`);
  });
}

updateSiteCart();
document.addEventListener("fluide-cart-change", (event) => updateSiteCart(Number(event.detail?.count)));
document.querySelectorAll(".site-cart").forEach((cart) => cart.addEventListener("click", () => {
  window.location.href = "cart.html";
}));

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
  const serviceWorkerUrl = "./sw.js?v=76";

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
