'use strict';

const PACKS = {
  DEVELOPMENT: 'development',
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

const DECISION_INBOX_KIND = {
  REVIEW: 'review',
  DECISION: 'decision',
  APPROVAL: 'approval',
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

function createEmptyState() {
  return {
    schemaVersion: 2,
    activeProjectId: null,
    sequences: {
      project: 0,
      task: 0,
      run: 0,
      artifact: 0,
      decisionInboxItem: 0,
      approval: 0,
    },
    projects: {},
    tasks: {},
    runs: {},
    artifacts: {},
    decisionInboxItems: {},
    approvals: {},
  };
}

module.exports = {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  COMMIT_ACTION,
  DECISION_INBOX_KIND,
  DECISION_INBOX_STATUS,
  PACKS,
  RELEASE_ACTION,
  REVIEW_STATUS,
  RUN_STATUS,
  TASK_LIFECYCLE,
  createEmptyState,
};
