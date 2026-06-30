export const proposalApplicationSourceMutationDecisionId =
  'proposal-application-source-mutation-decision-required';

export const proposalApplicationSourceMutationDecisionSlice =
  'proposal application source mutation decision required';

export const proposalApplicationSourceMutationOperatorHandoffSlice =
  'proposal application source mutation operator handoff required';

export const proposalApplicationSourceMutationDecisionRequiredInput =
  'operator-provided proposal application source mutation decision for exactly one source mutation planning path';

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
