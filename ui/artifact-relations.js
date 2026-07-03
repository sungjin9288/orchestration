import { getLatestTaskArtifact, sortByCreatedDesc } from './task-summaries.js';

export function getCommitPackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentCommitPackageArtifactId || summary?.latestCommitPackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'commit-package');
}

export function buildCommitPackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const commitPackageArtifact = getCommitPackageArtifactForTask(task, data, summary);
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;
  const reviewerSummary =
    reviewerRun?.summary && typeof reviewerRun.summary === 'object' ? reviewerRun.summary : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'commit-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerSummary?.rawVerdict || null,
    reviewArtifact:
      (summary.sourceReviewArtifactId &&
        data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

export function getReleasePackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentReleasePackageArtifactId || summary?.latestReleasePackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'release-package');
}

export function buildReleasePackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, summary);
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'release-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

export function buildCloseOutRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, {
    currentReleasePackageArtifactId: summary.currentReleasePackageArtifactId,
    latestReleasePackageArtifactId: summary.latestReleasePackageArtifactId,
  });
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovedReleaseApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'close-out',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

export function getArtifactsForRun(runId, data) {
  return data.artifacts
    .filter((artifact) => artifact.runId === runId)
    .sort(sortByCreatedDesc);
}

export function findLatestRunForPreflightArtifact(artifact, data) {
  if (!artifact || artifact.type !== 'preflight') {
    return null;
  }

  return (
    data.runs
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
        return (
          summary?.executionMode === 'live-mutation' &&
          summary?.preflightArtifactId === artifact.id
        );
      })
      .sort(sortByCreatedDesc)[0] || null
  );
}

export function getRunArtifactBundle(run, data) {
  if (!run) {
    return null;
  }

  const summary = run.summary && typeof run.summary === 'object' ? run.summary : {};
  const artifactIds =
    summary.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : {};
  const inputArtifactIds = Array.isArray(summary.inputArtifactIds) ? summary.inputArtifactIds : [];
  const sameRunArtifacts = getArtifactsForRun(run.id, data);
  const inputArtifacts = inputArtifactIds
    .map((artifactId) => data.artifactMap.get(artifactId))
    .filter(Boolean);
  const sourceBuilderRun =
    (summary.sourceBuilderRunId && data.runMap.get(summary.sourceBuilderRunId)) || null;
  const sourceReviewerRun =
    (summary.sourceReviewerRunId && data.runMap.get(summary.sourceReviewerRunId)) || null;

  return {
    approvalId: summary.approvalId || null,
    changeSummaryArtifact:
      (artifactIds.changeSummary && data.artifactMap.get(artifactIds.changeSummary)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      inputArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      null,
    changedFiles: Array.isArray(summary.changedFiles)
      ? summary.changedFiles
      : Array.isArray(summary.committedFiles)
        ? summary.committedFiles
        : [],
    closeOutArtifact:
      (summary.closeOutArtifactId && data.artifactMap.get(summary.closeOutArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'close-out') ||
      null,
    commitPackageArtifact:
      (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-package') ||
      null,
    commitResultArtifact:
      (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-result') ||
      null,
    diffArtifact:
      (artifactIds.diff && data.artifactMap.get(artifactIds.diff)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'diff') ||
      inputArtifacts.find((artifact) => artifact.type === 'diff') ||
      null,
    executionMode: summary.executionMode || run.metadata?.executionMode || null,
    inputArtifacts,
    patchArtifact:
      (artifactIds.patch && data.artifactMap.get(artifactIds.patch)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'patch') ||
      inputArtifacts.find((artifact) => artifact.type === 'patch') ||
      null,
    preflightArtifact:
      (summary.preflightArtifactId && data.artifactMap.get(summary.preflightArtifactId)) ||
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      inputArtifacts.find((artifact) => artifact.type === 'preflight') ||
      null,
    rawVerdict: summary.rawVerdict || null,
    releasePackageArtifact:
      (summary.releasePackageArtifactId && data.artifactMap.get(summary.releasePackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'release-package') ||
      null,
    reviewArtifact:
      (summary.reviewArtifactId && data.artifactMap.get(summary.reviewArtifactId)) ||
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'review') ||
      inputArtifacts.find((artifact) => artifact.type === 'review') ||
      null,
    sourceBuilderRun,
    sourceReviewerRun,
    sourceRun:
      (summary.sourceRunId && data.runMap.get(summary.sourceRunId)) ||
      null,
    run,
  };
}

export function getPreferredArtifactForRun(run, data) {
  const bundle = getRunArtifactBundle(run, data);

  return (
    bundle?.closeOutArtifact ||
    bundle?.releasePackageArtifact ||
    bundle?.commitResultArtifact ||
    bundle?.commitPackageArtifact ||
    bundle?.reviewArtifact ||
    bundle?.changeSummaryArtifact ||
    bundle?.diffArtifact ||
    bundle?.patchArtifact ||
    getArtifactsForRun(run.id, data)[0] ||
    null
  );
}

export function getArtifactRelationContext(artifact, data, options = {}) {
  if (!artifact) {
    return null;
  }

  const parsedChangeSummary = options.parsedChangeSummary || null;
  const parsedCloseOut = options.parsedCloseOut || null;
  const parsedCommitResult = options.parsedCommitResult || null;
  const parsedCommitPackage = options.parsedCommitPackage || null;
  const parsedReleasePackage = options.parsedReleasePackage || null;
  const parsedReview = options.parsedReview || null;
  let run = data.runMap.get(artifact.runId) || null;
  let bundle = run ? getRunArtifactBundle(run, data) : null;

  if (artifact.type === 'commit-result') {
    return {
      approvalId: bundle?.approvalId || parsedCommitResult?.commitApprovalId || null,
      builderRun:
        bundle?.sourceBuilderRun ||
        (parsedCommitResult?.sourceBuilderRunId
          ? data.runMap.get(parsedCommitResult.sourceBuilderRunId) || null
          : null),
      changeSummaryArtifact: bundle?.changeSummaryArtifact || null,
      changedFiles: parsedCommitResult?.committedFiles || bundle?.changedFiles || [],
      commitPackageArtifact:
        bundle?.commitPackageArtifact ||
        (parsedCommitResult?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCommitResult.commitPackageArtifactId) || null
          : null),
      diffArtifact: bundle?.diffArtifact || null,
      executionMode: bundle?.executionMode || null,
      patchArtifact: bundle?.patchArtifact || null,
      preflightArtifact:
        bundle?.preflightArtifact ||
        (parsedCommitResult?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitResult.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || null,
      run,
      runLabel: 'commit-executor run',
      reviewArtifact:
        bundle?.reviewArtifact ||
        (parsedCommitResult?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitResult.reviewArtifactId) || null
          : null),
      reviewerRun:
        bundle?.sourceReviewerRun ||
        (parsedCommitResult?.sourceReviewerRunId
          ? data.runMap.get(parsedCommitResult.sourceReviewerRunId) || null
          : null),
    };
  }

  if (artifact.type === 'commit-package') {
    const builderRun =
      (parsedCommitPackage?.sourceBuilderRunId &&
        data.runMap.get(parsedCommitPackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCommitPackage?.sourceReviewerRunId &&
        data.runMap.get(parsedCommitPackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: bundle?.approvalId || null,
      builderRun,
      changedFiles: parsedCommitPackage?.changedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact: artifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCommitPackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCommitPackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCommitPackage?.diffArtifactId
          ? data.artifactMap.get(parsedCommitPackage.diffArtifactId) || null
          : null),
      executionMode: 'commit-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCommitPackage?.patchArtifactId
          ? data.artifactMap.get(parsedCommitPackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCommitPackage?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitPackage.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCommitPackage?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      run,
      runLabel: 'commit-packager run',
      reviewArtifact:
        (parsedCommitPackage?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitPackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'review') {
    const sourceRun =
      bundle?.sourceRun ||
      (parsedReview?.sourceBuilderRunId
        ? data.runMap.get(parsedReview.sourceBuilderRunId) || null
        : null);
    const sourceBundle = sourceRun ? getRunArtifactBundle(sourceRun, data) : null;

    return {
      approvalId: sourceBundle?.approvalId || null,
      builderRun: sourceRun,
      changeSummaryArtifact:
        sourceBundle?.changeSummaryArtifact ||
        (parsedReview?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReview.changeSummaryArtifactId) || null
          : null),
      changedFiles: sourceBundle?.changedFiles || [],
      commitPackageArtifact: null,
      diffArtifact:
        sourceBundle?.diffArtifact ||
        (parsedReview?.diffArtifactId ? data.artifactMap.get(parsedReview.diffArtifactId) || null : null),
      executionMode: sourceBundle?.executionMode || null,
      patchArtifact:
        sourceBundle?.patchArtifact ||
        (parsedReview?.patchArtifactId ? data.artifactMap.get(parsedReview.patchArtifactId) || null : null),
      preflightArtifact:
        sourceBundle?.preflightArtifact ||
        (parsedReview?.preflightArtifactId
          ? data.artifactMap.get(parsedReview.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || parsedReview?.verdict || null,
      run,
      runLabel: 'reviewer run',
      reviewArtifact: artifact,
      reviewerRun: run,
    };
  }

  if (artifact.type === 'release-package') {
    const builderRun =
      (parsedReleasePackage?.sourceBuilderRunId &&
        data.runMap.get(parsedReleasePackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedReleasePackage?.sourceReviewerRunId &&
        data.runMap.get(parsedReleasePackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: null,
      builderRun,
      changedFiles: parsedReleasePackage?.committedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedReleasePackage?.commitPackageArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedReleasePackage?.commitResultArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedReleasePackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReleasePackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedReleasePackage?.diffArtifactId
          ? data.artifactMap.get(parsedReleasePackage.diffArtifactId) || null
          : null),
      executionMode: 'release-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedReleasePackage?.patchArtifactId
          ? data.artifactMap.get(parsedReleasePackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedReleasePackage?.preflightArtifactId
          ? data.artifactMap.get(parsedReleasePackage.preflightArtifactId) || null
          : null),
      rawVerdict: reviewerRun?.summary?.rawVerdict || null,
      releasePackageArtifact: artifact,
      run,
      runLabel: 'release-packager run',
      reviewArtifact:
        (parsedReleasePackage?.reviewArtifactId
          ? data.artifactMap.get(parsedReleasePackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'close-out') {
    const builderRun =
      (parsedCloseOut?.sourceBuilderRunId &&
        data.runMap.get(parsedCloseOut.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCloseOut?.sourceReviewerRunId &&
        data.runMap.get(parsedCloseOut.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: parsedCloseOut?.releaseApprovalId || null,
      builderRun,
      changedFiles: builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedCloseOut?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedCloseOut?.commitResultArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCloseOut?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCloseOut.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCloseOut?.diffArtifactId
          ? data.artifactMap.get(parsedCloseOut.diffArtifactId) || null
          : null),
      executionMode: 'close-out',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCloseOut?.patchArtifactId
          ? data.artifactMap.get(parsedCloseOut.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCloseOut?.preflightArtifactId
          ? data.artifactMap.get(parsedCloseOut.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCloseOut?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      releasePackageArtifact:
        (parsedCloseOut?.releasePackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.releasePackageArtifactId) || null
          : null) || bundle?.releasePackageArtifact,
      run,
      runLabel: 'close-out run',
      reviewArtifact:
        (parsedCloseOut?.reviewArtifactId
          ? data.artifactMap.get(parsedCloseOut.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (!bundle && artifact.type === 'preflight') {
    run = findLatestRunForPreflightArtifact(artifact, data);
    bundle = run ? getRunArtifactBundle(run, data) : null;
  }

  return {
    approvalId: bundle?.approvalId || parsedChangeSummary?.approvalId || null,
    builderRun:
      bundle?.sourceBuilderRun || (run?.role === 'builder' ? run : null),
    changeSummaryArtifact:
      bundle?.changeSummaryArtifact || (artifact.type === 'change-summary' ? artifact : null),
    changedFiles: bundle?.changedFiles || [],
    commitPackageArtifact:
      bundle?.commitPackageArtifact || (artifact.type === 'commit-package' ? artifact : null),
    diffArtifact: bundle?.diffArtifact || (artifact.type === 'diff' ? artifact : null),
    executionMode: bundle?.executionMode || null,
    patchArtifact: bundle?.patchArtifact || (artifact.type === 'patch' ? artifact : null),
    preflightArtifact:
      bundle?.preflightArtifact ||
      (parsedChangeSummary?.preflightArtifactId
        ? data.artifactMap.get(parsedChangeSummary.preflightArtifactId) || null
        : null) ||
      (artifact.type === 'preflight' ? artifact : null),
    rawVerdict: bundle?.rawVerdict || null,
    releasePackageArtifact:
      bundle?.releasePackageArtifact || (artifact.type === 'release-package' ? artifact : null),
    run,
    runLabel: 'run',
    reviewArtifact: bundle?.reviewArtifact || (artifact.type === 'review' ? artifact : null),
    reviewerRun:
      bundle?.sourceReviewerRun || (run?.role === 'reviewer' ? run : null),
  };
}
