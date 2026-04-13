import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /리뷰와 보고 묶음이 다음 운영 판단을 위한 근거를 남깁니다\./);
assert.match(appJs, /결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다/);
assert.match(appJs, /Deliverables는 실행에서 올라온 결과 패킷을 리뷰 라인, 승인 라인, 종료 보고 데스크까지 같은 delivery board에서 이어 읽습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesDogfoodingCopyRealignment: {
        markers: [
          '리뷰와 보고 묶음이 다음 운영 판단을 위한 근거를 남깁니다.',
          '결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다',
          'Deliverables는 실행에서 올라온 결과 패킷을 리뷰 라인, 승인 라인, 종료 보고 데스크까지 같은 delivery board에서 이어 읽습니다.',
        ],
      },
    },
    null,
    2,
  ),
);
