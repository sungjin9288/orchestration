import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(
  app,
  /여기에는 비밀이 아닌 설정 정보만 저장합니다\. live 모드는 model과 env가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토를 활성화하고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남깁니다\./,
);
assert.match(
  app,
  /live 모드는 비밀이 아닌 설정 정보만 저장합니다\. model과 env가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토가 live로 실행되고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남습니다\./,
);
assert.doesNotMatch(app, /opt-in metadata/);
assert.doesNotMatch(app, /downstream local step/);
assert.doesNotMatch(app, /local follow-up/);

console.log(
  JSON.stringify(
    {
      ok: true,
      bootstrapOperatorCopy: {
        markers: ['설정 정보', '기획 셀', '로컬 후속 단계'],
      },
    },
    null,
    2,
  ),
);
