import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<strong>진행 중인 미션<\/strong>[\s\S]*지금 움직이는 안건만 모읍니다\./);
assert.match(app, /<strong>완료된 미션<\/strong>[\s\S]*봉인된 안건은 이 줄에 보관합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowSectionCopyTightening: {
        markers: [
          '지금 움직이는 안건만 모읍니다.',
          '봉인된 안건은 이 줄에 보관합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
