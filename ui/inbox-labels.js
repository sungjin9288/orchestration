export function getInboxKindDisplay(kind) {
  if (kind === 'approval') {
    return '승인';
  }

  if (kind === 'decision') {
    return '결정';
  }

  if (kind === 'review') {
    return '리뷰';
  }

  return kind || '알 수 없음';
}

export function getInboxStatusDisplay(status) {
  if (status === 'pending') {
    return '대기중';
  }

  if (status === 'resolved') {
    return '해결됨';
  }

  return status || '알 수 없음';
}

export function getInboxResolutionActionDisplay(action) {
  if (action === 'approve') {
    return '승인';
  }

  if (action === 'reject') {
    return '반려';
  }

  if (action === 'resolve') {
    return '해결';
  }

  return action || '알 수 없음';
}

export function getInboxTone(item) {
  if (item.status === 'resolved') {
    return 'success';
  }

  if (item.blocksTask) {
    return 'danger';
  }

  if (item.kind === 'approval') {
    return 'accent';
  }

  return 'warning';
}
