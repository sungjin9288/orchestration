'use strict';

const {
  APPROVAL_STATUS,
  PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_RECORD_STATUS,
} = require('./contracts');
const {
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeRequiredStringArray,
  normalizeIsoTimestamp,
} = require('./normalizers');

const proposalRecordDefaultBlockedActions = [...PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS];
const proposalApplicationAttemptDefaultBlockedActions = [
  ...PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS,
];
const proposalApplicationAttemptApprovalStatus =
  'approve-application-implementation-slice';
const proposalApplicationAttemptTargetAuthority =
  'proposal application implementation for one audit-only attempt path on existing durable proposal records';
const proposalApplicationAttemptStillBlockedAuthorities = [
  'proposal generation',
  'provider calls',
  'memory persistence',
  'source mutation',
  'commit',
  'push',
];
const proposalSourceMutationApprovalStatus = 'approve-source-mutation-implementation-slice';
const proposalSourceMutationTargetAuthority =
  'proposal application source mutation implementation for exactly one accepted mutation plan';
const proposalSourceMutationStillBlockedAuthorities = [
  'proposal generation',
  'provider calls',
  'memory persistence',
  'source mutation outside the named path',
  'commit',
  'push',
];
const proposalSourceMutationDefaultBlockedActions = [
  'proposal-generation',
  'provider-call',
  'memory-persistence',
  'source-mutation-outside-named-path',
  'commit',
  'push',
];

function defaultProposalRecordExpiry(createdAt) {
  const expiry = new Date(Date.parse(createdAt));
  expiry.setUTCDate(expiry.getUTCDate() + 30);
  return expiry.toISOString();
}

function normalizeProposalRecordCreationApproval(input) {
  const approval = input && typeof input === 'object' ? input : null;

  if (!approval) {
    throw new Error('creationApproval is required');
  }

  const status = normalizeRequiredString(approval.status, 'creationApproval.status');
  const decisionId = normalizeRequiredString(approval.decisionId, 'creationApproval.decisionId');
  const targetAuthority = normalizeRequiredString(
    approval.targetAuthority,
    'creationApproval.targetAuthority',
  );
  const approvalStatement = normalizeRequiredString(
    approval.approvalStatement,
    'creationApproval.approvalStatement',
  );

  if (status !== APPROVAL_STATUS.APPROVED) {
    throw new Error('creationApproval.status must be approved');
  }

  if (targetAuthority !== 'durable proposal record creation and persistence') {
    throw new Error(
      'creationApproval.targetAuthority must be durable proposal record creation and persistence',
    );
  }

  if (!/approve implementation only/i.test(approvalStatement)) {
    throw new Error('creationApproval.approvalStatement must approve implementation only');
  }

  if (!/does not approve proposal application/i.test(approvalStatement)) {
    throw new Error('creationApproval.approvalStatement must keep proposal application blocked');
  }

  return {
    decisionId,
    status,
    targetAuthority,
    approvalStatement,
    approvedAt: approval.approvedAt
      ? normalizeIsoTimestamp(approval.approvedAt, 'creationApproval.approvedAt')
      : null,
  };
}

function normalizeProposalRecordVerificationPlan(value) {
  const verificationPlan = value && typeof value === 'object' ? value : null;

  if (!verificationPlan) {
    throw new Error('verificationPlan is required');
  }

  return {
    commands: normalizeRequiredStringArray(verificationPlan.commands, 'verificationPlan.commands'),
    expectedSignals: normalizeRequiredStringArray(
      verificationPlan.expectedSignals,
      'verificationPlan.expectedSignals',
    ),
    failureStopCondition: normalizeRequiredString(
      verificationPlan.failureStopCondition,
      'verificationPlan.failureStopCondition',
    ),
    focusedSmokes: Array.isArray(verificationPlan.focusedSmokes)
      ? normalizeRequiredStringArray(
          verificationPlan.focusedSmokes,
          'verificationPlan.focusedSmokes',
        )
      : [],
    aggregateChecks: Array.isArray(verificationPlan.aggregateChecks)
      ? normalizeRequiredStringArray(
          verificationPlan.aggregateChecks,
          'verificationPlan.aggregateChecks',
        )
      : [],
    manualReviewNotes: normalizeOptionalString(verificationPlan.manualReviewNotes),
  };
}

function normalizeProposalRecordBlockedActions(value) {
  const requestedActions = Array.isArray(value)
    ? normalizeRequiredStringArray(value, 'blockedActions')
    : [];
  const actionSet = new Set([...proposalRecordDefaultBlockedActions, ...requestedActions]);

  return proposalRecordDefaultBlockedActions
    .filter((action) => actionSet.has(action))
    .concat(requestedActions.filter((action) => !proposalRecordDefaultBlockedActions.includes(action)));
}

function normalizeProposalApplicationApproval(input) {
  const approval = input && typeof input === 'object' ? input : null;

  if (!approval) {
    throw new Error('applicationApproval is required');
  }

  const decisionId = normalizeRequiredString(
    approval.decisionId,
    'applicationApproval.decisionId',
  );
  const decisionStatus = normalizeRequiredString(
    approval.decisionStatus,
    'applicationApproval.decisionStatus',
  );
  const status = normalizeOptionalString(approval.status) || APPROVAL_STATUS.APPROVED;
  const targetAuthority = normalizeRequiredString(
    approval.targetAuthority,
    'applicationApproval.targetAuthority',
  );
  const approvalStatement = normalizeRequiredString(
    approval.approvalStatement,
    'applicationApproval.approvalStatement',
  );

  if (status !== APPROVAL_STATUS.APPROVED) {
    throw new Error('applicationApproval.status must be approved');
  }

  if (decisionStatus !== proposalApplicationAttemptApprovalStatus) {
    throw new Error(
      'applicationApproval.decisionStatus must be approve-application-implementation-slice',
    );
  }

  if (targetAuthority !== proposalApplicationAttemptTargetAuthority) {
    throw new Error(
      'applicationApproval.targetAuthority must approve the audit-only proposal application attempt path',
    );
  }

  if (!/approve implementation only/i.test(approvalStatement)) {
    throw new Error('applicationApproval.approvalStatement must approve implementation only');
  }

  for (const blockedAuthority of proposalApplicationAttemptStillBlockedAuthorities) {
    const blockedAuthorityPattern = new RegExp(
      `does not approve[\\s\\S]*${blockedAuthority}`,
      'i',
    );

    if (!blockedAuthorityPattern.test(approvalStatement)) {
      throw new Error(
        `applicationApproval.approvalStatement must keep ${blockedAuthority} blocked`,
      );
    }
  }

  return {
    decisionId,
    decisionStatus,
    status,
    targetAuthority,
    approvalStatement,
    approvedAt: approval.approvedAt
      ? normalizeIsoTimestamp(approval.approvedAt, 'applicationApproval.approvedAt')
      : null,
  };
}

function normalizeProposalApplicationAttemptBlockedActions(value) {
  const requestedActions = Array.isArray(value)
    ? normalizeRequiredStringArray(value, 'blockedActions')
    : [];
  const actionSet = new Set([
    ...proposalApplicationAttemptDefaultBlockedActions,
    ...requestedActions,
  ]);

  return proposalApplicationAttemptDefaultBlockedActions
    .filter((action) => actionSet.has(action))
    .concat(
      requestedActions.filter(
        (action) => !proposalApplicationAttemptDefaultBlockedActions.includes(action),
      ),
    );
}

function assertProposalRecordCanReceiveApplicationAttempt(proposalRecord, now) {
  if (proposalRecord.status !== PROPOSAL_RECORD_STATUS.CREATED) {
    throw new Error('proposalRecord.status must be created');
  }

  if (proposalRecord.applyAllowed !== false) {
    throw new Error('proposalRecord.applyAllowed must remain false');
  }

  if (!proposalRecord.expiresAt || Date.parse(proposalRecord.expiresAt) <= Date.parse(now)) {
    throw new Error('proposalRecord must not be expired');
  }

  for (const [fieldName, value] of Object.entries({
    sourceClaimIds: proposalRecord.sourceClaimIds,
    evidenceRefs: proposalRecord.evidenceRefs,
    negativeEvidenceRefs: proposalRecord.negativeEvidenceRefs,
    reviewerRefs: proposalRecord.reviewerRefs,
    approvalRefs: proposalRecord.approvalRefs,
    affectedFiles: proposalRecord.affectedFiles,
    blockedActions: proposalRecord.blockedActions,
  })) {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`proposalRecord.${fieldName} must be a non-empty array`);
    }
  }

  if (
    !proposalRecord.verificationPlan ||
    !Array.isArray(proposalRecord.verificationPlan.commands) ||
    proposalRecord.verificationPlan.commands.length === 0
  ) {
    throw new Error('proposalRecord.verificationPlan.commands must be a non-empty array');
  }

  if (
    Array.isArray(proposalRecord.applicationAttemptIds) &&
    proposalRecord.applicationAttemptIds.length > 0
  ) {
    throw new Error('proposalRecord already has an application attempt');
  }
}

function normalizeProposalSourceMutationApproval(input) {
  const approval = input && typeof input === 'object' ? input : null;

  if (!approval) {
    throw new Error('sourceMutationApproval is required');
  }

  const decisionId = normalizeRequiredString(
    approval.decisionId,
    'sourceMutationApproval.decisionId',
  );
  const decisionStatus = normalizeRequiredString(
    approval.decisionStatus,
    'sourceMutationApproval.decisionStatus',
  );
  const status = normalizeOptionalString(approval.status) || APPROVAL_STATUS.APPROVED;
  const targetAuthority = normalizeRequiredString(
    approval.targetAuthority,
    'sourceMutationApproval.targetAuthority',
  );
  const approvalStatement = normalizeRequiredString(
    approval.approvalStatement,
    'sourceMutationApproval.approvalStatement',
  );

  if (status !== APPROVAL_STATUS.APPROVED) {
    throw new Error('sourceMutationApproval.status must be approved');
  }

  if (decisionStatus !== proposalSourceMutationApprovalStatus) {
    throw new Error(
      'sourceMutationApproval.decisionStatus must be approve-source-mutation-implementation-slice',
    );
  }

  if (targetAuthority !== proposalSourceMutationTargetAuthority) {
    throw new Error(
      'sourceMutationApproval.targetAuthority must approve exactly one accepted mutation plan',
    );
  }

  if (!/approve implementation only/i.test(approvalStatement)) {
    throw new Error('sourceMutationApproval.approvalStatement must approve implementation only');
  }

  for (const blockedAuthority of proposalSourceMutationStillBlockedAuthorities) {
    const blockedAuthorityPattern = new RegExp(
      `does not approve[\\s\\S]*${blockedAuthority}`,
      'i',
    );

    if (!blockedAuthorityPattern.test(approvalStatement)) {
      throw new Error(
        `sourceMutationApproval.approvalStatement must keep ${blockedAuthority} blocked`,
      );
    }
  }

  return {
    decisionId,
    decisionStatus,
    status,
    targetAuthority,
    approvalStatement,
    approvedAt: approval.approvedAt
      ? normalizeIsoTimestamp(approval.approvedAt, 'sourceMutationApproval.approvedAt')
      : null,
  };
}

function normalizeProposalSourceMutationBlockedActions(value) {
  if (value === undefined || value === null) {
    return [...proposalSourceMutationDefaultBlockedActions];
  }

  const requestedActions = normalizeRequiredStringArray(value, 'blockedActions');

  return proposalSourceMutationDefaultBlockedActions
    .slice()
    .concat(
      requestedActions.filter(
        (action) => !proposalSourceMutationDefaultBlockedActions.includes(action),
      ),
    );
}

function normalizeProposalSourceMutationTarget(input) {
  const mutation = input && typeof input === 'object' && !Array.isArray(input) ? input : null;

  if (!mutation) {
    throw new Error('mutation must name exactly one target file');
  }

  const relativePath = normalizeRequiredString(mutation.relativePath, 'mutation.relativePath');
  const afterContent = mutation.afterContent;
  const expectedBeforeContent = mutation.expectedBeforeContent;

  if (typeof expectedBeforeContent !== 'string') {
    throw new Error('mutation.expectedBeforeContent is required');
  }

  if (typeof afterContent !== 'string' || afterContent.length === 0) {
    throw new Error('mutation.afterContent is required');
  }

  if (afterContent === expectedBeforeContent) {
    throw new Error('mutation.afterContent must differ from the current target content');
  }

  if (
    relativePath.startsWith('/') ||
    relativePath === '..' ||
    relativePath.startsWith('../') ||
    relativePath.includes('/../')
  ) {
    throw new Error('mutation.relativePath must stay inside the project path');
  }

  return {
    relativePath,
    expectedBeforeContent,
    afterContent,
  };
}

function normalizeCleanBaselineProof(input) {
  const proof = input && typeof input === 'object' ? input : null;

  if (!proof) {
    throw new Error('cleanBaselineProof is required');
  }

  if (typeof proof.statusOutput !== 'string' || proof.statusOutput.trim() !== '') {
    throw new Error('cleanBaselineProof.statusOutput must be empty');
  }

  return {
    statusOutput: '',
    capturedAt: normalizeIsoTimestamp(proof.capturedAt, 'cleanBaselineProof.capturedAt'),
  };
}

function normalizeDryRunDiffPreview(input, relativePath) {
  const preview = input && typeof input === 'object' ? input : null;

  if (!preview) {
    throw new Error('dryRunDiffPreview is required');
  }

  const diffText = normalizeRequiredString(preview.diffText, 'dryRunDiffPreview.diffText');

  if (!diffText.includes(relativePath)) {
    throw new Error('dryRunDiffPreview.diffText must reference the target relativePath');
  }

  return {
    diffText,
    previewedAt: normalizeIsoTimestamp(preview.previewedAt, 'dryRunDiffPreview.previewedAt'),
  };
}

function assertProposalApplicationAttemptCanAuthorizeSourceMutation(
  proposalApplicationAttempt,
  proposalRecord,
  now,
) {
  if (proposalApplicationAttempt.proposalId !== proposalRecord.proposalId) {
    throw new Error('proposalApplicationAttempt must reference the target proposal record');
  }

  if (proposalApplicationAttempt.status !== 'planned') {
    throw new Error('proposalApplicationAttempt.status must be planned');
  }

  if (
    Array.isArray(proposalApplicationAttempt.sourceMutationIds) &&
    proposalApplicationAttempt.sourceMutationIds.length > 0
  ) {
    throw new Error('proposalApplicationAttempt already authorized one source mutation');
  }

  if (proposalRecord.status !== PROPOSAL_RECORD_STATUS.CREATED) {
    throw new Error('proposalRecord.status must be created');
  }

  if (proposalRecord.applyAllowed !== false) {
    throw new Error('proposalRecord.applyAllowed must remain false');
  }

  if (!proposalRecord.expiresAt || Date.parse(proposalRecord.expiresAt) <= Date.parse(now)) {
    throw new Error('proposalRecord must not be expired');
  }
}

module.exports = {
  defaultProposalRecordExpiry,
  normalizeProposalRecordCreationApproval,
  normalizeProposalRecordVerificationPlan,
  normalizeProposalRecordBlockedActions,
  normalizeProposalApplicationApproval,
  normalizeProposalApplicationAttemptBlockedActions,
  normalizeProposalSourceMutationApproval,
  normalizeProposalSourceMutationBlockedActions,
  normalizeProposalSourceMutationTarget,
  normalizeCleanBaselineProof,
  normalizeDryRunDiffPreview,
  assertProposalRecordCanReceiveApplicationAttempt,
  assertProposalApplicationAttemptCanAuthorizeSourceMutation,
};
