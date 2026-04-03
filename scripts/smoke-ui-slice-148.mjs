import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /연결 태스크가 종료 정리를 마치면 이곳에 미션 완료 요약이 뜹니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCompletionSummaryCopyTightening: {
        markers: ['연결 태스크가 종료 정리를 마치면 이곳에 미션 완료 요약이 뜹니다.'],
      },
    },
    null,
    2,
  ),
);
