import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /현재 프리플라이트 아티팩트 기준으로 빌더 라이브 변경 승인 게이트가 생성된 상태입니다\./);
assert.match(appJs, /플래너는 현재 안건 범위를 계획 아티팩트로 정리하고 설계 실행을 다음 단계로 남깁니다\./);
assert.match(appJs, /설계 실행은 \$\{escapeHtml\(architectState\.latestPlanArtifact\?\.id \|\| '최신 계획 아티팩트'\)\}를 읽고 설계 아티팩트를 남긴 뒤 태스크 분해로 넘깁니다\./);
assert.match(appJs, /태스크 분해는 \$\{escapeHtml\(latestPlanArtifact\?\.id \|\| '최신 계획 아티팩트'\)\}와 \$\{escapeHtml\(latestArchitectureArtifact\?\.id \|\| '최신 설계 아티팩트'\)\}를 읽고 분해 아티팩트를 쓴 뒤, 아티팩트 화면을 벗어나지 않은 채 차단 결정함 항목만 미리 고릅니다\./);
assert.match(appJs, /빌더 프리플라이트는 \$\{escapeHtml\(builderPreflightState\.latestPlanArtifact\?\.id \|\| '최신 계획 아티팩트'\)\}, \$\{escapeHtml\(builderPreflightState\.latestArchitectureArtifact\?\.id \|\| '최신 설계 아티팩트'\)\}, \$\{escapeHtml\(builderPreflightState\.latestBreakdownArtifact\?\.id \|\| '최신 분해 아티팩트'\)\}를 읽고 쓰기 없는 프리플라이트 아티팩트를 남긴 뒤 리뷰어를 명시적 후속 단계로 남깁니다\./);
assert.match(appJs, /아직 breakdown 아티팩트가 없습니다\. 계획과 설계 아티팩트가 준비된 뒤 태스크 분해를 실행합니다\./);
assert.match(appJs, /아직 빌더 프리플라이트 아티팩트가 없습니다\. 계획, 설계, 분해 아티팩트가 준비된 뒤 빌더 프리플라이트를 실행합니다\./);

assert.doesNotMatch(appJs, /현재 preflight 아티팩트 기준으로 builder 라이브 변경 승인 게이트가 생성된 상태입니다\./);
assert.doesNotMatch(appJs, /plan 아티팩트로 정리하고 architect를 다음 단계로 남깁니다\./);
assert.doesNotMatch(appJs, /architecture 아티팩트를 남긴 뒤 태스크 분해로 넘깁니다\./);
assert.doesNotMatch(appJs, /breakdown 아티팩트를 쓴 뒤, 아티팩트 표면을 벗어나지 않은 채 차단 결정함 항목만 미리 고릅니다\./);
assert.doesNotMatch(appJs, /no-write preflight 아티팩트를 남긴 뒤 리뷰어를 명시적 후속 단계로 남깁니다\./);
assert.doesNotMatch(appJs, /plan과 architecture 아티팩트가 준비된 뒤 태스크 분해를 실행합니다\./);
assert.doesNotMatch(appJs, /plan, architecture, breakdown 아티팩트가 준비된 뒤 빌더 preflight를 실행합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      builderPreflightHelperCopy: {
        markers: ['계획 아티팩트', '설계 아티팩트', '분해 아티팩트', '쓰기 없는 프리플라이트'],
      },
    },
    null,
    2,
  ),
);
