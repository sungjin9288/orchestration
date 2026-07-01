export function getHarnessExecutionModeLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '정책 리포트' : '실행 결과';
}

export function getHarnessExecutionResultTitle(execution) {
  return execution?.actionMode === 'policy-report' ? '최근 정책 리포트' : '최근 실행 결과';
}

export function getHarnessExecutionHideActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '리포트 숨기기' : '결과 숨기기';
}

export function getHarnessExecutionShowActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '리포트 다시 보기' : '결과 다시 보기';
}

export function getHarnessExecutionBriefActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '리포트 요약' : '출력 요약';
}

export function getHarnessExecutionBriefCopyActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '리포트 요약 복사' : '요약 복사';
}

export function getHarnessExecutionBriefCopyStatusLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '리포트 요약' : '출력 요약';
}

export function getHarnessExecutionBriefCopyTitle(execution) {
  return `하네스 ${getHarnessExecutionBriefCopyStatusLabel(execution)}`;
}

export function getHarnessExecutionOutputLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '출력 예정' : '출력';
}

export function getHarnessExecutionOutputPathActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '출력 예정 경로' : '출력 경로';
}

export function getHarnessExecutionRerunActionLabel(execution) {
  return execution?.actionMode === 'policy-report' ? '같은 경로 정책 리포트' : '같은 경로 재실행';
}

export function getHarnessExecutionPathHandoffLabel(execution) {
  const hasInputPath = Boolean(execution?.resolvedInputPath || execution?.inputPath);
  const hasOutputPath = Boolean(execution?.resolvedOutputPath || execution?.outputPath);

  if (hasInputPath && hasOutputPath) {
    return `입력/${getHarnessExecutionOutputPathActionLabel(execution)}`;
  }
  if (hasInputPath) {
    return '입력 경로';
  }
  if (hasOutputPath) {
    return getHarnessExecutionOutputPathActionLabel(execution);
  }

  return '';
}

export function getHarnessExecutionResultKey(execution) {
  if (!execution?.harnessId) {
    return null;
  }

  return [
    execution.projectId || '',
    execution.harnessId || '',
    execution.requestId || execution.executionId || '',
    execution.executedAt || '',
    execution.resolvedInputPath || execution.inputPath || '',
    execution.resolvedOutputPath || execution.outputPath || '',
  ].join('::');
}

export function formatHarnessPolicyReportForCopy(payload) {
  if (!payload) {
    return '';
  }

  const pathPolicy = payload.pathPolicy || {};
  const markitdown = payload.markitdown || {};

  return [
    '하네스 정책 리포트',
    `입력 확인: ${payload.input?.exists ? '파일 있음' : '파일 없음'} · ${String(payload.input?.sizeBytes ?? 0)} bytes`,
    `출력 예정: ${payload.output?.wouldWrite ? payload.output.resolvedPath || '경로 미지정' : '출력 파일 없음'}`,
    `권한 정책: ${pathPolicy.readsWithCurrentProcessPrivileges ? '현재 프로세스 권한으로 읽음' : '권한 정책 미확인'}`,
    `실행 방식: ${pathPolicy.executesConversion ? '변환 실행' : 'no-write preflight'}`,
    `CLI 상태: ${markitdown.available ? 'markitdown 사용 가능' : 'markitdown 미설치 또는 확인 실패'}`,
    pathPolicy.guidance ? `안내: ${pathPolicy.guidance}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
