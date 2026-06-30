'use strict';

const PACKS = {
  DEVELOPMENT: 'development',
  KNOWLEDGE_WORK: 'knowledge-work',
};

const PROVIDER_MODE = {
  LOCAL_STUB: 'local-stub',
  LIVE: 'live',
};

const PROVIDER_ADAPTER_ID = {
  LOCAL_STUB: 'local-stub',
  OPENAI_RESPONSES: 'openai-responses',
  LIVE_PROVIDER_ALIAS: 'live-provider',
};

const PROVIDER_READINESS = {
  READY: 'ready',
  NOT_CONFIGURED: 'not-configured',
  DEGRADED: 'degraded',
  ERROR: 'error',
};

const TASK_LIFECYCLE = {
  INBOX: 'Inbox',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

const RUN_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
};

const ARTIFACT_PREVIEW_MODE = {
  RAW_ONLY: 'raw-only',
  STRUCTURED_WITH_RAW_FALLBACK: 'structured-with-raw-fallback',
};

const ARTIFACT_RETENTION_TIER = {
  TIER_A: 'tier-a-provenance-critical',
  TIER_B: 'tier-b-latest-centered-history-retained',
  TIER_C: 'tier-c-generic-fallback',
};

const RETENTION_CONSUMER_ACTION = {
  PREVIEW: 'preview',
  ARCHIVE: 'archive',
  DELETE: 'delete',
  GC: 'gc',
};

const RETENTION_CONSUMER_DISPOSITION = {
  PROTECTED: 'protected',
  INSPECT_BEFORE_ACTION: 'inspect-before-action',
  CLEANUP_CANDIDATE: 'cleanup-candidate',
};

const RETENTION_CONSUMER_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  GC: 'gc',
};

const ARTIFACT_TYPE = {
  PLAN: 'plan',
  ARCHITECTURE: 'architecture',
  BREAKDOWN: 'breakdown',
  PREFLIGHT: 'preflight',
  CHANGE_SUMMARY: 'change-summary',
  PATCH: 'patch',
  DIFF: 'diff',
  REVIEW: 'review',
  COMMIT_PACKAGE: 'commit-package',
  COMMIT_RESULT: 'commit-result',
  RELEASE_PACKAGE: 'release-package',
  CLOSE_OUT: 'close-out',
  OUTPUT: 'output',
};

const ARTIFACT_CATALOG = {
  [ARTIFACT_TYPE.PLAN]: {
    latestCenteredBrowse: true,
    previewMode: ARTIFACT_PREVIEW_MODE.RAW_ONLY,
    provenanceCritical: false,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_B,
  },
  [ARTIFACT_TYPE.ARCHITECTURE]: {
    latestCenteredBrowse: true,
    previewMode: ARTIFACT_PREVIEW_MODE.RAW_ONLY,
    provenanceCritical: false,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_B,
  },
  [ARTIFACT_TYPE.BREAKDOWN]: {
    latestCenteredBrowse: true,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: false,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_B,
  },
  [ARTIFACT_TYPE.PREFLIGHT]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.CHANGE_SUMMARY]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.PATCH]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.DIFF]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.REVIEW]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.COMMIT_PACKAGE]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.COMMIT_RESULT]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.RELEASE_PACKAGE]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.CLOSE_OUT]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK,
    provenanceCritical: true,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_A,
  },
  [ARTIFACT_TYPE.OUTPUT]: {
    latestCenteredBrowse: false,
    previewMode: ARTIFACT_PREVIEW_MODE.RAW_ONLY,
    provenanceCritical: false,
    retentionTier: ARTIFACT_RETENTION_TIER.TIER_C,
  },
};

const DECISION_INBOX_KIND = {
  REVIEW: 'review',
  DECISION: 'decision',
  APPROVAL: 'approval',
};

const DECISION_INBOX_SOURCE_TYPE = {
  REVIEW: 'review',
  DECISION: 'decision',
  APPROVAL: 'approval',
};

const DECISION_INBOX_ALLOWED_KIND_BY_SOURCE_TYPE = {
  [DECISION_INBOX_SOURCE_TYPE.APPROVAL]: [DECISION_INBOX_KIND.APPROVAL],
  [DECISION_INBOX_SOURCE_TYPE.REVIEW]: [DECISION_INBOX_KIND.REVIEW, DECISION_INBOX_KIND.DECISION],
  [DECISION_INBOX_SOURCE_TYPE.DECISION]: [DECISION_INBOX_KIND.DECISION],
};

const DECISION_INBOX_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
};

const REVIEW_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  CHANGES_REQUESTED: 'changes_requested',
};

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const BUILDER_ACTION = {
  LIVE_MUTATION: 'builder-live-mutation',
};

const COMMIT_ACTION = {
  COMMIT_INTENT: 'commit-intent',
  COMMIT_READY: 'commit-ready',
};

const RELEASE_ACTION = {
  RELEASE_READY: 'release-ready',
};

const PROPOSAL_RECORD_STATUS = {
  CREATED: 'created',
  QUARANTINED: 'quarantined',
};

const PROPOSAL_RECORD_TYPE = {
  DOCUMENTATION: 'documentation',
  GATEWAY_ROUTING: 'gateway-routing',
  RUNTIME_CONTRACT: 'runtime-contract',
  SKILL_MEMORY: 'skill-memory',
  SMOKE_GUARD: 'smoke-guard',
  UI_COPY: 'ui-copy',
};

const PROPOSAL_RECORD_RISK_CLASS = {
  ARCHITECTURE_SENSITIVE: 'architecture-sensitive',
  LOW: 'low',
  RUNTIME_SENSITIVE: 'runtime-sensitive',
};

const PROPOSAL_RECORD_BLOCKED_ACTION = {
  COMMIT: 'commit',
  MEMORY_PERSISTENCE: 'memory-persistence',
  PROPOSAL_APPLICATION: 'proposal-application',
  PROVIDER_CALL: 'provider-call',
  PUSH: 'push',
  SOURCE_MUTATION: 'source-mutation',
};

const PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS = Object.freeze([
  PROPOSAL_RECORD_BLOCKED_ACTION.PROPOSAL_APPLICATION,
  PROPOSAL_RECORD_BLOCKED_ACTION.PROVIDER_CALL,
  PROPOSAL_RECORD_BLOCKED_ACTION.MEMORY_PERSISTENCE,
  PROPOSAL_RECORD_BLOCKED_ACTION.SOURCE_MUTATION,
  PROPOSAL_RECORD_BLOCKED_ACTION.COMMIT,
  PROPOSAL_RECORD_BLOCKED_ACTION.PUSH,
]);

const PROPOSAL_APPLICATION_ATTEMPT_STATUS = {
  PLANNED: 'planned',
  QUARANTINED: 'quarantined',
};

const PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS = Object.freeze([
  'proposal-generation',
  PROPOSAL_RECORD_BLOCKED_ACTION.PROVIDER_CALL,
  PROPOSAL_RECORD_BLOCKED_ACTION.MEMORY_PERSISTENCE,
  PROPOSAL_RECORD_BLOCKED_ACTION.SOURCE_MUTATION,
  PROPOSAL_RECORD_BLOCKED_ACTION.COMMIT,
  PROPOSAL_RECORD_BLOCKED_ACTION.PUSH,
]);

function createEmptyState() {
  return {
    schemaVersion: 5,
    activeProjectId: null,
    selectedMissionId: null,
    sequences: {
      mission: 0,
      councilSession: 0,
      project: 0,
      task: 0,
      run: 0,
      artifact: 0,
      decisionInboxItem: 0,
      approval: 0,
      proposalRecord: 0,
      proposalApplicationAttempt: 0,
    },
    missions: {},
    councilSessions: {},
    projects: {},
    tasks: {},
    runs: {},
    artifacts: {},
    decisionInboxItems: {},
    approvals: {},
    proposalRecords: {},
    proposalApplicationAttempts: {},
  };
}

module.exports = {
  APPROVAL_STATUS,
  ARTIFACT_CATALOG,
  ARTIFACT_PREVIEW_MODE,
  ARTIFACT_RETENTION_TIER,
  ARTIFACT_TYPE,
  BUILDER_ACTION,
  DECISION_INBOX_ALLOWED_KIND_BY_SOURCE_TYPE,
  COMMIT_ACTION,
  DECISION_INBOX_KIND,
  DECISION_INBOX_SOURCE_TYPE,
  DECISION_INBOX_STATUS,
  PACKS,
  PROVIDER_ADAPTER_ID,
  PROVIDER_MODE,
  PROVIDER_READINESS,
  PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_APPLICATION_ATTEMPT_STATUS,
  PROPOSAL_RECORD_BLOCKED_ACTION,
  PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_RECORD_RISK_CLASS,
  PROPOSAL_RECORD_STATUS,
  PROPOSAL_RECORD_TYPE,
  RETENTION_CONSUMER_ACTION,
  RETENTION_CONSUMER_DISPOSITION,
  RETENTION_CONSUMER_STATUS,
  RELEASE_ACTION,
  REVIEW_STATUS,
  RUN_STATUS,
  TASK_LIFECYCLE,
  createEmptyState,
};
