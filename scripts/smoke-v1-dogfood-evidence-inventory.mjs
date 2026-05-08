import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const inventoryPath = path.join(repoRoot, 'scripts', 'v1-dogfood-evidence-inventory.mjs');
const dogfoodPath = path.join(repoRoot, 'docs', '16_v1-dogfood-triage.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const inventory = fs.readFileSync(inventoryPath, 'utf8');
const dogfood = fs.readFileSync(dogfoodPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(inventory, /mode: 'v1-dogfood-evidence-inventory'/);
assert.match(inventory, /dogfood-run-002/);
assert.match(inventory, /dogfood-run-004/);
assert.match(inventory, /dogfood-run-005/);
assert.match(inventory, /dogfood-run-006/);
assert.match(inventory, /dogfood-run-007/);
assert.match(inventory, /dogfood-run-008/);
assert.match(inventory, /dogfood-run-009/);
assert.match(inventory, /dogfood-run-010/);
assert.match(inventory, /dogfood-run-011/);
assert.match(inventory, /dogfood-run-012/);
assert.match(inventory, /dogfood-run-013/);
assert.match(inventory, /dogfood-run-014/);
assert.match(inventory, /dogfood-run-015/);
assert.match(inventory, /dogfood-run-016/);
assert.match(inventory, /dogfood-run-017/);
assert.match(inventory, /dogfood-run-018/);
assert.match(inventory, /dogfood-run-019/);
assert.match(inventory, /dogfood-run-020/);
assert.match(inventory, /dogfood-run-021/);
assert.match(inventory, /dogfood-run-022/);
assert.match(inventory, /dogfood-run-023/);
assert.match(inventory, /dogfood-run-024/);
assert.match(inventory, /dogfood-run-025/);
assert.match(inventory, /dogfood-run-027/);
assert.match(inventory, /dogfood-run-028/);
assert.match(inventory, /dogfood-run-029/);
assert.match(inventory, /dogfood-run-030/);
assert.match(inventory, /dogfood-run-031/);
assert.match(inventory, /dogfood-run-032/);
assert.match(inventory, /dogfood-run-033/);
assert.match(inventory, /dogfood-run-034/);
assert.match(inventory, /dogfood-run-035/);
assert.match(inventory, /dogfood-run-036/);
assert.match(inventory, /dogfood-run-037/);
assert.match(inventory, /dogfood-run-038/);
assert.match(inventory, /dogfood-run-039/);
assert.match(inventory, /dogfood-run-040/);
assert.match(inventory, /dogfood-run-041/);
assert.match(inventory, /dogfood-run-042/);
assert.match(inventory, /dogfood-run-043/);
assert.match(inventory, /dogfood-run-044/);
assert.match(inventory, /dogfood-run-045/);
assert.match(inventory, /dogfood-run-046/);
assert.match(inventory, /worktree\/v1-dogfood-run-002/);
assert.match(inventory, /worktree\/v1-dogfood-runner-001/);
assert.match(inventory, /worktree\/v1-dogfood-runner-002/);
assert.match(inventory, /worktree\/v1-dogfood-runner-003/);
assert.match(inventory, /worktree\/v1-dogfood-runner-004/);
assert.match(inventory, /worktree\/v1-dogfood-runner-005/);
assert.match(inventory, /worktree\/v1-dogfood-runner-006/);
assert.match(inventory, /worktree\/v1-dogfood-runner-007/);
assert.match(inventory, /worktree\/v1-dogfood-runner-008/);
assert.match(inventory, /worktree\/v1-dogfood-runner-009/);
assert.match(inventory, /worktree\/v1-dogfood-runner-010/);
assert.match(inventory, /worktree\/v1-dogfood-runner-011/);
assert.match(inventory, /worktree\/v1-dogfood-runner-012/);
assert.match(inventory, /worktree\/v1-dogfood-runner-013/);
assert.match(inventory, /worktree\/v1-dogfood-runner-014/);
assert.match(inventory, /worktree\/v1-dogfood-runner-015/);
assert.match(inventory, /worktree\/v1-dogfood-runner-016/);
assert.match(inventory, /worktree\/v1-dogfood-runner-017/);
assert.match(inventory, /worktree\/v1-dogfood-runner-018/);
assert.match(inventory, /worktree\/v1-dogfood-runner-019/);
assert.match(inventory, /worktree\/v1-dogfood-runner-020/);
assert.match(inventory, /worktree\/v1-dogfood-runner-021/);
assert.match(inventory, /worktree\/v1-dogfood-runner-022/);
assert.match(inventory, /dogfood-run-026/);
assert.match(inventory, /worktree\/v1-dogfood-runner-023/);
assert.match(inventory, /worktree\/v1-dogfood-runner-024/);
assert.match(inventory, /worktree\/v1-dogfood-runner-025/);
assert.match(inventory, /worktree\/v1-dogfood-runner-026/);
assert.match(inventory, /worktree\/v1-dogfood-runner-027/);
assert.match(inventory, /worktree\/v1-dogfood-runner-028/);
assert.match(inventory, /worktree\/v1-dogfood-runner-029/);
assert.match(inventory, /worktree\/v1-dogfood-runner-030/);
assert.match(inventory, /worktree\/v1-dogfood-runner-031/);
assert.match(inventory, /worktree\/v1-dogfood-runner-032/);
assert.match(inventory, /worktree\/v1-dogfood-runner-033/);
assert.match(inventory, /worktree\/v1-dogfood-runner-034/);
assert.match(inventory, /worktree\/v1-dogfood-runner-035/);
assert.match(inventory, /worktree\/v1-dogfood-runner-036/);
assert.match(inventory, /worktree\/v1-dogfood-runner-037/);
assert.match(inventory, /worktree\/v1-dogfood-runner-038/);
assert.match(inventory, /worktree\/v1-dogfood-runner-039/);
assert.match(inventory, /worktree\/v1-dogfood-runner-040/);
assert.match(inventory, /worktree\/v1-dogfood-runner-041/);
assert.match(inventory, /worktree\/v1-dogfood-runner-042/);
assert.match(inventory, /worktree\/v1-dogfood-runner-043/);
assert.match(inventory, /dogfood-run-047/);
assert.match(inventory, /worktree\/v1-dogfood-runner-044/);
assert.match(inventory, /dogfood-run-048/);
assert.match(inventory, /worktree\/v1-dogfood-runner-045/);
assert.match(inventory, /dogfood-run-049/);
assert.match(inventory, /worktree\/v1-dogfood-runner-046/);
assert.match(inventory, /dogfood-run-050/);
assert.match(inventory, /worktree\/v1-dogfood-runner-047/);
assert.match(inventory, /dogfood-run-051/);
assert.match(inventory, /worktree\/v1-dogfood-runner-048/);
assert.match(inventory, /dogfood-run-052/);
assert.match(inventory, /worktree\/v1-dogfood-runner-049/);
assert.match(inventory, /dogfood-run-053/);
assert.match(inventory, /worktree\/v1-dogfood-runner-050/);
assert.match(inventory, /dogfood-run-054/);
assert.match(inventory, /worktree\/v1-dogfood-runner-051/);
assert.match(inventory, /dogfood-run-055/);
assert.match(inventory, /worktree\/v1-dogfood-runner-052/);
assert.match(inventory, /dogfood-run-056/);
assert.match(inventory, /worktree\/v1-dogfood-runner-053/);
assert.match(inventory, /dogfood-run-057/);
assert.match(inventory, /worktree\/v1-dogfood-runner-054/);
assert.match(inventory, /cleanupApprovalRequired: exists \|\| branchExists/);
assert.match(inventory, /cleanupCompleted/);
assert.match(inventory, /retainedEvidenceAvailable/);
assert.match(inventory, /validEvidenceLifecycle/);
assert.match(inventory, /branchExists/);
assert.match(inventory, /requiresExplicitOperatorApproval: true/);
assert.match(inventory, /runnerExecutesCleanup: false/);
assert.match(inventory, /git worktree remove/);
assert.match(inventory, /git branch -D/);
assert.match(inventory, /builder-live-mutation approval-0001 prompts\/builder\.md/);

assert.match(dogfood, /## Dogfood Evidence Inventory/);
assert.match(dogfood, /scripts\/v1-dogfood-evidence-inventory\.mjs/);
assert.match(dogfood, /Cleanup completed after explicit operator approval/);
assert.match(dogfood, /does not remove worktrees, delete branches, reset files, commit, push, merge, release, or close out/);
assert.match(dogfood, /Dogfood Run 002/);
assert.match(dogfood, /Dogfood Run 004/);
assert.match(dogfood, /Dogfood Run 005/);
assert.match(dogfood, /Dogfood Run 006/);
assert.match(dogfood, /Dogfood Run 007/);
assert.match(dogfood, /Dogfood Run 008/);
assert.match(dogfood, /Dogfood Run 009/);
assert.match(dogfood, /Dogfood Run 010/);
assert.match(dogfood, /Dogfood Run 011/);
assert.match(dogfood, /Dogfood Run 012/);
assert.match(dogfood, /Dogfood Run 013/);
assert.match(dogfood, /Dogfood Run 014/);
assert.match(dogfood, /Dogfood Run 015/);
assert.match(dogfood, /Dogfood Run 016/);
assert.match(dogfood, /Dogfood Run 017/);
assert.match(dogfood, /Dogfood Run 018/);
assert.match(dogfood, /Dogfood Run 019/);
assert.match(dogfood, /Dogfood Run 020/);
assert.match(dogfood, /Dogfood Run 021/);
assert.match(dogfood, /Dogfood Run 022/);
assert.match(dogfood, /Dogfood Run 023/);
assert.match(dogfood, /Dogfood Run 024/);
assert.match(dogfood, /Dogfood Run 025/);
assert.match(dogfood, /Dogfood Run 026/);
assert.match(dogfood, /Dogfood Run 027/);
assert.match(dogfood, /Dogfood Run 028/);
assert.match(dogfood, /Dogfood Run 029/);
assert.match(dogfood, /Dogfood Run 030/);
assert.match(dogfood, /Dogfood Run 031/);
assert.match(dogfood, /Dogfood Run 032/);
assert.match(dogfood, /Dogfood Run 033/);
assert.match(dogfood, /Dogfood Run 034/);
assert.match(dogfood, /Dogfood Run 035/);
assert.match(dogfood, /Dogfood Run 036/);
assert.match(dogfood, /Dogfood Run 037/);
assert.match(dogfood, /Dogfood Run 038/);
assert.match(dogfood, /Dogfood Run 039/);
assert.match(dogfood, /Dogfood Run 040/);
assert.match(dogfood, /Dogfood Run 041/);
assert.match(dogfood, /Dogfood Run 042/);
assert.match(dogfood, /Dogfood Run 043/);
assert.match(dogfood, /Dogfood Run 044/);
assert.match(dogfood, /Dogfood Run 045/);
assert.match(dogfood, /Dogfood Run 046/);
assert.match(dogfood, /Dogfood Run 047/);
assert.match(dogfood, /Dogfood Run 048/);
assert.match(dogfood, /Dogfood Run 049/);
assert.match(dogfood, /Dogfood Run 050/);
assert.match(dogfood, /Dogfood Run 055/);
assert.match(dogfood, /Mixed lifecycle state is valid/);
assert.match(dogfood, /Dogfood Run 005 worktree removed/);
assert.match(dogfood, /Dogfood Run 006 worktree removed/);
assert.match(dogfood, /Dogfood Run 007 worktree removed/);
assert.match(dogfood, /Dogfood Run 008 worktree removed/);
assert.match(dogfood, /Dogfood Run 009 worktree removed/);
assert.match(dogfood, /Dogfood Run 010 worktree removed/);
assert.match(dogfood, /Dogfood Run 011 worktree removed/);
assert.match(dogfood, /Dogfood Run 012 worktree removed/);
assert.match(dogfood, /Dogfood Run 013 worktree removed/);
assert.match(dogfood, /Dogfood Run 014 worktree removed/);
assert.match(dogfood, /Dogfood Run 015 worktree removed/);
assert.match(dogfood, /Dogfood Run 016 worktree removed/);
assert.match(dogfood, /Dogfood Run 017 worktree removed/);
assert.match(dogfood, /Dogfood Run 018 worktree removed/);
assert.match(dogfood, /Dogfood Run 019 worktree removed/);
assert.match(dogfood, /Dogfood Run 020 worktree removed/);
assert.match(dogfood, /Dogfood Run 021 worktree removed/);
assert.match(dogfood, /Dogfood Run 022 worktree removed/);
assert.match(dogfood, /Dogfood Run 023 worktree removed/);
assert.match(dogfood, /Dogfood Run 024 worktree removed/);
assert.match(dogfood, /Dogfood Run 025 worktree removed/);
assert.match(dogfood, /after approved cleanup, all retained dogfood worktree paths and branches should be absent/);
assert.match(dogfood, /Dogfood Run 026 worktree removed/);
assert.match(dogfood, /Dogfood Run 027 worktree removed/);
assert.match(dogfood, /Dogfood Run 028 worktree removed/);
assert.match(dogfood, /Dogfood Run 029 worktree removed/);
assert.match(dogfood, /Dogfood Run 030 worktree removed/);
assert.match(dogfood, /Dogfood Run 031 worktree removed/);
assert.match(dogfood, /Dogfood Run 032 worktree removed/);
assert.match(dogfood, /Dogfood Run 033 worktree removed/);
assert.match(dogfood, /Dogfood Run 034 worktree removed/);
assert.match(dogfood, /Dogfood Run 035 worktree removed/);
assert.match(dogfood, /Dogfood Run 036 worktree removed/);
assert.match(dogfood, /Dogfood Run 037 worktree removed/);
assert.match(dogfood, /Dogfood Run 038 worktree removed/);
assert.match(dogfood, /Dogfood Run 039 worktree removed/);
assert.match(dogfood, /Dogfood Run 040 worktree removed/);
assert.match(dogfood, /Dogfood Run 041 worktree removed/);
assert.match(dogfood, /Dogfood Run 042 worktree removed/);
assert.match(dogfood, /Dogfood Run 043 worktree removed/);
assert.match(dogfood, /Dogfood Run 044 worktree removed/);
assert.match(dogfood, /Dogfood Run 045 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 045 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /Dogfood Run 046 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 046 cleanup before the next approved execute-mode pass/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 046 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 046 worktree retained/);
assert.match(dogfood, /Dogfood Run 047 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 047 cleanup before the next approved execute-mode pass/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 047 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 047 worktree retained/);
assert.match(dogfood, /Dogfood Run 048 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 048 cleanup before the next approved execute-mode pass/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 048 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 048 worktree retained/);
assert.match(dogfood, /Dogfood Run 049 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 049 cleanup before the next approved execute-mode pass/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 049 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 049 worktree retained/);
assert.match(dogfood, /Dogfood Run 050 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 050 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-047/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 050 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 050 worktree retained/);
assert.match(dogfood, /## Dogfood Run 051/);
assert.match(dogfood, /Dogfood Run 051 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 051 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-048/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-048/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 051 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 051 worktree retained/);
assert.match(dogfood, /## Dogfood Run 052/);
assert.match(dogfood, /Dogfood Run 052 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 052 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-049/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-049/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 052 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 052 worktree retained/);
assert.match(dogfood, /## Dogfood Run 053/);
assert.match(dogfood, /Dogfood Run 053 retained-evidence commit `d2a45b0` preserved docs and smoke guards before destructive cleanup/);
assert.match(dogfood, /Dogfood Run 053 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 053 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-050/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-050/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 053 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 053 worktree retained/);
assert.match(dogfood, /## Dogfood Run 054/);
assert.match(dogfood, /Dogfood Run 054 retained-evidence commit `94fdfd7` preserved docs and smoke guards before destructive cleanup/);
assert.match(dogfood, /Dogfood Run 054 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 054 cleanup before the next approved execute-mode pass/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-051/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-051/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 054 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 054 worktree retained/);
assert.match(dogfood, /## Dogfood Run 055/);
assert.match(dogfood, /Dogfood Run 055 retained-evidence commit `699e3ac` preserved docs and smoke guards before destructive cleanup/);
assert.match(dogfood, /Dogfood Run 055 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 055 cleanup before Dogfood Run 056 execute/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-052/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-052/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 055 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 055 worktree retained/);
assert.match(dogfood, /## Dogfood Run 056/);
assert.match(dogfood, /Dogfood Run 056 retained-evidence commit `c8a7f51` preserved docs and smoke guards before destructive cleanup/);
assert.match(dogfood, /Dogfood Run 056 worktree removed/);
assert.match(dogfood, /No retained dogfood linked worktree remained after Dogfood Run 056 cleanup before Dogfood Run 057 execute/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 056 execute approval/);
assert.doesNotMatch(dogfood, /Dogfood Run 056 worktree retained/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-053/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-053/);
assert.match(dogfood, /## Dogfood Run 057/);
assert.match(dogfood, /Retained cleanup pending after explicit Dogfood Run 057 execute approval/);
assert.match(dogfood, /Dogfood Run 057 worktree retained: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-054`; branch retained: `worktree\/v1-dogfood-runner-054`/);
assert.match(dogfood, /Dogfood Run 057 cleanup is blocked until retained-evidence is committed and destructive cleanup is explicitly approved/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-054/);
assert.match(dogfood, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-054/);
assert.doesNotMatch(dogfood, /Retained cleanup pending after explicit Dogfood Run 045 execute approval/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-036/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-037/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-038/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-039/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-040/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-041/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-042/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-043/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-044/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-045/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-046/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-033/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-034/);
assert.match(dogfood, /worktree\/v1-dogfood-runner-035/);
assert.doesNotMatch(dogfood, /Dogfood Run 030 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 031 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 032 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 033 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 034 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 035 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 036 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 037 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 038 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 039 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 040 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 041 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 042 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 043 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 044 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 045 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 027 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 028 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 029 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 024 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 011 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 012 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 013 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 014 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 015 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 016 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 017 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 018 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 019 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 020 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 021 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 022 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 023 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 024 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 025 worktree retained/);
assert.doesNotMatch(dogfood, /Dogfood Run 026 worktree retained/);

assert.match(verificationStatus, /v1-dogfood-evidence-inventory/);
assert.match(verificationStatus, /scripts\/smoke-v1-dogfood-evidence-inventory\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1DogfoodEvidenceInventory: {
        cleanupCompletedSupported: true,
        document: 'docs/16_v1-dogfood-triage.md',
        inventory: 'scripts/v1-dogfood-evidence-inventory.mjs',
        retainedEvidenceWorktrees: [
          'dogfood-run-002',
          'dogfood-run-004',
          'dogfood-run-005',
          'dogfood-run-006',
          'dogfood-run-007',
          'dogfood-run-008',
          'dogfood-run-009',
          'dogfood-run-010',
          'dogfood-run-011',
          'dogfood-run-012',
          'dogfood-run-013',
          'dogfood-run-014',
          'dogfood-run-015',
          'dogfood-run-016',
          'dogfood-run-017',
          'dogfood-run-018',
          'dogfood-run-019',
          'dogfood-run-020',
          'dogfood-run-021',
          'dogfood-run-022',
          'dogfood-run-023',
          'dogfood-run-024',
          'dogfood-run-025',
          'dogfood-run-026',
          'dogfood-run-027',
          'dogfood-run-028',
          'dogfood-run-029',
          'dogfood-run-030',
          'dogfood-run-031',
          'dogfood-run-032',
          'dogfood-run-033',
          'dogfood-run-034',
          'dogfood-run-035',
          'dogfood-run-036',
          'dogfood-run-037',
          'dogfood-run-038',
          'dogfood-run-039',
          'dogfood-run-040',
          'dogfood-run-041',
          'dogfood-run-042',
          'dogfood-run-043',
          'dogfood-run-044',
          'dogfood-run-045',
          'dogfood-run-046',
          'dogfood-run-047',
          'dogfood-run-048',
          'dogfood-run-049',
          'dogfood-run-050',
          'dogfood-run-051',
          'dogfood-run-052',
          'dogfood-run-053',
          'dogfood-run-054',
          'dogfood-run-055',
          'dogfood-run-056',
          'dogfood-run-057',
        ],
      },
    },
    null,
    2,
  ),
);
