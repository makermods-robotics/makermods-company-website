import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('metal-arm-buy.html', 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
assert.match(html, /assets\/maker-arm\/star-arm-102-hd.jpg/);
assert.equal([...html.matchAll(/<button type="button" class="opt" data-tier=/g)].length, 3);
for (const [id, min] of [['metal-arm-quantity', 1], ['leader-arm-quantity', 0]]) {
  assert.match(html, new RegExp(`<input id="${id}" type="number" min="${min}" max="2147483647" step="1" value="${min}" required`));
}

function createPage({ build = 'single', response, blocked = false, fetchError, deferred } = {}) {
  const makeElement = (value = '') => ({
    dataset: {}, style: {}, listeners: {}, value, innerHTML: 'Checkout',
    addEventListener(type, callback) { this.listeners[type] = callback; },
    setAttribute(name, value) { this[name] = value; },
    setCustomValidity(message) { this.validationMessage = message; },
    reportValidity() { this.reported = true; },
  });
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id,
    makeElement(id === 'metal-arm-quantity' ? '1' : id === 'leader-arm-quantity' ? '0' : ''),
  ]));
  const tiers = ['single', 'bimanual', 'leader-follower'].map(tier => Object.assign(makeElement(), { dataset: { tier } }));
  const dynamic = Object.fromEntries(['.dyn-price', '.dyn-shipping', '.dyn-arms'].map(selector => [selector, [makeElement()]]));
  const requests = [], popups = [], alerts = [];
  const location = { search: `?build=${build}` };
  vm.runInNewContext(source, {
    URLSearchParams, console: { error() {} },
    document: { getElementById: id => elements.get(id), querySelectorAll: selector => selector.startsWith('#tier-list') ? tiers : dynamic[selector] ?? [] },
    window: { location, open() {
      if (blocked) return null;
      const popup = { location: {}, closed: false, close() { this.closed = true; } };
      popups.push(popup);
      return popup;
    } },
    alert: message => alerts.push(message),
    fetch: async (url, options) => {
      assert.ok(url.endsWith('/api/2026-07/graphql.json'));
      requests.push(JSON.parse(options.body));
      if (deferred) await deferred;
      if (fetchError) throw new Error(fetchError);
      return response ?? { ok: true, json: async () => ({ data: { cartCreate: {
        cart: { checkoutUrl: 'https://checkout.example/test' }, userErrors: [],
      } } }) };
    },
  });
  return {
    elements, tiers, dynamic, requests, popups, alerts, location,
    quantity(value, kind = 'metal-arm') {
      elements.get(`${kind}-quantity`).value = value;
      elements.get(`${kind}-quantity`).listeners.input();
    },
    checkout: () => elements.get('config-buy-cta').listeners.click({ preventDefault() {} }),
    text: id => elements.get(id).textContent,
    click: id => elements.get(id).listeners.click(),
  };
}
const money = value => `$${value.toLocaleString('en-US')}`;
for (const [build, variant, price, arms] of [
  ['single', '52654970732861', 2499, 1],
  ['bimanual', '52654970831165', 4999, 2],
  ['leader-follower', '52654970863933', 9999, 4],
]) {
  for (const quantity of [1, 2, 5]) {
    for (const leaders of [0, 1, 2, 4]) {
      const page = createPage({ build });
      page.quantity(String(quantity));
      page.quantity(String(leaders), 'leader-arm');
      for (const id of ['cart-total', 'cta-price', 'summary-price']) assert.equal(page.text(id), money(quantity * price + leaders * 199));
      assert.equal(page.text('cart-build-price'), money(quantity * price));
      assert.equal(page.text('summary-shipping'), money(quantity * arms * 249));
      assert.equal(page.dynamic['.dyn-shipping'][0].textContent, money(quantity * arms * 249));
      assert.equal(page.text('cart-arm-count'), `${quantity * arms} Metal Arm${quantity * arms === 1 ? '' : 's'}`);
      assert.equal(page.elements.get('cart-leader-line').hidden, leaders === 0);
      assert.equal(page.text('cart-leader-name'), `Star Arm 102-HD (Leader) × ${leaders}`);
      assert.equal(page.text('cart-leader-price'), money(leaders * 199));
      await page.checkout();
      const lines = [{ merchandiseId: `gid://shopify/ProductVariant/${variant}`, quantity }];
      if (leaders) lines.push({ merchandiseId: 'gid://shopify/ProductVariant/52875826594109', quantity: leaders });
      assert.deepEqual(page.requests[0].variables.input.lines, lines);
      assert.equal(page.popups[0].location.href, 'https://checkout.example/test');
      assert.deepEqual(page.alerts, []);
    }
  }
}

const page = createPage();
page.quantity('2');
page.quantity('3', 'leader-arm');
page.tiers[1].listeners.click();
assert.equal(page.text('cart-total'), '$10,595', 'Switching builds preserves both quantities and bundle pricing');
assert.equal(page.text('cart-arm-count'), '4 Metal Arms');
assert.equal(page.text('build-quantity-label'), 'Bimanual set quantity (2 arms per set)');
assert.equal(page.tiers[1]['aria-pressed'], 'true');
for (let i = 0; i < 3; i++) page.click('leader-arm-decrease');
assert.equal(page.elements.get('leader-arm-decrease').disabled, true);
assert.equal(page.elements.get('cart-leader-line').hidden, true);
page.click('metal-arm-decrease');
assert.equal(page.elements.get('metal-arm-decrease').disabled, true);
page.click('metal-arm-increase');
page.click('leader-arm-increase');
assert.equal(page.text('cart-total'), '$10,197');
for (const kind of ['metal-arm', 'leader-arm']) {
  for (const value of ['', '-1', '1.5', 'abc', 'Infinity', '2147483648', '9007199254740992', ...(kind === 'metal-arm' ? ['0'] : [])]) {
    page.quantity(value, kind);
    await page.checkout();
    assert.ok(page.elements.get(`${kind}-quantity`).validationMessage);
    assert.equal(page.requests.length, 0, `Invalid ${kind} quantity ${value} must not reach Shopify`);
    assert.equal(page.popups.length, 0);
  }
  page.quantity('1', kind);
}
// Checkout must read current fields even if an input event has not fired.
page.elements.get('metal-arm-quantity').value = '3';
page.elements.get('leader-arm-quantity').value = '2';
await page.checkout();
assert.deepEqual(page.requests[0].variables.input.lines.map(line => line.quantity), [3, 2]);
assert.equal(page.text('cart-total'), '$15,395');
assert.equal(createPage({ build: 'unknown' }).text('cart-total'), '$2,499');

const blocked = createPage({ blocked: true });
await blocked.checkout();
assert.equal(blocked.location.href, 'https://checkout.example/test');
for (const options of [
  { fetchError: 'Network unavailable' },
  { response: { ok: false, json: async () => ({}) } },
  { response: { ok: true, json: async () => ({ errors: [{ message: 'GraphQL error' }] }) } },
  { response: { ok: true, json: async () => ({ data: { cartCreate: { userErrors: [{ message: 'Unavailable' }] } } }) } },
  { response: { ok: true, json: async () => ({ data: { cartCreate: { cart: null, userErrors: [] } } }) } },
]) {
  const failed = createPage(options);
  await failed.checkout();
  assert.equal(failed.alerts.length, 1);
  assert.equal(failed.popups[0].closed, true);
  assert.equal(failed.elements.get('config-buy-cta').style.pointerEvents, '');
  assert.equal(failed.elements.get('config-buy-cta')['aria-busy'], 'false');
  await failed.checkout();
  assert.equal(failed.requests.length, 2, 'Customer can retry after an error');
}
let release;
const pending = createPage({ deferred: new Promise(resolve => { release = resolve; }) });
const first = pending.checkout();
await pending.checkout();
assert.equal(pending.requests.length, 1, 'Repeated clicks must not create duplicate carts');
assert.equal(pending.popups.length, 1);
release();
await first;
console.log('Metal Arm checkout passed: 36 build/quantity combinations, shipping, leader removal, validation, cart errors, retries, and duplicate-click protection.');
