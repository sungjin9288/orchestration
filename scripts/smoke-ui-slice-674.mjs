import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-674-llm-native-active-mission-focus-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const indexHtml = fs.readFileSync(new URL('../ui/index.html', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const planSource = fs.readFileSync(
  new URL('../docs/91_llm-native-active-mission-focus-plan.md', import.meta.url),
  'utf8',
);
const decisionSource = fs.readFileSync(new URL('../docs/01_decision-log.md', import.meta.url), 'utf8');

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Missing function ${name}`);

  const nextFunction = appSource.indexOf('\nfunction ', start + 1);
  return appSource.slice(start, nextFunction === -1 ? appSource.length : nextFunction);
}

const syncSelectionsSource = getFunctionSource('syncSelectionsFromMission');
const prepareNextSource = getFunctionSource('prepareNextMissionDraft');
const captureFocusSource = getFunctionSource('captureMissionComposerFocus');
const restoreFocusSource = getFunctionSource('restoreMissionComposerFocus');
const startDraftSource = getFunctionSource('startNewMissionDraft');
const closeComposerSource = getFunctionSource('closeMissionComposer');
const missionLeadSource = getFunctionSource('renderLlmMissionLead');
const renderMissionSource = getFunctionSource('renderMission');

assert.match(indexHtml, /class="llm-new-mission-button"[^>]*data-action="start-new-mission"/);
assert.doesNotMatch(
  indexHtml,
  /class="llm-new-mission-button"[^>]*data-action="open-surface"/,
);

assert.match(appSource, /missionComposerExpanded: false/);
assert.match(
  renderMissionSource,
  /const missionComposerExpanded = !selectedMission \|\| state\.missionComposerExpanded/,
);
assert.match(renderMissionSource, /missionComposerExpanded\s*\? `[\s\S]*data-form="create-mission"/);
assert.match(renderMissionSource, /data-composer-state="expanded"/);
assert.match(renderMissionSource, /data-composer-state="compact"/);
assert.match(renderMissionSource, /data-action="close-mission-composer"/);
assert.match(renderMissionSource, /missionDraftHasContent \? '미션 초안 계속' : '새 미션 작성'/);
assert.match(renderMissionSource, /renderMissionViewSelector\(selectedMission\)/);

assert.match(syncSelectionsSource, /state\.missionComposerExpanded = false/);
assert.match(prepareNextSource, /state\.missionComposerExpanded = true/);
assert.match(startDraftSource, /state\.missionComposerExpanded = true/);
assert.match(startDraftSource, /state\.surface = 'mission'/);
assert.match(startDraftSource, /restoreMissionComposerFocus\(\)/);
assert.match(closeComposerSource, /if \(!state\.selectedMissionId\) return/);
assert.match(closeComposerSource, /state\.missionComposerExpanded = false/);
assert.match(closeComposerSource, /restoreMissionComposerFocus\('newMissionAction'\)/);

assert.match(restoreFocusSource, /getClientRects\(\)\.length > 0/);
assert.match(restoreFocusSource, /\[data-action="start-new-mission"\]/);
assert.match(restoreFocusSource, /\[name="\$\{targetName\}"\]/);
assert.match(restoreFocusSource, /setSelectionRange\(selection\.selectionStart, selection\.selectionEnd\)/);
assert.match(captureFocusSource, /\[data-form="create-mission"\]/);
assert.match(captureFocusSource, /selectionStart/);
assert.match(captureFocusSource, /selectionEnd/);
assert.match(captureFocusSource, /targetValue: activeElement\.value/);
assert.match(restoreFocusSource, /element\.value === selection\.targetValue/);
assert.match(appSource, /const missionComposerFocus = captureMissionComposerFocus\(\)/);
assert.match(
  appSource,
  /restoreMissionComposerFocus\(missionComposerFocus\.targetName, missionComposerFocus\)/,
);
assert.match(missionLeadSource, /selectedMission\.title/);
assert.match(missionLeadSource, /is-active-mission/);
assert.match(missionLeadSource, /composingNew/);

for (const browserOnlySource of [
  captureFocusSource,
  restoreFocusSource,
  startDraftSource,
  closeComposerSource,
]) {
  assert.doesNotMatch(browserOnlySource, /postJson|fetch\(|localStorage|sessionStorage|saveState/);
}

assert.match(appSource, /postJson\('\/api\/missions'/);
assert.match(appSource, /formData\.get\('missionCouncilMode'\)/);
assert.match(stylesSource, /\.llm-mission-lead\.is-active-mission/);
assert.match(stylesSource, /\.llm-mission-compose-trigger/);
assert.match(stylesSource, /@media \(max-width: 820px\)[\s\S]*\.llm-mission-lead\.is-active-mission/);

assert.match(designSource, /An active Mission prioritizes its title and `Thread \| Graph` workstream/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(
  planSource,
  /No draft object, route, storage key, runtime\s+record, or automatic submit/,
);
assert.match(planSource, /Durable or server-side Mission drafts/i);
assert.match(decisionSource, /### DEC-140/);
assert.match(decisionSource, /browser-memory compose flag/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    activeMissionDefaultsCompact: true,
    noMissionDefaultsExpanded: true,
    explicitCompose: true,
    cancelRestoresActiveMission: true,
    visibleFocusRestoration: true,
    refreshFocusPreservation: true,
  },
  compatibility: {
    existingMissionForm: true,
    existingMissionPost: true,
    councilModesPreserved: true,
  },
  authority: {
    browserMemoryOnly: true,
    runtimeWrites: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    automaticSubmit: false,
  },
}, null, 2)}\n`);
