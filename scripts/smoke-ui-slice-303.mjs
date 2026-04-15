import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function renderHarnessBriefRegister\(brief\) \{/);
assert.match(appJs, /data-action="copy-harness-command"/);
assert.match(appJs, /data-harness-copy-command="true"/);
assert.match(appJs, /명령 복사/);
assert.match(appJs, /async function copyHarnessCommand\(command\) \{/);
assert.match(appJs, /if \(globalThis\.navigator\?\.clipboard\?\.writeText\)/);
assert.match(appJs, /await globalThis\.navigator\.clipboard\.writeText\(command\);/);
assert.match(appJs, /클립보드 미지원 환경입니다\. 명령을 직접 실행하세요:/);
assert.match(appJs, /actionButton\.dataset\.action === 'copy-harness-command'/);
assert.doesNotMatch(appJs, /harness-run\.mjs doctor/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRegisterCopyAction: {
        sharedHelper: 'renderHarnessBriefRegister',
        action: 'copy-harness-command',
        source: 'brief.actionCommand',
        fallback: 'refresh-status-message',
      },
    },
    null,
    2,
  ),
);
