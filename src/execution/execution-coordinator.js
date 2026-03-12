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
    task: {
      id: input.task.id,
      title: input.task.title,
      intent: input.task.intent,
      lifecycleState: input.task.lifecycleState,
      flags: input.task.flags,
      review: input.task.review,
      worktreeRef: input.task.worktreeRef,
    },
    project: {
      id: input.project.id,
      name: input.project.name,
      projectPath: input.project.projectPath,
      pack: input.project.pack,
    },
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

function normalizePlannerResult(result) {
  const normalizedResult = result && typeof result === 'object' ? result : {};
  const blockers = Array.isArray(normalizedResult.blockers)
    ? normalizedResult.blockers.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  const needsDecision = Boolean(normalizedResult.needsDecision);

  return {
    blockers,
    needsDecision,
    nextStage:
      normalizedResult.nextStage || (blockers.length > 0 || needsDecision ? 'human gate' : 'architect'),
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

function createExecutionCoordinator(options = {}) {
  if (!options.runtimeService) {
    throw new Error('runtimeService is required');
  }

  const runtime = options.runtimeService;
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const providerAdapter = options.providerAdapter || createLocalStubProviderAdapter();
  const plannerPromptPath = options.plannerPromptPath || 'prompts/planner.md';
  const sourceOfTruthPaths = options.sourceOfTruthPaths || DEFAULT_SOURCE_OF_TRUTH_PATHS;

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
      const normalizedResult = normalizePlannerResult(response.normalizedResult);
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

  return {
    runPlanner,
  };
}

module.exports = {
  createExecutionCoordinator,
};
