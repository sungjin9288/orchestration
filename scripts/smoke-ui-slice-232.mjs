import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /현재 안건 판단이 운영 흐름의 첫 줄입니다\./);
assert.match(app, /첫 안건이 올라오면 운영 흐름이 여기서 시작됩니다\./);
assert.match(app, /홈에서 본 전체 흐름이 여기선 현재 안건 흐름으로 더 촘촘하게 이어집니다\./);
assert.match(app, /상단 연출은 방향 표시만 맡고, 실제 실행은 경계가 분명한 실행 흐름과 리뷰·승인 게이트를 그대로 따릅니다\./);
assert.match(app, /차단 사유가 풀려야 운영 흐름이 다시 앞으로 갑니다\./);
assert.match(app, /같은 안건이 회의, 실행, 보고, 사람 게이트를 지나며 하나의 운영 흐름으로 이어집니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestFirstUseCopyBatch: {
        markers: [
          '현재 안건 판단이 운영 흐름의 첫 줄입니다.',
          '첫 안건이 올라오면 운영 흐름이 여기서 시작됩니다.',
          '홈에서 본 전체 흐름이 여기선 현재 안건 흐름으로 더 촘촘하게 이어집니다.',
          '상단 연출은 방향 표시만 맡고, 실제 실행은 경계가 분명한 실행 흐름과 리뷰·승인 게이트를 그대로 따릅니다.',
          '차단 사유가 풀려야 운영 흐름이 다시 앞으로 갑니다.',
          '같은 안건이 회의, 실행, 보고, 사람 게이트를 지나며 하나의 운영 흐름으로 이어집니다.',
        ],
      },
    },
    null,
    2,
  ),
);
