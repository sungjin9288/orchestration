#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHarness } from './harness-registry.mjs';

const args = process.argv.slice(2);
const harnessId = args[0];
const harnessArgs = args.slice(1);

if (!harnessId) {
  console.error('Usage: harness-run.mjs <harness-id> [args...]');
  process.exit(2);
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
