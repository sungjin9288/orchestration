export function getExecutionRoleDisplay(role) {
  if (role === 'planner') return '기획 셀';
  if (role === 'architect') return '설계 셀';
  if (role === 'task-breaker') return '분해 셀';
  if (role === 'builder-preflight') return '사전점검 셀';
  if (role === 'builder-live-mutation') return '라이브변경 셀';
  if (role === 'reviewer') return '리뷰 셀';
  if (role === 'commit-packager' || role === 'commit-package') return '커밋 정리 셀';
  if (role === 'release-packager' || role === 'release-package') return '릴리스 정리 셀';
  if (role === 'close-out') return '종료 정리 셀';
  if (role === 'none') return '없음';
  return role || '알 수 없음';
}

export function getExecutionStageDisplay(stage) {
  if (stage === 'planner') return '기획 수립';
  if (stage === 'architect') return '설계 정리';
  if (stage === 'task-breaker') return '실행 분해';
  if (stage === 'builder-preflight') return '사전 점검';
  if (stage === 'builder-live-mutation') return '라이브 변경';
  if (stage === 'reviewer') return '리뷰 검토';
  if (stage === 'commit-package') return '커밋 패키지';
  if (stage === 'commit-intent') return '커밋 승인';
  if (stage === 'release-package') return '릴리스 패키지';
  if (stage === 'release-ready') return '릴리스 승인';
  if (stage === 'close-out') return '종료 정리';
  return stage || '알 수 없음';
}

export function getExecutionModeDisplay(mode) {
  if (mode === 'live-mutation') return '라이브변경';
  if (mode === 'commit-package') return '커밋패키지';
  if (mode === 'release-package') return '릴리스패키지';
  if (mode === 'close-out') return '종료정리';
  return mode || '알 수 없음';
}

export function getRunRelationLabelDisplay(label) {
  if (label === 'commit-executor run') return '커밋실행 기록';
  if (label === 'commit-packager run') return '커밋패키저 실행 기록';
  if (label === 'reviewer run') return '리뷰어 실행 기록';
  if (label === 'release-packager run') return '릴리스패키저 실행 기록';
  if (label === 'close-out run') return '종료정리 실행 기록';
  if (label === 'run') return '실행 기록';
  return label || '실행 기록';
}

export function getBooleanDisplay(value) {
  return value ? '예' : '아니오';
}

export function getReviewerVerdictDisplay(verdict) {
  if (verdict === 'pass') return '통과';
  if (verdict === 'fail') return '실패';
  if (verdict === 'changes_requested') return '수정요청';
  return verdict || '알 수 없음';
}

export function getReviewerVerdictTone(verdict) {
  if (verdict === 'pass') return 'success';
  if (verdict === 'fail') return 'danger';
  if (verdict === 'changes_requested') return 'warning';
  return 'neutral';
}

export function getDeliveryStanceDisplay(stance) {
  if (stance === 'local-demo-only') return '로컬데모전용';
  if (stance === 'local-only') return '로컬전용';
  return stance || '알 수 없음';
}

export function getPackageStatusDisplay(status) {
  if (status === 'current') return '현재';
  if (status === 'stale') return '오래됨';
  if (status === 'latest') return '최신';
  if (status === 'missing') return '없음';
  return status || '알 수 없음';
}

export function getProviderReadinessDisplay(status) {
  if (status === 'ready') return '준비됨';
  if (status === 'not-configured') return '미설정';
  if (status === 'error') return '오류';
  if (status === 'unknown') return '알 수 없음';
  return status || '알 수 없음';
}

export function getCommitApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovalStatus || 'none';
}

export function getCloseOutApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovedReleaseApprovalStatus || 'none';
}

export function getApprovalActionLabel(action) {
  if (!action) {
    return null;
  }

  if (action === 'builder-live-mutation') {
    return '라이브 변경';
  }

  if (action === 'commit-intent') {
    return '로컬 커밋';
  }

  if (action === 'release-ready') {
    return '릴리스 패키지';
  }

  return action;
}

export function getApprovalTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'rejected') {
    return 'danger';
  }

  return 'warning';
}

export function getApprovalDisplayTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'rejected') {
    return 'danger';
  }

  if (status === 'stale') {
    return 'warning';
  }

  if (status === 'pending') {
    return 'accent';
  }

  return 'neutral';
}

export function getRunTone(status) {
  return status === 'running' ? 'warning' : 'success';
}

export function getReviewTone(status) {
  if (status === 'passed') {
    return 'success';
  }

  if (status === 'changes_requested') {
    return 'danger';
  }

  return 'warning';
}

export function getTaskLifecycleDisplay(state) {
  if (state === 'Inbox') {
    return '받은함';
  }

  if (state === 'In Progress') {
    return '진행 중';
  }

  if (state === 'Review') {
    return '리뷰';
  }

  if (state === 'Done') {
    return '완료';
  }

  return state || '알 수 없음';
}

export function getTaskLifecycleTone(state) {
  if (state === 'Done') {
    return 'success';
  }

  if (state === 'Review') {
    return 'accent';
  }

  if (state === 'In Progress') {
    return 'warning';
  }

  return 'neutral';
}

export function getMissionStatusTone(status) {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'blocked') {
    return 'danger';
  }

  if (status === 'aligning') {
    return 'warning';
  }

  if (status === 'executing') {
    return 'accent';
  }

  if (status === 'aligned') {
    return 'success';
  }

  return 'neutral';
}

export function getMissionStatusDisplay(status) {
  if (status === 'aligning') {
    return '정렬 중';
  }

  if (status === 'aligned') {
    return '정렬 완료';
  }

  if (status === 'executing') {
    return '실행 중';
  }

  if (status === 'completed') {
    return '완료';
  }

  if (status === 'blocked') {
    return '차단';
  }

  if (status === 'draft') {
    return '초안';
  }

  return status || '알 수 없음';
}

export function getCouncilStatusTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'pending-alignment') {
    return 'warning';
  }

  return 'neutral';
}

export function getCouncilStatusDisplay(status) {
  if (status === 'pending-alignment') {
    return '정렬 대기';
  }

  if (status === 'approved') {
    return '승인됨';
  }

  return status || '알 수 없음';
}

export function getAlignmentTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  return 'warning';
}

export function getAlignmentStatusDisplay(status) {
  if (status === 'approved') {
    return '승인됨';
  }

  if (status === 'pending') {
    return '대기';
  }

  return status || '알 수 없음';
}

export function getEvidenceRailStatusDisplay(status) {
  if (status === 'complete') {
    return '인계 완료';
  }

  if (status === 'current') {
    return '현재 담당';
  }

  if (status === 'blocked') {
    return '보류';
  }

  return '대기';
}

export function getEvidenceRailStatusTone(status) {
  if (status === 'complete') {
    return 'success';
  }

  if (status === 'current') {
    return 'accent';
  }

  if (status === 'blocked') {
    return 'danger';
  }

  return 'neutral';
}

export function getEvidenceRailHandoffDisplay(value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return '없음';
  }

  const directMap = {
    Strategist: 'Strategist',
    Architect: 'Architect',
    Decomposer: 'Decomposer',
    Maker: 'Maker',
    Critic: 'Critic',
    architect: 'Architect',
    builder: 'Maker',
    'builder-live-mutation': '라이브 변경',
    'builder-live-mutation approval': '라이브 변경 승인',
    'builder-preflight': 'Maker',
    'close-out': '종료 정리',
    'commit-intent': '커밋 승인',
    'commit-package': '커밋 패키지',
    'execution cell creation': '실행 셀 생성',
    'human gate': '사람 게이트',
    'release-package': '릴리스 패키지',
    'release-ready': '릴리스 승인',
    reviewer: 'Critic',
    'task-breaker': 'Decomposer',
  };

  return directMap[normalized] || normalized;
}
