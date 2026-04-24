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
assert.match(appJs, /const showOpenExecution = state\.surface !== 'execution';/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="execution"/);
assert.match(appJs, /data-harness-open-execution="true"/);
assert.match(appJs, /실행 데스크 열기/);
assert.doesNotMatch(appJs, /data-action="run-harness-command"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRegisterExecutionEntry: {
        sharedHelper: 'renderHarnessBriefRegister',
        action: 'open-surface',
        targetSurface: 'execution',
        source: 'frozen harnessConsumerBrief',
        scope: 'consumer-only-local-navigation',
      },
    },
    null,
    2,
  ),
);
