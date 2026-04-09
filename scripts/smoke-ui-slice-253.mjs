import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /taskboard-task-register/);
assert.match(app, /taskboard-task-section/);
assert.match(app, /taskboard-task-next-block/);
assert.match(app, /ops-list-register ops-list-register-primary/);
assert.match(app, /ops-list-register ops-list-register-next/);
assert.match(app, /ops-list-foot/);
assert.match(app, /실행 등록/);
assert.match(app, /현재 상태/);
assert.match(app, /다음 처리/);

assert.match(styles, /\.ops-list-register \{/);
assert.match(styles, /\.ops-list-register-primary \{/);
assert.match(styles, /\.ops-list-foot \{/);
assert.match(styles, /\.taskboard-task-register \{/);
assert.match(styles, /\.taskboard-task-section \{/);
assert.match(styles, /\.taskboard-task-next-block \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      rowRegisterContract: {
        helpers: [
          'ops-list-register',
          'ops-list-foot',
          'taskboard-task-register',
          'taskboard-task-next-block',
        ],
        labels: ['실행 등록', '현재 상태', '다음 처리'],
      },
    },
    null,
    2,
  ),
);
