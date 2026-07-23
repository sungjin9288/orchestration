import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-690-llm-native-mission-next-gate-navigation-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const snapshotsSource = fs.readFileSync(new URL('../ui/control-snapshots.js', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/107_llm-native-mission-next-gate-navigation-plan.md', import.meta.url),
  'utf8',
);

const leadStart = appSource.indexOf('function renderLlmMissionLead(selectedMission = null, options = {}) {');
const workstreamStart = appSource.indexOf('function renderLlmMissionWorkstream(options = {}) {');
const selectorStart = appSource.indexOf('function renderMissionViewSelector(mission) {');
const missionSurfaceStart = appSource.indexOf('function renderMission(data) {');
const nextRendererStart = appSource.indexOf('function renderCouncil(data) {');
const leadSource = appSource.slice(leadStart, workstreamStart);
const workstreamSource = appSource.slice(workstreamStart, selectorStart);
const missionSurfaceSource = appSource.slice(missionSurfaceStart, nextRendererStart);

assert.notEqual(leadStart, -1, 'Missing Mission lead renderer');
assert.notEqual(workstreamStart, -1, 'Missing Mission workstream renderer');
assert.notEqual(selectorStart, -1, 'Missing Mission view selector');
assert.notEqual(missionSurfaceStart, -1, 'Missing Mission surface renderer');
assert.notEqual(nextRendererStart, -1, 'Missing Mission inspector renderer');

assert.match(leadSource, /const nextAction = options\.nextAction \|\| null;/);
assert.match(leadSource, /const nextGateId = options\.nextGateId \|\| '';/);
assert.match(leadSource, /nextAction\?\.surface/);
assert.match(leadSource, /nextAction\.surface !== 'mission'/);
assert.match(leadSource, /nextAction\.actionLabel/);
assert.match(leadSource, /<nav class="llm-mission-next-gate-summary" aria-label="다음 gate">/);
assert.match(leadSource, /<a href="#\$\{escapeHtml\(nextGateId\)\}">다음 단계 확인<\/a>/);
assert.equal((leadSource.match(/llm-mission-next-gate-summary/g) || []).length, 1);
assert.doesNotMatch(leadSource, /data-action="open-surface-for-mission"/);

assert.match(workstreamSource, /const nextGateId = options\.nextGateId \|\| '';/);
assert.match(
  workstreamSource,
  /class="llm-next-gate"\$\{nextGateId \? ` id="\$\{escapeHtml\(nextGateId\)\}" tabindex="-1"` : ''\}/,
);
assert.equal((workstreamSource.match(/data-action="open-surface-for-mission"/g) || []).length, 1);
assert.match(workstreamSource, /class="primary-button llm-next-gate-button"/);

assert.match(
  missionSurfaceSource,
  /state\.missionViewMode === 'thread'\s*\? `mission-next-gate-\$\{selectedMission\.id\}`\s*: ''/,
);
assert.match(missionSurfaceSource, /nextAction: selectedMissionNextActionPreview,/);
assert.match(missionSurfaceSource, /nextGateId: missionNextGateId,/);
assert.match(missionSurfaceSource, /state\.missionViewMode === 'graph'\s*\? renderMissionEvidenceGraph/);
assert.match(missionSurfaceSource, /: renderLlmMissionWorkstream\(/);

assert.match(
  stylesSource,
  /\.llm-mission-next-gate-summary a:focus-visible,\s*\.llm-next-gate:focus-visible \{\s*outline:/,
);
assert.match(
  stylesSource,
  /@media \(min-width: 821px\) \{\s*\.llm-next-gate\[id\] \{\s*scroll-margin-top:\s*58px;/,
);
assert.match(snapshotsSource, /export function getMissionNextActionPreview\(mission, previews\)/);
assert.match(snapshotsSource, /surface: 'mission'/);
assert.match(snapshotsSource, /surface: 'council'/);
assert.match(snapshotsSource, /surface: 'execution'/);
assert.match(snapshotsSource, /surface: 'deliverables'/);

assert.match(designSource, /Mission Thread keeps the next gate visible as source-backed status/);
assert.match(decisionSource, /### DEC-156/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(planSource, /No runtime, API, schema, dependency, storage, provider, source, Git, or authority change/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  navigation: {
    source: 'getMissionNextActionPreview',
    mode: 'thread-only',
    link: 'one-native-fragment-anchor',
    target: 'one-focusable-lower-gate',
    missionOnlyNextAction: 'hidden',
    graph: 'unchanged',
  },
  authority: {
    quickNavigationActions: 0,
    lowerAuthorityActions: 1,
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    storageChanges: 0,
    providerChanges: 0,
    sourceMutation: false,
    gitChanges: 0,
  },
}, null, 2)}\n`);
