import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /<title>Orchestration 1\.0 Workflow Control<\/title>/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /WORK/);
assert.match(indexHtml, /Workflow desk/);
assert.match(indexHtml, /업무/);
assert.match(indexHtml, /id="refresh-status"/);
assert.match(indexHtml, /id="control-overview"/);
assert.match(indexHtml, /aria-label="현재 운영 개요"/);
assert.match(indexHtml, /id="shell-header-project"/);
assert.match(indexHtml, /id="shell-header-surface"/);
assert.match(indexHtml, /id="shell-header-gates"/);

assert.match(appJs, /controlOverview: document\.querySelector\('#control-overview'\)/);
assert.match(appJs, /function getCurrentOverviewContext\(data\)/);
assert.match(appJs, /function renderControlOverview\(data\)/);
assert.match(appJs, /function renderControlOverviewSignalStrip\(items\)/);
assert.match(appJs, /function renderWorkflowsOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /function renderOpsOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /Workflow map/);
assert.match(appJs, /Review queue/);
assert.match(appJs, /Company org/);
assert.match(appJs, /Selected work order/);
assert.match(appJs, /Execution handoff/);
assert.match(appJs, /현재 프로젝트/);
assert.match(appJs, /현재 데스크/);
assert.match(appJs, /담당/);
assert.match(appJs, /다음/);
assert.match(appJs, /현재 패킷/);
assert.match(appJs, /전체 인력/);
assert.match(appJs, /안건/);
assert.match(appJs, /실행/);
assert.match(appJs, /근거/);
assert.match(appJs, /실행 라인업/);
assert.match(appJs, /검토 라인업/);
assert.match(appJs, /팀별 배정/);

assert.match(styles, /\.control-overview \{/);
assert.match(styles, /\.control-overview-stack \{/);
assert.match(styles, /\.control-overview-signal-strip \{/);
assert.match(styles, /\.control-overview-grid \{/);
assert.match(styles, /\.control-overview-panel \{/);
assert.match(styles, /\.control-overview-register \{/);
assert.match(styles, /\.workflow-overview-shell,\s*\.review-overview-shell,\s*\.ops-overview-shell \{/s);
assert.match(styles, /\.company-roster-list,\s*\.ops-roster-matrix \{/s);
assert.match(styles, /\.control-overview-action \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeControlPlane: {
        overviewRegisters: ['현재 데스크', '담당', '다음', '현재 패킷', '전체 인력'],
        shellLabels: ['Workflow Control', 'WORK', 'Workflow desk', '업무', 'refresh-status'],
        workspaceContracts: ['Workflow map', 'Selected work order', 'Execution handoff', 'Review queue', 'Company org'],
        focusRegisters: ['안건', '실행', '근거', '실행 라인업', '검토 라인업', '팀별 배정'],
        modeDock: ['미션', '협의회', '실행', '산출물', '작업판', '로그', '아티팩트', '결정함'],
      },
    },
    null,
    2,
  ),
);
