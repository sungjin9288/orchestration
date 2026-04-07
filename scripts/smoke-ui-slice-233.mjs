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
assert.match(appJs, /heading: '회의와 작전실에서 올라온 묶음을 운영 보고용으로 정리합니다'/);
assert.match(appJs, /copy: '협의회와 실행 셀에서 올라온 결과가 어떤 보고 묶음과 결재선으로 이어졌는지 이 방에서 빠르게 읽습니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesDogfoodingCopyRealignment: {
        markers: [
          '리뷰와 보고 묶음이 다음 운영 판단을 위한 근거를 남깁니다.',
          '회의와 작전실에서 올라온 묶음을 운영 보고용으로 정리합니다',
          '협의회와 실행 셀에서 올라온 결과가 어떤 보고 묶음과 결재선으로 이어졌는지 이 방에서 빠르게 읽습니다.',
        ],
      },
    },
    null,
    2,
  ),
);
