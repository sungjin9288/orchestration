import { COUNCIL_CAST_METADATA } from './council-config.js';
import {
  getAlignmentStatusDisplay,
  getAlignmentTone,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getReviewStatusDisplay,
  getReviewTone,
  getTaskLifecycleDisplay,
} from './execution-labels.js';

export function isRealCouncilMode(mode) {
  return mode === 'real-local-stub' || mode === 'real-openai-responses';
}

export function getCurrentRealCouncilAttempt(councilSession) {
  if (!isRealCouncilMode(councilSession?.mode) || !Array.isArray(councilSession.attempts)) {
    return null;
  }

  return (
    councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    ) || councilSession.attempts.at(-1) || null
  );
}

export function getLatestRealCouncilPositions(councilSession) {
  if (!isRealCouncilMode(councilSession?.mode) || !Array.isArray(councilSession.attempts)) {
    return [];
  }

  const positionsByAgent = new Map();

  for (const attempt of councilSession.attempts) {
    for (const position of attempt.positions || []) {
      positionsByAgent.set(position.agentId, position);
    }
  }

  return [...positionsByAgent.values()];
}

export function getCouncilCastEntry(role, councilSession) {
  const meta = COUNCIL_CAST_METADATA[role] || {
    archetype: '보이는 역할',
    avatarLabel: '임시 아바타',
    avatarMood: '현재 안건을 화면 위에 고정합니다.',
    avatarStyle: 'neutral',
    commandLine: '현재 추천안을 화면 위에 고정하는 역할입니다.',
    deskLabel: '임시 데스크',
    deskProp: '현재 안건 메모',
    mark: String(role || '?').slice(0, 2).toUpperCase(),
    officeLine: '현재 안건을 화면 위에 고정하는 자리',
    orderLabel: '역할 순서 미지정',
    previewLine: '협의회 추천안을 화면 위에 고정합니다.',
    rank: '임시 역할',
    tone: 'neutral',
  };
  const participant = Array.isArray(councilSession?.participants)
    ? councilSession.participants.find((entry) => entry.role === role) || null
    : null;
  const transcriptEntry = Array.isArray(councilSession?.transcript)
    ? councilSession.transcript.find((entry) => entry.role === role) || null
    : null;
  const currentAttempt = getCurrentRealCouncilAttempt(councilSession);
  const roleId = String(role || '').toLowerCase();
  const position =
    getLatestRealCouncilPositions(councilSession).find((entry) => entry.role === roleId) || null;
  const roleFailure = Array.isArray(currentAttempt?.conflictSummary?.requiredRoleFailures)
    ? currentAttempt.conflictSummary.requiredRoleFailures.find((entry) => entry.role === roleId) || null
    : null;

  return {
    archetype: meta.archetype,
    avatarLabel: meta.avatarLabel,
    avatarMood: meta.avatarMood,
    avatarStyle: meta.avatarStyle,
    commandLine: meta.commandLine,
    deskLabel: meta.deskLabel,
    deskProp: meta.deskProp,
    displayName: meta.displayName || role,
    focus: participant?.focus || meta.previewLine,
    mark: meta.mark,
    officeLine: meta.officeLine,
    orderLabel: meta.orderLabel,
    previewLine: meta.previewLine,
    rank: meta.rank,
    role,
    position,
    positionStatus: roleFailure ? 'failed' : position ? 'ready' : councilSession ? 'waiting' : 'idle',
    tone: meta.tone,
    transcriptContent: transcriptEntry?.content || null,
    transcriptStance: transcriptEntry?.stance || null,
  };
}

export function getCompanySignalEntries(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const missionStatus = mission ? getMissionStatusDisplay(mission.status) : '초안 전';
  const missionTone = mission ? getMissionStatusTone(mission.status) : 'warning';
  const councilStatus = councilSession
    ? isRealCouncilMode(councilSession.mode)
      ? councilSession.phase || councilSession.status
      : getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')
    : '대기';
  const councilTone = councilSession
    ? getAlignmentTone(councilSession.alignment?.status || 'pending')
    : 'warning';
  const executionStatus = !linkedTask
    ? '준비 전'
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
  const deliverablesStatus = completionReady
    ? 'close-out 완료'
    : linkedTask
      ? `리뷰 ${getReviewStatusDisplay(linkedTask.review?.status || 'pending')}`
      : '보고 전';
  const deliverablesTone = completionReady
    ? 'success'
    : linkedTask
      ? getReviewTone(linkedTask.review?.status || 'pending')
      : 'warning';
  const gateStatus = linkedTask?.flags?.waitingApproval
    ? '승인 대기'
    : linkedTask?.flags?.waitingDecision
      ? '결정 대기'
      : completionReady
        ? '정리됨'
        : councilSession
          ? '게이트 안정'
          : '열림 전';
  const gateTone = linkedTask?.flags?.waitingApproval
    ? 'accent'
    : linkedTask?.flags?.waitingDecision
      ? 'warning'
      : completionReady
        ? 'success'
        : 'neutral';
  return [
    {
      surface: 'mission',
      label: '안건',
      status: missionStatus,
      copy: mission ? '현재 안건 판단이 운영 흐름의 첫 줄입니다.' : '첫 안건이 올라오면 운영 흐름이 여기서 시작됩니다.',
      tone: missionTone,
    },
    {
      surface: 'council',
      label: '회의',
      status: councilStatus,
      copy: isRealCouncilMode(councilSession?.mode)
        ? '독립 position, conflict evidence, Conductor synthesis가 같은 세션에 기록됩니다.'
        : councilSession
          ? '네 역할이 같은 안건 아래에서 방향을 맞춥니다.'
          : '회의 준비 전이라 회의 흐름이 아직 열리지 않았습니다.',
      tone: councilTone,
    },
    {
      surface: 'execution',
      label: '실행',
      status: executionStatus,
      copy: linkedTask ? '현재 셀이 같은 안건의 다음 작업 지시를 끌고 갑니다.' : '회의 정렬 뒤에 첫 실행 셀이 이 줄을 이어받습니다.',
      tone: executionTone,
    },
    {
      surface: 'deliverables',
      label: '보고',
      status: deliverablesStatus,
      copy: completionReady ? '종료 정리와 보고 묶음이 이미 같은 경로를 닫았습니다.' : '리뷰와 보고 묶음이 다음 운영 판단을 위한 근거를 남깁니다.',
      tone: deliverablesTone,
    },
    {
      surface: 'decision-inbox',
      label: '게이트',
      status: gateStatus,
      copy: linkedTask?.flags?.waitingApproval || linkedTask?.flags?.waitingDecision
        ? '사람 게이트가 풀리면 흐름이 바로 다음 표면으로 이어집니다.'
        : '열린 사람 게이트가 없으면 같은 안건이 다음 줄로 자연스럽게 넘어갑니다.',
      tone: gateTone,
    },
  ];
}
