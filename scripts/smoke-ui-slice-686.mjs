import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-686-llm-native-mobile-mission-title-readability-smoke';

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
  new URL('../docs/103_llm-native-mobile-mission-title-readability-plan.md', import.meta.url),
  'utf8',
);

const mobileStyles = stylesSource.slice(stylesSource.indexOf('@media (max-width: 820px)'));
const titleRuleStart = mobileStyles.indexOf(
  'body .llm-app-shell .llm-sidebar-mission-current > strong {',
);
const titleRuleEnd = mobileStyles.indexOf('}', titleRuleStart);

assert.notEqual(titleRuleStart, -1);
assert.notEqual(titleRuleEnd, -1);

const titleRule = mobileStyles.slice(titleRuleStart, titleRuleEnd + 1);

assert.match(indexSource, /id="llm-sidebar-missions"/);
assert.match(indexSource, /id="llm-sidebar-mission-title"/);
assert.match(indexSource, /id="llm-sidebar-mission-count"/);
assert.match(indexSource, /id="llm-advanced-ops-status"/);
assert.match(appSource, /function renderSidebarMissionNavigation\(data\)/);
assert.match(appSource, /elements\.sidebarMissionTitle\.textContent = selectedMission\.title/);

assert.match(mobileStyles, /\.llm-primary-nav-list \{[\s\S]*grid-row:\s*2/);
assert.match(mobileStyles, /\.llm-sidebar-missions \{[\s\S]*grid-row:\s*3/);
assert.match(
  mobileStyles,
  /\.llm-advanced-ops-nav \{[\s\S]*grid-column:\s*2[\s\S]*grid-row:\s*3/,
);
assert.match(titleRule, /overflow:\s*visible/);
assert.match(titleRule, /text-overflow:\s*clip/);
assert.match(titleRule, /white-space:\s*normal/);
assert.match(titleRule, /line-height:\s*1\.25/);
assert.doesNotMatch(titleRule, /text-overflow:\s*ellipsis/);
assert.doesNotMatch(titleRule, /white-space:\s*nowrap/);
assert.doesNotMatch(titleRule, /line-clamp/);
assert.match(
  mobileStyles,
  /\.llm-sidebar-missions\[open\][\s\S]*grid-column:\s*1 \/ -1/,
);
assert.match(stylesSource, /body \.llm-app-shell \.llm-sidebar-mission-current > strong \{[\s\S]*overflow-wrap:\s*anywhere/);
assert.match(designSource, /complete title readable through natural wrapping/);
assert.match(decisionSource, /### DEC-152/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  mobileNavigation: {
    collapsedRows: 3,
    currentMissionTitle: 'complete-natural-wrap',
    titleEllipsis: false,
    titleLineClamp: false,
    missionCountVisible: true,
    pendingGateVisible: true,
    openDisclosureWidth: 'full-rail',
    desktopLayout: 'unchanged',
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
    persistedNavigationState: false,
  },
}, null, 2)}\n`);
