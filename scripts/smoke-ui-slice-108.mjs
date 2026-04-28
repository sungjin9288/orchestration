import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /<div class="control-overview-grid control-overview-grid-workflows workflow-overview-shell"/);
assert.match(appJs, /<div class="control-overview-grid control-overview-grid-review review-overview-shell"/);
assert.match(appJs, /<div class="control-overview-grid control-overview-grid-ops ops-overview-shell"/);
assert.match(appJs, /class="workflow-stage-card \$\{isActive \? 'is-active' : ''\}"/);
assert.match(appJs, /class="review-lane-card \$\{isActive \? 'is-active' : ''\}"/);
assert.match(appJs, /\$\{isActive \? 'aria-current="true"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isActive \? 'true' : 'false'\}"/);
assert.match(appJs, /data-selection-state="\$\{isActive \? 'active' : 'idle'\}"/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-action="open-company-seat"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(check\.action\.targetSurface\)\}"/);
assert.match(appJs, /function getCurrentOverviewContext\(data\)/);
assert.match(appJs, /function getControlOverviewFocus\(context\)/);
assert.match(appJs, /function getControlOverviewCheck\(surface, context, data\)/);
assert.match(appJs, /function renderWorkflowQueueLane\(entry\)/);
assert.match(appJs, /function renderReviewLaneCard\(entry\)/);
assert.match(appJs, /function renderCompanyRosterList\(members, emptyCopy = '배정된 인력이 아직 없습니다\.'\)/);
assert.match(appJs, /function renderOpsRosterMatrix\(members\)/);
assert.match(appJs, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /function renderOpsOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /workflow-stage-stack/);
assert.match(appJs, /workflow-workorder-strip/);
assert.match(appJs, /review-lane-stack/);
assert.match(appJs, /ops-team-section-list/);
assert.match(appJs, /현재 데스크/);
assert.match(appJs, /담당/);
assert.match(appJs, /안건/);
assert.match(appJs, /실행/);
assert.match(appJs, /근거/);
assert.match(appJs, /지금 처리/);
assert.match(appJs, /다음 인계/);
assert.match(appJs, /막힘/);
assert.match(appJs, /실행 라인업/);
assert.match(appJs, /class="nav-button-main"/);
assert.match(appJs, /button\.setAttribute\('aria-current', 'page'\);/);
assert.match(appJs, /button\.removeAttribute\('aria-current'\);/);
assert.doesNotMatch(appJs, /button\.setAttribute\('aria-current', isActive \? 'page' : 'false'\);/);
assert.match(appJs, /button\.setAttribute\('aria-label', `\$\{label\} \$\{count\}건\. \$\{guidance\}`\);/);
assert.doesNotMatch(appJs, /nav-button-kicker/);
assert.doesNotMatch(appJs, /nav-button-meta/);

assert.match(styles, /\.control-overview-grid \{/);
assert.match(styles, /\.control-overview-grid-workflows \{/);
assert.match(styles, /\.control-overview-grid-review \{/);
assert.match(styles, /\.control-overview-grid-ops \{/);
assert.match(styles, /\.workflow-stage-card \{/);
assert.match(styles, /\.workflow-stage-meta,\s*\.review-lane-card-meta \{/s);
assert.match(styles, /\.workflow-stage-field,\s*\.review-lane-card-field \{/s);
assert.match(styles, /\.review-lane-stack \{/);
assert.match(styles, /\.review-packet-grid,\s*\.ops-org-metrics \{/s);
assert.match(styles, /\.review-evidence-grid \{/);
assert.match(styles, /\.company-roster-list,\s*\.ops-roster-matrix \{/s);
assert.match(styles, /\.nav-button-main \{/);
assert.match(styles, /\.company-directory-row \{/);
assert.match(styles, /\.nav-button\.is-active \{/);
assert.doesNotMatch(styles, /\.nav-button::before \{/);
assert.doesNotMatch(styles, /\.nav-button\.is-active\[data-surface="logs"\] \{/);
assert.doesNotMatch(styles, /\.nav-button\.is-active\[data-surface="decision-inbox"\] \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewInteraction: {
        queueSurfaces: ['mission', 'council', 'execution', 'deliverables', 'decision-inbox'],
        focusRegisters: ['현재 데스크', '담당', '안건', '실행', '근거', '지금 처리', '다음 인계'],
        checkRegisters: ['막힘', '다음', '근거'],
        accentCarriers: ['workflow-stage-card', 'review-lane-card', 'workflow-stage-meta', 'review-lane-card-meta', 'nav-button.is-active'],
        currentAttribute: 'active lane cards only render aria-current=true',
      },
    },
    null,
    2,
  ),
);
