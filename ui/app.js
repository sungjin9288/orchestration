const SURFACE_IDS = ['mission', 'council', 'execution', 'deliverables', 'taskboard', 'logs', 'artifacts', 'decision-inbox'];
const TASK_LIFECYCLE_ORDER = ['Inbox', 'In Progress', 'Review', 'Done'];
const PACK_DISPLAY_NAMES = {
  development: 'development',
  'knowledge-work': 'knowledge-work',
};
const PACK_HELP_COPY = {
  development:
    '코드, 설정, 테스트, 리팩터링처럼 repo mutation이 중심인 실행 팩입니다.',
  'knowledge-work':
    '의사결정 메모, PRD, 실행 계획, 운영 체크리스트처럼 문서·기획·판단이 중심인 실행 팩입니다.',
};
const KNOWLEDGE_WORK_DELIVERABLES = {
  checklist: '체크리스트',
  'decision-memo': '의사결정 메모',
  'execution-plan': '실행 계획서',
  prd: 'PRD',
  'research-brief': '리서치 브리프',
};
const SURFACE_DISPLAY_NAMES = {
  artifacts: '아티팩트',
  council: '협의회',
  'decision-inbox': '결정함',
  deliverables: '산출물',
  execution: '실행',
  logs: '로그',
  mission: '미션',
  taskboard: '작업판',
};
const NAV_GROUPS = {
  workflows: {
    defaultSurface: 'mission',
    label: '업무',
    surfaces: ['mission', 'council', 'execution', 'deliverables'],
  },
  review: {
    defaultSurface: 'decision-inbox',
    label: '검토',
    surfaces: ['decision-inbox', 'artifacts', 'logs'],
  },
  ops: {
    defaultSurface: 'taskboard',
    label: '운영',
    surfaces: ['taskboard'],
  },
};
const SURFACE_TO_NAV_GROUP = Object.fromEntries(
  Object.entries(NAV_GROUPS).flatMap(([groupId, group]) =>
    group.surfaces.map((surface) => [surface, groupId]),
  ),
);
const SURFACE_DOCK_METADATA = {
  artifacts: {
    copy: '현재 증적과 연결 근거를 검토합니다.',
    kicker: '증적',
  },
  council: {
    copy: '회의 결론과 이견 정리를 한 지점에서 봅니다.',
    kicker: '회의',
  },
  'decision-inbox': {
    copy: '현재 승인 안건과 다음 처리를 판단합니다.',
    kicker: '승인선',
  },
  deliverables: {
    copy: '현재 보고 상태와 다음 인계선을 확인합니다.',
    kicker: '보고',
  },
  execution: {
    copy: '현재 작업 지시와 다음 실행을 정리합니다.',
    kicker: '실행',
  },
  logs: {
    copy: '현재 실행 로그와 다음 확인 대상을 빠르게 훑습니다.',
    kicker: '실행 로그',
  },
  mission: {
    copy: '현재 안건과 다음 등록 동선을 정리합니다.',
    kicker: '접수 라인',
  },
  taskboard: {
    copy: '현재 작업 셀과 다음 배정을 조정합니다.',
    kicker: '실행 셀',
  },
};
const GROUP_WORKSPACE_META = {
  workflows: {
    eyebrow: 'Workflow desk',
    title: '업무',
    windowLabel: 'WORK',
  },
  review: {
    eyebrow: 'Review desk',
    title: '검토',
    windowLabel: 'REVIEW',
  },
  ops: {
    eyebrow: 'Operations desk',
    title: '운영',
    windowLabel: 'OPS',
  },
};
const GROUP_PLAYBOOK_META = {
  workflows: {
    label: '운영 모드',
    title: '업무 사용 순서',
    cards: [
      {
        step: '01',
        title: '안건 정리',
        note: '문제와 제약만 먼저 고정',
      },
      {
        step: '02',
        title: '계획 정렬',
        note: '담당과 실행 셀 확정',
      },
      {
        step: '03',
        title: '실행 인계',
        note: '회의와 산출로 순서대로 넘김',
      },
    ],
  },
  review: {
    label: '운영 모드',
    title: '검토 사용 순서',
    cards: [
      {
        step: '01',
        title: '패킷 선택',
        note: '열린 증적 하나만 집음',
      },
      {
        step: '02',
        title: '근거 교차',
        note: 'run·gate·artifact 같이 확인',
      },
      {
        step: '03',
        title: '판단 반영',
        note: '승인선 또는 다음 desk 결정',
      },
    ],
  },
  ops: {
    label: '운영 모드',
    title: '운영 사용 순서',
    cards: [
      {
        step: '01',
        title: '범위 선택',
        note: '업무·검토·운영 중 한 범위 편집',
      },
      {
        step: '02',
        title: '역할 배정',
        note: 'agent 역할과 desk 지정',
      },
      {
        step: '03',
        title: '조직 반영',
        note: 'roster와 회사 구조 갱신',
      },
    ],
  },
};
const COMPANY_MEMBER_STORAGE_KEY = 'orchestration.company-members.v1';
const COMPANY_ROLE_OPTIONS = [
  { value: 'chief-of-staff', label: 'Chief of Staff' },
  { value: 'council-lead', label: 'Council Lead' },
  { value: 'strategist', label: 'Strategist' },
  { value: 'architect', label: 'Architect' },
  { value: 'builder', label: 'Builder' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'ops-manager', label: 'Ops Manager' },
];
const COMPANY_DESK_OPTIONS = [
  { surface: 'mission', label: 'Mission Desk' },
  { surface: 'council', label: 'Council Desk' },
  { surface: 'execution', label: 'Execution Desk' },
  { surface: 'deliverables', label: 'Deliverables Desk' },
  { surface: 'decision-inbox', label: 'Decision Desk' },
  { surface: 'artifacts', label: 'Evidence Desk' },
  { surface: 'logs', label: 'Logs Desk' },
  { surface: 'taskboard', label: 'Operations Desk' },
];
const OPS_EDITOR_GROUP_DEFAULTS = {
  workflows: {
    role: 'builder',
    surface: 'execution',
  },
  review: {
    role: 'reviewer',
    surface: 'artifacts',
  },
  ops: {
    role: 'ops-manager',
    surface: 'taskboard',
  },
};
const DEFAULT_COMPANY_MEMBERS = [
  {
    id: 'member-chief',
    name: 'Ari',
    role: 'chief-of-staff',
    surface: 'mission',
  },
  {
    id: 'member-council',
    name: 'Mina',
    role: 'council-lead',
    surface: 'council',
  },
  {
    id: 'member-architect',
    name: 'Joon',
    role: 'architect',
    surface: 'execution',
  },
  {
    id: 'member-builder',
    name: 'Nova',
    role: 'builder',
    surface: 'execution',
  },
  {
    id: 'member-reviewer',
    name: 'Rin',
    role: 'reviewer',
    surface: 'artifacts',
  },
  {
    id: 'member-ops',
    name: 'Sol',
    role: 'ops-manager',
    surface: 'taskboard',
  },
];

const state = {
  companyMemberDraftName: '',
  companyMemberDraftRole: 'builder',
  companyMemberDraftSurface: 'execution',
  companyMembers: readCompanyMembers(),
  opsEditorGroup: 'all',
  menuGroup: 'workflows',
  surface: 'mission',
  payload: null,
  loading: false,
  mutating: false,
  selectionSeeded: false,
  error: null,
  selectedMissionId: null,
  selectedTaskId: null,
  selectedRunId: null,
  selectedArtifactId: null,
  selectedInboxItemId: null,
  selectedRunLogs: null,
  lastHarnessExecutionResult: null,
  hiddenHarnessExecutionResultKey: null,
  harnessExecutionDraftInputPath: '',
  harnessExecutionDraftOutputPath: '',
  selectedArtifact: null,
  selectedTaskBreakdownArtifact: null,
  selectedTaskPreflightArtifact: null,
  linkedWorktreeDraftSlug: '',
  projectDraftName: '',
  projectDraftPath: '',
  projectDraftPack: 'development',
  projectDraftProviderMode: 'local-stub',
  projectDraftProviderModel: '',
  projectDraftProviderApiKeyVar: '',
  projectProviderDraftProjectId: null,
  projectProviderDraftMode: 'local-stub',
  projectProviderDraftModel: '',
  projectProviderDraftApiKeyVar: '',
  missionDraftTitle: '',
  missionDraftGoal: '',
  missionDraftConstraints: '',
  missionDraftDeliverableType: 'decision-memo',
  taskDraftTitle: '',
  taskDraftIntent: '',
  timerId: null,
};

const elements = {
  companyDirectoryShell: document.querySelector('#company-directory-shell'),
  companyDirectorySummary: document.querySelector('#company-directory-summary'),
  refreshButton: document.querySelector('#refresh-button'),
  refreshStatus: document.querySelector('#refresh-status'),
  shellHeader: {
    eyebrow: document.querySelector('#shell-header-eyebrow'),
    title: document.querySelector('#shell-dashboard-title'),
    windowLabel: document.querySelector('#shell-window-label'),
    project: document.querySelector('#shell-header-project'),
    surface: document.querySelector('#shell-header-surface'),
    gates: document.querySelector('#shell-header-gates'),
  },
  officeSidebarStatus: {
    project: document.querySelector('#office-sidebar-project'),
    surface: document.querySelector('#office-sidebar-surface'),
    runs: document.querySelector('#office-sidebar-runs'),
    gates: document.querySelector('#office-sidebar-gates'),
  },
  controlOverview: document.querySelector('#control-overview'),
  navGroups: [...document.querySelectorAll('.nav-group')],
  navGroupTabs: [...document.querySelectorAll('.nav-group-tab')],
  surfaces: {
    mission: document.querySelector('#surface-mission'),
    council: document.querySelector('#surface-council'),
    execution: document.querySelector('#surface-execution'),
    deliverables: document.querySelector('#surface-deliverables'),
    taskboard: document.querySelector('#surface-taskboard'),
    logs: document.querySelector('#surface-logs'),
    artifacts: document.querySelector('#surface-artifacts'),
    'decision-inbox': document.querySelector('#surface-decision-inbox'),
  },
  navButtons: [...document.querySelectorAll('.nav-button')],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  if (!value) {
    return '기록 없음';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getPackDisplayName(pack) {
  return PACK_DISPLAY_NAMES[pack] || pack || 'development';
}

function getNavGroupForSurface(surface) {
  return SURFACE_TO_NAV_GROUP[surface] || 'workflows';
}

function getActiveNavGroupId() {
  const activeSurfaceGroup = getNavGroupForSurface(state.surface);
  const requestedGroup = NAV_GROUPS[state.menuGroup] ? state.menuGroup : activeSurfaceGroup;

  if (!NAV_GROUPS[requestedGroup].surfaces.includes(state.surface)) {
    state.menuGroup = activeSurfaceGroup;
    return activeSurfaceGroup;
  }

  state.menuGroup = requestedGroup;
  return requestedGroup;
}

function getNavGroupLabel(groupId) {
  return NAV_GROUPS[groupId]?.label || NAV_GROUPS.workflows.label;
}

function getKnowledgeWorkDeliverableDisplayName(type) {
  return KNOWLEDGE_WORK_DELIVERABLES[type] || KNOWLEDGE_WORK_DELIVERABLES['decision-memo'];
}

function normalizeCompanyMember(entry, index = 0) {
  const role = COMPANY_ROLE_OPTIONS.some((option) => option.value === entry?.role)
    ? entry.role
    : 'builder';
  const surface = COMPANY_DESK_OPTIONS.some((option) => option.surface === entry?.surface)
    ? entry.surface
    : 'execution';
  const fallbackName = `Agent ${index + 1}`;

  return {
    id: String(entry?.id || `member-${index + 1}`),
    name: String(entry?.name || fallbackName).trim() || fallbackName,
    role,
    surface,
  };
}

function readCompanyMembers() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
  }

  try {
    const raw = window.localStorage.getItem(COMPANY_MEMBER_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
    }

    return parsed.map((entry, index) => normalizeCompanyMember(entry, index));
  } catch (_error) {
    return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
  }
}

function persistCompanyMembers() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(
      COMPANY_MEMBER_STORAGE_KEY,
      JSON.stringify(state.companyMembers.map((entry, index) => normalizeCompanyMember(entry, index))),
    );
  } catch (_error) {
    // Ignore storage failures and keep the in-memory directory.
  }
}

function getCompanyRoleLabel(role) {
  return COMPANY_ROLE_OPTIONS.find((option) => option.value === role)?.label || 'Builder';
}

function getCompanyDeskLabel(surface) {
  return COMPANY_DESK_OPTIONS.find((option) => option.surface === surface)?.label || 'Execution Desk';
}

const COUNCIL_CAST_ORDER = ['Conductor', 'Strategist', 'Architect', 'Decomposer'];
const ORCHESTRATION_FLOW_STEPS = [
  {
    id: 'intake',
    label: '안건 접수',
    owner: '운영자 · 안건 흐름',
    surface: 'mission',
    summary: '현재 안건 판단과 다음 이동을 시작합니다.',
  },
  {
    id: 'council',
    label: '참모 회의',
    owner: '회의 리드 + 참여 역할',
    surface: 'council',
    summary: '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다.',
  },
  {
    id: 'execution',
    label: '작업 지시',
    owner: '실행 역할 · 실행 흐름',
    surface: 'execution',
    summary: '현재 작업 지시와 다음 실행을 정리합니다.',
  },
  {
    id: 'deliverables',
    label: '결과 보고',
    owner: '결과 보고 · 보고 흐름',
    surface: 'deliverables',
    summary: '현재 보고 판단과 다음 행동을 확인합니다.',
  },
];
const ORCHESTRATION_RULES = [
  '프로젝트 지정 후 실행',
  '리뷰 후 완료',
  '승인 후 커밋',
  '한정된 실행 유지',
];
const COUNCIL_CAST_METADATA = {
  Conductor: {
    archetype: '정렬 책임',
    avatarLabel: '리드 아바타',
    avatarMood: '중앙 판단판을 보며 최종 방향을 고정합니다.',
    avatarStyle: 'lead',
    commandLine: '현재 결론과 다음 인계 판단을 한 지점에서 정리합니다.',
    deskLabel: '중앙 판단 데스크',
    deskProp: '최종 판단판 · 승인 묶음',
    displayName: '리드',
    mark: 'CN',
    officeLine: '최종 방향과 인계 승인을 보는 자리',
    orderLabel: '역할 순서 1',
    previewLine: '정렬 상태와 다음 인계 판단을 한 지점에서 확인합니다.',
    rank: '회의 리드',
    tone: 'accent',
  },
  Strategist: {
    archetype: '목표 정리',
    avatarLabel: '전략 아바타',
    avatarMood: '우선순위 표와 목표 문장을 동시에 정리합니다.',
    avatarStyle: 'strategist',
    commandLine: '목표 해석과 범위 조정을 맡는 전략 역할입니다.',
    deskLabel: '전략 판단 데스크',
    deskProp: '우선순위 표 · 전략 메모',
    displayName: '전략',
    mark: 'ST',
    officeLine: '목표와 우선순위를 다듬는 자리',
    orderLabel: '역할 순서 2',
    previewLine: '원하는 결과와 범위를 더 분명하게 정리합니다.',
    rank: '전략 역할',
    tone: 'success',
  },
  Architect: {
    archetype: '경계 보호',
    avatarLabel: '설계 아바타',
    avatarMood: '경계 도면을 펼친 채 파급 범위를 봉인합니다.',
    avatarStyle: 'architect',
    commandLine: '설계 파급을 줄이고 시스템 경계를 지키는 역할입니다.',
    deskLabel: '설계 검토 데스크',
    deskProp: '경계 도면 · 구조 메모',
    displayName: '설계',
    mark: 'AR',
    officeLine: '구조 리스크와 경계를 지키는 자리',
    orderLabel: '역할 순서 3',
    previewLine: '의미론 경계를 지키고 파급 범위를 작게 유지합니다.',
    rank: '설계 역할',
    tone: 'warning',
  },
  Decomposer: {
    archetype: '첫 실행 단위',
    avatarLabel: '실행 아바타',
    avatarMood: '첫 실행 셀과 체크포인트를 짧게 편성합니다.',
    avatarStyle: 'decomposer',
    commandLine: '첫 실행 단위를 정리하고 바로 인계 가능한 수준으로 나눕니다.',
    deskLabel: '실행 편성 데스크',
    deskProp: '체크포인트 표 · 실행 큐',
    displayName: '실행',
    mark: 'DC',
    officeLine: '첫 실행 셀과 체크포인트를 편성하는 자리',
    orderLabel: '역할 순서 4',
    previewLine: '의도를 바로 넘길 수 있는 첫 실행 단위로 나눕니다.',
    rank: '실행 역할',
    tone: 'neutral',
  },
};

function formatWorktreeOptionLabel(option) {
  const parts = [option.branch || 'detached', option.path];

  if (option.isCurrentProjectPath) {
    parts.push('현재 프로젝트 경로');
  }

  return parts.join(' · ');
}

function sortByCreatedDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

function getCouncilCastEntry(role, councilSession) {
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
    tone: meta.tone,
    transcriptContent: transcriptEntry?.content || null,
    transcriptStance: transcriptEntry?.stance || null,
  };
}

function getCompanySignalEntries(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const missionStatus = mission ? getMissionStatusDisplay(mission.status) : '초안 전';
  const missionTone = mission ? getMissionStatusTone(mission.status) : 'warning';
  const councilStatus = councilSession
    ? getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')
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
      copy: councilSession ? '네 역할이 같은 안건 아래에서 방향을 맞춥니다.' : '회의 준비 전이라 회의 흐름이 아직 열리지 않았습니다.',
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

function renderCharterSignalStrip(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const linkedTask = options.linkedTask || null;
  const cards = getCompanySignalEntries(options);

  return `
    <section class="relation-strip charter-signal-strip">
      <div class="card-title-row card-title-row-tight">
        <strong>운영 신호</strong>
        ${mission ? createToken(`안건:${mission.id}`, 'neutral') : createToken('안건:대기', 'warning')}
        ${councilSession ? createToken(`회의:${getCouncilStatusDisplay(councilSession.status)}`, getCouncilStatusTone(councilSession.status)) : createToken('회의:대기', 'warning')}
        ${linkedTask ? createToken(`실행:${linkedTask.id}`, 'accent') : createToken('실행:대기', 'warning')}
      </div>
      <p class="detail-copy detail-copy-compact charter-signal-intro">
        홈에서 본 전체 흐름이 여기선 현재 안건 흐름으로 더 촘촘하게 이어집니다.
      </p>
      <div class="charter-signal-grid">
        ${cards
          .map(
            (card) => `
              <article class="charter-signal-chip charter-signal-chip-${escapeHtml(card.surface)}">
                <div class="charter-signal-head">
                  <span class="charter-signal-dot charter-signal-dot-${escapeHtml(card.tone)}"></span>
                  <strong class="charter-signal-label">${escapeHtml(card.label)}</strong>
                </div>
                <p class="charter-signal-status">${escapeHtml(card.status)}</p>
                <p class="charter-signal-copy">${escapeHtml(card.copy)}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderOrchestrationCharter(options = {}) {
  const councilSession = options.councilSession || null;
  const mission = options.mission || null;
  const missionId = mission?.id || '';
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const agendaTitle = String(options.agendaTitle || '아직 정해진 안건 없음').trim();
  const agendaGoal = String(
    options.agendaGoal || '안건이 올라오면 목표와 범위를 먼저 고정합니다.',
  ).trim();
  const castEntries = Array.isArray(options.castEntries) && options.castEntries.length
    ? options.castEntries
    : COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const activeStepIndex = completionReady
    ? 3
    : linkedTask
      ? 2
      : councilSession
        ? 1
        : mission
          ? 0
          : 0;
  const flowEntries = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;

    return {
      ...step,
      statusLabel: isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
      tone: isActive ? 'accent' : isComplete ? 'success' : 'neutral',
      className: isActive
        ? 'charter-flow-step charter-flow-step-active'
        : isComplete
          ? 'charter-flow-step charter-flow-step-complete'
          : 'charter-flow-step',
    };
  });

  return `
    <section class="briefing-charter">
      <article class="charter-card charter-card-goal">
        <p class="charter-label">목표 헌장</p>
        <strong class="charter-title">${escapeHtml(agendaTitle)}</strong>
        <p class="charter-copy">${escapeHtml(agendaGoal)}</p>
      </article>
      <article class="charter-card">
        <p class="charter-label">역할 구성</p>
        <div class="charter-crew-list">
          ${castEntries
            .map(
              (castEntry) => `
                <div class="charter-crew-item">
                  <strong class="charter-crew-rank">${escapeHtml(castEntry.rank)}</strong>
                  <div class="charter-crew-copy">
                    <span class="charter-crew-name">${escapeHtml(castEntry.displayName)}</span>
                    <span class="charter-crew-duty">${escapeHtml(castEntry.commandLine)}</span>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </article>
      <article class="charter-card">
        <p class="charter-label">진행 흐름</p>
        <div class="charter-flow">
          ${flowEntries
            .map(
              (step, index) => `
              <button
                class="${step.className}"
                type="button"
                data-action="open-surface-for-mission"
                data-id="${escapeHtml(missionId)}"
                data-target-surface="${escapeHtml(step.surface)}"
                ${missionId ? '' : 'disabled'}
              >
                <strong class="charter-step-count">${index + 1}</strong>
                <div class="charter-step-copy">
                  <strong>${escapeHtml(step.label)}</strong>
                  <span class="charter-step-owner">${escapeHtml(step.owner)}</span>
                  <span>${escapeHtml(step.summary)}</span>
                </div>
                <span class="charter-flow-status">${createToken(step.statusLabel, step.tone)}</span>
              </button>
            `,
            )
            .join('')}
        </div>
      </article>
      <article class="charter-card">
        <p class="charter-label">운영 기준</p>
        <div class="token-row token-row-compact">
          ${ORCHESTRATION_RULES.map((rule) => createToken(rule, 'neutral')).join('')}
        </div>
        <p class="charter-copy">
          상단 연출은 방향 표시만 맡고, 실제 실행은 경계가 분명한 실행 흐름과 리뷰·승인 게이트를 그대로 따릅니다.
        </p>
      </article>
    </section>
    ${renderCharterSignalStrip({ mission, councilSession, linkedTask, completionReady })}
  `;
}

function renderCouncilCastCards(councilSession, options = {}) {
  const compact = Boolean(options.compact);
  const cardClassName = compact ? 'cast-card cast-card-compact' : 'cast-card';
  const gridClassName = compact ? 'cast-grid cast-grid-compact' : 'cast-grid';
  const roles = Array.isArray(councilSession?.participants) && councilSession.participants.length > 0
    ? COUNCIL_CAST_ORDER.filter((role) =>
        councilSession.participants.some((participant) => participant.role === role),
      )
    : COUNCIL_CAST_ORDER;

  return `
    <div class="${gridClassName}">
      ${roles
        .map((role) => {
          const castEntry = getCouncilCastEntry(role, councilSession);
          const isLead = role === COUNCIL_CAST_ORDER[0];
          const articleClassName = `${cardClassName} cast-card-${castEntry.tone}${isLead ? ' cast-card-lead' : ''}`;

          return `
            <article class="${articleClassName}">
              <div class="cast-mark-stack">
                <div class="cast-mark cast-mark-${castEntry.tone}">${escapeHtml(castEntry.mark)}</div>
                <div class="cast-order">${escapeHtml(castEntry.orderLabel)}</div>
              </div>
              <div class="cast-body">
                <div class="cast-rank-row">
                  <strong class="cast-rank">${escapeHtml(castEntry.rank)}</strong>
                  ${createToken(castEntry.archetype, castEntry.tone)}
                </div>
                <div class="card-title-row ${compact ? 'card-title-row-tight' : ''}">
                  <strong>${escapeHtml(castEntry.displayName)}</strong>
                  ${isLead ? createToken('최종 권고', 'accent') : createToken('참여 역할', 'neutral')}
                </div>
                <div class="cast-station-row">
                  <strong class="cast-station">${escapeHtml(castEntry.deskLabel)}</strong>
                  <span class="cast-station-copy">${escapeHtml(castEntry.officeLine)}</span>
                </div>
                <div class="cast-avatar-panel cast-avatar-panel-${castEntry.tone}">
                  <div class="cast-avatar-shell cast-avatar-shell-${castEntry.tone} cast-avatar-shell-${castEntry.avatarStyle}">
                    <div class="cast-avatar-head"></div>
                    <div class="cast-avatar-body"></div>
                    <div class="cast-avatar-eye cast-avatar-eye-left"></div>
                    <div class="cast-avatar-eye cast-avatar-eye-right"></div>
                    <div class="cast-avatar-smile"></div>
                    <div class="cast-avatar-accessory cast-avatar-accessory-${castEntry.avatarStyle}"></div>
                    <div class="cast-avatar-badge">${escapeHtml(castEntry.mark)}</div>
                  </div>
                  <div class="cast-avatar-copy">
                    <strong class="cast-avatar-label">${escapeHtml(castEntry.avatarLabel)}</strong>
                    <span class="cast-avatar-mood">${escapeHtml(castEntry.avatarMood)}</span>
                    <span class="cast-avatar-prop">${escapeHtml(castEntry.deskProp)}</span>
                  </div>
                </div>
                <p class="cast-command">${escapeHtml(castEntry.commandLine)}</p>
                <p class="cast-subtitle">${escapeHtml(castEntry.focus)}</p>
                ${
                  castEntry.transcriptStance
                    ? `
                      <div class="token-row token-row-compact">
                        ${createToken(castEntry.transcriptStance, 'neutral')}
                      </div>
                    `
                    : ''
                }
                <p class="cast-quote ${compact ? 'cast-quote-compact' : ''}">
                  ${escapeHtml(castEntry.transcriptContent || castEntry.previewLine)}
                </p>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderCouncilBoardroomStage(options = {}) {
  const councilSession = options.councilSession || null;
  const mission = options.mission || null;
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const compact = Boolean(options.compact);
  const stageClassName = compact ? 'boardroom-stage boardroom-stage-compact' : 'boardroom-stage';
  const heroClassName = compact
    ? 'briefing-hero briefing-hero-compact surface-entry-frame'
    : 'briefing-hero surface-entry-frame';
  const agendaTitle = String(
    options.agendaTitle ||
      councilSession?.selectedPlan?.scope ||
      state.missionDraftTitle ||
      '아직 올라온 안건 없음',
  ).trim();
  const agendaGoal = String(
    options.agendaGoal ||
      councilSession?.summary ||
      state.missionDraftGoal ||
      '안건이 올라오면 네 역할이 회의를 열고 목표와 방향을 함께 정합니다.',
  ).trim();
  const meetingStatus = councilSession
    ? getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')
    : '안건 대기';
  const meetingPhase = councilSession ? getCouncilStatusDisplay(councilSession.status) : '착석 전';
  const castEntries = COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const [leadEntry, leftEntry, rightEntry, bottomEntry] = castEntries;
  const openQuestions = Array.isArray(councilSession?.openQuestions) ? councilSession.openQuestions : [];
  const recommendationTitle =
    councilSession?.selectedPlan?.title ||
    councilSession?.recommendation ||
    councilSession?.summary ||
    '권고안 대기';
  const recommendationCopy =
    councilSession?.selectedPlan?.scope ||
    councilSession?.summary ||
    '권고안이 정리되면 승인 선반과 다음 인계가 이 칸에 함께 정리됩니다.';
  const approvalTitle = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? '결론 승인 완료'
      : '결론 승인 대기'
    : '회의 초안 필요';
  const approvalCopy = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? linkedTask
        ? `${linkedTask.id} 기준 실행 인계가 열려 있습니다.`
        : '승인은 끝났고 다음 실행 연결만 남았습니다.'
      : '권고안을 승인하면 사전 점검과 다음 인계 판단으로 넘어갑니다.'
    : '회의 초안을 열면 승인 선반이 채워집니다.';
  const activeStepIndex = completionReady
    ? 3
    : linkedTask
      ? 2
      : councilSession
        ? 1
        : mission
          ? 0
          : 0;
  const briefingSteps = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;
    const toneClassName = isActive
      ? 'briefing-step briefing-step-active'
      : isComplete
        ? 'briefing-step briefing-step-complete'
        : 'briefing-step';

    return `
      <span class="${toneClassName}">
        <span class="briefing-step-number">${index + 1}</span>
        <span class="briefing-step-copy">
          <strong class="briefing-step-label">${escapeHtml(step.label)}</strong>
          <span class="briefing-step-state">${escapeHtml(
            isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
          )}</span>
        </span>
      </span>
    `;
  }).join('');

  const renderSeat = (castEntry, className) => `
    <article class="boardroom-seat ${className} boardroom-seat-${castEntry.tone}">
      <div class="boardroom-seat-presence">
        <div class="boardroom-avatar-wrap">
          <div class="boardroom-avatar boardroom-avatar-${castEntry.tone}">${escapeHtml(castEntry.mark)}</div>
          <div class="boardroom-seat-presence-copy">
            <strong class="boardroom-seat-desk">${escapeHtml(castEntry.deskLabel)}</strong>
            <span class="boardroom-seat-station">${escapeHtml(castEntry.officeLine)}</span>
          </div>
        </div>
        ${createToken('착석 완료', castEntry.tone)}
      </div>
      <div class="boardroom-seat-portrait boardroom-seat-portrait-${castEntry.tone}">
        <div class="boardroom-seat-avatar-shell boardroom-seat-avatar-shell-${castEntry.tone} boardroom-seat-avatar-shell-${castEntry.avatarStyle}">
          <div class="boardroom-seat-avatar-head"></div>
          <div class="boardroom-seat-avatar-body"></div>
          <div class="boardroom-seat-avatar-eye boardroom-seat-avatar-eye-left"></div>
          <div class="boardroom-seat-avatar-eye boardroom-seat-avatar-eye-right"></div>
          <div class="boardroom-seat-avatar-smile"></div>
          <div class="boardroom-seat-avatar-accessory boardroom-seat-avatar-accessory-${castEntry.avatarStyle}"></div>
          <div class="boardroom-seat-avatar-badge">${escapeHtml(castEntry.mark)}</div>
        </div>
        <div class="boardroom-seat-avatar-copy">
          <strong class="boardroom-seat-avatar-label">${escapeHtml(castEntry.avatarLabel)}</strong>
          <span class="boardroom-seat-avatar-mood">${escapeHtml(castEntry.avatarMood)}</span>
          <span class="boardroom-seat-avatar-prop">${escapeHtml(castEntry.deskProp)}</span>
        </div>
      </div>
      <div class="boardroom-seat-head">
        <strong class="boardroom-seat-rank">${escapeHtml(castEntry.rank)}</strong>
        ${createToken(castEntry.archetype, castEntry.tone)}
      </div>
      <div class="boardroom-seat-name-row">
        <span class="boardroom-seat-name">${escapeHtml(castEntry.displayName)}</span>
        <span class="boardroom-seat-order">${escapeHtml(castEntry.orderLabel)}</span>
      </div>
      <p class="boardroom-seat-copy">${escapeHtml(castEntry.commandLine)}</p>
      <p class="boardroom-seat-focus">${escapeHtml(castEntry.focus)}</p>
    </article>
  `;

  return `
    <section class="${heroClassName} council-meeting-board">
      <div class="briefing-copy">
        <p class="eyebrow">회의 운영 데스크</p>
        <h2>${escapeHtml(options.heading || '참석 역할, 안건, 권고를 같은 회의실에서 정리합니다')}</h2>
        <p class="panel-copy">
          ${escapeHtml(
            options.copy ||
              'Council은 참석자, 안건, 이견, 권고, 승인 선반을 한 화면에서 읽는 표면입니다.',
          )}
        </p>
        <div class="token-row">
          ${createToken('참석 등록부', 'accent')}
          ${createToken(`회의:${meetingPhase}`, 'neutral')}
          ${createToken(`방향:${meetingStatus}`, councilSession ? getAlignmentTone(councilSession.alignment?.status || 'pending') : 'warning')}
        </div>
        <div class="briefing-steps">${briefingSteps}</div>
      </div>
      <div class="council-meeting-grid">
        <section class="council-meeting-card council-meeting-card-roster">
          <div class="card-title-row card-title-row-tight">
            <strong>참석 역할 등록부</strong>
            ${createToken(`역할:${castEntries.length}석`, 'neutral')}
          </div>
          <div class="council-meeting-attendance-list">
            ${castEntries
              .map(
                (castEntry) => `
                  <div class="council-meeting-attendance-row">
                    <div class="council-meeting-attendance-main">
                      <strong>${escapeHtml(castEntry.displayName)}</strong>
                      <span>${escapeHtml(castEntry.rank)}</span>
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken(castEntry.archetype, castEntry.tone)}
                    </div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
        <div class="${stageClassName}">
          ${renderSeat(leadEntry, 'boardroom-seat-lead')}
          ${renderSeat(leftEntry, 'boardroom-seat-left')}
          <section class="boardroom-table">
            <p class="boardroom-table-label">오늘 회의 안건</p>
            <strong class="boardroom-table-title">${escapeHtml(agendaTitle)}</strong>
            <p class="boardroom-table-copy">${escapeHtml(agendaGoal)}</p>
            <div class="token-row token-row-compact">
              ${createToken(`회의:${meetingPhase}`, 'accent')}
              ${createToken(`방향:${meetingStatus}`, councilSession ? getAlignmentTone(councilSession.alignment?.status || 'pending') : 'warning')}
              ${createToken(`열린이견:${openQuestions.length}`, openQuestions.length > 0 ? 'warning' : 'success')}
            </div>
            <p class="boardroom-table-foot">
              참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다.
            </p>
          </section>
          ${renderSeat(rightEntry, 'boardroom-seat-right')}
          ${renderSeat(bottomEntry, 'boardroom-seat-bottom')}
        </div>
        <div class="council-meeting-stack">
          <section class="council-meeting-card">
            <p class="council-meeting-label">권고안 선반</p>
            <strong class="council-meeting-title">${escapeHtml(recommendationTitle)}</strong>
            <p class="council-meeting-copy">${escapeHtml(recommendationCopy)}</p>
          </section>
          <section class="council-meeting-card">
            <p class="council-meeting-label">이견 보드</p>
            <div class="council-meeting-issue-list">
              ${
                openQuestions.length > 0
                  ? openQuestions
                      .slice(0, 3)
                      .map(
                        (question) => `
                          <p class="council-meeting-issue">${escapeHtml(question)}</p>
                        `,
                      )
                      .join('')
                  : '<p class="council-meeting-issue">열린 이견 없이 권고안 정리만 남았습니다.</p>'
              }
            </div>
          </section>
          <section class="council-meeting-card">
            <p class="council-meeting-label">승인 선반</p>
            <strong class="council-meeting-title">${escapeHtml(approvalTitle)}</strong>
            <p class="council-meeting-copy">${escapeHtml(approvalCopy)}</p>
          </section>
        </div>
      </div>
    </section>
  `;
}

function renderMissionIntakeBoard(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const project = options.project || null;
  const nextActionPreview = options.nextActionPreview || {
    actionLabel: '회의 초안 준비',
    summary: '첫 안건을 등록하면 회의 초안과 판단선이 바로 준비됩니다.',
    surface: 'council',
    tone: 'warning',
  };
  const activeCount = Number(options.activeCount || 0);
  const completedCount = Number(options.completedCount || 0);
  const missionCount = Number(options.missionCount || 0);
  const draftTitle = String(options.draftTitle || '').trim();
  const draftGoal = String(options.draftGoal || '').trim();
  const agendaTitle = draftTitle || mission?.title || '오늘 등록할 안건을 준비하세요';
  const agendaGoal =
    draftGoal ||
    mission?.goal ||
    '제목, 목표, 경계를 적어 등록대장에 올리면 회의 안건과 다음 처리선이 바로 열립니다.';
  const nextSurface = mission ? nextActionPreview.surface || 'mission' : 'council';
  const nextTitle = mission
    ? `${getSurfaceDisplayName(nextSurface)} · ${nextActionPreview.actionLabel}`
    : '회의 초안 대기';
  const nextCopy = mission
    ? nextActionPreview.summary
    : '첫 안건을 등록하면 회의 초안과 판단선이 바로 준비됩니다.';
  const meetingStatus = councilSession
    ? `${getCouncilStatusDisplay(councilSession.status)} · ${getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')}`
    : '회의 세션 없음';
  const activeStepIndex = mission ? (councilSession ? 1 : 0) : 0;
  const briefingSteps = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;
    const toneClassName = isActive
      ? 'briefing-step briefing-step-active'
      : isComplete
        ? 'briefing-step briefing-step-complete'
        : 'briefing-step';

    return `
      <span class="${toneClassName}">
        <span class="briefing-step-number">${index + 1}</span>
        <span class="briefing-step-copy">
          <strong class="briefing-step-label">${escapeHtml(step.label)}</strong>
          <span class="briefing-step-state">${escapeHtml(
            isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
          )}</span>
        </span>
      </span>
    `;
  }).join('');

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame mission-intake-board">
      <div class="mission-intake-copy">
        <p class="eyebrow">안건 등록대장</p>
        <h2>오늘 안건을 등록대장에 올리고 바로 다음 회의를 엽니다</h2>
        <p class="panel-copy">
          Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다.
        </p>
        <div class="token-row">
          ${createToken('등록대장', 'accent')}
          ${project ? createToken(`프로젝트:${project.name}`, 'success') : ''}
          ${createToken(`안건:${missionCount}`, missionCount > 0 ? 'neutral' : 'warning')}
          ${createToken(`진행:${activeCount}`, activeCount > 0 ? 'neutral' : 'warning')}
          ${createToken(
            `다음:${mission ? getSurfaceDisplayName(nextSurface) : '회의'}`,
            mission ? nextActionPreview.tone : 'warning',
          )}
        </div>
        <div class="briefing-steps">${briefingSteps}</div>
      </div>
      <div class="mission-intake-grid">
        <article class="mission-intake-card mission-intake-card-primary">
          <p class="mission-intake-label">신규 안건 등록</p>
          <strong class="mission-intake-title">${escapeHtml(agendaTitle)}</strong>
          <p class="mission-intake-copyline">${escapeHtml(agendaGoal)}</p>
          <p class="mission-intake-foot">입력선에서 제목, 목표, 경계를 등록한 뒤 바로 회의 안건으로 넘깁니다.</p>
        </article>
        <article class="mission-intake-card">
          <p class="mission-intake-label">배정 등록대장</p>
          <strong class="mission-intake-title">${escapeHtml(
            mission ? `${mission.id} · ${getMissionStatusDisplay(mission.status)}` : '선택 안건 없음',
          )}</strong>
          <p class="mission-intake-copyline">${escapeHtml(
            mission
              ? `현재 선택 안건은 ${mission.title}입니다. 진행 ${activeCount}건과 종료 ${completedCount}건 기준으로 등록대장을 읽습니다.`
              : `진행 ${activeCount}건과 종료 ${completedCount}건 기준으로 첫 안건 등록을 기다립니다.`,
          )}</p>
          <p class="mission-intake-foot">${escapeHtml(
            project ? `현재 프로젝트는 ${project.name}입니다.` : '프로젝트를 먼저 선택하세요.',
          )}</p>
        </article>
        <article class="mission-intake-card">
          <p class="mission-intake-label">다음 처리 트리거</p>
          <strong class="mission-intake-title">${escapeHtml(nextTitle)}</strong>
          <p class="mission-intake-copyline">${escapeHtml(nextCopy)}</p>
          <p class="mission-intake-foot">${escapeHtml(
            councilSession
              ? `현재 회의 상태는 ${meetingStatus}입니다.`
              : '신규 안건은 회의 초안과 판단선부터 시작합니다.',
          )}</p>
        </article>
      </div>
    </section>
  `;
}

function renderExecutionCommandDeck(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const task = options.task || null;
  const latestRun = options.latestRun || null;
  const approvalBridge = options.approvalBridge || null;
  const completionReady = Boolean(options.completionReady);
  const gateCopy = String(options.gateCopy || '아직 확정된 실행 지시가 없습니다.').trim();
  const gateLabel = approvalBridge?.actionLabel || '지시 정리 중';
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const executionCommandSignals = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask: task,
    completionReady,
  }).filter((entry) => ['council', 'execution', 'deliverables', 'decision-inbox'].includes(entry.surface));
  const gateQueueTitle = approvalBridge?.currentApproval
    ? `${getApprovalStatusDisplay(approvalBridge.currentApproval.status)} · ${gateLabel}`
    : '열린 승인선 없음';
  const gateQueueCopy =
    approvalBridge?.bridgeCopy ||
    approvalBridge?.nextStepCopy ||
    '열린 승인선이 없으면 현재 작업 지시를 바로 다음 실행으로 이어갈 수 있습니다.';
  const gateQueueFoot = approvalBridge?.pendingInboxItem
    ? `결정함 ${approvalBridge.pendingInboxItem.id}이 현재 처리 대기 중입니다.`
    : '결정함 대기 없이 현재 작업 지시를 이어갈 수 있습니다.';
  const latestRunSummary = latestRun
    ? `${formatDate(latestRun.startedAt)} 기준 ${getExecutionRoleDisplay(latestRun.role || latestRun.kind || 'none')}이 ${getRunStatusDisplay(latestRun.status)} 상태입니다.${latestRunNextStage ? ` 다음 단계는 ${getExecutionStageDisplay(latestRunNextStage)}입니다.` : ''}`
    : '회의 결론이 실행 셀로 내려오면 첫 실행 로그가 이곳에 나타납니다.';

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame execution-control-board">
      <div class="execution-control-copy">
        <p class="eyebrow">작업 지시 보드</p>
        <h2>현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다</h2>
        <p class="panel-copy">
          Execution은 회의 결론, 현재 작업 지시, 승인선, 최근 실행 로그를 같은 work-order 보드로 묶어 제어합니다.
        </p>
        <div class="token-row">
          ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
          ${task ? createToken(`실행셀:${task.id}`, 'accent') : createToken('실행셀:없음', 'warning')}
          ${task ? createToken(`상태:${getTaskLifecycleDisplay(task.lifecycleState)}`, 'neutral') : ''}
          ${createToken(`지시:${gateLabel}`, approvalBridge?.currentApproval?.status === 'pending' ? 'accent' : 'neutral')}
        </div>
        <div class="execution-command-signal-row">
          ${executionCommandSignals
            .map(
              (entry) => `
                <div class="execution-command-signal execution-command-signal-${escapeHtml(entry.surface)}">
                  <span class="execution-command-signal-dot execution-command-signal-dot-${escapeHtml(entry.tone)}"></span>
                  <span class="execution-command-signal-label">${escapeHtml(entry.label)}</span>
                  <strong class="execution-command-signal-status">${escapeHtml(entry.status)}</strong>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="execution-control-grid">
        <article class="execution-control-card execution-control-card-primary">
          <p class="execution-control-label">현재 작업 지시</p>
          <strong class="execution-control-title">${escapeHtml(gateLabel)}</strong>
          <p class="execution-control-copyline">${escapeHtml(gateCopy)}</p>
          <p class="execution-control-foot">현재 지시가 승인선 또는 결정함과 어떻게 이어지는지 이 칸에서 먼저 읽습니다.</p>
        </article>
        <article class="execution-control-card">
          <p class="execution-control-label">승인 게이트 큐</p>
          <strong class="execution-control-title">${escapeHtml(gateQueueTitle)}</strong>
          <p class="execution-control-copyline">${escapeHtml(gateQueueCopy)}</p>
          <p class="execution-control-foot">${escapeHtml(gateQueueFoot)}</p>
        </article>
        <article class="execution-control-card">
          <p class="execution-control-label">최근 실행 로그</p>
          <strong class="execution-control-title">${escapeHtml(
            latestRun
              ? `${getRunStatusDisplay(latestRun.status)} · ${getExecutionRoleDisplay(latestRun.role || latestRun.kind || 'none')}`
              : '로그 대기',
          )}</strong>
          <p class="execution-control-copyline">${escapeHtml(latestRunSummary)}</p>
          <p class="execution-control-foot">${escapeHtml(
            latestRunNextStage
              ? `다음 단계는 ${getExecutionStageDisplay(latestRunNextStage)}입니다.`
              : '첫 실행 로그가 생성되면 이 칸에 이어집니다.',
          )}</p>
        </article>
      </div>
    </section>
  `;
}

function renderNarrativeDeck(options = {}) {
  const eyebrow = String(options.eyebrow || '본부 브리핑').trim();
  const heading = String(options.heading || '현재 표면을 요약합니다.').trim();
  const copy = String(options.copy || '').trim();
  const tokens = Array.isArray(options.tokens) ? options.tokens.filter(Boolean) : [];
  const cards = Array.isArray(options.cards) ? options.cards.filter(Boolean) : [];
  const deckClassName = options.wide === false ? 'command-deck command-deck-detail' : 'command-deck command-deck-wide';
  const heroClassName = `briefing-hero briefing-hero-compact${options.entryFrame === true ? ' surface-entry-frame' : ''}`;

  return `
    <section class="${heroClassName}">
      <div class="briefing-copy">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(heading)}</h2>
        <p class="panel-copy">${escapeHtml(copy)}</p>
        ${tokens.length > 0 ? `<div class="token-row">${tokens.join('')}</div>` : ''}
        ${options.signalRow || ''}
      </div>
      <div class="${deckClassName}">
        ${cards
          .map(
            (card) => `
              <section class="command-deck-card">
                <p class="command-deck-label">${escapeHtml(card.label || '요약')}</p>
                <strong class="command-deck-title">${escapeHtml(card.title || '대기 중')}</strong>
                <p class="command-deck-copy">${escapeHtml(card.copy || '')}</p>
              </section>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderDeliverablesReportDeck(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const task = options.task || null;
  const currentArtifact = options.currentArtifact || null;
  const evidenceRail = options.evidenceRail || null;
  const latestApproval = options.latestApproval || null;
  const approvalBridge = options.approvalBridge || null;
  const latestReviewStatus = options.latestReviewStatus || 'pending';
  const missionCompletionReady = Boolean(options.missionCompletionReady);
  const deliverablesSignalEntries = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask: task,
    completionReady: missionCompletionReady,
  });
  const deliverablesReportSignals = ['execution', 'deliverables', 'decision-inbox', 'mission']
    .map((surface) => deliverablesSignalEntries.find((entry) => entry.surface === surface))
    .filter(Boolean);
  const reportTitle = currentArtifact
    ? `${getArtifactTypeDisplay(currentArtifact.type)} 패킷`
    : '패킷 대기';
  const reportCopy = currentArtifact
    ? `${currentArtifact.id} 패킷이 ${formatDate(currentArtifact.createdAt)} 기준 현재 전달 선반의 맨 위에 있습니다.`
    : '회의와 실행에서 올라온 결과 패킷이 아직 없습니다.';
  const reviewTitle =
    latestReviewStatus === 'approved'
      ? '승인 완료 · 리뷰 라인'
      : `리뷰 ${getReviewStatusDisplay(latestReviewStatus)}`;
  const reviewCopy =
    latestReviewStatus === 'approved'
      ? '현재 결과 패킷은 리뷰 라인을 통과했고, 다음 승인 라인 또는 종료 보고를 기다립니다.'
      : `현재 결과 패킷은 리뷰 라인에서 ${getReviewStatusDisplay(latestReviewStatus)} 상태입니다.`;
  const approvalTitle = latestApproval
    ? `${getApprovalStatusDisplay(latestApproval.status)} · 승인 라인`
    : '열린 승인 라인 없음';
  const approvalCopy = latestApproval
    ? `${getApprovalActionLabel(latestApproval.allowedNextAction) || latestApproval.scope} 안건이 ${latestApproval.targetArtifactId || '현재 결과 패킷'} 기준으로 ${getApprovalStatusDisplay(latestApproval.status)} 상태입니다.`
    : '현재 결과 패킷에는 사람이 처리할 승인 안건이 없습니다.';
  const closeOutTitle = missionCompletionReady ? '종료 보고 봉인' : approvalBridge?.actionLabel || '종료 보고 대기';
  const closeOutCopy = missionCompletionReady
    ? '종료 보고가 봉인됐습니다. 미션으로 돌아가 다음 안건을 올릴 수 있습니다.'
    : approvalBridge?.nextStepCopy || '승인 라인을 확인한 뒤 종료 보고 또는 다음 실행으로 넘어갑니다.';
  const closeOutFoot = missionCompletionReady
    ? '봉인된 종료 보고는 전달 종료 근거로 남습니다.'
    : '종료 보고 데스크는 현재 패킷의 마지막 전달 상태를 관리합니다.';

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame deliverables-delivery-board">
      <div class="deliverables-delivery-copy">
        <p class="eyebrow">전달 데스크</p>
        <h2>결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다</h2>
        <p class="panel-copy">
          Deliverables는 실행에서 올라온 결과 패킷을 리뷰 라인, 승인 라인, 종료 보고 데스크까지 같은 delivery board에서 이어 읽습니다.
        </p>
        <div class="token-row">
          ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
          ${task ? createToken(`실행셀:${task.id}`, 'accent') : createToken('실행셀:없음', 'warning')}
          ${evidenceRail ? createToken(`현재:${evidenceRail.currentOwnerLabel}`, evidenceRail.blockedReason ? 'danger' : 'accent') : ''}
          ${evidenceRail ? createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral') : ''}
          ${createToken(`리뷰:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus))}
          ${createToken(`완료:${missionCompletionReady ? '봉인' : '진행중'}`, missionCompletionReady ? 'success' : 'warning')}
        </div>
        <div class="deliverables-report-signal-row">
          ${deliverablesReportSignals
            .map(
              (entry) => `
                <div class="deliverables-report-signal deliverables-report-signal-${escapeHtml(entry.surface)}">
                  <span class="deliverables-report-signal-dot deliverables-report-signal-dot-${escapeHtml(entry.tone)}"></span>
                  <span class="deliverables-report-signal-label">${escapeHtml(entry.label)}</span>
                  <strong class="deliverables-report-signal-status">${escapeHtml(entry.status)}</strong>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="deliverables-delivery-grid">
        <article class="deliverables-delivery-card deliverables-delivery-card-primary">
          <p class="deliverables-delivery-label">현재 결과 패킷</p>
          <strong class="deliverables-delivery-title">${escapeHtml(reportTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(reportCopy)}</p>
          <p class="deliverables-delivery-foot">현재 전달 선반에서 가장 먼저 읽어야 할 결과 패킷입니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">리뷰 라인</p>
          <strong class="deliverables-delivery-title">${escapeHtml(reviewTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(reviewCopy)}</p>
          <p class="deliverables-delivery-foot">리뷰 라인은 승인 전 패킷 정합성을 먼저 확인합니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">승인 라인</p>
          <strong class="deliverables-delivery-title">${escapeHtml(approvalTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(approvalCopy)}</p>
          <p class="deliverables-delivery-foot">열린 승인 안건과 승인선 상태를 이 칸에서 바로 읽습니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">종료 보고 데스크</p>
          <strong class="deliverables-delivery-title">${escapeHtml(closeOutTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(closeOutCopy)}</p>
          <p class="deliverables-delivery-foot">${escapeHtml(closeOutFoot)}</p>
        </article>
      </div>
    </section>
  `;
}

function renderDeliverablesShelfSignalRow(entries = [], surfaces = []) {
  const selectedEntries = surfaces
    .map((surface) => entries.find((entry) => entry.surface === surface))
    .filter(Boolean);

  if (selectedEntries.length === 0) {
    return '';
  }

  return `
    <div class="deliverables-shelf-signal-row">
      ${selectedEntries
        .map(
          (entry) => `
            <div class="deliverables-shelf-signal deliverables-shelf-signal-${escapeHtml(entry.surface)}">
              <span class="deliverables-shelf-signal-dot deliverables-shelf-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="deliverables-shelf-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="deliverables-shelf-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderDeliverablesOpsEntryRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="deliverables-ops-entry-row">
      ${entries
        .map(
          (entry) => `
            <div class="deliverables-ops-entry deliverables-ops-entry-${escapeHtml(entry.surface)}">
              <div class="deliverables-ops-entry-head">
                <span class="deliverables-ops-entry-dot deliverables-ops-entry-dot-${escapeHtml(entry.tone)}"></span>
                <span class="deliverables-ops-entry-label">${escapeHtml(entry.label)}</span>
              </div>
              <strong class="deliverables-ops-entry-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderTaskboardOpsEntrySignalRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="taskboard-ops-entry-signal-row">
      ${entries
        .map(
          (entry) => `
            <div class="taskboard-ops-entry-signal taskboard-ops-entry-signal-${escapeHtml(entry.surface)}">
              <span class="taskboard-ops-entry-signal-dot taskboard-ops-entry-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="taskboard-ops-entry-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="taskboard-ops-entry-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function getAdvancedOpsEntrySignals(options = {}) {
  const data = options.data || {};
  const task = options.task || null;
  const currentRun =
    options.currentRun || (task?.latestRunId ? data.runMap?.get(task.latestRunId) || null : null);
  const currentArtifact =
    options.currentArtifact ||
    (task && Array.isArray(data.artifacts)
      ? getTaskArtifacts(task.id, data.artifacts).sort(sortByCreatedDesc)[0] || null
      : null);
  const currentInboxItem =
    options.currentInboxItem || (task ? getPreferredTaskInboxItem(task.id, data) : null);
  const pendingApprovalCount = Number.isFinite(options.pendingApprovalCount)
    ? options.pendingApprovalCount
    : 0;
  const pendingDecisionCount = Number.isFinite(options.pendingDecisionCount)
    ? options.pendingDecisionCount
    : 0;

  return [
    {
      surface: 'taskboard',
      label: '작업판',
      status: task ? getTaskLifecycleDisplay(task.lifecycleState) : '셀 없음',
      tone: task ? getTaskLifecycleTone(task.lifecycleState) : 'warning',
    },
    {
      surface: 'logs',
      label: '로그',
      status: currentRun ? getRunStatusDisplay(currentRun.status) : 'run 없음',
      tone: currentRun ? getRunTone(currentRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: currentArtifact ? getArtifactTypeDisplay(currentArtifact.type) : '증적 없음',
      tone:
        currentArtifact?.type === 'close-out'
          ? 'success'
          : currentArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: currentInboxItem
        ? `${getInboxKindDisplay(currentInboxItem.kind)} ${getInboxStatusDisplay(currentInboxItem.status)}`
        : pendingApprovalCount > 0
          ? `승인 ${pendingApprovalCount}건`
          : pendingDecisionCount > 0
            ? `확인 ${pendingDecisionCount}건`
            : '대기 없음',
      tone: currentInboxItem
        ? getInboxTone(currentInboxItem)
        : pendingApprovalCount > 0
          ? 'accent'
          : pendingDecisionCount > 0
            ? 'warning'
            : 'success',
    },
  ];
}

function renderAdvancedOpsEntrySignalRow(entries = []) {
  if (entries.length === 0) {
    return '';
  }

  return `
    <div class="advanced-ops-entry-signal-row">
      ${entries
        .map(
          (entry) => `
            <div class="advanced-ops-entry-signal advanced-ops-entry-signal-${escapeHtml(entry.surface)}">
              <span class="advanced-ops-entry-signal-dot advanced-ops-entry-signal-dot-${escapeHtml(entry.tone)}"></span>
              <span class="advanced-ops-entry-signal-label">${escapeHtml(entry.label)}</span>
              <strong class="advanced-ops-entry-signal-status">${escapeHtml(entry.status)}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderOpsCenterDeck(options = {}) {
  return renderNarrativeDeck({
    eyebrow: options.eyebrow || '본부 관제실',
    heading: options.heading || '심층 근거를 들여다보는 관제실',
    copy:
      options.copy ||
      '회의와 실행 아래에 남는 원문 기록, 증적, 승인선은 관제실에서 확인합니다.',
    entryFrame: options.entryFrame === true,
    tokens: options.tokens || [],
    cards: options.cards || [],
  });
}

function createEmptyDerivedState() {
  return {
    activeProjectLinkedWorktrees: {
      error: null,
      notice: null,
      options: [],
      projectId: null,
      projectPath: null,
      resolvedProjectPath: null,
    },
    closeOutReadinessSummaries: {},
    commitExecutionReadinessSummaries: {},
    commitPackageReadinessSummaries: {},
    executionEntrySummaries: {},
    harnessConsumerStatus: null,
    harnessConsumerBrief: null,
    latestHarnessExecution: null,
    recentHarnessExecutions: [],
    providerExecutionSummaries: {},
    releasePackageReadinessSummaries: {},
    reviewerReadinessSummaries: {},
    taskGuardSummaries: {},
  };
}

function getProjectProviderConfig(project) {
  const provider = project?.provider && typeof project.provider === 'object' ? project.provider : {};
  const env = provider.env && typeof provider.env === 'object' ? provider.env : {};
  const mode = provider.mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: mode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: mode === 'live' ? env.apiKeyVar || '' : '',
    },
    mode,
    model: mode === 'live' ? provider.model || '' : '',
  };
}

function getProviderExecutionSummary(project, data) {
  if (!project?.id) {
    return null;
  }

  return data.derived.providerExecutionSummaries?.[project.id] || null;
}

function getHarnessConsumerBrief(data) {
  const payload = data?.derived?.harnessConsumerBrief;

  if (payload?.ok === true && payload.mode === 'harness-consumer-brief' && payload.brief) {
    return payload.brief;
  }

  return null;
}

function getHarnessConsumerStatus(data) {
  const payload = data?.derived?.harnessConsumerStatus;

  if (
    payload?.ok === true &&
    payload.mode === 'harness-consumer-status' &&
    payload.statusCard &&
    payload.operatorAction
  ) {
    return payload;
  }

  return null;
}

function getLatestHarnessExecution(data, statusPayload) {
  const snapshot = data?.snapshot || {};
  const activeProjectId = snapshot.activeProjectId || null;
  const representativeHarnessId = statusPayload?.statusCard?.primaryHarnessId || null;
  const derivedLatestHarnessExecution = data?.derived?.latestHarnessExecution || null;

  for (const candidate of [state.lastHarnessExecutionResult, derivedLatestHarnessExecution]) {
    if (!candidate?.harnessId || !representativeHarnessId) {
      continue;
    }

    if (candidate.harnessId !== representativeHarnessId) {
      continue;
    }

    if ((candidate.projectId || null) !== activeProjectId) {
      continue;
    }

    return candidate;
  }

  return null;
}

function getHarnessExecutionResultKey(execution) {
  if (!execution?.harnessId) {
    return null;
  }

  return [
    execution.projectId || '',
    execution.harnessId || '',
    execution.executedAt || '',
    execution.resolvedInputPath || execution.inputPath || '',
    execution.resolvedOutputPath || execution.outputPath || '',
  ].join('::');
}

function isHarnessExecutionResultHidden(execution) {
  const executionKey = getHarnessExecutionResultKey(execution);

  return Boolean(
    executionKey &&
      state.hiddenHarnessExecutionResultKey &&
      state.hiddenHarnessExecutionResultKey === executionKey,
  );
}

function getRecentHarnessExecutions(data, statusPayload) {
  const snapshot = data?.snapshot || {};
  const activeProjectId = snapshot.activeProjectId || null;
  const representativeHarnessId = statusPayload?.statusCard?.primaryHarnessId || null;
  const recentHarnessExecutions = Array.isArray(data?.derived?.recentHarnessExecutions)
    ? data.derived.recentHarnessExecutions
    : [];

  if (!representativeHarnessId) {
    return [];
  }

  return recentHarnessExecutions.filter((candidate) => {
    if (!candidate?.harnessId) {
      return false;
    }

    if (candidate.harnessId !== representativeHarnessId) {
      return false;
    }

    return (candidate.projectId || null) === activeProjectId;
  });
}

function getHarnessBriefSignalValue(brief) {
  if (!brief?.primaryHarnessId) {
    return '대표 하네스 없음';
  }

  return `${brief.primaryHarnessId} · ${brief.actionLabel || 'No action'}`;
}

function getHarnessBriefActionTone(brief) {
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

function getHarnessBriefHostStateLabel(brief) {
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

function getHarnessOperatorActionLabel(operatorAction) {
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

function getHarnessOperatorActionTone(operatorAction) {
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

function renderHarnessExecutionActionShelf(statusPayload) {
  const statusCard = statusPayload?.statusCard || null;
  const operatorAction = statusPayload?.operatorAction || null;
  const data = getDerived();
  const harnessExecutionResult = getLatestHarnessExecution(data, statusPayload);
  const visibleHarnessExecutionResult = isHarnessExecutionResultHidden(harnessExecutionResult)
    ? null
    : harnessExecutionResult;
  const hiddenHarnessExecutionResult =
    harnessExecutionResult?.harnessId === statusCard?.primaryHarnessId && !visibleHarnessExecutionResult
      ? harnessExecutionResult
      : null;
  const recentHarnessExecutions = getRecentHarnessExecutions(data, statusPayload);
  const hasExecutionHistory =
    (harnessExecutionResult?.harnessId === statusCard?.primaryHarnessId) ||
    recentHarnessExecutions.length > 0;

  if (!statusCard?.primaryHarnessId || !operatorAction?.kind || operatorAction.kind === 'none') {
    return '';
  }

  return `
    <section class="ops-editor-scope" data-panel-state="readonly" data-harness-execution-action="true">
      <div class="ops-section-head">
        <div>
          <p class="control-overview-label">Harness operator action</p>
          <h4 class="ops-section-title">하네스 실행 액션</h4>
        </div>
        ${createToken(getHarnessOperatorActionLabel(operatorAction), getHarnessOperatorActionTone(operatorAction))}
      </div>
      <p class="control-overview-copy">${escapeHtml(operatorAction.message || '대표 하네스 액션이 아직 준비되지 않았습니다.')}</p>
      <div class="control-overview-register">
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">대표</span>
          <strong class="control-overview-register-value">${escapeHtml(statusCard.primaryHarnessId)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">액션</span>
          <strong class="control-overview-register-value">${escapeHtml(getHarnessOperatorActionLabel(operatorAction))}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">호스트</span>
          <strong class="control-overview-register-value">${escapeHtml(getHarnessBriefHostStateLabel({ currentHostState: statusCard.currentHostState }))}</strong>
        </div>
      </div>
      ${
        operatorAction.repoNativeCommand
          ? `
            <form class="stack" data-form="run-harness-operator-action" data-harness-execution-form="true">
              <div class="harness-run-command-desk" data-harness-run-command-desk="true">
                <div class="harness-run-prep-cluster" data-harness-run-prep-cluster="true">
                  <div
                    class="control-overview-copy harness-run-template-note"
                    data-harness-run-template-note="true"
                  >
                    <span class="harness-run-template-kicker">실행 템플릿</span>
                    <code class="harness-run-template-command">${escapeHtml(operatorAction.repoNativeCommand)}</code>
                  </div>
                  <div
                    class="field-grid field-grid-compact harness-run-field-rack"
                    data-harness-run-field-rack="true"
                  >
                    <label class="field field-compact">
                      <span class="field-label">입력 파일 경로</span>
                      <input
                        name="inputPath"
                        type="text"
                        placeholder="docs/example.md"
                        required
                        value="${escapeHtml(state.harnessExecutionDraftInputPath)}"
                        data-harness-input-path="true"
                      />
                    </label>
                    <label class="field field-compact">
                      <span class="field-label">출력 파일 경로</span>
                      <input
                        name="outputPath"
                        type="text"
                        placeholder="tmp/markitdown-output.md"
                        value="${escapeHtml(state.harnessExecutionDraftOutputPath)}"
                        data-harness-output-path="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  class="form-actions form-actions-inline harness-run-action-shelf"
                  data-harness-run-action-shelf="true"
                >
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="copy-harness-command"
                    data-command="${escapeHtml(operatorAction.repoNativeCommand)}"
                    data-harness-operator-command="true"
                  >
                    명령 복사
                  </button>
                  ${
                    hasExecutionHistory
                      ? `
                        <button
                          class="secondary-button"
                          type="button"
                          data-action="clear-harness-execution-history"
                          data-harness-clear-history="true"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          실행 기록 비우기
                        </button>
                      `
                      : ''
                  }
                  <button
                    class="primary-button"
                    type="submit"
                    data-harness-run-submit="true"
                    ${state.loading || state.mutating ? 'disabled' : ''}
                  >
                    하네스 실행
                  </button>
                </div>
              </div>
              <p
                class="form-help form-help-policy-note"
                data-harness-run-path-guidance="true"
              >
                <span class="form-help-policy-kicker">경로 정책</span>
                <span class="form-help-policy-copy">상대 경로는 현재 프로젝트 경로 기준으로 풀고, 절대 경로는 현재 프로젝트 경로, <code>repo root</code>, 또는 <code>/tmp</code> 하위만 허용합니다.</span>
              </p>
            </form>
            ${
              visibleHarnessExecutionResult?.harnessId === statusCard.primaryHarnessId
                ? `
                  <section class="relation-strip relation-strip-compact" data-harness-execution-result="true">
                    <div class="card-title-row card-title-row-tight">
                      <strong>최근 실행 결과</strong>
                      ${createToken('완료', 'success')}
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken(`대표:${visibleHarnessExecutionResult.harnessId}`, 'neutral')}
                      ${
                        visibleHarnessExecutionResult.outputPath
                          ? createToken('출력 파일', 'accent')
                          : createToken('표준 출력', 'neutral')
                      }
                      ${
                        visibleHarnessExecutionResult.executedAt
                          ? createToken(`실행:${formatDate(visibleHarnessExecutionResult.executedAt)}`, 'neutral')
                          : ''
                      }
                    </div>
                    <p class="detail-copy detail-copy-compact">입력: <code>${escapeHtml(visibleHarnessExecutionResult.resolvedInputPath || visibleHarnessExecutionResult.inputPath || '')}</code></p>
                    ${
                      visibleHarnessExecutionResult.resolvedOutputPath
                        ? `<p class="detail-copy detail-copy-compact">출력: <code>${escapeHtml(visibleHarnessExecutionResult.resolvedOutputPath)}</code></p>`
                        : ''
                    }
                    ${
                      visibleHarnessExecutionResult.resolvedInputPath || visibleHarnessExecutionResult.resolvedOutputPath
                        ? `
                          <div class="form-actions form-actions-inline form-actions-compact">
                            ${
                              visibleHarnessExecutionResult.resolvedInputPath
                                ? `
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="copy-harness-input-path"
                                    data-input-path="${escapeHtml(visibleHarnessExecutionResult.resolvedInputPath)}"
                                    data-harness-input-copy="true"
                                  >
                                    입력 경로
                                  </button>
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="reuse-harness-execution-paths"
                                    data-input-path="${escapeHtml(visibleHarnessExecutionResult.resolvedInputPath)}"
                                    data-output-path="${escapeHtml(visibleHarnessExecutionResult.resolvedOutputPath || visibleHarnessExecutionResult.outputPath || '')}"
                                    data-harness-result-reuse="true"
                                  >
                                    경로 채우기
                                  </button>
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="rerun-harness-execution-paths"
                                    data-input-path="${escapeHtml(visibleHarnessExecutionResult.resolvedInputPath)}"
                                    data-output-path="${escapeHtml(visibleHarnessExecutionResult.resolvedOutputPath || visibleHarnessExecutionResult.outputPath || '')}"
                                    data-harness-result-rerun="true"
                                    ${state.loading || state.mutating ? 'disabled' : ''}
                                  >
                                    같은 경로 재실행
                                  </button>
                                `
                                : ''
                            }
                            ${
                              visibleHarnessExecutionResult.resolvedOutputPath
                                ? `
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="copy-harness-output-path"
                                    data-output-path="${escapeHtml(visibleHarnessExecutionResult.resolvedOutputPath)}"
                                    data-harness-output-copy="true"
                                  >
                                    출력 경로
                                  </button>
                                `
                                : ''
                            }
                            ${
                              visibleHarnessExecutionResult.outputPreview || visibleHarnessExecutionResult.stdoutPreview
                                ? `
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="copy-harness-execution-preview"
                                    data-preview-text="${escapeHtml(visibleHarnessExecutionResult.outputPreview || visibleHarnessExecutionResult.stdoutPreview || '')}"
                                    data-harness-preview-copy="true"
                                  >
                                    미리보기
                                  </button>
                                `
                                : ''
                            }
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="hide-harness-execution-result"
                              data-execution-key="${escapeHtml(getHarnessExecutionResultKey(visibleHarnessExecutionResult) || '')}"
                              data-harness-result-hide="true"
                            >
                              결과 숨기기
                            </button>
                          </div>
                        `
                        : ''
                    }
                    ${
                      visibleHarnessExecutionResult.outputPreview
                        ? `<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">${escapeHtml(visibleHarnessExecutionResult.outputPreview)}</pre>`
                        : visibleHarnessExecutionResult.stdoutPreview
                          ? `<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">${escapeHtml(visibleHarnessExecutionResult.stdoutPreview)}</pre>`
                          : '<p class="detail-copy detail-copy-compact">미리보기 가능한 출력이 없습니다.</p>'
                    }
                  </section>
                `
                : ''
            }
            ${
              hiddenHarnessExecutionResult?.harnessId === statusCard.primaryHarnessId
                ? `
                  <section class="relation-strip relation-strip-hidden-compact" data-harness-execution-result-hidden="true">
                    <div class="card-title-row card-title-row-tight">
                      <strong>최근 실행 결과가 숨겨져 있습니다</strong>
                      ${createToken('숨김', 'neutral')}
                    </div>
                    <p class="detail-copy detail-copy-compact">필요하면 방금 숨긴 실행 결과를 다시 표시할 수 있습니다.</p>
                    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-run-context="true">
                      <div class="card-title-row card-title-row-tight">
                        <strong>실행 기록</strong>
                      </div>
                      ${
                        hiddenHarnessExecutionResult.executedAt
                          ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-executed-at-summary="true">실행 시각: <code>${escapeHtml(formatDate(hiddenHarnessExecutionResult.executedAt))}</code></p>`
                          : ''
                      }
                      ${
                        hiddenHarnessExecutionResult.resolvedInputPath
                          ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-input-summary="true">입력: <code>${escapeHtml(hiddenHarnessExecutionResult.resolvedInputPath)}</code></p>`
                          : ''
                      }
                      ${
                        hiddenHarnessExecutionResult.resolvedOutputPath
                          ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-output-summary="true">출력: <code>${escapeHtml(hiddenHarnessExecutionResult.resolvedOutputPath)}</code></p>`
                          : ''
                      }
                    </section>
                    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-harness-context="true">
                      <div class="card-title-row card-title-row-tight">
                        <strong>하네스 컨텍스트</strong>
                      </div>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-harness-summary="true">대표 하네스: <code>${escapeHtml(statusCard.primaryHarnessId)}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-kind-summary="true">하네스 종류: <code>${escapeHtml(statusCard.primaryKind || '미확인')}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-command-summary="true">대표 명령: <code>${escapeHtml(statusCard.primaryCommand || '미확인')}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-runner-summary="true">대표 러너: <code>${escapeHtml(statusCard.primaryRunner || '미확인')}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-posture-summary="true">대표 정책: <code>${escapeHtml(statusCard.primaryPosture || '미확인')}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-state-summary="true">현재 상태: <code>${escapeHtml(statusCard.primaryHarnessState)}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-host-summary="true">호스트 상태: <code>${escapeHtml(getHarnessBriefHostStateLabel({ currentHostState: statusCard.currentHostState }))}</code></p>
                    </section>
                    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-operator-context="true">
                      <div class="card-title-row card-title-row-tight">
                        <strong>운영 컨텍스트</strong>
                      </div>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-action-summary="true">권장 액션: <code>${escapeHtml(getHarnessOperatorActionLabel(operatorAction))}</code></p>
                      <p class="detail-copy detail-copy-compact" data-harness-result-hidden-command-summary="true">실행 템플릿: <code>${escapeHtml(operatorAction.repoNativeCommand)}</code></p>
                      ${
                        operatorAction.message
                          ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-message-summary="true">운영 메모: ${escapeHtml(operatorAction.message)}</p>`
                          : ''
                      }
                    </section>
                    <div class="form-actions form-actions-inline form-actions-hidden-compact">
                      <button
                        class="secondary-button"
                        type="button"
                        data-action="show-harness-execution-result"
                        data-execution-key="${escapeHtml(getHarnessExecutionResultKey(hiddenHarnessExecutionResult) || '')}"
                        data-harness-result-show="true"
                      >
                        결과 다시 보기
                      </button>
                      ${
                        hiddenHarnessExecutionResult.resolvedInputPath
                          ? `
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="copy-harness-input-path"
                              data-input-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedInputPath)}"
                              data-harness-result-hidden-input-copy="true"
                            >
                              입력 경로
                            </button>
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="reuse-harness-execution-paths"
                              data-input-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedInputPath)}"
                              data-output-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedOutputPath || hiddenHarnessExecutionResult.outputPath || '')}"
                              data-harness-result-hidden-reuse="true"
                            >
                              경로 채우기
                            </button>
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="rerun-harness-execution-paths"
                              data-input-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedInputPath)}"
                              data-output-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedOutputPath || hiddenHarnessExecutionResult.outputPath || '')}"
                              data-harness-result-hidden-rerun="true"
                              ${state.loading || state.mutating ? 'disabled' : ''}
                            >
                              같은 경로 재실행
                            </button>
                          `
                          : ''
                      }
                      ${
                        hiddenHarnessExecutionResult.resolvedOutputPath
                          ? `
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="copy-harness-output-path"
                              data-output-path="${escapeHtml(hiddenHarnessExecutionResult.resolvedOutputPath)}"
                              data-harness-result-hidden-output-copy="true"
                            >
                              출력 경로
                            </button>
                          `
                          : ''
                      }
                      ${
                        hiddenHarnessExecutionResult.outputPreview || hiddenHarnessExecutionResult.stdoutPreview
                          ? `
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="copy-harness-execution-preview"
                              data-preview-text="${escapeHtml(hiddenHarnessExecutionResult.outputPreview || hiddenHarnessExecutionResult.stdoutPreview || '')}"
                              data-harness-result-hidden-preview-copy="true"
                            >
                              미리보기
                            </button>
                          `
                          : ''
                      }
                    </div>
                    ${
                      hiddenHarnessExecutionResult.outputPreview || hiddenHarnessExecutionResult.stdoutPreview
                        ? `<pre class="log-viewer log-viewer-compact" data-harness-result-hidden-preview="true">${escapeHtml(hiddenHarnessExecutionResult.outputPreview || hiddenHarnessExecutionResult.stdoutPreview)}</pre>`
                        : ''
                    }
                  </section>
                `
                : ''
            }
            ${
              recentHarnessExecutions.length
                ? `
                  <section class="relation-strip relation-strip-compact" data-harness-execution-history="true">
                    <div class="card-title-row card-title-row-tight">
                      <strong>실행 기록</strong>
                      ${createToken(`${recentHarnessExecutions.length}건`, 'neutral')}
                    </div>
                    <div class="stack harness-execution-history-list-compact" data-harness-execution-history-list="true">
                      ${recentHarnessExecutions
                        .map(
                          (execution, index) => `
                            <div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">
                              <div class="control-overview-register-row">
                                <span class="control-overview-register-label">실행</span>
                                <strong class="control-overview-register-value">${escapeHtml(formatDate(execution.executedAt))}</strong>
                              </div>
                              <div class="control-overview-register-row">
                                <span class="control-overview-register-label">입력</span>
                                <strong class="control-overview-register-value">${escapeHtml(execution.inputPath || execution.resolvedInputPath || '경로 없음')}</strong>
                              </div>
                              <div class="control-overview-register-row">
                                <span class="control-overview-register-label">출력</span>
                                <strong class="control-overview-register-value">${escapeHtml(execution.outputPath || execution.resolvedOutputPath || '표준 출력 전용')}</strong>
                              </div>
                              <div class="form-actions form-actions-inline form-actions-compact">
                                ${
                                  execution.inputPath || execution.resolvedInputPath
                                    ? `
                                      <button
                                        class="secondary-button"
                                        type="button"
                                        data-action="copy-harness-input-path"
                                        data-input-path="${escapeHtml(execution.inputPath || execution.resolvedInputPath || '')}"
                                        data-harness-input-copy="true"
                                      >
                                        입력 경로
                                      </button>
                                    `
                                    : ''
                                }
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="restore-harness-execution-preview"
                                  data-history-index="${String(index)}"
                                  data-harness-history-preview="true"
                                >
                                  결과 다시 보기
                                </button>
                                ${
                                  execution.outputPath || execution.resolvedOutputPath
                                    ? `
                                      <button
                                        class="secondary-button"
                                        type="button"
                                        data-action="copy-harness-output-path"
                                        data-output-path="${escapeHtml(execution.outputPath || execution.resolvedOutputPath || '')}"
                                        data-harness-output-copy="true"
                                      >
                                        출력 경로
                                      </button>
                                    `
                                    : ''
                                }
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="reuse-harness-execution-paths"
                                  data-input-path="${escapeHtml(execution.inputPath || execution.resolvedInputPath || '')}"
                                  data-output-path="${escapeHtml(execution.outputPath || execution.resolvedOutputPath || '')}"
                                  data-harness-history-reuse="true"
                                >
                                  경로 채우기
                                </button>
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="rerun-harness-execution-paths"
                                  data-input-path="${escapeHtml(execution.inputPath || execution.resolvedInputPath || '')}"
                                  data-output-path="${escapeHtml(execution.outputPath || execution.resolvedOutputPath || '')}"
                                  data-harness-history-rerun="true"
                                  ${state.loading || state.mutating ? 'disabled' : ''}
                                >
                                  같은 경로 재실행
                                </button>
                              </div>
                            </div>
                          `,
                        )
                        .join('')}
                    </div>
                  </section>
                `
                : ''
            }
          `
          : ''
      }
    </section>
  `;
}

function renderHarnessBriefRegister(brief) {
  if (!brief?.primaryHarnessId) {
    return '';
  }

  const showOpenExecution = state.surface !== 'execution';
  const showCommandActions = Boolean(brief.actionCommand) || showOpenExecution;

  return `
    <section class="ops-editor-scope" data-panel-state="readonly" data-harness-register="true">
      <div class="ops-section-head">
        <div>
          <p class="control-overview-label">Harness brief</p>
          <h4 class="ops-section-title">하네스 실행 안내</h4>
        </div>
        ${brief.actionLabel ? createToken(brief.actionLabel, getHarnessBriefActionTone(brief)) : ''}
      </div>
      <p class="control-overview-copy">${escapeHtml(brief.headline || '대표 하네스 안내가 아직 준비되지 않았습니다.')}</p>
      <div class="control-overview-register">
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">대표</span>
          <strong class="control-overview-register-value">${escapeHtml(brief.primaryHarnessId)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(getHarnessBriefHostStateLabel(brief))}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(brief.actionLabel || 'No action')}</strong>
        </div>
      </div>
      <p class="control-overview-copy">${escapeHtml(brief.actionMessage || '대표 하네스 지시가 아직 준비되지 않았습니다.')}</p>
      ${brief.actionCommand ? `<p class="control-overview-copy">명령 템플릿: <code>${escapeHtml(brief.actionCommand)}</code></p>` : ''}
      ${
        showCommandActions
          ? `
            <div class="form-actions form-actions-inline">
              ${
                brief.actionCommand
                  ? `
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="copy-harness-command"
                      data-command="${escapeHtml(brief.actionCommand)}"
                      data-harness-copy-command="true"
                    >
                      명령 복사
                    </button>
                  `
                  : ''
              }
              ${
                showOpenExecution
                  ? `
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-surface"
                      data-target-surface="execution"
                      data-harness-open-execution="true"
                    >
                      실행 데스크 열기
                    </button>
                  `
                  : ''
              }
            </div>
          `
          : ''
      }
    </section>
  `;
}

function syncProjectProviderDraft(project) {
  const config = getProjectProviderConfig(project);

  state.projectProviderDraftProjectId = project?.id || null;
  state.projectProviderDraftMode = config.mode;
  state.projectProviderDraftModel = config.model;
  state.projectProviderDraftApiKeyVar = config.env.apiKeyVar;
}

function getActivePayload() {
  return (
    state.payload || {
      artifactCatalog: {},
      derived: createEmptyDerivedState(),
      snapshot: {
        activeProjectId: null,
        selectedMissionId: null,
        missions: {},
        councilSessions: {},
        projects: {},
        tasks: {},
        runs: {},
        artifacts: {},
        decisionInboxItems: {},
        approvals: {},
      },
    }
  );
}

function getDerived() {
  const payload = getActivePayload();
  const snapshot = payload.snapshot;

  const projects = Object.values(snapshot.projects).sort(sortByCreatedDesc);
  const missions = Object.values(snapshot.missions || {}).sort(sortByCreatedDesc);
  const councilSessions = Object.values(snapshot.councilSessions || {}).sort(sortByCreatedDesc);
  const tasks = Object.values(snapshot.tasks).sort(sortByCreatedDesc);
  const runs = Object.values(snapshot.runs).sort(sortByCreatedDesc);
  const artifacts = Object.values(snapshot.artifacts).sort(sortByCreatedDesc);
  const inboxItems = Object.values(snapshot.decisionInboxItems).sort(sortByCreatedDesc);
  const approvals = Object.values(snapshot.approvals).sort(sortByCreatedDesc);

  const activeProject = snapshot.activeProjectId
    ? snapshot.projects[snapshot.activeProjectId] || null
    : null;

  const projectTasks = activeProject
    ? tasks.filter((task) => task.projectId === activeProject.id)
    : [];
  const projectMissions = activeProject
    ? missions.filter((mission) => mission.projectId === activeProject.id)
    : [];
  const projectCouncilSessions = activeProject
    ? councilSessions.filter((councilSession) => {
        const mission = snapshot.missions[councilSession.missionId];
        return mission && mission.projectId === activeProject.id;
      })
    : [];
  const projectRuns = activeProject
    ? runs.filter((run) => {
        const task = snapshot.tasks[run.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectArtifacts = activeProject
    ? artifacts.filter((artifact) => {
        const task = snapshot.tasks[artifact.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectInboxItems = activeProject
    ? inboxItems.filter((item) => item.projectId === activeProject.id)
    : [];
  const projectApprovals = activeProject
    ? approvals.filter((approval) => approval.projectId === activeProject.id)
    : [];

  const taskMap = new Map(projectTasks.map((task) => [task.id, task]));
  const missionMap = new Map(projectMissions.map((mission) => [mission.id, mission]));
  const councilSessionMap = new Map(
    projectCouncilSessions.map((councilSession) => [councilSession.id, councilSession]),
  );
  const runMap = new Map(projectRuns.map((run) => [run.id, run]));
  const artifactMap = new Map(projectArtifacts.map((artifact) => [artifact.id, artifact]));
  const inboxItemMap = new Map(projectInboxItems.map((item) => [item.id, item]));

  return {
    artifactCatalog: payload.artifactCatalog || {},
    derived: payload.derived || createEmptyDerivedState(),
    councilSessions: projectCouncilSessions,
    missions: projectMissions,
    snapshot,
    activeProject,
    projects,
    councilSessionMap,
    missionMap,
    tasks: projectTasks,
    runs: projectRuns,
    artifacts: projectArtifacts,
    inboxItems: projectInboxItems,
    approvals: projectApprovals,
    taskMap,
    runMap,
    artifactMap,
    inboxItemMap,
  };
}

function getProjectBootstrapState(data) {
  if (data.projects.length === 0) {
    return {
      copy: '태스크 생성이나 실행 전에 첫 프로젝트를 먼저 등록합니다.',
      title: '최초 진입 준비',
    };
  }

  if (!data.activeProject) {
    return {
      copy: '태스크 생성이나 실행 전에 현재 프로젝트를 먼저 고릅니다.',
      title: '프로젝트 선택 필요',
    };
  }

  return {
    copy: '프로젝트가 활성화되면 준비 경로는 닫히고, 다음 단계는 첫 태스크입니다.',
    title: '프로젝트 등록부',
  };
}

function getMissionStatusTone(status) {
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

function getMissionStatusDisplay(status) {
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

function getCouncilStatusTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'pending-alignment') {
    return 'warning';
  }

  return 'neutral';
}

function getCouncilStatusDisplay(status) {
  if (status === 'pending-alignment') {
    return '정렬 대기';
  }

  if (status === 'approved') {
    return '승인됨';
  }

  return status || '알 수 없음';
}

function getTaskLifecycleDisplay(state) {
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

function getTaskLifecycleTone(state) {
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

function getAlignmentStatusDisplay(status) {
  if (status === 'approved') {
    return '승인됨';
  }

  if (status === 'pending') {
    return '대기';
  }

  return status || '알 수 없음';
}

function getReviewStatusDisplay(status) {
  if (status === 'passed') {
    return '통과';
  }

  if (status === 'changes_requested') {
    return '수정 요청';
  }

  if (status === 'pending') {
    return '대기';
  }

  return status || '알 수 없음';
}

function getApprovalStatusDisplay(status) {
  if (status === 'approved') {
    return '승인';
  }

  if (status === 'rejected') {
    return '반려';
  }

  if (status === 'pending') {
    return '대기';
  }

  if (status === 'stale') {
    return '오래됨';
  }

  if (status === 'none') {
    return '없음';
  }

  return status || '알 수 없음';
}

function getRunStatusDisplay(status) {
  if (status === 'running') {
    return '실행 중';
  }

  if (status === 'completed') {
    return '완료';
  }

  if (status === 'failed') {
    return '실패';
  }

  if (status === 'pending') {
    return '대기';
  }

  return status || '알 수 없음';
}

function getExecutionRoleDisplay(role) {
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

function getExecutionStageDisplay(stage) {
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

function getEvidenceRailStatusDisplay(status) {
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

function getEvidenceRailStatusTone(status) {
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

function getEvidenceRailHandoffDisplay(value) {
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

function getInboxKindDisplay(kind) {
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

function getInboxStatusDisplay(status) {
  if (status === 'pending') {
    return '대기중';
  }

  if (status === 'resolved') {
    return '해결됨';
  }

  return status || '알 수 없음';
}

function getInboxResolutionActionDisplay(action) {
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

function getBooleanDisplay(value) {
  return value ? '예' : '아니오';
}

function getArtifactTypeDisplay(type) {
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

function getExecutionModeDisplay(mode) {
  if (mode === 'live-mutation') return '라이브변경';
  if (mode === 'commit-package') return '커밋패키지';
  if (mode === 'release-package') return '릴리스패키지';
  if (mode === 'close-out') return '종료정리';
  return mode || '알 수 없음';
}

function getReviewerVerdictDisplay(verdict) {
  if (verdict === 'pass') return '통과';
  if (verdict === 'fail') return '실패';
  if (verdict === 'changes_requested') return '수정요청';
  return verdict || '알 수 없음';
}

function getDeliveryStanceDisplay(stance) {
  if (stance === 'local-demo-only') return '로컬데모전용';
  if (stance === 'local-only') return '로컬전용';
  return stance || '알 수 없음';
}

function getPackageStatusDisplay(status) {
  if (status === 'current') return '현재';
  if (status === 'stale') return '오래됨';
  if (status === 'latest') return '최신';
  if (status === 'missing') return '없음';
  return status || '알 수 없음';
}

function getProviderReadinessDisplay(status) {
  if (status === 'ready') return '준비됨';
  if (status === 'not-configured') return '미설정';
  if (status === 'error') return '오류';
  if (status === 'unknown') return '알 수 없음';
  return status || '알 수 없음';
}

function getRunRelationLabelDisplay(label) {
  if (label === 'commit-executor run') return '커밋실행 기록';
  if (label === 'commit-packager run') return '커밋패키저 실행 기록';
  if (label === 'reviewer run') return '리뷰어 실행 기록';
  if (label === 'release-packager run') return '릴리스패키저 실행 기록';
  if (label === 'close-out run') return '종료정리 실행 기록';
  if (label === 'run') return '실행 기록';
  return label || '실행 기록';
}

function getGuardReasonDisplay(reason) {
  const normalizedReason = String(reason || '').trim();

  if (!normalizedReason) {
    return '알 수 없는 사유';
  }

  const directMap = {
    'select a task': '태스크를 먼저 선택하세요.',
    'wait for the current action to finish': '현재 작업이 끝날 때까지 기다리세요.',
    'runtime guard unavailable': '런타임 가드 요약을 아직 확인할 수 없습니다.',
    'runtime request summary unavailable': '런타임 요청 요약을 아직 확인할 수 없습니다.',
    'reviewer readiness unavailable': '리뷰어 준비도를 아직 확인할 수 없습니다.',
    'commit-package readiness unavailable': '커밋패키지 준비도를 아직 확인할 수 없습니다.',
    'commit execution readiness unavailable': '로컬 커밋 준비도를 아직 확인할 수 없습니다.',
    'release-package readiness unavailable': '릴리스패키지 준비도를 아직 확인할 수 없습니다.',
    'close-out readiness unavailable': '종료 정리 준비도를 아직 확인할 수 없습니다.',
    'latest plan artifact required': '최신 계획 아티팩트가 필요합니다.',
    'latest architecture artifact required': '최신 설계 아티팩트가 필요합니다.',
    'latest breakdown artifact required': '최신 분해 아티팩트가 필요합니다.',
    'latest preflight artifact required': '최신 프리플라이트 아티팩트가 필요합니다.',
  };

  if (directMap[normalizedReason]) {
    return directMap[normalizedReason];
  }

  return normalizedReason;
}

function getAlignmentTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  return 'warning';
}

function getProjectGateCopy(data, surfaceName) {
  if (data.projects.length === 0) {
    return `고급 운영 모드에서 프로젝트를 등록한 뒤 ${surfaceName}을 엽니다.`;
  }

  return `고급 운영 모드에서 현재 프로젝트를 고른 뒤 ${surfaceName}을 엽니다.`;
}

function renderProjectGateSurface(title, copy) {
  return `
    <div class="surface-panel">
      <div class="empty-state empty-state-strong">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </div>
    </div>
  `;
}

function renderSurfaceLeadStrip(options = {}) {
  const {
    title = '',
    copy = '',
    note = '',
    tokens = [],
  } = options;

  return `
    <section class="surface-lead-strip surface-entry-frame">
      <div class="surface-lead-head">
        <div class="surface-lead-copy">
          <h2>${escapeHtml(title)}</h2>
          ${copy ? `<p class="panel-copy panel-copy-tight">${escapeHtml(copy)}</p>` : ''}
        </div>
        <div class="surface-lead-register">
          <p class="surface-lead-register-label">현재 분장</p>
          ${
            tokens.length > 0
              ? `<div class="token-row token-row-compact">${tokens.filter(Boolean).join('')}</div>`
              : '<p class="surface-lead-register-placeholder">현재 분장 정보 없음</p>'
          }
        </div>
      </div>
      ${note ? `<p class="detail-copy detail-copy-compact surface-lead-note">${escapeHtml(note)}</p>` : ''}
    </section>
  `;
}

function renderViewportHandoffStrip(options = {}) {
  const {
    eyebrow = '브리핑 인계선',
    heading = '',
    copy = '',
    tokens = [],
    cards = [],
  } = options;
  const validCards = Array.isArray(cards)
    ? cards.filter((card) => card && (card.title || card.copy))
    : [];

  return `
    <section class="surface-lead-strip viewport-handoff-strip surface-entry-frame">
      <div class="surface-lead-head">
        <div class="surface-lead-copy">
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(heading)}</h2>
          ${copy ? `<p class="panel-copy panel-copy-tight">${escapeHtml(copy)}</p>` : ''}
        </div>
        <div class="surface-lead-register">
          <p class="surface-lead-register-label">현재 분장</p>
          ${
            tokens.length > 0
              ? `<div class="token-row token-row-compact">${tokens.filter(Boolean).join('')}</div>`
              : '<p class="surface-lead-register-placeholder">현재 분장 정보 없음</p>'
          }
        </div>
      </div>
      <div class="viewport-handoff-grid">
        ${validCards
          .map(
            (card) => `
              <article class="viewport-handoff-card${card.emphasis ? ' viewport-handoff-card-emphasis' : ''}">
                <div class="viewport-handoff-head">
                  <p class="viewport-handoff-label">${escapeHtml(card.label || '')}</p>
                  <p class="viewport-handoff-register-label">다음 이동</p>
                </div>
                ${
                  card.signal
                    ? `
                      <div class="viewport-handoff-signal viewport-handoff-signal-${escapeHtml(card.signal.tone || 'neutral')}">
                        <span class="viewport-handoff-signal-dot viewport-handoff-signal-dot-${escapeHtml(card.signal.tone || 'neutral')}"></span>
                        <span class="viewport-handoff-signal-label">${escapeHtml(card.signal.label || 'signal')}</span>
                        <strong class="viewport-handoff-signal-status">${escapeHtml(card.signal.status || '')}</strong>
                      </div>
                    `
                    : ''
                }
                <strong class="viewport-handoff-title">${escapeHtml(card.title || '')}</strong>
                <p class="viewport-handoff-copy">${escapeHtml(card.copy || '')}</p>
                <div class="viewport-handoff-register">
                  ${
                    card.button
                      ? `
                        <button
                          class="secondary-button viewport-handoff-button"
                          type="button"
                          data-action="${escapeHtml(card.button.action)}"
                          ${card.button.id ? `data-id="${escapeHtml(card.button.id)}"` : ''}
                          ${
                            card.button.targetSurface
                              ? `data-target-surface="${escapeHtml(card.button.targetSurface)}"`
                              : ''
                          }
                          ${card.button.disabled ? 'disabled' : ''}
                        >
                          ${escapeHtml(card.button.label)}
                        </button>
                      `
                      : '<p class="viewport-handoff-register-placeholder">현재 분장 확인</p>'
                  }
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function getActiveProjectLinkedWorktreesState(data) {
  return data.derived.activeProjectLinkedWorktrees || createEmptyDerivedState().activeProjectLinkedWorktrees;
}

function buildLinkedWorktreeFallbackName(option) {
  const pathParts = String(option?.path || '')
    .split('/')
    .filter(Boolean);

  return option?.branch || pathParts[pathParts.length - 1] || '연결-워크트리';
}

function buildTaskWorktreeRelation(task, activeProjectLinkedWorktrees) {
  const matchedOption = task.worktreeRef
    ? (activeProjectLinkedWorktrees.options || []).find((option) => option.path === task.worktreeRef) || null
    : null;

  if (!task.worktreeRef) {
    return {
      copy: '아직 저장된 워크트리 경로가 없습니다.',
      label: '워크트리:아직 없음',
      status: 'not-set',
      switchOption: null,
      tone: 'neutral',
    };
  }

  if (matchedOption?.isCurrentProjectPath) {
    return {
      copy: '저장된 워크트리 경로가 현재 프로젝트 경로와 일치합니다.',
      label: '워크트리:현재프로젝트일치',
      status: 'matches-active-project',
      switchOption: null,
      tone: 'success',
    };
  }

  if (matchedOption) {
    return {
      copy: `저장된 워크트리 경로는 ${formatWorktreeOptionLabel(matchedOption)}를 가리키지만 현재 프로젝트 경로는 ${activeProjectLinkedWorktrees.projectPath || '미설정'}로 남아 있습니다.`,
      label: '워크트리:불일치',
      status: 'mismatch',
      switchOption: matchedOption,
      tone: 'warning',
    };
  }

  if (activeProjectLinkedWorktrees.notice) {
    return {
      copy: `현재 프로젝트 경로에서는 연결 워크트리 탐지를 사용할 수 없습니다. 저장된 워크트리 경로는 ${task.worktreeRef}입니다.`,
      label: '워크트리:탐지불가',
      status: 'unavailable',
      switchOption: null,
      tone: 'neutral',
    };
  }

  return {
    copy: '저장된 워크트리 경로가 현재 탐지된 연결 워크트리 목록 밖에 있습니다.',
    label: '워크트리:탐지목록밖',
    status: 'outside-detected-list',
    switchOption: null,
    tone: 'warning',
  };
}

function renderLinkedWorktreeSwitchPanel(data, projectActionDisabled) {
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);

  if (!data.activeProject) {
    return `
      <section class="linked-worktree-panel relation-strip">
        <div class="card-title-row">
          <strong>탐지된 연결 워크트리</strong>
          ${createToken('연결워크트리:비활성', 'neutral')}
        </div>
        <p class="detail-copy">등록된 프로젝트를 골라 연결 워크트리 루트를 확인합니다.</p>
      </section>
    `;
  }

  const options = activeProjectLinkedWorktrees.options || [];
  const body = options.length
    ? options
        .map((option) => {
          const buttonLabel = option.isCurrentProjectPath ? '현재 활성 프로젝트' : '활성 프로젝트 전환';

          return `
            <div class="linked-worktree-row relation-strip">
              <div class="card-title-row">
                <strong>${escapeHtml(option.branch || buildLinkedWorktreeFallbackName(option))}</strong>
                <div class="token-row">
                  ${option.isCurrentProjectPath ? createToken('현재 프로젝트 경로', 'success') : ''}
                  ${
                    option.registeredProjectId
                      ? createToken(`등록됨:${option.registeredProjectName || option.registeredProjectId}`, 'neutral')
                      : createToken('미등록', 'warning')
                  }
                </div>
              </div>
              <p class="detail-copy mono">${escapeHtml(option.path)}</p>
              <div class="form-actions">
                <button
                  class="secondary-button"
                  type="button"
                  data-action="switch-active-project-worktree"
                  data-path="${escapeHtml(option.path)}"
                  ${projectActionDisabled || option.isCurrentProjectPath ? 'disabled' : ''}
                >
                  ${buttonLabel}
                </button>
                <p class="form-help">${
                  option.registeredProjectId
                    ? '기존 프로젝트 선택 흐름을 그대로 재사용합니다.'
                    : '프로젝트 등록 흐름을 재사용한 뒤 연결 루트를 활성화합니다.'
                }</p>
              </div>
            </div>
          `;
        })
        .join('')
    : `
        <div class="empty-state empty-state-inline">
          <strong>탐지된 연결 워크트리 없음</strong>
          <p>${escapeHtml(activeProjectLinkedWorktrees.notice || '이 프로젝트에는 별도 연결 워크트리 루트가 아직 드러나지 않았습니다.')}</p>
        </div>
      `;

  return `
    <section class="linked-worktree-panel">
      <div class="panel-header panel-header-compact">
        <div>
          <h4>탐지된 연결 워크트리</h4>
          <p class="panel-copy">현재 활성 프로젝트 기준으로 탐지된 연결 루트만 보여줍니다. 메인 워크트리는 여기서 제외합니다.</p>
        </div>
      </div>
      <div class="linked-worktree-list">
        ${body}
      </div>
    </section>
  `;
}

function groupTasksByLifecycle(tasks) {
  const groups = new Map(TASK_LIFECYCLE_ORDER.map((stateName) => [stateName, []]));
  const extras = [];

  for (const task of tasks) {
    if (groups.has(task.lifecycleState)) {
      groups.get(task.lifecycleState).push(task);
      continue;
    }

    extras.push(task);
  }

  if (extras.length > 0) {
    groups.set('Other', extras);
  }

  return [...groups.entries()];
}

function getTaskApprovals(taskId, approvals) {
  return approvals.filter((approval) => approval.taskId === taskId);
}

function getTaskInboxItems(taskId, inboxItems) {
  return inboxItems.filter((item) => item.taskId === taskId);
}

function getTaskArtifacts(taskId, artifacts) {
  return artifacts.filter((artifact) => artifact.taskId === taskId);
}

function getTaskRuns(taskId, runs) {
  return runs.filter((run) => run.taskId === taskId).sort(sortByCreatedDesc);
}

function getLatestTaskArtifact(task, data, type = null) {
  const artifactIds = Array.isArray(task?.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifact = data.artifactMap.get(artifactId);

    if (!artifact) {
      continue;
    }

    if (!type || artifact.type === type) {
      return artifact;
    }
  }

  return null;
}

function getPreferredTaskArtifact(task, data) {
  return (
    getLatestTaskArtifact(task, data, 'change-summary') ||
    getLatestTaskArtifact(task, data, 'diff') ||
    getLatestTaskArtifact(task, data, 'patch') ||
    getLatestTaskArtifact(task, data, 'preflight') ||
    getLatestTaskArtifact(task, data, 'breakdown') ||
    getLatestTaskArtifact(task, data, 'architecture') ||
    getLatestTaskArtifact(task, data)
  );
}

function getTaskApprovalSummary(task, approvals) {
  const taskApprovals = getTaskApprovals(task.id, approvals);

  return {
    total: taskApprovals.length,
    pending: taskApprovals.filter((approval) => approval.status === 'pending').length,
    approved: taskApprovals.filter((approval) => approval.status === 'approved').length,
    rejected: taskApprovals.filter((approval) => approval.status === 'rejected').length,
    actions: taskApprovals.map((approval) => approval.allowedNextAction).filter(Boolean),
  };
}

function getApprovalActionLabel(action) {
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

function describeApprovalTarget(approval, targetArtifact) {
  if (targetArtifact) {
    return `아티팩트 ${targetArtifact.id} (${targetArtifact.type})`;
  }

  if (approval?.targetArtifactId) {
    return `아티팩트 ${approval.targetArtifactId}`;
  }

  return '현재 한정된 아티팩트';
}

function getTaskApprovalBridge(task, data) {
  if (!task) {
    return {
      actionLabel: null,
      bridgeCopy: '이 미션에는 아직 승인 브리지 자체가 없습니다.',
      currentApproval: null,
      currentGateItem: null,
      nextStepCopy: '다음 운영 단계: 실행이 첫 게이트를 만들기 전까지는 미션 또는 협의회에 머뭅니다.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  const taskApprovals = getTaskApprovals(task.id, data.approvals).sort(sortByCreatedDesc);
  const taskItems = getTaskInboxItems(task.id, data.inboxItems).sort(sortByCreatedDesc);
  const currentGateItem = getPreferredTaskInboxItem(task.id, data);
  const pendingInboxItem =
    taskItems.find((item) => item.status === 'pending' && item.kind === 'approval') || null;
  const currentApproval =
    (pendingInboxItem?.sourceId
      ? taskApprovals.find((approval) => approval.id === pendingInboxItem.sourceId) || null
      : null) ||
    taskApprovals.find((approval) => approval.status === 'pending') ||
    taskApprovals[0] ||
    null;
  const targetArtifact = currentApproval?.targetArtifactId
    ? data.artifactMap.get(currentApproval.targetArtifactId) || null
    : null;
  const actionLabel = getApprovalActionLabel(currentApproval?.allowedNextAction);
  const targetLabel = describeApprovalTarget(currentApproval, targetArtifact);

  if (currentApproval) {
    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `협의회 승인으로 이 미션은 이미 프리플라이트까지 진행됐습니다. 현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 라이브 변경을 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `고급 운영 모드 -> 결정함에서 ${pendingInboxItem.id}를 승인한 뒤, 실행으로 돌아와 라이브 변경을 실행합니다.`
          : '고급 운영 모드에서 현재 라이브 변경 승인 게이트를 먼저 처리한 뒤 라이브 변경을 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 라이브 변경을 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '실행에서 라이브 변경을 바로 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 로컬 커밋 의도를 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `실행에서 ${pendingInboxItem.id}를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 로컬 커밋 이어가기를 실행합니다.`
          : '실행에서 현재 커밋 게이트를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 로컬 커밋 이어가기를 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 로컬 커밋 의도를 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '현재 커밋 번들 준비 상태가 초록이면 실행에서 승인된 로컬 커밋 이어가기를 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 릴리스 준비 상태를 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `실행에서 ${pendingInboxItem.id}를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 종료 정리를 이어갑니다.`
          : '실행에서 현재 릴리스 게이트를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 종료 정리를 이어갑니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 릴리스 준비 상태를 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '현재 릴리스 번들 준비 상태가 초록이면 실행에서 승인된 종료 정리를 이어갑니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    return {
      actionLabel,
      bridgeCopy: `${currentApproval.id}는 ${targetLabel} 기준 ${actionLabel || currentApproval.scope || '현재 승인'}에 대해 ${currentApproval.status} 상태입니다.`,
      currentApproval,
      currentGateItem,
      nextStepCopy: pendingInboxItem
        ? `고급 운영 모드 -> 결정함에서 ${pendingInboxItem.id}를 검토합니다.`
        : '고급 운영 모드에서 현재 승인 기록을 확인합니다.',
      pendingInboxItem,
      targetArtifact,
    };
  }

  if (currentGateItem?.status === 'pending') {
    return {
      actionLabel: null,
      bridgeCopy: `${currentGateItem.id}가 이 미션의 현재 대기 중 ${currentGateItem.kind} 게이트입니다.`,
      currentApproval: null,
      currentGateItem,
      nextStepCopy: '고급 운영 모드 -> 결정함에서 현재 게이트를 처리합니다.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  return {
    actionLabel: null,
    bridgeCopy: '지금 활성화된 승인 브리지는 없습니다.',
    currentApproval: null,
    currentGateItem,
    nextStepCopy: '새 실행 게이트가 나타날 때까지 기본 표면에서 현재 상태를 유지합니다.',
    pendingInboxItem: null,
    targetArtifact: null,
  };
}

function getTaskDecisionSummary(task, inboxItems) {
  const taskItems = getTaskInboxItems(task.id, inboxItems);
  const pending = taskItems.filter((item) => item.status === 'pending');

  return {
    total: taskItems.length,
    pendingTotal: pending.length,
    pendingReview: pending.filter((item) => item.kind === 'review').length,
    pendingDecision: pending.filter((item) => item.kind === 'decision').length,
    pendingApproval: pending.filter((item) => item.kind === 'approval').length,
  };
}

function getPreferredTaskInboxItem(taskId, data) {
  const taskItems = getTaskInboxItems(taskId, data.inboxItems);
  const pendingApprovals = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'approval',
  );

  if (pendingApprovals.length > 0) {
    return pendingApprovals[0];
  }

  const pendingBlockingDecisions = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'decision' && item.blocksTask,
  );

  if (pendingBlockingDecisions.length > 0) {
    return pendingBlockingDecisions[0];
  }

  const pendingItems = taskItems.filter((item) => item.status === 'pending');

  if (pendingItems.length > 0) {
    return pendingItems[0];
  }

  return taskItems[0] || null;
}

function getTaskBreakerAvailability(task, data) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.taskBreaker || null : null;
  const guardSummary = task ? data.derived?.taskGuardSummaries?.[task.id]?.taskBreaker || null : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('task-breaker readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

function getBuilderPreflightAvailability(task, data) {
  const summary = task
    ? data.derived?.executionEntrySummaries?.[task.id]?.builderPreflight || null
    : null;
  const guardSummary = task
    ? data.derived?.taskGuardSummaries?.[task.id]?.builderPreflight || null
    : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('builder preflight readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    latestPreflightArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

function getPlannerAvailability(task, data) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.planner || null : null;
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('planner readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    reasons: [...new Set(reasons)],
    summary: summary || {
      allowed: false,
      reasons: ['planner readiness unavailable'],
    },
  };
}

function getPrimaryBlockedReason(reasons, fallback) {
  const primaryReason = Array.isArray(reasons) ? reasons.find(Boolean) : null;

  return primaryReason || fallback;
}

function getArchitectAvailability(task, data) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.architect || null : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('architect readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    latestPlanArtifact,
    reasons: [...new Set(reasons)],
    summary: summary || {
      allowed: false,
      reasons: ['architect readiness unavailable'],
    },
  };
}

function getDevelopmentPackExecutionGateReason(task, data) {
  if (!task) {
    return null;
  }

  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const plannerState = getPlannerAvailability(task, data);
  const architectState = getArchitectAvailability(task, data);
  const taskBreakerState = getTaskBreakerAvailability(task, data);
  const builderPreflightState = getBuilderPreflightAvailability(task, data);

  if (!latestPlanArtifact && plannerState.reasons.length > 0) {
    return plannerState.reasons[0];
  }

  if (latestPlanArtifact && !latestArchitectureArtifact && architectState.reasons.length > 0) {
    return architectState.reasons[0];
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    !latestBreakdownArtifact &&
    taskBreakerState.reasons.length > 0
  ) {
    return taskBreakerState.reasons[0];
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    latestBreakdownArtifact &&
    !latestPreflightArtifact &&
    builderPreflightState.reasons.length > 0
  ) {
    return builderPreflightState.reasons[0];
  }

  return null;
}

function getBuilderLiveMutationSummaries(task, data) {
  const summaries = task ? data.derived?.taskGuardSummaries?.[task.id] || null : null;

  return {
    guardSummary: summaries?.builderLiveMutation || {
      allowed: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime guard unavailable'],
    },
    requestSummary: summaries?.builderLiveMutationApprovalRequest || {
      allowed: false,
      conflict: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime request summary unavailable'],
    },
  };
}

function getReviewerAvailability(task, data) {
  const summary = task ? data.derived?.reviewerReadinessSummaries?.[task.id] || null : null;
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('reviewer readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    summary: summary || {
      allowed: false,
      reasons: ['reviewer readiness unavailable'],
    },
    reasons: [...new Set(reasons)],
  };
}

function getCommitApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovalStatus || 'none';
}

function getCommitPackageAvailability(task, data) {
  const summary = task ? data.derived?.commitPackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      currentCommitPackageArtifactId: null,
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestCommitPackageArtifactId: null,
      packageStale: false,
      reasons: ['commit-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getCommitExecutionAvailability(task, data) {
  const summary = task ? data.derived?.commitExecutionReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      changedFileCount: 0,
      commitMessagePresent: false,
      commitPackageArtifactId: null,
      conflict: false,
      existingCommitResultArtifactId: null,
      existingLocalCommitRunId: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      reasons: ['commit execution readiness unavailable'],
      repoChangeCountBeforeCommit: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getReleasePackageAvailability(task, data) {
  const summary = task ? data.derived?.releasePackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestReleasePackageArtifactId: null,
      packageStale: false,
      reasons: ['release-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getCloseOutApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovedReleaseApprovalStatus || 'none';
}

function getCloseOutAvailability(task, data) {
  const summary = task ? data.derived?.closeOutReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      existingCloseOutArtifactId: null,
      existingCloseOutRunId: null,
      latestApprovedReleaseApprovalId: null,
      latestApprovedReleaseApprovalStatus: null,
      latestCloseOutArtifactId: null,
      latestReleasePackageArtifactId: null,
      reasons: ['close-out readiness unavailable'],
      repoClean: false,
      repoDirtyFileCount: null,
      repoStagedFileCount: null,
      repoUntrackedFileCount: null,
      sourceBuilderApprovalId: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getMissionCompletionSummary(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;
  const latestCloseOutArtifact = linkedTask ? getLatestTaskArtifact(linkedTask, data, 'close-out') : null;
  const closeOutState = linkedTask ? getCloseOutAvailability(linkedTask, data) : null;
  const completionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState?.summary?.existingCloseOutArtifactId),
  );

  return {
    closeOutArtifactId:
      latestCloseOutArtifact?.id || closeOutState?.summary?.existingCloseOutArtifactId || null,
    closeOutState,
    completionReady,
    latestCloseOutArtifact,
    linkedTask,
    releasePackageArtifactId:
      closeOutState?.summary?.currentReleasePackageArtifactId ||
      closeOutState?.summary?.latestReleasePackageArtifactId ||
      null,
  };
}

function getMissionCouncilPreview(mission, data) {
  const councilSession =
    mission?.councilSessionId && data.councilSessionMap.has(mission.councilSessionId)
      ? data.councilSessionMap.get(mission.councilSessionId)
      : null;
  const alignmentStatus = councilSession?.alignment?.status || 'pending';
  const openQuestionsCount = Array.isArray(councilSession?.openQuestions)
    ? councilSession.openQuestions.length
    : 0;
  const participantCount = Array.isArray(councilSession?.participants)
    ? councilSession.participants.length
    : 0;
  const selectedPlanTitle = councilSession?.selectedPlan?.title || null;
  const recommendation = councilSession?.recommendation || null;
  const summary = councilSession?.summary || null;

  return {
    alignmentStatus,
    councilSession,
    openQuestionsCount,
    participantCount,
    previewLine: councilSession
      ? `${selectedPlanTitle || recommendation || summary || '추천안 준비됨'}. 정렬 상태 ${getAlignmentStatusDisplay(alignmentStatus)}.`
      : '아직 협의회 추천안이 없습니다.',
    recommendationPreview: recommendation || summary || '아직 추천안이 없습니다.',
    selectedPlanTitle: selectedPlanTitle || '선택된 계획 없음',
    selectedPlanScope: councilSession?.selectedPlan?.scope || '선택된 범위 없음',
  };
}

function getMissionExecutionPreview(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  if (!linkedTask) {
    return {
      actionLabel: null,
      approvalBridge: null,
      blockedReason: '연결된 태스크가 아직 없습니다.',
      gatePreview: '연결된 태스크가 아직 없어서 실행 게이트도 없습니다.',
      latestRun: null,
      latestRunNextStage: null,
      latestRunRole: null,
      linkedTask,
      preferredInboxItem: null,
      stagePreview: '아직 실행 기록이 없습니다.',
    };
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const executionGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const blockedReason =
    executionGateReason ||
    (preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? '빌더 라이브 변경 승인이 대기 중입니다.'
        : linkedTask.flags?.waitingDecision
          ? '막고 있는 결정 항목이 대기 중입니다.'
          : linkedTask.flags?.blocked
            ? '연결된 태스크가 현재 blocked 상태입니다.'
            : '현재 활성화된 차단 사유는 없습니다.');

  return {
    actionLabel: approvalBridge.actionLabel || preferredInboxItem?.kind || null,
    approvalBridge,
    blockedReason,
    executionBlocked: Boolean(executionGateReason),
    gatePreview:
      approvalBridge.bridgeCopy ||
      (executionGateReason
        ? `현재 실행은 ${executionGateReason} 전까지 진행할 수 없습니다.`
        : '지금 활성화된 실행 게이트는 없습니다.'),
    latestRun,
    latestRunNextStage,
    latestRunRole,
    linkedTask,
    preferredInboxItem,
    stagePreview: latestRun
      ? `가장 최근 실행 로그: ${getExecutionRoleDisplay(latestRunRole)}${
          latestRunNextStage ? ` -> ${getExecutionStageDisplay(latestRunNextStage)}` : ''
        } (${getRunStatusDisplay(latestRun.status)}).`
      : '아직 실행 기록이 없습니다.',
  };
}

function getExecutionEvidenceRail(task, data) {
  const buildCheckpoint = (input) => ({
    artifactId: input.artifactId || null,
    blockedReason: input.blockedReason || null,
    currentOwner: false,
    evidenceLabel: input.evidenceLabel,
    evidenceMeta: input.evidenceMeta || null,
    nextHandoff: false,
    nextHandoffLabel: input.nextHandoffLabel || '없음',
    nextRoleId: input.nextRoleId || null,
    note: input.note || null,
    roleId: input.roleId,
    status: input.status,
    subtitle: input.subtitle,
    title: input.title,
  });
  const buildWaitingCheckpoint = (roleId, subtitle, note) =>
    buildCheckpoint({
      roleId,
      title: roleId,
      subtitle,
      status: 'waiting',
      evidenceLabel: `${subtitle} 대기`,
      note,
    });

  if (!task) {
    const checkpoints = [
      buildWaitingCheckpoint('Strategist', 'plan', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Architect', 'architecture', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Decomposer', 'breakdown', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Maker', '프리플라이트 / 빌더', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Critic', 'review', '연결된 실행 셀이 아직 없습니다.'),
    ];

    checkpoints[0].currentOwner = true;

    return {
      blockedReason: '연결된 태스크가 아직 없습니다.',
      checkpoints,
      currentOwnerLabel: '인계 대기',
      nextHandoffLabel: getEvidenceRailHandoffDisplay('execution cell creation'),
    };
  }

  const summarizeArtifactRun = (artifact) => {
    const run = artifact?.runId ? data.runMap.get(artifact.runId) || null : null;
    return {
      artifact,
      meta: run ? `run ${run.id} · ${getRunStatusDisplay(run.status)}` : null,
      run,
    };
  };
  const joinMeta = (parts) => parts.filter(Boolean).join(' · ');
  const executionSummaries = data.derived?.executionEntrySummaries?.[task.id] || {};
  const reviewerSummary = data.derived?.reviewerReadinessSummaries?.[task.id] || null;
  const builderLiveMutationState = getBuilderLiveMutationSummaries(task, data);
  const taskApprovals = getTaskApprovals(task.id, data.approvals).sort(sortByCreatedDesc);
  const taskInboxItems = getTaskInboxItems(task.id, data.inboxItems).sort(sortByCreatedDesc);
  const latestBuilderApproval =
    taskApprovals.find((approval) => approval.allowedNextAction === 'builder-live-mutation') || null;
  const pendingBuilderApprovalItem =
    taskInboxItems.find(
      (item) =>
        item.status === 'pending' &&
        item.kind === 'approval' &&
        item.sourceId === latestBuilderApproval?.id,
    ) ||
    taskInboxItems.find((item) => item.status === 'pending' && item.kind === 'approval') ||
    null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const latestReviewArtifact = getLatestTaskArtifact(task, data, 'review');
  const latestBuilderMutationArtifact =
    getLatestTaskArtifact(task, data, 'change-summary') ||
    getLatestTaskArtifact(task, data, 'diff') ||
    getLatestTaskArtifact(task, data, 'patch');
  const latestBuilderMutationRun =
    (latestBuilderMutationArtifact?.runId
      ? data.runMap.get(latestBuilderMutationArtifact.runId) || null
      : null) ||
    data.runs
      .filter(
        (run) =>
          run.taskId === task.id &&
          (run.role === 'builder-live-mutation' || run.summary?.executionMode === 'live-mutation'),
      )
      .sort(sortByCreatedDesc)[0] ||
    null;
  const latestPlan = summarizeArtifactRun(latestPlanArtifact);
  const latestArchitecture = summarizeArtifactRun(latestArchitectureArtifact);
  const latestBreakdown = summarizeArtifactRun(latestBreakdownArtifact);
  const latestPreflight = summarizeArtifactRun(latestPreflightArtifact);
  const latestReview = summarizeArtifactRun(latestReviewArtifact);
  const reviewStatus = task.review?.status || 'pending';
  const executionBlockedReason = getDevelopmentPackExecutionGateReason(task, data);

  const strategistReason = getPrimaryBlockedReason(executionSummaries.planner?.reasons, null);
  const strategistCheckpoint = latestPlanArtifact
    ? buildCheckpoint({
        roleId: 'Strategist',
        title: 'Strategist',
        subtitle: 'plan',
        status: 'complete',
        artifactId: latestPlanArtifact.id,
        evidenceLabel: `계획 ${latestPlanArtifact.id}`,
        evidenceMeta: latestPlan.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Architect')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Architect'),
        nextRoleId: 'Architect',
      })
    : buildCheckpoint({
        roleId: 'Strategist',
        title: 'Strategist',
        subtitle: 'plan',
        status: strategistReason ? 'blocked' : 'current',
        evidenceLabel: '계획 대기',
        blockedReason: strategistReason ? getGuardReasonDisplay(strategistReason) : null,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Architect')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Architect'),
        nextRoleId: 'Architect',
      });

  const architectReason = getPrimaryBlockedReason(executionSummaries.architect?.reasons, null);
  const architectCheckpoint = latestArchitectureArtifact
    ? buildCheckpoint({
        roleId: 'Architect',
        title: 'Architect',
        subtitle: 'architecture',
        status: 'complete',
        artifactId: latestArchitectureArtifact.id,
        evidenceLabel: `설계 ${latestArchitectureArtifact.id}`,
        evidenceMeta: latestArchitecture.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Decomposer')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Decomposer'),
        nextRoleId: 'Decomposer',
      })
    : !latestPlanArtifact
      ? buildWaitingCheckpoint('Architect', 'architecture', '계획 아티팩트가 아직 없습니다.')
      : buildCheckpoint({
          roleId: 'Architect',
          title: 'Architect',
          subtitle: 'architecture',
          status: architectReason ? 'blocked' : 'current',
          evidenceLabel: '설계 대기',
          blockedReason: architectReason ? getGuardReasonDisplay(architectReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('Decomposer')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('Decomposer'),
          nextRoleId: 'Decomposer',
        });

  const decomposerReason = getPrimaryBlockedReason(executionSummaries.taskBreaker?.reasons, null);
  const decomposerCheckpoint = latestBreakdownArtifact
    ? buildCheckpoint({
        roleId: 'Decomposer',
        title: 'Decomposer',
        subtitle: 'breakdown',
        status: 'complete',
        artifactId: latestBreakdownArtifact.id,
        evidenceLabel: `breakdown ${latestBreakdownArtifact.id}`,
        evidenceMeta: latestBreakdown.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Maker')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Maker'),
        nextRoleId: 'Maker',
      })
    : !latestArchitectureArtifact
      ? buildWaitingCheckpoint('Decomposer', 'breakdown', '설계 아티팩트가 아직 없습니다.')
      : buildCheckpoint({
          roleId: 'Decomposer',
          title: 'Decomposer',
          subtitle: 'breakdown',
          status: decomposerReason ? 'blocked' : 'current',
          evidenceLabel: 'breakdown 대기',
          blockedReason: decomposerReason ? getGuardReasonDisplay(decomposerReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('Maker')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('Maker'),
          nextRoleId: 'Maker',
        });

  const builderApprovalDisplayStatus =
    builderLiveMutationState.guardSummary.latestApprovalDisplayStatus ||
    builderLiveMutationState.requestSummary.latestApprovalDisplayStatus ||
    latestBuilderApproval?.status ||
    'none';
  const makerEvidenceMeta = joinMeta([
    latestPreflight.meta,
    latestBuilderApproval
      ? `승인 ${latestBuilderApproval.id} · ${getApprovalStatusDisplay(builderApprovalDisplayStatus)}`
      : null,
    latestBuilderMutationRun
      ? `live ${latestBuilderMutationRun.id} · ${getRunStatusDisplay(latestBuilderMutationRun.status)}`
      : null,
  ]);
  const builderPreflightReason = getPrimaryBlockedReason(
    executionSummaries.builderPreflight?.reasons,
    null,
  );
  const makerRequestReason = getPrimaryBlockedReason(
    builderLiveMutationState.requestSummary.reasons,
    null,
  );
  const makerGuardReason = getPrimaryBlockedReason(
    builderLiveMutationState.guardSummary.reasons,
    null,
  );
  let makerCheckpoint = buildWaitingCheckpoint(
    'Maker',
    'preflight / builder',
    'breakdown artifact가 아직 없습니다.',
  );

  if (latestBuilderMutationRun || latestReviewArtifact) {
    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status: 'complete',
      artifactId: latestPreflightArtifact?.id || null,
      evidenceLabel: latestPreflightArtifact ? `프리플라이트 ${latestPreflightArtifact.id}` : '프리플라이트 없음',
      evidenceMeta: makerEvidenceMeta || null,
      note: `다음 인계: ${getEvidenceRailHandoffDisplay('Critic')}`,
      nextHandoffLabel: getEvidenceRailHandoffDisplay('Critic'),
      nextRoleId: 'Critic',
    });
  } else if (latestPreflightArtifact) {
    const blockedReason =
      executionBlockedReason ||
      pendingBuilderApprovalItem?.prompt ||
      latestBuilderApproval?.prompt ||
      makerGuardReason ||
      makerRequestReason ||
      null;
    const nextHandoffLabel =
      latestBuilderApproval?.status === 'approved' && builderLiveMutationState.guardSummary.allowed
        ? getEvidenceRailHandoffDisplay('builder-live-mutation')
        : getEvidenceRailHandoffDisplay('builder-live-mutation approval');
    const status =
      pendingBuilderApprovalItem || latestBuilderApproval?.status === 'pending'
        ? 'blocked'
        : blockedReason && !builderLiveMutationState.requestSummary.allowed && !builderLiveMutationState.guardSummary.allowed
          ? 'blocked'
          : 'current';

    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status,
      artifactId: latestPreflightArtifact.id,
      evidenceLabel: `프리플라이트 ${latestPreflightArtifact.id}`,
      evidenceMeta: makerEvidenceMeta || null,
      blockedReason: status === 'blocked' ? getGuardReasonDisplay(blockedReason) : null,
      note: `다음 인계: ${nextHandoffLabel}`,
      nextHandoffLabel,
    });
  } else if (latestBreakdownArtifact) {
    const blockedReason = executionBlockedReason || builderPreflightReason || null;
    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status: blockedReason ? 'blocked' : 'current',
      evidenceLabel: '프리플라이트 대기',
      blockedReason: blockedReason ? getGuardReasonDisplay(blockedReason) : null,
      note: `다음 인계: ${getEvidenceRailHandoffDisplay('builder-live-mutation approval')}`,
      nextHandoffLabel: getEvidenceRailHandoffDisplay('builder-live-mutation approval'),
    });
  }

  const criticEvidenceMeta = joinMeta([
    latestReview.meta,
    latestReviewArtifact ? `상태 ${getReviewStatusDisplay(reviewStatus)}` : null,
    !latestReviewArtifact && latestBuilderMutationRun
      ? `builder ${latestBuilderMutationRun.id} · ${getRunStatusDisplay(latestBuilderMutationRun.status)}`
      : null,
  ]);
  const criticReason = getPrimaryBlockedReason(reviewerSummary?.reasons, null);
  const criticNextHandoffLabel = getEvidenceRailHandoffDisplay(
    latestReview.run?.summary?.nextStage || 'human gate',
  );
  const criticCheckpoint = latestReviewArtifact
    ? buildCheckpoint({
        roleId: 'Critic',
        title: 'Critic',
        subtitle: 'review',
        status: 'complete',
        artifactId: latestReviewArtifact.id,
        evidenceLabel: `review ${latestReviewArtifact.id}`,
        evidenceMeta: criticEvidenceMeta || null,
        note: `다음 인계: ${criticNextHandoffLabel}`,
        nextHandoffLabel: criticNextHandoffLabel,
      })
    : latestBuilderMutationRun
      ? buildCheckpoint({
          roleId: 'Critic',
          title: 'Critic',
          subtitle: 'review',
          status: criticReason ? 'blocked' : 'current',
          evidenceLabel: 'review 대기',
          evidenceMeta: criticEvidenceMeta || null,
          blockedReason: criticReason ? getGuardReasonDisplay(criticReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('human gate')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('human gate'),
        })
      : buildWaitingCheckpoint('Critic', 'review', '빌더 라이브 변경 증적이 아직 없습니다.');

  const checkpoints = [
    strategistCheckpoint,
    architectCheckpoint,
    decomposerCheckpoint,
    makerCheckpoint,
    criticCheckpoint,
  ];
  const lastCompletedCheckpoint = [...checkpoints].reverse().find((checkpoint) => checkpoint.status === 'complete') || null;
  const activeCheckpoint =
    checkpoints.find((checkpoint) => checkpoint.status === 'blocked') ||
    checkpoints.find((checkpoint) => checkpoint.status === 'current') ||
    lastCompletedCheckpoint ||
    checkpoints[0];

  if (activeCheckpoint) {
    activeCheckpoint.currentOwner = true;

    if (activeCheckpoint.nextRoleId) {
      const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.roleId === activeCheckpoint.nextRoleId);

      if (nextCheckpoint) {
        nextCheckpoint.nextHandoff = true;
      }
    }
  }

  return {
    blockedReason: activeCheckpoint?.blockedReason || null,
    checkpoints,
    currentOwnerLabel: activeCheckpoint?.title || '인계 대기',
    nextHandoffLabel: activeCheckpoint?.nextHandoffLabel || '없음',
  };
}

function renderExecutionEvidenceRail(rail, options = {}) {
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

function getMissionDeliverablesPreview(mission, data) {
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

function getMissionNextActionPreview(mission, previews) {
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

  return {
    actionLabel: '실행',
    summary: `지금 가장 먼저 열어야 할 표면은 실행이며, 이유는 ${previews.execution.gatePreview}`,
    surface: 'execution',
    tone: 'accent',
  };
}

function getMissionBriefControlSnapshot(mission, previews) {
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

  return {
    currentCopy: '현재 안건은 실행 경로 안에서 계속 이어갈 수 있는 상태입니다.',
    currentTitle: '실행 진행 중',
    nextCopy: `${nextSurfaceLabel}에서 ${previews.nextActionPreview.actionLabel}를 이어갑니다.`,
    nextTitle: `${nextSurfaceLabel} 이동`,
    reasonCopy: previews.execution.stagePreview || previews.execution.gatePreview,
    reasonTitle: '현재 게이트',
  };
}

function getCouncilControlSnapshot(mission, councilSession, linkedTask) {
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

function getExecutionControlSnapshot(task, latestRun, approvalBridge, gateCopy, summaries = {}) {
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

function getExecutionLeftSnapshot(task, latestRun, executionControl, artifacts = {}) {
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

function getDeliverablesControlSnapshot(
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

  if (latestReviewStatus !== 'approved') {
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

function getDeliverablesLeftSnapshot(mission, task, currentArtifact, deliverablesControl, artifacts = {}) {
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

function getMissionSurfaceRailEntries(mission, previews) {
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

function getTaskboardTaskSnapshot(task, data) {
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

function getRunListSnapshot(run, task, data) {
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

function getArtifactListSnapshot(artifact, task, data) {
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

function getInboxListSnapshot(item, task, approval, evidenceRail = null) {
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

function getLogsDetailSnapshot(selectedRun, selectedTask, runBundle, logs = []) {
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

function getArtifactDetailSnapshot(selectedArtifactMeta, selectedArtifactTask, data, policySummary = '') {
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

function getInboxDetailSnapshot(selectedItem, selectedTask, selectedApproval) {
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

function renderMissionSnapshotList(items, options = {}) {
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

function stripMarkdownBullet(line) {
  return String(line || '')
    .trim()
    .replace(/^[-*]\s+/, '')
    .trim();
}

function parseMarkdownBullets(content) {
  return String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map(stripMarkdownBullet)
    .filter(Boolean);
}

function parseMarkdownLines(content) {
  return String(content || '')
    .split('\n')
    .map((line) => stripMarkdownBullet(line))
    .filter(Boolean);
}

function parseMarkdownSections(content) {
  const text = String(content || '');
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];

  if (matches.length === 0) {
    return null;
  }

  const sections = {};

  for (let index = 0; index < matches.length; index += 1) {
    const heading = matches[index][1].trim();
    const sectionStart = matches[index].index + matches[index][0].length;
    const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
    sections[heading] = text.slice(sectionStart, sectionEnd).trim();
  }

  return sections;
}

function parseMarkdownKeyValueLines(content) {
  const result = {};

  for (const line of parseMarkdownBullets(content)) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function parseChangeSummaryFileUpdates(content) {
  const text = String(content || '').trim();

  if (!text) {
    return [];
  }

  const matches = [...text.matchAll(/^###\s+(.+)$/gm)];

  if (matches.length === 0) {
    return [];
  }

  return matches
    .map((match, index) => {
      const path = match[1]?.trim() || '';
      const sectionStart = match.index + match[0].length;
      const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
      const block = text.slice(sectionStart, sectionEnd).trim();
      const codeFenceMatch = block.match(/^```([^\n]*)\n[\s\S]*?\n```$/m);

      if (!path) {
        return null;
      }

      return {
        encoding: codeFenceMatch?.[1]?.trim() || null,
        path,
        payloadStored: block.length > 0,
      };
    })
    .filter(Boolean);
}

function parseIntegerValue(value) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseYesNoValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'yes') {
    return true;
  }

  if (normalized === 'no') {
    return false;
  }

  return null;
}

function parseBreakdownArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    executionBoundarySummary: parseMarkdownBullets(sections['Execution Boundary Summary']),
    checkpoints: parseMarkdownBullets(sections.Checkpoints),
    expectedArtifacts: parseMarkdownBullets(sections['Expected Artifacts Per Checkpoint']),
    orderedSubTasks: parseMarkdownBullets(sections['Ordered Sub-Tasks']),
    reviewTriggerPoints: parseMarkdownLines(sections['Review Trigger Point']),
    stopAndEscalateConditions: parseMarkdownBullets(sections['Stop-And-Escalate Conditions']),
    title: text.match(/^#\s+Task Breakdown:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationCheckpoints: parseMarkdownBullets(sections['Verification Checkpoints']),
  };
  const hasStructuredContent = [
    parsed.orderedSubTasks,
    parsed.checkpoints,
    parsed.expectedArtifacts,
    parsed.verificationCheckpoints,
    parsed.reviewTriggerPoints,
    parsed.stopAndEscalateConditions,
    parsed.executionBoundarySummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parsePreflightArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    escalationTriggers: parseMarkdownBullets(sections['Escalation Triggers']),
    inputSummary: parseMarkdownLines(sections['Input Summary']),
    intendedChanges: parseMarkdownBullets(sections['Intended Changes']),
    reviewEvidenceExpectations: parseMarkdownBullets(sections['Review Evidence Expectations']),
    risks: parseMarkdownBullets(sections.Risks),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Preflight:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationPlan: parseMarkdownBullets(sections['Verification Plan']),
  };
  const hasStructuredContent = [
    parsed.targetFiles,
    parsed.intendedChanges,
    parsed.risks,
    parsed.verificationPlan,
    parsed.reviewEvidenceExpectations,
    parsed.escalationTriggers,
    parsed.inputSummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parseChangeSummaryArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const summaryValues = parseMarkdownKeyValueLines(sections['Change Summary']);
  const parsed = {
    approvalId: summaryValues['approval id'] || null,
    changeSummary: parseMarkdownBullets(sections['Change Summary']),
    commitOrReleaseExecuted: summaryValues['commit or release executed'] || null,
    fileUpdates: parseChangeSummaryFileUpdates(sections['File Updates']),
    preparedFileUpdates: parseIntegerValue(summaryValues['prepared file updates']),
    preflightArtifactId: summaryValues['preflight artifact'] || null,
    reviewerExecuted: summaryValues['reviewer executed'] || null,
    risks: parseMarkdownBullets(sections.Risks),
    targetFileAllowlistCount: parseIntegerValue(summaryValues['target file allowlist count']),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Live Mutation:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationNotes: parseMarkdownBullets(sections['Verification Notes']),
  };
  const hasStructuredContent = [
    parsed.changeSummary,
    parsed.fileUpdates,
    parsed.targetFiles,
    parsed.risks,
    parsed.verificationNotes,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parseReviewArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const verdictValues = parseMarkdownKeyValueLines(sections['Review Verdict']);
  const followUpValues = parseMarkdownKeyValueLines(sections['Follow-Up Gate']);
  const verdict = String(verdictValues.verdict || '').trim().toLowerCase();
  const parsed = {
    acceptedRisks: parseMarkdownBullets(sections['Accepted Risks']),
    changeSummaryArtifactId: verdictValues['change-summary artifact'] || null,
    contractCompliance: parseMarkdownBullets(sections['Contract Compliance']),
    decisionRequired: parseYesNoValue(followUpValues['decision required']),
    diffArtifactId: verdictValues['diff artifact'] || null,
    evidence: parseMarkdownBullets(sections['Evidence Reviewed']),
    findings: parseMarkdownBullets(sections.Findings),
    mappedReviewStatus:
      verdict === 'pass'
        ? 'passed'
        : verdict === 'fail' || verdict === 'changes_requested'
          ? 'changes_requested'
          : null,
    nextAction: parseMarkdownBullets(sections['Next Action']),
    patchArtifactId: verdictValues['patch artifact'] || null,
    preflightArtifactId: verdictValues['preflight artifact'] || null,
    sourceBuilderRunId: verdictValues['source builder run'] || null,
    title: text.match(/^#\s+Reviewer Report:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationEvidence: parseMarkdownBullets(sections['Verification Evidence']),
    verdict: ['pass', 'fail', 'changes_requested'].includes(verdict) ? verdict : null,
    blockingIssue: parseYesNoValue(followUpValues['blocking issue']),
  };
  const hasStructuredContent = [
    parsed.verdict,
    parsed.evidence,
    parsed.findings,
    parsed.contractCompliance,
    parsed.verificationEvidence,
    parsed.nextAction,
    parsed.acceptedRisks,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.blockingIssue,
    parsed.decisionRequired,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCommitPackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceReviewerValues = parseMarkdownKeyValueLines(sections['Source Reviewer Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const verificationValues = parseMarkdownKeyValueLines(sections['Verification Evidence']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    builderLiveMutationApprovalId: sourceReviewerValues['builder live mutation approval'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    changedFiles: parseMarkdownBullets(sections['Changed Files']),
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceReviewerValues['target preflight artifact'] || null,
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    reviewArtifactId: sourceReviewerValues['review artifact'] || null,
    reviewerMappedStatus: verificationValues['reviewer mapped status'] || null,
    reviewerRawVerdict: verificationValues['reviewer raw verdict'] || null,
    sourceBuilderRunId: sourceReviewerValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewerValues['source reviewer run'] || null,
    title: text.match(/^#\s+Commit Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.changedFiles,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.gitCommitExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCommitResultArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceValues = parseMarkdownKeyValueLines(sections['Source Commit Package']);
  const commitValues = parseMarkdownKeyValueLines(sections.Commit);
  const validationValues = parseMarkdownKeyValueLines(sections.Validation);
  const safetyValues = parseMarkdownKeyValueLines(sections.Safety);
  const parsed = {
    commitApprovalId: sourceValues['commit approval'] || null,
    commitMessage: commitValues['commit message'] || null,
    commitPackageArtifactId: sourceValues['source commit-package artifact'] || null,
    commitSha: commitValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    committedFilesMatchedScope: parseYesNoValue(
      validationValues['committed files matched scope'],
    ),
    dirtyFileCountAfterGitAdd: parseIntegerValue(
      validationValues['dirty file count after git add'],
    ),
    dirtyFileCountBeforeCommit: parseIntegerValue(
      validationValues['dirty file count before commit'],
    ),
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    preflightArtifactId: sourceValues['target preflight artifact'] || null,
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    repoChangedFileCountBeforeCommit: parseIntegerValue(
      validationValues['repo changed file count before commit'],
    ),
    repoCleanAfterCommit: parseYesNoValue(validationValues['repo clean after commit']),
    reviewArtifactId: sourceValues['source review artifact'] || null,
    scopeFileCount: parseIntegerValue(validationValues['scope file count']),
    sourceBuilderApprovalId: sourceValues['source builder approval'] || null,
    sourceBuilderRunId: sourceValues['source builder run'] || null,
    sourceReviewerRunId: sourceValues['source reviewer run'] || null,
    stagedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['staged file count after git add'],
    ),
    stagedFileCountBeforeCommit: parseIntegerValue(
      validationValues['staged file count before commit'],
    ),
    title: text.match(/^#\s+Commit Result:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['untracked file count after git add'],
    ),
    untrackedFileCountBeforeCommit: parseIntegerValue(
      validationValues['untracked file count before commit'],
    ),
  };
  const hasStructuredContent = [
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.committedFiles,
    parsed.scopeFileCount,
    parsed.repoChangedFileCountBeforeCommit,
    parsed.stagedFileCountBeforeCommit,
    parsed.committedFilesMatchedScope,
    parsed.repoCleanAfterCommit,
    parsed.gitCommitExecuted,
    parsed.pushExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseReleasePackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceCommitValues = parseMarkdownKeyValueLines(sections['Source Local Commit Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const releaseCandidateValues = parseMarkdownKeyValueLines(sections['Release Candidate']);
  const humanGateValues = parseMarkdownKeyValueLines(sections['Human Gate']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    commitApprovalId: sourceCommitValues['commit approval'] || null,
    commitMessage: releaseCandidateValues['commit message'] || null,
    commitPackageArtifactId: sourceCommitValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceCommitValues['source commit-result artifact'] || null,
    commitSha: releaseCandidateValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    deliveryStance: releaseCandidateValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    externalReleaseExecuted: parseYesNoValue(safetyValues['external release executed']),
    localCommitBundleExecuted: parseYesNoValue(safetyValues['local commit bundle executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceCommitValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(safetyValues['publish executed']),
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseApprovalRequired: parseYesNoValue(humanGateValues['release approval required']),
    releaseReadyAction: humanGateValues['allowed next action'] || null,
    reviewArtifactId: sourceCommitValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceCommitValues['source builder approval'] || null,
    sourceBuilderRunId: sourceCommitValues['source builder run'] || null,
    sourceReviewerRunId: sourceCommitValues['source reviewer run'] || null,
    title: text.match(/^#\s+Release Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.deliveryStance,
    parsed.committedFiles,
    parsed.releaseApprovalRequired,
    parsed.releaseReadyAction,
    parsed.publishExecuted,
    parsed.pushExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCloseOutArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const doneTransitionValues = parseMarkdownKeyValueLines(sections['Done Transition']);
  const sourceReleaseValues = parseMarkdownKeyValueLines(sections['Source Release Bundle']);
  const sourceReviewValues = parseMarkdownKeyValueLines(sections['Source Review Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const worktreeValues = parseMarkdownKeyValueLines(sections['Worktree Verification']);
  const releaseSafetyValues = parseMarkdownKeyValueLines(sections['Release Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    closeOutRunId: doneTransitionValues['close-out run'] || null,
    closedOutAt: doneTransitionValues['closed out at'] || null,
    commitPackageArtifactId: sourceReleaseValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceReleaseValues['source commit-result artifact'] || null,
    commitSha: sourceReleaseValues['commit sha'] || null,
    deliveryStance: sourceReleaseValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    dirtyFileCount: parseIntegerValue(worktreeValues['dirty file count']),
    externalReleaseExecuted: parseYesNoValue(releaseSafetyValues['external release executed']),
    lifecycleStateAfter: doneTransitionValues['task lifecycle after close-out'] || null,
    lifecycleStateBefore: doneTransitionValues['task lifecycle before close-out'] || null,
    lifecycleTransition: doneTransitionValues['lifecycle transition'] || null,
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceBuilderValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(releaseSafetyValues['publish executed']),
    pushExecuted: parseYesNoValue(releaseSafetyValues['push executed']),
    releaseApprovalId: doneTransitionValues['source release approval'] || null,
    releasePackageArtifactId:
      sourceReleaseValues['source release-package artifact'] ||
      doneTransitionValues['source release-package artifact'] ||
      null,
    repoCleanBeforeCloseOut: parseYesNoValue(worktreeValues['repo clean before close-out']),
    reviewArtifactId: sourceReviewValues['source review artifact'] || null,
    reviewerMappedStatus: sourceReviewValues['reviewer mapped status'] || null,
    reviewerRawVerdict: sourceReviewValues['reviewer raw verdict'] || null,
    sourceBuilderApprovalId: sourceBuilderValues['source builder approval'] || null,
    sourceBuilderRunId: sourceBuilderValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewValues['source reviewer run'] || null,
    stagedFileCount: parseIntegerValue(worktreeValues['staged file count']),
    title: text.match(/^#\s+Close-Out:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCount: parseIntegerValue(worktreeValues['untracked file count']),
  };
  const hasStructuredContent = [
    parsed.releaseApprovalId,
    parsed.releasePackageArtifactId,
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitSha,
    parsed.deliveryStance,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.repoCleanBeforeCloseOut,
    parsed.pushExecuted,
    parsed.publishExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => value !== null && value !== '');

  return hasStructuredContent ? parsed : null;
}

function parseUnifiedDiffArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const filePaths = [
    ...[...text.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map((match) => match[2].trim()),
    ...[...text.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1].trim()),
    ...[...text.matchAll(/^--- a\/(.+)$/gm)].map((match) => match[1].trim()),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
  const files = [...new Set(filePaths)];
  const hunkCount = (text.match(/^@@/gm) || []).length;

  if (files.length === 0 && hunkCount === 0) {
    return null;
  }

  return {
    files,
    hunkCount,
  };
}

function renderBreakdownList(title, items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  const tagName = options.ordered ? 'ol' : 'ul';

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <${tagName} class="breakdown-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </${tagName}>
    </section>
  `;
}

function renderStructuredBreakdown(parsed, options = {}) {
  if (!parsed) {
    return '';
  }

  const includeCheckpoints = options.includeCheckpoints !== false;
  const includeExpectedArtifacts = options.includeExpectedArtifacts !== false;
  const includeExecutionBoundary = options.includeExecutionBoundary !== false;
  const includeStopConditions = options.includeStopConditions !== false;
  const includeVerification = options.includeVerification !== false;
  const includeReviewTrigger = options.includeReviewTrigger !== false;
  const sections = [
    renderBreakdownList('정렬된 하위 작업', parsed.orderedSubTasks, { ordered: true }),
    includeCheckpoints ? renderBreakdownList('체크포인트', parsed.checkpoints) : '',
    includeExpectedArtifacts
      ? renderBreakdownList('체크포인트별 기대 아티팩트', parsed.expectedArtifacts)
      : '',
    includeVerification
      ? renderBreakdownList('검증 체크포인트', parsed.verificationCheckpoints)
      : '',
    includeReviewTrigger
      ? renderBreakdownList('리뷰 트리거 지점', parsed.reviewTriggerPoints)
      : '',
    includeStopConditions
      ? renderBreakdownList(
          '중단 및 에스컬레이션 조건',
          parsed.stopAndEscalateConditions,
        )
      : '',
    includeExecutionBoundary
      ? renderBreakdownList('실행 경계 요약', parsed.executionBoundarySummary)
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

function renderStructuredPreflight(parsed) {
  if (!parsed) {
    return '';
  }

  const sections = [
    renderBreakdownList('대상 파일', parsed.targetFiles),
    renderBreakdownList('의도된 변경', parsed.intendedChanges),
    renderBreakdownList('위험 요소', parsed.risks),
    renderBreakdownList('검증 계획', parsed.verificationPlan),
    renderBreakdownList(
      '리뷰 증거 기대값',
      parsed.reviewEvidenceExpectations,
    ),
    renderBreakdownList('에스컬레이션 트리거', parsed.escalationTriggers),
    renderBreakdownList('입력 요약', parsed.inputSummary),
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

function renderStructuredChangeSummary(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.approvalId ? createToken(`approval:${parsed.approvalId}`, 'neutral') : ''}
        ${
          parsed.targetFileAllowlistCount !== null
            ? createToken(`허용목록:${parsed.targetFileAllowlistCount}`, 'neutral')
            : ''
        }
        ${
          parsed.preparedFileUpdates !== null
            ? createToken(`업데이트:${parsed.preparedFileUpdates}`, 'neutral')
            : ''
        }
        ${
          parsed.fileUpdates.length > 0
            ? createToken(`파일업데이트:${parsed.fileUpdates.length}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerExecuted
            ? createToken(`리뷰어:${parsed.reviewerExecuted}`, 'warning')
            : ''
        }
        ${
          parsed.commitOrReleaseExecuted
            ? createToken(`커밋/릴리스:${parsed.commitOrReleaseExecuted}`, 'warning')
            : ''
        }
      </div>
      ${renderBreakdownList('변경 요약', parsed.changeSummary)}
      ${renderBreakdownList('대상 파일', parsed.targetFiles)}
      ${
        parsed.fileUpdates.length > 0
          ? `
            <section class="breakdown-section">
              <p class="detail-key">파일 업데이트</p>
              <p class="detail-copy">${escapeHtml(getPreviewRedactionCopy())}</p>
              <ul class="breakdown-list">
                ${parsed.fileUpdates
                  .map((update) => {
                    const detail =
                      update.encoding || update.payloadStored
                        ? `${update.path} (${update.encoding || 'stored'} payload는 preview에서 가려짐)`
                        : `${update.path} (preview 가려짐)`;
                    return `<li>${escapeHtml(detail)}</li>`;
                  })
                  .join('')}
              </ul>
            </section>
          `
          : ''
      }
      ${renderBreakdownList('위험 요소', parsed.risks)}
      ${renderBreakdownList('검증 메모', parsed.verificationNotes)}
    </div>
  `;
}

function renderStructuredReview(parsed, taskReviewStatus = null) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured review-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.verdict ? createToken(`판정:${getReviewerVerdictDisplay(parsed.verdict)}`, getReviewerVerdictTone(parsed.verdict)) : ''}
        ${
          parsed.mappedReviewStatus
            ? createToken(
                `매핑리뷰:${getReviewStatusDisplay(parsed.mappedReviewStatus)}`,
                getReviewTone(parsed.mappedReviewStatus),
              )
            : ''
        }
        ${
          taskReviewStatus
            ? createToken(`태스크리뷰:${getReviewStatusDisplay(taskReviewStatus)}`, getReviewTone(taskReviewStatus))
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`소스run:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${createToken(`증거:${parsed.evidence.length}`, 'neutral')}
        ${
          parsed.findings.length > 0
            ? createToken(`발견:${parsed.findings.length}`, 'danger')
            : createToken('발견:0', 'success')
        }
        ${
          parsed.blockingIssue === true
            ? createToken('차단이슈:예', 'danger')
            : parsed.blockingIssue === false
              ? createToken('차단이슈:아니오', 'success')
              : ''
        }
        ${
          parsed.decisionRequired === true
            ? createToken('결정필요:예', 'warning')
            : parsed.decisionRequired === false
              ? createToken('결정필요:아니오', 'success')
              : ''
        }
      </div>
      ${renderBreakdownList('검토한 증거', parsed.evidence)}
      ${renderBreakdownList('발견 사항', parsed.findings)}
      ${renderBreakdownList('계약 준수', parsed.contractCompliance)}
      ${renderBreakdownList('검증 증거', parsed.verificationEvidence)}
      ${renderBreakdownList('다음 액션', parsed.nextAction)}
      ${renderBreakdownList('수용된 위험', parsed.acceptedRisks)}
    </div>
  `;
}

function renderStructuredCommitPackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.builderLiveMutationApprovalId
            ? createToken(`빌더승인:${parsed.builderLiveMutationApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerMappedStatus
            ? createToken(`매핑리뷰:${getReviewStatusDisplay(parsed.reviewerMappedStatus)}`, 'success')
            : ''
        }
        ${
          parsed.reviewerRawVerdict
            ? createToken(
                `원시판정:${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}`,
                getReviewerVerdictTone(parsed.reviewerRawVerdict),
              )
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${getBooleanDisplay(parsed.gitCommitExecuted)}`,
                parsed.gitCommitExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${getBooleanDisplay(parsed.mergeExecuted)}`,
                parsed.mergeExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${getBooleanDisplay(parsed.releaseExecuted)}`,
                parsed.releaseExecuted ? 'warning' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '소스 리뷰어 번들',
        [
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.builderLiveMutationApprovalId
            ? `빌더 라이브 변경 승인: ${parsed.builderLiveMutationApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('변경 파일', parsed.changedFiles)}
      ${renderBreakdownList(
        '검증 증거',
        [
          parsed.reviewerMappedStatus ? `리뷰어 매핑 상태: ${getReviewStatusDisplay(parsed.reviewerMappedStatus)}` : null,
          parsed.reviewerRawVerdict ? `리뷰어 원시 판정: ${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}` : null,
          parsed.reviewArtifactId ? `리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '실행 안전성',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit 실행: ${getBooleanDisplay(parsed.gitCommitExecuted)}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge 실행: ${getBooleanDisplay(parsed.mergeExecuted)}`
            : null,
          parsed.releaseExecuted !== null
            ? `release 실행: ${getBooleanDisplay(parsed.releaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredCommitResult(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${
          parsed.commitApprovalId
            ? createToken(`커밋승인:${parsed.commitApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${getBooleanDisplay(parsed.gitCommitExecuted)}`,
                parsed.gitCommitExecuted ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${getBooleanDisplay(parsed.mergeExecuted)}`,
                parsed.mergeExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${getBooleanDisplay(parsed.releaseExecuted)}`,
                parsed.releaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '증적 연결',
        [
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `커밋 승인: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId
            ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '커밋',
        [
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `커밋 메시지: ${parsed.commitMessage}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('커밋된 파일', parsed.committedFiles)}
      ${renderBreakdownList(
        '검증',
        [
          parsed.scopeFileCount !== null ? `범위 파일 수: ${parsed.scopeFileCount}` : null,
          parsed.repoChangedFileCountBeforeCommit !== null
            ? `커밋 전 저장소 변경 파일 수: ${parsed.repoChangedFileCountBeforeCommit}`
            : null,
          parsed.dirtyFileCountBeforeCommit !== null
            ? `커밋 전 수정 파일 수: ${parsed.dirtyFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountBeforeCommit !== null
            ? `커밋 전 스테이징 파일 수: ${parsed.stagedFileCountBeforeCommit}`
            : null,
          parsed.untrackedFileCountBeforeCommit !== null
            ? `커밋 전 미추적 파일 수: ${parsed.untrackedFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountAfterGitAdd !== null
            ? `git add 후 스테이징 파일 수: ${parsed.stagedFileCountAfterGitAdd}`
            : null,
          parsed.dirtyFileCountAfterGitAdd !== null
            ? `git add 후 수정 파일 수: ${parsed.dirtyFileCountAfterGitAdd}`
            : null,
          parsed.untrackedFileCountAfterGitAdd !== null
            ? `git add 후 미추적 파일 수: ${parsed.untrackedFileCountAfterGitAdd}`
            : null,
          parsed.committedFilesMatchedScope !== null
            ? `커밋 파일이 범위와 일치: ${getBooleanDisplay(parsed.committedFilesMatchedScope)}`
            : null,
          parsed.repoCleanAfterCommit !== null
            ? `커밋 후 저장소 정리 상태: ${getBooleanDisplay(parsed.repoCleanAfterCommit)}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '안전성',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit 실행: ${getBooleanDisplay(parsed.gitCommitExecuted)}`
            : null,
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge 실행: ${getBooleanDisplay(parsed.mergeExecuted)}`
            : null,
          parsed.releaseExecuted !== null
            ? `release 실행: ${getBooleanDisplay(parsed.releaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredReleasePackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`전달:${getDeliveryStanceDisplay(parsed.deliveryStance)}`, 'neutral') : ''}
        ${
          parsed.commitResultArtifactId
            ? createToken(`커밋결과:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.releaseApprovalRequired !== null
            ? createToken(
                `릴리스승인:${getBooleanDisplay(parsed.releaseApprovalRequired)}`,
                parsed.releaseApprovalRequired ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseReadyAction
            ? createToken(`액션:${getApprovalActionLabel(parsed.releaseReadyAction) || parsed.releaseReadyAction}`, 'neutral')
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${getBooleanDisplay(parsed.publishExecuted)}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `외부릴리스:${getBooleanDisplay(parsed.externalReleaseExecuted)}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '소스 로컬 커밋 번들',
        [
          parsed.commitResultArtifactId
            ? `소스 커밋결과 아티팩트: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `커밋 승인: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '릴리스 후보',
        [
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `커밋 메시지: ${parsed.commitMessage}` : null,
          parsed.deliveryStance ? `전달 stance: ${getDeliveryStanceDisplay(parsed.deliveryStance)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('커밋된 파일', parsed.committedFiles)}
      ${renderBreakdownList(
        '사람 게이트',
        [
          parsed.releaseApprovalRequired !== null
            ? `릴리스 승인 필요: ${getBooleanDisplay(parsed.releaseApprovalRequired)}`
            : null,
          parsed.releaseReadyAction ? `허용된 다음 액션: ${getApprovalActionLabel(parsed.releaseReadyAction) || parsed.releaseReadyAction}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '실행 안전성',
        [
          parsed.localCommitBundleExecuted !== null
            ? `로컬 커밋 번들 실행: ${getBooleanDisplay(parsed.localCommitBundleExecuted)}`
            : null,
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.publishExecuted !== null
            ? `publish 실행: ${getBooleanDisplay(parsed.publishExecuted)}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `외부 릴리스 실행: ${getBooleanDisplay(parsed.externalReleaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredCloseOut(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.lifecycleTransition
            ? createToken(`전환:${parsed.lifecycleTransition}`, 'success')
            : ''
        }
        ${
          parsed.releasePackageArtifactId
            ? createToken(`릴리스패키지:${parsed.releasePackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitResultArtifactId
            ? createToken(`커밋결과:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`전달:${getDeliveryStanceDisplay(parsed.deliveryStance)}`, 'neutral') : ''}
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.repoCleanBeforeCloseOut !== null
            ? createToken(
                `저장소정상:${getBooleanDisplay(parsed.repoCleanBeforeCloseOut)}`,
                parsed.repoCleanBeforeCloseOut ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${getBooleanDisplay(parsed.publishExecuted)}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `외부릴리스:${getBooleanDisplay(parsed.externalReleaseExecuted)}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '완료 전환',
        [
          parsed.releaseApprovalId ? `소스 릴리스 승인: ${parsed.releaseApprovalId}` : null,
          parsed.releasePackageArtifactId
            ? `소스 릴리스패키지 아티팩트: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.closeOutRunId ? `종료 정리 run: ${parsed.closeOutRunId}` : null,
          parsed.closedOutAt ? `종료 시각: ${parsed.closedOutAt}` : null,
          parsed.lifecycleTransition ? `라이프사이클 전환: ${parsed.lifecycleTransition}` : null,
          parsed.lifecycleStateBefore
            ? `종료 전 태스크 라이프사이클: ${parsed.lifecycleStateBefore}`
            : null,
          parsed.lifecycleStateAfter
            ? `종료 후 태스크 라이프사이클: ${parsed.lifecycleStateAfter}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 릴리스 번들',
        [
          parsed.releasePackageArtifactId
            ? `소스 릴리스패키지 아티팩트: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.commitResultArtifactId
            ? `소스 커밋결과 아티팩트: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.deliveryStance ? `전달 stance: ${getDeliveryStanceDisplay(parsed.deliveryStance)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 리뷰 번들',
        [
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.reviewerMappedStatus
            ? `리뷰어 매핑 상태: ${getReviewStatusDisplay(parsed.reviewerMappedStatus)}`
            : null,
          parsed.reviewerRawVerdict ? `리뷰어 원시 판정: ${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '워크트리 검증',
        [
          parsed.repoCleanBeforeCloseOut !== null
            ? `종료 전 저장소 정리 상태: ${getBooleanDisplay(parsed.repoCleanBeforeCloseOut)}`
            : null,
          parsed.dirtyFileCount !== null ? `수정 파일 수: ${parsed.dirtyFileCount}` : null,
          parsed.stagedFileCount !== null ? `스테이징 파일 수: ${parsed.stagedFileCount}` : null,
          parsed.untrackedFileCount !== null
            ? `미추적 파일 수: ${parsed.untrackedFileCount}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '릴리스 안전성',
        [
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.publishExecuted !== null
            ? `publish 실행: ${getBooleanDisplay(parsed.publishExecuted)}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `외부 릴리스 실행: ${getBooleanDisplay(parsed.externalReleaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredUnifiedDiff(parsed, label) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      <div class="token-row">
        ${createToken(label, 'neutral')}
        ${createToken(`파일:${parsed.files.length}`, 'neutral')}
        ${createToken(`hunk:${parsed.hunkCount}`, 'neutral')}
      </div>
      ${renderBreakdownList('파일', parsed.files)}
    </div>
  `;
}

function renderCompactList(title, items, limit = 2) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <ul class="compact-list">
        ${items
          .slice(0, limit)
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}
      </ul>
    </section>
  `;
}

function createToken(label, tone = 'neutral') {
  return `<span class="token token-${tone}">${escapeHtml(label)}</span>`;
}

function getArtifactCatalogEntry(artifact, data) {
  if (!artifact || !data?.artifactCatalog) {
    return null;
  }

  return data.artifactCatalog[artifact.type] || null;
}

function getArtifactMeaningBadge(entry) {
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

function getArtifactPreviewBadge(entry) {
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

function renderArtifactPolicyTokens(artifact, data) {
  const entry = getArtifactCatalogEntry(artifact, data);
  const meaningBadge = getArtifactMeaningBadge(entry);
  const previewBadge = getArtifactPreviewBadge(entry);

  return [meaningBadge, previewBadge]
    .filter(Boolean)
    .map((badge) => createToken(badge.label, badge.tone))
    .join('');
}

function getArtifactPolicySummary(artifact, data) {
  const entry = getArtifactCatalogEntry(artifact, data);
  const meaningBadge = getArtifactMeaningBadge(entry);
  const previewBadge = getArtifactPreviewBadge(entry);

  if (!meaningBadge || !previewBadge) {
    return '';
  }

  return `${meaningBadge.label}. ${previewBadge.label}.`;
}

function getStructuredPreviewLeadCopy() {
  return '구조화 미리보기는 가능한 범위에서 제공합니다. 아래 저장된 원문이 최종 기준으로 남습니다.';
}

function getPreviewRedactionCopy() {
  return '미리보기는 파일 업데이트 항목 안의 저장된 저장소 내용을 가립니다. 아래 저장된 원문이 최종 기준으로 남습니다.';
}

function getStructuredPreviewFallbackCopy() {
  return '이 아티팩트 인스턴스에서는 구조화 미리보기를 만들 수 없습니다. 저장된 원문을 보여줍니다.';
}

function getRawOnlyPreviewCopy() {
  return '현재 계약에서는 이 아티팩트 타입이 원문 전용입니다. 구조화된 뷰는 만들지 않습니다.';
}

function getReviewTone(status) {
  if (status === 'passed') {
    return 'success';
  }

  if (status === 'changes_requested') {
    return 'danger';
  }

  return 'warning';
}

function getReviewerVerdictTone(verdict) {
  if (verdict === 'pass') {
    return 'success';
  }

  if (verdict === 'fail') {
    return 'danger';
  }

  if (verdict === 'changes_requested') {
    return 'warning';
  }

  return 'neutral';
}

function getRunTone(status) {
  return status === 'running' ? 'warning' : 'success';
}

function getApprovalTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'rejected') {
    return 'danger';
  }

  return 'warning';
}

function getApprovalDisplayTone(status) {
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

function getCommitPackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentCommitPackageArtifactId || summary?.latestCommitPackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'commit-package');
}

function buildCommitPackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const commitPackageArtifact = getCommitPackageArtifactForTask(task, data, summary);
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;
  const reviewerSummary =
    reviewerRun?.summary && typeof reviewerRun.summary === 'object' ? reviewerRun.summary : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'commit-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerSummary?.rawVerdict || null,
    reviewArtifact:
      (summary.sourceReviewArtifactId &&
        data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function getReleasePackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentReleasePackageArtifactId || summary?.latestReleasePackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'release-package');
}

function buildReleasePackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, summary);
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'release-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function buildCloseOutRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, {
    currentReleasePackageArtifactId: summary.currentReleasePackageArtifactId,
    latestReleasePackageArtifactId: summary.latestReleasePackageArtifactId,
  });
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovedReleaseApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'close-out',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function getArtifactsForRun(runId, data) {
  return data.artifacts
    .filter((artifact) => artifact.runId === runId)
    .sort(sortByCreatedDesc);
}

function findLatestRunForPreflightArtifact(artifact, data) {
  if (!artifact || artifact.type !== 'preflight') {
    return null;
  }

  return (
    data.runs
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
        return (
          summary?.executionMode === 'live-mutation' &&
          summary?.preflightArtifactId === artifact.id
        );
      })
      .sort(sortByCreatedDesc)[0] || null
  );
}

function getRunArtifactBundle(run, data) {
  if (!run) {
    return null;
  }

  const summary = run.summary && typeof run.summary === 'object' ? run.summary : {};
  const artifactIds =
    summary.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : {};
  const inputArtifactIds = Array.isArray(summary.inputArtifactIds) ? summary.inputArtifactIds : [];
  const sameRunArtifacts = getArtifactsForRun(run.id, data);
  const inputArtifacts = inputArtifactIds
    .map((artifactId) => data.artifactMap.get(artifactId))
    .filter(Boolean);
  const sourceBuilderRun =
    (summary.sourceBuilderRunId && data.runMap.get(summary.sourceBuilderRunId)) || null;
  const sourceReviewerRun =
    (summary.sourceReviewerRunId && data.runMap.get(summary.sourceReviewerRunId)) || null;

  return {
    approvalId: summary.approvalId || null,
    changeSummaryArtifact:
      (artifactIds.changeSummary && data.artifactMap.get(artifactIds.changeSummary)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      inputArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      null,
    changedFiles: Array.isArray(summary.changedFiles)
      ? summary.changedFiles
      : Array.isArray(summary.committedFiles)
        ? summary.committedFiles
        : [],
    closeOutArtifact:
      (summary.closeOutArtifactId && data.artifactMap.get(summary.closeOutArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'close-out') ||
      null,
    commitPackageArtifact:
      (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-package') ||
      null,
    commitResultArtifact:
      (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-result') ||
      null,
    diffArtifact:
      (artifactIds.diff && data.artifactMap.get(artifactIds.diff)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'diff') ||
      inputArtifacts.find((artifact) => artifact.type === 'diff') ||
      null,
    executionMode: summary.executionMode || run.metadata?.executionMode || null,
    inputArtifacts,
    patchArtifact:
      (artifactIds.patch && data.artifactMap.get(artifactIds.patch)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'patch') ||
      inputArtifacts.find((artifact) => artifact.type === 'patch') ||
      null,
    preflightArtifact:
      (summary.preflightArtifactId && data.artifactMap.get(summary.preflightArtifactId)) ||
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      inputArtifacts.find((artifact) => artifact.type === 'preflight') ||
      null,
    rawVerdict: summary.rawVerdict || null,
    releasePackageArtifact:
      (summary.releasePackageArtifactId && data.artifactMap.get(summary.releasePackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'release-package') ||
      null,
    reviewArtifact:
      (summary.reviewArtifactId && data.artifactMap.get(summary.reviewArtifactId)) ||
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'review') ||
      inputArtifacts.find((artifact) => artifact.type === 'review') ||
      null,
    sourceBuilderRun,
    sourceReviewerRun,
    sourceRun:
      (summary.sourceRunId && data.runMap.get(summary.sourceRunId)) ||
      null,
    run,
  };
}

function getPreferredArtifactForRun(run, data) {
  const bundle = getRunArtifactBundle(run, data);

  return (
    bundle?.closeOutArtifact ||
    bundle?.releasePackageArtifact ||
    bundle?.commitResultArtifact ||
    bundle?.commitPackageArtifact ||
    bundle?.reviewArtifact ||
    bundle?.changeSummaryArtifact ||
    bundle?.diffArtifact ||
    bundle?.patchArtifact ||
    getArtifactsForRun(run.id, data)[0] ||
    null
  );
}

function getArtifactRelationContext(artifact, data, options = {}) {
  if (!artifact) {
    return null;
  }

  const parsedChangeSummary = options.parsedChangeSummary || null;
  const parsedCloseOut = options.parsedCloseOut || null;
  const parsedCommitResult = options.parsedCommitResult || null;
  const parsedCommitPackage = options.parsedCommitPackage || null;
  const parsedReleasePackage = options.parsedReleasePackage || null;
  const parsedReview = options.parsedReview || null;
  let run = data.runMap.get(artifact.runId) || null;
  let bundle = run ? getRunArtifactBundle(run, data) : null;

  if (artifact.type === 'commit-result') {
    return {
      approvalId: bundle?.approvalId || parsedCommitResult?.commitApprovalId || null,
      builderRun:
        bundle?.sourceBuilderRun ||
        (parsedCommitResult?.sourceBuilderRunId
          ? data.runMap.get(parsedCommitResult.sourceBuilderRunId) || null
          : null),
      changeSummaryArtifact: bundle?.changeSummaryArtifact || null,
      changedFiles: parsedCommitResult?.committedFiles || bundle?.changedFiles || [],
      commitPackageArtifact:
        bundle?.commitPackageArtifact ||
        (parsedCommitResult?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCommitResult.commitPackageArtifactId) || null
          : null),
      diffArtifact: bundle?.diffArtifact || null,
      executionMode: bundle?.executionMode || null,
      patchArtifact: bundle?.patchArtifact || null,
      preflightArtifact:
        bundle?.preflightArtifact ||
        (parsedCommitResult?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitResult.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || null,
      run,
      runLabel: 'commit-executor run',
      reviewArtifact:
        bundle?.reviewArtifact ||
        (parsedCommitResult?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitResult.reviewArtifactId) || null
          : null),
      reviewerRun:
        bundle?.sourceReviewerRun ||
        (parsedCommitResult?.sourceReviewerRunId
          ? data.runMap.get(parsedCommitResult.sourceReviewerRunId) || null
          : null),
    };
  }

  if (artifact.type === 'commit-package') {
    const builderRun =
      (parsedCommitPackage?.sourceBuilderRunId &&
        data.runMap.get(parsedCommitPackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCommitPackage?.sourceReviewerRunId &&
        data.runMap.get(parsedCommitPackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: bundle?.approvalId || null,
      builderRun,
      changedFiles: parsedCommitPackage?.changedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact: artifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCommitPackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCommitPackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCommitPackage?.diffArtifactId
          ? data.artifactMap.get(parsedCommitPackage.diffArtifactId) || null
          : null),
      executionMode: 'commit-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCommitPackage?.patchArtifactId
          ? data.artifactMap.get(parsedCommitPackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCommitPackage?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitPackage.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCommitPackage?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      run,
      runLabel: 'commit-packager run',
      reviewArtifact:
        (parsedCommitPackage?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitPackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'review') {
    const sourceRun =
      bundle?.sourceRun ||
      (parsedReview?.sourceBuilderRunId
        ? data.runMap.get(parsedReview.sourceBuilderRunId) || null
        : null);
    const sourceBundle = sourceRun ? getRunArtifactBundle(sourceRun, data) : null;

    return {
      approvalId: sourceBundle?.approvalId || null,
      builderRun: sourceRun,
      changeSummaryArtifact:
        sourceBundle?.changeSummaryArtifact ||
        (parsedReview?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReview.changeSummaryArtifactId) || null
          : null),
      changedFiles: sourceBundle?.changedFiles || [],
      commitPackageArtifact: null,
      diffArtifact:
        sourceBundle?.diffArtifact ||
        (parsedReview?.diffArtifactId ? data.artifactMap.get(parsedReview.diffArtifactId) || null : null),
      executionMode: sourceBundle?.executionMode || null,
      patchArtifact:
        sourceBundle?.patchArtifact ||
        (parsedReview?.patchArtifactId ? data.artifactMap.get(parsedReview.patchArtifactId) || null : null),
      preflightArtifact:
        sourceBundle?.preflightArtifact ||
        (parsedReview?.preflightArtifactId
          ? data.artifactMap.get(parsedReview.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || parsedReview?.verdict || null,
      run,
      runLabel: 'reviewer run',
      reviewArtifact: artifact,
      reviewerRun: run,
    };
  }

  if (artifact.type === 'release-package') {
    const builderRun =
      (parsedReleasePackage?.sourceBuilderRunId &&
        data.runMap.get(parsedReleasePackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedReleasePackage?.sourceReviewerRunId &&
        data.runMap.get(parsedReleasePackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: null,
      builderRun,
      changedFiles: parsedReleasePackage?.committedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedReleasePackage?.commitPackageArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedReleasePackage?.commitResultArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedReleasePackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReleasePackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedReleasePackage?.diffArtifactId
          ? data.artifactMap.get(parsedReleasePackage.diffArtifactId) || null
          : null),
      executionMode: 'release-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedReleasePackage?.patchArtifactId
          ? data.artifactMap.get(parsedReleasePackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedReleasePackage?.preflightArtifactId
          ? data.artifactMap.get(parsedReleasePackage.preflightArtifactId) || null
          : null),
      rawVerdict: reviewerRun?.summary?.rawVerdict || null,
      releasePackageArtifact: artifact,
      run,
      runLabel: 'release-packager run',
      reviewArtifact:
        (parsedReleasePackage?.reviewArtifactId
          ? data.artifactMap.get(parsedReleasePackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'close-out') {
    const builderRun =
      (parsedCloseOut?.sourceBuilderRunId &&
        data.runMap.get(parsedCloseOut.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCloseOut?.sourceReviewerRunId &&
        data.runMap.get(parsedCloseOut.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: parsedCloseOut?.releaseApprovalId || null,
      builderRun,
      changedFiles: builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedCloseOut?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedCloseOut?.commitResultArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCloseOut?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCloseOut.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCloseOut?.diffArtifactId
          ? data.artifactMap.get(parsedCloseOut.diffArtifactId) || null
          : null),
      executionMode: 'close-out',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCloseOut?.patchArtifactId
          ? data.artifactMap.get(parsedCloseOut.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCloseOut?.preflightArtifactId
          ? data.artifactMap.get(parsedCloseOut.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCloseOut?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      releasePackageArtifact:
        (parsedCloseOut?.releasePackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.releasePackageArtifactId) || null
          : null) || bundle?.releasePackageArtifact,
      run,
      runLabel: 'close-out run',
      reviewArtifact:
        (parsedCloseOut?.reviewArtifactId
          ? data.artifactMap.get(parsedCloseOut.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (!bundle && artifact.type === 'preflight') {
    run = findLatestRunForPreflightArtifact(artifact, data);
    bundle = run ? getRunArtifactBundle(run, data) : null;
  }

  return {
    approvalId: bundle?.approvalId || parsedChangeSummary?.approvalId || null,
    builderRun:
      bundle?.sourceBuilderRun || (run?.role === 'builder' ? run : null),
    changeSummaryArtifact:
      bundle?.changeSummaryArtifact || (artifact.type === 'change-summary' ? artifact : null),
    changedFiles: bundle?.changedFiles || [],
    commitPackageArtifact:
      bundle?.commitPackageArtifact || (artifact.type === 'commit-package' ? artifact : null),
    diffArtifact: bundle?.diffArtifact || (artifact.type === 'diff' ? artifact : null),
    executionMode: bundle?.executionMode || null,
    patchArtifact: bundle?.patchArtifact || (artifact.type === 'patch' ? artifact : null),
    preflightArtifact:
      bundle?.preflightArtifact ||
      (parsedChangeSummary?.preflightArtifactId
        ? data.artifactMap.get(parsedChangeSummary.preflightArtifactId) || null
        : null) ||
      (artifact.type === 'preflight' ? artifact : null),
    rawVerdict: bundle?.rawVerdict || null,
    releasePackageArtifact:
      bundle?.releasePackageArtifact || (artifact.type === 'release-package' ? artifact : null),
    run,
    runLabel: 'run',
    reviewArtifact: bundle?.reviewArtifact || (artifact.type === 'review' ? artifact : null),
    reviewerRun:
      bundle?.sourceReviewerRun || (run?.role === 'reviewer' ? run : null),
  };
}

function renderRelationButton(label, action, id, tone = 'neutral', isSelected = false) {
  if (!id) {
    return '';
  }

  return `
    <button
      class="token-button token token-${tone} ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-action="${escapeHtml(action)}"
      data-id="${escapeHtml(id)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderRelationStrip(context) {
  if (!context) {
    return '';
  }

  const legacyRunButton =
    context.run &&
    context.run.id !== context.builderRun?.id &&
    context.run.id !== context.reviewerRun?.id
      ? renderRelationButton(
          `${getRunRelationLabelDisplay(context.runLabel || 'run')}:${context.run.id}`,
          'select-run',
          context.run.id,
          'neutral',
          state.selectedRunId === context.run.id,
        )
      : '';
  const relationButtons = [
    context.releasePackageArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('release-package')}:${context.releasePackageArtifact.id}`,
          'select-artifact',
          context.releasePackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.releasePackageArtifact.id,
        )
      : '',
    context.commitResultArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('commit-result')}:${context.commitResultArtifact.id}`,
          'select-artifact',
          context.commitResultArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitResultArtifact.id,
        )
      : '',
    context.commitPackageArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('commit-package')}:${context.commitPackageArtifact.id}`,
          'select-artifact',
          context.commitPackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitPackageArtifact.id,
        )
      : '',
    context.reviewerRun
      ? renderRelationButton(
          `리뷰어:${context.reviewerRun.id}`,
          'select-run',
          context.reviewerRun.id,
          'neutral',
          state.selectedRunId === context.reviewerRun.id,
        )
      : '',
    context.reviewArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('review')}:${context.reviewArtifact.id}`,
          'select-artifact',
          context.reviewArtifact.id,
          'neutral',
          state.selectedArtifactId === context.reviewArtifact.id,
        )
      : '',
    context.builderRun
      ? renderRelationButton(
          `빌더:${context.builderRun.id}`,
          'select-run',
          context.builderRun.id,
          'neutral',
          state.selectedRunId === context.builderRun.id,
        )
      : '',
    context.preflightArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('preflight')}:${context.preflightArtifact.id}`,
          'select-artifact',
          context.preflightArtifact.id,
          'neutral',
          state.selectedArtifactId === context.preflightArtifact.id,
        )
      : '',
    context.changeSummaryArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('change-summary')}:${context.changeSummaryArtifact.id}`,
          'select-artifact',
          context.changeSummaryArtifact.id,
          'neutral',
          state.selectedArtifactId === context.changeSummaryArtifact.id,
        )
      : '',
    context.patchArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('patch')}:${context.patchArtifact.id}`,
          'select-artifact',
          context.patchArtifact.id,
          'neutral',
          state.selectedArtifactId === context.patchArtifact.id,
        )
      : '',
    context.diffArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('diff')}:${context.diffArtifact.id}`,
          'select-artifact',
          context.diffArtifact.id,
          'neutral',
          state.selectedArtifactId === context.diffArtifact.id,
        )
      : '',
    legacyRunButton,
  ]
    .filter(Boolean)
    .join('');
  const contextTokens = [
    context.executionMode ? createToken(`모드:${getExecutionModeDisplay(context.executionMode)}`, 'neutral') : '',
    context.approvalId ? createToken(`승인:${context.approvalId}`, 'neutral') : '',
    context.rawVerdict
      ? createToken(
          `판정:${getReviewerVerdictDisplay(context.rawVerdict)}`,
          getReviewerVerdictTone(context.rawVerdict),
        )
      : '',
    context.changedFiles.length > 0
      ? createToken(`변경파일:${context.changedFiles.length}`, 'neutral')
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!relationButtons && !contextTokens && context.changedFiles.length === 0) {
    return '';
  }

  return `
    <div class="relation-strip">
      ${contextTokens ? `<div class="token-row">${contextTokens}</div>` : ''}
      ${relationButtons ? `<div class="relation-button-row">${relationButtons}</div>` : ''}
      ${renderCompactList('변경 파일', context.changedFiles, 4)}
    </div>
  `;
}

function getInboxTone(item) {
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

function renderReasonList(title, items) {
  const normalizedItems = Array.isArray(items) ? items.map((item) => getGuardReasonDisplay(item)) : items;
  return renderCompactList(
    title,
    normalizedItems,
    Array.isArray(normalizedItems) ? normalizedItems.length : 0,
  );
}

function findPendingApprovalItemByAction(taskId, data, allowedNextAction, matcher = null) {
  for (const item of data.inboxItems) {
    if (item.taskId !== taskId || item.status !== 'pending' || item.kind !== 'approval' || !item.sourceId) {
      continue;
    }

    const approval = data.approvals.find((candidate) => candidate.id === item.sourceId) || null;

    if (!approval || approval.allowedNextAction !== allowedNextAction) {
      continue;
    }

    if (!matcher || matcher(approval)) {
      return item;
    }
  }

  return null;
}

function renderPreselectedPendingItemHint(item, approval, options = {}) {
  if (!item) {
    return '';
  }

  const helpText =
    options.helpText || '승인 처리는 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다.';
  const hintSignalRow = options.signalRow
    ? `
      <div class="breakdown-inbox-signal-row">
        ${options.signalRow}
      </div>
    `
    : '';

  return `
    <div class="breakdown-inbox-hint">
      <div class="token-row">
        ${createToken(`선택된 결정함:${item.id}`, 'warning')}
        ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
        ${item.blocksTask ? createToken('태스크 차단', 'danger') : ''}
        ${approval ? createToken(`범위:${approval.scope}`, 'neutral') : ''}
        ${
          approval?.allowedNextAction
            ? createToken(`액션:${getApprovalActionLabel(approval.allowedNextAction)}`, 'neutral')
            : ''
        }
      </div>
      <p class="detail-copy">${escapeHtml(item.title)}</p>
      <p class="detail-copy">${escapeHtml(item.prompt || '기록된 안내 문구가 없습니다.')}</p>
      ${hintSignalRow}
      ${
        item.kind === 'approval'
          ? `
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="approve"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                승인
              </button>
              <button
                class="danger-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="reject"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                반려
              </button>
              <p class="form-help">${escapeHtml(helpText)}</p>
            </div>
          `
          : '<p class="form-help">이 슬라이스에서는 결정 처리를 결정함 표면에 남깁니다.</p>'
      }
    </div>
  `;
}

function getSurfaceDisplayName(surface) {
  return SURFACE_DISPLAY_NAMES[surface] || surface || '현재 표면';
}

function renderTaskDetailNavigationHint(task, options = {}) {
  if (!task) {
    return '';
  }

  const label = options.label || '태스크 상세';
  const helpText = options.helpText || '실행을 이어가려면 태스크 상세를 엽니다.';

  return `
    <div class="breakdown-inbox-hint">
      <div class="form-actions form-actions-inline">
        <button
          class="secondary-button"
          type="button"
          data-action="open-taskboard-task"
          data-id="${escapeHtml(task.id)}"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          ${escapeHtml(label)}
        </button>
        <p class="form-help">${escapeHtml(helpText)}</p>
      </div>
    </div>
  `;
}

function renderCommitPackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCommitPackageAvailability(task, data);
  const commitExecutionState = getCommitExecutionAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCommitApprovalDisplayStatus(summary);
  const packageStatus = summary.currentCommitPackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestCommitPackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildCommitPackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `최신 리뷰어 번들 ${summary.sourceReviewerRunId || '기준 리뷰어 결과'}를 바탕으로 커밋 패키지 아티팩트를 만들고 커밋 승인 안건을 엽니다. 외부 전달은 계속 막아 둡니다.`
    : `커밋 패키지 준비는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 리뷰어 번들이 준비될 때까지'
      } 대기합니다.`;
  const localCommitDisplayStatus =
    commitExecutionState.summary.latestApprovalDisplayStatus ||
    getCommitApprovalDisplayStatus(commitExecutionState.summary);
  const localCommitHelp = commitExecutionState.summary.allowed
    ? `승인된 커밋 패키지 ${commitExecutionState.summary.commitPackageArtifactId || '기준 패키지'}에서 로컬 커밋을 실행하고 커밋 결과 아티팩트로 이어집니다. 외부 전달은 계속 비활성입니다.`
    : `로컬 커밋은 ${
        (commitExecutionState.summary.reasons || [])
          .map((reason) => getGuardReasonDisplay(reason))
          .join('; ') || '승인된 로컬 커밋 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false || !allowExecutingActions
      ? ''
      : `
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-commit-package"
            data-id="${escapeHtml(task.id)}"
            ${disabled ? 'disabled' : ''}
          >
            커밋 패키지 준비
          </button>
          <p class="form-help">${escapeHtml(actionHelp)}</p>
        </div>
      `;
  const localCommitActionSurface =
    options.includeLocalCommitAction === false
      ? ''
      : `
        <div class="guard-summary">
          <div class="token-row">
            ${
              commitExecutionState.summary.allowed
                ? createToken('로컬커밋:준비됨', 'success')
                : createToken('로컬커밋:차단', 'warning')
            }
            ${createToken(
              `커밋승인:${getApprovalStatusDisplay(localCommitDisplayStatus)}`,
              getApprovalDisplayTone(localCommitDisplayStatus),
            )}
            ${
              commitExecutionState.summary.commitPackageArtifactId
                ? createToken(
                    `패키지:${commitExecutionState.summary.commitPackageArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.existingCommitResultArtifactId
                ? createToken(
                    `기존결과:${commitExecutionState.summary.existingCommitResultArtifactId}`,
                    commitExecutionState.summary.conflict ? 'warning' : 'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.sourceReviewerRunId
                ? createToken(`리뷰어:${commitExecutionState.summary.sourceReviewerRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.sourceBuilderRunId
                ? createToken(`빌더:${commitExecutionState.summary.sourceBuilderRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.targetPreflightArtifactId
                ? createToken(
                    `preflight:${commitExecutionState.summary.targetPreflightArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.changedFileCount
                ? createToken(
                    `변경파일:${commitExecutionState.summary.changedFileCount}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.commitMessagePresent
                ? createToken('커밋메시지:있음', 'success')
                : createToken('커밋메시지:없음', 'warning')
            }
          </div>
          <p class="detail-copy">
            로컬 커밋 가능 여부는 로컬 커밋 준비도 요약을 그대로 따릅니다. UI는 loading/mutation 상태만 얹고, 푸시, 병합, 릴리스는 계속 비활성 상태로 둡니다.
          </p>
          ${
            commitExecutionState.summary.reasons?.length
              ? renderReasonList(
                  '로컬 커밋 비활성 사유',
                  commitExecutionState.summary.reasons,
                )
              : '<p class="detail-copy">현재 승인된 커밋패키지 번들 기준으로 로컬 커밋이 준비됐습니다.</p>'
          }
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-local-commit"
                    data-id="${escapeHtml(task.id)}"
                    ${commitExecutionState.disabled ? 'disabled' : ''}
                  >
                    승인된 로컬 커밋 이어가기
                  </button>
                  <p class="form-help">${escapeHtml(localCommitHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)}는 커밋 후속 처리에서 탐색 전용으로 남습니다. 승인된 로컬 커밋 이어가기는 태스크 상세에서 실행합니다.`,
                    )}
                  </p>
                `
            }
          </div>
        </div>
      `;
  const navigationHint =
    allowExecutingActions
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: '커밋 가드',
          helpText:
            '실행은 태스크 상세에 남고, 아티팩트와 결정함은 커밋 이어가기 동안 탐색 전용으로 유지됩니다.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('커밋패키지:준비됨', 'success')
            : createToken('커밋패키지:차단', 'warning')
        }
        ${createToken(
          `커밋승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`승인:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentCommitPackageArtifactId
            ? createToken(`현재패키지:${summary.currentCommitPackageArtifactId}`, 'neutral')
            : summary.latestCommitPackageArtifactId
              ? createToken(`최신패키지:${summary.latestCommitPackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        커밋패키지 준비도는 coordinator 요약을 그대로 따릅니다. 이 패널은 그 상태만 보여주고 실제 git commit, 병합, 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('커밋 패키지 가드 사유', summary.reasons)
          : '<p class="detail-copy">최신 통과 리뷰어 번들에 남은 커밋패키지 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 커밋패키지 연결 맥락이 없습니다.</p>'
      }
      ${actionSurface}
      ${localCommitActionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderReleasePackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getReleasePackageAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const displayStatus = summary.latestApprovalDisplayStatus || 'none';
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestReleasePackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildReleasePackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `커밋결과 ${summary.commitResultArtifactId || '기준 로컬 커밋 번들'}에서 릴리스 패키지를 만들고 릴리스 승인 안건을 엽니다. 외부 전달은 계속 비활성입니다.`
    : `릴리스 패키지 준비는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 성공 로컬 커밋 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-release-package"
            data-id="${escapeHtml(task.id)}"
            ${disabled ? 'disabled' : ''}
          >
            릴리스 패키지 준비
          </button>
          <p class="form-help">${escapeHtml(actionHelp)}</p>
        </div>
        `;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('릴리스패키지:준비됨', 'success')
            : createToken('릴리스패키지:차단', 'warning')
        }
        ${createToken(
          `릴리스승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`승인:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`현재패키지:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`최신패키지:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-result')}:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-package')}:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitSha
            ? createToken(`sha:${summary.commitSha}`, 'success')
            : ''
        }
        ${
          summary.deliveryStance
            ? createToken(`전달:${getDeliveryStanceDisplay(summary.deliveryStance)}`, 'neutral')
            : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        릴리스패키지 준비도는 coordinator 요약을 그대로 따릅니다. 이 패널은 그 상태만 보여주고 푸시, 게시, 외부 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('릴리스 패키지 가드 사유', summary.reasons)
          : '<p class="detail-copy">현재 로컬 커밋 번들에 남은 릴리스패키지 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 릴리스패키지 연결 근거가 없습니다.</p>'
      }
      ${actionSurface}
    </div>
  `;
}

function renderCloseOutPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCloseOutAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCloseOutApprovalDisplayStatus(summary);
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.latestReleasePackageArtifactId
      ? 'latest'
      : 'missing';
  const relationContext = buildCloseOutRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `승인된 릴리스패키지 ${summary.currentReleasePackageArtifactId || '기준 번들'}에서 종료 정리를 실행하고 종료정리 아티팩트를 남깁니다. 외부 전달은 계속 비활성입니다.`
    : `종료 정리는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '현재 승인된 릴리스 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-close-out"
                    data-id="${escapeHtml(task.id)}"
                    ${disabled ? 'disabled' : ''}
                  >
                    승인된 종료 정리 이어가기
                  </button>
                  <p class="form-help">${escapeHtml(actionHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)}는 종료 정리 후속 처리에서 탐색 전용으로 남습니다. 승인된 종료 정리 이어가기는 태스크 상세에서 실행합니다.`,
                    )}
                  </p>
                `
            }
          </div>
        `;
  const navigationHint =
    allowExecutingActions || !summary.allowed
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: '종료 가드',
          helpText:
            '실행은 태스크 상세에 남고, 아티팩트와 결정함은 종료 정리 이어가기 동안 탐색 전용으로 유지됩니다.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('종료정리:준비됨', 'success')
            : createToken('종료정리:차단', 'warning')
        }
        ${createToken(
          `릴리스승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current' ? 'success' : 'neutral',
        )}
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`현재패키지:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`최신패키지:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-result')}:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-package')}:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${summary.commitSha ? createToken(`sha:${summary.commitSha}`, 'success') : ''}
        ${
          summary.deliveryStance
            ? createToken(`전달:${getDeliveryStanceDisplay(summary.deliveryStance)}`, 'neutral')
            : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.repoClean
            ? createToken('저장소:정상', 'success')
            : createToken('저장소:차단', 'warning')
        }
        ${
          summary.existingCloseOutArtifactId
            ? createToken(`기존종료정리:${summary.existingCloseOutArtifactId}`, summary.conflict ? 'warning' : 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        종료 정리 가능 여부는 종료 정리 준비도 요약을 그대로 따릅니다. UI는 loading/mutating 상태만 얹고, 푸시, 게시, 외부 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('종료 정리 가드 사유', summary.reasons)
          : '<p class="detail-copy">현재 승인된 릴리스 번들에 남은 종료 정리 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 종료정리 연결 근거가 없습니다.</p>'
      }
      ${actionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderBuilderLiveMutationApprovalPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { guardSummary, requestSummary } = getBuilderLiveMutationSummaries(task, data);
  const requestDisabled = state.loading || state.mutating || !requestSummary.allowed;
  const runDisabled = state.loading || state.mutating || !guardSummary.allowed;
  const requestHelp = requestSummary.allowed
    ? `${requestSummary.currentPreflightArtifactId} 기준으로 새 승인 안건을 엽니다.`
    : `승인 요청은 ${
        (requestSummary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 프리플라이트가 준비될 때까지'
      } 대기합니다.`;
  const runHelp = guardSummary.allowed
    ? `${guardSummary.currentPreflightArtifactId} 기준 라이브 변경을 실행하고 변경요약, 패치, diff 아티팩트를 남깁니다.`
    : `라이브 변경은 ${
        (guardSummary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 승인된 프리플라이트 쌍이 준비될 때까지'
      } 대기합니다.`;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          guardSummary.allowed
            ? createToken('라이브변경가드:준비됨', 'success')
            : createToken('라이브변경가드:차단', 'danger')
        }
        ${createToken(
          `최신승인:${getApprovalStatusDisplay(guardSummary.latestApprovalDisplayStatus || 'none')}`,
          getApprovalDisplayTone(guardSummary.latestApprovalDisplayStatus || 'none'),
        )}
        ${
          requestSummary.currentPreflightArtifactId
            ? createToken(`현재preflight:${requestSummary.currentPreflightArtifactId}`, 'neutral')
            : createToken('현재preflight:없음', 'warning')
        }
        ${
          guardSummary.targetPreflightArtifactId
            ? createToken(`승인대상:${guardSummary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          guardSummary.targetFileCount
            ? createToken(`대상파일:${guardSummary.targetFileCount}`, 'neutral')
            : createToken('대상파일:없음', 'warning')
        }
        ${
          requestSummary.allowed
            ? createToken('요청:가능', 'success')
            : createToken('요청:비활성', requestSummary.conflict ? 'danger' : 'warning')
        }
        ${
          guardSummary.allowed
            ? createToken('실행:가능', 'success')
            : createToken('실행:비활성', 'warning')
        }
      </div>
      <p class="detail-copy">
        제한된 빌더 라이브 변경에 대한 런타임 요약입니다. 실행은 최신 프리플라이트 대상 파일에만 한정되고, 커밋 경로를 자동 시작하지 않은 채 리뷰어에게 넘깁니다.
      </p>
      ${
        guardSummary.reasons?.length
          ? renderReasonList('라이브 변경 가드 사유', guardSummary.reasons)
          : '<p class="detail-copy">최신 프리플라이트 대상에 남은 라이브 변경 가드 사유가 없습니다.</p>'
      }
      ${
        requestSummary.reasons?.length
          ? renderReasonList('승인 요청 비활성 사유', requestSummary.reasons)
          : '<p class="detail-copy">최신 프리플라이트 대상 기준으로 승인 요청이 가능합니다.</p>'
      }
      ${
        options.includeRequestAction === false
          ? ''
          : `
            <div class="form-actions form-actions-inline">
              <button
                class="secondary-button"
                type="button"
                data-action="request-builder-live-mutation-approval"
                data-id="${escapeHtml(task.id)}"
                ${requestDisabled ? 'disabled' : ''}
              >
                라이브 변경 승인 요청
              </button>
              <p class="form-help">${escapeHtml(requestHelp)}</p>
            </div>
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-builder-live-mutation"
                data-id="${escapeHtml(task.id)}"
                ${runDisabled ? 'disabled' : ''}
              >
                라이브 변경 실행
              </button>
              <p class="form-help">${escapeHtml(runHelp)}</p>
            </div>
          `
      }
    </div>
  `;
}

function ensureSelection(data) {
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedArtifact = data.artifactMap.get(state.selectedArtifactId) || null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  if (!state.selectionSeeded) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
    state.selectedTaskId =
      selectedArtifact?.taskId ||
      selectedRun?.taskId ||
      selectedInboxItem?.taskId ||
      data.tasks[0]?.id ||
      null;

    const initialTask = data.taskMap.get(state.selectedTaskId) || null;
    const initialRun =
      selectedRun ||
      (initialTask?.latestRunId && data.runMap.has(initialTask.latestRunId)
        ? data.runMap.get(initialTask.latestRunId)
        : null);
    const initialArtifact =
      selectedArtifact ||
      (initialRun ? getPreferredArtifactForRun(initialRun, data) : null) ||
      (initialTask ? getPreferredTaskArtifact(initialTask, data) : null) ||
      data.artifacts[0] ||
      null;

    state.selectedRunId = initialRun?.id || null;
    state.selectedArtifactId = initialArtifact?.id || null;
    state.selectedInboxItemId =
      selectedInboxItem?.id ||
      (initialTask ? getPreferredTaskInboxItem(initialTask.id, data)?.id || null : null) ||
      data.inboxItems.find((item) => item.status === 'pending')?.id ||
      data.inboxItems[0]?.id ||
      null;
    state.selectionSeeded = true;
    return;
  }

  if (state.selectedMissionId && !selectedMission) {
    state.selectedMissionId = null;
  }

  if (state.selectedRunId && !selectedRun) {
    state.selectedRunId = null;
  }

  if (state.selectedArtifactId && !selectedArtifact) {
    state.selectedArtifactId = null;
  }

  if (state.selectedInboxItemId && !selectedInboxItem) {
    state.selectedInboxItemId = null;
  }

  if (!state.selectedTaskId || !data.taskMap.has(state.selectedTaskId)) {
    state.selectedTaskId =
      (state.selectedArtifactId && data.artifactMap.get(state.selectedArtifactId)?.taskId) ||
      (state.selectedRunId && data.runMap.get(state.selectedRunId)?.taskId) ||
      (state.selectedInboxItemId && data.inboxItemMap.get(state.selectedInboxItemId)?.taskId) ||
      data.tasks[0]?.id ||
      null;
  }

  if (!state.selectedMissionId || !data.missionMap.has(state.selectedMissionId)) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
  }

  const activeTask = data.taskMap.get(state.selectedTaskId) || null;
  const currentRun = state.selectedRunId ? data.runMap.get(state.selectedRunId) || null : null;
  const currentArtifact = state.selectedArtifactId
    ? data.artifactMap.get(state.selectedArtifactId) || null
    : null;
  const currentInboxItem = state.selectedInboxItemId
    ? data.inboxItemMap.get(state.selectedInboxItemId) || null
    : null;

  if (currentRun && activeTask && currentRun.taskId !== activeTask.id) {
    state.selectedRunId = null;
  }

  if (currentArtifact && activeTask && currentArtifact.taskId !== activeTask.id) {
    state.selectedArtifactId = null;
  }

  if (currentInboxItem && activeTask && currentInboxItem.taskId !== activeTask.id) {
    state.selectedInboxItemId = null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`요청이 실패했습니다: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `요청이 실패했습니다: ${response.status} ${response.statusText}`);
  }

  return payload;
}

function buildProviderPayload(mode, model, apiKeyVar) {
  const normalizedMode = mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: normalizedMode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: normalizedMode === 'live' ? apiKeyVar.trim() : '',
    },
    mode: normalizedMode,
    model: normalizedMode === 'live' ? model.trim() : '',
  };
}

function applySnapshotPayload(payload) {
  state.payload = {
    derived: payload.derived || createEmptyDerivedState(),
    generatedAt: payload.generatedAt,
    runtimeRoot: payload.runtimeRoot,
    snapshot: payload.snapshot,
  };

  const snapshot = payload.snapshot || {};
  const activeProject = snapshot.activeProjectId
    ? snapshot.projects?.[snapshot.activeProjectId] || null
    : null;

  if (
    (activeProject && state.projectProviderDraftProjectId !== activeProject.id) ||
    (!activeProject && state.projectProviderDraftProjectId !== null)
  ) {
    syncProjectProviderDraft(activeProject);
  }
}

function resolvePostMutationSurface(currentSurface, payload, fallbackSurface) {
  const inboxItemId = payload?.mutation?.inboxItemId || null;

  if (!inboxItemId) {
    return fallbackSurface;
  }

  const data = getDerived();
  const item = data.inboxItemMap.get(inboxItemId) || null;

  if (item?.status === 'pending' && item.kind === 'decision') {
    return currentSurface;
  }

  return fallbackSurface;
}

async function hydrateSelectedDetails() {
  const runId = state.selectedRunId;
  const artifactId = state.selectedArtifactId;
  const data = getDerived();
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const latestBreakdownArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'breakdown')
    : null;
  const latestPreflightArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'preflight')
    : null;

  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  let selectedArtifactDetail = null;

  await Promise.all([
    runId
      ? fetchJson(`/api/runs/${encodeURIComponent(runId)}/logs`).then((payload) => {
          state.selectedRunLogs = payload;
        })
      : Promise.resolve(),
    artifactId
      ? fetchJson(`/api/artifacts/${encodeURIComponent(artifactId)}`).then((artifactPayload) => {
          selectedArtifactDetail = artifactPayload.artifact;
          state.selectedArtifact = artifactPayload.artifact;
        })
      : Promise.resolve(),
  ]);

  if (latestBreakdownArtifact) {
    if (selectedArtifactDetail?.id === latestBreakdownArtifact.id) {
      state.selectedTaskBreakdownArtifact = selectedArtifactDetail;
    } else {
      const breakdownPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestBreakdownArtifact.id)}`,
      );

      state.selectedTaskBreakdownArtifact = breakdownPayload.artifact;
    }
  }

  if (latestPreflightArtifact) {
    if (selectedArtifactDetail?.id === latestPreflightArtifact.id) {
      state.selectedTaskPreflightArtifact = selectedArtifactDetail;
    } else {
      const preflightPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestPreflightArtifact.id)}`,
      );

      state.selectedTaskPreflightArtifact = preflightPayload.artifact;
    }
  }
}

async function refreshData() {
  if (state.loading || state.mutating) {
    return;
  }

  state.loading = true;
  state.error = null;
  elements.refreshStatus.textContent = '런타임 상태 요약 다시 읽는 중…';

  try {
    applySnapshotPayload(await fetchJson('/api/snapshot'));
    const data = getDerived();
    ensureSelection(data);
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `최근 갱신 ${formatDate(state.payload?.generatedAt)}`;
  } catch (error) {
    state.error = error;
    render();
    elements.refreshStatus.textContent = '런타임 상태 요약 연결 실패';
  } finally {
    state.loading = false;
    render();
  }
}

function syncSelectionsFromTask(taskId, options = {}) {
  const data = getDerived();
  const task = data.taskMap.get(taskId);
  const preferredRun =
    options.preferredRunId && data.runMap.has(options.preferredRunId)
      ? data.runMap.get(options.preferredRunId)
      : null;
  const preferredArtifact =
    options.preferredArtifactId && data.artifactMap.has(options.preferredArtifactId)
      ? data.artifactMap.get(options.preferredArtifactId)
      : null;
  const preferredInboxItem =
    options.preferredInboxItemId && data.inboxItemMap.has(options.preferredInboxItemId)
      ? data.inboxItemMap.get(options.preferredInboxItemId)
      : null;
  const currentInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  state.selectedTaskId = taskId;
  state.selectionSeeded = true;

  if (preferredRun && preferredRun.taskId === taskId) {
    state.selectedRunId = preferredRun.id;
  } else if (task?.latestRunId && data.runMap.has(task.latestRunId)) {
    state.selectedRunId = task.latestRunId;
  } else {
    state.selectedRunId = null;
  }

  if (preferredArtifact && preferredArtifact.taskId === taskId) {
    state.selectedArtifactId = preferredArtifact.id;
  } else {
    const taskArtifact = getPreferredTaskArtifact(task, data);
    state.selectedArtifactId = taskArtifact?.id || null;
  }

  if (
    preferredInboxItem &&
    preferredInboxItem.taskId === taskId &&
    preferredInboxItem.status === 'pending'
  ) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else if (options.applyTaskInboxPreselect) {
    state.selectedInboxItemId = getPreferredTaskInboxItem(taskId, data)?.id || null;
  } else if (currentInboxItem && currentInboxItem.taskId === taskId) {
    state.selectedInboxItemId = currentInboxItem.id;
  } else if (preferredInboxItem && preferredInboxItem.taskId === taskId) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else {
    state.selectedInboxItemId =
      data.inboxItems.find((item) => item.taskId === taskId && item.status === 'pending')?.id ||
      data.inboxItems.find((item) => item.taskId === taskId)?.id ||
      null;
  }
}

function syncSelectionsFromMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  state.selectedMissionId = missionId;
  state.selectionSeeded = true;

  if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
    syncSelectionsFromTask(mission.linkedTaskId, {
      applyTaskInboxPreselect: true,
    });
    state.selectedMissionId = missionId;
  }
}

function prepareNextMissionDraft(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  state.surface = 'mission';
  state.selectedMissionId = mission?.id || state.selectedMissionId;
  state.missionDraftTitle = '';
  state.missionDraftGoal = '';
  state.missionDraftConstraints = mission?.constraints || '';
  state.missionDraftDeliverableType = mission?.deliverableType || 'decision-memo';
  elements.refreshStatus.textContent = mission
    ? `미션 ${mission.id} 기준으로 다음 안건 초안을 준비했습니다`
    : '다음 안건 초안을 준비했습니다';
}

async function handleSurfaceChange(surface) {
  state.menuGroup = getNavGroupForSurface(surface);
  state.surface = surface;
  render();
}

async function handleNavGroupChange(groupId) {
  const group = NAV_GROUPS[groupId] || NAV_GROUPS.workflows;

  state.menuGroup = groupId;

  if (!group.surfaces.includes(state.surface)) {
    state.surface = group.defaultSurface;
  }

  render();
}

function createCompanyMemberId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}`;
}

function addCompanyMember() {
  const name = state.companyMemberDraftName.trim();

  if (!name) {
    throw new Error('AI 에이전트 이름을 먼저 적어 주세요.');
  }

  state.companyMembers = [
    ...state.companyMembers,
    normalizeCompanyMember(
      {
        id: createCompanyMemberId(),
        name,
        role: state.companyMemberDraftRole,
        surface: state.companyMemberDraftSurface,
      },
      state.companyMembers.length,
    ),
  ];
  persistCompanyMembers();
  state.companyMemberDraftName = '';
  state.companyMemberDraftRole = 'builder';
  state.companyMemberDraftSurface = 'execution';
  elements.refreshStatus.textContent = `${name} 에이전트를 회사에 추가했습니다`;
  render();
}

function updateCompanyMember(memberId, values) {
  const targetIndex = state.companyMembers.findIndex((entry) => entry.id === memberId);

  if (targetIndex < 0) {
    throw new Error('수정할 회사 인력을 먼저 선택하세요.');
  }

  const nextMember = normalizeCompanyMember(
    {
      id: memberId,
      name: values.name,
      role: values.role,
      surface: values.surface,
    },
    targetIndex,
  );

  state.companyMembers = state.companyMembers.map((entry, index) =>
    index === targetIndex ? nextMember : entry,
  );
  persistCompanyMembers();
  elements.refreshStatus.textContent = `${nextMember.name} 배정을 저장했습니다`;
  render();
}

function removeCompanyMember(memberId) {
  const target = state.companyMembers.find((entry) => entry.id === memberId);

  if (!target) {
    throw new Error('제거할 회사 인력을 찾지 못했습니다.');
  }

  state.companyMembers = state.companyMembers.filter((entry) => entry.id !== memberId);
  persistCompanyMembers();
  elements.refreshStatus.textContent = `${target.name} 에이전트를 회사 명부에서 제거했습니다`;
  render();
}

async function handleSelection(action, id) {
  if (action === 'select-project') {
    await submitSelectProject(id);
    return;
  }

  if (action === 'select-mission') {
    await submitSelectMission(id);
    return;
  }

  if (action === 'open-council') {
    syncSelectionsFromMission(id);
    state.surface = 'council';
  }

  if (action === 'open-execution') {
    syncSelectionsFromMission(id);
    state.surface = 'execution';
  }

  if (action === 'revise-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'open-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'prepare-next-mission') {
    prepareNextMissionDraft(id);
  }

  if (action === 'select-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
  }

  if (action === 'open-taskboard-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
    state.surface = 'taskboard';
  }

  if (action === 'create-linked-task-for-mission') {
    await submitCreateLinkedTaskForMission(id);
    return;
  }

  if (action === 'draft-council-for-mission') {
    await submitDraftCouncilForMission(id);
    return;
  }

  if (action === 'approve-council-for-mission') {
    await submitApproveCouncilForMission(id);
    return;
  }

  if (action === 'open-advanced-ops') {
    const data = getDerived();
    const mission = data.missionMap.get(id) || null;

    if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
      syncSelectionsFromTask(mission.linkedTaskId, {
        applyTaskInboxPreselect: true,
      });
    }

    state.selectedMissionId = mission?.id || state.selectedMissionId;
    state.surface = 'taskboard';
  }

  if (action === 'select-run') {
    const data = getDerived();
    const run = data.runMap.get(id);

    state.selectedRunId = id;

    if (run) {
      const preferredArtifact = getPreferredArtifactForRun(run, data);

      syncSelectionsFromTask(run.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
      });
      state.selectedRunId = id;
    }
  }

  if (action === 'select-artifact') {
    const data = getDerived();
    const artifact = data.artifactMap.get(id);

    state.selectedArtifactId = id;

    if (artifact) {
      const preferredReleaseInboxItem =
        artifact.type === 'release-package'
          ? findPendingApprovalItemByAction(
              artifact.taskId,
              data,
              'release-ready',
              (approval) => approval.metadata?.releasePackageArtifactId === artifact.id,
            )
          : artifact.type === 'commit-result'
            ? findPendingApprovalItemByAction(
                artifact.taskId,
                data,
                'release-ready',
                (approval) => approval.metadata?.commitResultArtifactId === artifact.id,
              )
            : null;

      syncSelectionsFromTask(artifact.taskId, {
        preferredInboxItemId: preferredReleaseInboxItem?.id || null,
      });
      state.selectedArtifactId = id;
      state.selectedRunId = artifact.runId || state.selectedRunId;
    }
  }

  if (action === 'select-inbox-item') {
    const data = getDerived();
    const item = data.inboxItemMap.get(id);

    state.selectedInboxItemId = id;

    if (item) {
      const approval =
        item.kind === 'approval' && item.sourceId
          ? data.approvals.find((candidate) => candidate.id === item.sourceId) || null
          : null;
      const commitPackageArtifactId =
        approval?.allowedNextAction === 'commit-intent'
          ? approval.metadata?.commitPackageArtifactId || null
          : null;
      const releasePackageArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.releasePackageArtifactId || null
          : null;
      const commitResultArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.commitResultArtifactId || null
          : null;
      const commitPackageArtifact =
        commitPackageArtifactId && data.artifactMap.has(commitPackageArtifactId)
          ? data.artifactMap.get(commitPackageArtifactId)
          : null;
      const releasePackageArtifact =
        releasePackageArtifactId && data.artifactMap.has(releasePackageArtifactId)
          ? data.artifactMap.get(releasePackageArtifactId)
          : null;
      const commitResultArtifact =
        commitResultArtifactId && data.artifactMap.has(commitResultArtifactId)
          ? data.artifactMap.get(commitResultArtifactId)
          : null;
      const preferredArtifact = releasePackageArtifact || commitPackageArtifact || commitResultArtifact || null;

      syncSelectionsFromTask(item.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
        preferredRunId: preferredArtifact?.runId || null,
      });
      state.selectedInboxItemId = id;
    }
  }

  await hydrateSelectedDetails();
  render();
}

async function submitCreateProject(options = {}) {
  const name = state.projectDraftName.trim();
  const projectPath = state.projectDraftPath.trim();
  const pack = state.projectDraftPack === 'knowledge-work' ? 'knowledge-work' : 'development';
  const provider = options.forceLocalStub
    ? buildProviderPayload('local-stub', '', '')
    : buildProviderPayload(
        state.projectDraftProviderMode,
        state.projectDraftProviderModel,
        state.projectDraftProviderApiKeyVar,
      );

  if (!name) {
    throw new Error('프로젝트 이름이 필요합니다.');
  }

  if (!projectPath) {
    throw new Error('project_path가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '프로젝트를 등록하는 중…';
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      pack,
      provider,
      projectPath,
    });

    state.projectDraftName = '';
    state.projectDraftPath = '';
    state.projectDraftPack = 'development';
    state.projectDraftProviderMode = 'local-stub';
    state.projectDraftProviderModel = '';
    state.projectDraftProviderApiKeyVar = '';
    await applyProjectScopePayload(payload);
    if (options.successSurface) {
      state.surface = options.successSurface;
    }
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitUpdateProjectProvider() {
  const data = getDerived();
  const activeProject = data.activeProject;

  if (!activeProject) {
    throw new Error('프로바이더 설정을 바꾸려면 활성 프로젝트가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${activeProject.name}의 프로바이더 설정을 업데이트하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/provider-config`,
      {
        provider: buildProviderPayload(
          state.projectProviderDraftMode,
          state.projectProviderDraftModel,
          state.projectProviderDraftApiKeyVar,
        ),
      },
    );

    applySnapshotPayload(payload);
    syncProjectProviderDraft(payload.project || null);
    render();
    elements.refreshStatus.textContent = `${payload.project.name}의 프로바이더 설정을 업데이트했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedWorktree() {
  const data = getDerived();
  const activeProject = data.activeProject;
  const slug = state.linkedWorktreeDraftSlug.trim();

  if (!activeProject) {
    throw new Error('연결 워크트리를 만들려면 활성 프로젝트가 필요합니다.');
  }

  if (!slug) {
    throw new Error('연결 워크트리 슬러그가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `연결 워크트리 ${slug} 생성 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/linked-worktrees`,
      {
        slug,
      },
    );

    state.linkedWorktreeDraftSlug = '';
    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectProject(projectId) {
  const dataBefore = getDerived();

  if (!projectId || !dataBefore.snapshot.projects[projectId]) {
    throw new Error('등록된 프로젝트를 먼저 선택하세요.');
  }

  if (projectId === dataBefore.activeProject?.id) {
    return;
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `활성 프로젝트를 ${projectId}(으)로 전환하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/projects/${encodeURIComponent(projectId)}/select`);

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateMission() {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('미션을 만들려면 활성 프로젝트가 필요합니다.');
  }

  const title = state.missionDraftTitle.trim();
  const goal = state.missionDraftGoal.trim();
  const constraints = state.missionDraftConstraints.trim();
  const deliverableType =
    data.activeProject.pack === 'knowledge-work'
      ? state.missionDraftDeliverableType || 'decision-memo'
      : '';

  if (!title) {
    throw new Error('미션 제목이 필요합니다.');
  }

  if (!goal) {
    throw new Error('미션 목표가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '미션을 만들고 협의회를 초안 작성하는 중…';
  render();

  try {
    const payload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints,
      deliverableType,
      goal,
      title,
    });

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(payload.mission.id);
    state.missionDraftTitle = '';
    state.missionDraftGoal = '';
    state.missionDraftConstraints = '';
    state.missionDraftDeliverableType = 'decision-memo';
    state.selectionSeeded = true;
    await hydrateSelectedDetails();
    state.surface = payload.councilSession?.id ? 'council' : 'mission';
    render();
    elements.refreshStatus.textContent = payload.councilSession?.id
      ? `미션 ${payload.mission.id}을 만들고 협의회 ${payload.councilSession.id}를 초안 작성했습니다`
      : `미션 ${payload.mission.id}을 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectMission(missionId) {
  const data = getDerived();

  if (!missionId || !data.missionMap.has(missionId)) {
    throw new Error('미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}을 선택하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/missions/${encodeURIComponent(missionId)}/select`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `미션 ${payload.mission.id}을 선택했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedTaskForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('연결된 태스크를 만들기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}용 연결 태스크를 만드는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/create-linked-task`,
      {},
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `연결 태스크 ${payload.task.id}를 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitDraftCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('협의회를 초안 작성하기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}의 협의회를 초안 작성하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/draft-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `협의회 ${payload.councilSession.id}를 초안 작성했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitApproveCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('협의회 추천안을 승인하기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}의 추천안을 승인하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/approve-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    if (payload.task?.id) {
      syncSelectionsFromTask(payload.task.id, {
        applyTaskInboxPreselect: true,
        preferredArtifactId:
          payload.mutation?.lastArtifactId || payload.approval?.targetArtifactId || null,
        preferredInboxItemId: payload.item?.id || null,
        preferredRunId: payload.mutation?.lastRunId || null,
      });
    }
    await hydrateSelectedDetails();
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent = `미션 ${payload.mission.id}을 정렬했고 실행을 ${payload.mutation?.autoChain?.stoppedAt || 'execution'} 단계까지 진행했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateTask() {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('태스크를 만들려면 활성 프로젝트가 필요합니다.');
  }

  const title = state.taskDraftTitle.trim();
  const intent = state.taskDraftIntent.trim();

  if (!title) {
    throw new Error('태스크 제목이 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '태스크를 만드는 중…';
  render();

  try {
    const payload = await postJson('/api/tasks', {
      intent,
      title,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.selectedTaskId = payload.task.id;
    state.selectedRunId = null;
    state.selectedArtifactId = null;
    state.selectedInboxItemId = null;
    state.selectedRunLogs = null;
    state.selectedArtifact = null;
    state.selectedTaskBreakdownArtifact = null;
    state.selectedTaskPreflightArtifact = null;
    state.taskDraftTitle = '';
    state.taskDraftIntent = '';
    state.selectionSeeded = true;
    state.surface = 'taskboard';
    render();
    elements.refreshStatus.textContent = `태스크 ${payload.task.id}를 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runPlanner(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('플래너 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 플래너 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `플래너 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runArchitect(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('설계 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 설계 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-architect`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `설계 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runTaskBreaker(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('태스크 분해 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 태스크 분해 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `태스크 분해 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderPreflight(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('사전 점검을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 사전 점검을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-preflight`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `사전 점검 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function requestBuilderLiveMutationApproval(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('builder 라이브 변경 승인을 요청하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 라이브 변경 승인을 요청하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/request-builder-live-mutation-approval`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.targetArtifactId || null,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.targetRunId || null,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `라이브 변경 승인 ${payload.mutation.approvalId}를 요청했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderLiveMutation(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('builder 라이브 변경을 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 라이브 변경을 실행하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'logs';
    render();
    elements.refreshStatus.textContent = `builder 라이브 변경 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReviewer(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('reviewer를 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 reviewer를 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-reviewer`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `reviewer 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCommitPackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('커밋 패키지를 준비하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 커밋 패키지를 준비하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-commit-package`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `커밋 패키지 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runLocalCommit(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('로컬 커밋을 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 로컬 커밋을 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-local-commit`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `로컬 커밋 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReleasePackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('릴리스 패키지를 준비하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 릴리스 패키지를 준비하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-release-package`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface =
      currentSurface === 'taskboard' || currentSurface === 'artifacts'
        ? currentSurface
        : 'artifacts';
    render();
    elements.refreshStatus.textContent = `릴리스 패키지 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCloseOut(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('종료 정리를 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 종료 정리를 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-close-out`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `종료 정리 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function resetProjectScopeSelections() {
  state.selectedMissionId = null;
  state.selectedTaskId = null;
  state.selectedRunId = null;
  state.selectedArtifactId = null;
  state.selectedInboxItemId = null;
  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  state.selectionSeeded = false;
}

async function applyProjectScopePayload(payload) {
  applySnapshotPayload(payload);
  const data = getDerived();

  resetProjectScopeSelections();
  ensureSelection(data);
  await hydrateSelectedDetails();
  render();
}

async function updateTaskWorktreeRef(taskId, worktreeRef) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('task.worktreeRef를 바꾸기 전에 태스크를 먼저 선택하세요.');
  }

  const isClearing = worktreeRef === null;

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = isClearing
    ? `태스크 ${taskId}의 저장된 워크트리 경로를 비우는 중…`
    : `태스크 ${taskId}에 연결 워크트리를 적용하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/worktree-ref`, {
      worktreeRef,
    });

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = isClearing
      ? `태스크 ${taskId}의 저장된 워크트리 경로를 비웠습니다`
      : `태스크 ${taskId}의 저장된 워크트리 경로를 업데이트했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function applySelectedTaskWorktree(taskId) {
  const select = document.querySelector('#task-worktree-select');

  if (!select) {
    throw new Error('연결 워크트리 선택 항목이 없습니다.');
  }

  const worktreeRef = select.value.trim();

  if (!worktreeRef) {
    throw new Error('적용할 연결 워크트리를 먼저 선택하세요.');
  }

  await updateTaskWorktreeRef(taskId, worktreeRef);
}

async function clearTaskWorktree(taskId) {
  await updateTaskWorktreeRef(taskId, null);
}

async function switchActiveProjectWorktree(worktreePath) {
  const data = getDerived();
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const option =
    (activeProjectLinkedWorktrees.options || []).find((candidate) => candidate.path === worktreePath) || null;

  if (!data.activeProject) {
    throw new Error('연결 워크트리로 전환하려면 활성 프로젝트가 필요합니다.');
  }

  if (!option) {
    throw new Error('활성 프로젝트를 전환하기 전에 탐지된 연결 워크트리를 먼저 선택하세요.');
  }

  if (option.isCurrentProjectPath) {
    return;
  }

  if (option.registeredProjectId) {
    await submitSelectProject(option.registeredProjectId);
    return;
  }

  const name = option.suggestedProjectName || buildLinkedWorktreeFallbackName(option);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `연결 워크트리 ${worktreePath}를 활성 프로젝트로 등록하는 중…`;
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      projectPath: option.path,
    });

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runInboxAction(itemId, verb) {
  const data = getDerived();
  const item = data.inboxItemMap.get(itemId);
  const previousRunId = state.selectedRunId;
  const previousArtifactId = state.selectedArtifactId;

  if (!item) {
    throw new Error('처리할 대기 결정함 항목을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${getInboxResolutionActionDisplay(verb)} ${itemId} 처리 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(itemId)}/actions`,
      { verb },
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(payload.mutation.taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: previousArtifactId,
      preferredRunId: previousRunId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `${payload.mutation.itemId} ${getInboxResolutionActionDisplay(verb)} 완료`;
  } finally {
    state.mutating = false;
    render();
  }
}

function getSurfaceDockCount(data, surface) {
  if (surface === 'mission') {
    return data.missions.length;
  }

  if (surface === 'council') {
    return data.councilSessions.length;
  }

  if (surface === 'execution') {
    return data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  }

  if (surface === 'deliverables') {
    return data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  }

  if (surface === 'taskboard') {
    return data.tasks.length;
  }

  if (surface === 'logs') {
    return data.runs.length;
  }

  if (surface === 'artifacts') {
    return data.artifacts.length;
  }

  if (surface === 'decision-inbox') {
    return data.inboxItems.filter((item) => item.status === 'pending').length;
  }

  return 0;
}

function getExecutionDeskStatus(task) {
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

function getExecutionDeskNext(task) {
  if (!task) {
    return '실행 셀 생성';
  }

  if (task.flags?.waitingApproval) {
    return '승인선 처리';
  }

  if (task.flags?.waitingDecision) {
    return '결정함 처리';
  }

  if (task.review?.status === 'approved') {
    return '결과 패킷 전달';
  }

  return '작업 지시 계속';
}

function getDeliverablesDeskStatus(task, artifact) {
  if (artifact) {
    return `${getArtifactTypeDisplay(artifact.type)} 패킷`;
  }

  if (task?.review?.status) {
    return `리뷰 ${getReviewStatusDisplay(task.review.status)}`;
  }

  return '패킷 대기';
}

function getDeliverablesDeskNext(task, artifact, pendingGateCount) {
  if (!task && !artifact) {
    return '결과 패킷 생성';
  }

  if (pendingGateCount > 0) {
    return '승인선 확인';
  }

  if (task?.review?.status === 'approved' || artifact) {
    return '종료 보고 확인';
  }

  return '리뷰 라인 정리';
}

function getCompanyFloorBoardEntries(data, navGroupId) {
  const resolvedGroupId = NAV_GROUPS[navGroupId] ? navGroupId : 'workflows';
  const selectedMission =
    data.missionMap.get(state.selectedMissionId) ||
    data.missions[0] ||
    null;
  const selectedCouncil =
    (selectedMission?.councilSessionId
      ? data.councilSessionMap.get(selectedMission.councilSessionId) || null
      : null) ||
    data.councilSessions[0] ||
    null;
  const selectedTask =
    data.taskMap.get(state.selectedTaskId) ||
    (selectedMission?.linkedTaskId ? data.taskMap.get(selectedMission.linkedTaskId) || null : null) ||
    data.tasks[0] ||
    null;
  const selectedArtifact =
    data.artifactMap.get(state.selectedArtifactId) ||
    (selectedTask ? data.artifacts.find((artifact) => artifact.taskId === selectedTask.id) || null : null) ||
    data.artifacts[0] ||
    null;
  const selectedRun =
    data.runMap.get(state.selectedRunId) ||
    (selectedTask?.latestRunId ? data.runMap.get(selectedTask.latestRunId) || null : null) ||
    data.runs[0] ||
    null;
  const selectedInboxItem =
    data.inboxItemMap.get(state.selectedInboxItemId) ||
    (selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null) ||
    data.inboxItems.find((item) => item.status === 'pending') ||
    null;
  const pendingGateCount = data.inboxItems.filter((item) => item.status === 'pending').length;

  const entries = [
    {
      surface: 'mission',
      desk: '본부 접수',
      kicker: '접수 라인',
      owner: '안건 담당',
      count: getSurfaceDockCount(data, 'mission'),
      status: selectedMission ? getMissionStatusDisplay(selectedMission.status) : '안건 대기',
      next: selectedMission
        ? selectedMission.councilSessionId
          ? '회의실 정렬 계속'
          : '회의실 초안 작성'
        : '신규 안건 등록',
      note: selectedMission?.title || '등록된 안건이 아직 없습니다.',
    },
    {
      surface: 'council',
      desk: '회의실',
      kicker: '회의 라인',
      owner: '회의 리드',
      count: getSurfaceDockCount(data, 'council'),
      status: selectedCouncil
        ? getAlignmentStatusDisplay(selectedCouncil.alignment?.status || 'pending')
        : '회의 대기',
      next: selectedCouncil
        ? selectedCouncil.selectedPlan
          ? '권고안 확정'
          : '역할 발언 정렬'
        : '회의 초안 작성',
      note: selectedCouncil?.selectedPlan?.title || selectedMission?.title || '열린 회의 안건이 없습니다.',
    },
    {
      surface: 'execution',
      desk: '실행 셀',
      kicker: '실행 라인',
      owner: '실행 역할',
      count: getSurfaceDockCount(data, 'execution'),
      status: getExecutionDeskStatus(selectedTask),
      next: getExecutionDeskNext(selectedTask),
      note: selectedTask?.title || '배정된 실행 셀이 아직 없습니다.',
    },
    {
      surface: 'deliverables',
      desk: '보고 데스크',
      kicker: '보고 라인',
      owner: '보고 담당',
      count: getSurfaceDockCount(data, 'deliverables'),
      status: getDeliverablesDeskStatus(selectedTask, selectedArtifact),
      next: getDeliverablesDeskNext(selectedTask, selectedArtifact, pendingGateCount),
      note: selectedArtifact?.id || selectedTask?.title || '전달할 결과 패킷이 아직 없습니다.',
    },
    {
      surface: 'artifacts',
      desk: '증적 패킷',
      kicker: '증적 라인',
      owner: 'reviewer',
      count: getSurfaceDockCount(data, 'artifacts'),
      status: selectedArtifact ? getArtifactTypeDisplay(selectedArtifact.type) : '증적 대기',
      next: pendingGateCount > 0 ? '승인선 확인' : '패킷 검토',
      note: selectedArtifact?.id || selectedTask?.title || '열린 증적 패킷이 없습니다.',
    },
    {
      surface: 'logs',
      desk: '실행 로그',
      kicker: '기록 라인',
      owner: 'trace reader',
      count: getSurfaceDockCount(data, 'logs'),
      status: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedArtifact ? '증적 확인' : 'run 기록 확인',
      note: selectedRun?.id || selectedTask?.title || '열린 실행 기록이 없습니다.',
    },
    {
      surface: 'decision-inbox',
      desk: '승인선',
      kicker: '게이트 라인',
      owner: '사람 게이트',
      count: getSurfaceDockCount(data, 'decision-inbox'),
      status: pendingGateCount > 0 ? `${pendingGateCount}건 대기` : '대기 없음',
      next: pendingGateCount > 0 ? '사람 게이트 처리' : '현재 승인선 비움',
      note: selectedInboxItem?.title || '열린 승인 안건이 없습니다.',
    },
    {
      surface: 'taskboard',
      desk: '작업판',
      kicker: '운영 라인',
      owner: '실행 관제',
      count: getSurfaceDockCount(data, 'taskboard'),
      status: getExecutionDeskStatus(selectedTask),
      next: selectedTask ? '실행 셀' : '태스크 등록',
      note: selectedTask?.title || '열린 작업 셀이 없습니다.',
    },
  ];

  return entries.filter((entry) => NAV_GROUPS[resolvedGroupId].surfaces.includes(entry.surface));
}

function getCompanyDirectorySummary() {
  const counts = {
    ops: 0,
    review: 0,
    workflows: 0,
  };

  for (const member of state.companyMembers) {
    const groupId = getNavGroupForSurface(member.surface);
    counts[groupId] += 1;
  }

  return counts;
}

function renderCompanyDirectory(data) {
  if (!elements.companyDirectoryShell || !elements.companyDirectorySummary) {
    return;
  }

  const activeGroupId = getActiveNavGroupId();
  const activeGroupLabel = getNavGroupLabel(activeGroupId);
  const counts = getCompanyDirectorySummary();
  const members = [...state.companyMembers];
  const groupedMembers = Object.keys(NAV_GROUPS).map((groupId) => ({
    groupId,
    label: getNavGroupLabel(groupId),
    members: getCompanyMembersForGroup(groupId),
  }));

  elements.companyDirectorySummary.innerHTML = `
    <div class="company-directory-summary-grid">
      <div class="company-directory-summary-cell">
        <span class="office-register-label">전체 인력</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(members.length))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">업무</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.workflows))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">검토</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.review))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">운영</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.ops))}</strong>
      </div>
    </div>
  `;

  elements.companyDirectoryShell.innerHTML = `
    <div class="company-directory-section-list">
      ${groupedMembers
        .map(({ groupId, label, members: sectionMembers }) => {
          const isActiveGroup = groupId === activeGroupId;

          return `
            <section
              class="company-directory-section ${isActiveGroup ? 'is-active-group' : ''}"
              data-selection-state="${isActiveGroup ? 'active' : 'idle'}"
            >
              <div class="company-directory-section-head">
                <div class="company-directory-section-copy">
                  <p class="company-directory-section-label">${escapeHtml(label)}</p>
                  <strong class="company-directory-section-title">${escapeHtml(`${label} 팀`)}</strong>
                </div>
                ${createToken(`${sectionMembers.length}명`, isActiveGroup ? 'accent' : 'neutral')}
              </div>
              <div class="company-directory-list">
                ${
                  sectionMembers.length
                    ? sectionMembers
                        .map((member) => {
                          const isCurrentSurface = member.surface === state.surface;

                          return `
                            <button
                              class="company-directory-row ${isActiveGroup ? 'is-current-group' : ''} ${isCurrentSurface ? 'is-current-surface' : ''}"
                              type="button"
                              data-action="open-company-seat"
                              data-id="${escapeHtml(member.id)}"
                              data-target-surface="${escapeHtml(member.surface)}"
                              aria-current="${isCurrentSurface ? 'true' : 'false'}"
                              data-selection-state="${isCurrentSurface ? 'active' : isActiveGroup ? 'group' : 'idle'}"
                            >
                              <div class="company-directory-avatar">${escapeHtml(member.name.slice(0, 2).toUpperCase())}</div>
                              <div class="company-directory-main">
                                <strong class="company-directory-name">${escapeHtml(member.name)}</strong>
                                <p class="company-directory-meta">${escapeHtml(getCompanyRoleLabel(member.role))}</p>
                              </div>
                              <div class="company-directory-assignment">
                                <span class="company-directory-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                              </div>
                            </button>
                          `;
                        })
                        .join('')
                    : `<p class="company-directory-empty">${escapeHtml(`${label} 팀 인력이 아직 없습니다.`)}</p>`
                }
              </div>
            </section>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderWorkspaceHeader(data, context) {
  const activeGroupId = getActiveNavGroupId();
  const meta = GROUP_WORKSPACE_META[activeGroupId] || GROUP_WORKSPACE_META.workflows;
  const activeProject = data.activeProject;

  if (elements.shellHeader.eyebrow) {
    elements.shellHeader.eyebrow.textContent = meta.eyebrow;
  }

  if (elements.shellHeader.title) {
    elements.shellHeader.title.textContent = meta.title;
  }

  if (elements.shellHeader.windowLabel) {
    elements.shellHeader.windowLabel.textContent = meta.windowLabel;
  }

  if (elements.shellHeader.project) {
    elements.shellHeader.project.textContent = activeProject?.name || '미지정';
  }

  if (elements.shellHeader.surface) {
    elements.shellHeader.surface.textContent = meta.title;
  }

  if (elements.shellHeader.gates) {
    elements.shellHeader.gates.textContent = `${context.pendingGateCount}건`;
  }

  document.body.dataset.navGroup = activeGroupId;
}

function getCompanyMembersForGroup(groupId = null) {
  const groupOrder = ['workflows', 'review', 'ops'];
  const members = groupId
    ? state.companyMembers.filter((member) => getNavGroupForSurface(member.surface) === groupId)
    : state.companyMembers;

  return [...members].sort((left, right) => {
    const leftGroupIndex = groupOrder.indexOf(getNavGroupForSurface(left.surface));
    const rightGroupIndex = groupOrder.indexOf(getNavGroupForSurface(right.surface));

    if (leftGroupIndex !== rightGroupIndex) {
      return leftGroupIndex - rightGroupIndex;
    }

    const leftDesk = getCompanyDeskLabel(left.surface);
    const rightDesk = getCompanyDeskLabel(right.surface);

    if (leftDesk !== rightDesk) {
      return leftDesk.localeCompare(rightDesk, 'ko');
    }

    return left.name.localeCompare(right.name, 'ko');
  });
}

function renderCompanyRosterList(members, emptyCopy = '배정된 인력이 아직 없습니다.') {
  if (!Array.isArray(members) || members.length === 0) {
    return `<p class="company-roster-empty">${escapeHtml(emptyCopy)}</p>`;
  }

  return `
    <div class="company-roster-list">
      ${members
        .map((member) => {
          const groupId = getNavGroupForSurface(member.surface);

          return `
            <div class="company-roster-row">
              <div class="company-roster-main">
                <strong class="company-roster-name">${escapeHtml(member.name)}</strong>
                <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
              </div>
              <div class="company-roster-assignment">
                <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                <span class="company-roster-group">${escapeHtml(getNavGroupLabel(groupId))}</span>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderOverviewPanelHead({ label, title, copy }) {
  return `
    <div class="control-overview-panel-head">
      <p class="control-overview-label">${escapeHtml(label)}</p>
      <h3 class="control-overview-title">${escapeHtml(title)}</h3>
      ${copy ? `<p class="control-overview-copy">${escapeHtml(copy)}</p>` : ''}
    </div>
  `;
}

function renderControlOverviewSignalStrip(items) {
  return `
    <div class="control-overview-signal-strip">
      ${items
        .map(
          (item) => `
            <article class="control-overview-signal-card">
              <span class="control-overview-signal-label">${escapeHtml(item.label)}</span>
              <strong class="control-overview-signal-value">${escapeHtml(item.value)}</strong>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderWorkspacePlaybook(activeGroupId) {
  const meta = GROUP_PLAYBOOK_META[activeGroupId] || GROUP_PLAYBOOK_META.workflows;

  return `
    <section class="workspace-playbook" data-nav-group="${escapeHtml(activeGroupId)}">
      <div class="workspace-playbook-head">
        <p class="control-overview-label">${escapeHtml(meta.label)}</p>
        <h3 class="workspace-playbook-title">${escapeHtml(meta.title)}</h3>
      </div>
      <div class="workspace-playbook-grid">
        ${meta.cards
          .map(
            (card) => `
              <article class="workspace-playbook-card">
                <span class="workspace-playbook-step">${escapeHtml(card.step)}</span>
                <div class="workspace-playbook-copy">
                  <strong class="workspace-playbook-card-title">${escapeHtml(card.title)}</strong>
                  <p class="workspace-playbook-note">${escapeHtml(card.note)}</p>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderWorkflowQueueLane(entry) {
  const isActive = entry.surface === state.surface;
  return `
    <button
      class="workflow-stage-card ${isActive ? 'is-active' : ''}"
      type="button"
      data-action="open-surface"
      data-target-surface="${escapeHtml(entry.surface)}"
      aria-current="${isActive ? 'true' : 'false'}"
      data-selection-state="${isActive ? 'active' : 'idle'}"
    >
      <div class="workflow-stage-head">
        <div class="workflow-stage-head-main">
          <div class="workflow-stage-index">${escapeHtml(String(entry.order).padStart(2, '0'))}</div>
          ${isActive ? '<span class="workflow-stage-active-label">현재 보기</span>' : ''}
        </div>
        ${createToken(`${entry.count}건`, isActive ? 'accent' : 'neutral')}
      </div>
      <div class="workflow-stage-copy">
        <p class="workflow-stage-kicker">${escapeHtml(entry.kicker)}</p>
        <strong class="workflow-stage-title">${escapeHtml(entry.desk)}</strong>
        <p class="workflow-stage-note">${escapeHtml(entry.note)}</p>
      </div>
      <div class="workflow-stage-meta">
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.status)}</strong>
        </div>
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">담당</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.owner)}</strong>
        </div>
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.next)}</strong>
        </div>
      </div>
    </button>
  `;
}

function renderReviewLaneCard(entry) {
  const isActive = entry.surface === state.surface;
  return `
    <button
      class="review-lane-card ${isActive ? 'is-active' : ''}"
      type="button"
      data-action="open-surface"
      data-target-surface="${escapeHtml(entry.surface)}"
      aria-current="${isActive ? 'true' : 'false'}"
      data-selection-state="${isActive ? 'active' : 'idle'}"
    >
      <div class="review-lane-card-head">
        <div class="review-lane-card-head-main">
          <p class="control-overview-label">${escapeHtml(entry.kicker)}</p>
          ${isActive ? '<span class="review-lane-card-active-label">현재 보기</span>' : ''}
        </div>
        ${createToken(`${entry.count}건`, isActive ? 'accent' : 'neutral')}
      </div>
      <strong class="review-lane-card-title">${escapeHtml(entry.desk)}</strong>
      <p class="review-lane-card-copy">${escapeHtml(entry.note)}</p>
      <div class="review-lane-card-meta">
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.status)}</strong>
        </div>
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">담당</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.owner)}</strong>
        </div>
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.next)}</strong>
        </div>
      </div>
    </button>
  `;
}

function renderReviewInspectorSteps(check, selectedPacket) {
  return `
    <div class="review-inspector-steps">
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">1</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">패킷 확인</strong>
          <p class="review-inspector-step-note">${escapeHtml(selectedPacket)}</p>
        </div>
      </article>
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">2</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">근거 교차 확인</strong>
          <p class="review-inspector-step-note">${escapeHtml(check.evidence)}</p>
        </div>
      </article>
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">3</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">다음 이동</strong>
          <p class="review-inspector-step-note">${escapeHtml(check.next)}</p>
        </div>
      </article>
    </div>
  `;
}

function renderWorkflowsOverview(data, context, activeGroupId) {
  const activeProject = data.activeProject;
  const queueEntries = getCompanyFloorBoardEntries(data, activeGroupId).map((entry, index) => ({
    ...entry,
    order: index + 1,
  }));
  const focus = getControlOverviewFocus(context);
  const check = getControlOverviewCheck(state.surface, context, data);
  const workflowMembers = getCompanyMembersForGroup(activeGroupId);
  const activeDeskLabel = getSurfaceDisplayName(state.surface);
  const selectedMission = context.selectedMission;
  const selectedCouncil = context.selectedCouncil;
  const selectedTask = context.selectedTask || context.activeTask;
  const selectedRun = context.selectedRun;
  const selectedArtifact = context.selectedArtifact;
  const selectedOrderTitle = selectedTask?.title || selectedMission?.title || '열린 work order 없음';
  const selectedOrderSignal = selectedTask
    ? getTaskLifecycleDisplay(selectedTask.lifecycleState)
    : selectedMission
      ? getMissionStatusDisplay(selectedMission.status)
      : '등록 대기';
  const selectedOrderEvidence = selectedRun?.id || selectedArtifact?.id || selectedTask?.id || selectedMission?.id || '근거 대기';
  const selectedOrderOwner = selectedTask
    ? '실행 역할'
    : selectedCouncil
      ? '회의 리드'
      : selectedMission
        ? '안건 담당'
        : '운영자';
  const selectedOrderNext = selectedTask
    ? getExecutionDeskNext(selectedTask)
    : selectedMission?.councilSessionId
      ? '회의 정렬 이어가기'
      : '회의 초안 작성';

  return `
    <div class="control-overview-stack control-overview-stack-workflows">
      ${renderControlOverviewSignalStrip([
        { label: '현재 데스크', value: activeDeskLabel },
        { label: '담당', value: selectedOrderOwner },
        { label: '다음', value: selectedOrderNext },
      ])}
      ${renderWorkspacePlaybook(activeGroupId)}
      <div class="control-overview-grid control-overview-grid-workflows workflow-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <aside class="control-overview-panel workflow-overview-rail">
        ${renderOverviewPanelHead({
          label: 'Workflow map',
          title: '업무 흐름',
        })}
        <div class="workflow-stage-stack">
          ${queueEntries.map((entry) => renderWorkflowQueueLane(entry)).join('')}
        </div>
      </aside>

      <section class="control-overview-panel workflow-overview-main workflow-overview-order">
        ${renderOverviewPanelHead({
          label: 'Selected work order',
          title: '선택된 work order',
        })}
        <div class="workflow-focus-hero workflow-order-hero">
          <p class="workflow-order-kicker">${escapeHtml(activeDeskLabel)}</p>
          <h4 class="workflow-focus-title">${escapeHtml(selectedOrderTitle)}</h4>
          <p class="workflow-focus-copy">${escapeHtml(focus.copy)}</p>
          <div class="token-row">
            ${createToken(`담당:${selectedOrderOwner}`, 'neutral')}
            ${createToken(`status:${selectedOrderSignal}`, 'accent')}
            ${createToken(`next:${selectedOrderNext}`, 'neutral')}
          </div>
        </div>
        <div class="control-overview-register workflow-order-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">안건</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedMission?.title || '안건 대기')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">실행</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedTask?.id || '실행 셀 대기')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderEvidence)}</strong>
          </div>
        </div>
        <div class="workflow-workorder-strip">
          <article class="workflow-workorder-note">
            <p class="control-overview-label">지금 처리</p>
            <strong class="workflow-workorder-note-title">${escapeHtml(focus.status)}</strong>
            <p class="workflow-focus-copy">${escapeHtml(focus.next)} 전까지만 정리합니다.</p>
          </article>
          <article class="workflow-workorder-note">
            <p class="control-overview-label">다음 인계</p>
            <strong class="workflow-workorder-note-title">${escapeHtml(check.next)}</strong>
            <p class="workflow-focus-copy">${escapeHtml(check.current)} 정리 후 넘깁니다.</p>
          </article>
        </div>
      </section>

      <aside class="control-overview-panel workflow-overview-handoff workflow-overview-transfer">
        ${renderOverviewPanelHead({
          label: 'Execution handoff',
          title: '실행 인계',
        })}
        <div class="control-overview-register workflow-handoff-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">막힘</span>
            <strong class="control-overview-register-value">${escapeHtml(check.current)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(check.evidence)}</strong>
          </div>
        </div>
        <div class="workflow-roster-card workflow-handoff-card">
          <p class="control-overview-label">실행 라인업</p>
          ${renderCompanyRosterList(workflowMembers, '업무 라인에 배정된 인력이 아직 없습니다.')}
        </div>
        ${
          check.action
            ? `
              <button
                class="primary-button control-overview-action"
                type="button"
                data-action="open-surface"
                data-target-surface="${escapeHtml(check.action.targetSurface)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                ${escapeHtml(check.action.label)}
              </button>
            `
            : ''
          }
      </aside>
      </div>
    </div>
  `;
}

function renderReviewOverview(data, context, activeGroupId) {
  const queueEntries = getCompanyFloorBoardEntries(data, activeGroupId);
  const focus = getControlOverviewFocus(context);
  const check = getControlOverviewCheck(state.surface, context, data);
  const selectedPacket = context.selectedArtifact?.id || context.selectedRun?.id || context.selectedInboxItem?.id || '선택 대기';
  const openEvidenceCount = data.artifacts.length;
  const openLogCount = data.runs.length;
  const reviewMembers = getCompanyMembersForGroup(activeGroupId);
  const pendingReviewCount = data.inboxItems.filter((item) => item.status === 'pending').length;
  const packetKind = context.selectedArtifact?.type
    ? getArtifactTypeDisplay(context.selectedArtifact.type)
    : context.selectedRun
      ? 'run evidence'
      : context.selectedInboxItem
        ? 'decision packet'
        : 'packet pending';
  const selectedPacketOwner = focus.owner;

  return `
    <div class="control-overview-stack control-overview-stack-review">
      ${renderControlOverviewSignalStrip([
        { label: '현재 패킷', value: selectedPacket },
        { label: '담당', value: focus.owner },
        { label: '다음', value: check.next },
      ])}
      ${renderWorkspacePlaybook(activeGroupId)}
      <div class="control-overview-grid control-overview-grid-review review-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <aside class="control-overview-panel review-overview-lanes">
        ${renderOverviewPanelHead({
          label: 'Review queue',
          title: '검토 큐',
        })}
        <div class="review-queue-summary">
          <div class="review-queue-summary-row">
            <span class="control-overview-register-label">검토</span>
            <strong class="control-overview-register-value">${escapeHtml(`${pendingReviewCount}건`)}</strong>
          </div>
          <div class="review-queue-summary-row">
            <span class="control-overview-register-label">증적</span>
            <strong class="control-overview-register-value">${escapeHtml(`${openEvidenceCount}건`)}</strong>
          </div>
        </div>
        <div class="review-lane-stack">
          ${queueEntries.map((entry) => renderReviewLaneCard(entry)).join('')}
        </div>
      </aside>

      <section class="control-overview-panel review-overview-packet">
        ${renderOverviewPanelHead({
          label: 'Selected packet',
          title: '선택 패킷',
        })}
        <div class="workflow-focus-hero review-focus-hero review-packet-hero">
          <h4 class="workflow-focus-title">${escapeHtml(focus.title)}</h4>
          <p class="workflow-focus-copy">${escapeHtml(focus.copy)}</p>
          <div class="token-row">
            ${createToken(`판단:${focus.status}`, 'accent')}
            ${createToken(`근거:${selectedPacket}`, 'neutral')}
            ${createToken(`다음:${check.next}`, 'neutral')}
          </div>
        </div>
        <div class="control-overview-register review-packet-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">패킷</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedPacket)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">타입</span>
            <strong class="control-overview-register-value">${escapeHtml(packetKind)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedPacketOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
        </div>
        <div class="review-packet-grid review-packet-metrics">
          <div class="review-packet-cell">
            <span class="control-overview-detail-label">현재 판단</span>
            <strong class="control-overview-detail-value">${escapeHtml(focus.status)}</strong>
          </div>
          <div class="review-packet-cell">
            <span class="control-overview-detail-label">근거 패킷</span>
            <strong class="control-overview-detail-value">${escapeHtml(selectedPacket)}</strong>
          </div>
        </div>
        <div class="review-packet-strip">
          <article class="review-packet-note">
            <p class="control-overview-label">판단 메모</p>
            <strong class="review-packet-note-title">${escapeHtml(check.current)}</strong>
            <p class="workflow-focus-copy">현재 판단만 유지합니다.</p>
          </article>
          <article class="review-packet-note">
            <p class="control-overview-label">연결 run</p>
            <strong class="review-packet-note-title">${escapeHtml(context.selectedRun?.id || `${openLogCount}건 대기`)}</strong>
            <p class="workflow-focus-copy">실행 로그와 교차 확인합니다.</p>
          </article>
          <article class="review-packet-note review-evidence-note">
            <p class="control-overview-label">열린 gate</p>
            <strong class="review-packet-note-title">${escapeHtml(context.selectedInboxItem?.id || `${pendingReviewCount}건`)}</strong>
            <p class="workflow-focus-copy">결정함 우선 여부만 확인합니다.</p>
          </article>
        </div>
      </section>

      <aside class="control-overview-panel review-overview-inspector">
        ${renderOverviewPanelHead({
          label: 'Review inspector',
          title: '검토 기준',
        })}
        <div class="control-overview-register review-inspector-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(focus.owner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">기준</span>
            <strong class="control-overview-register-value">${escapeHtml(context.pendingGateCount > 0 ? '결정함 우선' : '증적-로그 교차 확인')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(check.evidence)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
        </div>
        ${renderReviewInspectorSteps(check, selectedPacket)}
        <article class="review-evidence-card review-lineup-card">
          <p class="control-overview-label">검토 라인업</p>
          ${renderCompanyRosterList(reviewMembers, '검토 라인에 배정된 인력이 아직 없습니다.')}
        </article>
        ${
          check.action
            ? `
              <button
                class="primary-button control-overview-action review-inspector-action"
                type="button"
                data-action="open-surface"
                data-target-surface="${escapeHtml(check.action.targetSurface)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                ${escapeHtml(check.action.label)}
              </button>
            `
            : ''
          }
      </aside>
      </div>
    </div>
  `;
}

function renderOpsRosterMatrix(members) {
  if (!Array.isArray(members) || members.length === 0) {
    return `<p class="company-roster-empty">회사 인력이 아직 없습니다.</p>`;
  }

  return `
    <div class="ops-roster-matrix">
      ${members
        .map((member) => `
          <div class="ops-roster-row">
            <div class="ops-roster-main">
              <strong class="company-roster-name">${escapeHtml(member.name)}</strong>
              <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
            </div>
            <div class="ops-roster-assignment">
              ${createToken(getNavGroupLabel(getNavGroupForSurface(member.surface)), 'neutral')}
              <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
            </div>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderOpsEditorSteps() {
  return `
    <div class="ops-editor-sequence">
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">1</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">인력 추가</strong>
          <p class="ops-editor-step-note">새 AI agent를 등록하고 회사 구조에 올립니다.</p>
        </div>
      </article>
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">2</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">역할 지정</strong>
          <p class="ops-editor-step-note">reviewer, builder, ops 역할을 먼저 정합니다.</p>
        </div>
      </article>
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">3</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">데스크 배정</strong>
          <p class="ops-editor-step-note">어느 desk에서 일할지 저장합니다.</p>
        </div>
      </article>
    </div>
  `;
}

function getOpsEditorGroupLabel(activeGroupId = 'all') {
  if (activeGroupId === 'all') {
    return '전체 회사';
  }

  return getNavGroupLabel(activeGroupId);
}

function getOpsEditorMembers(activeGroupId = 'all') {
  return activeGroupId === 'all'
    ? getCompanyMembersForGroup()
    : getCompanyMembersForGroup(activeGroupId);
}

function renderOpsEditorScopeTabs(activeGroupId = 'all') {
  const options = [
    { id: 'all', label: '전체' },
    ...Object.keys(NAV_GROUPS).map((groupId) => ({
      id: groupId,
      label: getNavGroupLabel(groupId),
    })),
  ];

  return `
    <div class="ops-editor-filter-tabs">
      ${options
        .map(
          (option) => `
            <button
              class="ops-editor-filter-tab ${option.id === activeGroupId ? 'is-active' : ''}"
              type="button"
              data-action="set-ops-editor-group"
              data-target-group="${escapeHtml(option.id)}"
            >
              ${escapeHtml(option.label)}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderOpsCreatePreview() {
  return `
    <div class="ops-create-preview">
      <div class="ops-create-preview-cell">
        <span class="control-overview-register-label">역할</span>
        <strong class="control-overview-register-value">${escapeHtml(getCompanyRoleLabel(state.companyMemberDraftRole))}</strong>
      </div>
      <div class="ops-create-preview-cell">
        <span class="control-overview-register-label">desk</span>
        <strong class="control-overview-register-value">${escapeHtml(getCompanyDeskLabel(state.companyMemberDraftSurface))}</strong>
      </div>
    </div>
  `;
}

function renderOpsOverview(data, context, activeGroupId) {
  const counts = getCompanyDirectorySummary();
  const activeProject = data.activeProject;
  const harnessBrief = getHarnessConsumerBrief(data);
  const editorGroupId = state.opsEditorGroup || 'all';
  const editorGroupLabel = getOpsEditorGroupLabel(editorGroupId);
  const editorMembers = getOpsEditorMembers(editorGroupId);
  const editorRoleCount = new Set(editorMembers.map((member) => member.role)).size;
  const editorDeskCount = new Set(editorMembers.map((member) => member.surface)).size;
  const groupedMembers = Object.keys(NAV_GROUPS).map((groupId) => ({
    groupId,
    label: getNavGroupLabel(groupId),
    members: getCompanyMembersForGroup(groupId),
  }));

  return `
    <div class="control-overview-stack control-overview-stack-ops">
      ${renderControlOverviewSignalStrip([
        { label: '현재 프로젝트', value: activeProject?.name || '선택 없음' },
        { label: '편집 범위', value: editorGroupLabel },
        { label: '다음', value: 'agent 배정' },
        { label: '하네스', value: getHarnessBriefSignalValue(harnessBrief) },
      ])}
      ${renderWorkspacePlaybook(activeGroupId)}
      <div class="control-overview-grid control-overview-grid-ops ops-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <section class="control-overview-panel ops-overview-org">
        ${renderOverviewPanelHead({
          label: 'Company org',
          title: '회사 구조',
        })}
        <div class="ops-org-metrics">
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">전체 인력</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(state.companyMembers.length))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">업무 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.workflows))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">검토 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.review))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">운영 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.ops))}</strong>
          </div>
        </div>
        <div class="control-overview-register ops-org-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">범위</span>
            <strong class="control-overview-register-value">${escapeHtml(editorGroupLabel)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">프로젝트</span>
            <strong class="control-overview-register-value">${escapeHtml(activeProject?.name || '선택 없음')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">승인선</span>
            <strong class="control-overview-register-value">${escapeHtml(`${context.pendingGateCount}건`)}</strong>
          </div>
        </div>
        ${renderHarnessBriefRegister(harnessBrief)}
        <div class="ops-roster-sheet">
          <p class="control-overview-label">팀별 배정</p>
          <div class="ops-team-section-list ops-team-board">
            ${groupedMembers
              .map(
                ({ groupId, label, members }) => `
                  <section
                    class="ops-team-section ${groupId === editorGroupId ? 'is-active-group' : ''}"
                    data-selection-state="${groupId === editorGroupId ? 'active' : 'idle'}"
                  >
                    <div class="ops-team-section-head">
                      <strong class="ops-team-section-title">${escapeHtml(label)}</strong>
                      ${createToken(`${members.length}명`, groupId === editorGroupId ? 'accent' : 'neutral')}
                    </div>
                    ${renderOpsRosterMatrix(members)}
                  </section>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="control-overview-panel ops-overview-admin">
        ${renderOverviewPanelHead({
          label: 'AI staffing desk',
          title: '인력 편집',
        })}
        <div class="ops-admin-toolbar">
          ${renderOpsEditorSteps()}
          <section class="ops-editor-scope">
            <div class="ops-section-head">
              <div>
                <p class="control-overview-label">Editor scope</p>
                <h4 class="ops-section-title">현재 배정 현황</h4>
              </div>
              ${createToken(`${editorMembers.length}명`, editorGroupId === 'all' ? 'neutral' : 'accent')}
            </div>
            ${renderOpsEditorScopeTabs(editorGroupId)}
            <div class="control-overview-register ops-staffing-snapshot">
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">범위</span>
                <strong class="control-overview-register-value">${escapeHtml(editorGroupLabel)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">인력</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorMembers.length}명`)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">역할</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorRoleCount}종`)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">desk</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorDeskCount}개`)}</strong>
              </div>
            </div>
          </section>
        </div>
        <div class="ops-admin-grid">
          <form class="company-member-create-form ops-create-card" data-form="create-company-member">
            <div class="ops-section-head">
              <div>
                <p class="control-overview-label">Create agent</p>
                <h4 class="ops-section-title">AI 에이전트 추가</h4>
              </div>
              ${createToken(`전체 ${state.companyMembers.length}명`, 'neutral')}
            </div>
            ${renderOpsCreatePreview()}
            <div class="ops-form-stack">
              <section class="ops-form-section ops-form-order-section">
                <div class="ops-form-section-head">
                  <p class="control-overview-label">Input order</p>
                  <strong class="ops-form-section-title">이름 → 역할 → desk</strong>
                </div>
                <div class="field-grid company-member-field-grid ops-form-order-grid">
                  <label class="field field-compact">
                    <span class="field-label">이름</span>
                    <input
                      type="text"
                      name="companyMemberName"
                      value="${escapeHtml(state.companyMemberDraftName)}"
                      placeholder="Aiden"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">역할</span>
                    <select name="companyMemberRole" ${state.loading || state.mutating ? 'disabled' : ''}>
                      ${COMPANY_ROLE_OPTIONS.map((option) => `
                        <option value="${escapeHtml(option.value)}" ${state.companyMemberDraftRole === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                      `).join('')}
                    </select>
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">담당 데스크</span>
                    <select name="companyMemberSurface" ${state.loading || state.mutating ? 'disabled' : ''}>
                      ${COMPANY_DESK_OPTIONS.map((option) => `
                        <option value="${escapeHtml(option.surface)}" ${state.companyMemberDraftSurface === option.surface ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                      `).join('')}
                    </select>
                  </label>
                </div>
              </section>
            </div>
            <div class="ops-form-footer">
              <div class="ops-form-footer-copy">
                <span class="control-overview-label">반영</span>
                <strong class="ops-form-footer-title">roster와 회사 구조에 추가합니다.</strong>
              </div>
              <div class="ops-form-footer-actions">
                <button class="primary-button" type="submit" ${state.loading || state.mutating ? 'disabled' : ''}>agent 추가</button>
              </div>
            </div>
          </form>
          <section class="ops-staffing-shell">
            <article class="ops-current-lineup" data-panel-state="readonly">
              <div class="ops-section-head">
                <div>
                  <p class="control-overview-label ops-panel-kicker">Read-only roster</p>
                  <h4 class="ops-section-title">현재 배정 현황</h4>
                </div>
                ${createToken(editorGroupLabel, editorGroupId === 'all' ? 'neutral' : 'accent')}
              </div>
              ${
                editorMembers.length
                  ? renderOpsRosterMatrix(editorMembers)
                  : `<p class="company-roster-empty">${escapeHtml(`${editorGroupLabel} 범위 인력이 아직 없습니다.`)}</p>`
              }
            </article>
            <article class="ops-assignment-editor" data-panel-state="editing">
              <div class="ops-section-head">
                <div>
                  <p class="control-overview-label ops-panel-kicker">Editing rows</p>
                  <h4 class="ops-section-title">역할/데스크 편집</h4>
                </div>
                ${createToken(`편집 ${editorMembers.length}명`, 'accent')}
              </div>
              <div class="company-member-admin-list ops-staffing-table">
                ${editorMembers
                .map((member) => `
                  <form class="company-member-admin-card ops-staffing-row" data-form="update-company-member" data-id="${escapeHtml(member.id)}" data-editor-state="editing">
                    <div class="company-member-admin-head ops-staffing-row-head">
                      <div class="ops-staffing-identity">
                        <strong>${escapeHtml(member.name)}</strong>
                        <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
                      </div>
                      <div class="ops-staffing-tags">
                        <span class="ops-editing-badge">편집 대상</span>
                        ${createToken(getNavGroupLabel(getNavGroupForSurface(member.surface)), getNavGroupForSurface(member.surface) === editorGroupId ? 'accent' : 'neutral')}
                        <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                      </div>
                    </div>
                    <div class="ops-assignment-row-grid">
                      <section class="ops-form-section ops-assignment-fields ops-form-section-muted">
                        <div class="ops-form-section-head">
                          <p class="control-overview-label">Current</p>
                          <strong class="ops-form-section-title">현재 배정</strong>
                        </div>
                        <div class="ops-staffing-current ops-staffing-current-grid">
                          <div class="ops-staffing-current-cell">
                            <span class="control-overview-register-label">역할</span>
                            <strong class="control-overview-register-value">${escapeHtml(getCompanyRoleLabel(member.role))}</strong>
                          </div>
                          <div class="ops-staffing-current-cell">
                            <span class="control-overview-register-label">desk</span>
                            <strong class="control-overview-register-value">${escapeHtml(getCompanyDeskLabel(member.surface))}</strong>
                          </div>
                        </div>
                      </section>
                      <section class="ops-form-section ops-assignment-fields ops-form-order-section">
                        <div class="ops-form-section-head">
                          <p class="control-overview-label">Edit order</p>
                          <strong class="ops-form-section-title">이름 → 역할 → desk</strong>
                        </div>
                        <div class="company-member-admin-grid ops-form-order-grid">
                          <label class="field field-compact">
                            <span class="field-label">이름</span>
                            <input type="text" name="companyMemberEditName" value="${escapeHtml(member.name)}" ${state.loading || state.mutating ? 'disabled' : ''}>
                          </label>
                          <label class="field field-compact">
                            <span class="field-label">역할</span>
                            <select name="companyMemberEditRole" ${state.loading || state.mutating ? 'disabled' : ''}>
                              ${COMPANY_ROLE_OPTIONS.map((option) => `
                                <option value="${escapeHtml(option.value)}" ${member.role === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                              `).join('')}
                            </select>
                          </label>
                          <label class="field field-compact">
                            <span class="field-label">담당 데스크</span>
                            <select name="companyMemberEditSurface" ${state.loading || state.mutating ? 'disabled' : ''}>
                              ${COMPANY_DESK_OPTIONS.map((option) => `
                                <option value="${escapeHtml(option.surface)}" ${member.surface === option.surface ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                              `).join('')}
                            </select>
                          </label>
                        </div>
                      </section>
                    </div>
                    <div class="ops-form-footer ops-form-footer-row">
                      <div class="ops-form-footer-copy">
                        <span class="control-overview-label">반영</span>
                        <strong class="ops-form-footer-title">roster와 회사 구조에 반영합니다.</strong>
                      </div>
                      <div class="ops-form-footer-actions ops-form-footer-actions-inline">
                        <button class="danger-button" type="button" data-action="remove-company-member" data-id="${escapeHtml(member.id)}" ${state.loading || state.mutating ? 'disabled' : ''}>제거</button>
                        <button class="primary-button" type="submit" ${state.loading || state.mutating ? 'disabled' : ''}>배정 저장</button>
                      </div>
                    </div>
                  </form>
                `)
                .join('')}
              </div>
            </article>
          </section>
        </div>
      </section>
      </div>
    </div>
  `;
}

function getCurrentOverviewContext(data) {
  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncil =
    (selectedMission?.councilSessionId
      ? data.councilSessionMap.get(selectedMission.councilSessionId) || null
      : null) ||
    data.councilSessions[0] ||
    null;
  const selectedTask =
    data.taskMap.get(state.selectedTaskId) ||
    (selectedMission?.linkedTaskId ? data.taskMap.get(selectedMission.linkedTaskId) || null : null) ||
    data.tasks[0] ||
    null;
  const selectedRun =
    data.runMap.get(state.selectedRunId) ||
    (selectedTask?.latestRunId ? data.runMap.get(selectedTask.latestRunId) || null : null) ||
    data.runs[0] ||
    null;
  const selectedArtifact =
    data.artifactMap.get(state.selectedArtifactId) ||
    (selectedTask ? data.artifacts.find((artifact) => artifact.taskId === selectedTask.id) || null : null) ||
    data.artifacts[0] ||
    null;
  const selectedInboxItem =
    data.inboxItemMap.get(state.selectedInboxItemId) ||
    (selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null) ||
    data.inboxItems.find((item) => item.status === 'pending') ||
    null;
  const activeTask =
    selectedTask ||
    (selectedRun ? data.taskMap.get(selectedRun.taskId) || null : null) ||
    (selectedArtifact ? data.taskMap.get(selectedArtifact.taskId) || null : null) ||
    (selectedInboxItem ? data.taskMap.get(selectedInboxItem.taskId) || null : null) ||
    null;
  const pendingGateCount = data.inboxItems.filter((item) => item.status === 'pending').length;

  return {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedCouncil,
    selectedInboxItem,
    selectedMission,
    selectedRun,
    selectedTask,
  };
}

function getControlOverviewFocus(context) {
  const surface = state.surface;
  const {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedCouncil,
    selectedInboxItem,
    selectedMission,
    selectedRun,
  } = context;

  if (surface === 'mission') {
    return {
      title: selectedMission?.title || '열린 안건 없음',
      copy: selectedMission
        ? '안건과 다음 회의만 봅니다.'
        : '새 안건을 기다립니다.',
      owner: '운영자 · 안건 흐름',
      status: selectedMission ? getMissionStatusDisplay(selectedMission.status) : '안건 대기',
      next: selectedMission?.councilSessionId ? '협의회 정렬 계속' : '회의 초안 작성',
      evidence: selectedMission?.id || '미지정',
    };
  }

  if (surface === 'council') {
    return {
      title: selectedCouncil?.selectedPlan?.title || selectedMission?.title || '열린 회의 안건 없음',
      copy: selectedCouncil
        ? '권고안만 정리합니다.'
        : '회의 안건을 기다립니다.',
      owner: '회의 리드 + 참여 역할',
      status: selectedCouncil ? getCouncilStatusDisplay(selectedCouncil.status) : '회의 대기',
      next: selectedCouncil?.selectedPlan ? '실행 셀 인계' : '권고안 정리',
      evidence: selectedCouncil ? `${selectedCouncil.participants?.length || 0}명 참석` : '참석 대기',
    };
  }

  if (surface === 'execution' || surface === 'taskboard') {
    return {
      title: activeTask?.title || '열린 실행 셀 없음',
      copy: activeTask
        ? '막힘과 다음 실행만 봅니다.'
        : '실행 셀을 기다립니다.',
      owner: surface === 'taskboard' ? '실행 셀 · 관제' : '실행 역할 · 실행 흐름',
      status: getExecutionDeskStatus(activeTask),
      next: getExecutionDeskNext(activeTask),
      evidence: selectedRun?.id || activeTask?.id || '실행 대기',
    };
  }

  if (surface === 'deliverables' || surface === 'artifacts') {
    return {
      title: selectedArtifact?.id || activeTask?.title || '열린 결과 패킷 없음',
      copy: selectedArtifact
        ? '패킷과 승인선만 봅니다.'
        : '결과 패킷을 기다립니다.',
      owner: surface === 'artifacts' ? '증적 패킷 · 관제' : '결과 보고 · 보고 흐름',
      status: getDeliverablesDeskStatus(activeTask, selectedArtifact),
      next: getDeliverablesDeskNext(activeTask, selectedArtifact, pendingGateCount),
      evidence: selectedArtifact?.type ? getArtifactTypeDisplay(selectedArtifact.type) : '패킷 대기',
    };
  }

  if (surface === 'logs') {
    return {
      title: selectedRun?.id || '열린 실행 기록 없음',
      copy: selectedRun
        ? 'run 기록만 확인합니다.'
        : '실행 기록을 기다립니다.',
      owner: '실행 로그 · 관제',
      status: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedRun?.summary?.nextStage ? getExecutionStageDisplay(selectedRun.summary.nextStage) : '로그 추적 유지',
      evidence: activeTask?.id || '미지정',
    };
  }

  if (surface === 'decision-inbox') {
    return {
      title: selectedInboxItem?.title || '열린 승인 안건 없음',
      copy: selectedInboxItem
        ? '열린 승인 안건만 봅니다.'
        : '승인 안건을 기다립니다.',
      owner: '사람 게이트',
      status: selectedInboxItem ? getInboxStatusDisplay(selectedInboxItem.status) : '게이트 안정',
      next: selectedInboxItem?.status === 'pending' ? '결정 처리' : '게이트 유지',
      evidence: selectedInboxItem?.id || `${pendingGateCount}건`,
    };
  }

  return {
    title: getSurfaceDisplayName(surface),
    copy: '현재 표면만 확인합니다.',
    owner: SURFACE_DOCK_METADATA[surface]?.kicker || '표면',
    status: '대기',
    next: '표면 확인',
    evidence: '미지정',
  };
}

function getControlOverviewCheck(surface, context, data) {
  const {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedMission,
    selectedRun,
  } = context;

  if (state.error) {
    return {
      title: '런타임 연결 복구 필요',
      copy: state.error.message || '런타임 연결이 복구돼야 현재 데스크와 evidence rail이 다시 열립니다.',
      current: '런타임 오류',
      next: '새로고침 후 상태 재확인',
      evidence: 'runtime blocked',
      action: null,
    };
  }

  if (pendingGateCount > 0) {
    return {
      title: `사람 게이트 ${pendingGateCount}건`,
      copy: '사람 판단을 먼저 처리합니다.',
      current: `${pendingGateCount}건 대기`,
      next: '결정함 처리',
      evidence: activeTask?.id || 'pending gate',
      action:
        surface !== 'decision-inbox'
          ? {
              label: '결정함',
              targetSurface: 'decision-inbox',
            }
          : null,
    };
  }

  if (activeTask?.flags?.blocked) {
    return {
      title: '차단 사유 확인',
      copy: '차단 원인을 먼저 정리합니다.',
      current: '차단 상태',
      next: '실행 셀 재확인',
      evidence: activeTask.id,
      action: surface !== 'execution' ? { label: '실행', targetSurface: 'execution' } : null,
    };
  }

  if (surface === 'mission') {
    return {
      title: '협의회 이동',
      copy: '안건 정리 후 회의로 넘깁니다.',
      current: selectedMission ? getMissionStatusDisplay(selectedMission.status) : '안건 대기',
      next: '협의회 정렬',
      evidence: selectedMission?.id || 'mission pending',
      action: { label: '협의회', targetSurface: 'council' },
    };
  }

  if (surface === 'council') {
    return {
      title: '실행 인계',
      copy: '권고안 정리 후 실행으로 넘깁니다.',
      current: '권고안 검토',
      next: '실행 셀 인계',
      evidence: activeTask?.id || selectedMission?.id || 'handoff pending',
      action: { label: '실행', targetSurface: 'execution' },
    };
  }

  if (surface === 'execution') {
    return {
      title: '결과 패킷',
      copy: '실행 후 결과 패킷으로 넘깁니다.',
      current: getExecutionDeskStatus(activeTask),
      next: '산출물 확인',
      evidence: selectedArtifact?.id || activeTask?.id || 'delivery pending',
      action: { label: '산출물', targetSurface: 'deliverables' },
    };
  }

  if (surface === 'deliverables') {
    return {
      title: '증적 보기',
      copy: '판단이 애매하면 증적부터 봅니다.',
      current: getDeliverablesDeskStatus(activeTask, selectedArtifact),
      next: '증적 패킷 확인',
      evidence: selectedArtifact?.id || activeTask?.id || 'artifact pending',
      action: { label: '아티팩트', targetSurface: 'artifacts' },
    };
  }

  if (surface === 'logs') {
    return {
      title: '실행 기록',
      copy: 'run과 다음 stage만 확인합니다.',
      current: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedArtifact ? '증적 패킷 확인' : '로그 유지',
      evidence: selectedRun?.id || 'run pending',
      action: selectedArtifact ? { label: '아티팩트', targetSurface: 'artifacts' } : null,
    };
  }

  if (surface === 'artifacts') {
    return {
      title: '패킷 검토',
      copy: '패킷과 승인선만 이어서 봅니다.',
      current: selectedArtifact ? getArtifactTypeDisplay(selectedArtifact.type) : '패킷 대기',
      next: pendingGateCount > 0 ? '승인선 확인' : '패킷 정리 유지',
      evidence: selectedArtifact?.id || 'artifact pending',
      action: pendingGateCount > 0 ? { label: '결정함', targetSurface: 'decision-inbox' } : null,
    };
  }

  return {
    title: '현재 데스크',
    copy: '담당·상태·다음만 먼저 봅니다.',
    current: getSurfaceDisplayName(surface),
    next: '상세 확인',
    evidence: data.activeProject?.name || 'project pending',
    action: null,
  };
}

function renderControlOverview(data) {
  if (!elements.controlOverview) {
    return;
  }

  const activeGroupId = getActiveNavGroupId();
  const activeProject = data.activeProject;
  const activeRuns = data.runs.filter((run) => run.status === 'running').length;
  const context = getCurrentOverviewContext(data);

  elements.officeSidebarStatus.project.textContent = activeProject?.name || '미지정';
  elements.officeSidebarStatus.surface.textContent = getSurfaceDisplayName(state.surface);
  elements.officeSidebarStatus.runs.textContent = `${activeRuns}건`;
  elements.officeSidebarStatus.gates.textContent = `${context.pendingGateCount}건`;
  elements.refreshButton.disabled = state.loading || state.mutating;
  renderWorkspaceHeader(data, context);
  renderCompanyDirectory(data);

  if (activeGroupId === 'review') {
    elements.controlOverview.innerHTML = renderReviewOverview(data, context, activeGroupId);
    return;
  }

  if (activeGroupId === 'ops') {
    elements.controlOverview.innerHTML = renderOpsOverview(data, context, activeGroupId);
    return;
  }

  elements.controlOverview.innerHTML = renderWorkflowsOverview(data, context, activeGroupId);
}

function renderNav(data) {
  const activeGroupId = getActiveNavGroupId();

  for (const tab of elements.navGroupTabs) {
    const groupId = tab.dataset.navGroupTab;
    const isActive = groupId === activeGroupId;

    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  }

  for (const group of elements.navGroups) {
    const groupId = group.dataset.navGroup;
    const isActive = groupId === activeGroupId;

    group.classList.toggle('is-active', isActive);

    if (isActive) {
      group.removeAttribute('hidden');
    } else {
      group.setAttribute('hidden', '');
    }
  }

  for (const button of elements.navButtons) {
    const surface = button.dataset.surface;
    const isActive = surface === state.surface;
    button.classList.toggle('is-active', isActive);
    const count = getSurfaceDockCount(data, surface);

    const label = getSurfaceDisplayName(button.dataset.surface);
    button.innerHTML = `
      <span class="nav-button-main">
        <span class="nav-button-count">${escapeHtml(String(count))}</span>
        <span class="nav-button-title">${escapeHtml(label)}</span>
      </span>
    `;
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
    button.setAttribute('aria-label', `${label} ${count}건`);
  }
}

function renderProjectBootstrapPanel(data, options = {}) {
  const mode = options.mode === 'mission' ? 'mission' : 'advanced';
  const missionMode = mode === 'mission';
  const bootstrapState = missionMode
    ? data.projects.length === 0
      ? {
          copy: '여기서 첫 로컬 프로젝트를 등록한 뒤 바로 미션 생성으로 넘어갑니다.',
          title: '미션 시작',
        }
      : {
          copy: '여기서 등록된 프로젝트를 고르거나 새로 등록한 뒤 미션 경로를 이어갑니다.',
          title: '미션 프로젝트 진입',
        }
    : getProjectBootstrapState(data);
  const projectActionDisabled = state.loading || state.mutating;
  const linkedWorktreeActionDisabled = projectActionDisabled || !data.activeProject;
  const linkedWorktreePanel = missionMode
    ? ''
    : renderLinkedWorktreeSwitchPanel(data, projectActionDisabled);
  const createProjectPack =
    state.projectDraftPack === 'knowledge-work' ? 'knowledge-work' : 'development';
  const createProjectProviderMode =
    state.projectDraftProviderMode === 'live' ? 'live' : 'local-stub';
  const activeProjectProviderConfig = getProjectProviderConfig(data.activeProject);
  const activeProjectProviderSummary = getProviderExecutionSummary(data.activeProject, data);
  const activeProjectBaseName = data.activeProject
    ? data.activeProject.projectPath.split('/').filter(Boolean).pop() || 'project'
    : 'project';
  const projectList = data.projects.length
    ? `
        <div class="project-list">
          ${data.projects
            .map(
              (project) => {
                const providerConfig = getProjectProviderConfig(project);
                const providerSummary = getProviderExecutionSummary(project, data);

                return `
                  <button
                    class="list-button ${project.id === data.activeProject?.id ? 'is-selected' : ''}"
                    type="button"
                    data-action="select-project"
                    data-id="${escapeHtml(project.id)}"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <div class="card-title-row">
                      <strong>${escapeHtml(project.name)}</strong>
                      ${
                        project.id === data.activeProject?.id
                          ? createToken('활성', 'success')
                          : createToken('등록됨', 'neutral')
                      }
                    </div>
                    <p class="list-copy">${escapeHtml(project.projectPath)}</p>
                    <div class="token-row">
                      ${createToken(getPackDisplayName(project.pack || 'development'), 'neutral')}
                      ${createToken(
                        `준비도:${getProviderReadinessDisplay(project.readiness || 'unknown')}`,
                        'neutral',
                      )}
                      ${
                        missionMode
                          ? ''
                          : createToken(`프로바이더:${providerConfig.adapter}`, providerConfig.mode === 'live' ? 'accent' : 'neutral')
                      }
                      ${
                        missionMode
                          ? ''
                          : providerSummary
                            ? createToken(
                                `프로바이더준비:${getProviderReadinessDisplay(
                                  providerSummary.readiness || 'unknown',
                                )}`,
                                providerSummary.allowed
                                  ? 'success'
                                  : providerSummary.readiness === 'error'
                                    ? 'danger'
                                    : 'warning',
                              )
                            : ''
                      }
                    </div>
                  </button>
                `;
              },
            )
            .join('')}
        </div>
      `
    : `
        <div class="empty-state">
          <strong>등록된 프로젝트 없음</strong>
          <p>로컬 프로젝트 경로를 먼저 등록하세요.</p>
        </div>
      `;

  return `
    <section class="project-bootstrap">
      <div class="panel-header">
        <div>
          <h3>${escapeHtml(bootstrapState.title)}</h3>
          <p class="panel-copy">${escapeHtml(bootstrapState.copy)}</p>
        </div>
          ${
            data.activeProject
              ? `<div class="token-row">
                ${createToken(`활성:${data.activeProject.name}`, 'success')}
              </div>`
            : ''
        }
      </div>
      ${projectList}
      ${linkedWorktreePanel}
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="update-project-provider">
              <div class="panel-header">
                <div>
                  <h4>실행 프로바이더</h4>
                  <p class="panel-copy">프로젝트 단위 명시 선택만 허용합니다. 기본값은 로컬 스텁(local-stub)을 유지하고, 라이브 모드는 절대 조용히 다른 모드로 바뀌지 않습니다.</p>
                </div>
                <div class="token-row">
                  ${createToken(`프로바이더:${activeProjectProviderConfig.adapter}`, activeProjectProviderConfig.mode === 'live' ? 'accent' : 'neutral')}
                  ${
                    activeProjectProviderSummary
                      ? createToken(
                          `프로바이더준비:${getProviderReadinessDisplay(
                            activeProjectProviderSummary.readiness || 'unknown',
                          )}`,
                          activeProjectProviderSummary.allowed
                            ? 'success'
                            : activeProjectProviderSummary.readiness === 'error'
                              ? 'danger'
                              : 'warning',
                        )
                      : ''
                  }
                </div>
              </div>
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">모드</span>
                  <select
                    name="editProjectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${state.projectProviderDraftMode === 'local-stub' ? 'selected' : ''}>로컬 스텁 (local-stub)</option>
                    <option value="live" ${state.projectProviderDraftMode === 'live' ? 'selected' : ''}>OpenAI Responses (openai-responses)</option>
                  </select>
                </label>
                ${
                  state.projectProviderDraftMode === 'live'
                    ? `
                      <label class="field">
                        <span class="field-label">모델</span>
                        <input
                          type="text"
                          name="editProjectProviderModel"
                          value="${escapeHtml(state.projectProviderDraftModel)}"
                          placeholder="운영자 선택 모델"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                      <label class="field">
                        <span class="field-label">API 키 환경변수</span>
                        <input
                          type="text"
                          name="editProjectProviderApiKeyVar"
                          value="${escapeHtml(state.projectProviderDraftApiKeyVar)}"
                          placeholder="OPENAI_API_KEY"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                    `
                    : ''
                }
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
                  프로바이더 업데이트
                </button>
                <p class="form-help">
                  ${
                    activeProjectProviderSummary?.reasons?.length
                      ? escapeHtml(activeProjectProviderSummary.reasons[0])
                      : '여기에는 비밀이 아닌 설정 정보만 저장합니다. 라이브 모드는 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토를 활성화하고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남깁니다.'
                  }
                </p>
              </div>
            </form>
          `
          : ''
      }
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="create-linked-worktree">
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">워크트리 슬러그</span>
                  <input
                    type="text"
                    name="linkedWorktreeSlug"
                    value="${escapeHtml(state.linkedWorktreeDraftSlug)}"
                    placeholder="feature-x"
                    ${linkedWorktreeActionDisabled ? 'disabled' : ''}
                  >
                </label>
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${linkedWorktreeActionDisabled ? 'disabled' : ''}>
                  연결 워크트리 만들기
                </button>
                <p class="form-help">형제 경로 <code>${escapeHtml(`${activeProjectBaseName}--<slug>`)}</code>에 <code>worktree/&lt;slug&gt;</code> 브랜치를 만들고, 기존 프로젝트 등록/선택 흐름을 재사용해 새 연결 루트를 활성 상태로 전환합니다. 기존 브랜치나 경로 충돌이 있으면 실패하므로 그 경우에는 탐지된 전환 목록을 사용합니다.</p>
              </div>
            </form>
          `
          : ''
      }
      <form class="task-create-form project-create-form" data-form="${missionMode ? 'create-project-from-mission' : 'create-project'}">
        <div class="field-grid">
          <label class="field">
            <span class="field-label">프로젝트 이름</span>
            <input
              type="text"
              name="projectName"
              value="${escapeHtml(state.projectDraftName)}"
              placeholder="orchestration"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          <label class="field">
            <span class="field-label">프로젝트 경로 (project_path)</span>
            <input
              type="text"
              name="projectPath"
              value="${escapeHtml(state.projectDraftPath)}"
              placeholder="/absolute/path/to/project"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          <label class="field">
            <span class="field-label">팩</span>
            <select
              name="projectPack"
              ${projectActionDisabled ? 'disabled' : ''}
            >
              <option value="development" ${createProjectPack === 'development' ? 'selected' : ''}>개발 (development)</option>
              <option value="knowledge-work" ${createProjectPack === 'knowledge-work' ? 'selected' : ''}>지식 작업 (knowledge-work)</option>
            </select>
          </label>
          ${
            !missionMode
              ? `
                <label class="field">
                  <span class="field-label">프로바이더 모드</span>
                  <select
                    name="projectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${createProjectProviderMode === 'local-stub' ? 'selected' : ''}>로컬 스텁 (local-stub)</option>
                    <option value="live" ${createProjectProviderMode === 'live' ? 'selected' : ''}>OpenAI Responses (openai-responses)</option>
                  </select>
                </label>
              `
              : ''
          }
          ${
            !missionMode && createProjectProviderMode === 'live'
              ? `
                <label class="field">
                  <span class="field-label">프로바이더 모델</span>
                  <input
                    type="text"
                    name="projectProviderModel"
                    value="${escapeHtml(state.projectDraftProviderModel)}"
                    placeholder="운영자 선택 모델"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
                <label class="field">
                  <span class="field-label">API 키 환경변수</span>
                  <input
                    type="text"
                    name="projectProviderApiKeyVar"
                    value="${escapeHtml(state.projectDraftProviderApiKeyVar)}"
                    placeholder="OPENAI_API_KEY"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
              `
              : ''
          }
        </div>
        <div class="form-actions">
          <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
            ${missionMode ? '이 프로젝트로 시작' : '프로젝트 등록'}
          </button>
          <p class="form-help">
            ${
              missionMode
                ? `${PACK_HELP_COPY[createProjectPack]} 미션 진입은 항상 로컬 스텁(local-stub) 기본값으로 시작합니다. 프로바이더와 연결 워크트리 제어는 고급 운영 모드에 남습니다.`
                : createProjectProviderMode === 'live'
                ? `${PACK_HELP_COPY[createProjectPack]} 라이브 모드는 비밀이 아닌 설정 정보만 저장합니다. 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토가 라이브 모드로 실행되고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남습니다.`
                : `${PACK_HELP_COPY[createProjectPack]} 프로젝트를 등록하고 로컬 스텁(local-stub)을 기본 실행 프로바이더로 유지한 채 해당 프로젝트를 활성 상태로 만듭니다.`
            }
          </p>
        </div>
      </form>
    </section>
  `;
}

function renderMission(data) {
  if (!data.activeProject) {
    elements.surfaces.mission.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>미션</h2>
              <p class="panel-copy">프로젝트를 먼저 고른 뒤 미션을 만듭니다.</p>
            </div>
            <div class="token-row">
              ${createToken(`등록 프로젝트:${data.projects.length}`, data.projects.length > 0 ? 'neutral' : 'warning')}
            </div>
          </div>
          ${renderProjectBootstrapPanel(data, { mode: 'mission' })}
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>미션 진입</h2>
              <p class="panel-copy">프로젝트 선택은 여기서 시작하고, 프로바이더와 워크트리 같은 세부 제어는 고급 운영 모드에 남깁니다.</p>
            </div>
          </div>
          <div class="stack">
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>권장 첫 단계</strong>
                ${createToken('오케스트레이션 우선', 'success')}
              </div>
              <p class="detail-copy">위에서 프로젝트를 고른 뒤 첫 미션을 만드세요.</p>
            </section>
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>고급 운영에 남는 것</strong>
                ${createToken('프로바이더/워크트리/세부 제어', 'warning')}
              </div>
              <p class="detail-copy">프로바이더, 워크트리, 로그, 아티팩트, 결정함은 고급 운영 모드에 남습니다.</p>
            </section>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedMissionCompletion = getMissionCompletionSummary(selectedMission, data);
  const selectedMissionCouncilPreview = getMissionCouncilPreview(selectedMission, data);
  const selectedMissionExecutionPreview = getMissionExecutionPreview(selectedMission, data);
  const selectedMissionDeliverablesPreview = getMissionDeliverablesPreview(selectedMission, data);
  const selectedMissionNextActionPreview = getMissionNextActionPreview(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
  });
  const selectedMissionBriefControl = getMissionBriefControlSnapshot(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
    nextActionPreview: selectedMissionNextActionPreview,
  });
  const linkedTask = selectedMissionCompletion.linkedTask;
  const closeOutState = selectedMissionCompletion.closeOutState;
  const missionCompletionReady = selectedMissionCompletion.completionReady;
  const missionCompletionArtifactId = selectedMissionCompletion.closeOutArtifactId;
  const missionCompletionReleasePackageId = selectedMissionCompletion.releasePackageArtifactId;
  const selectedCouncilSession = selectedMissionCouncilPreview.councilSession;
  const missionEvidenceRail = renderExecutionEvidenceRail(getExecutionEvidenceRail(linkedTask, data), {
    eyebrow: '역할 인계 미리보기',
    heading: '회의에서 실행으로 넘어갈 증적만 먼저 봅니다',
    copy: 'Mission은 연결된 실행 셀의 아티팩트, run, 준비 상태, 리뷰 기준 사실만 작은 증적선으로 먼저 봅니다.',
    compact: true,
  });
  const missionNextSurface = selectedMissionNextActionPreview.surface || 'mission';
  const missionSignalBySurface = Object.fromEntries(
    getCompanySignalEntries({
      mission: selectedMission,
      councilSession: selectedCouncilSession,
      linkedTask,
      completionReady: missionCompletionReady,
    }).map((entry) => [entry.surface, entry]),
  );
  const missionViewportStrip = renderViewportHandoffStrip({
    eyebrow: '등록대장 인계선',
    heading: '등록, 배정, 다음 처리를 같은 보드에서 나눕니다',
    copy:
      '왼쪽은 신규 안건 등록과 현재 안건 대장을 다루고, 오른쪽은 현재 판단과 가장 먼저 열어야 할 처리선을 보여 줍니다.',
    tokens: [
      createToken(
        `안건수:${data.missions.length}`,
        data.missions.length > 0 ? 'neutral' : 'warning',
      ),
      createToken(`다음:${getSurfaceDisplayName(missionNextSurface)}`, selectedMissionNextActionPreview.tone),
      selectedMission ? createToken(`등록안건:${selectedMission.id}`, 'accent') : createToken('등록안건:없음', 'warning'),
    ],
    cards: [
      {
        label: '접수 라인',
        title: '신규 등록 + 현재 안건',
        copy: '제목과 목표를 등록하고, 바로 아래 등록대장에서 현재 안건을 고릅니다.',
        signal: missionSignalBySurface.mission,
      },
      {
        label: '배정 판단선',
        title: '현재 판단 + 배정 상태',
        copy: '선택된 안건의 상태와 연결된 회의, 실행, 보고 흐름을 먼저 정리합니다.',
        signal: missionSignalBySurface['decision-inbox'],
      },
      {
        label: '다음 처리 트리거',
        title: selectedMission
          ? `${getSurfaceDisplayName(missionNextSurface)} · ${selectedMissionNextActionPreview.actionLabel}`
          : '먼저 안건 등록',
        copy: selectedMission
          ? selectedMissionNextActionPreview.summary
          : '왼쪽 접수 라인에서 첫 안건을 등록하면 회의와 판단선이 함께 열립니다.',
        emphasis: true,
        signal: missionSignalBySurface[missionNextSurface] || missionSignalBySurface.mission,
        button:
          selectedMission && missionNextSurface !== 'mission'
            ? {
                action: 'open-surface-for-mission',
                id: selectedMission.id,
                targetSurface: missionNextSurface,
                label: `${getSurfaceDisplayName(missionNextSurface)} 열기`,
                disabled: state.loading || state.mutating,
              }
            : null,
      },
    ],
  });
  const selectedMissionActiveSnapshotItems = missionCompletionReady
    ? []
    : [
        {
          label: '회의',
          copy: selectedCouncilSession
            ? `정렬 ${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)} · ${selectedMissionCouncilPreview.selectedPlanTitle}`
            : '참모 회의 초안이 아직 없습니다.',
          surface: 'council',
          tone: selectedCouncilSession
            ? getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus)
            : 'warning',
        },
        {
          label: '실행',
          copy: linkedTask
            ? `${getTaskLifecycleDisplay(linkedTask.lifecycleState)} · ${selectedMissionExecutionPreview.actionLabel}`
            : '연결된 실행 셀이 아직 없습니다.',
          surface: 'execution',
          tone: 'accent',
        },
        {
          label: '보고',
          copy: `${selectedMissionDeliverablesPreview.currentDeliverableArtifact?.type || '아티팩트 없음'} · 리뷰 ${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)} · 승인 ${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval?.status || 'none')}`,
          surface: 'deliverables',
          tone: 'neutral',
        },
        {
          label: '다음',
          copy: `${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}에서 ${selectedMissionNextActionPreview.actionLabel}`,
          surface: selectedMissionNextActionPreview.surface,
          tone: selectedMissionNextActionPreview.tone,
        },
      ];
  const missionUsesKnowledgeWork = data.activeProject?.pack === 'knowledge-work';
  const missionCreateDisabled = state.loading || state.mutating;
  const linkedTaskCreateDisabled =
    state.loading || state.mutating || !selectedMission || Boolean(selectedMission.linkedTaskId);
  const missionEntries = data.missions.map((mission) => ({
    councilPreview: getMissionCouncilPreview(mission, data),
    completion: getMissionCompletionSummary(mission, data),
    deliverablesPreview: getMissionDeliverablesPreview(mission, data),
    executionPreview: getMissionExecutionPreview(mission, data),
    nextActionPreview: getMissionNextActionPreview(mission, {
      completion: getMissionCompletionSummary(mission, data),
      council: getMissionCouncilPreview(mission, data),
      deliverables: getMissionDeliverablesPreview(mission, data),
      execution: getMissionExecutionPreview(mission, data),
    }),
    mission,
  }));
  const activeMissionEntries = missionEntries.filter(({ completion }) => !completion.completionReady);
  const completedMissionEntries = missionEntries.filter(({ completion }) => completion.completionReady);
  const renderMissionRows = (entries, emptyTitle, emptyCopy, emptyStateClass) => {
    if (entries.length === 0) {
      return `
        <div class="empty-state empty-state-inline mission-empty-state mission-empty-state-row ${escapeHtml(emptyStateClass)}">
          <strong class="mission-empty-title">${escapeHtml(emptyTitle)}</strong>
          <p class="mission-empty-copy">${escapeHtml(emptyCopy)}</p>
        </div>
      `;
    }

    return `
      <div class="project-list">
        ${entries
          .map(({ mission, completion, councilPreview, deliverablesPreview, executionPreview, nextActionPreview }) => {
            const missionTask = completion.linkedTask;
            const missionSurfaceLabel = getSurfaceDisplayName(nextActionPreview.surface);
            const missionSignalBySurface = Object.fromEntries(
              getCompanySignalEntries({
                mission,
                councilSession: councilPreview.councilSession,
                linkedTask: missionTask,
                completionReady: completion.completionReady,
              }).map((entry) => [entry.surface, entry]),
            );
            const missionRailEntries = getMissionSurfaceRailEntries(mission, {
              completion,
              council: councilPreview,
              deliverables: deliverablesPreview,
              execution: executionPreview,
              nextActionPreview,
            });
            const missionRowSummary = completion.completionReady
              ? `종료 정리 ${completion.closeOutArtifactId || '준비 중'} · 다음 안건을 바로 준비할 수 있습니다.`
              : `회의 ${getAlignmentStatusDisplay(councilPreview.alignmentStatus)} · 실행 ${
                  missionTask ? getTaskLifecycleDisplay(missionTask.lifecycleState) : '준비 전'
                }`;
            const missionRowNextCopy = completion.completionReady
              ? '다음: 미션에서 다음 안건 준비'
              : `다음: ${missionSurfaceLabel}에서 ${nextActionPreview.actionLabel}`;
            const missionRowTokens = completion.completionReady
              ? `
                  ${createToken('완료:봉인', 'success')}
                  ${
                    mission.linkedTaskId
                      ? createToken(`연결태스크:${mission.linkedTaskId}`, 'accent')
                      : createToken('연결태스크:없음', 'warning')
                  }
                  ${
                    completion.closeOutArtifactId
                      ? createToken(`close-out:${completion.closeOutArtifactId}`, 'neutral')
                      : ''
                  }
                  ${createToken('다음안건:준비', 'success')}
                `
              : `
                  ${
                    councilPreview.councilSession
                      ? createToken(
                          `정렬:${getAlignmentStatusDisplay(councilPreview.alignmentStatus)}`,
                          getAlignmentTone(councilPreview.alignmentStatus),
                        )
                      : createToken('정렬:없음', 'warning')
                  }
                  ${
                    missionTask
                      ? createToken(`실행:${getTaskLifecycleDisplay(missionTask.lifecycleState)}`, 'neutral')
                      : createToken('실행:준비 전', 'warning')
                  }
                  ${
                    deliverablesPreview.currentDeliverableArtifact
                      ? createToken(`보고:${deliverablesPreview.currentDeliverableArtifact.type}`, 'neutral')
                      : createToken('보고:없음', 'neutral')
                  }
                  ${createToken(`다음:${missionSurfaceLabel}`, nextActionPreview.tone)}
                  ${
                    missionTask?.flags?.waitingApproval
                      ? createToken('승인대기', 'accent')
                      : missionTask?.flags?.blocked
                        ? createToken('차단', 'danger')
                        : missionTask?.flags?.waitingDecision
                          ? createToken('결정대기', 'warning')
                          : ''
                  }
                `;

            return `
              <article class="card mission-row-card ${mission.id === selectedMission?.id ? 'is-selected' : ''}">
                <button
                  class="list-button mission-row-button"
                  type="button"
                  data-action="select-mission"
                  data-id="${escapeHtml(mission.id)}"
                  ${state.loading || state.mutating ? 'disabled' : ''}
                >
                  <div class="card-title-row mission-row-head">
                    <strong>${escapeHtml(mission.title)}</strong>
                    <div class="token-row token-row-compact">
                      ${createToken(getMissionStatusDisplay(mission.status), getMissionStatusTone(mission.status))}
                      ${
                        mission.deliverableType
                          ? createToken(
                              `산출물:${getKnowledgeWorkDeliverableDisplayName(mission.deliverableType)}`,
                              'neutral',
                            )
                          : ''
                      }
                      ${createToken(`다음:${missionSurfaceLabel}`, nextActionPreview.tone)}
                    </div>
                  </div>
                  <p class="list-copy list-copy-compact mission-row-goal">${escapeHtml(mission.goal || '기록된 미션 목표가 없습니다.')}</p>
                  <p class="list-copy list-copy-compact mission-row-summary">${escapeHtml(missionRowSummary)}</p>
                  <div class="mission-row-foot">
                    <div class="token-row token-row-compact">${missionRowTokens}</div>
                    <p class="list-copy list-copy-compact mission-row-next">${escapeHtml(missionRowNextCopy)}</p>
                  </div>
                </button>
                <div class="mission-row-rail">
                  ${missionRailEntries
                    .map((entry) => {
                      const railSignal = missionSignalBySurface[entry.surface] || {
                        label: entry.label,
                        status: entry.status,
                        tone: entry.tone,
                      };

                      return `
                        <button
                          class="mission-row-rail-button ${entry.isNext ? 'mission-row-rail-button-next' : ''}"
                          type="button"
                          data-action="open-surface-for-mission"
                          data-id="${escapeHtml(mission.id)}"
                          data-target-surface="${escapeHtml(entry.surface)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          <div class="mission-row-rail-signal mission-row-rail-signal-${escapeHtml(railSignal.tone || 'neutral')}">
                            <span class="mission-row-rail-signal-dot"></span>
                            <span class="mission-row-rail-signal-label">${escapeHtml(railSignal.label || 'signal')}</span>
                            <strong class="mission-row-rail-signal-status">${escapeHtml(railSignal.status || '')}</strong>
                          </div>
                          <strong class="mission-row-rail-label">${escapeHtml(entry.label)}</strong>
                          <span class="mission-row-rail-status">${escapeHtml(entry.status)}</span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  };
  const missionList = data.missions.length
    ? `
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>진행 안건 등록대장</strong>
              <div class="token-row">
                ${createToken(`수:${activeMissionEntries.length}`, activeMissionEntries.length > 0 ? 'neutral' : 'warning')}
              </div>
            </div>
            <p class="detail-copy detail-copy-compact">현재 배정 중인 안건만 모읍니다.</p>
          </section>
          ${renderMissionRows(
            activeMissionEntries,
            '진행 안건 없음',
            '위 등록대장에서 새 안건을 올리면 바로 이 줄에 이어집니다.',
            'mission-empty-state-active-row',
          )}
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>종료 안건 보관대장</strong>
              <div class="token-row">
                ${createToken(`수:${completedMissionEntries.length}`, completedMissionEntries.length > 0 ? 'success' : 'neutral')}
              </div>
            </div>
            <p class="detail-copy detail-copy-compact">종료 정리까지 끝난 안건만 따로 보관합니다.</p>
          </section>
          ${renderMissionRows(
            completedMissionEntries,
            '종료 안건 없음',
            '종료 정리까지 끝난 안건이 생기면 이 줄에 보관됩니다.',
            'mission-empty-state-complete-row',
          )}
        </div>
      `
    : `
        <div class="empty-state mission-empty-state mission-empty-state-list">
          <strong class="mission-empty-title">등록 안건 없음</strong>
          <p class="mission-empty-copy">위 등록대장에서 첫 안건을 만들면 이곳에 바로 쌓입니다.</p>
        </div>
      `;

  elements.surfaces.mission.innerHTML = `
    <div class="stack">
      ${renderMissionIntakeBoard({
        project: data.activeProject,
        mission: selectedMission,
        councilSession: selectedCouncilSession,
        nextActionPreview: selectedMissionNextActionPreview,
        activeCount: activeMissionEntries.length,
        completedCount: completedMissionEntries.length,
        missionCount: data.missions.length,
        draftTitle: state.missionDraftTitle,
        draftGoal: state.missionDraftGoal,
      })}
      ${missionViewportStrip}
      <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>안건 등록대장</h2>
            <p class="panel-copy panel-copy-tight">왼쪽은 신규 안건 등록과 현재 안건 배정만 둡니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(`프로젝트:${data.activeProject.name}`, 'success')}
            ${createToken(`미션수:${data.missions.length}`, 'neutral')}
          </div>
        </div>
        <form class="task-create-form task-create-form-compact mission-order-desk" data-form="create-mission">
          <div class="mission-order-head">
            <div class="stack">
              <strong>신규 안건 등록</strong>
              <p class="detail-copy detail-copy-compact">
                ${
                  missionUsesKnowledgeWork
                    ? '안건을 등록하면 선택한 산출물 유형으로 회의 안건이 바로 열리고, 다음 처리 트리거가 같이 준비됩니다.'
                    : '안건을 등록하면 회의 안건이 바로 열리고, 다음 처리 트리거가 같이 준비됩니다.'
                }
              </p>
            </div>
            <div class="token-row token-row-compact">
              ${createToken('등록 대기', 'accent')}
              ${createToken('회의 자동 호출', 'success')}
              ${missionUsesKnowledgeWork ? createToken('문서형 안건', 'neutral') : ''}
            </div>
          </div>
          <div class="mission-order-main">
            <label class="field field-compact">
              <span class="field-label">안건</span>
              <input
                type="text"
                name="missionTitle"
                value="${escapeHtml(state.missionDraftTitle)}"
                placeholder="오늘 등록할 안건 제목을 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >
            </label>
            <label class="field field-compact">
              <span class="field-label">목표</span>
              <textarea
                name="missionGoal"
                rows="3"
                placeholder="이번 안건으로 무엇을 정리해야 하는지 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftGoal)}</textarea>
            </label>
          </div>
          <div class="mission-order-foot">
            ${
              missionUsesKnowledgeWork
                ? `
                  <label class="field field-compact">
                    <span class="field-label">산출물 유형</span>
                    <select
                      name="missionDeliverableType"
                      ${missionCreateDisabled ? 'disabled' : ''}
                    >
                      ${Object.entries(KNOWLEDGE_WORK_DELIVERABLES)
                        .map(
                          ([value, label]) => `
                            <option value="${escapeHtml(value)}" ${
                              state.missionDraftDeliverableType === value ? 'selected' : ''
                            }>${escapeHtml(label)}</option>
                          `,
                        )
                        .join('')}
                    </select>
                  </label>
                `
                : ''
            }
            <label class="field field-compact">
              <span class="field-label">경계 (선택)</span>
              <textarea
                name="missionConstraints"
                rows="2"
                placeholder="이번 안건에서 넘지 않을 범위나 제약을 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftConstraints)}</textarea>
            </label>
            <div class="form-actions form-actions-inline form-actions-compact mission-order-actions">
              <button class="primary-button" type="submit" ${missionCreateDisabled ? 'disabled' : ''}>안건 등록</button>
              <p class="form-help">
                ${
                  missionUsesKnowledgeWork
                    ? `등록 즉시 ${getKnowledgeWorkDeliverableDisplayName(state.missionDraftDeliverableType)} 기준 회의 초안이 열리고, 승인 전까지는 실행 셀로 넘어가지 않습니다.`
                    : '등록 즉시 회의 초안이 열리고, 승인 전까지는 실행 셀로 넘어가지 않습니다.'
                }
              </p>
            </div>
          </div>
        </form>
        ${missionList}
      </section>
      <aside class="detail-card">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>안건 배정 브리프</h2>
            <p class="panel-copy panel-copy-tight">오른쪽은 현재 배정 판단과 다음 처리만 먼저 봅니다.</p>
          </div>
        </div>
        ${
          selectedMission
            ? `
              ${renderNarrativeDeck({
                wide: false,
                eyebrow: '안건 배정 판단판',
                heading: '현재 배정 판단과 다음 처리를 먼저 봅니다',
                copy: '오른쪽 패널은 긴 설명보다 현재 배정 상태, 가장 먼저 열어야 할 처리선, 필요한 연결 상태를 먼저 보여 줍니다.',
                tokens: [
                  createToken(
                    getMissionStatusDisplay(selectedMission.status),
                    getMissionStatusTone(selectedMission.status),
                  ),
                  selectedMission.deliverableType
                    ? createToken(
                        `산출물:${getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType)}`,
                        'neutral',
                      )
                    : '',
                  selectedMission.linkedTaskId
                    ? createToken(`연결태스크:${selectedMission.linkedTaskId}`, 'accent')
                    : createToken('연결태스크:없음', 'warning'),
                  createToken(
                    `다음:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`,
                    selectedMissionNextActionPreview.tone,
                  ),
                ],
                cards: [
                  {
                    label: '현재 판단',
                    title: selectedMissionBriefControl.currentTitle,
                    copy: selectedMissionBriefControl.currentCopy,
                  },
                  {
                    label: '다음',
                    title: selectedMissionBriefControl.nextTitle,
                    copy: selectedMissionBriefControl.nextCopy,
                  },
                  {
                    label: '이유',
                    title: selectedMissionBriefControl.reasonTitle,
                    copy: selectedMissionBriefControl.reasonCopy,
                  },
                ],
              })}
              <div class="stack">
                <section class="relation-strip relation-strip-compact">
                  <div class="card-title-row card-title-row-tight">
                    <strong>${escapeHtml(selectedMission.title)}</strong>
                    ${
                      selectedMission.deliverableType
                        ? createToken(
                            getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType),
                            'neutral',
                          )
                        : ''
                    }
                  </div>
                  <p class="detail-copy detail-copy-compact">${escapeHtml(selectedMission.goal || '기록된 미션 목표가 없습니다.')}</p>
                </section>
                ${missionEvidenceRail}
                ${
                  selectedMission.deliverableType
                    ? `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>산출물 유형</strong>
                        </div>
                        <p class="detail-copy">${escapeHtml(getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType))}</p>
                      </section>
                    `
                    : ''
                }
                ${
                  missionCompletionReady
                    ? `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>실행 지시 데스크 인계 미리보기</strong>
                        </div>
                        <div class="token-row">
                          ${
                            linkedTask
                              ? createToken(`태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`, 'neutral')
                              : createToken('태스크:없음', 'warning')
                          }
                          ${
                            selectedMissionExecutionPreview.actionLabel
                              ? createToken(`게이트:${selectedMissionExecutionPreview.actionLabel}`, 'neutral')
                              : createToken('게이트:없음', 'warning')
                          }
                          ${
                            selectedMissionExecutionPreview.executionBlocked
                              ? createToken('실행차단', 'danger')
                              : ''
                          }
                          ${linkedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                            ${linkedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                            ${linkedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionExecutionPreview.stagePreview)}</p>
                        <p class="detail-copy">
                          <strong>현재 지시 미리보기</strong>: ${escapeHtml(selectedMissionExecutionPreview.gatePreview)}
                        </p>
                        <p class="detail-copy">
                          <strong>보류 사유</strong>: ${escapeHtml(selectedMissionExecutionPreview.blockedReason)}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>회의 결과물 미리보기</strong>
                        </div>
                        <div class="token-row">
                          ${
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? createToken(
                                  `아티팩트:${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type}`,
                                  'neutral',
                                )
                              : createToken('아티팩트:없음', 'warning')
                          }
                          ${createToken(
                            `리뷰:${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)}`,
                            getReviewTone(selectedMissionDeliverablesPreview.latestReviewStatus),
                          )}
                          ${
                            selectedMissionDeliverablesPreview.latestApproval
                              ? createToken(
                                  `승인:${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)}`,
                                  getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                )
                              : createToken('승인:없음', 'neutral')
                          }
                        </div>
                        <p class="detail-copy">
                          <strong>최신 아티팩트 미리보기</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? `${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type} ${selectedMissionDeliverablesPreview.currentDeliverableArtifact.id}가 현재 한정된 출력의 머리입니다.`
                              : '아직 아티팩트 패키지가 없습니다.',
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>리뷰 상태</strong>: ${escapeHtml(
                            `현재 리뷰 상태는 ${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)}입니다.`,
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>승인 상태</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.latestApproval
                              ? `${selectedMissionDeliverablesPreview.latestApproval.id}는 ${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)} 상태입니다.`
                              : '아직 승인 기록이 없습니다.',
                          )}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>다음 지시</strong>
                        </div>
                        <div class="token-row">
                          ${createToken(`표면:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`, selectedMissionNextActionPreview.tone)}
                          ${createToken(`액션:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionNextActionPreview.summary)}</p>
                      </section>
                    `
                    : `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>브리프 핵심 4줄</strong>
                          <div class="token-row">
                            ${
                              selectedCouncilSession
                                ? createToken(
                                    `정렬:${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}`,
                                    getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                                  )
                                : createToken('정렬:없음', 'warning')
                            }
                            ${
                              linkedTask
                                ? createToken(`태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`, 'neutral')
                                : createToken('태스크:없음', 'warning')
                            }
                            ${
                              selectedMissionDeliverablesPreview.latestApproval
                                ? createToken(
                                    `승인:${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)}`,
                                    getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                  )
                                : createToken('승인:없음', 'neutral')
                            }
                            ${createToken(
                              `표면:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`,
                              selectedMissionNextActionPreview.tone,
                            )}
                            ${createToken(`액션:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                          </div>
                        </div>
                        <p class="detail-copy detail-copy-compact">지금 판단할 상태만 네 줄로 봅니다.</p>
                        ${renderMissionSnapshotList(selectedMissionActiveSnapshotItems, { compact: true })}
                      </section>
                    `
                }
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>실행 셀 연결</strong>
                  </div>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`${linkedTask.id}가 ${getTaskLifecycleDisplay(linkedTask.lifecycleState)} 상태로 연결돼 있습니다.`)
                        : '이 안건에는 아직 연결된 실행 셀이 없습니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>등록 후속</strong>
                  </div>
                  <p class="detail-copy">회의, 실행, 관제실 기본 동선만 엽니다.</p>
                  <div class="form-actions form-actions-inline">
                    ${
                      selectedCouncilSession
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-council"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            회의실
                          </button>
                        `
                      : `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="draft-council-for-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            회의 초안
                          </button>
                        `
                    }
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="create-linked-task-for-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${linkedTaskCreateDisabled ? 'disabled' : ''}
                    >
                      실행 셀
                    </button>
                    ${
                      linkedTask
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-execution"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            실행 데스크
                          </button>
                        `
                        : ''
                    }
                  </div>
                  ${
                    missionCompletionReady
                      ? `
                        <div class="form-actions form-actions-inline">
                          <button
                            class="primary-button"
                            type="button"
                            data-action="prepare-next-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            다음 안건 준비
                          </button>
                        </div>
                      `
                      : ''
                  }
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-advanced-ops"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      관제실
                    </button>
                    <p class="form-help">세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다.</p>
                  </div>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>안건 종료 보고</strong>
                  </div>
                  <div class="token-row">
                    ${
                          linkedTask
                            ? createToken(
                                `태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`,
                                linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                              )
                            : createToken('태스크:없음', 'warning')
                        }
                        ${
                          missionCompletionReady
                            ? createToken('상태:완료', 'success')
                            : createToken('상태:진행 중', 'warning')
                        }
                        ${
                          missionCompletionArtifactId
                            ? createToken(`종료정리:${missionCompletionArtifactId}`, 'neutral')
                            : ''
                        }
                  </div>
                  <p class="detail-copy">
                    ${
                      missionCompletionReady
                        ? escapeHtml(
                            `${selectedMission.title}은 종료 정리 아티팩트 ${missionCompletionArtifactId}로 경로를 닫았습니다.`,
                          )
                        : '연결 태스크가 종료 정리를 마치면 이곳에 미션 완료 요약이 뜹니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>현재 안건 상태</strong>: ${
                      missionCompletionReady
                        ? escapeHtml(
                            `태스크 ${linkedTask.id}는 완료입니다. 종료 정리 결과는 소스 릴리스 번들 ${missionCompletionReleasePackageId || '알 수 없음'}에 연결돼 있습니다.`,
                          )
                        : linkedTask
                          ? escapeHtml(
                              `태스크 ${linkedTask.id}는 현재 ${getTaskLifecycleDisplay(linkedTask.lifecycleState)} 상태입니다. 종료 정리가 끝나면 미션 완료가 봉인됩니다.`,
                            )
                          : '아직 연결된 태스크가 없습니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>다음 안전한 지시</strong>: ${
                      missionCompletionReady
                        ? '저장된 종료 정리 번들을 확인한 뒤 새 미션을 시작하거나 이 미션을 다시 다듬습니다. 푸시, 게시, 외부 릴리스는 범위 밖입니다.'
                        : '협의회나 실행에서 현재 경로를 계속 전진합니다. 종료 정리 번들이 저장돼야 완료가 닫힙니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>참여 역할</strong>
                    ${createToken('참여 역할', 'accent')}
                  </div>
                  ${
                    selectedCouncilSession
                      ? `
                        <div class="token-row">
                          ${createToken('직급 체계', 'accent')}
                          ${createToken(
                            `정렬:${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}`,
                            getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                          )}
                          ${createToken(
                            `참여자:${selectedMissionCouncilPreview.participantCount}`,
                            'neutral',
                          )}
                          ${
                            selectedMissionCouncilPreview.openQuestionsCount > 0
                              ? createToken(
                                  `열린질문:${selectedMissionCouncilPreview.openQuestionsCount}`,
                                  'warning',
                                )
                              : createToken('열린질문:0', 'success')
                          }
                        </div>
                      `
                      : ''
                  }
                  ${renderCouncilCastCards(selectedCouncilSession, { compact: true })}
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `${selectedCouncilSession.id}는 ${getCouncilStatusDisplay(selectedCouncilSession.status)} 상태이고, 네 역할이 현재 정렬을 ${getAlignmentStatusDisplay(selectedCouncilSession.alignment?.status || 'pending')}으로 묶고 있습니다.`,
                          )
                        : '참모 회의를 열면 네 역할이 같은 안건을 두고 정렬을 시작합니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `추천안 미리보기: ${selectedMissionCouncilPreview.recommendationPreview}`,
                          )
                        : '추천안 미리보기: 협의회를 초안으로 만들어 현재 추천안을 채웁니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `정렬 상태: ${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}. 선택된 계획은 ${selectedMissionCouncilPreview.selectedPlanTitle}입니다.`,
                          )
                        : '정렬 상태: 협의회 세션이 생기기 전까지는 비어 있습니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>회의 경계</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedMission.constraints || '기록된 제약 조건이 없습니다.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>관제실 직행</strong>
                  </div>
                  <p class="detail-copy">세부 로그, 작업판, 증적 조작이 필요할 때 여는 별도 관제실입니다.</p>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`연결 태스크 ${linkedTask.id}를 선택한 상태로 작업판을 엽니다.`)
                        : '미션 범위를 바꾸지 않고 작업판을 엽니다.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state mission-empty-state mission-empty-state-detail">
                <strong class="mission-empty-title">선택된 안건 없음</strong>
                <p class="mission-empty-copy">왼쪽 등록대장에서 안건을 고르거나 위 입력선에서 새 안건을 등록합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderCouncil(data) {
  if (!data.activeProject) {
    elements.surfaces.council.innerHTML = renderProjectGateSurface(
      '협의회 사용 불가',
      '협의회를 열기 전에 미션 또는 고급 운영 모드에서 프로젝트를 먼저 고릅니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncilSession =
    selectedMission?.councilSessionId && data.councilSessionMap.has(selectedMission.councilSessionId)
      ? data.councilSessionMap.get(selectedMission.councilSessionId)
      : null;
  const linkedTask =
    selectedMission?.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;
  const selectedMissionCompletion = getMissionCompletionSummary(selectedMission, data);
  const councilControl = getCouncilControlSnapshot(
    selectedMission,
    selectedCouncilSession,
    linkedTask,
  );

  if (!selectedMission) {
    elements.surfaces.council.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 안건 없음</strong>
          <p>참모 회의를 열기 전에 안건 표면에서 안건을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const councilDraftDisabled =
    state.loading || state.mutating || Boolean(selectedCouncilSession);
  const approveDisabled =
    state.loading ||
    state.mutating ||
    !selectedCouncilSession ||
    selectedCouncilSession.alignment?.status === 'approved';
  const councilNextSurface =
    selectedCouncilSession?.alignment?.status === 'approved'
      ? linkedTask
        ? 'execution'
        : 'mission'
      : 'council';
  const councilHeartbeatStrip = renderCouncilHeartbeatStrip(
    selectedMission,
    selectedCouncilSession,
    linkedTask,
  );
  const councilEvidenceRail = renderExecutionEvidenceRail(
    getExecutionEvidenceRail(linkedTask, data),
    {
      eyebrow: '결론 증적선',
      heading: '참모 결론이 실제 실행 증적으로 어디까지 넘어왔는지 봅니다',
      copy: '회의 결론 아래에서 현재 담당, 증적, 보류 사유, 다음 인계만 그대로 읽습니다.',
    },
  );
  const councilSignalBySurface = Object.fromEntries(
    getCompanySignalEntries({
      mission: selectedMission,
      councilSession: selectedCouncilSession,
      linkedTask,
      completionReady: selectedMissionCompletion.completionReady,
    }).map((entry) => [entry.surface, entry]),
  );
  const councilViewportStrip = renderViewportHandoffStrip({
    eyebrow: '회의실 동선',
    heading: '참석 기록선과 권고 선반으로 나눕니다',
    copy:
      '왼쪽은 참석 역할, 회의 안건, 발언 기록을 두고, 오른쪽은 권고안, 이견, 승인 상태를 먼저 보여 줍니다.',
    tokens: [
      createToken(
        `정렬:${getAlignmentStatusDisplay(selectedCouncilSession?.alignment?.status || 'pending')}`,
        getAlignmentTone(selectedCouncilSession?.alignment?.status || 'pending'),
      ),
      createToken(
        `참모:${selectedCouncilSession?.participants?.length || 4}석`,
        selectedCouncilSession ? 'neutral' : 'warning',
      ),
      createToken(`다음:${getSurfaceDisplayName(councilNextSurface)}`, councilNextSurface === 'execution' ? 'accent' : 'neutral'),
    ],
    cards: [
      {
        label: '왼쪽 참석 기록',
        title: '참석 역할 + 회의 안건',
        copy: '안건 맥락, 참석 역할, 회의 발언을 왼쪽에 둡니다.',
        signal: councilSignalBySurface.council,
      },
      {
        label: '오른쪽 권고 선반',
        title: '권고안 + 이견 + 승인선',
        copy: '권고 방향, 열린 이견, 현재 승인 상태를 먼저 보고 깊은 회의록은 뒤로 미룹니다.',
        signal: councilSignalBySurface['decision-inbox'],
      },
      {
        label: '다음 처리',
        title: councilControl.nextTitle,
        copy: councilControl.nextCopy,
        emphasis: true,
        signal: councilSignalBySurface[councilNextSurface] || councilSignalBySurface.council,
        button:
          selectedMission && councilNextSurface !== 'council'
            ? {
                action: 'open-surface-for-mission',
                id: selectedMission.id,
                targetSurface: councilNextSurface,
                label: getSurfaceDisplayName(councilNextSurface),
                disabled: state.loading || state.mutating,
              }
            : null,
      },
    ],
  });
  const transcriptCards = selectedCouncilSession
    ? selectedCouncilSession.transcript
        .map(
          (entry) => `
            <section class="relation-strip transcript-card">
              <div class="card-title-row card-title-row-tight transcript-card-head">
                <strong class="transcript-card-role">${escapeHtml(getCouncilCastEntry(entry.role, selectedCouncilSession).displayName)}</strong>
                ${entry.stance ? createToken(entry.stance, 'neutral') : ''}
              </div>
              <p class="detail-copy detail-copy-compact transcript-card-copy">${escapeHtml(entry.content || '')}</p>
            </section>
          `,
        )
        .join('')
    : '';

  elements.surfaces.council.innerHTML = `
    <div class="stack">
      ${renderCouncilBoardroomStage({
        agendaGoal:
          selectedMission.goal ||
          '안건이 올라오면 네 역할이 회의를 열고 목표와 방향을 먼저 정리합니다.',
        agendaTitle: selectedMission.title || '오늘 논의할 안건',
        completionReady: selectedMissionCompletion.completionReady,
        copy:
          '여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다.',
        heading: '참석 역할, 안건, 권고를 같은 회의실에서 정리합니다',
        councilSession: selectedCouncilSession,
        linkedTask,
        mission: selectedMission,
      })}
      ${councilHeartbeatStrip}
      ${councilViewportStrip}
      <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>회의 참석 등록부</h2>
            <p class="panel-copy panel-copy-tight">왼쪽은 참석자, 회의 안건, 발언 기록을 둡니다.</p>
          </div>
          <div class="token-row">
            ${createToken(`프로젝트:${data.activeProject.name}`, 'success')}
            ${createToken(`미션:${selectedMission.id}`, 'neutral')}
            ${createToken(`세션수:${data.councilSessions.length}`, 'neutral')}
          </div>
        </div>
        <section class="relation-strip">
          <div class="card-title-row">
            <strong>오늘 회의 안건</strong>
            ${createToken(getMissionStatusDisplay(selectedMission.status), getMissionStatusTone(selectedMission.status))}
            ${
              selectedMission.deliverableType
                ? createToken(
                    getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType),
                    'neutral',
                  )
                : ''
            }
            ${
              selectedCouncilSession
                ? createToken(
                    getCouncilStatusDisplay(selectedCouncilSession.status),
                    getCouncilStatusTone(selectedCouncilSession.status),
                  )
                : createToken('협의회:없음', 'warning')
            }
          </div>
          <p class="detail-copy">${escapeHtml(selectedMission.goal || '기록된 미션 목표가 없습니다.')}</p>
          ${
            selectedMission.deliverableType
              ? `<p class="detail-copy">선택 산출물: ${escapeHtml(getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType))}</p>`
              : ''
          }
          <p class="detail-copy">${escapeHtml(selectedMission.constraints || '기록된 제약 조건이 없습니다.')}</p>
          ${
            !selectedCouncilSession
              ? `
                <div class="form-actions form-actions-inline">
                  <button
                    class="primary-button"
                    type="button"
                    data-action="draft-council-for-mission"
                    data-id="${escapeHtml(selectedMission.id)}"
                    ${councilDraftDisabled ? 'disabled' : ''}
                  >
                    회의 초안
                  </button>
                  <p class="form-help">안건이 올라온 뒤 참석자 등록과 첫 권고안을 먼저 엽니다.</p>
                </div>
              `
              : ''
          }
        </section>
        ${
          selectedCouncilSession
            ? `
              <div class="stack">
                <section class="relation-strip">
                  <div class="card-title-row card-title-row-tight">
                    <strong>참석 역할 등록부</strong>
                    ${createToken('참여 역할', 'accent')}
                  </div>
                  <p class="detail-copy detail-copy-compact">
                    참석 역할이 끝까지 기록되어 권고와 승인선의 근거를 같은 회의 흐름에서 확인할 수 있습니다.
                  </p>
                  ${renderCouncilCastCards(selectedCouncilSession)}
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>회의 발언 기록</strong>
                  </div>
                  <div class="stack">
                    ${transcriptCards}
                  </div>
                </section>
              </div>
            `
            : `
              <div class="empty-state council-empty-state council-empty-state-main">
                <strong class="council-empty-title">회의 세션 없음</strong>
                <p class="council-empty-copy">회의를 열면 참석 역할, 권고안, 승인 선반이 이곳에 뜹니다.</p>
                ${renderCouncilCastCards(null)}
              </div>
            `
        }
      </section>
      <aside class="detail-card">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>권고와 승인 선반</h2>
            <p class="panel-copy panel-copy-tight">오른쪽은 권고안, 이견, 승인 상태만 먼저 봅니다.</p>
          </div>
        </div>
        ${
          selectedCouncilSession
            ? `
              ${renderNarrativeDeck({
                wide: false,
                eyebrow: '회의 권고 선반',
                heading: '권고안, 이견, 승인 선반을 먼저 봅니다',
                copy: '오른쪽 패널은 회의록 전체보다 현재 권고안, 열린 이견, 승인 상태를 먼저 보여 줍니다.',
                tokens: [
                  createToken(selectedCouncilSession.id, 'neutral'),
                  createToken(
                    `정렬:${selectedCouncilSession.alignment?.status || 'pending'}`,
                    getAlignmentTone(selectedCouncilSession.alignment?.status || 'pending'),
                  ),
                  linkedTask
                    ? createToken(`연결태스크:${linkedTask.id}`, 'accent')
                    : createToken('연결태스크:없음', 'warning'),
                ],
                cards: [
                  {
                    label: '현재 판단',
                    title: councilControl.currentTitle,
                    copy: councilControl.currentCopy,
                  },
                  {
                    label: '다음',
                    title: councilControl.nextTitle,
                    copy: councilControl.nextCopy,
                  },
                  {
                    label: '이유',
                    title: councilControl.reasonTitle,
                    copy: councilControl.reasonCopy,
                  },
                ],
              })}
              <div class="stack council-outcome-stack">
                <section class="relation-strip council-outcome-card council-outcome-card-summary">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">회의 요약</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.summary || '기록된 요약이 없습니다.')}</p>
                </section>
                <section class="relation-strip council-outcome-card council-outcome-card-recommendation">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">권고안 선반</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.recommendation || '기록된 추천안이 없습니다.')}</p>
                </section>
                <section class="relation-strip council-outcome-card council-outcome-card-plan">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">채택 후보 선반</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.selectedPlan?.title || '기록된 선택 계획이 없습니다.')}</p>
                  <p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-copy-muted">${escapeHtml(selectedCouncilSession.selectedPlan?.scope || '기록된 선택 범위가 없습니다.')}</p>
                </section>
                ${councilEvidenceRail}
                <section class="relation-strip council-outcome-card council-outcome-card-questions">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">이견·추가 확인</strong>
                  </div>
                  <div class="stack council-outcome-question-list">
                    ${selectedCouncilSession.openQuestions
                      .map(
                        (question) => `
                          <p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-question">${escapeHtml(question)}</p>
                        `,
                      )
                      .join('')}
                  </div>
                </section>
                <section class="relation-strip detail-block detail-block-action council-approval-block">
                  <div class="council-approval-head">
                    <div>
                      <p class="detail-key">승인 선반</p>
                      <p class="council-approval-copy">이 권고안을 승인하면 사전 점검까지만 넘기고, 다음 게이트에서 멈춥니다.</p>
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken('결론 승인', selectedCouncilSession.alignment?.status === 'approved' ? 'success' : 'accent')}
                      ${linkedTask ? createToken('실행 연결', 'neutral') : createToken('연결 대기', 'warning')}
                    </div>
                  </div>
                  <div class="form-actions council-approval-row">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="approve-council-for-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${approveDisabled ? 'disabled' : ''}
                    >
                      회의 결론 승인
                    </button>
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="revise-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      안건 다시 다듬기
                    </button>
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-advanced-ops"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      관제실
                    </button>
                    ${
                      linkedTask
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                          data-action="open-execution"
                          data-id="${escapeHtml(selectedMission.id)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          실행 데스크
                        </button>
                      `
                        : ''
                    }
                  </div>
                  <p class="form-help council-approval-help">
                    ${
                      selectedCouncilSession.alignment?.status === 'approved'
                        ? escapeHtml(
                            `${formatDate(selectedCouncilSession.alignment?.decidedAt)}에 결론이 승인됐습니다. 이제 실행 지시 데스크와 관제실에서 다음 지시를 확인합니다.`,
                          )
                        : '결론 승인이 끝나야 후속 실행이 열립니다.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state council-empty-state council-empty-state-detail">
                <strong class="council-empty-title">권고안 선반 비어 있음</strong>
                <p class="council-empty-copy">선택된 안건에서 회의를 열면 권고안과 승인 선반이 채워집니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderCouncilHeartbeatStrip(mission, councilSession, linkedTask) {
  const castEntries = COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const councilHeartbeatSignals = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask,
    completionReady: false,
  }).filter((entry) => ['mission', 'council', 'execution', 'decision-inbox'].includes(entry.surface));
  const heartbeatTone = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? 'success'
      : 'accent'
    : 'warning';
  const heartbeatStatus = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? linkedTask
        ? '인계 완료'
        : '정렬 완료'
      : '정렬 중'
    : '대기 중';
  const heartbeatCards = castEntries
    .map((castEntry) => {
      const heartbeatCopy = councilSession
        ? councilSession.alignment?.status === 'approved'
          ? linkedTask
            ? `${linkedTask.id} 기준 후속 판단으로 인계를 마쳤습니다.`
            : `${castEntry.displayName} 관점 정렬은 끝났고 실행 연결만 남았습니다.`
          : castEntry.focus
        : castEntry.previewLine;
      const heartbeatFoot = councilSession
        ? councilSession.alignment?.status === 'approved'
          ? linkedTask
            ? '실행 흐름'
            : '인계선 대기'
          : '회의 흐름'
        : '착석 준비';

      return `
        <article class="council-heartbeat-card council-heartbeat-card-${castEntry.tone}">
          <div class="council-heartbeat-head">
            <span class="council-heartbeat-pulse council-heartbeat-pulse-${heartbeatTone}"></span>
            <strong class="council-heartbeat-role">${escapeHtml(castEntry.displayName)}</strong>
            ${createToken(heartbeatStatus, heartbeatTone)}
          </div>
          <p class="council-heartbeat-rank">${escapeHtml(castEntry.rank)}</p>
          <p class="council-heartbeat-copy">${escapeHtml(heartbeatCopy)}</p>
          <p class="council-heartbeat-foot">${escapeHtml(heartbeatFoot)}</p>
        </article>
      `;
    })
    .join('');

  return `
    <section class="relation-strip council-heartbeat-strip">
      <div class="card-title-row card-title-row-tight">
        <strong>회의 흐름</strong>
        ${createToken(
          `회의:${councilSession ? getCouncilStatusDisplay(councilSession.status) : '대기'}`,
          councilSession ? getCouncilStatusTone(councilSession.status) : 'warning',
        )}
        ${createToken(
          `정렬:${councilSession ? getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending') : '대기'}`,
          heartbeatTone,
        )}
        ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
      </div>
      <p class="detail-copy detail-copy-compact council-heartbeat-intro">
        참석 역할, 정렬 상태, 인계 상태를 같은 회의 흐름에서 이어서 확인합니다.
      </p>
      <div class="council-heartbeat-signal-row">
        ${councilHeartbeatSignals
          .map(
            (entry) => `
              <div class="council-heartbeat-signal council-heartbeat-signal-${escapeHtml(entry.tone)}">
                <span class="council-heartbeat-signal-dot"></span>
                <span class="council-heartbeat-signal-label">${escapeHtml(entry.label)}</span>
                <strong class="council-heartbeat-signal-status">${escapeHtml(entry.status)}</strong>
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="council-heartbeat-grid">
        ${heartbeatCards}
      </div>
    </section>
  `;
}

function renderExecution(data) {
  if (!data.activeProject) {
    elements.surfaces.execution.innerHTML = renderProjectGateSurface(
      '실행 데스크 사용 불가',
      '실행 데스크를 열기 전에 안건에서 프로젝트를 고르거나, 수동 제어가 필요하면 관제실을 사용합니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncilSession = getMissionCouncilPreview(selectedMission, data).councilSession;

  if (!selectedMission) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 안건 없음</strong>
          <p>실행 데스크를 열기 전에 안건을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>실행 지시 데스크</h2>
              <p class="panel-copy">선택된 안건에 배정 실행 셀이 생기기 전까지는 작업 지시 데스크가 비어 있습니다.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>배정 실행 셀 없음</strong>
            <p>회의 승인으로 첫 실행 셀을 자동으로 만들거나, 안건 브리프에서 수동으로 연결합니다.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>다음 지시</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-council"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              회의실
            </button>
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              관제실
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const executionEntryGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const taskBreakerState = getTaskBreakerAvailability(linkedTask, data);
  const builderPreflightState = getBuilderPreflightAvailability(linkedTask, data);
  const builderLiveMutationState = getBuilderLiveMutationSummaries(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data);
  const closeOutState = getCloseOutAvailability(linkedTask, data);
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const executionCompletionReady = Boolean(
    linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState.summary?.existingCloseOutArtifactId),
  );
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      builderLiveMutationState.guardSummary.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const canRunCloseOut = Boolean(closeOutState.summary.allowed);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const gateCopy =
    preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? '빌더 라이브 변경 승인이 대기 중입니다.'
      : linkedTask.flags?.waitingDecision
          ? '막고 있는 결정 항목이 대기 중입니다.'
          : executionEntryGateReason
            ? executionEntryGateReason
        : builderLiveMutationState.requestSummary.allowed
            ? `사전 점검 ${builderLiveMutationState.requestSummary.currentPreflightArtifactId}가 빌더 라이브 변경 승인 준비 상태입니다.`
            : '현재 활성화된 차단 게이트는 없습니다.';
  const executionControl = getExecutionControlSnapshot(
    linkedTask,
    latestRun,
    approvalBridge,
    gateCopy,
    {
      closeOutAllowed: canRunCloseOut,
      commitAllowed: canPrepareCommitPackage || canRunLocalCommit,
      releaseAllowed: canPrepareReleasePackage,
    },
  );
  const executionLeft = getExecutionLeftSnapshot(linkedTask, latestRun, executionControl, {
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    latestPreflightArtifact,
  });
  const executionEvidenceRail = renderExecutionEvidenceRail(
    getExecutionEvidenceRail(linkedTask, data),
    {
      eyebrow: '실행 증적선',
      heading: '회의 인계와 현재 실행 로그를 같은 선으로 읽습니다',
      copy: '현재 담당, 역할별 증적, 차단 사유, 다음 인계만 요약합니다.',
    },
  );
  const harnessBrief = getHarnessConsumerBrief(data);
  const harnessConsumerStatus = getHarnessConsumerStatus(data);

  elements.surfaces.execution.innerHTML = `
    <div class="stack">
      ${renderExecutionCommandDeck({
        approvalBridge,
        completionReady: executionCompletionReady,
        councilSession: selectedCouncilSession,
        gateCopy,
        latestRun,
        mission: selectedMission,
        task: linkedTask,
      })}
      ${renderHarnessBriefRegister(harnessBrief)}
    <div class="surface-grid">
      <section class="surface-panel">
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '작업 지시 개요',
          heading: '실행 지시 데스크',
          copy: '왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다.',
          tokens: [
            createToken(`안건:${selectedMission.id}`, 'neutral'),
            createToken(`실행셀:${linkedTask.id}`, 'accent'),
            createToken(getTaskLifecycleDisplay(linkedTask.lifecycleState), 'neutral'),
            createToken(`리뷰:${getReviewStatusDisplay(linkedTask.review?.status || 'pending')}`, getReviewTone(linkedTask.review?.status)),
            linkedTask.flags?.blocked ? createToken('차단', 'danger') : '',
            linkedTask.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
            linkedTask.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 작업 지시',
              title: executionLeft.currentTitle,
              copy: executionLeft.currentCopy,
            },
            {
              label: '다음 처리',
              title: executionLeft.nextTitle,
              copy: executionLeft.nextCopy,
            },
            {
              label: '연결 근거',
              title: executionLeft.reasonTitle,
              copy: executionLeft.reasonCopy,
            },
          ],
        })}
        ${renderHarnessExecutionActionShelf(harnessConsumerStatus)}
        ${executionEvidenceRail}

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>최근 실행 로그</strong>
          </div>
          <div class="token-row">
            ${latestRun ? createToken(`run:${latestRun.id}`, getRunTone(latestRun.status)) : createToken('run:없음', 'neutral')}
            ${latestRun ? createToken(`역할:${getExecutionRoleDisplay(latestRunRole)}`, 'neutral') : ''}
            ${latestRunNextStage ? createToken(`다음:${getExecutionStageDisplay(latestRunNextStage)}`, 'neutral') : ''}
          </div>
          <p class="detail-copy">
            ${
              latestRun
                ? escapeHtml(`${formatDate(latestRun.startedAt)}에 시작된 최신 실행 로그 기준 요약입니다.`)
                : '아직 기록된 실행 로그가 없습니다.'
            }
          </p>
        </section>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>상류 승인 패킷</strong>
          </div>
          <div class="token-row">
            ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
            ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
            ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
            ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
          </div>
          <p class="detail-copy">회의 결론 승인 자동 체인은 플래너부터 프리플라이트까지만 진행되고, 이후는 기존 승인 게이트 규칙을 따릅니다.</p>
        </section>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>게이트 제어 데스크</h2>
            <p class="panel-copy">여기서는 승인선, 차단 사유, 실행 준비 상태를 먼저 봅니다.</p>
          </div>
        </div>
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '게이트 판단판',
          heading: '현재 게이트와 바로 처리할 후속을 먼저 봅니다',
          copy: '오른쪽 패널은 작업 지시보다 승인선, 차단 근거, 다음 처리 경로를 우선 보여 줍니다.',
          tokens: [
            createToken(getTaskLifecycleDisplay(linkedTask.lifecycleState), 'neutral'),
            linkedTask.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
            linkedTask.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
            linkedTask.flags?.blocked ? createToken('차단', 'danger') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 게이트',
              title: executionControl.currentTitle,
              copy: executionControl.currentCopy,
            },
            {
              label: '다음 처리',
              title: executionControl.nextTitle,
              copy: executionControl.nextCopy,
            },
            {
              label: '판단 근거',
              title: executionControl.reasonTitle,
              copy: executionControl.reasonCopy,
            },
          ],
        })}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>승인선</strong>
            </div>
            <div class="token-row">
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `승인:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('승인:없음', 'neutral')
              }
              ${
                approvalBridge.actionLabel
                  ? createToken(`액션:${approvalBridge.actionLabel}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`대상:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`아티팩트:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `결정함:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>다음 지시</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      현재 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 빌더 승인 기록을 그대로 재사용하며, 세부 태스크/로그/아티팩트/결정함 제어는 관제실에 남깁니다.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      커밋 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 커밋 승인 기록을 그대로 처리합니다. 이후 후속 단계는 계속 관제실에 남습니다.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      릴리스 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 릴리스 승인 기록을 그대로 처리합니다. 종료 정리는 릴리스 준비 상태가 잡힌 뒤 실행에서 이어집니다.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-builder-live-mutation"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      라이브 변경 적용
                    </button>
                  </div>
                  <p class="form-help">현재 빌더 승인은 이미 승인됐습니다. 이 CTA는 라이브 변경 경로를 따라 한정된 변경 번들을 실행 로그로 남깁니다.</p>
                `
                : ''
            }
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-reviewer"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      검토 보고 생성
                    </button>
                  </div>
                  <p class="form-help">최신 라이브 변경 번들이 준비됐습니다. 이 CTA는 리뷰어 경로를 따라 검토 보고로 이어집니다.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-commit-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      커밋 패킷 준비
                    </button>
                  </div>
                  <p class="form-help">최신 리뷰어 번들이 준비됐습니다. 이 CTA는 커밋 패키지 경로를 따라 현재 커밋 승인을 엽니다.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-local-commit"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      승인된 로컬 커밋 실행
                    </button>
                  </div>
                  <p class="form-help">현재 커밋 번들이 준비됐습니다. 이 CTA는 로컬 커밋 경로를 따라 커밋 결과 번들로 이어집니다.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-release-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      릴리스 패킷 준비
                    </button>
                  </div>
                  <p class="form-help">최신 로컬 커밋 번들이 준비됐습니다. 이 CTA는 릴리스 패키지 경로를 따라 현재 릴리스 승인을 엽니다.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-close-out"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      승인된 종료 정리 실행
                    </button>
                  </div>
                  <p class="form-help">현재 승인된 릴리스 번들이 준비됐습니다. 이 CTA는 종료 정리 경로를 따라 종료 정리 번들로 이어집니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>차단 사유</strong>
            </div>
            <p class="detail-copy">${escapeHtml(gateCopy)}</p>
            <div class="token-row">
              ${preferredInboxItem?.status === 'pending' ? createToken(`결정함:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem)) : ''}
              ${preferredInboxItem?.kind ? createToken(`종류:${preferredInboxItem.kind}`, 'neutral') : ''}
              ${
                builderLiveMutationState.requestSummary.latestApprovalDisplayStatus
                  ? createToken(
                      `승인:${getApprovalStatusDisplay(builderLiveMutationState.requestSummary.latestApprovalDisplayStatus)}`,
                      builderLiveMutationState.requestSummary.latestApprovalDisplayStatus === 'pending'
                        ? 'accent'
                        : 'neutral',
                    )
                  : ''
              }
            </div>
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>실행 준비 패킷</strong>
            </div>
            <div class="token-row">
              ${createToken(
                builderLiveMutationState.requestSummary.allowed ? '승인준비완료' : '준비안됨',
                builderLiveMutationState.requestSummary.allowed ? 'success' : 'warning',
              )}
              ${
                builderLiveMutationState.requestSummary.currentPreflightArtifactId
                  ? createToken(
                      `preflight:${builderLiveMutationState.requestSummary.currentPreflightArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                builderLiveMutationState.requestSummary.allowed
                  ? '현재 프리플라이트 아티팩트 기준으로 빌더 라이브 변경 승인 게이트가 생성된 상태입니다.'
                  : escapeHtml(
                      (builderLiveMutationState.requestSummary.reasons || []).join('; ') ||
                        '아직 실행 준비 패킷 상태를 확인할 수 없습니다.',
                    )
              }
            </p>
            ${
              parsedPreflight
                ? `
                  ${renderCompactList('대상 파일', parsedPreflight.targetFiles)}
                  ${renderCompactList('위험 요소', parsedPreflight.risks)}
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>빠른 이동</strong>
            </div>
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
              data-action="open-council"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              회의실
            </button>
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              관제실
            </button>
          </div>
          <p class="form-help">현재 지시가 아직 대기 상태이면 관제실에서 결정함을 처리한 뒤, 다음 한정된 실행 액션으로 돌아옵니다.</p>
          </section>
        </div>
      </aside>
    </div>
    </div>
  `;
}

function renderDeliverables(data) {
  if (!data.activeProject) {
    elements.surfaces.deliverables.innerHTML = renderProjectGateSurface(
      '산출물 사용 불가',
      '산출물을 열기 전에 미션에서 프로젝트를 고르거나, 수동 제어가 필요하면 고급 운영 모드를 사용합니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;

  if (!selectedMission) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 미션 없음</strong>
          <p>산출물을 열기 전에 미션을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>결과 패킷 데스크</h2>
              <p class="panel-copy">선택된 안건에 연결 실행 셀이 생기기 전까지는 결과 패킷 데스크가 비어 있습니다.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>연결 실행 셀 없음</strong>
            <p>먼저 회의에서 권고안을 승인합니다. Deliverables는 현재 엔진에 이미 존재하는 패킷, 리뷰 라인, 승인 라인 상태만 요약합니다.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>인계 데스크</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              고급 운영
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const taskArtifacts = getTaskArtifacts(linkedTask.id, data.artifacts).sort(sortByCreatedDesc);
  const taskApprovals = getTaskApprovals(linkedTask.id, data.approvals).sort(sortByCreatedDesc);
  const approvalSummary = getTaskApprovalSummary(linkedTask, data.approvals);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const latestRunForOps = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
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
  const latestApproval = taskApprovals[0] || null;
  const selectedCouncilSession = getMissionCouncilPreview(selectedMission, data).councilSession;
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data);
  const closeOutState = getCloseOutAvailability(linkedTask, data);
  const missionCompletionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState.summary.existingCloseOutArtifactId),
  );
  const missionCompletionArtifactId =
    latestCloseOutArtifact?.id || closeOutState.summary.existingCloseOutArtifactId || null;
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      data.derived?.taskGuardSummaries?.[linkedTask.id]?.builderLiveMutation?.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const canRunCloseOut = Boolean(closeOutState.summary.allowed);
  const latestReviewStatus = linkedTask.review?.status || 'pending';
  const latestReviewNote =
    linkedTask.review?.resolution?.note || '아직 기록된 리뷰 해결 메모가 없습니다.';
  const executionGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const deliverablesActionSignals = getCompanySignalEntries({
    mission: selectedMission,
    councilSession: selectedCouncilSession,
    linkedTask,
    completionReady: missionCompletionReady,
  });
  const reviewActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'execution',
    'deliverables',
    'decision-inbox',
  ]);
  const approvalActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'decision-inbox',
    'execution',
    'deliverables',
  ]);
  const closeOutActionSignalRow = renderDeliverablesShelfSignalRow(
    deliverablesActionSignals,
    missionCompletionReady ? ['deliverables', 'mission'] : ['execution', 'deliverables'],
  );
  const opsActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'deliverables',
    'decision-inbox',
  ]);
  const deliverablesOpsEntrySignals = [
    {
      surface: 'taskboard',
      label: '작업판',
      status: getTaskLifecycleDisplay(linkedTask.lifecycleState),
      tone: getTaskLifecycleTone(linkedTask.lifecycleState),
    },
    {
      surface: 'logs',
      label: '로그',
      status: latestRunForOps ? getRunStatusDisplay(latestRunForOps.status) : 'run 없음',
      tone: latestRunForOps ? getRunTone(latestRunForOps.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: latestArtifact ? getArtifactTypeDisplay(latestArtifact.type) : '증적 없음',
      tone: missionCompletionReady ? 'success' : latestArtifact ? 'accent' : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: preferredInboxItem
        ? `${getInboxKindDisplay(preferredInboxItem.kind)} ${getInboxStatusDisplay(preferredInboxItem.status)}`
        : approvalSummary.pending > 0
          ? `승인 ${approvalSummary.pending}건`
          : '대기 없음',
      tone: preferredInboxItem
        ? getInboxTone(preferredInboxItem)
        : approvalSummary.pending > 0
          ? 'accent'
          : 'success',
    },
  ];
  const opsEntrySignalRow = renderDeliverablesOpsEntryRow(deliverablesOpsEntrySignals);
  const opsEntryHelperCopy = executionGateReason
    ? `현재 실행 입구는 ${executionGateReason} 전까지 여기서 멈춥니다. 관제실은 차단 근거와 다음 표면만 먼저 엽니다.`
    : '보고실은 의도적으로 간결한 요약에서 멈춥니다. 작업판, 로그, 증적 보관실, 결재함은 관제실 쪽 세부 운영 경로로 남습니다.';
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
  const deliverablesEvidenceState = getExecutionEvidenceRail(linkedTask, data);
  const deliverablesDeck = renderDeliverablesReportDeck({
    councilSession: selectedCouncilSession,
    mission: selectedMission,
    task: linkedTask,
    currentArtifact: currentDeliverableArtifact,
    evidenceRail: deliverablesEvidenceState,
    latestApproval,
    approvalBridge,
    latestReviewStatus,
    missionCompletionReady,
  });
  const deliverablesEvidenceRail = renderExecutionEvidenceRail(deliverablesEvidenceState, {
    eyebrow: '증적 인계선',
    heading: '결과 보고도 같은 실행 증적선을 그대로 읽습니다',
    copy: '산출물 표면은 연결 실행 셀의 아티팩트, run, 준비 상태, 리뷰 기준 사실만 읽고 아래 섹션에서 더 깊은 보고를 이어갑니다.',
  });
  const deliverablesControl = getDeliverablesControlSnapshot(
    selectedMission,
    linkedTask,
    currentDeliverableArtifact,
    latestApproval,
    approvalBridge,
    latestReviewStatus,
    missionCompletionReady,
  );
  const deliverablesLeft = getDeliverablesLeftSnapshot(
    selectedMission,
    linkedTask,
    currentDeliverableArtifact,
    deliverablesControl,
    {
      latestArchitectureArtifact,
      latestBreakdownArtifact,
      latestChangeSummaryArtifact,
      latestCloseOutArtifact,
      latestCommitPackageArtifact,
      latestCommitResultArtifact,
      latestDiffArtifact,
      latestPatchArtifact,
      latestPlanArtifact,
      latestPreflightArtifact,
      latestReleasePackageArtifact,
      latestReviewArtifact,
    },
  );
  const harnessBrief = getHarnessConsumerBrief(data);

  elements.surfaces.deliverables.innerHTML = `
    <div class="stack">
      ${deliverablesDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid">
      <section class="surface-panel">
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '전달 패킷 개요',
          heading: '결과 패킷 데스크',
          copy: '왼쪽 패널은 현재 결과 패킷, 다음 인계, 연결 근거부터 먼저 보여 줍니다.',
          tokens: [
            createToken(`미션:${selectedMission.id}`, 'neutral'),
            createToken(`태스크:${linkedTask.id}`, 'accent'),
            createToken(`아티팩트수:${taskArtifacts.length}`, 'neutral'),
            currentDeliverableArtifact
              ? createToken(`현재:${getArtifactTypeDisplay(currentDeliverableArtifact.type)}`, 'success')
              : createToken('현재:없음', 'warning'),
            latestArtifact ? createToken(`최근쓰기:${getArtifactTypeDisplay(latestArtifact.type)}`, 'neutral') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 결과 패킷',
              title: deliverablesLeft.currentTitle,
              copy: deliverablesLeft.currentCopy,
            },
            {
              label: '다음 인계',
              title: deliverablesLeft.nextTitle,
              copy: deliverablesLeft.nextCopy,
            },
            {
              label: '연결 근거',
              title: deliverablesLeft.reasonTitle,
              copy: deliverablesLeft.reasonCopy,
            },
          ],
        })}
        ${deliverablesEvidenceRail}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>상류 준비 패킷</strong>
            </div>
            <div class="token-row">
              ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
              ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
              ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
              ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
            </div>
            <p class="detail-copy">기획부터 사전 점검까지의 패킷 묶음이 이후 라이브 변경이나 리뷰 패킷이 올라오기 전까지 현재 상류 근거선으로 남습니다.</p>
          </section>
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>전달 패킷 선반</strong>
            </div>
            <div class="token-row">
              ${latestChangeSummaryArtifact ? createToken(`change-summary:${latestChangeSummaryArtifact.id}`, 'neutral') : createToken('change-summary:none', 'neutral')}
              ${latestPatchArtifact ? createToken(`patch:${latestPatchArtifact.id}`, 'neutral') : createToken('patch:none', 'neutral')}
              ${latestDiffArtifact ? createToken(`diff:${latestDiffArtifact.id}`, 'neutral') : createToken('diff:none', 'neutral')}
              ${latestReviewArtifact ? createToken(`review:${latestReviewArtifact.id}`, 'neutral') : createToken('review:none', 'neutral')}
              ${latestCommitPackageArtifact ? createToken(`commit-package:${latestCommitPackageArtifact.id}`, 'neutral') : ''}
              ${latestCommitResultArtifact ? createToken(`commit-result:${latestCommitResultArtifact.id}`, 'neutral') : ''}
              ${latestReleasePackageArtifact ? createToken(`release-package:${latestReleasePackageArtifact.id}`, 'neutral') : ''}
              ${latestCloseOutArtifact ? createToken(`close-out:${latestCloseOutArtifact.id}`, 'neutral') : ''}
            </div>
            <p class="detail-copy">
              ${
                latestChangeSummaryArtifact || latestReviewArtifact || latestCommitPackageArtifact || latestReleasePackageArtifact || latestCloseOutArtifact
                  ? '후속 패키지 아티팩트가 이미 존재하며, 새 실행 affordance를 추가하지 않고 전달 패킷 선반에서 계속 보입니다.'
                  : '아직 후속 변경/리뷰/커밋/릴리스/종료 정리 패키지가 없습니다. 현재 한정된 진행은 아직 그 이후 전달 선반 전에서 멈춰 있습니다.'
              }
            </p>
          </section>
        </div>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>승인 및 종료 데스크</h2>
            <p class="panel-copy">여기서는 리뷰 라인, 승인선, 종료 보고 경로를 먼저 봅니다.</p>
          </div>
        </div>
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '인계 판단판',
          heading: '현재 패킷 상태와 다음 인계선을 먼저 봅니다',
          copy: '오른쪽 패널은 결과 패킷보다 리뷰 라인, 승인선, 종료 보고 경로를 우선 보여 줍니다.',
          tokens: [
            createToken(
              `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
              deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral'),
            createToken(`리뷰:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus)),
            latestApproval
              ? createToken(`승인:${getApprovalStatusDisplay(latestApproval.status)}`, getApprovalTone(latestApproval.status))
              : createToken('승인:없음', 'neutral'),
            missionCompletionReady ? createToken('완료:봉인', 'success') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 패킷',
              title: deliverablesControl.currentTitle,
              copy: deliverablesControl.currentCopy,
            },
            {
              label: '다음',
              title: deliverablesControl.nextTitle,
              copy: deliverablesControl.nextCopy,
            },
            {
              label: '이유',
              title: deliverablesControl.reasonTitle,
              copy: deliverablesControl.reasonCopy,
            },
          ],
        })}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>리뷰 라인</strong>
            </div>
            <div class="token-row">
              ${createToken(`필수:${linkedTask.review?.required ? '예' : '아니오'}`, linkedTask.review?.required ? 'warning' : 'neutral')}
              ${createToken(`상태:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus))}
              ${createToken(`검증:${linkedTask.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
              ${latestReviewArtifact ? createToken(`아티팩트:${latestReviewArtifact.id}`, 'neutral') : createToken('아티팩트:없음', 'neutral')}
              ${
                reviewerState.summary.sourceBuilderRunId
                  ? createToken(`소스run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(latestReviewNote)}</p>
            ${reviewActionSignalRow}
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 리뷰어 실행
                    </button>
                  </div>
                  <p class="form-help">리뷰어 실행은 한정된 라이브 변경 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 커밋 패키지 준비
                    </button>
                  </div>
                  <p class="form-help">커밋 패키지 준비는 최신 리뷰어 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 커밋 게이트 승인
                    </button>
                  </div>
                  <p class="form-help">커밋 승인은 현재 커밋 패키지가 대기 승인을 열면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 로컬 커밋 실행
                    </button>
                  </div>
                  <p class="form-help">로컬 커밋은 현재 승인된 커밋 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 릴리스 패키지 준비
                    </button>
                  </div>
                  <p class="form-help">릴리스 패키지 준비는 최신 로컬 커밋 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 릴리스 게이트 승인
                    </button>
                  </div>
                  <p class="form-help">릴리스 승인은 현재 릴리스 패키지가 대기 승인을 열면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 종료 정리 실행
                    </button>
                  </div>
                  <p class="form-help">종료 정리는 현재 승인된 릴리스 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>승인 라인 현황</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${createToken(`대기:${approvalSummary.pending}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')}
              ${createToken(`승인:${approvalSummary.approved}`, approvalSummary.approved > 0 ? 'success' : 'neutral')}
              ${createToken(`반려:${approvalSummary.rejected}`, approvalSummary.rejected > 0 ? 'danger' : 'neutral')}
              ${
                latestApproval?.allowedNextAction
                  ? createToken(
                      `액션:${getApprovalActionLabel(latestApproval.allowedNextAction)}`,
                      'neutral',
                    )
                  : ''
              }
              ${
                latestApproval
                  ? createToken(`최신:${getApprovalStatusDisplay(latestApproval.status)}`, getApprovalTone(latestApproval.status))
                  : createToken('최신:없음', 'neutral')
              }
            </div>
            <p class="detail-copy">
              ${
                latestApproval
                  ? escapeHtml(
                      `${latestApproval.id}는 ${getApprovalActionLabel(latestApproval.allowedNextAction) || latestApproval.scope}에 대해 ${getApprovalStatusDisplay(latestApproval.status)} 상태이며, 대상은 ${latestApproval.targetArtifactId || '현재 한정된 아티팩트'}입니다.`,
                    )
                  : '이 미션에는 아직 승인 기록이 없습니다.'
              }
            </p>
            ${
              preferredInboxItem?.status === 'pending'
                ? `
                  <div class="token-row">
                    ${createToken(`결정함:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem))}
                    ${createToken(`종류:${preferredInboxItem.kind}`, 'neutral')}
                  </div>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>현재 승인 안건</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `승인:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('승인:없음', 'neutral')
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`대상:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`아티팩트:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `결정함:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>다음 인계선</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${approvalActionSignalRow}
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행
                    </button>
                  </div>
                  <p class="form-help">승인은 실행에서 처리합니다. 산출물은 요약만 남깁니다.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행에서 변경
                    </button>
                  </div>
                  <p class="form-help">빌더 게이트 승인 후 실행에서 시작합니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>종료 보고 데스크</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${createToken(`미션:${getMissionStatusDisplay(selectedMission.status)}`, getMissionStatusTone(selectedMission.status))}
              ${
                linkedTask
                  ? createToken(
                      `태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`,
                      linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                    )
                  : createToken('태스크:없음', 'warning')
              }
              ${
                missionCompletionReady
                  ? createToken('완료:봉인', 'success')
                  : createToken('완료:열림', 'warning')
              }
              ${
                missionCompletionArtifactId
                  ? createToken(`종료정리:${missionCompletionArtifactId}`, 'neutral')
                  : ''
              }
              ${
                closeOutState.summary.currentReleasePackageArtifactId
                  ? createToken(
                      `릴리스패키지:${closeOutState.summary.currentReleasePackageArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                missionCompletionReady
                  ? escapeHtml(
                      `현재 미션 상태: 태스크 ${linkedTask.id}의 한정된 전달은 종료 정리 아티팩트 ${missionCompletionArtifactId}로 봉인됐습니다.`,
                    )
                  : '현재 미션 상태: 한정된 전달은 아직 열려 있습니다. 미션이 완료에 도달하면 산출물이 종료 정리 번들을 이곳에 고정합니다.'
              }
            </p>
            <p class="detail-copy">
              <strong>다음 안전한 후속 단계</strong>: ${
                missionCompletionReady
                  ? '저장된 종료 정리 번들을 최종 한정 요약으로 보고, 다음 미션을 시작하거나 더 깊은 근거 확인이 필요하면 고급 운영 모드를 엽니다. 외부 전달은 여전히 비활성입니다.'
                  : '실행에서 현재 한정된 경로를 계속 전진합니다. 종료 정리 번들이 저장되기 전까지 이 표면은 요약 전용으로 남습니다.'
              }
            </p>
            ${closeOutActionSignalRow}
            ${
              missionCompletionReady
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      미션으로 이동해 다음 사이클 시작
                    </button>
                  </div>
                  <p class="form-help">다음 사이클은 미션에서 시작합니다. 실행을 다시 열지 않고 다음 초안을 준비합니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>관제실 직행</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
            </div>
            <p class="detail-copy">${escapeHtml(opsEntryHelperCopy)}</p>
            ${opsActionSignalRow}
            ${opsEntrySignalRow}
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
                data-action="open-advanced-ops"
                data-id="${escapeHtml(selectedMission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                관제실
              </button>
            </div>
          </section>
        </div>
      </aside>
      </div>
    </div>
  `;
}

function renderTaskboard(data) {
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const focusedTask = selectedTask || data.tasks[0] || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const createDisabled = !data.activeProject || state.loading || state.mutating;
  const bootstrapPanel = renderProjectBootstrapPanel(data);
  const pendingApprovals = data.approvals.filter((approval) => approval.status === 'pending');
  const pendingInboxItems = data.inboxItems.filter((item) => item.status === 'pending');
  const focusedTaskArtifacts = focusedTask ? getTaskArtifacts(focusedTask.id, data.artifacts).sort(sortByCreatedDesc) : [];
  const focusedTaskLatestArtifact = focusedTaskArtifacts[0] || null;
  const focusedTaskLatestRun = focusedTask?.latestRunId ? data.runMap.get(focusedTask.latestRunId) || null : null;
  const focusedTaskPreferredInboxItem = focusedTask ? getPreferredTaskInboxItem(focusedTask.id, data) : null;
  const taskboardEvidenceState = getExecutionEvidenceRail(focusedTask, data);
  const focusedTaskSnapshot = getTaskboardTaskSnapshot(focusedTask, data);
  const taskboardImmediateCard =
    pendingApprovals.length > 0
      ? {
          title: `결재함에서 승인 ${pendingApprovals.length}건 처리`,
          copy: '사람 승인이 남아 있어 지금은 결재함을 먼저 여는 편이 가장 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
          tone: 'accent',
        }
      : pendingInboxItems.length > 0
        ? {
            title: `결재함에서 확인 ${pendingInboxItems.length}건 처리`,
            copy: '결정이나 확인이 남아 있어 지금은 결재함에서 현재 안건을 먼저 정리합니다.',
            button: {
              action: 'open-surface',
              label: '결재함',
              targetSurface: 'decision-inbox',
              disabled: state.loading || state.mutating,
            },
            tone: 'warning',
          }
        : focusedTask
          ? {
              title: `${focusedTask.title} 상세 보기`,
              copy: focusedTaskSnapshot.nextCopy,
              button: {
                action: 'open-taskboard-task',
                id: focusedTask.id,
                label: '선택 셀 고정',
                disabled: state.loading || state.mutating,
              },
              tone: 'neutral',
            }
          : {
              title: '첫 실행 셀 추가',
              copy: '왼쪽에서 첫 실행 셀을 추가하면 오른쪽 상세 판단이 바로 열립니다.',
              button: null,
              tone: 'warning',
            };
  const taskboardViewportStrip = renderViewportHandoffStrip({
    eyebrow: '작업 인계선',
    heading: '작업판 아래는 레인과 상세 판단으로 나눕니다',
    copy:
      '왼쪽은 실행 셀 목록과 빠른 추가를 맡고, 오른쪽은 선택된 셀의 상태와 다음 실행만 먼저 보여 줍니다.',
    tokens: [
      createToken(
        `현재:${taskboardEvidenceState.currentOwnerLabel}`,
        taskboardEvidenceState.blockedReason ? 'danger' : 'accent',
      ),
      createToken(`다음:${taskboardEvidenceState.nextHandoffLabel}`, 'neutral'),
      data.activeProject
        ? createToken(`프로젝트:${data.activeProject.name}`, 'success')
        : createToken('프로젝트:선택 필요', 'warning'),
      createToken(`실행셀:${data.tasks.length}`, data.tasks.length > 0 ? 'neutral' : 'warning'),
      createToken(
        `바로:${pendingApprovals.length > 0 || pendingInboxItems.length > 0 ? '결재함' : '작업판 상세'}`,
        taskboardImmediateCard.tone,
      ),
    ],
    cards: [
      {
        label: '왼쪽 레인',
        title: '실행 셀 목록 + 빠른 추가',
        copy: '레인에서 셀을 고르고, 바로 아래 접수 폼에서 새 셀을 추가합니다.',
      },
      {
        label: '오른쪽 상세',
        title: focusedTask ? '현재 상태 + 다음 실행' : '선택 셀 대기',
        copy: focusedTask
          ? '선택된 셀의 보류 이유, 다음 실행, 근거는 오른쪽 상세에서 이어 봅니다.'
          : '실행 셀을 하나 고르면 오른쪽 판단선이 바로 열립니다.',
      },
      {
        label: '바로',
        title: taskboardImmediateCard.title,
        copy: taskboardImmediateCard.copy,
        emphasis: true,
        button: taskboardImmediateCard.button,
      },
    ],
  });
  const taskboardOpsEntrySignals = [
    {
      surface: 'taskboard',
      label: '작업판',
      status: focusedTask ? getTaskLifecycleDisplay(focusedTask.lifecycleState) : '셀 없음',
      tone: focusedTask ? getTaskLifecycleTone(focusedTask.lifecycleState) : 'warning',
    },
    {
      surface: 'logs',
      label: '로그',
      status: focusedTaskLatestRun ? getRunStatusDisplay(focusedTaskLatestRun.status) : 'run 없음',
      tone: focusedTaskLatestRun ? getRunTone(focusedTaskLatestRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: focusedTaskLatestArtifact ? getArtifactTypeDisplay(focusedTaskLatestArtifact.type) : '증적 없음',
      tone:
        focusedTaskLatestArtifact?.type === 'close-out'
          ? 'success'
          : focusedTaskLatestArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: focusedTaskPreferredInboxItem
        ? `${getInboxKindDisplay(focusedTaskPreferredInboxItem.kind)} ${getInboxStatusDisplay(focusedTaskPreferredInboxItem.status)}`
        : pendingApprovals.length > 0
          ? `승인 ${pendingApprovals.length}건`
          : pendingInboxItems.length > 0
            ? `확인 ${pendingInboxItems.length}건`
            : '대기 없음',
      tone: focusedTaskPreferredInboxItem
        ? getInboxTone(focusedTaskPreferredInboxItem)
        : pendingApprovals.length > 0
          ? 'accent'
          : pendingInboxItems.length > 0
            ? 'warning'
            : 'success',
    },
  ];
  const taskboardOpsEntrySignalRow = renderTaskboardOpsEntrySignalRow(taskboardOpsEntrySignals);
  const taskboardDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 실행 셀만 세 칸으로 요약하는 작업판',
    copy: '아래 deck은 현재 셀 판단만 먼저 남기고, 새 셀 추가는 바로 아래 접수 폼으로 넘깁니다.',
    tokens: [
      data.activeProject
        ? createToken(`프로젝트:${data.activeProject.name}`, 'success')
        : createToken('프로젝트:선택 필요', 'warning'),
      createToken(`실행셀:${data.tasks.length}`, data.tasks.length > 0 ? 'neutral' : 'warning'),
      createToken(`대기승인:${pendingApprovals.length}`, pendingApprovals.length > 0 ? 'accent' : 'neutral'),
    ],
    signalRow: taskboardOpsEntrySignalRow,
    cards: [
      {
        label: '현재 셀',
        title: focusedTask ? focusedTask.title : '실행 셀 대기',
        copy: focusedTaskSnapshot.currentCopy,
      },
      {
        label: '다음 행동',
        title: focusedTask ? focusedTaskSnapshot.nextCopy.replace('다음: ', '') : '새 실행 셀 추가',
        copy: focusedTaskSnapshot.nextCopy,
      },
      {
        label: '승인선',
        title:
          pendingApprovals.length > 0
            ? `${pendingApprovals.length}건 승인 대기`
            : pendingInboxItems.length > 0
              ? `${pendingInboxItems.length}건 확인 대기`
              : '현재 승인 대기 없음',
        copy:
          pendingApprovals.length > 0
            ? '사람 승인이 필요한 안건이 남아 있습니다.'
            : pendingInboxItems.length > 0
              ? '결정 또는 확인이 필요한 안건이 남아 있습니다.'
              : '지금 바로 막힌 승인선은 없습니다.',
      },
    ],
  });

  const lanes = groupTasksByLifecycle(data.tasks)
    .map(([laneName, tasks]) => {
      const cards = tasks.length
        ? tasks
            .map((task) => {
              const approvalSummary = getTaskApprovalSummary(task, data.approvals);
              const decisionSummary = getTaskDecisionSummary(task, data.inboxItems);
              const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
              const taskSnapshot = getTaskboardTaskSnapshot(task, data);

              return `
                <article class="card taskboard-task-card ${task.id === selectedTask?.id ? 'is-selected' : ''}">
                  <button class="card-button" type="button" data-action="select-task" data-id="${escapeHtml(task.id)}">
                    <div class="card-title-row taskboard-task-head">
                      <h4 class="card-title">${escapeHtml(task.title)}</h4>
                      <div class="token-row token-row-compact">
                        ${createToken(getTaskLifecycleDisplay(task.lifecycleState), 'neutral')}
                      </div>
                    </div>
                    <div class="taskboard-task-register">
                      <div class="taskboard-task-section">
                        <p class="ops-list-label">실행 등록</p>
                        <p class="card-copy detail-copy-compact taskboard-task-intent">${escapeHtml(task.intent || '기록된 의도가 없습니다.')}</p>
                      </div>
                      <div class="taskboard-task-section">
                        <p class="ops-list-label">현재 상태</p>
                        <p class="card-copy detail-copy-compact taskboard-task-summary">${escapeHtml(taskSnapshot.currentCopy)}</p>
                      </div>
                    </div>
                    <div class="taskboard-task-foot">
                      <div class="token-row token-row-compact">
                        ${taskSnapshot.tokens.join('')}
                        ${task.flags?.blocked ? createToken('차단', 'danger') : ''}
                        ${task.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                        ${task.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                        ${
                          approvalSummary.total > 0
                            ? createToken(`승인선:${approvalSummary.pending}/${approvalSummary.total}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')
                            : ''
                        }
                        ${
                          decisionSummary.pendingTotal > 0
                            ? createToken(`결재함:${decisionSummary.pendingTotal}`, 'warning')
                            : ''
                        }
                      </div>
                      <div class="taskboard-task-next-block">
                        <p class="ops-list-label">다음 처리</p>
                        <p class="card-copy detail-copy-compact taskboard-task-next">${escapeHtml(taskSnapshot.nextCopy)}</p>
                      </div>
                    </div>
                  </button>
                </article>
              `;
            })
            .join('')
        : `
            <div class="empty-state">
              <strong>태스크 없음</strong>
              <p>이 라이프사이클 레인은 비어 있습니다.</p>
            </div>
          `;

      return `
        <section class="lane">
          <div class="lane-header">
            <h3>${escapeHtml(getTaskLifecycleDisplay(laneName))}</h3>
            <span class="lane-count">${tasks.length}</span>
          </div>
          <div class="stack">${cards}</div>
        </section>
      `;
    })
    .join('');

  const detail = renderTaskDetail(selectedTask, data);

  elements.surfaces.taskboard.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        ${taskboardViewportStrip}
        ${taskboardDeck}
        ${renderHarnessBriefRegister(harnessBrief)}
        ${bootstrapPanel}
        ${
          data.activeProject
            ? `
              <form class="task-create-form task-create-form-compact taskboard-order-desk" data-form="create-task">
                <div class="taskboard-order-head">
                  <div class="stack">
                    <strong>새 실행 셀</strong>
                    <p class="detail-copy detail-copy-compact">여기서는 새 셀만 빠르게 추가합니다. 현재 상태 판단은 위 카드에서 끝냅니다.</p>
                  </div>
                  <div class="token-row token-row-compact">
                    ${createToken('제목만으로 시작', 'accent')}
                    ${createToken('의도는 선택', 'neutral')}
                  </div>
                </div>
                <div class="field-grid field-grid-compact">
                  <label class="field field-compact">
                    <span class="field-label">제목</span>
                    <input
                      type="text"
                      name="title"
                      value="${escapeHtml(state.taskDraftTitle)}"
                      placeholder="얇은 슬라이스 태스크 제목"
                      ${createDisabled ? 'disabled' : ''}
                    >
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">의도</span>
                    <textarea
                      name="intent"
                      rows="2"
                      placeholder="선택 사항: 원하는 결과나 경계만 짧게 적으세요"
                      ${createDisabled ? 'disabled' : ''}
                    >${escapeHtml(state.taskDraftIntent)}</textarea>
                  </label>
                </div>
                <div class="form-actions form-actions-inline form-actions-compact taskboard-order-actions">
                  <button class="primary-button" type="submit" ${createDisabled ? 'disabled' : ''}>실행 셀 추가</button>
                  <p class="form-help">${escapeHtml(data.activeProject.name)}에 바로 추가하고, 세부 제어는 선택된 셀 상세에서 이어갑니다.</p>
                </div>
              </form>
            `
            : ''
        }
        ${
          !data.activeProject
            ? `
              <div class="empty-state">
                <strong>활성 프로젝트 없음</strong>
                <p>첫 태스크를 만들기 전에 위에서 프로젝트를 등록하거나 고릅니다.</p>
              </div>
            `
            : data.tasks.length > 0
            ? `<div class="lane-grid">${lanes}</div>`
            : `
              <div class="empty-state">
                <strong>아직 태스크 없음</strong>
                <p>활성 프로젝트는 준비됐습니다. 첫 실행 셀을 추가하면 바로 작업판 흐름이 시작됩니다.</p>
              </div>
            `
        }
      </section>
      ${detail}
    </div>
  `;
}

function renderTaskDetail(task, data) {
  if (!task) {
    return `
      <aside class="detail-card">
        <h2>태스크 상세</h2>
        <div class="empty-state">
          <strong>선택된 태스크 없음</strong>
          <p>태스크 카드를 골라 run, 아티팩트, 리뷰, 결정 상태를 확인합니다.</p>
        </div>
      </aside>
    `;
  }

  const taskRuns = getTaskRuns(task.id, data.runs);
  const taskArtifacts = getTaskArtifacts(task.id, data.artifacts);
  const taskApprovals = getTaskApprovals(task.id, data.approvals);
  const taskInboxItems = getTaskInboxItems(task.id, data.inboxItems);
  const pendingTaskApprovals = taskApprovals.filter((approval) => approval.status === 'pending');
  const pendingTaskInboxItems = taskInboxItems.filter((item) => item.status === 'pending');
  const preferredTaskInboxItem = getPreferredTaskInboxItem(task.id, data);
  const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
  const plannerState = getPlannerAvailability(task, data);
  const architectState = getArchitectAvailability(task, data);
  const taskBreakerState = getTaskBreakerAvailability(task, data);
  const builderPreflightState = getBuilderPreflightAvailability(task, data);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const executionGateReason = getDevelopmentPackExecutionGateReason(task, data);
  const latestBreakdownDetail =
    state.selectedTaskBreakdownArtifact?.id === latestBreakdownArtifact?.id
      ? state.selectedTaskBreakdownArtifact
      : null;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedBreakdown = latestBreakdownDetail
    ? parseBreakdownArtifact(latestBreakdownDetail.content)
    : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const detectedWorktreeOptions =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.options || []
      : [];
  const worktreeDetectionNotice =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.notice
      : null;
  const currentWorktreeOption = task.worktreeRef
    ? detectedWorktreeOptions.find((option) => option.path === task.worktreeRef) || null
    : null;
  const worktreeRelation = buildTaskWorktreeRelation(task, {
    ...activeProjectLinkedWorktrees,
    options: detectedWorktreeOptions,
  });
  const selectedWorktreeOptionValue =
    currentWorktreeOption?.path || detectedWorktreeOptions[0]?.path || '';
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const preselectedPendingItem =
    selectedInboxItem?.taskId === task.id && selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const plannerDisabled = plannerState.disabled;
  const architectDisabled = architectState.disabled;
  const taskBreakerDisabled = taskBreakerState.disabled;
  const builderPreflightDisabled = builderPreflightState.disabled;
  const plannerBlockedReason = getPrimaryBlockedReason(
    plannerState.reasons,
    'planner readiness unavailable',
  );
  const architectBlockedReason = getPrimaryBlockedReason(
    architectState.reasons,
    'architect readiness unavailable',
  );
  const taskBreakerBlockedReason = getPrimaryBlockedReason(
    taskBreakerState.reasons,
    'task-breaker readiness unavailable',
  );
  const builderPreflightBlockedReason = getPrimaryBlockedReason(
    builderPreflightState.reasons,
    'builder preflight readiness unavailable',
  );
  const worktreeApplyDisabled =
    state.loading ||
    state.mutating ||
    detectedWorktreeOptions.length === 0;
  const worktreeClearDisabled = state.loading || state.mutating || !task.worktreeRef;
  const reviewerState = getReviewerAvailability(task, data);
  const commitPackageState = getCommitPackageAvailability(task, data);
  const commitExecutionState = getCommitExecutionAvailability(task, data);
  const releasePackageState = getReleasePackageAvailability(task, data);
  const closeOutState = getCloseOutAvailability(task, data);
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';
  const taskDetailEvidenceState = getExecutionEvidenceRail(task, data);
  const taskSnapshot = getTaskboardTaskSnapshot(task, data);
  const pendingTaskApproval = pendingTaskApprovals[0] || null;
  const pendingTaskDecision = pendingTaskInboxItems[0] || null;
  const latestTaskArtifact = taskArtifacts[0] || null;
  const taskboardDetailSignalRow = renderTaskboardOpsEntrySignalRow([
    {
      surface: 'taskboard',
      label: '작업판',
      status: getTaskLifecycleDisplay(task.lifecycleState),
      tone: getTaskLifecycleTone(task.lifecycleState),
    },
    {
      surface: 'logs',
      label: '로그',
      status: latestRun ? getRunStatusDisplay(latestRun.status) : 'run 없음',
      tone: latestRun ? getRunTone(latestRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: latestTaskArtifact ? getArtifactTypeDisplay(latestTaskArtifact.type) : '증적 없음',
      tone:
        latestTaskArtifact?.type === 'close-out'
          ? 'success'
          : latestTaskArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: preferredTaskInboxItem
        ? `${getInboxKindDisplay(preferredTaskInboxItem.kind)} ${getInboxStatusDisplay(preferredTaskInboxItem.status)}`
        : pendingTaskApprovals.length > 0
          ? `승인 ${pendingTaskApprovals.length}건`
          : pendingTaskInboxItems.length > 0
            ? `확인 ${pendingTaskInboxItems.length}건`
            : '대기 없음',
      tone: preferredTaskInboxItem
        ? getInboxTone(preferredTaskInboxItem)
        : pendingTaskApprovals.length > 0
          ? 'accent'
          : pendingTaskInboxItems.length > 0
            ? 'warning'
            : 'success',
    },
  ]);
  const detailHoldTitle = task.flags?.waitingApproval
    ? '승인선 대기'
    : task.flags?.waitingDecision
      ? '결정 대기'
      : executionGateReason || task.flags?.blocked
        ? '차단 상태'
        : '보류 없음';
  const detailHoldCopy = task.flags?.waitingApproval
    ? `${getApprovalActionLabel(pendingTaskApproval?.allowedNextAction) || '현재 승인'} 안건이 아직 승인 대기입니다.`
    : task.flags?.waitingDecision
      ? `${pendingTaskDecision?.title || '현재 결정'} 처리가 남아 있습니다.`
      : executionGateReason
        ? executionGateReason
        : task.flags?.blocked
        ? [
            builderPreflightBlockedReason,
            reviewerState.reasons?.[0],
            commitPackageState.summary.reasons?.[0],
            commitExecutionState.summary.reasons?.[0],
            releasePackageState.summary.reasons?.[0],
            closeOutState.summary.reasons?.[0],
          ].find(Boolean) || '현재 차단 사유를 아래 상세에서 확인합니다.'
        : '현재 보류 사유는 없습니다.';
  let detailNextTitle = '세부 실행 확인';
  let detailNextCopy = '아래 상세 블록에서 현재 단계 제어와 근거를 이어서 확인합니다.';

  if (task.flags?.waitingApproval) {
    detailNextTitle = '승인 처리';
    detailNextCopy = '결재함이나 승인 패널에서 현재 승인선을 먼저 처리합니다.';
  } else if (task.flags?.waitingDecision) {
    detailNextTitle = '결정 처리';
    detailNextCopy = '결재함에서 현재 결정을 먼저 처리합니다.';
  } else if (closeOutState.summary.allowed) {
    detailNextTitle = '종료 정리';
    detailNextCopy = '종료 정리를 이어가며 안건 종료 보고를 닫을 수 있습니다.';
  } else if (releasePackageState.summary.allowed) {
    detailNextTitle = '릴리스 패키지';
    detailNextCopy = '릴리스 패키지를 준비하고 다음 승인선을 확인합니다.';
  } else if (commitExecutionState.summary.allowed) {
    detailNextTitle = '로컬 커밋';
    detailNextCopy = '승인된 커밋 패키지 기준으로 로컬 커밋을 이어갈 수 있습니다.';
  } else if (commitPackageState.summary.allowed) {
    detailNextTitle = '커밋 패키지';
    detailNextCopy = '리뷰 통과 이후 커밋 패키지를 준비할 수 있습니다.';
  } else if (reviewerState.summary.allowed) {
    detailNextTitle = '리뷰어 실행';
    detailNextCopy = '최신 변경 번들을 점검해 리뷰 보고를 남길 수 있습니다.';
  } else if (!latestPlanArtifact) {
    detailNextTitle = '플래너 실행';
    detailNextCopy = '첫 계획을 만들며 실행 셀의 시작점을 엽니다.';
  } else if (!latestArchitectureArtifact) {
    detailNextTitle = '설계 실행';
    detailNextCopy = '현재 계획 위에 설계 방향을 확정합니다.';
  } else if (!latestBreakdownArtifact) {
    detailNextTitle = '태스크 분해';
    detailNextCopy = '설계 이후 첫 실행 단위로 태스크를 자릅니다.';
  } else if (!latestPreflightArtifact) {
    detailNextTitle = '실행 준비 패킷';
    detailNextCopy = '실행 전 프리플라이트를 먼저 남겨 다음 승인선을 엽니다.';
  }

  return `
    <aside class="detail-card">
      <div>
        <p class="eyebrow">태스크 상세</p>
        <h2>${escapeHtml(task.title)}</h2>
      </div>
      ${renderNarrativeDeck({
        eyebrow: '작업판 판단 요약',
        heading: '현재 상태와 다음 실행을 먼저 보는 상세',
        copy: task.intent || '기록된 의도가 없으면 현재 상태와 다음 실행만 먼저 확인합니다.',
        tokens: [
          createToken(
            `현재:${taskDetailEvidenceState.currentOwnerLabel}`,
            taskDetailEvidenceState.blockedReason ? 'danger' : 'accent',
          ),
          createToken(`다음:${taskDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
          createToken(getTaskLifecycleDisplay(task.lifecycleState), 'neutral'),
          ...taskSnapshot.tokens,
          task.flags?.blocked ? createToken('차단', 'danger') : '',
          !task.flags?.blocked && executionGateReason ? createToken('실행차단', 'danger') : '',
          task.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
          task.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
        ].filter(Boolean),
        cards: [
          {
            label: '현재 상태',
            title: getTaskLifecycleDisplay(task.lifecycleState),
            copy: taskSnapshot.currentCopy,
          },
          {
            label: '막힌 이유',
            title: detailHoldTitle,
            copy: detailHoldCopy,
          },
          {
            label: '다음 실행',
            title: detailNextTitle,
            copy: detailNextCopy,
          },
        ],
        wide: false,
      })}

      <div class="detail-block">
        <div class="kv-grid">
          <div class="kv-item">
            <p class="detail-key">최신 실행 기록</p>
            <strong>${escapeHtml(latestRun?.id || '아직 없음')}</strong>
            <p class="detail-copy">${latestRun ? `${escapeHtml(getRunStatusDisplay(latestRun.status))} · ${escapeHtml(formatDate(latestRun.startedAt))}` : '아직 실행 기록이 없습니다.'}</p>
          </div>
          <div class="kv-item">
            <p class="detail-key">워크트리</p>
            <strong>${escapeHtml(task.worktreeRef || '아직 연결 안 됨')}</strong>
            <p class="detail-copy">${
              currentWorktreeOption
                ? escapeHtml(formatWorktreeOptionLabel(currentWorktreeOption))
                : task.worktreeRef
                  ? '저장된 워크트리 경로가 현재 탐지된 연결 워크트리 목록 밖에 있습니다.'
                  : '아직 저장된 워크트리 경로가 없습니다.'
            }</p>
          </div>
        </div>
        <div class="taskboard-detail-signal-row">${taskboardDetailSignalRow}</div>
        <div class="relation-strip">
          <div class="card-title-row">
            <strong>저장된 워크트리 경로와 현재 프로젝트 경로</strong>
            ${createToken(worktreeRelation.label, worktreeRelation.tone)}
          </div>
          <p class="detail-copy">${escapeHtml(worktreeRelation.copy)}</p>
          ${
            worktreeRelation.switchOption
              ? `
                <div class="relation-button-row">
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="switch-active-project-worktree"
                    data-path="${escapeHtml(worktreeRelation.switchOption.path)}"
                    ${state.loading || state.mutating ? 'disabled' : ''}
                >
                    활성 프로젝트 전환
                  </button>
                </div>
              `
              : ''
          }
        </div>
        <label class="field">
          <span class="field-label">탐지된 연결 워크트리</span>
          <select id="task-worktree-select" ${worktreeApplyDisabled ? 'disabled' : ''}>
            ${
              detectedWorktreeOptions.length > 0
                ? detectedWorktreeOptions
                    .map(
                      (option) => `
                        <option value="${escapeHtml(option.path)}" ${
                          option.path === selectedWorktreeOptionValue ? 'selected' : ''
                        }>
                          ${escapeHtml(formatWorktreeOptionLabel(option))}
                        </option>
                      `,
                    )
                    .join('')
                : '<option value="">탐지된 연결 워크트리 없음</option>'
            }
          </select>
        </label>
        <div class="form-actions form-actions-inline">
          <button
            class="secondary-button"
            type="button"
            data-action="set-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeApplyDisabled ? 'disabled' : ''}
          >
            워크트리 적용
          </button>
          <button
            class="secondary-button"
            type="button"
            data-action="clear-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeClearDisabled ? 'disabled' : ''}
          >
            워크트리 지우기
          </button>
        </div>
        ${
          worktreeDetectionNotice
            ? `<p class="detail-copy">${escapeHtml(worktreeDetectionNotice)}</p>`
            : detectedWorktreeOptions.length > 0
              ? '<p class="form-help">저장된 워크트리 경로만 바꿉니다. 릴리스 패키지와 종료 정리는 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다.</p>'
              : '<p class="detail-copy">현재 프로젝트 경로에서 탐지된 연결 워크트리가 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">역할 run</p>
        <div class="token-row">
          ${
            latestPlanArtifact
              ? createToken(`plan:${latestPlanArtifact.id}`, 'success')
              : createToken('plan:missing', 'warning')
          }
          ${
            latestArchitectureArtifact
              ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success')
              : createToken('architecture:missing', 'warning')
          }
          ${
            latestBreakdownArtifact
              ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral')
              : createToken('breakdown:none', 'neutral')
          }
          ${
            latestPreflightArtifact
              ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral')
              : createToken('preflight:none', 'neutral')
          }
          ${
            taskBreakerState.pendingBlockingDecisionItemIds.length > 0
              ? createToken(
                  `차단결정:${taskBreakerState.pendingBlockingDecisionItemIds.length}`,
                  'danger',
                )
              : ''
          }
          ${
            taskBreakerState.pendingApprovalIds.length > 0
              ? createToken(`대기승인:${taskBreakerState.pendingApprovalIds.length}`, 'accent')
              : ''
          }
        </div>
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-planner"
            data-id="${escapeHtml(task.id)}"
            ${plannerDisabled ? 'disabled' : ''}
          >
            플래너 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-architect"
            data-id="${escapeHtml(task.id)}"
            ${architectDisabled ? 'disabled' : ''}
          >
            설계 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-task-breaker"
            data-id="${escapeHtml(task.id)}"
            ${taskBreakerDisabled ? 'disabled' : ''}
          >
            태스크 분해 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-builder-preflight"
            data-id="${escapeHtml(task.id)}"
            ${builderPreflightDisabled ? 'disabled' : ''}
          >
            빌더 프리플라이트 실행
          </button>
          <p class="form-help">
            ${
              plannerDisabled
                ? `플래너는 ${escapeHtml(plannerBlockedReason)} 전까지 비활성입니다.`
                : '플래너는 현재 안건 범위를 계획 아티팩트로 정리하고 설계 실행을 다음 단계로 남깁니다.'
            }
          </p>
          <p class="form-help">
            ${
              architectDisabled
                ? `설계 실행은 ${escapeHtml(architectBlockedReason)} 전까지 비활성입니다.`
                : `설계 실행은 ${escapeHtml(architectState.latestPlanArtifact?.id || '최신 계획 아티팩트')}를 읽고 설계 아티팩트를 남긴 뒤 태스크 분해로 넘깁니다.`
            }
          </p>
          <p class="form-help">
            ${
              taskBreakerDisabled
                ? `태스크 분해는 ${escapeHtml(taskBreakerBlockedReason)} 전까지 비활성입니다.`
                : `태스크 분해는 ${escapeHtml(latestPlanArtifact?.id || '최신 계획 아티팩트')}와 ${escapeHtml(latestArchitectureArtifact?.id || '최신 설계 아티팩트')}를 읽고 분해 아티팩트를 쓴 뒤, 아티팩트 화면을 벗어나지 않은 채 차단 결정함 항목만 미리 고릅니다.`
            }
          </p>
          <p class="form-help">
            ${
              builderPreflightDisabled
                ? `빌더 프리플라이트는 ${escapeHtml(builderPreflightBlockedReason)} 전까지 비활성입니다.`
                : `빌더 프리플라이트는 ${escapeHtml(builderPreflightState.latestPlanArtifact?.id || '최신 계획 아티팩트')}, ${escapeHtml(builderPreflightState.latestArchitectureArtifact?.id || '최신 설계 아티팩트')}, ${escapeHtml(builderPreflightState.latestBreakdownArtifact?.id || '최신 분해 아티팩트')}를 읽고 쓰기 없는 프리플라이트 아티팩트를 남긴 뒤 리뷰어를 명시적 후속 단계로 남깁니다.`
            }
          </p>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">생성된 하위 작업</p>
        ${
          latestBreakdownArtifact && parsedBreakdown
            ? `
              <div class="token-row">
                ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                ${createToken('파생 뷰', 'neutral')}
                ${
                  preselectedPendingItem
                    ? createToken(`선택된 결정함:${preselectedPendingItem.id}`, 'warning')
                    : ''
                }
              </div>
              <p class="detail-copy">최신 breakdown 아티팩트를 가능한 범위에서 파싱했습니다. 원문 마크다운은 아티팩트 표면에 그대로 남습니다.</p>
              ${renderStructuredBreakdown(parsedBreakdown, {
                includeExecutionBoundary: false,
                includeExpectedArtifacts: false,
                includeStopConditions: false,
              })}
            `
            : latestBreakdownArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                  ${createToken('원문 대체만 가능', 'warning')}
                </div>
                <p class="detail-copy">최신 breakdown 아티팩트를 구조화하지 못했습니다. 전체 내용은 아티팩트 표면의 원문 마크다운에서 확인합니다.</p>
              `
              : '<p class="detail-copy">아직 breakdown 아티팩트가 없습니다. 계획과 설계 아티팩트가 준비된 뒤 태스크 분해를 실행합니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">최신 빌더 프리플라이트</p>
        ${
          latestPreflightArtifact && parsedPreflight
            ? `
              <div class="token-row">
                ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                ${createToken('간결 요약', 'neutral')}
                ${createToken(`대상파일:${parsedPreflight.targetFiles.length}`, 'neutral')}
                ${createToken(`위험:${parsedPreflight.risks.length}`, parsedPreflight.risks.length > 0 ? 'warning' : 'success')}
              </div>
              <p class="detail-copy">가능한 범위의 간결 요약만 제공합니다. 전체 구조화 미리보기와 원문 마크다운은 아티팩트 표면에서 확인합니다.</p>
              ${renderCompactList('대상 파일', parsedPreflight.targetFiles)}
              ${renderCompactList('위험 요소', parsedPreflight.risks)}
              ${renderCompactList('검증 계획', parsedPreflight.verificationPlan)}
              ${renderBuilderLiveMutationApprovalPanel(task, data)}
            `
            : latestPreflightArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                  ${createToken('원문 대체만 가능', 'warning')}
                </div>
                <p class="detail-copy">구조화 파싱에 실패했습니다. 원문 마크다운 대체는 아티팩트 표면에서 확인합니다.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
            : `
                <p class="detail-copy">아직 빌더 프리플라이트 아티팩트가 없습니다. 계획, 설계, 분해 아티팩트가 준비된 뒤 빌더 프리플라이트를 실행합니다.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
        }
        ${
          showBuilderApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 동작은 현재 화면에서 처리하고, 서버 상태 요약을 그대로 따릅니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">리뷰</p>
        <div class="pill-list">
          ${createToken(`필수:${task.review?.required ? '예' : '아니오'}`, task.review?.required ? 'warning' : 'neutral')}
          ${createToken(`상태:${getReviewStatusDisplay(task.review?.status || 'pending')}`, getReviewTone(task.review?.status))}
          ${createToken(`검증:${task.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
          ${
            reviewerState.summary.sourceBuilderRunId
              ? createToken(`소스run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
              : ''
          }
        </div>
        <p class="detail-copy">${escapeHtml(task.review?.resolution?.note || '기록된 리뷰 해결 메모가 없습니다.')}</p>
        <div class="guard-summary">
          <div class="token-row">
            ${
              reviewerState.summary.allowed
                ? createToken('리뷰어:준비됨', 'success')
                : createToken('리뷰어:차단', 'warning')
            }
            ${
              reviewerState.summary.preflightArtifactId
                ? createToken(`preflight:${reviewerState.summary.preflightArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.changeSummaryArtifactId
                ? createToken(`change-summary:${reviewerState.summary.changeSummaryArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.patchArtifactId
                ? createToken(`patch:${reviewerState.summary.patchArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.diffArtifactId
                ? createToken(`diff:${reviewerState.summary.diffArtifactId}`, 'neutral')
                : ''
            }
          ${
            reviewerState.summary.existingReviewerRunId
              ? createToken(`기존리뷰어:${reviewerState.summary.existingReviewerRunId}`, 'warning')
              : ''
          }
        </div>
        ${
          reviewerState.reasons.length > 0
            ? renderReasonList('리뷰어 비활성 사유', reviewerState.reasons)
            : '<p class="detail-copy">리뷰어는 새 코드 변경 없이 최신 빌더 라이브 변경 번들을 점검할 수 있습니다.</p>'
        }
        <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-reviewer"
            data-id="${escapeHtml(task.id)}"
            ${reviewerState.disabled ? 'disabled' : ''}
          >
            리뷰어 실행
          </button>
          <p class="form-help">
            ${
              reviewerState.disabled
                ? `리뷰어 실행은 ${escapeHtml(reviewerState.reasons.join('; '))} 전까지 비활성 상태입니다.`
                : `리뷰어 실행은 빌더 실행 기록 ${escapeHtml(reviewerState.summary.sourceBuilderRunId)}을 읽고 커밋이나 릴리스 없이 최종 리뷰 아티팩트를 기록합니다.`
            }
          </p>
        </div>
      </div>
    </div>

    <div class="detail-block">
      <p class="detail-key">커밋 패키지</p>
      <div class="pill-list">
        ${createToken(
          `준비:${commitPackageState.summary.allowed ? '예' : '아니오'}`,
          commitPackageState.summary.allowed ? 'success' : 'warning',
        )}
        ${createToken(
          `커밋승인:${getApprovalStatusDisplay(getCommitApprovalDisplayStatus(commitPackageState.summary))}`,
          getApprovalDisplayTone(getCommitApprovalDisplayStatus(commitPackageState.summary)),
        )}
        ${
          commitPackageState.summary.currentCommitPackageArtifactId
            ? createToken(
                `현재패키지:${commitPackageState.summary.currentCommitPackageArtifactId}`,
                'neutral',
              )
            : ''
          }
        </div>
        ${renderCommitPackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showCommitApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 액션은 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">릴리스 패키지</p>
        ${renderReleasePackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showReleaseApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 액션은 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다. 푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">종료 정리</p>
        <div class="pill-list">
          ${createToken(
            `준비:${closeOutState.summary.allowed ? '예' : '아니오'}`,
            closeOutState.summary.allowed ? 'success' : 'warning',
          )}
          ${createToken(
            `릴리스승인:${getApprovalStatusDisplay(getCloseOutApprovalDisplayStatus(closeOutState.summary))}`,
            getApprovalDisplayTone(getCloseOutApprovalDisplayStatus(closeOutState.summary)),
          )}
          ${
            closeOutState.summary.existingCloseOutArtifactId
              ? createToken(
                  `기존종료정리:${closeOutState.summary.existingCloseOutArtifactId}`,
                  closeOutState.summary.conflict ? 'warning' : 'neutral',
                )
              : ''
          }
        </div>
        ${renderCloseOutPanel(task, data, { currentSurface: 'taskboard' })}
      </div>

      <div class="detail-block">
        <p class="detail-key">승인 기록</p>
        ${
          taskApprovals.length > 0
            ? taskApprovals
                .map(
                  (approval) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(getApprovalActionLabel(approval.allowedNextAction) || approval.scope)}</strong>
                      <div class="token-row">
                        ${createToken(getApprovalStatusDisplay(approval.status), getApprovalTone(approval.status))}
                        ${createToken(`범위:${approval.scope}`, 'neutral')}
                      </div>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">이 태스크에 연결된 승인 기록이 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">결정 기록</p>
        ${
          taskInboxItems.length > 0
            ? taskInboxItems
                .map(
                  (item) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(item.title)}</strong>
                      <div class="token-row">
                        ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
                        ${createToken(getInboxStatusDisplay(item.status), item.status === 'pending' ? 'warning' : 'success')}
                        ${item.blocksTask ? createToken('태스크차단', 'danger') : ''}
                        ${item.id === selectedInboxItem?.id ? createToken('미리선택', 'accent') : ''}
                      </div>
                      <p class="detail-copy">${escapeHtml(item.prompt || item.resolution?.note || '기록된 안내 문구가 없습니다.')}</p>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">이 태스크에 연결된 결정함 항목이 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">연결된 출력</p>
        <div class="token-row">
          ${createToken(`run수:${taskRuns.length}`, 'neutral')}
          ${createToken(`아티팩트수:${taskArtifacts.length}`, 'neutral')}
        </div>
      </div>
    </aside>
  `;
}

function renderLogs(data) {
  if (!data.activeProject) {
    elements.surfaces.logs.innerHTML = renderProjectGateSurface(
      '로그 사용 불가',
      getProjectGateCopy(data, '로그'),
    );
    return;
  }

  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedTask = selectedRun
    ? data.taskMap.get(selectedRun.taskId)
    : data.taskMap.get(state.selectedTaskId) || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const runBundle = selectedRun ? getRunArtifactBundle(selectedRun, data) : null;
  const logs = state.selectedRunLogs?.logs || [];
  const logText =
    logs.length > 0
      ? logs.map((entry) => `[${entry.ts}] ${entry.level.toUpperCase()} ${entry.message}`).join('\n')
      : '이 run에 대한 로그 기록이 없습니다.';
  const logsDetailSnapshot = getLogsDetailSnapshot(selectedRun, selectedTask, runBundle, logs);
  const logsDetailEvidenceState = getExecutionEvidenceRail(selectedTask, data);
  const selectedTaskApprovals = selectedTask
    ? data.approvals.filter((approval) => approval.taskId === selectedTask.id && approval.status === 'pending')
    : [];
  const selectedTaskInboxItems = selectedTask
    ? data.inboxItems.filter((item) => item.taskId === selectedTask.id && item.status === 'pending')
    : [];
  const selectedTaskPendingDecisions = selectedTaskInboxItems.filter((item) => item.kind !== 'approval');
  const logsPreferredInboxItem = selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null;
  const logsOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedTask,
    currentRun: selectedRun,
    currentInboxItem: logsPreferredInboxItem,
    pendingApprovalCount: selectedTaskApprovals.length,
    pendingDecisionCount: selectedTaskPendingDecisions.length,
  });
  const logsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(logsOpsEntrySignals);
  const logsDetailSignalRow = `
    <div class="logs-detail-signal-row">
      ${logsOpsEntrySignalRow}
    </div>
  `;
  const logsImmediateCard = selectedTaskApprovals.length > 0
    ? {
        title: `결재함에서 승인 ${selectedTaskApprovals.length}건 처리`,
        copy: '현재 실행 기록보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다.',
        button: {
          action: 'open-surface',
          label: '결재함',
          targetSurface: 'decision-inbox',
          disabled: state.loading || state.mutating,
        },
      }
    : selectedTaskInboxItems.length > 0
      ? {
          title: `결재함에서 확인 ${selectedTaskInboxItems.length}건 처리`,
          copy: '현재 실행 기록보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
        }
      : selectedTask
        ? {
            title: `${selectedTask.title} 열기`,
            copy: '현재 실행 기록이 연결된 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다.',
            button: {
              action: 'open-taskboard-task',
              id: selectedTask.id,
              label: '영향 셀',
              disabled: state.loading || state.mutating,
            },
          }
      : selectedRun
        ? {
            title: `${selectedRun.id} 원문 보기`,
            copy: '지금은 오른쪽 상세에서 이 실행 기록의 상태와 원문 로그를 먼저 읽으면 됩니다.',
            button: null,
          }
        : {
            title: '실행 기록 하나 고르기',
            copy: '왼쪽 실행 기록 목록에서 한 건을 고르면 오른쪽 판단과 원문 로그가 바로 채워집니다.',
            button: null,
          };
  const logsViewportStrip = renderViewportHandoffStrip({
    eyebrow: '로그 인계선',
    heading: '로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다',
    copy:
      '왼쪽은 실행 기록 목록을 보고, 오른쪽은 선택된 실행 기록의 현재 상태와 다음 확인만 먼저 봅니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      selectedTask ? createToken(`실행셀:${selectedTask.id}`, 'accent') : createToken('실행셀:대기', 'warning'),
      createToken(`바로:${selectedTask ? '영향 셀' : selectedRun ? '현재 실행 기록' : '기록 선택'}`, selectedTask ? 'accent' : 'neutral'),
    ].filter(Boolean),
    cards: [
      {
        label: '왼쪽 목록',
        title: '실행 기록 목록 + 현재 상태',
        copy: '왼쪽에서 실행 기록을 고르고, 상태와 다음 확인만 짧게 비교합니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedRun ? '현재 실행 기록 + 원문 확인' : '선택 기록 대기',
        copy: selectedRun
          ? '오른쪽 상세에서 현재 실행 기록, 다음 확인, 연결선, 원문 로그를 순서대로 확인합니다.'
          : '실행 기록을 하나 고르면 오른쪽 판단과 원문 로그가 함께 열립니다.',
      },
      {
        label: '바로',
        title: logsImmediateCard.title,
        copy: logsImmediateCard.copy,
        emphasis: true,
        button: logsImmediateCard.button,
      },
    ],
  });

  const runList = data.runs.length
    ? data.runs
        .map((run) => {
          const runTask = data.taskMap.get(run.taskId);
          const runSnapshot = getRunListSnapshot(run, runTask, data);

          return `
            <button class="card list-button ops-list-button ${run.id === selectedRun?.id ? 'is-selected' : ''}" type="button" data-action="select-run" data-id="${escapeHtml(run.id)}">
              <div class="ops-list-head ops-list-register ops-list-register-primary">
                <div class="card-title-row card-title-row-tight mission-row-head">
                  <strong>${escapeHtml(runSnapshot.title)}</strong>
                  ${createToken(getRunStatusDisplay(run.status), getRunTone(run.status))}
                </div>
                <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(runSnapshot.metaCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register">
                <p class="ops-list-label">현재 상태</p>
                <p class="list-copy list-copy-compact">${escapeHtml(runSnapshot.currentCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register ops-list-register-next">
                <p class="ops-list-label">다음 확인</p>
                <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(runSnapshot.nextCopy)}</p>
              </div>
              <div class="token-row token-row-compact ops-list-foot">
                ${runSnapshot.tokens.join('')}
                ${run.finishedAt ? createToken(`종료:${formatDate(run.finishedAt)}`, 'neutral') : ''}
              </div>
            </button>
          `;
        })
        .join('')
    : `
      <div class="empty-state">
        <strong>아직 실행 기록 없음</strong>
        <p>로그를 보기 전에 태스크 실행을 시작합니다.</p>
      </div>
    `;

  const logsDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 실행 기록만 세 칸으로 요약하는 로그실',
    copy: '아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      selectedTask ? createToken(`실행셀:${selectedTask.id}`, 'accent') : createToken('실행셀:대기', 'warning'),
      createToken(`run:${selectedRun?.id || data.runs.length}`, 'neutral'),
    ],
    signalRow: logsOpsEntrySignalRow,
    cards: [
      {
        label: '현재 실행 기록',
        title: selectedRun ? selectedRun.id : '기록 선택 대기',
        copy: selectedRun
          ? logsDetailSnapshot.currentCopy
          : '왼쪽 목록에서 실행 기록을 고르면 현재 실행 기록 판단이 바로 채워집니다.',
      },
      {
        label: '다음 확인',
        title: selectedRun ? logsDetailSnapshot.nextTitle : '실행 기록 하나 고르기',
        copy: selectedRun
          ? logsDetailSnapshot.nextCopy
          : '왼쪽 목록에서 실행 기록을 하나 고르면 오른쪽 판단과 원문 로그가 함께 열립니다.',
      },
      {
        label: '현재 맥락',
        title: selectedTask ? selectedTask.title : '실행 셀 대기',
        copy: selectedTask
          ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀과 연결돼 있습니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces.logs.innerHTML = `
    <div class="stack">
      ${logsViewportStrip}
      ${logsDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="list-column">${runList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">실행 기록</p>
          <h2>${escapeHtml(selectedRun?.id || '선택된 실행 기록 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 실행 기록과 다음 확인을 먼저 보는 로그 상세',
          copy: selectedTask?.title || '실행 기록을 고르면 현재 실행 기록과 다음 확인만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${logsDetailEvidenceState.currentOwnerLabel}`,
              logsDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${logsDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...logsDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: logsDetailSnapshot.currentTitle,
              copy: logsDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: logsDetailSnapshot.reasonTitle,
              copy: logsDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 확인',
              title: logsDetailSnapshot.nextTitle,
              copy: logsDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedRun
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">실행 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(getRunStatusDisplay(selectedRun.status), getRunTone(selectedRun.status))}
                  ${selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedTask.review.status)}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                </div>
                ${logsDetailSignalRow}
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedTask?.title || '알 수 없는 태스크')}</strong>
                    <p class="detail-copy detail-copy-compact">연결 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedRun.startedAt))}</strong>
                    <p class="detail-copy detail-copy-compact">
                      ${escapeHtml(formatDate(selectedRun.finishedAt))} 종료
                    </p>
                  </div>
                </div>
                <p class="detail-copy detail-copy-compact mono">${escapeHtml(selectedRun.logPath)}</p>
              </div>
              <div class="detail-block detail-block-compact">
                <p class="detail-key">보고 연결선</p>
                <p class="detail-copy detail-copy-compact">실행과 증적 연결만 짧게 봅니다.</p>
                ${
                  runBundle
                    ? renderRelationStrip(runBundle) ||
                      '<p class="detail-copy">이 실행 기록에 직접 연결된 아티팩트 기록이 없습니다.</p>'
                    : '<p class="detail-copy">이 실행 기록에 직접 연결된 아티팩트 기록이 없습니다.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">실행 원문 로그</p>
                <pre class="log-viewer log-viewer-compact">${escapeHtml(logText)}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>선택된 실행 기록 없음</strong>
                <p>왼쪽 목록에서 실행 기록을 골라 출력 내용을 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderArtifacts(data) {
  if (!data.activeProject) {
    elements.surfaces.artifacts.innerHTML = renderProjectGateSurface(
      '아티팩트 사용 불가',
      getProjectGateCopy(data, '아티팩트'),
    );
    return;
  }

  const selectedArtifactMeta = data.artifactMap.get(state.selectedArtifactId) || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const selectedArtifactTask = selectedArtifactMeta
    ? data.taskMap.get(selectedArtifactMeta.taskId)
    : null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const parsedBreakdown =
    selectedArtifactMeta?.type === 'breakdown' && state.selectedArtifact?.content
      ? parseBreakdownArtifact(state.selectedArtifact.content)
      : null;
  const parsedPreflight =
    selectedArtifactMeta?.type === 'preflight' && state.selectedArtifact?.content
      ? parsePreflightArtifact(state.selectedArtifact.content)
      : null;
  const parsedChangeSummary =
    selectedArtifactMeta?.type === 'change-summary' && state.selectedArtifact?.content
      ? parseChangeSummaryArtifact(state.selectedArtifact.content)
      : null;
  const parsedReview =
    selectedArtifactMeta?.type === 'review' && state.selectedArtifact?.content
      ? parseReviewArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitPackage =
    selectedArtifactMeta?.type === 'commit-package' && state.selectedArtifact?.content
      ? parseCommitPackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitResult =
    selectedArtifactMeta?.type === 'commit-result' && state.selectedArtifact?.content
      ? parseCommitResultArtifact(state.selectedArtifact.content)
      : null;
  const parsedReleasePackage =
    selectedArtifactMeta?.type === 'release-package' && state.selectedArtifact?.content
      ? parseReleasePackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCloseOut =
    selectedArtifactMeta?.type === 'close-out' && state.selectedArtifact?.content
      ? parseCloseOutArtifact(state.selectedArtifact.content)
      : null;
  const parsedUnifiedDiff =
    (selectedArtifactMeta?.type === 'patch' || selectedArtifactMeta?.type === 'diff') &&
    state.selectedArtifact?.content
      ? parseUnifiedDiffArtifact(state.selectedArtifact.content)
      : null;
  const artifactRelationContext = selectedArtifactMeta
      ? getArtifactRelationContext(selectedArtifactMeta, data, {
        parsedChangeSummary,
        parsedCommitResult,
        parsedCommitPackage,
        parsedCloseOut,
        parsedReleasePackage,
        parsedReview,
      })
    : null;
  const selectedArtifactPolicyEntry = selectedArtifactMeta
    ? getArtifactCatalogEntry(selectedArtifactMeta, data)
    : null;
  const selectedArtifactPolicySummary = selectedArtifactMeta
    ? getArtifactPolicySummary(selectedArtifactMeta, data)
    : '';
  const preselectedPendingItem =
    selectedArtifactTask &&
    selectedInboxItem &&
    selectedInboxItem.taskId === selectedArtifactTask.id &&
    selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';
  const artifactDetailSnapshot = getArtifactDetailSnapshot(
    selectedArtifactMeta,
    selectedArtifactTask,
    data,
    selectedArtifactPolicySummary,
  );
  const artifactsDetailEvidenceState = getExecutionEvidenceRail(selectedArtifactTask, data);
  const selectedArtifactApprovals = selectedArtifactTask
    ? data.approvals.filter((approval) => approval.taskId === selectedArtifactTask.id && approval.status === 'pending')
    : [];
  const selectedArtifactInboxItems = selectedArtifactTask
    ? data.inboxItems.filter((item) => item.taskId === selectedArtifactTask.id && item.status === 'pending')
    : [];
  const selectedArtifactPendingDecisions = selectedArtifactInboxItems.filter(
    (item) => item.kind !== 'approval',
  );
  const artifactsPreferredInboxItem = selectedArtifactTask
    ? getPreferredTaskInboxItem(selectedArtifactTask.id, data)
    : null;
  const artifactSourceRun =
    selectedArtifactMeta?.runId ? data.runMap.get(selectedArtifactMeta.runId) || null : null;
  const artifactsOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedArtifactTask,
    currentRun: artifactSourceRun,
    currentArtifact: selectedArtifactMeta,
    currentInboxItem: artifactsPreferredInboxItem,
    pendingApprovalCount: selectedArtifactApprovals.length,
    pendingDecisionCount: selectedArtifactPendingDecisions.length,
  });
  const artifactsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(artifactsOpsEntrySignals);
  const artifactsImmediateCard = selectedArtifactApprovals.length > 0
    ? {
        title: `결재함에서 승인 ${selectedArtifactApprovals.length}건 처리`,
        copy: '현재 증적보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다.',
        button: {
          action: 'open-surface',
          label: '결재함',
          targetSurface: 'decision-inbox',
          disabled: state.loading || state.mutating,
        },
      }
    : selectedArtifactInboxItems.length > 0
      ? {
          title: `결재함에서 확인 ${selectedArtifactInboxItems.length}건 처리`,
          copy: '현재 증적보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
        }
      : selectedArtifactTask
        ? {
            title: `${selectedArtifactTask.title} 열기`,
            copy: '현재 증적이 걸린 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다.',
            button: {
              action: 'open-taskboard-task',
              id: selectedArtifactTask.id,
              label: '영향 셀',
              disabled: state.loading || state.mutating,
            },
          }
      : selectedArtifactMeta
        ? {
            title: `${selectedArtifactMeta.id} 미리보기`,
            copy: '지금은 오른쪽 상세에서 이 증적의 상태와 연결선을 먼저 읽으면 됩니다.',
            button: null,
          }
        : {
            title: '증적 하나 고르기',
            copy: '왼쪽 목록에서 증적을 하나 고르면 오른쪽 판단과 미리보기가 바로 채워집니다.',
            button: null,
          };
  const artifactList = data.artifacts.length
    ? data.artifacts
        .map((artifact) => {
          const artifactTask = data.taskMap.get(artifact.taskId) || null;
          const artifactSnapshot = getArtifactListSnapshot(artifact, artifactTask, data);

          return `
            <button class="card list-button ops-list-button ${artifact.id === selectedArtifactMeta?.id ? 'is-selected' : ''}" type="button" data-action="select-artifact" data-id="${escapeHtml(artifact.id)}">
              <div class="ops-list-head ops-list-register ops-list-register-primary">
                <div class="card-title-row card-title-row-tight mission-row-head">
                  <strong>${escapeHtml(artifactSnapshot.title)}</strong>
                  ${createToken(artifact.type, 'neutral')}
                </div>
                <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(artifactSnapshot.metaCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register">
                <p class="ops-list-label">현재 상태</p>
                <p class="list-copy list-copy-compact">${escapeHtml(artifactSnapshot.currentCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register ops-list-register-next">
                <p class="ops-list-label">다음 확인</p>
                <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(artifactSnapshot.nextCopy)}</p>
              </div>
              <div class="token-row token-row-compact ops-list-foot">
                ${artifactSnapshot.tokens.join('')}
              </div>
            </button>
          `;
        })
        .join('')
    : `
      <div class="empty-state">
        <strong>아직 아티팩트 없음</strong>
        <p>아티팩트는 런타임 실행이나 리뷰 증거가 기록된 뒤 나타납니다.</p>
      </div>
    `;
  const artifactsViewportStrip = renderViewportHandoffStrip({
    eyebrow: '증적 인계선',
    heading: '보관실 아래는 증적 목록과 현재 증적으로 나눕니다',
    copy:
      '왼쪽은 증적 목록을 보고, 오른쪽은 선택된 증적의 현재 상태와 다음 확인만 먼저 봅니다.',
    tokens: [
      createToken(`증적:${data.artifacts.length}`, 'neutral'),
      selectedArtifactMeta
        ? createToken(`현재:${getArtifactTypeDisplay(selectedArtifactMeta.type)}`, 'accent')
        : createToken('현재:선택대기', 'warning'),
      createToken(
        `바로:${selectedArtifactTask ? '영향 셀' : selectedArtifactMeta ? '현재 증적' : '증적 선택'}`,
        selectedArtifactTask ? 'accent' : 'neutral',
      ),
    ],
    cards: [
      {
        label: '왼쪽 목록',
        title: '증적 목록 + 현재 상태',
        copy: '왼쪽에서 증적을 고르고, 상태와 다음 확인만 짧게 비교합니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedArtifactMeta ? '현재 증적 + 미리보기' : '선택 증적 대기',
        copy: selectedArtifactMeta
          ? '오른쪽 상세에서 현재 증적, 다음 확인, 연결선, 구조 미리보기나 저장 원문을 순서대로 확인합니다.'
          : '증적을 하나 고르면 오른쪽 판단과 미리보기가 함께 열립니다.',
      },
      {
        label: '바로',
        title: artifactsImmediateCard.title,
        copy: artifactsImmediateCard.copy,
        emphasis: true,
        button: artifactsImmediateCard.button,
      },
    ],
  });

  const artifactsDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 증적만 세 칸으로 요약하는 보관실',
    copy: '아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다.',
    tokens: [
      createToken(`증적:${data.artifacts.length}`, 'neutral'),
      selectedArtifactMeta
        ? createToken(`현재:${getArtifactTypeDisplay(selectedArtifactMeta.type)}`, 'accent')
        : createToken('현재:선택대기', 'warning'),
      selectedArtifactTask ? createToken(`실행셀:${selectedArtifactTask.id}`, 'neutral') : '',
    ],
    signalRow: artifactsOpsEntrySignalRow,
    cards: [
      {
        label: '현재 증적',
        title: selectedArtifactMeta ? selectedArtifactMeta.id : '증적 선택 대기',
        copy: selectedArtifactMeta
          ? artifactDetailSnapshot.currentCopy
          : '왼쪽 목록에서 증적을 고르면 현재 증적 판단이 바로 채워집니다.',
      },
      {
        label: '다음 확인',
        title: selectedArtifactMeta ? artifactDetailSnapshot.nextTitle : '증적 하나 고르기',
        copy: selectedArtifactMeta
          ? artifactDetailSnapshot.nextCopy
          : '왼쪽 목록에서 증적을 하나 고르면 오른쪽 판단과 미리보기가 함께 열립니다.',
      },
      {
        label: '현재 맥락',
        title: selectedArtifactTask ? selectedArtifactTask.title : '실행 셀 대기',
        copy: selectedArtifactTask
          ? `${getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState)} 상태의 실행 셀에 연결된 증적입니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces.artifacts.innerHTML = `
    <div class="stack">
      ${artifactsViewportStrip}
      ${artifactsDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="list-column">${artifactList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">증적 상세</p>
          <h2>${escapeHtml(selectedArtifactMeta?.id || '선택된 증적 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 증적과 다음 확인을 먼저 보는 증적 상세',
          copy: selectedArtifactTask?.title || '증적을 고르면 현재 증적과 다음 확인만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${artifactsDetailEvidenceState.currentOwnerLabel}`,
              artifactsDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${artifactsDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...artifactDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: artifactDetailSnapshot.currentTitle,
              copy: artifactDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: artifactDetailSnapshot.reasonTitle,
              copy: artifactDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 확인',
              title: artifactDetailSnapshot.nextTitle,
              copy: artifactDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedArtifactMeta
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">증적 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(selectedArtifactMeta.type, 'neutral')}
                  ${renderArtifactPolicyTokens(selectedArtifactMeta, data)}
                  ${selectedArtifactTask ? createToken(getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState), 'neutral') : ''}
                  ${selectedArtifactTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedArtifactTask.review.status)}`, getReviewTone(selectedArtifactTask.review.status)) : ''}
                </div>
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedArtifactTask?.title || '알 수 없는 태스크')}</strong>
                    <p class="detail-copy detail-copy-compact">연결 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedArtifactMeta.createdAt))}</strong>
                    <p class="detail-copy detail-copy-compact">저장 시각</p>
                  </div>
                </div>
                <p class="detail-copy detail-copy-compact mono">${escapeHtml(selectedArtifactMeta.path)}</p>
                ${
                  selectedArtifactPolicySummary
                    ? `<p class="detail-copy detail-copy-compact">${escapeHtml(selectedArtifactPolicySummary)}</p>`
                    : ''
                }
              </div>
              <div class="detail-block detail-block-compact">
                <p class="detail-key">증적 연결선</p>
                <p class="detail-copy detail-copy-compact">연결 요약만 먼저 봅니다.</p>
                ${
                  renderRelationStrip(artifactRelationContext) ||
                  '<p class="detail-copy">이 아티팩트에 직접 연결된 run 또는 아티팩트 기록이 없습니다.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">보고 미리보기</p>
                ${
                  selectedArtifactMeta.type === 'breakdown' && parsedBreakdown
                    ? `
                      ${renderStructuredBreakdown(parsedBreakdown)}
                    `
                    : selectedArtifactMeta.type === 'breakdown'
                      ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                      : selectedArtifactMeta.type === 'preflight' && parsedPreflight
                        ? `
                          ${renderStructuredPreflight(parsedPreflight)}
                        `
                        : selectedArtifactMeta.type === 'preflight'
                          ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                        : selectedArtifactMeta.type === 'change-summary' && parsedChangeSummary
                          ? `
                            ${renderStructuredChangeSummary(parsedChangeSummary)}
                          `
                          : selectedArtifactMeta.type === 'change-summary'
                            ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                          : selectedArtifactMeta.type === 'review' && parsedReview
                            ? `
                              ${renderStructuredReview(parsedReview, selectedArtifactTask?.review?.status || null)}
                            `
                            : selectedArtifactMeta.type === 'review'
                              ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'commit-package' && parsedCommitPackage
                              ? `
                                ${renderStructuredCommitPackage(parsedCommitPackage)}
                              `
                              : selectedArtifactMeta.type === 'commit-package'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'commit-result' && parsedCommitResult
                              ? `
                                ${renderStructuredCommitResult(parsedCommitResult)}
                              `
                              : selectedArtifactMeta.type === 'commit-result'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'release-package' && parsedReleasePackage
                              ? `
                                ${renderStructuredReleasePackage(parsedReleasePackage)}
                              `
                              : selectedArtifactMeta.type === 'release-package'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'close-out' && parsedCloseOut
                              ? `
                                ${renderStructuredCloseOut(parsedCloseOut)}
                              `
                              : selectedArtifactMeta.type === 'close-out'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'patch' && parsedUnifiedDiff
                              ? `
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'planned patch')}
                              `
                            : selectedArtifactMeta.type === 'patch'
                              ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'diff' && parsedUnifiedDiff
                              ? `
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'observed diff')}
                              `
                              : selectedArtifactMeta.type === 'diff'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                      : ''
                }
                ${
                  selectedArtifactPolicyEntry?.previewMode === 'raw-only'
                    ? '<p class="detail-copy detail-copy-compact">이 증적은 원문만 확인합니다.</p>'
                    : ''
                }
                ${
                  selectedArtifactMeta.type === 'preflight' && selectedArtifactTask
                    ? renderBuilderLiveMutationApprovalPanel(selectedArtifactTask, data)
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderCommitPackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderReleasePackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package' ||
                    selectedArtifactMeta.type === 'close-out')
                    ? renderCloseOutPanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  showBuilderApprovalHint &&
                  selectedArtifactMeta.type === 'preflight'
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText: '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
                      })
                    : ''
                }
                ${
                  showCommitApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText: '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
                      })
                    : ''
                }
                ${
                  showReleaseApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText:
                          '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다. 푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다.',
                      })
                    : ''
                }
                <p class="detail-key">보관 원문</p>
                <p class="detail-copy detail-copy-compact">저장 원문이 최종 기준입니다.</p>
                <pre class="artifact-preview artifact-preview-compact">${escapeHtml(state.selectedArtifact?.content || '미리보기 가능한 내용이 없습니다.')}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>선택된 증적 없음</strong>
                <p>증적을 골라 저장된 원문과 소스 연결을 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderDecisionInbox(data) {
  if (!data.activeProject) {
    elements.surfaces['decision-inbox'].innerHTML = renderProjectGateSurface(
      '결정함 사용 불가',
      getProjectGateCopy(data, '결정함'),
    );
    return;
  }

  const harnessBrief = getHarnessConsumerBrief(data);
  const pendingItems = data.inboxItems.filter((item) => item.status === 'pending');
  const resolvedItems = data.inboxItems.filter((item) => item.status === 'resolved');
  const selectedItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const selectedTask = selectedItem ? data.taskMap.get(selectedItem.taskId) : null;
  const selectedApproval = selectedItem?.sourceId
    ? data.approvals.find((approval) => approval.id === selectedItem.sourceId) || null
    : null;
  const inboxActionDisabled = state.loading || state.mutating;
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const inboxDetailSnapshot = getInboxDetailSnapshot(selectedItem, selectedTask, selectedApproval);
  const decisionDetailEvidenceState = getExecutionEvidenceRail(selectedTask, data);
  const pendingApprovalItems = pendingItems.filter((item) => item.kind === 'approval');
  const pendingDecisionItems = pendingItems.filter((item) => item.kind !== 'approval');
  const decisionOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedTask,
    currentInboxItem: selectedItem,
    pendingApprovalCount: pendingApprovalItems.length,
    pendingDecisionCount: pendingDecisionItems.length,
  });
  const decisionOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(decisionOpsEntrySignals);
  const decisionActionSignalRow = `
    <div class="decision-action-signal-row">
      ${decisionOpsEntrySignalRow}
    </div>
  `;
  const decisionImmediateCard = selectedTask
    ? {
        title: `${selectedTask.title} 열기`,
        copy: '현재 결재가 묶인 실행 셀을 작업판에서 다시 보고 후속 단계를 이어갑니다.',
        button: {
          action: 'open-taskboard-task',
          id: selectedTask.id,
          label: '영향 셀',
          disabled: state.loading || state.mutating,
        },
      }
    : pendingItems.length > 0
      ? {
          title: `대기 결재 ${pendingItems.length}건 확인`,
          copy: '왼쪽 대기 큐에서 한 건을 고르면 오른쪽 처리 판단이 바로 채워집니다.',
          button: null,
        }
      : {
          title: '최근 처리 기록 보기',
          copy: '대기 안건이 없으면 왼쪽 최근 처리 열에서 감사 추적을 이어서 확인합니다.',
          button: null,
        };
  const decisionViewportStrip = renderViewportHandoffStrip({
    eyebrow: '결재 인계선',
    heading: '결재함 아래는 큐와 처리 판단으로 나눕니다',
    copy:
      '왼쪽은 대기 안건과 최근 처리 큐를 보고, 오른쪽은 현재 선택 항목의 상태와 다음 처리만 먼저 봅니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      createToken(`대기:${pendingItems.length}`, pendingItems.length > 0 ? 'warning' : 'success'),
      createToken(`바로:${selectedTask ? '영향 셀' : pendingItems.length > 0 ? '대기 큐' : '최근 처리'}`, selectedTask ? 'accent' : 'neutral'),
    ].filter(Boolean),
    cards: [
      {
        label: '왼쪽 큐',
        title: '대기 결재 + 최근 처리',
        copy: '왼쪽 두 열에서 지금 막힌 안건과 방금 끝난 처리 기록을 고릅니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedItem ? '현재 상태 + 처리' : '선택 항목 대기',
        copy: selectedItem
          ? '오른쪽 상세에서 승인, 반려, 해결과 다음 연결을 바로 판단합니다.'
          : '항목을 하나 고르면 오른쪽 처리 판단과 액션이 함께 열립니다.',
      },
      {
        label: '바로',
        title: decisionImmediateCard.title,
        copy: decisionImmediateCard.copy,
        emphasis: true,
        button: decisionImmediateCard.button,
      },
    ],
  });
  let actionSurface = '';

  if (selectedItem?.status === 'pending' && selectedItem.kind === 'approval') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 여기서 승인 또는 반려만 결정합니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('승인 요청', 'accent')}
            ${selectedApproval ? createToken(getApprovalActionLabel(selectedApproval.allowedNextAction) || selectedApproval.scope, 'neutral') : ''}
          </div>
        </div>
        ${decisionActionSignalRow}
        <div class="form-actions form-actions-inline decision-action-row">
          <button
            class="primary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="approve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            승인
          </button>
          <button
            class="danger-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="reject"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            반려
          </button>
        </div>
        <p class="form-help decision-action-help">선택한 결재만 여기서 처리하고, 실행 흐름은 아래 연결 맥락을 따릅니다.</p>
      </div>
    `;
  } else if (selectedItem?.status === 'pending' && selectedItem.kind === 'decision') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 여기서 해결만 기록하고 다음 실행 판단으로 넘깁니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('결정 처리', 'warning')}
          </div>
        </div>
        ${decisionActionSignalRow}
        <div class="form-actions form-actions-inline decision-action-row">
          <button
            class="secondary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="resolve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            해결
          </button>
        </div>
        <p class="form-help decision-action-help">해결 뒤 흐름은 영향 셀과 현재 게이트를 따라 이어집니다.</p>
      </div>
    `;
  } else if (selectedItem?.status === 'pending') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 결정함에서 상태만 확인하고 다른 화면으로 이어집니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('읽기 전용', 'neutral')}
          </div>
        </div>
        ${decisionActionSignalRow}
        <p class="detail-copy">이 결정함 항목에는 현재 결정함 경로에서 허용된 쓰기 액션이 없습니다.</p>
      </div>
    `;
  }

  const renderInboxList = (items, options) => `
    <section class="surface-panel">
      <div class="panel-header panel-header-tight">
        <div>
          <h2>${escapeHtml(options.title)}</h2>
          <p class="panel-copy panel-copy-tight">${escapeHtml(options.copy)}</p>
        </div>
        <div class="token-row token-row-compact">
          ${createToken(`${options.countLabel}:${items.length}`, options.countTone)}
          ${options.scopeToken ? createToken(options.scopeToken, 'neutral') : ''}
        </div>
      </div>
      ${
        items.length > 0
          ? `<div class="list-column">
              ${items
                .map((item) => {
                  const inboxTask = data.taskMap.get(item.taskId) || null;
                  const inboxApproval = item.sourceId
                    ? data.approvals.find((approval) => approval.id === item.sourceId) || null
                    : null;
                  const inboxEvidenceState = getExecutionEvidenceRail(inboxTask, data);
                  const inboxSnapshot = getInboxListSnapshot(
                    item,
                    inboxTask,
                    inboxApproval,
                    inboxEvidenceState,
                  );

                  return `
                    <button class="card list-button ops-list-button ${item.id === selectedItem?.id ? 'is-selected' : ''}" type="button" data-action="select-inbox-item" data-id="${escapeHtml(item.id)}">
                      <div class="ops-list-head ops-list-register ops-list-register-primary">
                        <div class="card-title-row card-title-row-tight mission-row-head">
                          <strong>${escapeHtml(inboxSnapshot.title)}</strong>
                          ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
                        </div>
                        <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(inboxSnapshot.metaCopy)}</p>
                      </div>
                      <div class="ops-list-summary ops-list-register">
                        <p class="ops-list-label">현재 상태</p>
                        <p class="list-copy list-copy-compact">${escapeHtml(inboxSnapshot.currentCopy)}</p>
                      </div>
                      <div class="ops-list-summary ops-list-register ops-list-register-next">
                        <p class="ops-list-label">다음 확인</p>
                        <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(inboxSnapshot.nextCopy)}</p>
                      </div>
                      <div class="token-row token-row-compact ops-list-foot">
                        ${createToken(
                          `현재:${inboxEvidenceState.currentOwnerLabel}`,
                          inboxEvidenceState.blockedReason ? 'danger' : 'accent',
                        )}
                        ${createToken(`다음:${inboxEvidenceState.nextHandoffLabel}`, 'neutral')}
                        ${inboxSnapshot.tokens.join('')}
                        ${createToken(formatDate(item.updatedAt || item.createdAt), 'neutral')}
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>`
          : `
            <div class="empty-state">
              <strong>없음</strong>
              <p>${escapeHtml(options.emptyCopy)}</p>
            </div>
          `
      }
    </section>
  `;

  const decisionDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 결재 안건만 세 칸으로 요약하는 결재함',
    copy: '아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      createToken(`대기:${pendingItems.length}`, pendingItems.length > 0 ? 'warning' : 'success'),
      createToken(`처리됨:${resolvedItems.length}`, 'neutral'),
    ],
    signalRow: decisionOpsEntrySignalRow,
    cards: [
      {
        label: '현재 안건',
        title: selectedItem ? selectedItem.title : '선택 대기',
        copy: selectedItem
          ? inboxDetailSnapshot.currentCopy
          : '왼쪽 큐에서 항목을 고르면 현재 상태 판단이 바로 채워집니다.',
      },
      {
        label: '다음 처리',
        title: selectedItem ? inboxDetailSnapshot.nextTitle : pendingItems.length > 0 ? '대기 큐 처리' : '최근 처리 확인',
        copy: selectedItem
          ? inboxDetailSnapshot.nextCopy
          : pendingItems.length > 0
            ? '왼쪽 대기 큐에서 한 건을 고르면 오른쪽 처리 판단과 액션이 함께 열립니다.'
            : '대기 안건이 없으면 최근 처리 열에서 감사 추적을 이어서 확인합니다.',
      },
      {
        label: '현재 맥락',
        title: selectedTask ? selectedTask.title : '영향 실행 셀 대기',
        copy: selectedTask
          ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀과 연결된 ${getInboxKindDisplay(selectedItem?.kind || 'decision')} 안건입니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces['decision-inbox'].innerHTML = `
    <div class="stack">
      ${decisionViewportStrip}
      ${decisionDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-inbox">
      <section class="surface-panel">
        ${renderInboxList(pendingItems, {
          title: '대기 결재',
          copy: '지금 막힌 게이트만 고르고 바로 처리합니다.',
          emptyCopy: '사람의 처리를 기다리는 게이트가 아직 남아 있습니다.',
          countLabel: '대기',
          countTone: pendingItems.length > 0 ? 'warning' : 'success',
          scopeToken: '지금 처리',
        })}
      </section>
      ${renderInboxList(resolvedItems, {
        title: '최근 처리',
        copy: '방금 끝난 승인과 해결만 감사 추적으로 확인합니다.',
        emptyCopy: '해결된 결정과 승인은 감사 추적을 위해 계속 보입니다.',
        countLabel: '처리됨',
        countTone: 'neutral',
        scopeToken: '감사 추적',
      })}
      <aside class="detail-card">
        <div>
          <p class="eyebrow">결재 상세</p>
          <h2>${escapeHtml(selectedItem?.title || '선택된 결재 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 상태와 다음 처리를 먼저 보는 결재 상세',
          copy: selectedItem?.prompt || '결재를 고르면 현재 상태와 다음 처리만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...inboxDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: inboxDetailSnapshot.currentTitle,
              copy: inboxDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: inboxDetailSnapshot.reasonTitle,
              copy: inboxDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 처리',
              title: inboxDetailSnapshot.nextTitle,
              copy: inboxDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedItem
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">결재 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(
                    `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
                    decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
                  )}
                  ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
                  ${createToken(getInboxKindDisplay(selectedItem.kind), getInboxTone(selectedItem))}
                  ${createToken(getInboxStatusDisplay(selectedItem.status), selectedItem.status === 'pending' ? 'warning' : 'success')}
                  ${selectedItem.blocksTask ? createToken('태스크차단', 'danger') : ''}
                </div>
                <p class="detail-copy detail-copy-compact">${escapeHtml(selectedItem.prompt || '기록된 안내 문구가 없습니다.')}</p>
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedTask?.title || selectedItem.taskId)}</strong>
                    <p class="detail-copy detail-copy-compact">영향 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedItem.updatedAt || selectedItem.createdAt))}</strong>
                    <p class="detail-copy detail-copy-compact">최근 갱신</p>
                  </div>
                </div>
                <div class="token-row token-row-compact">
                  ${selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedTask.review.status)}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                </div>
              </div>
              ${
                selectedApproval
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">결재 기록</p>
                      <div class="kv-item">
                        <strong>${escapeHtml(getApprovalActionLabel(selectedApproval.allowedNextAction) || selectedApproval.scope)}</strong>
                        <div class="token-row">
                          ${createToken(
                            `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
                            decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
                          )}
                          ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
                          ${createToken(getApprovalStatusDisplay(selectedApproval.status), getApprovalTone(selectedApproval.status))}
                          ${createToken(`범위:${selectedApproval.scope}`, 'neutral')}
                        </div>
                      </div>
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'builder-live-mutation'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">라이브 변경 결재</p>
                      ${renderBuilderLiveMutationApprovalPanel(selectedTask, data)}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'commit-intent'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">커밋 지시</p>
                      ${renderCommitPackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">릴리스 보고</p>
                      ${renderReleasePackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                        includeAction: false,
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">안건 종료 보고</p>
                      ${renderCloseOutPanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              <div class="detail-block">
                <p class="detail-key">처리 메모</p>
                <p class="detail-copy detail-copy-compact">${escapeHtml(selectedItem.resolution?.note || '기록된 처리 메모가 없습니다.')}</p>
                <div class="token-row token-row-compact">
                  ${selectedItem.resolution?.action ? createToken(`처리:${getInboxResolutionActionDisplay(selectedItem.resolution.action)}`, 'success') : ''}
                  ${createToken(`갱신:${formatDate(selectedItem.updatedAt)}`, 'neutral')}
                </div>
              </div>
              ${actionSurface}
            `
            : `
              <div class="empty-state">
                <strong>선택된 결재 없음</strong>
                <p>항목을 골라 태스크 맥락과 기록된 해결 상태를 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

async function copyTextValue({
  value,
  emptyErrorMessage,
  copiedMessage,
  unsupportedMessage,
}) {
  if (!value) {
    throw new Error(emptyErrorMessage);
  }

  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(value);
    elements.refreshStatus.textContent = copiedMessage(value);
    return;
  }

  elements.refreshStatus.textContent = unsupportedMessage(value);
}

async function copyHarnessCommand(command) {
  await copyTextValue({
    value: command,
    emptyErrorMessage: '복사할 하네스 명령이 없습니다.',
    copiedMessage: (value) => `하네스 명령 템플릿을 복사했습니다: ${value}`,
    unsupportedMessage: (value) =>
      `클립보드 미지원 환경입니다. 명령 템플릿을 직접 채워 실행하세요: ${value}`,
  });
}

async function copyHarnessExecutionOutputPath(outputPath) {
  await copyTextValue({
    value: outputPath,
    emptyErrorMessage: '복사할 하네스 출력 경로가 없습니다.',
    copiedMessage: (value) => `하네스 출력 경로를 복사했습니다: ${value}`,
    unsupportedMessage: (value) =>
      `클립보드 미지원 환경입니다. 출력 경로를 직접 확인하세요: ${value}`,
  });
}

async function copyHarnessExecutionInputPath(inputPath) {
  await copyTextValue({
    value: inputPath,
    emptyErrorMessage: '복사할 하네스 입력 경로가 없습니다.',
    copiedMessage: (value) => `하네스 입력 경로를 복사했습니다: ${value}`,
    unsupportedMessage: (value) =>
      `클립보드 미지원 환경입니다. 입력 경로를 직접 확인하세요: ${value}`,
  });
}

async function copyHarnessExecutionPreview(previewText) {
  await copyTextValue({
    value: previewText,
    emptyErrorMessage: '복사할 하네스 실행 미리보기가 없습니다.',
    copiedMessage: () => '하네스 실행 미리보기를 복사했습니다.',
    unsupportedMessage: () =>
      '클립보드 미지원 환경입니다. 하네스 실행 미리보기를 직접 확인하세요.',
  });
}

function hideHarnessExecutionResult(actionButton) {
  const executionKey = String(actionButton?.dataset.executionKey || '').trim();

  if (!executionKey) {
    throw new Error('숨길 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = executionKey;
  render();
  elements.refreshStatus.textContent =
    '최근 실행 결과를 숨겼습니다. 필요하면 실행 기록에서 다시 볼 수 있습니다.';
}

function showHarnessExecutionResult(actionButton, statusPayload) {
  const executionKey = String(actionButton?.dataset.executionKey || '').trim();
  const currentExecution = getLatestHarnessExecution(getDerived(), statusPayload);
  const currentExecutionKey = getHarnessExecutionResultKey(currentExecution);

  if (!executionKey || !currentExecution?.harnessId || currentExecutionKey !== executionKey) {
    throw new Error('다시 표시할 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = currentExecution;
  render();

  const executedAtLabel = currentExecution.executedAt
    ? formatDate(currentExecution.executedAt)
    : '최근 실행';
  elements.refreshStatus.textContent = `숨긴 실행 결과를 다시 표시했습니다: ${currentExecution.harnessId} · ${executedAtLabel}`;
}

function restoreHarnessExecutionPreview(actionButton, statusPayload) {
  const historyIndex = Number.parseInt(actionButton?.dataset.historyIndex || '', 10);
  const recentHarnessExecutions = getRecentHarnessExecutions(getDerived(), statusPayload);
  const targetExecution =
    Number.isInteger(historyIndex) && historyIndex >= 0
      ? recentHarnessExecutions[historyIndex] || null
      : null;

  if (!targetExecution?.harnessId) {
    throw new Error('다시 볼 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = targetExecution;
  render();

  const executedAtLabel = targetExecution.executedAt
    ? formatDate(targetExecution.executedAt)
    : '최근 실행';
  elements.refreshStatus.textContent = `실행 결과를 다시 표시했습니다: ${targetExecution.harnessId} · ${executedAtLabel}`;
}

async function executeHarnessOperatorAction({ inputPath, outputPath, statusPayload, pendingMessage }) {
  const operatorAction = statusPayload?.operatorAction || null;
  const statusCard = statusPayload?.statusCard || null;

  if (!statusCard?.primaryHarnessId || !operatorAction?.kind || operatorAction.kind !== 'repo-native-run') {
    throw new Error('현재 실행 가능한 대표 하네스 operator action이 없습니다.');
  }

  if (!inputPath) {
    throw new Error('입력 파일 경로가 필요합니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = null;
  state.harnessExecutionDraftInputPath = inputPath;
  state.harnessExecutionDraftOutputPath = outputPath;
  state.mutating = true;
  elements.refreshStatus.textContent =
    pendingMessage || `하네스 ${statusCard.primaryHarnessId} 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.hiddenHarnessExecutionResultKey = null;
    state.lastHarnessExecutionResult = payload.harnessExecution || null;
    render();

    const execution = payload.harnessExecution || {};
    const outputCopy =
      execution.resolvedOutputPath
        ? `출력: ${execution.resolvedOutputPath}`
        : execution.stdoutPreview
          ? '표준 출력 미리보기를 반환했습니다.'
          : '출력 파일 없이 완료됐습니다.';

    elements.refreshStatus.textContent = `하네스 ${execution.harnessId || statusCard.primaryHarnessId} 실행 완료. ${outputCopy}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runHarnessOperatorAction(form) {
  const data = getDerived();
  const harnessConsumerStatus = getHarnessConsumerStatus(data);
  const formData = new FormData(form);
  const inputPath = String(formData.get('inputPath') || '').trim();
  const outputPath = String(formData.get('outputPath') || '').trim();

  await executeHarnessOperatorAction({
    inputPath,
    outputPath,
    statusPayload: harnessConsumerStatus,
  });
}

async function clearHarnessExecutionHistory(statusPayload) {
  const statusCard = statusPayload?.statusCard || null;

  if (!statusCard?.primaryHarnessId) {
    throw new Error('현재 비울 실행 기록이 없습니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `하네스 ${statusCard.primaryHarnessId}의 실행 기록을 비우는 중…`;
  render();

  try {
    const payload = await postJson('/api/harness/operator-action/clear-history', {
      harnessId: statusCard.primaryHarnessId,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.hiddenHarnessExecutionResultKey = null;
    state.lastHarnessExecutionResult = null;
    render();
    elements.refreshStatus.textContent = `하네스 ${statusCard.primaryHarnessId}의 실행 기록을 비웠습니다.`;
  } finally {
    state.mutating = false;
    render();
  }
}

function reuseHarnessExecutionPaths(actionButton) {
  const inputPath = String(actionButton?.dataset.inputPath || '').trim();
  const outputPath = String(actionButton?.dataset.outputPath || '').trim();

  if (!inputPath) {
    throw new Error('재사용할 입력 경로가 없습니다.');
  }

  state.harnessExecutionDraftInputPath = inputPath;
  state.harnessExecutionDraftOutputPath = outputPath;
  elements.refreshStatus.textContent = `최근 실행 경로를 폼에 다시 채웠습니다: ${inputPath}`;
  render();
}

async function rerunHarnessExecutionPaths(actionButton) {
  const inputPath = String(actionButton?.dataset.inputPath || '').trim();
  const outputPath = String(actionButton?.dataset.outputPath || '').trim();
  const statusPayload = getHarnessConsumerStatus(getDerived());
  const statusCard = statusPayload?.statusCard || null;

  if (!inputPath) {
    throw new Error('재실행할 입력 경로가 없습니다.');
  }

  await executeHarnessOperatorAction({
    inputPath,
    outputPath,
    statusPayload,
    pendingMessage: statusCard?.primaryHarnessId
      ? `하네스 ${statusCard.primaryHarnessId}의 최근 실행 경로를 다시 실행하는 중…`
      : '미확인 하네스의 최근 실행 경로를 다시 실행하는 중…',
  });
}

function renderError(error) {
  const message = escapeHtml(error?.message || '알 수 없는 오류');

  for (const surface of Object.values(elements.surfaces)) {
    surface.innerHTML = `
      <div class="empty-state">
        <strong>런타임 사용 불가</strong>
        <p>${message}</p>
      </div>
    `;
  }
}

function render() {
  const data = getDerived();

  renderNav(data);
  renderControlOverview(data);

  for (const surfaceId of SURFACE_IDS) {
    elements.surfaces[surfaceId].classList.toggle('is-active', surfaceId === state.surface);
  }

  if (state.error) {
    renderError(state.error);
    return;
  }

  renderMission(data);
  renderCouncil(data);
  renderExecution(data);
  renderDeliverables(data);
  renderTaskboard(data);
  renderLogs(data);
  renderArtifacts(data);
  renderDecisionInbox(data);
}

document.addEventListener('click', async (event) => {
  const navButton = event.target.closest('[data-surface]');
  const navGroupButton = event.target.closest('[data-nav-group-tab]');
  const actionButton = event.target.closest('[data-action]');

  if (navGroupButton) {
    await handleNavGroupChange(navGroupButton.dataset.navGroupTab);
    return;
  }

  if (actionButton?.dataset.action === 'open-surface') {
    state.surface = actionButton.dataset.targetSurface || state.surface;
    render();
    return;
  }

  if (actionButton?.dataset.action === 'open-surface-for-mission') {
    if (actionButton.dataset.id) {
      syncSelectionsFromMission(actionButton.dataset.id);
    }

    state.surface = actionButton.dataset.targetSurface || 'mission';
    render();
    return;
  }

  if (actionButton?.dataset.action === 'open-company-seat') {
    const targetSurface = actionButton.dataset.targetSurface || 'mission';
    state.menuGroup = getNavGroupForSurface(targetSurface);
    state.surface = targetSurface;
    render();
    return;
  }

  if (actionButton?.dataset.action === 'set-ops-editor-group') {
    const targetGroup = actionButton.dataset.targetGroup;
    const normalizedTarget =
      targetGroup === 'all' || Object.prototype.hasOwnProperty.call(NAV_GROUPS, targetGroup)
        ? targetGroup
        : 'all';
    state.opsEditorGroup = normalizedTarget;

    if (normalizedTarget !== 'all') {
      const defaults = OPS_EDITOR_GROUP_DEFAULTS[normalizedTarget] || OPS_EDITOR_GROUP_DEFAULTS.workflows;
      state.companyMemberDraftRole = defaults.role;
      state.companyMemberDraftSurface = defaults.surface;
    }

    render();
    return;
  }

  if (navButton) {
    await handleSurfaceChange(navButton.dataset.surface);
    return;
  }

  if (actionButton) {
    try {
      if (actionButton.dataset.action === 'run-planner') {
        await runPlanner(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-architect') {
        await runArchitect(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-task-breaker') {
        await runTaskBreaker(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-preflight') {
        await runBuilderPreflight(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'request-builder-live-mutation-approval') {
        await requestBuilderLiveMutationApproval(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-live-mutation') {
        await runBuilderLiveMutation(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'set-task-worktree-ref') {
        await applySelectedTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'clear-task-worktree-ref') {
        await clearTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'switch-active-project-worktree') {
        await switchActiveProjectWorktree(actionButton.dataset.path);
        return;
      }

      if (actionButton.dataset.action === 'run-reviewer') {
        await runReviewer(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-commit-package') {
        await runCommitPackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-local-commit') {
        await runLocalCommit(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-release-package') {
        await runReleasePackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-close-out') {
        await runCloseOut(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-inbox-action') {
        await runInboxAction(actionButton.dataset.id, actionButton.dataset.verb);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-command') {
        await copyHarnessCommand(actionButton.dataset.command);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-output-path') {
        await copyHarnessExecutionOutputPath(actionButton.dataset.outputPath);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-input-path') {
        await copyHarnessExecutionInputPath(actionButton.dataset.inputPath);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-execution-preview') {
        await copyHarnessExecutionPreview(actionButton.dataset.previewText);
        return;
      }

      if (actionButton.dataset.action === 'hide-harness-execution-result') {
        hideHarnessExecutionResult(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'show-harness-execution-result') {
        showHarnessExecutionResult(actionButton, getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'restore-harness-execution-preview') {
        restoreHarnessExecutionPreview(actionButton, getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'clear-harness-execution-history') {
        await clearHarnessExecutionHistory(getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'reuse-harness-execution-paths') {
        reuseHarnessExecutionPaths(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'rerun-harness-execution-paths') {
        await rerunHarnessExecutionPaths(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'remove-company-member') {
        removeCompanyMember(actionButton.dataset.id);
        return;
      }

      await handleSelection(actionButton.dataset.action, actionButton.dataset.id);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '작업 처리에 실패했습니다.';
      render();
    }
  }
});

function handleFormInput(event) {
  const runHarnessOperatorActionForm = event.target.closest(
    '[data-form="run-harness-operator-action"]',
  );
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');
  const createCompanyMemberForm = event.target.closest('[data-form="create-company-member"]');

  if (runHarnessOperatorActionForm) {
    if (event.target.name === 'inputPath') {
      state.harnessExecutionDraftInputPath = event.target.value;
    }

    if (event.target.name === 'outputPath') {
      state.harnessExecutionDraftOutputPath = event.target.value;
    }

    return;
  }

  if (createLinkedWorktreeForm) {
    if (event.target.name === 'linkedWorktreeSlug') {
      state.linkedWorktreeDraftSlug = event.target.value;
    }

    return;
  }

  if (createProjectForm || createMissionProjectForm) {
    if (event.target.name === 'projectName') {
      state.projectDraftName = event.target.value;
    }

    if (event.target.name === 'projectPath') {
      state.projectDraftPath = event.target.value;
    }

    if (event.target.name === 'projectPack') {
      state.projectDraftPack =
        event.target.value === 'knowledge-work' ? 'knowledge-work' : 'development';
    }

    if (event.target.name === 'projectProviderMode') {
      state.projectDraftProviderMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'projectProviderModel') {
      state.projectDraftProviderModel = event.target.value;
    }

    if (event.target.name === 'projectProviderApiKeyVar') {
      state.projectDraftProviderApiKeyVar = event.target.value;
    }

    return;
  }

  if (updateProjectProviderForm) {
    if (event.target.name === 'editProjectProviderMode') {
      state.projectProviderDraftMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'editProjectProviderModel') {
      state.projectProviderDraftModel = event.target.value;
    }

    if (event.target.name === 'editProjectProviderApiKeyVar') {
      state.projectProviderDraftApiKeyVar = event.target.value;
    }

    return;
  }

  if (createMissionForm) {
    if (event.target.name === 'missionTitle') {
      state.missionDraftTitle = event.target.value;
    }

    if (event.target.name === 'missionGoal') {
      state.missionDraftGoal = event.target.value;
    }

    if (event.target.name === 'missionConstraints') {
      state.missionDraftConstraints = event.target.value;
    }

    if (event.target.name === 'missionDeliverableType') {
      state.missionDraftDeliverableType =
        event.target.value in KNOWLEDGE_WORK_DELIVERABLES
          ? event.target.value
          : 'decision-memo';
    }

    return;
  }

  if (createCompanyMemberForm) {
    if (event.target.name === 'companyMemberName') {
      state.companyMemberDraftName = event.target.value;
    }

    if (event.target.name === 'companyMemberRole') {
      state.companyMemberDraftRole = COMPANY_ROLE_OPTIONS.some((option) => option.value === event.target.value)
        ? event.target.value
        : 'builder';
    }

    if (event.target.name === 'companyMemberSurface') {
      state.companyMemberDraftSurface = COMPANY_DESK_OPTIONS.some((option) => option.surface === event.target.value)
        ? event.target.value
        : 'execution';
    }

    return;
  }

  if (!createTaskForm) {
    return;
  }

  if (event.target.name === 'title') {
    state.taskDraftTitle = event.target.value;
  }

  if (event.target.name === 'intent') {
    state.taskDraftIntent = event.target.value;
  }
}

document.addEventListener('input', handleFormInput);
document.addEventListener('change', handleFormInput);

document.addEventListener('submit', async (event) => {
  const runHarnessOperatorActionForm = event.target.closest(
    '[data-form="run-harness-operator-action"]',
  );
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');
  const createCompanyMemberForm = event.target.closest('[data-form="create-company-member"]');
  const updateCompanyMemberForm = event.target.closest('[data-form="update-company-member"]');

  if (runHarnessOperatorActionForm) {
    event.preventDefault();

    try {
      await runHarnessOperatorAction(runHarnessOperatorActionForm);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '하네스 실행에 실패했습니다.';
      render();
    }
    return;
  }

  if (createLinkedWorktreeForm) {
    event.preventDefault();

    try {
      await submitCreateLinkedWorktree();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '연결 워크트리 생성에 실패했습니다.';
      render();
    }
    return;
  }

  if (createProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '프로젝트 등록에 실패했습니다.';
      render();
    }
    return;
  }

  if (createMissionProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject({
        forceLocalStub: true,
        successSurface: 'mission',
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '미션용 프로젝트 등록에 실패했습니다.';
      render();
    }
    return;
  }

  if (updateProjectProviderForm) {
    event.preventDefault();

    try {
      await submitUpdateProjectProvider();
    } catch (error) {
      elements.refreshStatus.textContent =
        error.message || '프로젝트 프로바이더 설정 갱신에 실패했습니다.';
      render();
    }
    return;
  }

  if (createMissionForm) {
    event.preventDefault();

    try {
      await submitCreateMission();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '미션 생성에 실패했습니다.';
      render();
    }
    return;
  }

  if (createCompanyMemberForm) {
    event.preventDefault();

    try {
      addCompanyMember();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'AI 에이전트 추가에 실패했습니다.';
      render();
    }
    return;
  }

  if (updateCompanyMemberForm) {
    event.preventDefault();

    try {
      const formData = new FormData(updateCompanyMemberForm);
      updateCompanyMember(updateCompanyMemberForm.dataset.id, {
        name: String(formData.get('companyMemberEditName') || ''),
        role: String(formData.get('companyMemberEditRole') || ''),
        surface: String(formData.get('companyMemberEditSurface') || ''),
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '회사 인력 배정 저장에 실패했습니다.';
      render();
    }
    return;
  }

  if (!createTaskForm) {
    return;
  }

  event.preventDefault();

  try {
    await submitCreateTask();
  } catch (error) {
    elements.refreshStatus.textContent = error.message || '태스크 생성에 실패했습니다.';
    render();
  }
});

elements.refreshButton.addEventListener('click', async () => {
  await refreshData();
});

function registerQaHooks() {
  if (typeof window === 'undefined') {
    return;
  }

  window.__orchestrationQa = {
    getState() {
      return {
        loading: state.loading,
        menuGroup: state.menuGroup,
        mutating: state.mutating,
        selectedInboxItemId: state.selectedInboxItemId,
        selectedTaskId: state.selectedTaskId,
        surface: state.surface,
      };
    },
    openSurface(surface, options = {}) {
      if (!SURFACE_IDS.includes(surface)) {
        return false;
      }

      state.menuGroup = getNavGroupForSurface(surface);
      state.surface = surface;
      if (
        surface === 'taskboard' &&
        options &&
        typeof options === 'object' &&
        typeof options.taskId === 'string' &&
        options.taskId
      ) {
        syncSelectionsFromTask(options.taskId);
      }
      render();
      return true;
    },
  };
}

async function bootstrap() {
  render();
  await refreshData();
  state.timerId = window.setInterval(refreshData, 5000);
}

registerQaHooks();
void bootstrap();
