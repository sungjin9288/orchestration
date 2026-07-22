export const MISSION_COUNCIL_MODE_OPTIONS = Object.freeze([
  Object.freeze({
    label: '기본',
    value: 'legacy-deterministic',
  }),
  Object.freeze({
    label: '독립 역할',
    value: 'real-local-stub',
  }),
  Object.freeze({
    label: 'OpenAI',
    value: 'real-openai-responses',
  }),
]);

const MODE_HELP = Object.freeze({
  'legacy-deterministic': '기본 회의 초안을 함께 만들고 승인 전까지 실행을 멈춥니다.',
  'real-local-stub': '로컬에서 역할별 의견을 분리하고 Conductor synthesis까지 진행합니다.',
  'real-openai-responses': '준비된 OpenAI 역할 회의를 시작하고 사람 정렬 승인에서 멈춥니다.',
});

export function createMissionCouncilModeView(options = {}) {
  const knowledgeWork = options.knowledgeWork === true;
  const providerReady = options.providerReady === true;
  const requestedMode = String(options.requestedMode || 'legacy-deterministic');
  const modeOptions = MISSION_COUNCIL_MODE_OPTIONS
    .filter((entry) => !knowledgeWork || entry.value === 'legacy-deterministic')
    .map((entry) => ({
      ...entry,
      disabled: entry.value === 'real-openai-responses' && !providerReady,
    }));
  const selectedMode = modeOptions.some(
    (entry) => entry.value === requestedMode && !entry.disabled,
  )
    ? requestedMode
    : 'legacy-deterministic';

  return {
    help: MODE_HELP[selectedMode],
    options: modeOptions,
    providerBlockedReason:
      !knowledgeWork && !providerReady
        ? String(options.providerBlockedReason || 'provider readiness가 준비되지 않았습니다.')
        : '',
    selectedMode,
  };
}
