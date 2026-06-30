export const GROWTH_AUTHORITY_BOUNDARY = Object.freeze({
  commitPushAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  longTermMemoryStoreAllowed: false,
  memoryPersistenceAllowed: false,
  proposalApplicationAllowed: false,
  proposalApplicationAttemptCreationAllowed: false,
  proposalApplicationAttemptPersistenceAllowed: false,
  proposalGenerationAllowed: false,
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
  providerCallsAllowed: false,
  rawTranscriptIngestionAllowed: false,
  skillPromotionAllowed: false,
  sourceMutationAllowed: false,
});

export const PROPOSAL_RECORD_OPEN_REQUIREMENTS = Object.freeze([
  '생성은 승인된 implementation slice 함수로만 가능합니다',
  'id, 상태, 시각, 원천, 증거 참조를 runtime state에 남깁니다',
  '이 검토 게이트는 제안 승인과 분리됩니다',
  '장기 기억 전에 redaction, export, expiry 규칙이 필요합니다',
]);

export const MEMORY_STORE_OPEN_REQUIREMENTS = Object.freeze([
  '원문 transcript 수집은 금지 상태로 둡니다',
  '기억 항목마다 원천, 증거, 적용 범위가 필요합니다',
  '민감정보 제거, 내보내기, 만료 규칙이 먼저 있어야 합니다',
  '스킬 승격은 별도 리뷰와 검증 명령이 필요합니다',
]);
