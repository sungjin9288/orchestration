import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-05');
const projectRoot = path.join(runtimeRoot, 'project');
const fixtureRelativePath = 'prompts/builder.md';
const fixtureRepoPath = path.join(repoRoot, fixtureRelativePath);
const fixtureProjectPath = path.join(projectRoot, fixtureRelativePath);

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

function ensureFixtureProject() {
  fs.rmSync(projectRoot, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(fixtureProjectPath), { recursive: true });
  fs.copyFileSync(fixtureRepoPath, fixtureProjectPath);
}

function buildOutOfScopeOutput() {
  return `# Builder Live Mutation: malicious

## Change Summary
- preflight artifact: malicious
- approval id: malicious
- target file allowlist count: 1
- prepared file updates: 1
- reviewer executed: no
- commit or release executed: no

## Target Files
- ${fixtureRelativePath}

## File Updates
### outside/not-allowed.txt
\`\`\`base64
${Buffer.from('outside change\n', 'utf8').toString('base64')}
\`\`\`

## Risks
- malicious output

## Verification Notes
- should fail before any file write
`;
}

function createOutOfScopeAdapter() {
  return {
    name: 'out-of-scope-stub',
    async execute() {
      return {
        providerRunId: 'out-of-scope-live-mutation',
        model: 'out-of-scope-live-mutation-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'malicious out-of-scope mutation output',
        },
        outputText: buildOutOfScopeOutput(),
        usage: {
          inputTokens: 0,
          outputTokens: 0,
        },
      };
    },
  };
}

async function runThroughBuilderPreflight(coordinator, task) {
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(
      'Prepare the approved slice and capture a builder preflight artifact before limited live mutation.',
    ),
  });
  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });
  const builderPreflightResult = await coordinator.runBuilderPreflight({
    taskId: task.id,
  });

  return {
    architectResult,
    builderPreflightResult,
    plannerResult,
    taskBreakerResult,
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();
ensureFixtureProject();

const project = runtime.createProject({
  name: 'live-mutation-fixture',
  projectPath: projectRoot,
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const approvalTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder live mutation execution smoke',
  intent: 'Run limited live mutation only after the latest preflight and approved live mutation approval are aligned.',
});

const setup = await runThroughBuilderPreflight(coordinator, approvalTask);
const preflightArtifact = runtime.getArtifact(setup.builderPreflightResult.artifact.id);
const repoFixtureBefore = fs.readFileSync(fixtureRepoPath, 'utf8');
const projectFixtureBefore = fs.readFileSync(fixtureProjectPath, 'utf8');

assert.match(preflightArtifact.content, /^## Target Files$/m);
assert.match(preflightArtifact.content, new RegExp(`- ${fixtureRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));

await assert.rejects(
  () =>
    coordinator.runBuilderLiveMutation({
      taskId: approvalTask.id,
    }),
  /latest approval|approved builder live mutation approval/i,
);

const pendingApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: approvalTask.id,
});

await assert.rejects(
  () =>
    coordinator.runBuilderLiveMutation({
      taskId: approvalTask.id,
    }),
  /pending approvals|is pending/i,
);

runtime.resolveDecisionInboxItem({
  itemId: pendingApproval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject the first live mutation approval request.',
});

await assert.rejects(
  () =>
    coordinator.runBuilderLiveMutation({
      taskId: approvalTask.id,
    }),
  /is rejected/i,
);

const approvedApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: approvalTask.id,
});

runtime.resolveDecisionInboxItem({
  itemId: approvedApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve the bounded live mutation request.',
});

const successResult = await coordinator.runBuilderLiveMutation({
  taskId: approvalTask.id,
});

const successLogs = runtime.getLogs(successResult.run.id);
const changeSummaryArtifact = runtime.getArtifact(successResult.artifacts.changeSummary.id);
const patchArtifact = runtime.getArtifact(successResult.artifacts.patch.id);
const diffArtifact = runtime.getArtifact(successResult.artifacts.diff.id);
const projectFixtureAfter = fs.readFileSync(fixtureProjectPath, 'utf8');
const repoFixtureAfter = fs.readFileSync(fixtureRepoPath, 'utf8');
const approvalTaskAfter = runtime.getTask(approvalTask.id);
const reviewInboxItems = runtime.listDecisionInboxItems({
  kind: 'review',
  taskId: approvalTask.id,
});

assert.equal(successResult.run.summary.executionMode, 'live-mutation');
assert.equal(successResult.run.summary.approvalId, approvedApproval.id);
assert.deepEqual(successResult.changedFiles, [fixtureRelativePath]);
assert.equal(changeSummaryArtifact.type, 'change-summary');
assert.equal(patchArtifact.type, 'patch');
assert.equal(diffArtifact.type, 'diff');
assert.match(changeSummaryArtifact.content, /^# Builder Live Mutation:/m);
assert.match(patchArtifact.content, new RegExp(`a/${fixtureRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
assert.match(diffArtifact.content, new RegExp(`b/${fixtureRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
assert.equal(repoFixtureAfter, repoFixtureBefore);
assert.notEqual(projectFixtureAfter, projectFixtureBefore);
assert.match(projectFixtureAfter, new RegExp(`builder-live-mutation ${approvedApproval.id}`));
assert.equal(approvalTaskAfter.lifecycleState, 'In Progress');
assert.equal(approvalTaskAfter.review.status, 'pending');
assert.equal(reviewInboxItems.length, 0);
assert.match(successLogs[0].message, /builder live mutation run started/i);
assert.match(successLogs[3].message, /approved live mutation approval/i);
assert.match(
  successLogs.map((entry) => entry.message).join('\n'),
  /saved builder live mutation change-summary artifact/i,
);
assert.match(
  successLogs.map((entry) => entry.message).join('\n'),
  /saved builder live mutation patch artifact/i,
);
assert.match(
  successLogs.map((entry) => entry.message).join('\n'),
  /saved builder live mutation diff artifact/i,
);

const stalePreflight = await coordinator.runBuilderPreflight({
  taskId: approvalTask.id,
});

await assert.rejects(
  () =>
    coordinator.runBuilderLiveMutation({
      taskId: approvalTask.id,
    }),
  /stale/i,
);

runtime.createDecisionInboxItem({
  taskId: approvalTask.id,
  title: 'Blocking decision before refreshed live mutation',
  prompt: 'Resolve the blocking decision before rerunning live mutation.',
  blocksTask: true,
});

await assert.rejects(
  () =>
    coordinator.runBuilderLiveMutation({
      taskId: approvalTask.id,
    }),
  /blocking decision items/i,
);

const outOfScopeTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder live mutation out-of-scope guard smoke',
  intent: 'Reject live mutation outputs that attempt to write outside the latest preflight target files.',
});

await runThroughBuilderPreflight(coordinator, outOfScopeTask);

const outOfScopeApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: outOfScopeTask.id,
});

runtime.resolveDecisionInboxItem({
  itemId: outOfScopeApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve the malicious out-of-scope mutation request for validation.',
});

const maliciousCoordinator = createExecutionCoordinator({
  providerAdapter: createOutOfScopeAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const projectFixtureBeforeOutOfScope = fs.readFileSync(fixtureProjectPath, 'utf8');

await assert.rejects(
  () =>
    maliciousCoordinator.runBuilderLiveMutation({
      taskId: outOfScopeTask.id,
    }),
  /outside the latest preflight target files/i,
);

assert.equal(fs.readFileSync(fixtureProjectPath, 'utf8'), projectFixtureBeforeOutOfScope);
assert.equal(stalePreflight.run.summary.executionMode, 'preflight');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: approvalTask.id,
      changedFiles: successResult.changedFiles,
      changeSummaryArtifactId: successResult.artifacts.changeSummary.id,
      patchArtifactId: successResult.artifacts.patch.id,
      diffArtifactId: successResult.artifacts.diff.id,
    },
    null,
    2,
  ),
);
