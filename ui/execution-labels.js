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
