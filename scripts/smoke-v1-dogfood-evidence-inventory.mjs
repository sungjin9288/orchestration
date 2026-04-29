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
assert.match(inventory, /worktree\/v1-dogfood-run-002/);
assert.match(inventory, /worktree\/v1-dogfood-runner-001/);
assert.match(inventory, /cleanupApprovalRequired: true/);
assert.match(inventory, /requiresExplicitOperatorApproval: true/);
assert.match(inventory, /runnerExecutesCleanup: false/);
assert.match(inventory, /git worktree remove/);
assert.match(inventory, /git branch -D/);
assert.match(inventory, /builder-live-mutation approval-0001 prompts\/builder\.md/);

assert.match(dogfood, /## Dogfood Evidence Inventory/);
assert.match(dogfood, /scripts\/v1-dogfood-evidence-inventory\.mjs/);
assert.match(dogfood, /destructive cleanup approval gate/);
assert.match(dogfood, /does not remove worktrees, delete branches, reset files, commit, push, merge, release, or close out/);
assert.match(dogfood, /Dogfood Run 002/);
assert.match(dogfood, /Dogfood Run 004/);

assert.match(verificationStatus, /v1-dogfood-evidence-inventory/);
assert.match(verificationStatus, /scripts\/smoke-v1-dogfood-evidence-inventory\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1DogfoodEvidenceInventory: {
        cleanupApprovalRequired: true,
        document: 'docs/16_v1-dogfood-triage.md',
        inventory: 'scripts/v1-dogfood-evidence-inventory.mjs',
        retainedEvidenceWorktrees: ['dogfood-run-002', 'dogfood-run-004'],
      },
    },
    null,
    2,
  ),
);
