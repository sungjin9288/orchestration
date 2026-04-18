import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /stagePreview: '아직 실행 기록이 없습니다\.'/);
assert.match(appJs, /<p class="detail-key">최신 실행 기록<\/p>/);
assert.match(appJs, /latestRun\?\.id \|\| '아직 없음'/);
assert.match(appJs, /task\.worktreeRef \|\| '아직 연결 안 됨'/);
assert.match(appJs, /'아직 실행 기록이 없습니다\.'/);

assert.doesNotMatch(appJs, /stagePreview: '아직 기록된 실행 run이 없습니다\.'/);
assert.doesNotMatch(appJs, /<p class="detail-key">최신 run<\/p>/);
assert.doesNotMatch(appJs, /'기록된 run이 없습니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardLatestRunHelperCopy: {
        markers: ['아직 실행 기록이 없습니다.', '최신 실행 기록', '아직 없음', '아직 연결 안 됨'],
      },
    },
    null,
    2,
  ),
);
