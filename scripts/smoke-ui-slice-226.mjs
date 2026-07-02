import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /evidenceLabel: `계획 \$\{latestPlanArtifact\.id\}`/);
assert.match(app, /evidenceLabel: '계획 대기'/);
assert.match(app, /evidenceLabel: `설계 \$\{latestArchitectureArtifact\.id\}`/);
assert.match(app, /evidenceLabel: '설계 대기'/);
assert.match(app, /계획 아티팩트가 아직 없습니다\./);
assert.match(app, /설계 아티팩트가 아직 없습니다\./);
assert.match(app, /빌더 라이브 변경 증적이 아직 없습니다\./);
assert.match(app, /플래너 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.match(app, /설계 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.match(app, /태스크 분해 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.match(app, /회의 결론 승인 자동 체인은 플래너부터 프리플라이트까지만 진행되고, 이후는 기존 승인 게이트 규칙을 따릅니다\./);

assert.doesNotMatch(app, /evidenceLabel: `plan \$\{latestPlanArtifact\.id\}`/);
assert.doesNotMatch(app, /evidenceLabel: 'plan 대기'/);
assert.doesNotMatch(app, /evidenceLabel: `architecture \$\{latestArchitectureArtifact\.id\}`/);
assert.doesNotMatch(app, /evidenceLabel: 'architecture 대기'/);
assert.doesNotMatch(app, /plan artifact가 아직 없습니다\./);
assert.doesNotMatch(app, /architecture artifact가 아직 없습니다\./);
assert.doesNotMatch(app, /builder live-mutation 증적이 아직 없습니다\./);
assert.doesNotMatch(app, /planner 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.doesNotMatch(app, /architect 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.doesNotMatch(app, /task-breaker 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.doesNotMatch(app, /회의 결론 승인 자동 체인은 planner부터 사전 점검까지만 진행되고, 이후는 기존 게이트 규칙을 따릅니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      plannerArchitectHelperBatch: {
        markers: [
          '계획 대기',
          '설계 대기',
          '계획 아티팩트가 아직 없습니다.',
          '설계 아티팩트가 아직 없습니다.',
          '빌더 라이브 변경 증적이 아직 없습니다.',
          '플래너 실행을 시작하기 전에 태스크를 먼저 선택하세요.',
          '설계 실행을 시작하기 전에 태스크를 먼저 선택하세요.',
          '태스크 분해 실행을 시작하기 전에 태스크를 먼저 선택하세요.',
        ],
      },
    },
    null,
    2,
  ),
);
