import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /control-overview/);

assert.match(app, /controlOverview: document\.querySelector\('#control-overview'\)/);
assert.match(app, /function getCompanyFloorBoardEntries\(data, navGroupId\)/);
assert.match(app, /function renderControlOverview\(data\)/);
assert.match(app, /function renderWorkflowsOverview\(data, context, activeGroupId\)/);
assert.match(app, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(app, /function renderOpsOverview\(data, context, activeGroupId\)/);
assert.match(app, /본부 접수/);
assert.match(app, /회의실/);
assert.match(app, /실행 셀/);
assert.match(app, /보고 데스크/);
assert.match(app, /증적 패킷/);
assert.match(app, /실행 로그/);
assert.match(app, /승인선/);
assert.match(app, /작업판/);
assert.match(app, /workflow-stage-card/);
assert.match(app, /review-lane-card/);
assert.match(app, /ops-roster-matrix/);
assert.match(app, /ops-team-section-list/);

assert.match(styles, /\.workflow-overview-shell,\s*\.review-overview-shell,\s*\.ops-overview-shell \{/s);
assert.match(styles, /\.workflow-stage-stack \{/);
assert.match(styles, /\.review-lane-stack \{/);
assert.match(styles, /\.ops-roster-sheet \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewQueueContract: {
        surfaces: ['본부 접수', '회의실', '실행 셀', '보고 데스크', '증적 패킷', '실행 로그', '승인선', '작업판'],
        helpers: ['workflow-stage-card', 'review-lane-card', 'ops-roster-sheet', 'getCompanyFloorBoardEntries'],
      },
    },
    null,
    2,
  ),
);
