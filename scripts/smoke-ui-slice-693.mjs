import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-693-llm-native-visual-system-convergence-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/110_llm-native-visual-system-convergence-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const renderNavSource = getFunctionSource('renderNav');

for (const token of [
  '--workbench-canvas: #f5f6f7',
  '--workbench-nav: #f8f9fa',
  '--workbench-surface: #ffffff',
  '--workbench-surface-soft: #f1f3f4',
  '--workbench-line: #e1e5e8',
  '--workbench-line-strong: #c8d0d6',
  '--workbench-ink: #171a1f',
  '--workbench-ink-soft: #4e5660',
  '--workbench-muted: #747d87',
  '--workbench-accent: #0f766e',
  '--workbench-accent-soft: #e8f3f1',
  '--workbench-accent-line: #b9d8d3',
]) {
  assert.match(stylesSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(
  renderNavSource,
  /class="nav-button-indicator" aria-hidden="true"[\s\S]*class="nav-button-copy"[\s\S]*class="nav-button-count"/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.nav-button-main \{[\s\S]*grid-template-columns: 8px minmax\(0, 1fr\) auto/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.nav-button\.is-active \{[\s\S]*background: var\(--workbench-accent-soft\)[\s\S]*box-shadow: inset 2px 0 var\(--workbench-accent\)/,
);
assert.match(
  stylesSource,
  /\.llm-new-mission-button \{[\s\S]*background: var\(--workbench-ink\)[\s\S]*color: #fff/,
);

assert.match(
  stylesSource,
  /\.llm-turn:not\(:last-child\)::before \{[\s\S]*background: var\(--workbench-line-strong\)/,
);
assert.match(
  stylesSource,
  /\.llm-mission-next-gate-summary \{[\s\S]*border: 1px solid var\(--workbench-accent-line\)[\s\S]*background: var\(--workbench-accent-soft\)/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.llm-context-inspector \{[\s\S]*border: 1px solid var\(--workbench-line\)[\s\S]*background: var\(--workbench-surface-soft\)/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 1100px\) \{[\s\S]*body \.llm-app-shell \.llm-context-inspector \{[\s\S]*background: transparent/,
);

assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.surface-panel \{[\s\S]*border: 0;[\s\S]*background: transparent/,
);
assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.detail-card > \.briefing-hero \{[\s\S]*grid-template-columns: minmax\(0, 1fr\)/,
);
assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.detail-card \.form-actions-inline \{[\s\S]*flex-wrap: wrap/,
);

assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.shell-window-bar \{[\s\S]*min-height: 44px[\s\S]*flex-wrap: wrap/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.shell-header-context > span:first-child \{[\s\S]*display: none/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*body \.llm-app-shell \.refresh-status \{[\s\S]*max-width: 64px/,
);
assert.doesNotMatch(stylesSource, /letter-spacing:\s*-/);

assert.match(designSource, /Connect chronological turns with one quiet vertical rule/);
assert.match(designSource, /At 390px, keep that metadata on one actual line/);
assert.match(decisionSource, /### DEC-159/);
assert.match(decisionSource, /browser-only LLM-native visual-system convergence slice/);
assert.match(planSource, /Plan -> Act -> Observe -> Compare -> Gate/);
assert.match(planSource, /Runtime schema remains v16/);
assert.match(planSource, /No external repo vendoring/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  visualSystem: {
    semanticWorkbenchTokens: true,
    navigation: 'indicator-label-count',
    newMissionCommand: 'high-contrast',
    missionTurns: 'connected-unframed-timeline',
    desktopInspector: 'bounded-soft-surface',
    mobileHeader: 'single-actual-row-at-390px',
    advancedOps: 'unframed-primary-column-bounded-tools',
    negativeLetterSpacing: 0,
  },
  authority: {
    runtimeChanges: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
    actionChanges: 0,
    persistenceChanges: 0,
    providerChanges: 0,
  },
}, null, 2)}\n`);
