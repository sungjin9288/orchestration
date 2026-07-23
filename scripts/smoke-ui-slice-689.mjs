import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-689-llm-native-advanced-ops-overview-placement-smoke';

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
  new URL('../docs/106_llm-native-advanced-ops-overview-placement-plan.md', import.meta.url),
  'utf8',
);

const workspaceStart = indexSource.indexOf('<main id="workspace-main"');
const workspaceEnd = indexSource.indexOf('</main>', workspaceStart);
const disclosureStart = indexSource.indexOf('<details id="control-overview-disclosure"');
const disclosureEnd = indexSource.indexOf('</details>', disclosureStart);
const disclosureSource = indexSource.slice(disclosureStart, disclosureEnd + '</details>'.length);
const overviewBindingCount = (
  appSource.match(/controlOverview: document\.querySelector\('#control-overview'\)/g) || []
).length;

assert.notEqual(workspaceStart, -1, 'Missing workspace main');
assert.notEqual(workspaceEnd, -1, 'Missing workspace main end');
assert.notEqual(disclosureStart, -1, 'Missing secondary overview disclosure');
assert.ok(disclosureStart > workspaceEnd, 'Secondary overview must follow the workspace main');
assert.match(disclosureSource, /^<details id="control-overview-disclosure" class="control-overview-disclosure">/);
assert.doesNotMatch(disclosureSource.slice(0, disclosureSource.indexOf('>') + 1), /\sopen(?:\s|=|>)/);
assert.match(disclosureSource, /<summary>추가 운영 도구<\/summary>/);
assert.match(disclosureSource, /<section id="control-overview" class="control-overview" aria-label="현재 운영 개요"><\/section>/);

assert.match(
  stylesSource,
  /body\[data-nav-group="workflows"\] \.llm-app-shell \.control-overview-disclosure \{\s*display:\s*none;/,
);
assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.control-overview-disclosure \{\s*display:\s*block;\s*min-width:\s*0;/,
);
assert.match(
  stylesSource,
  /\.control-overview-disclosure > \.control-overview \{\s*min-width:\s*0;\s*margin:\s*12px 0 0;/,
);
assert.match(
  stylesSource,
  /\.control-overview-disclosure:not\(\[open\]\) > \.control-overview \{\s*display:\s*none;/,
);
assert.match(appSource, /class="form-actions form-actions-inline task-flow-actions"/);
assert.match(
  stylesSource,
  /surface\[data-surface="taskboard"\] \.task-flow-actions \{\s*flex-wrap:\s*wrap;\s*min-width:\s*0;/,
);
assert.match(
  stylesSource,
  /\.task-flow-actions > \.form-help \{\s*flex:\s*1 1 280px;\s*min-width:\s*0;\s*max-width:\s*100%;\s*overflow-wrap:\s*anywhere;/,
);
assert.match(
  stylesSource,
  /\.control-overview-disclosure \.ops-assignment-row-grid,\s*body \.llm-app-shell \.control-overview-disclosure \.ops-assignment-fields \.ops-form-order-grid \{\s*grid-template-columns:\s*minmax\(0, 1fr\);/,
);
assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.surface-grid,[\s\S]*body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.list-column \{\s*min-width:\s*0;/,
);
assert.match(
  stylesSource,
  /body:not\(\[data-nav-group="workflows"\]\) \.llm-app-shell \.detail-copy\.mono \{\s*overflow-wrap:\s*anywhere;\s*word-break:\s*break-word;/,
);
assert.match(
  stylesSource,
  /@media \(max-width: 820px\) \{[\s\S]*control-overview-disclosure \{\s*margin:\s*12px 14px 0;/,
);
assert.doesNotMatch(
  stylesSource,
  /(?:\.app-shell|\.llm-app-shell|\.control-overview-disclosure)\s*\{[^}]*overflow(?:-x|-y)?\s*:\s*hidden/s,
);

assert.equal(overviewBindingCount, 1, 'Control overview element binding must remain unique');
assert.match(appSource, /function renderControlOverview\(data\)/);
assert.match(appSource, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(appSource, /function renderOpsOverview\(data, context, activeGroupId\)/);
assert.match(appSource, /window\.localStorage\.getItem\(COMPANY_MEMBER_STORAGE_KEY\)/);
assert.match(appSource, /window\.localStorage\.getItem\(UI_PREFERENCE_STORAGE_KEY\)/);

assert.match(designSource, /Secondary operations evidence follows the authoritative workspace/);
assert.match(decisionSource, /### DEC-155/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(planSource, /adds no runtime write, API\/schema\/dependency behavior/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  placement: {
    mainBeforeDisclosure: true,
    disclosure: 'default-closed-native-details',
    summary: '추가 운영 도구',
    sectionId: 'control-overview',
    workflows: 'hidden',
    advancedOps: 'visible-after-authoritative-surface',
    closedContent: 'removed-from-layout',
    containment: 'min-width-zero-with-bounded-margins',
    taskFlowActions: 'wrapped-without-overflow-masking',
    staffingEditor: 'single-column-inside-secondary-disclosure',
    advancedOpsPanels: 'intrinsic-width-contained',
    evidencePaths: 'wrapped-without-value-truncation',
    rootOverflowMasking: false,
  },
  compatibility: {
    overviewBinding: 'unique',
    renderers: ['control', 'review', 'ops'],
    browserLocalStorage: 'unchanged-source-bindings',
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
    focusChanges: 0,
  },
}, null, 2)}\n`);
