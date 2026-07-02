import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<h2>오늘 안건을 등록대장에 올리고 바로 다음 회의를 엽니다<\/h2>[\s\S]*Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionOrderDeskCopyTightening: {
        markers: ['Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다.'],
      },
    },
    null,
    2,
  ),
);
