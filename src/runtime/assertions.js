'use strict';

function assertRun(runId, state) {
  const run = state.runs[runId];

  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  return run;
}

module.exports = {
  assertRun,
};
