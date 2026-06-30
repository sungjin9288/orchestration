export const SURFACE_IDS = [
  'mission',
  'council',
  'execution',
  'deliverables',
  'taskboard',
  'logs',
  'artifacts',
  'decision-inbox',
];

export const SURFACE_DISPLAY_NAMES = {
  artifacts: '아티팩트',
  council: '협의회',
  'decision-inbox': '결정함',
  deliverables: '산출물',
  execution: '실행',
  logs: '로그',
  mission: '미션',
  taskboard: '작업판',
};

export function getSurfaceDisplayName(surface) {
  return SURFACE_DISPLAY_NAMES[surface] || surface || '현재 표면';
}

export const SURFACE_NAV_GUIDANCE = {
  artifacts: '작업 증적, 파일, 패킷 근거를 확인',
  council: '역할별 의견과 실행 권고안을 정렬',
  'decision-inbox': '승인·보류가 필요한 사람 판단을 처리',
  deliverables: '완료 결과와 인계 패킷을 확인',
  execution: '진행 중 작업, 막힘, 다음 실행을 확인',
  logs: '실행 run 기록과 오류 흐름을 추적',
  mission: '목표와 제약을 입력하고 첫 안건을 확인',
  taskboard: '작업 셀 상태와 담당 desk 배정을 관제',
};

export const SURFACE_LOCATION_GUIDANCE = {
  artifacts: {
    check: '파일·패킷·provenance',
    next: '결정 필요 시 결정함',
    nextHint: '승인·보류·해결이 필요하면 결정함 큐가 열립니다.',
    resultSurface: 'deliverables',
    resultHint: '최종 결과 패킷과 전달 상태는 산출물에서 확인합니다.',
    targetSurface: 'decision-inbox',
  },
  council: {
    check: '역할별 의견·권고안',
    next: '실행 셀',
    nextHint: '역할별 결론 이후 실행 지시 보드가 열립니다.',
    resultSurface: 'deliverables',
    resultHint: '회의 이후 완성된 결과 패킷은 산출물에서 확인합니다.',
    targetSurface: 'execution',
  },
  'decision-inbox': {
    check: '승인·보류·해결 대기',
    next: '승인 후 원래 desk',
    nextHint: '결정 처리 후에는 원래 작업 desk로 돌아가 흐름을 이어갑니다.',
    resultSurface: 'artifacts',
    resultHint: '승인 근거와 연결 증적은 아티팩트에서 확인합니다.',
  },
  deliverables: {
    check: '완료 결과·인계 패킷',
    next: '아티팩트',
    nextHint: '결과를 뒷받침하는 원문 증적과 연결 근거가 열립니다.',
    resultSurface: 'artifacts',
    resultHint: '검토 가능한 원문 증적과 패킷 근거는 아티팩트에 남습니다.',
    targetSurface: 'artifacts',
  },
  execution: {
    check: '진행 작업·막힘·다음 실행',
    next: '산출물',
    nextHint: '실행 결과가 패킷으로 정리된 전달 데스크가 열립니다.',
    resultSurface: 'deliverables',
    resultHint: '실행으로 만든 작업 결과는 산출물 패킷에서 확인합니다.',
    targetSurface: 'deliverables',
  },
  logs: {
    check: 'run 기록·오류 흐름',
    next: '아티팩트',
    nextHint: '선택한 run에서 나온 증적 패킷이 열립니다.',
    resultSurface: 'artifacts',
    resultHint: 'run이 만든 원문 증적과 연결 근거는 아티팩트에서 확인합니다.',
    targetSurface: 'artifacts',
  },
  mission: {
    check: '목표·제약·첫 안건',
    next: '협의회',
    nextHint: '목표와 제약을 역할별 의견으로 정렬하는 회의실이 열립니다.',
    resultSurface: 'deliverables',
    resultHint: '최종 작업 결과와 인계 패킷은 산출물에서 확인합니다.',
    targetSurface: 'council',
  },
  taskboard: {
    check: '작업 셀·담당 desk',
    next: '실행 또는 검토',
    nextHint: '현재 작업 셀의 실행 보드가 열리고 필요한 검토선으로 이어집니다.',
    resultSurface: 'deliverables',
    resultHint: '작업 셀의 완료 결과는 산출물에서 확인합니다.',
    targetSurface: 'execution',
  },
};

export const NAV_GROUPS = {
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

export const NAV_GROUP_ORDER = Object.keys(NAV_GROUPS);

const SURFACE_TO_NAV_GROUP = Object.fromEntries(
  Object.entries(NAV_GROUPS).flatMap(([groupId, group]) =>
    group.surfaces.map((surface) => [surface, groupId]),
  ),
);

export const SURFACE_DOCK_METADATA = {
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

export const GROUP_WORKSPACE_META = {
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

export const GROUP_PLAYBOOK_META = {
  workflows: {
    label: '한눈에 사용법',
    title: '업무 사용 순서',
    copy: '왼쪽 버튼을 누르면 해당 desk만 열립니다. 작업 결과는 산출물, 근거는 아티팩트, 실행 흐름은 로그에서 확인합니다.',
    cards: [
      {
        step: '01',
        title: '안건 정리',
        note: '문제와 제약만 먼저 고정',
        surfaces: ['mission'],
        where: '확인: 미션',
      },
      {
        step: '02',
        title: '계획 정렬',
        note: '협의회에서 담당과 실행 셀 확정',
        surfaces: ['council', 'execution'],
        where: '확인: 협의회 → 실행',
      },
      {
        step: '03',
        title: '실행 인계',
        note: '결과·근거·실행 흐름을 같은 자리에서 추적',
        surfaces: ['deliverables', 'artifacts', 'logs'],
        where: '확인: 산출물 → 아티팩트 → 로그',
      },
    ],
  },
  review: {
    label: '한눈에 사용법',
    title: '검토 사용 순서',
    copy: '승인이 필요하면 결정함, 실제 작업 근거는 아티팩트, 실행 중 무슨 일이 있었는지는 로그에서 봅니다.',
    cards: [
      {
        step: '01',
        title: '패킷 선택',
        note: '열린 증적 하나만 집음',
        surfaces: ['artifacts'],
        where: '확인: 아티팩트',
      },
      {
        step: '02',
        title: '근거 교차',
        note: 'run·gate·artifact 같이 확인',
        surfaces: ['logs'],
        where: '확인: 로그 + 결정함',
      },
      {
        step: '03',
        title: '판단 반영',
        note: '승인선 또는 다음 desk 결정',
        surfaces: ['decision-inbox'],
        where: '확인: 결정함',
      },
    ],
  },
  ops: {
    label: '한눈에 사용법',
    title: '운영 사용 순서',
    copy: '작업판은 세부 실행 셀의 관제 위치입니다. 여기서 담당 desk와 역할을 정리하고 실제 결과 확인은 산출물·아티팩트로 돌아갑니다.',
    cards: [
      {
        step: '01',
        title: '범위 선택',
        note: '업무·검토·운영 중 한 범위 편집',
        surfaces: ['taskboard'],
        where: '확인: 작업판',
      },
      {
        step: '02',
        title: '역할 배정',
        note: 'agent 역할과 desk 지정',
        surfaces: ['taskboard'],
        where: '확인: 회사 디렉터리',
      },
      {
        step: '03',
        title: '조직 반영',
        note: 'roster와 회사 구조 갱신',
        surfaces: ['taskboard'],
        where: '확인: 사이드바 상태',
      },
    ],
  },
};

export function getNavGroupForSurface(surface) {
  return SURFACE_TO_NAV_GROUP[surface] || 'workflows';
}

export function getNavGroupLabel(groupId) {
  return NAV_GROUPS[groupId]?.label || NAV_GROUPS.workflows.label;
}
