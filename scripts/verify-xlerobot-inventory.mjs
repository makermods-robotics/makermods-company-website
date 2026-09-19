import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

const homePage = read('index.html');
const xlePage = read('xlerobot.html');
const elPage = read('elrobot.html');
const formerBuyPage = read('buy.html');
const navScript = read('scripts/site-nav.js');
const mainScript = read('scripts/main.js');

const xleMailto = 'mailto:ryan@makermods.ai,isaac@makermods.ai?subject=XLeRobot%20sales%20inquiry';
const elMailto = 'mailto:ryan@makermods.ai,isaac@makermods.ai?subject=ElRobot%20sales%20inquiry';

assert(homePage.includes('href="xlerobot.html"'), 'Homepage must retain the XLeRobot discovery card');
assert(homePage.includes('href="elrobot.html"'), 'Homepage must retain the ElRobot discovery card');
assert(homePage.includes('<span>Contact sales</span>'), 'Homepage inquiry-only cards must say Contact sales');

assert(navScript.includes("label: 'XLeRobot'"), 'Top navigation must list XLeRobot');
assert(navScript.includes("label: 'ElRobot'"), 'Top navigation must list ElRobot');

assert(xlePage.includes(xleMailto), 'XLeRobot must link to the sales email');
assert(elPage.includes(elMailto), 'ElRobot must link to the sales email');
assert(xlePage.includes('[ CONTACT SALES → ]'), 'XLeRobot hero CTA must be Contact sales');
assert(elPage.includes('[ CONTACT SALES → ]'), 'ElRobot hero CTA must be Contact sales');
assert(!xlePage.includes('"offers"'), 'XLeRobot structured data must not advertise an online offer');
assert(!elPage.includes('"offers"'), 'ElRobot structured data must not advertise an online offer');

const retiredCheckoutMarkers = [
  'makermods.myshopify.com/cart/51969031012669:1',
  '51817674047805',
  '51036164555069',
  '51314503123261',
  'X-Shopify-Storefront-Access-Token',
  'OPENING CHECKOUT',
];

for (const marker of retiredCheckoutMarkers) {
  assert(!xlePage.includes(marker), `XLeRobot page must not contain retired checkout marker: ${marker}`);
  assert(!elPage.includes(marker), `ElRobot page must not contain retired checkout marker: ${marker}`);
  assert(!formerBuyPage.includes(marker), `Retired XLeRobot buy page must not contain checkout marker: ${marker}`);
  assert(!mainScript.includes(marker), `XLeRobot script must not contain checkout marker: ${marker}`);
}

assert(formerBuyPage.includes('content="noindex,follow"'), 'Retired XLeRobot buy URL must be excluded from search indexing');
assert(formerBuyPage.includes(xleMailto), 'Retired XLeRobot buy URL must direct visitors to sales');
assert(!formerBuyPage.includes('scripts/main.js'), 'Retired XLeRobot buy URL must not load checkout code');

console.log('Inquiry-only product verification passed for XLeRobot and ElRobot.');
