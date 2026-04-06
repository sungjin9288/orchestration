import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /프로젝트 단위 명시 선택만 허용합니다\. 기본값은 로컬 스텁\(local-stub\)을 유지하고, 라이브 모드는 절대 조용히 다른 모드로 바뀌지 않습니다\./);
assert.match(app, /여기에는 비밀이 아닌 설정 정보만 저장합니다\. 라이브 모드는 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토를 활성화하고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남깁니다\./);
assert.match(app, /미션 진입은 항상 로컬 스텁\(local-stub\) 기본값으로 시작합니다\. 프로바이더와 연결 워크트리 제어는 고급 운영 모드에 남습니다\./);
assert.match(app, /라이브 모드는 비밀이 아닌 설정 정보만 저장합니다\. 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토가 라이브 모드로 실행되고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남습니다\./);
assert.match(app, /프로젝트를 등록하고 로컬 스텁\(local-stub\)을 기본 실행 프로바이더로 유지한 채 해당 프로젝트를 활성 상태로 만듭니다\./);
assert.match(app, /placeholder="운영자 선택 모델"/);

assert.doesNotMatch(app, /프로젝트 단위 opt-in만 허용합니다\./);
assert.doesNotMatch(app, /live 모드는 model과 env가 유효할 때/);
assert.doesNotMatch(app, /미션 진입은 항상 local-stub 기본값으로 시작합니다\./);
assert.doesNotMatch(app, /프로젝트를 등록하고 local-stub를 기본 실행 프로바이더로 유지한 채/);
assert.doesNotMatch(app, /placeholder="operator-chosen-model"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      providerModeHelperBatch: {
        markers: [
          '로컬 스텁(local-stub)',
          '라이브 모드',
          '모델',
          '환경변수',
          '운영자 선택 모델',
        ],
      },
    },
    null,
    2,
  ),
);
