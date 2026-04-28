import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function renderWorkflowQueueLane\(entry\)/);
assert.match(appJs, /function renderReviewLaneCard\(entry\)/);
assert.match(appJs, /class="workflow-stage-card \$\{isActive \? 'is-active' : ''\}"/);
assert.match(appJs, /class="review-lane-card \$\{isActive \? 'is-active' : ''\}"/);
assert.match(appJs, /\$\{isActive \? 'aria-current="true"' : ''\}/);
assert.match(appJs, /data-selection-state="\$\{isActive \? 'active' : 'idle'\}"/);
assert.match(appJs, /workflow-stage-active-label">현재 보기/);
assert.match(appJs, /review-lane-card-active-label">현재 보기/);
assert.doesNotMatch(appJs, /aria-current="\$\{isActive \? 'true' : 'false'\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      overviewLaneCardCurrentAttribute: {
        activeLaneCards: 'render aria-current=true',
        idleLaneCards: 'omit aria-current instead of rendering false',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
