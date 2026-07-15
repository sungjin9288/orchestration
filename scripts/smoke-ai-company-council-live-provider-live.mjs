import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ai-company-council-live-provider-live');
const MODE = 'ai-company-council-live-provider-live-smoke';
const apiKeyVar = 'OPENAI_API_KEY';
const model = process.env.OPENAI_RESPONSES_MODEL || '';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

if (!process.env[apiKeyVar] || !model) {
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        status: 'skipped_missing_env',
        mode: MODE,
        reason: 'OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional Council live smoke.',
      },
      null,
      2,
    )}\n`,
  );
  process.exit(0);
}

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });

try {
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'council-live-provider-live',
    projectPath: repoRoot,
    provider: {
      mode: 'live',
      adapter: 'openai-responses',
      model,
      env: { apiKeyVar },
    },
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Optional live Council provider verification',
    goal: 'Verify one bounded four-role OpenAI Responses Council attempt.',
    constraints: 'Return normalized recommendation evidence only; do not mutate source or create downstream work.',
  });
  const result = await runtime.startProviderCouncilForMission({
    missionId: mission.id,
    mode: 'real-openai-responses',
  });
  const attempt = result.councilSession.attempts[0];
  const snapshotText = JSON.stringify(runtime.getSnapshot());

  assert.equal(result.councilSession.mode, 'real-openai-responses');
  assert.equal(attempt.providerCallCount, 4);
  assert.equal(attempt.positions.length, 3);
  assert.ok(attempt.synthesis);
  assert.equal(snapshotText.includes(process.env[apiKeyVar]), false);
  assert.equal(Object.keys(runtime.getSnapshot().tasks).length, 0);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        status: 'passed',
        mode: MODE,
        provider: {
          adapter: 'openai-responses',
          model,
          roleCalls: attempt.providerCallCount,
          sessionStatus: result.councilSession.status,
          redactedEvidence: true,
        },
      },
      null,
      2,
    )}\n`,
  );
} finally {
  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
}
