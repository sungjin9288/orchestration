import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /function renderWorkflowQueueLane\(entry\)/);
assert.match(appJs, /function renderReviewLaneCard\(entry\)/);
assert.match(appJs, /class="workflow-stage-meta"/);
assert.match(appJs, /class="workflow-stage-field"/);
assert.match(appJs, /class="review-lane-card-meta"/);
assert.match(appJs, /class="review-lane-card-field"/);
assert.match(appJs, /owner: '안건 담당'/);
assert.match(appJs, /owner: '회의 리드'/);
assert.match(appJs, /owner: '실행 역할'/);
assert.match(appJs, /owner: 'reviewer'/);
assert.match(appJs, /owner: '사람 게이트'/);
assert.match(appJs, /담당:/);

assert.match(styles, /\.workflow-stage-meta,\s*\.review-lane-card-meta \{/s);
assert.match(styles, /\.workflow-stage-field,\s*\.review-lane-card-field \{/s);
assert.match(styles, /\.workflow-stage-field \.control-overview-register-value,\s*\.review-lane-card-field \.control-overview-register-value \{/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      queueRowClarity: {
        app: [
          'workflow-stage-meta',
          'workflow-stage-field',
          'review-lane-card-meta',
          'review-lane-card-field',
          'owner: 안건 담당/회의 리드/실행 역할/reviewer/사람 게이트',
          '담당:',
        ],
        styles: ['workflow-stage-meta', 'workflow-stage-field', 'review-lane-card-meta', 'review-lane-card-field'],
      },
    },
    null,
    2,
  ),
);
