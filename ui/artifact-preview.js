export function getArtifactMeaningBadge(entry) {
  if (!entry) {
    return null;
  }

  if (entry.retentionTier === 'tier-a-provenance-critical') {
    return { label: '증적 핵심', tone: 'warning' };
  }

  if (entry.retentionTier === 'tier-b-latest-centered-history-retained') {
    return { label: '최신 우선 탐색', tone: 'accent' };
  }

  if (entry.retentionTier === 'tier-c-generic-fallback') {
    return { label: '일반 보존', tone: 'neutral' };
  }

  return null;
}

export function getArtifactPreviewBadge(entry) {
  if (!entry) {
    return null;
  }

  if (entry.previewMode === 'structured-with-raw-fallback') {
    return { label: '구조화 미리보기 + 원문 대체', tone: 'success' };
  }

  if (entry.previewMode === 'raw-only') {
    return { label: '원문만 제공', tone: 'neutral' };
  }

  return null;
}

export function getArtifactTypeDisplay(type) {
  if (type === 'plan') return '계획';
  if (type === 'architecture') return '설계';
  if (type === 'breakdown') return '분해';
  if (type === 'preflight') return 'preflight';
  if (type === 'change-summary') return '변경요약';
  if (type === 'patch') return '패치';
  if (type === 'diff') return 'diff';
  if (type === 'review') return '리뷰';
  if (type === 'commit-package') return '커밋패키지';
  if (type === 'commit-result') return '커밋결과';
  if (type === 'release-package') return '릴리스패키지';
  if (type === 'close-out') return '종료정리';
  if (type === 'output') return '출력';
  return type || '알 수 없음';
}

export function getStructuredPreviewLeadCopy() {
  return '구조화 미리보기는 가능한 범위에서 제공합니다. 아래 저장된 원문이 최종 기준으로 남습니다.';
}

export function getPreviewRedactionCopy() {
  return '미리보기는 파일 업데이트 항목 안의 저장된 저장소 내용을 가립니다. 아래 저장된 원문이 최종 기준으로 남습니다.';
}

export function getStructuredPreviewFallbackCopy() {
  return '이 아티팩트 인스턴스에서는 구조화 미리보기를 만들 수 없습니다. 저장된 원문을 보여줍니다.';
}

export function getRawOnlyPreviewCopy() {
  return '현재 계약에서는 이 아티팩트 타입이 원문 전용입니다. 구조화된 뷰는 만들지 않습니다.';
}
