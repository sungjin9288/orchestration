import {
  getArtifactTypeDisplay,
} from './artifact-preview.js';
import {
  getApprovalActionLabel,
  getApprovalStatusDisplay,
  getApprovalTone,
  getReviewStatusDisplay,
  getReviewTone,
  getRunStatusDisplay,
  getRunTone,
  getTaskLifecycleDisplay,
} from './execution-labels.js';
import { formatDate } from './formatters.js';
import {
  getInboxKindDisplay,
  getInboxStatusDisplay,
  getInboxTone,
} from './inbox-labels.js';
import { getArtifactCatalogEntry, renderArtifactPolicyTokens } from './artifact-preview.js';
import { createToken } from './formatters.js';
import { getTaskApprovalSummary, getTaskDecisionSummary } from './task-summaries.js';

export function getTaskboardTaskSnapshot(task, data) {
  if (!task) {
    return {
      currentCopy: '아직 실행 셀이 없습니다.',
      nextCopy: data.activeProject ? '다음: 새 실행 셀 추가' : '다음: 프로젝트 선택',
      tokens: [createToken('실행셀:없음', 'warning')],
    };
  }

  const approvalSummary = getTaskApprovalSummary(task, data.approvals);
  const decisionSummary = getTaskDecisionSummary(task, data.inboxItems);
  const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
  const currentCopy = task.flags?.blocked
    ? '현재 차단 해소가 먼저 필요한 실행 셀입니다.'
    : task.flags?.waitingApproval
      ? '현재 사람 승인선을 기다리는 실행 셀입니다.'
      : task.flags?.waitingDecision
        ? '현재 결정을 기다리는 실행 셀입니다.'
        : latestRun
          ? `현재 ${getRunStatusDisplay(latestRun.status)} 이후 후속 실행을 이어갈 수 있습니다.`
          : '현재 첫 실행을 아직 시작하지 않은 셀입니다.';
  const nextCopy = task.flags?.waitingApproval
    ? '다음: 결재함에서 승인 처리'
    : task.flags?.waitingDecision
      ? '다음: 결재함에서 결정 처리'
      : task.flags?.blocked
        ? '다음: 작업판 상세에서 보류 사유 확인'
        : latestRun
          ? '다음: 작업판 상세에서 후속 실행 확인'
          : '다음: 작업판 상세에서 플래너 실행';

  return {
    currentCopy,
    nextCopy,
    tokens: [
      createToken(`리뷰:${getReviewStatusDisplay(task.review?.status || 'pending')}`, getReviewTone(task.review?.status)),
      approvalSummary.pending > 0 ? createToken(`승인:${approvalSummary.pending}`, 'accent') : '',
      decisionSummary.pendingTotal > 0 ? createToken(`결정:${decisionSummary.pendingTotal}`, 'warning') : '',
      latestRun ? createToken(`run:${getRunStatusDisplay(latestRun.status)}`, getRunTone(latestRun.status)) : '',
    ].filter(Boolean),
  };
}

export function getRunListSnapshot(run, task, data) {
  const approvalSummary = task ? getTaskApprovalSummary(task, data.approvals) : { pending: 0 };
  const decisionSummary = task ? getTaskDecisionSummary(task, data.inboxItems) : { pendingTotal: 0 };

  let currentCopy = `${getRunStatusDisplay(run.status)} 상태의 실행 보고입니다.`;
  if (task?.flags?.waitingApproval) {
    currentCopy = '승인선 직전 상태를 남긴 실행 보고입니다.';
  } else if (task?.flags?.waitingDecision) {
    currentCopy = '결정 처리 직전 상태를 남긴 실행 보고입니다.';
  } else if (task?.flags?.blocked) {
    currentCopy = '차단 사유를 먼저 봐야 하는 실행 보고입니다.';
  } else if (run.status === 'running') {
    currentCopy = '현재 진행 중인 실행 보고입니다.';
  } else if (run.status === 'failed') {
    currentCopy = '실패 원인 확인이 먼저 필요한 실행 보고입니다.';
  }

  let nextCopy = '다음: 원문 로그 확인';
  if (task?.flags?.waitingApproval) {
    nextCopy = '다음: 승인선과 로그 상세 확인';
  } else if (task?.flags?.waitingDecision) {
    nextCopy = '다음: 결재함과 로그 상세 확인';
  } else if (task?.flags?.blocked) {
    nextCopy = '다음: 차단 이유와 로그 상세 확인';
  } else if (run.status === 'failed') {
    nextCopy = '다음: 원문 로그와 연결 증적 확인';
  } else if (run.status === 'running') {
    nextCopy = '다음: 진행 로그와 최근 출력 확인';
  }

  return {
    title: task?.title || run.id,
    metaCopy: `${run.id} · ${task ? getTaskLifecycleDisplay(task.lifecycleState) : '실행 셀 대기'}`,
    currentCopy,
    nextCopy,
    tokens: [
      createToken(getRunStatusDisplay(run.status), getRunTone(run.status)),
      approvalSummary.pending > 0 ? createToken(`승인:${approvalSummary.pending}`, 'accent') : '',
      decisionSummary.pendingTotal > 0 ? createToken(`결정:${decisionSummary.pendingTotal}`, 'warning') : '',
      createToken(formatDate(run.startedAt), 'neutral'),
    ].filter(Boolean),
  };
}

export function getArtifactListSnapshot(artifact, task, data) {
  const previewMode = getArtifactCatalogEntry(artifact, data)?.previewMode || 'structured-or-raw';
  const typeDisplay = getArtifactTypeDisplay(artifact.type);

  let currentCopy = `${typeDisplay} 기준 증적입니다.`;
  if (artifact.type === 'preflight') {
    currentCopy = '실행 전 범위와 점검 기준을 묶은 증적입니다.';
  } else if (artifact.type === 'review') {
    currentCopy = '리뷰 판단과 후속 실행을 묶는 핵심 증적입니다.';
  } else if (artifact.type === 'commit-package' || artifact.type === 'release-package') {
    currentCopy = '승인선과 다음 후속을 묶는 보고 증적입니다.';
  } else if (task) {
    currentCopy = `${getTaskLifecycleDisplay(task.lifecycleState)} 상태 실행 셀에 연결된 ${typeDisplay}입니다.`;
  }

  const nextCopy =
    previewMode === 'raw-only' ? '다음: 원문만 바로 확인' : '다음: 미리보기와 원문 확인';

  return {
    title: typeDisplay,
    metaCopy: `${task?.title || artifact.id} · ${artifact.id}`,
    currentCopy,
    nextCopy,
    tokens: [
      renderArtifactPolicyTokens(artifact, data),
      createToken(`run:${artifact.runId}`, 'neutral'),
      createToken(formatDate(artifact.createdAt), 'neutral'),
    ].filter(Boolean),
  };
}

export function getInboxListSnapshot(item, task, approval, evidenceRail = null) {
  let currentCopy = `${getInboxStatusDisplay(item.status)} 상태의 결재 안건입니다.`;
  if (item.status === 'resolved') {
    currentCopy = '이미 처리돼 기록만 확인하면 되는 안건입니다.';
  } else if (item.kind === 'approval') {
    currentCopy = '사람 승인 판단이 남아 있는 결재 안건입니다.';
  } else if (item.kind === 'decision') {
    currentCopy = '해결 판단이 남아 있는 결재 안건입니다.';
  }

  let nextCopy = '다음: 처리 메모 확인';
  if (item.status === 'pending' && item.kind === 'approval') {
    nextCopy = '다음: 승인 또는 반려 검토';
  } else if (item.status === 'pending' && item.kind === 'decision') {
    nextCopy = '다음: 해결 처리 검토';
  } else if (item.status === 'pending') {
    nextCopy = '다음: 결재 상세 확인';
  }

  if (evidenceRail) {
    const currentCheckpoint =
      evidenceRail.checkpoints?.find((checkpoint) => checkpoint.currentOwner) || null;

    if (currentCheckpoint?.blockedReason) {
      currentCopy = currentCheckpoint.blockedReason;
    } else if (currentCheckpoint) {
      currentCopy = [currentCheckpoint.title, currentCheckpoint.evidenceLabel, currentCheckpoint.evidenceMeta]
        .filter(Boolean)
        .join(' · ');
    } else if (evidenceRail.blockedReason) {
      currentCopy = evidenceRail.blockedReason;
    }

    nextCopy = `다음 인계: ${evidenceRail.nextHandoffLabel || '없음'}`;
  }

  return {
    title: item.title,
    metaCopy: task
      ? `${task.title} · ${getTaskLifecycleDisplay(task.lifecycleState)}`
      : `${item.taskId} · 실행 셀 대기`,
    currentCopy,
    nextCopy,
    tokens: [
      createToken(getInboxKindDisplay(item.kind), getInboxTone(item)),
      createToken(
        getInboxStatusDisplay(item.status),
        item.status === 'pending' ? 'warning' : 'success',
      ),
      item.blocksTask ? createToken('태스크차단', 'danger') : '',
      approval ? createToken(`범위:${approval.scope}`, 'neutral') : '',
    ].filter(Boolean),
  };
}

export function getLogsDetailSnapshot(selectedRun, selectedTask, runBundle, logs = []) {
  const currentTitle = selectedRun ? `${getRunStatusDisplay(selectedRun.status)} 실행 기록` : '기록 선택 대기';
  const currentCopy = selectedRun
    ? `${formatDate(selectedRun.startedAt)} 기준으로 기록된 실행 보고입니다.`
    : '왼쪽 목록에서 실행 기록을 고르면 현재 실행 상태를 먼저 판단할 수 있습니다.';

  let reasonTitle = selectedTask ? selectedTask.title : '실행 셀 맥락 대기';
  let reasonCopy = selectedTask
    ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀과 연결돼 있습니다.`
    : '아직 연결된 실행 셀 맥락이 보이지 않습니다.';

  if (selectedTask?.flags?.waitingApproval) {
    reasonCopy = '사람 승인선을 기다리는 실행 셀과 연결된 실행 기록입니다.';
  } else if (selectedTask?.flags?.waitingDecision) {
    reasonCopy = '결정함 처리 결과를 기다리는 실행 셀과 연결된 실행 기록입니다.';
  } else if (selectedTask?.flags?.blocked) {
    reasonCopy = '차단 사유를 먼저 해소해야 하는 실행 셀과 연결된 실행 기록입니다.';
  }

  const nextTitle = selectedRun ? '연결선과 원문 확인' : '기록 먼저 고르기';
  const nextCopy = selectedRun
    ? `${runBundle ? '보고 연결선과 ' : ''}${logs.length > 0 ? `${logs.length}줄 실행 원문` : '원문 로그 없음'}을 아래에서 바로 확인합니다.`
    : '실행 기록을 고르면 기록 시각, 연결선, 원문 로그가 아래에 열립니다.';

  return {
    currentTitle,
    currentCopy,
    reasonTitle,
    reasonCopy,
    nextTitle,
    nextCopy,
    tokens: [
      selectedRun ? createToken(getRunStatusDisplay(selectedRun.status), getRunTone(selectedRun.status)) : '',
      selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : '',
      selectedTask?.review
        ? createToken(
            `리뷰:${getReviewStatusDisplay(selectedTask.review.status)}`,
            getReviewTone(selectedTask.review.status),
          )
        : '',
      selectedTask?.flags?.blocked ? createToken('차단', 'danger') : '',
      selectedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
      selectedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
    ].filter(Boolean),
  };
}

export function getArtifactDetailSnapshot(selectedArtifactMeta, selectedArtifactTask, data, policySummary = '') {
  const currentTitle = selectedArtifactMeta
    ? `${getArtifactTypeDisplay(selectedArtifactMeta.type)} 묶음`
    : '증적 선택 대기';
  const currentCopy = selectedArtifactMeta
    ? `${selectedArtifactMeta.id}이 ${formatDate(selectedArtifactMeta.createdAt)} 기준으로 보관돼 있습니다.`
    : '왼쪽 목록에서 증적을 고르면 현재 상태와 원문 확인 흐름이 먼저 열립니다.';
  const reasonTitle = selectedArtifactTask ? selectedArtifactTask.title : '실행 셀 맥락 대기';
  const reasonCopy = selectedArtifactTask
    ? `${getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState)} 상태의 실행 셀에 연결된 증적입니다.${policySummary ? ` ${policySummary}` : ''}`
    : policySummary || '아직 연결된 실행 셀 맥락이 보이지 않습니다.';
  const nextTitle = selectedArtifactMeta ? '미리보기와 원문 확인' : '증적 먼저 고르기';
  const nextCopy = selectedArtifactMeta
    ? '증적 연결선, 보고 미리보기, 보관 원문을 아래에서 순서대로 확인합니다.'
    : '증적을 고르면 연결선과 구조화 미리보기, 저장 원문이 아래에 열립니다.';

  return {
    currentTitle,
    currentCopy,
    reasonTitle,
    reasonCopy,
    nextTitle,
    nextCopy,
    tokens: [
      selectedArtifactMeta ? createToken(getArtifactTypeDisplay(selectedArtifactMeta.type), 'neutral') : '',
      selectedArtifactMeta ? renderArtifactPolicyTokens(selectedArtifactMeta, data) : '',
      selectedArtifactTask ? createToken(getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState), 'neutral') : '',
      selectedArtifactTask?.review
        ? createToken(
            `리뷰:${getReviewStatusDisplay(selectedArtifactTask.review.status)}`,
            getReviewTone(selectedArtifactTask.review.status),
          )
        : '',
    ].filter(Boolean),
  };
}

export function getInboxDetailSnapshot(selectedItem, selectedTask, selectedApproval) {
  const currentTitle = selectedItem
    ? `${getInboxStatusDisplay(selectedItem.status)} ${getInboxKindDisplay(selectedItem.kind)}`
    : '결재 선택 대기';
  const currentCopy = selectedItem
    ? `${selectedItem.title} 안건을 현재 처리 중입니다.`
    : '왼쪽 목록에서 결재를 고르면 현재 상태와 다음 처리만 먼저 판단할 수 있습니다.';

  let reasonTitle = selectedTask ? selectedTask.title : selectedItem?.taskId || '영향 실행 셀 대기';
  let reasonCopy = selectedTask
    ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀에 영향을 줍니다.`
    : '아직 연결된 실행 셀 맥락이 보이지 않습니다.';

  if (selectedApproval) {
    reasonCopy = `${getApprovalActionLabel(selectedApproval.allowedNextAction) || selectedApproval.scope} 결재가 ${getApprovalStatusDisplay(selectedApproval.status)} 상태입니다.`;
  } else if (selectedItem?.blocksTask) {
    reasonCopy = '이 안건은 처리 전까지 연결 실행 셀을 계속 차단합니다.';
  }

  let nextTitle = '결재 먼저 고르기';
  let nextCopy = '항목을 고르면 영향 실행 셀과 처리 메모가 아래에 열립니다.';

  if (selectedItem?.status === 'pending' && selectedItem.kind === 'approval') {
    nextTitle = '승인 또는 반려';
    nextCopy = '아래 처리 블록에서 승인 또는 반려를 바로 결정합니다.';
  } else if (selectedItem?.status === 'pending' && selectedItem.kind === 'decision') {
    nextTitle = '해결 처리';
    nextCopy = '아래 처리 블록에서 해결 처리와 메모를 남깁니다.';
  } else if (selectedItem) {
    nextTitle = '처리 메모 확인';
    nextCopy = '아래 처리 메모와 결재 기록을 확인합니다.';
  }

  return {
    currentTitle,
    currentCopy,
    reasonTitle,
    reasonCopy,
    nextTitle,
    nextCopy,
    tokens: [
      selectedItem ? createToken(getInboxKindDisplay(selectedItem.kind), getInboxTone(selectedItem)) : '',
      selectedItem
        ? createToken(
            getInboxStatusDisplay(selectedItem.status),
            selectedItem.status === 'pending' ? 'warning' : 'success',
          )
        : '',
      selectedItem?.blocksTask ? createToken('태스크차단', 'danger') : '',
      selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : '',
      selectedApproval
        ? createToken(
            `결재:${getApprovalStatusDisplay(selectedApproval.status)}`,
            getApprovalTone(selectedApproval.status),
          )
        : '',
    ].filter(Boolean),
  };
}
