import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import verificationModule from '../src/runtime/workorder-verification-plan-preview.js';
import { startHistoricalUnboundRealCouncilFixture } from './ai-company-council-fixtures.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const {
  BLOCKED_ACTIONS,
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
  previewWorkOrderVerificationPlan,
} = verificationModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_WORKORDER_VERIFICATION_PREVIEW_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-workorder-verification-preview-smoke');
const keepFixture = process.env.ORCHESTRATION_WORKORDER_VERIFICATION_PREVIEW_KEEP_FIXTURE === '1';
const MODE = 'ai-company-workorder-verification-plan-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['Builder preflight evidence'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before builder live mutation'],
};

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'workorder-verification-preview-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function seedExecutionPlan(runtimeRoot) {
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
    councilLiveAdapter: {
      executePosition() {
        throw new Error('WorkOrder verification preview must not call a provider');
      },
      executeSynthesis() {
        throw new Error('WorkOrder verification preview must not call a provider');
      },
    },
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'WorkOrder verification preview',
    projectPath: repoRoot,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'WorkOrder verification evidence review',
    goal: 'Review exact WorkOrder criteria without executing or persisting proof.',
    constraints: 'Keep the current schema and every downstream authority closed.',
  });
  const started = startHistoricalUnboundRealCouncilFixture({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
    missionId: mission.id,
  });
  runtime.decideRealCouncilSession({
    councilSessionId: started.councilSession.id,
    action: 'approve',
  });
  const sourcePreview = runtime.previewMissionWorkOrders({
    councilSessionId: started.councilSession.id,
    compileSpec,
  });
  const bundle = runtime.persistMissionWorkOrderPlan({
    councilSessionId: started.councilSession.id,
    compileSpec,
    previewId: sourcePreview.previewId,
    sourceDigest: sourcePreview.sourceDigest,
  });
  return { runtime, bundle };
}

function assertNoWrite(statePath, operation, pattern) {
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const runtimeRoot = path.join(tempRoot, 'source');
    const { runtime, bundle } = seedExecutionPlan(runtimeRoot);
    const executionPlan = bundle.executionPlan;
    const workOrder = bundle.workOrders[0];
    const evaluatedAt = new Date().toISOString();
    const request = {
      executionPlanId: executionPlan.id,
      executionPlanDigest: computeExecutionPlanRecordDigest(executionPlan),
      workOrderId: workOrder.id,
      workOrderDigest: computeWorkOrderRecordDigest(workOrder),
      sourceDigest: executionPlan.sourceDigest,
      evaluatedAt,
    };
    const statePath = path.join(runtimeRoot, 'state.json');
    const stateBytesBefore = fs.readFileSync(statePath, 'utf8');

    const preview = runtime.previewWorkOrderVerificationPlan(request);
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'review-ready');
    assert.equal(preview.executionPlanId, executionPlan.id);
    assert.equal(preview.executionPlanDigest, request.executionPlanDigest);
    assert.equal(preview.workOrderId, workOrder.id);
    assert.equal(preview.workOrderDigest, request.workOrderDigest);
    assert.equal(preview.sourceDigest, executionPlan.sourceDigest);
    assert.deepEqual(
      preview.criteria.map((criterion) => criterion.kind),
      ['happy-path', 'risk', 'regression', 'manual'],
    );
    assert.deepEqual(
      preview.criteria.map((criterion) => criterion.proofMode),
      ['review', 'review', 'command', 'manual'],
    );
    assert.deepEqual(preview.criteria[0].sourceValues, workOrder.acceptanceCriteria);
    assert.deepEqual(preview.criteria[1].sourceValues, workOrder.stopConditions);
    assert.deepEqual(preview.criteria[2].sourceValues, workOrder.verificationCommands);
    assert.deepEqual(preview.criteria[3].sourceValues, workOrder.expectedArtifacts);
    assert.equal(preview.coverage.complete, true);
    assert.equal(preview.approvalAllowed, false);
    assert.equal(preview.completionAllowed, false);
    assert.equal(preview.commandExecutionAllowed, false);
    assert.equal(preview.persistenceAllowed, false);
    assert.deepEqual(preview.blockedActions, [...BLOCKED_ACTIONS]);
    assert.match(preview.id, /^workorder-verification-plan-preview-[a-f0-9]{16}$/);
    assert.match(preview.previewDigest, /^[a-f0-9]{64}$/);
    assert.equal(Object.isFrozen(preview), true);
    assert.equal(Object.isFrozen(preview.criteria), true);
    assert.equal(Object.isFrozen(preview.criteria[0]), true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const replay = runtime.previewWorkOrderVerificationPlan(request);
    assert.deepEqual(replay, preview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(
      runtime.getSnapshot().workOrderVerificationPlanPreview,
      undefined,
    );

    assertNoWrite(
      statePath,
      () => runtime.previewWorkOrderVerificationPlan({ ...request, rawBody: 'forbidden' }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewWorkOrderVerificationPlan({
          ...request,
          sourceDigest: '0'.repeat(64),
        }),
      /sourceDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewWorkOrderVerificationPlan({
          ...request,
          executionPlanDigest: '0'.repeat(64),
        }),
      /executionPlanDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewWorkOrderVerificationPlan({
          ...request,
          workOrderDigest: '0'.repeat(64),
        }),
      /workOrderDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewWorkOrderVerificationPlan({
          ...request,
          evaluatedAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        }),
      /too far in the future/,
    );

    const mismatchedWorkOrder = { ...workOrder, executionPlanId: 'execution-plan-other' };
    assert.throws(
      () =>
        previewWorkOrderVerificationPlan({
          executionPlan,
          workOrder: mismatchedWorkOrder,
          evaluatedAt,
        }),
      /does not belong/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: runtime.getSnapshot().schemaVersion,
          previewId: preview.id,
          criterionKinds: preview.criteria.map((criterion) => criterion.kind),
          persisted: preview.persisted,
          stateBytesUnchanged: true,
          blockedActions: preview.blockedActions,
        },
        null,
        2,
      ),
    );
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
