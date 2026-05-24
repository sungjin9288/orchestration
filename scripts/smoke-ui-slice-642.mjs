import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const workflowStartEmpty = !selectedMission && !selectedTask;/);
assert.match(appJs, /const handoffPanelLabel = workflowStartEmpty \? 'Mission intake' : 'Execution handoff';/);
assert.match(appJs, /const handoffPanelTitle = workflowStartEmpty \? '접수 인계' : '실행 인계';/);
assert.match(appJs, /const handoffRosterLabel = workflowStartEmpty \? '접수 라인업' : '실행 라인업';/);
assert.match(
  appJs,
  /renderOverviewPanelHead\(\{\s*label: handoffPanelLabel,\s*title: handoffPanelTitle,\s*\}\)/,
);
assert.match(appJs, /<p class="control-overview-label">\$\{escapeHtml\(handoffRosterLabel\)\}<\/p>/);
assert.doesNotMatch(
  appJs,
  /renderOverviewPanelHead\(\{\s*label: 'Execution handoff',\s*title: '실행 인계',\s*\}\)/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      operatorHomeNoMissionHandoffLabel: {
        emptyStatePanel: 'Mission intake / 접수 인계',
        activeWorkflowPanel: 'Execution handoff / 실행 인계',
        boundary: 'UI orientation only; runtime, API, provider, approval, and artifact contracts unchanged',
      },
    },
    null,
    2,
  ),
);
