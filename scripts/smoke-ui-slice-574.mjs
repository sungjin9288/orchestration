import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /class="workspace-playbook-grid" role="list" aria-label="\$\{escapeHtml\(meta\.title\)\} 단계"/);
assert.match(appJs, /class="workspace-playbook-card \$\{isCurrentStep \? 'is-current-step' : ''\}" role="listitem" data-step-state="\$\{isCurrentStep \? 'current' : 'idle'\}" \$\{isCurrentStep \? 'aria-current="step"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStep \? 'step' : 'false'\}"/);
assert.match(appJs, /const isCurrentStep = card\.step === currentPlaybookStep;/);
assert.match(appJs, /title: '업무 사용 순서'/);
assert.match(appJs, /title: '검토 사용 순서'/);
assert.match(appJs, /title: '운영 사용 순서'/);
assert.match(appJs, /where: '확인: 산출물 → 아티팩트'/);
assert.match(appJs, /where: '확인: 로그 \+ 결정함'/);
assert.match(appJs, /where: '확인: 작업판'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookStepListSemantics: {
        container: 'role=list',
        label: 'visible playbook title + 단계',
        cards: 'role=listitem',
        currentStep: 'current card only renders aria-current=step',
      },
    },
    null,
    2,
  ),
);
