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

assert.match(appJs, /\$\{isActive \? 'aria-current="true"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isActive \? 'true' : 'false'\}"/);
assert.match(appJs, /data-selection-state="\$\{isActive \? 'active' : 'idle'\}"/);
assert.match(appJs, /workflow-stage-active-label">현재 보기</);
assert.match(appJs, /review-lane-card-active-label">현재 보기</);

assert.match(styles, /\.workflow-stage-card::before,\s*\.review-lane-card::before \{/s);
assert.match(styles, /\.workflow-stage-card\.is-active::before,\s*\.review-lane-card\.is-active::before \{/s);
assert.match(styles, /\.workflow-stage-head-main,\s*\.review-lane-card-head-main \{/s);
assert.match(styles, /\.workflow-stage-active-label,\s*\.review-lane-card-active-label \{/s);
assert.match(styles, /\.workflow-stage-card\.is-active \.workflow-stage-field,\s*\.review-lane-card\.is-active \.review-lane-card-field \{/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      queueSelectionContrast: {
        app: ['conditional aria-current', 'data-selection-state', 'workflow-stage-active-label', 'review-lane-card-active-label'],
        styles: [
          'workflow-stage-card::before',
          'review-lane-card::before',
          'workflow-stage-head-main',
          'review-lane-card-head-main',
          'workflow-stage-active-label',
          'review-lane-card-active-label',
          'workflow-stage-card.is-active .workflow-stage-field',
          'review-lane-card.is-active .review-lane-card-field',
        ],
      },
    },
    null,
    2,
  ),
);
