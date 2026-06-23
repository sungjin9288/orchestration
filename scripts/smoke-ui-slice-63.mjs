import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');
const masterBrief = fs.readFileSync(path.join(repoRoot, 'docs', '00_master-brief.md'), 'utf8');
const roadmap = fs.readFileSync(
  path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md'),
  'utf8',
);
const completionInventory = fs.readFileSync(
  path.join(repoRoot, 'docs', '22_completion-gate-inventory.md'),
  'utf8',
);
const postCompletionStatusScript = path.join(
  repoRoot,
  'scripts',
  'post-completion-next-step-status.mjs',
);

const uncheckedItems = [...todo.matchAll(/^- \[ \] /gm)].map((match) => match[0]);

assert.equal(uncheckedItems.length, 0, `Expected zero unchecked todo items, found ${uncheckedItems.length}`);
assert.match(
  todo,
  /`scripts\/smoke-ui-slice-63\.mjs` now pins the zero-open backlog state so future follow-up must start from an explicit new decision or a newly-added backlog item, not a stale unchecked checkbox/,
);
assert.match(
  lessons,
  /todo에 active unchecked item이 0개가 된 시점은 그냥 상태가 아니라 baseline contract라서, `rg` 확인만 하고 끝내기보다 zero-open 상태 자체를 smoke로 고정해 두는 편이 이후 stale checkbox 재유입을 가장 빨리 잡아냈다\./,
);
assert.match(
  masterBrief,
  /future post-v1 follow-up returns to non-blocking housekeeping or later explicit `vNext` backlog items/,
);
assert.match(
  roadmap,
  /future post-freeze follow-up returns to explicit non-blocking housekeeping or later `vNext` backlog entries/,
);
assert.match(
  completionInventory,
  /\| Zero-open completion baseline \| pass \| `node scripts\/smoke-ui-slice-63\.mjs`, `tasks\/todo\.md`, `docs\/22_completion-gate-inventory\.md` \| `tasks\/todo\.md` has no active unchecked `- \[ \]` item, so no default completion implementation slice remains open \| Open a new implementation slice only from an explicit operator request, concrete regression, usability issue, or accepted vNext decision\. \|/,
);
assert.match(
  completionInventory,
  /The current required completion baseline is closed for default implementation work\./,
);
assert.match(
  completionInventory,
  /\| Post-completion next-step router \| pass \| `node scripts\/post-completion-next-step-status\.mjs`, `node scripts\/smoke-ui-slice-63\.mjs` \| Explicit operator requests can open a read-only vNext routing slice without reopening the default completion backlog \| Use this router before opening future product, vNext, or optional-live follow-up work\. \|/,
);
assert.doesNotMatch(completionInventory, /The current baseline is close to completion but not fully closed/);

const statusResult = spawnSync(process.execPath, [postCompletionStatusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(statusResult.status, 0, `post-completion status failed: ${statusResult.stderr}`);

const statusPayload = JSON.parse(statusResult.stdout);

assert.equal(statusPayload.ok, true);
assert.equal(statusPayload.mode, 'post-completion-next-step-status');
assert.equal(statusPayload.posture, 'local-read-only-post-completion-router');
assert.equal(statusPayload.completionBaseline.zeroOpenBacklog, true);
assert.equal(statusPayload.completionBaseline.uncheckedTaskCount, 0);
assert.equal(statusPayload.completionBaseline.defaultCompletionImplementationOpen, false);
assert.equal(statusPayload.entryGate.currentEntryReason, 'explicit-operator-request');
assert.equal(statusPayload.entryGate.defaultAutostartAllowed, false);
assert.equal(statusPayload.recommendedNextStep.track, 'vNext-read-only-growth-loop');
assert.equal(statusPayload.recommendedNextStep.nextImplementationPosture, 'read-only-status-or-doc-smoke-first');
assert.equal(statusPayload.optionalLiveVerification.blocking, false);
assert.equal(statusPayload.boundaries.runtimeMutation, false);
assert.equal(statusPayload.boundaries.uiMutation, false);
assert.equal(statusPayload.boundaries.providerMutation, false);
assert.equal(statusPayload.boundaries.memoryPersistence, false);
assert.equal(statusPayload.boundaries.automation, false);
assert.equal(statusPayload.boundaries.commitOrPushAuthority, false);

console.log(
  JSON.stringify(
    {
      ok: true,
      backlog: {
        uncheckedItems: uncheckedItems.length,
        zeroOpenPinned: true,
      },
    },
    null,
    2,
  ),
);
