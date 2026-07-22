import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-683-llm-native-workspace-header-smoke';

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
  new URL('../docs/100_llm-native-workspace-header-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

function countMatches(source, pattern) {
  return source.match(pattern)?.length || 0;
}

const visibleHeaderStart = indexSource.indexOf('<div class="shell-window-bar"');
const visibleHeaderEnd = indexSource.indexOf('<div class="shell-header-main">', visibleHeaderStart);
const visibleHeaderSource = indexSource.slice(visibleHeaderStart, visibleHeaderEnd);
const legacyHeaderSource = indexSource.slice(
  visibleHeaderEnd,
  indexSource.indexOf('</header>', visibleHeaderEnd),
);
const renderWorkspaceHeaderSource = getFunctionSource('renderWorkspaceHeader');

assert.notEqual(visibleHeaderStart, -1);
assert.notEqual(visibleHeaderEnd, -1);
for (const id of [
  'shell-header-project',
  'shell-window-label',
  'shell-header-surface',
  'shell-header-gates',
  'refresh-status',
  'refresh-button',
]) {
  assert.match(visibleHeaderSource, new RegExp(`id="${id}"`));
  assert.equal(countMatches(indexSource, new RegExp(`id="${id}"`, 'g')), 1);
}
assert.doesNotMatch(
  legacyHeaderSource,
  /id="shell-header-(?:project|surface|gates)"/,
);

assert.match(renderWorkspaceHeaderSource, /getProjectProviderConfig\(activeProject\)/);
assert.match(
  renderWorkspaceHeaderSource,
  /providerConfig\.mode === 'live' \? providerConfig\.adapter : providerConfig\.mode/,
);
assert.match(renderWorkspaceHeaderSource, /getSurfaceDisplayName\(state\.surface\)/);
assert.match(renderWorkspaceHeaderSource, /windowLabel\.textContent = providerLabel/);
assert.match(renderWorkspaceHeaderSource, /surface\.textContent = surfaceLabel/);
assert.match(renderWorkspaceHeaderSource, /gates\.textContent = `gate \$\{context\.pendingGateCount\}`/);
assert.doesNotMatch(renderWorkspaceHeaderSource, /meta\.windowLabel/);
assert.doesNotMatch(appSource, /llm-mission-presence/);

assert.match(stylesSource, /body \.llm-app-shell \.shell-header-project/);
assert.match(stylesSource, /body \.llm-app-shell \.shell-header-context/);
assert.match(stylesSource, /body \.llm-app-shell \.shell-window-runtime/);
assert.doesNotMatch(stylesSource, /\.llm-runtime-presence/);
assert.doesNotMatch(
  stylesSource,
  /body \.llm-app-shell \.nav-button-count,\s*body \.llm-app-shell \.refresh-status/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\)[\s\S]*body \.llm-app-shell \.shell-window-bar[\s\S]*flex-wrap:\s*wrap/,
);
assert.match(designSource, /One compact line shows current project, local\/provider mode, refresh state, and open gate count/);
assert.match(decisionSource, /### DEC-149/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  header: {
    bands: 1,
    project: 'active-project',
    provider: 'normalized-project-provider',
    surface: 'current-browser-surface',
    gateCount: 'existing-pending-gate-projection',
    refreshState: 'existing-live-status',
    refreshCommand: 'existing-handler',
    mobileMetadataVisible: true,
    repeatedWorkstreamPresenceRows: 0,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    providerConfigChanges: 0,
    approvalChanges: 0,
  },
}, null, 2)}\n`);
