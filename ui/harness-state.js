import { getHarnessExecutionResultKey } from './harness-labels.js';

export function getHarnessConsumerBrief(data) {
  const payload = data?.derived?.harnessConsumerBrief;

  if (payload?.ok === true && payload.mode === 'harness-consumer-brief' && payload.brief) {
    return payload.brief;
  }

  return null;
}

export function getHarnessConsumerStatus(data) {
  const payload = data?.derived?.harnessConsumerStatus;

  if (
    payload?.ok === true &&
    payload.mode === 'harness-consumer-status' &&
    payload.statusCard &&
    payload.operatorAction
  ) {
    return payload;
  }

  return null;
}

export function getLatestHarnessExecution(data, statusPayload, localHarnessExecution = null) {
  const snapshot = data?.snapshot || {};
  const activeProjectId = snapshot.activeProjectId || null;
  const representativeHarnessId = statusPayload?.statusCard?.primaryHarnessId || null;
  const derivedLatestHarnessExecution = data?.derived?.latestHarnessExecution || null;

  for (const candidate of [localHarnessExecution, derivedLatestHarnessExecution]) {
    if (!candidate?.harnessId || !representativeHarnessId) {
      continue;
    }

    if (candidate.harnessId !== representativeHarnessId) {
      continue;
    }

    if ((candidate.projectId || null) !== activeProjectId) {
      continue;
    }

    return candidate;
  }

  return null;
}

export function isHarnessExecutionResultHidden(execution, hiddenExecutionResultKey = null) {
  const executionKey = getHarnessExecutionResultKey(execution);

  return Boolean(executionKey && hiddenExecutionResultKey && hiddenExecutionResultKey === executionKey);
}

export function hasHarnessExecutionHistory(execution, recentExecutions, statusPayload) {
  const representativeHarnessId = statusPayload?.statusCard?.primaryHarnessId || null;

  return Boolean(
    (execution?.harnessId && execution.harnessId === representativeHarnessId) ||
      (Array.isArray(recentExecutions) && recentExecutions.length > 0),
  );
}

export function getRecentHarnessExecutions(data, statusPayload) {
  const snapshot = data?.snapshot || {};
  const activeProjectId = snapshot.activeProjectId || null;
  const representativeHarnessId = statusPayload?.statusCard?.primaryHarnessId || null;
  const recentHarnessExecutions = Array.isArray(data?.derived?.recentHarnessExecutions)
    ? data.derived.recentHarnessExecutions
    : [];

  if (!representativeHarnessId) {
    return [];
  }

  return recentHarnessExecutions.filter((candidate) => {
    if (!candidate?.harnessId) {
      return false;
    }

    if (candidate.harnessId !== representativeHarnessId) {
      return false;
    }

    return (candidate.projectId || null) === activeProjectId;
  });
}
