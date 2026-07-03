'use strict';

const { getMarkdownSection, parseMarkdownKeyValueLines, parseMarkdownList, parseYesNoValue } = require('./markdown');
const { COMMIT_ACTION, RELEASE_ACTION } = require('../../runtime/contracts');

function parseReviewerArtifactContent(content) {
  const verdictValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Review Verdict'));
  const followUpValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Follow-Up Gate'));
  const verdict = String(verdictValues.verdict || '').trim().toLowerCase();

  if (!['pass', 'fail', 'changes_requested'].includes(verdict)) {
    throw new Error('Reviewer artifact verdict must be pass, fail, or changes_requested');
  }

  return {
    blockingIssue: parseYesNoValue(followUpValues['blocking issue']) === true,
    changeSummaryArtifactId: verdictValues['change-summary artifact'] || null,
    contractCompliance: parseMarkdownList(content, 'Contract Compliance'),
    decisionRequired: parseYesNoValue(followUpValues['decision required']) === true,
    diffArtifactId: verdictValues['diff artifact'] || null,
    evidence: parseMarkdownList(content, 'Evidence Reviewed'),
    findings: parseMarkdownList(content, 'Findings'),
    nextAction: parseMarkdownList(content, 'Next Action')[0] || null,
    patchArtifactId: verdictValues['patch artifact'] || null,
    preflightArtifactId: verdictValues['preflight artifact'] || null,
    sourceBuilderRunId: verdictValues['source builder run'] || null,
    verificationEvidence: parseMarkdownList(content, 'Verification Evidence'),
    verdict,
  };
}

function buildDefaultCommitMessage(task) {
  return [task?.id, String(task?.title || task?.intent || 'local commit').replace(/\s+/g, ' ').trim()]
    .filter(Boolean)
    .join(': ');
}

function parseCommitPackageArtifactContent(content) {
  const sourceReviewerValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Reviewer Bundle'));
  const sourceBuilderValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Builder Bundle'));
  const verificationValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Verification Evidence'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Execution Safety'));
  const commitMessage = getMarkdownSection(content, 'Commit Message').trim();

  return {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    builderLiveMutationApprovalId: sourceReviewerValues['builder live mutation approval'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    changedFiles: parseMarkdownList(content, 'Changed Files'),
    commitMessage: commitMessage || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceReviewerValues['target preflight artifact'] || null,
    reviewArtifactId: sourceReviewerValues['review artifact'] || null,
    reviewerMappedStatus: verificationValues['reviewer mapped status'] || null,
    reviewerRawVerdict: verificationValues['reviewer raw verdict'] || null,
    sourceBuilderRunId: sourceReviewerValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewerValues['source reviewer run'] || null,
  };
}

function parseCommitResultArtifactContent(content) {
  const sourceValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Commit Package'));
  const commitValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Commit'));
  const validationValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Validation'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Safety'));

  return {
    commitApprovalId: sourceValues['commit approval'] || null,
    commitMessage: commitValues['commit message'] || null,
    commitPackageArtifactId: sourceValues['source commit-package artifact'] || null,
    commitSha: commitValues['commit sha'] || null,
    committedFiles: parseMarkdownList(content, 'Committed Files'),
    committedFilesMatchedScope: parseYesNoValue(validationValues['committed files matched scope']),
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    preflightArtifactId: sourceValues['target preflight artifact'] || null,
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    reviewArtifactId: sourceValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceValues['source builder approval'] || null,
    sourceBuilderRunId: sourceValues['source builder run'] || null,
    sourceReviewerRunId: sourceValues['source reviewer run'] || null,
  };
}

function parseReleasePackageArtifactContent(content) {
  const sourceCommitValues = parseMarkdownKeyValueLines(
    getMarkdownSection(content, 'Source Local Commit Bundle'),
  );
  const sourceBuilderValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Builder Bundle'));
  const releaseCandidateValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Release Candidate'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Execution Safety'));

  return {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    commitApprovalId: sourceCommitValues['commit approval'] || null,
    commitMessage: releaseCandidateValues['commit message'] || null,
    commitPackageArtifactId: sourceCommitValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceCommitValues['source commit-result artifact'] || null,
    commitSha: releaseCandidateValues['commit sha'] || null,
    committedFiles: parseMarkdownList(content, 'Committed Files'),
    deliveryStance: releaseCandidateValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    externalReleaseExecuted: parseYesNoValue(safetyValues['external release executed']),
    localCommitBundleExecuted: parseYesNoValue(safetyValues['local commit bundle executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceCommitValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(safetyValues['publish executed']),
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    reviewArtifactId: sourceCommitValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceCommitValues['source builder approval'] || null,
    sourceBuilderRunId: sourceCommitValues['source builder run'] || null,
    sourceReviewerRunId: sourceCommitValues['source reviewer run'] || null,
  };
}

function buildCommitApprovalTitle(metadata) {
  return `Approval required: ${COMMIT_ACTION.COMMIT_INTENT} | commitPackageArtifactId=${metadata.commitPackageArtifactId} | sourceReviewerRunId=${metadata.sourceReviewerRunId} | sourceBuilderRunId=${metadata.sourceBuilderRunId} | targetPreflightArtifactId=${metadata.targetPreflightArtifactId}`;
}

function buildCommitApprovalPrompt(metadata) {
  return [
    `Approval required before ${COMMIT_ACTION.COMMIT_INTENT}.`,
    `commitPackageArtifactId: ${metadata.commitPackageArtifactId}`,
    `sourceReviewerRunId: ${metadata.sourceReviewerRunId}`,
    `sourceBuilderRunId: ${metadata.sourceBuilderRunId}`,
    `targetPreflightArtifactId: ${metadata.targetPreflightArtifactId}`,
  ].join('\n');
}

function buildReleaseApprovalTitle(metadata) {
  return `Approval required: ${RELEASE_ACTION.RELEASE_READY} | releasePackageArtifactId=${metadata.releasePackageArtifactId} | commitResultArtifactId=${metadata.commitResultArtifactId} | commitPackageArtifactId=${metadata.commitPackageArtifactId} | sourceReviewerRunId=${metadata.sourceReviewerRunId} | sourceBuilderRunId=${metadata.sourceBuilderRunId} | targetPreflightArtifactId=${metadata.targetPreflightArtifactId} | commitSha=${metadata.commitSha} | deliveryStance=${metadata.deliveryStance}`;
}

function buildReleaseApprovalPrompt(metadata) {
  return [
    `Approval required before ${RELEASE_ACTION.RELEASE_READY}.`,
    `releasePackageArtifactId: ${metadata.releasePackageArtifactId}`,
    `commitResultArtifactId: ${metadata.commitResultArtifactId}`,
    `commitPackageArtifactId: ${metadata.commitPackageArtifactId}`,
    `sourceReviewerRunId: ${metadata.sourceReviewerRunId}`,
    `sourceBuilderRunId: ${metadata.sourceBuilderRunId}`,
    `targetPreflightArtifactId: ${metadata.targetPreflightArtifactId}`,
    `commitSha: ${metadata.commitSha}`,
    `deliveryStance: ${metadata.deliveryStance}`,
  ].join('\n');
}

function renderMarkdownList(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function renderCommitPackageArtifact(input) {
  const changedFiles = Array.isArray(input.builderRun.summary?.changedFiles)
    ? input.builderRun.summary.changedFiles
    : [];
  const commitMessage = String(input.commitMessage || '').trim();

  return `# Commit Package: ${input.task.title}

## Source Reviewer Bundle
- source reviewer run: ${input.reviewerRun.id}
- review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- builder live mutation approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Source Builder Bundle
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Commit Message
${commitMessage}

## Changed Files
${renderMarkdownList(changedFiles, 'none')}

## Verification Evidence
- reviewer mapped status: passed
- reviewer raw verdict: pass
- review artifact: ${input.reviewArtifact.id}
- diff artifact: ${input.diffArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- builder logs reviewed: ${input.builderLogs.length}

## Execution Safety
- git commit executed: no
- push executed: no
- merge executed: no
- release executed: no
`;
}

function renderCommitResultArtifact(input) {
  return `# Commit Result: ${input.task.title}

## Source Commit Package
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit approval: ${input.commitApproval.id}
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Commit
- commit sha: ${input.commitSha}
- commit message: ${input.commitMessage}

## Committed Files
${renderMarkdownList(input.committedFiles, 'none')}

## Validation
- scope file count: ${input.scopeFiles.length}
- repo changed file count before commit: ${input.repoStatusBefore.allFiles.length}
- dirty file count before commit: ${input.repoStatusBefore.dirtyFiles.length}
- staged file count before commit: ${input.repoStatusBefore.stagedFiles.length}
- untracked file count before commit: ${input.repoStatusBefore.untrackedFiles.length}
- staged file count after git add: ${input.repoStatusAfterAdd.stagedFiles.length}
- dirty file count after git add: ${input.repoStatusAfterAdd.dirtyFiles.length}
- untracked file count after git add: ${input.repoStatusAfterAdd.untrackedFiles.length}
- committed files matched scope: yes
- repo clean after commit: yes

## Safety
- git commit executed: yes
- push executed: no
- merge executed: no
- release executed: no
`;
}

function renderReleasePackageArtifact(input) {
  return `# Release Package: ${input.task.title}

## Source Local Commit Bundle
- source commit-result artifact: ${input.commitResultArtifact.id}
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit approval: ${input.commitApproval.id}
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Source Builder Bundle
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Release Candidate
- commit sha: ${input.commitSha}
- commit message: ${input.commitMessage}
- delivery stance: ${input.deliveryStance}

## Committed Files
${renderMarkdownList(input.committedFiles, 'none')}

## Human Gate
- release approval required: yes
- allowed next action: ${RELEASE_ACTION.RELEASE_READY}

## Execution Safety
- local commit bundle executed: yes
- push executed: no
- publish executed: no
- external release executed: no
`;
}

function renderCloseOutArtifact(input) {
  return `# Close-Out: ${input.task.title}

## Done Transition
- source release approval: ${input.releaseApproval.id}
- source release-package artifact: ${input.releasePackageArtifact.id}
- close-out run: ${input.run.id}
- closed out at: ${input.closedOutAt}
- lifecycle transition: Review -> Done
- task lifecycle before close-out: ${input.lifecycleStateBefore}
- task lifecycle after close-out: Done

## Source Release Bundle
- source release-package artifact: ${input.releasePackageArtifact.id}
- source commit-result artifact: ${input.commitResultArtifact.id}
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit sha: ${input.commitSha}
- delivery stance: ${input.deliveryStance}

## Source Review Bundle
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- reviewer mapped status: ${input.reviewerRun.summary?.mappedReviewStatus || 'unknown'}
- reviewer raw verdict: ${input.reviewerRun.summary?.rawVerdict || 'unknown'}

## Source Builder Bundle
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Worktree Verification
- repo clean before close-out: yes
- dirty file count: ${input.repoStatus.dirtyFiles.length}
- staged file count: ${input.repoStatus.stagedFiles.length}
- untracked file count: ${input.repoStatus.untrackedFiles.length}

## Release Safety
- push executed: no
- publish executed: no
- external release executed: no
`;
}

module.exports = {
  buildCommitApprovalPrompt,
  buildCommitApprovalTitle,
  buildDefaultCommitMessage,
  buildReleaseApprovalPrompt,
  buildReleaseApprovalTitle,
  parseCommitPackageArtifactContent,
  parseCommitResultArtifactContent,
  parseReleasePackageArtifactContent,
  parseReviewerArtifactContent,
  renderCloseOutArtifact,
  renderCommitPackageArtifact,
  renderCommitResultArtifact,
  renderMarkdownList,
  renderReleasePackageArtifact,
};
