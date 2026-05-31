import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'claw-empire-audit.md');

const audit = fs.readFileSync(auditPath, 'utf8');

assert.match(audit, /^# claw-empire Historical Audit Draft/m);
assert.match(audit, /This document is a historical reference-audit snapshot/);
assert.match(audit, /not the current source of truth for\s+Orchestration 1\.0 scope, open work, or implementation backlog/);

for (const sourcePath of [
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
  'docs/17_v1-completion-readiness.md',
]) {
  assert.match(audit, new RegExp(sourcePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(audit, /Historical Open Questions And Current Disposition/);
assert.match(audit, /must not be counted as current open implementation items/);
assert.match(audit, /Resolved by the current local-stub default plus narrow `openai-responses` opt-in boundary/);
assert.match(audit, /Resolved by the implemented `Inbox -> In Progress -> Review -> Done` lifecycle/);
assert.match(audit, /Resolved by the current artifact taxonomy/);
assert.match(audit, /Still excluded from V1 core/);
assert.doesNotMatch(audit, /^## \[OPEN\]$/m);
assert.doesNotMatch(audit, /필수 문서 파일은 모두 존재하지만 비어 있었다/);
assert.doesNotMatch(audit, /어떤 provider를 첫 adapter로 둘지는 아직 열어둔다/);
assert.doesNotMatch(audit, /결정이 필요하다/);

console.log(
  JSON.stringify(
    {
      ok: true,
      referenceClawEmpireAudit: {
        document: 'docs/reference/claw-empire-audit.md',
        posture: 'historical-reference-snapshot',
        activeBacklog: false,
      },
    },
    null,
    2,
  ),
);
