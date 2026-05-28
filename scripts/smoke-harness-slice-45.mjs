#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const statusScript = path.join(repoRoot, 'scripts', 'hermes-agent-internal-harness-status.mjs');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');

const result = spawnSync(process.execPath, [statusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `hermes internal status failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.ok, true);
assert.equal(payload.mode, 'hermes-agent-internal-harness-status');
assert.equal(payload.hermesReference.sourceId, 'hermes-agent');
assert.equal(payload.hermesReference.posture, 'internal-pattern-adopted');
assert.equal(payload.hermesReference.externalRunnerAdopted, false);
assert.equal(payload.hermesReference.externalDependencyRequired, false);
assert.equal(payload.hermesReference.externalInstallAllowedByDefault, false);

const typoResult = spawnSync(process.execPath, [statusScript, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(typoResult.status, 2);
assert.equal(typoResult.stdout, '');

const typoPayload = JSON.parse(typoResult.stderr);
assert.equal(typoPayload.ok, false);
assert.equal(typoPayload.mode, 'hermes-agent-internal-harness-status');
assert.equal(typoPayload.error, 'invalid-arguments');
assert.deepEqual(typoPayload.allowedFlags, []);
assert.deepEqual(typoPayload.receivedArgs, ['--typo']);

const harness = payload.internalHermesAgentHarness;
assert.equal(harness.id, 'orchestration-hermes-agent-internal');
assert.equal(harness.scope, 'v1-development-pack');
assert.equal(harness.localFirst, true);
assert.equal(harness.singleUserFirst, true);
assert.equal(harness.opsFirst, true);
assert.equal(harness.executableThroughExternalHermes, false);
assert.equal(harness.defaultProviderPolicy, 'local-stub-compatible');
assert.equal(harness.requiredProjectPath, true);
assert.match(harness.architectureBoundary, /not by importing or running upstream Hermes Agent/);

const loopConcepts = harness.loop.map((step) => step.hermesConcept);
assert.deepEqual(loopConcepts, ['Hermes API request', 'Agent', 'Tool Executor', 'Function Tool']);
assert.match(harness.loop[1].orchestrationMapping, /planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer/);
assert.match(harness.loop[2].gate, /approved-now harnesses only/);
assert.match(harness.loop[3].orchestrationMapping, /markitdown-convert/);
assert.match(harness.loop[3].orchestrationMapping, /verification-output-brief/);

const safetyControlIds = harness.safetyControls.map((control) => control.id);
assert.deepEqual(safetyControlIds, [
  'fail-closed-posture',
  'approval-before-mutation',
  'path-and-scope-boundary',
  'provider-and-gateway-exclusion',
  'observability',
]);
assert.ok(harness.safetyControls.every((control) => control.status === 'active'));
assert.match(
  harness.safetyControls.find((control) => control.id === 'provider-and-gateway-exclusion').contract,
  /no multi-provider-first routing, messenger gateway, cron autonomy, or cloud backend is adopted/,
);
assert.match(
  harness.nextAllowedExpansion,
  /separate approved wrapper defines input, output, permissions, credentials, evidence, and rollback boundaries/,
);

const referenceIds = payload.harnessEngineeringReferences.map((reference) => reference.sourceId);
assert.deepEqual(referenceIds, ['harness', 'claude-code-harness-engineering', 'hermes-agent']);

const doc = fs.readFileSync(docPath, 'utf8');
assert.match(doc, /Hermes-style internal agent harness \(current v1\)/);
assert.match(doc, /orchestration-hermes-agent-internal/);
assert.match(doc, /API request -> Agent -> Tool Executor -> Function Tool/);
assert.match(doc, /planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer/);
assert.match(doc, /node scripts\/hermes-agent-internal-harness-status\.mjs/);
assert.match(doc, /node scripts\/smoke-harness-slice-45\.mjs/);
assert.match(doc, /not an imported upstream Hermes runtime/);

console.log(
  JSON.stringify(
    {
      ok: true,
      internalHermesAgentHarness: {
        id: harness.id,
        loopConcepts,
        safetyControlIds,
        verificationEntrypoints: harness.verificationEntrypoints,
        typoRejected: true,
      },
    },
    null,
    2,
  ),
);
