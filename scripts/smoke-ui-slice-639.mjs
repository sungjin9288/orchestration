import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  appJs,
  /copy: '왼쪽 버튼을 누르면 해당 desk만 열립니다\. 작업 결과는 산출물, 근거는 아티팩트, 실행 흐름은 로그에서 확인합니다\.'/,
);
assert.match(
  appJs,
  /step: '03'[\s\S]*title: '실행 인계'[\s\S]*note: '결과·근거·실행 흐름을 같은 자리에서 추적'[\s\S]*surfaces: \['deliverables', 'artifacts', 'logs'\][\s\S]*where: '확인: 산출물 → 아티팩트 → 로그'/,
);
assert.match(appJs, /const shortcutButtonId = `workspace-playbook-shortcut-\$\{activeGroupId\}-\$\{card\.step\}-\$\{surface\}`;/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(surface\)\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workflowEvidenceAndLogShortcuts: {
        issue: 'workflow playbook copy referenced Artifacts and Logs but the execution handoff shortcut only opened Deliverables',
        result: ['deliverables', 'artifacts', 'logs'],
        boundary: 'display-only shortcut metadata; runtime, API, and artifact semantics unchanged',
      },
    },
    null,
    2,
  ),
);
