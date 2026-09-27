const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
};

const documentListeners = new Map();
const document = {
  visibilityState: "visible",
  documentElement: { style: { setProperty() {} } },
  querySelectorAll() { return []; },
  addEventListener(type, listener) { documentListeners.set(type, listener); },
  dispatchEvent(event) { documentListeners.get(event.type)?.(event); },
};

const window = {
  innerHeight: 800,
  visualViewport: null,
  location: { href: "" },
  addEventListener() {},
  setInterval() {},
};

const context = {
  window,
  document,
  localStorage,
  navigator: {},
  console,
  Number,
  JSON,
  Math,
  String,
  CustomEvent: class CustomEvent {
    constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
  },
  setTimeout() {},
};

vm.runInNewContext(fs.readFileSync("pwa.js", "utf8"), context);
const cart = window.FluideCart;

storage.set("fluide-cart-items", JSON.stringify([{ id: "011", title: "11 AMOR AMOR", volume: 30, price: 1990 }]));
const migrated = cart.read();
assert.equal(migrated[0].kind, "fragrance");
assert.equal(migrated[0].key, "fragrance:011:30");

assert.equal(cart.add({ kind: "product", id: "product-01", title: "La Sultan", volume: "300 мл", price: 550 }), true);
assert.equal(cart.add({ kind: "product", id: "product-01", title: "La Sultan", volume: "300 мл", price: 550 }), false);
assert.equal(cart.count(), 2);
assert.equal(cart.total(), 2480);

cart.remove("fragrance:011:30");
assert.equal(cart.count(), 1);
assert.equal(cart.total(), 490);

cart.clear();
assert.deepEqual(cart.read(), []);
assert.equal(localStorage.getItem("fluide-cart-count"), "0");

[
  { id: "gift-1", price: 3490 },
  { id: "gift-2", price: 1990 },
  { id: "gift-3", price: 2490 },
  { id: "gift-4", price: 1990 },
].forEach((item) => cart.add({
  key: `fragrance:${item.id}:30`,
  kind: "fragrance",
  id: item.id,
  title: item.id,
  volume: 30,
  price: item.price,
}));
const fourFragrancePricing = cart.pricing();
assert.equal(fourFragrancePricing.subtotal, 9960);
assert.equal(fourFragrancePricing.discount, 1990);
assert.equal(fourFragrancePricing.total, 7970);
assert.equal(fourFragrancePricing.giftCount, 1);
assert.equal(Object.values(fourFragrancePricing.giftQuantities).reduce((sum, count) => sum + count, 0), 1, "При одинаковой минимальной цене подарком должен стать только один аромат");
assert.equal(cart.total(), 7970);
cart.remove("fragrance:gift-2:30");
assert.equal(cart.pricing().giftCount, 0, "При трех ароматах подарок должен исчезнуть");
assert.equal(cart.total(), 7970);
cart.clear();

[100, 200, 300, 400, 500, 600, 700, 800].forEach((price, index) => cart.add({
  key: `fragrance:eight-${index}:30`,
  kind: "fragrance",
  id: `eight-${index}`,
  title: `Eight ${index}`,
  volume: 30,
  price,
}));
const eightFragrancePricing = cart.pricing();
assert.equal(eightFragrancePricing.giftCount, 2);
assert.equal(eightFragrancePricing.discount, 300);
assert.equal(eightFragrancePricing.total, 3300);
cart.clear();

storage.set("fluide-cart-items", JSON.stringify([{
  key: "wardrobe:legacy",
  kind: "wardrobe",
  id: "wardrobe:legacy",
  title: "Парфюмерный гардероб",
  price: 12460,
  fragranceVolumes: [
    { id: "001", volume: 30, price: 3490 },
    { id: "002", volume: 30, price: 3490 },
    { id: "003", volume: 30, price: 1990 },
    { id: "006", volume: 30, price: 3490 },
  ],
}]));
const migratedWardrobe = cart.read()[0];
assert.equal(migratedWardrobe.originalPrice, 12460);
assert.equal(migratedWardrobe.discount, 1990);
assert.equal(migratedWardrobe.price, 10470);
assert.equal(cart.total(), 10470);
cart.clear();

assert.equal(cart.add({
  key: "product:product-33:015",
  kind: "product",
  id: "product-33",
  title: "Парфюм для машины",
  variant: "015 - SAUVAGE",
  price: 300,
}), true);
assert.equal(cart.add({
  key: "product:product-33:015",
  kind: "product",
  id: "product-33",
  title: "Парфюм для машины",
  variant: "015 - SAUVAGE",
  price: 300,
}), false);
assert.equal(cart.add({
  key: "product:product-33:016",
  kind: "product",
  id: "product-33",
  title: "Парфюм для машины",
  variant: "016 - AVENTUS",
  price: 300,
}), true);
assert.equal(cart.count(), 2);
assert.deepEqual(cart.read().map((item) => item.variant), ["015 - SAUVAGE", "016 - AVENTUS"]);
assert.deepEqual(cart.read().map((item) => item.price), [500, 500]);
cart.clear();

console.log("Cart storage, migration, duplicate protection, gift pricing, totals and removal checked");
