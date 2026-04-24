export const harnesses = [
  {
    id: 'markitdown',
    posture: 'approved-now',
    kind: 'local-cli-wrapper',
    command: 'markitdown',
    checkArgs: ['--version'],
    note: 'Document-to-Markdown preprocessing only. Keep explicit and local.',
    installReview: 'pipx install markitdown',
    runner: 'scripts/markitdown-convert.mjs',
  },
  {
    id: 'mempalace',
    posture: 'future-post-v1',
    kind: 'local-memory-harness',
    command: 'mempalace',
    checkArgs: ['status'],
    note: 'Local memory harness signal. Not part of the v1 runtime path.',
    installReview: 'pip install mempalace',
  },
  {
    id: 'hermes-agent',
    posture: 'signal-only',
    kind: 'multi-provider-agent-platform',
    command: 'hermes',
    checkArgs: ['--help'],
    note: 'Reference only. Do not adopt its multi-provider or messaging gateway posture into v1.',
    installReview: 'review upstream install flow before any local experiment',
  },
  {
    id: 'free-code',
    posture: 'signal-only',
    kind: 'multi-provider-cli-fork',
    command: 'free-code',
    checkArgs: ['--help'],
    note: 'Reference only. Avoid making curl|bash or guardrail removal the default repo guidance.',
    installReview: 'review install.sh locally before any manual trial',
  },
];

export function getHarness(harnessId) {
  return harnesses.find((harness) => harness.id === harnessId) ?? null;
}
