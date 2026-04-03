import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /function getPrimaryBlockedReason\(reasons, fallback\)/);
assert.match(
  app,
  /const executionGateReason = getDevelopmentPackExecutionGateReason\(linkedTask, data\);\s+const blockedReason =\s+executionGateReason \|\|/s,
);
assert.match(
  app,
  /const executionEntryGateReason = getDevelopmentPackExecutionGateReason\(linkedTask, data\);/,
);
assert.match(
  app,
  /const gateCopy =[\s\S]*?: executionEntryGateReason\s*\?\s*executionEntryGateReason[\s\S]*?: '현재 활성화된 차단 게이트는 없습니다\.'/,
);
assert.match(
  app,
  /const executionGateReason = getDevelopmentPackExecutionGateReason\(linkedTask, data\);[\s\S]*const opsEntryHelperCopy = executionGateReason\s*\?\s*`현재 실행 입구는 \$\{executionGateReason\} 전까지 여기서 멈춥니다\. 관제실은 차단 근거와 다음 표면만 먼저 엽니다\.`/s,
);
assert.match(
  app,
  /const plannerBlockedReason = getPrimaryBlockedReason\(\s*plannerState\.reasons,\s*'planner readiness unavailable',\s*\);/s,
);
assert.match(
  app,
  /const architectBlockedReason = getPrimaryBlockedReason\(\s*architectState\.reasons,\s*'architect readiness unavailable',\s*\);/s,
);
assert.match(
  app,
  /const taskBreakerBlockedReason = getPrimaryBlockedReason\(\s*taskBreakerState\.reasons,\s*'task-breaker readiness unavailable',\s*\);/s,
);
assert.match(
  app,
  /const builderPreflightBlockedReason = getPrimaryBlockedReason\(\s*builderPreflightState\.reasons,\s*'builder preflight readiness unavailable',\s*\);/s,
);
assert.match(
  app,
  /const detailHoldCopy =[\s\S]*?: executionGateReason\s*\?\s*executionGateReason[\s\S]*?: '현재 보류 사유는 없습니다\.';/,
);
assert.match(app, /플래너는 \$\{escapeHtml\(plannerBlockedReason\)\} 전까지 비활성입니다\./);
assert.match(app, /설계 실행은 \$\{escapeHtml\(architectBlockedReason\)\} 전까지 비활성입니다\./);
assert.match(app, /태스크 분해는 \$\{escapeHtml\(taskBreakerBlockedReason\)\} 전까지 비활성입니다\./);
assert.match(
  app,
  /빌더 preflight는 \$\{escapeHtml\(builderPreflightBlockedReason\)\} 전까지 비활성입니다\./,
);
assert.doesNotMatch(app, /플래너는 \$\{escapeHtml\(plannerState\.reasons\.join\('; '\)\)\} 전까지 비활성입니다\./);
assert.doesNotMatch(app, /설계 실행은 \$\{escapeHtml\(architectState\.reasons\.join\('; '\)\)\} 전까지 비활성입니다\./);
assert.doesNotMatch(app, /태스크 분해는 \$\{escapeHtml\(taskBreakerState\.reasons\.join\('; '\)\)\} 전까지 비활성입니다\./);
assert.doesNotMatch(
  app,
  /빌더 preflight는 \$\{escapeHtml\(builderPreflightState\.reasons\.join\('; '\)\)\} 전까지 비활성입니다\./,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionEntryBlockedReasonShell: {
      mission: 'executionGateReason-first',
      taskDetail: 'detailHoldCopy-first-reason',
      taskboardCtas: 'primary-reason-helpers',
      execution: 'gateCopy-first-reason',
      deliverables: 'opsEntryHelperCopy-first-reason',
    },
  },
    null,
    2,
  ),
);
