import { getArtifactTypeDisplay } from './artifact-preview.js';
import { getExecutionDeskNext } from './desk-status.js';
import {
  getAlignmentStatusDisplay,
  getAlignmentTone,
  getApprovalStatusDisplay,
  getApprovalTone,
  getEvidenceRailStatusDisplay,
  getEvidenceRailStatusTone,
  getExecutionRoleDisplay,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getReviewStatusDisplay,
  getReviewTone,
  getRunStatusDisplay,
  getTaskLifecycleDisplay,
} from './execution-labels.js';
import { createToken, escapeHtml } from './formatters.js';
import { getSurfaceDisplayName } from './surface-config.js';
import {
  getLatestTaskArtifact,
  getPrimaryBlockedReason,
  getTaskApprovals,
  getTaskApprovalSummary,
  getTaskArtifacts,
  sortByCreatedDesc,
} from './task-summaries.js';

export function getMissionHandoffState({ mission = null, councilSession = null, linkedTask = null } = {}) {
  if (!mission) {
    return {
      action: { label: '신규 안건 등록', targetSurface: 'mission' },
      copy: '첫 안건을 먼저 등록합니다.',
      current: '안건 대기',
      evidence: 'mission pending',
      next: '신규 안건 등록',
      title: '신규 안건 등록',
    };
  }

  if (!councilSession) {
    return {
      action: { label: '회의 초안', targetSurface: 'council' },
      copy: '안건이 등록됐으므로 보이는 추천안과 정렬 지점을 먼저 엽니다.',
      current: getMissionStatusDisplay(mission.status),
      evidence: mission.id,
      next: '회의 초안 작성',
      title: '회의 초안',
    };
  }

  const alignmentStatus = councilSession.alignment?.status || 'pending';

  if (alignmentStatus !== 'approved') {
    return {
      action: { label: '협의회 정렬', targetSurface: 'council' },
      copy: '추천안은 보이지만 정렬 승인이 끝나야 실행 인계가 열립니다.',
      current: getAlignmentStatusDisplay(alignmentStatus),
      evidence: councilSession.id,
      next: '협의회 정렬',
      title: '협의회 정렬',
    };
  }

  if (!linkedTask) {
    return {
      action: { label: '실행 셀 연결', targetSurface: 'mission' },
      copy: 'Council 정렬은 끝났고, 기존 Mission action으로 연결 실행 셀을 만듭니다.',
      current: '정렬 승인 완료',
      evidence: councilSession.id,
      next: '실행 셀 연결',
      title: '실행 셀 연결',
    };
  }

  return {
    action: { label: '실행 데스크', targetSurface: 'execution' },
    copy: '연결 실행 셀이 있으므로 기존 Execution surface로 다음 게이트를 넘깁니다.',
    current: getTaskLifecycleDisplay(linkedTask.lifecycleState),
    evidence: linkedTask.id,
    next: getExecutionDeskNext(linkedTask),
    title: '실행 인계',
  };
}

export function getMissionFirstRunHandoff(mission, data) {
  const councilSession =
    mission?.councilSessionId && data.councilSessionMap.has(mission.councilSessionId)
      ? data.councilSessionMap.get(mission.councilSessionId)
      : null;
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  return getMissionHandoffState({ mission, councilSession, linkedTask });
}

export function getMissionLoopStatus(mission, previews = {}) {
  const councilSession = previews.council?.councilSession || null;
  const linkedTask = previews.execution?.linkedTask || previews.completion?.linkedTask || null;
  const completionReady = Boolean(previews.completion?.completionReady);
  const latestRun = previews.execution?.latestRun || null;
  const latestReviewStatus = previews.deliverables?.latestReviewStatus || 'none';
  const hasDeliverableArtifact = Boolean(previews.deliverables?.currentDeliverableArtifact);

  if (!mission) {
    return {
      stage: 'discover',
      stageLabel: 'Discover',
      stopCondition: '안건 선택 전',
      stopTone: 'warning',
      controlCopy: '안건이 선택되기 전에는 루프가 열리지 않습니다.',
      returnPoint: 'Mission에서 안건을 먼저 선택합니다.',
    };
  }

  if (!councilSession) {
    return {
      stage: 'discover',
      stageLabel: 'Discover',
      stopCondition: '회의 초안 필요',
      stopTone: 'warning',
      controlCopy: '목표와 경계를 확인했지만 아직 Council 추천안이 없어 실행 루프로 넘기지 않습니다.',
      returnPoint: 'Mission에서 회의 초안을 열어 사람에게 보이는 정렬 지점을 만듭니다.',
    };
  }

  if (councilSession.alignment?.status !== 'approved') {
    return {
      stage: 'plan',
      stageLabel: 'Plan',
      stopCondition: '결론 승인 필요',
      stopTone: 'accent',
      controlCopy: 'Council이 추천안과 이견을 정리하는 단계이며, 승인 전에는 실행으로 넘어가지 않습니다.',
      returnPoint: 'Council 승인 선반에서 결론을 승인하거나 안건을 다시 다듬습니다.',
    };
  }

  if (!linkedTask) {
    return {
      stage: 'plan',
      stageLabel: 'Plan',
      stopCondition: '실행 셀 연결 필요',
      stopTone: 'warning',
      controlCopy: 'Council 결론은 승인됐지만 연결된 실행 셀이 없어 루프가 실행으로 전진하지 않습니다.',
      returnPoint: 'Mission에서 실행 셀을 연결한 뒤 Execution으로 넘깁니다.',
    };
  }

  if (completionReady) {
    return {
      stage: 'iterate',
      stageLabel: 'Iterate',
      stopCondition: '루프 종료됨',
      stopTone: 'success',
      controlCopy: '종료 정리 아티팩트가 저장되어 이 루프는 닫혔고, 다음 안건 준비만 남았습니다.',
      returnPoint: 'Mission에서 다음 안건을 준비하거나 저장된 Deliverables를 확인합니다.',
    };
  }

  if (linkedTask.flags?.waitingApproval) {
    return {
      stage: 'execute',
      stageLabel: 'Execute',
      stopCondition: '사람 승인 대기',
      stopTone: 'accent',
      controlCopy: '실행 루프는 현재 human approval gate에서 멈춰 있으며 승인 전 자동 전진하지 않습니다.',
      returnPoint: 'Decision Inbox 또는 Execution 승인선에서 현재 승인 항목을 처리합니다.',
    };
  }

  if (linkedTask.flags?.waitingDecision) {
    return {
      stage: 'plan',
      stageLabel: 'Plan',
      stopCondition: '사람 결정 대기',
      stopTone: 'warning',
      controlCopy: '미해결 결정이 남아 있어 계획 또는 범위를 다시 확인해야 합니다.',
      returnPoint: 'Decision Inbox에서 결정 항목을 해결한 뒤 같은 단계로 돌아옵니다.',
    };
  }

  if (linkedTask.flags?.blocked || previews.execution?.executionBlocked) {
    return {
      stage: 'execute',
      stageLabel: 'Execute',
      stopCondition: '차단 사유 확인',
      stopTone: 'danger',
      controlCopy: previews.execution?.blockedReason || '차단 사유가 남아 있어 루프가 멈춰 있습니다.',
      returnPoint: 'Execution에서 차단 근거를 확인하고 필요한 경우 Council 또는 Mission으로 되돌립니다.',
    };
  }

  if (latestReviewStatus === 'passed' && hasDeliverableArtifact) {
    return {
      stage: 'verify',
      stageLabel: 'Verify',
      stopCondition: '결과 검증 완료',
      stopTone: 'success',
      controlCopy: '리뷰와 결과 패킷이 준비되어 release/close-out follow-up 판단으로 넘어갈 수 있습니다.',
      returnPoint: 'Deliverables에서 검증 증적과 후속 승인선을 확인합니다.',
    };
  }

  return {
    stage: latestRun ? 'execute' : 'plan',
    stageLabel: latestRun ? 'Execute' : 'Plan',
    stopCondition: latestRun ? '다음 게이트 확인' : '실행 시작 전',
    stopTone: latestRun ? 'neutral' : 'warning',
    controlCopy: latestRun
      ? previews.execution?.stagePreview || '가장 최근 실행 기록을 기준으로 다음 게이트를 확인합니다.'
      : 'Council 결론 뒤 실행을 시작하기 전 단계입니다.',
    returnPoint: latestRun
      ? 'Execution에서 최신 run과 현재 게이트를 확인합니다.'
      : 'Execution에서 첫 실행 지시를 시작합니다.',
  };
}

export function renderExecutionEvidenceRail(rail, options = {}) {
  if (!rail) {
    return '';
  }

  const compact = Boolean(options.compact);
  const eyebrow = options.eyebrow || '증적 인계선';
  const heading = options.heading || '회의 역할과 실행 증적을 같은 선으로 묶습니다';
  const copy =
    options.copy || '이 인계선은 현재 태스크, 실행 기록, 증적, 준비도, 리뷰 기준만 읽습니다.';
  const railClassName = `relation-strip evidence-rail${compact ? ' evidence-rail-compact' : ''}`;

  return `
    <section class="${railClassName}">
      <div class="evidence-rail-head">
        <div>
          <p class="detail-key evidence-rail-eyebrow">${escapeHtml(eyebrow)}</p>
          <strong class="evidence-rail-heading">${escapeHtml(heading)}</strong>
          <p class="detail-copy detail-copy-compact evidence-rail-copy">${escapeHtml(copy)}</p>
        </div>
        <div class="token-row token-row-compact">
          ${createToken(`현재:${rail.currentOwnerLabel}`, rail.blockedReason ? 'danger' : 'accent')}
          ${createToken(`다음:${rail.nextHandoffLabel}`, 'neutral')}
          ${rail.blockedReason ? createToken('보류사유 있음', 'danger') : createToken('읽기전용', 'neutral')}
        </div>
      </div>
      ${
        rail.blockedReason
          ? `<p class="detail-copy detail-copy-compact evidence-rail-blocked-copy">${escapeHtml(rail.blockedReason)}</p>`
          : ''
      }
      <div class="evidence-rail-grid">
        ${rail.checkpoints
          .map(
            (checkpoint) => `
              <article class="evidence-rail-card evidence-rail-card-${checkpoint.status}${
                checkpoint.currentOwner ? ' evidence-rail-card-owner' : ''
              }${checkpoint.nextHandoff ? ' evidence-rail-card-next' : ''}">
                <div class="card-title-row card-title-row-tight evidence-rail-card-head">
                  <strong class="evidence-rail-card-title">${escapeHtml(checkpoint.title)}</strong>
                  ${createToken(
                    getEvidenceRailStatusDisplay(checkpoint.status),
                    getEvidenceRailStatusTone(checkpoint.status),
                  )}
                  ${checkpoint.currentOwner ? createToken('현재', checkpoint.status === 'blocked' ? 'danger' : 'accent') : ''}
                  ${checkpoint.nextHandoff ? createToken('다음', 'neutral') : ''}
                </div>
                <p class="evidence-rail-card-subtitle">${escapeHtml(checkpoint.subtitle)}</p>
                <p class="detail-copy detail-copy-compact evidence-rail-card-evidence">${escapeHtml(checkpoint.evidenceLabel)}</p>
                ${
                  checkpoint.evidenceMeta
                    ? `<p class="detail-copy detail-copy-compact evidence-rail-card-meta">${escapeHtml(checkpoint.evidenceMeta)}</p>`
                    : ''
                }
                ${
                  checkpoint.note
                    ? `<p class="detail-copy detail-copy-compact evidence-rail-card-note">${escapeHtml(checkpoint.note)}</p>`
                    : ''
                }
                ${
                  checkpoint.blockedReason
                    ? `<p class="detail-copy detail-copy-compact evidence-rail-card-blocked">${escapeHtml(checkpoint.blockedReason)}</p>`
                    : ''
                }
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function getMissionDeliverablesPreview(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  if (!linkedTask) {
    return {
      approvalSummary: { approved: 0, pending: 0, rejected: 0, total: 0 },
      currentDeliverableArtifact: null,
      latestApproval: null,
      latestReviewStatus: 'pending',
      linkedTask,
      previewLine: '연결된 태스크가 아직 없어서 산출물도 없습니다.',
    };
  }

  const taskArtifacts = getTaskArtifacts(linkedTask.id, data.artifacts).sort(sortByCreatedDesc);
  const taskApprovals = getTaskApprovals(linkedTask.id, data.approvals).sort(sortByCreatedDesc);
  const latestArtifact = taskArtifacts[0] || null;
  const latestPlanArtifact = getLatestTaskArtifact(linkedTask, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(linkedTask, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(linkedTask, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(linkedTask, data, 'preflight');
  const latestChangeSummaryArtifact = getLatestTaskArtifact(linkedTask, data, 'change-summary');
  const latestPatchArtifact = getLatestTaskArtifact(linkedTask, data, 'patch');
  const latestDiffArtifact = getLatestTaskArtifact(linkedTask, data, 'diff');
  const latestReviewArtifact = getLatestTaskArtifact(linkedTask, data, 'review');
  const latestCommitPackageArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-package');
  const latestCommitResultArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-result');
  const latestReleasePackageArtifact = getLatestTaskArtifact(linkedTask, data, 'release-package');
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const currentDeliverableArtifact =
    latestCloseOutArtifact ||
    latestReleasePackageArtifact ||
    latestCommitResultArtifact ||
    latestCommitPackageArtifact ||
    latestReviewArtifact ||
    latestChangeSummaryArtifact ||
    latestDiffArtifact ||
    latestPatchArtifact ||
    latestPreflightArtifact ||
    latestBreakdownArtifact ||
    latestArchitectureArtifact ||
    latestPlanArtifact ||
    latestArtifact;
  const latestApproval = taskApprovals[0] || null;
  const latestReviewStatus = linkedTask.review?.status || 'pending';

  return {
    approvalSummary: getTaskApprovalSummary(linkedTask, data.approvals),
    currentDeliverableArtifact,
    latestApproval,
    latestReviewStatus,
    linkedTask,
    previewLine: currentDeliverableArtifact
      ? `${currentDeliverableArtifact.type} ${currentDeliverableArtifact.id}; 리뷰 ${getReviewStatusDisplay(latestReviewStatus)}; 승인 ${getApprovalStatusDisplay(latestApproval?.status || 'none')}.`
      : `아직 아티팩트 패키지가 없습니다; 리뷰 ${getReviewStatusDisplay(latestReviewStatus)}; 승인 ${getApprovalStatusDisplay(latestApproval?.status || 'none')}.`,
  };
}

export function getMissionNextActionPreview(mission, previews) {
  if (!mission) {
    return {
      actionLabel: '미션부터 시작',
      summary: '아직 선택된 미션이 없으므로 지금 가장 먼저 열어야 할 표면은 미션입니다.',
      surface: 'mission',
      tone: 'warning',
    };
  }

  if (previews.completion?.completionReady) {
    return {
      actionLabel: '다음 미션 준비',
      summary:
        '현재 한정된 경로가 이미 닫혔으므로, 다음 미션 초안을 여는 가장 안전한 다음 단계는 미션입니다.',
      surface: 'mission',
      tone: 'success',
    };
  }

  if (!previews.council?.councilSession) {
    return {
      actionLabel: '회의 초안',
      summary:
        '이 미션에는 아직 보이는 추천안이 없으므로, 지금 가장 먼저 열어야 할 표면은 협의회입니다.',
      surface: 'council',
      tone: 'warning',
    };
  }

  if (previews.council.alignmentStatus !== 'approved') {
    return {
      actionLabel: '협의회',
      summary:
        '추천안은 보이지만 정렬 승인이 아직 끝나지 않았으므로, 지금 가장 먼저 열어야 할 표면은 협의회입니다.',
      surface: 'council',
      tone: 'warning',
    };
  }

  if (!previews.execution?.linkedTask) {
    return {
      actionLabel: '태스크 연결',
      summary:
        '추천안 정렬은 끝났지만 연결 태스크가 아직 없으므로, 지금 가장 먼저 돌아가야 할 표면은 미션입니다.',
      surface: 'mission',
      tone: 'accent',
    };
  }

  if (
    previews.deliverables?.latestReviewStatus === 'passed' &&
    previews.deliverables?.currentDeliverableArtifact
  ) {
    return {
      actionLabel: '결과 확인',
      summary:
        '리뷰가 통과한 결과 패킷이 준비됐으므로, 지금 가장 먼저 확인할 표면은 산출물입니다.',
      surface: 'deliverables',
      tone: 'success',
    };
  }

  return {
    actionLabel: '실행',
    summary:
      '협의회 승인으로 실행 태스크가 연결됐습니다. 현재 사람 게이트와 다음 한정 명령을 실행에서 확인합니다.',
    surface: 'execution',
    tone: 'accent',
  };
}

export function getMissionBriefControlSnapshot(mission, previews) {
  if (!mission) {
    return {
      currentCopy: '왼쪽에서 안건을 하나 고르면 현재 판단과 다음 이동이 이곳에 바로 열립니다.',
      currentTitle: '안건 선택 필요',
      nextCopy: '먼저 안건을 선택해야 회의실과 실행 데스크 이동 판단이 생깁니다.',
      nextTitle: '안건부터 선택',
      reasonCopy: '선택된 안건이 없으면 지금 어느 단계인지와 다음 이동도 정해지지 않습니다.',
      reasonTitle: '판단 근거 없음',
    };
  }

  const nextSurfaceLabel = getSurfaceDisplayName(previews.nextActionPreview?.surface || 'mission');

  if (previews.completion?.completionReady) {
    return {
      currentCopy: '현재 안건은 종료 정리까지 봉인되어 다음 안건 준비 단계로 넘어갈 수 있습니다.',
      currentTitle: '종료 정리 완료',
      nextCopy: '미션으로 돌아가 다음 안건 초안을 바로 열 수 있습니다.',
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy:
        previews.deliverables?.previewLine ||
        'close-out 경로가 닫혀 결과 보고가 봉인된 상태입니다.',
      reasonTitle: '봉인 근거',
    };
  }

  if (!previews.council?.councilSession) {
    return {
      currentCopy: '아직 보이는 추천안이 없어서 참모 회의를 먼저 열어야 합니다.',
      currentTitle: '회의 초안 필요',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 바로 시작합니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.council?.previewLine || previews.nextActionPreview.summary,
      reasonTitle: '회의 준비 상태',
    };
  }

  if (previews.council.alignmentStatus !== 'approved') {
    return {
      currentCopy: '추천안은 보이지만 아직 정렬 승인이 끝나지 않아 회의실 판단이 먼저입니다.',
      currentTitle: '정렬 승인 대기',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 바로 검토합니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.council.previewLine || previews.nextActionPreview.summary,
      reasonTitle: '회의 판단 근거',
    };
  }

  if (!previews.execution?.linkedTask) {
    return {
      currentCopy: '추천안 정렬은 끝났지만 실행 셀이 아직 연결되지 않아 미션에서 연결을 먼저 만들어야 합니다.',
      currentTitle: '실행 셀 연결 필요',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 이어갑니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.execution?.blockedReason || previews.nextActionPreview.summary,
      reasonTitle: '실행 전제',
    };
  }

  if (previews.execution.linkedTask.flags?.waitingApproval) {
    return {
      currentCopy: '현재 실행은 사람 승인을 기다리고 있으므로 승인 판단이 가장 먼저입니다.',
      currentTitle: '승인 판단 필요',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 바로 처리합니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.execution.gatePreview || previews.execution.blockedReason,
      reasonTitle: '현재 게이트',
    };
  }

  if (previews.execution.linkedTask.flags?.waitingDecision) {
    return {
      currentCopy: '현재 실행은 막고 있는 결정 항목을 먼저 해소해야 전진할 수 있습니다.',
      currentTitle: '결정 판단 필요',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 이어갑니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.execution.blockedReason || previews.execution.gatePreview,
      reasonTitle: '막힌 이유',
    };
  }

  if (previews.execution.linkedTask.flags?.blocked) {
    return {
      currentCopy: '현재 실행 셀이 blocked 상태라서 차단 근거를 먼저 확인해야 합니다.',
      currentTitle: '실행 차단 상태',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 다시 확인합니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.execution.blockedReason || previews.execution.gatePreview,
      reasonTitle: '차단 근거',
    };
  }

  if (
    previews.deliverables?.latestReviewStatus === 'passed' &&
    previews.deliverables?.currentDeliverableArtifact
  ) {
    return {
      currentCopy: '리뷰가 통과되어 최신 결과 패킷을 바로 확인할 수 있습니다.',
      currentTitle: '리뷰 통과',
      nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 먼저 확인합니다.`,
      nextTitle: `${nextSurfaceLabel} 이동`,
      reasonCopy: previews.deliverables.previewLine || previews.nextActionPreview.summary,
      reasonTitle: '결과 패킷 근거',
    };
  }

  return {
    currentCopy: '현재 안건은 실행 경로 안에서 계속 이어갈 수 있는 상태입니다.',
    currentTitle: '실행 진행 중',
    nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 이어갑니다.`,
    nextTitle: `${nextSurfaceLabel} 이동`,
    reasonCopy: previews.execution.stagePreview || previews.execution.gatePreview,
    reasonTitle: '현재 게이트',
  };
}

export function getCouncilControlSnapshot(mission, councilSession, linkedTask) {
  if (!mission || !councilSession) {
    return {
      currentCopy: '안건을 고르고 회의 초안을 열면 권고안과 승인 선반이 이곳에 나타납니다.',
      currentTitle: '회의 초안 필요',
      nextCopy: '먼저 안건을 고른 뒤 회의를 시작합니다.',
      nextTitle: '안건부터 선택',
      reasonCopy: '현재는 선택된 회의 세션이 없어 요약과 권고를 판단할 근거가 비어 있습니다.',
      reasonTitle: '판단 근거 없음',
    };
  }

  if (councilSession.alignment?.status === 'approved' && linkedTask) {
    return {
      currentCopy: '결론 승인이 이미 끝나 실행 지시 데스크로 넘길 준비가 완료됐습니다.',
      currentTitle: '결론 승인 완료',
      nextCopy: '실행 지시 데스크를 열어 연결 태스크와 현재 승인선을 이어서 확인합니다.',
      nextTitle: '실행 데스크',
      reasonCopy:
        councilSession.selectedPlan?.title ||
        councilSession.recommendation ||
        councilSession.summary ||
        '승인된 결론이 기록돼 있습니다.',
      reasonTitle: '채택 근거',
    };
  }

  if (councilSession.alignment?.status === 'approved') {
    return {
      currentCopy: '결론 승인은 끝났지만 아직 연결 실행 셀이 없어 안건에서 실행 연결을 먼저 만들어야 합니다.',
      currentTitle: '실행 연결 필요',
      nextCopy: '안건 브리프로 돌아가 실행 셀 연결을 이어갑니다.',
      nextTitle: '안건 브리프',
      reasonCopy:
        councilSession.selectedPlan?.scope ||
        councilSession.recommendation ||
        '승인된 결론은 있지만 연결 실행 셀이 없습니다.',
      reasonTitle: '인계 근거',
    };
  }

  return {
    currentCopy: '추천안은 보이지만 아직 명시적 결론 승인이 끝나지 않아 회의 판단이 먼저입니다.',
    currentTitle: '결론 승인 필요',
    nextCopy: '아래 결론 승인 블록에서 승인 여부를 바로 결정합니다.',
    nextTitle: '회의 결론 승인',
    reasonCopy:
      councilSession.recommendation ||
      councilSession.summary ||
      councilSession.selectedPlan?.title ||
      '아직 기록된 권고 방향이 없습니다.',
    reasonTitle: '현재 권고',
  };
}

export function getExecutionControlSnapshot(task, latestRun, approvalBridge, gateCopy, summaries = {}) {
  if (!task) {
    return {
      currentCopy: '연결 실행 셀이 생기면 현재 게이트 판단이 이곳에 나타납니다.',
      currentTitle: '실행 셀 없음',
      nextCopy: '안건이나 회의에서 먼저 실행 셀을 연결합니다.',
      nextTitle: '안건으로 돌아가기',
      reasonCopy: '현재는 선택된 실행 셀이 없어 승인선과 최근 로그를 판단할 근거가 없습니다.',
      reasonTitle: '작업 지시 근거 없음',
    };
  }

  if (task.flags?.waitingApproval) {
    return {
      currentCopy: '사람 승인이 남아 있어 현재 작업 지시는 승인선 처리 전까지 멈춰 있습니다.',
      currentTitle: '승인선 대기',
      nextCopy: '아래 승인선에서 현재 지시 승인을 먼저 처리합니다.',
      nextTitle: '현재 지시 승인',
      reasonCopy: gateCopy || approvalBridge.bridgeCopy || '현재 승인 게이트가 열려 있습니다.',
      reasonTitle: '현재 게이트',
    };
  }

  if (task.flags?.waitingDecision) {
    return {
      currentCopy: '결정 항목이 남아 있어 현재 작업 지시는 그 판단이 끝나기 전까지 이어지지 않습니다.',
      currentTitle: '결정 처리 필요',
      nextCopy: '관제실 결정함이나 아래 차단 사유에서 현재 결정을 먼저 해소합니다.',
      nextTitle: '결정 처리',
      reasonCopy: gateCopy || '현재 실행을 막는 결정 항목이 있습니다.',
      reasonTitle: '막힌 이유',
    };
  }

  if (task.flags?.blocked) {
    return {
      currentCopy: '현재 실행 셀이 blocked 상태라서 차단 근거부터 다시 봐야 합니다.',
      currentTitle: '실행 차단 상태',
      nextCopy: '아래 차단 사유와 실행 준비 패킷을 다시 확인합니다.',
      nextTitle: '차단 원인 확인',
      reasonCopy: gateCopy || '현재 차단 사유가 기록돼 있습니다.',
      reasonTitle: '차단 근거',
    };
  }

  if (summaries.closeOutAllowed) {
    return {
      currentCopy: '현재 작업 지시 경로는 종료 정리까지 바로 이어갈 수 있습니다.',
      currentTitle: '종료 정리 가능',
      nextCopy: '아래 승인선과 종료 후속 경로를 확인한 뒤 종료 정리를 이어갑니다.',
      nextTitle: '종료 정리 이어가기',
      reasonCopy: approvalBridge.nextStepCopy || gateCopy || '현재 종료 경로가 열려 있습니다.',
      reasonTitle: '후속 경로',
    };
  }

  if (summaries.releaseAllowed) {
    return {
      currentCopy: '현재 작업 지시 경로는 릴리스 패킷 준비까지 이어갈 수 있습니다.',
      currentTitle: '릴리스 준비 가능',
      nextCopy: '아래 승인선에서 릴리스 후속을 이어갑니다.',
      nextTitle: '릴리스 패키지 준비',
      reasonCopy: approvalBridge.nextStepCopy || gateCopy || '현재 릴리스 경로가 열려 있습니다.',
      reasonTitle: '후속 경로',
    };
  }

  if (summaries.commitAllowed) {
    return {
      currentCopy: '현재 작업 지시 경로는 커밋 패킷 또는 로컬 커밋 단계까지 이어질 수 있습니다.',
      currentTitle: '커밋 경로 열림',
      nextCopy: '아래 승인선에서 커밋 후속을 이어갑니다.',
      nextTitle: '커밋 경로 확인',
      reasonCopy: approvalBridge.nextStepCopy || gateCopy || '현재 커밋 경로가 열려 있습니다.',
      reasonTitle: '후속 경로',
    };
  }

  return {
    currentCopy: '현재 실행 셀은 작업 지시 경로 안에서 계속 이어갈 수 있는 상태입니다.',
    currentTitle: latestRun ? `${getRunStatusDisplay(latestRun.status)} 보고` : '실행 진행 중',
    nextCopy: '아래 승인선과 실행 준비 패킷을 따라 다음 실행을 이어갑니다.',
    nextTitle: '현재 실행 이어가기',
    reasonCopy:
      approvalBridge.nextStepCopy ||
      gateCopy ||
      (latestRun
        ? `${getExecutionRoleDisplay(latestRun.role || latestRun.kind || 'none')} 기준 최신 보고가 있습니다.`
        : '아직 최신 로그가 없어 기본 작업 지시 경로를 따릅니다.'),
    reasonTitle: '현재 게이트',
  };
}

export function getExecutionLeftSnapshot(task, latestRun, executionControl, artifacts = {}) {
  if (!task) {
    return {
      currentCopy: executionControl.currentCopy,
      currentTitle: executionControl.currentTitle,
      nextCopy: executionControl.nextCopy,
      nextTitle: executionControl.nextTitle,
      reasonCopy: '현재는 연결 실행 셀이 없어 최신 로그나 상류 승인 패킷을 근거로 묶어 보여 줄 수 없습니다.',
      reasonTitle: '연결 근거 없음',
    };
  }

  const prepLabels = [
    artifacts.latestPlanArtifact ? '계획' : null,
    artifacts.latestArchitectureArtifact ? '설계' : null,
    artifacts.latestBreakdownArtifact ? '분해' : null,
    artifacts.latestPreflightArtifact ? '사전 점검' : null,
  ].filter(Boolean);
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';

  if (prepLabels.length > 0 && latestRun) {
    return {
      currentCopy: executionControl.currentCopy,
      currentTitle: executionControl.currentTitle,
      nextCopy: executionControl.nextCopy,
      nextTitle: executionControl.nextTitle,
      reasonCopy: `${prepLabels.join(' · ')} 승인 패킷과 ${getExecutionRoleDisplay(latestRunRole)} 최신 로그가 함께 연결돼 있어 현재 작업 지시 판단을 뒷받침합니다.`,
      reasonTitle: '상류 패킷 + 최근 로그',
    };
  }

  if (prepLabels.length > 0) {
    return {
      currentCopy: executionControl.currentCopy,
      currentTitle: executionControl.currentTitle,
      nextCopy: executionControl.nextCopy,
      nextTitle: executionControl.nextTitle,
      reasonCopy: `${prepLabels.join(' · ')} 승인 패킷이 연결돼 있어 현재 실행 준비가 어느 단계까지 왔는지 바로 확인할 수 있습니다.`,
      reasonTitle: `상류 패킷 ${prepLabels.length}단계`,
    };
  }

  if (latestRun) {
    return {
      currentCopy: executionControl.currentCopy,
      currentTitle: executionControl.currentTitle,
      nextCopy: executionControl.nextCopy,
      nextTitle: executionControl.nextTitle,
      reasonCopy: `${getExecutionRoleDisplay(latestRunRole)}의 최신 실행 로그가 ${getRunStatusDisplay(latestRun.status)} 상태로 남아 있어 현재 작업 지시 판단의 직접 근거가 됩니다.`,
      reasonTitle: '최근 실행 로그 기준',
    };
  }

  return {
    currentCopy: executionControl.currentCopy,
    currentTitle: executionControl.currentTitle,
    nextCopy: executionControl.nextCopy,
    nextTitle: executionControl.nextTitle,
    reasonCopy: '아직 최신 로그가 없어 기본 작업 지시 경로와 현재 승인 게이트를 기준으로만 판단합니다.',
    reasonTitle: '기본 작업 지시 경로',
  };
}

export function getDeliverablesControlSnapshot(
  mission,
  task,
  currentArtifact,
  latestApproval,
  approvalBridge,
  latestReviewStatus,
  missionCompletionReady,
) {
  if (!mission || !task) {
    return {
      currentCopy: '연결 태스크가 생기면 결과 패킷 판단판이 이곳에 나타납니다.',
      currentTitle: '결과 패킷 없음',
      nextCopy: '먼저 안건과 실행 셀을 연결한 뒤 결과 패킷 선반을 만듭니다.',
      nextTitle: '안건으로 돌아가기',
      reasonCopy: '현재는 연결 태스크가 없어 결과 패킷, 리뷰 라인, 승인 라인을 판단할 근거가 없습니다.',
      reasonTitle: '전달 근거 없음',
    };
  }

  if (missionCompletionReady) {
    return {
      currentCopy: '현재 안건은 종료 정리까지 봉인되어 결과 보고가 닫힌 상태입니다.',
      currentTitle: '종료 보고 봉인',
      nextCopy: '미션으로 돌아가 다음 안건을 시작하거나 관제실에서 봉인된 번들을 확인합니다.',
      nextTitle: '다음 안건 준비',
      reasonCopy:
        currentArtifact
          ? `${currentArtifact.type} ${currentArtifact.id}가 현재 종료 보고 패킷의 맨 위에 있습니다.`
          : '종료 보고 패킷이 봉인됐습니다.',
      reasonTitle: '봉인 근거',
    };
  }

  if (latestApproval?.status === 'pending') {
    return {
      currentCopy: '사람 승인이 남아 있어 현재 결과 패킷은 승인 라인 판단이 먼저입니다.',
      currentTitle: '승인 라인 대기',
      nextCopy: '실행이나 관제실에서 현재 승인 안건을 먼저 처리합니다.',
      nextTitle: '승인 안건 확인',
      reasonCopy: approvalBridge.bridgeCopy || '현재 결과 패킷에 대한 승인이 대기 중입니다.',
      reasonTitle: '현재 승인',
    };
  }

  if (latestReviewStatus !== 'passed') {
    return {
      currentCopy: '아직 리뷰가 닫히지 않아 현재 결과 패킷은 리뷰 라인 판단이 먼저입니다.',
      currentTitle: `리뷰 ${getReviewStatusDisplay(latestReviewStatus)}`,
      nextCopy: '실행으로 돌아가 리뷰 보고나 후속 패키지를 먼저 정리합니다.',
      nextTitle: '실행 경로 확인',
      reasonCopy:
        currentArtifact
          ? `${currentArtifact.type} ${currentArtifact.id} 기준으로 리뷰 상태가 ${getReviewStatusDisplay(latestReviewStatus)}입니다.`
          : `현재 리뷰 상태는 ${getReviewStatusDisplay(latestReviewStatus)}입니다.`,
      reasonTitle: '리뷰 근거',
    };
  }

  return {
    currentCopy: '현재 결과 패킷은 최신 결과를 보여 주며 다음 승인이나 종료 보고를 기다리는 상태입니다.',
    currentTitle: currentArtifact ? `${getArtifactTypeDisplay(currentArtifact.type)} 패킷` : '패킷 대기',
    nextCopy: '승인 라인과 현재 승인 안건을 확인한 뒤 필요하면 실행이나 관제실로 이동합니다.',
    nextTitle: '승인 라인 확인',
    reasonCopy:
      approvalBridge.nextStepCopy ||
      (currentArtifact
        ? `${currentArtifact.type} ${currentArtifact.id}가 현재 결과 패킷 선반의 맨 위에 있습니다.`
        : '현재 결과 패킷 선반이 아직 비어 있습니다.'),
    reasonTitle: '현재 패킷 기준',
  };
}

export function getDeliverablesCompletionSummary(options = {}) {
  const currentArtifact = options.currentArtifact || null;
  const latestApproval = options.latestApproval || null;
  const approvalSummary = options.approvalSummary || { pending: 0 };
  const approvalBridge = options.approvalBridge || {};
  const latestReviewStatus = options.latestReviewStatus || 'pending';
  const missionCompletionReady = Boolean(options.missionCompletionReady);
  const executionGateReason = options.executionGateReason || null;
  const evidenceRail = options.evidenceRail || null;
  const closeOutState = options.closeOutState || { summary: { allowed: false, reasons: [] } };
  const releasePackageState = options.releasePackageState || { summary: { allowed: false, reasons: [] } };
  const commitExecutionState = options.commitExecutionState || { summary: { allowed: false, reasons: [] } };
  const commitPackageState = options.commitPackageState || { summary: { allowed: false, reasons: [] } };
  const reviewerState = options.reviewerState || { summary: { allowed: false, reasons: [] } };
  const pendingInboxItem = approvalBridge.pendingInboxItem || null;
  const reviewPassed = latestReviewStatus === 'passed';
  const pendingApprovalCount = Number(approvalSummary.pending || 0);
  const blockedReason =
    executionGateReason ||
    evidenceRail?.blockedReason ||
    pendingInboxItem?.prompt ||
    pendingInboxItem?.title ||
    (latestApproval?.status === 'pending'
      ? `${latestApproval.id} 승인 대기`
      : null) ||
    getPrimaryBlockedReason(closeOutState.summary?.reasons, null) ||
    getPrimaryBlockedReason(releasePackageState.summary?.reasons, null) ||
    getPrimaryBlockedReason(commitExecutionState.summary?.reasons, null) ||
    getPrimaryBlockedReason(commitPackageState.summary?.reasons, null) ||
    getPrimaryBlockedReason(reviewerState.summary?.reasons, null);

  let safeNextLabel = '실행으로 돌아가기';
  let safeNextCopy = '현재 한정된 경로를 실행 표면에서 계속 전진합니다.';

  if (missionCompletionReady) {
    safeNextLabel = '다음 미션 준비';
    safeNextCopy = '종료 정리 번들이 봉인됐으므로 미션에서 다음 안건을 준비합니다.';
  } else if (pendingApprovalCount > 0 || latestApproval?.status === 'pending') {
    safeNextLabel = '승인선 처리';
    safeNextCopy = '현재 승인 안건을 결정함이나 실행 표면에서 먼저 처리합니다.';
  } else if (closeOutState.summary?.allowed) {
    safeNextLabel = '종료 정리 실행';
    safeNextCopy = '현재 승인된 릴리스 번들을 기준으로 실행 표면에서 종료 정리를 실행합니다.';
  } else if (releasePackageState.summary?.allowed) {
    safeNextLabel = '릴리스 패키지 준비';
    safeNextCopy = '최신 로컬 커밋 번들을 기준으로 실행 표면에서 릴리스 패키지를 준비합니다.';
  } else if (commitExecutionState.summary?.allowed) {
    safeNextLabel = '로컬 커밋 실행';
    safeNextCopy = '승인된 커밋 패키지를 기준으로 실행 표면에서 로컬 커밋을 실행합니다.';
  } else if (commitPackageState.summary?.allowed) {
    safeNextLabel = '커밋 패키지 준비';
    safeNextCopy = '리뷰를 통과한 번들을 기준으로 실행 표면에서 커밋 패키지를 준비합니다.';
  } else if (reviewerState.summary?.allowed) {
    safeNextLabel = '리뷰 보고 생성';
    safeNextCopy = '최신 라이브 변경 번들을 기준으로 실행 표면에서 리뷰 보고를 생성합니다.';
  }

  return {
    blockedCopy: missionCompletionReady
      ? '현재 완료 경로에는 남은 차단이 없습니다.'
      : blockedReason || '현재 보고 표면에서 새로 처리할 차단 사유는 없습니다.',
    blockedLabel: missionCompletionReady || !blockedReason ? '차단 없음' : '차단 있음',
    blockedTone: missionCompletionReady || !blockedReason ? 'success' : 'danger',
    safeNextCopy,
    safeNextLabel,
    safeNextTone: missionCompletionReady ? 'success' : 'accent',
    whatChangedCopy: currentArtifact
      ? `${currentArtifact.id}가 현재 전달 선반의 대표 패킷입니다.`
      : '아직 전달 선반에 대표 결과 패킷이 없습니다.',
    whatChangedLabel: currentArtifact ? getArtifactTypeDisplay(currentArtifact.type) : '패킷 없음',
    whatChangedTone: currentArtifact ? 'success' : 'warning',
    whatPassedCopy: reviewPassed
      ? '현재 리뷰 라인은 통과 상태입니다.'
      : `현재 리뷰 라인은 ${getReviewStatusDisplay(latestReviewStatus)} 상태입니다.`,
    whatPassedLabel: missionCompletionReady
      ? '종료 정리 봉인'
      : reviewPassed
        ? '리뷰 통과'
        : `리뷰 ${getReviewStatusDisplay(latestReviewStatus)}`,
    whatPassedTone: missionCompletionReady || reviewPassed ? 'success' : getReviewTone(latestReviewStatus),
  };
}

export function renderDeliverablesCompletionSummary(summary) {
  if (!summary) {
    return '';
  }

  return `
    <section class="relation-strip deliverables-completion-summary">
      <div class="card-title-row">
        <strong>완성 판단 요약</strong>
        <div class="token-row">
          ${createToken(`변경:${summary.whatChangedLabel}`, summary.whatChangedTone)}
          ${createToken(`통과:${summary.whatPassedLabel}`, summary.whatPassedTone)}
          ${createToken(summary.blockedLabel, summary.blockedTone)}
          ${createToken(`다음:${summary.safeNextLabel}`, summary.safeNextTone)}
        </div>
      </div>
      <div class="control-overview-register deliverables-completion-register">
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">변경 내용</span>
          <strong class="control-overview-register-value">${escapeHtml(summary.whatChangedCopy)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">통과 근거</span>
          <strong class="control-overview-register-value">${escapeHtml(summary.whatPassedCopy)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">차단 사유</span>
          <strong class="control-overview-register-value">${escapeHtml(summary.blockedCopy)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">안전한 다음 행동</span>
          <strong class="control-overview-register-value">${escapeHtml(summary.safeNextCopy)}</strong>
        </div>
      </div>
    </section>
  `;
}

export function getDeliverablesLeftSnapshot(mission, task, currentArtifact, deliverablesControl, artifacts = {}) {
  if (!mission || !task) {
    return {
      currentCopy: deliverablesControl.currentCopy,
      currentTitle: deliverablesControl.currentTitle,
      nextCopy: deliverablesControl.nextCopy,
      nextTitle: deliverablesControl.nextTitle,
      reasonCopy: '연결 태스크와 결과 패킷 선반이 아직 없어 상류 준비 패킷이나 전달 패킷 선반을 근거로 묶을 수 없습니다.',
      reasonTitle: '연결 근거 없음',
    };
  }

  const upstreamLabels = [
    artifacts.latestPlanArtifact ? '계획' : null,
    artifacts.latestArchitectureArtifact ? '설계' : null,
    artifacts.latestBreakdownArtifact ? '분해' : null,
    artifacts.latestPreflightArtifact ? '사전 점검' : null,
  ].filter(Boolean);
  const downstreamLabels = [
    artifacts.latestChangeSummaryArtifact ? '변경 요약' : null,
    artifacts.latestPatchArtifact ? '패치' : null,
    artifacts.latestDiffArtifact ? '차이 검토' : null,
    artifacts.latestReviewArtifact ? '리뷰' : null,
    artifacts.latestCommitPackageArtifact ? '커밋 패키지' : null,
    artifacts.latestCommitResultArtifact ? '커밋 결과' : null,
    artifacts.latestReleasePackageArtifact ? '릴리스 패키지' : null,
    artifacts.latestCloseOutArtifact ? '종료 보고' : null,
  ].filter(Boolean);

  if (upstreamLabels.length > 0 && downstreamLabels.length > 0) {
    return {
      currentCopy: deliverablesControl.currentCopy,
      currentTitle: deliverablesControl.currentTitle,
      nextCopy: deliverablesControl.nextCopy,
      nextTitle: deliverablesControl.nextTitle,
      reasonCopy: `${upstreamLabels.join(' · ')} 상류 준비 패킷과 ${downstreamLabels.join(' · ')} 전달 패킷 선반이 같은 안건 묶음으로 연결돼 있습니다.`,
      reasonTitle: '상류 + 전달 패킷 연결',
    };
  }

  if (downstreamLabels.length > 0) {
    return {
      currentCopy: deliverablesControl.currentCopy,
      currentTitle: deliverablesControl.currentTitle,
      nextCopy: deliverablesControl.nextCopy,
      nextTitle: deliverablesControl.nextTitle,
      reasonCopy: `${downstreamLabels.join(' · ')} 전달 패킷 선반이 현재 전달 판단의 직접 근거입니다.`,
      reasonTitle: `전달 패킷 ${downstreamLabels.length}건`,
    };
  }

  if (upstreamLabels.length > 0) {
    return {
      currentCopy: deliverablesControl.currentCopy,
      currentTitle: deliverablesControl.currentTitle,
      nextCopy: deliverablesControl.nextCopy,
      nextTitle: deliverablesControl.nextTitle,
      reasonCopy: `${upstreamLabels.join(' · ')} 상류 준비 패킷이 현재 결과 패킷 판단의 기본 근거로 남아 있습니다.`,
      reasonTitle: `상류 준비 패킷 ${upstreamLabels.length}건`,
    };
  }

  if (currentArtifact) {
    return {
      currentCopy: deliverablesControl.currentCopy,
      currentTitle: deliverablesControl.currentTitle,
      nextCopy: deliverablesControl.nextCopy,
      nextTitle: deliverablesControl.nextTitle,
      reasonCopy: `${getArtifactTypeDisplay(currentArtifact.type)} ${currentArtifact.id}가 현재 결과 패킷 선반의 맨 위에 있어 최신 전달 판단의 기준이 됩니다.`,
      reasonTitle: '최신 패킷 기준',
    };
  }

  return {
    currentCopy: deliverablesControl.currentCopy,
    currentTitle: deliverablesControl.currentTitle,
    nextCopy: deliverablesControl.nextCopy,
    nextTitle: deliverablesControl.nextTitle,
    reasonCopy: '아직 결과 패킷 선반이 없어 리뷰 라인과 승인 라인보다 앞단의 생성 흐름을 먼저 만들어야 합니다.',
    reasonTitle: '결과 패킷 대기',
  };
}

export function getMissionSurfaceRailEntries(mission, previews) {
  const completionReady = Boolean(previews.completion?.completionReady);
  const councilSession = previews.council?.councilSession || null;
  const councilStatus = councilSession
    ? getAlignmentStatusDisplay(previews.council.alignmentStatus)
    : '초안 전';
  const councilTone = councilSession
    ? getAlignmentTone(previews.council.alignmentStatus)
    : 'warning';
  const linkedTask = previews.execution?.linkedTask || null;
  const executionStatus = !linkedTask
    ? '태스크 전'
    : linkedTask.flags?.waitingApproval
      ? '승인 대기'
      : linkedTask.flags?.blocked
        ? '차단'
        : linkedTask.flags?.waitingDecision
          ? '결정 대기'
          : getTaskLifecycleDisplay(linkedTask.lifecycleState);
  const executionTone = !linkedTask
    ? 'warning'
    : linkedTask.flags?.blocked
      ? 'danger'
      : linkedTask.flags?.waitingApproval
        ? 'accent'
        : linkedTask.flags?.waitingDecision
          ? 'warning'
          : linkedTask.lifecycleState === 'Done'
            ? 'success'
            : 'neutral';
  const latestApprovalStatus = previews.deliverables?.latestApproval?.status || 'none';
  const latestReviewStatus = previews.deliverables?.latestReviewStatus || 'pending';
  const deliverablesStatus = completionReady
    ? '완료'
    : latestApprovalStatus !== 'none'
      ? getApprovalStatusDisplay(latestApprovalStatus)
      : latestReviewStatus !== 'pending'
        ? `리뷰 ${getReviewStatusDisplay(latestReviewStatus)}`
        : previews.deliverables?.currentDeliverableArtifact
          ? '증적 있음'
          : '보고 전';
  const deliverablesTone = completionReady
    ? 'success'
    : latestApprovalStatus !== 'none'
      ? getApprovalTone(latestApprovalStatus)
      : latestReviewStatus !== 'pending'
        ? getReviewTone(latestReviewStatus)
        : previews.deliverables?.currentDeliverableArtifact
          ? 'neutral'
          : 'warning';

  return [
    {
      label: '안건',
      status: completionReady ? '다음 안건' : getMissionStatusDisplay(mission?.status),
      surface: 'mission',
      tone: completionReady ? 'success' : getMissionStatusTone(mission?.status),
    },
    {
      label: '회의',
      status: councilStatus,
      surface: 'council',
      tone: councilTone,
    },
    {
      label: '실행',
      status: executionStatus,
      surface: 'execution',
      tone: executionTone,
    },
    {
      label: '보고',
      status: deliverablesStatus,
      surface: 'deliverables',
      tone: deliverablesTone,
    },
  ].map((entry) => ({
    ...entry,
    isNext: previews.nextActionPreview?.surface === entry.surface,
  }));
}

export function renderMissionSnapshotList(items, options = {}) {
  const { compact = false } = options;

  if (!Array.isArray(items) || items.length === 0) {
    return '<p class="detail-copy">아직 미션 스냅샷 항목이 없습니다.</p>';
  }

  if (compact) {
    return `
      <div class="brief-snapshot-list">
        ${items
          .map(
            (item) => `
              <div class="brief-snapshot-row">
                <div class="brief-snapshot-main">
                  <strong>${escapeHtml(item.label)}</strong>
                  <p class="brief-snapshot-copy">${escapeHtml(item.copy)}</p>
                </div>
                ${createToken(getSurfaceDisplayName(item.surface), item.tone || 'neutral')}
              </div>
            `,
          )
          .join('')}
      </div>
    `;
  }

  return `
    <ul class="compact-list">
      ${items
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.label)}</strong>
              ${createToken(`표면:${getSurfaceDisplayName(item.surface)}`, item.tone || 'neutral')}
              : ${escapeHtml(item.copy)}
              ${item.handoffCopy ? ` ${escapeHtml(item.handoffCopy)}` : ''}
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}
