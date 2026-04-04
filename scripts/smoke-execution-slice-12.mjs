import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-execution-slice-12');
const runtime = createRuntimeService({ runtimeRoot });
const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot: process.cwd(),
  runtimeService: runtime,
});

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), `orchestration-execution-slice-12-${label}-`),
  );
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'execution-slice-12']);
  runGit(mainProjectPath, ['config', 'user.email', 'execution-slice-12@example.com']);
  fs.writeFileSync(path.join(mainProjectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(mainProjectPath, ['add', 'README.md']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', `${label}-linked`, linkedProjectPath]);

  return {
    linkedProjectPath: fs.realpathSync(linkedProjectPath),
    mainProjectPath: fs.realpathSync(mainProjectPath),
  };
}

function createRoleArtifact(taskId, role, type, content, summary = {}) {
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type,
    content,
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function createPlannerArtifact(taskId, label) {
  return createRoleArtifact(
    taskId,
    'planner',
    'plan',
    `# Plan: ${label}

## Slice Goal
${label}
`,
    {
      nextStage: 'architect',
    },
  );
}

function createArchitectArtifact(taskId, plan, label) {
  return createRoleArtifact(
    taskId,
    'architect',
    'architecture',
    `# Architecture Note: ${label}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- ui/app.js
`,
    {
      inputArtifactId: plan.artifact.id,
      inputRunId: plan.run.id,
      nextStage: 'task-breaker',
    },
  );
}

function createTaskBreakerArtifact(taskId, plan, architecture, label) {
  return createRoleArtifact(
    taskId,
    'task-breaker',
    'breakdown',
    `# Task Breakdown: ${label}

## Ordered Sub-Tasks
- keep execution entry gating explicit
`,
    {
      architectureArtifactId: architecture.artifact.id,
      architectureRunId: architecture.run.id,
      inputArtifactIds: [plan.artifact.id, architecture.artifact.id],
      inputRunIds: [plan.run.id, architecture.run.id],
      nextStage: 'builder',
    },
  );
}

runtime.resetRuntime();

const validProject = runtime.createProject({
  name: 'execution-entry-valid',
  projectPath: process.cwd(),
});
const validTask = runtime.createTask({
  projectId: validProject.id,
  title: 'Execution entry readiness allowed path smoke',
  intent:
    'Verify planner -> architect -> task-breaker -> builder-preflight still completes when project_path is valid.',
});
const routingOutcome = {
  classification: 'new task',
  scopeStatement:
    'Keep execution entry gating explicit while preserving the current development-pack role chain.',
  missingContext: [],
  decisionNote: '',
};

const validPlanner = await coordinator.runPlanner({
  taskId: validTask.id,
  routingOutcome,
});
const validArchitect = await coordinator.runArchitect({
  taskId: validTask.id,
});
const validTaskBreaker = await coordinator.runTaskBreaker({
  taskId: validTask.id,
});
const validBuilderPreflight = await coordinator.runBuilderPreflight({
  taskId: validTask.id,
});
const validSummary = coordinator.getExecutionEntryReadiness({
  stage: 'builderPreflight',
  taskId: validTask.id,
});

assert.equal(validPlanner.run.status, 'completed');
assert.equal(validArchitect.run.status, 'completed');
assert.equal(validTaskBreaker.run.status, 'completed');
assert.equal(validBuilderPreflight.run.status, 'completed');
assert.equal(validSummary.allowed, true);
assert.deepEqual(validSummary.reasons, []);

const invalidProjectPath = fs.mkdtempSync(
  path.join(os.tmpdir(), 'orchestration-execution-slice-12-invalid-'),
);
const invalidProject = runtime.createProject({
  name: 'execution-entry-invalid',
  projectPath: invalidProjectPath,
});
const invalidTask = runtime.createTask({
  projectId: invalidProject.id,
  title: 'Execution entry readiness blocked path smoke',
  intent:
    'Verify missing project_path surfaces as the first blocked reason across planner, architect, task-breaker, and builder-preflight.',
});
const invalidPlan = createPlannerArtifact(invalidTask.id, 'invalid-plan');
const invalidArchitecture = createArchitectArtifact(invalidTask.id, invalidPlan, 'invalid-architecture');

createTaskBreakerArtifact(
  invalidTask.id,
  invalidPlan,
  invalidArchitecture,
  'invalid-breakdown',
);

fs.rmSync(invalidProjectPath, { recursive: true, force: true });

const invalidSummaries = coordinator.listExecutionEntryReadinessSummaries();
const invalidEntrySummary = invalidSummaries[invalidTask.id];

assert.match(invalidEntrySummary.planner.reasons[0], /project_path does not exist:/i);
assert.match(invalidEntrySummary.architect.reasons[0], /project_path does not exist:/i);
assert.match(invalidEntrySummary.taskBreaker.reasons[0], /project_path does not exist:/i);
assert.match(invalidEntrySummary.builderPreflight.reasons[0], /project_path does not exist:/i);
assert.equal(invalidEntrySummary.planner.allowed, false);
assert.equal(invalidEntrySummary.architect.allowed, false);
assert.equal(invalidEntrySummary.taskBreaker.allowed, false);
assert.equal(invalidEntrySummary.builderPreflight.allowed, false);

await assert.rejects(
  () =>
    coordinator.runPlanner({
      taskId: invalidTask.id,
      routingOutcome,
    }),
  /project_path does not exist:/i,
);
await assert.rejects(
  () =>
    coordinator.runArchitect({
      taskId: invalidTask.id,
    }),
  /project_path does not exist:/i,
);
await assert.rejects(
  () =>
    coordinator.runTaskBreaker({
      taskId: invalidTask.id,
    }),
  /project_path does not exist:/i,
);
await assert.rejects(
  () =>
    coordinator.runBuilderPreflight({
      taskId: invalidTask.id,
    }),
  /project_path does not exist:/i,
);

const providerBlockedProjectPath = fs.mkdtempSync(
  path.join(os.tmpdir(), 'orchestration-execution-slice-12-provider-'),
);
const providerBlockedProject = runtime.createProject({
  name: 'execution-entry-provider-blocked',
  projectPath: providerBlockedProjectPath,
  provider: {
    mode: 'live',
  },
});
const providerBlockedTask = runtime.createTask({
  projectId: providerBlockedProject.id,
  title: 'Execution entry provider-not-ready smoke',
  intent:
    'Verify provider-not-ready becomes the first blocked reason across planner, architect, task-breaker, and builder-preflight.',
});
const providerBlockedPlan = createPlannerArtifact(providerBlockedTask.id, 'provider-blocked-plan');
const providerBlockedArchitecture = createArchitectArtifact(
  providerBlockedTask.id,
  providerBlockedPlan,
  'provider-blocked-architecture',
);
createTaskBreakerArtifact(
  providerBlockedTask.id,
  providerBlockedPlan,
  providerBlockedArchitecture,
  'provider-blocked-breakdown',
);
const providerBlockedSummaries = coordinator.listExecutionEntryReadinessSummaries();
const providerBlockedEntrySummary = providerBlockedSummaries[providerBlockedTask.id];

assert.match(providerBlockedEntrySummary.planner.reasons[0], /provider-not-ready:/i);
assert.match(
  providerBlockedEntrySummary.planner.reasons[0],
  /live provider model is required before execution/i,
);
assert.match(providerBlockedEntrySummary.architect.reasons[0], /provider-not-ready:/i);
assert.match(providerBlockedEntrySummary.taskBreaker.reasons[0], /provider-not-ready:/i);
assert.match(providerBlockedEntrySummary.builderPreflight.reasons[0], /provider-not-ready:/i);
assert.equal(providerBlockedEntrySummary.planner.allowed, false);
assert.equal(providerBlockedEntrySummary.architect.allowed, false);
assert.equal(providerBlockedEntrySummary.taskBreaker.allowed, false);
assert.equal(providerBlockedEntrySummary.builderPreflight.allowed, false);

await assert.rejects(
  () =>
    coordinator.runPlanner({
      taskId: providerBlockedTask.id,
      routingOutcome,
    }),
  /provider-not-ready: live provider model is required before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runArchitect({
      taskId: providerBlockedTask.id,
    }),
  /provider-not-ready: live provider model is required before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runTaskBreaker({
      taskId: providerBlockedTask.id,
    }),
  /provider-not-ready: live provider model is required before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runBuilderPreflight({
      taskId: providerBlockedTask.id,
    }),
  /provider-not-ready: live provider model is required before execution/i,
);

const worktreeFixture = createLinkedWorktreeFixture('blocked-worktree');
const worktreeBlockedProject = runtime.createProject({
  name: 'execution-entry-worktree-blocked',
  projectPath: worktreeFixture.mainProjectPath,
});
const worktreeBlockedTask = runtime.createTask({
  projectId: worktreeBlockedProject.id,
  title: 'Execution entry linked-worktree mismatch smoke',
  intent:
    'Verify linked-worktree mismatch becomes the first blocked reason across planner, architect, task-breaker, and builder-preflight.',
});
runtime.setTaskWorktreeRef({
  taskId: worktreeBlockedTask.id,
  worktreeRef: worktreeFixture.linkedProjectPath,
});
const worktreeBlockedPlan = createPlannerArtifact(worktreeBlockedTask.id, 'worktree-blocked-plan');
const worktreeBlockedArchitecture = createArchitectArtifact(
  worktreeBlockedTask.id,
  worktreeBlockedPlan,
  'worktree-blocked-architecture',
);
createTaskBreakerArtifact(
  worktreeBlockedTask.id,
  worktreeBlockedPlan,
  worktreeBlockedArchitecture,
  'worktree-blocked-breakdown',
);

const worktreeBlockedSummaries = coordinator.listExecutionEntryReadinessSummaries();
const worktreeBlockedEntrySummary = worktreeBlockedSummaries[worktreeBlockedTask.id];

assert.match(worktreeBlockedEntrySummary.planner.reasons[0], /linked-worktree mismatch:/i);
assert.match(
  worktreeBlockedEntrySummary.planner.reasons[0],
  /task\.worktreeRef must match current project_path before execution/i,
);
assert.match(worktreeBlockedEntrySummary.architect.reasons[0], /linked-worktree mismatch:/i);
assert.match(worktreeBlockedEntrySummary.taskBreaker.reasons[0], /linked-worktree mismatch:/i);
assert.match(
  worktreeBlockedEntrySummary.builderPreflight.reasons[0],
  /linked-worktree mismatch:/i,
);
assert.equal(worktreeBlockedEntrySummary.planner.allowed, false);
assert.equal(worktreeBlockedEntrySummary.architect.allowed, false);
assert.equal(worktreeBlockedEntrySummary.taskBreaker.allowed, false);
assert.equal(worktreeBlockedEntrySummary.builderPreflight.allowed, false);

await assert.rejects(
  () =>
    coordinator.runPlanner({
      taskId: worktreeBlockedTask.id,
      routingOutcome,
    }),
  /linked-worktree mismatch: task\.worktreeRef must match current project_path before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runArchitect({
      taskId: worktreeBlockedTask.id,
    }),
  /linked-worktree mismatch: task\.worktreeRef must match current project_path before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runTaskBreaker({
      taskId: worktreeBlockedTask.id,
    }),
  /linked-worktree mismatch: task\.worktreeRef must match current project_path before execution/i,
);
await assert.rejects(
  () =>
    coordinator.runBuilderPreflight({
      taskId: worktreeBlockedTask.id,
    }),
  /linked-worktree mismatch: task\.worktreeRef must match current project_path before execution/i,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      blockedTaskId: invalidTask.id,
      blockedReason: invalidEntrySummary.planner.reasons[0],
      providerBlockedReason: providerBlockedEntrySummary.planner.reasons[0],
      providerBlockedTaskId: providerBlockedTask.id,
      validTaskId: validTask.id,
      validRuns: [
        validPlanner.run.id,
        validArchitect.run.id,
        validTaskBreaker.run.id,
        validBuilderPreflight.run.id,
      ],
      worktreeBlockedReason: worktreeBlockedEntrySummary.planner.reasons[0],
      worktreeBlockedTaskId: worktreeBlockedTask.id,
    },
    null,
    2,
  ),
);
