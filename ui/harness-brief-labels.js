export function getHarnessOutputBriefTypeLabel(type) {
  const labels = {
    command: 'command',
    context: 'context',
    fail: 'fail',
    pass: 'pass',
    warn: 'warn',
  };

  return labels[type] || type || 'context';
}

export function getHarnessBriefSignalValue(brief) {
  if (!brief?.primaryHarnessId) {
    return '대표 하네스 없음';
  }

  return `${brief.primaryHarnessId} · ${brief.actionLabel || 'No action'}`;
}

export function getHarnessBriefActionTone(brief) {
  if (!brief?.primaryHarnessId) {
    return 'neutral';
  }

  if (brief.currentHostState === 'runnable') {
    return 'success';
  }

  if (brief.currentHostState === 'setup-required') {
    return 'warning';
  }

  if (brief.actionLabel === 'Keep blocked') {
    return 'danger';
  }

  return 'neutral';
}

export function getHarnessBriefHostStateLabel(brief) {
  if (!brief?.currentHostState) {
    return '상태 없음';
  }

  if (brief.currentHostState === 'runnable') {
    return '즉시 실행 가능';
  }

  if (brief.currentHostState === 'setup-required') {
    return '설치 검토 필요';
  }

  if (brief.currentHostState === 'deferred') {
    return '후속 검토';
  }

  if (brief.currentHostState === 'blocked') {
    return '정책 차단';
  }

  return brief.currentHostState;
}

export function getHarnessOperatorActionLabel(operatorAction) {
  if (!operatorAction?.kind) {
    return '액션 없음';
  }

  if (operatorAction.kind === 'repo-native-run') {
    return 'Repo-native run';
  }

  if (operatorAction.kind === 'install-review') {
    return 'Install review';
  }

  if (operatorAction.kind === 'deferred') {
    return 'Deferred';
  }

  if (operatorAction.kind === 'blocked') {
    return 'Policy blocked';
  }

  return operatorAction.kind;
}

export function getHarnessOperatorActionTone(operatorAction) {
  if (!operatorAction?.kind || operatorAction.kind === 'none') {
    return 'neutral';
  }

  if (operatorAction.kind === 'repo-native-run') {
    return 'success';
  }

  if (operatorAction.kind === 'install-review' || operatorAction.kind === 'deferred') {
    return 'warning';
  }

  if (operatorAction.kind === 'blocked') {
    return 'danger';
  }

  return 'neutral';
}

export function getHarnessOperatorActionCommand(operatorAction) {
  return operatorAction?.repoNativeCommand || '';
}

export function getHarnessOperatorActionMessage(operatorAction) {
  return operatorAction?.message || '';
}

export function getHarnessOperatorActionDisplayMessage(message) {
  return message || '대표 하네스 액션이 아직 준비되지 않았습니다.';
}
