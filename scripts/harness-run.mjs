#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHarness, harnesses } from './harness-registry.mjs';

const args = process.argv.slice(2);
const harnessId = args[0];
const harnessArgs = args.slice(1);

function getExecutableHarnesses() {
  return harnesses.filter((harness) => harness.posture === 'approved-now' && harness.runner);
}

if (!harnessId) {
  console.error('Usage: harness-run.mjs <harness-id> [args...]');
  console.error('Hint: harness-run.mjs list | harness-run.mjs info <harness-id>');
  process.exit(2);
}

if (harnessId === 'list' || harnessId === '--list') {
  const executableHarnesses = getExecutableHarnesses().map((harness) => ({
    id: harness.id,
    posture: harness.posture,
    runner: harness.runner,
    note: harness.note,
  }));
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'harness-run-list',
        executableHarnesses,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (harnessId === 'info' || harnessId === '--info') {
  const infoHarnessId = harnessArgs[0];
  if (!infoHarnessId) {
    console.error('Usage: harness-run.mjs info <harness-id>');
    process.exit(2);
  }

  const harness = getHarness(infoHarnessId);
  if (!harness) {
    console.error(`Unknown harness: ${infoHarnessId}`);
    process.exit(2);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'harness-run-info',
        harness: {
          id: harness.id,
          posture: harness.posture,
          kind: harness.kind,
          command: harness.command,
          runner: harness.runner ?? null,
          note: harness.note,
          installReview: harness.installReview,
        },
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const harness = getHarness(harnessId);
if (!harness) {
  console.error(`Unknown harness: ${harnessId}`);
  process.exit(2);
}

if (harness.posture !== 'approved-now' || !harness.runner) {
  console.error(`Harness ${harnessId} is not executable in the current repo posture.`);
  console.error(`Posture: ${harness.posture}`);
  console.error(`Guidance: ${harness.note}`);
  process.exit(2);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runnerPath = path.join(repoRoot, harness.runner);
const result = spawnSync(process.execPath, [runnerPath, ...harnessArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
