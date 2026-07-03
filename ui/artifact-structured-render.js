import {
  getArtifactCatalogEntry,
  getArtifactMeaningBadge,
  getArtifactPreviewBadge,
  getPreviewRedactionCopy,
} from './artifact-preview.js';
import {
  getApprovalActionLabel,
  getBooleanDisplay,
  getDeliveryStanceDisplay,
  getReviewStatusDisplay,
  getReviewTone,
  getReviewerVerdictDisplay,
  getReviewerVerdictTone,
} from './execution-labels.js';
import { createToken, escapeHtml } from './formatters.js';

export function renderBreakdownList(title, items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  const tagName = options.ordered ? 'ol' : 'ul';

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <${tagName} class="breakdown-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </${tagName}>
    </section>
  `;
}

export function renderStructuredBreakdown(parsed, options = {}) {
  if (!parsed) {
    return '';
  }

  const includeCheckpoints = options.includeCheckpoints !== false;
  const includeExpectedArtifacts = options.includeExpectedArtifacts !== false;
  const includeExecutionBoundary = options.includeExecutionBoundary !== false;
  const includeStopConditions = options.includeStopConditions !== false;
  const includeVerification = options.includeVerification !== false;
  const includeReviewTrigger = options.includeReviewTrigger !== false;
  const sections = [
    renderBreakdownList('정렬된 하위 작업', parsed.orderedSubTasks, { ordered: true }),
    includeCheckpoints ? renderBreakdownList('체크포인트', parsed.checkpoints) : '',
    includeExpectedArtifacts
      ? renderBreakdownList('체크포인트별 기대 아티팩트', parsed.expectedArtifacts)
      : '',
    includeVerification
      ? renderBreakdownList('검증 체크포인트', parsed.verificationCheckpoints)
      : '',
    includeReviewTrigger
      ? renderBreakdownList('리뷰 트리거 지점', parsed.reviewTriggerPoints)
      : '',
    includeStopConditions
      ? renderBreakdownList(
          '중단 및 에스컬레이션 조건',
          parsed.stopAndEscalateConditions,
        )
      : '',
    includeExecutionBoundary
      ? renderBreakdownList('실행 경계 요약', parsed.executionBoundarySummary)
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

export function renderStructuredPreflight(parsed) {
  if (!parsed) {
    return '';
  }

  const sections = [
    renderBreakdownList('대상 파일', parsed.targetFiles),
    renderBreakdownList('의도된 변경', parsed.intendedChanges),
    renderBreakdownList('위험 요소', parsed.risks),
    renderBreakdownList('검증 계획', parsed.verificationPlan),
    renderBreakdownList(
      '리뷰 증거 기대값',
      parsed.reviewEvidenceExpectations,
    ),
    renderBreakdownList('에스컬레이션 트리거', parsed.escalationTriggers),
    renderBreakdownList('입력 요약', parsed.inputSummary),
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

export function renderStructuredChangeSummary(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.approvalId ? createToken(`approval:${parsed.approvalId}`, 'neutral') : ''}
        ${
          parsed.targetFileAllowlistCount !== null
            ? createToken(`허용목록:${parsed.targetFileAllowlistCount}`, 'neutral')
            : ''
        }
        ${
          parsed.preparedFileUpdates !== null
            ? createToken(`업데이트:${parsed.preparedFileUpdates}`, 'neutral')
            : ''
        }
        ${
          parsed.fileUpdates.length > 0
            ? createToken(`파일업데이트:${parsed.fileUpdates.length}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerExecuted
            ? createToken(`리뷰어:${parsed.reviewerExecuted}`, 'warning')
            : ''
        }
        ${
          parsed.commitOrReleaseExecuted
            ? createToken(`커밋/릴리스:${parsed.commitOrReleaseExecuted}`, 'warning')
            : ''
        }
      </div>
      ${renderBreakdownList('변경 요약', parsed.changeSummary)}
      ${renderBreakdownList('대상 파일', parsed.targetFiles)}
      ${
        parsed.fileUpdates.length > 0
          ? `
            <section class="breakdown-section">
              <p class="detail-key">파일 업데이트</p>
              <p class="detail-copy">${escapeHtml(getPreviewRedactionCopy())}</p>
              <ul class="breakdown-list">
                ${parsed.fileUpdates
                  .map((update) => {
                    const detail =
                      update.encoding || update.payloadStored
                        ? `${update.path} (${update.encoding || 'stored'} payload는 preview에서 가려짐)`
                        : `${update.path} (preview 가려짐)`;
                    return `<li>${escapeHtml(detail)}</li>`;
                  })
                  .join('')}
              </ul>
            </section>
          `
          : ''
      }
      ${renderBreakdownList('위험 요소', parsed.risks)}
      ${renderBreakdownList('검증 메모', parsed.verificationNotes)}
    </div>
  `;
}

export function renderStructuredReview(parsed, taskReviewStatus = null) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured review-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.verdict ? createToken(`판정:${getReviewerVerdictDisplay(parsed.verdict)}`, getReviewerVerdictTone(parsed.verdict)) : ''}
        ${
          parsed.mappedReviewStatus
            ? createToken(
                `매핑리뷰:${getReviewStatusDisplay(parsed.mappedReviewStatus)}`,
                getReviewTone(parsed.mappedReviewStatus),
              )
            : ''
        }
        ${
          taskReviewStatus
            ? createToken(`태스크리뷰:${getReviewStatusDisplay(taskReviewStatus)}`, getReviewTone(taskReviewStatus))
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`소스run:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${createToken(`증거:${parsed.evidence.length}`, 'neutral')}
        ${
          parsed.findings.length > 0
            ? createToken(`발견:${parsed.findings.length}`, 'danger')
            : createToken('발견:0', 'success')
        }
        ${
          parsed.blockingIssue === true
            ? createToken('차단이슈:예', 'danger')
            : parsed.blockingIssue === false
              ? createToken('차단이슈:아니오', 'success')
              : ''
        }
        ${
          parsed.decisionRequired === true
            ? createToken('결정필요:예', 'warning')
            : parsed.decisionRequired === false
              ? createToken('결정필요:아니오', 'success')
              : ''
        }
      </div>
      ${renderBreakdownList('검토한 증거', parsed.evidence)}
      ${renderBreakdownList('발견 사항', parsed.findings)}
      ${renderBreakdownList('계약 준수', parsed.contractCompliance)}
      ${renderBreakdownList('검증 증거', parsed.verificationEvidence)}
      ${renderBreakdownList('다음 액션', parsed.nextAction)}
      ${renderBreakdownList('수용된 위험', parsed.acceptedRisks)}
    </div>
  `;
}

export function renderStructuredCommitPackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.builderLiveMutationApprovalId
            ? createToken(`빌더승인:${parsed.builderLiveMutationApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerMappedStatus
            ? createToken(`매핑리뷰:${getReviewStatusDisplay(parsed.reviewerMappedStatus)}`, 'success')
            : ''
        }
        ${
          parsed.reviewerRawVerdict
            ? createToken(
                `원시판정:${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}`,
                getReviewerVerdictTone(parsed.reviewerRawVerdict),
              )
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${getBooleanDisplay(parsed.gitCommitExecuted)}`,
                parsed.gitCommitExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${getBooleanDisplay(parsed.mergeExecuted)}`,
                parsed.mergeExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${getBooleanDisplay(parsed.releaseExecuted)}`,
                parsed.releaseExecuted ? 'warning' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '소스 리뷰어 번들',
        [
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.builderLiveMutationApprovalId
            ? `빌더 라이브 변경 승인: ${parsed.builderLiveMutationApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('변경 파일', parsed.changedFiles)}
      ${renderBreakdownList(
        '검증 증거',
        [
          parsed.reviewerMappedStatus ? `리뷰어 매핑 상태: ${getReviewStatusDisplay(parsed.reviewerMappedStatus)}` : null,
          parsed.reviewerRawVerdict ? `리뷰어 원시 판정: ${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}` : null,
          parsed.reviewArtifactId ? `리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '실행 안전성',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit 실행: ${getBooleanDisplay(parsed.gitCommitExecuted)}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge 실행: ${getBooleanDisplay(parsed.mergeExecuted)}`
            : null,
          parsed.releaseExecuted !== null
            ? `release 실행: ${getBooleanDisplay(parsed.releaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

export function renderStructuredCommitResult(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${
          parsed.commitApprovalId
            ? createToken(`커밋승인:${parsed.commitApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${getBooleanDisplay(parsed.gitCommitExecuted)}`,
                parsed.gitCommitExecuted ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${getBooleanDisplay(parsed.mergeExecuted)}`,
                parsed.mergeExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${getBooleanDisplay(parsed.releaseExecuted)}`,
                parsed.releaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '증적 연결',
        [
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `커밋 승인: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId
            ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '커밋',
        [
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `커밋 메시지: ${parsed.commitMessage}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('커밋된 파일', parsed.committedFiles)}
      ${renderBreakdownList(
        '검증',
        [
          parsed.scopeFileCount !== null ? `범위 파일 수: ${parsed.scopeFileCount}` : null,
          parsed.repoChangedFileCountBeforeCommit !== null
            ? `커밋 전 저장소 변경 파일 수: ${parsed.repoChangedFileCountBeforeCommit}`
            : null,
          parsed.dirtyFileCountBeforeCommit !== null
            ? `커밋 전 수정 파일 수: ${parsed.dirtyFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountBeforeCommit !== null
            ? `커밋 전 스테이징 파일 수: ${parsed.stagedFileCountBeforeCommit}`
            : null,
          parsed.untrackedFileCountBeforeCommit !== null
            ? `커밋 전 미추적 파일 수: ${parsed.untrackedFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountAfterGitAdd !== null
            ? `git add 후 스테이징 파일 수: ${parsed.stagedFileCountAfterGitAdd}`
            : null,
          parsed.dirtyFileCountAfterGitAdd !== null
            ? `git add 후 수정 파일 수: ${parsed.dirtyFileCountAfterGitAdd}`
            : null,
          parsed.untrackedFileCountAfterGitAdd !== null
            ? `git add 후 미추적 파일 수: ${parsed.untrackedFileCountAfterGitAdd}`
            : null,
          parsed.committedFilesMatchedScope !== null
            ? `커밋 파일이 범위와 일치: ${getBooleanDisplay(parsed.committedFilesMatchedScope)}`
            : null,
          parsed.repoCleanAfterCommit !== null
            ? `커밋 후 저장소 정리 상태: ${getBooleanDisplay(parsed.repoCleanAfterCommit)}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '안전성',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit 실행: ${getBooleanDisplay(parsed.gitCommitExecuted)}`
            : null,
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge 실행: ${getBooleanDisplay(parsed.mergeExecuted)}`
            : null,
          parsed.releaseExecuted !== null
            ? `release 실행: ${getBooleanDisplay(parsed.releaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

export function renderStructuredReleasePackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`전달:${getDeliveryStanceDisplay(parsed.deliveryStance)}`, 'neutral') : ''}
        ${
          parsed.commitResultArtifactId
            ? createToken(`커밋결과:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.releaseApprovalRequired !== null
            ? createToken(
                `릴리스승인:${getBooleanDisplay(parsed.releaseApprovalRequired)}`,
                parsed.releaseApprovalRequired ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseReadyAction
            ? createToken(`액션:${getApprovalActionLabel(parsed.releaseReadyAction) || parsed.releaseReadyAction}`, 'neutral')
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${getBooleanDisplay(parsed.publishExecuted)}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `외부릴리스:${getBooleanDisplay(parsed.externalReleaseExecuted)}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '소스 로컬 커밋 번들',
        [
          parsed.commitResultArtifactId
            ? `소스 커밋결과 아티팩트: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `커밋 승인: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '릴리스 후보',
        [
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `커밋 메시지: ${parsed.commitMessage}` : null,
          parsed.deliveryStance ? `전달 stance: ${getDeliveryStanceDisplay(parsed.deliveryStance)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('커밋된 파일', parsed.committedFiles)}
      ${renderBreakdownList(
        '사람 게이트',
        [
          parsed.releaseApprovalRequired !== null
            ? `릴리스 승인 필요: ${getBooleanDisplay(parsed.releaseApprovalRequired)}`
            : null,
          parsed.releaseReadyAction ? `허용된 다음 액션: ${getApprovalActionLabel(parsed.releaseReadyAction) || parsed.releaseReadyAction}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '실행 안전성',
        [
          parsed.localCommitBundleExecuted !== null
            ? `로컬 커밋 번들 실행: ${getBooleanDisplay(parsed.localCommitBundleExecuted)}`
            : null,
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.publishExecuted !== null
            ? `publish 실행: ${getBooleanDisplay(parsed.publishExecuted)}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `외부 릴리스 실행: ${getBooleanDisplay(parsed.externalReleaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

export function renderStructuredCloseOut(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.lifecycleTransition
            ? createToken(`전환:${parsed.lifecycleTransition}`, 'success')
            : ''
        }
        ${
          parsed.releasePackageArtifactId
            ? createToken(`릴리스패키지:${parsed.releasePackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitResultArtifactId
            ? createToken(`커밋결과:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`커밋패키지:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`전달:${getDeliveryStanceDisplay(parsed.deliveryStance)}`, 'neutral') : ''}
        ${
          parsed.sourceReviewerRunId
            ? createToken(`리뷰어:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`빌더:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.repoCleanBeforeCloseOut !== null
            ? createToken(
                `저장소정상:${getBooleanDisplay(parsed.repoCleanBeforeCloseOut)}`,
                parsed.repoCleanBeforeCloseOut ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${getBooleanDisplay(parsed.pushExecuted)}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${getBooleanDisplay(parsed.publishExecuted)}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `외부릴리스:${getBooleanDisplay(parsed.externalReleaseExecuted)}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        '완료 전환',
        [
          parsed.releaseApprovalId ? `소스 릴리스 승인: ${parsed.releaseApprovalId}` : null,
          parsed.releasePackageArtifactId
            ? `소스 릴리스패키지 아티팩트: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.closeOutRunId ? `종료 정리 run: ${parsed.closeOutRunId}` : null,
          parsed.closedOutAt ? `종료 시각: ${parsed.closedOutAt}` : null,
          parsed.lifecycleTransition ? `라이프사이클 전환: ${parsed.lifecycleTransition}` : null,
          parsed.lifecycleStateBefore
            ? `종료 전 태스크 라이프사이클: ${parsed.lifecycleStateBefore}`
            : null,
          parsed.lifecycleStateAfter
            ? `종료 후 태스크 라이프사이클: ${parsed.lifecycleStateAfter}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 릴리스 번들',
        [
          parsed.releasePackageArtifactId
            ? `소스 릴리스패키지 아티팩트: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.commitResultArtifactId
            ? `소스 커밋결과 아티팩트: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `소스 커밋패키지 아티팩트: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitSha ? `커밋 sha: ${parsed.commitSha}` : null,
          parsed.deliveryStance ? `전달 stance: ${getDeliveryStanceDisplay(parsed.deliveryStance)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 리뷰 번들',
        [
          parsed.sourceReviewerRunId ? `소스 리뷰어 run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `소스 리뷰 아티팩트: ${parsed.reviewArtifactId}` : null,
          parsed.reviewerMappedStatus
            ? `리뷰어 매핑 상태: ${getReviewStatusDisplay(parsed.reviewerMappedStatus)}`
            : null,
          parsed.reviewerRawVerdict ? `리뷰어 원시 판정: ${getReviewerVerdictDisplay(parsed.reviewerRawVerdict)}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '소스 빌더 번들',
        [
          parsed.sourceBuilderRunId ? `소스 빌더 run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `소스 빌더 승인: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `대상 프리플라이트 아티팩트: ${parsed.preflightArtifactId}` : null,
          parsed.planArtifactId ? `계획 아티팩트: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `설계 아티팩트: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `분해 아티팩트: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `변경요약 아티팩트: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `패치 아티팩트: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff 아티팩트: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '워크트리 검증',
        [
          parsed.repoCleanBeforeCloseOut !== null
            ? `종료 전 저장소 정리 상태: ${getBooleanDisplay(parsed.repoCleanBeforeCloseOut)}`
            : null,
          parsed.dirtyFileCount !== null ? `수정 파일 수: ${parsed.dirtyFileCount}` : null,
          parsed.stagedFileCount !== null ? `스테이징 파일 수: ${parsed.stagedFileCount}` : null,
          parsed.untrackedFileCount !== null
            ? `미추적 파일 수: ${parsed.untrackedFileCount}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        '릴리스 안전성',
        [
          parsed.pushExecuted !== null
            ? `push 실행: ${getBooleanDisplay(parsed.pushExecuted)}`
            : null,
          parsed.publishExecuted !== null
            ? `publish 실행: ${getBooleanDisplay(parsed.publishExecuted)}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `외부 릴리스 실행: ${getBooleanDisplay(parsed.externalReleaseExecuted)}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

export function renderStructuredUnifiedDiff(parsed, label) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      <div class="token-row">
        ${createToken(label, 'neutral')}
        ${createToken(`파일:${parsed.files.length}`, 'neutral')}
        ${createToken(`hunk:${parsed.hunkCount}`, 'neutral')}
      </div>
      ${renderBreakdownList('파일', parsed.files)}
    </div>
  `;
}

export function renderCompactList(title, items, limit = 2) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <ul class="compact-list">
        ${items
          .slice(0, limit)
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}
      </ul>
    </section>
  `;
}

export function getArtifactPolicySummary(artifact, data) {
  const entry = getArtifactCatalogEntry(artifact, data);
  const meaningBadge = getArtifactMeaningBadge(entry);
  const previewBadge = getArtifactPreviewBadge(entry);

  if (!meaningBadge || !previewBadge) {
    return '';
  }

  return `${meaningBadge.label}. ${previewBadge.label}.`;
}
