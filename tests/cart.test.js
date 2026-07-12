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
assert.equal(cart.total(), 2540);

cart.remove("fragrance:011:30");
assert.equal(cart.count(), 1);
assert.equal(cart.total(), 550);

cart.clear();
assert.deepEqual(cart.read(), []);
assert.equal(localStorage.getItem("fluide-cart-count"), "0");

console.log("Cart storage, migration, duplicate protection, totals and removal checked");
