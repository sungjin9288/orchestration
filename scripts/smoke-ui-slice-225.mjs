import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /아직 릴리스패키지 연결 근거가 없습니다\./);
assert.match(app, /아직 종료정리 연결 근거가 없습니다\./);
assert.match(app, /세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다\./);
assert.match(app, /오른쪽 패널은 긴 근거 대신 현재 게이트와 바로 할 후속만 먼저 보여 줍니다\./);

assert.doesNotMatch(app, /아직 릴리스패키지 provenance 연결이 없습니다\./);
assert.doesNotMatch(app, /아직 종료정리 provenance 연결이 없습니다\./);
assert.doesNotMatch(app, /세부 제어와 provenance는 관제실에 남기고, 여기선 안건 동선만 엽니다\./);
assert.doesNotMatch(app, /긴 provenance 대신 현재 게이트와 바로 할 후속만 먼저 보여 줍니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      provenanceHelperBatch: {
        markers: [
          '아직 릴리스패키지 연결 근거가 없습니다.',
          '아직 종료정리 연결 근거가 없습니다.',
          '세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다.',
          '오른쪽 패널은 긴 근거 대신 현재 게이트와 바로 할 후속만 먼저 보여 줍니다.',
        ],
      },
    },
    null,
    2,
  ),
);
