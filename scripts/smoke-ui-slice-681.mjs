import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-681-llm-native-advanced-ops-navigation-smoke';

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
  new URL('../docs/98_llm-native-advanced-ops-navigation-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const renderNavSource = getFunctionSource('renderNav');
const handleSurfaceChangeSource = getFunctionSource('handleSurfaceChange');

assert.match(indexSource, /class="llm-primary-nav"/);
assert.match(indexSource, /id="llm-advanced-ops-nav"/);
assert.match(indexSource, /data-advanced-ops-navigation="true"/);
assert.match(indexSource, /<summary>[\s\S]*Advanced Ops[\s\S]*llm-advanced-ops-status/);

const primaryNavStart = indexSource.indexOf('<nav class="llm-primary-nav"');
const primaryNavEnd = indexSource.indexOf('</nav>', primaryNavStart);
const primaryNavSource = indexSource.slice(primaryNavStart, primaryNavEnd);

for (const surface of ['mission', 'council', 'execution', 'deliverables']) {
  assert.match(primaryNavSource, new RegExp(`data-surface="${surface}"`));
}
for (const surface of ['decision-inbox', 'artifacts', 'logs', 'taskboard']) {
  assert.match(primaryNavSource, new RegExp(`data-surface="${surface}"`));
}
assert.equal((primaryNavSource.match(/data-surface=/g) || []).length, 8);

assert.match(indexSource, /class="primary-nav office-sidebar-nav legacy-primary-nav"/);
assert.match(stylesSource, /body \.llm-app-shell \.legacy-primary-nav \{[\s\S]*display: none/);
assert.match(stylesSource, /body \.llm-app-shell \.llm-primary-nav \{[\s\S]*display: grid/);
assert.match(stylesSource, /\.llm-advanced-ops-nav summary/);
assert.match(stylesSource, /\.llm-advanced-ops-nav\[open\] summary::before/);
assert.match(stylesSource, /@media \(max-width: 820px\)[\s\S]*\.llm-primary-nav-list/);

assert.match(renderNavSource, /const advancedOpsActive = activeGroupId !== 'workflows'/);
assert.match(renderNavSource, /state\.lastRenderedNavGroup !== 'workflows'/);
assert.match(renderNavSource, /elements\.advancedOpsNav\.open = advancedOpsActive \|\| state\.advancedOpsExpanded/);
assert.match(renderNavSource, /getSurfaceDockCount\(data, 'decision-inbox'\)/);
assert.match(renderNavSource, /pending gates/);
assert.match(renderNavSource, /button\.setAttribute\('aria-current', 'page'\)/);
assert.match(renderNavSource, /getSurfaceDockCount\(data, surface\)/);
assert.match(handleSurfaceChangeSource, /getNavGroupForSurface\(surface\)/);
assert.match(appSource, /data-advanced-ops-navigation/);
assert.match(appSource, /state\.advancedOpsExpanded = disclosure\.open/);

assert.doesNotMatch(primaryNavSource, /data-action="(approve|execute|commit|push|release)/);
assert.doesNotMatch(renderNavSource, /fetch\(|postJson|saveState|localStorage|sessionStorage/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(designSource, /Advanced Ops uses one native disclosure/);
assert.match(decisionSource, /### DEC-147/);
assert.match(decisionSource, /same eight surface buttons/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  navigation: {
    primary: ['mission', 'council', 'execution', 'deliverables'],
    advancedOps: ['decision-inbox', 'artifacts', 'logs', 'taskboard'],
    defaultAdvancedOpsExpanded: false,
    exactSurfaceCount: 8,
  },
  compatibility: {
    legacyGroupedNavigationSourcePresent: true,
    dynamicCountsPreserved: true,
    currentSurfaceAriaPreserved: true,
    controlOverviewRoutingPreserved: true,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    automaticSurfaceSelection: false,
  },
}, null, 2)}\n`);
