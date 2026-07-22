import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-678-llm-native-source-backed-council-meeting-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const protocolSource = fs.readFileSync(
  new URL('../docs/50_council-operating-protocol.md', import.meta.url),
  'utf8',
);
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/95_llm-native-source-backed-council-meeting-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const turnSource = getFunctionSource('getCouncilConversationTurns');
const synthesisSource = getFunctionSource('getCouncilConversationSynthesis');
const surfaceSource = getFunctionSource('renderCouncilConversationSurface');
const alignmentSource = getFunctionSource('renderRealCouncilAlignmentControls');
const evidenceSource = getFunctionSource('renderRealCouncilEvidence');
const councilSource = getFunctionSource('renderCouncil');
const selectionSource = getFunctionSource('syncSelectionsFromMission');

assert.match(turnSource, /isRealCouncilMode\(councilSession\.mode\)/);
assert.match(turnSource, /getLatestRealCouncilPositions\(councilSession\)/);
assert.match(turnSource, /councilSession\.transcript/);
assert.match(turnSource, /toLowerCase\(\) !== 'conductor'/);
assert.doesNotMatch(turnSource, /fetch\(|postJson|localStorage|sessionStorage|saveState/);

assert.match(synthesisSource, /attempt\?\.synthesis/);
assert.match(synthesisSource, /conflicts\.uniqueObjections/);
assert.match(synthesisSource, /councilSession\?\.openQuestions/);
assert.match(synthesisSource, /questions: \[\.\.\.new Set/);

assert.match(surfaceSource, /class="llm-council-shell"/);
assert.match(surfaceSource, /<h3 id="council-conversation-title">역할별 판단<\/h3>/);
assert.match(surfaceSource, /Conductor synthesis/);
assert.match(surfaceSource, /Conflict와 dissent/);
assert.match(surfaceSource, /class="council-alignment-gate"/);
assert.match(surfaceSource, /renderRealCouncilAlignmentControls\(councilSession\)/);
assert.match(surfaceSource, /data-action="approve-council-for-mission"/);
assert.match(surfaceSource, /data-action="revise-mission"/);
assert.match(surfaceSource, /data-action="open-advanced-ops"/);
assert.match(surfaceSource, /class="llm-deep-inspector council-source-inspector"/);
assert.doesNotMatch(surfaceSource, /renderCouncilBoardroomStage|renderCouncilHeartbeatStrip|renderViewportHandoffStrip/);
assert.doesNotMatch(surfaceSource, /fetch\(|postJson|localStorage|sessionStorage|saveState/);

assert.match(alignmentSource, /data-action="approve-real-council-session"/);
assert.match(alignmentSource, /data-action="request-revision-real-council-session"/);
assert.match(alignmentSource, /data-action="stop-real-council-session"/);
assert.match(alignmentSource, /class="council-alignment-secondary"/);
assert.match(alignmentSource, /data-council-disclosure="revision"/);
assert.match(alignmentSource, /data-council-disclosure="workOrder"/);
assert.match(evidenceSource, /Real Council provenance/);
assert.match(evidenceSource, /provider-calls:/);
assert.doesNotMatch(evidenceSource, /position\.recommendation|synthesis\.adoptedRecommendation/);
assert.match(councilSource, /document\.querySelector\('\.llm-app-shell'\)/);
assert.match(councilSource, /renderCouncilConversationSurface\(/);
assert.match(appSource, /councilDisclosures: \{[\s\S]*source: false,[\s\S]*revision: false,[\s\S]*workOrder: false/);
assert.match(appSource, /addEventListener\([\s\S]*'toggle',[\s\S]*data-council-disclosure/);
assert.match(selectionSource, /state\.councilDisclosures = \{[\s\S]*source: false,[\s\S]*revision: false,[\s\S]*workOrder: false/);

assert.match(stylesSource, /\.llm-council-shell \{/);
assert.match(stylesSource, /\.council-turn-list \{/);
assert.match(stylesSource, /\.council-synthesis \{/);
assert.match(stylesSource, /\.council-alignment-gate \{/);
assert.match(stylesSource, /\.council-source-inspector \{/);
assert.match(stylesSource, /\.council-source-inspector-body > \*[\s\S]*min-width: 0/);
assert.match(stylesSource, /\.council-source-inspector \.llm-context-list dd[\s\S]*overflow-wrap: anywhere/);
assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.llm-council-shell/);

assert.match(designSource, /### Council Conversation/);
assert.match(designSource, /source-backed review flow, not a boardroom simulation or group chat/);
assert.match(protocolSource, /source-backed\s+independent positions, Conductor synthesis, recorded dissent, human alignment/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(decisionSource, /### DEC-144/);
assert.match(decisionSource, /source-backed Council meeting slice/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    order: ['mission-context', 'role-positions', 'conductor-synthesis', 'dissent', 'operator-alignment'],
    primaryBoardroomSections: 0,
    generatedMessages: false,
    secondaryEvidenceCollapsed: true,
    duplicateRecommendationsInInspector: false,
    refreshStableDisclosure: true,
    disclosureResetsOnMissionChange: true,
  },
  compatibility: {
    legacyTranscript: true,
    realLocalStub: true,
    realOpenAiResponses: true,
    alignmentActions: ['approve', 'request-revision', 'stop'],
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    automaticAlignment: false,
    sourceMutation: false,
  },
}, null, 2)}\n`);
