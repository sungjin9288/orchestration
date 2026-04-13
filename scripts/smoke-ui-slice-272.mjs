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

assert.match(appJs, /Selected work order/);
assert.match(appJs, /선택된 work order/);
assert.match(appJs, /Execution handoff/);
assert.match(appJs, /실행 인계/);
assert.match(appJs, /workflow-overview-order/);
assert.match(appJs, /workflow-order-register/);
assert.match(appJs, /workflow-workorder-strip/);
assert.match(appJs, /workflow-handoff-register/);
assert.match(appJs, /지금 처리/);
assert.match(appJs, /다음 인계/);
assert.match(appJs, /실행 라인업/);
assert.match(appJs, /담당/);
assert.match(appJs, /안건/);
assert.match(appJs, /실행/);
assert.match(appJs, /근거/);

assert.match(styles, /\.workflow-overview-order,/);
assert.match(styles, /\.workflow-overview-transfer \{/);
assert.match(styles, /\.workflow-order-register,/);
assert.match(styles, /\.workflow-workorder-strip \{/);
assert.match(styles, /\.workflow-workorder-note \{/);
assert.match(styles, /\.workflow-workorder-note-title \{/);
assert.match(styles, /\.workflow-handoff-register \{/);
assert.match(styles, /\.workflow-handoff-card \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workflowLayoutPolish: {
        panels: ['Workflow map', 'Selected work order', 'Execution handoff'],
        markers: ['담당', '안건', '실행', '근거', '지금 처리', '다음 인계', '실행 라인업'],
      },
    },
    null,
    2,
  ),
);
