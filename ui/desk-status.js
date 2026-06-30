function defaultDisplay(value) {
  return value || '알 수 없음';
}

export function getExecutionDeskStatus(task, { getTaskLifecycleDisplay = defaultDisplay } = {}) {
  if (!task) {
    return '셀 준비 전';
  }

  if (task.flags?.blocked) {
    return '차단';
  }

  if (task.flags?.waitingApproval) {
    return '승인 대기';
  }

  if (task.flags?.waitingDecision) {
    return '결정 대기';
  }

  return getTaskLifecycleDisplay(task.lifecycleState);
}

export function getExecutionDeskNext(task) {
  if (!task) {
    return '실행 셀 생성';
  }

  if (task.flags?.waitingApproval) {
    return '승인선 처리';
  }

  if (task.flags?.waitingDecision) {
    return '결정함 처리';
  }

  if (task.review?.status === 'passed') {
    return '결과 패킷 전달';
  }

  return '작업 지시 계속';
}

export function getDeliverablesDeskStatus(
  task,
  artifact,
  {
    getArtifactTypeDisplay = defaultDisplay,
    getReviewStatusDisplay = defaultDisplay,
  } = {},
) {
  if (artifact) {
    return `${getArtifactTypeDisplay(artifact.type)} 패킷`;
  }

  if (task?.review?.status) {
    return `리뷰 ${getReviewStatusDisplay(task.review.status)}`;
  }

  return '패킷 대기';
}

export function getDeliverablesDeskNext(task, artifact, pendingGateCount) {
  if (!task && !artifact) {
    return '결과 패킷 생성';
  }

  if (pendingGateCount > 0) {
    return '승인선 확인';
  }

  if (task?.review?.status === 'passed' || artifact) {
    return '종료 보고 확인';
  }

  return '리뷰 라인 정리';
}
