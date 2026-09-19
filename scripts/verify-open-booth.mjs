import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const requiredFiles = [
  'openbooth/index.html',
  'open-booth-buy.html',
  'styles/open-booth.css',
  'styles/site-nav.css',
  'scripts/open-booth.js',
  'scripts/site-nav.js',
  'assets/open-booth/hero.mp4',
  'assets/open-booth/OpenBooth.png',
  'assets/open-booth/openbooth-bimanual product.png',
  'assets/open-booth/catalog.json',
  'assets/open-booth/openbooth_demo_1_clip.mp4',
  'assets/open-booth/openbooth_demo_2_clip.mp4',
  'assets/open-booth/openbooth_demo_3_clip.mp4',
];
const maxCloudflarePagesAssetBytes = 25 * 1024 * 1024;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

for (const filePath of requiredFiles) {
  assert(exists(filePath), `Missing required file: ${filePath}`);
}

for (const filePath of requiredFiles.filter((asset) => asset.endsWith('_clip.mp4'))) {
  const { size } = fs.statSync(path.join(root, filePath));
  assert(size < maxCloudflarePagesAssetBytes, `${filePath} is ${size} bytes, above the 25 MiB Cloudflare Pages asset limit`);
  const probe = JSON.parse(execFileSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=codec_name,width,height,duration',
    '-of',
    'json',
    path.join(root, filePath),
  ], { encoding: 'utf8' }));
  const stream = probe.streams?.[0];
  assert(stream?.codec_name === 'h264', `${filePath} must be H.264 for browser compatibility`);
  assert(Number(stream.width) <= 720 && Number(stream.height) <= 1280, `${filePath} is ${stream.width}x${stream.height}, expected 720x1280 or smaller`);
  assert(Number(stream.duration) > 0, `${filePath} must have a positive duration`);
}

const page = read('openbooth/index.html');
const openBoothScript = read('scripts/open-booth.js');
const siteNavScript = read('scripts/site-nav.js');
assert(page.includes('<title>OpenBooth Dataset | MakerMods</title>'), 'OpenBooth page is missing the expected title');
assert(page.includes('canonical" href="https://www.makermods.ai/openbooth"'), 'OpenBooth page is missing canonical metadata');
assert(page.includes('/assets/open-booth/hero.mp4'), 'OpenBooth page does not reference the hero video');
assert(page.includes('/assets/open-booth/OpenBooth.png'), 'OpenBooth page does not reference the product image');
assert(page.includes('/assets/open-booth/catalog.json'), 'OpenBooth page does not expose the catalog path');
assert(page.includes('/open-booth-buy'), 'OpenBooth page is missing the buy-page link');
assert(page.includes('<maker-nav active="openbooth" cta-label="Buy →" cta-href="/open-booth-buy">'), 'OpenBooth nav is missing the configured top-right buy button');
assert(siteNavScript.includes("cta.id = 'nav-buy'"), 'The universal nav must expose its CTA for OpenBooth hot-state behavior');
assert(openBoothScript.includes("document.getElementById('nav-buy')"), 'OpenBooth script is missing nav buy hot-state behavior');
assert(openBoothScript.includes("document.querySelector('.ob-hero')"), 'OpenBooth script should bind nav hot state to the full hero section');
assert(!openBoothScript.includes("document.querySelector('.ob-buy-hero')"), 'OpenBooth script should not bind nav hot state to only the hero buy CTA');
assert(openBoothScript.includes('requestIdleCallback'), 'OpenBooth script should progressively reveal catalog cards after idle time');
assert(openBoothScript.includes('assetUrl(dataset.thumbnail_path)'), 'OpenBooth script should render catalog thumbnail paths as route-safe asset URLs');
assert(openBoothScript.includes('assetUrl(dataset.contact_sheet_path)'), 'OpenBooth script should render contact sheet paths as route-safe asset URLs');
assert(!openBoothScript.includes('loading="lazy" decoding="async">'), 'OpenBooth catalog thumbnails should not rely on native lazy loading');
assert(page.includes('btn btn-stencil ob-buy-hero'), 'OpenBooth hero buy CTA should be a primary stencil button');
assert(page.includes('OpenBooth unlocks infinite skills'), 'OpenBooth page is missing the infinite skills positioning');
assert(!page.includes('1 OpenBooth unlocks infinite skills'), 'OpenBooth page should not say "1 OpenBooth"');
assert(page.includes('Recreate winning demos'), 'OpenBooth page is missing the hackathon winner demo section');
assert(page.includes('/assets/open-booth/openbooth_demo_1_clip.mp4'), 'OpenBooth page is missing demo 1 clip');
assert(page.includes('/assets/open-booth/openbooth_demo_2_clip.mp4'), 'OpenBooth page is missing demo 2 clip');
assert(page.includes('/assets/open-booth/openbooth_demo_3_clip.mp4'), 'OpenBooth page is missing demo 3 clip');
assert(page.indexOf('id="winner-demos"') < page.indexOf('id="open-booth"'), 'Hackathon winner demos should appear above the OpenBooth buy section');
assert(page.includes('SO101'), 'OpenBooth page is missing SO101 positioning');
assert(page.includes('id="catalog"'), 'OpenBooth page is missing the catalog section');
assert(page.includes('data-open-booth-modal'), 'OpenBooth page is missing the detail modal');
assert(!page.includes('[ PUBLIC SKILL CATALOG ]'), 'OpenBooth page should not show the repetitive public skill catalog intro');
assert(!page.includes('Proof first: OpenBooth already comes with usable robot skills.'), 'OpenBooth page should not show the repetitive proof-first heading');
assert(!page.includes('Each card points to a public Hugging Face recording'), 'OpenBooth page should not show the repetitive catalog explainer copy');

const buyPage = read('open-booth-buy.html');
assert(buyPage.includes('<title>Buy OpenBooth | MakerMods</title>'), 'OpenBooth buy page is missing the expected title');
assert(buyPage.includes('<span class="opt-name">OpenBooth Kit</span>'), 'OpenBooth buy page is missing the OpenBooth Kit variant');
assert(!buyPage.includes('data-tier="pair"'), 'OpenBooth must not offer the retired single-arm bundle');
assert(buyPage.includes('OpenBooth + SO101 Bimanual Kit'), 'OpenBooth buy page is missing the bimanual kit variant');
assert(buyPage.includes('assets/open-booth/openbooth-bimanual product.png'), 'OpenBooth buy page is missing the bimanual product image');
assert(buyPage.includes('$99'), 'OpenBooth buy page is missing the $99 booth pricing');
assert(!buyPage.includes('$399'), 'OpenBooth must not advertise the retired $399 bundle');
assert(buyPage.includes('$699'), 'OpenBooth buy page is missing the $699 OpenBooth + SO101 Bimanual Kit pricing');
assert(buyPage.includes('ships in August') || buyPage.includes('shipping in August'), 'OpenBooth buy page is missing the shipping timeline');
assert(!buyPage.includes('Checkout link placeholder'), 'OpenBooth buy page should not show placeholder checkout copy');
assert(buyPage.includes('gid://shopify/ProductVariant/51852066324797'), 'OpenBooth buy page is missing the OpenBooth Shopify variant');
assert(!buyPage.includes('51851987812669'), 'OpenBooth checkout must not include the single-arm kit');
assert(buyPage.includes('gid://shopify/ProductVariant/51851988042045'), 'OpenBooth buy page is missing the SO101 Bimanual Kit Shopify variant');
assert(buyPage.includes('cartCreate(input: $input)'), 'OpenBooth buy page should create Shopify carts for checkout');
assert(!/pre-?order/i.test(page), 'OpenBooth page should not contain preorder language');
assert(!/pre-?order|deposit|balance/i.test(buyPage), 'OpenBooth buy page should not contain preorder/deposit/balance language');

const index = read('index.html');
assert(index.includes('href="openbooth"'), 'Homepage is missing an OpenBooth link');
assert(index.includes('OpenBooth'), 'Homepage is missing OpenBooth copy');
assert(index.indexOf('id="openbooth"') < index.indexOf('id="lab"'), 'Homepage should show the OpenBooth showcase before the lab products');

const sitemap = read('sitemap.xml');
assert(sitemap.includes('https://www.makermods.ai/openbooth'), 'Sitemap is missing /openbooth');

const llms = read('llms.txt');
assert(llms.includes('OpenBooth'), 'llms.txt is missing OpenBooth');

const catalog = JSON.parse(read('assets/open-booth/catalog.json'));
assert(Array.isArray(catalog.datasets), 'Catalog must keep the wrapper shape with a datasets array');
assert(catalog.datasets.length > 0, 'Catalog must include at least one dataset');
assert(catalog.dataset_count === catalog.datasets.length, `Expected dataset_count ${catalog.datasets.length}, found ${catalog.dataset_count}`);

for (const dataset of catalog.datasets) {
  assert(dataset.thumbnail_path?.startsWith('assets/open-booth/thumbnails/'), `Bad thumbnail path for ${dataset.repo}`);
  assert(dataset.contact_sheet_path?.startsWith('assets/open-booth/contact_sheets/'), `Bad contact sheet path for ${dataset.repo}`);
  assert(exists(dataset.thumbnail_path), `Missing thumbnail asset for ${dataset.repo}`);
  assert(exists(dataset.contact_sheet_path), `Missing contact sheet asset for ${dataset.repo}`);
  assert(dataset.huggingface_url?.startsWith('https://huggingface.co/datasets/'), `Bad Hugging Face URL for ${dataset.repo}`);
}

console.log(`OpenBooth verification passed for ${catalog.datasets.length} datasets.`);
