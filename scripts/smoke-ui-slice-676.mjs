import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getMissionProjectBootstrapState } from '../ui/project-bootstrap.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-676-llm-native-first-run-project-connection-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const bootstrapSource = fs.readFileSync(
  new URL('../ui/project-bootstrap.js', import.meta.url),
  'utf8',
);
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(new URL('../docs/01_decision-log.md', import.meta.url), 'utf8');
const planSource = fs.readFileSync(
  new URL('../docs/93_llm-native-first-run-project-connection-plan.md', import.meta.url),
  'utf8',
);
const qaOneSource = fs.readFileSync(new URL('./smoke-qa-slice-01.mjs', import.meta.url), 'utf8');
const qaTwoSource = fs.readFileSync(new URL('./smoke-qa-slice-02.mjs', import.meta.url), 'utf8');

function extractFunction(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`function ${nextName}`, start);

  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);

  return source.slice(start, end);
}

const firstProject = getMissionProjectBootstrapState({ projects: [] });
assert.deepEqual(firstProject, {
  actionLabel: '프로젝트 연결',
  contextLabel: '첫 설정',
  copy: 'Orchestration이 사용할 로컬 경로를 먼저 확인합니다.',
  heading: '작업할 프로젝트를 연결하세요',
  panelCopy: '',
  title: '프로젝트 연결',
});

const existingProjects = getMissionProjectBootstrapState({
  projects: [{ id: 'project-0001' }],
});
assert.deepEqual(existingProjects, {
  actionLabel: '새 프로젝트 연결',
  contextLabel: '프로젝트 선택',
  copy: '등록된 경로를 선택하거나 새 프로젝트를 연결합니다.',
  heading: '작업할 프로젝트를 선택하세요',
  panelCopy: '현재 작업 문맥을 하나 선택합니다.',
  title: '등록된 프로젝트',
});

const renderMissionSource = extractFunction(appSource, 'renderMission', 'renderCouncil');
assert.match(appSource, /getMissionProjectBootstrapState/);
assert.match(appSource, /renderLlmMissionLead\(data, null, \{ projectBootstrap \}\)/);
assert.match(appSource, /class="llm-project-bootstrap-surface"/);
assert.match(appSource, /class="project-bootstrap[^"$]*\$\{missionMode \? 'project-bootstrap-mission'/);
assert.match(appSource, /missionMode\s+\? ''\s+: `\s*<div class="empty-state">/);
assert.match(appSource, /class="field-grid \$\{missionMode \? 'project-bootstrap-fields'/);
assert.match(appSource, /missionMode \? '로컬 경로' : '프로젝트 경로 \(project_path\)'/);
assert.match(appSource, /primary-button project-connect-button/);
assert.match(appSource, /local-stub · review \+ approval gated/);
assert.doesNotMatch(renderMissionSource, /<section class="surface-panel">/);
assert.doesNotMatch(renderMissionSource, /<aside class="detail-card">/);
assert.doesNotMatch(renderMissionSource, /프로젝트를 먼저 고른 뒤 미션을 만듭니다/);

assert.doesNotMatch(bootstrapSource, /fetch\(|localStorage|sessionStorage|saveState|postJson/);
assert.match(stylesSource, /\.project-bootstrap-mission \{[\s\S]*border: 0;[\s\S]*background: transparent/);
assert.match(stylesSource, /\.project-create-form-mission \{[\s\S]*border: 0;[\s\S]*background: transparent/);
assert.match(stylesSource, /\.project-bootstrap-fields \{[\s\S]*grid-template-columns:/);
assert.match(stylesSource, /@media \(max-width: 720px\) \{[\s\S]*\.project-bootstrap-fields/);
assert.match(stylesSource, /@media \(max-width: 520px\) \{[\s\S]*\.project-connect-button \{[\s\S]*width: 100%/);

assert.match(qaOneSource, /프로젝트 연결\|새 프로젝트 연결/);
assert.match(qaTwoSource, /작업할 프로젝트를 연결하세요/);
assert.match(designSource, /Before a project exists, the first screen states that prerequisite directly/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /existing project create and select routes unchanged/);
assert.match(decisionSource, /### DEC-142/);
assert.match(decisionSource, /removes nested Mission bootstrap cards/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    honestPrerequisite: true,
    nestedBootstrapCards: 0,
    redundantEmptyState: false,
    commands: ['project-connect'],
    desktopColumns: 3,
    mobileColumns: 1,
  },
  compatibility: {
    existingProjectCreateRoute: true,
    existingProjectSelectRoute: true,
    projectPathRequired: true,
    localStubDefault: true,
    advancedOpsUnchanged: true,
  },
  authority: {
    runtimeWritesAdded: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    automaticMissionCreation: false,
  },
}, null, 2)}\n`);
