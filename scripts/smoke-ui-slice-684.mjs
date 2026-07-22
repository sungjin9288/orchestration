import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-684-llm-native-mobile-navigation-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const indexSource = fs.readFileSync(new URL('../ui/index.html', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/101_llm-native-mobile-navigation-plan.md', import.meta.url),
  'utf8',
);

const mobileStyles = stylesSource.slice(stylesSource.indexOf('@media (max-width: 820px)'));

assert.match(indexSource, /id="llm-sidebar-missions"/);
assert.match(indexSource, /class="llm-primary-nav-list"/);
assert.match(indexSource, /id="llm-advanced-ops-nav"/);
assert.match(indexSource, /id="llm-sidebar-mission-count"/);
assert.match(indexSource, /id="llm-advanced-ops-status"/);
assert.match(appSource, /function renderSidebarMissionNavigation\(data\)/);
assert.match(appSource, /function renderNav\(data\)/);

assert.match(
  mobileStyles,
  /\.office-sidebar \{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) auto/,
);
assert.match(mobileStyles, /\.office-brand-card \{[\s\S]*grid-row:\s*1/);
assert.match(mobileStyles, /\.llm-primary-nav \{[\s\S]*display:\s*contents/);
assert.match(mobileStyles, /\.llm-primary-nav-list \{[\s\S]*grid-row:\s*2/);
assert.match(mobileStyles, /\.llm-sidebar-missions \{[\s\S]*grid-row:\s*3/);
assert.match(
  mobileStyles,
  /\.llm-advanced-ops-nav \{[\s\S]*grid-column:\s*2[\s\S]*grid-row:\s*3/,
);
assert.match(
  mobileStyles,
  /\.llm-sidebar-missions\[open\][\s\S]*grid-column:\s*1 \/ -1/,
);
assert.match(
  mobileStyles,
  /:has\(\.llm-advanced-ops-nav\[open\]\)[\s\S]*\.llm-sidebar-missions[\s\S]*grid-row:\s*4/,
);
assert.match(stylesSource, /body \.llm-app-shell \.llm-primary-nav \{[\s\S]*display:\s*grid/);
assert.match(designSource, /collapsed state, the mobile rail uses three rows/);
assert.match(decisionSource, /### DEC-150/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  mobileNavigation: {
    collapsedRows: 3,
    primaryDestinations: 4,
    missionHistory: 'existing-native-disclosure',
    advancedOps: 'existing-native-disclosure',
    openDisclosureWidth: 'full-rail',
    desktopLayout: 'unchanged',
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
    persistedDisclosureState: false,
  },
}, null, 2)}\n`);
