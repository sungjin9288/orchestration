import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { computeWorkOrderRecordDigest } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-669');
const runtimeRoot = path.join(tempRoot, 'runtime');
const port = 9600 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-669-acceptance-criterion-proof-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_669_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function fetchJson(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, options).then(async (response) => ({
    response,
    payload: await response.json(),
  }));
}

function postJson(pathname, body, contentType = 'application/json') {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-669 server');
}

function seedFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-acceptance-criterion-proof.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_ACCEPTANCE_PROOF_KEEP_FIXTURE: '1',
        ORCHESTRATION_ACCEPTANCE_PROOF_SEED_STAGE: 'reviewer-ready',
        ORCHESTRATION_ACCEPTANCE_PROOF_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(
      seeded.stderr || seeded.stdout || 'Failed to seed AcceptanceCriterion proof fixture',
    );
  }
}

async function main() {
  seedFixture();
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourceState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const executionPlan = Object.values(sourceState.executionPlans)[0];
  const builder = sourceState.workOrders[executionPlan.workOrderIds[0]];
  const criteria = builder.acceptanceCriterionRefs.map(
    (criterionId) => sourceState.acceptanceCriteria[criterionId],
  );
  const commandCriterion = criteria.find((criterion) => criterion.proofMode === 'command');
  const reviewCriteria = criteria.filter((criterion) => criterion.proofMode !== 'command');
  assert.equal(sourceState.schemaVersion, 19);
  assert.equal(criteria.length, 4);
  assert.equal(Object.keys(sourceState.verificationProofs).length, 0);

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const [appSource, signalSource, stylesSource] = await Promise.all([
      fetch(`${baseUrl}/app.js`).then((response) => response.text()),
      fetch(`${baseUrl}/council-signals.js`).then((response) => response.text()),
      fetch(`${baseUrl}/styles.css`).then((response) => response.text()),
    ]);
    assert.match(appSource, /data-action="persist-workorder-acceptance-criteria"/);
    assert.match(appSource, /run-workorder-node-check-proof/);
    assert.match(appSource, /record-workorder-verification-proof/);
    assert.match(appSource, /Acceptance & Proof Ledger/);
    assert.match(appSource, /verificationBlocksResume/);
    assert.doesNotMatch(appSource, /data-action="complete-workorder-verification"/);
    assert.match(signalSource, /acceptanceCriteria/);
    assert.match(signalSource, /verificationProofs/);
    assert.match(stylesSource, /\.workorder-verification-ledger/);
    assert.match(stylesSource, /@media \(max-width: 760px\)/);

    const statusEndpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
      `/work-orders/${encodeURIComponent(builder.id)}/verification-status`;
    const initialStatus = await fetchJson(statusEndpoint);
    assert.equal(initialStatus.response.status, 200);
    assert.equal(initialStatus.payload.verificationStatus.criteriaRequired, true);
    assert.equal(initialStatus.payload.verificationStatus.ready, false);

    const recovery = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/recovery`,
    );
    const blockedResume = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/resume-from-checkpoint`,
      {
        checkpointId: recovery.payload.executionPlanRecovery.checkpoint.id,
        checkpointDigest: recovery.payload.executionPlanRecovery.checkpoint.checkpointDigest,
        inputDigest: recovery.payload.executionPlanRecovery.checkpoint.inputDigest,
        authorityDigest: recovery.payload.executionPlanRecovery.checkpoint.authorityDigest,
        action: 'resume-reviewer',
      },
    );
    assert.equal(blockedResume.response.status, 409);
    assert.match(blockedResume.payload.error, /requires current passed VerificationProofs/);

    const workOrderDigest = await computeWorkOrderRecordDigest(builder);
    const reviewedAt = new Date().toISOString();
    const proofApproval = (rationale) => ({
      decision: 'record-proof',
      acknowledgement: 'reviewed-current-workorder-evidence-for-verification-proof',
      rationale,
      reviewedAt,
    });
    const firstReviewEndpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
      `/work-orders/${encodeURIComponent(builder.id)}` +
      `/acceptance-criteria/${encodeURIComponent(reviewCriteria[0].id)}/proofs`;
    const firstReviewBody = {
      criterionRecordDigest: reviewCriteria[0].recordDigest,
      evidenceArtifactIds: [...builder.artifactRefs],
      proofApproval: proofApproval('Reviewed exact Builder evidence for this criterion.'),
      sourceDigest: executionPlan.sourceDigest,
      status: 'passed',
      workOrderDigest,
    };
    const malformed = await postJson(firstReviewEndpoint, {
      ...firstReviewBody,
      providerMode: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    const stale = await postJson(firstReviewEndpoint, {
      ...firstReviewBody,
      workOrderDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    const wrongContentType = await postJson(firstReviewEndpoint, firstReviewBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await fetchJson(firstReviewEndpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(65 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.equal(JSON.parse(fs.readFileSync(statePath, 'utf8')).sequences.verificationProof, 0);

    for (const [index, criterion] of reviewCriteria.entries()) {
      const endpoint =
        `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
        `/work-orders/${encodeURIComponent(builder.id)}` +
        `/acceptance-criteria/${encodeURIComponent(criterion.id)}/proofs`;
      const result = await postJson(endpoint, {
        criterionRecordDigest: criterion.recordDigest,
        evidenceArtifactIds: [...builder.artifactRefs],
        proofApproval: proofApproval(`Reviewed exact Builder evidence for ${criterion.kind}.`),
        sourceDigest: executionPlan.sourceDigest,
        status: 'passed',
        workOrderDigest,
      });
      assert.equal(result.response.status, 201, `review proof ${index + 1}`);
      assert.equal(result.payload.mutation.kind, 'record-workorder-verification-proof');
    }

    const commandEndpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
      `/work-orders/${encodeURIComponent(builder.id)}` +
      `/acceptance-criteria/${encodeURIComponent(commandCriterion.id)}/run-node-check`;
    const commandBody = {
      criterionRecordDigest: commandCriterion.recordDigest,
      proofApproval: proofApproval('Run the exact source-bound node syntax check.'),
      sourceDigest: executionPlan.sourceDigest,
      workOrderDigest,
    };
    const command = await postJson(commandEndpoint, commandBody);
    assert.equal(command.response.status, 201);
    assert.equal(command.payload.executionPlanBundle.verificationProofs.length, 4);
    assert.equal(command.payload.verificationStatus.ready, true);
    const replay = await postJson(commandEndpoint, commandBody);
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);

    const finalStatus = await fetchJson(statusEndpoint);
    assert.equal(finalStatus.response.status, 200);
    assert.equal(finalStatus.payload.verificationStatus.ready, true);
    const finalState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(finalState.schemaVersion, 19);
    assert.equal(Object.keys(finalState.verificationProofs).length, 4);
    assert.equal(finalState.missions[executionPlan.missionId].status, 'executing');

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        blockedResumeStatus: blockedResume.response.status,
        malformedStatus: malformed.response.status,
        staleStatus: stale.response.status,
        wrongContentTypeStatus: wrongContentType.response.status,
        oversizedStatus: oversized.response.status,
        reviewProofStatus: 201,
        commandProofStatus: command.response.status,
        replayStatus: replay.response.status,
      },
      ui: {
        durableCriteriaVisible: true,
        proofControlsVisible: true,
        reviewerResumeProofGated: true,
        desktopMobileRulesPresent: true,
        downstreamCompletionControlAbsent: true,
      },
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }

  if (stderr.trim()) {
    throw new Error(`ui-slice-669 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
