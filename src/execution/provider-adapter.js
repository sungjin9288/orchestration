'use strict';

function normalizeResultDetails(result) {
  const details = result && typeof result === 'object' ? result : {};

  return {
    blockers: Array.isArray(details.blockers)
      ? details.blockers.map((value) => String(value || '').trim()).filter(Boolean)
      : [],
    needsDecision: Boolean(details.needsDecision),
    nextStage:
      typeof details.nextStage === 'string' && details.nextStage.trim().length > 0
        ? details.nextStage.trim()
        : null,
    summary:
      typeof details.summary === 'string' && details.summary.trim().length > 0
        ? details.summary.trim()
        : '',
    decisionTitle:
      typeof details.decisionTitle === 'string' && details.decisionTitle.trim().length > 0
        ? details.decisionTitle.trim()
        : '',
    decisionPrompt:
      typeof details.decisionPrompt === 'string' && details.decisionPrompt.trim().length > 0
        ? details.decisionPrompt.trim()
        : '',
  };
}

function assertExecutionRequest(request) {
  if (!request || typeof request !== 'object') {
    throw new Error('Execution request is required');
  }

  if (!request.role) {
    throw new Error('Execution request role is required');
  }

  if (!request.project || !request.project.projectPath) {
    throw new Error('Execution request project_path is required');
  }
}

async function executeWithAdapter(adapter, request, context = {}) {
  assertExecutionRequest(request);

  if (!adapter || typeof adapter.execute !== 'function') {
    throw new Error('Provider adapter execute(request) is required');
  }

  const response = await adapter.execute(request, {
    project: context.project || null,
    providerConfig: context.providerConfig || null,
    role: request.role,
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Provider adapter must return an object response');
  }

  if (typeof response.outputText !== 'string' || response.outputText.trim().length === 0) {
    throw new Error('Provider adapter response outputText is required');
  }

  return {
    adapterName: adapter.name || 'unknown-adapter',
    model: response.model || null,
    outputText: response.outputText,
    providerRunId: response.providerRunId || null,
    normalizedResult: normalizeResultDetails(response.normalizedResult),
    usage: response.usage || null,
  };
}

module.exports = {
  executeWithAdapter,
};
