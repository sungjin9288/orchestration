import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const readinessDocPath = path.join(repoRoot, 'docs', '09_pre-real-test-readiness.md');

const readinessDoc = fs.readFileSync(readinessDocPath, 'utf8');

assert.match(readinessDoc, /### B\. Representative Synthetic Readiness/);
assert.match(readinessDoc, /`node scripts\/smoke-ui-slice-59\.mjs`/);
assert.match(readinessDoc, /`node scripts\/ui_qa_status\.mjs`/);
assert.match(readinessDoc, /`node scripts\/smoke-provider-slice-05\.mjs`/);
assert.match(readinessDoc, /`node scripts\/smoke-qa-slice-07\.mjs`/);
assert.match(readinessDoc, /source-only UI contract checks를 required lane으로 실행/);
assert.match(
  readinessDoc,
  /`\/api\/snapshot` reachability는 UI server가 켜져 있을 때만 informational lane으로 기록/,
);
assert.match(readinessDoc, /Unexpected CLI arguments are rejected with `error=invalid-arguments` and exit 2/);
assert.match(readinessDoc, /`ui_qa_summary` is a manual-readiness checklist only/);
assert.match(readinessDoc, /before emitting manual operator evidence/);
assert.match(readinessDoc, /`operator-home-no-mission-start-gate` check/);
assert.match(readinessDoc, /`미션 \/ 신규 안건 등록`/);
assert.match(readinessDoc, /`operator-home-no-mission-handoff-label` check/);
assert.match(readinessDoc, /`Mission intake \/ 접수 인계`/);
assert.match(readinessDoc, /`workspace-playbook-no-mission-next-location` check/);
assert.match(readinessDoc, /`업무 사용 순서`/);
assert.match(readinessDoc, /`다음 이동` strip도 `협의회`가 아니라 `미션 \/ 신규 안건 등록`/);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestReadinessUiQaStatus: {
        document: 'docs/09_pre-real-test-readiness.md',
        aggregate: 'scripts/ui_qa_status.mjs',
        requiredLane: 'source-only UI contract checks',
        informationalLane: 'local /api/snapshot reachability',
      },
    },
    null,
    2,
  ),
);
