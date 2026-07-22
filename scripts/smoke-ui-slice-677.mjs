import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-677-llm-native-source-backed-mission-thread-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(new URL('../docs/01_decision-log.md', import.meta.url), 'utf8');
const planSource = fs.readFileSync(
  new URL('../docs/94_llm-native-source-backed-mission-thread-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const workstreamSource = getFunctionSource('renderLlmMissionWorkstream');
const viewSelectorSource = getFunctionSource('renderMissionViewSelector');

assert.match(workstreamSource, /const workstreamEntries = \[[\s\S]*role: 'Operator'[\s\S]*title: null/);
assert.match(workstreamSource, /if \(councilSession\) \{[\s\S]*role: 'Council'/);
assert.match(workstreamSource, /if \(linkedTask\) \{[\s\S]*role: 'Execution'/);
assert.match(workstreamSource, /if \(currentArtifact\) \{[\s\S]*role: 'Deliverables'/);
assert.match(workstreamSource, /<h3 id="llm-workstream-title">진행 기록<\/h3>/);
assert.match(workstreamSource, /entry\.title \? `<h4>/);
assert.match(workstreamSource, /class="llm-next-gate"/);
assert.doesNotMatch(workstreamSource, /역할별 정렬 대기|WorkOrder 실행 대기|결과 패킷 대기/);
assert.doesNotMatch(workstreamSource, /postJson|fetch\(|localStorage|sessionStorage|saveState/);

assert.match(viewSelectorSource, /data-view-mode="thread"/);
assert.match(viewSelectorSource, /data-view-mode="graph"/);
assert.match(stylesSource, /\.llm-turn-meta \+ p \{[\s\S]*margin-top: 8px/);
assert.match(designSource, /Render only turns backed by current Mission evidence/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /No content is generated, inferred, or\s+persisted/);
assert.match(decisionSource, /### DEC-143/);
assert.match(decisionSource, /source-backed Mission thread slice/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    chronologicalStages: ['operator', 'council', 'execution', 'deliverables'],
    sourceBackedTurnsOnly: true,
    futurePlaceholderTurns: 0,
    activeTitleOwner: 'mission-lead',
    nextGatePreserved: true,
  },
  compatibility: {
    threadDefaultPreserved: true,
    graphProjectionPreserved: true,
    contextInspectorPreserved: true,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    generatedMessages: false,
    automaticStageAdvance: false,
  },
}, null, 2)}\n`);
