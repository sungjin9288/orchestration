'use strict';

const fs = require('fs');
const path = require('path');

const { executeWithAdapter } = require('./provider-adapter');
const { createLocalStubProviderAdapter } = require('./providers/local-stub-adapter');
const { TASK_LIFECYCLE } = require('../runtime/contracts');

const DEFAULT_SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];

function toExecutionTask(task) {
  return {
    id: task.id,
    title: task.title,
    intent: task.intent,
    lifecycleState: task.lifecycleState,
    flags: task.flags,
    review: task.review,
    worktreeRef: task.worktreeRef,
  };
}

function toExecutionProject(project) {
  return {
    id: project.id,
    name: project.name,
    projectPath: project.projectPath,
    pack: project.pack,
  };
}

function toExecutionArtifact(artifact) {
  return {
    id: artifact.id,
    runId: artifact.runId,
    type: artifact.type,
    createdAt: artifact.createdAt,
    content: artifact.content,
  };
}

function readContextFile(repoRoot, relativePath) {
  const filePath = path.join(repoRoot, relativePath);

  return {
    path: relativePath,
    content: fs.readFileSync(filePath, 'utf8'),
  };
}

function buildPlannerExecutionRequest(input) {
  return {
    role: 'planner',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    routingOutcome: {
      classification: input.routingOutcome.classification,
      scopeStatement: input.routingOutcome.scopeStatement,
      missingContext: input.routingOutcome.missingContext || [],
      decisionNote: input.routingOutcome.decisionNote || '',
    },
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'plan',
  };
}

function buildArchitectExecutionRequest(input) {
  return {
    role: 'architect',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    codeContext: input.codeContext,
    expectedArtifactType: 'architecture',
  };
}

function buildTaskBreakerExecutionRequest(input) {
  return {
    role: 'task-breaker',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'breakdown',
  };
}

function buildBuilderPreflightExecutionRequest(input) {
  return {
    role: 'builder',
    executionMode: 'preflight',
    mutationAllowed: false,
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    taskBreakerRunSummary: input.taskBreakerRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'preflight',
  };
}

function normalizeRoleResult(result, options = {}) {
  const normalizedResult = result && typeof result === 'object' ? result : {};
  const blockers = Array.isArray(normalizedResult.blockers)
    ? normalizedResult.blockers.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  const needsDecision = Boolean(normalizedResult.needsDecision);
  const defaultNextStage = options.defaultNextStage || 'architect';
  const allowedNextStages = Array.isArray(options.allowedNextStages)
    ? options.allowedNextStages
    : null;
  const nextStage =
    normalizedResult.nextStage || (blockers.length > 0 || needsDecision ? 'human gate' : defaultNextStage);

  if (allowedNextStages && !allowedNextStages.includes(nextStage)) {
    throw new Error(`Unsupported nextStage for ${options.role || 'role'}: ${nextStage}`);
  }

  return {
    blockers,
    needsDecision,
    nextStage,
    summary: normalizedResult.summary || '',
    decisionTitle: normalizedResult.decisionTitle || '',
    decisionPrompt: normalizedResult.decisionPrompt || '',
  };
}

function buildPlannerDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- planner output requires a human decision before architect handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Planner follow-up: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Planner output requires human follow-up before architect handoff.',
    blocksTask: normalizedResult.blockers.length > 0,
  };
}

function buildArchitectDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- architect output requires a human decision before task-breaker handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Architecture decision: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Architect output requires human follow-up before task-breaker handoff.',
    blocksTask: true,
  };
}

function buildTaskBreakerDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- task-breaker output requires a human decision before builder handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Breakdown decision: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Task-breaker output requires human follow-up before builder handoff.',
    blocksTask: true,
  };
}

function buildBuilderDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- builder preflight requires a human decision before any live execution');
  }

  return {
    title: normalizedResult.decisionTitle || `Builder preflight risk: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Builder preflight requires human follow-up before any live execution.',
    blocksTask: true,
  };
}

function findLatestTaskArtifact(runtime, task, type) {
  const snapshot = runtime.getSnapshot();
  const artifactIds = Array.isArray(task.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifactMeta = snapshot.artifacts[artifactId];

    if (artifactMeta && artifactMeta.type === type) {
      return runtime.getArtifact(artifactId);
    }
  }

  return null;
}

function shouldCreateBlockingDecision(normalizedResult) {
  return normalizedResult.needsDecision || normalizedResult.nextStage === 'human gate';
}

function createExecutionCoordinator(options = {}) {
  if (!options.runtimeService) {
    throw new Error('runtimeService is required');
  }

  const runtime = options.runtimeService;
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const providerAdapter = options.providerAdapter || createLocalStubProviderAdapter();
  const plannerPromptPath = options.plannerPromptPath || 'prompts/planner.md';
  const architectPromptPath = options.architectPromptPath || 'prompts/architect.md';
  const taskBreakerPromptPath = options.taskBreakerPromptPath || 'prompts/task-breaker.md';
  const builderPromptPath = options.builderPromptPath || 'prompts/builder.md';
  const sourceOfTruthPaths = options.sourceOfTruthPaths || DEFAULT_SOURCE_OF_TRUTH_PATHS;
  const architectCodeContextPaths =
    options.architectCodeContextPaths || DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS;

  async function assertBuilderLiveMutationReady(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const { guardSummary, task } = runtime.assertTaskCanRunBuilderLiveMutation({
      taskId: input.taskId,
    });
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const preflightArtifact = findLatestTaskArtifact(runtime, task, 'preflight');

    if (!preflightArtifact) {
      throw new Error(`Preflight artifact is required before builder live mutation for task ${task.id}`);
    }

    return {
      guardSummary,
      preflightArtifact,
      preflightRun: preflightArtifact.runId ? runtime.getRun(preflightArtifact.runId) : null,
      project,
      task,
    };
  }

  async function runPlanner(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    if (!input.routingOutcome || !input.routingOutcome.scopeStatement) {
      throw new Error('routingOutcome with scopeStatement is required');
    }

    let task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, plannerPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildPlannerExecutionRequest({
      project,
      promptContract,
      routingOutcome: input.routingOutcome,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'planner',
      metadata: {
        promptPath: promptContract.path,
        routingClassification: request.routingOutcome.classification || 'unspecified',
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `planner run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built planner execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['architect', 'human gate'],
        defaultNextStage: 'architect',
        role: 'planner',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'plan',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved planner output artifact ${artifact.id}`,
      });

      if (normalizedResult.blockers.length > 0 || normalizedResult.needsDecision) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildPlannerDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created planner decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `planner execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runArchitect(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    let task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before architect run for task ${task.id}`);
    }

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, architectPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const codeContext = architectCodeContextPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildArchitectExecutionRequest({
      codeContext,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'architect',
      metadata: {
        codeContextPaths: architectCodeContextPaths,
        inputArtifactId: planArtifact.id,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `architect run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architect prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as architect input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built architect execution request with ${sourceOfTruth.length} source-of-truth files and ${codeContext.length} code-context files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['human gate', 'task-breaker'],
        defaultNextStage: 'task-breaker',
        role: 'architect',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'architecture',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved architecture note artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildArchitectDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created architect decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          decisionCreated: Boolean(decisionInboxItem),
          inputArtifactId: planArtifact.id,
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        inputArtifact: planArtifact,
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `architect execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          inputArtifactId: planArtifact.id,
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runTaskBreaker(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    runtime.assertTaskCanRunTaskBreaker({
      taskId: input.taskId,
    });

    let task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');
    const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before task-breaker run for task ${task.id}`);
    }

    if (!architectureArtifact) {
      throw new Error(
        `Architecture artifact is required before task-breaker run for task ${task.id}`,
      );
    }

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;
    const architectRun = architectureArtifact.runId ? runtime.getRun(architectureArtifact.runId) : null;

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, taskBreakerPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildTaskBreakerExecutionRequest({
      architectureArtifact,
      architectRunSummary: architectRun?.summary || null,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'task-breaker',
      metadata: {
        architectureArtifactId: architectureArtifact.id,
        inputArtifactIds: [planArtifact.id, architectureArtifact.id],
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `task-breaker run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded task-breaker prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as task-breaker input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architecture artifact ${architectureArtifact.id} as task-breaker input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built task-breaker execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['builder', 'human gate'],
        defaultNextStage: 'builder',
        role: 'task-breaker',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'breakdown',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved breakdown artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildTaskBreakerDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created task-breaker decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          architectureArtifactId: architectureArtifact.id,
          decisionCreated: Boolean(decisionInboxItem),
          inputArtifactIds: [planArtifact.id, architectureArtifact.id],
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        architectureArtifact,
        decisionInboxItem,
        inputArtifacts: [planArtifact, architectureArtifact],
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `task-breaker execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          inputArtifactIds: [planArtifact.id, architectureArtifact.id],
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runBuilderPreflight(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    let task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');
    const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');
    const breakdownArtifact = findLatestTaskArtifact(runtime, task, 'breakdown');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before builder preflight run for task ${task.id}`);
    }

    if (!architectureArtifact) {
      throw new Error(
        `Architecture artifact is required before builder preflight run for task ${task.id}`,
      );
    }

    if (!breakdownArtifact) {
      throw new Error(
        `Breakdown artifact is required before builder preflight run for task ${task.id}`,
      );
    }

    runtime.assertTaskCanRunBuilderPreflight({
      taskId: input.taskId,
    });

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;
    const architectRun = architectureArtifact.runId ? runtime.getRun(architectureArtifact.runId) : null;
    const taskBreakerRun = breakdownArtifact.runId ? runtime.getRun(breakdownArtifact.runId) : null;

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, builderPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildBuilderPreflightExecutionRequest({
      architectureArtifact,
      architectRunSummary: architectRun?.summary || null,
      breakdownArtifact,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruth,
      task,
      taskBreakerRunSummary: taskBreakerRun?.summary || null,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'builder',
      metadata: {
        executionMode: 'preflight',
        inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
        mutationAllowed: false,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `builder preflight run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded builder prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architecture artifact ${architectureArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded breakdown artifact ${breakdownArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built builder preflight execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['reviewer', 'task-breaker', 'architect', 'human gate'],
        defaultNextStage: 'reviewer',
        role: 'builder',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'preflight',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved builder preflight artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildBuilderDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created builder preflight decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          decisionCreated: Boolean(decisionInboxItem),
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          model: response.model,
          blockers: normalizedResult.blockers.length,
          mutationAllowed: false,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact],
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `builder preflight execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          nextStage: null,
        },
      });

      throw error;
    }
  }

  return {
    assertBuilderLiveMutationReady,
    runArchitect,
    runBuilderPreflight,
    runPlanner,
    runTaskBreaker,
  };
}

module.exports = {
  createExecutionCoordinator,
};
