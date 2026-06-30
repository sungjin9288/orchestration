export const proposalApplicationSourceMutationDecisionId =
  'proposal-application-source-mutation-decision-required';

export const proposalApplicationSourceMutationDecisionSlice =
  'proposal application source mutation decision required';

export const operatorDecisionGate = 'operator decision required';

export const proposalApplicationDecisionGate = 'proposal application decision required';

export const proposalApplicationImplementationDecisionGate =
  'proposal application implementation decision required';

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
