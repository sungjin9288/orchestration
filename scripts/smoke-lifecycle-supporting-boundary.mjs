import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const roadmap = read('docs/21_completion-development-roadmap.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const todo = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verificationStatus = read('scripts/verification_status.mjs');

assert.match(
  roadmap,
  /The growth lifecycle read-only status chain remains supporting evidence, not the default product\s+development path\./,
);
assert.match(
  roadmap,
  /Continue a lifecycle status recheck only when the current completion gate inventory or verification\s+run finds a stale command, stale reference, or source-of-truth mismatch\./,
);
assert.match(roadmap, /Implemented evidence:[\s\S]*scripts\/smoke-lifecycle-supporting-boundary\.mjs/);

assert.match(
  inventory,
  /\| Lifecycle status chain \| pass \| `node scripts\/smoke-lifecycle-supporting-boundary\.mjs`, `docs\/21_completion-development-roadmap\.md`, `tasks\/todo\.md`, `tasks\/lessons\.md` \| Existing read-only lifecycle status chain is supporting evidence only and not the default product development lane \| Recheck lifecycle status only when verification finds a stale command, stale source reference, or source-of-truth mismatch\. \|/,
);
assert.match(inventory, /No default completion implementation slice remains open/);
assert.doesNotMatch(inventory, /Recommended Next Order[\s\S]*growth-lifecycle-status-supporting-evidence-boundary-post-m7-1178/);

assert.match(
  todo,
  /\[x\] `growth-lifecycle-status-supporting-evidence-boundary-post-m7-1178` keeps the existing read-only lifecycle status chain as supporting evidence only/,
);
assert.doesNotMatch(
  todo,
  /\[ \] `growth-lifecycle-status-supporting-evidence-boundary-post-m7-1178`/,
);

assert.match(
  lessons,
  /반복 read-only lifecycle status chain이 다음 개발 작업을 계속 대체하기 시작하면, 그 chain은 supporting evidence로 경계 짓고 completion gates, product-shell polish, evidence\/readme readiness 같은 실제 완성 lane으로 전환해야 한다\./,
);
assert.match(
  lessons,
  /completion lane이 닫힌 뒤 lifecycle status chain은 새 구현 backlog가 아니라 stale command나 source-of-truth mismatch를 찾았을 때만 다시 여는 supporting gate로 남겨야 한다\./,
);

assert.match(verificationStatus, /smoke-lifecycle-supporting-boundary\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      lifecycleSupportingBoundary: {
        status: 'supporting-only',
        defaultProductDevelopmentLane: false,
        reopenCondition: 'stale command, stale source reference, or source-of-truth mismatch',
      },
    },
    null,
    2,
  ),
);
