import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /저장된 종료 정리 번들을 확인한 뒤 새 미션을 시작하거나 이 미션을 다시 다듬습니다\./);
assert.match(app, /push, publish, 외부 릴리스는 범위 밖입니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCompletionReadyNextStepCopyTightening: {
        markers: [
          '저장된 종료 정리 번들을 확인한 뒤 새 미션을 시작하거나 이 미션을 다시 다듬습니다.',
          'push, publish, 외부 릴리스는 범위 밖입니다.',
        ],
      },
    },
    null,
    2,
  ),
);
