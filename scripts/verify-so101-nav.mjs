import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const componentPath = path.join(root, 'scripts/site-nav.js');
const stylesheetPath = path.join(root, 'styles/site-nav.css');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(componentPath), 'scripts/site-nav.js must provide the universal navbar component');
assert(fs.existsSync(stylesheetPath), 'styles/site-nav.css must provide the universal navbar styles');

const pages = {
  'index.html': {},
  'openbooth/index.html': { active: 'openbooth', label: 'Buy →', href: '/open-booth-buy' },
  'so101.html': { active: 'so101', label: 'Buy →', href: '/so101-buy' },
  'so101-buy.html': { active: 'so101', label: '← back', href: '/so101' },
  'metal-arm.html': { active: 'metal-arm', label: 'Buy →', href: '/metal-arm-buy' },
  'metal-arm-buy.html': { active: 'metal-arm', label: '← back', href: '/metal-arm' },
  'xlerobot.html': {
    active: 'xlerobot',
    label: 'Contact sales →',
    href: 'mailto:ryan@makermods.ai,isaac@makermods.ai?subject=XLeRobot%20sales%20inquiry',
  },
  'buy.html': { label: '← XLeRobot', href: '/xlerobot' },
  'elrobot.html': {
    active: 'elrobot',
    label: 'Contact sales →',
    href: 'mailto:ryan@makermods.ai,isaac@makermods.ai?subject=ElRobot%20sales%20inquiry',
  },
  'open-booth-buy.html': { active: 'openbooth', label: '← back', href: '/openbooth' },
  'makermods-app/index.html': {
    active: 'makermods-lab',
    label: 'View on GitHub',
    href: 'https://github.com/makermods-robotics/makermodslab',
  },
};

function getAttribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

for (const [filePath, expected] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, filePath), 'utf8');
  const components = [...html.matchAll(/<maker-nav\b([^>]*)>[\s\S]*?<\/maker-nav>/g)];
  assert(components.length === 1, `${filePath} must use exactly one maker-nav component`);
  assert(!/<nav\b/i.test(html), `${filePath} must not duplicate the shared nav markup`);
  assert(!/nav-cart|cart\s*·\s*0/i.test(html), `${filePath} must not contain navbar cart placeholder text`);
  assert(
    /<link\s+rel="stylesheet"\s+href="\/styles\/site-nav\.css">/.test(html),
    `${filePath} must load the universal navbar stylesheet`,
  );
  assert(
    /<script\s+src="\/scripts\/site-nav\.js"><\/script>/.test(html),
    `${filePath} must define the universal navbar before page-level scripts initialize`,
  );

  const attributes = components[0][1];
  const componentContents = components[0][0]
    .replace(/^<maker-nav\b[^>]*>/, '')
    .replace(/<\/maker-nav>$/, '')
    .trim();
  assert(componentContents === '', `${filePath} maker-nav must not retain parser-added fallback content`);
  assert(getAttribute(attributes, 'active') === expected.active, `${filePath} has the wrong active navbar item`);
  assert(getAttribute(attributes, 'cta-label') === expected.label, `${filePath} has the wrong navbar CTA label`);
  assert(getAttribute(attributes, 'cta-href') === expected.href, `${filePath} has the wrong navbar CTA destination`);
}

const component = fs.readFileSync(componentPath, 'utf8');
const stylesheet = fs.readFileSync(stylesheetPath, 'utf8');
const expectedLinks = [
  ['Maker Arm', '/maker-arm'],
  ['Metal Arm', '/metal-arm'],
  ['OpenBooth', '/openbooth'],
  ['MakerMods Lab', '/makermods-app/'],
  ['SO-101', '/so101'],
  ['XLeRobot', '/xlerobot'],
  ['ElRobot', '/elrobot'],
  ['Docs', 'https://github.com/makermods-robotics'],
  ['Community', 'https://discord.gg/HpXj3ynhhF'],
];

let previousIndex = -1;
for (const [label, href] of expectedLinks) {
  const index = component.indexOf(`label: '${label}'`);
  assert(index > previousIndex, `site-nav.js must define ${label} in the canonical order`);
  assert(component.includes(`href: '${href}'`), `site-nav.js must link ${label} to ${href}`);
  previousIndex = index;
}

assert(/customElements\.define\('maker-nav',\s*MakerNav\)/.test(component), 'site-nav.js must register maker-nav');
assert(/getAttribute\('cta-label'\)/.test(component), 'maker-nav must read its configurable CTA label');
assert(/getAttribute\('cta-href'\)/.test(component), 'maker-nav must read its configurable CTA destination');
assert(/\.nav-actions\s*\{[^}]*width:\s*auto/.test(stylesheet), 'The shared navbar actions must fit their content');
assert(/\.nav-buy\s*\{[^}]*width:\s*auto/.test(stylesheet), 'Every navbar CTA must fit its label');
assert(/\.nav-logo img\s*\{[^}]*height:\s*70\.2px/.test(stylesheet), 'The desktop navbar logo must be 30% larger');
assert(/\.nav-links a\s*\{[^}]*font-size:\s*15px/.test(stylesheet), 'The desktop navbar links must use 15px text');
assert(/\.nav-buy\s*\{[^}]*font-size:\s*12px/.test(stylesheet), 'The navbar CTA must match the live 12px text');
assert(/\.nav-buy\s*\{[^}]*font-family:\s*var\(--font-mono\)/.test(stylesheet), 'Every navbar CTA must use the shared font');
assert(/\.nav-buy\s*\{[^}]*border-radius:\s*var\(--r-md,\s*6px\)/.test(stylesheet), 'Every navbar CTA must restore the previous subtle corner radius');

for (const cssPath of ['styles/page.css', 'makermods-app/styles.css']) {
  const css = fs.readFileSync(path.join(root, cssPath), 'utf8');
  assert(!/(^|\n)\.nav(?:-|\s|\{|:)/.test(css), `${cssPath} must not redefine universal navbar styles`);
}

console.log(`Universal navbar verification passed for ${Object.keys(pages).length} pages.`);
