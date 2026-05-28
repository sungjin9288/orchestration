import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const promptGuardScript = path.join(repoRoot, 'scripts', 'prompt-provenance-guard.mjs');
const harnessBaselinePath = path.join(repoRoot, 'docs', '13_harness-baseline.md');

const guardResult = spawnSync(process.execPath, [promptGuardScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(guardResult.status, 0, `prompt provenance guard failed: ${guardResult.stderr}`);

const payload = JSON.parse(guardResult.stdout);

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'prompt-provenance-guard');
assert.equal(payload.posture, 'source-only-negative-guardrail');
assert.equal(payload.upstreamContentImported, false);
assert.equal(payload.runtimeMutation, false);
assert.equal(payload.dependencyRequired, false);
assert.equal(payload.promptCount, 6);

const typoResult = spawnSync(process.execPath, [promptGuardScript, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(typoResult.status, 2);
assert.equal(typoResult.stdout, '');

const typoPayload = JSON.parse(typoResult.stderr);
assert.equal(typoPayload.ok, false);
assert.equal(typoPayload.mode, 'prompt-provenance-guard');
assert.equal(typoPayload.error, 'invalid-arguments');
assert.deepEqual(typoPayload.allowedFlags, []);
assert.deepEqual(typoPayload.receivedArgs, ['--typo']);

assert.equal(payload.failures.missingPrompts.length, 0);
assert.equal(payload.failures.blockedMarkerFindings.length, 0);
assert.equal(payload.failures.contractFindings.length, 0);
assert.equal(payload.failures.missingAggregateAnchors.length, 0);
assert.equal(
  payload.blockedPromptMarkers.includes('CL4R1T4S'),
  true,
  'guard must explicitly block direct CL4R1T4S prompt marker import',
);
assert.equal(
  payload.prompts.some((prompt) => prompt.path === 'prompts/builder.md' && prompt.exists),
  true,
);

const harnessBaseline = fs.readFileSync(harnessBaselinePath, 'utf8');
assert.match(harnessBaseline, /`CL4R1T4S` \(elder-plinius\)/);
assert.match(harnessBaseline, /signal-only negative guardrail/);
assert.match(harnessBaseline, /`scripts\/prompt-provenance-guard\.mjs`/);
assert.match(harnessBaseline, /No prompt leak, jailbreak, or upstream AGPL prompt corpora/);

console.log(
  JSON.stringify(
    {
      ok: true,
      promptProvenanceGuard: {
        mode: payload.mode,
        posture: payload.posture,
        promptCount: payload.promptCount,
        blockedPromptMarkerCount: payload.blockedPromptMarkers.length,
        typoRejected: true,
      },
    },
    null,
    2,
  ),
);
