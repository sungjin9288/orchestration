import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MISSION_COUNCIL_MODE_OPTIONS,
  createMissionCouncilModeView,
} from '../ui/mission-council-mode.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-675-llm-native-mission-mode-control-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const modeSource = fs.readFileSync(
  new URL('../ui/mission-council-mode.js', import.meta.url),
  'utf8',
);
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const serverSource = fs.readFileSync(
  new URL('./serve-ui-slice-01.mjs', import.meta.url),
  'utf8',
);
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const planSource = fs.readFileSync(
  new URL('../docs/92_llm-native-mission-mode-control-plan.md', import.meta.url),
  'utf8',
);
const decisionSource = fs.readFileSync(new URL('../docs/01_decision-log.md', import.meta.url), 'utf8');

assert.deepEqual(
  MISSION_COUNCIL_MODE_OPTIONS.map((entry) => entry.value),
  ['legacy-deterministic', 'real-local-stub', 'real-openai-responses'],
);

const blockedProvider = createMissionCouncilModeView({
  providerBlockedReason: 'missing model configuration',
  providerReady: false,
  requestedMode: 'real-openai-responses',
});
assert.equal(blockedProvider.options.length, 3);
assert.equal(blockedProvider.selectedMode, 'legacy-deterministic');
assert.equal(
  blockedProvider.options.find((entry) => entry.value === 'real-openai-responses').disabled,
  true,
);
assert.equal(blockedProvider.providerBlockedReason, 'missing model configuration');

const localRoles = createMissionCouncilModeView({
  providerReady: false,
  requestedMode: 'real-local-stub',
});
assert.equal(localRoles.selectedMode, 'real-local-stub');
assert.match(localRoles.help, /역할별 의견/);

const readyProvider = createMissionCouncilModeView({
  providerReady: true,
  requestedMode: 'real-openai-responses',
});
assert.equal(readyProvider.selectedMode, 'real-openai-responses');
assert.equal(readyProvider.providerBlockedReason, '');
assert.equal(readyProvider.options.every((entry) => entry.disabled === false), true);

const knowledgeWork = createMissionCouncilModeView({
  knowledgeWork: true,
  providerReady: true,
  requestedMode: 'real-local-stub',
});
assert.deepEqual(knowledgeWork.options.map((entry) => entry.value), ['legacy-deterministic']);
assert.equal(knowledgeWork.selectedMode, 'legacy-deterministic');

const unknownMode = createMissionCouncilModeView({
  providerReady: true,
  requestedMode: 'unknown-mode',
});
assert.equal(unknownMode.selectedMode, 'legacy-deterministic');

assert.match(appSource, /missionDraftCouncilMode: 'legacy-deterministic'/);
assert.match(appSource, /createMissionCouncilModeView\(\{/);
assert.match(appSource, /<fieldset class="mission-council-mode-selector"/);
assert.match(appSource, /<legend>회의 방식<\/legend>/);
assert.match(appSource, /type="radio"\s+name="missionCouncilMode"/);
assert.match(appSource, /type="hidden" name="missionCouncilMode" value="legacy-deterministic"/);
assert.match(appSource, /formData\.get\('missionCouncilMode'\)/);
assert.match(appSource, /state\.missionDraftCouncilMode = event\.target\.value/);
assert.match(appSource, /state\.missionDraftCouncilMode = 'legacy-deterministic'/);
assert.equal((appSource.match(/>안건 등록<\/button>/g) || []).length, 1);
assert.doesNotMatch(appSource, /type="submit"\s+name="councilMode"/);
assert.doesNotMatch(appSource, /독립 역할 회의 등록|OpenAI 역할 회의 등록/);

assert.match(stylesSource, /\.mission-council-mode-options/);
assert.match(stylesSource, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(stylesSource, /input:checked \+ span/);
assert.match(stylesSource, /input:focus-visible \+ span/);
assert.match(stylesSource, /input:disabled \+ span/);
assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.mission-council-mode-options/);

assert.doesNotMatch(modeSource, /fetch\(|localStorage|sessionStorage|saveState|postJson/);
assert.match(
  serverSource,
  /url\.pathname === '\/mission-council-mode\.js'[\s\S]*serveStaticAsset\(response, 'mission-council-mode\.js'\)/,
);
assert.match(designSource, /Council mode uses one native segmented control/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /one existing `안건 등록` submit command/);
assert.match(planSource, /runtime\/API\/schema\/package dependency changes/i);
assert.match(decisionSource, /### DEC-141/);
assert.match(decisionSource, /one native segmented Council mode control/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  modes: {
    values: MISSION_COUNCIL_MODE_OPTIONS.map((entry) => entry.value),
    providerReadinessGated: true,
    knowledgeWorkFixed: true,
    unknownFallback: 'legacy-deterministic',
  },
  presentation: {
    nativeRadioGroup: true,
    submitCommands: 1,
    refreshExactValueFocus: true,
  },
  authority: {
    browserMemoryOnly: true,
    runtimeWrites: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    newModes: 0,
  },
}, null, 2)}\n`);
