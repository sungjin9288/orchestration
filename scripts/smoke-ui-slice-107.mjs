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

assert.match(indexHtml, /id="control-overview"/);

assert.match(appJs, /function renderControlOverview\(data\)/);
assert.match(appJs, /function getControlOverviewFocus\(context\)/);
assert.match(appJs, /function getControlOverviewCheck\(surface, context, data\)/);
assert.match(appJs, /function renderWorkflowQueueLane\(entry\)/);
assert.match(appJs, /function renderReviewLaneCard\(entry\)/);
assert.match(appJs, /function renderOpsRosterMatrix\(members\)/);
assert.match(appJs, /Workflow map/);
assert.match(appJs, /Selected work order/);
assert.match(appJs, /Execution handoff/);
assert.match(appJs, /Review queue/);
assert.match(appJs, /Selected packet/);
assert.match(appJs, /Company org/);
assert.match(appJs, /AI staffing desk/);

assert.match(styles, /\.control-overview-panel-head \{/);
assert.match(styles, /\.control-overview-label \{/);
assert.match(styles, /\.control-overview-title \{/);
assert.match(styles, /\.control-overview-copy,\s*\.control-overview-queue-note \{/s);
assert.match(styles, /\.control-overview-action \{/);
assert.match(styles, /\.nav-button-main \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeControlOverview: {
        section: 'control-overview',
        panes: ['Workflow map', 'Selected work order', 'Execution handoff', 'Review queue', 'AI staffing desk'],
        laneContracts: ['workflow-stage-card', 'review-lane-card', 'ops-roster-matrix'],
        focusContracts: ['Selected work order', 'Selected packet', 'Company org'],
      },
    },
    null,
    2,
  ),
);
