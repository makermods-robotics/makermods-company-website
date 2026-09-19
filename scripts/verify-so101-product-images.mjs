import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class FakeElement {
  constructor(dataset = {}) {
    this.dataset = { ...dataset };
    this.hidden = false;
    this.textContent = '';
    this.innerHTML = '';
    this.style = {};
    this.attributes = new Map();
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  click() {
    this.listeners.get('click')?.();
  }
}

const tierIds = ['pair', 'bimanual', 'boothBimanual'];
const optionNodes = tierIds.map((id) => new FakeElement({ tier: id }));
const options = new FakeElement();
options.querySelectorAll = (selector) => selector === '.opt' ? optionNodes : [];

const label = new FakeElement();
const price = new FakeElement();
const count = new FakeElement();
const parts = new FakeElement();
const control = new FakeElement();
const tag = new FakeElement();
const cta = new FakeElement();
const image = new FakeElement();
image.hidden = true;
const placeholder = new FakeElement();
const visual = new FakeElement();
const note = new FakeElement();

const singleNodes = new Map([
  ['[data-so-buy-options]', options],
  ['[data-so-buy-cta]', cta],
  ['[data-so-buy-image]', image],
  ['[data-so-buy-placeholder]', placeholder],
  ['[data-so-buy-visual]', visual],
  ['[data-so-buy-note]', note],
]);

const multipleNodes = new Map([
  ['.faq-item', []],
  ['[data-so-buy-label]', [label]],
  ['[data-so-buy-price]', [price]],
  ['[data-so-buy-count]', [count]],
  ['[data-so-buy-parts]', [parts]],
  ['[data-so-buy-control]', [control]],
  ['[data-so-buy-tag]', [tag]],
  ['[data-so-buy-note]', [note]],
]);

const document = {
  getElementById: () => null,
  querySelector: (selector) => singleNodes.get(selector) ?? null,
  querySelectorAll: (selector) => multipleNodes.get(selector) ?? [],
};

const source = await readFile(new URL('./so101.js', import.meta.url), 'utf8');
vm.runInNewContext(source, { document, window: {} }, { filename: 'scripts/so101.js' });
const page = await readFile(new URL('../so101-buy.html', import.meta.url), 'utf8');

const selectTier = (id) => {
  const option = optionNodes.find((node) => node.dataset.tier === id);
  assert.ok(option, `Expected ${id} option to exist in the harness`);
  option.click();
};

const expectedTiers = {
  pair: {
    image: 'assets/open-booth/notused_so101-kit.png',
    alt: 'SO-101 leader and follower robot arm kit',
    fit: 'cover',
    note: 'SO101 leader + follower kit.',
  },
  bimanual: {
    image: 'assets/so101/bimanual-so101.png',
    alt: 'SO-101 bimanual kit with two leader arms and two follower arms',
    fit: 'contain',
    note: 'SO101 bimanual kit.',
  },
  boothBimanual: {
    image: 'assets/open-booth/openbooth-bimanual product.png',
    alt: 'Bimanual OpenBooth with SO101 robots inside the training enclosure',
    fit: 'contain',
    note: 'SO101 bimanual kit with OpenBooth.',
  },
};

for (const [id, expected] of Object.entries(expectedTiers)) {
  selectTier(id);
  const hasImage = Boolean(expected.image);
  assert.equal(image.hidden, !hasImage, `${id} should use the approved photograph state`);
  assert.equal(placeholder.hidden, hasImage, `${id} should use the approved placeholder state`);
  assert.equal(visual.dataset.hasProductImage, String(hasImage), `${id} should mark the gallery state`);
  assert.equal(note.textContent, expected.note, `${id} should explain the selected gallery visual`);
  if (hasImage) {
    assert.equal(image.attributes.get('src'), expected.image, `${id} should use the approved photograph`);
    assert.equal(image.attributes.get('alt'), expected.alt, `${id} should describe its photograph`);
    assert.equal(image.style.objectFit, expected.fit, `${id} should use the approved photograph framing`);
  }
}

assert.match(page, /<span class="k">lead time<\/span>\s*<span class="v">2 weeks<\/span>/, 'The purchase summary should show a two-week lead time');
assert.doesNotMatch(page, /August/i, 'The SO-101 buy page should not mention August shipping');

console.log('SO-101 product image behavior and lead time verified.');
