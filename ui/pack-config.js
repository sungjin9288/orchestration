export const PACK_DISPLAY_NAMES = {
  development: 'development',
  'knowledge-work': 'knowledge-work',
};

export const PACK_HELP_COPY = {
  development:
    '코드, 설정, 테스트, 리팩터링처럼 repo mutation이 중심인 실행 팩입니다.',
  'knowledge-work':
    '의사결정 메모, PRD, 실행 계획, 운영 체크리스트처럼 문서·기획·판단이 중심인 실행 팩입니다.',
};

export const KNOWLEDGE_WORK_DELIVERABLES = {
  checklist: '체크리스트',
  'decision-memo': '의사결정 메모',
  'execution-plan': '실행 계획서',
  prd: 'PRD',
  'research-brief': '리서치 브리프',
};

export function getPackDisplayName(pack) {
  return PACK_DISPLAY_NAMES[pack] || pack || 'development';
}

export function getKnowledgeWorkDeliverableDisplayName(type) {
  return KNOWLEDGE_WORK_DELIVERABLES[type] || KNOWLEDGE_WORK_DELIVERABLES['decision-memo'];
}
