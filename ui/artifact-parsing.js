import {
  parseChangeSummaryFileUpdates,
  parseIntegerValue,
  parseMarkdownBullets,
  parseMarkdownKeyValueLines,
  parseMarkdownLines,
  parseMarkdownSections,
  parseYesNoValue,
} from './markdown-artifact-parsing.js';

export function parseBreakdownArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    executionBoundarySummary: parseMarkdownBullets(sections['Execution Boundary Summary']),
    checkpoints: parseMarkdownBullets(sections.Checkpoints),
    expectedArtifacts: parseMarkdownBullets(sections['Expected Artifacts Per Checkpoint']),
    orderedSubTasks: parseMarkdownBullets(sections['Ordered Sub-Tasks']),
    reviewTriggerPoints: parseMarkdownLines(sections['Review Trigger Point']),
    stopAndEscalateConditions: parseMarkdownBullets(sections['Stop-And-Escalate Conditions']),
    title: text.match(/^#\s+Task Breakdown:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationCheckpoints: parseMarkdownBullets(sections['Verification Checkpoints']),
  };
  const hasStructuredContent = [
    parsed.orderedSubTasks,
    parsed.checkpoints,
    parsed.expectedArtifacts,
    parsed.verificationCheckpoints,
    parsed.reviewTriggerPoints,
    parsed.stopAndEscalateConditions,
    parsed.executionBoundarySummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

export function parsePreflightArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    escalationTriggers: parseMarkdownBullets(sections['Escalation Triggers']),
    inputSummary: parseMarkdownLines(sections['Input Summary']),
    intendedChanges: parseMarkdownBullets(sections['Intended Changes']),
    reviewEvidenceExpectations: parseMarkdownBullets(sections['Review Evidence Expectations']),
    risks: parseMarkdownBullets(sections.Risks),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Preflight:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationPlan: parseMarkdownBullets(sections['Verification Plan']),
  };
  const hasStructuredContent = [
    parsed.targetFiles,
    parsed.intendedChanges,
    parsed.risks,
    parsed.verificationPlan,
    parsed.reviewEvidenceExpectations,
    parsed.escalationTriggers,
    parsed.inputSummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

export function parseChangeSummaryArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const summaryValues = parseMarkdownKeyValueLines(sections['Change Summary']);
  const parsed = {
    approvalId: summaryValues['approval id'] || null,
    changeSummary: parseMarkdownBullets(sections['Change Summary']),
    commitOrReleaseExecuted: summaryValues['commit or release executed'] || null,
    fileUpdates: parseChangeSummaryFileUpdates(sections['File Updates']),
    preparedFileUpdates: parseIntegerValue(summaryValues['prepared file updates']),
    preflightArtifactId: summaryValues['preflight artifact'] || null,
    reviewerExecuted: summaryValues['reviewer executed'] || null,
    risks: parseMarkdownBullets(sections.Risks),
    targetFileAllowlistCount: parseIntegerValue(summaryValues['target file allowlist count']),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Live Mutation:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationNotes: parseMarkdownBullets(sections['Verification Notes']),
  };
  const hasStructuredContent = [
    parsed.changeSummary,
    parsed.fileUpdates,
    parsed.targetFiles,
    parsed.risks,
    parsed.verificationNotes,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

export function parseReviewArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const verdictValues = parseMarkdownKeyValueLines(sections['Review Verdict']);
  const followUpValues = parseMarkdownKeyValueLines(sections['Follow-Up Gate']);
  const verdict = String(verdictValues.verdict || '').trim().toLowerCase();
  const parsed = {
    acceptedRisks: parseMarkdownBullets(sections['Accepted Risks']),
    changeSummaryArtifactId: verdictValues['change-summary artifact'] || null,
    contractCompliance: parseMarkdownBullets(sections['Contract Compliance']),
    decisionRequired: parseYesNoValue(followUpValues['decision required']),
    diffArtifactId: verdictValues['diff artifact'] || null,
    evidence: parseMarkdownBullets(sections['Evidence Reviewed']),
    findings: parseMarkdownBullets(sections.Findings),
    mappedReviewStatus:
      verdict === 'pass'
        ? 'passed'
        : verdict === 'fail' || verdict === 'changes_requested'
          ? 'changes_requested'
          : null,
    nextAction: parseMarkdownBullets(sections['Next Action']),
    patchArtifactId: verdictValues['patch artifact'] || null,
    preflightArtifactId: verdictValues['preflight artifact'] || null,
    sourceBuilderRunId: verdictValues['source builder run'] || null,
    title: text.match(/^#\s+Reviewer Report:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationEvidence: parseMarkdownBullets(sections['Verification Evidence']),
    verdict: ['pass', 'fail', 'changes_requested'].includes(verdict) ? verdict : null,
    blockingIssue: parseYesNoValue(followUpValues['blocking issue']),
  };
  const hasStructuredContent = [
    parsed.verdict,
    parsed.evidence,
    parsed.findings,
    parsed.contractCompliance,
    parsed.verificationEvidence,
    parsed.nextAction,
    parsed.acceptedRisks,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.blockingIssue,
    parsed.decisionRequired,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

export function parseCommitPackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceReviewerValues = parseMarkdownKeyValueLines(sections['Source Reviewer Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const verificationValues = parseMarkdownKeyValueLines(sections['Verification Evidence']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    builderLiveMutationApprovalId: sourceReviewerValues['builder live mutation approval'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    changedFiles: parseMarkdownBullets(sections['Changed Files']),
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceReviewerValues['target preflight artifact'] || null,
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    reviewArtifactId: sourceReviewerValues['review artifact'] || null,
    reviewerMappedStatus: verificationValues['reviewer mapped status'] || null,
    reviewerRawVerdict: verificationValues['reviewer raw verdict'] || null,
    sourceBuilderRunId: sourceReviewerValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewerValues['source reviewer run'] || null,
    title: text.match(/^#\s+Commit Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.changedFiles,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.gitCommitExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

export function parseCommitResultArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceValues = parseMarkdownKeyValueLines(sections['Source Commit Package']);
  const commitValues = parseMarkdownKeyValueLines(sections.Commit);
  const validationValues = parseMarkdownKeyValueLines(sections.Validation);
  const safetyValues = parseMarkdownKeyValueLines(sections.Safety);
  const parsed = {
    commitApprovalId: sourceValues['commit approval'] || null,
    commitMessage: commitValues['commit message'] || null,
    commitPackageArtifactId: sourceValues['source commit-package artifact'] || null,
    commitSha: commitValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    committedFilesMatchedScope: parseYesNoValue(
      validationValues['committed files matched scope'],
    ),
    dirtyFileCountAfterGitAdd: parseIntegerValue(
      validationValues['dirty file count after git add'],
    ),
    dirtyFileCountBeforeCommit: parseIntegerValue(
      validationValues['dirty file count before commit'],
    ),
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    preflightArtifactId: sourceValues['target preflight artifact'] || null,
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    repoChangedFileCountBeforeCommit: parseIntegerValue(
      validationValues['repo changed file count before commit'],
    ),
    repoCleanAfterCommit: parseYesNoValue(validationValues['repo clean after commit']),
    reviewArtifactId: sourceValues['source review artifact'] || null,
    scopeFileCount: parseIntegerValue(validationValues['scope file count']),
    sourceBuilderApprovalId: sourceValues['source builder approval'] || null,
    sourceBuilderRunId: sourceValues['source builder run'] || null,
    sourceReviewerRunId: sourceValues['source reviewer run'] || null,
    stagedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['staged file count after git add'],
    ),
    stagedFileCountBeforeCommit: parseIntegerValue(
      validationValues['staged file count before commit'],
    ),
    title: text.match(/^#\s+Commit Result:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['untracked file count after git add'],
    ),
    untrackedFileCountBeforeCommit: parseIntegerValue(
      validationValues['untracked file count before commit'],
    ),
  };
  const hasStructuredContent = [
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.committedFiles,
    parsed.scopeFileCount,
    parsed.repoChangedFileCountBeforeCommit,
    parsed.stagedFileCountBeforeCommit,
    parsed.committedFilesMatchedScope,
    parsed.repoCleanAfterCommit,
    parsed.gitCommitExecuted,
    parsed.pushExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

export function parseReleasePackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceCommitValues = parseMarkdownKeyValueLines(sections['Source Local Commit Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const releaseCandidateValues = parseMarkdownKeyValueLines(sections['Release Candidate']);
  const humanGateValues = parseMarkdownKeyValueLines(sections['Human Gate']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    commitApprovalId: sourceCommitValues['commit approval'] || null,
    commitMessage: releaseCandidateValues['commit message'] || null,
    commitPackageArtifactId: sourceCommitValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceCommitValues['source commit-result artifact'] || null,
    commitSha: releaseCandidateValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    deliveryStance: releaseCandidateValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    externalReleaseExecuted: parseYesNoValue(safetyValues['external release executed']),
    localCommitBundleExecuted: parseYesNoValue(safetyValues['local commit bundle executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceCommitValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(safetyValues['publish executed']),
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseApprovalRequired: parseYesNoValue(humanGateValues['release approval required']),
    releaseReadyAction: humanGateValues['allowed next action'] || null,
    reviewArtifactId: sourceCommitValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceCommitValues['source builder approval'] || null,
    sourceBuilderRunId: sourceCommitValues['source builder run'] || null,
    sourceReviewerRunId: sourceCommitValues['source reviewer run'] || null,
    title: text.match(/^#\s+Release Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.deliveryStance,
    parsed.committedFiles,
    parsed.releaseApprovalRequired,
    parsed.releaseReadyAction,
    parsed.publishExecuted,
    parsed.pushExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

export function parseCloseOutArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const doneTransitionValues = parseMarkdownKeyValueLines(sections['Done Transition']);
  const sourceReleaseValues = parseMarkdownKeyValueLines(sections['Source Release Bundle']);
  const sourceReviewValues = parseMarkdownKeyValueLines(sections['Source Review Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const worktreeValues = parseMarkdownKeyValueLines(sections['Worktree Verification']);
  const releaseSafetyValues = parseMarkdownKeyValueLines(sections['Release Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    closeOutRunId: doneTransitionValues['close-out run'] || null,
    closedOutAt: doneTransitionValues['closed out at'] || null,
    commitPackageArtifactId: sourceReleaseValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceReleaseValues['source commit-result artifact'] || null,
    commitSha: sourceReleaseValues['commit sha'] || null,
    deliveryStance: sourceReleaseValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    dirtyFileCount: parseIntegerValue(worktreeValues['dirty file count']),
    externalReleaseExecuted: parseYesNoValue(releaseSafetyValues['external release executed']),
    lifecycleStateAfter: doneTransitionValues['task lifecycle after close-out'] || null,
    lifecycleStateBefore: doneTransitionValues['task lifecycle before close-out'] || null,
    lifecycleTransition: doneTransitionValues['lifecycle transition'] || null,
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceBuilderValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(releaseSafetyValues['publish executed']),
    pushExecuted: parseYesNoValue(releaseSafetyValues['push executed']),
    releaseApprovalId: doneTransitionValues['source release approval'] || null,
    releasePackageArtifactId:
      sourceReleaseValues['source release-package artifact'] ||
      doneTransitionValues['source release-package artifact'] ||
      null,
    repoCleanBeforeCloseOut: parseYesNoValue(worktreeValues['repo clean before close-out']),
    reviewArtifactId: sourceReviewValues['source review artifact'] || null,
    reviewerMappedStatus: sourceReviewValues['reviewer mapped status'] || null,
    reviewerRawVerdict: sourceReviewValues['reviewer raw verdict'] || null,
    sourceBuilderApprovalId: sourceBuilderValues['source builder approval'] || null,
    sourceBuilderRunId: sourceBuilderValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewValues['source reviewer run'] || null,
    stagedFileCount: parseIntegerValue(worktreeValues['staged file count']),
    title: text.match(/^#\s+Close-Out:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCount: parseIntegerValue(worktreeValues['untracked file count']),
  };
  const hasStructuredContent = [
    parsed.releaseApprovalId,
    parsed.releasePackageArtifactId,
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitSha,
    parsed.deliveryStance,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.repoCleanBeforeCloseOut,
    parsed.pushExecuted,
    parsed.publishExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => value !== null && value !== '');

  return hasStructuredContent ? parsed : null;
}

export function parseUnifiedDiffArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const filePaths = [
    ...[...text.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map((match) => match[2].trim()),
    ...[...text.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1].trim()),
    ...[...text.matchAll(/^--- a\/(.+)$/gm)].map((match) => match[1].trim()),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
  const files = [...new Set(filePaths)];
  const hunkCount = (text.match(/^@@/gm) || []).length;

  if (files.length === 0 && hunkCount === 0) {
    return null;
  }

  return {
    files,
    hunkCount,
  };
}
