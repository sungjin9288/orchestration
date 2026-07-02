import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<strong>진행 안건 등록대장<\/strong>[\s\S]*현재 배정 중인 안건만 모읍니다\./);
assert.match(app, /<strong>종료 안건 보관대장<\/strong>[\s\S]*종료 정리까지 끝난 안건만 따로 보관합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowSectionCopyTightening: {
        markers: [
          '현재 배정 중인 안건만 모읍니다.',
          '종료 정리까지 끝난 안건만 따로 보관합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
