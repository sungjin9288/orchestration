import { GROWTH_AUTHORITY_BOUNDARY, PROPOSAL_RECORD_OPEN_REQUIREMENTS } from './growth-config.js';
import { createToken, escapeHtml } from './formatters.js';
import { getSurfaceDisplayName } from './surface-config.js';

export function renderGrowthCandidateDrilldown(growth) {
  if (!growth.candidates.length) {
    return `
      <div class="growth-candidate-empty" data-growth-candidate-drilldown="empty">
        <strong>후보 대기</strong>
        <span>실행 실패, 검토 산출물, 대기 중인 gate가 생기면 여기에서 근거별 개선 후보를 읽습니다.</span>
      </div>
    `;
  }

  return `
    <div class="growth-candidate-list" data-growth-candidate-drilldown="true">
      ${growth.candidates
        .map(
          (candidate, index) => `
            <details class="growth-candidate-card" ${index === 0 ? 'open' : ''}>
              <summary class="growth-candidate-summary">
                <span class="growth-candidate-rank">${escapeHtml(String(index + 1).padStart(2, '0'))}</span>
                <span class="growth-candidate-main">
                  <strong>${escapeHtml(candidate.title)}</strong>
                  <span>${escapeHtml(candidate.typeLabel)} · ${escapeHtml(candidate.sourceId)}</span>
                </span>
                ${createToken(candidate.severityLabel, candidate.severity === 'high' ? 'warning' : 'neutral')}
              </summary>
              <div class="growth-candidate-detail">
                <div class="growth-candidate-detail-grid">
                  <div>
                    <span class="control-overview-register-label">근거 위치</span>
                    <strong class="control-overview-register-value">${escapeHtml(getSurfaceDisplayName(candidate.sourceSurface))}</strong>
                  </div>
                  <div>
                    <span class="control-overview-register-label">신뢰도</span>
                    <strong class="control-overview-register-value">${escapeHtml(candidate.confidenceLabel)}</strong>
                  </div>
                </div>
                <p>${escapeHtml(candidate.reason)}</p>
                <p><strong>리뷰 질문</strong>: ${escapeHtml(candidate.reviewerQuestion)}</p>
                <p><strong>다음 판단</strong>: ${escapeHtml(candidate.proposedNextStep)}</p>
              </div>
            </details>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderGrowthDashboardEvidenceDepth(growth) {
  return `
    <div
      class="growth-dashboard-depth"
      data-growth-dashboard-evidence-depth="read-only"
      data-failure-pattern-groups="true"
      data-regression-comparison="read-only"
      data-rollback-evidence-links="true"
      data-growth-dashboard-action-allowed="false"
    >
      <div class="growth-dashboard-depth-head">
        <div>
          <p class="control-overview-label">증거 깊이</p>
          <h4 class="growth-proposal-title">실패 묶음, 회귀 비교, 되돌림 근거를 함께 봅니다</h4>
        </div>
        ${createToken('표시 전용', 'neutral')}
      </div>
      <div class="growth-pattern-grid" aria-label="묶인 실패 패턴">
        ${growth.failurePatternGroups
          .map(
            (group) => `
              <div class="growth-pattern-cell" data-growth-failure-pattern="${escapeHtml(group.id)}">
                <span class="control-overview-register-label">${escapeHtml(group.label)}</span>
                <strong class="control-overview-register-value">${escapeHtml(`${group.count}건`)}</strong>
                <span>${escapeHtml(group.evidenceRefs.length ? group.evidenceRefs.join(', ') : '근거 대기')}</span>
                <em>${escapeHtml(group.reviewPrompt)}</em>
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="growth-regression-row" aria-label="회귀 비교">
        <div>
          <span class="control-overview-register-label">실패 / 완료</span>
          <strong class="control-overview-register-value">${escapeHtml(`${growth.regressionComparison.failedCount} / ${growth.regressionComparison.completedCount}`)}</strong>
        </div>
        <div>
          <span class="control-overview-register-label">최근 비교</span>
          <strong class="control-overview-register-value">${escapeHtml(`${growth.regressionComparison.latestFailedRef} ↔ ${growth.regressionComparison.latestCompletedRef}`)}</strong>
        </div>
        <p>${escapeHtml(growth.regressionComparison.summary)}</p>
      </div>
      <div class="growth-rollback-list" aria-label="되돌림 근거 링크">
        ${growth.rollbackEvidenceLinks.length
          ? growth.rollbackEvidenceLinks
              .map(
                (link) => `
                  <span class="growth-rollback-chip">
                    ${escapeHtml(link.type)} · ${escapeHtml(link.id)} · ${escapeHtml(link.taskId)}
                  </span>
                `,
              )
              .join('')
          : '<span class="growth-rollback-chip">되돌림 근거 대기</span>'}
      </div>
    </div>
  `;
}

export function renderGrowthProposalReviewPreview(growth) {
  const leadCandidate = growth.candidates[0] || null;
  const blockedActionCount = leadCandidate?.blockedActions.length || 5;

  return `
    <div
      class="growth-proposal-review"
      data-growth-proposal-review="blocked"
      data-proposal-generation-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalGenerationAllowed}"
      data-proposal-application-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAllowed}"
      data-proposal-record-creation-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalRecordCreationAllowed}"
      data-proposal-record-persistence-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalRecordPersistenceAllowed}"
      data-memory-persistence-allowed="${GROWTH_AUTHORITY_BOUNDARY.memoryPersistenceAllowed}"
      data-long-term-memory-store-allowed="${GROWTH_AUTHORITY_BOUNDARY.longTermMemoryStoreAllowed}"
      data-source-mutation-allowed="${GROWTH_AUTHORITY_BOUNDARY.sourceMutationAllowed}"
    >
      <div>
        <p class="control-overview-label">제안 검토 게이트</p>
        <h4 class="growth-proposal-title">${escapeHtml(leadCandidate ? leadCandidate.title : '후보 선택 대기')}</h4>
        <p class="intelligence-copy">
          ${escapeHtml(
            leadCandidate
              ? leadCandidate.reviewerQuestion
              : '검증 증거가 생기면 제안 기록으로 보낼지 사람 리뷰에서 먼저 판단합니다.',
          )}
        </p>
        <div class="growth-proposal-readiness" aria-label="제안 기록 생성 전 조건">
          ${PROPOSAL_RECORD_OPEN_REQUIREMENTS.map(
            (requirement) => `
              <span>
                ${escapeHtml(requirement)}
              </span>
            `,
          ).join('')}
        </div>
      </div>
      <div class="growth-proposal-actions" aria-label="차단된 proposal 권한">
        ${createToken(`차단:${blockedActionCount}`, 'warning')}
        <button class="growth-proposal-blocked-button" type="button" disabled>
          승인 전 적용 차단
        </button>
      </div>
    </div>
  `;
}
