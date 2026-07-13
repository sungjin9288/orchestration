'use strict';

const {
  normalizeRequiredString,
  normalizeRequiredStringArray,
  normalizeIsoTimestamp,
} = require('./normalizers');

const PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_ID =
  'operator-decision-vnext-proposal-generation-implementation-001';
const PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_STATUS =
  'approve-proposal-generation-implementation-slice';
const PROPOSAL_DRAFT_TARGET_AUTHORITY =
  'deterministic local inert proposal draft generation implementation';
const PROPOSAL_DRAFT_CANDIDATE_ID = 'growth-evidence-ledger-proposal-readiness-candidate';
const PROPOSAL_DRAFT_CANDIDATE_KIND = 'proposal-queue-handoff';
const PROPOSAL_DRAFT_READINESS_STATUS = 'ready-for-proposal-readiness-review';
const PROPOSAL_DRAFT_STATUS = 'draft-only';
const PROPOSAL_DRAFT_BLOCKED_ACTIONS = [
  'apply-proposal',
  'mutate-proposal-queue',
  'call-provider',
  'persist-memory',
  'mutate-source',
  'commit',
  'push',
];

function normalizeProposalDraftApproval(input) {
  const approval = input && typeof input === 'object' ? input : null;

  if (!approval) {
    throw new Error('generationApproval is required');
  }

  const decisionId = normalizeRequiredString(approval.decisionId, 'generationApproval.decisionId');
  const decisionStatus = normalizeRequiredString(
    approval.decisionStatus,
    'generationApproval.decisionStatus',
  );
  const targetAuthority = normalizeRequiredString(
    approval.targetAuthority,
    'generationApproval.targetAuthority',
  );
  const approvalStatement = normalizeRequiredString(
    approval.approvalStatement,
    'generationApproval.approvalStatement',
  );

  if (decisionId !== PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_ID) {
    throw new Error('generationApproval.decisionId must name the approved implementation slice');
  }

  if (decisionStatus !== PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_STATUS) {
    throw new Error(
      'generationApproval.decisionStatus must approve the proposal draft implementation slice',
    );
  }

  if (targetAuthority !== PROPOSAL_DRAFT_TARGET_AUTHORITY) {
    throw new Error('generationApproval.targetAuthority must match the approved draft authority');
  }

  if (!/approve implementation only/i.test(approvalStatement)) {
    throw new Error('generationApproval.approvalStatement must approve implementation only');
  }

  for (const blockedAuthority of [
    'durable record creation',
    'proposal application',
    'provider calls',
    'memory persistence',
    'source mutation',
    'commit',
    'push',
  ]) {
    if (!new RegExp(`does not approve[\\s\\S]*${blockedAuthority}`, 'i').test(approvalStatement)) {
      throw new Error(
        `generationApproval.approvalStatement must keep ${blockedAuthority} blocked`,
      );
    }
  }

  return {
    decisionId,
    decisionStatus,
    targetAuthority,
  };
}

function normalizeEvidenceFreshness(input, evaluationAt) {
  const freshness = input && typeof input === 'object' ? input : null;

  if (!freshness) {
    throw new Error('evidenceFreshness is required');
  }

  const verifiedAt = normalizeIsoTimestamp(freshness.verifiedAt, 'evidenceFreshness.verifiedAt');
  const expiresAt = normalizeIsoTimestamp(freshness.expiresAt, 'evidenceFreshness.expiresAt');
  const evaluatedAt = normalizeIsoTimestamp(evaluationAt, 'evaluationAt');

  if (Date.parse(verifiedAt) > Date.parse(expiresAt)) {
    throw new Error('evidenceFreshness.verifiedAt must not be after evidenceFreshness.expiresAt');
  }

  if (Date.parse(expiresAt) <= Date.parse(evaluatedAt)) {
    throw new Error('evidenceFreshness is stale at evaluationAt');
  }

  return { verifiedAt, expiresAt, evaluatedAt };
}

function normalizeProposalDraftCandidate(input) {
  const candidate = input && typeof input === 'object' ? input : null;

  if (!candidate) {
    throw new Error('candidate is required');
  }

  const candidateId = normalizeRequiredString(candidate.candidateId, 'candidate.candidateId');
  const candidateKind = normalizeRequiredString(candidate.candidateKind, 'candidate.candidateKind');
  const readinessStatus = normalizeRequiredString(
    candidate.readinessStatus,
    'candidate.readinessStatus',
  );

  if (candidateId !== PROPOSAL_DRAFT_CANDIDATE_ID) {
    throw new Error('candidate.candidateId must be the approved Growth Evidence Ledger candidate');
  }

  if (candidateKind !== PROPOSAL_DRAFT_CANDIDATE_KIND) {
    throw new Error('candidate.candidateKind must be proposal-queue-handoff');
  }

  if (readinessStatus !== PROPOSAL_DRAFT_READINESS_STATUS) {
    throw new Error('candidate.readinessStatus must be ready-for-proposal-readiness-review');
  }

  return {
    candidateId,
    sourceFindingId: normalizeRequiredString(candidate.sourceFindingId, 'candidate.sourceFindingId'),
    evidenceRefs: normalizeRequiredStringArray(candidate.evidenceRefs, 'candidate.evidenceRefs'),
    negativeEvidenceRefs: normalizeRequiredStringArray(
      candidate.negativeEvidenceRefs,
      'candidate.negativeEvidenceRefs',
    ),
    routeRefs: normalizeRequiredStringArray(candidate.routeRefs, 'candidate.routeRefs'),
    sourceRefs: normalizeRequiredStringArray(candidate.sourceRefs, 'candidate.sourceRefs'),
    verificationRefs: normalizeRequiredStringArray(
      candidate.verificationRefs,
      'candidate.verificationRefs',
    ),
    blockedActions: normalizeRequiredStringArray(candidate.blockedActions, 'candidate.blockedActions'),
    riskClass: normalizeRequiredString(candidate.riskClass, 'candidate.riskClass'),
    reviewQuestion: normalizeRequiredString(
      candidate.humanReviewQuestion,
      'candidate.humanReviewQuestion',
    ),
  };
}

function normalizeBlockedActions(candidateBlockedActions) {
  return [
    ...candidateBlockedActions,
    ...PROPOSAL_DRAFT_BLOCKED_ACTIONS.filter((action) => !candidateBlockedActions.includes(action)),
  ];
}

function createDeterministicProposalDraft(input = {}) {
  const generationApproval = normalizeProposalDraftApproval(input.generationApproval);
  const candidate = normalizeProposalDraftCandidate(input.candidate);
  const evidenceFreshness = normalizeEvidenceFreshness(input.evidenceFreshness, input.evaluationAt);

  return {
    schemaVersion: 'orchestration.proposal-draft/v1',
    candidateId: candidate.candidateId,
    sourceFindingId: candidate.sourceFindingId,
    evidenceRefs: candidate.evidenceRefs,
    negativeEvidenceRefs: candidate.negativeEvidenceRefs,
    routeRefs: candidate.routeRefs,
    sourceRefs: candidate.sourceRefs,
    verificationRefs: candidate.verificationRefs,
    blockedActions: normalizeBlockedActions(candidate.blockedActions),
    riskClass: candidate.riskClass,
    reviewQuestion: candidate.reviewQuestion,
    evidenceFreshness,
    generationApprovalRef: generationApproval.decisionId,
    draftStatus: PROPOSAL_DRAFT_STATUS,
    applyAllowed: false,
    nonApprovalStatement:
      'This inert draft is not approval, durable record creation, queue mutation, or proposal application.',
  };
}

module.exports = {
  PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_ID,
  PROPOSAL_DRAFT_IMPLEMENTATION_DECISION_STATUS,
  PROPOSAL_DRAFT_TARGET_AUTHORITY,
  PROPOSAL_DRAFT_CANDIDATE_ID,
  PROPOSAL_DRAFT_STATUS,
  createDeterministicProposalDraft,
};
