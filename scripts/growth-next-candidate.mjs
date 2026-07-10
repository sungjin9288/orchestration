const repeatedLifecycleSegment = 'review-acceptance-finalization';
const historicalLifecyclePrefix =
  'growth-evidence-ledger-proposal-record-dry-run-';
const historicalLifecycleStages = ['review', 'acceptance', 'finalization'];
const historicalReflectionFindingIds = new Set([
  `${historicalLifecyclePrefix}validation-needed`,
  `${historicalLifecyclePrefix}shape-needed`,
  'growth-evidence-ledger-proposal-record-creation-readiness-needed',
  'growth-evidence-ledger-proposal-record-review-gate-needed',
  'growth-evidence-ledger-proposal-record-readiness-needed',
  'growth-evidence-ledger-proposal-queue-handoff-needed',
  'growth-evidence-ledger-proposal-readiness-needed',
]);

const proposalRecordLifecycleReviewCandidate = {
  id: 'growth-evidence-ledger-proposal-record-lifecycle-review',
  commandToAdd:
    'node scripts/growth-engine-status.mjs && node scripts/growth-reflection-evaluator.mjs',
  reason:
    'Review the current proposal-record evidence lifecycle as one read-only state instead of creating another review, acceptance, and finalization suffix. Proposal generation, creation or application outside approved runtime functions, provider calls, memory persistence, source mutation outside the approved runtime function, commit, and push remain blocked.',
  mustRemainReadOnly: true,
};

export function normalizeGrowthNextCandidate(candidate) {
  if (!candidate?.id) {
    return candidate;
  }

  const lifecycleSegmentCount = candidate.id.split(repeatedLifecycleSegment).length - 1;

  if (lifecycleSegmentCount < 2) {
    return candidate;
  }

  return {
    ...proposalRecordLifecycleReviewCandidate,
    sourceCandidate: {
      id: candidate.id,
      commandToAdd: candidate.commandToAdd,
      reason: candidate.reason,
      mustRemainReadOnly: candidate.mustRemainReadOnly,
    },
  };
}

export function isHistoricalGrowthReflectionFindingId(findingId) {
  if (historicalReflectionFindingIds.has(findingId)) {
    return true;
  }

  if (
    !findingId ||
    !findingId.startsWith(historicalLifecyclePrefix) ||
    !findingId.endsWith('-needed')
  ) {
    return false;
  }

  const lifecycle = findingId.slice(
    historicalLifecyclePrefix.length,
    -'-needed'.length,
  );
  const stages = lifecycle.split('-');

  return stages.every((stage, index) => {
    const stageIndex = index % historicalLifecycleStages.length;
    return stage === historicalLifecycleStages[stageIndex];
  });
}

export function isHistoricalGrowthReflectionReadyStatus(status) {
  const readyPrefix = 'ready-for-';

  if (!status?.startsWith(readyPrefix)) {
    return false;
  }

  return isHistoricalGrowthReflectionFindingId(
    `${status.slice(readyPrefix.length)}-needed`,
  );
}
