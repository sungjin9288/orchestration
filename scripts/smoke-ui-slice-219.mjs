import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const appJs = fs.readFileSync(appPath, 'utf8') + fs.readFileSync(executionLabelsPath, 'utf8');

assert.match(appJs, /'latest preflight artifact required': '최신 프리플라이트 아티팩트가 필요합니다\.',/);
assert.match(appJs, /제한된 빌더 라이브 변경에 대한 런타임 요약입니다\. 실행은 최신 프리플라이트 대상 파일에만 한정되고, 커밋 경로를 자동 시작하지 않은 채 리뷰어에게 넘깁니다\./);
assert.match(appJs, /최신 프리플라이트 대상에 남은 라이브 변경 가드 사유가 없습니다\./);
assert.match(appJs, /최신 프리플라이트 대상 기준으로 승인 요청이 가능합니다\./);
assert.match(appJs, /협의회 승인으로 이 미션은 이미 프리플라이트까지 진행됐습니다\./);
assert.match(appJs, /subtitle: '프리플라이트 \/ 빌더'/);
assert.match(appJs, /evidenceLabel: latestPreflightArtifact \? `프리플라이트 \$\{latestPreflightArtifact\.id\}` : '프리플라이트 없음'/);
assert.match(appJs, /evidenceLabel: '프리플라이트 대기'/);
assert.match(appJs, /대상 프리플라이트 아티팩트: \$\{parsed\.preflightArtifactId\}/);
assert.match(appJs, /최신 프리플라이트가 준비될 때까지/);
assert.match(appJs, /최신 승인된 프리플라이트 쌍이 준비될 때까지/);
assert.match(appJs, /실행 전 프리플라이트를 먼저 남겨 다음 승인선을 엽니다\./);
assert.match(appJs, /title: '런타임 연결 복구 필요'/);
assert.match(appJs, /빌더 프리플라이트 실행/);
assert.match(appJs, /<p class="detail-key">최신 빌더 프리플라이트<\/p>/);
assert.match(appJs, /아직 빌더 프리플라이트 아티팩트가 없습니다\. 계획, 설계, 분해 아티팩트가 준비된 뒤 빌더 프리플라이트를 실행합니다\./);
assert.match(appJs, /아티팩트는 런타임 실행이나 리뷰 증거가 기록된 뒤 나타납니다\./);
assert.match(appJs, /<strong>런타임 사용 불가<\/strong>/);

assert.doesNotMatch(appJs, /runtime 연결 끊김/);
assert.doesNotMatch(appJs, /runtime 사용 불가/);
assert.doesNotMatch(appJs, /아티팩트는 runtime 실행이나 리뷰 증거가 기록된 뒤 나타납니다\./);
assert.doesNotMatch(appJs, /최신 preflight 아티팩트가 필요합니다\./);
assert.doesNotMatch(appJs, /최신 preflight 대상에 남은 라이브 변경 가드 사유가 없습니다\./);
assert.doesNotMatch(appJs, /최신 preflight 대상 기준으로 승인 요청이 가능합니다\./);
assert.doesNotMatch(appJs, /협의회 승인으로 이 미션은 이미 preflight까지 진행됐습니다\./);
assert.doesNotMatch(appJs, /subtitle: 'preflight \/ builder'/);
assert.doesNotMatch(appJs, /preflight 없음/);
assert.doesNotMatch(appJs, /preflight 대기/);
assert.doesNotMatch(appJs, /대상 preflight 아티팩트/);
assert.doesNotMatch(appJs, /최신 preflight가 준비될 때까지/);
assert.doesNotMatch(appJs, /최신 승인된 preflight 쌍이 준비될 때까지/);
assert.doesNotMatch(appJs, /실행 전 preflight를 먼저 남겨 다음 승인선을 엽니다\./);
assert.doesNotMatch(appJs, /빌더 preflight 실행/);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimePreflightBatch: {
        markers: [
          '런타임 연결 끊김',
          '런타임 사용 불가',
          '런타임 실행이나 리뷰 증거',
          '최신 프리플라이트 아티팩트',
          '프리플라이트 / 빌더',
          '프리플라이트 없음',
          '프리플라이트 대기',
          '대상 프리플라이트 아티팩트',
          '빌더 프리플라이트 실행',
          '최신 빌더 프리플라이트',
        ],
      },
    },
    null,
    2,
  ),
);
