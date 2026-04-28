import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionRerunActionLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '같은 경로 정책 리포트' : '같은 경로 재실행'/);
assert.match(appJs, /getHarnessExecutionRerunActionLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionRerunActionLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionRerunActionLabel\(execution\)/);
assert.match(appJs, /data-policy-report="\$\{visibleHarnessExecutionResult\.actionMode === 'policy-report' \? 'true' : 'false'\}"/);
assert.match(appJs, /data-policy-report="\$\{hiddenHarnessExecutionResult\.actionMode === 'policy-report' \? 'true' : 'false'\}"/);
assert.match(appJs, /data-policy-report="\$\{execution\.actionMode === 'policy-report' \? 'true' : 'false'\}"/);
assert.match(appJs, /const policyReport = actionButton\?\.dataset\.policyReport === 'true'/);
assert.match(appJs, /policyReport,/);
assert.match(appJs, /정책 리포트로 다시 확인/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPolicyReportRerun: {
        helper: 'getHarnessExecutionRerunActionLabel',
        preservesPolicyReport: true,
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
