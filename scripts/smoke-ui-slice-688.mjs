import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-688-llm-native-desktop-workspace-focus-offset-smoke';

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
  new URL('../docs/105_llm-native-desktop-workspace-focus-offset-plan.md', import.meta.url),
  'utf8',
);

const focusHandlerStart = appSource.indexOf('async function handleSurfaceChange(surface) {');
const focusHandlerEnd = appSource.indexOf('\nasync function handleNavGroupChange', focusHandlerStart);
const focusHandler = appSource.slice(focusHandlerStart, focusHandlerEnd);
const desktopMediaStart = stylesSource.indexOf('@media (min-width: 821px) {');
const desktopMediaEnd = stylesSource.indexOf('\n}\n', desktopMediaStart) + 2;
const desktopMedia = stylesSource.slice(desktopMediaStart, desktopMediaEnd);
const mobileMedia = stylesSource.slice(stylesSource.indexOf('@media (max-width: 820px) {'));

assert.notEqual(focusHandlerStart, -1, 'Missing existing workspace focus handoff');
assert.notEqual(desktopMediaStart, -1, 'Missing desktop focus-offset media query');
assert.notEqual(desktopMediaEnd, 1, 'Missing desktop focus-offset media query end');

assert.match(
  indexSource,
  /<main id="workspace-main" class="surface-stack"[\s\S]*tabindex="-1">/,
);
assert.match(indexSource, /<a class="skip-link" href="#workspace-main">/);
assert.match(focusHandler, /render\(\);\s*elements\.workspaceMain\?\.focus\(\);/);

assert.match(
  desktopMedia,
  /body \.llm-app-shell \.surface-stack \{\s*scroll-margin-top:\s*46px;\s*\}/,
);
assert.equal((stylesSource.match(/scroll-margin-top:/g) || []).length, 2);
assert.match(
  stylesSource,
  /\.llm-next-gate\[id\] \{\s*scroll-margin-top:\s*58px;\s*\}/,
);
assert.match(mobileMedia, /body \.llm-app-shell \.shell-header \{\s*position:\s*static;/);
assert.match(mobileMedia, /body \.llm-app-shell \.surface-stack \{\s*padding:\s*0 14px 36px;\s*\}/);
assert.doesNotMatch(mobileMedia, /scroll-margin-top:/);

assert.match(designSource, /Desktop workspace focus reserves the sticky header height/);
assert.match(decisionSource, /### DEC-154/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(planSource, /This is CSS-only/);
assert.match(planSource, /No write path, provider call, source mutation, commit, push, release, scheduler, policy, or/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  focus: {
    target: 'workspace-main',
    tabindex: -1,
    handoff: 'existing-workspaceMain-focus',
    desktopScrollMarginTop: '46px',
    desktopBreakpoint: 'min-width: 821px',
    mobileHeader: 'static-at-max-width-820px',
    mobileScrollMargin: 'unchanged',
  },
  authority: {
    javascriptChanges: 0,
    htmlChanges: 0,
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
    providerChanges: 0,
    sourceMutation: false,
  },
}, null, 2)}\n`);
