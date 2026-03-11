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

const REVIEW_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  CHANGES_REQUESTED: 'changes_requested',
};

function createEmptyState() {
  return {
    schemaVersion: 1,
    activeProjectId: null,
    sequences: {
      project: 0,
      task: 0,
      run: 0,
      artifact: 0,
    },
    projects: {},
    tasks: {},
    runs: {},
    artifacts: {},
  };
}

module.exports = {
  PACKS,
  REVIEW_STATUS,
  RUN_STATUS,
  TASK_LIFECYCLE,
  createEmptyState,
};
