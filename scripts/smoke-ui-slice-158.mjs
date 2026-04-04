import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /heading: '현재 작전 판단과 다음 후속만 먼저 봅니다'/);
assert.match(app, /오른쪽 패널은 긴 provenance 대신 현재 게이트와 바로 할 후속만 먼저 보여 줍니다\./);
assert.doesNotMatch(app, /작전실 오른쪽 패널은 긴 provenance보다 현재 게이트와 바로 해야 할 후속을 먼저 보여 줍니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionRightPanelCopy: 'tightened',
    },
    null,
    2,
  ),
);
