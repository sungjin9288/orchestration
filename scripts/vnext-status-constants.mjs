export const proposalApplicationSourceMutationDecisionId =
  'proposal-application-source-mutation-decision-required';

export const proposalApplicationSourceMutationDecisionSlice =
  'proposal application source mutation decision required';

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
