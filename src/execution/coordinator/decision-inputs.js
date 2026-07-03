'use strict';

const { DECISION_INBOX_SOURCE_TYPE } = require('../../runtime/contracts');

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
    sourceType: DECISION_INBOX_SOURCE_TYPE.DECISION,
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
    sourceType: DECISION_INBOX_SOURCE_TYPE.DECISION,
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
    sourceType: DECISION_INBOX_SOURCE_TYPE.DECISION,
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
    sourceType: DECISION_INBOX_SOURCE_TYPE.DECISION,
  };
}

function buildBuilderLiveMutationDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- builder live mutation requires a human decision before any file write may proceed');
  }

  return {
    title: normalizedResult.decisionTitle || `Builder live mutation decision: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Builder live mutation requires human follow-up before any file write may proceed.',
    blocksTask: true,
    sourceType: DECISION_INBOX_SOURCE_TYPE.DECISION,
  };
}

function buildReviewerDecisionInput(task, parsedReview, normalizedResult, reviewArtifact) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (parsedReview.findings.length > 0) {
    lines.push(...parsedReview.findings.map((finding) => `- ${finding}`));
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (parsedReview.decisionRequired && lines.length === 0) {
    lines.push(`- review artifact ${reviewArtifact.id} requires a human decision`);
  }

  return {
    title: normalizedResult.decisionTitle || `Review follow-up: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      `Review artifact ${reviewArtifact.id} requires a human decision before work may proceed.`,
    blocksTask: true,
    sourceId: reviewArtifact.id,
    sourceType: DECISION_INBOX_SOURCE_TYPE.REVIEW,
  };
}

module.exports = {
  buildArchitectDecisionInput,
  buildBuilderDecisionInput,
  buildBuilderLiveMutationDecisionInput,
  buildPlannerDecisionInput,
  buildReviewerDecisionInput,
  buildTaskBreakerDecisionInput,
  normalizeRoleResult,
};
