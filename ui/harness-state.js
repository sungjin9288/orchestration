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
