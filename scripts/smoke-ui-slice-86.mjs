import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'agent-product-pattern-audit.md');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const councilConfigJs = fs.readFileSync(councilConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');

assert.match(audit, /flow ownership rail/);
assert.match(audit, /dify/);
assert.match(audit, /crewAI/);

assert.match(councilConfigJs, /owner: '운영자 · 안건 흐름'/);
assert.match(councilConfigJs, /owner: '회의 리드 \+ 참여 역할'/);
assert.match(councilConfigJs, /owner: '실행 역할 · 실행 흐름'/);
assert.match(councilConfigJs, /owner: '결과 보고 · 보고 흐름'/);
assert.match(appJs, /statusLabel: isActive \? '현재 단계' : isComplete \? '완료됨' : '다음 단계'/);
assert.match(appJs, /charter-flow-step-active/);
assert.match(appJs, /charter-flow-step-complete/);
assert.match(appJs, /charter-step-owner/);
assert.match(appJs, /charter-flow-status/);
assert.match(appJs, /charter-crew-duty/);

assert.match(styles, /\.charter-flow-step \{/);
assert.match(styles, /\.charter-flow-step-active \{/);
assert.match(styles, /\.charter-flow-step-complete \{/);
assert.match(styles, /\.charter-step-owner \{/);
assert.match(styles, /\.charter-flow-status \{/);
assert.match(styles, /\.charter-crew-duty \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoFlowOwnershipShell: {
        owners: [
          '운영자 · 안건 흐름',
          '회의 리드 + 참여 역할',
          '실행 역할 · 실행 흐름',
          '결과 보고 · 보고 흐름',
        ],
        statuses: ['현재 단계', '완료됨', '다음 단계'],
        classes: [
          'charter-flow-step',
          'charter-flow-step-active',
          'charter-flow-step-complete',
          'charter-step-owner',
          'charter-flow-status',
        ],
      },
    },
    null,
    2,
  ),
);
