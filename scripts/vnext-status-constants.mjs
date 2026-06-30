export const proposalApplicationSourceMutationDecisionId =
  'proposal-application-source-mutation-decision-required';

export const proposalApplicationSourceMutationDecisionSlice =
  'proposal application source mutation decision required';

export const proposalApplicationSourceMutationOperatorHandoffSlice =
  'proposal application source mutation operator handoff required';

export const proposalApplicationSourceMutationFieldedDecisionSlice =
  'proposal application source mutation fielded decision required';

export const proposalApplicationSourceMutationDecisionRequiredInput =
  'operator-provided proposal application source mutation decision for exactly one source mutation planning path';

export const proposalApplicationSourceMutationDecisionOptions = [
  'approve-source-mutation-planning-only',
  'approve-source-mutation-implementation-slice',
  'request-more-evidence',
  'reject',
  'defer',
];

function formatDecisionOptionsForOperatorInput(options) {
  const primaryOptions = options.slice(0, -1);
  const fallbackOption = options[options.length - 1];

  return `${primaryOptions.join(', ')}, or ${fallbackOption}`;
}

export const proposalApplicationSourceMutationFieldedDecisionRequiredInput =
  `operator-provided ${formatDecisionOptionsForOperatorInput(proposalApplicationSourceMutationDecisionOptions)} decision`;

export const proposalApplicationSourceMutationInvalidShortcutPhrases = [
  'continue',
  'proceed',
  'do everything',
  'approve all',
  'implement vNext',
  'apply the proposal',
  'mutate source',
  'ship it',
];

export const proposalApplicationSourceMutationDecisionRequiredFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'applicationAttemptRefs',
  'mutationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

export const proposalApplicationSourceMutationBlockedAuthorityMarkers = [
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'longTermMemoryStoreAllowed: false',
  'rawTranscriptIngestionAllowed: false',
  'crossWorkspaceMemoryAllowed: false',
  'skillPromotionAllowed: false',
  'proposalGenerationAllowed: false',
  'proposalApplicationAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

export const proposalApplicationSourceMutationForbiddenActionPatterns = [
  /data-action="apply-proposal"/,
  /data-action="approve-proposal"/,
  /data-action="generate-growth-proposal"/,
  /data-action="mutate-growth-source"/,
  /data-action="persist-growth-memory"/,
  /proposalApplicationAllowed: true/,
  /proposalGenerationAllowed: true/,
  /sourceMutationAllowed: true/,
];

export function createProposalApplicationSourceMutationBlockedAuthorityBoundary(
  extraAuthority = {},
) {
  return {
    ...extraAuthority,
    sourceMutationPlanningAllowed: false,
    sourceMutationImplementationAllowed: false,
    proposalApplicationAllowed: false,
    proposalGenerationAllowed: false,
    proposalQueueMutationAllowed: false,
    providerCallsAllowed: false,
    memoryPersistenceAllowed: false,
    longTermMemoryStoreAllowed: false,
    rawTranscriptIngestionAllowed: false,
    crossWorkspaceMemoryAllowed: false,
    skillPromotionAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  };
}

export const operatorDecisionGate = 'operator decision required';

export const proposalApplicationDecisionGate = 'proposal application decision required';

export const proposalApplicationImplementationDecisionGate =
  'proposal application implementation decision required';

export const durableProposalRecordCreationCandidate =
  'durable proposal record creation and persistence';

export const durableProposalRecordDecisionId =
  'operator-decision-vnext-proposal-record-001';

export const proposalApplicationDecisionRequiredInput =
  'operator-provided proposal application decision for created durable proposal records';

export const proposalApplicationImplementationDecisionRequiredInput =
  'operator-provided application implementation decision for exactly one durable proposal record application path';

export const proposalApplicationPlanningDecisionId =
  'operator-decision-vnext-proposal-application-001';

export const proposalApplicationPlanningTargetAuthority =
  'proposal application planning for existing durable proposal records';

export function createProposalApplicationSourceMutationDecision({
  command = null,
  reason,
} = {}) {
  return {
    id: proposalApplicationSourceMutationDecisionId,
    slice: proposalApplicationSourceMutationDecisionSlice,
    ...(command ? { command } : {}),
    ...(reason ? { reason } : {}),
  };
}
