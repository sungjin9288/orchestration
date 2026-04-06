import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /'runtime guard unavailable': '런타임 가드 요약을 아직 확인할 수 없습니다\.',/);
assert.match(appJs, /'runtime request summary unavailable': '런타임 요청 요약을 아직 확인할 수 없습니다\.',/);
assert.doesNotMatch(appJs, /'runtime guard unavailable': 'runtime 가드 요약을 아직 확인할 수 없습니다\.',/);
assert.doesNotMatch(appJs, /'runtime request summary unavailable': 'runtime 요청 요약을 아직 확인할 수 없습니다\.',/);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeGuardCopy: {
        markers: ['런타임 가드 요약을 아직 확인할 수 없습니다.', '런타임 요청 요약을 아직 확인할 수 없습니다.'],
      },
    },
    null,
    2,
  ),
);
