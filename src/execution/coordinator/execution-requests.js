'use strict';

function toExecutionTask(task) {
  return {
    deliverableType: task.deliverableType || null,
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
    anchor: {
      projectId: input.project.id,
      taskId: input.task.id,
      planArtifactId: input.planArtifact.id,
      planRunId: input.planRunId,
      sourceOfTruthPaths: input.sourceOfTruthPaths || [],
      codeContextPaths: input.codeContextPaths || [],
    },
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
    anchor: {
      projectId: input.project.id,
      taskId: input.task.id,
      planArtifactId: input.planArtifact.id,
      planRunId: input.planRunId,
      architectureArtifactId: input.architectureArtifact.id,
      architectureRunId: input.architectureRunId,
      sourceOfTruthPaths: input.sourceOfTruthPaths || [],
    },
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
    anchor: {
      projectId: input.project.id,
      taskId: input.task.id,
      planArtifactId: input.planArtifact.id,
      planRunId: input.planArtifact.runId,
      architectureArtifactId: input.architectureArtifact.id,
      architectureRunId: input.architectureArtifact.runId,
      breakdownArtifactId: input.breakdownArtifact.id,
      breakdownRunId: input.breakdownArtifact.runId,
      sourceOfTruthPaths: input.sourceOfTruthPaths || [],
      architectureAllowlistPaths: input.architectureAllowlistPaths || [],
      codeContextPaths: input.codeContextPaths || [],
    },
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
    codeContext: input.codeContext || [],
    expectedArtifactType: 'preflight',
  };
}

function buildBuilderLiveMutationExecutionRequest(input) {
  return {
    role: 'builder',
    anchor: input.anchor,
    executionMode: 'live-mutation',
    mutationAllowed: true,
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    preflightArtifact: toExecutionArtifact(input.preflightArtifact),
    approval: {
      id: input.approval.id,
      status: input.approval.status,
      targetArtifactId: input.approval.targetArtifactId,
      targetRunId: input.approval.targetRunId,
    },
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    taskBreakerRunSummary: input.taskBreakerRunSummary || null,
    preflightRunSummary: input.preflightRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    codeContext: input.codeContext || [],
    expectedArtifactType: 'change-summary',
  };
}

function buildReviewerExecutionRequest(input) {
  const sourceOfTruthPaths = Array.isArray(input.sourceOfTruthPaths)
    ? input.sourceOfTruthPaths
    : Array.isArray(input.sourceOfTruth)
      ? input.sourceOfTruth.map((file) => file.path).filter(Boolean)
      : [];
  const changedFilePaths = Array.isArray(input.changedFiles) ? input.changedFiles : [];

  return {
    role: 'reviewer',
    anchor: {
      projectId: input.project.id,
      taskId: input.task.id,
      planArtifactId: input.planArtifact.id,
      planRunId: input.planArtifact.runId,
      architectureArtifactId: input.architectureArtifact.id,
      architectureRunId: input.architectureArtifact.runId,
      breakdownArtifactId: input.breakdownArtifact.id,
      breakdownRunId: input.breakdownArtifact.runId,
      preflightArtifactId: input.preflightArtifact.id,
      preflightRunId: input.preflightArtifact.runId,
      changeSummaryArtifactId: input.changeSummaryArtifact.id,
      changeSummaryRunId: input.changeSummaryArtifact.runId,
      patchArtifactId: input.patchArtifact.id,
      patchRunId: input.patchArtifact.runId,
      diffArtifactId: input.diffArtifact.id,
      diffRunId: input.diffArtifact.runId,
      approvalId: input.approval?.id || null,
      sourceBuilderRunId: input.builderRun.id,
      sourceOfTruthPaths,
      changedFilePaths,
    },
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    builderRun: {
      id: input.builderRun.id,
      summary: input.builderRun.summary || null,
      startedAt: input.builderRun.startedAt,
      finishedAt: input.builderRun.finishedAt,
    },
    approval: input.approval
      ? {
          id: input.approval.id,
          status: input.approval.status,
          targetArtifactId: input.approval.targetArtifactId,
          targetRunId: input.approval.targetRunId,
        }
      : null,
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    preflightArtifact: toExecutionArtifact(input.preflightArtifact),
    changeSummaryArtifact: toExecutionArtifact(input.changeSummaryArtifact),
    patchArtifact: toExecutionArtifact(input.patchArtifact),
    diffArtifact: toExecutionArtifact(input.diffArtifact),
    builderLogs: input.builderLogs || [],
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'review',
  };
}

module.exports = {
  buildArchitectExecutionRequest,
  buildBuilderLiveMutationExecutionRequest,
  buildBuilderPreflightExecutionRequest,
  buildPlannerExecutionRequest,
  buildReviewerExecutionRequest,
  buildTaskBreakerExecutionRequest,
};
