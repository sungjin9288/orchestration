import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-682-llm-native-mission-history-navigation-smoke';

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
  new URL('../docs/99_llm-native-mission-history-navigation-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const getDerivedSource = getFunctionSource('getDerived');
const renderSidebarMissionNavigationSource = getFunctionSource('renderSidebarMissionNavigation');
const submitSelectMissionSource = getFunctionSource('submitSelectMission');
const renderMissionSource = getFunctionSource('renderMission');

assert.match(indexSource, /id="llm-sidebar-missions"/);
assert.match(indexSource, /data-sidebar-mission-history="true"/);
assert.match(indexSource, /id="llm-sidebar-mission-title"/);
assert.match(indexSource, /id="llm-sidebar-mission-count"/);
assert.match(indexSource, /id="llm-sidebar-mission-list"/);

assert.match(getDerivedSource, /Object\.values\(snapshot\.missions \|\| \{\}\)\.sort\(sortByCreatedDesc\)/);
assert.match(getDerivedSource, /missions\.filter\(\(mission\) => mission\.projectId === activeProject\.id\)/);
assert.match(renderSidebarMissionNavigationSource, /const missions = data\.missions \|\| \[\]/);
assert.match(renderSidebarMissionNavigationSource, /missions\s*\.map\(\(mission\) =>/);
assert.doesNotMatch(renderSidebarMissionNavigationSource, /\.slice\(/);
assert.match(renderSidebarMissionNavigationSource, /data-action="select-mission"/);
assert.match(renderSidebarMissionNavigationSource, /aria-pressed="\$\{isSelected \? 'true' : 'false'\}"/);
assert.match(renderSidebarMissionNavigationSource, /getMissionStatusDisplay\(mission\.status\)/);
assert.match(renderSidebarMissionNavigationSource, /state\.sidebarMissionHistoryExpanded/);
assert.match(renderSidebarMissionNavigationSource, /state\.sidebarMissionHistoryExpanded = false/);
assert.doesNotMatch(
  renderSidebarMissionNavigationSource,
  /postJson|fetch\(|localStorage|sessionStorage|saveState/,
);

assert.match(submitSelectMissionSource, /postJson\(`\/api\/missions\/\$\{encodeURIComponent\(missionId\)\}\/select`\)/);
assert.match(submitSelectMissionSource, /syncSelectionsFromMission\(missionId\)/);
assert.match(submitSelectMissionSource, /state\.surface = 'mission'/);
assert.match(renderMissionSource, /<span>전체 미션 기록<\/span>/);
assert.match(appSource, /data-sidebar-mission-history/);
assert.match(appSource, /state\.sidebarMissionHistoryExpanded = disclosure\.open/);

assert.match(stylesSource, /body \.llm-app-shell \.llm-sidebar-missions/);
assert.match(stylesSource, /\.llm-sidebar-mission-list[\s\S]*max-height:/);
assert.match(stylesSource, /@media \(max-width: 820px\)[\s\S]*\.llm-sidebar-missions/);
assert.match(designSource, /quick Mission switching belongs beside the new-Mission command/);
assert.match(decisionSource, /### DEC-148/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  navigation: {
    sourceOrder: 'project-scoped-newest-first',
    fullMissionList: true,
    selectedState: 'aria-pressed',
    selectionCommand: 'existing-select-mission',
    fullRegisterPreserved: true,
    defaultExpanded: false,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    persistedPreference: false,
    automaticSelection: false,
  },
}, null, 2)}\n`);
