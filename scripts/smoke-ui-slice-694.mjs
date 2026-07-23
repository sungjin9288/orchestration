import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-694-llm-native-first-viewport-corrective-redesign-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/111_llm-native-first-viewport-corrective-redesign-plan.md', import.meta.url),
  'utf8',
);

assert.match(appSource, /class="llm-project-onboarding"/);
assert.match(appSource, /class="llm-mission-lead \$\{projectBootstrap \? 'is-project-bootstrap'/);
assert.match(appSource, /class="llm-project-stage-list" aria-label="Orchestration 진행 단계"/);
assert.match(
  appSource,
  /<strong>Project<\/strong>[\s\S]*<strong>Mission<\/strong>[\s\S]*<strong>Council<\/strong>[\s\S]*<strong>Execute<\/strong>[\s\S]*<strong>Deliver<\/strong>/,
);
assert.match(appSource, /class="llm-project-tool-bar" aria-hidden="true"/);
assert.match(appSource, /project_path required · review before done · approval before commit/);

assert.match(
  appSource,
  /project-bootstrap-field project-bootstrap-field-path[\s\S]*name="projectPath"[\s\S]*project-bootstrap-field project-bootstrap-field-name[\s\S]*name="projectName"/,
);
assert.match(
  appSource,
  /project-bootstrap-field project-bootstrap-field-name[\s\S]*name="projectName"/,
);
assert.match(
  appSource,
  /project-bootstrap-field project-bootstrap-field-pack[\s\S]*name="projectPack"/,
);
assert.match(appSource, /data-form="\$\{missionMode \? 'create-project-from-mission' : 'create-project'\}"/);
assert.match(appSource, /primary-button project-connect-button/);

assert.match(stylesSource, /--workbench-rail: #17191d/);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.office-sidebar \{[\s\S]*background: var\(--workbench-rail\)/,
);
assert.match(
  stylesSource,
  /\.llm-project-onboarding \{[\s\S]*grid-template-columns: minmax\(320px, 0\.9fr\) minmax\(500px, 1\.1fr\)/,
);
assert.match(
  stylesSource,
  /\.llm-project-bootstrap-surface \{[\s\S]*border: 1px solid #dbe1dd[\s\S]*border-radius: 8px/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.project-bootstrap-fields \{[\s\S]*"path path"[\s\S]*"name pack"/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.project-bootstrap-field-path input \{[\s\S]*min-height: 58px[\s\S]*font-family: "IBM Plex Mono"/,
);
assert.match(
  stylesSource,
  /body \.llm-app-shell \.primary-button \{[\s\S]*background: var\(--workbench-ink\)[\s\S]*box-shadow: none/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*\.llm-project-onboarding \{[\s\S]*grid-template-columns: minmax\(0, 1fr\)[\s\S]*body \.llm-app-shell \.project-connect-button \{[\s\S]*width: 100%/,
);
assert.doesNotMatch(stylesSource, /letter-spacing:\s*-/);

assert.match(designSource, /A redesign must change the first-viewport scan path/);
assert.match(decisionSource, /### DEC-160/);
assert.match(decisionSource, /first-viewport corrective redesign/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /Make `project_path` the dominant first field/);
assert.match(planSource, /No runtime, API, route, schema, storage, provider, dependency, or state change/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    commandRail: 'dark',
    desktopFirstRun: 'context-plus-command-surface',
    dominantField: 'project_path',
    projectCommand: 'solid-high-contrast',
    mobileFirstViewport: 'path-name-pack-submit-visible',
    negativeLetterSpacing: 0,
  },
  compatibility: {
    projectCreateAction: 'create-project-from-mission',
    projectNameField: 'projectName',
    projectPathField: 'projectPath',
    projectPackField: 'projectPack',
  },
  authority: {
    runtimeChanges: 0,
    apiChanges: 0,
    schemaChanges: 0,
    routeChanges: 0,
    actionChanges: 0,
    providerChanges: 0,
    persistenceChanges: 0,
  },
}, null, 2)}\n`);
