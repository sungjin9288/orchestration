import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /종료 정리 아티팩트 .*로 경로를 닫았습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCompletionReadySummaryCopyTightening: {
        markers: ['종료 정리 아티팩트', '로 경로를 닫았습니다.'],
      },
    },
    null,
    2,
  ),
);
