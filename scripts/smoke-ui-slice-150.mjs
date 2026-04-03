import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /협의회나 실행에서 현재 경로를 계속 전진합니다\./);
assert.match(app, /종료 정리 번들이 저장돼야 완료가 닫힙니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCompletionNextStepCopyTightening: {
        markers: [
          '협의회나 실행에서 현재 경로를 계속 전진합니다.',
          '종료 정리 번들이 저장돼야 완료가 닫힙니다.',
        ],
      },
    },
    null,
    2,
  ),
);
