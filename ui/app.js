import {
  parseBreakdownArtifact,
  parseChangeSummaryArtifact,
  parseCloseOutArtifact,
  parseCommitPackageArtifact,
  parseCommitResultArtifact,
  parsePreflightArtifact,
  parseReleasePackageArtifact,
  parseReviewArtifact,
  parseUnifiedDiffArtifact,
} from './artifact-parsing.js';
import {
  getArtifactMeaningBadge,
  getArtifactPreviewBadge,
  getArtifactTypeDisplay,
  getPreviewRedactionCopy,
  getRawOnlyPreviewCopy,
  getStructuredPreviewFallbackCopy,
  getStructuredPreviewLeadCopy,
  getArtifactCatalogEntry,
  renderArtifactPolicyTokens,
} from './artifact-preview.js';
import {
  buildCloseOutRelationContext,
  buildCommitPackageRelationContext,
  buildReleasePackageRelationContext,
  getArtifactRelationContext,
  getPreferredArtifactForRun,
  getRunArtifactBundle,
} from './artifact-relations.js';
import {
  getArtifactPolicySummary,
  renderCompactList,
  renderStructuredBreakdown,
  renderStructuredChangeSummary,
  renderStructuredCloseOut,
  renderStructuredCommitPackage,
  renderStructuredCommitResult,
  renderStructuredPreflight,
  renderStructuredReleasePackage,
  renderStructuredReview,
  renderStructuredUnifiedDiff,
} from './artifact-structured-render.js';
import {
  getArchitectAvailability,
  getBuilderPreflightAvailability,
  getCloseOutAvailability,
  getCommitExecutionAvailability,
  getCommitPackageAvailability,
  getPlannerAvailability,
  getReleasePackageAvailability,
  getReviewerAvailability,
  getTaskBreakerAvailability,
} from './availability.js';
import {
  getEvidenceRailHandoffDisplay,
  getEvidenceRailStatusDisplay,
  getEvidenceRailStatusTone,
  getGuardReasonDisplay,
  getBooleanDisplay,
  getApprovalActionLabel,
  getApprovalDisplayTone,
  getApprovalStatusDisplay,
  getApprovalTone,
  getCloseOutApprovalDisplayStatus,
  getCommitApprovalDisplayStatus,
  getDeliveryStanceDisplay,
  getAlignmentStatusDisplay,
  getAlignmentTone,
  getCouncilStatusDisplay,
  getCouncilStatusTone,
  getExecutionModeDisplay,
  getExecutionRoleDisplay,
  getExecutionStageDisplay,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getPackageStatusDisplay,
  getProviderReadinessDisplay,
  getReviewStatusDisplay,
  getReviewTone,
  getReviewerVerdictDisplay,
  getReviewerVerdictTone,
  getRunStatusDisplay,
  getRunTone,
  getRunRelationLabelDisplay,
  getTaskLifecycleDisplay,
  getTaskLifecycleTone,
} from './execution-labels.js';
import {
  getInboxKindDisplay,
  getInboxResolutionActionDisplay,
  getInboxStatusDisplay,
  getInboxTone,
} from './inbox-labels.js';
import {
  COMPANY_DESK_OPTIONS,
  COMPANY_MEMBER_STORAGE_KEY,
  COMPANY_ROLE_OPTIONS,
  DEFAULT_COMPANY_MEMBERS,
  OPS_EDITOR_GROUP_DEFAULTS,
  getCompanyDirectorySummary,
  getCompanyMembersForGroup,
  getCompanyDeskLabel,
  getCompanyRoleLabel,
  getOpsEditorGroupLabel,
  getOpsEditorMembers,
  hasCompanyDesk,
  hasCompanyRole,
  normalizeCompanyMember,
} from './company-config.js';
import {
  getCouncilControlSnapshot,
  getDeliverablesCompletionSummary,
  getDeliverablesControlSnapshot,
  getDeliverablesLeftSnapshot,
  getExecutionControlSnapshot,
  getExecutionLeftSnapshot,
  getMissionBriefControlSnapshot,
  getMissionDeliverablesPreview,
  getMissionFirstRunHandoff,
  getMissionHandoffState,
  getMissionLoopStatus,
  getMissionNextActionPreview,
  getMissionSurfaceRailEntries,
  renderDeliverablesCompletionSummary,
  renderExecutionEvidenceRail,
  renderMissionSnapshotList,
} from './control-snapshots.js';
import {
  COUNCIL_CAST_METADATA,
  COUNCIL_CAST_ORDER,
  ORCHESTRATION_FLOW_STEPS,
  ORCHESTRATION_RULES,
} from './council-config.js';
import {
  getCompanySignalEntries,
  getCouncilCastEntry,
  getCurrentRealCouncilAttempt,
  getLatestRealCouncilPositions,
  getMissionExecutionPlanBundle,
  getMissionDeliveryPackagePersistenceSummary,
  getMissionDeliveryPackageAcceptanceSummary,
  getMissionCloseOutSummary,
  getMissionLearningCandidatePreviewSummary,
  getMissionLearningCandidatePersistenceSummary,
  getLearningCandidateReviewSummary,
  getMemoryCandidatePreviewSummary,
  getMemoryItemPersistenceSummary,
  getMemoryRecallPersistenceSummary,
  computeExecutionPlanRecordDigest,
  computeMissionMemoryContextTargetDigest,
  computeWorkOrderRecordDigest,
  getMissionMemoryContextPreviewSummary,
  getMissionReviewedDeliverySummary,
  getMissionWorkflowCheckpointSummary,
  getMissionWorkOrderPreviewSummary,
  isRealCouncilMode,
  parseMissionWorkOrderCompileList,
} from './council-signals.js';
import {
  getDeliverablesDeskNext,
  getDeliverablesDeskStatus as getDeliverablesDeskStatusBase,
  getExecutionDeskNext,
  getExecutionDeskStatus as getExecutionDeskStatusBase,
} from './desk-status.js';
import { createToken, escapeHtml, formatDate } from './formatters.js';
import {
  createMissionGraphExplorerView,
  renderMissionEvidenceGraph,
} from './mission-evidence-graph.js';
import {
  parseChangeSummaryFileUpdates,
  parseIntegerValue,
  parseMarkdownBullets,
  parseMarkdownKeyValueLines,
  parseMarkdownLines,
  parseMarkdownSections,
  parseYesNoValue,
} from './markdown-artifact-parsing.js';
import {
  getAdvancedOpsEntrySignals,
  renderAdvancedOpsEntrySignalRow,
  renderDeliverablesOpsEntryRow,
  renderDeliverablesShelfSignalRow,
  renderTaskboardOpsEntrySignalRow,
} from './ops-entry-signals.js';
import {
  KNOWLEDGE_WORK_DELIVERABLES,
  PACK_HELP_COPY,
  getKnowledgeWorkDeliverableDisplayName,
  getPackDisplayName,
} from './pack-config.js';
import { getProjectBootstrapState, getProjectGateCopy } from './project-bootstrap.js';
import {
  GROWTH_AUTHORITY_BOUNDARY,
  MEMORY_STORE_OPEN_REQUIREMENTS,
  PROPOSAL_RECORD_OPEN_REQUIREMENTS,
} from './growth-config.js';
import { getGrowthLearningSnapshot } from './growth-learning.js';
import {
  renderGrowthCandidateDrilldown,
  renderGrowthDashboardEvidenceDepth,
  renderGrowthProposalReviewPreview,
} from './growth-panels.js';
import {
  getHarnessBriefActionTone,
  getHarnessBriefHostStateLabel,
  getHarnessBriefSignalValue,
  getHarnessOperatorActionCommand,
  getHarnessOperatorActionDisplayMessage,
  getHarnessOperatorActionLabel,
  getHarnessOperatorActionMessage,
  getHarnessOperatorActionTone,
  getHarnessOutputBriefTypeLabel,
} from './harness-brief-labels.js';
import {
  getHarnessExecutedAtTokenLabel,
  getHarnessExecutionActionOutputPath,
  getHarnessExecutionRequestId,
  getHarnessExecutionPreviewText,
  getHarnessExecutionTimestampLabel,
  getHarnessHistoryInputPath,
  getHarnessHistoryOutputPath,
  getHarnessHistoryRequestLabel,
  getHarnessInputSummaryValue,
  getHarnessOutputChannelToken,
  getHarnessOutputSummaryValue,
  getHarnessPolicyReportTokenLabel,
  getHarnessPrimaryTokenLabel,
  getHarnessRequestTokenLabel,
  getHarnessResultStateToken,
  getHarnessStatusSummaryValue,
  isHarnessPolicyReportExecution,
} from './harness-execution-tokens.js';
import {
  getHarnessExecutionBriefActionLabel,
  getHarnessExecutionBriefCopyActionLabel,
  getHarnessExecutionBriefCopyStatusLabel,
  getHarnessExecutionBriefCopyTitle,
  getHarnessExecutionCompletionLead,
  getHarnessExecutionCompletionOutputCopy,
  getHarnessExecutionHideActionLabel,
  getHarnessExecutionHandoffLabel,
  getHarnessExecutionModeLabel,
  getHarnessExecutionOutputLabel,
  getHarnessExecutionOutputPathActionLabel,
  getHarnessExecutionRerunActionLabel,
  getHarnessExecutionRerunPendingModeLabel,
  getHarnessExecutionResultTitle,
  getHarnessExecutionShowActionLabel,
  formatHarnessExecutionPacketForCopy as formatHarnessExecutionPacketForCopyBase,
  formatHarnessPolicyReportForCopy,
  getHarnessExecutionResultKey,
} from './harness-labels.js';
import {
  getHarnessConsumerBrief,
  getHarnessConsumerStatus,
  getLatestHarnessExecution,
  getHarnessOutputBriefResult,
  getRecentHarnessExecutions,
  hasHarnessExecutionHistory,
  isHarnessExecutionResultHidden,
} from './harness-state.js';
import {
  DEFAULT_UI_PREFERENCES,
  EVIDENCE_DENSITY_OPTIONS,
  UI_PREFERENCE_PACKET_SCHEMA,
  UI_PREFERENCE_STORAGE_KEY,
  getPortableUiPreferenceReviewText,
  normalizeUiPreferences,
} from './preference-config.js';
import { getPersonalizationSnapshot } from './personalization-snapshot.js';
import {
  GROUP_PLAYBOOK_META,
  GROUP_WORKSPACE_META,
  NAV_GROUPS,
  NAV_GROUP_ORDER,
  SURFACE_DOCK_METADATA,
  SURFACE_IDS,
  SURFACE_LOCATION_GUIDANCE,
  SURFACE_NAV_GUIDANCE,
  getNavGroupForSurface,
  getNavGroupLabel,
  getSurfaceDisplayName,
} from './surface-config.js';
import {
  getArtifactDetailSnapshot,
  getArtifactListSnapshot,
  getInboxDetailSnapshot,
  getInboxListSnapshot,
  getLogsDetailSnapshot,
  getRunListSnapshot,
  getTaskboardTaskSnapshot,
} from './task-detail-snapshots.js';
import {
  getBuilderLiveMutationSummaries,
  getLatestTaskArtifact,
  getPreferredTaskArtifact,
  getPreferredTaskInboxItem,
  getPrimaryBlockedReason,
  getTaskApprovalBridge,
  getTaskApprovals,
  getTaskApprovalSummary,
  getTaskArtifacts,
  getTaskDecisionSummary,
  getTaskInboxItems,
  getTaskRuns,
  groupTasksByLifecycle,
  sortByCreatedDesc,
} from './task-summaries.js';
import { buildLinkedWorktreeFallbackName, formatWorktreeOptionLabel } from './worktree-labels.js';

const state = {
  companyMemberDraftName: '',
  companyMemberDraftRole: 'builder',
  companyMemberDraftSurface: 'execution',
  companyMembers: readCompanyMembers(),
  uiPreferences: readUiPreferences(),
  opsEditorGroup: 'all',
  menuGroup: 'workflows',
  surface: 'mission',
  payload: null,
  loading: false,
  mutating: false,
  selectionSeeded: false,
  error: null,
  selectedMissionId: null,
  missionViewMode: 'thread',
  missionEvidenceGraph: null,
  missionEvidenceGraphLoading: false,
  missionEvidenceGraphError: null,
  missionGraphQuery: '',
  missionGraphStage: 'all',
  missionGraphStatusTone: 'all',
  missionGraphSelectedNodeId: null,
  selectedTaskId: null,
  selectedRunId: null,
  selectedArtifactId: null,
  selectedInboxItemId: null,
  selectedRunLogs: null,
  lastHarnessExecutionResult: null,
  lastHarnessOutputBriefResult: null,
  hiddenHarnessExecutionResultKey: null,
  harnessExecutionDraftInputPath: '',
  harnessExecutionDraftOutputPath: '',
  selectedArtifact: null,
  selectedTaskBreakdownArtifact: null,
  selectedTaskPreflightArtifact: null,
  linkedWorktreeDraftSlug: '',
  projectDraftName: '',
  projectDraftPath: '',
  projectDraftPack: 'development',
  projectDraftProviderMode: 'local-stub',
  projectDraftProviderModel: '',
  projectDraftProviderApiKeyVar: '',
  projectProviderDraftProjectId: null,
  projectProviderDraftMode: 'local-stub',
  projectProviderDraftModel: '',
  projectProviderDraftApiKeyVar: '',
  missionDraftTitle: '',
  missionDraftGoal: '',
  missionDraftConstraints: '',
  missionDraftDeliverableType: 'decision-memo',
  missionWorkOrderCompileDraft: {
    targetPathAllowlist: '',
    expectedArtifacts: '',
    verificationCommands: '',
    stopConditions: '',
  },
  missionWorkOrderPreview: null,
  missionDeliveryPackagePreview: null,
  missionDurableDeliveryPackage: null,
  missionDeliveryPackageAcceptance: null,
  missionCloseOut: null,
  missionLearningCandidateDraft: {
    lesson: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    negativeEvidence: '',
    expiresAt: '',
    redactionAcknowledgement: 'source-summary-only',
  },
  missionLearningCandidatePreview: null,
  missionLearningCandidate: null,
  missionLearningCandidateReviewDraft: {
    decision: 'accept',
    rationale: '',
    evidenceRefs: [],
    reviewerAcknowledgement: 'human-reviewed',
  },
  missionLearningCandidateReview: null,
  missionMemoryCandidateDraft: {
    summary: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    expiresAt: '',
    workspaceProjectId: '',
    redactionAcknowledgement: 'source-summary-only',
    nonPersistenceStatement: 'readiness-only-not-durable-memory',
  },
  missionMemoryCandidatePreview: null,
  missionMemoryItemStorageDraft: {
    rationale: '',
    acknowledgement: 'reviewed-memory-candidate-for-local-project-storage',
  },
  missionMemoryItem: null,
  missionMemoryRecallDraft: {
    purpose: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    workspaceProjectId: '',
    acknowledgement: 'operator-selected-exact-memory-item-for-read-only-recall',
    nonApplicationStatement: 'recall-preview-not-runtime-application',
  },
  missionMemoryRecallPreview: null,
  missionMemoryRecallRecordDraft: {
    rationale: '',
    acknowledgement: 'reviewed-exact-memory-recall-for-local-audit',
  },
  missionMemoryRecall: null,
  missionMemoryContextDraft: {
    targetMissionId: '',
    purpose: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    workspaceProjectId: '',
    acknowledgement:
      'operator-selected-recorded-recall-for-mission-context-review',
    nonInjectionStatement:
      'memory-context-preview-not-mission-or-prompt-injection',
  },
  missionMemoryContextPreview: null,
  workOrderVerificationPlanPreview: null,
  workOrderVerificationStatus: null,
  workOrderAcceptanceCriteriaRationale: '',
  workOrderProofDrafts: {},
  missionExecutionPlanRecovery: null,
  executionContinuationPreview: null,
  taskDraftTitle: '',
  taskDraftIntent: '',
  timerId: null,
};

const elements = {
  companyDirectoryShell: document.querySelector('#company-directory-shell'),
  companyDirectorySummary: document.querySelector('#company-directory-summary'),
  refreshButton: document.querySelector('#refresh-button'),
  refreshStatus: document.querySelector('#refresh-status'),
  shellHeader: {
    eyebrow: document.querySelector('#shell-header-eyebrow'),
    title: document.querySelector('#shell-dashboard-title'),
    windowLabel: document.querySelector('#shell-window-label'),
    project: document.querySelector('#shell-header-project'),
    surface: document.querySelector('#shell-header-surface'),
    gates: document.querySelector('#shell-header-gates'),
  },
  officeSidebarStatus: {
    project: document.querySelector('#office-sidebar-project'),
    surface: document.querySelector('#office-sidebar-surface'),
    runs: document.querySelector('#office-sidebar-runs'),
    gates: document.querySelector('#office-sidebar-gates'),
  },
  controlOverview: document.querySelector('#control-overview'),
  workspaceMain: document.querySelector('#workspace-main'),
  workspaceLiveStatus: document.querySelector('#workspace-live-status'),
  navGroups: [...document.querySelectorAll('.nav-group')],
  navGroupTabs: [...document.querySelectorAll('.nav-group-tab')],
  surfaces: {
    mission: document.querySelector('#surface-mission'),
    council: document.querySelector('#surface-council'),
    execution: document.querySelector('#surface-execution'),
    deliverables: document.querySelector('#surface-deliverables'),
    taskboard: document.querySelector('#surface-taskboard'),
    logs: document.querySelector('#surface-logs'),
    artifacts: document.querySelector('#surface-artifacts'),
    'decision-inbox': document.querySelector('#surface-decision-inbox'),
  },
  navButtons: [...document.querySelectorAll('.nav-button')],
};

function getActiveNavGroupId() {
  const activeSurfaceGroup = getNavGroupForSurface(state.surface);
  const requestedGroup = NAV_GROUPS[state.menuGroup] ? state.menuGroup : activeSurfaceGroup;

  if (!NAV_GROUPS[requestedGroup].surfaces.includes(state.surface)) {
    state.menuGroup = activeSurfaceGroup;
    return activeSurfaceGroup;
  }

  state.menuGroup = requestedGroup;
  return requestedGroup;
}

function readCompanyMembers() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
  }

  try {
    const raw = window.localStorage.getItem(COMPANY_MEMBER_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
    }

    return parsed.map((entry, index) => normalizeCompanyMember(entry, index));
  } catch (_error) {
    return DEFAULT_COMPANY_MEMBERS.map((entry, index) => normalizeCompanyMember(entry, index));
  }
}

function persistCompanyMembers() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(
      COMPANY_MEMBER_STORAGE_KEY,
      JSON.stringify(state.companyMembers.map((entry, index) => normalizeCompanyMember(entry, index))),
    );
  } catch (_error) {
    // Ignore storage failures and keep the in-memory directory.
  }
}

function readUiPreferences() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return normalizeUiPreferences(DEFAULT_UI_PREFERENCES);
  }

  try {
    const raw = window.localStorage.getItem(UI_PREFERENCE_STORAGE_KEY);

    if (!raw) {
      return normalizeUiPreferences(DEFAULT_UI_PREFERENCES);
    }

    return normalizeUiPreferences(JSON.parse(raw));
  } catch (_error) {
    return normalizeUiPreferences(DEFAULT_UI_PREFERENCES);
  }
}

function persistUiPreferences() {
  state.uiPreferences = normalizeUiPreferences(state.uiPreferences);

  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(UI_PREFERENCE_STORAGE_KEY, JSON.stringify(state.uiPreferences));
  } catch (_error) {
    // Preference persistence is local-only convenience; runtime state stays authoritative.
  }
}

function resetUiPreferences() {
  state.uiPreferences = normalizeUiPreferences(DEFAULT_UI_PREFERENCES);
  persistUiPreferences();
}

function setPreferredProjectPreference(projectId) {
  const normalizedProjectId = typeof projectId === 'string' ? projectId.trim() : '';

  if (!normalizedProjectId) {
    return;
  }

  state.uiPreferences = {
    ...normalizeUiPreferences(state.uiPreferences),
    preferredProjectId: normalizedProjectId,
  };
  persistUiPreferences();
}

function rememberSurfaceVisit(surface) {
  if (!SURFACE_IDS.includes(surface)) {
    return;
  }

  const preferences = normalizeUiPreferences(state.uiPreferences);
  const recentSurfaces = [
    surface,
    ...preferences.recentSurfaces.filter((candidate) => candidate !== surface),
  ].slice(0, 6);

  state.uiPreferences = {
    ...preferences,
    recentSurfaces,
    surfaceCounts: {
      ...preferences.surfaceCounts,
      [surface]: (preferences.surfaceCounts[surface] || 0) + 1,
    },
  };
  persistUiPreferences();
}

function renderCharterSignalStrip(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const linkedTask = options.linkedTask || null;
  const cards = getCompanySignalEntries(options);

  return `
    <section class="relation-strip charter-signal-strip">
      <div class="card-title-row card-title-row-tight">
        <strong>운영 신호</strong>
        ${mission ? createToken(`안건:${mission.id}`, 'neutral') : createToken('안건:대기', 'warning')}
        ${councilSession ? createToken(`회의:${getCouncilStatusDisplay(councilSession.status)}`, getCouncilStatusTone(councilSession.status)) : createToken('회의:대기', 'warning')}
        ${linkedTask ? createToken(`실행:${linkedTask.id}`, 'accent') : createToken('실행:대기', 'warning')}
      </div>
      <p class="detail-copy detail-copy-compact charter-signal-intro">
        홈에서 본 전체 흐름이 여기선 현재 안건 흐름으로 더 촘촘하게 이어집니다.
      </p>
      <div class="charter-signal-grid">
        ${cards
          .map(
            (card) => `
              <article class="charter-signal-chip charter-signal-chip-${escapeHtml(card.surface)}">
                <div class="charter-signal-head">
                  <span class="charter-signal-dot charter-signal-dot-${escapeHtml(card.tone)}"></span>
                  <strong class="charter-signal-label">${escapeHtml(card.label)}</strong>
                </div>
                <p class="charter-signal-status">${escapeHtml(card.status)}</p>
                <p class="charter-signal-copy">${escapeHtml(card.copy)}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderOrchestrationCharter(options = {}) {
  const councilSession = options.councilSession || null;
  const mission = options.mission || null;
  const missionId = mission?.id || '';
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const agendaTitle = String(options.agendaTitle || '아직 정해진 안건 없음').trim();
  const agendaGoal = String(
    options.agendaGoal || '안건이 올라오면 목표와 범위를 먼저 고정합니다.',
  ).trim();
  const castEntries = Array.isArray(options.castEntries) && options.castEntries.length
    ? options.castEntries
    : COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const activeStepIndex = completionReady
    ? 3
    : linkedTask
      ? 2
      : councilSession
        ? 1
        : mission
          ? 0
          : 0;
  const flowEntries = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;

    return {
      ...step,
      statusLabel: isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
      tone: isActive ? 'accent' : isComplete ? 'success' : 'neutral',
      className: isActive
        ? 'charter-flow-step charter-flow-step-active'
        : isComplete
          ? 'charter-flow-step charter-flow-step-complete'
          : 'charter-flow-step',
    };
  });

  return `
    <section class="briefing-charter">
      <article class="charter-card charter-card-goal">
        <p class="charter-label">목표 헌장</p>
        <strong class="charter-title">${escapeHtml(agendaTitle)}</strong>
        <p class="charter-copy">${escapeHtml(agendaGoal)}</p>
      </article>
      <article class="charter-card">
        <p class="charter-label">역할 구성</p>
        <div class="charter-crew-list">
          ${castEntries
            .map(
              (castEntry) => `
                <div class="charter-crew-item">
                  <strong class="charter-crew-rank">${escapeHtml(castEntry.rank)}</strong>
                  <div class="charter-crew-copy">
                    <span class="charter-crew-name">${escapeHtml(castEntry.displayName)}</span>
                    <span class="charter-crew-duty">${escapeHtml(castEntry.commandLine)}</span>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </article>
      <article class="charter-card">
        <p class="charter-label">진행 흐름</p>
        <div class="charter-flow">
          ${flowEntries
            .map(
              (step, index) => `
              <button
                class="${step.className}"
                type="button"
                data-action="open-surface-for-mission"
                data-id="${escapeHtml(missionId)}"
                data-target-surface="${escapeHtml(step.surface)}"
                ${missionId ? '' : 'disabled'}
              >
                <strong class="charter-step-count">${index + 1}</strong>
                <div class="charter-step-copy">
                  <strong>${escapeHtml(step.label)}</strong>
                  <span class="charter-step-owner">${escapeHtml(step.owner)}</span>
                  <span>${escapeHtml(step.summary)}</span>
                </div>
                <span class="charter-flow-status">${createToken(step.statusLabel, step.tone)}</span>
              </button>
            `,
            )
            .join('')}
        </div>
      </article>
      <article class="charter-card">
        <p class="charter-label">운영 기준</p>
        <div class="token-row token-row-compact">
          ${ORCHESTRATION_RULES.map((rule) => createToken(rule, 'neutral')).join('')}
        </div>
        <p class="charter-copy">
          상단 연출은 방향 표시만 맡고, 실제 실행은 경계가 분명한 실행 흐름과 리뷰·승인 게이트를 그대로 따릅니다.
        </p>
      </article>
    </section>
    ${renderCharterSignalStrip({ mission, councilSession, linkedTask, completionReady })}
  `;
}

function renderCouncilCastCards(councilSession, options = {}) {
  const compact = Boolean(options.compact);
  const cardClassName = compact ? 'cast-card cast-card-compact' : 'cast-card';
  const gridClassName = compact ? 'cast-grid cast-grid-compact' : 'cast-grid';
  const roles = Array.isArray(councilSession?.participants) && councilSession.participants.length > 0
    ? COUNCIL_CAST_ORDER.filter((role) =>
        councilSession.participants.some((participant) => participant.role === role),
      )
    : COUNCIL_CAST_ORDER;

  return `
    <div class="${gridClassName}">
      ${roles
        .map((role) => {
          const castEntry = getCouncilCastEntry(role, councilSession);
          const isLead = role === COUNCIL_CAST_ORDER[0];
          const articleClassName = `${cardClassName} cast-card-${castEntry.tone}${isLead ? ' cast-card-lead' : ''}`;

          return `
            <article class="${articleClassName}">
              <div class="cast-mark-stack">
                <div class="cast-mark cast-mark-${castEntry.tone}">${escapeHtml(castEntry.mark)}</div>
                <div class="cast-order">${escapeHtml(castEntry.orderLabel)}</div>
              </div>
              <div class="cast-body">
                <div class="cast-rank-row">
                  <strong class="cast-rank">${escapeHtml(castEntry.rank)}</strong>
                  ${createToken(castEntry.archetype, castEntry.tone)}
                </div>
                <div class="card-title-row ${compact ? 'card-title-row-tight' : ''}">
                  <strong>${escapeHtml(castEntry.displayName)}</strong>
                  ${isLead ? createToken('최종 권고', 'accent') : createToken('참여 역할', 'neutral')}
                </div>
                <div class="cast-station-row">
                  <strong class="cast-station">${escapeHtml(castEntry.deskLabel)}</strong>
                  <span class="cast-station-copy">${escapeHtml(castEntry.officeLine)}</span>
                </div>
                <div class="cast-avatar-panel cast-avatar-panel-${castEntry.tone}">
                  <div class="cast-avatar-shell cast-avatar-shell-${castEntry.tone} cast-avatar-shell-${castEntry.avatarStyle}">
                    <div class="cast-avatar-head"></div>
                    <div class="cast-avatar-body"></div>
                    <div class="cast-avatar-eye cast-avatar-eye-left"></div>
                    <div class="cast-avatar-eye cast-avatar-eye-right"></div>
                    <div class="cast-avatar-smile"></div>
                    <div class="cast-avatar-accessory cast-avatar-accessory-${castEntry.avatarStyle}"></div>
                    <div class="cast-avatar-badge">${escapeHtml(castEntry.mark)}</div>
                  </div>
                  <div class="cast-avatar-copy">
                    <strong class="cast-avatar-label">${escapeHtml(castEntry.avatarLabel)}</strong>
                    <span class="cast-avatar-mood">${escapeHtml(castEntry.avatarMood)}</span>
                    <span class="cast-avatar-prop">${escapeHtml(castEntry.deskProp)}</span>
                  </div>
                </div>
                <p class="cast-command">${escapeHtml(castEntry.commandLine)}</p>
                <p class="cast-subtitle">${escapeHtml(castEntry.focus)}</p>
                ${
                  castEntry.transcriptStance
                    ? `
                      <div class="token-row token-row-compact">
                        ${createToken(castEntry.transcriptStance, 'neutral')}
                      </div>
                    `
                    : ''
                }
                <p class="cast-quote ${compact ? 'cast-quote-compact' : ''}">
                  ${escapeHtml(castEntry.transcriptContent || castEntry.previewLine)}
                </p>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderCouncilBoardroomStage(options = {}) {
  const councilSession = options.councilSession || null;
  const mission = options.mission || null;
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const compact = Boolean(options.compact);
  const stageClassName = compact ? 'boardroom-stage boardroom-stage-compact' : 'boardroom-stage';
  const heroClassName = compact
    ? 'briefing-hero briefing-hero-compact surface-entry-frame'
    : 'briefing-hero surface-entry-frame';
  const agendaTitle = String(
    options.agendaTitle ||
      councilSession?.selectedPlan?.scope ||
      state.missionDraftTitle ||
      '아직 올라온 안건 없음',
  ).trim();
  const agendaGoal = String(
    options.agendaGoal ||
      councilSession?.summary ||
      state.missionDraftGoal ||
      '안건이 올라오면 네 역할이 회의를 열고 목표와 방향을 함께 정합니다.',
  ).trim();
  const meetingStatus = councilSession
    ? getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')
    : '안건 대기';
  const meetingPhase = councilSession ? getCouncilStatusDisplay(councilSession.status) : '착석 전';
  const castEntries = COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const [leadEntry, leftEntry, rightEntry, bottomEntry] = castEntries;
  const openQuestions = Array.isArray(councilSession?.openQuestions) ? councilSession.openQuestions : [];
  const recommendationTitle =
    councilSession?.selectedPlan?.title ||
    councilSession?.recommendation ||
    councilSession?.summary ||
    '권고안 대기';
  const recommendationCopy =
    councilSession?.selectedPlan?.scope ||
    councilSession?.summary ||
    '권고안이 정리되면 승인 선반과 다음 인계가 이 칸에 함께 정리됩니다.';
  const approvalTitle = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? '결론 승인 완료'
      : '결론 승인 대기'
    : '회의 초안 필요';
  const approvalCopy = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? linkedTask
        ? `${linkedTask.id} 기준 실행 인계가 열려 있습니다.`
        : '승인은 끝났고 다음 실행 연결만 남았습니다.'
      : '권고안을 승인하면 사전 점검과 다음 인계 판단으로 넘어갑니다.'
    : '회의 초안을 열면 승인 선반이 채워집니다.';
  const activeStepIndex = completionReady
    ? 3
    : linkedTask
      ? 2
      : councilSession
        ? 1
        : mission
          ? 0
          : 0;
  const briefingSteps = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;
    const toneClassName = isActive
      ? 'briefing-step briefing-step-active'
      : isComplete
        ? 'briefing-step briefing-step-complete'
        : 'briefing-step';

    return `
      <span class="${toneClassName}">
        <span class="briefing-step-number">${index + 1}</span>
        <span class="briefing-step-copy">
          <strong class="briefing-step-label">${escapeHtml(step.label)}</strong>
          <span class="briefing-step-state">${escapeHtml(
            isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
          )}</span>
        </span>
      </span>
    `;
  }).join('');

  const renderSeat = (castEntry, className) => `
    <article class="boardroom-seat ${className} boardroom-seat-${castEntry.tone}">
      <div class="boardroom-seat-presence">
        <div class="boardroom-avatar-wrap">
          <div class="boardroom-avatar boardroom-avatar-${castEntry.tone}">${escapeHtml(castEntry.mark)}</div>
          <div class="boardroom-seat-presence-copy">
            <strong class="boardroom-seat-desk">${escapeHtml(castEntry.deskLabel)}</strong>
            <span class="boardroom-seat-station">${escapeHtml(castEntry.officeLine)}</span>
          </div>
        </div>
        ${createToken('착석 완료', castEntry.tone)}
      </div>
      <div class="boardroom-seat-portrait boardroom-seat-portrait-${castEntry.tone}">
        <div class="boardroom-seat-avatar-shell boardroom-seat-avatar-shell-${castEntry.tone} boardroom-seat-avatar-shell-${castEntry.avatarStyle}">
          <div class="boardroom-seat-avatar-head"></div>
          <div class="boardroom-seat-avatar-body"></div>
          <div class="boardroom-seat-avatar-eye boardroom-seat-avatar-eye-left"></div>
          <div class="boardroom-seat-avatar-eye boardroom-seat-avatar-eye-right"></div>
          <div class="boardroom-seat-avatar-smile"></div>
          <div class="boardroom-seat-avatar-accessory boardroom-seat-avatar-accessory-${castEntry.avatarStyle}"></div>
          <div class="boardroom-seat-avatar-badge">${escapeHtml(castEntry.mark)}</div>
        </div>
        <div class="boardroom-seat-avatar-copy">
          <strong class="boardroom-seat-avatar-label">${escapeHtml(castEntry.avatarLabel)}</strong>
          <span class="boardroom-seat-avatar-mood">${escapeHtml(castEntry.avatarMood)}</span>
          <span class="boardroom-seat-avatar-prop">${escapeHtml(castEntry.deskProp)}</span>
        </div>
      </div>
      <div class="boardroom-seat-head">
        <strong class="boardroom-seat-rank">${escapeHtml(castEntry.rank)}</strong>
        ${createToken(castEntry.archetype, castEntry.tone)}
      </div>
      <div class="boardroom-seat-name-row">
        <span class="boardroom-seat-name">${escapeHtml(castEntry.displayName)}</span>
        <span class="boardroom-seat-order">${escapeHtml(castEntry.orderLabel)}</span>
      </div>
      <p class="boardroom-seat-copy">${escapeHtml(castEntry.commandLine)}</p>
      <p class="boardroom-seat-focus">${escapeHtml(castEntry.focus)}</p>
    </article>
  `;

  return `
    <section class="${heroClassName} council-meeting-board">
      <div class="briefing-copy">
        <p class="eyebrow">회의 운영 데스크</p>
        <h2>${escapeHtml(options.heading || '참석 역할, 안건, 권고를 같은 회의실에서 정리합니다')}</h2>
        <p class="panel-copy">
          ${escapeHtml(
            options.copy ||
              'Council은 참석자, 안건, 이견, 권고, 승인 선반을 한 화면에서 읽는 표면입니다.',
          )}
        </p>
        <div class="token-row">
          ${createToken('참석 등록부', 'accent')}
          ${createToken(`회의:${meetingPhase}`, 'neutral')}
          ${createToken(`방향:${meetingStatus}`, councilSession ? getAlignmentTone(councilSession.alignment?.status || 'pending') : 'warning')}
        </div>
        <div class="briefing-steps">${briefingSteps}</div>
      </div>
      <div class="council-meeting-grid">
        <section class="council-meeting-card council-meeting-card-roster">
          <div class="card-title-row card-title-row-tight">
            <strong>참석 역할 등록부</strong>
            ${createToken(`역할:${castEntries.length}석`, 'neutral')}
          </div>
          <div class="council-meeting-attendance-list">
            ${castEntries
              .map(
                (castEntry) => `
                  <div class="council-meeting-attendance-row">
                    <div class="council-meeting-attendance-main">
                      <strong>${escapeHtml(castEntry.displayName)}</strong>
                      <span>${escapeHtml(castEntry.rank)}</span>
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken(castEntry.archetype, castEntry.tone)}
                    </div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
        <div class="${stageClassName}">
          ${renderSeat(leadEntry, 'boardroom-seat-lead')}
          ${renderSeat(leftEntry, 'boardroom-seat-left')}
          <section class="boardroom-table">
            <p class="boardroom-table-label">오늘 회의 안건</p>
            <strong class="boardroom-table-title">${escapeHtml(agendaTitle)}</strong>
            <p class="boardroom-table-copy">${escapeHtml(agendaGoal)}</p>
            <div class="token-row token-row-compact">
              ${createToken(`회의:${meetingPhase}`, 'accent')}
              ${createToken(`방향:${meetingStatus}`, councilSession ? getAlignmentTone(councilSession.alignment?.status || 'pending') : 'warning')}
              ${createToken(`열린이견:${openQuestions.length}`, openQuestions.length > 0 ? 'warning' : 'success')}
            </div>
            <p class="boardroom-table-foot">
              참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다.
            </p>
          </section>
          ${renderSeat(rightEntry, 'boardroom-seat-right')}
          ${renderSeat(bottomEntry, 'boardroom-seat-bottom')}
        </div>
        <div class="council-meeting-stack">
          <section class="council-meeting-card">
            <p class="council-meeting-label">권고안 선반</p>
            <strong class="council-meeting-title">${escapeHtml(recommendationTitle)}</strong>
            <p class="council-meeting-copy">${escapeHtml(recommendationCopy)}</p>
          </section>
          <section class="council-meeting-card">
            <p class="council-meeting-label">이견 보드</p>
            <div class="council-meeting-issue-list">
              ${
                openQuestions.length > 0
                  ? openQuestions
                      .slice(0, 3)
                      .map(
                        (question) => `
                          <p class="council-meeting-issue">${escapeHtml(question)}</p>
                        `,
                      )
                      .join('')
                  : '<p class="council-meeting-issue">열린 이견 없이 권고안 정리만 남았습니다.</p>'
              }
            </div>
          </section>
          <section class="council-meeting-card">
            <p class="council-meeting-label">승인 선반</p>
            <strong class="council-meeting-title">${escapeHtml(approvalTitle)}</strong>
            <p class="council-meeting-copy">${escapeHtml(approvalCopy)}</p>
          </section>
        </div>
      </div>
    </section>
  `;
}

function renderMissionIntakeBoard(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const project = options.project || null;
  const nextActionPreview = options.nextActionPreview || {
    actionLabel: '회의 초안 준비',
    summary: '첫 안건을 등록하면 회의 초안과 판단선이 바로 준비됩니다.',
    surface: 'council',
    tone: 'warning',
  };
  const activeCount = Number(options.activeCount || 0);
  const completedCount = Number(options.completedCount || 0);
  const missionCount = Number(options.missionCount || 0);
  const draftTitle = String(options.draftTitle || '').trim();
  const draftGoal = String(options.draftGoal || '').trim();
  const agendaTitle = draftTitle || mission?.title || '오늘 등록할 안건을 준비하세요';
  const agendaGoal =
    draftGoal ||
    mission?.goal ||
    '제목, 목표, 경계를 적어 등록대장에 올리면 회의 안건과 다음 처리선이 바로 열립니다.';
  const nextSurface = mission ? nextActionPreview.surface || 'mission' : 'council';
  const nextTitle = mission
    ? `${getSurfaceDisplayName(nextSurface)} · ${nextActionPreview.actionLabel}`
    : '회의 초안 대기';
  const nextCopy = mission
    ? nextActionPreview.summary
    : '첫 안건을 등록하면 회의 초안과 판단선이 바로 준비됩니다.';
  const meetingStatus = councilSession
    ? `${getCouncilStatusDisplay(councilSession.status)} · ${getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')}`
    : '회의 세션 없음';
  const activeStepIndex = mission ? (councilSession ? 1 : 0) : 0;
  const briefingSteps = ORCHESTRATION_FLOW_STEPS.map((step, index) => {
    const isActive = index === activeStepIndex;
    const isComplete = index < activeStepIndex;
    const toneClassName = isActive
      ? 'briefing-step briefing-step-active'
      : isComplete
        ? 'briefing-step briefing-step-complete'
        : 'briefing-step';

    return `
      <span class="${toneClassName}">
        <span class="briefing-step-number">${index + 1}</span>
        <span class="briefing-step-copy">
          <strong class="briefing-step-label">${escapeHtml(step.label)}</strong>
          <span class="briefing-step-state">${escapeHtml(
            isActive ? '현재 단계' : isComplete ? '완료됨' : '다음 단계',
          )}</span>
        </span>
      </span>
    `;
  }).join('');

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame mission-intake-board">
      <div class="mission-intake-copy">
        <p class="eyebrow">안건 등록대장</p>
        <h2>오늘 안건을 등록대장에 올리고 바로 다음 회의를 엽니다</h2>
        <p class="panel-copy">
          Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다.
        </p>
        <div class="token-row">
          ${createToken('등록대장', 'accent')}
          ${project ? createToken(`프로젝트:${project.name}`, 'success') : ''}
          ${createToken(`안건:${missionCount}`, missionCount > 0 ? 'neutral' : 'warning')}
          ${createToken(`진행:${activeCount}`, activeCount > 0 ? 'neutral' : 'warning')}
          ${createToken(
            `다음:${mission ? getSurfaceDisplayName(nextSurface) : '회의'}`,
            mission ? nextActionPreview.tone : 'warning',
          )}
        </div>
        <div class="briefing-steps">${briefingSteps}</div>
      </div>
      <div class="mission-intake-grid">
        <article class="mission-intake-card mission-intake-card-primary">
          <p class="mission-intake-label">신규 안건 등록</p>
          <strong class="mission-intake-title">${escapeHtml(agendaTitle)}</strong>
          <p class="mission-intake-copyline">${escapeHtml(agendaGoal)}</p>
          <p class="mission-intake-foot">입력선에서 제목, 목표, 경계를 등록한 뒤 바로 회의 안건으로 넘깁니다.</p>
        </article>
        <article class="mission-intake-card">
          <p class="mission-intake-label">배정 등록대장</p>
          <strong class="mission-intake-title">${escapeHtml(
            mission ? `${mission.id} · ${getMissionStatusDisplay(mission.status)}` : '선택 안건 없음',
          )}</strong>
          <p class="mission-intake-copyline">${escapeHtml(
            mission
              ? `현재 선택 안건은 ${mission.title}입니다. 진행 ${activeCount}건과 종료 ${completedCount}건 기준으로 등록대장을 읽습니다.`
              : `진행 ${activeCount}건과 종료 ${completedCount}건 기준으로 첫 안건 등록을 기다립니다.`,
          )}</p>
          <p class="mission-intake-foot">${escapeHtml(
            project ? `현재 프로젝트는 ${project.name}입니다.` : '프로젝트를 먼저 선택하세요.',
          )}</p>
        </article>
        <article class="mission-intake-card">
          <p class="mission-intake-label">다음 처리 트리거</p>
          <strong class="mission-intake-title">${escapeHtml(nextTitle)}</strong>
          <p class="mission-intake-copyline">${escapeHtml(nextCopy)}</p>
          <p class="mission-intake-foot">${escapeHtml(
            councilSession
              ? `현재 회의 상태는 ${meetingStatus}입니다.`
              : '신규 안건은 회의 초안과 판단선부터 시작합니다.',
          )}</p>
        </article>
      </div>
    </section>
  `;
}

function renderExecutionCommandDeck(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const task = options.task || null;
  const latestRun = options.latestRun || null;
  const approvalBridge = options.approvalBridge || null;
  const completionReady = Boolean(options.completionReady);
  const gateCopy = String(options.gateCopy || '아직 확정된 실행 지시가 없습니다.').trim();
  const gateLabel = approvalBridge?.actionLabel || '지시 정리 중';
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const executionCommandSignals = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask: task,
    completionReady,
  }).filter((entry) => ['council', 'execution', 'deliverables', 'decision-inbox'].includes(entry.surface));
  const gateQueueTitle = approvalBridge?.currentApproval
    ? `${getApprovalStatusDisplay(approvalBridge.currentApproval.status)} · ${gateLabel}`
    : '열린 승인선 없음';
  const gateQueueCopy =
    approvalBridge?.bridgeCopy ||
    approvalBridge?.nextStepCopy ||
    '열린 승인선이 없으면 현재 작업 지시를 바로 다음 실행으로 이어갈 수 있습니다.';
  const gateQueueFoot = approvalBridge?.pendingInboxItem
    ? `결정함 ${approvalBridge.pendingInboxItem.id}이 현재 처리 대기 중입니다.`
    : '결정함 대기 없이 현재 작업 지시를 이어갈 수 있습니다.';
  const latestRunSummary = latestRun
    ? `${formatDate(latestRun.startedAt)} 기준 ${getExecutionRoleDisplay(latestRun.role || latestRun.kind || 'none')}이 ${getRunStatusDisplay(latestRun.status)} 상태입니다.${latestRunNextStage ? ` 다음 단계는 ${getExecutionStageDisplay(latestRunNextStage)}입니다.` : ''}`
    : '회의 결론이 실행 셀로 내려오면 첫 실행 로그가 이곳에 나타납니다.';

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame execution-control-board">
      <div class="execution-control-copy">
        <p class="eyebrow">작업 지시 보드</p>
        <h2>현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다</h2>
        <p class="panel-copy">
          Execution은 회의 결론, 현재 작업 지시, 승인선, 최근 실행 로그를 같은 work-order 보드로 묶어 제어합니다.
        </p>
        <div class="token-row">
          ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
          ${task ? createToken(`실행셀:${task.id}`, 'accent') : createToken('실행셀:없음', 'warning')}
          ${task ? createToken(`상태:${getTaskLifecycleDisplay(task.lifecycleState)}`, 'neutral') : ''}
          ${createToken(`지시:${gateLabel}`, approvalBridge?.currentApproval?.status === 'pending' ? 'accent' : 'neutral')}
        </div>
        <div class="execution-command-signal-row">
          ${executionCommandSignals
            .map(
              (entry) => `
                <div class="execution-command-signal execution-command-signal-${escapeHtml(entry.surface)}">
                  <span class="execution-command-signal-dot execution-command-signal-dot-${escapeHtml(entry.tone)}"></span>
                  <span class="execution-command-signal-label">${escapeHtml(entry.label)}</span>
                  <strong class="execution-command-signal-status">${escapeHtml(entry.status)}</strong>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="execution-control-grid">
        <article class="execution-control-card execution-control-card-primary">
          <p class="execution-control-label">현재 작업 지시</p>
          <strong class="execution-control-title">${escapeHtml(gateLabel)}</strong>
          <p class="execution-control-copyline">${escapeHtml(gateCopy)}</p>
          <p class="execution-control-foot">현재 지시가 승인선 또는 결정함과 어떻게 이어지는지 이 칸에서 먼저 읽습니다.</p>
        </article>
        <article class="execution-control-card">
          <p class="execution-control-label">승인 게이트 큐</p>
          <strong class="execution-control-title">${escapeHtml(gateQueueTitle)}</strong>
          <p class="execution-control-copyline">${escapeHtml(gateQueueCopy)}</p>
          <p class="execution-control-foot">${escapeHtml(gateQueueFoot)}</p>
        </article>
        <article class="execution-control-card">
          <p class="execution-control-label">최근 실행 로그</p>
          <strong class="execution-control-title">${escapeHtml(
            latestRun
              ? `${getRunStatusDisplay(latestRun.status)} · ${getExecutionRoleDisplay(latestRun.role || latestRun.kind || 'none')}`
              : '로그 대기',
          )}</strong>
          <p class="execution-control-copyline">${escapeHtml(latestRunSummary)}</p>
          <p class="execution-control-foot">${escapeHtml(
            latestRunNextStage
              ? `다음 단계는 ${getExecutionStageDisplay(latestRunNextStage)}입니다.`
              : '첫 실행 로그가 생성되면 이 칸에 이어집니다.',
          )}</p>
        </article>
      </div>
    </section>
  `;
}

function renderNarrativeDeck(options = {}) {
  const eyebrow = String(options.eyebrow || '본부 브리핑').trim();
  const heading = String(options.heading || '현재 표면을 요약합니다.').trim();
  const copy = String(options.copy || '').trim();
  const tokens = Array.isArray(options.tokens) ? options.tokens.filter(Boolean) : [];
  const cards = Array.isArray(options.cards) ? options.cards.filter(Boolean) : [];
  const deckClassName = options.wide === false ? 'command-deck command-deck-detail' : 'command-deck command-deck-wide';
  const heroClassName = `briefing-hero briefing-hero-compact${options.entryFrame === true ? ' surface-entry-frame' : ''}`;

  return `
    <section class="${heroClassName}">
      <div class="briefing-copy">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(heading)}</h2>
        <p class="panel-copy">${escapeHtml(copy)}</p>
        ${tokens.length > 0 ? `<div class="token-row">${tokens.join('')}</div>` : ''}
        ${options.signalRow || ''}
      </div>
      <div class="${deckClassName}">
        ${cards
          .map(
            (card) => `
              <section class="command-deck-card">
                <p class="command-deck-label">${escapeHtml(card.label || '요약')}</p>
                <strong class="command-deck-title">${escapeHtml(card.title || '대기 중')}</strong>
                <p class="command-deck-copy">${escapeHtml(card.copy || '')}</p>
              </section>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderDeliverablesReportDeck(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const task = options.task || null;
  const currentArtifact = options.currentArtifact || null;
  const evidenceRail = options.evidenceRail || null;
  const latestApproval = options.latestApproval || null;
  const approvalBridge = options.approvalBridge || null;
  const latestReviewStatus = options.latestReviewStatus || 'pending';
  const missionCompletionReady = Boolean(options.missionCompletionReady);
  const deliverablesSignalEntries = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask: task,
    completionReady: missionCompletionReady,
  });
  const deliverablesReportSignals = ['execution', 'deliverables', 'decision-inbox', 'mission']
    .map((surface) => deliverablesSignalEntries.find((entry) => entry.surface === surface))
    .filter(Boolean);
  const reportTitle = currentArtifact
    ? `${getArtifactTypeDisplay(currentArtifact.type)} 패킷`
    : '패킷 대기';
  const reportCopy = currentArtifact
    ? `${currentArtifact.id} 패킷이 ${formatDate(currentArtifact.createdAt)} 기준 현재 전달 선반의 맨 위에 있습니다.`
    : '회의와 실행에서 올라온 결과 패킷이 아직 없습니다.';
  const reviewTitle =
    latestReviewStatus === 'passed'
      ? '승인 완료 · 리뷰 라인'
      : `리뷰 ${getReviewStatusDisplay(latestReviewStatus)}`;
  const reviewCopy =
    latestReviewStatus === 'passed'
      ? '현재 결과 패킷은 리뷰 라인을 통과했고, 다음 승인 라인 또는 종료 보고를 기다립니다.'
      : `현재 결과 패킷은 리뷰 라인에서 ${getReviewStatusDisplay(latestReviewStatus)} 상태입니다.`;
  const approvalTitle = latestApproval
    ? `${getApprovalStatusDisplay(latestApproval.status)} · 승인 라인`
    : '열린 승인 라인 없음';
  const approvalCopy = latestApproval
    ? `${getApprovalActionLabel(latestApproval.allowedNextAction) || latestApproval.scope} 안건이 ${latestApproval.targetArtifactId || '현재 결과 패킷'} 기준으로 ${getApprovalStatusDisplay(latestApproval.status)} 상태입니다.`
    : '현재 결과 패킷에는 사람이 처리할 승인 안건이 없습니다.';
  const closeOutTitle = missionCompletionReady ? '종료 보고 봉인' : approvalBridge?.actionLabel || '종료 보고 대기';
  const closeOutCopy = missionCompletionReady
    ? '종료 보고가 봉인됐습니다. 미션으로 돌아가 다음 안건을 올릴 수 있습니다.'
    : approvalBridge?.nextStepCopy || '승인 라인을 확인한 뒤 종료 보고 또는 다음 실행으로 넘어갑니다.';
  const closeOutFoot = missionCompletionReady
    ? '봉인된 종료 보고는 전달 종료 근거로 남습니다.'
    : '종료 보고 데스크는 현재 패킷의 마지막 전달 상태를 관리합니다.';

  return `
    <section class="briefing-hero briefing-hero-compact surface-entry-frame deliverables-delivery-board">
      <div class="deliverables-delivery-copy">
        <p class="eyebrow">전달 데스크</p>
        <h2>결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다</h2>
        <p class="panel-copy">
          Deliverables는 실행에서 올라온 결과 패킷을 리뷰 라인, 승인 라인, 종료 보고 데스크까지 같은 delivery board에서 이어 읽습니다.
        </p>
        <div class="token-row">
          ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
          ${task ? createToken(`실행셀:${task.id}`, 'accent') : createToken('실행셀:없음', 'warning')}
          ${evidenceRail ? createToken(`현재:${evidenceRail.currentOwnerLabel}`, evidenceRail.blockedReason ? 'danger' : 'accent') : ''}
          ${evidenceRail ? createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral') : ''}
          ${createToken(`리뷰:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus))}
          ${createToken(`완료:${missionCompletionReady ? '봉인' : '진행중'}`, missionCompletionReady ? 'success' : 'warning')}
        </div>
        <div class="deliverables-report-signal-row">
          ${deliverablesReportSignals
            .map(
              (entry) => `
                <div class="deliverables-report-signal deliverables-report-signal-${escapeHtml(entry.surface)}">
                  <span class="deliverables-report-signal-dot deliverables-report-signal-dot-${escapeHtml(entry.tone)}"></span>
                  <span class="deliverables-report-signal-label">${escapeHtml(entry.label)}</span>
                  <strong class="deliverables-report-signal-status">${escapeHtml(entry.status)}</strong>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="deliverables-delivery-grid">
        <article class="deliverables-delivery-card deliverables-delivery-card-primary">
          <p class="deliverables-delivery-label">현재 결과 패킷</p>
          <strong class="deliverables-delivery-title">${escapeHtml(reportTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(reportCopy)}</p>
          <p class="deliverables-delivery-foot">현재 전달 선반에서 가장 먼저 읽어야 할 결과 패킷입니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">리뷰 라인</p>
          <strong class="deliverables-delivery-title">${escapeHtml(reviewTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(reviewCopy)}</p>
          <p class="deliverables-delivery-foot">리뷰 라인은 승인 전 패킷 정합성을 먼저 확인합니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">승인 라인</p>
          <strong class="deliverables-delivery-title">${escapeHtml(approvalTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(approvalCopy)}</p>
          <p class="deliverables-delivery-foot">열린 승인 안건과 승인선 상태를 이 칸에서 바로 읽습니다.</p>
        </article>
        <article class="deliverables-delivery-card">
          <p class="deliverables-delivery-label">종료 보고 데스크</p>
          <strong class="deliverables-delivery-title">${escapeHtml(closeOutTitle)}</strong>
          <p class="deliverables-delivery-copyline">${escapeHtml(closeOutCopy)}</p>
          <p class="deliverables-delivery-foot">${escapeHtml(closeOutFoot)}</p>
        </article>
      </div>
    </section>
  `;
}

function renderOpsCenterDeck(options = {}) {
  return renderNarrativeDeck({
    eyebrow: options.eyebrow || '본부 관제실',
    heading: options.heading || '심층 근거를 들여다보는 관제실',
    copy:
      options.copy ||
      '회의와 실행 아래에 남는 원문 기록, 증적, 승인선은 관제실에서 확인합니다.',
    entryFrame: options.entryFrame === true,
    tokens: options.tokens || [],
    cards: options.cards || [],
  });
}

function createEmptyDerivedState() {
  return {
    activeProjectLinkedWorktrees: {
      error: null,
      notice: null,
      options: [],
      projectId: null,
      projectPath: null,
      resolvedProjectPath: null,
    },
    closeOutReadinessSummaries: {},
    commitExecutionReadinessSummaries: {},
    commitPackageReadinessSummaries: {},
    councilProviderReadinessSummaries: {},
    executionEntrySummaries: {},
    harnessConsumerStatus: null,
    harnessConsumerBrief: null,
    latestHarnessExecution: null,
    recentHarnessExecutions: [],
    providerExecutionSummaries: {},
    releasePackageReadinessSummaries: {},
    reviewerReadinessSummaries: {},
    taskGuardSummaries: {},
  };
}

function getProjectProviderConfig(project) {
  const provider = project?.provider && typeof project.provider === 'object' ? project.provider : {};
  const env = provider.env && typeof provider.env === 'object' ? provider.env : {};
  const mode = provider.mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: mode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: mode === 'live' ? env.apiKeyVar || '' : '',
    },
    mode,
    model: mode === 'live' ? provider.model || '' : '',
  };
}

function getProviderExecutionSummary(project, data) {
  if (!project?.id) {
    return null;
  }

  return data.derived.providerExecutionSummaries?.[project.id] || null;
}

function getHarnessPolicyReportPayload(execution) {
  if (execution?.actionMode !== 'policy-report' || !execution.stdoutPreview) {
    return null;
  }

  try {
    const payload = JSON.parse(execution.stdoutPreview);

    return payload?.mode === 'markitdown-policy-report' ? payload : null;
  } catch (_error) {
    return null;
  }
}

function renderHarnessPolicyReportSummary(execution) {
  const payload = getHarnessPolicyReportPayload(execution);

  if (!payload) {
    return '';
  }

  const pathPolicy = payload.pathPolicy || {};
  const markitdown = payload.markitdown || {};
  const policyReportInputStateLabel = payload.input?.exists ? '파일 있음' : '파일 없음';
  const policyReportInputSizeLabel = `${String(payload.input?.sizeBytes ?? 0)} bytes`;
  const policyReportOutputPlanLabel = payload.output?.wouldWrite
    ? payload.output.resolvedPath || '경로 미지정'
    : '출력 파일 없음';
  const policyReportPermissionLabel = pathPolicy.readsWithCurrentProcessPrivileges
    ? '현재 프로세스 권한으로 읽음'
    : '권한 정책 미확인';
  const policyReportExecutionModeLabel = pathPolicy.executesConversion
    ? '변환 실행'
    : 'no-write preflight';
  const policyReportCliStateLabel = markitdown.available
    ? 'markitdown 사용 가능'
    : 'markitdown 미설치 또는 확인 실패';

  return `
    <section
      class="control-overview-register control-overview-register-compact"
      data-harness-policy-report-summary="true"
    >
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">입력 확인</span>
        <strong class="control-overview-register-value">${escapeHtml(policyReportInputStateLabel)} · ${escapeHtml(policyReportInputSizeLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">출력 예정</span>
        <strong class="control-overview-register-value">${escapeHtml(policyReportOutputPlanLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">권한 정책</span>
        <strong class="control-overview-register-value">${escapeHtml(policyReportPermissionLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">실행 방식</span>
        <strong class="control-overview-register-value">${escapeHtml(policyReportExecutionModeLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">CLI 상태</span>
        <strong class="control-overview-register-value">${escapeHtml(policyReportCliStateLabel)}</strong>
      </div>
      ${
        pathPolicy.guidance
          ? `<p class="detail-copy detail-copy-compact" data-harness-policy-report-guidance="true">${escapeHtml(pathPolicy.guidance)}</p>`
          : ''
      }
    </section>
  `;
}

function formatHarnessExecutionPacketForCopy(execution) {
  return formatHarnessExecutionPacketForCopyBase(
    execution,
    getHarnessExecutionPacketContext(execution),
  );
}

function getHarnessExecutionPacketContext(execution) {
  const handoffContext = getHarnessExecutionHandoffContext(execution);

  return {
    ...handoffContext,
    executedAtLabel: getHarnessExecutionTimestampLabel(execution),
    handoffLabel: getHarnessExecutionHandoffLabel(execution, handoffContext),
  };
}

function getHarnessExecutionHandoffContext(execution) {
  return {
    hasOutputBrief: Boolean(getHarnessOutputBriefResult(execution, state.lastHarnessOutputBriefResult)),
    hasPolicyReport: Boolean(getHarnessPolicyReportPayload(execution)),
  };
}

function getHarnessExecutionHandoffText(execution) {
  return getHarnessExecutionHandoffLabel(execution, getHarnessExecutionHandoffContext(execution));
}

function getHarnessOutputBriefSummaryLabels(outputBrief) {
  const counts = outputBrief.countsByType || {};
  const outputBriefScopeLabel =
    `${String(outputBrief.input?.nonEmptyLineCount || 0)} lines · ${String(outputBrief.input?.charCount || 0)} chars`;
  const outputBriefSeverityLabel =
    `fail ${String(counts.fail || 0)} · warn ${String(counts.warn || 0)} · pass ${String(counts.pass || 0)}`;
  const outputBriefHookLabel = outputBrief.installsShellHooks ? 'hook 사용' : 'hook 없음';
  const outputBriefRewriteLabel = outputBrief.rewritesCommands ? 'command rewrite' : 'rewrite 없음';
  const outputBriefProcessingLabel = `${outputBriefHookLabel} · ${outputBriefRewriteLabel}`;

  return {
    outputBriefScopeLabel,
    outputBriefSeverityLabel,
    outputBriefProcessingLabel,
  };
}

function getHarnessOutputBriefLineItems(outputBrief) {
  const briefLines = Array.isArray(outputBrief.briefLines) ? outputBrief.briefLines : [];

  return briefLines.map((line) => {
    const typeLabel = getHarnessOutputBriefTypeLabel(line.type);
    const text = line.text || '';

    return {
      typeLabel,
      text,
      copyText: `[${typeLabel}] ${text}`.trim(),
    };
  });
}

function renderHarnessOutputBriefSummary(execution) {
  const outputBrief = getHarnessOutputBriefResult(execution, state.lastHarnessOutputBriefResult);

  if (!outputBrief) {
    return '';
  }

  const outputBriefLineItems = getHarnessOutputBriefLineItems(outputBrief);
  const {
    outputBriefScopeLabel,
    outputBriefSeverityLabel,
    outputBriefProcessingLabel,
  } = getHarnessOutputBriefSummaryLabels(outputBrief);

  return `
    <section
      class="control-overview-register control-overview-register-compact"
      data-harness-output-brief-summary="true"
    >
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">요약 범위</span>
        <strong class="control-overview-register-value">${escapeHtml(outputBriefScopeLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">중요도</span>
        <strong class="control-overview-register-value">${escapeHtml(outputBriefSeverityLabel)}</strong>
      </div>
      <div class="control-overview-register-row">
        <span class="control-overview-register-label">처리 방식</span>
        <strong class="control-overview-register-value">${escapeHtml(outputBriefProcessingLabel)}</strong>
      </div>
      <div class="stack stack-compact" data-harness-output-brief-lines="true">
        ${
          outputBriefLineItems.length > 0
            ? outputBriefLineItems
                .map(
                  (lineItem) => `
                    <p class="detail-copy detail-copy-compact">
                      <code>${escapeHtml(lineItem.typeLabel)}</code>
                      ${escapeHtml(lineItem.text)}
                    </p>
                  `,
                )
                .join('')
            : '<p class="detail-copy detail-copy-compact">요약할 주요 라인이 없습니다.</p>'
        }
      </div>
    </section>
  `;
}

function formatHarnessOutputBriefForCopy(outputBrief, execution) {
  if (!outputBrief) {
    return '';
  }

  const outputBriefLineItems = getHarnessOutputBriefLineItems(outputBrief);
  const {
    outputBriefScopeLabel,
    outputBriefSeverityLabel,
    outputBriefProcessingLabel,
  } = getHarnessOutputBriefSummaryLabels(outputBrief);
  const header = [
    getHarnessExecutionBriefCopyTitle(execution),
    `범위: ${outputBriefScopeLabel}`,
    `중요도: ${outputBriefSeverityLabel}`,
    `처리 방식: ${outputBriefProcessingLabel}`,
  ];
  const lineText = outputBriefLineItems.map((lineItem) => lineItem.copyText);

  return [...header, ...lineText].join('\n');
}

function renderHarnessExecutionActionShelf(statusPayload) {
  const statusCard = statusPayload?.statusCard || null;
  const operatorAction = statusPayload?.operatorAction || null;
  const primaryHarnessId = statusCard?.primaryHarnessId || '';
  const operatorActionKind = operatorAction?.kind || '';
  const canShowHarnessOperatorAction =
    primaryHarnessId && operatorActionKind && operatorActionKind !== 'none';
  const data = getDerived();
  const harnessExecutionResult = getLatestHarnessExecution(
    data,
    statusPayload,
    state.lastHarnessExecutionResult,
  );
  const visibleHarnessExecutionResult = isHarnessExecutionResultHidden(
    harnessExecutionResult,
    state.hiddenHarnessExecutionResultKey,
  )
    ? null
    : harnessExecutionResult;
  const hiddenHarnessExecutionResult =
    harnessExecutionResult?.harnessId === primaryHarnessId && !visibleHarnessExecutionResult
      ? harnessExecutionResult
      : null;
  const isVisibleHarnessResultForPrimaryHarness =
    visibleHarnessExecutionResult?.harnessId === primaryHarnessId;
  const isHiddenHarnessResultForPrimaryHarness =
    hiddenHarnessExecutionResult?.harnessId === primaryHarnessId;
  const visibleHarnessExecutionKey = getHarnessExecutionResultKey(visibleHarnessExecutionResult);
  const hiddenHarnessExecutionKey = getHarnessExecutionResultKey(hiddenHarnessExecutionResult);
  const visibleHarnessRequestId = getHarnessExecutionRequestId(visibleHarnessExecutionResult);
  const hiddenHarnessRequestId = getHarnessExecutionRequestId(hiddenHarnessExecutionResult);
  const visibleHarnessInputSummaryPath =
    visibleHarnessExecutionResult?.resolvedInputPath || visibleHarnessExecutionResult?.inputPath || '';
  const visibleHarnessInputPath = visibleHarnessExecutionResult?.resolvedInputPath || '';
  const hiddenHarnessInputPath = hiddenHarnessExecutionResult?.resolvedInputPath || '';
  const visibleHarnessOutputPath = visibleHarnessExecutionResult?.resolvedOutputPath || '';
  const hiddenHarnessOutputPath = hiddenHarnessExecutionResult?.resolvedOutputPath || '';
  const canRenderVisibleHarnessInputPathActions = Boolean(visibleHarnessInputPath);
  const canRenderVisibleHarnessOutputPathCopy = Boolean(visibleHarnessOutputPath);
  const canRenderVisibleHarnessPathActionShelf =
    canRenderVisibleHarnessInputPathActions || canRenderVisibleHarnessOutputPathCopy;
  const canRenderHiddenHarnessInputPathActions = Boolean(hiddenHarnessInputPath);
  const canRenderHiddenHarnessOutputPathCopy = Boolean(hiddenHarnessOutputPath);
  const visibleHarnessActionOutputPath =
    getHarnessExecutionActionOutputPath(visibleHarnessExecutionResult);
  const hiddenHarnessActionOutputPath =
    getHarnessExecutionActionOutputPath(hiddenHarnessExecutionResult);
  const visibleHarnessOutputLabel = getHarnessExecutionOutputLabel(visibleHarnessExecutionResult);
  const hiddenHarnessOutputLabel = getHarnessExecutionOutputLabel(hiddenHarnessExecutionResult);
  const visibleHarnessOutputSummaryValue =
    getHarnessOutputSummaryValue(visibleHarnessOutputPath);
  const hiddenHarnessOutputSummaryValue =
    getHarnessOutputSummaryValue(hiddenHarnessOutputPath);
  const visibleHarnessExecutedAtLabel = getHarnessExecutionTimestampLabel(
    visibleHarnessExecutionResult,
    '',
  );
  const hiddenHarnessExecutedAtLabel = getHarnessExecutionTimestampLabel(
    hiddenHarnessExecutionResult,
    '',
  );
  const visibleHarnessPrimaryTokenLabel =
    getHarnessPrimaryTokenLabel(visibleHarnessExecutionResult);
  const visibleHarnessRequestTokenLabel = getHarnessRequestTokenLabel(visibleHarnessRequestId);
  const canRenderVisibleHarnessRequestSummary = Boolean(visibleHarnessRequestId);
  const canRenderVisibleHarnessRequestIdCopy = Boolean(visibleHarnessRequestId);
  const canRenderHiddenHarnessRequestSummary = Boolean(hiddenHarnessRequestId);
  const canRenderHiddenHarnessRequestIdCopy = Boolean(hiddenHarnessRequestId);
  const canRenderHiddenHarnessExecutedAtSummary = Boolean(hiddenHarnessExecutedAtLabel);
  const canRenderHiddenHarnessInputSummary = Boolean(hiddenHarnessInputPath);
  const visibleHarnessRequestSummaryMarkup = canRenderVisibleHarnessRequestSummary
    ? `<p class="detail-copy detail-copy-compact" data-harness-execution-request-summary="true">요청 ID: <code>${escapeHtml(visibleHarnessRequestId)}</code></p>`
    : '';
  const visibleHarnessRequestIdCopyMarkup = canRenderVisibleHarnessRequestIdCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-request-id"
        data-request-id="${escapeHtml(visibleHarnessRequestId)}"
        data-harness-request-id-copy="true"
      >
        요청 ID
      </button>
    `
    : '';
  const hiddenHarnessRequestSummaryMarkup = canRenderHiddenHarnessRequestSummary
    ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-request-summary="true">요청 ID: <code>${escapeHtml(hiddenHarnessRequestId)}</code></p>`
    : '';
  const hiddenHarnessExecutedAtSummaryMarkup = canRenderHiddenHarnessExecutedAtSummary
    ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-executed-at-summary="true">실행 시각: <code>${escapeHtml(hiddenHarnessExecutedAtLabel)}</code></p>`
    : '';
  const hiddenHarnessInputSummaryMarkup = canRenderHiddenHarnessInputSummary
    ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-input-summary="true">입력: <code>${escapeHtml(hiddenHarnessInputPath)}</code></p>`
    : '';
  const hiddenHarnessOutputSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-output-summary="true">${escapeHtml(hiddenHarnessOutputLabel)}: <code>${escapeHtml(hiddenHarnessOutputSummaryValue)}</code></p>`;
  const visibleHarnessExecutedAtTokenLabel =
    getHarnessExecutedAtTokenLabel(visibleHarnessExecutedAtLabel);
  const canRenderVisibleHarnessPrimaryToken = Boolean(visibleHarnessPrimaryTokenLabel);
  const canRenderVisibleHarnessRequestToken = Boolean(visibleHarnessRequestTokenLabel);
  const canRenderVisibleHarnessExecutedAtToken = Boolean(visibleHarnessExecutedAtTokenLabel);
  const visibleHarnessPrimaryTokenTone = 'neutral';
  const visibleHarnessRequestTokenTone = 'neutral';
  const visibleHarnessExecutedAtTokenTone = 'neutral';
  const visibleHarnessPrimaryTokenMarkup = canRenderVisibleHarnessPrimaryToken
    ? createToken(visibleHarnessPrimaryTokenLabel, visibleHarnessPrimaryTokenTone)
    : '';
  const visibleHarnessRequestTokenMarkup = canRenderVisibleHarnessRequestToken
    ? createToken(visibleHarnessRequestTokenLabel, visibleHarnessRequestTokenTone)
    : '';
  const visibleHarnessExecutedAtTokenMarkup = canRenderVisibleHarnessExecutedAtToken
    ? createToken(visibleHarnessExecutedAtTokenLabel, visibleHarnessExecutedAtTokenTone)
    : '';
  const visibleHarnessModeLabel = getHarnessExecutionModeLabel(visibleHarnessExecutionResult);
  const hiddenHarnessModeLabel = getHarnessExecutionModeLabel(hiddenHarnessExecutionResult);
  const visibleHarnessResultTitle = getHarnessExecutionResultTitle(visibleHarnessExecutionResult);
  const hiddenHarnessResultTitle = getHarnessExecutionResultTitle(hiddenHarnessExecutionResult);
  const visibleHarnessIsPolicyReport =
    isHarnessPolicyReportExecution(visibleHarnessExecutionResult);
  const hiddenHarnessIsPolicyReport =
    isHarnessPolicyReportExecution(hiddenHarnessExecutionResult);
  const visibleHarnessPolicyReportDataValue =
    getHarnessPolicyReportDataValue(visibleHarnessIsPolicyReport);
  const hiddenHarnessPolicyReportDataValue =
    getHarnessPolicyReportDataValue(hiddenHarnessIsPolicyReport);
  const visibleHarnessPolicyReportTokenLabel =
    getHarnessPolicyReportTokenLabel(visibleHarnessIsPolicyReport);
  const canRenderVisibleHarnessPolicyReportToken = Boolean(visibleHarnessPolicyReportTokenLabel);
  const visibleHarnessPolicyReportTokenTone = 'neutral';
  const visibleHarnessPolicyReportTokenMarkup = canRenderVisibleHarnessPolicyReportToken
    ? createToken(visibleHarnessPolicyReportTokenLabel, visibleHarnessPolicyReportTokenTone)
    : '';
  const visibleHarnessResultStateToken =
    getHarnessResultStateToken(visibleHarnessIsPolicyReport);
  const visibleHarnessResultStateTokenLabel = visibleHarnessResultStateToken.label;
  const visibleHarnessResultStateTokenTone = visibleHarnessResultStateToken.tone;
  const visibleHarnessResultStateTokenMarkup = createToken(
    visibleHarnessResultStateTokenLabel,
    visibleHarnessResultStateTokenTone,
  );
  const visibleHarnessTitleRowMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>${escapeHtml(visibleHarnessResultTitle)}</strong>
      ${visibleHarnessResultStateTokenMarkup}
    </div>
  `;
  const hiddenHarnessResultStateTokenLabel = '숨김';
  const hiddenHarnessResultStateTokenTone = 'neutral';
  const hiddenHarnessResultStateTokenMarkup = createToken(
    hiddenHarnessResultStateTokenLabel,
    hiddenHarnessResultStateTokenTone,
  );
  const hiddenHarnessTitleRowMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>${escapeHtml(hiddenHarnessResultTitle)}가 숨겨져 있습니다</strong>
      ${hiddenHarnessResultStateTokenMarkup}
    </div>
  `;
  const hiddenHarnessRestoreHintMarkup = `<p class="detail-copy detail-copy-compact">필요하면 방금 숨긴 ${escapeHtml(hiddenHarnessModeLabel)}를 다시 표시할 수 있습니다.</p>`;
  const hiddenHarnessHeaderMarkup = `
    ${hiddenHarnessTitleRowMarkup}
    ${hiddenHarnessRestoreHintMarkup}
  `;
  const visibleHarnessUsesOutputFile = Boolean(visibleHarnessExecutionResult?.outputPath);
  const visibleHarnessOutputChannelToken =
    getHarnessOutputChannelToken(visibleHarnessUsesOutputFile);
  const visibleHarnessOutputChannelLabel = visibleHarnessOutputChannelToken.label;
  const visibleHarnessOutputChannelTone = visibleHarnessOutputChannelToken.tone;
  const visibleHarnessOutputChannelTokenMarkup = createToken(
    visibleHarnessOutputChannelLabel,
    visibleHarnessOutputChannelTone,
  );
  const visibleHarnessTokenRowMarkup = `
    ${visibleHarnessPrimaryTokenMarkup}
    ${visibleHarnessPolicyReportTokenMarkup}
    ${visibleHarnessRequestTokenMarkup}
    ${visibleHarnessOutputChannelTokenMarkup}
    ${visibleHarnessExecutedAtTokenMarkup}
  `;
  const visibleHarnessTokenRowFrameMarkup = `
    <div class="token-row token-row-compact">
      ${visibleHarnessTokenRowMarkup}
    </div>
  `;
  const visibleHarnessHeaderMarkup = `
    ${visibleHarnessTitleRowMarkup}
    ${visibleHarnessTokenRowFrameMarkup}
  `;
  const visibleHarnessHandoffText = getHarnessExecutionHandoffText(visibleHarnessExecutionResult);
  const hiddenHarnessHandoffText = getHarnessExecutionHandoffText(hiddenHarnessExecutionResult);
  const harnessOperatorActionLabel = getHarnessOperatorActionLabel(operatorAction);
  const harnessOperatorActionTone = getHarnessOperatorActionTone(operatorAction);
  const harnessOperatorActionTokenLabel = harnessOperatorActionLabel;
  const harnessOperatorActionTokenTone = harnessOperatorActionTone;
  const harnessOperatorActionTokenMarkup = createToken(
    harnessOperatorActionTokenLabel,
    harnessOperatorActionTokenTone,
  );
  const harnessHostStateLabel = getHarnessBriefHostStateLabel({
    currentHostState: statusCard.currentHostState,
  });
  const visibleHarnessInputSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-input-summary="true">입력: <code>${escapeHtml(visibleHarnessInputSummaryPath)}</code></p>`;
  const visibleHarnessModeSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-mode-summary="true">모드: <code>${escapeHtml(visibleHarnessModeLabel)}</code></p>`;
  const visibleHarnessHandoffSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-handoff-summary="true">핸드오프: <code>${escapeHtml(visibleHarnessHandoffText)}</code></p>`;
  const visibleHarnessOutputSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-output-summary="true">${escapeHtml(visibleHarnessOutputLabel)}: <code>${escapeHtml(visibleHarnessOutputSummaryValue)}</code></p>`;
  const visibleHarnessExecutionSummaryMarkup = `
    ${visibleHarnessInputSummaryMarkup}
    ${visibleHarnessModeSummaryMarkup}
    ${visibleHarnessHandoffSummaryMarkup}
    ${visibleHarnessOutputSummaryMarkup}
  `;
  const hiddenHarnessModeSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-mode-summary="true">모드: <code>${escapeHtml(hiddenHarnessModeLabel)}</code></p>`;
  const hiddenHarnessHandoffSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-handoff-summary="true">핸드오프: <code>${escapeHtml(hiddenHarnessHandoffText)}</code></p>`;
  const hiddenHarnessRunContextSummaryMarkup = `
    ${hiddenHarnessRequestSummaryMarkup}
    ${hiddenHarnessExecutedAtSummaryMarkup}
    ${hiddenHarnessModeSummaryMarkup}
    ${hiddenHarnessHandoffSummaryMarkup}
    ${hiddenHarnessInputSummaryMarkup}
    ${hiddenHarnessOutputSummaryMarkup}
  `;
  const hiddenHarnessKindValue = getHarnessStatusSummaryValue(statusCard.primaryKind);
  const hiddenHarnessPrimaryCommandValue =
    getHarnessStatusSummaryValue(statusCard.primaryCommand);
  const hiddenHarnessPrimaryRunnerValue =
    getHarnessStatusSummaryValue(statusCard.primaryRunner);
  const hiddenHarnessPostureValue = getHarnessStatusSummaryValue(statusCard.primaryPosture);
  const hiddenHarnessStateValue = getHarnessStatusSummaryValue(statusCard.primaryHarnessState);
  const hiddenHarnessIdSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-harness-summary="true">대표 하네스: <code>${escapeHtml(primaryHarnessId)}</code></p>`;
  const hiddenHarnessKindSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-kind-summary="true">하네스 종류: <code>${escapeHtml(hiddenHarnessKindValue)}</code></p>`;
  const hiddenHarnessPrimaryCommandSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-command-summary="true">대표 명령: <code>${escapeHtml(hiddenHarnessPrimaryCommandValue)}</code></p>`;
  const hiddenHarnessPrimaryRunnerSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-runner-summary="true">대표 러너: <code>${escapeHtml(hiddenHarnessPrimaryRunnerValue)}</code></p>`;
  const hiddenHarnessPostureSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-posture-summary="true">대표 정책: <code>${escapeHtml(hiddenHarnessPostureValue)}</code></p>`;
  const hiddenHarnessStateSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-state-summary="true">현재 상태: <code>${escapeHtml(hiddenHarnessStateValue)}</code></p>`;
  const hiddenHarnessHostSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-host-summary="true">호스트 상태: <code>${escapeHtml(harnessHostStateLabel)}</code></p>`;
  const hiddenHarnessContextSummaryMarkup = `
    ${hiddenHarnessIdSummaryMarkup}
    ${hiddenHarnessKindSummaryMarkup}
    ${hiddenHarnessPrimaryCommandSummaryMarkup}
    ${hiddenHarnessPrimaryRunnerSummaryMarkup}
    ${hiddenHarnessPostureSummaryMarkup}
    ${hiddenHarnessStateSummaryMarkup}
    ${hiddenHarnessHostSummaryMarkup}
  `;
  const hiddenHarnessOperatorActionLabel = harnessOperatorActionLabel;
  const operatorActionCommand = getHarnessOperatorActionCommand(operatorAction);
  const operatorActionMessage = getHarnessOperatorActionMessage(operatorAction);
  const operatorActionDisplayMessage =
    getHarnessOperatorActionDisplayMessage(operatorActionMessage);
  const canRenderHarnessRunForm = Boolean(operatorActionCommand);
  const harnessRunCommandCopyMarkup = `
    <button
      class="secondary-button"
      type="button"
      data-action="copy-harness-command"
      data-command="${escapeHtml(operatorActionCommand)}"
      data-harness-operator-command="true"
    >
      명령 복사
    </button>
  `;
  const hiddenHarnessOperatorCommand = operatorActionCommand;
  const hiddenHarnessOperatorMessage = operatorActionMessage;
  const canRenderHiddenHarnessOperatorMessageSummary = Boolean(hiddenHarnessOperatorMessage);
  const hiddenHarnessOperatorActionSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-action-summary="true">권장 액션: <code>${escapeHtml(hiddenHarnessOperatorActionLabel)}</code></p>`;
  const hiddenHarnessOperatorCommandSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-command-summary="true">실행 템플릿: <code>${escapeHtml(hiddenHarnessOperatorCommand)}</code></p>`;
  const hiddenHarnessOperatorMessageSummaryMarkup = canRenderHiddenHarnessOperatorMessageSummary
    ? `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-message-summary="true">운영 메모: ${escapeHtml(hiddenHarnessOperatorMessage)}</p>`
    : '';
  const hiddenHarnessOperatorContextSummaryMarkup = `
    ${hiddenHarnessOperatorActionSummaryMarkup}
    ${hiddenHarnessOperatorCommandSummaryMarkup}
    ${hiddenHarnessOperatorMessageSummaryMarkup}
  `;
  const hiddenHarnessRunContextTitleRowMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>실행 기록</strong>
    </div>
  `;
  const hiddenHarnessHarnessContextTitleRowMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>하네스 컨텍스트</strong>
    </div>
  `;
  const hiddenHarnessOperatorContextTitleRowMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>운영 컨텍스트</strong>
    </div>
  `;
  const hiddenHarnessRunContextSectionMarkup = `
    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-run-context="true">
      ${hiddenHarnessRunContextTitleRowMarkup}
      ${hiddenHarnessRunContextSummaryMarkup}
    </section>
  `;
  const hiddenHarnessHarnessContextSectionMarkup = `
    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-harness-context="true">
      ${hiddenHarnessHarnessContextTitleRowMarkup}
      ${hiddenHarnessContextSummaryMarkup}
    </section>
  `;
  const hiddenHarnessOperatorContextSectionMarkup = `
    <section class="relation-strip relation-strip-compact relation-strip-hidden-compact-block" data-harness-result-hidden-operator-context="true">
      ${hiddenHarnessOperatorContextTitleRowMarkup}
      ${hiddenHarnessOperatorContextSummaryMarkup}
    </section>
  `;
  const hiddenHarnessContextSectionsMarkup = `
    ${hiddenHarnessRunContextSectionMarkup}
    ${hiddenHarnessHarnessContextSectionMarkup}
    ${hiddenHarnessOperatorContextSectionMarkup}
  `;
  const visibleHarnessOutputPathActionLabel = getHarnessExecutionOutputPathActionLabel(
    visibleHarnessExecutionResult,
  );
  const hiddenHarnessOutputPathActionLabel = getHarnessExecutionOutputPathActionLabel(
    hiddenHarnessExecutionResult,
  );
  const visibleHarnessOutputPathCopyMarkup = canRenderVisibleHarnessOutputPathCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-output-path"
        data-output-path="${escapeHtml(visibleHarnessOutputPath)}"
        data-output-path-label="${escapeHtml(visibleHarnessOutputPathActionLabel)}"
        data-harness-output-copy="true"
      >
        ${escapeHtml(visibleHarnessOutputPathActionLabel)}
      </button>
    `
    : '';
  const hiddenHarnessOutputPathCopyMarkup = canRenderHiddenHarnessOutputPathCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-output-path"
        data-output-path="${escapeHtml(hiddenHarnessOutputPath)}"
        data-output-path-label="${escapeHtml(hiddenHarnessOutputPathActionLabel)}"
        data-harness-result-hidden-output-copy="true"
      >
        ${escapeHtml(hiddenHarnessOutputPathActionLabel)}
      </button>
    `
    : '';
  const visibleHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel(visibleHarnessExecutionResult);
  const hiddenHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel(hiddenHarnessExecutionResult);
  const visibleHarnessInputPathCopyActionMarkup = canRenderVisibleHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-input-path"
        data-input-path="${escapeHtml(visibleHarnessInputPath)}"
        data-harness-input-copy="true"
      >
        입력 경로
      </button>
    `
    : '';
  const visibleHarnessPathReuseActionMarkup = canRenderVisibleHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="reuse-harness-execution-paths"
        data-input-path="${escapeHtml(visibleHarnessInputPath)}"
        data-output-path="${escapeHtml(visibleHarnessActionOutputPath)}"
        data-harness-result-reuse="true"
      >
        경로 채우기
      </button>
    `
    : '';
  const visibleHarnessPathRerunActionMarkup = canRenderVisibleHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="rerun-harness-execution-paths"
        data-input-path="${escapeHtml(visibleHarnessInputPath)}"
        data-output-path="${escapeHtml(visibleHarnessActionOutputPath)}"
        data-policy-report="${visibleHarnessPolicyReportDataValue}"
        data-harness-result-rerun="true"
        ${state.loading || state.mutating ? 'disabled' : ''}
      >
        ${escapeHtml(visibleHarnessRerunActionLabel)}
      </button>
    `
    : '';
  const visibleHarnessInputPathActionsMarkup = `
    ${visibleHarnessInputPathCopyActionMarkup}
    ${visibleHarnessPathReuseActionMarkup}
    ${visibleHarnessPathRerunActionMarkup}
  `;
  const hiddenHarnessInputPathCopyActionMarkup = canRenderHiddenHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-input-path"
        data-input-path="${escapeHtml(hiddenHarnessInputPath)}"
        data-harness-result-hidden-input-copy="true"
      >
        입력 경로
      </button>
    `
    : '';
  const hiddenHarnessPathReuseActionMarkup = canRenderHiddenHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="reuse-harness-execution-paths"
        data-input-path="${escapeHtml(hiddenHarnessInputPath)}"
        data-output-path="${escapeHtml(hiddenHarnessActionOutputPath)}"
        data-harness-result-hidden-reuse="true"
      >
        경로 채우기
      </button>
    `
    : '';
  const hiddenHarnessPathRerunActionMarkup = canRenderHiddenHarnessInputPathActions
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="rerun-harness-execution-paths"
        data-input-path="${escapeHtml(hiddenHarnessInputPath)}"
        data-output-path="${escapeHtml(hiddenHarnessActionOutputPath)}"
        data-policy-report="${hiddenHarnessPolicyReportDataValue}"
        data-harness-result-hidden-rerun="true"
        ${state.loading || state.mutating ? 'disabled' : ''}
      >
        ${escapeHtml(hiddenHarnessRerunActionLabel)}
      </button>
    `
    : '';
  const hiddenHarnessInputPathActionsMarkup = `
    ${hiddenHarnessInputPathCopyActionMarkup}
    ${hiddenHarnessPathReuseActionMarkup}
    ${hiddenHarnessPathRerunActionMarkup}
  `;
  const visibleHarnessHideActionLabel = getHarnessExecutionHideActionLabel(visibleHarnessExecutionResult);
  const hiddenHarnessShowActionLabel = getHarnessExecutionShowActionLabel(hiddenHarnessExecutionResult);
  const visibleHarnessHideActionMarkup = `
    <button
      class="secondary-button"
      type="button"
      data-action="hide-harness-execution-result"
      data-execution-key="${escapeHtml(visibleHarnessExecutionKey || '')}"
      data-harness-result-hide="true"
    >
      ${escapeHtml(visibleHarnessHideActionLabel)}
    </button>
  `;
  const hiddenHarnessShowActionMarkup = `
    <button
      class="secondary-button"
      type="button"
      data-action="show-harness-execution-result"
      data-execution-key="${escapeHtml(hiddenHarnessExecutionKey || '')}"
      data-harness-result-show="true"
    >
      ${escapeHtml(hiddenHarnessShowActionLabel)}
    </button>
  `;
  const canCopyVisibleHarnessExecutionPacket = Boolean(visibleHarnessExecutionResult);
  const canCopyHiddenHarnessExecutionPacket = Boolean(hiddenHarnessExecutionResult);
  const visibleHarnessExecutionPacketText =
    formatHarnessExecutionPacketForCopy(visibleHarnessExecutionResult);
  const hiddenHarnessExecutionPacketText =
    formatHarnessExecutionPacketForCopy(hiddenHarnessExecutionResult);
  const visibleHarnessExecutionPacketCopyMarkup = canCopyVisibleHarnessExecutionPacket
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-execution-packet"
        data-execution-packet-text="${escapeHtml(visibleHarnessExecutionPacketText)}"
        data-harness-execution-packet-copy="true"
      >
        패킷 복사
      </button>
    `
    : '';
  const hiddenHarnessExecutionPacketCopyMarkup = canCopyHiddenHarnessExecutionPacket
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-execution-packet"
        data-execution-packet-text="${escapeHtml(hiddenHarnessExecutionPacketText)}"
        data-harness-result-hidden-packet-copy="true"
      >
        패킷 복사
      </button>
    `
    : '';
  const hiddenHarnessRequestIdCopyMarkup = canRenderHiddenHarnessRequestIdCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-request-id"
        data-request-id="${escapeHtml(hiddenHarnessRequestId)}"
        data-harness-result-hidden-request-id-copy="true"
      >
        요청 ID
      </button>
    `
    : '';
  const hiddenHarnessPolicyReportPayload = getHarnessPolicyReportPayload(hiddenHarnessExecutionResult);
  const canRenderHiddenHarnessPolicyReportCopy = Boolean(hiddenHarnessPolicyReportPayload);
  const hiddenHarnessPolicyReportCopyText =
    formatHarnessPolicyReportForCopy(hiddenHarnessPolicyReportPayload);
  const hiddenHarnessPolicyReportCopyMarkup = canRenderHiddenHarnessPolicyReportCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-policy-report"
        data-policy-report-text="${escapeHtml(hiddenHarnessPolicyReportCopyText)}"
        data-harness-result-hidden-policy-report-copy="true"
      >
        리포트 복사
      </button>
    `
    : '';
  const visibleHarnessPreviewText =
    getHarnessExecutionPreviewText(visibleHarnessExecutionResult);
  const hiddenHarnessPreviewText =
    getHarnessExecutionPreviewText(hiddenHarnessExecutionResult);
  const canRenderHiddenHarnessPreview = Boolean(hiddenHarnessPreviewText);
  const canRenderVisibleHarnessPreview = Boolean(visibleHarnessPreviewText);
  const visibleHarnessPreviewMarkup = canRenderVisibleHarnessPreview
    ? `<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">${escapeHtml(visibleHarnessPreviewText)}</pre>`
    : '<p class="detail-copy detail-copy-compact">미리보기 가능한 출력이 없습니다.</p>';
  const hiddenHarnessPreviewMarkup = canRenderHiddenHarnessPreview
    ? `<pre class="log-viewer log-viewer-compact" data-harness-result-hidden-preview="true">${escapeHtml(hiddenHarnessPreviewText)}</pre>`
    : '';
  const hiddenHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel(hiddenHarnessExecutionResult);
  const visibleHarnessOutputBrief = getHarnessOutputBriefResult(
    visibleHarnessExecutionResult,
    state.lastHarnessOutputBriefResult,
  );
  const canRenderVisibleHarnessOutputBriefCopy = Boolean(visibleHarnessOutputBrief);
  const visibleHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel(visibleHarnessExecutionResult);
  const visibleHarnessPreviewCopyActionMarkup = canRenderVisibleHarnessPreview
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-execution-preview"
        data-preview-text="${escapeHtml(visibleHarnessPreviewText)}"
        data-harness-preview-copy="true"
      >
        미리보기
      </button>
    `
    : '';
  const visibleHarnessOutputBriefActionMarkup = canRenderVisibleHarnessPreview
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="summarize-harness-execution-preview"
        data-execution-key="${escapeHtml(visibleHarnessExecutionKey || '')}"
        data-preview-text="${escapeHtml(visibleHarnessPreviewText)}"
        data-harness-output-brief="true"
        ${state.loading || state.mutating ? 'disabled' : ''}
      >
        ${escapeHtml(visibleHarnessBriefActionLabel)}
      </button>
    `
    : '';
  const visibleHarnessPreviewActionsMarkup = `
    ${visibleHarnessPreviewCopyActionMarkup}
    ${visibleHarnessOutputBriefActionMarkup}
  `;
  const hiddenHarnessPreviewCopyActionMarkup = canRenderHiddenHarnessPreview
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-execution-preview"
        data-preview-text="${escapeHtml(hiddenHarnessPreviewText)}"
        data-harness-result-hidden-preview-copy="true"
      >
        미리보기
      </button>
    `
    : '';
  const hiddenHarnessOutputBriefActionMarkup = canRenderHiddenHarnessPreview
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="summarize-harness-execution-preview"
        data-execution-key="${escapeHtml(hiddenHarnessExecutionKey || '')}"
        data-hidden-execution-key="${escapeHtml(hiddenHarnessExecutionKey || '')}"
        data-preview-text="${escapeHtml(hiddenHarnessPreviewText)}"
        data-harness-result-hidden-output-brief="true"
        ${state.loading || state.mutating ? 'disabled' : ''}
      >
        ${escapeHtml(hiddenHarnessBriefActionLabel)}
      </button>
    `
    : '';
  const hiddenHarnessPreviewActionsMarkup = `
    ${hiddenHarnessPreviewCopyActionMarkup}
    ${hiddenHarnessOutputBriefActionMarkup}
  `;
  const hiddenHarnessActionShelfMarkup = `
    ${hiddenHarnessShowActionMarkup}
    ${hiddenHarnessInputPathActionsMarkup}
    ${hiddenHarnessOutputPathCopyMarkup}
    ${hiddenHarnessRequestIdCopyMarkup}
    ${hiddenHarnessExecutionPacketCopyMarkup}
    ${hiddenHarnessPolicyReportCopyMarkup}
    ${hiddenHarnessPreviewActionsMarkup}
  `;
  const hiddenHarnessActionShelfFrameMarkup = `
    <div class="form-actions form-actions-inline form-actions-hidden-compact">
      ${hiddenHarnessActionShelfMarkup}
    </div>
  `;
  const hiddenHarnessResultPacketMarkup = `
    <div
      class="harness-execution-result-hidden-packet"
      data-harness-execution-result-hidden-packet="true"
    >
      ${hiddenHarnessHeaderMarkup}
      ${hiddenHarnessContextSectionsMarkup}
      ${hiddenHarnessActionShelfFrameMarkup}
      ${hiddenHarnessPreviewMarkup}
    </div>
  `;
  const visibleHarnessOutputBriefCopyText = formatHarnessOutputBriefForCopy(
    visibleHarnessOutputBrief,
    visibleHarnessExecutionResult,
  );
  const visibleHarnessOutputBriefCopyStatusLabel =
    getHarnessExecutionBriefCopyStatusLabel(visibleHarnessExecutionResult);
  const visibleHarnessOutputBriefCopyActionLabel =
    getHarnessExecutionBriefCopyActionLabel(visibleHarnessExecutionResult);
  const visibleHarnessOutputBriefCopyMarkup = canRenderVisibleHarnessOutputBriefCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-output-brief"
        data-output-brief-text="${escapeHtml(visibleHarnessOutputBriefCopyText)}"
        data-output-brief-label="${escapeHtml(visibleHarnessOutputBriefCopyStatusLabel)}"
        data-harness-output-brief-copy="true"
      >
        ${escapeHtml(visibleHarnessOutputBriefCopyActionLabel)}
      </button>
    `
    : '';
  const visibleHarnessPolicyReportPayload = getHarnessPolicyReportPayload(visibleHarnessExecutionResult);
  const canRenderVisibleHarnessPolicyReportCopy = Boolean(visibleHarnessPolicyReportPayload);
  const visibleHarnessPolicyReportCopyText =
    formatHarnessPolicyReportForCopy(visibleHarnessPolicyReportPayload);
  const visibleHarnessPolicyReportCopyMarkup = canRenderVisibleHarnessPolicyReportCopy
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="copy-harness-policy-report"
        data-policy-report-text="${escapeHtml(visibleHarnessPolicyReportCopyText)}"
        data-harness-policy-report-copy="true"
      >
        리포트 복사
      </button>
    `
    : '';
  const visibleHarnessActionShelfMarkup = `
    ${visibleHarnessInputPathActionsMarkup}
    ${visibleHarnessOutputPathCopyMarkup}
    ${visibleHarnessRequestIdCopyMarkup}
    ${visibleHarnessExecutionPacketCopyMarkup}
    ${visibleHarnessPreviewActionsMarkup}
    ${visibleHarnessOutputBriefCopyMarkup}
    ${visibleHarnessPolicyReportCopyMarkup}
    ${visibleHarnessHideActionMarkup}
  `;
  const visibleHarnessActionShelfFrameMarkup = canRenderVisibleHarnessPathActionShelf
    ? `
      <div class="form-actions form-actions-inline form-actions-compact">
        ${visibleHarnessActionShelfMarkup}
      </div>
    `
    : '';
  const visibleHarnessPolicyReportSummaryMarkup = renderHarnessPolicyReportSummary(
    visibleHarnessExecutionResult,
  );
  const visibleHarnessOutputBriefSummaryMarkup = renderHarnessOutputBriefSummary(
    visibleHarnessExecutionResult,
  );
  const visibleHarnessSupplementalSummaryMarkup = `
    ${visibleHarnessRequestSummaryMarkup}
    ${visibleHarnessPolicyReportSummaryMarkup}
    ${visibleHarnessOutputBriefSummaryMarkup}
  `;
  const visibleHarnessSummaryRackMarkup = `
    ${visibleHarnessExecutionSummaryMarkup}
    ${visibleHarnessSupplementalSummaryMarkup}
  `;
  const visibleHarnessResultPacketMarkup = `
    <div class="harness-execution-result-packet" data-harness-execution-result-packet="true">
      ${visibleHarnessHeaderMarkup}
      ${visibleHarnessSummaryRackMarkup}
      ${visibleHarnessActionShelfFrameMarkup}
      ${visibleHarnessPreviewMarkup}
    </div>
  `;
  const renderHarnessHistorySummaryRow = (label, value) => `
    <div class="control-overview-register-row">
      <span class="control-overview-register-label">${escapeHtml(label)}</span>
      <strong class="control-overview-register-value">${escapeHtml(value)}</strong>
    </div>
  `;
  const recentHarnessExecutions = getRecentHarnessExecutions(data, statusPayload);
  const recentHarnessExecutionCount = recentHarnessExecutions.length;
  const recentHarnessExecutionCountTokenLabel = `${recentHarnessExecutionCount}건`;
  const recentHarnessExecutionCountTokenTone = 'neutral';
  const recentHarnessExecutionCountTokenMarkup = recentHarnessExecutionCount
    ? createToken(
        recentHarnessExecutionCountTokenLabel,
        recentHarnessExecutionCountTokenTone,
      )
    : '';
  const historyHarnessHeaderMarkup = `
    <div class="card-title-row card-title-row-tight">
      <strong>실행 기록</strong>
      ${recentHarnessExecutionCountTokenMarkup}
    </div>
  `;
  const hasExecutionHistory = hasHarnessExecutionHistory(
    harnessExecutionResult,
    recentHarnessExecutions,
    statusPayload,
  );
  const harnessRunClearHistoryActionMarkup = hasExecutionHistory
    ? `
      <button
        class="secondary-button"
        type="button"
        data-action="clear-harness-execution-history"
        data-harness-clear-history="true"
        ${state.loading || state.mutating ? 'disabled' : ''}
      >
        실행 기록 비우기
      </button>
    `
    : '';
  const harnessRunPolicyReportPreviewActionMarkup = `
    <button
      class="secondary-button"
      type="button"
      data-action="preview-harness-policy-report"
      data-harness-policy-report="true"
      ${state.loading || state.mutating ? 'disabled' : ''}
    >
      정책 리포트 확인
    </button>
  `;
  const harnessRunSubmitActionMarkup = `
    <button
      class="primary-button"
      type="submit"
      data-harness-run-submit="true"
      ${state.loading || state.mutating ? 'disabled' : ''}
    >
      하네스 실행
    </button>
  `;
  const harnessRunActionShelfMarkup = `
    ${harnessRunCommandCopyMarkup}
    ${harnessRunClearHistoryActionMarkup}
    ${harnessRunPolicyReportPreviewActionMarkup}
    ${harnessRunSubmitActionMarkup}
  `;

  if (!canShowHarnessOperatorAction) {
    return '';
  }

  return `
    <section class="ops-editor-scope" data-panel-state="readonly" data-harness-execution-action="true">
      <div class="ops-section-head">
        <div>
          <p class="control-overview-label">Harness operator action</p>
          <h4 class="ops-section-title">하네스 실행 액션</h4>
        </div>
        ${harnessOperatorActionTokenMarkup}
      </div>
      <p class="control-overview-copy">${escapeHtml(operatorActionDisplayMessage)}</p>
      <div class="control-overview-register">
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">대표</span>
          <strong class="control-overview-register-value">${escapeHtml(primaryHarnessId)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">액션</span>
          <strong class="control-overview-register-value">${escapeHtml(harnessOperatorActionLabel)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">호스트</span>
          <strong class="control-overview-register-value">${escapeHtml(harnessHostStateLabel)}</strong>
        </div>
      </div>
      ${
        canRenderHarnessRunForm
          ? `
            <form class="stack" data-form="run-harness-operator-action" data-harness-execution-form="true">
              <div class="harness-run-helper-cluster" data-harness-run-helper-cluster="true">
                <div class="harness-run-command-desk" data-harness-run-command-desk="true">
                  <div class="harness-run-prep-cluster" data-harness-run-prep-cluster="true">
                    <div
                      class="control-overview-copy harness-run-template-note"
                      data-harness-run-template-note="true"
                    >
                      <span class="harness-run-template-kicker">실행 템플릿</span>
                      <code class="harness-run-template-command">${escapeHtml(operatorActionCommand)}</code>
                    </div>
                    <div
                      class="field-grid field-grid-compact harness-run-field-rack"
                      data-harness-run-field-rack="true"
                    >
                      <label class="field field-compact">
                        <span class="field-label">입력 파일 경로</span>
                        <input
                          name="inputPath"
                          type="text"
                          placeholder="docs/example.md"
                          required
                          value="${escapeHtml(state.harnessExecutionDraftInputPath)}"
                          data-harness-input-path="true"
                        />
                      </label>
                      <label class="field field-compact">
                        <span class="field-label">출력 파일 경로</span>
                        <input
                          name="outputPath"
                          type="text"
                          placeholder="tmp/markitdown-output.md"
                          value="${escapeHtml(state.harnessExecutionDraftOutputPath)}"
                          data-harness-output-path="true"
                        />
                      </label>
                    </div>
                  </div>
                  <div
                    class="form-actions form-actions-inline harness-run-action-shelf"
                    data-harness-run-action-shelf="true"
                  >
                    ${harnessRunActionShelfMarkup}
                  </div>
                </div>
                <p
                  class="form-help form-help-policy-note"
                  data-harness-run-path-guidance="true"
                >
                  <span class="form-help-policy-kicker">경로 정책</span>
                  <span class="form-help-policy-copy">상대 경로는 현재 프로젝트 경로 기준으로 풀고, 절대 경로는 현재 프로젝트 경로, <code>repo root</code>, 또는 <code>/tmp</code> 하위만 허용합니다.</span>
                </p>
              </div>
            </form>
            ${
              isVisibleHarnessResultForPrimaryHarness
                ? `
                  <section class="relation-strip relation-strip-compact" data-harness-execution-result="true">
                    ${visibleHarnessResultPacketMarkup}
                  </section>
                `
                : ''
            }
            ${
              isHiddenHarnessResultForPrimaryHarness
                ? `
                  <section class="relation-strip relation-strip-hidden-compact" data-harness-execution-result-hidden="true">
                    ${hiddenHarnessResultPacketMarkup}
                  </section>
                `
                : ''
            }
            ${
              recentHarnessExecutionCount
                ? `
                  <section class="relation-strip relation-strip-compact" data-harness-execution-history="true">
                    <div class="harness-execution-history-packet" data-harness-execution-history-packet="true">
                      ${historyHarnessHeaderMarkup}
                      <div class="stack harness-execution-history-list-compact" data-harness-execution-history-list="true">
                        ${recentHarnessExecutions
                          .map(
                            (execution, index) => {
                              const historyHarnessExecutionKey = getHarnessExecutionResultKey(execution);
                              const historyHarnessRequestId = getHarnessExecutionRequestId(execution);
                              const historyHarnessInputPath = getHarnessHistoryInputPath(execution);
                              const historyHarnessOutputPath = getHarnessHistoryOutputPath(execution);
                              const canRenderHistoryHarnessInputPathCopy = Boolean(historyHarnessInputPath);
                              const canRenderHistoryHarnessOutputPathCopy = Boolean(historyHarnessOutputPath);
                              const historyHarnessOutputPathActionLabel =
                                getHarnessExecutionOutputPathActionLabel(execution);
                              const historyHarnessPolicyReportPayload = getHarnessPolicyReportPayload(execution);
                              const canRenderHistoryHarnessPolicyReportCopy =
                                Boolean(historyHarnessPolicyReportPayload);
                              const historyHarnessPreviewText = getHarnessExecutionPreviewText(execution);
                              const canRenderHistoryHarnessPreview = Boolean(historyHarnessPreviewText);
                              const historyHarnessModeLabel = getHarnessExecutionModeLabel(execution);
                              const historyHarnessHandoffText = getHarnessExecutionHandoffText(execution);
                              const historyHarnessOutputLabel = getHarnessExecutionOutputLabel(execution);
                              const historyHarnessOutputSummaryValue =
                                getHarnessOutputSummaryValue(historyHarnessOutputPath);
                              const historyHarnessExecutedAtLabel =
                                getHarnessExecutionTimestampLabel(execution);
                              const historyHarnessRequestLabel =
                                getHarnessHistoryRequestLabel(historyHarnessRequestId, index);
                              const canRenderHistoryHarnessRequestIdCopy = Boolean(historyHarnessRequestId);
                              const historyHarnessInputSummaryValue =
                                getHarnessInputSummaryValue(historyHarnessInputPath);
                              const historyHarnessRequestSummaryMarkup =
                                renderHarnessHistorySummaryRow('요청', historyHarnessRequestLabel);
                              const historyHarnessExecutedAtSummaryMarkup =
                                renderHarnessHistorySummaryRow('실행', historyHarnessExecutedAtLabel);
                              const historyHarnessModeSummaryMarkup =
                                renderHarnessHistorySummaryRow('모드', historyHarnessModeLabel);
                              const historyHarnessHandoffSummaryMarkup =
                                renderHarnessHistorySummaryRow('핸드오프', historyHarnessHandoffText);
                              const historyHarnessInputSummaryMarkup =
                                renderHarnessHistorySummaryRow('입력', historyHarnessInputSummaryValue);
                              const historyHarnessOutputSummaryMarkup = renderHarnessHistorySummaryRow(
                                historyHarnessOutputLabel,
                                historyHarnessOutputSummaryValue,
                              );
                              const historyHarnessSummaryRackMarkup = `
                                ${historyHarnessRequestSummaryMarkup}
                                ${historyHarnessExecutedAtSummaryMarkup}
                                ${historyHarnessModeSummaryMarkup}
                                ${historyHarnessHandoffSummaryMarkup}
                                ${historyHarnessInputSummaryMarkup}
                                ${historyHarnessOutputSummaryMarkup}
                              `;
                              const historyHarnessSummaryRackFrameMarkup = `
                                <div class="harness-execution-history-summary-rack" data-harness-execution-history-summary-rack="true">
                                  ${historyHarnessSummaryRackMarkup}
                                </div>
                              `;
                              const historyHarnessExecutionPacketText =
                                formatHarnessExecutionPacketForCopy(execution);
                              const historyHarnessPolicyReportCopyText =
                                formatHarnessPolicyReportForCopy(historyHarnessPolicyReportPayload);
                              const historyHarnessShowActionLabel = getHarnessExecutionShowActionLabel(execution);
                              const historyHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel(execution);
                              const historyHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel(execution);
                              const historyHarnessIsPolicyReport =
                                isHarnessPolicyReportExecution(execution);
                              const historyHarnessPolicyReportDataValue =
                                getHarnessPolicyReportDataValue(historyHarnessIsPolicyReport);
                              const historyHarnessInputPathCopyMarkup =
                                canRenderHistoryHarnessInputPathCopy
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="copy-harness-input-path"
                                      data-input-path="${escapeHtml(historyHarnessInputPath)}"
                                      data-harness-input-copy="true"
                                    >
                                      입력 경로
                                    </button>
                                  `
                                  : '';
                              const historyHarnessOutputPathCopyMarkup =
                                canRenderHistoryHarnessOutputPathCopy
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="copy-harness-output-path"
                                      data-output-path="${escapeHtml(historyHarnessOutputPath)}"
                                      data-output-path-label="${escapeHtml(historyHarnessOutputPathActionLabel)}"
                                      data-harness-output-copy="true"
                                    >
                                      ${escapeHtml(historyHarnessOutputPathActionLabel)}
                                    </button>
                                  `
                                  : '';
                              const historyHarnessRequestIdCopyMarkup =
                                canRenderHistoryHarnessRequestIdCopy
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="copy-harness-request-id"
                                      data-request-id="${escapeHtml(historyHarnessRequestId)}"
                                      data-harness-history-request-id-copy="true"
                                    >
                                      요청 ID
                                    </button>
                                  `
                                  : '';
                              const historyHarnessPolicyReportCopyMarkup =
                                canRenderHistoryHarnessPolicyReportCopy
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="copy-harness-policy-report"
                                      data-policy-report-text="${escapeHtml(historyHarnessPolicyReportCopyText)}"
                                      data-harness-history-policy-report-copy="true"
                                    >
                                      리포트 복사
                                    </button>
                                  `
                                  : '';
                              const historyHarnessRestorePreviewMarkup = `
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="restore-harness-execution-preview"
                                  data-history-index="${String(index)}"
                                  data-harness-history-preview="true"
                                >
                                  ${escapeHtml(historyHarnessShowActionLabel)}
                                </button>
                              `;
                              const historyHarnessExecutionPacketCopyMarkup = `
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="copy-harness-execution-packet"
                                  data-execution-packet-text="${escapeHtml(historyHarnessExecutionPacketText)}"
                                  data-harness-history-packet-copy="true"
                                >
                                  패킷 복사
                                </button>
                              `;
                              const historyHarnessPathReuseActionMarkup = `
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="reuse-harness-execution-paths"
                                  data-input-path="${escapeHtml(historyHarnessInputPath)}"
                                  data-output-path="${escapeHtml(historyHarnessOutputPath)}"
                                  data-harness-history-reuse="true"
                                >
                                  경로 채우기
                                </button>
                              `;
                              const historyHarnessPathRerunActionMarkup = `
                                <button
                                  class="secondary-button"
                                  type="button"
                                  data-action="rerun-harness-execution-paths"
                                  data-input-path="${escapeHtml(historyHarnessInputPath)}"
                                  data-output-path="${escapeHtml(historyHarnessOutputPath)}"
                                  data-policy-report="${historyHarnessPolicyReportDataValue}"
                                  data-harness-history-rerun="true"
                                  ${state.loading || state.mutating ? 'disabled' : ''}
                                >
                                  ${escapeHtml(historyHarnessRerunActionLabel)}
                                </button>
                              `;
                              const historyHarnessPathActionsMarkup = `
                                ${historyHarnessPathReuseActionMarkup}
                                ${historyHarnessPathRerunActionMarkup}
                              `;
                              const historyHarnessPreviewCopyActionMarkup =
                                canRenderHistoryHarnessPreview
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="copy-harness-execution-preview"
                                      data-preview-text="${escapeHtml(historyHarnessPreviewText)}"
                                      data-harness-history-preview-copy="true"
                                    >
                                      미리보기
                                    </button>
                                  `
                                  : '';
                              const historyHarnessOutputBriefActionMarkup =
                                canRenderHistoryHarnessPreview
                                  ? `
                                    <button
                                      class="secondary-button"
                                      type="button"
                                      data-action="summarize-harness-execution-preview"
                                      data-execution-key="${escapeHtml(historyHarnessExecutionKey || '')}"
                                      data-history-index="${String(index)}"
                                      data-preview-text="${escapeHtml(historyHarnessPreviewText)}"
                                      data-harness-history-output-brief="true"
                                      ${state.loading || state.mutating ? 'disabled' : ''}
                                    >
                                      ${escapeHtml(historyHarnessBriefActionLabel)}
                                    </button>
                                  `
                                  : '';
                              const historyHarnessPreviewActionsMarkup = `
                                ${historyHarnessPreviewCopyActionMarkup}
                                ${historyHarnessOutputBriefActionMarkup}
                              `;
                              const historyHarnessActionShelfMarkup = `
                                ${historyHarnessInputPathCopyMarkup}
                                ${historyHarnessRestorePreviewMarkup}
                                ${historyHarnessOutputPathCopyMarkup}
                                ${historyHarnessRequestIdCopyMarkup}
                                ${historyHarnessExecutionPacketCopyMarkup}
                                ${historyHarnessPolicyReportCopyMarkup}
                                ${historyHarnessPathActionsMarkup}
                                ${historyHarnessPreviewActionsMarkup}
                              `;
                              const historyHarnessActionShelfFrameMarkup = `
                                <div class="harness-execution-history-action-shelf" data-harness-execution-history-action-shelf="true">
                                  <div class="form-actions form-actions-inline form-actions-compact">
                                    ${historyHarnessActionShelfMarkup}
                                  </div>
                                </div>
                              `;
                              const historyHarnessItemRegisterMarkup = `
                                <div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">
                                  ${historyHarnessSummaryRackFrameMarkup}
                                  ${historyHarnessActionShelfFrameMarkup}
                                </div>
                              `;
                              const historyHarnessItemPacketMarkup = `
                                <div class="harness-execution-history-item-packet" data-harness-execution-history-item-packet="true">
                                  ${historyHarnessItemRegisterMarkup}
                                </div>
                              `;

                              return historyHarnessItemPacketMarkup;
                            },
                          )
                          .join('')}
                      </div>
                    </div>
                  </section>
                `
                : ''
            }
          `
          : ''
      }
    </section>
  `;
}

function renderHarnessBriefRegister(brief) {
  if (!brief?.primaryHarnessId) {
    return '';
  }

  const showOpenExecution = state.surface !== 'execution';
  const showCommandActions = Boolean(brief.actionCommand) || showOpenExecution;

  return `
    <section class="ops-editor-scope" data-panel-state="readonly" data-harness-register="true">
      <div class="ops-section-head">
        <div>
          <p class="control-overview-label">Harness brief</p>
          <h4 class="ops-section-title">하네스 실행 안내</h4>
        </div>
        ${brief.actionLabel ? createToken(brief.actionLabel, getHarnessBriefActionTone(brief)) : ''}
      </div>
      <p class="control-overview-copy">${escapeHtml(brief.headline || '대표 하네스 안내가 아직 준비되지 않았습니다.')}</p>
      <div class="control-overview-register">
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">대표</span>
          <strong class="control-overview-register-value">${escapeHtml(brief.primaryHarnessId)}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(getHarnessBriefHostStateLabel(brief))}</strong>
        </div>
        <div class="control-overview-register-row">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(brief.actionLabel || 'No action')}</strong>
        </div>
      </div>
      <p class="control-overview-copy">${escapeHtml(brief.actionMessage || '대표 하네스 지시가 아직 준비되지 않았습니다.')}</p>
      ${brief.actionCommand ? `<p class="control-overview-copy">명령 템플릿: <code>${escapeHtml(brief.actionCommand)}</code></p>` : ''}
      ${
        showCommandActions
          ? `
            <div class="form-actions form-actions-inline">
              ${
                brief.actionCommand
                  ? `
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="copy-harness-command"
                      data-command="${escapeHtml(brief.actionCommand)}"
                      data-harness-copy-command="true"
                    >
                      명령 복사
                    </button>
                  `
                  : ''
              }
              ${
                showOpenExecution
                  ? `
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-surface"
                      data-target-surface="execution"
                      data-harness-open-execution="true"
                    >
                      실행 데스크 열기
                    </button>
                  `
                  : ''
              }
            </div>
          `
          : ''
      }
    </section>
  `;
}

function syncProjectProviderDraft(project) {
  const config = getProjectProviderConfig(project);

  state.projectProviderDraftProjectId = project?.id || null;
  state.projectProviderDraftMode = config.mode;
  state.projectProviderDraftModel = config.model;
  state.projectProviderDraftApiKeyVar = config.env.apiKeyVar;
}

function getActivePayload() {
  return (
    state.payload || {
      artifactCatalog: {},
      derived: createEmptyDerivedState(),
      snapshot: {
        activeProjectId: null,
        selectedMissionId: null,
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
      },
    }
  );
}

function getDerived() {
  const payload = getActivePayload();
  const snapshot = payload.snapshot;

  const projects = Object.values(snapshot.projects).sort(sortByCreatedDesc);
  const missions = Object.values(snapshot.missions || {}).sort(sortByCreatedDesc);
  const councilSessions = Object.values(snapshot.councilSessions || {}).sort(sortByCreatedDesc);
  const tasks = Object.values(snapshot.tasks).sort(sortByCreatedDesc);
  const runs = Object.values(snapshot.runs).sort(sortByCreatedDesc);
  const artifacts = Object.values(snapshot.artifacts).sort(sortByCreatedDesc);
  const inboxItems = Object.values(snapshot.decisionInboxItems).sort(sortByCreatedDesc);
  const approvals = Object.values(snapshot.approvals).sort(sortByCreatedDesc);
  const proposalRecords = Object.values(snapshot.proposalRecords || {}).sort(sortByCreatedDesc);
  const proposalApplicationAttempts = Object.values(
    snapshot.proposalApplicationAttempts || {},
  ).sort(sortByCreatedDesc);

  const activeProject = snapshot.activeProjectId
    ? snapshot.projects[snapshot.activeProjectId] || null
    : null;

  const projectTasks = activeProject
    ? tasks.filter((task) => task.projectId === activeProject.id)
    : [];
  const projectMissions = activeProject
    ? missions.filter((mission) => mission.projectId === activeProject.id)
    : [];
  const projectCouncilSessions = activeProject
    ? councilSessions.filter((councilSession) => {
        const mission = snapshot.missions[councilSession.missionId];
        return mission && mission.projectId === activeProject.id;
      })
    : [];
  const projectRuns = activeProject
    ? runs.filter((run) => {
        const task = snapshot.tasks[run.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectArtifacts = activeProject
    ? artifacts.filter((artifact) => {
        const task = snapshot.tasks[artifact.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectInboxItems = activeProject
    ? inboxItems.filter((item) => item.projectId === activeProject.id)
    : [];
  const projectApprovals = activeProject
    ? approvals.filter((approval) => approval.projectId === activeProject.id)
    : [];
  const projectProposalRecords = activeProject
    ? proposalRecords.filter((proposalRecord) => proposalRecord.projectId === activeProject.id)
    : [];
  const projectProposalApplicationAttempts = activeProject
    ? proposalApplicationAttempts.filter((attempt) => attempt.projectId === activeProject.id)
    : [];

  const taskMap = new Map(projectTasks.map((task) => [task.id, task]));
  const missionMap = new Map(projectMissions.map((mission) => [mission.id, mission]));
  const councilSessionMap = new Map(
    projectCouncilSessions.map((councilSession) => [councilSession.id, councilSession]),
  );
  const runMap = new Map(projectRuns.map((run) => [run.id, run]));
  const artifactMap = new Map(projectArtifacts.map((artifact) => [artifact.id, artifact]));
  const inboxItemMap = new Map(projectInboxItems.map((item) => [item.id, item]));

  return {
    artifactCatalog: payload.artifactCatalog || {},
    derived: payload.derived || createEmptyDerivedState(),
    councilSessions: projectCouncilSessions,
    missions: projectMissions,
    snapshot,
    activeProject,
    projects,
    councilSessionMap,
    missionMap,
    tasks: projectTasks,
    runs: projectRuns,
    artifacts: projectArtifacts,
    inboxItems: projectInboxItems,
    approvals: projectApprovals,
    proposalRecords: projectProposalRecords,
    proposalApplicationAttempts: projectProposalApplicationAttempts,
    taskMap,
    runMap,
    artifactMap,
    inboxItemMap,
  };
}

function renderProjectGateSurface(title, copy) {
  return `
    <div class="surface-panel">
      <div class="empty-state empty-state-strong">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </div>
    </div>
  `;
}

function renderSurfaceLeadStrip(options = {}) {
  const {
    title = '',
    copy = '',
    note = '',
    tokens = [],
  } = options;

  return `
    <section class="surface-lead-strip surface-entry-frame">
      <div class="surface-lead-head">
        <div class="surface-lead-copy">
          <h2>${escapeHtml(title)}</h2>
          ${copy ? `<p class="panel-copy panel-copy-tight">${escapeHtml(copy)}</p>` : ''}
        </div>
        <div class="surface-lead-register">
          <p class="surface-lead-register-label">현재 분장</p>
          ${
            tokens.length > 0
              ? `<div class="token-row token-row-compact">${tokens.filter(Boolean).join('')}</div>`
              : '<p class="surface-lead-register-placeholder">현재 분장 정보 없음</p>'
          }
        </div>
      </div>
      ${note ? `<p class="detail-copy detail-copy-compact surface-lead-note">${escapeHtml(note)}</p>` : ''}
    </section>
  `;
}

function renderViewportHandoffStrip(options = {}) {
  const {
    eyebrow = '브리핑 인계선',
    heading = '',
    copy = '',
    tokens = [],
    cards = [],
  } = options;
  const validCards = Array.isArray(cards)
    ? cards.filter((card) => card && (card.title || card.copy))
    : [];

  return `
    <section class="surface-lead-strip viewport-handoff-strip surface-entry-frame">
      <div class="surface-lead-head">
        <div class="surface-lead-copy">
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(heading)}</h2>
          ${copy ? `<p class="panel-copy panel-copy-tight">${escapeHtml(copy)}</p>` : ''}
        </div>
        <div class="surface-lead-register">
          <p class="surface-lead-register-label">현재 분장</p>
          ${
            tokens.length > 0
              ? `<div class="token-row token-row-compact">${tokens.filter(Boolean).join('')}</div>`
              : '<p class="surface-lead-register-placeholder">현재 분장 정보 없음</p>'
          }
        </div>
      </div>
      <div class="viewport-handoff-grid">
        ${validCards
          .map(
            (card) => `
              <article class="viewport-handoff-card${card.emphasis ? ' viewport-handoff-card-emphasis' : ''}">
                <div class="viewport-handoff-head">
                  <p class="viewport-handoff-label">${escapeHtml(card.label || '')}</p>
                  <p class="viewport-handoff-register-label">다음 이동</p>
                </div>
                ${
                  card.signal
                    ? `
                      <div class="viewport-handoff-signal viewport-handoff-signal-${escapeHtml(card.signal.tone || 'neutral')}">
                        <span class="viewport-handoff-signal-dot viewport-handoff-signal-dot-${escapeHtml(card.signal.tone || 'neutral')}"></span>
                        <span class="viewport-handoff-signal-label">${escapeHtml(card.signal.label || 'signal')}</span>
                        <strong class="viewport-handoff-signal-status">${escapeHtml(card.signal.status || '')}</strong>
                      </div>
                    `
                    : ''
                }
                <strong class="viewport-handoff-title">${escapeHtml(card.title || '')}</strong>
                <p class="viewport-handoff-copy">${escapeHtml(card.copy || '')}</p>
                <div class="viewport-handoff-register">
                  ${
                    card.button
                      ? `
                        <button
                          class="secondary-button viewport-handoff-button"
                          type="button"
                          data-action="${escapeHtml(card.button.action)}"
                          ${card.button.id ? `data-id="${escapeHtml(card.button.id)}"` : ''}
                          ${
                            card.button.targetSurface
                              ? `data-target-surface="${escapeHtml(card.button.targetSurface)}"`
                              : ''
                          }
                          ${card.button.disabled ? 'disabled' : ''}
                        >
                          ${escapeHtml(card.button.label)}
                        </button>
                      `
                      : '<p class="viewport-handoff-register-placeholder">현재 분장 확인</p>'
                  }
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function getActiveProjectLinkedWorktreesState(data) {
  return data.derived.activeProjectLinkedWorktrees || createEmptyDerivedState().activeProjectLinkedWorktrees;
}

function buildTaskWorktreeRelation(task, activeProjectLinkedWorktrees) {
  const matchedOption = task.worktreeRef
    ? (activeProjectLinkedWorktrees.options || []).find((option) => option.path === task.worktreeRef) || null
    : null;

  if (!task.worktreeRef) {
    return {
      copy: '아직 저장된 워크트리 경로가 없습니다.',
      label: '워크트리:아직 없음',
      status: 'not-set',
      switchOption: null,
      tone: 'neutral',
    };
  }

  if (matchedOption?.isCurrentProjectPath) {
    return {
      copy: '저장된 워크트리 경로가 현재 프로젝트 경로와 일치합니다.',
      label: '워크트리:현재프로젝트일치',
      status: 'matches-active-project',
      switchOption: null,
      tone: 'success',
    };
  }

  if (matchedOption) {
    return {
      copy: `저장된 워크트리 경로는 ${formatWorktreeOptionLabel(matchedOption)}를 가리키지만 현재 프로젝트 경로는 ${activeProjectLinkedWorktrees.projectPath || '미설정'}로 남아 있습니다.`,
      label: '워크트리:불일치',
      status: 'mismatch',
      switchOption: matchedOption,
      tone: 'warning',
    };
  }

  if (activeProjectLinkedWorktrees.notice) {
    return {
      copy: `현재 프로젝트 경로에서는 연결 워크트리 탐지를 사용할 수 없습니다. 저장된 워크트리 경로는 ${task.worktreeRef}입니다.`,
      label: '워크트리:탐지불가',
      status: 'unavailable',
      switchOption: null,
      tone: 'neutral',
    };
  }

  return {
    copy: '저장된 워크트리 경로가 현재 탐지된 연결 워크트리 목록 밖에 있습니다.',
    label: '워크트리:탐지목록밖',
    status: 'outside-detected-list',
    switchOption: null,
    tone: 'warning',
  };
}

function renderLinkedWorktreeSwitchPanel(data, projectActionDisabled) {
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);

  if (!data.activeProject) {
    return `
      <section class="linked-worktree-panel relation-strip">
        <div class="card-title-row">
          <strong>탐지된 연결 워크트리</strong>
          ${createToken('연결워크트리:비활성', 'neutral')}
        </div>
        <p class="detail-copy">등록된 프로젝트를 골라 연결 워크트리 루트를 확인합니다.</p>
      </section>
    `;
  }

  const options = activeProjectLinkedWorktrees.options || [];
  const body = options.length
    ? options
        .map((option) => {
          const buttonLabel = option.isCurrentProjectPath ? '현재 활성 프로젝트' : '활성 프로젝트 전환';

          return `
            <div class="linked-worktree-row relation-strip">
              <div class="card-title-row">
                <strong>${escapeHtml(option.branch || buildLinkedWorktreeFallbackName(option))}</strong>
                <div class="token-row">
                  ${option.isCurrentProjectPath ? createToken('현재 프로젝트 경로', 'success') : ''}
                  ${
                    option.registeredProjectId
                      ? createToken(`등록됨:${option.registeredProjectName || option.registeredProjectId}`, 'neutral')
                      : createToken('미등록', 'warning')
                  }
                </div>
              </div>
              <p class="detail-copy mono">${escapeHtml(option.path)}</p>
              <div class="form-actions">
                <button
                  class="secondary-button"
                  type="button"
                  data-action="switch-active-project-worktree"
                  data-path="${escapeHtml(option.path)}"
                  ${projectActionDisabled || option.isCurrentProjectPath ? 'disabled' : ''}
                >
                  ${buttonLabel}
                </button>
                <p class="form-help">${
                  option.registeredProjectId
                    ? '기존 프로젝트 선택 흐름을 그대로 재사용합니다.'
                    : '프로젝트 등록 흐름을 재사용한 뒤 연결 루트를 활성화합니다.'
                }</p>
              </div>
            </div>
          `;
        })
        .join('')
    : `
        <div class="empty-state empty-state-inline">
          <strong>탐지된 연결 워크트리 없음</strong>
          <p>${escapeHtml(activeProjectLinkedWorktrees.notice || '이 프로젝트에는 별도 연결 워크트리 루트가 아직 드러나지 않았습니다.')}</p>
        </div>
      `;

  return `
    <section class="linked-worktree-panel">
      <div class="panel-header panel-header-compact">
        <div>
          <h4>탐지된 연결 워크트리</h4>
          <p class="panel-copy">현재 활성 프로젝트 기준으로 탐지된 연결 루트만 보여줍니다. 메인 워크트리는 여기서 제외합니다.</p>
        </div>
      </div>
      <div class="linked-worktree-list">
        ${body}
      </div>
    </section>
  `;
}

function getDevelopmentPackExecutionGateReason(task, data) {
  if (!task) {
    return null;
  }

  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const plannerState = getPlannerAvailability(task, data, state.loading || state.mutating);
  const architectState = getArchitectAvailability(task, data, state.loading || state.mutating);
  const taskBreakerState = getTaskBreakerAvailability(task, data, state.loading || state.mutating);
  const builderPreflightState = getBuilderPreflightAvailability(task, data, state.loading || state.mutating);

  if (!latestPlanArtifact && plannerState.reasons.length > 0) {
    return plannerState.reasons[0];
  }

  if (latestPlanArtifact && !latestArchitectureArtifact && architectState.reasons.length > 0) {
    return architectState.reasons[0];
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    !latestBreakdownArtifact &&
    taskBreakerState.reasons.length > 0
  ) {
    return taskBreakerState.reasons[0];
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    latestBreakdownArtifact &&
    !latestPreflightArtifact &&
    builderPreflightState.reasons.length > 0
  ) {
    return builderPreflightState.reasons[0];
  }

  return null;
}

function getMissionCompletionSummary(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;
  const latestCloseOutArtifact = linkedTask ? getLatestTaskArtifact(linkedTask, data, 'close-out') : null;
  const closeOutState = linkedTask ? getCloseOutAvailability(linkedTask, data, state.loading || state.mutating) : null;
  const completionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState?.summary?.existingCloseOutArtifactId),
  );

  return {
    closeOutArtifactId:
      latestCloseOutArtifact?.id || closeOutState?.summary?.existingCloseOutArtifactId || null,
    closeOutState,
    completionReady,
    latestCloseOutArtifact,
    linkedTask,
    releasePackageArtifactId:
      closeOutState?.summary?.currentReleasePackageArtifactId ||
      closeOutState?.summary?.latestReleasePackageArtifactId ||
      null,
  };
}

function getMissionCouncilPreview(mission, data) {
  const councilSession =
    mission?.councilSessionId && data.councilSessionMap.has(mission.councilSessionId)
      ? data.councilSessionMap.get(mission.councilSessionId)
      : null;
  const alignmentStatus = councilSession?.alignment?.status || 'pending';
  const openQuestionsCount = Array.isArray(councilSession?.openQuestions)
    ? councilSession.openQuestions.length
    : 0;
  const participantCount = Array.isArray(councilSession?.participants)
    ? councilSession.participants.length
    : 0;
  const selectedPlanTitle = councilSession?.selectedPlan?.title || null;
  const recommendation = councilSession?.recommendation || null;
  const summary = councilSession?.summary || null;

  return {
    alignmentStatus,
    councilSession,
    openQuestionsCount,
    participantCount,
    previewLine: councilSession
      ? `${selectedPlanTitle || recommendation || summary || '추천안 준비됨'}. 정렬 상태 ${getAlignmentStatusDisplay(alignmentStatus)}.`
      : '아직 협의회 추천안이 없습니다.',
    recommendationPreview: recommendation || summary || '아직 추천안이 없습니다.',
    selectedPlanTitle: selectedPlanTitle || '선택된 계획 없음',
    selectedPlanScope: councilSession?.selectedPlan?.scope || '선택된 범위 없음',
  };
}

function getMissionExecutionPreview(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  if (!linkedTask) {
    return {
      actionLabel: null,
      approvalBridge: null,
      blockedReason: '연결된 태스크가 아직 없습니다.',
      gatePreview: '연결된 태스크가 아직 없어서 실행 게이트도 없습니다.',
      latestRun: null,
      latestRunNextStage: null,
      latestRunRole: null,
      linkedTask,
      preferredInboxItem: null,
      stagePreview: '아직 실행 기록이 없습니다.',
    };
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const executionGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const blockedReason =
    executionGateReason ||
    (preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? '빌더 라이브 변경 승인이 대기 중입니다.'
        : linkedTask.flags?.waitingDecision
          ? '막고 있는 결정 항목이 대기 중입니다.'
          : linkedTask.flags?.blocked
            ? '연결된 태스크가 현재 blocked 상태입니다.'
            : '현재 활성화된 차단 사유는 없습니다.');

  return {
    actionLabel: approvalBridge.actionLabel || preferredInboxItem?.kind || null,
    approvalBridge,
    blockedReason,
    executionBlocked: Boolean(executionGateReason),
    gatePreview:
      approvalBridge.bridgeCopy ||
      (executionGateReason
        ? `현재 실행은 ${executionGateReason} 전까지 진행할 수 없습니다.`
        : '지금 활성화된 실행 게이트는 없습니다.'),
    latestRun,
    latestRunNextStage,
    latestRunRole,
    linkedTask,
    preferredInboxItem,
    stagePreview: latestRun
      ? `가장 최근 실행 로그: ${getExecutionRoleDisplay(latestRunRole)}${
          latestRunNextStage ? ` -> ${getExecutionStageDisplay(latestRunNextStage)}` : ''
        } (${getRunStatusDisplay(latestRun.status)}).`
      : '아직 실행 기록이 없습니다.',
  };
}

function getExecutionEvidenceRail(task, data) {
  const buildCheckpoint = (input) => ({
    artifactId: input.artifactId || null,
    blockedReason: input.blockedReason || null,
    currentOwner: false,
    evidenceLabel: input.evidenceLabel,
    evidenceMeta: input.evidenceMeta || null,
    nextHandoff: false,
    nextHandoffLabel: input.nextHandoffLabel || '없음',
    nextRoleId: input.nextRoleId || null,
    note: input.note || null,
    roleId: input.roleId,
    status: input.status,
    subtitle: input.subtitle,
    title: input.title,
  });
  const buildWaitingCheckpoint = (roleId, subtitle, note) =>
    buildCheckpoint({
      roleId,
      title: roleId,
      subtitle,
      status: 'waiting',
      evidenceLabel: `${subtitle} 대기`,
      note,
    });

  if (!task) {
    const checkpoints = [
      buildWaitingCheckpoint('Strategist', 'plan', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Architect', 'architecture', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Decomposer', 'breakdown', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Maker', '프리플라이트 / 빌더', '연결된 실행 셀이 아직 없습니다.'),
      buildWaitingCheckpoint('Critic', 'review', '연결된 실행 셀이 아직 없습니다.'),
    ];

    checkpoints[0].currentOwner = true;

    return {
      blockedReason: '연결된 태스크가 아직 없습니다.',
      checkpoints,
      currentOwnerLabel: '인계 대기',
      nextHandoffLabel: getEvidenceRailHandoffDisplay('execution cell creation'),
    };
  }

  const summarizeArtifactRun = (artifact) => {
    const run = artifact?.runId ? data.runMap.get(artifact.runId) || null : null;
    return {
      artifact,
      meta: run ? `run ${run.id} · ${getRunStatusDisplay(run.status)}` : null,
      run,
    };
  };
  const joinMeta = (parts) => parts.filter(Boolean).join(' · ');
  const executionSummaries = data.derived?.executionEntrySummaries?.[task.id] || {};
  const reviewerSummary = data.derived?.reviewerReadinessSummaries?.[task.id] || null;
  const builderLiveMutationState = getBuilderLiveMutationSummaries(task, data);
  const taskApprovals = getTaskApprovals(task.id, data.approvals).sort(sortByCreatedDesc);
  const taskInboxItems = getTaskInboxItems(task.id, data.inboxItems).sort(sortByCreatedDesc);
  const latestBuilderApproval =
    taskApprovals.find((approval) => approval.allowedNextAction === 'builder-live-mutation') || null;
  const pendingBuilderApprovalItem =
    taskInboxItems.find(
      (item) =>
        item.status === 'pending' &&
        item.kind === 'approval' &&
        item.sourceId === latestBuilderApproval?.id,
    ) ||
    taskInboxItems.find((item) => item.status === 'pending' && item.kind === 'approval') ||
    null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const latestReviewArtifact = getLatestTaskArtifact(task, data, 'review');
  const latestBuilderMutationArtifact =
    getLatestTaskArtifact(task, data, 'change-summary') ||
    getLatestTaskArtifact(task, data, 'diff') ||
    getLatestTaskArtifact(task, data, 'patch');
  const latestBuilderMutationRun =
    (latestBuilderMutationArtifact?.runId
      ? data.runMap.get(latestBuilderMutationArtifact.runId) || null
      : null) ||
    data.runs
      .filter(
        (run) =>
          run.taskId === task.id &&
          (run.role === 'builder-live-mutation' || run.summary?.executionMode === 'live-mutation'),
      )
      .sort(sortByCreatedDesc)[0] ||
    null;
  const latestPlan = summarizeArtifactRun(latestPlanArtifact);
  const latestArchitecture = summarizeArtifactRun(latestArchitectureArtifact);
  const latestBreakdown = summarizeArtifactRun(latestBreakdownArtifact);
  const latestPreflight = summarizeArtifactRun(latestPreflightArtifact);
  const latestReview = summarizeArtifactRun(latestReviewArtifact);
  const reviewStatus = task.review?.status || 'pending';
  const executionBlockedReason = getDevelopmentPackExecutionGateReason(task, data);

  const strategistReason = getPrimaryBlockedReason(executionSummaries.planner?.reasons, null);
  const strategistCheckpoint = latestPlanArtifact
    ? buildCheckpoint({
        roleId: 'Strategist',
        title: 'Strategist',
        subtitle: 'plan',
        status: 'complete',
        artifactId: latestPlanArtifact.id,
        evidenceLabel: `계획 ${latestPlanArtifact.id}`,
        evidenceMeta: latestPlan.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Architect')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Architect'),
        nextRoleId: 'Architect',
      })
    : buildCheckpoint({
        roleId: 'Strategist',
        title: 'Strategist',
        subtitle: 'plan',
        status: strategistReason ? 'blocked' : 'current',
        evidenceLabel: '계획 대기',
        blockedReason: strategistReason ? getGuardReasonDisplay(strategistReason) : null,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Architect')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Architect'),
        nextRoleId: 'Architect',
      });

  const architectReason = getPrimaryBlockedReason(executionSummaries.architect?.reasons, null);
  const architectCheckpoint = latestArchitectureArtifact
    ? buildCheckpoint({
        roleId: 'Architect',
        title: 'Architect',
        subtitle: 'architecture',
        status: 'complete',
        artifactId: latestArchitectureArtifact.id,
        evidenceLabel: `설계 ${latestArchitectureArtifact.id}`,
        evidenceMeta: latestArchitecture.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Decomposer')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Decomposer'),
        nextRoleId: 'Decomposer',
      })
    : !latestPlanArtifact
      ? buildWaitingCheckpoint('Architect', 'architecture', '계획 아티팩트가 아직 없습니다.')
      : buildCheckpoint({
          roleId: 'Architect',
          title: 'Architect',
          subtitle: 'architecture',
          status: architectReason ? 'blocked' : 'current',
          evidenceLabel: '설계 대기',
          blockedReason: architectReason ? getGuardReasonDisplay(architectReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('Decomposer')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('Decomposer'),
          nextRoleId: 'Decomposer',
        });

  const decomposerReason = getPrimaryBlockedReason(executionSummaries.taskBreaker?.reasons, null);
  const decomposerCheckpoint = latestBreakdownArtifact
    ? buildCheckpoint({
        roleId: 'Decomposer',
        title: 'Decomposer',
        subtitle: 'breakdown',
        status: 'complete',
        artifactId: latestBreakdownArtifact.id,
        evidenceLabel: `breakdown ${latestBreakdownArtifact.id}`,
        evidenceMeta: latestBreakdown.meta,
        note: `다음 인계: ${getEvidenceRailHandoffDisplay('Maker')}`,
        nextHandoffLabel: getEvidenceRailHandoffDisplay('Maker'),
        nextRoleId: 'Maker',
      })
    : !latestArchitectureArtifact
      ? buildWaitingCheckpoint('Decomposer', 'breakdown', '설계 아티팩트가 아직 없습니다.')
      : buildCheckpoint({
          roleId: 'Decomposer',
          title: 'Decomposer',
          subtitle: 'breakdown',
          status: decomposerReason ? 'blocked' : 'current',
          evidenceLabel: 'breakdown 대기',
          blockedReason: decomposerReason ? getGuardReasonDisplay(decomposerReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('Maker')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('Maker'),
          nextRoleId: 'Maker',
        });

  const builderApprovalDisplayStatus =
    builderLiveMutationState.guardSummary.latestApprovalDisplayStatus ||
    builderLiveMutationState.requestSummary.latestApprovalDisplayStatus ||
    latestBuilderApproval?.status ||
    'none';
  const makerEvidenceMeta = joinMeta([
    latestPreflight.meta,
    latestBuilderApproval
      ? `승인 ${latestBuilderApproval.id} · ${getApprovalStatusDisplay(builderApprovalDisplayStatus)}`
      : null,
    latestBuilderMutationRun
      ? `live ${latestBuilderMutationRun.id} · ${getRunStatusDisplay(latestBuilderMutationRun.status)}`
      : null,
  ]);
  const builderPreflightReason = getPrimaryBlockedReason(
    executionSummaries.builderPreflight?.reasons,
    null,
  );
  const makerRequestReason = getPrimaryBlockedReason(
    builderLiveMutationState.requestSummary.reasons,
    null,
  );
  const makerGuardReason = getPrimaryBlockedReason(
    builderLiveMutationState.guardSummary.reasons,
    null,
  );
  let makerCheckpoint = buildWaitingCheckpoint(
    'Maker',
    'preflight / builder',
    'breakdown artifact가 아직 없습니다.',
  );

  if (latestBuilderMutationRun || latestReviewArtifact) {
    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status: 'complete',
      artifactId: latestPreflightArtifact?.id || null,
      evidenceLabel: latestPreflightArtifact ? `프리플라이트 ${latestPreflightArtifact.id}` : '프리플라이트 없음',
      evidenceMeta: makerEvidenceMeta || null,
      note: `다음 인계: ${getEvidenceRailHandoffDisplay('Critic')}`,
      nextHandoffLabel: getEvidenceRailHandoffDisplay('Critic'),
      nextRoleId: 'Critic',
    });
  } else if (latestPreflightArtifact) {
    const blockedReason =
      executionBlockedReason ||
      pendingBuilderApprovalItem?.prompt ||
      latestBuilderApproval?.prompt ||
      makerGuardReason ||
      makerRequestReason ||
      null;
    const nextHandoffLabel =
      latestBuilderApproval?.status === 'approved' && builderLiveMutationState.guardSummary.allowed
        ? getEvidenceRailHandoffDisplay('builder-live-mutation')
        : getEvidenceRailHandoffDisplay('builder-live-mutation approval');
    const status =
      pendingBuilderApprovalItem || latestBuilderApproval?.status === 'pending'
        ? 'blocked'
        : blockedReason && !builderLiveMutationState.requestSummary.allowed && !builderLiveMutationState.guardSummary.allowed
          ? 'blocked'
          : 'current';

    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status,
      artifactId: latestPreflightArtifact.id,
      evidenceLabel: `프리플라이트 ${latestPreflightArtifact.id}`,
      evidenceMeta: makerEvidenceMeta || null,
      blockedReason: status === 'blocked' ? getGuardReasonDisplay(blockedReason) : null,
      note: `다음 인계: ${nextHandoffLabel}`,
      nextHandoffLabel,
    });
  } else if (latestBreakdownArtifact) {
    const blockedReason = executionBlockedReason || builderPreflightReason || null;
    makerCheckpoint = buildCheckpoint({
      roleId: 'Maker',
      title: 'Maker',
      subtitle: '프리플라이트 / 빌더',
      status: blockedReason ? 'blocked' : 'current',
      evidenceLabel: '프리플라이트 대기',
      blockedReason: blockedReason ? getGuardReasonDisplay(blockedReason) : null,
      note: `다음 인계: ${getEvidenceRailHandoffDisplay('builder-live-mutation approval')}`,
      nextHandoffLabel: getEvidenceRailHandoffDisplay('builder-live-mutation approval'),
    });
  }

  const criticEvidenceMeta = joinMeta([
    latestReview.meta,
    latestReviewArtifact ? `상태 ${getReviewStatusDisplay(reviewStatus)}` : null,
    !latestReviewArtifact && latestBuilderMutationRun
      ? `builder ${latestBuilderMutationRun.id} · ${getRunStatusDisplay(latestBuilderMutationRun.status)}`
      : null,
  ]);
  const criticReason = getPrimaryBlockedReason(reviewerSummary?.reasons, null);
  const criticNextHandoffLabel = getEvidenceRailHandoffDisplay(
    latestReview.run?.summary?.nextStage || 'human gate',
  );
  const criticCheckpoint = latestReviewArtifact
    ? buildCheckpoint({
        roleId: 'Critic',
        title: 'Critic',
        subtitle: 'review',
        status: 'complete',
        artifactId: latestReviewArtifact.id,
        evidenceLabel: `review ${latestReviewArtifact.id}`,
        evidenceMeta: criticEvidenceMeta || null,
        note: `다음 인계: ${criticNextHandoffLabel}`,
        nextHandoffLabel: criticNextHandoffLabel,
      })
    : latestBuilderMutationRun
      ? buildCheckpoint({
          roleId: 'Critic',
          title: 'Critic',
          subtitle: 'review',
          status: criticReason ? 'blocked' : 'current',
          evidenceLabel: 'review 대기',
          evidenceMeta: criticEvidenceMeta || null,
          blockedReason: criticReason ? getGuardReasonDisplay(criticReason) : null,
          note: `다음 인계: ${getEvidenceRailHandoffDisplay('human gate')}`,
          nextHandoffLabel: getEvidenceRailHandoffDisplay('human gate'),
        })
      : buildWaitingCheckpoint('Critic', 'review', '빌더 라이브 변경 증적이 아직 없습니다.');

  const checkpoints = [
    strategistCheckpoint,
    architectCheckpoint,
    decomposerCheckpoint,
    makerCheckpoint,
    criticCheckpoint,
  ];
  const lastCompletedCheckpoint = [...checkpoints].reverse().find((checkpoint) => checkpoint.status === 'complete') || null;
  const activeCheckpoint =
    checkpoints.find((checkpoint) => checkpoint.status === 'blocked') ||
    checkpoints.find((checkpoint) => checkpoint.status === 'current') ||
    lastCompletedCheckpoint ||
    checkpoints[0];

  if (activeCheckpoint) {
    activeCheckpoint.currentOwner = true;

    if (activeCheckpoint.nextRoleId) {
      const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.roleId === activeCheckpoint.nextRoleId);

      if (nextCheckpoint) {
        nextCheckpoint.nextHandoff = true;
      }
    }
  }

  return {
    blockedReason: activeCheckpoint?.blockedReason || null,
    checkpoints,
    currentOwnerLabel: activeCheckpoint?.title || '인계 대기',
    nextHandoffLabel: activeCheckpoint?.nextHandoffLabel || '없음',
  };
}

function renderRelationButton(label, action, id, tone = 'neutral', isSelected = false) {
  if (!id) {
    return '';
  }

  return `
    <button
      class="token-button token token-${tone} ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-action="${escapeHtml(action)}"
      data-id="${escapeHtml(id)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderRelationStrip(context) {
  if (!context) {
    return '';
  }

  const legacyRunButton =
    context.run &&
    context.run.id !== context.builderRun?.id &&
    context.run.id !== context.reviewerRun?.id
      ? renderRelationButton(
          `${getRunRelationLabelDisplay(context.runLabel || 'run')}:${context.run.id}`,
          'select-run',
          context.run.id,
          'neutral',
          state.selectedRunId === context.run.id,
        )
      : '';
  const relationButtons = [
    context.releasePackageArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('release-package')}:${context.releasePackageArtifact.id}`,
          'select-artifact',
          context.releasePackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.releasePackageArtifact.id,
        )
      : '',
    context.commitResultArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('commit-result')}:${context.commitResultArtifact.id}`,
          'select-artifact',
          context.commitResultArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitResultArtifact.id,
        )
      : '',
    context.commitPackageArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('commit-package')}:${context.commitPackageArtifact.id}`,
          'select-artifact',
          context.commitPackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitPackageArtifact.id,
        )
      : '',
    context.reviewerRun
      ? renderRelationButton(
          `리뷰어:${context.reviewerRun.id}`,
          'select-run',
          context.reviewerRun.id,
          'neutral',
          state.selectedRunId === context.reviewerRun.id,
        )
      : '',
    context.reviewArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('review')}:${context.reviewArtifact.id}`,
          'select-artifact',
          context.reviewArtifact.id,
          'neutral',
          state.selectedArtifactId === context.reviewArtifact.id,
        )
      : '',
    context.builderRun
      ? renderRelationButton(
          `빌더:${context.builderRun.id}`,
          'select-run',
          context.builderRun.id,
          'neutral',
          state.selectedRunId === context.builderRun.id,
        )
      : '',
    context.preflightArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('preflight')}:${context.preflightArtifact.id}`,
          'select-artifact',
          context.preflightArtifact.id,
          'neutral',
          state.selectedArtifactId === context.preflightArtifact.id,
        )
      : '',
    context.changeSummaryArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('change-summary')}:${context.changeSummaryArtifact.id}`,
          'select-artifact',
          context.changeSummaryArtifact.id,
          'neutral',
          state.selectedArtifactId === context.changeSummaryArtifact.id,
        )
      : '',
    context.patchArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('patch')}:${context.patchArtifact.id}`,
          'select-artifact',
          context.patchArtifact.id,
          'neutral',
          state.selectedArtifactId === context.patchArtifact.id,
        )
      : '',
    context.diffArtifact
      ? renderRelationButton(
          `${getArtifactTypeDisplay('diff')}:${context.diffArtifact.id}`,
          'select-artifact',
          context.diffArtifact.id,
          'neutral',
          state.selectedArtifactId === context.diffArtifact.id,
        )
      : '',
    legacyRunButton,
  ]
    .filter(Boolean)
    .join('');
  const contextTokens = [
    context.executionMode ? createToken(`모드:${getExecutionModeDisplay(context.executionMode)}`, 'neutral') : '',
    context.approvalId ? createToken(`승인:${context.approvalId}`, 'neutral') : '',
    context.rawVerdict
      ? createToken(
          `판정:${getReviewerVerdictDisplay(context.rawVerdict)}`,
          getReviewerVerdictTone(context.rawVerdict),
        )
      : '',
    context.changedFiles.length > 0
      ? createToken(`변경파일:${context.changedFiles.length}`, 'neutral')
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!relationButtons && !contextTokens && context.changedFiles.length === 0) {
    return '';
  }

  return `
    <div class="relation-strip">
      ${contextTokens ? `<div class="token-row">${contextTokens}</div>` : ''}
      ${relationButtons ? `<div class="relation-button-row">${relationButtons}</div>` : ''}
      ${renderCompactList('변경 파일', context.changedFiles, 4)}
    </div>
  `;
}

function renderReasonList(title, items) {
  const normalizedItems = Array.isArray(items) ? items.map((item) => getGuardReasonDisplay(item)) : items;
  return renderCompactList(
    title,
    normalizedItems,
    Array.isArray(normalizedItems) ? normalizedItems.length : 0,
  );
}

function findPendingApprovalItemByAction(taskId, data, allowedNextAction, matcher = null) {
  for (const item of data.inboxItems) {
    if (item.taskId !== taskId || item.status !== 'pending' || item.kind !== 'approval' || !item.sourceId) {
      continue;
    }

    const approval = data.approvals.find((candidate) => candidate.id === item.sourceId) || null;

    if (!approval || approval.allowedNextAction !== allowedNextAction) {
      continue;
    }

    if (!matcher || matcher(approval)) {
      return item;
    }
  }

  return null;
}

function renderPreselectedPendingItemHint(item, approval, options = {}) {
  if (!item) {
    return '';
  }

  const helpText =
    options.helpText || '승인 처리는 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다.';
  const hintSignalRow = options.signalRow
    ? `
      <div class="breakdown-inbox-signal-row">
        ${options.signalRow}
      </div>
    `
    : '';

  return `
    <div class="breakdown-inbox-hint">
      <div class="token-row">
        ${createToken(`선택된 결정함:${item.id}`, 'warning')}
        ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
        ${item.blocksTask ? createToken('태스크 차단', 'danger') : ''}
        ${approval ? createToken(`범위:${approval.scope}`, 'neutral') : ''}
        ${
          approval?.allowedNextAction
            ? createToken(`액션:${getApprovalActionLabel(approval.allowedNextAction)}`, 'neutral')
            : ''
        }
      </div>
      <p class="detail-copy">${escapeHtml(item.title)}</p>
      <p class="detail-copy">${escapeHtml(item.prompt || '기록된 안내 문구가 없습니다.')}</p>
      ${hintSignalRow}
      ${
        item.kind === 'approval'
          ? `
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="approve"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                승인
              </button>
              <button
                class="danger-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="reject"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                반려
              </button>
              <p class="form-help">${escapeHtml(helpText)}</p>
            </div>
          `
          : '<p class="form-help">이 슬라이스에서는 결정 처리를 결정함 표면에 남깁니다.</p>'
      }
    </div>
  `;
}

function renderTaskDetailNavigationHint(task, options = {}) {
  if (!task) {
    return '';
  }

  const label = options.label || '태스크 상세';
  const helpText = options.helpText || '실행을 이어가려면 태스크 상세를 엽니다.';

  return `
    <div class="breakdown-inbox-hint">
      <div class="form-actions form-actions-inline">
        <button
          class="secondary-button"
          type="button"
          data-action="open-taskboard-task"
          data-id="${escapeHtml(task.id)}"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          ${escapeHtml(label)}
        </button>
        <p class="form-help">${escapeHtml(helpText)}</p>
      </div>
    </div>
  `;
}

function renderCommitPackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCommitPackageAvailability(task, data, state.loading || state.mutating);
  const commitExecutionState = getCommitExecutionAvailability(task, data, state.loading || state.mutating);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCommitApprovalDisplayStatus(summary);
  const packageStatus = summary.currentCommitPackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestCommitPackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildCommitPackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `최신 리뷰어 번들 ${summary.sourceReviewerRunId || '기준 리뷰어 결과'}를 바탕으로 커밋 패키지 아티팩트를 만들고 커밋 승인 안건을 엽니다. 외부 전달은 계속 막아 둡니다.`
    : `커밋 패키지 준비는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 리뷰어 번들이 준비될 때까지'
      } 대기합니다.`;
  const localCommitDisplayStatus =
    commitExecutionState.summary.latestApprovalDisplayStatus ||
    getCommitApprovalDisplayStatus(commitExecutionState.summary);
  const localCommitHelp = commitExecutionState.summary.allowed
    ? `승인된 커밋 패키지 ${commitExecutionState.summary.commitPackageArtifactId || '기준 패키지'}에서 로컬 커밋을 실행하고 커밋 결과 아티팩트로 이어집니다. 외부 전달은 계속 비활성입니다.`
    : `로컬 커밋은 ${
        (commitExecutionState.summary.reasons || [])
          .map((reason) => getGuardReasonDisplay(reason))
          .join('; ') || '승인된 로컬 커밋 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false || !allowExecutingActions
      ? ''
      : `
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-commit-package"
            data-id="${escapeHtml(task.id)}"
            ${disabled ? 'disabled' : ''}
          >
            커밋 패키지 준비
          </button>
          <p class="form-help">${escapeHtml(actionHelp)}</p>
        </div>
      `;
  const localCommitActionSurface =
    options.includeLocalCommitAction === false
      ? ''
      : `
        <div class="guard-summary">
          <div class="token-row">
            ${
              commitExecutionState.summary.allowed
                ? createToken('로컬커밋:준비됨', 'success')
                : createToken('로컬커밋:차단', 'warning')
            }
            ${createToken(
              `커밋승인:${getApprovalStatusDisplay(localCommitDisplayStatus)}`,
              getApprovalDisplayTone(localCommitDisplayStatus),
            )}
            ${
              commitExecutionState.summary.commitPackageArtifactId
                ? createToken(
                    `패키지:${commitExecutionState.summary.commitPackageArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.existingCommitResultArtifactId
                ? createToken(
                    `기존결과:${commitExecutionState.summary.existingCommitResultArtifactId}`,
                    commitExecutionState.summary.conflict ? 'warning' : 'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.sourceReviewerRunId
                ? createToken(`리뷰어:${commitExecutionState.summary.sourceReviewerRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.sourceBuilderRunId
                ? createToken(`빌더:${commitExecutionState.summary.sourceBuilderRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.targetPreflightArtifactId
                ? createToken(
                    `preflight:${commitExecutionState.summary.targetPreflightArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.changedFileCount
                ? createToken(
                    `변경파일:${commitExecutionState.summary.changedFileCount}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.commitMessagePresent
                ? createToken('커밋메시지:있음', 'success')
                : createToken('커밋메시지:없음', 'warning')
            }
          </div>
          <p class="detail-copy">
            로컬 커밋 가능 여부는 로컬 커밋 준비도 요약을 그대로 따릅니다. UI는 loading/mutation 상태만 얹고, 푸시, 병합, 릴리스는 계속 비활성 상태로 둡니다.
          </p>
          ${
            commitExecutionState.summary.reasons?.length
              ? renderReasonList(
                  '로컬 커밋 비활성 사유',
                  commitExecutionState.summary.reasons,
                )
              : '<p class="detail-copy">현재 승인된 커밋패키지 번들 기준으로 로컬 커밋이 준비됐습니다.</p>'
          }
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-local-commit"
                    data-id="${escapeHtml(task.id)}"
                    ${commitExecutionState.disabled ? 'disabled' : ''}
                  >
                    승인된 로컬 커밋 이어가기
                  </button>
                  <p class="form-help">${escapeHtml(localCommitHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)}는 커밋 후속 처리에서 탐색 전용으로 남습니다. 승인된 로컬 커밋 이어가기는 태스크 상세에서 실행합니다.`,
                    )}
                  </p>
                `
            }
          </div>
        </div>
      `;
  const navigationHint =
    allowExecutingActions
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: '커밋 가드',
          helpText:
            '실행은 태스크 상세에 남고, 아티팩트와 결정함은 커밋 이어가기 동안 탐색 전용으로 유지됩니다.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('커밋패키지:준비됨', 'success')
            : createToken('커밋패키지:차단', 'warning')
        }
        ${createToken(
          `커밋승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`승인:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentCommitPackageArtifactId
            ? createToken(`현재패키지:${summary.currentCommitPackageArtifactId}`, 'neutral')
            : summary.latestCommitPackageArtifactId
              ? createToken(`최신패키지:${summary.latestCommitPackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        커밋패키지 준비도는 coordinator 요약을 그대로 따릅니다. 이 패널은 그 상태만 보여주고 실제 git commit, 병합, 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('커밋 패키지 가드 사유', summary.reasons)
          : '<p class="detail-copy">최신 통과 리뷰어 번들에 남은 커밋패키지 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 커밋패키지 연결 맥락이 없습니다.</p>'
      }
      ${actionSurface}
      ${localCommitActionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderReleasePackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getReleasePackageAvailability(task, data, state.loading || state.mutating);
  const currentSurface = options.currentSurface || state.surface;
  const displayStatus = summary.latestApprovalDisplayStatus || 'none';
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestReleasePackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildReleasePackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `커밋결과 ${summary.commitResultArtifactId || '기준 로컬 커밋 번들'}에서 릴리스 패키지를 만들고 릴리스 승인 안건을 엽니다. 외부 전달은 계속 비활성입니다.`
    : `릴리스 패키지 준비는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 성공 로컬 커밋 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-release-package"
            data-id="${escapeHtml(task.id)}"
            ${disabled ? 'disabled' : ''}
          >
            릴리스 패키지 준비
          </button>
          <p class="form-help">${escapeHtml(actionHelp)}</p>
        </div>
        `;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('릴리스패키지:준비됨', 'success')
            : createToken('릴리스패키지:차단', 'warning')
        }
        ${createToken(
          `릴리스승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`승인:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`현재패키지:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`최신패키지:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-result')}:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-package')}:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitSha
            ? createToken(`sha:${summary.commitSha}`, 'success')
            : ''
        }
        ${
          summary.deliveryStance
            ? createToken(`전달:${getDeliveryStanceDisplay(summary.deliveryStance)}`, 'neutral')
            : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        릴리스패키지 준비도는 coordinator 요약을 그대로 따릅니다. 이 패널은 그 상태만 보여주고 푸시, 게시, 외부 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('릴리스 패키지 가드 사유', summary.reasons)
          : '<p class="detail-copy">현재 로컬 커밋 번들에 남은 릴리스패키지 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 릴리스패키지 연결 근거가 없습니다.</p>'
      }
      ${actionSurface}
    </div>
  `;
}

function renderCloseOutPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCloseOutAvailability(task, data, state.loading || state.mutating);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCloseOutApprovalDisplayStatus(summary);
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.latestReleasePackageArtifactId
      ? 'latest'
      : 'missing';
  const relationContext = buildCloseOutRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `승인된 릴리스패키지 ${summary.currentReleasePackageArtifactId || '기준 번들'}에서 종료 정리를 실행하고 종료정리 아티팩트를 남깁니다. 외부 전달은 계속 비활성입니다.`
    : `종료 정리는 ${
        (summary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '현재 승인된 릴리스 번들이 준비될 때까지'
      } 대기합니다.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-close-out"
                    data-id="${escapeHtml(task.id)}"
                    ${disabled ? 'disabled' : ''}
                  >
                    승인된 종료 정리 이어가기
                  </button>
                  <p class="form-help">${escapeHtml(actionHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)}는 종료 정리 후속 처리에서 탐색 전용으로 남습니다. 승인된 종료 정리 이어가기는 태스크 상세에서 실행합니다.`,
                    )}
                  </p>
                `
            }
          </div>
        `;
  const navigationHint =
    allowExecutingActions || !summary.allowed
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: '종료 가드',
          helpText:
            '실행은 태스크 상세에 남고, 아티팩트와 결정함은 종료 정리 이어가기 동안 탐색 전용으로 유지됩니다.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('종료정리:준비됨', 'success')
            : createToken('종료정리:차단', 'warning')
        }
        ${createToken(
          `릴리스승인:${getApprovalStatusDisplay(displayStatus)}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `패키지:${getPackageStatusDisplay(packageStatus)}`,
          packageStatus === 'current' ? 'success' : 'neutral',
        )}
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`현재패키지:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`최신패키지:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-result')}:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`${getArtifactTypeDisplay('commit-package')}:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${summary.commitSha ? createToken(`sha:${summary.commitSha}`, 'success') : ''}
        ${
          summary.deliveryStance
            ? createToken(`전달:${getDeliveryStanceDisplay(summary.deliveryStance)}`, 'neutral')
            : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`리뷰어:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`빌더:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.repoClean
            ? createToken('저장소:정상', 'success')
            : createToken('저장소:차단', 'warning')
        }
        ${
          summary.existingCloseOutArtifactId
            ? createToken(`기존종료정리:${summary.existingCloseOutArtifactId}`, summary.conflict ? 'warning' : 'neutral')
            : ''
        }
        ${createToken(`표면:${getSurfaceDisplayName(currentSurface)}`, 'neutral')}
      </div>
      <p class="detail-copy">
        종료 정리 가능 여부는 종료 정리 준비도 요약을 그대로 따릅니다. UI는 loading/mutating 상태만 얹고, 푸시, 게시, 외부 릴리스는 계속 비활성 상태로 둡니다.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('종료 정리 가드 사유', summary.reasons)
          : '<p class="detail-copy">현재 승인된 릴리스 번들에 남은 종료 정리 가드 사유가 없습니다.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">아직 종료정리 연결 근거가 없습니다.</p>'
      }
      ${actionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderBuilderLiveMutationApprovalPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { guardSummary, requestSummary } = getBuilderLiveMutationSummaries(task, data);
  const requestDisabled = state.loading || state.mutating || !requestSummary.allowed;
  const runDisabled = state.loading || state.mutating || !guardSummary.allowed;
  const requestHelp = requestSummary.allowed
    ? `${requestSummary.currentPreflightArtifactId} 기준으로 새 승인 안건을 엽니다.`
    : `승인 요청은 ${
        (requestSummary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 프리플라이트가 준비될 때까지'
      } 대기합니다.`;
  const runHelp = guardSummary.allowed
    ? `${guardSummary.currentPreflightArtifactId} 기준 라이브 변경을 실행하고 변경요약, 패치, diff 아티팩트를 남깁니다.`
    : `라이브 변경은 ${
        (guardSummary.reasons || []).map((reason) => getGuardReasonDisplay(reason)).join('; ') ||
        '최신 승인된 프리플라이트 쌍이 준비될 때까지'
      } 대기합니다.`;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          guardSummary.allowed
            ? createToken('라이브변경가드:준비됨', 'success')
            : createToken('라이브변경가드:차단', 'danger')
        }
        ${createToken(
          `최신승인:${getApprovalStatusDisplay(guardSummary.latestApprovalDisplayStatus || 'none')}`,
          getApprovalDisplayTone(guardSummary.latestApprovalDisplayStatus || 'none'),
        )}
        ${
          requestSummary.currentPreflightArtifactId
            ? createToken(`현재preflight:${requestSummary.currentPreflightArtifactId}`, 'neutral')
            : createToken('현재preflight:없음', 'warning')
        }
        ${
          guardSummary.targetPreflightArtifactId
            ? createToken(`승인대상:${guardSummary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          guardSummary.targetFileCount
            ? createToken(`대상파일:${guardSummary.targetFileCount}`, 'neutral')
            : createToken('대상파일:없음', 'warning')
        }
        ${
          requestSummary.allowed
            ? createToken('요청:가능', 'success')
            : createToken('요청:비활성', requestSummary.conflict ? 'danger' : 'warning')
        }
        ${
          guardSummary.allowed
            ? createToken('실행:가능', 'success')
            : createToken('실행:비활성', 'warning')
        }
      </div>
      <p class="detail-copy">
        제한된 빌더 라이브 변경에 대한 런타임 요약입니다. 실행은 최신 프리플라이트 대상 파일에만 한정되고, 커밋 경로를 자동 시작하지 않은 채 리뷰어에게 넘깁니다.
      </p>
      ${
        guardSummary.reasons?.length
          ? renderReasonList('라이브 변경 가드 사유', guardSummary.reasons)
          : '<p class="detail-copy">최신 프리플라이트 대상에 남은 라이브 변경 가드 사유가 없습니다.</p>'
      }
      ${
        requestSummary.reasons?.length
          ? renderReasonList('승인 요청 비활성 사유', requestSummary.reasons)
          : '<p class="detail-copy">최신 프리플라이트 대상 기준으로 승인 요청이 가능합니다.</p>'
      }
      ${
        options.includeRequestAction === false
          ? ''
          : `
            <div class="form-actions form-actions-inline">
              <button
                class="secondary-button"
                type="button"
                data-action="request-builder-live-mutation-approval"
                data-id="${escapeHtml(task.id)}"
                ${requestDisabled ? 'disabled' : ''}
              >
                라이브 변경 승인 요청
              </button>
              <p class="form-help">${escapeHtml(requestHelp)}</p>
            </div>
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-builder-live-mutation"
                data-id="${escapeHtml(task.id)}"
                ${runDisabled ? 'disabled' : ''}
              >
                라이브 변경 실행
              </button>
              <p class="form-help">${escapeHtml(runHelp)}</p>
            </div>
          `
      }
    </div>
  `;
}

function ensureSelection(data) {
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedArtifact = data.artifactMap.get(state.selectedArtifactId) || null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  if (!state.selectionSeeded) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
    state.selectedTaskId =
      selectedArtifact?.taskId ||
      selectedRun?.taskId ||
      selectedInboxItem?.taskId ||
      data.tasks[0]?.id ||
      null;

    const initialTask = data.taskMap.get(state.selectedTaskId) || null;
    const initialRun =
      selectedRun ||
      (initialTask?.latestRunId && data.runMap.has(initialTask.latestRunId)
        ? data.runMap.get(initialTask.latestRunId)
        : null);
    const initialArtifact =
      selectedArtifact ||
      (initialRun ? getPreferredArtifactForRun(initialRun, data) : null) ||
      (initialTask ? getPreferredTaskArtifact(initialTask, data) : null) ||
      data.artifacts[0] ||
      null;

    state.selectedRunId = initialRun?.id || null;
    state.selectedArtifactId = initialArtifact?.id || null;
    state.selectedInboxItemId =
      selectedInboxItem?.id ||
      (initialTask ? getPreferredTaskInboxItem(initialTask.id, data)?.id || null : null) ||
      data.inboxItems.find((item) => item.status === 'pending')?.id ||
      data.inboxItems[0]?.id ||
      null;
    state.selectionSeeded = true;
    return;
  }

  if (state.selectedMissionId && !selectedMission) {
    state.selectedMissionId = null;
  }

  if (state.selectedRunId && !selectedRun) {
    state.selectedRunId = null;
  }

  if (state.selectedArtifactId && !selectedArtifact) {
    state.selectedArtifactId = null;
  }

  if (state.selectedInboxItemId && !selectedInboxItem) {
    state.selectedInboxItemId = null;
  }

  if (!state.selectedTaskId || !data.taskMap.has(state.selectedTaskId)) {
    state.selectedTaskId =
      (state.selectedArtifactId && data.artifactMap.get(state.selectedArtifactId)?.taskId) ||
      (state.selectedRunId && data.runMap.get(state.selectedRunId)?.taskId) ||
      (state.selectedInboxItemId && data.inboxItemMap.get(state.selectedInboxItemId)?.taskId) ||
      data.tasks[0]?.id ||
      null;
  }

  if (!state.selectedMissionId || !data.missionMap.has(state.selectedMissionId)) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
  }

  const activeTask = data.taskMap.get(state.selectedTaskId) || null;
  const currentRun = state.selectedRunId ? data.runMap.get(state.selectedRunId) || null : null;
  const currentArtifact = state.selectedArtifactId
    ? data.artifactMap.get(state.selectedArtifactId) || null
    : null;
  const currentInboxItem = state.selectedInboxItemId
    ? data.inboxItemMap.get(state.selectedInboxItemId) || null
    : null;

  if (currentRun && activeTask && currentRun.taskId !== activeTask.id) {
    state.selectedRunId = null;
  }

  if (currentArtifact && activeTask && currentArtifact.taskId !== activeTask.id) {
    state.selectedArtifactId = null;
  }

  if (currentInboxItem && activeTask && currentInboxItem.taskId !== activeTask.id) {
    state.selectedInboxItemId = null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`요청이 실패했습니다: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function resetMissionGraphExplorer() {
  state.missionGraphQuery = '';
  state.missionGraphStage = 'all';
  state.missionGraphStatusTone = 'all';
  state.missionGraphSelectedNodeId = null;
}

function reconcileMissionGraphSelection() {
  if (!state.missionEvidenceGraph || !state.missionGraphSelectedNodeId) return;

  const view = createMissionGraphExplorerView(state.missionEvidenceGraph, {
    query: state.missionGraphQuery,
    stage: state.missionGraphStage,
    statusTone: state.missionGraphStatusTone,
    selectedNodeId: state.missionGraphSelectedNodeId,
  });
  state.missionGraphSelectedNodeId = view.selectedNode?.id || null;
}

function restoreMissionGraphFocus({ controlName = null, nodeId = null } = {}) {
  requestAnimationFrame(() => {
    const candidates = nodeId
      ? [...document.querySelectorAll('[data-action="select-mission-graph-node"]')]
          .filter((element) => element.dataset.nodeId === nodeId)
      : [...document.querySelectorAll(`[name="${controlName}"]`)];
    const target = candidates.find((element) => element.getClientRects().length > 0) || candidates[0];
    if (!target) return;

    target.focus();
    if (controlName === 'missionGraphQuery' && typeof target.setSelectionRange === 'function') {
      const end = target.value.length;
      target.setSelectionRange(end, end);
    }
  });
}

function selectMissionGraphNode(nodeId) {
  const nodeExists = state.missionEvidenceGraph?.nodes?.some((node) => node.id === nodeId);
  if (!nodeExists) return;

  state.missionGraphSelectedNodeId =
    state.missionGraphSelectedNodeId === nodeId ? null : nodeId;
  reconcileMissionGraphSelection();
  render();
  restoreMissionGraphFocus({ nodeId });
}

async function loadMissionEvidenceGraph(missionId) {
  if (!missionId) {
    state.missionEvidenceGraph = null;
    state.missionEvidenceGraphError = null;
    resetMissionGraphExplorer();
    return;
  }

  state.missionEvidenceGraphLoading = true;
  state.missionEvidenceGraphError = null;
  render();

  try {
    const payload = await fetchJson(
      `/api/missions/${encodeURIComponent(missionId)}/evidence-graph`,
    );

    if (state.selectedMissionId === missionId) {
      state.missionEvidenceGraph = payload.missionEvidenceGraph || null;
      reconcileMissionGraphSelection();
    }
  } catch (error) {
    if (state.selectedMissionId === missionId) {
      state.missionEvidenceGraph = null;
      state.missionEvidenceGraphError = error.message;
    }
  } finally {
    if (state.selectedMissionId === missionId) {
      state.missionEvidenceGraphLoading = false;
      render();
    }
  }
}

async function setMissionViewMode(viewMode) {
  state.missionViewMode = viewMode === 'graph' ? 'graph' : 'thread';

  if (state.missionViewMode === 'graph') {
    const missionId = state.selectedMissionId;
    const currentGraphMatches = state.missionEvidenceGraph?.missionId === missionId;
    if (!currentGraphMatches) await loadMissionEvidenceGraph(missionId);
    else render();
    return;
  }

  render();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `요청이 실패했습니다: ${response.status} ${response.statusText}`);
  }

  return payload;
}

function buildProviderPayload(mode, model, apiKeyVar) {
  const normalizedMode = mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: normalizedMode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: normalizedMode === 'live' ? apiKeyVar.trim() : '',
    },
    mode: normalizedMode,
    model: normalizedMode === 'live' ? model.trim() : '',
  };
}

function applySnapshotPayload(payload) {
  state.payload = {
    derived: payload.derived || createEmptyDerivedState(),
    generatedAt: payload.generatedAt,
    runtimeRoot: payload.runtimeRoot,
    snapshot: payload.snapshot,
  };
  if (Object.prototype.hasOwnProperty.call(payload, 'deliveryPackagePreview')) {
    state.missionDeliveryPackagePreview = payload.deliveryPackagePreview || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'durableDeliveryPackage')) {
    state.missionDurableDeliveryPackage = payload.durableDeliveryPackage || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'deliveryPackageAcceptance')) {
    state.missionDeliveryPackageAcceptance = payload.deliveryPackageAcceptance || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'missionCloseOut')) {
    state.missionCloseOut = payload.missionCloseOut || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'verificationStatus')) {
    state.workOrderVerificationStatus = payload.verificationStatus || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'learningCandidatePreview')) {
    state.missionLearningCandidatePreview = payload.learningCandidatePreview || null;
  } else if (Object.prototype.hasOwnProperty.call(payload, 'snapshot')) {
    state.missionLearningCandidatePreview = null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'learningCandidate')) {
    state.missionLearningCandidate = payload.learningCandidate || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'learningCandidateReview')) {
    state.missionLearningCandidateReview = payload.learningCandidateReview || null;
    state.missionMemoryCandidatePreview = null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'memoryCandidatePreview')) {
    state.missionMemoryCandidatePreview = payload.memoryCandidatePreview || null;
  } else if (Object.prototype.hasOwnProperty.call(payload, 'snapshot')) {
    state.missionMemoryCandidatePreview = null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'memoryItem')) {
    const memoryItem = payload.memoryItem || null;
    if (
      state.missionMemoryRecallPreview &&
      (state.missionMemoryRecallPreview.sourceMemoryItemId !== memoryItem?.id ||
        state.missionMemoryRecallPreview.sourceMemoryItemRecordDigest !==
          memoryItem?.recordDigest)
    ) {
      state.missionMemoryRecallPreview = null;
    }
    if (
      state.missionMemoryRecall &&
      (state.missionMemoryRecall.sourceMemoryItemId !== memoryItem?.id ||
        state.missionMemoryRecall.sourceMemoryItemRecordDigest !== memoryItem?.recordDigest)
    ) {
      state.missionMemoryRecall = null;
    }
    if (
      state.missionMemoryContextPreview &&
      (state.missionMemoryContextPreview.sourceMemoryItemId !== memoryItem?.id ||
        state.missionMemoryContextPreview.sourceMemoryItemRecordDigest !==
          memoryItem?.recordDigest)
    ) {
      state.missionMemoryContextPreview = null;
    }
    state.missionMemoryItem = memoryItem;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'memoryRecall')) {
    const memoryRecall = payload.memoryRecall || null;
    if (
      state.missionMemoryContextPreview &&
      (state.missionMemoryContextPreview.sourceMemoryRecallId !== memoryRecall?.id ||
        state.missionMemoryContextPreview.sourceMemoryRecallRecordDigest !==
          memoryRecall?.recordDigest)
    ) {
      state.missionMemoryContextPreview = null;
    }
    state.missionMemoryRecall = memoryRecall;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'missionMemoryContextPreview')) {
    state.missionMemoryContextPreview = payload.missionMemoryContextPreview || null;
  } else if (Object.prototype.hasOwnProperty.call(payload, 'snapshot')) {
    state.missionMemoryContextPreview = null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'executionPlanRecovery')) {
    state.missionExecutionPlanRecovery = payload.executionPlanRecovery || null;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'snapshot')) {
    state.executionContinuationPreview = null;
  }

  const snapshot = payload.snapshot || {};
  const activeProject = snapshot.activeProjectId
    ? snapshot.projects?.[snapshot.activeProjectId] || null
    : null;

  if (
    (activeProject && state.projectProviderDraftProjectId !== activeProject.id) ||
    (!activeProject && state.projectProviderDraftProjectId !== null)
  ) {
    syncProjectProviderDraft(activeProject);
  }

  if (activeProject?.id && state.uiPreferences?.preferredProjectId !== activeProject.id) {
    state.uiPreferences = {
      ...normalizeUiPreferences(state.uiPreferences),
      preferredProjectId: activeProject.id,
    };
    persistUiPreferences();
  }
}

function resolvePostMutationSurface(currentSurface, payload, fallbackSurface) {
  const inboxItemId = payload?.mutation?.inboxItemId || null;

  if (!inboxItemId) {
    return fallbackSurface;
  }

  const data = getDerived();
  const item = data.inboxItemMap.get(inboxItemId) || null;

  if (item?.status === 'pending' && item.kind === 'decision') {
    return currentSurface;
  }

  return fallbackSurface;
}

async function hydrateSelectedDetails() {
  const runId = state.selectedRunId;
  const artifactId = state.selectedArtifactId;
  const data = getDerived();
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const selectedCouncilSession = selectedMission?.councilSessionId
    ? data.councilSessionMap.get(selectedMission.councilSessionId) || null
    : null;
  const executionPlanBundle = getMissionExecutionPlanBundle(
    data.snapshot,
    selectedCouncilSession?.id,
  );
  const latestBreakdownArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'breakdown')
    : null;
  const latestPreflightArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'preflight')
    : null;

  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  state.missionDeliveryPackagePreview = null;
  state.missionDurableDeliveryPackage = null;
  state.missionDeliveryPackageAcceptance = null;
  state.missionCloseOut = null;
  state.missionLearningCandidatePreview = null;
  state.missionLearningCandidate = null;
  state.missionLearningCandidateReview = null;
  state.missionMemoryCandidatePreview = null;
  state.missionMemoryItem = null;
  state.missionMemoryRecallPreview = null;
  state.missionMemoryRecall = null;
  state.missionMemoryContextPreview = null;
  state.workOrderVerificationPlanPreview = null;
  state.workOrderVerificationStatus = null;
  state.workOrderAcceptanceCriteriaRationale = '';
  state.workOrderProofDrafts = {};
  state.executionContinuationPreview = null;
  state.missionLearningCandidateDraft = {
    lesson: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    negativeEvidence: '',
    expiresAt: '',
    redactionAcknowledgement: 'source-summary-only',
  };
  state.missionLearningCandidateReviewDraft = {
    decision: 'accept',
    rationale: '',
    evidenceRefs: [],
    reviewerAcknowledgement: 'human-reviewed',
  };
  state.missionMemoryCandidateDraft = {
    summary: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    expiresAt: '',
    workspaceProjectId: '',
    redactionAcknowledgement: 'source-summary-only',
    nonPersistenceStatement: 'readiness-only-not-durable-memory',
  };
  state.missionMemoryItemStorageDraft = {
    rationale: '',
    acknowledgement: 'reviewed-memory-candidate-for-local-project-storage',
  };
  state.missionMemoryRecallDraft = {
    purpose: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    workspaceProjectId: '',
    acknowledgement: 'operator-selected-exact-memory-item-for-read-only-recall',
    nonApplicationStatement: 'recall-preview-not-runtime-application',
  };
  state.missionMemoryRecallRecordDraft = {
    rationale: '',
    acknowledgement: 'reviewed-exact-memory-recall-for-local-audit',
  };
  state.missionMemoryContextDraft = {
    targetMissionId: '',
    purpose: '',
    applicabilitySummary: '',
    targetPathAllowlist: '',
    verificationCommands: '',
    evidenceRefs: '',
    negativeEvidenceRefs: '',
    redactionRefs: '',
    reviewRefs: '',
    workspaceProjectId: '',
    acknowledgement:
      'operator-selected-recorded-recall-for-mission-context-review',
    nonInjectionStatement:
      'memory-context-preview-not-mission-or-prompt-injection',
  };
  state.missionExecutionPlanRecovery = null;
  let selectedArtifactDetail = null;

  await Promise.all([
    runId
      ? fetchJson(`/api/runs/${encodeURIComponent(runId)}/logs`).then((payload) => {
          state.selectedRunLogs = payload;
        })
      : Promise.resolve(),
    artifactId
      ? fetchJson(`/api/artifacts/${encodeURIComponent(artifactId)}`).then((artifactPayload) => {
          selectedArtifactDetail = artifactPayload.artifact;
          state.selectedArtifact = artifactPayload.artifact;
        })
      : Promise.resolve(),
  ]);

  if (latestBreakdownArtifact) {
    if (selectedArtifactDetail?.id === latestBreakdownArtifact.id) {
      state.selectedTaskBreakdownArtifact = selectedArtifactDetail;
    } else {
      const breakdownPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestBreakdownArtifact.id)}`,
      );

      state.selectedTaskBreakdownArtifact = breakdownPayload.artifact;
    }
  }

  if (latestPreflightArtifact) {
    if (selectedArtifactDetail?.id === latestPreflightArtifact.id) {
      state.selectedTaskPreflightArtifact = selectedArtifactDetail;
    } else {
      const preflightPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestPreflightArtifact.id)}`,
      );

      state.selectedTaskPreflightArtifact = preflightPayload.artifact;
    }
  }

  if (executionPlanBundle?.executionPlan.status === 'delivery-ready') {
    const encodedExecutionPlanId = encodeURIComponent(executionPlanBundle.executionPlan.id);
    const [deliveryPayload, durablePayload] = await Promise.all([
      fetchJson(`/api/execution-plans/${encodedExecutionPlanId}/delivery-preview`),
      fetchJson(`/api/execution-plans/${encodedExecutionPlanId}/delivery-package`),
    ]);
    state.missionDeliveryPackagePreview = deliveryPayload.deliveryPackagePreview || null;
    state.missionDurableDeliveryPackage = durablePayload.deliveryPackage || null;
    if (state.missionDurableDeliveryPackage) {
      const acceptancePayload = await fetchJson(
        `/api/delivery-packages/${encodeURIComponent(state.missionDurableDeliveryPackage.id)}/acceptance`,
      );
      state.missionDeliveryPackageAcceptance = acceptancePayload.acceptance || null;
      if (state.missionDeliveryPackageAcceptance && selectedMission) {
        const closeOutPayload = await fetchJson(
          `/api/missions/${encodeURIComponent(selectedMission.id)}/close-out`,
        );
        state.missionCloseOut = closeOutPayload.missionCloseOut || null;
        if (state.missionCloseOut) {
          const learningCandidatePayload = await fetchJson(
            `/api/missions/${encodeURIComponent(selectedMission.id)}/learning-candidate`,
          );
          state.missionLearningCandidate =
            learningCandidatePayload.learningCandidate || null;
          if (state.missionLearningCandidate) {
            const reviewPayload = await fetchJson(
              `/api/learning-candidates/${encodeURIComponent(state.missionLearningCandidate.id)}/review`,
            );
            state.missionLearningCandidateReview =
              reviewPayload.learningCandidateReview || null;
            if (state.missionLearningCandidateReview?.decision === 'accepted') {
              const memoryItemPayload = await fetchJson(
                `/api/learning-candidates/${encodeURIComponent(state.missionLearningCandidate.id)}/memory-item`,
              );
              state.missionMemoryItem = memoryItemPayload.memoryItem || null;
              if (state.missionMemoryItem) {
                const memoryRecallPayload = await fetchJson(
                  `/api/memory-items/${encodeURIComponent(state.missionMemoryItem.id)}/memory-recall`,
                );
                state.missionMemoryRecall = memoryRecallPayload.memoryRecall || null;
              }
            }
          }
        }
      }
    }
  }
  if (executionPlanBundle) {
    const builderWorkOrder = executionPlanBundle.workOrders.find(
      (workOrder) => workOrder.role === 'builder',
    );
    const [recoveryPayload, verificationPayload] = await Promise.all([
      fetchJson(
        `/api/execution-plans/${encodeURIComponent(executionPlanBundle.executionPlan.id)}/recovery`,
      ),
      builderWorkOrder?.acceptanceCriterionRefs?.length > 0
        ? fetchJson(
            `/api/execution-plans/${encodeURIComponent(executionPlanBundle.executionPlan.id)}/work-orders/${encodeURIComponent(builderWorkOrder.id)}/verification-status`,
          )
        : Promise.resolve({ verificationStatus: null }),
    ]);
    state.missionExecutionPlanRecovery = recoveryPayload.executionPlanRecovery || null;
    state.workOrderVerificationStatus = verificationPayload.verificationStatus || null;
  }

  if (state.missionViewMode === 'graph' && selectedMission) {
    try {
      const graphPayload = await fetchJson(
        `/api/missions/${encodeURIComponent(selectedMission.id)}/evidence-graph`,
      );
      if (state.selectedMissionId === selectedMission.id) {
        state.missionEvidenceGraph = graphPayload.missionEvidenceGraph || null;
        state.missionEvidenceGraphError = null;
        reconcileMissionGraphSelection();
      }
    } catch (error) {
      if (state.selectedMissionId === selectedMission.id) {
        state.missionEvidenceGraph = null;
        state.missionEvidenceGraphError = error.message;
      }
    }
  }
}

async function refreshData() {
  if (state.loading || state.mutating) {
    return;
  }

  state.loading = true;
  state.error = null;
  elements.refreshStatus.textContent = '런타임 상태 요약 다시 읽는 중…';

  try {
    applySnapshotPayload(await fetchJson('/api/snapshot'));
    const data = getDerived();
    ensureSelection(data);
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `최근 갱신 ${formatDate(state.payload?.generatedAt)}`;
  } catch (error) {
    state.error = error;
    render();
    elements.refreshStatus.textContent = '런타임 상태 요약 연결 실패';
  } finally {
    state.loading = false;
    render();
  }
}

function syncSelectionsFromTask(taskId, options = {}) {
  const data = getDerived();
  const task = data.taskMap.get(taskId);
  const preferredRun =
    options.preferredRunId && data.runMap.has(options.preferredRunId)
      ? data.runMap.get(options.preferredRunId)
      : null;
  const preferredArtifact =
    options.preferredArtifactId && data.artifactMap.has(options.preferredArtifactId)
      ? data.artifactMap.get(options.preferredArtifactId)
      : null;
  const preferredInboxItem =
    options.preferredInboxItemId && data.inboxItemMap.has(options.preferredInboxItemId)
      ? data.inboxItemMap.get(options.preferredInboxItemId)
      : null;
  const currentInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  state.selectedTaskId = taskId;
  state.selectionSeeded = true;

  if (preferredRun && preferredRun.taskId === taskId) {
    state.selectedRunId = preferredRun.id;
  } else if (task?.latestRunId && data.runMap.has(task.latestRunId)) {
    state.selectedRunId = task.latestRunId;
  } else {
    state.selectedRunId = null;
  }

  if (preferredArtifact && preferredArtifact.taskId === taskId) {
    state.selectedArtifactId = preferredArtifact.id;
  } else {
    const taskArtifact = getPreferredTaskArtifact(task, data);
    state.selectedArtifactId = taskArtifact?.id || null;
  }

  if (
    preferredInboxItem &&
    preferredInboxItem.taskId === taskId &&
    preferredInboxItem.status === 'pending'
  ) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else if (options.applyTaskInboxPreselect) {
    state.selectedInboxItemId = getPreferredTaskInboxItem(taskId, data)?.id || null;
  } else if (currentInboxItem && currentInboxItem.taskId === taskId) {
    state.selectedInboxItemId = currentInboxItem.id;
  } else if (preferredInboxItem && preferredInboxItem.taskId === taskId) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else {
    state.selectedInboxItemId =
      data.inboxItems.find((item) => item.taskId === taskId && item.status === 'pending')?.id ||
      data.inboxItems.find((item) => item.taskId === taskId)?.id ||
      null;
  }
}

function syncSelectionsFromMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;
  const missionChanged = state.selectedMissionId !== missionId;

  state.selectedMissionId = missionId;
  state.selectionSeeded = true;

  if (missionChanged) {
    state.missionEvidenceGraph = null;
    state.missionEvidenceGraphError = null;
    state.missionEvidenceGraphLoading = false;
    resetMissionGraphExplorer();
  }

  if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
    syncSelectionsFromTask(mission.linkedTaskId, {
      applyTaskInboxPreselect: true,
    });
    state.selectedMissionId = missionId;
  }
}

function prepareNextMissionDraft(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  state.surface = 'mission';
  state.selectedMissionId = mission?.id || state.selectedMissionId;
  state.missionDraftTitle = '';
  state.missionDraftGoal = '';
  state.missionDraftConstraints = mission?.constraints || '';
  state.missionDraftDeliverableType = mission?.deliverableType || 'decision-memo';
  elements.refreshStatus.textContent = mission
    ? `미션 ${mission.id} 기준으로 다음 안건 초안을 준비했습니다`
    : '다음 안건 초안을 준비했습니다';
}

async function handleSurfaceChange(surface) {
  state.menuGroup = getNavGroupForSurface(surface);
  state.surface = surface;
  rememberSurfaceVisit(surface);
  render();
  elements.workspaceMain?.focus();
}

async function handleNavGroupChange(groupId) {
  const group = NAV_GROUPS[groupId] || NAV_GROUPS.workflows;

  state.menuGroup = groupId;

  if (!group.surfaces.includes(state.surface)) {
    state.surface = group.defaultSurface;
    rememberSurfaceVisit(state.surface);
  }

  render();
}

async function handleNavGroupTabKeydown(event) {
  const tab = event.target.closest('[data-nav-group-tab]');

  if (!tab) {
    return;
  }

  const currentGroupId = tab.dataset.navGroupTab;
  const currentIndex = NAV_GROUP_ORDER.indexOf(currentGroupId);

  if (currentIndex < 0) {
    return;
  }

  let targetIndex = currentIndex;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    targetIndex = (currentIndex + 1) % NAV_GROUP_ORDER.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    targetIndex = (currentIndex - 1 + NAV_GROUP_ORDER.length) % NAV_GROUP_ORDER.length;
  } else if (event.key === 'Home') {
    targetIndex = 0;
  } else if (event.key === 'End') {
    targetIndex = NAV_GROUP_ORDER.length - 1;
  } else {
    return;
  }

  event.preventDefault();

  const targetGroupId = NAV_GROUP_ORDER[targetIndex];
  await handleNavGroupChange(targetGroupId);
  elements.navGroupTabs.find((entry) => entry.dataset.navGroupTab === targetGroupId)?.focus();
}

function createCompanyMemberId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}`;
}

function addCompanyMember() {
  const name = state.companyMemberDraftName.trim();

  if (!name) {
    throw new Error('AI 에이전트 이름을 먼저 적어 주세요.');
  }

  state.companyMembers = [
    ...state.companyMembers,
    normalizeCompanyMember(
      {
        id: createCompanyMemberId(),
        name,
        role: state.companyMemberDraftRole,
        surface: state.companyMemberDraftSurface,
      },
      state.companyMembers.length,
    ),
  ];
  persistCompanyMembers();
  state.companyMemberDraftName = '';
  state.companyMemberDraftRole = 'builder';
  state.companyMemberDraftSurface = 'execution';
  elements.refreshStatus.textContent = `${name} 에이전트를 회사에 추가했습니다`;
  render();
}

function updateCompanyMember(memberId, values) {
  const targetIndex = state.companyMembers.findIndex((entry) => entry.id === memberId);

  if (targetIndex < 0) {
    throw new Error('수정할 회사 인력을 먼저 선택하세요.');
  }

  const nextMember = normalizeCompanyMember(
    {
      id: memberId,
      name: values.name,
      role: values.role,
      surface: values.surface,
    },
    targetIndex,
  );

  state.companyMembers = state.companyMembers.map((entry, index) =>
    index === targetIndex ? nextMember : entry,
  );
  persistCompanyMembers();
  elements.refreshStatus.textContent = `${nextMember.name} 배정을 저장했습니다`;
  render();
}

function removeCompanyMember(memberId) {
  const target = state.companyMembers.find((entry) => entry.id === memberId);

  if (!target) {
    throw new Error('제거할 회사 인력을 찾지 못했습니다.');
  }

  state.companyMembers = state.companyMembers.filter((entry) => entry.id !== memberId);
  persistCompanyMembers();
  elements.refreshStatus.textContent = `${target.name} 에이전트를 회사 명부에서 제거했습니다`;
  render();
}

async function handleSelection(action, id) {
  if (action === 'select-project') {
    await submitSelectProject(id);
    return;
  }

  if (action === 'select-mission') {
    await submitSelectMission(id);
    return;
  }

  if (action === 'open-council') {
    syncSelectionsFromMission(id);
    state.surface = 'council';
  }

  if (action === 'open-execution') {
    syncSelectionsFromMission(id);
    state.surface = 'execution';
  }

  if (action === 'revise-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'open-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'prepare-next-mission') {
    prepareNextMissionDraft(id);
  }

  if (action === 'select-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
  }

  if (action === 'open-taskboard-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
    state.surface = 'taskboard';
  }

  if (action === 'create-linked-task-for-mission') {
    await submitCreateLinkedTaskForMission(id);
    return;
  }

  if (action === 'draft-council-for-mission') {
    await submitDraftCouncilForMission(id);
    return;
  }

  if (action === 'start-real-council-for-mission') {
    await submitStartRealCouncilForMission(id);
    return;
  }

  if (action === 'start-provider-council-for-mission') {
    await submitStartRealCouncilForMission(id, 'real-openai-responses');
    return;
  }

  if (action === 'resume-real-council-session') {
    await submitResumeRealCouncilSession(id);
    return;
  }

  if (action === 'approve-real-council-session') {
    await submitRealCouncilDecision(id, 'approve');
    return;
  }

  if (action === 'approve-real-council-session-inert-preview') {
    await submitRealCouncilDecision(id, 'approve', 'inert-workorder-preview');
    return;
  }

  if (action === 'recompute-mission-workorder-preview') {
    await submitMissionWorkOrderPreview(id);
    return;
  }

  if (action === 'persist-mission-workorder-plan') {
    await submitMissionWorkOrderPlan(id);
    return;
  }

  if (action === 'start-sequential-workorder-plan') {
    await submitSequentialWorkOrderPlan(id);
    return;
  }

  if (action === 'request-revision-real-council-session') {
    await submitRealCouncilDecision(id, 'request-revision');
    return;
  }

  if (action === 'stop-real-council-session') {
    await submitRealCouncilDecision(id, 'stop');
    return;
  }

  if (action === 'approve-council-for-mission') {
    await submitApproveCouncilForMission(id);
    return;
  }

  if (action === 'open-advanced-ops') {
    const data = getDerived();
    const mission = data.missionMap.get(id) || null;

    if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
      syncSelectionsFromTask(mission.linkedTaskId, {
        applyTaskInboxPreselect: true,
      });
    }

    state.selectedMissionId = mission?.id || state.selectedMissionId;
    state.surface = 'taskboard';
  }

  if (action === 'select-run') {
    const data = getDerived();
    const run = data.runMap.get(id);

    state.selectedRunId = id;

    if (run) {
      const preferredArtifact = getPreferredArtifactForRun(run, data);

      syncSelectionsFromTask(run.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
      });
      state.selectedRunId = id;
    }
  }

  if (action === 'select-artifact') {
    const data = getDerived();
    const artifact = data.artifactMap.get(id);

    state.selectedArtifactId = id;

    if (artifact) {
      const preferredReleaseInboxItem =
        artifact.type === 'release-package'
          ? findPendingApprovalItemByAction(
              artifact.taskId,
              data,
              'release-ready',
              (approval) => approval.metadata?.releasePackageArtifactId === artifact.id,
            )
          : artifact.type === 'commit-result'
            ? findPendingApprovalItemByAction(
                artifact.taskId,
                data,
                'release-ready',
                (approval) => approval.metadata?.commitResultArtifactId === artifact.id,
              )
            : null;

      syncSelectionsFromTask(artifact.taskId, {
        preferredInboxItemId: preferredReleaseInboxItem?.id || null,
      });
      state.selectedArtifactId = id;
      state.selectedRunId = artifact.runId || state.selectedRunId;
    }
  }

  if (action === 'select-inbox-item') {
    const data = getDerived();
    const item = data.inboxItemMap.get(id);

    state.selectedInboxItemId = id;

    if (item) {
      const approval =
        item.kind === 'approval' && item.sourceId
          ? data.approvals.find((candidate) => candidate.id === item.sourceId) || null
          : null;
      const commitPackageArtifactId =
        approval?.allowedNextAction === 'commit-intent'
          ? approval.metadata?.commitPackageArtifactId || null
          : null;
      const releasePackageArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.releasePackageArtifactId || null
          : null;
      const commitResultArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.commitResultArtifactId || null
          : null;
      const commitPackageArtifact =
        commitPackageArtifactId && data.artifactMap.has(commitPackageArtifactId)
          ? data.artifactMap.get(commitPackageArtifactId)
          : null;
      const releasePackageArtifact =
        releasePackageArtifactId && data.artifactMap.has(releasePackageArtifactId)
          ? data.artifactMap.get(releasePackageArtifactId)
          : null;
      const commitResultArtifact =
        commitResultArtifactId && data.artifactMap.has(commitResultArtifactId)
          ? data.artifactMap.get(commitResultArtifactId)
          : null;
      const preferredArtifact = releasePackageArtifact || commitPackageArtifact || commitResultArtifact || null;

      syncSelectionsFromTask(item.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
        preferredRunId: preferredArtifact?.runId || null,
      });
      state.selectedInboxItemId = id;
    }
  }

  await hydrateSelectedDetails();
  render();
}

async function submitCreateProject(options = {}) {
  const name = state.projectDraftName.trim();
  const projectPath = state.projectDraftPath.trim();
  const pack = state.projectDraftPack === 'knowledge-work' ? 'knowledge-work' : 'development';
  const provider = options.forceLocalStub
    ? buildProviderPayload('local-stub', '', '')
    : buildProviderPayload(
        state.projectDraftProviderMode,
        state.projectDraftProviderModel,
        state.projectDraftProviderApiKeyVar,
      );

  if (!name) {
    throw new Error('프로젝트 이름이 필요합니다.');
  }

  if (!projectPath) {
    throw new Error('project_path가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '프로젝트를 등록하는 중…';
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      pack,
      provider,
      projectPath,
    });

    state.projectDraftName = '';
    state.projectDraftPath = '';
    state.projectDraftPack = 'development';
    state.projectDraftProviderMode = 'local-stub';
    state.projectDraftProviderModel = '';
    state.projectDraftProviderApiKeyVar = '';
    await applyProjectScopePayload(payload);
    if (options.successSurface) {
      state.surface = options.successSurface;
    }
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitUpdateProjectProvider() {
  const data = getDerived();
  const activeProject = data.activeProject;

  if (!activeProject) {
    throw new Error('프로바이더 설정을 바꾸려면 활성 프로젝트가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${activeProject.name}의 프로바이더 설정을 업데이트하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/provider-config`,
      {
        provider: buildProviderPayload(
          state.projectProviderDraftMode,
          state.projectProviderDraftModel,
          state.projectProviderDraftApiKeyVar,
        ),
      },
    );

    applySnapshotPayload(payload);
    syncProjectProviderDraft(payload.project || null);
    render();
    elements.refreshStatus.textContent = `${payload.project.name}의 프로바이더 설정을 업데이트했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedWorktree() {
  const data = getDerived();
  const activeProject = data.activeProject;
  const slug = state.linkedWorktreeDraftSlug.trim();

  if (!activeProject) {
    throw new Error('연결 워크트리를 만들려면 활성 프로젝트가 필요합니다.');
  }

  if (!slug) {
    throw new Error('연결 워크트리 슬러그가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `연결 워크트리 ${slug} 생성 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/linked-worktrees`,
      {
        slug,
      },
    );

    state.linkedWorktreeDraftSlug = '';
    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectProject(projectId) {
  const dataBefore = getDerived();

  if (!projectId || !dataBefore.snapshot.projects[projectId]) {
    throw new Error('등록된 프로젝트를 먼저 선택하세요.');
  }

  if (projectId === dataBefore.activeProject?.id) {
    return;
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `활성 프로젝트를 ${projectId}(으)로 전환하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/projects/${encodeURIComponent(projectId)}/select`);

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateMission(options = {}) {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('미션을 만들려면 활성 프로젝트가 필요합니다.');
  }

  const title = state.missionDraftTitle.trim();
  const goal = state.missionDraftGoal.trim();
  const constraints = state.missionDraftConstraints.trim();
  const deliverableType =
    data.activeProject.pack === 'knowledge-work'
      ? state.missionDraftDeliverableType || 'decision-memo'
      : '';
  const realCouncilRequested = isRealCouncilMode(options.councilMode);

  if (!title) {
    throw new Error('미션 제목이 필요합니다.');
  }

  if (!goal) {
    throw new Error('미션 목표가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '미션을 만들고 협의회를 초안 작성하는 중…';
  render();

  try {
    let payload = await postJson('/api/missions', {
      autoDraftCouncil: !realCouncilRequested,
      constraints,
      deliverableType,
      goal,
      title,
    });

    if (realCouncilRequested) {
      payload = await postJson(
        `/api/missions/${encodeURIComponent(payload.mission.id)}/council/start`,
        { mode: options.councilMode },
      );
    }

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(payload.mission.id);
    state.missionDraftTitle = '';
    state.missionDraftGoal = '';
    state.missionDraftConstraints = '';
    state.missionDraftDeliverableType = 'decision-memo';
    state.selectionSeeded = true;
    await hydrateSelectedDetails();
    // Keep the prompt-first thread authoritative after submit. Council remains an explicit deep view.
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = payload.councilSession?.id
      ? realCouncilRequested
        ? `미션 ${payload.mission.id}과 Real Council ${payload.councilSession.id}를 시작했습니다`
        : `미션 ${payload.mission.id}을 만들고 협의회 ${payload.councilSession.id}를 초안 작성했습니다`
      : `미션 ${payload.mission.id}을 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectMission(missionId) {
  const data = getDerived();

  if (!missionId || !data.missionMap.has(missionId)) {
    throw new Error('미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}을 선택하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/missions/${encodeURIComponent(missionId)}/select`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `미션 ${payload.mission.id}을 선택했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedTaskForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('연결된 태스크를 만들기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}용 연결 태스크를 만드는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/create-linked-task`,
      {},
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `연결 태스크 ${payload.task.id}를 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitDraftCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('협의회를 초안 작성하기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}의 협의회를 초안 작성하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/draft-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `협의회 ${payload.councilSession.id}를 초안 작성했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitStartRealCouncilForMission(missionId, mode = 'real-local-stub') {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('Real Council을 시작하기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}의 독립 역할 회의를 시작하는 중…`;
  render();

  try {
    state.missionWorkOrderPreview = null;
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/council/start`,
      { mode },
    );

    applySnapshotPayload(payload);
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = payload.councilSession.status === 'pending-alignment'
      ? `Real Council ${payload.councilSession.id}가 사람 결정을 기다립니다`
      : payload.councilSession.status === 'failed'
        ? `Real Council ${payload.councilSession.id}의 provider failure evidence가 기록됐습니다`
        : payload.councilSession.status === 'cancelled'
          ? `Real Council ${payload.councilSession.id}가 취소됐습니다`
          : `Real Council ${payload.councilSession.id}: ${payload.councilSession.status}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitResumeRealCouncilSession(councilSessionId) {
  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Real Council ${councilSessionId}의 실패 지점을 재개하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/resume`,
      {},
    );

    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `Real Council attempt ${payload.attempt.id}를 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readMissionWorkOrderCompileSpec() {
  const readDraftValue = (selector, fallback) => {
    const element = document.querySelector(selector);
    return String(element ? element.value : fallback);
  };
  const draft = {
    targetPathAllowlist: readDraftValue(
      '#mission-workorder-target-paths',
      state.missionWorkOrderCompileDraft.targetPathAllowlist,
    ),
    expectedArtifacts: readDraftValue(
      '#mission-workorder-expected-artifacts',
      state.missionWorkOrderCompileDraft.expectedArtifacts,
    ),
    verificationCommands: readDraftValue(
      '#mission-workorder-verification-commands',
      state.missionWorkOrderCompileDraft.verificationCommands,
    ),
    stopConditions: readDraftValue(
      '#mission-workorder-stop-conditions',
      state.missionWorkOrderCompileDraft.stopConditions,
    ),
  };
  state.missionWorkOrderCompileDraft = draft;

  const compileSpec = Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [key, parseMissionWorkOrderCompileList(value)]),
  );
  const missingField = Object.entries(compileSpec).find(([, value]) => value.length === 0)?.[0];
  if (missingField) {
    throw new Error(`WorkOrder compileSpec ${missingField} 항목이 필요합니다.`);
  }

  return compileSpec;
}

async function submitMissionWorkOrderPreview(councilSessionId) {
  const compileSpec = readMissionWorkOrderCompileSpec();

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `WorkOrder preview를 다시 계산하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/work-order-preview`,
      { compileSpec },
    );

    applySnapshotPayload(payload);
    state.missionWorkOrderPreview = payload.missionWorkOrderPreview || null;
    syncSelectionsFromMission(payload.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `${payload.missionWorkOrderPreview.previewId}를 응답 메모리에 다시 계산했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitMissionWorkOrderPlan(councilSessionId) {
  const preview = state.missionWorkOrderPreview;
  const summary = getMissionWorkOrderPreviewSummary(preview, councilSessionId);
  if (!summary) {
    throw new Error('먼저 source-current WorkOrder preview를 계산해야 합니다.');
  }
  const compileSpec = readMissionWorkOrderCompileSpec();

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `ExecutionPlan ${summary.executionPlanId}을 저장하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/work-order-plans`,
      {
        compileSpec,
        previewId: preview.previewId,
        sourceDigest: preview.sourceDigest,
      },
    );
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `${payload.executionPlanBundle.executionPlan.id}을 승인 대기 상태로 저장했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function previewWorkOrderVerificationPlan(executionPlanId, workOrderId) {
  const snapshot = getActivePayload().snapshot || {};
  const executionPlan = snapshot.executionPlans?.[executionPlanId] || null;
  const workOrder = snapshot.workOrders?.[workOrderId] || null;
  if (
    !executionPlan ||
    !workOrder ||
    workOrder.executionPlanId !== executionPlan.id ||
    !executionPlan.workOrderIds?.includes(workOrder.id)
  ) {
    throw new Error('현재 ExecutionPlan에 속한 exact WorkOrder가 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  state.workOrderVerificationPlanPreview = null;
  elements.refreshStatus.textContent = `${workOrder.id} 검증 기준을 계산하는 중…`;
  render();

  try {
    const [executionPlanDigest, workOrderDigest] = await Promise.all([
      computeExecutionPlanRecordDigest(executionPlan),
      computeWorkOrderRecordDigest(workOrder),
    ]);
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/work-orders/${encodeURIComponent(workOrder.id)}/verification-plan-preview`,
      {
        executionPlanDigest,
        workOrderDigest,
        sourceDigest: executionPlan.sourceDigest,
        evaluatedAt: new Date().toISOString(),
      },
    );
    state.workOrderVerificationPlanPreview =
      payload.workOrderVerificationPlanPreview || null;
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent =
      `${payload.workOrderVerificationPlanPreview.id}를 response-only로 계산했습니다`;
  } catch (error) {
    state.workOrderVerificationPlanPreview = null;
    throw error;
  } finally {
    state.mutating = false;
    render();
  }
}

function getWorkOrderProofDraft(acceptanceCriterionId) {
  return state.workOrderProofDrafts[acceptanceCriterionId] || {
    rationale: '',
    status: 'passed',
  };
}

async function persistWorkOrderAcceptanceCriteria(executionPlanId, workOrderId) {
  const preview = state.workOrderVerificationPlanPreview;
  if (
    !preview ||
    preview.executionPlanId !== executionPlanId ||
    preview.workOrderId !== workOrderId
  ) {
    throw new Error('현재 WorkOrder의 exact verification preview가 필요합니다.');
  }
  const rationale = state.workOrderAcceptanceCriteriaRationale.trim();
  if (!rationale) throw new Error('검증 기준을 durable record로 남기는 이유를 입력해야 합니다.');

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${workOrderId} 검증 기준을 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/work-orders/${encodeURIComponent(workOrderId)}/acceptance-criteria`,
      {
        evaluatedAt: preview.evaluatedAt,
        executionPlanDigest: preview.executionPlanDigest,
        persistenceApproval: {
          decision: 'persist',
          acknowledgement: 'reviewed-workorder-verification-plan-for-durable-criteria',
          rationale,
          reviewedAt: new Date().toISOString(),
        },
        previewDigest: preview.previewDigest,
        previewId: preview.id,
        sourceDigest: preview.sourceDigest,
        workOrderDigest: preview.workOrderDigest,
      },
    );
    applySnapshotPayload(payload);
    state.workOrderVerificationPlanPreview = null;
    state.workOrderAcceptanceCriteriaRationale = '';
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent = `${payload.mutation.criterionIds.length}개 AcceptanceCriterion을 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitWorkOrderVerificationProof(
  executionPlanId,
  workOrderId,
  acceptanceCriterionId,
  commandMode,
) {
  const snapshot = getActivePayload().snapshot || {};
  const executionPlan = snapshot.executionPlans?.[executionPlanId] || null;
  const workOrder = snapshot.workOrders?.[workOrderId] || null;
  const criterion = snapshot.acceptanceCriteria?.[acceptanceCriterionId] || null;
  if (
    !executionPlan ||
    !workOrder ||
    !criterion ||
    criterion.executionPlanId !== executionPlan.id ||
    criterion.workOrderId !== workOrder.id ||
    !workOrder.acceptanceCriterionRefs?.includes(criterion.id)
  ) {
    throw new Error('현재 Builder WorkOrder에 속한 exact AcceptanceCriterion이 필요합니다.');
  }
  const draft = getWorkOrderProofDraft(acceptanceCriterionId);
  const rationale = draft.rationale.trim();
  if (!rationale) throw new Error('현재 evidence를 판단한 이유를 입력해야 합니다.');

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${criterion.id} 증빙을 ${commandMode ? '실행' : '기록'}하는 중…`;
  render();

  try {
    const workOrderDigest = await computeWorkOrderRecordDigest(workOrder);
    const proofApproval = {
      decision: 'record-proof',
      acknowledgement: 'reviewed-current-workorder-evidence-for-verification-proof',
      rationale,
      reviewedAt: new Date().toISOString(),
    };
    const endpoint = commandMode
      ? `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/work-orders/${encodeURIComponent(workOrder.id)}/acceptance-criteria/${encodeURIComponent(criterion.id)}/run-node-check`
      : `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/work-orders/${encodeURIComponent(workOrder.id)}/acceptance-criteria/${encodeURIComponent(criterion.id)}/proofs`;
    const body = commandMode
      ? {
          criterionRecordDigest: criterion.recordDigest,
          proofApproval,
          sourceDigest: executionPlan.sourceDigest,
          workOrderDigest,
        }
      : {
          criterionRecordDigest: criterion.recordDigest,
          evidenceArtifactIds: [...workOrder.artifactRefs],
          proofApproval,
          sourceDigest: executionPlan.sourceDigest,
          status: draft.status === 'failed' ? 'failed' : 'passed',
          workOrderDigest,
        };
    const payload = await postJson(endpoint, body);
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent = `${payload.mutation.proofId}를 append-only evidence로 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSequentialWorkOrderPlan(executionPlanId) {
  const snapshot = getActivePayload().snapshot || {};
  const executionPlan = snapshot.executionPlans?.[executionPlanId] || null;
  if (!executionPlan) throw new Error(`ExecutionPlan ${executionPlanId}을 찾을 수 없습니다.`);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `ExecutionPlan ${executionPlanId}의 Builder를 시작하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/start-sequential`,
      { approvalId: executionPlan.approvalId },
    );
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `Builder WorkOrder가 ${payload.mutation.autoChain.stoppedAt}에서 멈췄습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitReviewedDeliveryContinuation(executionPlanId) {
  const data = getDerived();
  const executionPlan = data.snapshot.executionPlans?.[executionPlanId] || null;
  if (!executionPlan) throw new Error(`ExecutionPlan ${executionPlanId}을 찾을 수 없습니다.`);
  const councilSession = data.councilSessionMap.get(executionPlan.councilSessionId) || null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const summary = getMissionReviewedDeliverySummary(bundle);
  if (!summary?.canContinue) {
    throw new Error('정확히 승인된 Builder terminal gate가 있어야 검토와 QA를 이어갈 수 있습니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `ExecutionPlan ${executionPlanId}의 검토·QA를 실행하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/continue-reviewed-delivery`,
      {
        terminalGateApprovalId: summary.terminalGateApprovalId,
        sourceDigest: executionPlan.sourceDigest,
      },
    );
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = payload.deliveryPackagePreview ? 'deliverables' : 'council';
    render();
    elements.refreshStatus.textContent = payload.deliveryPackagePreview
      ? `${payload.deliveryPackagePreview.id}를 response-only로 준비했습니다`
      : `ExecutionPlan이 ${payload.mutation.stoppedAt || 'reviewer'}에서 멈췄습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function persistDeliveryPackage(executionPlanId) {
  const data = getDerived();
  const executionPlan = data.snapshot.executionPlans?.[executionPlanId] || null;
  const councilSession = executionPlan
    ? data.councilSessionMap.get(executionPlan.councilSessionId) || null
    : null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const preview = state.missionDeliveryPackagePreview;
  const summary = getMissionDeliveryPackagePersistenceSummary(
    preview,
    bundle,
    state.missionDurableDeliveryPackage,
  );
  if (!summary?.canPersist) {
    throw new Error('현재 preview와 terminal checkpoint의 exact tuple만 기록할 수 있습니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${preview.id}를 durable record로 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/persist-delivery-package`,
      {
        previewId: preview.id,
        sourceDigest: preview.sourceDigest,
        packageDigest: preview.packageDigest,
        checkpointId: preview.terminalCheckpointId,
        checkpointDigest: preview.terminalCheckpointDigest,
      },
    );
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent = `${payload.durableDeliveryPackage.id}를 review-required로 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function acceptDeliveryPackage(deliveryPackageId) {
  const data = getDerived();
  const deliveryPackage = state.missionDurableDeliveryPackage;
  const executionPlan = deliveryPackage
    ? data.snapshot.executionPlans?.[deliveryPackage.executionPlanId] || null
    : null;
  const councilSession = executionPlan
    ? data.councilSessionMap.get(executionPlan.councilSessionId) || null
    : null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const preview = state.missionDeliveryPackagePreview;
  const summary = getMissionDeliveryPackageAcceptanceSummary(
    preview,
    bundle,
    deliveryPackage,
    state.missionDeliveryPackageAcceptance,
  );
  if (!summary?.canAccept || deliveryPackage?.id !== deliveryPackageId) {
    throw new Error('현재 package와 terminal checkpoint의 exact tuple만 승인할 수 있습니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${deliveryPackage.id} 승인 evidence를 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      {
        previewId: deliveryPackage.previewId,
        sourceDigest: deliveryPackage.sourceDigest,
        packageDigest: deliveryPackage.packageDigest,
        checkpointId: deliveryPackage.terminalCheckpointId,
        checkpointDigest: deliveryPackage.terminalCheckpointDigest,
        decision: 'accept',
      },
    );
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent = `${payload.deliveryPackageAcceptance.id} 승인 evidence를 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function closeOutAiCompanyMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;
  const deliveryPackage = state.missionDurableDeliveryPackage;
  const executionPlan = deliveryPackage
    ? data.snapshot.executionPlans?.[deliveryPackage.executionPlanId] || null
    : null;
  const councilSession = executionPlan
    ? data.councilSessionMap.get(executionPlan.councilSessionId) || null
    : null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const acceptance = state.missionDeliveryPackageAcceptance;
  const summary = getMissionCloseOutSummary(
    mission,
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
    state.missionCloseOut,
  );
  if (!summary?.canCloseOut) {
    throw new Error('현재 accepted package와 Mission/task evidence만 종료할 수 있습니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${mission.id} close-out evidence를 기록하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/missions/${encodeURIComponent(mission.id)}/close-out`, {
      linkedTaskId: bundle.controlTask.id,
      executionPlanId: bundle.executionPlan.id,
      deliveryPackageId: deliveryPackage.id,
      deliveryPackageAcceptanceId: acceptance.id,
      previewId: deliveryPackage.previewId,
      sourceDigest: deliveryPackage.sourceDigest,
      packageDigest: deliveryPackage.packageDigest,
      acceptanceDigest: acceptance.acceptanceDigest,
      checkpointId: deliveryPackage.terminalCheckpointId,
      checkpointDigest: deliveryPackage.terminalCheckpointDigest,
      decision: 'close-out',
    });
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent = `${payload.missionCloseOut.id} Mission/task close-out을 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readMissionLearningCandidateDraft(form) {
  const formData = new FormData(form);
  const draft = {
    lesson: String(formData.get('lesson') || ''),
    applicabilitySummary: String(formData.get('applicabilitySummary') || ''),
    targetPathAllowlist: String(formData.get('targetPathAllowlist') || ''),
    verificationCommands: String(formData.get('verificationCommands') || ''),
    negativeEvidence: String(formData.get('negativeEvidence') || ''),
    expiresAt: String(formData.get('expiresAt') || ''),
    redactionAcknowledgement: String(
      formData.get('redactionAcknowledgement') || '',
    ),
  };
  state.missionLearningCandidateDraft = draft;

  const targetPathAllowlist = parseMissionWorkOrderCompileList(
    draft.targetPathAllowlist,
  );
  const verificationCommands = parseMissionWorkOrderCompileList(
    draft.verificationCommands,
  );
  const negativeEvidence = parseMissionWorkOrderCompileList(
    draft.negativeEvidence,
  ).map((entry, index) => {
    const separatorIndex = entry.indexOf('::');
    if (separatorIndex < 1) {
      throw new Error(
        `Negative evidence ${index + 1}은 sourceEvidenceRef :: statement 형식이어야 합니다.`,
      );
    }
    return {
      sourceEvidenceRef: entry.slice(0, separatorIndex).trim(),
      statement: entry.slice(separatorIndex + 2).trim(),
    };
  });

  return {
    lesson: draft.lesson,
    applicabilitySummary: draft.applicabilitySummary,
    targetPathAllowlist,
    verificationCommands,
    negativeEvidence,
    expiresAt: draft.expiresAt,
    redactionAcknowledgement: draft.redactionAcknowledgement,
  };
}

async function previewMissionLearningCandidate(actionButton) {
  const form = actionButton?.closest?.('[data-form="preview-learning-candidate"]');
  const missionId = String(actionButton?.dataset.id || '').trim();
  if (!form || !missionId) {
    throw new Error('LearningCandidate preview form을 찾을 수 없습니다.');
  }

  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;
  const deliveryPackage = state.missionDurableDeliveryPackage;
  const acceptance = state.missionDeliveryPackageAcceptance;
  const missionCloseOut = state.missionCloseOut;
  const executionPlan = deliveryPackage
    ? data.snapshot.executionPlans?.[deliveryPackage.executionPlanId] || null
    : null;
  const councilSession = executionPlan
    ? data.councilSessionMap.get(executionPlan.councilSessionId) || null
    : null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const summary = getMissionLearningCandidatePreviewSummary(
    mission,
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
    missionCloseOut,
  );
  if (!summary?.available) {
    throw new Error('현재 terminal Mission evidence로 학습 후보를 계산할 수 없습니다.');
  }
  const retrospectiveSpec = readMissionLearningCandidateDraft(form);

  state.error = null;
  state.mutating = true;
  state.missionLearningCandidatePreview = null;
  elements.refreshStatus.textContent = `${mission.id} 학습 후보를 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/learning-candidate-preview`,
      {
        ...summary.source,
        retrospectiveSpec,
      },
    );
    state.missionLearningCandidatePreview = payload.learningCandidatePreview || null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.learningCandidatePreview.previewId}를 response-only로 계산했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function persistMissionLearningCandidate(actionButton) {
  const form = actionButton?.closest?.('[data-form="preview-learning-candidate"]');
  const missionId = String(actionButton?.dataset.id || '').trim();
  const preview = state.missionLearningCandidatePreview;
  if (!form || !missionId || !preview) {
    throw new Error('기록할 current LearningCandidate preview가 없습니다.');
  }

  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;
  const deliveryPackage = state.missionDurableDeliveryPackage;
  const acceptance = state.missionDeliveryPackageAcceptance;
  const missionCloseOut = state.missionCloseOut;
  const executionPlan = deliveryPackage
    ? data.snapshot.executionPlans?.[deliveryPackage.executionPlanId] || null
    : null;
  const councilSession = executionPlan
    ? data.councilSessionMap.get(executionPlan.councilSessionId) || null
    : null;
  const bundle = getMissionExecutionPlanBundle(data.snapshot, councilSession?.id);
  const sourceSummary = getMissionLearningCandidatePreviewSummary(
    mission,
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
    missionCloseOut,
  );
  const persistenceSummary = getMissionLearningCandidatePersistenceSummary(
    preview,
    state.missionLearningCandidate,
    missionId,
  );
  if (!sourceSummary?.available || !persistenceSummary.canPersist) {
    throw new Error('현재 preview는 만료되었거나 durable 기록 조건과 일치하지 않습니다.');
  }

  const retrospectiveSpec = readMissionLearningCandidateDraft(form);
  const { previewId: sourceDeliveryPreviewId, ...sourceTuple } = sourceSummary.source;
  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${missionId} 학습 후보를 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/persist-learning-candidate`,
      {
        ...sourceTuple,
        sourceDeliveryPreviewId,
        retrospectiveSpec,
        previewId: preview.previewId,
        candidateDigest: preview.candidateDigest,
        decision: 'persist',
      },
    );
    state.missionLearningCandidate = payload.learningCandidate || null;
    state.missionLearningCandidatePreview = payload.learningCandidatePreview || preview;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.learningCandidate.id} review-required 기록을 보존했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readLearningCandidateReviewDraft(form) {
  const formData = new FormData(form);
  const draft = {
    decision: String(formData.get('decision') || ''),
    rationale: String(formData.get('rationale') || ''),
    evidenceRefs: formData.getAll('evidenceRefs').map((value) => String(value)),
    reviewerAcknowledgement: String(
      formData.get('reviewerAcknowledgement') || '',
    ),
  };
  state.missionLearningCandidateReviewDraft = draft;
  return draft;
}

async function reviewLearningCandidate(actionButton) {
  const form = actionButton?.closest?.('[data-form="review-learning-candidate"]');
  const learningCandidateId = String(actionButton?.dataset.id || '').trim();
  const candidate = state.missionLearningCandidate;
  if (!form || !candidate || candidate.id !== learningCandidateId) {
    throw new Error('검토할 current LearningCandidate를 찾을 수 없습니다.');
  }
  const summary = getLearningCandidateReviewSummary(
    candidate,
    state.missionLearningCandidateReview,
    candidate.sourceMissionId,
  );
  if (!summary.canReview) {
    throw new Error('현재 LearningCandidate는 만료되었거나 이미 검토되었습니다.');
  }
  const reviewSpec = readLearningCandidateReviewDraft(form);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${candidate.id} 검토 결과를 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      {
        previewId: candidate.previewId,
        candidateDigest: candidate.candidateDigest,
        candidateRecordDigest: candidate.recordDigest,
        ...reviewSpec,
      },
    );
    state.missionLearningCandidate = payload.learningCandidate || candidate;
    state.missionLearningCandidateReview =
      payload.learningCandidateReview || null;
    state.missionMemoryCandidatePreview = null;
    state.missionMemoryItem = null;
    state.missionMemoryRecallPreview = null;
    state.missionMemoryRecall = null;
    state.missionMemoryContextPreview = null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.learningCandidateReview.id} ${payload.learningCandidateReview.decision} 검토를 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readMemoryCandidateDraft(form) {
  const formData = new FormData(form);
  const draft = {
    summary: String(formData.get('summary') || ''),
    applicabilitySummary: String(formData.get('applicabilitySummary') || ''),
    targetPathAllowlist: String(formData.get('targetPathAllowlist') || ''),
    verificationCommands: String(formData.get('verificationCommands') || ''),
    evidenceRefs: String(formData.get('evidenceRefs') || ''),
    negativeEvidenceRefs: String(formData.get('negativeEvidenceRefs') || ''),
    redactionRefs: String(formData.get('redactionRefs') || ''),
    reviewRefs: String(formData.get('reviewRefs') || ''),
    expiresAt: String(formData.get('expiresAt') || ''),
    workspaceProjectId: String(formData.get('workspaceProjectId') || ''),
    redactionAcknowledgement: String(
      formData.get('redactionAcknowledgement') || '',
    ),
    nonPersistenceStatement: String(
      formData.get('nonPersistenceStatement') || '',
    ),
  };
  state.missionMemoryCandidateDraft = draft;
  return {
    summary: draft.summary,
    workspaceScope: {
      projectId: draft.workspaceProjectId,
    },
    applicability: {
      summary: draft.applicabilitySummary,
      targetPathAllowlist: parseMissionWorkOrderCompileList(
        draft.targetPathAllowlist,
      ),
      verificationCommands: parseMissionWorkOrderCompileList(
        draft.verificationCommands,
      ),
    },
    evidenceRefs: parseMissionWorkOrderCompileList(draft.evidenceRefs),
    negativeEvidenceRefs: parseMissionWorkOrderCompileList(
      draft.negativeEvidenceRefs,
    ),
    redactionRefs: parseMissionWorkOrderCompileList(draft.redactionRefs),
    reviewRefs: parseMissionWorkOrderCompileList(draft.reviewRefs),
    expiresAt: draft.expiresAt,
    redactionAcknowledgement: draft.redactionAcknowledgement,
    nonPersistenceStatement: draft.nonPersistenceStatement,
  };
}

async function previewLearningCandidateMemory(actionButton) {
  const form = actionButton?.closest?.('[data-form="preview-memory-candidate"]');
  const learningCandidateId = String(actionButton?.dataset.id || '').trim();
  const candidate = state.missionLearningCandidate;
  const review = state.missionLearningCandidateReview;
  if (
    !form ||
    !candidate ||
    candidate.id !== learningCandidateId ||
    !review
  ) {
    throw new Error('MemoryCandidate preview source evidence를 찾을 수 없습니다.');
  }
  const summary = getMemoryCandidatePreviewSummary(
    candidate,
    review,
    candidate.sourceMissionId,
  );
  if (!summary?.canPreview) {
    throw new Error('accepted current LearningCandidate review만 memory readiness로 계산할 수 있습니다.');
  }
  const memorySpec = readMemoryCandidateDraft(form);

  state.error = null;
  state.mutating = true;
  state.missionMemoryCandidatePreview = null;
  elements.refreshStatus.textContent =
    `${candidate.id} memory readiness를 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/memory-candidate-preview`,
      {
        ...summary.source,
        evaluatedAt: new Date().toISOString(),
        memorySpec,
      },
    );
    state.missionMemoryCandidatePreview =
      payload.memoryCandidatePreview || null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.memoryCandidatePreview.id}를 response-only로 계산했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function persistLearningCandidateMemoryItem(actionButton) {
  const panel = actionButton?.closest?.('.memory-candidate-panel');
  const previewForm = panel?.querySelector?.('[data-form="preview-memory-candidate"]');
  const storageForm = actionButton?.closest?.('[data-form="persist-memory-item"]');
  const candidate = state.missionLearningCandidate;
  const review = state.missionLearningCandidateReview;
  const preview = state.missionMemoryCandidatePreview;
  const summary = getMemoryItemPersistenceSummary(
    preview,
    state.missionMemoryItem,
    candidate,
    review,
    candidate?.sourceMissionId,
  );
  if (!previewForm || !storageForm || !candidate || !review || !summary?.canPersist) {
    throw new Error('저장할 exact current MemoryCandidate preview가 없습니다.');
  }
  const storageFormData = new FormData(storageForm);
  const storageApproval = {
    decision: 'store',
    acknowledgement: String(storageFormData.get('acknowledgement') || ''),
    rationale: String(storageFormData.get('rationale') || ''),
    reviewedAt: new Date().toISOString(),
  };
  state.missionMemoryItemStorageDraft = {
    rationale: storageApproval.rationale,
    acknowledgement: storageApproval.acknowledgement,
  };
  const memorySpec = readMemoryCandidateDraft(previewForm);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${preview.id} storage approval을 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/persist-memory-item`,
      {
        learningCandidateReviewId: review.id,
        previewId: candidate.previewId,
        candidateDigest: candidate.candidateDigest,
        candidateRecordDigest: candidate.recordDigest,
        reviewDigest: review.reviewDigest,
        evaluatedAt: preview.evaluatedAt,
        memorySpec,
        memoryCandidatePreviewId: preview.id,
        memoryCandidatePreviewDigest: preview.previewDigest,
        storageApproval,
      },
    );
    state.missionMemoryCandidatePreview = payload.memoryCandidatePreview || preview;
    state.missionMemoryItem = payload.memoryItem || null;
    state.missionMemoryRecallPreview = null;
    state.missionMemoryRecall = null;
    state.missionMemoryContextPreview = null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.memoryItem.id}를 project-local stored evidence로 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readMemoryRecallDraft(form) {
  const formData = new FormData(form);
  const draft = {
    purpose: String(formData.get('purpose') || ''),
    applicabilitySummary: String(formData.get('applicabilitySummary') || ''),
    targetPathAllowlist: String(formData.get('targetPathAllowlist') || ''),
    verificationCommands: String(formData.get('verificationCommands') || ''),
    evidenceRefs: String(formData.get('evidenceRefs') || ''),
    negativeEvidenceRefs: String(formData.get('negativeEvidenceRefs') || ''),
    redactionRefs: String(formData.get('redactionRefs') || ''),
    reviewRefs: String(formData.get('reviewRefs') || ''),
    workspaceProjectId: String(formData.get('workspaceProjectId') || ''),
    acknowledgement: String(formData.get('acknowledgement') || ''),
    nonApplicationStatement: String(
      formData.get('nonApplicationStatement') || '',
    ),
  };
  state.missionMemoryRecallDraft = draft;
  return {
    purpose: draft.purpose,
    workspaceScope: { projectId: draft.workspaceProjectId },
    applicability: {
      summary: draft.applicabilitySummary,
      targetPathAllowlist: parseMissionWorkOrderCompileList(
        draft.targetPathAllowlist,
      ),
      verificationCommands: parseMissionWorkOrderCompileList(
        draft.verificationCommands,
      ),
    },
    evidenceRefs: parseMissionWorkOrderCompileList(draft.evidenceRefs),
    negativeEvidenceRefs: parseMissionWorkOrderCompileList(
      draft.negativeEvidenceRefs,
    ),
    redactionRefs: parseMissionWorkOrderCompileList(draft.redactionRefs),
    reviewRefs: parseMissionWorkOrderCompileList(draft.reviewRefs),
    acknowledgement: draft.acknowledgement,
    nonApplicationStatement: draft.nonApplicationStatement,
  };
}

async function previewMemoryItemRecall(actionButton) {
  const form = actionButton?.closest?.('[data-form="preview-memory-recall"]');
  const memoryItemId = String(actionButton?.dataset.id || '').trim();
  const item = state.missionMemoryItem;
  const candidate = state.missionLearningCandidate;
  const summary = getMemoryRecallPersistenceSummary(
    item,
    state.missionMemoryRecallPreview,
    state.missionMemoryRecall,
    candidate,
  );
  if (!form || !item || item.id !== memoryItemId || !summary?.canPreview) {
    throw new Error('recall 가능한 exact current MemoryItem을 찾을 수 없습니다.');
  }
  const recallSpec = readMemoryRecallDraft(form);

  state.error = null;
  state.mutating = true;
  state.missionMemoryRecallPreview = null;
  state.missionMemoryContextPreview = null;
  elements.refreshStatus.textContent = `${item.id} recall eligibility를 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/memory-items/${encodeURIComponent(item.id)}/recall-preview`,
      {
        memoryItemRecordDigest: item.recordDigest,
        evaluatedAt: new Date().toISOString(),
        recallSpec,
      },
    );
    state.missionMemoryRecallPreview = payload.memoryRecallPreview || null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.memoryRecallPreview.id}를 response-only로 계산했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function persistMemoryItemRecall(actionButton) {
  const panel = actionButton?.closest?.('.memory-recall-panel');
  const previewForm = panel?.querySelector?.('[data-form="preview-memory-recall"]');
  const recordForm = actionButton?.closest?.('[data-form="persist-memory-recall"]');
  const item = state.missionMemoryItem;
  const candidate = state.missionLearningCandidate;
  const preview = state.missionMemoryRecallPreview;
  const summary = getMemoryRecallPersistenceSummary(
    item,
    preview,
    state.missionMemoryRecall,
    candidate,
  );
  if (!previewForm || !recordForm || !item || !preview || !summary?.canPersist) {
    throw new Error('기록할 exact current MemoryRecall preview가 없습니다.');
  }

  const formData = new FormData(recordForm);
  const recordApproval = {
    decision: 'record',
    acknowledgement: String(formData.get('acknowledgement') || ''),
    rationale: String(formData.get('rationale') || ''),
    reviewedAt: new Date().toISOString(),
  };
  state.missionMemoryRecallRecordDraft = {
    rationale: recordApproval.rationale,
    acknowledgement: recordApproval.acknowledgement,
  };
  const recallSpec = readMemoryRecallDraft(previewForm);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${preview.id} record approval을 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/memory-items/${encodeURIComponent(item.id)}/persist-memory-recall`,
      {
        memoryItemRecordDigest: item.recordDigest,
        evaluatedAt: preview.evaluatedAt,
        recallSpec,
        memoryRecallPreviewId: preview.id,
        memoryRecallPreviewDigest: preview.previewDigest,
        recordApproval,
      },
    );
    state.missionMemoryRecallPreview = payload.memoryRecallPreview || preview;
    state.missionMemoryRecall = payload.memoryRecall || null;
    state.missionMemoryContextPreview = null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.memoryRecall.id}를 project-local recorded evidence로 기록했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function readMissionMemoryContextDraft(form) {
  const formData = new FormData(form);
  const draft = {
    targetMissionId: String(formData.get('targetMissionId') || ''),
    purpose: String(formData.get('purpose') || ''),
    applicabilitySummary: String(formData.get('applicabilitySummary') || ''),
    targetPathAllowlist: String(formData.get('targetPathAllowlist') || ''),
    verificationCommands: String(formData.get('verificationCommands') || ''),
    evidenceRefs: String(formData.get('evidenceRefs') || ''),
    negativeEvidenceRefs: String(formData.get('negativeEvidenceRefs') || ''),
    redactionRefs: String(formData.get('redactionRefs') || ''),
    reviewRefs: String(formData.get('reviewRefs') || ''),
    workspaceProjectId: String(formData.get('workspaceProjectId') || ''),
    acknowledgement: String(formData.get('acknowledgement') || ''),
    nonInjectionStatement: String(formData.get('nonInjectionStatement') || ''),
  };
  state.missionMemoryContextDraft = draft;
  return {
    purpose: draft.purpose,
    workspaceScope: { projectId: draft.workspaceProjectId },
    applicability: {
      summary: draft.applicabilitySummary,
      targetPathAllowlist: parseMissionWorkOrderCompileList(
        draft.targetPathAllowlist,
      ),
      verificationCommands: parseMissionWorkOrderCompileList(
        draft.verificationCommands,
      ),
    },
    evidenceRefs: parseMissionWorkOrderCompileList(draft.evidenceRefs),
    negativeEvidenceRefs: parseMissionWorkOrderCompileList(
      draft.negativeEvidenceRefs,
    ),
    redactionRefs: parseMissionWorkOrderCompileList(draft.redactionRefs),
    reviewRefs: parseMissionWorkOrderCompileList(draft.reviewRefs),
    acknowledgement: draft.acknowledgement,
    nonInjectionStatement: draft.nonInjectionStatement,
  };
}

async function previewMissionMemoryContext(actionButton) {
  const form = actionButton?.closest?.(
    '[data-form="preview-mission-memory-context"]',
  );
  const memoryRecallId = String(actionButton?.dataset.id || '').trim();
  const memoryItem = state.missionMemoryItem;
  const memoryRecall = state.missionMemoryRecall;
  if (!form) {
    throw new Error('MissionMemoryContext preview form을 찾을 수 없습니다.');
  }
  const targetMissionId = String(
    new FormData(form).get('targetMissionId') || '',
  ).trim();
  const targetMission =
    state.payload?.snapshot?.missions?.[targetMissionId] || null;
  const summary = getMissionMemoryContextPreviewSummary(
    memoryItem,
    memoryRecall,
    targetMission,
    state.missionMemoryContextPreview,
  );
  if (
    !memoryItem ||
    !memoryRecall ||
    memoryRecall.id !== memoryRecallId ||
    !summary?.canPreview
  ) {
    throw new Error(
      '같은 project의 exact current draft Mission과 recorded MemoryRecall이 필요합니다.',
    );
  }
  const contextSpec = readMissionMemoryContextDraft(form);
  const targetMissionDigest = await computeMissionMemoryContextTargetDigest(
    targetMission,
  );

  state.error = null;
  state.mutating = true;
  state.missionMemoryContextPreview = null;
  elements.refreshStatus.textContent =
    `${memoryRecall.id}와 ${targetMission.id}의 context boundary를 검증하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(targetMission.id)}/memory-context-preview`,
      {
        memoryRecallId: memoryRecall.id,
        memoryRecallRecordDigest: memoryRecall.recordDigest,
        memoryItemId: memoryItem.id,
        memoryItemRecordDigest: memoryItem.recordDigest,
        targetMissionDigest,
        evaluatedAt: new Date().toISOString(),
        contextSpec,
      },
    );
    state.missionMemoryContextPreview =
      payload.missionMemoryContextPreview || null;
    state.surface = 'deliverables';
    render();
    elements.refreshStatus.textContent =
      `${payload.missionMemoryContextPreview.id}를 response-only로 계산했습니다`;
  } catch (error) {
    state.missionMemoryContextPreview = null;
    throw error;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitWorkflowCheckpointAction(executionPlanId, action) {
  const recovery = state.missionExecutionPlanRecovery;
  const summary = getMissionWorkflowCheckpointSummary(recovery, executionPlanId);
  if (!summary?.checkpoint) {
    throw new Error('현재 ExecutionPlan의 WorkflowCheckpoint를 찾을 수 없습니다.');
  }
  if (action === 'cancel' ? !summary.canCancel : !summary.canResume || summary.action !== action) {
    throw new Error('현재 source와 authority에 맞는 checkpoint action만 실행할 수 있습니다.');
  }

  const checkpoint = summary.checkpoint;
  const continuationPreview = state.executionContinuationPreview;
  if (
    action !== 'cancel' &&
    (!continuationPreview ||
      continuationPreview.status !== 'continuation-ready' ||
      continuationPreview.executionPlanId !== executionPlanId ||
      continuationPreview.nextStep?.checkpointId !== checkpoint.id ||
      continuationPreview.nextStep?.action !== action ||
      continuationPreview.progressEvidence?.checkpointDigest !== checkpoint.checkpointDigest)
  ) {
    throw new Error('현재 checkpoint에 대한 bounded continuation preview가 먼저 필요합니다.');
  }
  const body = {
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
  };
  const endpoint =
    action === 'cancel'
      ? `/api/execution-plans/${encodeURIComponent(executionPlanId)}/cancel-checkpoint`
      : `/api/execution-plans/${encodeURIComponent(executionPlanId)}/resume-from-checkpoint`;
  if (action !== 'cancel') body.action = action;
  if (action === 'cancel') body.reason = `operator-cancelled:${checkpoint.id}`;

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent =
    action === 'cancel'
      ? `${checkpoint.id} 취소를 기록하는 중…`
      : `${checkpoint.id}에서 ${action} 실행 중…`;
  render();

  try {
    const payload = await postJson(endpoint, body);
    state.executionContinuationPreview = null;
    applySnapshotPayload(payload);
    syncSelectionsFromMission(payload.executionPlanBundle.mission.id);
    await hydrateSelectedDetails();
    state.surface = payload.deliveryPackagePreview ? 'deliverables' : 'council';
    render();
    elements.refreshStatus.textContent =
      action === 'cancel'
        ? `${checkpoint.id} 취소 이력을 보존했습니다`
        : `${payload.mutation.resumedStage || action} 실행 후 ${payload.mutation.stoppedAt}에서 멈췄습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function previewExecutionPlanContinuation(executionPlanId) {
  const recovery = state.missionExecutionPlanRecovery;
  const summary = getMissionWorkflowCheckpointSummary(recovery, executionPlanId);
  if (!summary?.checkpoint || !summary.canResume || !summary.action) {
    throw new Error('현재 source와 authority에 맞는 checkpoint만 검토할 수 있습니다.');
  }
  const checkpoint = summary.checkpoint;
  const evaluatedAt = new Date().toISOString();
  const deadlineAt = new Date(Date.parse(evaluatedAt) + 5 * 60 * 1000).toISOString();

  state.error = null;
  state.mutating = true;
  state.executionContinuationPreview = null;
  elements.refreshStatus.textContent = `${checkpoint.id}의 다음 한 단계를 검토하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/continuation-preview`,
      {
        checkpointId: checkpoint.id,
        checkpointDigest: checkpoint.checkpointDigest,
        inputDigest: checkpoint.inputDigest,
        authorityDigest: checkpoint.authorityDigest,
        action: summary.action,
        evaluatedAt,
        continuationSpec: {
          cancellationRequested: false,
          deadlineAt,
          maxSteps: 1,
          previousProgressDigest: null,
        },
      },
    );
    state.executionContinuationPreview = payload.executionContinuationPreview || null;
    elements.refreshStatus.textContent =
      state.executionContinuationPreview?.status === 'continuation-ready'
        ? `${checkpoint.id}의 다음 한 단계가 검토 준비됐습니다`
        : `${checkpoint.id}: ${state.executionContinuationPreview?.stopReason || 'continuation 중단'}`;
  } catch (error) {
    state.executionContinuationPreview = null;
    throw error;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitRealCouncilDecision(councilSessionId, action, handoffMode = null) {
  const body = { action };

  if (handoffMode === 'inert-workorder-preview') {
    body.handoffMode = handoffMode;
    body.compileSpec = readMissionWorkOrderCompileSpec();
  }

  if (action === 'request-revision') {
    const noteElement = document.querySelector('#real-council-revision-note');
    const targetElements = [
      ...document.querySelectorAll('input[name="real-council-revision-target"]:checked'),
    ];
    body.note = String(noteElement?.value || '').trim();
    body.targetAgentIds = targetElements.map((element) => element.value);

    if (!body.note || body.targetAgentIds.length === 0) {
      throw new Error('수정 요청에는 메모와 한 명 이상의 대상 역할이 필요합니다.');
    }
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Real Council ${councilSessionId}에 ${action} 결정을 기록하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/decision`,
      body,
    );

    applySnapshotPayload(payload);
    state.missionWorkOrderPreview = payload.missionWorkOrderPreview || null;
    syncSelectionsFromMission(payload.mission.id);
    if (payload.task?.id) {
      syncSelectionsFromTask(payload.task.id, {
        applyTaskInboxPreselect: true,
        preferredArtifactId: payload.mutation?.lastArtifactId || null,
        preferredInboxItemId: payload.item?.id || null,
        preferredRunId: payload.mutation?.lastRunId || null,
      });
    }
    await hydrateSelectedDetails();
    state.surface = action === 'approve' && handoffMode !== 'inert-workorder-preview'
      ? 'execution'
      : 'council';
    render();
    elements.refreshStatus.textContent =
      action === 'approve'
        ? handoffMode === 'inert-workorder-preview'
          ? `${payload.missionWorkOrderPreview.previewId}를 만들고 실행 연결 전에 멈췄습니다`
          : `Real Council 결론을 승인하고 ${payload.mutation?.autoChain?.stoppedAt || 'execution'}에서 멈췄습니다`
        : action === 'request-revision'
          ? `수정 attempt ${payload.attempt?.id || 'pending'}를 기록했습니다`
          : 'Real Council을 operator-stopped 상태로 닫았습니다';
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitApproveCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('협의회 추천안을 승인하기 전에 미션을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `미션 ${missionId}의 추천안을 승인하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/approve-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    if (payload.task?.id) {
      syncSelectionsFromTask(payload.task.id, {
        applyTaskInboxPreselect: true,
        preferredArtifactId:
          payload.mutation?.lastArtifactId || payload.approval?.targetArtifactId || null,
        preferredInboxItemId: payload.item?.id || null,
        preferredRunId: payload.mutation?.lastRunId || null,
      });
    }
    await hydrateSelectedDetails();
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent = `미션 ${payload.mission.id}을 정렬했고 실행을 ${payload.mutation?.autoChain?.stoppedAt || 'execution'} 단계까지 진행했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateTask() {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('태스크를 만들려면 활성 프로젝트가 필요합니다.');
  }

  const title = state.taskDraftTitle.trim();
  const intent = state.taskDraftIntent.trim();

  if (!title) {
    throw new Error('태스크 제목이 필요합니다.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = '태스크를 만드는 중…';
  render();

  try {
    const payload = await postJson('/api/tasks', {
      intent,
      title,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.selectedTaskId = payload.task.id;
    state.selectedRunId = null;
    state.selectedArtifactId = null;
    state.selectedInboxItemId = null;
    state.selectedRunLogs = null;
    state.selectedArtifact = null;
    state.selectedTaskBreakdownArtifact = null;
    state.selectedTaskPreflightArtifact = null;
    state.taskDraftTitle = '';
    state.taskDraftIntent = '';
    state.selectionSeeded = true;
    state.surface = 'taskboard';
    render();
    elements.refreshStatus.textContent = `태스크 ${payload.task.id}를 만들었습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runPlanner(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('플래너 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 플래너 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `플래너 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runArchitect(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('설계 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 설계 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-architect`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `설계 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runTaskBreaker(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('태스크 분해 실행을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 태스크 분해 실행을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `태스크 분해 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderPreflight(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('사전 점검을 시작하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 사전 점검을 시작하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-preflight`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `사전 점검 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function requestBuilderLiveMutationApproval(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('builder 라이브 변경 승인을 요청하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 라이브 변경 승인을 요청하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/request-builder-live-mutation-approval`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.targetArtifactId || null,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.targetRunId || null,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `라이브 변경 승인 ${payload.mutation.approvalId}를 요청했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderLiveMutation(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('builder 라이브 변경을 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 라이브 변경을 실행하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'logs';
    render();
    elements.refreshStatus.textContent = `builder 라이브 변경 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReviewer(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('reviewer를 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 reviewer를 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-reviewer`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `reviewer 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCommitPackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('커밋 패키지를 준비하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 커밋 패키지를 준비하는 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-commit-package`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `커밋 패키지 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runLocalCommit(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('로컬 커밋을 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 로컬 커밋을 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-local-commit`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `로컬 커밋 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReleasePackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('릴리스 패키지를 준비하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 릴리스 패키지를 준비하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-release-package`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface =
      currentSurface === 'taskboard' || currentSurface === 'artifacts'
        ? currentSurface
        : 'artifacts';
    render();
    elements.refreshStatus.textContent = `릴리스 패키지 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCloseOut(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('종료 정리를 실행하기 전에 태스크를 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `태스크 ${taskId}의 종료 정리를 실행하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-close-out`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `종료 정리 실행 ${payload.mutation.runId}이 완료됐습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

function resetProjectScopeSelections() {
  state.selectedMissionId = null;
  state.selectedTaskId = null;
  state.selectedRunId = null;
  state.selectedArtifactId = null;
  state.selectedInboxItemId = null;
  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  state.selectionSeeded = false;
}

async function applyProjectScopePayload(payload) {
  applySnapshotPayload(payload);
  const data = getDerived();

  resetProjectScopeSelections();
  ensureSelection(data);
  await hydrateSelectedDetails();
  render();
}

async function updateTaskWorktreeRef(taskId, worktreeRef) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('task.worktreeRef를 바꾸기 전에 태스크를 먼저 선택하세요.');
  }

  const isClearing = worktreeRef === null;

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = isClearing
    ? `태스크 ${taskId}의 저장된 워크트리 경로를 비우는 중…`
    : `태스크 ${taskId}에 연결 워크트리를 적용하는 중…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/worktree-ref`, {
      worktreeRef,
    });

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = isClearing
      ? `태스크 ${taskId}의 저장된 워크트리 경로를 비웠습니다`
      : `태스크 ${taskId}의 저장된 워크트리 경로를 업데이트했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function applySelectedTaskWorktree(taskId) {
  const select = document.querySelector('#task-worktree-select');

  if (!select) {
    throw new Error('연결 워크트리 선택 항목이 없습니다.');
  }

  const worktreeRef = select.value.trim();

  if (!worktreeRef) {
    throw new Error('적용할 연결 워크트리를 먼저 선택하세요.');
  }

  await updateTaskWorktreeRef(taskId, worktreeRef);
}

async function clearTaskWorktree(taskId) {
  await updateTaskWorktreeRef(taskId, null);
}

async function switchActiveProjectWorktree(worktreePath) {
  const data = getDerived();
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const option =
    (activeProjectLinkedWorktrees.options || []).find((candidate) => candidate.path === worktreePath) || null;

  if (!data.activeProject) {
    throw new Error('연결 워크트리로 전환하려면 활성 프로젝트가 필요합니다.');
  }

  if (!option) {
    throw new Error('활성 프로젝트를 전환하기 전에 탐지된 연결 워크트리를 먼저 선택하세요.');
  }

  if (option.isCurrentProjectPath) {
    return;
  }

  if (option.registeredProjectId) {
    await submitSelectProject(option.registeredProjectId);
    return;
  }

  const name = option.suggestedProjectName || buildLinkedWorktreeFallbackName(option);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `연결 워크트리 ${worktreePath}를 활성 프로젝트로 등록하는 중…`;
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      projectPath: option.path,
    });

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `활성 프로젝트를 ${payload.project.name}(으)로 설정했습니다`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runInboxAction(itemId, verb) {
  const data = getDerived();
  const item = data.inboxItemMap.get(itemId);
  const previousRunId = state.selectedRunId;
  const previousArtifactId = state.selectedArtifactId;

  if (!item) {
    throw new Error('처리할 대기 결정함 항목을 먼저 선택하세요.');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${getInboxResolutionActionDisplay(verb)} ${itemId} 처리 중…`;
  render();

  try {
    const payload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(itemId)}/actions`,
      { verb },
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(payload.mutation.taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: previousArtifactId,
      preferredRunId: previousRunId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `${payload.mutation.itemId} ${getInboxResolutionActionDisplay(verb)} 완료`;
  } finally {
    state.mutating = false;
    render();
  }
}

function getSurfaceDockCount(data, surface) {
  if (surface === 'mission') {
    return data.missions.length;
  }

  if (surface === 'council') {
    return data.councilSessions.length;
  }

  if (surface === 'execution') {
    return data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  }

  if (surface === 'deliverables') {
    return data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  }

  if (surface === 'taskboard') {
    return data.tasks.length;
  }

  if (surface === 'logs') {
    return data.runs.length;
  }

  if (surface === 'artifacts') {
    return data.artifacts.length;
  }

  if (surface === 'decision-inbox') {
    return data.inboxItems.filter((item) => item.status === 'pending').length;
  }

  return 0;
}

function getExecutionDeskStatus(task) {
  return getExecutionDeskStatusBase(task, { getTaskLifecycleDisplay });
}

function getDeliverablesDeskStatus(task, artifact) {
  return getDeliverablesDeskStatusBase(task, {
    getArtifactTypeDisplay,
    getReviewStatusDisplay,
  });
}

function getCompanyFloorBoardEntries(data, navGroupId) {
  const resolvedGroupId = NAV_GROUPS[navGroupId] ? navGroupId : 'workflows';
  const selectedMission =
    data.missionMap.get(state.selectedMissionId) ||
    data.missions[0] ||
    null;
  const selectedCouncil =
    (selectedMission?.councilSessionId
      ? data.councilSessionMap.get(selectedMission.councilSessionId) || null
      : null) ||
    data.councilSessions[0] ||
    null;
  const selectedTask =
    data.taskMap.get(state.selectedTaskId) ||
    (selectedMission?.linkedTaskId ? data.taskMap.get(selectedMission.linkedTaskId) || null : null) ||
    data.tasks[0] ||
    null;
  const selectedArtifact =
    data.artifactMap.get(state.selectedArtifactId) ||
    (selectedTask ? data.artifacts.find((artifact) => artifact.taskId === selectedTask.id) || null : null) ||
    data.artifacts[0] ||
    null;
  const selectedRun =
    data.runMap.get(state.selectedRunId) ||
    (selectedTask?.latestRunId ? data.runMap.get(selectedTask.latestRunId) || null : null) ||
    data.runs[0] ||
    null;
  const selectedInboxItem =
    data.inboxItemMap.get(state.selectedInboxItemId) ||
    (selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null) ||
    data.inboxItems.find((item) => item.status === 'pending') ||
    null;
  const pendingGateCount = data.inboxItems.filter((item) => item.status === 'pending').length;
  const selectedMissionHandoff = getMissionFirstRunHandoff(selectedMission, data);

  const entries = [
    {
      surface: 'mission',
      desk: '본부 접수',
      kicker: '접수 라인',
      owner: '안건 담당',
      count: getSurfaceDockCount(data, 'mission'),
      status: selectedMission ? getMissionStatusDisplay(selectedMission.status) : '안건 대기',
      next: selectedMissionHandoff.next,
      note: selectedMission?.title || '등록된 안건이 아직 없습니다.',
    },
    {
      surface: 'council',
      desk: '회의실',
      kicker: '회의 라인',
      owner: '회의 리드',
      count: getSurfaceDockCount(data, 'council'),
      status: selectedCouncil
        ? getAlignmentStatusDisplay(selectedCouncil.alignment?.status || 'pending')
        : '회의 대기',
      next: selectedCouncil
        ? selectedCouncil.selectedPlan
          ? '권고안 확정'
          : '역할 발언 정렬'
        : '회의 초안 작성',
      note: selectedCouncil?.selectedPlan?.title || selectedMission?.title || '열린 회의 안건이 없습니다.',
    },
    {
      surface: 'execution',
      desk: '실행 셀',
      kicker: '실행 라인',
      owner: '실행 역할',
      count: getSurfaceDockCount(data, 'execution'),
      status: getExecutionDeskStatus(selectedTask),
      next: getExecutionDeskNext(selectedTask),
      note: selectedTask?.title || '배정된 실행 셀이 아직 없습니다.',
    },
    {
      surface: 'deliverables',
      desk: '보고 데스크',
      kicker: '보고 라인',
      owner: '보고 담당',
      count: getSurfaceDockCount(data, 'deliverables'),
      status: getDeliverablesDeskStatus(selectedTask, selectedArtifact),
      next: getDeliverablesDeskNext(selectedTask, selectedArtifact, pendingGateCount),
      note: selectedArtifact?.id || selectedTask?.title || '전달할 결과 패킷이 아직 없습니다.',
    },
    {
      surface: 'artifacts',
      desk: '증적 패킷',
      kicker: '증적 라인',
      owner: 'reviewer',
      count: getSurfaceDockCount(data, 'artifacts'),
      status: selectedArtifact ? getArtifactTypeDisplay(selectedArtifact.type) : '증적 대기',
      next: pendingGateCount > 0 ? '승인선 확인' : '패킷 검토',
      note: selectedArtifact?.id || selectedTask?.title || '열린 증적 패킷이 없습니다.',
    },
    {
      surface: 'logs',
      desk: '실행 로그',
      kicker: '기록 라인',
      owner: 'trace reader',
      count: getSurfaceDockCount(data, 'logs'),
      status: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedArtifact ? '증적 확인' : 'run 기록 확인',
      note: selectedRun?.id || selectedTask?.title || '열린 실행 기록이 없습니다.',
    },
    {
      surface: 'decision-inbox',
      desk: '승인선',
      kicker: '게이트 라인',
      owner: '사람 게이트',
      count: getSurfaceDockCount(data, 'decision-inbox'),
      status: pendingGateCount > 0 ? `${pendingGateCount}건 대기` : '대기 없음',
      next: pendingGateCount > 0 ? '사람 게이트 처리' : '현재 승인선 비움',
      note: selectedInboxItem?.title || '열린 승인 안건이 없습니다.',
    },
    {
      surface: 'taskboard',
      desk: '작업판',
      kicker: '운영 라인',
      owner: '실행 관제',
      count: getSurfaceDockCount(data, 'taskboard'),
      status: getExecutionDeskStatus(selectedTask),
      next: selectedTask ? '실행 셀' : '태스크 등록',
      note: selectedTask?.title || '열린 작업 셀이 없습니다.',
    },
  ];

  return entries.filter((entry) => NAV_GROUPS[resolvedGroupId].surfaces.includes(entry.surface));
}

function renderCompanyDirectory(data) {
  if (!elements.companyDirectoryShell || !elements.companyDirectorySummary) {
    return;
  }

  const activeGroupId = getActiveNavGroupId();
  const activeGroupLabel = getNavGroupLabel(activeGroupId);
  const counts = getCompanyDirectorySummary(state.companyMembers);
  const members = [...state.companyMembers];
  const groupedMembers = Object.keys(NAV_GROUPS).map((groupId) => ({
    groupId,
    label: getNavGroupLabel(groupId),
    members: getCompanyMembersForGroup(state.companyMembers, groupId),
  }));

  elements.companyDirectorySummary.innerHTML = `
    <div class="company-directory-summary-grid">
      <div class="company-directory-summary-cell">
        <span class="office-register-label">전체 인력</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(members.length))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">업무</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.workflows))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">검토</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.review))}</strong>
      </div>
      <div class="company-directory-summary-cell">
        <span class="office-register-label">운영</span>
        <strong class="company-directory-summary-value">${escapeHtml(String(counts.ops))}</strong>
      </div>
    </div>
  `;

  elements.companyDirectoryShell.innerHTML = `
    <div class="company-directory-section-list">
      ${groupedMembers
        .map(({ groupId, label, members: sectionMembers }) => {
          const isActiveGroup = groupId === activeGroupId;

          return `
            <section
              class="company-directory-section ${isActiveGroup ? 'is-active-group' : ''}"
              data-selection-state="${isActiveGroup ? 'active' : 'idle'}"
            >
              <div class="company-directory-section-head">
                <div class="company-directory-section-copy">
                  <p class="company-directory-section-label">${escapeHtml(label)}</p>
                  <strong class="company-directory-section-title">${escapeHtml(`${label} 팀`)}</strong>
                </div>
                ${createToken(`${sectionMembers.length}명`, isActiveGroup ? 'accent' : 'neutral')}
              </div>
              <div class="company-directory-list">
                ${
                  sectionMembers.length
                    ? sectionMembers
                        .map((member) => {
                          const isCurrentSurface = member.surface === state.surface;

                          return `
                            <button
                              class="company-directory-row ${isActiveGroup ? 'is-current-group' : ''} ${isCurrentSurface ? 'is-current-surface' : ''}"
                              type="button"
                              data-action="open-company-seat"
                              data-id="${escapeHtml(member.id)}"
                              data-target-surface="${escapeHtml(member.surface)}"
                              ${isCurrentSurface ? 'aria-current="true"' : ''}
                              data-selection-state="${isCurrentSurface ? 'active' : isActiveGroup ? 'group' : 'idle'}"
                            >
                              <div class="company-directory-avatar">${escapeHtml(member.name.slice(0, 2).toUpperCase())}</div>
                              <div class="company-directory-main">
                                <strong class="company-directory-name">${escapeHtml(member.name)}</strong>
                                <p class="company-directory-meta">${escapeHtml(getCompanyRoleLabel(member.role))}</p>
                              </div>
                              <div class="company-directory-assignment">
                                <span class="company-directory-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                              </div>
                            </button>
                          `;
                        })
                        .join('')
                    : `<p class="company-directory-empty">${escapeHtml(`${label} 팀 인력이 아직 없습니다.`)}</p>`
                }
              </div>
            </section>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderWorkspaceHeader(data, context) {
  const activeGroupId = getActiveNavGroupId();
  const meta = GROUP_WORKSPACE_META[activeGroupId] || GROUP_WORKSPACE_META.workflows;
  const activeProject = data.activeProject;

  if (elements.shellHeader.eyebrow) {
    elements.shellHeader.eyebrow.textContent = meta.eyebrow;
  }

  if (elements.shellHeader.title) {
    elements.shellHeader.title.textContent = meta.title;
  }

  if (elements.shellHeader.windowLabel) {
    elements.shellHeader.windowLabel.textContent = meta.windowLabel;
  }

  if (elements.shellHeader.project) {
    elements.shellHeader.project.textContent = activeProject?.name || '미지정';
  }

  if (elements.shellHeader.surface) {
    elements.shellHeader.surface.textContent = meta.title;
  }

  if (elements.shellHeader.gates) {
    elements.shellHeader.gates.textContent = `${context.pendingGateCount}건`;
  }

  document.body.dataset.navGroup = activeGroupId;
}

function renderCompanyRosterList(members, emptyCopy = '배정된 인력이 아직 없습니다.') {
  if (!Array.isArray(members) || members.length === 0) {
    return `<p class="company-roster-empty">${escapeHtml(emptyCopy)}</p>`;
  }

  return `
    <div class="company-roster-list">
      ${members
        .map((member) => {
          const groupId = getNavGroupForSurface(member.surface);

          return `
            <div class="company-roster-row">
              <div class="company-roster-main">
                <strong class="company-roster-name">${escapeHtml(member.name)}</strong>
                <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
              </div>
              <div class="company-roster-assignment">
                <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                <span class="company-roster-group">${escapeHtml(getNavGroupLabel(groupId))}</span>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderOverviewPanelHead({ label, title, copy }) {
  return `
    <div class="control-overview-panel-head">
      <p class="control-overview-label">${escapeHtml(label)}</p>
      <h3 class="control-overview-title">${escapeHtml(title)}</h3>
      ${copy ? `<p class="control-overview-copy">${escapeHtml(copy)}</p>` : ''}
    </div>
  `;
}

function renderControlOverviewSignalStrip(items) {
  return `
    <div class="control-overview-signal-strip">
      ${items
        .map(
          (item) => `
            <article class="control-overview-signal-card">
              <span class="control-overview-signal-label">${escapeHtml(item.label)}</span>
              <strong class="control-overview-signal-value">${escapeHtml(item.value)}</strong>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderDurableProposalRecordLedger(growth) {
  if (!growth.proposalRecords.length) {
    return `
      <div
        class="growth-candidate-empty"
        data-durable-proposal-record-ledger="empty"
        data-proposal-application-attempt-ledger="empty/read-only"
        data-proposal-application-attempt-creation-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAttemptCreationAllowed}"
        data-proposal-application-attempt-persistence-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAttemptPersistenceAllowed}"
      >
        <strong>저장된 제안 기록 없음</strong>
        <span>승인된 생성 함수가 기록을 만들면 이 영역에 읽기 전용으로 표시됩니다.</span>
      </div>
    `;
  }

  return `
    <div
      class="growth-candidate-list"
      data-durable-proposal-record-ledger="read-only"
      data-proposal-application-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAllowed}"
      data-proposal-application-attempt-ledger="read-only"
      data-proposal-application-attempt-creation-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAttemptCreationAllowed}"
      data-proposal-application-attempt-persistence-allowed="${GROWTH_AUTHORITY_BOUNDARY.proposalApplicationAttemptPersistenceAllowed}"
      data-proposal-application-attempts-count="${growth.proposalApplicationAttempts.length}"
      data-source-mutation-allowed="${GROWTH_AUTHORITY_BOUNDARY.sourceMutationAllowed}"
    >
      ${growth.proposalRecords
        .map(
          (proposalRecord) => `
            <details class="growth-candidate-card" open>
              <summary class="growth-candidate-summary">
                <span class="growth-candidate-rank">${escapeHtml(proposalRecord.proposalId)}</span>
                <span class="growth-candidate-main">
                  <strong>${escapeHtml(proposalRecord.title)}</strong>
                  <em>${escapeHtml(`${proposalRecord.proposalType} · ${proposalRecord.status}`)}</em>
                </span>
                ${createToken(proposalRecord.riskClass || 'risk 미지정', 'neutral')}
              </summary>
              <div class="growth-candidate-detail">
                <p>${escapeHtml(proposalRecord.nonApprovalStatement || '제안 기록은 적용 승인과 분리됩니다.')}</p>
                <div class="growth-candidate-detail-grid">
                  <span>만료: ${escapeHtml(proposalRecord.expiresAt || '미지정')}</span>
                  <span>근거: ${escapeHtml((proposalRecord.evidenceRefs || []).join(', ') || '대기')}</span>
                  <span>부정 근거: ${escapeHtml((proposalRecord.negativeEvidenceRefs || []).join(', ') || '대기')}</span>
                  <span>검토: ${escapeHtml((proposalRecord.reviewerRefs || []).join(', ') || '대기')}</span>
                </div>
                <div class="growth-candidate-blocked-actions" aria-label="계속 차단된 제안 기록 액션">
                  ${(proposalRecord.blockedActions || [])
                    .map((action) => createToken(action, 'warning'))
                    .join('')}
                </div>
              </div>
            </details>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderEvidenceDensityControls(currentDensity) {
  return `
    <div class="preference-toggle-group" role="group" aria-label="증적 밀도 설정">
      ${EVIDENCE_DENSITY_OPTIONS.map((option) => {
        const label = option === 'compact' ? 'Compact' : 'Standard';
        const active = option === currentDensity;

        return `
          <button
            class="preference-toggle ${active ? 'is-active' : ''}"
            type="button"
            data-action="set-evidence-density"
            data-density="${escapeHtml(option)}"
            aria-pressed="${active ? 'true' : 'false'}"
            ${state.loading || state.mutating ? 'disabled' : ''}
          >
            ${escapeHtml(label)}
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function renderPersonalizationSettings(personalization, data) {
  const activeProject = data.activeProject;
  const portableReviewText = getPortableUiPreferenceReviewText(state.uiPreferences);

  return `
    <div class="personalization-settings" data-local-personalization-settings="true">
      <div class="personalization-settings-head">
        <div>
          <p class="control-overview-label">선호 설정</p>
          <h4 class="growth-proposal-title">로컬 선호만 관리합니다</h4>
        </div>
        ${createToken(UI_PREFERENCE_STORAGE_KEY, 'neutral')}
      </div>
      <div class="personalization-settings-grid">
        <div>
          <span class="control-overview-register-label">저장 범위</span>
          <strong class="control-overview-register-value">browser localStorage</strong>
        </div>
        <div>
          <span class="control-overview-register-label">자동 실행</span>
          <strong class="control-overview-register-value">없음</strong>
        </div>
        <div>
          <span class="control-overview-register-label">추천 화면</span>
          <strong class="control-overview-register-value">${escapeHtml(getSurfaceDisplayName(personalization.suggestedSurface))}</strong>
        </div>
      </div>
      <div
        class="memory-readiness-gate"
        data-memory-readiness-gate="blocked"
        data-long-term-memory-store-allowed="${GROWTH_AUTHORITY_BOUNDARY.longTermMemoryStoreAllowed}"
        data-raw-transcript-ingestion-allowed="${GROWTH_AUTHORITY_BOUNDARY.rawTranscriptIngestionAllowed}"
        data-cross-workspace-memory-allowed="${GROWTH_AUTHORITY_BOUNDARY.crossWorkspaceMemoryAllowed}"
        data-skill-promotion-allowed="${GROWTH_AUTHORITY_BOUNDARY.skillPromotionAllowed}"
      >
        <div class="memory-readiness-head">
          <div>
            <span class="control-overview-register-label">장기 기억 준비 게이트</span>
            <strong>저장 전 검토만 표시합니다</strong>
          </div>
          ${createToken('장기 기억 저장:false', 'warning')}
        </div>
        <div class="memory-readiness-list" aria-label="장기 기억 저장 전 조건">
          ${MEMORY_STORE_OPEN_REQUIREMENTS.map(
            (requirement) => `
              <span>
                ${escapeHtml(requirement)}
              </span>
            `,
          ).join('')}
        </div>
      </div>
      <div class="personalization-actions">
        <button
          class="recent-surface-chip"
          type="button"
          data-action="copy-local-personalization-review"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          선호 설정 묶음 복사
        </button>
        <button
          class="recent-surface-chip"
          type="button"
          data-action="set-preferred-project-local"
          data-project-id="${escapeHtml(activeProject?.id || '')}"
          ${!activeProject?.id || state.loading || state.mutating ? 'disabled' : ''}
        >
          현재 프로젝트 고정
        </button>
        <button
          class="recent-surface-chip"
          type="button"
          data-action="reset-local-personalization"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          로컬 선호 초기화
        </button>
      </div>
      <div class="personalization-portability" data-local-personalization-portability="copy-review-only">
        <span class="control-overview-register-label">이동성 검토 묶음</span>
        <pre>${escapeHtml(portableReviewText)}</pre>
      </div>
    </div>
  `;
}

function renderIntelligenceOverview(data, context) {
  const growth = getGrowthLearningSnapshot(data, context, {
    getArtifactTypeDisplay,
    getRunStatusDisplay,
  });
  const personalization = getPersonalizationSnapshot({
    activeProject: data.activeProject,
    currentSurface: state.surface,
    pendingGateCount: context.pendingGateCount,
    preferences: state.uiPreferences,
    projects: data.snapshot.projects,
    surfaceLocationGuidance: SURFACE_LOCATION_GUIDANCE,
  });
  const blockedAuthorityCount = Object.values(GROWTH_AUTHORITY_BOUNDARY).filter((allowed) => allowed === false).length;

  return `
    <section
      class="intelligence-overview"
      data-growth-learning-surface="read-only"
      data-personalization-scope="local-only"
      data-provider-calls-allowed="${GROWTH_AUTHORITY_BOUNDARY.providerCallsAllowed}"
      data-memory-persistence-allowed="${GROWTH_AUTHORITY_BOUNDARY.memoryPersistenceAllowed}"
      data-long-term-memory-store-allowed="${GROWTH_AUTHORITY_BOUNDARY.longTermMemoryStoreAllowed}"
      data-source-mutation-allowed="${GROWTH_AUTHORITY_BOUNDARY.sourceMutationAllowed}"
      aria-label="학습 후보와 개인화 상태"
    >
      <article class="intelligence-panel intelligence-panel-growth">
        <div class="intelligence-panel-head">
          <div>
            <p class="control-overview-label">성장 증거 원장</p>
            <h3 class="intelligence-title">검증 증거에서 개선 후보를 추출합니다</h3>
          </div>
          ${createToken(growth.status, growth.statusTone)}
        </div>
        <div class="intelligence-register">
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">증거 원천</span>
            <strong class="control-overview-register-value">${escapeHtml(`${growth.evidenceCount}건`)}</strong>
          </div>
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">개선 후보 대기열</span>
            <strong class="control-overview-register-value">${escapeHtml(`${growth.candidateCount}건`)}</strong>
          </div>
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">현재 근거</span>
            <strong class="control-overview-register-value">${escapeHtml(growth.selectedEvidence)}</strong>
          </div>
        </div>
        <p class="intelligence-copy">
          학습 완료가 아니라 실행, 리뷰, 승인, 실패 증거에서 읽기 전용 개선 후보만 제안합니다.
        </p>
        ${renderGrowthDashboardEvidenceDepth(growth)}
        ${renderGrowthCandidateDrilldown(growth)}
        ${renderGrowthProposalReviewPreview(growth)}
        ${renderDurableProposalRecordLedger(growth)}
        <div class="intelligence-boundary-strip" aria-label="차단된 성장 권한">
          ${createToken(`차단 권한:${blockedAuthorityCount}개`, 'warning')}
          ${createToken('provider 호출:false', 'neutral')}
          ${createToken('메모리 저장:false', 'neutral')}
          ${createToken('장기 기억:false', 'neutral')}
          ${createToken('원문 수집:false', 'neutral')}
          ${createToken('스킬 승격:false', 'neutral')}
          ${createToken('제안 기록:false', 'neutral')}
          ${createToken('소스 변경:false', 'neutral')}
          ${createToken('commit/push:false', 'neutral')}
        </div>
      </article>
      <article class="intelligence-panel intelligence-panel-personal">
        <div class="intelligence-panel-head">
          <div>
            <p class="control-overview-label">로컬 개인화</p>
            <h3 class="intelligence-title">반복 작업은 추천 바로가기로만 남깁니다</h3>
          </div>
          ${createToken('로컬 저장만', 'success')}
        </div>
        <div class="intelligence-register">
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">선호 프로젝트</span>
            <strong class="control-overview-register-value">${escapeHtml(personalization.preferredProject?.name || '선택 없음')}</strong>
          </div>
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">추천 화면</span>
            <strong class="control-overview-register-value">${escapeHtml(getSurfaceDisplayName(personalization.suggestedSurface))}</strong>
          </div>
          <div class="intelligence-register-row">
            <span class="control-overview-register-label">방문 신호</span>
            <strong class="control-overview-register-value">${escapeHtml(`${personalization.visitCount}회`)}</strong>
          </div>
        </div>
        <div class="preference-row">
          <div>
            <span class="control-overview-register-label">증적 밀도</span>
            <strong class="control-overview-register-value">${escapeHtml(personalization.density)}</strong>
          </div>
          ${renderEvidenceDensityControls(personalization.density)}
        </div>
        <div class="recent-surface-row" aria-label="최근 desk">
          ${personalization.recentSurfaces
            .map(
              (surface) => `
                <button
                  class="recent-surface-chip"
                  type="button"
                  data-action="open-surface"
                  data-target-surface="${escapeHtml(surface)}"
                  ${state.loading || state.mutating ? 'disabled' : ''}
                >
                  ${escapeHtml(getSurfaceDisplayName(surface))}
                </button>
              `,
            )
            .join('')}
        </div>
        ${renderPersonalizationSettings(personalization, data)}
      </article>
    </section>
  `;
}

function renderOperatorRunway(data, context, activeGroupId, focus, check) {
  const activeProject = data.activeProject;
  const activeMissionTitle = context.selectedMission?.title || '등록된 active mission 없음';
  const activeTaskTitle = context.activeTask?.title || '실행 셀 대기';
  const resultSurface = SURFACE_LOCATION_GUIDANCE[state.surface]?.resultSurface || 'deliverables';
  const resultSurfaceLabel = getSurfaceDisplayName(resultSurface);
  const activeSurfaceLabel = getSurfaceDisplayName(state.surface);
  const blockerLabel = state.error
    ? '런타임 오류'
    : context.pendingGateCount > 0
      ? `사람 게이트 ${context.pendingGateCount}건`
      : context.activeTask?.flags?.blocked
        ? '차단 상태'
        : '막힘 없음';
  const nextActionLabel = check.action?.label
    ? `${check.action.label} 열기`
    : check.next || focus.next || '상세 확인';
  const nextTargetSurface = check.action?.targetSurface || resultSurface;
  const evidenceLabel =
    context.selectedArtifact?.id ||
    context.selectedRun?.id ||
    context.activeTask?.id ||
    context.selectedMission?.id ||
    '근거 대기';

  return `
    <section class="operator-runway" data-operator-runway="true" data-nav-group="${escapeHtml(activeGroupId)}" aria-label="operator home: 현재 안건, 담당, 막힘, 다음 이동, 결과 확인 위치">
      <div class="operator-runway-head">
        <div>
          <p class="control-overview-label">Operator home</p>
          <h3 class="operator-runway-title">지금 할 일</h3>
          <p class="operator-runway-copy">첫 화면에서 active mission, owner, gate, next action, 결과 위치를 바로 확인합니다.</p>
        </div>
        <div class="operator-runway-surface">
          <span class="operator-runway-surface-label">현재 desk</span>
          <strong class="operator-runway-surface-value">${escapeHtml(activeSurfaceLabel)}</strong>
        </div>
      </div>
      <div class="operator-runway-grid" role="list" aria-label="현재 운영 상태 요약">
        <article class="operator-runway-cell operator-runway-cell-mission" role="listitem">
          <span class="operator-runway-cell-label">Active mission</span>
          <strong class="operator-runway-cell-value">${escapeHtml(activeMissionTitle)}</strong>
          <span class="operator-runway-cell-note">${escapeHtml(activeProject?.name || '프로젝트 미지정')}</span>
        </article>
        <article class="operator-runway-cell" role="listitem">
          <span class="operator-runway-cell-label">Owner</span>
          <strong class="operator-runway-cell-value">${escapeHtml(focus.owner)}</strong>
          <span class="operator-runway-cell-note">${escapeHtml(activeTaskTitle)}</span>
        </article>
        <article class="operator-runway-cell" role="listitem">
          <span class="operator-runway-cell-label">Gate / blocker</span>
          <strong class="operator-runway-cell-value">${escapeHtml(blockerLabel)}</strong>
          <span class="operator-runway-cell-note">${escapeHtml(check.current || focus.status)}</span>
        </article>
        <article class="operator-runway-cell operator-runway-cell-next" role="listitem">
          <span class="operator-runway-cell-label">Next action</span>
          <strong class="operator-runway-cell-value">${escapeHtml(nextActionLabel)}</strong>
          <span class="operator-runway-cell-note">결과 위치: ${escapeHtml(resultSurfaceLabel)}</span>
        </article>
      </div>
      <div class="operator-runway-actions" aria-label="operator home shortcuts">
        <button
          class="operator-runway-action operator-runway-action-primary"
          type="button"
          data-action="open-surface"
          data-target-surface="${escapeHtml(nextTargetSurface)}"
          aria-controls="surface-${escapeHtml(nextTargetSurface)}"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          ${escapeHtml(nextActionLabel)}
        </button>
        <button
          class="operator-runway-action"
          type="button"
          data-action="open-surface"
          data-target-surface="${escapeHtml(resultSurface)}"
          aria-controls="surface-${escapeHtml(resultSurface)}"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          ${escapeHtml(resultSurfaceLabel)}에서 결과 보기
        </button>
        <button
          class="operator-runway-action"
          type="button"
          data-action="open-surface"
          data-target-surface="artifacts"
          aria-controls="surface-artifacts"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          아티팩트에서 근거 보기
        </button>
        <button
          class="operator-runway-action"
          type="button"
          data-action="open-surface"
          data-target-surface="logs"
          aria-controls="surface-logs"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          로그에서 실행 흐름 보기
        </button>
        <span class="operator-runway-evidence">현재 근거: ${escapeHtml(evidenceLabel)}</span>
      </div>
    </section>
  `;
}

function renderWorkspacePlaybookShortcutButtons(
  card,
  activeGroupId,
  currentPlaybookStep,
  playbookCardLabelIds,
  playbookCardCurrentId,
  shortcutGroupDescriptionIds,
  playbookCardDescriptionIds,
) {
  const surfaces = Array.isArray(card.surfaces) ? card.surfaces : [];

  if (!surfaces.length) {
    return '';
  }

  const shortcutLabelId = `workspace-playbook-shortcut-label-${activeGroupId}-${card.step}`;
  const shortcutGroupLabelIds = [playbookCardLabelIds, playbookCardCurrentId, shortcutLabelId]
    .filter(Boolean)
    .join(' ');

  return `
    <div class="workspace-playbook-shortcuts" role="group" aria-labelledby="${escapeHtml(shortcutGroupLabelIds)}"${shortcutGroupDescriptionIds ? ` aria-describedby="${escapeHtml(shortcutGroupDescriptionIds)}"` : ''}>
      <span class="workspace-playbook-shortcut-label" id="${escapeHtml(shortcutLabelId)}">바로 열기</span>
      ${surfaces
        .map((surface) => {
          const surfaceLabel = getSurfaceDisplayName(surface);
          const shortcutButtonId = `workspace-playbook-shortcut-${activeGroupId}-${card.step}-${surface}`;
          const shortcutButtonLabelIds = [shortcutButtonId, playbookCardLabelIds]
            .filter(Boolean)
            .join(' ');
          const isCurrentSurface = surface === state.surface;
          const isCurrentStepShortcut = isCurrentSurface && card.step === currentPlaybookStep;
          const isSameSurfaceShortcut = isCurrentSurface && !isCurrentStepShortcut;
          const shortcutLabel = isCurrentStepShortcut
            ? `현재 · ${surfaceLabel}`
            : isSameSurfaceShortcut
              ? `같은 desk · ${surfaceLabel}`
              : surfaceLabel;

          return `
            <button
              id="${escapeHtml(shortcutButtonId)}"
              class="workspace-playbook-shortcut ${isCurrentStepShortcut ? 'is-current-surface' : ''}${isSameSurfaceShortcut ? ' is-same-surface' : ''}"
              type="button"
              data-action="open-surface"
              data-target-surface="${escapeHtml(surface)}"
              data-selection-state="${isCurrentStepShortcut ? 'active' : isSameSurfaceShortcut ? 'same-surface' : 'idle'}"
              aria-controls="surface-${escapeHtml(surface)}"
              ${isCurrentStepShortcut ? 'aria-current="page"' : ''}
              aria-labelledby="${escapeHtml(shortcutButtonLabelIds)}"
              aria-describedby="${escapeHtml(playbookCardDescriptionIds)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              ${escapeHtml(shortcutLabel)}
            </button>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderWorkspacePlaybook(activeGroupId, context = {}) {
  const meta = GROUP_PLAYBOOK_META[activeGroupId] || GROUP_PLAYBOOK_META.workflows;
  const playbookTitleId = `workspace-playbook-title-${activeGroupId}`;
  const playbookSummaryId = `workspace-playbook-summary-${activeGroupId}`;
  const currentPlaybookCard = meta.cards.find(
    (card) => Array.isArray(card.surfaces) && card.surfaces.includes(state.surface),
  );
  const currentPlaybookStep = currentPlaybookCard ? currentPlaybookCard.step : '';
  const activeSurfaceLabel = getSurfaceDisplayName(state.surface);
  const baseLocation = SURFACE_LOCATION_GUIDANCE[state.surface] || {
    check: '현재 desk 상태',
    next: '다음 액션',
    nextHint: '다음으로 처리할 desk가 열립니다.',
    resultHint: '작업 결과는 산출물에서 확인합니다.',
  };
  const location =
    state.surface === 'mission' && !context.selectedMission
      ? {
          ...baseLocation,
          next: '신규 안건 등록',
          nextHint: '먼저 미션에서 제목, 목표, 경계를 등록해 첫 안건을 만듭니다.',
          targetSurface: 'mission',
        }
      : baseLocation;
  const resultSurface = location.resultSurface || 'deliverables';
  const resultSurfaceLabel = getSurfaceDisplayName(resultSurface);
  const targetSurfaceLabel = location.targetSurface
    ? getSurfaceDisplayName(location.targetSurface)
    : '';
  const locationCellIds = {
    current: {
      label: `workspace-location-label-${state.surface}-current`,
      note: `workspace-location-note-${state.surface}-current`,
      value: `workspace-location-value-${state.surface}-current`,
    },
    check: {
      label: `workspace-location-label-${state.surface}-check`,
      value: `workspace-location-value-${state.surface}-check`,
    },
    result: {
      action: `workspace-location-action-${state.surface}-result`,
      label: `workspace-location-label-${state.surface}-result`,
      value: `workspace-location-value-${state.surface}-result`,
    },
    next: {
      action: `workspace-location-action-${state.surface}-next`,
      label: `workspace-location-label-${state.surface}-next`,
      static: `workspace-location-static-${state.surface}-next`,
      value: `workspace-location-value-${state.surface}-next`,
    },
  };

  return `
    <section class="workspace-playbook" data-nav-group="${escapeHtml(activeGroupId)}" aria-labelledby="${escapeHtml(playbookTitleId)}"${meta.copy ? ` aria-describedby="${escapeHtml(playbookSummaryId)}"` : ''}>
      <div class="workspace-playbook-head">
        <div>
          <p class="control-overview-label">${escapeHtml(meta.label)}</p>
          <h3 class="workspace-playbook-title" id="${escapeHtml(playbookTitleId)}">${escapeHtml(meta.title)}</h3>
        </div>
        ${meta.copy ? `<p class="workspace-playbook-summary" id="${escapeHtml(playbookSummaryId)}">${escapeHtml(meta.copy)}</p>` : ''}
      </div>
      <div class="workspace-location-strip" role="list" aria-label="현재 위치, 여기서 확인, 결과 확인, 다음 이동">
        <article class="workspace-location-cell workspace-location-cell-current" role="listitem" aria-current="location" aria-labelledby="${escapeHtml(`${locationCellIds.current.label} ${locationCellIds.current.value}`)}" aria-describedby="${escapeHtml(locationCellIds.current.note)}">
          <span class="workspace-location-label" id="${escapeHtml(locationCellIds.current.label)}">현재 위치</span>
          <strong class="workspace-location-value" id="${escapeHtml(locationCellIds.current.value)}">${escapeHtml(activeSurfaceLabel)}</strong>
          <span class="workspace-location-current-note" id="${escapeHtml(locationCellIds.current.note)}">지금 보고 있음</span>
        </article>
        <article class="workspace-location-cell" role="listitem" aria-labelledby="${escapeHtml(`${locationCellIds.check.label} ${locationCellIds.check.value}`)}">
          <span class="workspace-location-label" id="${escapeHtml(locationCellIds.check.label)}">여기서 확인</span>
          <strong class="workspace-location-value" id="${escapeHtml(locationCellIds.check.value)}">${escapeHtml(location.check)}</strong>
        </article>
        <article class="workspace-location-cell" role="listitem" aria-labelledby="${escapeHtml(`${locationCellIds.result.label} ${locationCellIds.result.value}`)}">
          <span class="workspace-location-label" id="${escapeHtml(locationCellIds.result.label)}">결과 확인</span>
          <strong class="workspace-location-value" id="${escapeHtml(locationCellIds.result.value)}">${escapeHtml(resultSurfaceLabel)}</strong>
          <span class="workspace-location-hint">${escapeHtml(location.resultHint || '작업 결과는 산출물에서 확인합니다.')}</span>
          <button
            id="${escapeHtml(locationCellIds.result.action)}"
            class="workspace-location-action workspace-location-action-secondary"
            type="button"
            data-action="open-surface"
            data-target-surface="${escapeHtml(resultSurface)}"
            aria-controls="surface-${escapeHtml(resultSurface)}"
            aria-labelledby="${escapeHtml(`${locationCellIds.result.label} ${locationCellIds.result.action}`)}"
            aria-describedby="${escapeHtml(locationCellIds.result.value)}"
            ${state.loading || state.mutating ? 'disabled' : ''}
          >
            ${escapeHtml(resultSurfaceLabel)}에서 결과 보기
          </button>
        </article>
        <article class="workspace-location-cell" role="listitem" aria-labelledby="${escapeHtml(`${locationCellIds.next.label} ${locationCellIds.next.value}`)}"${location.targetSurface ? '' : ` aria-describedby="${escapeHtml(locationCellIds.next.static)}"`}>
          <span class="workspace-location-label" id="${escapeHtml(locationCellIds.next.label)}">다음 이동</span>
          <strong class="workspace-location-value" id="${escapeHtml(locationCellIds.next.value)}">${escapeHtml(location.next)}</strong>
          <span class="workspace-location-hint">${escapeHtml(location.nextHint || '다음으로 처리할 desk가 열립니다.')}</span>
          ${
            location.targetSurface
              ? `
                <button
                  id="${escapeHtml(locationCellIds.next.action)}"
                  class="workspace-location-action"
                  type="button"
                  data-action="open-surface"
                  data-target-surface="${escapeHtml(location.targetSurface)}"
                  aria-controls="surface-${escapeHtml(location.targetSurface)}"
                  aria-labelledby="${escapeHtml(`${locationCellIds.next.label} ${locationCellIds.next.action}`)}"
                  aria-describedby="${escapeHtml(locationCellIds.next.value)}"
                  ${state.loading || state.mutating ? 'disabled' : ''}
                >
                  ${escapeHtml(targetSurfaceLabel)}에서 다음 처리 열기
                </button>
              `
              : `<span class="workspace-location-static" id="${escapeHtml(locationCellIds.next.static)}">결정 후 원래 desk로 돌아갑니다</span>`
          }
        </article>
      </div>
      <div class="workspace-playbook-grid" role="list" aria-label="${escapeHtml(meta.title)} 단계">
        ${meta.cards
          .map((card) => {
            const isCurrentStep = card.step === currentPlaybookStep;
            const playbookCardStepId = `workspace-playbook-card-step-${activeGroupId}-${card.step}`;
            const playbookCardTitleId = `workspace-playbook-card-title-${activeGroupId}-${card.step}`;
            const playbookCardNoteId = `workspace-playbook-card-note-${activeGroupId}-${card.step}`;
            const playbookCardWhereId = card.where
              ? `workspace-playbook-card-where-${activeGroupId}-${card.step}`
              : '';
            const playbookCardCurrentId = isCurrentStep
              ? `workspace-playbook-card-current-${activeGroupId}-${card.step}`
              : '';
            const playbookCardLabelIds = `${playbookCardStepId} ${playbookCardTitleId}`;
            const playbookCardDescriptionIds = [playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId]
              .filter(Boolean)
              .join(' ');
            const shortcutGroupDescriptionIds = [playbookCardNoteId, playbookCardWhereId]
              .filter(Boolean)
              .join(' ');

            return `
              <article class="workspace-playbook-card ${isCurrentStep ? 'is-current-step' : ''}" role="listitem" data-step-state="${isCurrentStep ? 'current' : 'idle'}" ${isCurrentStep ? 'aria-current="step"' : ''} aria-labelledby="${escapeHtml(playbookCardLabelIds)}" aria-describedby="${escapeHtml(playbookCardDescriptionIds)}">
                <span class="workspace-playbook-step" id="${escapeHtml(playbookCardStepId)}">${escapeHtml(card.step)}</span>
                <div class="workspace-playbook-copy">
                  <div class="workspace-playbook-title-row">
                    <strong class="workspace-playbook-card-title" id="${escapeHtml(playbookCardTitleId)}">${escapeHtml(card.title)}</strong>
                    ${isCurrentStep ? `<span class="workspace-playbook-current-step" id="${escapeHtml(playbookCardCurrentId)}">현재 단계</span>` : ''}
                  </div>
                  <p class="workspace-playbook-note" id="${escapeHtml(playbookCardNoteId)}">${escapeHtml(card.note)}</p>
                  ${card.where ? `<span class="workspace-playbook-where" id="${escapeHtml(playbookCardWhereId)}">${escapeHtml(card.where)}</span>` : ''}
                  ${renderWorkspacePlaybookShortcutButtons(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds)}
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderWorkflowQueueLane(entry) {
  const isActive = entry.surface === state.surface;
  return `
    <button
      class="workflow-stage-card ${isActive ? 'is-active' : ''}"
      type="button"
      data-action="open-surface"
      data-target-surface="${escapeHtml(entry.surface)}"
      ${isActive ? 'aria-current="true"' : ''}
      data-selection-state="${isActive ? 'active' : 'idle'}"
    >
      <div class="workflow-stage-head">
        <div class="workflow-stage-head-main">
          <div class="workflow-stage-index">${escapeHtml(String(entry.order).padStart(2, '0'))}</div>
          ${isActive ? '<span class="workflow-stage-active-label">현재 보기</span>' : ''}
        </div>
        ${createToken(`${entry.count}건`, isActive ? 'accent' : 'neutral')}
      </div>
      <div class="workflow-stage-copy">
        <p class="workflow-stage-kicker">${escapeHtml(entry.kicker)}</p>
        <strong class="workflow-stage-title">${escapeHtml(entry.desk)}</strong>
        <p class="workflow-stage-note">${escapeHtml(entry.note)}</p>
      </div>
      <div class="workflow-stage-meta">
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.status)}</strong>
        </div>
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">담당</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.owner)}</strong>
        </div>
        <div class="workflow-stage-field">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.next)}</strong>
        </div>
      </div>
    </button>
  `;
}

function renderReviewLaneCard(entry) {
  const isActive = entry.surface === state.surface;
  return `
    <button
      class="review-lane-card ${isActive ? 'is-active' : ''}"
      type="button"
      data-action="open-surface"
      data-target-surface="${escapeHtml(entry.surface)}"
      ${isActive ? 'aria-current="true"' : ''}
      data-selection-state="${isActive ? 'active' : 'idle'}"
    >
      <div class="review-lane-card-head">
        <div class="review-lane-card-head-main">
          <p class="control-overview-label">${escapeHtml(entry.kicker)}</p>
          ${isActive ? '<span class="review-lane-card-active-label">현재 보기</span>' : ''}
        </div>
        ${createToken(`${entry.count}건`, isActive ? 'accent' : 'neutral')}
      </div>
      <strong class="review-lane-card-title">${escapeHtml(entry.desk)}</strong>
      <p class="review-lane-card-copy">${escapeHtml(entry.note)}</p>
      <div class="review-lane-card-meta">
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">상태</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.status)}</strong>
        </div>
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">담당</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.owner)}</strong>
        </div>
        <div class="review-lane-card-field">
          <span class="control-overview-register-label">다음</span>
          <strong class="control-overview-register-value">${escapeHtml(entry.next)}</strong>
        </div>
      </div>
    </button>
  `;
}

function renderReviewInspectorSteps(check, selectedPacket) {
  return `
    <div class="review-inspector-steps">
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">1</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">패킷 확인</strong>
          <p class="review-inspector-step-note">${escapeHtml(selectedPacket)}</p>
        </div>
      </article>
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">2</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">근거 교차 확인</strong>
          <p class="review-inspector-step-note">${escapeHtml(check.evidence)}</p>
        </div>
      </article>
      <article class="review-inspector-step">
        <span class="review-inspector-step-index">3</span>
        <div class="review-inspector-step-copy">
          <strong class="review-inspector-step-title">다음 이동</strong>
          <p class="review-inspector-step-note">${escapeHtml(check.next)}</p>
        </div>
      </article>
    </div>
  `;
}

function renderWorkflowsOverview(data, context, activeGroupId) {
  const activeProject = data.activeProject;
  const queueEntries = getCompanyFloorBoardEntries(data, activeGroupId).map((entry, index) => ({
    ...entry,
    order: index + 1,
  }));
  const focus = getControlOverviewFocus(context);
  const check = getControlOverviewCheck(state.surface, context, data);
  const workflowMembers = getCompanyMembersForGroup(state.companyMembers, activeGroupId);
  const activeDeskLabel = getSurfaceDisplayName(state.surface);
  const selectedMission = context.selectedMission;
  const selectedCouncil = context.selectedCouncil;
  const selectedTask = context.selectedTask || context.activeTask;
  const selectedRun = context.selectedRun;
  const selectedArtifact = context.selectedArtifact;
  const selectedOrderTitle = selectedTask?.title || selectedMission?.title || '열린 work order 없음';
  const selectedOrderSignal = selectedTask
    ? getTaskLifecycleDisplay(selectedTask.lifecycleState)
    : selectedMission
      ? getMissionStatusDisplay(selectedMission.status)
      : '등록 대기';
  const selectedOrderEvidence = selectedRun?.id || selectedArtifact?.id || selectedTask?.id || selectedMission?.id || '근거 대기';
  const selectedOrderOwner = selectedTask
    ? '실행 역할'
    : selectedCouncil
      ? '회의 리드'
      : selectedMission
        ? '안건 담당'
        : '운영자';
  const selectedMissionHandoff = getMissionFirstRunHandoff(selectedMission, data);
  const selectedOrderNext = selectedTask
    ? getExecutionDeskNext(selectedTask)
    : selectedMissionHandoff.next;
  const workflowStartEmpty = !selectedMission && !selectedTask;
  const handoffPanelLabel = workflowStartEmpty ? 'Mission intake' : 'Execution handoff';
  const handoffPanelTitle = workflowStartEmpty ? '접수 인계' : '실행 인계';
  const handoffRosterLabel = workflowStartEmpty ? '접수 라인업' : '실행 라인업';

  return `
    <div class="control-overview-stack control-overview-stack-workflows">
      ${renderOperatorRunway(data, context, activeGroupId, focus, check)}
      ${renderControlOverviewSignalStrip([
        { label: '현재 데스크', value: activeDeskLabel },
        { label: '담당', value: selectedOrderOwner },
        { label: '다음', value: selectedOrderNext },
      ])}
      ${renderIntelligenceOverview(data, context)}
      ${renderWorkspacePlaybook(activeGroupId, context)}
      <div class="control-overview-grid control-overview-grid-workflows workflow-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <aside class="control-overview-panel workflow-overview-rail">
        ${renderOverviewPanelHead({
          label: 'Workflow map',
          title: '업무 흐름',
        })}
        <div class="workflow-stage-stack">
          ${queueEntries.map((entry) => renderWorkflowQueueLane(entry)).join('')}
        </div>
      </aside>

      <section class="control-overview-panel workflow-overview-main workflow-overview-order">
        ${renderOverviewPanelHead({
          label: 'Selected work order',
          title: '선택된 work order',
        })}
        <div class="workflow-focus-hero workflow-order-hero">
          <p class="workflow-order-kicker">${escapeHtml(activeDeskLabel)}</p>
          <h4 class="workflow-focus-title">${escapeHtml(selectedOrderTitle)}</h4>
          <p class="workflow-focus-copy">${escapeHtml(focus.copy)}</p>
          <div class="token-row">
            ${createToken(`담당:${selectedOrderOwner}`, 'neutral')}
            ${createToken(`status:${selectedOrderSignal}`, 'accent')}
            ${createToken(`next:${selectedOrderNext}`, 'neutral')}
          </div>
        </div>
        <div class="control-overview-register workflow-order-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">안건</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedMission?.title || '안건 대기')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">실행</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedTask?.id || '실행 셀 대기')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderEvidence)}</strong>
          </div>
        </div>
        <div class="workflow-workorder-strip">
          <article class="workflow-workorder-note">
            <p class="control-overview-label">지금 처리</p>
            <strong class="workflow-workorder-note-title">${escapeHtml(focus.status)}</strong>
            <p class="workflow-focus-copy">${escapeHtml(focus.next)} 전까지만 정리합니다.</p>
          </article>
          <article class="workflow-workorder-note">
            <p class="control-overview-label">다음 인계</p>
            <strong class="workflow-workorder-note-title">${escapeHtml(check.next)}</strong>
            <p class="workflow-focus-copy">${escapeHtml(check.current)} 정리 후 넘깁니다.</p>
          </article>
        </div>
      </section>

      <aside class="control-overview-panel workflow-overview-handoff workflow-overview-transfer">
        ${renderOverviewPanelHead({
          label: handoffPanelLabel,
          title: handoffPanelTitle,
        })}
        <div class="control-overview-register workflow-handoff-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedOrderOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">막힘</span>
            <strong class="control-overview-register-value">${escapeHtml(check.current)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(check.evidence)}</strong>
          </div>
        </div>
        <div class="workflow-roster-card workflow-handoff-card">
          <p class="control-overview-label">${escapeHtml(handoffRosterLabel)}</p>
          ${renderCompanyRosterList(workflowMembers, '업무 라인에 배정된 인력이 아직 없습니다.')}
        </div>
        ${
          check.action
            ? `
              <button
                class="primary-button control-overview-action"
                type="button"
                data-action="open-surface"
                data-target-surface="${escapeHtml(check.action.targetSurface)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                ${escapeHtml(check.action.label)}
              </button>
            `
            : ''
          }
      </aside>
      </div>
    </div>
  `;
}

function renderReviewOverview(data, context, activeGroupId) {
  const queueEntries = getCompanyFloorBoardEntries(data, activeGroupId);
  const focus = getControlOverviewFocus(context);
  const check = getControlOverviewCheck(state.surface, context, data);
  const selectedPacket = context.selectedArtifact?.id || context.selectedRun?.id || context.selectedInboxItem?.id || '선택 대기';
  const openEvidenceCount = data.artifacts.length;
  const openLogCount = data.runs.length;
  const reviewMembers = getCompanyMembersForGroup(state.companyMembers, activeGroupId);
  const pendingReviewCount = data.inboxItems.filter((item) => item.status === 'pending').length;
  const packetKind = context.selectedArtifact?.type
    ? getArtifactTypeDisplay(context.selectedArtifact.type)
    : context.selectedRun
      ? 'run evidence'
      : context.selectedInboxItem
        ? 'decision packet'
        : 'packet pending';
  const selectedPacketOwner = focus.owner;

  return `
    <div class="control-overview-stack control-overview-stack-review">
      ${renderOperatorRunway(data, context, activeGroupId, focus, check)}
      ${renderControlOverviewSignalStrip([
        { label: '현재 패킷', value: selectedPacket },
        { label: '담당', value: focus.owner },
        { label: '다음', value: check.next },
      ])}
      ${renderIntelligenceOverview(data, context)}
      ${renderWorkspacePlaybook(activeGroupId, context)}
      <div class="control-overview-grid control-overview-grid-review review-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <aside class="control-overview-panel review-overview-lanes">
        ${renderOverviewPanelHead({
          label: 'Review queue',
          title: '검토 큐',
        })}
        <div class="review-queue-summary">
          <div class="review-queue-summary-row">
            <span class="control-overview-register-label">검토</span>
            <strong class="control-overview-register-value">${escapeHtml(`${pendingReviewCount}건`)}</strong>
          </div>
          <div class="review-queue-summary-row">
            <span class="control-overview-register-label">증적</span>
            <strong class="control-overview-register-value">${escapeHtml(`${openEvidenceCount}건`)}</strong>
          </div>
        </div>
        <div class="review-lane-stack">
          ${queueEntries.map((entry) => renderReviewLaneCard(entry)).join('')}
        </div>
      </aside>

      <section class="control-overview-panel review-overview-packet">
        ${renderOverviewPanelHead({
          label: 'Selected packet',
          title: '선택 패킷',
        })}
        <div class="workflow-focus-hero review-focus-hero review-packet-hero">
          <h4 class="workflow-focus-title">${escapeHtml(focus.title)}</h4>
          <p class="workflow-focus-copy">${escapeHtml(focus.copy)}</p>
          <div class="token-row">
            ${createToken(`판단:${focus.status}`, 'accent')}
            ${createToken(`근거:${selectedPacket}`, 'neutral')}
            ${createToken(`다음:${check.next}`, 'neutral')}
          </div>
        </div>
        <div class="control-overview-register review-packet-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">패킷</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedPacket)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">타입</span>
            <strong class="control-overview-register-value">${escapeHtml(packetKind)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(selectedPacketOwner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
        </div>
        <div class="review-packet-grid review-packet-metrics">
          <div class="review-packet-cell">
            <span class="control-overview-detail-label">현재 판단</span>
            <strong class="control-overview-detail-value">${escapeHtml(focus.status)}</strong>
          </div>
          <div class="review-packet-cell">
            <span class="control-overview-detail-label">근거 패킷</span>
            <strong class="control-overview-detail-value">${escapeHtml(selectedPacket)}</strong>
          </div>
        </div>
        <div class="review-packet-strip">
          <article class="review-packet-note">
            <p class="control-overview-label">판단 메모</p>
            <strong class="review-packet-note-title">${escapeHtml(check.current)}</strong>
            <p class="workflow-focus-copy">현재 판단만 유지합니다.</p>
          </article>
          <article class="review-packet-note">
            <p class="control-overview-label">연결 run</p>
            <strong class="review-packet-note-title">${escapeHtml(context.selectedRun?.id || `${openLogCount}건 대기`)}</strong>
            <p class="workflow-focus-copy">실행 로그와 교차 확인합니다.</p>
          </article>
          <article class="review-packet-note review-evidence-note">
            <p class="control-overview-label">열린 gate</p>
            <strong class="review-packet-note-title">${escapeHtml(context.selectedInboxItem?.id || `${pendingReviewCount}건`)}</strong>
            <p class="workflow-focus-copy">결정함 우선 여부만 확인합니다.</p>
          </article>
        </div>
      </section>

      <aside class="control-overview-panel review-overview-inspector">
        ${renderOverviewPanelHead({
          label: 'Review inspector',
          title: '검토 기준',
        })}
        <div class="control-overview-register review-inspector-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">담당</span>
            <strong class="control-overview-register-value">${escapeHtml(focus.owner)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">기준</span>
            <strong class="control-overview-register-value">${escapeHtml(context.pendingGateCount > 0 ? '결정함 우선' : '증적-로그 교차 확인')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">근거</span>
            <strong class="control-overview-register-value">${escapeHtml(check.evidence)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">다음</span>
            <strong class="control-overview-register-value">${escapeHtml(check.next)}</strong>
          </div>
        </div>
        ${renderReviewInspectorSteps(check, selectedPacket)}
        <article class="review-evidence-card review-lineup-card">
          <p class="control-overview-label">검토 라인업</p>
          ${renderCompanyRosterList(reviewMembers, '검토 라인에 배정된 인력이 아직 없습니다.')}
        </article>
        ${
          check.action
            ? `
              <button
                class="primary-button control-overview-action review-inspector-action"
                type="button"
                data-action="open-surface"
                data-target-surface="${escapeHtml(check.action.targetSurface)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                ${escapeHtml(check.action.label)}
              </button>
            `
            : ''
          }
      </aside>
      </div>
    </div>
  `;
}

function renderOpsRosterMatrix(members) {
  if (!Array.isArray(members) || members.length === 0) {
    return `<p class="company-roster-empty">회사 인력이 아직 없습니다.</p>`;
  }

  return `
    <div class="ops-roster-matrix">
      ${members
        .map((member) => `
          <div class="ops-roster-row">
            <div class="ops-roster-main">
              <strong class="company-roster-name">${escapeHtml(member.name)}</strong>
              <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
            </div>
            <div class="ops-roster-assignment">
              ${createToken(getNavGroupLabel(getNavGroupForSurface(member.surface)), 'neutral')}
              <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
            </div>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderOpsEditorSteps() {
  return `
    <div class="ops-editor-sequence">
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">1</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">인력 추가</strong>
          <p class="ops-editor-step-note">새 AI agent를 등록하고 회사 구조에 올립니다.</p>
        </div>
      </article>
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">2</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">역할 지정</strong>
          <p class="ops-editor-step-note">reviewer, builder, ops 역할을 먼저 정합니다.</p>
        </div>
      </article>
      <article class="ops-editor-step">
        <span class="ops-editor-step-index">3</span>
        <div class="ops-editor-step-copy">
          <strong class="ops-editor-step-title">데스크 배정</strong>
          <p class="ops-editor-step-note">어느 desk에서 일할지 저장합니다.</p>
        </div>
      </article>
    </div>
  `;
}

function renderOpsEditorScopeTabs(activeGroupId = 'all') {
  const options = [
    { id: 'all', label: '전체' },
    ...Object.keys(NAV_GROUPS).map((groupId) => ({
      id: groupId,
      label: getNavGroupLabel(groupId),
    })),
  ];

  return `
    <div class="ops-editor-filter-tabs">
      ${options
        .map(
          (option) => `
            <button
              class="ops-editor-filter-tab ${option.id === activeGroupId ? 'is-active' : ''}"
              type="button"
              data-action="set-ops-editor-group"
              data-target-group="${escapeHtml(option.id)}"
            >
              ${escapeHtml(option.label)}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderOpsCreatePreview() {
  return `
    <div class="ops-create-preview">
      <div class="ops-create-preview-cell">
        <span class="control-overview-register-label">역할</span>
        <strong class="control-overview-register-value">${escapeHtml(getCompanyRoleLabel(state.companyMemberDraftRole))}</strong>
      </div>
      <div class="ops-create-preview-cell">
        <span class="control-overview-register-label">desk</span>
        <strong class="control-overview-register-value">${escapeHtml(getCompanyDeskLabel(state.companyMemberDraftSurface))}</strong>
      </div>
    </div>
  `;
}

function renderOpsOverview(data, context, activeGroupId) {
  const counts = getCompanyDirectorySummary(state.companyMembers);
  const activeProject = data.activeProject;
  const focus = getControlOverviewFocus(context);
  const check = getControlOverviewCheck(state.surface, context, data);
  const harnessBrief = getHarnessConsumerBrief(data);
  const editorGroupId = state.opsEditorGroup || 'all';
  const editorGroupLabel = getOpsEditorGroupLabel(editorGroupId);
  const editorMembers = getOpsEditorMembers(state.companyMembers, editorGroupId);
  const editorRoleCount = new Set(editorMembers.map((member) => member.role)).size;
  const editorDeskCount = new Set(editorMembers.map((member) => member.surface)).size;
  const groupedMembers = Object.keys(NAV_GROUPS).map((groupId) => ({
    groupId,
    label: getNavGroupLabel(groupId),
    members: getCompanyMembersForGroup(state.companyMembers, groupId),
  }));

  return `
    <div class="control-overview-stack control-overview-stack-ops">
      ${renderOperatorRunway(data, context, activeGroupId, focus, check)}
      ${renderControlOverviewSignalStrip([
        { label: '현재 프로젝트', value: activeProject?.name || '선택 없음' },
        { label: '편집 범위', value: editorGroupLabel },
        { label: '다음', value: 'agent 배정' },
        { label: '하네스', value: getHarnessBriefSignalValue(harnessBrief) },
      ])}
      ${renderIntelligenceOverview(data, context)}
      ${renderWorkspacePlaybook(activeGroupId, context)}
      <div class="control-overview-grid control-overview-grid-ops ops-overview-shell" data-surface="${escapeHtml(state.surface)}" data-nav-group="${escapeHtml(activeGroupId)}">
      <section class="control-overview-panel ops-overview-org">
        ${renderOverviewPanelHead({
          label: 'Company org',
          title: '회사 구조',
        })}
        <div class="ops-org-metrics">
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">전체 인력</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(state.companyMembers.length))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">업무 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.workflows))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">검토 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.review))}</strong>
          </div>
          <div class="ops-org-metric">
            <span class="control-overview-detail-label">운영 라인</span>
            <strong class="control-overview-detail-value">${escapeHtml(String(counts.ops))}</strong>
          </div>
        </div>
        <div class="control-overview-register ops-org-register">
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">범위</span>
            <strong class="control-overview-register-value">${escapeHtml(editorGroupLabel)}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">프로젝트</span>
            <strong class="control-overview-register-value">${escapeHtml(activeProject?.name || '선택 없음')}</strong>
          </div>
          <div class="control-overview-register-row">
            <span class="control-overview-register-label">승인선</span>
            <strong class="control-overview-register-value">${escapeHtml(`${context.pendingGateCount}건`)}</strong>
          </div>
        </div>
        ${renderHarnessBriefRegister(harnessBrief)}
        <div class="ops-roster-sheet">
          <p class="control-overview-label">팀별 배정</p>
          <div class="ops-team-section-list ops-team-board">
            ${groupedMembers
              .map(
                ({ groupId, label, members }) => `
                  <section
                    class="ops-team-section ${groupId === editorGroupId ? 'is-active-group' : ''}"
                    data-selection-state="${groupId === editorGroupId ? 'active' : 'idle'}"
                  >
                    <div class="ops-team-section-head">
                      <strong class="ops-team-section-title">${escapeHtml(label)}</strong>
                      ${createToken(`${members.length}명`, groupId === editorGroupId ? 'accent' : 'neutral')}
                    </div>
                    ${renderOpsRosterMatrix(members)}
                  </section>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="control-overview-panel ops-overview-admin">
        ${renderOverviewPanelHead({
          label: 'AI staffing desk',
          title: '인력 편집',
        })}
        <div class="ops-admin-toolbar">
          ${renderOpsEditorSteps()}
          <section class="ops-editor-scope">
            <div class="ops-section-head">
              <div>
                <p class="control-overview-label">Editor scope</p>
                <h4 class="ops-section-title">현재 배정 현황</h4>
              </div>
              ${createToken(`${editorMembers.length}명`, editorGroupId === 'all' ? 'neutral' : 'accent')}
            </div>
            ${renderOpsEditorScopeTabs(editorGroupId)}
            <div class="control-overview-register ops-staffing-snapshot">
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">범위</span>
                <strong class="control-overview-register-value">${escapeHtml(editorGroupLabel)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">인력</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorMembers.length}명`)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">역할</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorRoleCount}종`)}</strong>
              </div>
              <div class="control-overview-register-row">
                <span class="control-overview-register-label">desk</span>
                <strong class="control-overview-register-value">${escapeHtml(`${editorDeskCount}개`)}</strong>
              </div>
            </div>
          </section>
        </div>
        <div class="ops-admin-grid">
          <form class="company-member-create-form ops-create-card" data-form="create-company-member">
            <div class="ops-section-head">
              <div>
                <p class="control-overview-label">Create agent</p>
                <h4 class="ops-section-title">AI 에이전트 추가</h4>
              </div>
              ${createToken(`전체 ${state.companyMembers.length}명`, 'neutral')}
            </div>
            ${renderOpsCreatePreview()}
            <div class="ops-form-stack">
              <section class="ops-form-section ops-form-order-section">
                <div class="ops-form-section-head">
                  <p class="control-overview-label">Input order</p>
                  <strong class="ops-form-section-title">이름 → 역할 → desk</strong>
                </div>
                <div class="field-grid company-member-field-grid ops-form-order-grid">
                  <label class="field field-compact">
                    <span class="field-label">이름</span>
                    <input
                      type="text"
                      name="companyMemberName"
                      value="${escapeHtml(state.companyMemberDraftName)}"
                      placeholder="Aiden"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">역할</span>
                    <select name="companyMemberRole" ${state.loading || state.mutating ? 'disabled' : ''}>
                      ${COMPANY_ROLE_OPTIONS.map((option) => `
                        <option value="${escapeHtml(option.value)}" ${state.companyMemberDraftRole === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                      `).join('')}
                    </select>
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">담당 데스크</span>
                    <select name="companyMemberSurface" ${state.loading || state.mutating ? 'disabled' : ''}>
                      ${COMPANY_DESK_OPTIONS.map((option) => `
                        <option value="${escapeHtml(option.surface)}" ${state.companyMemberDraftSurface === option.surface ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                      `).join('')}
                    </select>
                  </label>
                </div>
              </section>
            </div>
            <div class="ops-form-footer">
              <div class="ops-form-footer-copy">
                <span class="control-overview-label">반영</span>
                <strong class="ops-form-footer-title">roster와 회사 구조에 추가합니다.</strong>
              </div>
              <div class="ops-form-footer-actions">
                <button class="primary-button" type="submit" ${state.loading || state.mutating ? 'disabled' : ''}>agent 추가</button>
              </div>
            </div>
          </form>
          <section class="ops-staffing-shell">
            <article class="ops-current-lineup" data-panel-state="readonly">
              <div class="ops-section-head">
                <div>
                  <p class="control-overview-label ops-panel-kicker">Read-only roster</p>
                  <h4 class="ops-section-title">현재 배정 현황</h4>
                </div>
                ${createToken(editorGroupLabel, editorGroupId === 'all' ? 'neutral' : 'accent')}
              </div>
              ${
                editorMembers.length
                  ? renderOpsRosterMatrix(editorMembers)
                  : `<p class="company-roster-empty">${escapeHtml(`${editorGroupLabel} 범위 인력이 아직 없습니다.`)}</p>`
              }
            </article>
            <article class="ops-assignment-editor" data-panel-state="editing">
              <div class="ops-section-head">
                <div>
                  <p class="control-overview-label ops-panel-kicker">Editing rows</p>
                  <h4 class="ops-section-title">역할/데스크 편집</h4>
                </div>
                ${createToken(`편집 ${editorMembers.length}명`, 'accent')}
              </div>
              <div class="company-member-admin-list ops-staffing-table">
                ${editorMembers
                .map((member) => `
                  <form class="company-member-admin-card ops-staffing-row" data-form="update-company-member" data-id="${escapeHtml(member.id)}" data-editor-state="editing">
                    <div class="company-member-admin-head ops-staffing-row-head">
                      <div class="ops-staffing-identity">
                        <strong>${escapeHtml(member.name)}</strong>
                        <span class="company-roster-role">${escapeHtml(getCompanyRoleLabel(member.role))}</span>
                      </div>
                      <div class="ops-staffing-tags">
                        <span class="ops-editing-badge">편집 대상</span>
                        ${createToken(getNavGroupLabel(getNavGroupForSurface(member.surface)), getNavGroupForSurface(member.surface) === editorGroupId ? 'accent' : 'neutral')}
                        <span class="company-roster-desk">${escapeHtml(getCompanyDeskLabel(member.surface))}</span>
                      </div>
                    </div>
                    <div class="ops-assignment-row-grid">
                      <section class="ops-form-section ops-assignment-fields ops-form-section-muted">
                        <div class="ops-form-section-head">
                          <p class="control-overview-label">Current</p>
                          <strong class="ops-form-section-title">현재 배정</strong>
                        </div>
                        <div class="ops-staffing-current ops-staffing-current-grid">
                          <div class="ops-staffing-current-cell">
                            <span class="control-overview-register-label">역할</span>
                            <strong class="control-overview-register-value">${escapeHtml(getCompanyRoleLabel(member.role))}</strong>
                          </div>
                          <div class="ops-staffing-current-cell">
                            <span class="control-overview-register-label">desk</span>
                            <strong class="control-overview-register-value">${escapeHtml(getCompanyDeskLabel(member.surface))}</strong>
                          </div>
                        </div>
                      </section>
                      <section class="ops-form-section ops-assignment-fields ops-form-order-section">
                        <div class="ops-form-section-head">
                          <p class="control-overview-label">Edit order</p>
                          <strong class="ops-form-section-title">이름 → 역할 → desk</strong>
                        </div>
                        <div class="company-member-admin-grid ops-form-order-grid">
                          <label class="field field-compact">
                            <span class="field-label">이름</span>
                            <input type="text" name="companyMemberEditName" value="${escapeHtml(member.name)}" ${state.loading || state.mutating ? 'disabled' : ''}>
                          </label>
                          <label class="field field-compact">
                            <span class="field-label">역할</span>
                            <select name="companyMemberEditRole" ${state.loading || state.mutating ? 'disabled' : ''}>
                              ${COMPANY_ROLE_OPTIONS.map((option) => `
                                <option value="${escapeHtml(option.value)}" ${member.role === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                              `).join('')}
                            </select>
                          </label>
                          <label class="field field-compact">
                            <span class="field-label">담당 데스크</span>
                            <select name="companyMemberEditSurface" ${state.loading || state.mutating ? 'disabled' : ''}>
                              ${COMPANY_DESK_OPTIONS.map((option) => `
                                <option value="${escapeHtml(option.surface)}" ${member.surface === option.surface ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                              `).join('')}
                            </select>
                          </label>
                        </div>
                      </section>
                    </div>
                    <div class="ops-form-footer ops-form-footer-row">
                      <div class="ops-form-footer-copy">
                        <span class="control-overview-label">반영</span>
                        <strong class="ops-form-footer-title">roster와 회사 구조에 반영합니다.</strong>
                      </div>
                      <div class="ops-form-footer-actions ops-form-footer-actions-inline">
                        <button class="danger-button" type="button" data-action="remove-company-member" data-id="${escapeHtml(member.id)}" ${state.loading || state.mutating ? 'disabled' : ''}>제거</button>
                        <button class="primary-button" type="submit" ${state.loading || state.mutating ? 'disabled' : ''}>배정 저장</button>
                      </div>
                    </div>
                  </form>
                `)
                .join('')}
              </div>
            </article>
          </section>
        </div>
      </section>
      </div>
    </div>
  `;
}

function getCurrentOverviewContext(data) {
  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncil =
    (selectedMission?.councilSessionId
      ? data.councilSessionMap.get(selectedMission.councilSessionId) || null
      : null) ||
    data.councilSessions[0] ||
    null;
  const selectedTask =
    data.taskMap.get(state.selectedTaskId) ||
    (selectedMission?.linkedTaskId ? data.taskMap.get(selectedMission.linkedTaskId) || null : null) ||
    data.tasks[0] ||
    null;
  const selectedRun =
    data.runMap.get(state.selectedRunId) ||
    (selectedTask?.latestRunId ? data.runMap.get(selectedTask.latestRunId) || null : null) ||
    data.runs[0] ||
    null;
  const selectedArtifact =
    data.artifactMap.get(state.selectedArtifactId) ||
    (selectedTask ? data.artifacts.find((artifact) => artifact.taskId === selectedTask.id) || null : null) ||
    data.artifacts[0] ||
    null;
  const selectedInboxItem =
    data.inboxItemMap.get(state.selectedInboxItemId) ||
    (selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null) ||
    data.inboxItems.find((item) => item.status === 'pending') ||
    null;
  const activeTask =
    selectedTask ||
    (selectedRun ? data.taskMap.get(selectedRun.taskId) || null : null) ||
    (selectedArtifact ? data.taskMap.get(selectedArtifact.taskId) || null : null) ||
    (selectedInboxItem ? data.taskMap.get(selectedInboxItem.taskId) || null : null) ||
    null;
  const pendingGateCount = data.inboxItems.filter((item) => item.status === 'pending').length;

  return {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedCouncil,
    selectedInboxItem,
    selectedMission,
    selectedRun,
    selectedTask,
  };
}

function getControlOverviewFocus(context) {
  const surface = state.surface;
  const {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedCouncil,
    selectedInboxItem,
    selectedMission,
    selectedRun,
  } = context;

  if (surface === 'mission') {
    const hasMission = Boolean(selectedMission);
    const selectedMissionLinkedTask =
      selectedMission?.linkedTaskId && activeTask?.id === selectedMission.linkedTaskId
        ? activeTask
        : null;
    const missionHandoff = getMissionHandoffState({
      mission: selectedMission,
      councilSession: selectedCouncil,
      linkedTask: selectedMissionLinkedTask,
    });

    return {
      title: selectedMission?.title || '열린 안건 없음',
      copy: selectedMission
        ? '안건과 다음 인계만 봅니다.'
        : '새 안건을 기다립니다.',
      owner: '운영자 · 안건 흐름',
      status: hasMission ? getMissionStatusDisplay(selectedMission.status) : missionHandoff.current,
      next: missionHandoff.next,
      evidence: selectedMission?.id || '미지정',
    };
  }

  if (surface === 'council') {
    return {
      title: selectedCouncil?.selectedPlan?.title || selectedMission?.title || '열린 회의 안건 없음',
      copy: selectedCouncil
        ? '권고안만 정리합니다.'
        : '회의 안건을 기다립니다.',
      owner: '회의 리드 + 참여 역할',
      status: selectedCouncil ? getCouncilStatusDisplay(selectedCouncil.status) : '회의 대기',
      next: selectedCouncil?.selectedPlan ? '실행 셀 인계' : '권고안 정리',
      evidence: selectedCouncil ? `${selectedCouncil.participants?.length || 0}명 참석` : '참석 대기',
    };
  }

  if (surface === 'execution' || surface === 'taskboard') {
    return {
      title: activeTask?.title || '열린 실행 셀 없음',
      copy: activeTask
        ? '막힘과 다음 실행만 봅니다.'
        : '실행 셀을 기다립니다.',
      owner: surface === 'taskboard' ? '실행 셀 · 관제' : '실행 역할 · 실행 흐름',
      status: getExecutionDeskStatus(activeTask),
      next: getExecutionDeskNext(activeTask),
      evidence: selectedRun?.id || activeTask?.id || '실행 대기',
    };
  }

  if (surface === 'deliverables' || surface === 'artifacts') {
    return {
      title: selectedArtifact?.id || activeTask?.title || '열린 결과 패킷 없음',
      copy: selectedArtifact
        ? '패킷과 승인선만 봅니다.'
        : '결과 패킷을 기다립니다.',
      owner: surface === 'artifacts' ? '증적 패킷 · 관제' : '결과 보고 · 보고 흐름',
      status: getDeliverablesDeskStatus(activeTask, selectedArtifact),
      next: getDeliverablesDeskNext(activeTask, selectedArtifact, pendingGateCount),
      evidence: selectedArtifact?.type ? getArtifactTypeDisplay(selectedArtifact.type) : '패킷 대기',
    };
  }

  if (surface === 'logs') {
    return {
      title: selectedRun?.id || '열린 실행 기록 없음',
      copy: selectedRun
        ? 'run 기록만 확인합니다.'
        : '실행 기록을 기다립니다.',
      owner: '실행 로그 · 관제',
      status: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedRun?.summary?.nextStage ? getExecutionStageDisplay(selectedRun.summary.nextStage) : '로그 추적 유지',
      evidence: activeTask?.id || '미지정',
    };
  }

  if (surface === 'decision-inbox') {
    return {
      title: selectedInboxItem?.title || '열린 승인 안건 없음',
      copy: selectedInboxItem
        ? '열린 승인 안건만 봅니다.'
        : '승인 안건을 기다립니다.',
      owner: '사람 게이트',
      status: selectedInboxItem ? getInboxStatusDisplay(selectedInboxItem.status) : '게이트 안정',
      next: selectedInboxItem?.status === 'pending' ? '결정 처리' : '게이트 유지',
      evidence: selectedInboxItem?.id || `${pendingGateCount}건`,
    };
  }

  return {
    title: getSurfaceDisplayName(surface),
    copy: '현재 표면만 확인합니다.',
    owner: SURFACE_DOCK_METADATA[surface]?.kicker || '표면',
    status: '대기',
    next: '표면 확인',
    evidence: '미지정',
  };
}

function getControlOverviewCheck(surface, context, data) {
  const {
    activeTask,
    pendingGateCount,
    selectedArtifact,
    selectedMission,
    selectedRun,
  } = context;

  if (state.error) {
    return {
      title: '런타임 연결 복구 필요',
      copy: state.error.message || '런타임 연결이 복구돼야 현재 데스크와 evidence rail이 다시 열립니다.',
      current: '런타임 오류',
      next: '새로고침 후 상태 재확인',
      evidence: 'runtime blocked',
      action: null,
    };
  }

  if (pendingGateCount > 0) {
    return {
      title: `사람 게이트 ${pendingGateCount}건`,
      copy: '사람 판단을 먼저 처리합니다.',
      current: `${pendingGateCount}건 대기`,
      next: '결정함 처리',
      evidence: activeTask?.id || 'pending gate',
      action:
        surface !== 'decision-inbox'
          ? {
              label: '결정함',
              targetSurface: 'decision-inbox',
            }
          : null,
    };
  }

  if (activeTask?.flags?.blocked) {
    return {
      title: '차단 사유 확인',
      copy: '차단 원인을 먼저 정리합니다.',
      current: '차단 상태',
      next: '실행 셀 재확인',
      evidence: activeTask.id,
      action: surface !== 'execution' ? { label: '실행', targetSurface: 'execution' } : null,
    };
  }

  if (surface === 'mission') {
    const missionHandoff = getMissionFirstRunHandoff(selectedMission, data);

    return {
      title: missionHandoff.title,
      copy: missionHandoff.copy,
      current: missionHandoff.current,
      next: missionHandoff.next,
      evidence: missionHandoff.evidence,
      action: missionHandoff.action,
    };
  }

  if (surface === 'council') {
    return {
      title: '실행 인계',
      copy: '권고안 정리 후 실행으로 넘깁니다.',
      current: '권고안 검토',
      next: '실행 셀 인계',
      evidence: activeTask?.id || selectedMission?.id || 'handoff pending',
      action: { label: '실행', targetSurface: 'execution' },
    };
  }

  if (surface === 'execution') {
    return {
      title: '결과 패킷',
      copy: '실행 후 결과 패킷으로 넘깁니다.',
      current: getExecutionDeskStatus(activeTask),
      next: '산출물 확인',
      evidence: selectedArtifact?.id || activeTask?.id || 'delivery pending',
      action: { label: '산출물', targetSurface: 'deliverables' },
    };
  }

  if (surface === 'deliverables') {
    return {
      title: '증적 보기',
      copy: '판단이 애매하면 증적부터 봅니다.',
      current: getDeliverablesDeskStatus(activeTask, selectedArtifact),
      next: '증적 패킷 확인',
      evidence: selectedArtifact?.id || activeTask?.id || 'artifact pending',
      action: { label: '아티팩트', targetSurface: 'artifacts' },
    };
  }

  if (surface === 'logs') {
    return {
      title: '실행 기록',
      copy: 'run과 다음 stage만 확인합니다.',
      current: selectedRun ? getRunStatusDisplay(selectedRun.status) : '기록 대기',
      next: selectedArtifact ? '증적 패킷 확인' : '로그 유지',
      evidence: selectedRun?.id || 'run pending',
      action: selectedArtifact ? { label: '아티팩트', targetSurface: 'artifacts' } : null,
    };
  }

  if (surface === 'artifacts') {
    return {
      title: '패킷 검토',
      copy: '패킷과 승인선만 이어서 봅니다.',
      current: selectedArtifact ? getArtifactTypeDisplay(selectedArtifact.type) : '패킷 대기',
      next: pendingGateCount > 0 ? '승인선 확인' : '패킷 정리 유지',
      evidence: selectedArtifact?.id || 'artifact pending',
      action: pendingGateCount > 0 ? { label: '결정함', targetSurface: 'decision-inbox' } : null,
    };
  }

  return {
    title: '현재 데스크',
    copy: '담당·상태·다음만 먼저 봅니다.',
    current: getSurfaceDisplayName(surface),
    next: '상세 확인',
    evidence: data.activeProject?.name || 'project pending',
    action: null,
  };
}

function renderControlOverview(data) {
  if (!elements.controlOverview) {
    return;
  }

  const activeGroupId = getActiveNavGroupId();
  document.body.dataset.navGroup = activeGroupId;
  document.body.dataset.surface = state.surface;
  const activeProject = data.activeProject;
  const activeRuns = data.runs.filter((run) => run.status === 'running').length;
  const context = getCurrentOverviewContext(data);

  elements.officeSidebarStatus.project.textContent = activeProject?.name || '미지정';
  elements.officeSidebarStatus.surface.textContent = getSurfaceDisplayName(state.surface);
  elements.officeSidebarStatus.runs.textContent = `${activeRuns}건`;
  elements.officeSidebarStatus.gates.textContent = `${context.pendingGateCount}건`;
  elements.refreshButton.disabled = state.loading || state.mutating;
  document.body.dataset.evidenceDensity = normalizeUiPreferences(state.uiPreferences).evidenceDensity;
  renderWorkspaceHeader(data, context);
  renderCompanyDirectory(data);
  if (elements.workspaceLiveStatus) {
    elements.workspaceLiveStatus.textContent = `현재 workspace: ${getSurfaceDisplayName(state.surface)}. 메뉴 그룹: ${getNavGroupLabel(activeGroupId)}`;
  }

  if (activeGroupId === 'review') {
    elements.controlOverview.innerHTML = renderReviewOverview(data, context, activeGroupId);
    return;
  }

  if (activeGroupId === 'ops') {
    elements.controlOverview.innerHTML = renderOpsOverview(data, context, activeGroupId);
    return;
  }

  elements.controlOverview.innerHTML = renderWorkflowsOverview(data, context, activeGroupId);
}

function renderNav(data) {
  const activeGroupId = getActiveNavGroupId();

  for (const tab of elements.navGroupTabs) {
    const groupId = tab.dataset.navGroupTab;
    const isActive = groupId === activeGroupId;

    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  }

  for (const group of elements.navGroups) {
    const groupId = group.dataset.navGroup;
    const isActive = groupId === activeGroupId;

    group.classList.toggle('is-active', isActive);
    group.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    group.setAttribute('tabindex', isActive ? '0' : '-1');

    if (isActive) {
      group.removeAttribute('hidden');
    } else {
      group.setAttribute('hidden', '');
    }
  }

  for (const button of elements.navButtons) {
    const surface = button.dataset.surface;
    const isActive = surface === state.surface;
    button.classList.toggle('is-active', isActive);
    const count = getSurfaceDockCount(data, surface);

    const label = getSurfaceDisplayName(button.dataset.surface);
    const guidance = SURFACE_NAV_GUIDANCE[surface] || '현재 desk의 상태와 다음 액션을 확인';
    button.innerHTML = `
      <span class="nav-button-main">
        <span class="nav-button-count">${escapeHtml(String(count))}</span>
        <span class="nav-button-copy">
          <span class="nav-button-title">${escapeHtml(label)}</span>
          <span class="nav-button-help">${escapeHtml(guidance)}</span>
        </span>
      </span>
    `;
    button.setAttribute('aria-controls', `surface-${surface}`);
    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
    button.setAttribute('aria-label', `${label} ${count}건. ${guidance}`);
  }
}

function renderProjectBootstrapPanel(data, options = {}) {
  const mode = options.mode === 'mission' ? 'mission' : 'advanced';
  const missionMode = mode === 'mission';
  const bootstrapState = missionMode
    ? data.projects.length === 0
      ? {
          copy: '여기서 첫 로컬 프로젝트를 등록한 뒤 바로 미션 생성으로 넘어갑니다.',
          title: '미션 시작',
        }
      : {
          copy: '여기서 등록된 프로젝트를 고르거나 새로 등록한 뒤 미션 경로를 이어갑니다.',
          title: '미션 프로젝트 진입',
        }
    : getProjectBootstrapState(data);
  const projectActionDisabled = state.loading || state.mutating;
  const linkedWorktreeActionDisabled = projectActionDisabled || !data.activeProject;
  const linkedWorktreePanel = missionMode
    ? ''
    : renderLinkedWorktreeSwitchPanel(data, projectActionDisabled);
  const createProjectPack =
    state.projectDraftPack === 'knowledge-work' ? 'knowledge-work' : 'development';
  const createProjectProviderMode =
    state.projectDraftProviderMode === 'live' ? 'live' : 'local-stub';
  const activeProjectProviderConfig = getProjectProviderConfig(data.activeProject);
  const activeProjectProviderSummary = getProviderExecutionSummary(data.activeProject, data);
  const activeProjectBaseName = data.activeProject
    ? data.activeProject.projectPath.split('/').filter(Boolean).pop() || 'project'
    : 'project';
  const projectList = data.projects.length
    ? `
        <div class="project-list">
          ${data.projects
            .map(
              (project) => {
                const providerConfig = getProjectProviderConfig(project);
                const providerSummary = getProviderExecutionSummary(project, data);

                return `
                  <button
                    class="list-button ${project.id === data.activeProject?.id ? 'is-selected' : ''}"
                    type="button"
                    data-action="select-project"
                    data-id="${escapeHtml(project.id)}"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <div class="card-title-row">
                      <strong>${escapeHtml(project.name)}</strong>
                      ${
                        project.id === data.activeProject?.id
                          ? createToken('활성', 'success')
                          : createToken('등록됨', 'neutral')
                      }
                    </div>
                    <p class="list-copy">${escapeHtml(project.projectPath)}</p>
                    <div class="token-row">
                      ${createToken(getPackDisplayName(project.pack || 'development'), 'neutral')}
                      ${createToken(
                        `준비도:${getProviderReadinessDisplay(project.readiness || 'unknown')}`,
                        'neutral',
                      )}
                      ${
                        missionMode
                          ? ''
                          : createToken(`프로바이더:${providerConfig.adapter}`, providerConfig.mode === 'live' ? 'accent' : 'neutral')
                      }
                      ${
                        missionMode
                          ? ''
                          : providerSummary
                            ? createToken(
                                `프로바이더준비:${getProviderReadinessDisplay(
                                  providerSummary.readiness || 'unknown',
                                )}`,
                                providerSummary.allowed
                                  ? 'success'
                                  : providerSummary.readiness === 'error'
                                    ? 'danger'
                                    : 'warning',
                              )
                            : ''
                      }
                    </div>
                  </button>
                `;
              },
            )
            .join('')}
        </div>
      `
    : `
        <div class="empty-state">
          <strong>등록된 프로젝트 없음</strong>
          <p>로컬 프로젝트 경로를 먼저 등록하세요.</p>
        </div>
      `;

  return `
    <section class="project-bootstrap">
      <div class="panel-header">
        <div>
          <h3>${escapeHtml(bootstrapState.title)}</h3>
          <p class="panel-copy">${escapeHtml(bootstrapState.copy)}</p>
        </div>
          ${
            data.activeProject
              ? `<div class="token-row">
                ${createToken(`활성:${data.activeProject.name}`, 'success')}
              </div>`
            : ''
        }
      </div>
      ${projectList}
      ${linkedWorktreePanel}
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="update-project-provider">
              <div class="panel-header">
                <div>
                  <h4>실행 프로바이더</h4>
                  <p class="panel-copy">프로젝트 단위 명시 선택만 허용합니다. 기본값은 로컬 스텁(local-stub)을 유지하고, 라이브 모드는 절대 조용히 다른 모드로 바뀌지 않습니다.</p>
                </div>
                <div class="token-row">
                  ${createToken(`프로바이더:${activeProjectProviderConfig.adapter}`, activeProjectProviderConfig.mode === 'live' ? 'accent' : 'neutral')}
                  ${
                    activeProjectProviderSummary
                      ? createToken(
                          `프로바이더준비:${getProviderReadinessDisplay(
                            activeProjectProviderSummary.readiness || 'unknown',
                          )}`,
                          activeProjectProviderSummary.allowed
                            ? 'success'
                            : activeProjectProviderSummary.readiness === 'error'
                              ? 'danger'
                              : 'warning',
                        )
                      : ''
                  }
                </div>
              </div>
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">모드</span>
                  <select
                    name="editProjectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${state.projectProviderDraftMode === 'local-stub' ? 'selected' : ''}>로컬 스텁 (local-stub)</option>
                    <option value="live" ${state.projectProviderDraftMode === 'live' ? 'selected' : ''}>OpenAI Responses (openai-responses)</option>
                  </select>
                </label>
                ${
                  state.projectProviderDraftMode === 'live'
                    ? `
                      <label class="field">
                        <span class="field-label">모델</span>
                        <input
                          type="text"
                          name="editProjectProviderModel"
                          value="${escapeHtml(state.projectProviderDraftModel)}"
                          placeholder="운영자 선택 모델"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                      <label class="field">
                        <span class="field-label">API 키 환경변수</span>
                        <input
                          type="text"
                          name="editProjectProviderApiKeyVar"
                          value="${escapeHtml(state.projectProviderDraftApiKeyVar)}"
                          placeholder="OPENAI_API_KEY"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                    `
                    : ''
                }
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
                  프로바이더 업데이트
                </button>
                <p class="form-help">
                  ${
                    activeProjectProviderSummary?.reasons?.length
                      ? escapeHtml(activeProjectProviderSummary.reasons[0])
                      : '여기에는 비밀이 아닌 설정 정보만 저장합니다. 라이브 모드는 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토를 활성화하고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남깁니다.'
                  }
                </p>
              </div>
            </form>
          `
          : ''
      }
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="create-linked-worktree">
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">워크트리 슬러그</span>
                  <input
                    type="text"
                    name="linkedWorktreeSlug"
                    value="${escapeHtml(state.linkedWorktreeDraftSlug)}"
                    placeholder="feature-x"
                    ${linkedWorktreeActionDisabled ? 'disabled' : ''}
                  >
                </label>
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${linkedWorktreeActionDisabled ? 'disabled' : ''}>
                  연결 워크트리 만들기
                </button>
                <p class="form-help">형제 경로 <code>${escapeHtml(`${activeProjectBaseName}--<slug>`)}</code>에 <code>worktree/&lt;slug&gt;</code> 브랜치를 만들고, 기존 프로젝트 등록/선택 흐름을 재사용해 새 연결 루트를 활성 상태로 전환합니다. 기존 브랜치나 경로 충돌이 있으면 실패하므로 그 경우에는 탐지된 전환 목록을 사용합니다.</p>
              </div>
            </form>
          `
          : ''
      }
      <form class="task-create-form project-create-form" data-form="${missionMode ? 'create-project-from-mission' : 'create-project'}">
        <div class="field-grid">
          <label class="field">
            <span class="field-label">프로젝트 이름</span>
            <input
              type="text"
              name="projectName"
              value="${escapeHtml(state.projectDraftName)}"
              placeholder="orchestration"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          <label class="field">
            <span class="field-label">프로젝트 경로 (project_path)</span>
            <input
              type="text"
              name="projectPath"
              value="${escapeHtml(state.projectDraftPath)}"
              placeholder="/absolute/path/to/project"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          <label class="field">
            <span class="field-label">팩</span>
            <select
              name="projectPack"
              ${projectActionDisabled ? 'disabled' : ''}
            >
              <option value="development" ${createProjectPack === 'development' ? 'selected' : ''}>개발 (development)</option>
              <option value="knowledge-work" ${createProjectPack === 'knowledge-work' ? 'selected' : ''}>지식 작업 (knowledge-work)</option>
            </select>
          </label>
          ${
            !missionMode
              ? `
                <label class="field">
                  <span class="field-label">프로바이더 모드</span>
                  <select
                    name="projectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${createProjectProviderMode === 'local-stub' ? 'selected' : ''}>로컬 스텁 (local-stub)</option>
                    <option value="live" ${createProjectProviderMode === 'live' ? 'selected' : ''}>OpenAI Responses (openai-responses)</option>
                  </select>
                </label>
              `
              : ''
          }
          ${
            !missionMode && createProjectProviderMode === 'live'
              ? `
                <label class="field">
                  <span class="field-label">프로바이더 모델</span>
                  <input
                    type="text"
                    name="projectProviderModel"
                    value="${escapeHtml(state.projectDraftProviderModel)}"
                    placeholder="운영자 선택 모델"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
                <label class="field">
                  <span class="field-label">API 키 환경변수</span>
                  <input
                    type="text"
                    name="projectProviderApiKeyVar"
                    value="${escapeHtml(state.projectDraftProviderApiKeyVar)}"
                    placeholder="OPENAI_API_KEY"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
              `
              : ''
          }
        </div>
        <div class="form-actions">
          <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
            ${missionMode ? '이 프로젝트로 시작' : '프로젝트 등록'}
          </button>
          <p class="form-help">
            ${
              missionMode
                ? `${PACK_HELP_COPY[createProjectPack]} 미션 진입은 항상 로컬 스텁(local-stub) 기본값으로 시작합니다. 프로바이더와 연결 워크트리 제어는 고급 운영 모드에 남습니다.`
                : createProjectProviderMode === 'live'
                ? `${PACK_HELP_COPY[createProjectPack]} 라이브 모드는 비밀이 아닌 설정 정보만 저장합니다. 모델과 환경변수가 유효할 때 기획 셀, 설계 셀, 분해 셀, 사전 점검, 라이브 변경, 리뷰 검토가 라이브 모드로 실행되고, 커밋 패키지, 로컬 커밋, 릴리스 패키지, 종료 정리는 계속 명시적인 로컬 후속 단계로 남습니다.`
                : `${PACK_HELP_COPY[createProjectPack]} 프로젝트를 등록하고 로컬 스텁(local-stub)을 기본 실행 프로바이더로 유지한 채 해당 프로젝트를 활성 상태로 만듭니다.`
            }
          </p>
        </div>
      </form>
    </section>
  `;
}

function renderLlmMissionLead(data, selectedMission = null) {
  const projectName = data.activeProject?.name || '프로젝트 선택 필요';
  const missionState = selectedMission
    ? `${getMissionStatusDisplay(selectedMission.status)} · ${selectedMission.id}`
    : '새 미션';

  return `
    <section class="llm-mission-lead" aria-labelledby="llm-mission-prompt-title">
      <div class="llm-mission-presence" aria-label="현재 실행 문맥">
        <span class="llm-presence-dot" aria-hidden="true"></span>
        <span>${escapeHtml(projectName)}</span>
        <span aria-hidden="true">/</span>
        <span>${escapeHtml(missionState)}</span>
      </div>
      <h2 id="llm-mission-prompt-title">무엇을 진행할까요?</h2>
      <p>목표와 필요한 경계를 적으면 역할별 검토부터 시작합니다.</p>
    </section>
  `;
}

function renderLlmMissionWorkstream(options = {}) {
  const mission = options.mission || null;

  if (!mission) {
    return `
      <section class="llm-workstream llm-workstream-empty" aria-label="미션 workstream">
        <div class="llm-empty-mark" aria-hidden="true">O</div>
        <strong>아직 진행 중인 미션이 없습니다.</strong>
        <p>위 composer에서 첫 목표를 등록하세요.</p>
      </section>
    `;
  }

  const council = options.council || {};
  const execution = options.execution || {};
  const deliverables = options.deliverables || {};
  const nextAction = options.nextAction || {};
  const linkedTask = options.linkedTask || null;
  const councilSession = council.councilSession || null;
  const councilStatus = councilSession
    ? `${getAlignmentStatusDisplay(council.alignmentStatus)} · ${council.participantCount || 0} roles`
    : '대기 중';
  const councilCopy = councilSession
    ? council.recommendationPreview || council.selectedPlanTitle || '회의 합의안을 검토하고 있습니다.'
    : '목표를 역할별 관점으로 나눌 Council session이 아직 열리지 않았습니다.';
  const executionStatus = linkedTask
    ? getTaskLifecycleDisplay(linkedTask.lifecycleState)
    : '실행 전';
  const executionCopy = linkedTask
    ? execution.stagePreview || `${linkedTask.id}의 bounded execution 상태를 확인합니다.`
    : '합의된 계획과 operator gate가 준비되면 WorkOrder 실행이 이어집니다.';
  const currentArtifact = deliverables.currentDeliverableArtifact || null;
  const deliveryStatus = currentArtifact
    ? getArtifactTypeDisplay(currentArtifact.type)
    : '결과 대기';
  const deliveryCopy = currentArtifact
    ? `현재 결과 ${currentArtifact.id} · 리뷰 ${getReviewStatusDisplay(deliverables.latestReviewStatus)}`
    : '검증과 리뷰를 통과한 결과 패킷이 여기에 이어집니다.';
  const nextSurface = nextAction.surface || 'mission';
  const nextLabel = nextAction.actionLabel || '현재 상태 확인';
  const workstreamEntries = [
    {
      role: 'Operator',
      mark: 'U',
      tone: 'operator',
      status: getMissionStatusDisplay(mission.status),
      title: mission.title,
      copy: mission.goal || '기록된 미션 목표가 없습니다.',
    },
    {
      role: 'Council',
      mark: 'C',
      tone: 'council',
      status: councilStatus,
      title: councilSession ? council.selectedPlanTitle || '역할별 정렬' : '역할별 정렬 대기',
      copy: councilCopy,
    },
    {
      role: 'Execution',
      mark: 'E',
      tone: 'execution',
      status: executionStatus,
      title: linkedTask ? linkedTask.title || linkedTask.id : 'WorkOrder 실행 대기',
      copy: executionCopy,
    },
    {
      role: 'Deliverables',
      mark: 'D',
      tone: 'deliverables',
      status: deliveryStatus,
      title: currentArtifact ? '검증된 결과 패킷' : '결과 패킷 대기',
      copy: deliveryCopy,
    },
  ];

  return `
    <section class="llm-workstream" aria-labelledby="llm-workstream-title">
      <div class="llm-section-heading">
        <div>
          <p>Current thread</p>
          <h3 id="llm-workstream-title">${escapeHtml(mission.title)}</h3>
        </div>
        ${createToken(`다음:${getSurfaceDisplayName(nextSurface)}`, nextAction.tone || 'neutral')}
      </div>
      <ol class="llm-turn-list">
        ${workstreamEntries
          .map(
            (entry) => `
              <li class="llm-turn llm-turn-${escapeHtml(entry.tone)}">
                <div class="llm-turn-marker" aria-hidden="true">${escapeHtml(entry.mark)}</div>
                <div class="llm-turn-content">
                  <div class="llm-turn-meta">
                    <strong>${escapeHtml(entry.role)}</strong>
                    <span>${escapeHtml(entry.status)}</span>
                  </div>
                  <h4>${escapeHtml(entry.title)}</h4>
                  <p>${escapeHtml(entry.copy)}</p>
                </div>
              </li>
            `,
          )
          .join('')}
      </ol>
      <div class="llm-next-gate">
        <div>
          <span>Next gate</span>
          <strong>${escapeHtml(nextLabel)}</strong>
          <p>${escapeHtml(nextAction.summary || '현재 evidence를 확인한 뒤 다음 단계를 선택합니다.')}</p>
        </div>
        ${
          nextSurface !== 'mission'
            ? `
              <button
                class="primary-button llm-next-gate-button"
                type="button"
                data-action="open-surface-for-mission"
                data-id="${escapeHtml(mission.id)}"
                data-target-surface="${escapeHtml(nextSurface)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                ${escapeHtml(getSurfaceDisplayName(nextSurface))} 열기
              </button>
            `
            : ''
        }
      </div>
    </section>
  `;
}

function renderMissionViewSelector(mission) {
  const graphDisabled = !mission || state.loading || state.mutating;

  return `
    <div class="mission-view-selector" role="tablist" aria-label="미션 표시 방식">
      <button
        type="button"
        role="tab"
        aria-selected="${state.missionViewMode === 'thread'}"
        class="mission-view-option ${state.missionViewMode === 'thread' ? 'is-selected' : ''}"
        data-action="set-mission-view"
        data-view-mode="thread"
      >Thread</button>
      <button
        type="button"
        role="tab"
        aria-selected="${state.missionViewMode === 'graph'}"
        class="mission-view-option ${state.missionViewMode === 'graph' ? 'is-selected' : ''}"
        data-action="set-mission-view"
        data-view-mode="graph"
        ${graphDisabled ? 'disabled' : ''}
      >Graph</button>
    </div>
  `;
}

function renderLlmMissionInspector(options = {}) {
  const mission = options.mission || null;

  if (!mission) {
    return `
      <section class="llm-context-summary" aria-label="현재 mission context">
        <p class="llm-context-label">Context</p>
        <h3>새 미션</h3>
        <p>프로젝트는 선택됐고 아직 목표가 등록되지 않았습니다.</p>
        <dl>
          <div><dt>Project</dt><dd>${escapeHtml(options.project?.name || '미지정')}</dd></div>
          <div><dt>Authority</dt><dd>review + approval gated</dd></div>
        </dl>
      </section>
    `;
  }

  const nextAction = options.nextAction || {};
  const linkedTask = options.linkedTask || null;
  const loop = options.loop || {};

  return `
    <section class="llm-context-summary" aria-label="현재 mission context">
      <p class="llm-context-label">Context</p>
      <h3>${escapeHtml(mission.title)}</h3>
      <p>${escapeHtml(mission.constraints || '추가 경계가 기록되지 않았습니다.')}</p>
      <dl>
        <div><dt>Project</dt><dd>${escapeHtml(options.project?.name || '미지정')}</dd></div>
        <div><dt>Mission</dt><dd>${escapeHtml(mission.id)}</dd></div>
        <div><dt>Loop</dt><dd>${escapeHtml(loop.stageLabel || '대기')}</dd></div>
        <div><dt>Task</dt><dd>${escapeHtml(linkedTask?.id || '미연결')}</dd></div>
        <div><dt>Next</dt><dd>${escapeHtml(nextAction.actionLabel || '현재 상태 확인')}</dd></div>
      </dl>
      <div class="llm-authority-note">
        <span class="llm-presence-dot" aria-hidden="true"></span>
        <span>review before done · approval before commit</span>
      </div>
    </section>
  `;
}

function renderMission(data) {
  if (!data.activeProject) {
    elements.surfaces.mission.innerHTML = `
      <div class="llm-project-entry">
        ${renderLlmMissionLead(data)}
      </div>
      <div class="surface-grid llm-project-bootstrap-layout">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>미션</h2>
              <p class="panel-copy">프로젝트를 먼저 고른 뒤 미션을 만듭니다.</p>
            </div>
            <div class="token-row">
              ${createToken(`등록 프로젝트:${data.projects.length}`, data.projects.length > 0 ? 'neutral' : 'warning')}
            </div>
          </div>
          ${renderProjectBootstrapPanel(data, { mode: 'mission' })}
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>미션 진입</h2>
              <p class="panel-copy">프로젝트 선택은 여기서 시작하고, 프로바이더와 워크트리 같은 세부 제어는 고급 운영 모드에 남깁니다.</p>
            </div>
          </div>
          <div class="stack">
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>권장 첫 단계</strong>
                ${createToken('오케스트레이션 우선', 'success')}
              </div>
              <p class="detail-copy">위에서 프로젝트를 고른 뒤 첫 미션을 만드세요.</p>
            </section>
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>고급 운영에 남는 것</strong>
                ${createToken('프로바이더/워크트리/세부 제어', 'warning')}
              </div>
              <p class="detail-copy">프로바이더, 워크트리, 로그, 아티팩트, 결정함은 고급 운영 모드에 남습니다.</p>
            </section>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedMissionCompletion = getMissionCompletionSummary(selectedMission, data);
  const selectedMissionCouncilPreview = getMissionCouncilPreview(selectedMission, data);
  const selectedMissionExecutionPreview = getMissionExecutionPreview(selectedMission, data);
  const selectedMissionDeliverablesPreview = getMissionDeliverablesPreview(selectedMission, data);
  const selectedMissionNextActionPreview = getMissionNextActionPreview(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
  });
  const missionLoopStatus = getMissionLoopStatus(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
  });
  const selectedMissionBriefControl = getMissionBriefControlSnapshot(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
    nextActionPreview: selectedMissionNextActionPreview,
  });
  const linkedTask = selectedMissionCompletion.linkedTask;
  const closeOutState = selectedMissionCompletion.closeOutState;
  const missionCompletionReady = selectedMissionCompletion.completionReady;
  const missionCompletionArtifactId = selectedMissionCompletion.closeOutArtifactId;
  const missionCompletionReleasePackageId = selectedMissionCompletion.releasePackageArtifactId;
  const selectedCouncilSession = selectedMissionCouncilPreview.councilSession;
  const missionEvidenceRail = renderExecutionEvidenceRail(getExecutionEvidenceRail(linkedTask, data), {
    eyebrow: '역할 인계 미리보기',
    heading: '회의에서 실행으로 넘어갈 증적만 먼저 봅니다',
    copy: 'Mission은 연결된 실행 셀의 아티팩트, run, 준비 상태, 리뷰 기준 사실만 작은 증적선으로 먼저 봅니다.',
    compact: true,
  });
  const missionNextSurface = selectedMissionNextActionPreview.surface || 'mission';
  const missionSignalBySurface = Object.fromEntries(
    getCompanySignalEntries({
      mission: selectedMission,
      councilSession: selectedCouncilSession,
      linkedTask,
      completionReady: missionCompletionReady,
    }).map((entry) => [entry.surface, entry]),
  );
  const missionViewportStrip = renderViewportHandoffStrip({
    eyebrow: '등록대장 인계선',
    heading: '등록, 배정, 다음 처리를 같은 보드에서 나눕니다',
    copy:
      '왼쪽은 신규 안건 등록과 현재 안건 대장을 다루고, 오른쪽은 현재 판단과 가장 먼저 열어야 할 처리선을 보여 줍니다.',
    tokens: [
      createToken(
        `안건수:${data.missions.length}`,
        data.missions.length > 0 ? 'neutral' : 'warning',
      ),
      createToken(`다음:${getSurfaceDisplayName(missionNextSurface)}`, selectedMissionNextActionPreview.tone),
      selectedMission ? createToken(`등록안건:${selectedMission.id}`, 'accent') : createToken('등록안건:없음', 'warning'),
    ],
    cards: [
      {
        label: '접수 라인',
        title: '신규 등록 + 현재 안건',
        copy: '제목과 목표를 등록하고, 바로 아래 등록대장에서 현재 안건을 고릅니다.',
        signal: missionSignalBySurface.mission,
      },
      {
        label: '배정 판단선',
        title: '현재 판단 + 배정 상태',
        copy: '선택된 안건의 상태와 연결된 회의, 실행, 보고 흐름을 먼저 정리합니다.',
        signal: missionSignalBySurface['decision-inbox'],
      },
      {
        label: '다음 처리 트리거',
        title: selectedMission
          ? `${getSurfaceDisplayName(missionNextSurface)} · ${selectedMissionNextActionPreview.actionLabel}`
          : '먼저 안건 등록',
        copy: selectedMission
          ? selectedMissionNextActionPreview.summary
          : '왼쪽 접수 라인에서 첫 안건을 등록하면 회의와 판단선이 함께 열립니다.',
        emphasis: true,
        signal: missionSignalBySurface[missionNextSurface] || missionSignalBySurface.mission,
        button:
          selectedMission && missionNextSurface !== 'mission'
            ? {
                action: 'open-surface-for-mission',
                id: selectedMission.id,
                targetSurface: missionNextSurface,
                label: `${getSurfaceDisplayName(missionNextSurface)} 열기`,
                disabled: state.loading || state.mutating,
              }
            : null,
      },
    ],
  });
  const selectedMissionActiveSnapshotItems = missionCompletionReady
    ? []
    : [
        {
          label: '회의',
          copy: selectedCouncilSession
            ? `정렬 ${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)} · ${selectedMissionCouncilPreview.selectedPlanTitle}`
            : '참모 회의 초안이 아직 없습니다.',
          surface: 'council',
          tone: selectedCouncilSession
            ? getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus)
            : 'warning',
        },
        {
          label: '실행',
          copy: linkedTask
            ? `${getTaskLifecycleDisplay(linkedTask.lifecycleState)} · ${selectedMissionExecutionPreview.actionLabel}`
            : '연결된 실행 셀이 아직 없습니다.',
          surface: 'execution',
          tone: 'accent',
        },
        {
          label: '보고',
          copy: `${selectedMissionDeliverablesPreview.currentDeliverableArtifact?.type || '아티팩트 없음'} · 리뷰 ${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)} · 승인 ${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval?.status || 'none')}`,
          surface: 'deliverables',
          tone: 'neutral',
        },
        {
          label: '다음',
          copy: `${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}에서 ${selectedMissionNextActionPreview.actionLabel}`,
          surface: selectedMissionNextActionPreview.surface,
          tone: selectedMissionNextActionPreview.tone,
        },
      ];
  const missionUsesKnowledgeWork = data.activeProject?.pack === 'knowledge-work';
  const missionCreateDisabled = state.loading || state.mutating;
  const missionCouncilProviderReadiness =
    data.councilProviderReadinessSummaries?.[data.activeProject?.id] || null;
  const missionCouncilProviderReady = missionCouncilProviderReadiness?.allowed === true;
  const linkedTaskCreateDisabled =
    state.loading || state.mutating || !selectedMission || Boolean(selectedMission.linkedTaskId);
  const missionEntries = data.missions.map((mission) => ({
    councilPreview: getMissionCouncilPreview(mission, data),
    completion: getMissionCompletionSummary(mission, data),
    deliverablesPreview: getMissionDeliverablesPreview(mission, data),
    executionPreview: getMissionExecutionPreview(mission, data),
    nextActionPreview: getMissionNextActionPreview(mission, {
      completion: getMissionCompletionSummary(mission, data),
      council: getMissionCouncilPreview(mission, data),
      deliverables: getMissionDeliverablesPreview(mission, data),
      execution: getMissionExecutionPreview(mission, data),
    }),
    mission,
  }));
  const activeMissionEntries = missionEntries.filter(({ completion }) => !completion.completionReady);
  const completedMissionEntries = missionEntries.filter(({ completion }) => completion.completionReady);
  const renderMissionRows = (entries, emptyTitle, emptyCopy, emptyStateClass) => {
    if (entries.length === 0) {
      return `
        <div class="empty-state empty-state-inline mission-empty-state mission-empty-state-row ${escapeHtml(emptyStateClass)}">
          <strong class="mission-empty-title">${escapeHtml(emptyTitle)}</strong>
          <p class="mission-empty-copy">${escapeHtml(emptyCopy)}</p>
        </div>
      `;
    }

    return `
      <div class="project-list">
        ${entries
          .map(({ mission, completion, councilPreview, deliverablesPreview, executionPreview, nextActionPreview }) => {
            const missionTask = completion.linkedTask;
            const missionSurfaceLabel = getSurfaceDisplayName(nextActionPreview.surface);
            const missionSignalBySurface = Object.fromEntries(
              getCompanySignalEntries({
                mission,
                councilSession: councilPreview.councilSession,
                linkedTask: missionTask,
                completionReady: completion.completionReady,
              }).map((entry) => [entry.surface, entry]),
            );
            const missionRailEntries = getMissionSurfaceRailEntries(mission, {
              completion,
              council: councilPreview,
              deliverables: deliverablesPreview,
              execution: executionPreview,
              nextActionPreview,
            });
            const missionRowSummary = completion.completionReady
              ? `종료 정리 ${completion.closeOutArtifactId || '준비 중'} · 다음 안건을 바로 준비할 수 있습니다.`
              : `회의 ${getAlignmentStatusDisplay(councilPreview.alignmentStatus)} · 실행 ${
                  missionTask ? getTaskLifecycleDisplay(missionTask.lifecycleState) : '준비 전'
                }`;
            const missionRowNextCopy = completion.completionReady
              ? '다음: 미션에서 다음 안건 준비'
              : `다음: ${missionSurfaceLabel}에서 ${nextActionPreview.actionLabel}`;
            const missionRowTokens = completion.completionReady
              ? `
                  ${createToken('완료:봉인', 'success')}
                  ${
                    mission.linkedTaskId
                      ? createToken(`연결태스크:${mission.linkedTaskId}`, 'accent')
                      : createToken('연결태스크:없음', 'warning')
                  }
                  ${
                    completion.closeOutArtifactId
                      ? createToken(`close-out:${completion.closeOutArtifactId}`, 'neutral')
                      : ''
                  }
                  ${createToken('다음안건:준비', 'success')}
                `
              : `
                  ${
                    councilPreview.councilSession
                      ? createToken(
                          `정렬:${getAlignmentStatusDisplay(councilPreview.alignmentStatus)}`,
                          getAlignmentTone(councilPreview.alignmentStatus),
                        )
                      : createToken('정렬:없음', 'warning')
                  }
                  ${
                    missionTask
                      ? createToken(`실행:${getTaskLifecycleDisplay(missionTask.lifecycleState)}`, 'neutral')
                      : createToken('실행:준비 전', 'warning')
                  }
                  ${
                    deliverablesPreview.currentDeliverableArtifact
                      ? createToken(`보고:${deliverablesPreview.currentDeliverableArtifact.type}`, 'neutral')
                      : createToken('보고:없음', 'neutral')
                  }
                  ${createToken(`다음:${missionSurfaceLabel}`, nextActionPreview.tone)}
                  ${
                    missionTask?.flags?.waitingApproval
                      ? createToken('승인대기', 'accent')
                      : missionTask?.flags?.blocked
                        ? createToken('차단', 'danger')
                        : missionTask?.flags?.waitingDecision
                          ? createToken('결정대기', 'warning')
                          : ''
                  }
                `;

            return `
              <article class="card mission-row-card ${mission.id === selectedMission?.id ? 'is-selected' : ''}">
                <button
                  class="list-button mission-row-button"
                  type="button"
                  data-action="select-mission"
                  data-id="${escapeHtml(mission.id)}"
                  ${state.loading || state.mutating ? 'disabled' : ''}
                >
                  <div class="card-title-row mission-row-head">
                    <strong>${escapeHtml(mission.title)}</strong>
                    <div class="token-row token-row-compact">
                      ${createToken(getMissionStatusDisplay(mission.status), getMissionStatusTone(mission.status))}
                      ${
                        mission.deliverableType
                          ? createToken(
                              `산출물:${getKnowledgeWorkDeliverableDisplayName(mission.deliverableType)}`,
                              'neutral',
                            )
                          : ''
                      }
                      ${createToken(`다음:${missionSurfaceLabel}`, nextActionPreview.tone)}
                    </div>
                  </div>
                  <p class="list-copy list-copy-compact mission-row-goal">${escapeHtml(mission.goal || '기록된 미션 목표가 없습니다.')}</p>
                  <p class="list-copy list-copy-compact mission-row-summary">${escapeHtml(missionRowSummary)}</p>
                  <div class="mission-row-foot">
                    <div class="token-row token-row-compact">${missionRowTokens}</div>
                    <p class="list-copy list-copy-compact mission-row-next">${escapeHtml(missionRowNextCopy)}</p>
                  </div>
                </button>
                <div class="mission-row-rail">
                  ${missionRailEntries
                    .map((entry) => {
                      const railSignal = missionSignalBySurface[entry.surface] || {
                        label: entry.label,
                        status: entry.status,
                        tone: entry.tone,
                      };

                      return `
                        <button
                          class="mission-row-rail-button ${entry.isNext ? 'mission-row-rail-button-next' : ''}"
                          type="button"
                          data-action="open-surface-for-mission"
                          data-id="${escapeHtml(mission.id)}"
                          data-target-surface="${escapeHtml(entry.surface)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          <div class="mission-row-rail-signal mission-row-rail-signal-${escapeHtml(railSignal.tone || 'neutral')}">
                            <span class="mission-row-rail-signal-dot"></span>
                            <span class="mission-row-rail-signal-label">${escapeHtml(railSignal.label || 'signal')}</span>
                            <strong class="mission-row-rail-signal-status">${escapeHtml(railSignal.status || '')}</strong>
                          </div>
                          <strong class="mission-row-rail-label">${escapeHtml(entry.label)}</strong>
                          <span class="mission-row-rail-status">${escapeHtml(entry.status)}</span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  };
  const missionList = data.missions.length
    ? `
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>진행 안건 등록대장</strong>
              <div class="token-row">
                ${createToken(`수:${activeMissionEntries.length}`, activeMissionEntries.length > 0 ? 'neutral' : 'warning')}
              </div>
            </div>
            <p class="detail-copy detail-copy-compact">현재 배정 중인 안건만 모읍니다.</p>
          </section>
          ${renderMissionRows(
            activeMissionEntries,
            '진행 안건 없음',
            '위 등록대장에서 새 안건을 올리면 바로 이 줄에 이어집니다.',
            'mission-empty-state-active-row',
          )}
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>종료 안건 보관대장</strong>
              <div class="token-row">
                ${createToken(`수:${completedMissionEntries.length}`, completedMissionEntries.length > 0 ? 'success' : 'neutral')}
              </div>
            </div>
            <p class="detail-copy detail-copy-compact">종료 정리까지 끝난 안건만 따로 보관합니다.</p>
          </section>
          ${renderMissionRows(
            completedMissionEntries,
            '종료 안건 없음',
            '종료 정리까지 끝난 안건이 생기면 이 줄에 보관됩니다.',
            'mission-empty-state-complete-row',
          )}
        </div>
      `
    : `
        <div class="empty-state mission-empty-state mission-empty-state-list">
          <strong class="mission-empty-title">등록 안건 없음</strong>
          <p class="mission-empty-copy">위 등록대장에서 첫 안건을 만들면 이곳에 바로 쌓입니다.</p>
        </div>
      `;

  elements.surfaces.mission.innerHTML = `
    <div class="stack llm-mission-stack">
      ${renderLlmMissionLead(data, selectedMission)}
      ${renderMissionIntakeBoard({
        project: data.activeProject,
        mission: selectedMission,
        councilSession: selectedCouncilSession,
        nextActionPreview: selectedMissionNextActionPreview,
        activeCount: activeMissionEntries.length,
        completedCount: completedMissionEntries.length,
        missionCount: data.missions.length,
        draftTitle: state.missionDraftTitle,
        draftGoal: state.missionDraftGoal,
      })}
      ${missionViewportStrip}
      <div class="surface-grid llm-mission-layout ${state.missionViewMode === 'graph' ? 'llm-mission-layout-graph' : ''}">
      <section class="surface-panel llm-mission-main">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>안건 등록대장</h2>
            <p class="panel-copy panel-copy-tight">왼쪽은 신규 안건 등록과 현재 안건 배정만 둡니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(`프로젝트:${data.activeProject.name}`, 'success')}
            ${createToken(`미션수:${data.missions.length}`, 'neutral')}
          </div>
        </div>
        <form class="task-create-form task-create-form-compact mission-order-desk llm-mission-composer" data-form="create-mission">
          <div class="mission-order-head">
            <div class="stack">
              <strong>신규 안건 등록</strong>
              <p class="detail-copy detail-copy-compact">
                ${
                  missionUsesKnowledgeWork
                    ? '안건을 등록하면 선택한 산출물 유형으로 회의 안건이 바로 열리고, 다음 처리 트리거가 같이 준비됩니다.'
                    : '안건을 등록하면 회의 안건이 바로 열리고, 다음 처리 트리거가 같이 준비됩니다.'
                }
              </p>
            </div>
            <div class="token-row token-row-compact">
              ${createToken('등록 대기', 'accent')}
              ${createToken('회의 자동 호출', 'success')}
              ${missionUsesKnowledgeWork ? createToken('문서형 안건', 'neutral') : ''}
            </div>
          </div>
          <div class="mission-order-main">
            <label class="field field-compact">
              <span class="field-label">안건</span>
              <input
                type="text"
                name="missionTitle"
                value="${escapeHtml(state.missionDraftTitle)}"
                placeholder="오늘 등록할 안건 제목을 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >
            </label>
            <label class="field field-compact">
              <span class="field-label">목표</span>
              <textarea
                name="missionGoal"
                rows="3"
                placeholder="이번 안건으로 무엇을 정리해야 하는지 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftGoal)}</textarea>
            </label>
          </div>
          <div class="mission-order-foot">
            ${
              missionUsesKnowledgeWork
                ? `
                  <label class="field field-compact">
                    <span class="field-label">산출물 유형</span>
                    <select
                      name="missionDeliverableType"
                      ${missionCreateDisabled ? 'disabled' : ''}
                    >
                      ${Object.entries(KNOWLEDGE_WORK_DELIVERABLES)
                        .map(
                          ([value, label]) => `
                            <option value="${escapeHtml(value)}" ${
                              state.missionDraftDeliverableType === value ? 'selected' : ''
                            }>${escapeHtml(label)}</option>
                          `,
                        )
                        .join('')}
                    </select>
                  </label>
                `
                : ''
            }
            <label class="field field-compact">
              <span class="field-label">경계 (선택)</span>
              <textarea
                name="missionConstraints"
                rows="2"
                placeholder="이번 안건에서 넘지 않을 범위나 제약을 적으세요"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftConstraints)}</textarea>
            </label>
            <div class="form-actions form-actions-inline form-actions-compact mission-order-actions">
              <button class="primary-button" type="submit" ${missionCreateDisabled ? 'disabled' : ''}>안건 등록</button>
              <button
                class="secondary-button"
                type="submit"
                name="councilMode"
                value="real-local-stub"
                ${missionCreateDisabled || missionUsesKnowledgeWork ? 'disabled' : ''}
              >
                독립 역할 회의 등록
              </button>
              <button
                class="secondary-button"
                type="submit"
                name="councilMode"
                value="real-openai-responses"
                ${missionCreateDisabled || missionUsesKnowledgeWork || !missionCouncilProviderReady ? 'disabled' : ''}
              >
                OpenAI 역할 회의 등록
              </button>
              <p class="form-help">
                ${
                  missionUsesKnowledgeWork
                    ? `등록 즉시 ${getKnowledgeWorkDeliverableDisplayName(state.missionDraftDeliverableType)} 기준 회의 초안이 열리고, 승인 전까지는 실행 셀로 넘어가지 않습니다.`
                    : missionCouncilProviderReady
                      ? '로컬 역할 회의 또는 명시적 OpenAI 역할 회의를 선택할 수 있으며, 승인 전까지는 실행 셀로 넘어가지 않습니다.'
                      : `OpenAI 역할 회의 차단: ${escapeHtml(missionCouncilProviderReadiness?.reasons?.[0] || 'provider readiness가 준비되지 않았습니다.')}`
                }
              </p>
            </div>
          </div>
        </form>
        ${renderMissionViewSelector(selectedMission)}
        ${
          state.missionViewMode === 'graph'
            ? renderMissionEvidenceGraph(state.missionEvidenceGraph, {
                loading: state.missionEvidenceGraphLoading,
                error: state.missionEvidenceGraphError,
                query: state.missionGraphQuery,
                stage: state.missionGraphStage,
                statusTone: state.missionGraphStatusTone,
                selectedNodeId: state.missionGraphSelectedNodeId,
              })
            : renderLlmMissionWorkstream({
                mission: selectedMission,
                council: selectedMissionCouncilPreview,
                execution: selectedMissionExecutionPreview,
                deliverables: selectedMissionDeliverablesPreview,
                nextAction: selectedMissionNextActionPreview,
                linkedTask,
              })
        }
        <details class="llm-mission-history">
          <summary>
            <span>최근 미션</span>
            <span>${escapeHtml(String(data.missions.length))}</span>
          </summary>
          <div class="llm-mission-history-body">${missionList}</div>
        </details>
      </section>
      <aside class="detail-card llm-context-inspector">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>안건 배정 브리프</h2>
            <p class="panel-copy panel-copy-tight">오른쪽은 현재 배정 판단과 다음 처리만 먼저 봅니다.</p>
          </div>
        </div>
        ${renderLlmMissionInspector({
          mission: selectedMission,
          project: data.activeProject,
          nextAction: selectedMissionNextActionPreview,
          linkedTask,
          loop: missionLoopStatus,
        })}
        <details class="llm-deep-inspector">
          <summary>상세 근거 및 제어</summary>
          <div class="llm-deep-inspector-body">
        ${
          selectedMission
            ? `
              ${renderNarrativeDeck({
                wide: false,
                eyebrow: '안건 배정 판단판',
                heading: '현재 배정 판단과 다음 처리를 먼저 봅니다',
                copy: '오른쪽 패널은 긴 설명보다 현재 배정 상태, 가장 먼저 열어야 할 처리선, 필요한 연결 상태를 먼저 보여 줍니다.',
                tokens: [
                  createToken(
                    getMissionStatusDisplay(selectedMission.status),
                    getMissionStatusTone(selectedMission.status),
                  ),
                  selectedMission.deliverableType
                    ? createToken(
                        `산출물:${getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType)}`,
                        'neutral',
                      )
                    : '',
                  selectedMission.linkedTaskId
                    ? createToken(`연결태스크:${selectedMission.linkedTaskId}`, 'accent')
                    : createToken('연결태스크:없음', 'warning'),
                  createToken(
                    `다음:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`,
                    selectedMissionNextActionPreview.tone,
                  ),
                ],
                cards: [
                  {
                    label: '현재 판단',
                    title: selectedMissionBriefControl.currentTitle,
                    copy: selectedMissionBriefControl.currentCopy,
                  },
                  {
                    label: '다음',
                    title: selectedMissionBriefControl.nextTitle,
                    copy: selectedMissionBriefControl.nextCopy,
                  },
                  {
                    label: '이유',
                    title: selectedMissionBriefControl.reasonTitle,
                    copy: selectedMissionBriefControl.reasonCopy,
                  },
                ],
              })}
              <div class="stack">
                <section class="relation-strip relation-strip-compact">
                  <div class="card-title-row card-title-row-tight">
                    <strong>${escapeHtml(selectedMission.title)}</strong>
                    ${
                      selectedMission.deliverableType
                        ? createToken(
                            getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType),
                            'neutral',
                          )
                        : ''
                    }
                  </div>
                  <p class="detail-copy detail-copy-compact">${escapeHtml(selectedMission.goal || '기록된 미션 목표가 없습니다.')}</p>
                </section>
                <section class="relation-strip relation-strip-compact">
                  <div class="card-title-row card-title-row-tight">
                    <strong>루프 상태</strong>
                    <div class="token-row token-row-compact">
                      ${createToken(`Loop:${missionLoopStatus.stageLabel}`, missionLoopStatus.stopTone)}
                      ${createToken(`Stop:${missionLoopStatus.stopCondition}`, missionLoopStatus.stopTone)}
                    </div>
                  </div>
                  <p class="detail-copy detail-copy-compact">
                    <strong>루프 스테이지</strong>: ${escapeHtml(missionLoopStatus.stageLabel)} · ${escapeHtml(missionLoopStatus.controlCopy)}
                  </p>
                  <p class="detail-copy detail-copy-compact">
                    <strong>사람 복귀 지점</strong>: ${escapeHtml(missionLoopStatus.returnPoint)}
                  </p>
                </section>
                ${missionEvidenceRail}
                ${
                  selectedMission.deliverableType
                    ? `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>산출물 유형</strong>
                        </div>
                        <p class="detail-copy">${escapeHtml(getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType))}</p>
                      </section>
                    `
                    : ''
                }
                ${
                  missionCompletionReady
                    ? `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>실행 지시 데스크 인계 미리보기</strong>
                        </div>
                        <div class="token-row">
                          ${
                            linkedTask
                              ? createToken(`태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`, 'neutral')
                              : createToken('태스크:없음', 'warning')
                          }
                          ${
                            selectedMissionExecutionPreview.actionLabel
                              ? createToken(`게이트:${selectedMissionExecutionPreview.actionLabel}`, 'neutral')
                              : createToken('게이트:없음', 'warning')
                          }
                          ${
                            selectedMissionExecutionPreview.executionBlocked
                              ? createToken('실행차단', 'danger')
                              : ''
                          }
                          ${linkedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                            ${linkedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                            ${linkedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionExecutionPreview.stagePreview)}</p>
                        <p class="detail-copy">
                          <strong>현재 지시 미리보기</strong>: ${escapeHtml(selectedMissionExecutionPreview.gatePreview)}
                        </p>
                        <p class="detail-copy">
                          <strong>보류 사유</strong>: ${escapeHtml(selectedMissionExecutionPreview.blockedReason)}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>회의 결과물 미리보기</strong>
                        </div>
                        <div class="token-row">
                          ${
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? createToken(
                                  `아티팩트:${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type}`,
                                  'neutral',
                                )
                              : createToken('아티팩트:없음', 'warning')
                          }
                          ${createToken(
                            `리뷰:${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)}`,
                            getReviewTone(selectedMissionDeliverablesPreview.latestReviewStatus),
                          )}
                          ${
                            selectedMissionDeliverablesPreview.latestApproval
                              ? createToken(
                                  `승인:${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)}`,
                                  getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                )
                              : createToken('승인:없음', 'neutral')
                          }
                        </div>
                        <p class="detail-copy">
                          <strong>최신 아티팩트 미리보기</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? `${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type} ${selectedMissionDeliverablesPreview.currentDeliverableArtifact.id}가 현재 한정된 출력의 머리입니다.`
                              : '아직 아티팩트 패키지가 없습니다.',
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>리뷰 상태</strong>: ${escapeHtml(
                            `현재 리뷰 상태는 ${getReviewStatusDisplay(selectedMissionDeliverablesPreview.latestReviewStatus)}입니다.`,
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>승인 상태</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.latestApproval
                              ? `${selectedMissionDeliverablesPreview.latestApproval.id}는 ${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)} 상태입니다.`
                              : '아직 승인 기록이 없습니다.',
                          )}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>다음 지시</strong>
                        </div>
                        <div class="token-row">
                          ${createToken(`표면:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`, selectedMissionNextActionPreview.tone)}
                          ${createToken(`액션:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionNextActionPreview.summary)}</p>
                      </section>
                    `
                    : `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>브리프 핵심 4줄</strong>
                          <div class="token-row">
                            ${
                              selectedCouncilSession
                                ? createToken(
                                    `정렬:${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}`,
                                    getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                                  )
                                : createToken('정렬:없음', 'warning')
                            }
                            ${
                              linkedTask
                                ? createToken(`태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`, 'neutral')
                                : createToken('태스크:없음', 'warning')
                            }
                            ${
                              selectedMissionDeliverablesPreview.latestApproval
                                ? createToken(
                                    `승인:${getApprovalStatusDisplay(selectedMissionDeliverablesPreview.latestApproval.status)}`,
                                    getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                  )
                                : createToken('승인:없음', 'neutral')
                            }
                            ${createToken(
                              `표면:${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}`,
                              selectedMissionNextActionPreview.tone,
                            )}
                            ${createToken(`액션:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                          </div>
                        </div>
                        <p class="detail-copy detail-copy-compact">지금 판단할 상태만 네 줄로 봅니다.</p>
                        ${renderMissionSnapshotList(selectedMissionActiveSnapshotItems, { compact: true })}
                      </section>
                    `
                }
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>실행 셀 연결</strong>
                  </div>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`${linkedTask.id}가 ${getTaskLifecycleDisplay(linkedTask.lifecycleState)} 상태로 연결돼 있습니다.`)
                        : '이 안건에는 아직 연결된 실행 셀이 없습니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>등록 후속</strong>
                  </div>
                  <p class="detail-copy">회의, 실행, 관제실 기본 동선만 엽니다.</p>
                  <div class="form-actions form-actions-inline">
                    ${
                      selectedCouncilSession
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-council"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            회의실
                          </button>
                        `
                      : `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="draft-council-for-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            회의 초안
                          </button>
                        `
                    }
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="create-linked-task-for-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${linkedTaskCreateDisabled ? 'disabled' : ''}
                    >
                      실행 셀
                    </button>
                    ${
                      linkedTask
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-execution"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            실행 데스크
                          </button>
                        `
                        : ''
                    }
                  </div>
                  ${
                    missionCompletionReady
                      ? `
                        <div class="form-actions form-actions-inline">
                          <button
                            class="primary-button"
                            type="button"
                            data-action="prepare-next-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            다음 안건 준비
                          </button>
                        </div>
                      `
                      : ''
                  }
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-advanced-ops"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      관제실
                    </button>
                    <p class="form-help">세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다.</p>
                  </div>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>안건 종료 보고</strong>
                  </div>
                  <div class="token-row">
                    ${
                          linkedTask
                            ? createToken(
                                `태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`,
                                linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                              )
                            : createToken('태스크:없음', 'warning')
                        }
                        ${
                          missionCompletionReady
                            ? createToken('상태:완료', 'success')
                            : createToken('상태:진행 중', 'warning')
                        }
                        ${
                          missionCompletionArtifactId
                            ? createToken(`종료정리:${missionCompletionArtifactId}`, 'neutral')
                            : ''
                        }
                  </div>
                  <p class="detail-copy">
                    ${
                      missionCompletionReady
                        ? escapeHtml(
                            `${selectedMission.title}은 종료 정리 아티팩트 ${missionCompletionArtifactId}로 경로를 닫았습니다.`,
                          )
                        : '연결 태스크가 종료 정리를 마치면 이곳에 미션 완료 요약이 뜹니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>현재 안건 상태</strong>: ${
                      missionCompletionReady
                        ? escapeHtml(
                            `태스크 ${linkedTask.id}는 완료입니다. 종료 정리 결과는 소스 릴리스 번들 ${missionCompletionReleasePackageId || '알 수 없음'}에 연결돼 있습니다.`,
                          )
                        : linkedTask
                          ? escapeHtml(
                              `태스크 ${linkedTask.id}는 현재 ${getTaskLifecycleDisplay(linkedTask.lifecycleState)} 상태입니다. 종료 정리가 끝나면 미션 완료가 봉인됩니다.`,
                            )
                          : '아직 연결된 태스크가 없습니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>다음 안전한 지시</strong>: ${
                      missionCompletionReady
                        ? '저장된 종료 정리 번들을 확인한 뒤 새 미션을 시작하거나 이 미션을 다시 다듬습니다. 푸시, 게시, 외부 릴리스는 범위 밖입니다.'
                        : '협의회나 실행에서 현재 경로를 계속 전진합니다. 종료 정리 번들이 저장돼야 완료가 닫힙니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>참여 역할</strong>
                    ${createToken('참여 역할', 'accent')}
                  </div>
                  ${
                    selectedCouncilSession
                      ? `
                        <div class="token-row">
                          ${createToken('직급 체계', 'accent')}
                          ${createToken(
                            `정렬:${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}`,
                            getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                          )}
                          ${createToken(
                            `참여자:${selectedMissionCouncilPreview.participantCount}`,
                            'neutral',
                          )}
                          ${
                            selectedMissionCouncilPreview.openQuestionsCount > 0
                              ? createToken(
                                  `열린질문:${selectedMissionCouncilPreview.openQuestionsCount}`,
                                  'warning',
                                )
                              : createToken('열린질문:0', 'success')
                          }
                        </div>
                      `
                      : ''
                  }
                  ${renderCouncilCastCards(selectedCouncilSession, { compact: true })}
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `${selectedCouncilSession.id}는 ${getCouncilStatusDisplay(selectedCouncilSession.status)} 상태이고, 네 역할이 현재 정렬을 ${getAlignmentStatusDisplay(selectedCouncilSession.alignment?.status || 'pending')}으로 묶고 있습니다.`,
                          )
                        : '참모 회의를 열면 네 역할이 같은 안건을 두고 정렬을 시작합니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `추천안 미리보기: ${selectedMissionCouncilPreview.recommendationPreview}`,
                          )
                        : '추천안 미리보기: 협의회를 초안으로 만들어 현재 추천안을 채웁니다.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `정렬 상태: ${getAlignmentStatusDisplay(selectedMissionCouncilPreview.alignmentStatus)}. 선택된 계획은 ${selectedMissionCouncilPreview.selectedPlanTitle}입니다.`,
                          )
                        : '정렬 상태: 협의회 세션이 생기기 전까지는 비어 있습니다.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>회의 경계</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedMission.constraints || '기록된 제약 조건이 없습니다.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>관제실 직행</strong>
                  </div>
                  <p class="detail-copy">세부 로그, 작업판, 증적 조작이 필요할 때 여는 별도 관제실입니다.</p>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`연결 태스크 ${linkedTask.id}를 선택한 상태로 작업판을 엽니다.`)
                        : '미션 범위를 바꾸지 않고 작업판을 엽니다.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state mission-empty-state mission-empty-state-detail">
                <strong class="mission-empty-title">선택된 안건 없음</strong>
                <p class="mission-empty-copy">왼쪽 등록대장에서 안건을 고르거나 위 입력선에서 새 안건을 등록합니다.</p>
              </div>
            `
        }
          </div>
        </details>
      </aside>
      </div>
    </div>
  `;
}

function renderRealCouncilEvidence(councilSession) {
  const attempt = getCurrentRealCouncilAttempt(councilSession);

  if (!attempt) {
    return '';
  }

  const positions = getLatestRealCouncilPositions(councilSession);
  const positionRows = positions
    .map((position) => {
      const participant = (councilSession.participants || []).find(
        (entry) => entry.agentId === position.agentId,
      );
      const providerEvidence = position.providerEvidence;

      return `
        <section class="relation-strip transcript-card">
          <div class="card-title-row card-title-row-tight transcript-card-head">
            <strong class="transcript-card-role">${escapeHtml(participant?.role || position.role)}</strong>
            ${createToken(position.confidence, position.confidence === 'high' ? 'success' : 'neutral')}
            ${createToken(position.id, 'neutral')}
          </div>
          <p class="detail-copy detail-copy-compact transcript-card-copy">${escapeHtml(position.recommendation)}</p>
          <p class="detail-copy detail-copy-compact">다음: ${escapeHtml(position.proposedNextStep)}</p>
          ${providerEvidence
            ? `<p class="detail-copy detail-copy-compact">provider ${escapeHtml(providerEvidence.model)} · ${escapeHtml(providerEvidence.outcome)} · attempts ${providerEvidence.providerAttemptCount}</p>`
            : ''}
        </section>
      `;
    })
    .join('');
  const conflicts = attempt.conflictSummary || {};
  const conflictRows = [
    ...(conflicts.requiredRoleFailures || []).map(
      (entry) => `${entry.role}: ${entry.code}`,
    ),
    ...(conflicts.uniqueObjections || []),
  ];
  const synthesis = attempt.synthesis;

  return `
    <section class="relation-strip">
      <div class="card-title-row card-title-row-tight">
        <strong>Real Council 상태</strong>
        ${createToken(`phase:${councilSession.phase}`, councilSession.status === 'failed' ? 'danger' : 'accent')}
        ${createToken(`attempt:${attempt.sequence}`, 'neutral')}
        ${createToken(`positions:${positions.length}`, 'neutral')}
        ${createToken(councilSession.mode, councilSession.mode === 'real-openai-responses' ? 'accent' : 'neutral')}
        ${attempt.providerCallCount ? createToken(`provider-calls:${attempt.providerCallCount}`, 'neutral') : ''}
      </div>
      <p class="detail-copy detail-copy-compact">${escapeHtml(councilSession.agenda?.title || '')}</p>
      <p class="detail-copy detail-copy-compact">source ${escapeHtml(String(councilSession.sourceDigest || '').slice(0, 12))}</p>
    </section>
    <div class="stack">
      ${positionRows || '<p class="detail-copy detail-copy-compact">유효한 position이 아직 없습니다.</p>'}
    </div>
    <section class="relation-strip council-outcome-card council-outcome-card-questions">
      <div class="card-title-row card-title-row-tight council-outcome-head">
        <strong class="council-outcome-title">Conflict와 dissent</strong>
        ${createToken(conflicts.approvalReady ? 'synthesis-ready' : 'blocked', conflicts.approvalReady ? 'success' : 'danger')}
      </div>
      <div class="stack council-outcome-question-list">
        ${conflictRows.length > 0
          ? conflictRows
              .map(
                (entry) => `<p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-question">${escapeHtml(entry)}</p>`,
              )
              .join('')
          : '<p class="detail-copy detail-copy-compact">기록된 conflict가 없습니다.</p>'}
      </div>
    </section>
    ${synthesis
      ? `
        <section class="relation-strip council-outcome-card council-outcome-card-recommendation">
          <div class="card-title-row card-title-row-tight council-outcome-head">
            <strong class="council-outcome-title">Conductor synthesis</strong>
            ${createToken('human decision required', 'accent')}
            ${synthesis.providerEvidence ? createToken(`${synthesis.providerEvidence.model}:${synthesis.providerEvidence.outcome}`, 'neutral') : ''}
          </div>
          <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(synthesis.adoptedRecommendation)}</p>
          <p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-copy-muted">${escapeHtml(synthesis.proposedExecutionBoundary)}</p>
        </section>
      `
      : ''}
  `;
}

function renderMissionWorkOrderCompileForm(councilSession, options = {}) {
  const blockedReason = String(options.blockedReason || '').trim();
  const busy = state.loading || state.mutating || Boolean(blockedReason);
  const recompute = options.recompute === true;
  const draft = state.missionWorkOrderCompileDraft;

  return `
    <div class="mission-workorder-compile-form">
      <div class="card-title-row card-title-row-tight">
        <strong>WorkOrder compile spec</strong>
        ${createToken('inert preview', 'neutral')}
      </div>
      <div class="mission-workorder-compile-grid">
        <label class="field">
          <span class="field-label">대상 경로 allowlist</span>
          <textarea
            id="mission-workorder-target-paths"
            class="text-input"
            rows="3"
            placeholder="src/runtime/example.js"
            ${busy ? 'disabled' : ''}
          >${escapeHtml(draft.targetPathAllowlist)}</textarea>
        </label>
        <label class="field">
          <span class="field-label">예상 산출물</span>
          <textarea
            id="mission-workorder-expected-artifacts"
            class="text-input"
            rows="3"
            placeholder="focused smoke evidence"
            ${busy ? 'disabled' : ''}
          >${escapeHtml(draft.expectedArtifacts)}</textarea>
        </label>
        <label class="field">
          <span class="field-label">검증 명령</span>
          <textarea
            id="mission-workorder-verification-commands"
            class="text-input"
            rows="3"
            placeholder="node scripts/smoke-example.mjs"
            ${busy ? 'disabled' : ''}
          >${escapeHtml(draft.verificationCommands)}</textarea>
        </label>
        <label class="field">
          <span class="field-label">중지 조건</span>
          <textarea
            id="mission-workorder-stop-conditions"
            class="text-input"
            rows="3"
            placeholder="Target allowlist mismatch"
            ${busy ? 'disabled' : ''}
          >${escapeHtml(draft.stopConditions)}</textarea>
        </label>
      </div>
      <div class="relation-button-row">
        <button
          class="secondary-button"
          type="button"
          data-action="${recompute ? 'recompute-mission-workorder-preview' : 'approve-real-council-session-inert-preview'}"
          data-id="${escapeHtml(councilSession.id)}"
          ${busy ? 'disabled' : ''}
        >
          ${recompute ? '초안 다시 계산' : '승인 후 WorkOrder 초안'}
        </button>
      </div>
      <p class="form-help">${escapeHtml(
        blockedReason || '저장·실행·WorkOrder 승인은 닫힌 상태로 유지됩니다.',
      )}</p>
    </div>
  `;
}

function renderMissionWorkOrderPreview(preview, councilSession, persistedBundle = null) {
  const summary = getMissionWorkOrderPreviewSummary(preview, councilSession?.id);
  if (!summary) return '';

  const workOrderRows = preview.workOrders
    .map(
      (workOrder, index) => `
        <div class="mission-workorder-row">
          <div class="card-title-row card-title-row-tight">
            <strong>${index + 1}. ${escapeHtml(workOrder.title)}</strong>
            ${createToken(workOrder.status, 'neutral')}
            ${createToken(workOrder.assignedAgentId, 'accent')}
          </div>
          <p class="detail-copy detail-copy-compact">${escapeHtml(workOrder.intent)}</p>
          <div class="token-row token-row-compact">
            ${createToken(
              workOrder.dependencies.length > 0
                ? `depends:${workOrder.dependencies.join(', ')}`
                : 'depends:none',
              'neutral',
            )}
            ${createToken(`targets:${workOrder.targetPathAllowlist.length}`, 'neutral')}
            ${createToken(`checks:${workOrder.verificationCommands.length}`, 'neutral')}
          </div>
          <p class="form-help">${escapeHtml(workOrder.targetPathAllowlist.join(' · '))}</p>
        </div>
      `,
    )
    .join('');

  return `
    <section class="mission-workorder-preview" aria-label="Inert WorkOrder preview">
      <div class="card-title-row card-title-row-tight">
        <strong>ExecutionPlan 초안</strong>
        ${createToken('response-only', 'neutral')}
        ${createToken(summary.authorityClosed ? 'authority closed' : 'authority error', summary.authorityClosed ? 'success' : 'danger')}
      </div>
      <p class="detail-copy detail-copy-compact">${escapeHtml(preview.executionPlan.objective)}</p>
      <div class="token-row token-row-compact">
        ${createToken(summary.executionPlanId, 'accent')}
        ${createToken(`WorkOrders:${summary.workOrderCount}`, 'neutral')}
        ${createToken(`Handoffs:${summary.handoffCount}`, 'neutral')}
        ${createToken(`digest:${preview.sourceDigest.slice(0, 12)}`, 'neutral')}
      </div>
      <div class="mission-workorder-list">${workOrderRows}</div>
      ${
        persistedBundle
          ? ''
          : `
            <div class="relation-button-row mission-workorder-actions">
              <button
                class="primary-button"
                type="button"
                data-action="persist-mission-workorder-plan"
                data-id="${escapeHtml(councilSession.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                검토 대기 계획으로 저장
              </button>
            </div>
          `
      }
    </section>
  `;
}

function renderWorkflowCheckpointRecovery(recovery, executionPlan) {
  const summary = getMissionWorkflowCheckpointSummary(recovery, executionPlan.id);
  if (!summary) return '';
  const checkpoint = summary.checkpoint;
  const verificationBlocksResume = Boolean(
    checkpoint?.stage === 'reviewer-ready' &&
      state.workOrderVerificationStatus?.criteriaRequired &&
      !state.workOrderVerificationStatus.ready,
  );
  const continuationPreview = state.executionContinuationPreview;
  const continuationReady = Boolean(
    continuationPreview?.status === 'continuation-ready' &&
      continuationPreview.executionPlanId === executionPlan.id &&
      continuationPreview.nextStep?.checkpointId === checkpoint?.id &&
      continuationPreview.nextStep?.action === summary.action &&
      continuationPreview.progressEvidence?.checkpointDigest === checkpoint?.checkpointDigest,
  );
  const classificationLabel = {
    ready: '재개 준비',
    consumed: '소비됨',
    stale: '오래됨',
    cancelled: '취소됨',
    quarantined: '격리됨',
    terminal: '종료',
    unavailable: '기록 없음',
  }[summary.classification] || summary.classification;
  const tone =
    summary.classification === 'ready'
      ? 'success'
      : ['stale', 'quarantined'].includes(summary.classification)
        ? 'danger'
        : summary.classification === 'cancelled'
          ? 'warning'
          : 'neutral';
  if (!checkpoint) {
    return `
      <div class="workflow-checkpoint-register" aria-label="Workflow checkpoint recovery">
        <div class="card-title-row card-title-row-tight">
          <strong>Workflow recovery</strong>
          ${createToken(classificationLabel, tone)}
        </div>
        <p class="form-help">${escapeHtml(summary.stopReason || 'checkpoint 기록이 없습니다.')}</p>
      </div>
    `;
  }

  return `
    <div class="workflow-checkpoint-register" aria-label="Workflow checkpoint recovery">
      <div class="card-title-row card-title-row-tight">
        <strong>Workflow recovery</strong>
        ${createToken(classificationLabel, tone)}
        ${createToken(checkpoint.stage, checkpoint.stage === 'delivery-ready' ? 'success' : 'accent')}
        ${createToken(`attempt:${checkpoint.attempt}`, 'neutral')}
      </div>
      <div class="workflow-checkpoint-grid">
        <div>
          <span>Checkpoint</span>
          <strong>${escapeHtml(checkpoint.id)}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>${checkpoint.completedUnitRefs.length}</strong>
        </div>
        <div>
          <span>Pending</span>
          <strong>${checkpoint.pendingUnitRefs.length}</strong>
        </div>
        <div>
          <span>Digest</span>
          <strong>${escapeHtml(checkpoint.checkpointDigest.slice(0, 12))}</strong>
        </div>
      </div>
      <p class="form-help">${escapeHtml(summary.stopReason || 'durable boundary evidence current')}</p>
      ${
        continuationPreview && continuationPreview.executionPlanId === executionPlan.id
          ? `
            <div class="execution-continuation-preview" data-continuation-status="${escapeHtml(continuationPreview.status)}">
              <div class="card-title-row card-title-row-tight">
                <strong>Bounded continuation</strong>
                ${createToken(continuationPreview.status, continuationReady ? 'success' : 'warning')}
                ${createToken('max steps:1', 'neutral')}
                ${createToken('response-only', 'neutral')}
              </div>
              <div class="workflow-checkpoint-grid">
                <div><span>Progress</span><strong>${escapeHtml(continuationPreview.progressDigest.slice(0, 12))}</strong></div>
                <div><span>Deadline</span><strong>${escapeHtml(continuationPreview.continuationSpec.deadlineAt)}</strong></div>
                <div><span>Next</span><strong>${escapeHtml(continuationPreview.nextStep?.action || 'stop')}</strong></div>
                <div><span>Persisted</span><strong>no</strong></div>
              </div>
              <p class="form-help">${escapeHtml(continuationPreview.stopReason || '기존 resume가 exact tuple과 Decision Inbox를 다시 검증합니다.')}</p>
            </div>
          `
          : ''
      }
      <div class="relation-button-row workflow-checkpoint-actions">
        <button
          class="primary-button"
          type="button"
          data-action="${continuationReady ? 'resume-workflow-checkpoint' : 'preview-execution-continuation'}"
          data-checkpoint-action="${escapeHtml(summary.action || '')}"
          data-id="${escapeHtml(executionPlan.id)}"
          ${state.loading || state.mutating || !summary.canResume || verificationBlocksResume || (continuationPreview && !continuationReady) ? 'disabled' : ''}
        >
          ${continuationReady
            ? checkpoint.stage === 'qa-ready'
              ? 'QA 재개: 1단계 실행'
              : checkpoint.stage === 'reviewer-ready'
                ? 'Reviewer 재개: 1단계 실행'
                : '재개 불가'
            : '다음 1단계 검토'}
        </button>
        <button
          class="secondary-button"
          type="button"
          data-action="cancel-workflow-checkpoint"
          data-id="${escapeHtml(executionPlan.id)}"
          ${state.loading || state.mutating || !summary.canCancel ? 'disabled' : ''}
        >
          Checkpoint 취소
        </button>
      </div>
    </div>
  `;
}

function renderMissionExecutionPlan(bundle, recovery) {
  if (!bundle) return '';
  const { executionPlan, workOrders, approval, terminalGateApproval } = bundle;
  const deliverySummary = getMissionReviewedDeliverySummary(bundle);
  const startAllowed =
    executionPlan.status === 'approved' && approval.status === 'approved';
  const workOrderRows = workOrders
    .map(
      (workOrder) => `
        <div class="mission-workorder-row">
          <div class="card-title-row card-title-row-tight">
            <strong>${workOrder.position}. ${escapeHtml(workOrder.title)}</strong>
            ${createToken(workOrder.role, workOrder.role === 'builder' ? 'accent' : 'neutral')}
            ${createToken(
              workOrder.status,
              workOrder.status === 'completed'
                ? 'success'
                : ['failed', 'blocked', 'changes-requested'].includes(workOrder.status)
                  ? 'danger'
                  : workOrder.status === 'waiting-gate'
                    ? 'warning'
                    : 'neutral',
            )}
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              workOrder.dependencyIds.length > 0
                ? `depends:${workOrder.dependencyIds.join(', ')}`
                : 'depends:none',
              'neutral',
            )}
            ${createToken(`runs:${workOrder.runRefs.length}`, 'neutral')}
            ${createToken(`artifacts:${workOrder.artifactRefs.length}`, 'neutral')}
          </div>
          <div class="relation-button-row">
            <button
              class="secondary-button"
              type="button"
              data-action="preview-workorder-verification-plan"
              data-plan-id="${escapeHtml(executionPlan.id)}"
              data-id="${escapeHtml(workOrder.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              검증 기준
            </button>
          </div>
        </div>
      `,
    )
    .join('');

  return `
    <section class="mission-workorder-plan" aria-label="Durable ExecutionPlan">
      <div class="card-title-row card-title-row-tight">
        <strong>Durable ExecutionPlan</strong>
        ${createToken(executionPlan.status, executionPlan.status === 'approved' ? 'success' : 'accent')}
        ${createToken(`approval:${approval.status}`, approval.status === 'approved' ? 'success' : 'warning')}
      </div>
      <div class="token-row token-row-compact">
        ${createToken(executionPlan.id, 'accent')}
        ${createToken(`digest:${executionPlan.sourceDigest.slice(0, 12)}`, 'neutral')}
        ${
          terminalGateApproval
            ? createToken(
                `builder mutation gate:${terminalGateApproval.status}`,
                terminalGateApproval.status === 'approved' ? 'success' : 'warning',
              )
            : ''
        }
        ${deliverySummary?.deliveryReady ? createToken('delivery:ready', 'success') : ''}
      </div>
      <div class="mission-workorder-list">${workOrderRows}</div>
      ${renderWorkOrderVerificationPlanPreview(state.workOrderVerificationPlanPreview, bundle)}
      ${renderDurableWorkOrderVerification(bundle, state.workOrderVerificationStatus)}
      ${renderWorkflowCheckpointRecovery(recovery, executionPlan)}
      <div class="relation-button-row mission-workorder-actions">
        <button
          class="primary-button"
          type="button"
          data-action="start-sequential-workorder-plan"
          data-id="${escapeHtml(executionPlan.id)}"
          ${state.loading || state.mutating || !startAllowed ? 'disabled' : ''}
        >
          Builder 순차 시작
        </button>
        <button
          class="primary-button"
          type="button"
          data-action="continue-reviewed-delivery"
          data-id="${escapeHtml(executionPlan.id)}"
          ${state.loading || state.mutating || !deliverySummary?.canContinue ? 'disabled' : ''}
        >
          검토·QA 이어서 실행
        </button>
        <p class="form-help">${escapeHtml(
          executionPlan.status === 'pending-approval'
            ? 'Decision Inbox에서 digest-bound 계획 승인이 필요합니다.'
            : executionPlan.status === 'approved'
              ? '별도 시작 명령은 Builder preflight 뒤 live-mutation 승인에서 멈춥니다.'
              : deliverySummary?.canContinue
                ? `Builder live-mutation 승인 ${deliverySummary.terminalGateApprovalId}이 확인됐습니다.`
                : executionPlan.status === 'active' && executionPlan.terminalGateApprovalId
                  ? `Builder live-mutation 승인 ${executionPlan.terminalGateApprovalId}에서 대기 중입니다.`
                  : deliverySummary?.deliveryReady
                    ? 'Reviewer와 node syntax QA가 통과했고 response-only 패킷이 준비됐습니다.'
                : `현재 계획 상태: ${executionPlan.status}`,
        )}</p>
      </div>
    </section>
  `;
}

function renderWorkOrderVerificationPlanPreview(preview, bundle) {
  const { executionPlan } = bundle;
  if (!preview || preview.executionPlanId !== executionPlan.id) return '';
  const workOrder = bundle.workOrders.find((entry) => entry.id === preview.workOrderId) || null;
  const canPersist = Boolean(
    workOrder?.role === 'builder' &&
      workOrder.status === 'waiting-gate' &&
      workOrder.acceptanceCriterionRefs?.length === 0 &&
      executionPlan.status === 'active' &&
      executionPlan.activeWorkOrderId === workOrder.id &&
      executionPlan.stoppedAt === 'request-builder-live-mutation-approval',
  );
  const criterionRows = preview.criteria
    .map(
      (criterion) => `
        <div class="mission-workorder-row">
          <div class="card-title-row card-title-row-tight">
            <strong>${escapeHtml(criterion.title)}</strong>
            ${createToken(criterion.kind, 'neutral')}
            ${createToken(criterion.proofMode, criterion.proofMode === 'command' ? 'accent' : 'neutral')}
            ${createToken(criterion.status, 'warning')}
          </div>
          <p class="form-help">${escapeHtml(criterion.sourceValues.join(' · '))}</p>
        </div>
      `,
    )
    .join('');

  return `
    <section
      class="relation-strip workorder-verification-plan-preview"
      aria-label="WorkOrder verification plan preview"
    >
      <div class="card-title-row card-title-row-tight">
        <strong>검증 기준 검토</strong>
        ${createToken('response-only', 'accent')}
        ${createToken(`workorder:${preview.workOrderId}`, 'neutral')}
        ${createToken(`digest:${preview.previewDigest.slice(0, 12)}`, 'neutral')}
      </div>
      <p class="detail-copy detail-copy-compact">
        현재 WorkOrder의 acceptance, stop, command, artifact 기준을 그대로 묶었습니다. 아직 실행되거나 통과된 기준은 없습니다.
      </p>
      <div class="mission-workorder-list">${criterionRows}</div>
      ${
        canPersist
          ? `
            <div class="verification-approval-form" data-form="persist-workorder-acceptance-criteria">
              <label class="form-field">
                <span>기록 판단</span>
                <input
                  class="text-input"
                  name="acceptanceCriteriaRationale"
                  type="text"
                  maxlength="1024"
                  value="${escapeHtml(state.workOrderAcceptanceCriteriaRationale)}"
                />
              </label>
              <button
                class="primary-button"
                type="button"
                data-action="persist-workorder-acceptance-criteria"
                data-plan-id="${escapeHtml(executionPlan.id)}"
                data-id="${escapeHtml(workOrder.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                AcceptanceCriterion 기록
              </button>
            </div>
          `
          : ''
      }
    </section>
  `;
}

function renderDurableWorkOrderVerification(bundle, verificationStatus) {
  const criteria = bundle.acceptanceCriteria || [];
  if (criteria.length === 0) return '';
  const builder = bundle.workOrders.find((workOrder) => workOrder.role === 'builder');
  if (!builder) return '';
  const statusByCriterion = new Map(
    (verificationStatus?.entries || []).map((entry) => [entry.criterion.id, entry]),
  );
  const proofControlsOpen = Boolean(
    builder.status === 'completed' &&
      bundle.executionPlan.activeWorkOrderId !== builder.id &&
      bundle.latestCheckpoint?.stage === 'reviewer-ready',
  );
  const criterionRows = criteria
    .map((criterion) => {
      const statusEntry = statusByCriterion.get(criterion.id) || null;
      const latestProof = statusEntry?.latestProof || null;
      const draft = getWorkOrderProofDraft(criterion.id);
      const commandMode = criterion.proofMode === 'command';
      const currentLabel = latestProof
        ? statusEntry?.current
          ? 'current passed'
          : latestProof.status === 'passed'
            ? 'stale'
            : latestProof.status
        : 'proof required';
      const currentTone = statusEntry?.current
        ? 'success'
        : latestProof?.status === 'failed'
          ? 'danger'
          : 'warning';
      return `
        <div class="mission-workorder-row verification-ledger-row">
          <div class="card-title-row card-title-row-tight">
            <strong>${escapeHtml(criterion.title)}</strong>
            ${createToken(criterion.kind, 'neutral')}
            ${createToken(criterion.proofMode, commandMode ? 'accent' : 'neutral')}
            ${createToken(currentLabel, currentTone)}
            ${createToken(`attempts:${statusEntry?.proofCount || 0}`, 'neutral')}
          </div>
          <p class="form-help">${escapeHtml(criterion.sourceValues.join(' · '))}</p>
          ${
            latestProof
              ? `<p class="form-help">${escapeHtml(`${latestProof.id} · ${latestProof.proofApproval.rationale}`)}</p>`
              : ''
          }
          ${
            proofControlsOpen
              ? `
                <div
                  class="verification-proof-form"
                  data-form="workorder-verification-proof"
                  data-criterion-id="${escapeHtml(criterion.id)}"
                >
                  ${
                    commandMode
                      ? ''
                      : `
                        <label class="form-field verification-status-field">
                          <span>판정</span>
                          <select name="proofStatus">
                            <option value="passed" ${draft.status === 'passed' ? 'selected' : ''}>passed</option>
                            <option value="failed" ${draft.status === 'failed' ? 'selected' : ''}>failed</option>
                          </select>
                        </label>
                      `
                  }
                  <label class="form-field verification-rationale-field">
                    <span>증빙 판단</span>
                    <input
                      class="text-input"
                      name="proofRationale"
                      type="text"
                      maxlength="1024"
                      value="${escapeHtml(draft.rationale)}"
                    />
                  </label>
                  <button
                    class="${commandMode ? 'primary-button' : 'secondary-button'}"
                    type="button"
                    data-action="${commandMode ? 'run-workorder-node-check-proof' : 'record-workorder-verification-proof'}"
                    data-plan-id="${escapeHtml(bundle.executionPlan.id)}"
                    data-work-order-id="${escapeHtml(builder.id)}"
                    data-id="${escapeHtml(criterion.id)}"
                    ${state.loading || state.mutating ? 'disabled' : ''}
                  >
                    ${commandMode ? 'Node check 실행' : 'Review proof 기록'}
                  </button>
                </div>
              `
              : ''
          }
        </div>
      `;
    })
    .join('');

  return `
    <section class="workorder-verification-ledger" aria-label="Durable WorkOrder verification ledger">
      <div class="card-title-row card-title-row-tight">
        <strong>Acceptance & Proof Ledger</strong>
        ${createToken('durable', 'accent')}
        ${createToken(
          verificationStatus?.ready ? 'reviewer ready' : 'proof required',
          verificationStatus?.ready ? 'success' : 'warning',
        )}
      </div>
      <div class="mission-workorder-list">${criterionRows}</div>
    </section>
  `;
}

function renderDeliveryPackagePreview(preview, bundle) {
  if (!preview || preview.executionPlanId !== bundle?.executionPlan.id) return '';
  const persistence = getMissionDeliveryPackagePersistenceSummary(
    preview,
    bundle,
    state.missionDurableDeliveryPackage,
  );
  const resultRows = (preview.workOrderResults || [])
    .map(
      (result) => `
        <div class="delivery-package-result">
          <strong>${escapeHtml(result.role)}</strong>
          ${createToken(result.status, result.status === 'completed' ? 'success' : 'danger')}
          ${createToken(`runs:${result.runRefs.length}`, 'neutral')}
          ${createToken(`artifacts:${result.artifactRefs.length}`, 'neutral')}
        </div>
      `,
    )
    .join('');

  return `
    <section class="delivery-package-preview" aria-label="Response-only DeliveryPackage preview">
      <div class="card-title-row card-title-row-tight">
        <strong>DeliveryPackage Preview</strong>
        ${createToken('response-only', 'accent')}
        ${createToken('mission:not-done', 'warning')}
        ${createToken(`verification:${preview.verificationSummary.verdict}`, 'success')}
      </div>
      <div class="token-row token-row-compact">
        ${createToken(preview.id, 'neutral')}
        ${createToken(`package:${preview.packageDigest}`, 'neutral')}
        ${createToken(`checkpoint:${preview.terminalCheckpointId}`, 'neutral')}
        ${createToken(`review:${preview.reviewerEvidenceRef}`, 'success')}
        ${createToken(`qa:${preview.qaEvidenceRefs.join(', ')}`, 'success')}
        ${createToken(`checks:${preview.verificationSummary.passedCheckCount}/${preview.verificationSummary.checkCount}`, 'neutral')}
      </div>
      <div class="delivery-package-results">${resultRows}</div>
      <div class="delivery-package-authority" aria-label="Blocked downstream authority">
        ${createToken(persistence?.persisted ? 'persist:recorded' : persistence?.canPersist ? 'persist:ready' : 'persist:blocked', persistence?.canPersist ? 'accent' : 'neutral')}
        ${createToken('acceptance:blocked', 'neutral')}
        ${createToken('mission done:blocked', 'warning')}
        ${createToken('commit:blocked', 'neutral')}
        ${createToken('push:blocked', 'neutral')}
        ${createToken('release:blocked', 'neutral')}
      </div>
      <div class="relation-button-row delivery-package-actions">
        <button
          class="primary-button"
          type="button"
          data-action="persist-delivery-package"
          data-id="${escapeHtml(preview.executionPlanId)}"
          ${state.loading || state.mutating || !persistence?.canPersist ? 'disabled' : ''}
        >
          DeliveryPackage 기록
        </button>
      </div>
    </section>
  `;
}

function renderDurableDeliveryPackage(deliveryPackage, bundle) {
  if (!deliveryPackage || deliveryPackage.executionPlanId !== bundle?.executionPlan.id) return '';
  const data = getDerived();
  const mission = data.missionMap.get(bundle.executionPlan.missionId) || null;
  const acceptance = state.missionDeliveryPackageAcceptance;
  const acceptanceSummary = getMissionDeliveryPackageAcceptanceSummary(
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
  );
  const missionCloseOut = state.missionCloseOut;
  const closeOutSummary = getMissionCloseOutSummary(
    mission,
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
    missionCloseOut,
  );
  const resultRows = deliveryPackage.workOrderResults
    .map(
      (result) => `
        <div class="delivery-package-result">
          <strong>${escapeHtml(result.role)}</strong>
          ${createToken(result.status, 'success')}
          ${createToken(`runs:${result.runRefs.join(',')}`, 'neutral')}
          ${createToken(`artifacts:${result.artifactRefs.join(',')}`, 'neutral')}
        </div>
      `,
    )
    .join('');
  return `
    <section class="delivery-package-record" aria-label="Durable DeliveryPackage evidence">
      <div class="card-title-row card-title-row-tight">
        <strong>DeliveryPackage Record</strong>
        ${createToken(deliveryPackage.status, 'warning')}
        ${createToken(`review:${acceptanceSummary?.reviewStatus || 'review-required'}`, acceptanceSummary?.accepted ? 'success' : 'warning')}
        ${createToken(`mission:${mission?.status || 'unknown'}`, closeOutSummary?.completed ? 'success' : 'warning')}
      </div>
      <div class="token-row token-row-compact delivery-package-digests">
        ${createToken(deliveryPackage.id, 'accent')}
        ${createToken(`source:${deliveryPackage.sourceDigest}`, 'neutral')}
        ${createToken(`package:${deliveryPackage.packageDigest}`, 'neutral')}
        ${createToken(`checkpoint:${deliveryPackage.terminalCheckpointDigest}`, 'neutral')}
        ${createToken(`review:${deliveryPackage.reviewerEvidenceRef}`, 'success')}
        ${createToken(`qa:${deliveryPackage.qaEvidenceRefs.join(',')}`, 'success')}
      </div>
      <div class="delivery-package-results">${resultRows}</div>
      <div class="delivery-package-register">
        <p><strong>Accepted risks</strong> ${escapeHtml(deliveryPackage.acceptedRisks.join(' · ') || 'none')}</p>
        <p><strong>Unresolved items</strong> ${escapeHtml(deliveryPackage.unresolvedItems.join(' · ') || 'none')}</p>
      </div>
      <div class="delivery-package-authority" aria-label="Blocked downstream authority">
        ${createToken(acceptanceSummary?.accepted ? 'acceptance:accepted' : acceptanceSummary?.canAccept ? 'acceptance:ready' : 'acceptance:blocked', acceptanceSummary?.accepted ? 'success' : acceptanceSummary?.canAccept ? 'accent' : 'neutral')}
        ${createToken(`mission close-out:${closeOutSummary?.status || 'blocked'}`, closeOutSummary?.completed ? 'success' : closeOutSummary?.canCloseOut ? 'accent' : 'warning')}
        ${createToken(`task:${bundle.controlTask.lifecycleState}`, closeOutSummary?.completed ? 'success' : 'neutral')}
        ${createToken('commit:blocked', 'neutral')}
        ${createToken('push:blocked', 'neutral')}
        ${createToken('release:blocked', 'neutral')}
        ${createToken('learning:blocked', 'neutral')}
      </div>
      <div class="delivery-package-acceptance" aria-label="DeliveryPackage acceptance evidence">
        ${
          acceptanceSummary?.accepted
            ? `
              <div class="card-title-row card-title-row-tight">
                <strong>Acceptance Evidence</strong>
                ${createToken(acceptance.decision, 'success')}
                ${createToken('append-only', 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(acceptance.id, 'accent')}
                ${createToken(`acceptance:${acceptance.acceptanceDigest}`, 'neutral')}
                ${createToken(`package:${acceptance.packageDigest}`, 'neutral')}
                ${createToken(`checkpoint:${acceptance.terminalCheckpointDigest}`, 'neutral')}
                ${createToken(acceptance.createdAt, 'neutral')}
              </div>
              <p>Current evidence가 일치하면 Mission과 linked control task를 한 transaction으로 종료할 수 있습니다.</p>
            `
            : `
              <p>현재 package tuple을 승인 evidence로 기록할 수 있습니다. Mission과 task 상태는 변경되지 않습니다.</p>
            `
        }
      </div>
      <div class="mission-close-out-evidence" aria-label="Mission close-out evidence">
        ${
          closeOutSummary?.completed
            ? `
              <div class="card-title-row card-title-row-tight">
                <strong>Mission Close-out Evidence</strong>
                ${createToken(missionCloseOut.decision, 'success')}
                ${createToken('append-only', 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(missionCloseOut.id, 'accent')}
                ${createToken(`close-out:${missionCloseOut.closeOutDigest}`, 'neutral')}
                ${createToken(missionCloseOut.taskLifecycleTransition, 'success')}
                ${createToken(missionCloseOut.missionStatusTransition, 'success')}
                ${createToken(missionCloseOut.createdAt, 'neutral')}
              </div>
              <p>Package와 acceptance evidence는 immutable하게 유지됩니다.</p>
            `
            : `<p>Close-out은 accepted package, completed WorkOrders, passed review, no-active-gate evidence가 모두 current일 때만 가능합니다.</p>`
        }
      </div>
      <div class="relation-button-row delivery-package-actions">
        <button
          class="primary-button"
          type="button"
          data-action="accept-delivery-package"
          data-id="${escapeHtml(deliveryPackage.id)}"
          ${state.loading || state.mutating || !acceptanceSummary?.canAccept ? 'disabled' : ''}
        >
          패키지 승인
        </button>
        <button
          class="primary-button"
          type="button"
          data-action="close-out-ai-company-mission"
          data-id="${escapeHtml(mission?.id || '')}"
          ${state.loading || state.mutating || !closeOutSummary?.canCloseOut ? 'disabled' : ''}
        >
          미션 종료
        </button>
      </div>
    </section>
  `;
}

function renderMissionLearningCandidatePreview(
  preview,
  durableCandidate,
  mission,
  bundle,
  deliveryPackage,
  acceptance,
  missionCloseOut,
) {
  const summary = getMissionLearningCandidatePreviewSummary(
    mission,
    state.missionDeliveryPackagePreview,
    bundle,
    deliveryPackage,
    acceptance,
    missionCloseOut,
  );
  if (!summary) return '';

  const draft = state.missionLearningCandidateDraft;
  const targetPathDraft =
    draft.targetPathAllowlist || summary.targetPathAllowlist.join('\n');
  const verificationCommandDraft =
    draft.verificationCommands || summary.verificationCommands.join('\n');
  const currentPreview =
    preview?.sourceMissionId === mission.id ? preview : null;
  const persistenceSummary = getMissionLearningCandidatePersistenceSummary(
    currentPreview,
    durableCandidate,
    mission.id,
  );
  const currentCandidate = persistenceSummary.durableCandidate;
  const reviewSummary = getLearningCandidateReviewSummary(
    currentCandidate,
    state.missionLearningCandidateReview,
    mission.id,
  );
  const currentReview = reviewSummary.review;
  const reviewDraft = state.missionLearningCandidateReviewDraft;
  const selectedReviewEvidenceRefs =
    reviewDraft.evidenceRefs.length > 0
      ? reviewDraft.evidenceRefs
      : currentCandidate?.sourceEvidenceRefs.slice(0, 3) || [];
  const reviewEvidenceOptions = (currentCandidate?.sourceEvidenceRefs || [])
    .map(
      (sourceEvidenceRef) => `
        <label class="learning-candidate-review-evidence">
          <input
            type="checkbox"
            name="evidenceRefs"
            value="${escapeHtml(sourceEvidenceRef)}"
            ${selectedReviewEvidenceRefs.includes(sourceEvidenceRef) ? 'checked' : ''}
            ${state.loading || state.mutating || Boolean(currentReview) ? 'disabled' : ''}
          />
          <span>${escapeHtml(sourceEvidenceRef)}</span>
        </label>
      `,
    )
    .join('');
  const negativeEvidenceRows = (currentPreview?.negativeEvidence || [])
    .map(
      (entry) => `
        <div class="learning-candidate-negative-row">
          <strong>${escapeHtml(entry.sourceEvidenceRef)}</strong>
          <span>${escapeHtml(entry.statement)}</span>
        </div>
      `,
    )
    .join('');

  return `
    <section class="learning-candidate-panel" aria-label="Response-only LearningCandidate preview">
      <div class="card-title-row card-title-row-tight">
        <strong>LearningCandidate Preview</strong>
        ${createToken('response-only', 'accent')}
        ${createToken('review-required', 'warning')}
        ${createToken('persisted:false', 'neutral')}
      </div>
      <p class="detail-copy detail-copy-compact">
        완료된 Mission evidence에 operator summary를 결속합니다. 이 입력과 결과는 저장되지 않습니다.
      </p>
      <div class="token-row token-row-compact learning-candidate-source-tuple">
        ${createToken(`mission:${mission.id}`, 'success')}
        ${createToken(`close-out:${missionCloseOut.id}`, 'success')}
        ${createToken(`plan:${bundle.executionPlan.id}`, 'neutral')}
        ${createToken(`package:${deliveryPackage.id}`, 'neutral')}
        ${createToken(`acceptance:${acceptance.id}`, 'neutral')}
        ${createToken(`checkpoint:${deliveryPackage.terminalCheckpointId}`, 'neutral')}
      </div>
      <form class="learning-candidate-form" data-form="preview-learning-candidate">
        <div class="learning-candidate-grid">
          <label class="field">
            <span class="field-label">Lesson</span>
            <input
              class="text-input"
              name="lesson"
              type="text"
              value="${escapeHtml(draft.lesson)}"
              placeholder="이번 Mission에서 재사용할 수 있는 교훈"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Applicability summary</span>
            <input
              class="text-input"
              name="applicabilitySummary"
              type="text"
              value="${escapeHtml(draft.applicabilitySummary)}"
              placeholder="이 교훈을 적용할 조건과 범위"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Target path allowlist</span>
            <textarea
              class="text-input"
              name="targetPathAllowlist"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(targetPathDraft)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Verification commands</span>
            <textarea
              class="text-input"
              name="verificationCommands"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(verificationCommandDraft)}</textarea>
          </label>
          <label class="field learning-candidate-grid-wide">
            <span class="field-label">Negative evidence</span>
            <textarea
              class="text-input"
              name="negativeEvidence"
              rows="3"
              placeholder="${escapeHtml(summary.negativeEvidenceRefs[0] || 'evidence-ref')} :: 확인된 제한 또는 반증"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(draft.negativeEvidence)}</textarea>
            <span class="field-help">허용 refs: ${escapeHtml(summary.negativeEvidenceRefs.join(' · '))}</span>
          </label>
          <label class="field">
            <span class="field-label">Expires at</span>
            <input
              class="text-input"
              name="expiresAt"
              type="text"
              value="${escapeHtml(draft.expiresAt)}"
              placeholder="2030-01-01T00:00:00.000Z"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Redaction acknowledgement</span>
            <select
              class="text-input"
              name="redactionAcknowledgement"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              <option value="source-summary-only" ${draft.redactionAcknowledgement === 'source-summary-only' ? 'selected' : ''}>source-summary-only</option>
            </select>
          </label>
        </div>
        <div class="relation-button-row learning-candidate-actions">
          <button
            class="primary-button"
            type="button"
            data-action="preview-learning-candidate"
            data-id="${escapeHtml(mission.id)}"
            ${state.loading || state.mutating || !summary.available ? 'disabled' : ''}
          >
            학습 후보 미리보기
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="persist-learning-candidate"
            data-id="${escapeHtml(mission.id)}"
            ${state.loading || state.mutating || !persistenceSummary.canPersist ? 'disabled' : ''}
          >
            LearningCandidate 기록
          </button>
        </div>
      </form>
      ${
        currentPreview
          ? `
            <div class="learning-candidate-result" aria-label="LearningCandidate response evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(currentPreview.previewId)}</strong>
                ${createToken(currentPreview.reviewerStatus, 'warning')}
                ${createToken(currentPreview.promotionStatus, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`digest:${currentPreview.candidateDigest}`, 'neutral')}
                ${createToken(`expiry:${currentPreview.expiry.expiresAt}`, 'neutral')}
                ${createToken(`sources:${currentPreview.sourceEvidenceRefs.length}`, 'neutral')}
              </div>
              <p><strong>Lesson</strong> ${escapeHtml(currentPreview.lesson)}</p>
              <p><strong>Applicability</strong> ${escapeHtml(currentPreview.applicability.summary)}</p>
              <p><strong>Paths</strong> ${escapeHtml(currentPreview.applicability.targetPathAllowlist.join(' · '))}</p>
              <p><strong>Checks</strong> ${escapeHtml(currentPreview.applicability.verificationCommands.join(' · '))}</p>
              <div class="learning-candidate-negative-list">${negativeEvidenceRows}</div>
              <div class="delivery-package-authority" aria-label="Blocked learning authority">
                ${createToken(currentCandidate ? 'candidate persistence:recorded' : 'candidate persistence:explicit-only', currentCandidate ? 'success' : 'warning')}
                ${createToken('memory:blocked', 'neutral')}
                ${createToken('skill:blocked', 'neutral')}
                ${createToken('provider:blocked', 'neutral')}
                ${createToken('source:blocked', 'neutral')}
                ${createToken('git:blocked', 'neutral')}
                ${createToken('release:blocked', 'neutral')}
                ${createToken('next Mission:blocked', 'neutral')}
              </div>
            </div>
          `
          : ''
      }
      ${
        currentCandidate
          ? `
            <div class="learning-candidate-record" aria-label="Durable LearningCandidate evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(currentCandidate.id)}</strong>
                ${createToken('persisted:true', 'success')}
                ${createToken(currentCandidate.reviewerStatus, 'warning')}
                ${createToken(currentCandidate.promotionStatus, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`candidate:${currentCandidate.candidateDigest}`, 'neutral')}
                ${createToken(`record:${currentCandidate.recordDigest}`, 'neutral')}
                ${createToken(`created:${currentCandidate.createdAt}`, 'neutral')}
              </div>
              <p><strong>Lesson</strong> ${escapeHtml(currentCandidate.lesson)}</p>
              <p><strong>Review boundary</strong> review-required evidence only; promotion, memory, skill, provider, source, Git, release, scheduling, and next Mission remain blocked.</p>
            </div>
            ${
              currentReview
                ? `
                  <div class="learning-candidate-review-record" aria-label="Durable LearningCandidate review evidence">
                    <div class="card-title-row card-title-row-tight">
                      <strong>${escapeHtml(currentReview.id)}</strong>
                      ${createToken(currentReview.decision, currentReview.decision === 'accepted' ? 'success' : 'warning')}
                      ${createToken('append-only', 'neutral')}
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken(`review:${currentReview.reviewDigest}`, 'neutral')}
                      ${createToken(`candidate:${currentReview.candidateRecordDigest}`, 'neutral')}
                      ${createToken(`created:${currentReview.createdAt}`, 'neutral')}
                    </div>
                    <p><strong>Rationale</strong> ${escapeHtml(currentReview.rationale)}</p>
                    <p><strong>Evidence</strong> ${escapeHtml(currentReview.evidenceRefs.join(' · '))}</p>
                    <div class="delivery-package-authority" aria-label="Blocked post-review authority">
                      ${createToken('review evidence:recorded', 'success')}
                      ${createToken('candidate mutation:blocked', 'neutral')}
                      ${createToken('memory:blocked', 'neutral')}
                      ${createToken('skill:blocked', 'neutral')}
                      ${createToken('provider:blocked', 'neutral')}
                      ${createToken('source/Git:blocked', 'neutral')}
                      ${createToken('next Mission:blocked', 'neutral')}
                    </div>
                  </div>
                `
                : `
                  <form class="learning-candidate-review-form" data-form="review-learning-candidate">
                    <div class="card-title-row card-title-row-tight">
                      <strong>LearningCandidate Review</strong>
                      ${createToken(reviewSummary.unexpired ? 'current' : 'expired', reviewSummary.unexpired ? 'success' : 'warning')}
                      ${createToken('human-reviewed', 'neutral')}
                    </div>
                    <div class="learning-candidate-grid">
                      <label class="field">
                        <span class="field-label">Decision</span>
                        <select
                          class="text-input"
                          name="decision"
                          ${state.loading || state.mutating || !reviewSummary.canReview ? 'disabled' : ''}
                        >
                          <option value="accept" ${reviewDraft.decision === 'accept' ? 'selected' : ''}>accept</option>
                          <option value="reject" ${reviewDraft.decision === 'reject' ? 'selected' : ''}>reject</option>
                          <option value="changes-requested" ${reviewDraft.decision === 'changes-requested' ? 'selected' : ''}>changes-requested</option>
                        </select>
                      </label>
                      <label class="field">
                        <span class="field-label">Reviewer acknowledgement</span>
                        <select
                          class="text-input"
                          name="reviewerAcknowledgement"
                          ${state.loading || state.mutating || !reviewSummary.canReview ? 'disabled' : ''}
                        >
                          <option value="human-reviewed">human-reviewed</option>
                        </select>
                      </label>
                      <label class="field learning-candidate-grid-wide">
                        <span class="field-label">Rationale</span>
                        <textarea
                          class="text-input"
                          name="rationale"
                          rows="3"
                          ${state.loading || state.mutating || !reviewSummary.canReview ? 'disabled' : ''}
                        >${escapeHtml(reviewDraft.rationale)}</textarea>
                      </label>
                      <fieldset class="learning-candidate-review-evidence-list learning-candidate-grid-wide">
                        <legend>Evidence refs</legend>
                        ${reviewEvidenceOptions}
                      </fieldset>
                    </div>
                    <div class="relation-button-row learning-candidate-actions">
                      <button
                        class="primary-button"
                        type="button"
                        data-action="review-learning-candidate"
                        data-id="${escapeHtml(currentCandidate.id)}"
                        ${state.loading || state.mutating || !reviewSummary.canReview ? 'disabled' : ''}
                      >
                        검토 결과 기록
                      </button>
                    </div>
                  </form>
                `
            }
          `
          : ''
      }
    </section>
  `;
}

function renderMemoryRecallPreview(durableItem, durableCandidate) {
  const summary = getMemoryRecallPersistenceSummary(
    durableItem,
    state.missionMemoryRecallPreview,
    state.missionMemoryRecall,
    durableCandidate,
  );
  if (!summary) return '';

  const draft = state.missionMemoryRecallDraft;
  const recordDraft = state.missionMemoryRecallRecordDraft;
  const currentPreview = summary.currentPreview;
  const durableRecall = summary.memoryRecall;
  const workspaceProjectId =
    draft.workspaceProjectId || summary.workspaceProjectId;
  const applicabilitySummary =
    draft.applicabilitySummary || durableItem.applicability.summary;
  const targetPathAllowlist =
    draft.targetPathAllowlist || summary.targetPathAllowlist.join('\n');
  const verificationCommands =
    draft.verificationCommands || summary.verificationCommands.join('\n');
  const evidenceRefs = draft.evidenceRefs || summary.evidenceRefs.join('\n');
  const negativeEvidenceRefs =
    draft.negativeEvidenceRefs || summary.negativeEvidenceRefs.join('\n');
  const redactionRefs = draft.redactionRefs || summary.redactionRefs.join('\n');
  const reviewRefs = draft.reviewRefs || summary.reviewRefs.join('\n');

  return `
    <section class="memory-recall-panel" aria-label="MemoryRecall preview and durable evidence">
      <div class="card-title-row card-title-row-tight">
        <strong>MemoryRecall Preview</strong>
        ${createToken('response-only', 'accent')}
        ${createToken('exact-id', 'neutral')}
        ${createToken(summary.unexpired ? 'source-current' : 'expired', summary.unexpired ? 'success' : 'danger')}
      </div>
      <form class="memory-recall-form" data-form="preview-memory-recall">
        <div class="memory-candidate-grid">
          <label class="field memory-candidate-grid-wide">
            <span class="field-label">Recall purpose</span>
            <input
              class="text-input"
              name="purpose"
              type="text"
              value="${escapeHtml(draft.purpose)}"
              placeholder="이 evidence를 다시 검토할 구체적인 목적"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Workspace project</span>
            <input
              class="text-input"
              name="workspaceProjectId"
              type="text"
              value="${escapeHtml(workspaceProjectId)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Applicability summary</span>
            <input
              class="text-input"
              name="applicabilitySummary"
              type="text"
              value="${escapeHtml(applicabilitySummary)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Target path allowlist</span>
            <textarea class="text-input" name="targetPathAllowlist" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(targetPathAllowlist)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Verification commands</span>
            <textarea class="text-input" name="verificationCommands" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(verificationCommands)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Evidence refs</span>
            <textarea class="text-input" name="evidenceRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(evidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Negative evidence refs</span>
            <textarea class="text-input" name="negativeEvidenceRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(negativeEvidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Redaction refs</span>
            <textarea class="text-input" name="redactionRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(redactionRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Review refs</span>
            <textarea class="text-input" name="reviewRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(reviewRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Recall acknowledgement</span>
            <select class="text-input" name="acknowledgement" ${state.loading || state.mutating ? 'disabled' : ''}>
              <option value="operator-selected-exact-memory-item-for-read-only-recall">operator-selected-exact-memory-item-for-read-only-recall</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Non-application statement</span>
            <select class="text-input" name="nonApplicationStatement" ${state.loading || state.mutating ? 'disabled' : ''}>
              <option value="recall-preview-not-runtime-application">recall-preview-not-runtime-application</option>
            </select>
          </label>
        </div>
        <div class="relation-button-row memory-candidate-actions">
          <button
            class="primary-button"
            type="button"
            data-action="preview-memory-recall"
            data-id="${escapeHtml(durableItem.id)}"
            ${state.loading || state.mutating || !summary.canPreview ? 'disabled' : ''}
          >
            MemoryRecall 미리보기
          </button>
        </div>
      </form>
      ${
        currentPreview
          ? `
            <div class="memory-recall-result" aria-label="MemoryRecall response evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(currentPreview.id)}</strong>
                ${createToken(currentPreview.status, 'warning')}
                ${createToken(`retrieval:${currentPreview.retrievalMode}`, 'neutral')}
                ${createToken(`application:${currentPreview.applicationStatus}`, 'neutral')}
                ${createToken(`mission-injection:${currentPreview.missionInjectionStatus}`, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`digest:${currentPreview.previewDigest}`, 'neutral')}
                ${createToken(`source:${currentPreview.sourceMemoryItemId}`, 'success')}
                ${createToken(`scope:${currentPreview.workspaceScope.projectId}`, 'neutral')}
              </div>
              <p><strong>Purpose</strong> ${escapeHtml(currentPreview.purpose)}</p>
              <p><strong>Summary</strong> ${escapeHtml(currentPreview.summary)}</p>
              <p><strong>Applicability</strong> ${escapeHtml(currentPreview.applicability.summary)}</p>
              <p><strong>Negative evidence</strong> ${escapeHtml(currentPreview.negativeEvidenceRefs.join(' · '))}</p>
              <div class="delivery-package-authority" aria-label="Blocked recall authority">
                ${(currentPreview.blockedActions || [])
                  .map((action) => createToken(`${action}:blocked`, 'neutral'))
                  .join('')}
              </div>
            </div>
          `
          : ''
      }
      ${
        currentPreview && !durableRecall
          ? `
            <form class="memory-recall-record-form" data-form="persist-memory-recall">
              <div class="memory-candidate-grid">
                <label class="field memory-candidate-grid-wide">
                  <span class="field-label">Record rationale</span>
                  <textarea class="text-input" name="rationale" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(recordDraft.rationale)}</textarea>
                </label>
                <label class="field memory-candidate-grid-wide">
                  <span class="field-label">Record acknowledgement</span>
                  <select class="text-input" name="acknowledgement" ${state.loading || state.mutating ? 'disabled' : ''}>
                    <option value="reviewed-exact-memory-recall-for-local-audit">reviewed-exact-memory-recall-for-local-audit</option>
                  </select>
                </label>
              </div>
              <div class="relation-button-row memory-candidate-actions">
                <button
                  class="primary-button"
                  type="button"
                  data-action="persist-memory-recall"
                  data-id="${escapeHtml(durableItem.id)}"
                  ${state.loading || state.mutating || !summary.canPersist ? 'disabled' : ''}
                >
                  MemoryRecall 기록
                </button>
              </div>
            </form>
          `
          : ''
      }
      ${
        durableRecall
          ? `
            <div class="memory-recall-record" aria-label="Durable MemoryRecall evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(durableRecall.id)}</strong>
                ${createToken(durableRecall.status, 'success')}
                ${createToken(`retrieval:${durableRecall.retrievalMode}`, 'neutral')}
                ${createToken(`application:${durableRecall.applicationStatus}`, 'neutral')}
                ${createToken(`mission-injection:${durableRecall.missionInjectionStatus}`, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`digest:${durableRecall.recordDigest}`, 'neutral')}
                ${createToken(`preview:${durableRecall.sourceMemoryRecallPreviewId}`, 'success')}
                ${createToken(`scope:${durableRecall.workspaceScope.projectId}`, 'neutral')}
              </div>
              <p><strong>Purpose</strong> ${escapeHtml(durableRecall.purpose)}</p>
              <p><strong>Summary</strong> ${escapeHtml(durableRecall.summary)}</p>
              <p><strong>Record approval</strong> ${escapeHtml(durableRecall.recordApproval.rationale)}</p>
              <p><strong>Negative evidence</strong> ${escapeHtml(durableRecall.negativeEvidenceRefs.join(' · '))}</p>
              <div class="delivery-package-authority" aria-label="Blocked durable recall authority">
                ${(durableRecall.blockedActions || [])
                  .map((action) => createToken(`${action}:blocked`, 'neutral'))
                  .join('')}
              </div>
            </div>
            ${renderMissionMemoryContextPreview(durableItem, durableRecall)}
          `
          : ''
      }
    </section>
  `;
}

function renderMissionMemoryContextPreview(durableItem, durableRecall) {
  const draft = state.missionMemoryContextDraft;
  const targetMissionId = String(draft.targetMissionId || '').trim();
  const targetMission =
    state.payload?.snapshot?.missions?.[targetMissionId] || null;
  const summary = getMissionMemoryContextPreviewSummary(
    durableItem,
    durableRecall,
    targetMission,
    state.missionMemoryContextPreview,
  );
  if (!summary) return '';

  const currentPreview = summary.currentPreview;
  const workspaceProjectId =
    draft.workspaceProjectId || summary.workspaceProjectId;
  const applicabilitySummary =
    draft.applicabilitySummary || durableRecall.applicability.summary;
  const targetPathAllowlist =
    draft.targetPathAllowlist || summary.targetPathAllowlist.join('\n');
  const verificationCommands =
    draft.verificationCommands || summary.verificationCommands.join('\n');
  const evidenceRefs = draft.evidenceRefs || summary.evidenceRefs.join('\n');
  const negativeEvidenceRefs =
    draft.negativeEvidenceRefs || summary.negativeEvidenceRefs.join('\n');
  const redactionRefs = draft.redactionRefs || summary.redactionRefs.join('\n');
  const reviewRefs = draft.reviewRefs || summary.reviewRefs.join('\n');

  return `
    <section class="mission-memory-context-panel" aria-label="MissionMemoryContext response evidence">
      <div class="card-title-row card-title-row-tight">
        <strong>Mission Memory Context</strong>
        ${createToken('response-only', 'accent')}
        ${createToken('exact-id', 'neutral')}
        ${createToken(summary.unexpired ? 'source-current' : 'expired', summary.unexpired ? 'success' : 'danger')}
        ${
          targetMissionId
            ? createToken(
                summary.targetCurrent ? 'draft-target-current' : 'target-blocked',
                summary.targetCurrent ? 'success' : 'danger',
              )
            : createToken('target-required', 'warning')
        }
      </div>
      <form class="mission-memory-context-form" data-form="preview-mission-memory-context">
        <div class="memory-candidate-grid">
          <label class="field">
            <span class="field-label">Target Mission ID</span>
            <input
              class="text-input"
              name="targetMissionId"
              type="text"
              value="${escapeHtml(draft.targetMissionId)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Workspace project</span>
            <input
              class="text-input"
              name="workspaceProjectId"
              type="text"
              value="${escapeHtml(workspaceProjectId)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field memory-candidate-grid-wide">
            <span class="field-label">Context purpose</span>
            <input
              class="text-input"
              name="purpose"
              type="text"
              value="${escapeHtml(draft.purpose)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field memory-candidate-grid-wide">
            <span class="field-label">Applicability summary</span>
            <input
              class="text-input"
              name="applicabilitySummary"
              type="text"
              value="${escapeHtml(applicabilitySummary)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Target path allowlist</span>
            <textarea class="text-input" name="targetPathAllowlist" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(targetPathAllowlist)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Verification commands</span>
            <textarea class="text-input" name="verificationCommands" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(verificationCommands)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Evidence refs</span>
            <textarea class="text-input" name="evidenceRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(evidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Negative evidence refs</span>
            <textarea class="text-input" name="negativeEvidenceRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(negativeEvidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Redaction refs</span>
            <textarea class="text-input" name="redactionRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(redactionRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Review refs</span>
            <textarea class="text-input" name="reviewRefs" rows="3" ${state.loading || state.mutating ? 'disabled' : ''}>${escapeHtml(reviewRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Context acknowledgement</span>
            <select class="text-input" name="acknowledgement" ${state.loading || state.mutating ? 'disabled' : ''}>
              <option value="operator-selected-recorded-recall-for-mission-context-review">operator-selected-recorded-recall-for-mission-context-review</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Non-injection statement</span>
            <select class="text-input" name="nonInjectionStatement" ${state.loading || state.mutating ? 'disabled' : ''}>
              <option value="memory-context-preview-not-mission-or-prompt-injection">memory-context-preview-not-mission-or-prompt-injection</option>
            </select>
          </label>
        </div>
        <div class="relation-button-row memory-candidate-actions">
          <button
            class="primary-button"
            type="button"
            data-action="preview-mission-memory-context"
            data-id="${escapeHtml(durableRecall.id)}"
            ${state.loading || state.mutating || !summary.unexpired ? 'disabled' : ''}
          >
            Context 미리보기
          </button>
        </div>
      </form>
      ${
        currentPreview
          ? `
            <div class="mission-memory-context-result" aria-label="MissionMemoryContext response-only preview">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(currentPreview.id)}</strong>
                ${createToken(currentPreview.status, 'warning')}
                ${createToken(`selection:${currentPreview.selectionMode}`, 'neutral')}
                ${createToken(`application:${currentPreview.applicationStatus}`, 'neutral')}
                ${createToken(`mission-injection:${currentPreview.missionInjectionStatus}`, 'neutral')}
                ${createToken(`workorder-injection:${currentPreview.workOrderInjectionStatus}`, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`digest:${currentPreview.previewDigest}`, 'neutral')}
                ${createToken(`mission:${currentPreview.targetMissionId}`, 'success')}
                ${createToken(`recall:${currentPreview.sourceMemoryRecallId}`, 'success')}
                ${createToken(`scope:${currentPreview.workspaceScope.projectId}`, 'neutral')}
              </div>
              <p><strong>Purpose</strong> ${escapeHtml(currentPreview.purpose)}</p>
              <p><strong>Summary</strong> ${escapeHtml(currentPreview.summary)}</p>
              <p><strong>Applicability</strong> ${escapeHtml(currentPreview.applicability.summary)}</p>
              <p><strong>Negative evidence</strong> ${escapeHtml(currentPreview.negativeEvidenceRefs.join(' · '))}</p>
              <div class="delivery-package-authority" aria-label="Blocked MissionMemoryContext authority">
                ${(currentPreview.blockedActions || [])
                  .map((action) => createToken(`${action}:blocked`, 'neutral'))
                  .join('')}
              </div>
            </div>
          `
          : ''
      }
    </section>
  `;
}

function renderMemoryCandidatePreview(
  preview,
  durableMemoryItem,
  durableCandidate,
  durableReview,
  mission,
) {
  const summary = getMemoryCandidatePreviewSummary(
    durableCandidate,
    durableReview,
    mission?.id,
  );
  if (!summary) return '';

  const draft = state.missionMemoryCandidateDraft;
  const workspaceProjectId =
    draft.workspaceProjectId || summary.workspaceProjectId;
  const targetPathAllowlist =
    draft.targetPathAllowlist || summary.targetPathAllowlist.join('\n');
  const verificationCommands =
    draft.verificationCommands || summary.verificationCommands.join('\n');
  const evidenceRefs =
    draft.evidenceRefs || durableReview.evidenceRefs.join('\n');
  const negativeEvidenceRefs =
    draft.negativeEvidenceRefs || summary.negativeEvidenceRefs.join('\n');
  const redactionRefs =
    draft.redactionRefs || summary.redactionRefs.join('\n');
  const reviewRefs =
    draft.reviewRefs || summary.reviewRefs.join('\n');
  const expiresAt =
    draft.expiresAt || durableCandidate.expiry.expiresAt;
  const currentPreview =
    preview?.sourceLearningCandidateId === durableCandidate.id &&
    preview?.sourceLearningCandidateReviewId === durableReview.id
      ? preview
      : null;
  const persistenceSummary = getMemoryItemPersistenceSummary(
    currentPreview,
    durableMemoryItem,
    durableCandidate,
    durableReview,
    mission?.id,
  );
  const durableItem = persistenceSummary?.item || null;
  const storageDraft = state.missionMemoryItemStorageDraft;
  const blockedActionTokens = (currentPreview?.blockedActions || [])
    .map((action) => createToken(`${action}:blocked`, 'neutral'))
    .join('');

  return `
    <section class="memory-candidate-panel" aria-label="Response-only MemoryCandidate preview">
      <div class="card-title-row card-title-row-tight">
        <strong>MemoryCandidate Preview</strong>
        ${createToken('response-only', 'accent')}
        ${createToken('review-ready', 'warning')}
        ${createToken('persisted:false', 'neutral')}
      </div>
      <p class="detail-copy detail-copy-compact">
        accepted LearningCandidate review를 project-scoped readiness evidence로만 계산합니다.
        저장, 검색, 적용, 승격 권한은 열리지 않습니다.
      </p>
      <div class="token-row token-row-compact memory-candidate-source-tuple">
        ${createToken(`candidate:${durableCandidate.id}`, 'success')}
        ${createToken(`review:${durableReview.id}`, 'success')}
        ${createToken(`mission:${durableCandidate.sourceMissionId}`, 'neutral')}
        ${createToken(`project:${durableCandidate.projectId}`, 'neutral')}
      </div>
      <form class="memory-candidate-form" data-form="preview-memory-candidate">
        <div class="memory-candidate-grid">
          <label class="field">
            <span class="field-label">Summary</span>
            <input
              class="text-input"
              name="summary"
              type="text"
              value="${escapeHtml(draft.summary)}"
              placeholder="검토 가능한 memory readiness 요약"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Workspace project</span>
            <input
              class="text-input"
              name="workspaceProjectId"
              type="text"
              value="${escapeHtml(workspaceProjectId)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field memory-candidate-grid-wide">
            <span class="field-label">Applicability summary</span>
            <input
              class="text-input"
              name="applicabilitySummary"
              type="text"
              value="${escapeHtml(draft.applicabilitySummary)}"
              placeholder="적용 가능한 조건과 제외 범위"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Target path allowlist</span>
            <textarea
              class="text-input"
              name="targetPathAllowlist"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(targetPathAllowlist)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Verification commands</span>
            <textarea
              class="text-input"
              name="verificationCommands"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(verificationCommands)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Evidence refs</span>
            <textarea
              class="text-input"
              name="evidenceRefs"
              rows="4"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(evidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Negative evidence refs</span>
            <textarea
              class="text-input"
              name="negativeEvidenceRefs"
              rows="4"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(negativeEvidenceRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Redaction refs</span>
            <textarea
              class="text-input"
              name="redactionRefs"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(redactionRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Review refs</span>
            <textarea
              class="text-input"
              name="reviewRefs"
              rows="3"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >${escapeHtml(reviewRefs)}</textarea>
          </label>
          <label class="field">
            <span class="field-label">Expires at</span>
            <input
              class="text-input"
              name="expiresAt"
              type="text"
              value="${escapeHtml(expiresAt)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            />
          </label>
          <label class="field">
            <span class="field-label">Redaction acknowledgement</span>
            <select
              class="text-input"
              name="redactionAcknowledgement"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              <option value="source-summary-only">source-summary-only</option>
            </select>
          </label>
          <label class="field memory-candidate-grid-wide">
            <span class="field-label">Non-persistence statement</span>
            <select
              class="text-input"
              name="nonPersistenceStatement"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              <option value="readiness-only-not-durable-memory">readiness-only-not-durable-memory</option>
            </select>
          </label>
        </div>
        <div class="relation-button-row memory-candidate-actions">
          <button
            class="primary-button"
            type="button"
            data-action="preview-memory-candidate"
            data-id="${escapeHtml(durableCandidate.id)}"
            ${state.loading || state.mutating || !summary.canPreview ? 'disabled' : ''}
          >
            MemoryCandidate 미리보기
          </button>
        </div>
      </form>
      ${
        currentPreview
          ? `
            <div class="memory-candidate-result" aria-label="MemoryCandidate response evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(currentPreview.id)}</strong>
                ${createToken(currentPreview.status, 'warning')}
                ${createToken(`storage:${currentPreview.storageStatus}`, 'neutral')}
                ${createToken(`promotion:${currentPreview.promotionStatus}`, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`digest:${currentPreview.previewDigest}`, 'neutral')}
                ${createToken(`scope:${currentPreview.workspaceScope.projectId}`, 'neutral')}
                ${createToken(`expires:${currentPreview.expiresAt}`, 'neutral')}
              </div>
              <p><strong>Summary</strong> ${escapeHtml(currentPreview.summary)}</p>
              <p><strong>Applicability</strong> ${escapeHtml(currentPreview.applicability.summary)}</p>
              <p><strong>Paths</strong> ${escapeHtml(currentPreview.applicability.targetPathAllowlist.join(' · '))}</p>
              <p><strong>Checks</strong> ${escapeHtml(currentPreview.applicability.verificationCommands.join(' · '))}</p>
              <p><strong>Evidence</strong> ${escapeHtml(currentPreview.evidenceRefs.join(' · '))}</p>
              <p><strong>Negative evidence</strong> ${escapeHtml(currentPreview.negativeEvidenceRefs.join(' · '))}</p>
              <div class="delivery-package-authority" aria-label="Blocked memory authority">
                ${blockedActionTokens}
              </div>
              ${
                persistenceSummary?.canPersist
                  ? `
                    <form class="memory-item-storage-form" data-form="persist-memory-item">
                      <p class="detail-copy detail-copy-compact">
                        Project-only scope와 negative evidence를 검토하고, readiness preview가
                        storage approval이 아님을 확인한 뒤 별도 저장 승인을 기록합니다.
                      </p>
                      <label class="field">
                        <span class="field-label">Storage rationale</span>
                        <textarea
                          class="text-input"
                          name="rationale"
                          rows="3"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >${escapeHtml(storageDraft.rationale)}</textarea>
                      </label>
                      <label class="field">
                        <span class="field-label">Storage acknowledgement</span>
                        <select
                          class="text-input"
                          name="acknowledgement"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          <option value="reviewed-memory-candidate-for-local-project-storage">
                            reviewed-memory-candidate-for-local-project-storage
                          </option>
                        </select>
                      </label>
                      <div class="relation-button-row memory-candidate-actions">
                        <button
                          class="primary-button"
                          type="button"
                          data-action="persist-memory-item"
                          data-id="${escapeHtml(durableCandidate.id)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          MemoryItem 저장
                        </button>
                      </div>
                    </form>
                  `
                  : ''
              }
            </div>
          `
          : ''
      }
      ${
        durableItem
          ? `
            <div class="memory-item-record" aria-label="Durable MemoryItem evidence">
              <div class="card-title-row card-title-row-tight">
                <strong>${escapeHtml(durableItem.id)}</strong>
                ${createToken(durableItem.status, 'success')}
                ${createToken('persisted:true', 'success')}
                ${createToken(`application:${durableItem.applicationStatus}`, 'neutral')}
                ${createToken(`promotion:${durableItem.promotionStatus}`, 'neutral')}
              </div>
              <div class="token-row token-row-compact">
                ${createToken(`record:${durableItem.recordDigest}`, 'neutral')}
                ${createToken(`preview:${durableItem.sourceMemoryCandidatePreviewId}`, 'neutral')}
                ${createToken(`scope:${durableItem.workspaceScope.projectId}`, 'neutral')}
              </div>
              <p><strong>Summary</strong> ${escapeHtml(durableItem.summary)}</p>
              <p><strong>Storage approval</strong> ${escapeHtml(durableItem.storageApproval.rationale)}</p>
              <p><strong>Negative evidence</strong> ${escapeHtml(durableItem.negativeEvidenceRefs.join(' · '))}</p>
              <p><strong>Expires</strong> ${escapeHtml(durableItem.expiresAt)}</p>
              <div class="delivery-package-authority" aria-label="Blocked durable memory authority">
                ${(durableItem.blockedActions || [])
                  .map((action) => createToken(`${action}:blocked`, 'neutral'))
                  .join('')}
              </div>
              ${renderMemoryRecallPreview(durableItem, durableCandidate)}
            </div>
          `
          : ''
      }
    </section>
  `;
}

function renderRealCouncilAlignmentControls(councilSession) {
  const attempt = getCurrentRealCouncilAttempt(councilSession);
  const busy = state.loading || state.mutating;
  const unresolvedQuestions = attempt?.synthesis?.unresolvedQuestions;
  const previewBlockedReason = !attempt?.synthesis
    ? 'Conductor synthesis가 있어야 WorkOrder 초안을 계산할 수 있습니다.'
    : !Array.isArray(unresolvedQuestions) || unresolvedQuestions.length > 0
      ? '미해결 질문을 정리한 새 Council synthesis가 필요합니다.'
      : attempt.status !== 'awaiting-alignment' || attempt.conflictSummary?.approvalReady !== true
        ? '승인 가능한 Council attempt가 필요합니다.'
        : '';

  if (councilSession.phase === 'terminal') {
    return `
      <p class="form-help council-approval-help">
        ${escapeHtml(councilSession.terminalReason || councilSession.alignment?.status || 'terminal')}
      </p>
      ${
        councilSession.alignment?.status === 'approved'
          ? renderMissionWorkOrderCompileForm(councilSession, {
              recompute: true,
              blockedReason: previewBlockedReason,
            })
          : ''
      }
    `;
  }

  if (attempt?.status === 'failed') {
    return `
      <div class="relation-button-row">
        <button
          class="primary-button"
          type="button"
          data-action="resume-real-council-session"
          data-id="${escapeHtml(councilSession.id)}"
          ${busy ? 'disabled' : ''}
        >
          실패 지점 재개
        </button>
        <button
          class="secondary-button"
          type="button"
          data-action="stop-real-council-session"
          data-id="${escapeHtml(councilSession.id)}"
          ${busy ? 'disabled' : ''}
        >
          회의 중지
        </button>
      </div>
    `;
  }

  const targetOptions = (councilSession.participants || [])
    .filter((participant) => participant.roleId !== 'conductor')
    .map(
      (participant) => `
        <label class="form-help">
          <input
            type="checkbox"
            name="real-council-revision-target"
            value="${escapeHtml(participant.agentId)}"
            checked
            ${busy ? 'disabled' : ''}
          />
          ${escapeHtml(participant.role)}
        </label>
      `,
    )
    .join('');

  return `
    <div class="relation-button-row">
      <button
        class="primary-button"
        type="button"
        data-action="approve-real-council-session"
        data-id="${escapeHtml(councilSession.id)}"
        ${busy ? 'disabled' : ''}
      >
        기존 실행 연결 승인
      </button>
      <button
        class="secondary-button"
        type="button"
        data-action="stop-real-council-session"
        data-id="${escapeHtml(councilSession.id)}"
        ${busy ? 'disabled' : ''}
      >
        회의 중지
      </button>
    </div>
    ${renderMissionWorkOrderCompileForm(councilSession, {
      blockedReason: previewBlockedReason,
    })}
    <label class="field-label" for="real-council-revision-note">수정 요청</label>
    <textarea
      id="real-council-revision-note"
      class="text-input"
      rows="3"
      placeholder="수정할 판단과 근거를 기록합니다"
      ${busy ? 'disabled' : ''}
    ></textarea>
    <div class="token-row token-row-compact">${targetOptions}</div>
    <div class="relation-button-row">
      <button
        class="secondary-button"
        type="button"
        data-action="request-revision-real-council-session"
        data-id="${escapeHtml(councilSession.id)}"
        ${busy ? 'disabled' : ''}
      >
        선택 역할 재검토
      </button>
    </div>
  `;
}

function renderCouncil(data) {
  if (!data.activeProject) {
    elements.surfaces.council.innerHTML = renderProjectGateSurface(
      '협의회 사용 불가',
      '협의회를 열기 전에 미션 또는 고급 운영 모드에서 프로젝트를 먼저 고릅니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncilSession =
    selectedMission?.councilSessionId && data.councilSessionMap.has(selectedMission.councilSessionId)
      ? data.councilSessionMap.get(selectedMission.councilSessionId)
      : null;
  const linkedTask =
    selectedMission?.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;
  const missionExecutionPlanBundle = getMissionExecutionPlanBundle(
    data.snapshot,
    selectedCouncilSession?.id,
  );
  const selectedMissionCompletion = getMissionCompletionSummary(selectedMission, data);
  const selectedMissionCouncilPreview = getMissionCouncilPreview(selectedMission, data);
  const selectedMissionExecutionPreview = getMissionExecutionPreview(selectedMission, data);
  const selectedMissionDeliverablesPreview = getMissionDeliverablesPreview(selectedMission, data);
  const councilLoopStatus = getMissionLoopStatus(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
  });
  const councilControl = getCouncilControlSnapshot(
    selectedMission,
    selectedCouncilSession,
    linkedTask,
  );
  const isRealCouncil = isRealCouncilMode(selectedCouncilSession?.mode);
  const councilProviderReadiness =
    data.councilProviderReadinessSummaries?.[data.activeProject?.id] || null;
  const councilProviderReady = councilProviderReadiness?.allowed === true;

  if (!selectedMission) {
    elements.surfaces.council.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 안건 없음</strong>
          <p>참모 회의를 열기 전에 안건 표면에서 안건을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const councilDraftDisabled =
    state.loading || state.mutating || Boolean(selectedCouncilSession);
  const approveDisabled =
    state.loading ||
    state.mutating ||
    !selectedCouncilSession ||
    selectedCouncilSession.alignment?.status === 'approved';
  const councilNextSurface =
    selectedCouncilSession?.alignment?.status === 'approved'
      ? linkedTask
        ? 'execution'
        : 'mission'
      : 'council';
  const councilHeartbeatStrip = renderCouncilHeartbeatStrip(
    selectedMission,
    selectedCouncilSession,
    linkedTask,
  );
  const councilEvidenceRail = renderExecutionEvidenceRail(
    getExecutionEvidenceRail(linkedTask, data),
    {
      eyebrow: '결론 증적선',
      heading: '참모 결론이 실제 실행 증적으로 어디까지 넘어왔는지 봅니다',
      copy: '회의 결론 아래에서 현재 담당, 증적, 보류 사유, 다음 인계만 그대로 읽습니다.',
    },
  );
  const councilSignalBySurface = Object.fromEntries(
    getCompanySignalEntries({
      mission: selectedMission,
      councilSession: selectedCouncilSession,
      linkedTask,
      completionReady: selectedMissionCompletion.completionReady,
    }).map((entry) => [entry.surface, entry]),
  );
  const councilViewportStrip = renderViewportHandoffStrip({
    eyebrow: '회의실 동선',
    heading: '참석 기록선과 권고 선반으로 나눕니다',
    copy:
      '왼쪽은 참석 역할, 회의 안건, 발언 기록을 두고, 오른쪽은 권고안, 이견, 승인 상태를 먼저 보여 줍니다.',
    tokens: [
      createToken(
        `정렬:${getAlignmentStatusDisplay(selectedCouncilSession?.alignment?.status || 'pending')}`,
        getAlignmentTone(selectedCouncilSession?.alignment?.status || 'pending'),
      ),
      createToken(
        `참모:${selectedCouncilSession?.participants?.length || 4}석`,
        selectedCouncilSession ? 'neutral' : 'warning',
      ),
      createToken(`다음:${getSurfaceDisplayName(councilNextSurface)}`, councilNextSurface === 'execution' ? 'accent' : 'neutral'),
    ],
    cards: [
      {
        label: '왼쪽 참석 기록',
        title: '참석 역할 + 회의 안건',
        copy: '안건 맥락, 참석 역할, 회의 발언을 왼쪽에 둡니다.',
        signal: councilSignalBySurface.council,
      },
      {
        label: '오른쪽 권고 선반',
        title: '권고안 + 이견 + 승인선',
        copy: '권고 방향, 열린 이견, 현재 승인 상태를 먼저 보고 깊은 회의록은 뒤로 미룹니다.',
        signal: councilSignalBySurface['decision-inbox'],
      },
      {
        label: '다음 처리',
        title: councilControl.nextTitle,
        copy: councilControl.nextCopy,
        emphasis: true,
        signal: councilSignalBySurface[councilNextSurface] || councilSignalBySurface.council,
        button:
          selectedMission && councilNextSurface !== 'council'
            ? {
                action: 'open-surface-for-mission',
                id: selectedMission.id,
                targetSurface: councilNextSurface,
                label: getSurfaceDisplayName(councilNextSurface),
                disabled: state.loading || state.mutating,
              }
            : null,
      },
    ],
  });
  const transcriptCards = selectedCouncilSession
    ? (selectedCouncilSession.transcript || [])
        .map(
          (entry) => `
            <section class="relation-strip transcript-card">
              <div class="card-title-row card-title-row-tight transcript-card-head">
                <strong class="transcript-card-role">${escapeHtml(getCouncilCastEntry(entry.role, selectedCouncilSession).displayName)}</strong>
                ${entry.stance ? createToken(entry.stance, 'neutral') : ''}
              </div>
              <p class="detail-copy detail-copy-compact transcript-card-copy">${escapeHtml(entry.content || '')}</p>
            </section>
          `,
        )
        .join('')
    : '';

  elements.surfaces.council.innerHTML = `
    <div class="stack">
      ${renderCouncilBoardroomStage({
        agendaGoal:
          selectedMission.goal ||
          '안건이 올라오면 네 역할이 회의를 열고 목표와 방향을 먼저 정리합니다.',
        agendaTitle: selectedMission.title || '오늘 논의할 안건',
        completionReady: selectedMissionCompletion.completionReady,
        copy:
          '여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다.',
        heading: '참석 역할, 안건, 권고를 같은 회의실에서 정리합니다',
        councilSession: selectedCouncilSession,
        linkedTask,
        mission: selectedMission,
      })}
      ${councilHeartbeatStrip}
      ${councilViewportStrip}
      <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>회의 참석 등록부</h2>
            <p class="panel-copy panel-copy-tight">왼쪽은 참석자, 회의 안건, 발언 기록을 둡니다.</p>
          </div>
          <div class="token-row">
            ${createToken(`프로젝트:${data.activeProject.name}`, 'success')}
            ${createToken(`미션:${selectedMission.id}`, 'neutral')}
            ${createToken(`세션수:${data.councilSessions.length}`, 'neutral')}
          </div>
        </div>
        <section class="relation-strip">
          <div class="card-title-row">
            <strong>오늘 회의 안건</strong>
            ${createToken(getMissionStatusDisplay(selectedMission.status), getMissionStatusTone(selectedMission.status))}
            ${
              selectedMission.deliverableType
                ? createToken(
                    getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType),
                    'neutral',
                  )
                : ''
            }
            ${
              selectedCouncilSession
                ? createToken(
                    getCouncilStatusDisplay(selectedCouncilSession.status),
                    getCouncilStatusTone(selectedCouncilSession.status),
                  )
                : createToken('협의회:없음', 'warning')
            }
          </div>
          <p class="detail-copy">${escapeHtml(selectedMission.goal || '기록된 미션 목표가 없습니다.')}</p>
          ${
            selectedMission.deliverableType
              ? `<p class="detail-copy">선택 산출물: ${escapeHtml(getKnowledgeWorkDeliverableDisplayName(selectedMission.deliverableType))}</p>`
              : ''
          }
          <p class="detail-copy">${escapeHtml(selectedMission.constraints || '기록된 제약 조건이 없습니다.')}</p>
          ${
            !selectedCouncilSession
              ? `
                <div class="form-actions form-actions-inline">
                  <button
                    class="primary-button"
                    type="button"
                    data-action="start-real-council-for-mission"
                    data-id="${escapeHtml(selectedMission.id)}"
                    ${councilDraftDisabled ? 'disabled' : ''}
                  >
                    독립 역할 회의
                  </button>
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="start-provider-council-for-mission"
                    data-id="${escapeHtml(selectedMission.id)}"
                    ${councilDraftDisabled || !councilProviderReady || data.activeProject.pack === 'knowledge-work' ? 'disabled' : ''}
                  >
                    OpenAI 역할 회의
                  </button>
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="draft-council-for-mission"
                    data-id="${escapeHtml(selectedMission.id)}"
                    ${councilDraftDisabled ? 'disabled' : ''}
                  >
                    회의 초안
                  </button>
                  <p class="form-help">${
                    councilProviderReady
                      ? '안건이 올라온 뒤 local-stub 또는 명시적 OpenAI Responses 역할 회의를 엽니다.'
                      : `OpenAI 역할 회의 차단: ${escapeHtml(councilProviderReadiness?.reasons?.[0] || 'provider readiness가 준비되지 않았습니다.')}`
                  }</p>
                </div>
              `
              : ''
          }
        </section>
        ${
          selectedCouncilSession
            ? `
              <div class="stack">
                <section class="relation-strip">
                  <div class="card-title-row card-title-row-tight">
                    <strong>참석 역할 등록부</strong>
                    ${createToken('참여 역할', 'accent')}
                  </div>
                  <p class="detail-copy detail-copy-compact">
                    참석 역할이 끝까지 기록되어 권고와 승인선의 근거를 같은 회의 흐름에서 확인할 수 있습니다.
                  </p>
                  ${renderCouncilCastCards(selectedCouncilSession)}
                </section>
                ${isRealCouncil ? renderRealCouncilEvidence(selectedCouncilSession) : ''}
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>회의 발언 기록</strong>
                  </div>
                  <div class="stack">
                    ${transcriptCards}
                  </div>
                </section>
              </div>
            `
            : `
              <div class="empty-state council-empty-state council-empty-state-main">
                <strong class="council-empty-title">회의 세션 없음</strong>
                <p class="council-empty-copy">회의를 열면 참석 역할, 권고안, 승인 선반이 이곳에 뜹니다.</p>
                ${renderCouncilCastCards(null)}
              </div>
            `
        }
      </section>
      <aside class="detail-card">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>권고와 승인 선반</h2>
            <p class="panel-copy panel-copy-tight">오른쪽은 권고안, 이견, 승인 상태만 먼저 봅니다.</p>
          </div>
        </div>
        ${
          selectedCouncilSession
            ? `
              ${renderNarrativeDeck({
                wide: false,
                eyebrow: '회의 권고 선반',
                heading: '권고안, 이견, 승인 선반을 먼저 봅니다',
                copy: '오른쪽 패널은 회의록 전체보다 현재 권고안, 열린 이견, 승인 상태를 먼저 보여 줍니다.',
                tokens: [
                  createToken(selectedCouncilSession.id, 'neutral'),
                  createToken(
                    `정렬:${selectedCouncilSession.alignment?.status || 'pending'}`,
                    getAlignmentTone(selectedCouncilSession.alignment?.status || 'pending'),
                  ),
                  linkedTask
                    ? createToken(`연결태스크:${linkedTask.id}`, 'accent')
                    : createToken('연결태스크:없음', 'warning'),
                ],
                cards: [
                  {
                    label: '루프 스테이지',
                    title: councilLoopStatus.stageLabel,
                    copy: `${councilLoopStatus.stopCondition}. ${councilLoopStatus.returnPoint}`,
                  },
                  {
                    label: '현재 판단',
                    title: councilControl.currentTitle,
                    copy: councilControl.currentCopy,
                  },
                  {
                    label: '다음',
                    title: councilControl.nextTitle,
                    copy: councilControl.nextCopy,
                  },
                  {
                    label: '이유',
                    title: councilControl.reasonTitle,
                    copy: councilControl.reasonCopy,
                  },
                ],
              })}
              <div class="stack council-outcome-stack">
                <section class="relation-strip council-outcome-card council-outcome-card-summary">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">회의 요약</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.summary || '기록된 요약이 없습니다.')}</p>
                </section>
                <section class="relation-strip council-outcome-card council-outcome-card-recommendation">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">권고안 선반</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.recommendation || '기록된 추천안이 없습니다.')}</p>
                </section>
                <section class="relation-strip council-outcome-card council-outcome-card-plan">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">채택 후보 선반</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact council-outcome-copy">${escapeHtml(selectedCouncilSession.selectedPlan?.title || '기록된 선택 계획이 없습니다.')}</p>
                  <p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-copy-muted">${escapeHtml(selectedCouncilSession.selectedPlan?.scope || '기록된 선택 범위가 없습니다.')}</p>
                </section>
                ${councilEvidenceRail}
                <section class="relation-strip council-outcome-card council-outcome-card-questions">
                  <div class="card-title-row card-title-row-tight council-outcome-head">
                    <strong class="council-outcome-title">이견·추가 확인</strong>
                  </div>
                  <div class="stack council-outcome-question-list">
                    ${selectedCouncilSession.openQuestions
                      .map(
                        (question) => `
                          <p class="detail-copy detail-copy-compact council-outcome-copy council-outcome-question">${escapeHtml(question)}</p>
                        `,
                      )
                      .join('')}
                  </div>
                </section>
                <section class="relation-strip detail-block detail-block-action council-approval-block">
                  <div class="council-approval-head">
                    <div>
                      <p class="detail-key">승인 선반</p>
                      <p class="council-approval-copy">이 권고안을 승인하면 사전 점검까지만 넘기고, 다음 게이트에서 멈춥니다.</p>
                    </div>
                    <div class="token-row token-row-compact">
                      ${createToken('결론 승인', selectedCouncilSession.alignment?.status === 'approved' ? 'success' : 'accent')}
                      ${linkedTask ? createToken('실행 연결', 'neutral') : createToken('연결 대기', 'warning')}
                    </div>
                  </div>
                  <div class="form-actions council-approval-row">
                    ${isRealCouncil
                      ? `
                        <div class="field">
                          ${renderRealCouncilAlignmentControls(selectedCouncilSession)}
                          ${renderMissionWorkOrderPreview(state.missionWorkOrderPreview, selectedCouncilSession, missionExecutionPlanBundle)}
                          ${renderMissionExecutionPlan(missionExecutionPlanBundle, state.missionExecutionPlanRecovery)}
                          <div class="relation-button-row">
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="revise-mission"
                              data-id="${escapeHtml(selectedMission.id)}"
                              ${state.loading || state.mutating ? 'disabled' : ''}
                            >
                              안건 다시 다듬기
                            </button>
                            <button
                              class="secondary-button"
                              type="button"
                              data-action="open-advanced-ops"
                              data-id="${escapeHtml(selectedMission.id)}"
                              ${state.loading || state.mutating ? 'disabled' : ''}
                            >
                              관제실
                            </button>
                            ${
                              linkedTask
                                ? `
                                  <button
                                    class="secondary-button"
                                    type="button"
                                    data-action="open-execution"
                                    data-id="${escapeHtml(selectedMission.id)}"
                                    ${state.loading || state.mutating ? 'disabled' : ''}
                                  >
                                    실행 데스크
                                  </button>
                                `
                                : ''
                            }
                          </div>
                        </div>
                      `
                      : `
                        <button
                          class="primary-button"
                          type="button"
                          data-action="approve-council-for-mission"
                          data-id="${escapeHtml(selectedMission.id)}"
                          ${approveDisabled ? 'disabled' : ''}
                        >
                          회의 결론 승인
                        </button>
                        <button
                          class="secondary-button"
                          type="button"
                          data-action="revise-mission"
                          data-id="${escapeHtml(selectedMission.id)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          안건 다시 다듬기
                        </button>
                        <button
                          class="secondary-button"
                          type="button"
                          data-action="open-advanced-ops"
                          data-id="${escapeHtml(selectedMission.id)}"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          관제실
                        </button>
                        ${
                          linkedTask
                            ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-execution"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            실행 데스크
                          </button>
                        `
                            : ''
                        }
                      `}
                  </div>
                  <p class="form-help council-approval-help">
                    ${
                      isRealCouncil
                        ? `mode=${escapeHtml(selectedCouncilSession.mode)} · phase=${escapeHtml(selectedCouncilSession.phase)}`
                        : selectedCouncilSession.alignment?.status === 'approved'
                        ? escapeHtml(
                            `${formatDate(selectedCouncilSession.alignment?.decidedAt)}에 결론이 승인됐습니다. 이제 실행 지시 데스크와 관제실에서 다음 지시를 확인합니다.`,
                          )
                        : '결론 승인이 끝나야 후속 실행이 열립니다.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state council-empty-state council-empty-state-detail">
                <strong class="council-empty-title">권고안 선반 비어 있음</strong>
                <p class="council-empty-copy">선택된 안건에서 회의를 열면 권고안과 승인 선반이 채워집니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderCouncilHeartbeatStrip(mission, councilSession, linkedTask) {
  const loopStatus = getMissionLoopStatus(mission, {
    completion: { completionReady: false, linkedTask },
    council: { councilSession },
    execution: { linkedTask },
  });
  const castEntries = COUNCIL_CAST_ORDER.map((role) => getCouncilCastEntry(role, councilSession));
  const councilHeartbeatSignals = getCompanySignalEntries({
    mission,
    councilSession,
    linkedTask,
    completionReady: false,
  }).filter((entry) => ['mission', 'council', 'execution', 'decision-inbox'].includes(entry.surface));
  const heartbeatTone = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? 'success'
      : 'accent'
    : 'warning';
  const heartbeatStatus = councilSession
    ? councilSession.alignment?.status === 'approved'
      ? linkedTask
        ? '인계 완료'
        : '정렬 완료'
      : '정렬 중'
    : '대기 중';
  const heartbeatCards = castEntries
    .map((castEntry) => {
      const heartbeatCopy = councilSession
        ? councilSession.alignment?.status === 'approved'
          ? linkedTask
            ? `${linkedTask.id} 기준 후속 판단으로 인계를 마쳤습니다.`
            : `${castEntry.displayName} 관점 정렬은 끝났고 실행 연결만 남았습니다.`
          : castEntry.focus
        : castEntry.previewLine;
      const heartbeatFoot = councilSession
        ? councilSession.alignment?.status === 'approved'
          ? linkedTask
            ? '실행 흐름'
            : '인계선 대기'
          : '회의 흐름'
        : '착석 준비';

      return `
        <article class="council-heartbeat-card council-heartbeat-card-${castEntry.tone}">
          <div class="council-heartbeat-head">
            <span class="council-heartbeat-pulse council-heartbeat-pulse-${heartbeatTone}"></span>
            <strong class="council-heartbeat-role">${escapeHtml(castEntry.displayName)}</strong>
            ${createToken(heartbeatStatus, heartbeatTone)}
          </div>
          <p class="council-heartbeat-rank">${escapeHtml(castEntry.rank)}</p>
          <p class="council-heartbeat-copy">${escapeHtml(heartbeatCopy)}</p>
          <p class="council-heartbeat-foot">${escapeHtml(heartbeatFoot)}</p>
        </article>
      `;
    })
    .join('');

  return `
    <section class="relation-strip council-heartbeat-strip">
      <div class="card-title-row card-title-row-tight">
        <strong>회의 흐름</strong>
        ${createToken(
          `회의:${councilSession ? getCouncilStatusDisplay(councilSession.status) : '대기'}`,
          councilSession ? getCouncilStatusTone(councilSession.status) : 'warning',
        )}
        ${createToken(
          `정렬:${councilSession ? getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending') : '대기'}`,
          heartbeatTone,
        )}
        ${mission ? createToken(`안건:${mission.id}`, 'neutral') : ''}
        ${loopStatus ? createToken(`루프:${loopStatus.stageLabel}`, loopStatus.stopTone) : ''}
        ${loopStatus ? createToken(`중지:${loopStatus.stopCondition}`, loopStatus.stopTone) : ''}
      </div>
      <p class="detail-copy detail-copy-compact council-heartbeat-intro">
        참석 역할, 정렬 상태, 인계 상태를 같은 회의 흐름에서 이어서 확인합니다. Loop stop condition은 같은 선반에서 함께 봅니다.
      </p>
      <div class="council-heartbeat-signal-row">
        ${councilHeartbeatSignals
          .map(
            (entry) => `
              <div class="council-heartbeat-signal council-heartbeat-signal-${escapeHtml(entry.tone)}">
                <span class="council-heartbeat-signal-dot"></span>
                <span class="council-heartbeat-signal-label">${escapeHtml(entry.label)}</span>
                <strong class="council-heartbeat-signal-status">${escapeHtml(entry.status)}</strong>
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="council-heartbeat-grid">
        ${heartbeatCards}
      </div>
    </section>
  `;
}

function renderExecution(data) {
  if (!data.activeProject) {
    elements.surfaces.execution.innerHTML = renderProjectGateSurface(
      '실행 데스크 사용 불가',
      '실행 데스크를 열기 전에 안건에서 프로젝트를 고르거나, 수동 제어가 필요하면 관제실을 사용합니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncilSession = getMissionCouncilPreview(selectedMission, data).councilSession;

  if (!selectedMission) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 안건 없음</strong>
          <p>실행 데스크를 열기 전에 안건을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>실행 지시 데스크</h2>
              <p class="panel-copy">선택된 안건에 배정 실행 셀이 생기기 전까지는 작업 지시 데스크가 비어 있습니다.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>배정 실행 셀 없음</strong>
            <p>회의 승인으로 첫 실행 셀을 자동으로 만들거나, 안건 브리프에서 수동으로 연결합니다.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>다음 지시</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-council"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              회의실
            </button>
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              관제실
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const executionEntryGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const taskBreakerState = getTaskBreakerAvailability(linkedTask, data, state.loading || state.mutating);
  const builderPreflightState = getBuilderPreflightAvailability(linkedTask, data, state.loading || state.mutating);
  const builderLiveMutationState = getBuilderLiveMutationSummaries(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data, state.loading || state.mutating);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data, state.loading || state.mutating);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data, state.loading || state.mutating);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data, state.loading || state.mutating);
  const closeOutState = getCloseOutAvailability(linkedTask, data, state.loading || state.mutating);
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const executionCompletionReady = Boolean(
    linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState.summary?.existingCloseOutArtifactId),
  );
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      builderLiveMutationState.guardSummary.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const canRunCloseOut = Boolean(closeOutState.summary.allowed);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const gateCopy =
    preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? '빌더 라이브 변경 승인이 대기 중입니다.'
      : linkedTask.flags?.waitingDecision
          ? '막고 있는 결정 항목이 대기 중입니다.'
          : executionEntryGateReason
            ? executionEntryGateReason
        : builderLiveMutationState.requestSummary.allowed
            ? `사전 점검 ${builderLiveMutationState.requestSummary.currentPreflightArtifactId}가 빌더 라이브 변경 승인 준비 상태입니다.`
            : '현재 활성화된 차단 게이트는 없습니다.';
  const executionControl = getExecutionControlSnapshot(
    linkedTask,
    latestRun,
    approvalBridge,
    gateCopy,
    {
      closeOutAllowed: canRunCloseOut,
      commitAllowed: canPrepareCommitPackage || canRunLocalCommit,
      releaseAllowed: canPrepareReleasePackage,
    },
  );
  const executionLeft = getExecutionLeftSnapshot(linkedTask, latestRun, executionControl, {
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    latestPreflightArtifact,
  });
  const executionEvidenceRail = renderExecutionEvidenceRail(
    getExecutionEvidenceRail(linkedTask, data),
    {
      eyebrow: '실행 증적선',
      heading: '회의 인계와 현재 실행 로그를 같은 선으로 읽습니다',
      copy: '현재 담당, 역할별 증적, 차단 사유, 다음 인계만 요약합니다.',
    },
  );
  const harnessBrief = getHarnessConsumerBrief(data);
  const harnessConsumerStatus = getHarnessConsumerStatus(data);

  elements.surfaces.execution.innerHTML = `
    <div class="stack">
      ${renderExecutionCommandDeck({
        approvalBridge,
        completionReady: executionCompletionReady,
        councilSession: selectedCouncilSession,
        gateCopy,
        latestRun,
        mission: selectedMission,
        task: linkedTask,
      })}
      ${renderHarnessBriefRegister(harnessBrief)}
    <div class="surface-grid">
      <section class="surface-panel">
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '작업 지시 개요',
          heading: '실행 지시 데스크',
          copy: '왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다.',
          tokens: [
            createToken(`안건:${selectedMission.id}`, 'neutral'),
            createToken(`실행셀:${linkedTask.id}`, 'accent'),
            createToken(getTaskLifecycleDisplay(linkedTask.lifecycleState), 'neutral'),
            createToken(`리뷰:${getReviewStatusDisplay(linkedTask.review?.status || 'pending')}`, getReviewTone(linkedTask.review?.status)),
            linkedTask.flags?.blocked ? createToken('차단', 'danger') : '',
            linkedTask.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
            linkedTask.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 작업 지시',
              title: executionLeft.currentTitle,
              copy: executionLeft.currentCopy,
            },
            {
              label: '다음 처리',
              title: executionLeft.nextTitle,
              copy: executionLeft.nextCopy,
            },
            {
              label: '연결 근거',
              title: executionLeft.reasonTitle,
              copy: executionLeft.reasonCopy,
            },
          ],
        })}
        ${renderHarnessExecutionActionShelf(harnessConsumerStatus)}
        ${executionEvidenceRail}

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>최근 실행 로그</strong>
          </div>
          <div class="token-row">
            ${latestRun ? createToken(`run:${latestRun.id}`, getRunTone(latestRun.status)) : createToken('run:없음', 'neutral')}
            ${latestRun ? createToken(`역할:${getExecutionRoleDisplay(latestRunRole)}`, 'neutral') : ''}
            ${latestRunNextStage ? createToken(`다음:${getExecutionStageDisplay(latestRunNextStage)}`, 'neutral') : ''}
          </div>
          <p class="detail-copy">
            ${
              latestRun
                ? escapeHtml(`${formatDate(latestRun.startedAt)}에 시작된 최신 실행 로그 기준 요약입니다.`)
                : '아직 기록된 실행 로그가 없습니다.'
            }
          </p>
        </section>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>상류 승인 패킷</strong>
          </div>
          <div class="token-row">
            ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
            ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
            ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
            ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
          </div>
          <p class="detail-copy">회의 결론 승인 자동 체인은 플래너부터 프리플라이트까지만 진행되고, 이후는 기존 승인 게이트 규칙을 따릅니다.</p>
        </section>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>게이트 제어 데스크</h2>
            <p class="panel-copy">여기서는 승인선, 차단 사유, 실행 준비 상태를 먼저 봅니다.</p>
          </div>
        </div>
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '게이트 판단판',
          heading: '현재 게이트와 바로 처리할 후속을 먼저 봅니다',
          copy: '오른쪽 패널은 작업 지시보다 승인선, 차단 근거, 다음 처리 경로를 우선 보여 줍니다.',
          tokens: [
            createToken(getTaskLifecycleDisplay(linkedTask.lifecycleState), 'neutral'),
            linkedTask.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
            linkedTask.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
            linkedTask.flags?.blocked ? createToken('차단', 'danger') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 게이트',
              title: executionControl.currentTitle,
              copy: executionControl.currentCopy,
            },
            {
              label: '다음 처리',
              title: executionControl.nextTitle,
              copy: executionControl.nextCopy,
            },
            {
              label: '판단 근거',
              title: executionControl.reasonTitle,
              copy: executionControl.reasonCopy,
            },
          ],
        })}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>승인선</strong>
            </div>
            <div class="token-row">
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `승인:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('승인:없음', 'neutral')
              }
              ${
                approvalBridge.actionLabel
                  ? createToken(`액션:${approvalBridge.actionLabel}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`대상:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`아티팩트:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `결정함:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>다음 지시</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      현재 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 빌더 승인 기록을 그대로 재사용하며, 세부 태스크/로그/아티팩트/결정함 제어는 관제실에 남깁니다.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      커밋 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 커밋 승인 기록을 그대로 처리합니다. 이후 후속 단계는 계속 관제실에 남습니다.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      릴리스 지시 승인
                    </button>
                  </div>
                  <p class="form-help">기존 대기 중인 릴리스 승인 기록을 그대로 처리합니다. 종료 정리는 릴리스 준비 상태가 잡힌 뒤 실행에서 이어집니다.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-builder-live-mutation"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      라이브 변경 적용
                    </button>
                  </div>
                  <p class="form-help">현재 빌더 승인은 이미 승인됐습니다. 이 CTA는 라이브 변경 경로를 따라 한정된 변경 번들을 실행 로그로 남깁니다.</p>
                `
                : ''
            }
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-reviewer"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      검토 보고 생성
                    </button>
                  </div>
                  <p class="form-help">최신 라이브 변경 번들이 준비됐습니다. 이 CTA는 리뷰어 경로를 따라 검토 보고로 이어집니다.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-commit-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      커밋 패킷 준비
                    </button>
                  </div>
                  <p class="form-help">최신 리뷰어 번들이 준비됐습니다. 이 CTA는 커밋 패키지 경로를 따라 현재 커밋 승인을 엽니다.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-local-commit"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      승인된 로컬 커밋 실행
                    </button>
                  </div>
                  <p class="form-help">현재 커밋 번들이 준비됐습니다. 이 CTA는 로컬 커밋 경로를 따라 커밋 결과 번들로 이어집니다.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-release-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      릴리스 패킷 준비
                    </button>
                  </div>
                  <p class="form-help">최신 로컬 커밋 번들이 준비됐습니다. 이 CTA는 릴리스 패키지 경로를 따라 현재 릴리스 승인을 엽니다.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-close-out"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      승인된 종료 정리 실행
                    </button>
                  </div>
                  <p class="form-help">현재 승인된 릴리스 번들이 준비됐습니다. 이 CTA는 종료 정리 경로를 따라 종료 정리 번들로 이어집니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>차단 사유</strong>
            </div>
            <p class="detail-copy">${escapeHtml(gateCopy)}</p>
            <div class="token-row">
              ${preferredInboxItem?.status === 'pending' ? createToken(`결정함:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem)) : ''}
              ${preferredInboxItem?.kind ? createToken(`종류:${preferredInboxItem.kind}`, 'neutral') : ''}
              ${
                builderLiveMutationState.requestSummary.latestApprovalDisplayStatus
                  ? createToken(
                      `승인:${getApprovalStatusDisplay(builderLiveMutationState.requestSummary.latestApprovalDisplayStatus)}`,
                      builderLiveMutationState.requestSummary.latestApprovalDisplayStatus === 'pending'
                        ? 'accent'
                        : 'neutral',
                    )
                  : ''
              }
            </div>
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>실행 준비 패킷</strong>
            </div>
            <div class="token-row">
              ${createToken(
                builderLiveMutationState.requestSummary.allowed ? '승인준비완료' : '준비안됨',
                builderLiveMutationState.requestSummary.allowed ? 'success' : 'warning',
              )}
              ${
                builderLiveMutationState.requestSummary.currentPreflightArtifactId
                  ? createToken(
                      `preflight:${builderLiveMutationState.requestSummary.currentPreflightArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                builderLiveMutationState.requestSummary.allowed
                  ? '현재 프리플라이트 아티팩트 기준으로 빌더 라이브 변경 승인 게이트가 생성된 상태입니다.'
                  : escapeHtml(
                      (builderLiveMutationState.requestSummary.reasons || []).join('; ') ||
                        '아직 실행 준비 패킷 상태를 확인할 수 없습니다.',
                    )
              }
            </p>
            ${
              parsedPreflight
                ? `
                  ${renderCompactList('대상 파일', parsedPreflight.targetFiles)}
                  ${renderCompactList('위험 요소', parsedPreflight.risks)}
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>빠른 이동</strong>
            </div>
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
              data-action="open-council"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              회의실
            </button>
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              관제실
            </button>
          </div>
          <p class="form-help">현재 지시가 아직 대기 상태이면 관제실에서 결정함을 처리한 뒤, 다음 한정된 실행 액션으로 돌아옵니다.</p>
          </section>
        </div>
      </aside>
    </div>
    </div>
  `;
}

function renderDeliverables(data) {
  if (!data.activeProject) {
    elements.surfaces.deliverables.innerHTML = renderProjectGateSurface(
      '산출물 사용 불가',
      '산출물을 열기 전에 미션에서 프로젝트를 고르거나, 수동 제어가 필요하면 고급 운영 모드를 사용합니다.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;

  if (!selectedMission) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>선택된 미션 없음</strong>
          <p>산출물을 열기 전에 미션을 만들거나 선택합니다.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>결과 패킷 데스크</h2>
              <p class="panel-copy">선택된 안건에 연결 실행 셀이 생기기 전까지는 결과 패킷 데스크가 비어 있습니다.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>연결 실행 셀 없음</strong>
            <p>먼저 회의에서 권고안을 승인합니다. Deliverables는 현재 엔진에 이미 존재하는 패킷, 리뷰 라인, 승인 라인 상태만 요약합니다.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>인계 데스크</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              고급 운영
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const taskArtifacts = getTaskArtifacts(linkedTask.id, data.artifacts).sort(sortByCreatedDesc);
  const taskApprovals = getTaskApprovals(linkedTask.id, data.approvals).sort(sortByCreatedDesc);
  const approvalSummary = getTaskApprovalSummary(linkedTask, data.approvals);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const latestRunForOps = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestArtifact = taskArtifacts[0] || null;
  const latestPlanArtifact = getLatestTaskArtifact(linkedTask, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(linkedTask, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(linkedTask, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(linkedTask, data, 'preflight');
  const latestChangeSummaryArtifact = getLatestTaskArtifact(linkedTask, data, 'change-summary');
  const latestPatchArtifact = getLatestTaskArtifact(linkedTask, data, 'patch');
  const latestDiffArtifact = getLatestTaskArtifact(linkedTask, data, 'diff');
  const latestReviewArtifact = getLatestTaskArtifact(linkedTask, data, 'review');
  const latestCommitPackageArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-package');
  const latestCommitResultArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-result');
  const latestReleasePackageArtifact = getLatestTaskArtifact(linkedTask, data, 'release-package');
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const latestApproval = taskApprovals[0] || null;
  const selectedCouncilSession = getMissionCouncilPreview(selectedMission, data).councilSession;
  const missionExecutionPlanBundle = getMissionExecutionPlanBundle(
    data.snapshot,
    selectedCouncilSession?.id,
  );
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data, state.loading || state.mutating);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data, state.loading || state.mutating);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data, state.loading || state.mutating);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data, state.loading || state.mutating);
  const closeOutState = getCloseOutAvailability(linkedTask, data, state.loading || state.mutating);
  const missionCloseOutRecord = missionExecutionPlanBundle?.latestMissionCloseOut || null;
  const missionCompletionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (
        latestCloseOutArtifact ||
        closeOutState.summary.existingCloseOutArtifactId ||
        missionCloseOutRecord
      ),
  );
  const missionCompletionArtifactId =
    latestCloseOutArtifact?.id ||
    closeOutState.summary.existingCloseOutArtifactId ||
    missionCloseOutRecord?.id ||
    null;
  const missionCompletionEvidenceLabel = missionCloseOutRecord
    ? `MissionCloseOut ${missionCloseOutRecord.id}`
    : `종료 정리 아티팩트 ${missionCompletionArtifactId}`;
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      data.derived?.taskGuardSummaries?.[linkedTask.id]?.builderLiveMutation?.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const canRunCloseOut = Boolean(closeOutState.summary.allowed);
  const latestReviewStatus = linkedTask.review?.status || 'pending';
  const latestReviewNote =
    linkedTask.review?.resolution?.note || '아직 기록된 리뷰 해결 메모가 없습니다.';
  const executionGateReason = getDevelopmentPackExecutionGateReason(linkedTask, data);
  const deliverablesActionSignals = getCompanySignalEntries({
    mission: selectedMission,
    councilSession: selectedCouncilSession,
    linkedTask,
    completionReady: missionCompletionReady,
  });
  const reviewActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'execution',
    'deliverables',
    'decision-inbox',
  ]);
  const approvalActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'decision-inbox',
    'execution',
    'deliverables',
  ]);
  const closeOutActionSignalRow = renderDeliverablesShelfSignalRow(
    deliverablesActionSignals,
    missionCompletionReady ? ['deliverables', 'mission'] : ['execution', 'deliverables'],
  );
  const opsActionSignalRow = renderDeliverablesShelfSignalRow(deliverablesActionSignals, [
    'deliverables',
    'decision-inbox',
  ]);
  const deliverablesOpsEntrySignals = [
    {
      surface: 'taskboard',
      label: '작업판',
      status: getTaskLifecycleDisplay(linkedTask.lifecycleState),
      tone: getTaskLifecycleTone(linkedTask.lifecycleState),
    },
    {
      surface: 'logs',
      label: '로그',
      status: latestRunForOps ? getRunStatusDisplay(latestRunForOps.status) : 'run 없음',
      tone: latestRunForOps ? getRunTone(latestRunForOps.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: latestArtifact ? getArtifactTypeDisplay(latestArtifact.type) : '증적 없음',
      tone: missionCompletionReady ? 'success' : latestArtifact ? 'accent' : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: preferredInboxItem
        ? `${getInboxKindDisplay(preferredInboxItem.kind)} ${getInboxStatusDisplay(preferredInboxItem.status)}`
        : approvalSummary.pending > 0
          ? `승인 ${approvalSummary.pending}건`
          : '대기 없음',
      tone: preferredInboxItem
        ? getInboxTone(preferredInboxItem)
        : approvalSummary.pending > 0
          ? 'accent'
          : 'success',
    },
  ];
  const opsEntrySignalRow = renderDeliverablesOpsEntryRow(deliverablesOpsEntrySignals);
  const opsEntryHelperCopy = executionGateReason
    ? `현재 실행 입구는 ${executionGateReason} 전까지 여기서 멈춥니다. 관제실은 차단 근거와 다음 표면만 먼저 엽니다.`
    : '보고실은 의도적으로 간결한 요약에서 멈춥니다. 작업판, 로그, 증적 보관실, 결재함은 관제실 쪽 세부 운영 경로로 남습니다.';
  const currentDeliverableArtifact =
    latestCloseOutArtifact ||
    latestReleasePackageArtifact ||
    latestCommitResultArtifact ||
    latestCommitPackageArtifact ||
    latestReviewArtifact ||
    latestChangeSummaryArtifact ||
    latestDiffArtifact ||
    latestPatchArtifact ||
    latestPreflightArtifact ||
    latestBreakdownArtifact ||
    latestArchitectureArtifact ||
    latestPlanArtifact ||
    latestArtifact;
  const deliverablesEvidenceState = getExecutionEvidenceRail(linkedTask, data);
  const deliverablesCompletionSummary = getDeliverablesCompletionSummary({
    approvalBridge,
    approvalSummary,
    closeOutState,
    commitExecutionState,
    commitPackageState,
    currentArtifact: currentDeliverableArtifact,
    evidenceRail: deliverablesEvidenceState,
    executionGateReason,
    latestApproval,
    latestReviewStatus,
    missionCompletionReady,
    releasePackageState,
    reviewerState,
  });
  const deliverablesDeck = renderDeliverablesReportDeck({
    councilSession: selectedCouncilSession,
    mission: selectedMission,
    task: linkedTask,
    currentArtifact: currentDeliverableArtifact,
    evidenceRail: deliverablesEvidenceState,
    latestApproval,
    approvalBridge,
    latestReviewStatus,
    missionCompletionReady,
  });
  const deliverablesEvidenceRail = renderExecutionEvidenceRail(deliverablesEvidenceState, {
    eyebrow: '증적 인계선',
    heading: '결과 보고도 같은 실행 증적선을 그대로 읽습니다',
    copy: '산출물 표면은 연결 실행 셀의 아티팩트, run, 준비 상태, 리뷰 기준 사실만 읽고 아래 섹션에서 더 깊은 보고를 이어갑니다.',
  });
  const deliverablesControl = getDeliverablesControlSnapshot(
    selectedMission,
    linkedTask,
    currentDeliverableArtifact,
    latestApproval,
    approvalBridge,
    latestReviewStatus,
    missionCompletionReady,
  );
  const deliverablesLeft = getDeliverablesLeftSnapshot(
    selectedMission,
    linkedTask,
    currentDeliverableArtifact,
    deliverablesControl,
    {
      latestArchitectureArtifact,
      latestBreakdownArtifact,
      latestChangeSummaryArtifact,
      latestCloseOutArtifact,
      latestCommitPackageArtifact,
      latestCommitResultArtifact,
      latestDiffArtifact,
      latestPatchArtifact,
      latestPlanArtifact,
      latestPreflightArtifact,
      latestReleasePackageArtifact,
      latestReviewArtifact,
    },
  );
  const harnessBrief = getHarnessConsumerBrief(data);

  elements.surfaces.deliverables.innerHTML = `
    <div class="stack">
      ${deliverablesDeck}
      ${renderDeliverablesCompletionSummary(deliverablesCompletionSummary)}
      ${renderDeliveryPackagePreview(state.missionDeliveryPackagePreview, missionExecutionPlanBundle)}
      ${renderDurableDeliveryPackage(state.missionDurableDeliveryPackage, missionExecutionPlanBundle)}
      ${renderMissionLearningCandidatePreview(
        state.missionLearningCandidatePreview,
        state.missionLearningCandidate,
        selectedMission,
        missionExecutionPlanBundle,
        state.missionDurableDeliveryPackage,
        state.missionDeliveryPackageAcceptance,
        state.missionCloseOut,
      )}
      ${renderMemoryCandidatePreview(
        state.missionMemoryCandidatePreview,
        state.missionMemoryItem,
        state.missionLearningCandidate,
        state.missionLearningCandidateReview,
        selectedMission,
      )}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid">
      <section class="surface-panel">
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '전달 패킷 개요',
          heading: '결과 패킷 데스크',
          copy: '왼쪽 패널은 현재 결과 패킷, 다음 인계, 연결 근거부터 먼저 보여 줍니다.',
          tokens: [
            createToken(`미션:${selectedMission.id}`, 'neutral'),
            createToken(`태스크:${linkedTask.id}`, 'accent'),
            createToken(`아티팩트수:${taskArtifacts.length}`, 'neutral'),
            currentDeliverableArtifact
              ? createToken(`현재:${getArtifactTypeDisplay(currentDeliverableArtifact.type)}`, 'success')
              : createToken('현재:없음', 'warning'),
            latestArtifact ? createToken(`최근쓰기:${getArtifactTypeDisplay(latestArtifact.type)}`, 'neutral') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 결과 패킷',
              title: deliverablesLeft.currentTitle,
              copy: deliverablesLeft.currentCopy,
            },
            {
              label: '다음 인계',
              title: deliverablesLeft.nextTitle,
              copy: deliverablesLeft.nextCopy,
            },
            {
              label: '연결 근거',
              title: deliverablesLeft.reasonTitle,
              copy: deliverablesLeft.reasonCopy,
            },
          ],
        })}
        ${deliverablesEvidenceRail}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>상류 준비 패킷</strong>
            </div>
            <div class="token-row">
              ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
              ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
              ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
              ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
            </div>
            <p class="detail-copy">기획부터 사전 점검까지의 패킷 묶음이 이후 라이브 변경이나 리뷰 패킷이 올라오기 전까지 현재 상류 근거선으로 남습니다.</p>
          </section>
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>전달 패킷 선반</strong>
            </div>
            <div class="token-row">
              ${latestChangeSummaryArtifact ? createToken(`change-summary:${latestChangeSummaryArtifact.id}`, 'neutral') : createToken('change-summary:none', 'neutral')}
              ${latestPatchArtifact ? createToken(`patch:${latestPatchArtifact.id}`, 'neutral') : createToken('patch:none', 'neutral')}
              ${latestDiffArtifact ? createToken(`diff:${latestDiffArtifact.id}`, 'neutral') : createToken('diff:none', 'neutral')}
              ${latestReviewArtifact ? createToken(`review:${latestReviewArtifact.id}`, 'neutral') : createToken('review:none', 'neutral')}
              ${latestCommitPackageArtifact ? createToken(`commit-package:${latestCommitPackageArtifact.id}`, 'neutral') : ''}
              ${latestCommitResultArtifact ? createToken(`commit-result:${latestCommitResultArtifact.id}`, 'neutral') : ''}
              ${latestReleasePackageArtifact ? createToken(`release-package:${latestReleasePackageArtifact.id}`, 'neutral') : ''}
              ${latestCloseOutArtifact ? createToken(`close-out:${latestCloseOutArtifact.id}`, 'neutral') : ''}
            </div>
            <p class="detail-copy">
              ${
                latestChangeSummaryArtifact || latestReviewArtifact || latestCommitPackageArtifact || latestReleasePackageArtifact || latestCloseOutArtifact
                  ? '후속 패키지 아티팩트가 이미 존재하며, 새 실행 affordance를 추가하지 않고 전달 패킷 선반에서 계속 보입니다.'
                  : '아직 후속 변경/리뷰/커밋/릴리스/종료 정리 패키지가 없습니다. 현재 한정된 진행은 아직 그 이후 전달 선반 전에서 멈춰 있습니다.'
              }
            </p>
          </section>
        </div>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>승인 및 종료 데스크</h2>
            <p class="panel-copy">여기서는 리뷰 라인, 승인선, 종료 보고 경로를 먼저 봅니다.</p>
          </div>
        </div>
        ${renderNarrativeDeck({
          wide: false,
          eyebrow: '인계 판단판',
          heading: '현재 패킷 상태와 다음 인계선을 먼저 봅니다',
          copy: '오른쪽 패널은 결과 패킷보다 리뷰 라인, 승인선, 종료 보고 경로를 우선 보여 줍니다.',
          tokens: [
            createToken(
              `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
              deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral'),
            createToken(`리뷰:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus)),
            latestApproval
              ? createToken(`승인:${getApprovalStatusDisplay(latestApproval.status)}`, getApprovalTone(latestApproval.status))
              : createToken('승인:없음', 'neutral'),
            missionCompletionReady ? createToken('완료:봉인', 'success') : '',
          ].filter(Boolean),
          cards: [
            {
              label: '현재 패킷',
              title: deliverablesControl.currentTitle,
              copy: deliverablesControl.currentCopy,
            },
            {
              label: '다음',
              title: deliverablesControl.nextTitle,
              copy: deliverablesControl.nextCopy,
            },
            {
              label: '이유',
              title: deliverablesControl.reasonTitle,
              copy: deliverablesControl.reasonCopy,
            },
          ],
        })}
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>리뷰 라인</strong>
            </div>
            <div class="token-row">
              ${createToken(`필수:${linkedTask.review?.required ? '예' : '아니오'}`, linkedTask.review?.required ? 'warning' : 'neutral')}
              ${createToken(`상태:${getReviewStatusDisplay(latestReviewStatus)}`, getReviewTone(latestReviewStatus))}
              ${createToken(`검증:${linkedTask.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
              ${latestReviewArtifact ? createToken(`아티팩트:${latestReviewArtifact.id}`, 'neutral') : createToken('아티팩트:없음', 'neutral')}
              ${
                reviewerState.summary.sourceBuilderRunId
                  ? createToken(`소스run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(latestReviewNote)}</p>
            ${reviewActionSignalRow}
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 리뷰어 실행
                    </button>
                  </div>
                  <p class="form-help">리뷰어 실행은 한정된 라이브 변경 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 커밋 패키지 준비
                    </button>
                  </div>
                  <p class="form-help">커밋 패키지 준비는 최신 리뷰어 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 커밋 게이트 승인
                    </button>
                  </div>
                  <p class="form-help">커밋 승인은 현재 커밋 패키지가 대기 승인을 열면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 로컬 커밋 실행
                    </button>
                  </div>
                  <p class="form-help">로컬 커밋은 현재 승인된 커밋 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 릴리스 패키지 준비
                    </button>
                  </div>
                  <p class="form-help">릴리스 패키지 준비는 최신 로컬 커밋 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 릴리스 게이트 승인
                    </button>
                  </div>
                  <p class="form-help">릴리스 승인은 현재 릴리스 패키지가 대기 승인을 열면 실행 표면에 열립니다.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행으로 이동해 종료 정리 실행
                    </button>
                  </div>
                  <p class="form-help">종료 정리는 현재 승인된 릴리스 번들이 준비되면 실행 표면에 열립니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>승인 라인 현황</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${createToken(`대기:${approvalSummary.pending}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')}
              ${createToken(`승인:${approvalSummary.approved}`, approvalSummary.approved > 0 ? 'success' : 'neutral')}
              ${createToken(`반려:${approvalSummary.rejected}`, approvalSummary.rejected > 0 ? 'danger' : 'neutral')}
              ${
                latestApproval?.allowedNextAction
                  ? createToken(
                      `액션:${getApprovalActionLabel(latestApproval.allowedNextAction)}`,
                      'neutral',
                    )
                  : ''
              }
              ${
                latestApproval
                  ? createToken(`최신:${getApprovalStatusDisplay(latestApproval.status)}`, getApprovalTone(latestApproval.status))
                  : createToken('최신:없음', 'neutral')
              }
            </div>
            <p class="detail-copy">
              ${
                latestApproval
                  ? escapeHtml(
                      `${latestApproval.id}는 ${getApprovalActionLabel(latestApproval.allowedNextAction) || latestApproval.scope}에 대해 ${getApprovalStatusDisplay(latestApproval.status)} 상태이며, 대상은 ${latestApproval.targetArtifactId || '현재 한정된 아티팩트'}입니다.`,
                    )
                  : '이 미션에는 아직 승인 기록이 없습니다.'
              }
            </p>
            ${
              preferredInboxItem?.status === 'pending'
                ? `
                  <div class="token-row">
                    ${createToken(`결정함:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem))}
                    ${createToken(`종류:${preferredInboxItem.kind}`, 'neutral')}
                  </div>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>현재 승인 안건</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `승인:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('승인:없음', 'neutral')
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`대상:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`아티팩트:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `결정함:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>다음 인계선</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${approvalActionSignalRow}
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행
                    </button>
                  </div>
                  <p class="form-help">승인은 실행에서 처리합니다. 산출물은 요약만 남깁니다.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      실행에서 변경
                    </button>
                  </div>
                  <p class="form-help">빌더 게이트 승인 후 실행에서 시작합니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>종료 보고 데스크</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
              ${createToken(`미션:${getMissionStatusDisplay(selectedMission.status)}`, getMissionStatusTone(selectedMission.status))}
              ${
                linkedTask
                  ? createToken(
                      `태스크:${getTaskLifecycleDisplay(linkedTask.lifecycleState)}`,
                      linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                    )
                  : createToken('태스크:없음', 'warning')
              }
              ${
                missionCompletionReady
                  ? createToken('완료:봉인', 'success')
                  : createToken('완료:열림', 'warning')
              }
              ${
                missionCompletionArtifactId
                  ? createToken(
                      `${missionCloseOutRecord ? 'MissionCloseOut' : '종료정리'}:${missionCompletionArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
              ${
                closeOutState.summary.currentReleasePackageArtifactId
                  ? createToken(
                      `릴리스패키지:${closeOutState.summary.currentReleasePackageArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                missionCompletionReady
                  ? escapeHtml(
                      `현재 미션 상태: 태스크 ${linkedTask.id}의 한정된 전달은 ${missionCompletionEvidenceLabel}로 봉인됐습니다.`,
                    )
                  : '현재 미션 상태: 한정된 전달은 아직 열려 있습니다. 미션이 완료에 도달하면 산출물이 종료 정리 번들을 이곳에 고정합니다.'
              }
            </p>
            <p class="detail-copy">
              <strong>다음 안전한 후속 단계</strong>: ${
                missionCompletionReady
                  ? '저장된 종료 정리 번들을 최종 한정 요약으로 보고, 다음 미션을 시작하거나 더 깊은 근거 확인이 필요하면 고급 운영 모드를 엽니다. 외부 전달은 여전히 비활성입니다.'
                  : '실행에서 현재 한정된 경로를 계속 전진합니다. 종료 정리 번들이 저장되기 전까지 이 표면은 요약 전용으로 남습니다.'
              }
            </p>
            ${closeOutActionSignalRow}
            ${
              missionCompletionReady
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      미션으로 이동해 다음 사이클 시작
                    </button>
                  </div>
                  <p class="form-help">다음 사이클은 미션에서 시작합니다. 실행을 다시 열지 않고 다음 초안을 준비합니다.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>관제실 직행</strong>
            </div>
            <div class="token-row">
              ${createToken(
                `현재:${deliverablesEvidenceState.currentOwnerLabel}`,
                deliverablesEvidenceState.blockedReason ? 'danger' : 'accent',
              )}
              ${createToken(`다음:${deliverablesEvidenceState.nextHandoffLabel}`, 'neutral')}
            </div>
            <p class="detail-copy">${escapeHtml(opsEntryHelperCopy)}</p>
            ${opsActionSignalRow}
            ${opsEntrySignalRow}
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
                data-action="open-advanced-ops"
                data-id="${escapeHtml(selectedMission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                관제실
              </button>
            </div>
          </section>
        </div>
      </aside>
      </div>
    </div>
  `;
}

function renderTaskboard(data) {
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const focusedTask = selectedTask || data.tasks[0] || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const createDisabled = !data.activeProject || state.loading || state.mutating;
  const bootstrapPanel = renderProjectBootstrapPanel(data);
  const pendingApprovals = data.approvals.filter((approval) => approval.status === 'pending');
  const pendingInboxItems = data.inboxItems.filter((item) => item.status === 'pending');
  const focusedTaskArtifacts = focusedTask ? getTaskArtifacts(focusedTask.id, data.artifacts).sort(sortByCreatedDesc) : [];
  const focusedTaskLatestArtifact = focusedTaskArtifacts[0] || null;
  const focusedTaskLatestRun = focusedTask?.latestRunId ? data.runMap.get(focusedTask.latestRunId) || null : null;
  const focusedTaskPreferredInboxItem = focusedTask ? getPreferredTaskInboxItem(focusedTask.id, data) : null;
  const taskboardEvidenceState = getExecutionEvidenceRail(focusedTask, data);
  const focusedTaskSnapshot = getTaskboardTaskSnapshot(focusedTask, data);
  const taskboardImmediateCard =
    pendingApprovals.length > 0
      ? {
          title: `결재함에서 승인 ${pendingApprovals.length}건 처리`,
          copy: '사람 승인이 남아 있어 지금은 결재함을 먼저 여는 편이 가장 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
          tone: 'accent',
        }
      : pendingInboxItems.length > 0
        ? {
            title: `결재함에서 확인 ${pendingInboxItems.length}건 처리`,
            copy: '결정이나 확인이 남아 있어 지금은 결재함에서 현재 안건을 먼저 정리합니다.',
            button: {
              action: 'open-surface',
              label: '결재함',
              targetSurface: 'decision-inbox',
              disabled: state.loading || state.mutating,
            },
            tone: 'warning',
          }
        : focusedTask
          ? {
              title: `${focusedTask.title} 상세 보기`,
              copy: focusedTaskSnapshot.nextCopy,
              button: {
                action: 'open-taskboard-task',
                id: focusedTask.id,
                label: '선택 셀 고정',
                disabled: state.loading || state.mutating,
              },
              tone: 'neutral',
            }
          : {
              title: '첫 실행 셀 추가',
              copy: '왼쪽에서 첫 실행 셀을 추가하면 오른쪽 상세 판단이 바로 열립니다.',
              button: null,
              tone: 'warning',
            };
  const taskboardViewportStrip = renderViewportHandoffStrip({
    eyebrow: '작업 인계선',
    heading: '작업판 아래는 레인과 상세 판단으로 나눕니다',
    copy:
      '왼쪽은 실행 셀 목록과 빠른 추가를 맡고, 오른쪽은 선택된 셀의 상태와 다음 실행만 먼저 보여 줍니다.',
    tokens: [
      createToken(
        `현재:${taskboardEvidenceState.currentOwnerLabel}`,
        taskboardEvidenceState.blockedReason ? 'danger' : 'accent',
      ),
      createToken(`다음:${taskboardEvidenceState.nextHandoffLabel}`, 'neutral'),
      data.activeProject
        ? createToken(`프로젝트:${data.activeProject.name}`, 'success')
        : createToken('프로젝트:선택 필요', 'warning'),
      createToken(`실행셀:${data.tasks.length}`, data.tasks.length > 0 ? 'neutral' : 'warning'),
      createToken(
        `바로:${pendingApprovals.length > 0 || pendingInboxItems.length > 0 ? '결재함' : '작업판 상세'}`,
        taskboardImmediateCard.tone,
      ),
    ],
    cards: [
      {
        label: '왼쪽 레인',
        title: '실행 셀 목록 + 빠른 추가',
        copy: '레인에서 셀을 고르고, 바로 아래 접수 폼에서 새 셀을 추가합니다.',
      },
      {
        label: '오른쪽 상세',
        title: focusedTask ? '현재 상태 + 다음 실행' : '선택 셀 대기',
        copy: focusedTask
          ? '선택된 셀의 보류 이유, 다음 실행, 근거는 오른쪽 상세에서 이어 봅니다.'
          : '실행 셀을 하나 고르면 오른쪽 판단선이 바로 열립니다.',
      },
      {
        label: '바로',
        title: taskboardImmediateCard.title,
        copy: taskboardImmediateCard.copy,
        emphasis: true,
        button: taskboardImmediateCard.button,
      },
    ],
  });
  const taskboardOpsEntrySignals = [
    {
      surface: 'taskboard',
      label: '작업판',
      status: focusedTask ? getTaskLifecycleDisplay(focusedTask.lifecycleState) : '셀 없음',
      tone: focusedTask ? getTaskLifecycleTone(focusedTask.lifecycleState) : 'warning',
    },
    {
      surface: 'logs',
      label: '로그',
      status: focusedTaskLatestRun ? getRunStatusDisplay(focusedTaskLatestRun.status) : 'run 없음',
      tone: focusedTaskLatestRun ? getRunTone(focusedTaskLatestRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: focusedTaskLatestArtifact ? getArtifactTypeDisplay(focusedTaskLatestArtifact.type) : '증적 없음',
      tone:
        focusedTaskLatestArtifact?.type === 'close-out'
          ? 'success'
          : focusedTaskLatestArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: focusedTaskPreferredInboxItem
        ? `${getInboxKindDisplay(focusedTaskPreferredInboxItem.kind)} ${getInboxStatusDisplay(focusedTaskPreferredInboxItem.status)}`
        : pendingApprovals.length > 0
          ? `승인 ${pendingApprovals.length}건`
          : pendingInboxItems.length > 0
            ? `확인 ${pendingInboxItems.length}건`
            : '대기 없음',
      tone: focusedTaskPreferredInboxItem
        ? getInboxTone(focusedTaskPreferredInboxItem)
        : pendingApprovals.length > 0
          ? 'accent'
          : pendingInboxItems.length > 0
            ? 'warning'
            : 'success',
    },
  ];
  const taskboardOpsEntrySignalRow = renderTaskboardOpsEntrySignalRow(taskboardOpsEntrySignals);
  const taskboardDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 실행 셀만 세 칸으로 요약하는 작업판',
    copy: '아래 deck은 현재 셀 판단만 먼저 남기고, 새 셀 추가는 바로 아래 접수 폼으로 넘깁니다.',
    tokens: [
      data.activeProject
        ? createToken(`프로젝트:${data.activeProject.name}`, 'success')
        : createToken('프로젝트:선택 필요', 'warning'),
      createToken(`실행셀:${data.tasks.length}`, data.tasks.length > 0 ? 'neutral' : 'warning'),
      createToken(`대기승인:${pendingApprovals.length}`, pendingApprovals.length > 0 ? 'accent' : 'neutral'),
    ],
    signalRow: taskboardOpsEntrySignalRow,
    cards: [
      {
        label: '현재 셀',
        title: focusedTask ? focusedTask.title : '실행 셀 대기',
        copy: focusedTaskSnapshot.currentCopy,
      },
      {
        label: '다음 행동',
        title: focusedTask ? focusedTaskSnapshot.nextCopy.replace('다음: ', '') : '새 실행 셀 추가',
        copy: focusedTaskSnapshot.nextCopy,
      },
      {
        label: '승인선',
        title:
          pendingApprovals.length > 0
            ? `${pendingApprovals.length}건 승인 대기`
            : pendingInboxItems.length > 0
              ? `${pendingInboxItems.length}건 확인 대기`
              : '현재 승인 대기 없음',
        copy:
          pendingApprovals.length > 0
            ? '사람 승인이 필요한 안건이 남아 있습니다.'
            : pendingInboxItems.length > 0
              ? '결정 또는 확인이 필요한 안건이 남아 있습니다.'
              : '지금 바로 막힌 승인선은 없습니다.',
      },
    ],
  });

  const lanes = groupTasksByLifecycle(data.tasks)
    .map(([laneName, tasks]) => {
      const cards = tasks.length
        ? tasks
            .map((task) => {
              const approvalSummary = getTaskApprovalSummary(task, data.approvals);
              const decisionSummary = getTaskDecisionSummary(task, data.inboxItems);
              const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
              const taskSnapshot = getTaskboardTaskSnapshot(task, data);

              return `
                <article class="card taskboard-task-card ${task.id === selectedTask?.id ? 'is-selected' : ''}">
                  <button class="card-button" type="button" data-action="select-task" data-id="${escapeHtml(task.id)}">
                    <div class="card-title-row taskboard-task-head">
                      <h4 class="card-title">${escapeHtml(task.title)}</h4>
                      <div class="token-row token-row-compact">
                        ${createToken(getTaskLifecycleDisplay(task.lifecycleState), 'neutral')}
                      </div>
                    </div>
                    <div class="taskboard-task-register">
                      <div class="taskboard-task-section">
                        <p class="ops-list-label">실행 등록</p>
                        <p class="card-copy detail-copy-compact taskboard-task-intent">${escapeHtml(task.intent || '기록된 의도가 없습니다.')}</p>
                      </div>
                      <div class="taskboard-task-section">
                        <p class="ops-list-label">현재 상태</p>
                        <p class="card-copy detail-copy-compact taskboard-task-summary">${escapeHtml(taskSnapshot.currentCopy)}</p>
                      </div>
                    </div>
                    <div class="taskboard-task-foot">
                      <div class="token-row token-row-compact">
                        ${taskSnapshot.tokens.join('')}
                        ${task.flags?.blocked ? createToken('차단', 'danger') : ''}
                        ${task.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                        ${task.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                        ${
                          approvalSummary.total > 0
                            ? createToken(`승인선:${approvalSummary.pending}/${approvalSummary.total}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')
                            : ''
                        }
                        ${
                          decisionSummary.pendingTotal > 0
                            ? createToken(`결재함:${decisionSummary.pendingTotal}`, 'warning')
                            : ''
                        }
                      </div>
                      <div class="taskboard-task-next-block">
                        <p class="ops-list-label">다음 처리</p>
                        <p class="card-copy detail-copy-compact taskboard-task-next">${escapeHtml(taskSnapshot.nextCopy)}</p>
                      </div>
                    </div>
                  </button>
                </article>
              `;
            })
            .join('')
        : `
            <div class="empty-state">
              <strong>태스크 없음</strong>
              <p>이 라이프사이클 레인은 비어 있습니다.</p>
            </div>
          `;

      return `
        <section class="lane">
          <div class="lane-header">
            <h3>${escapeHtml(getTaskLifecycleDisplay(laneName))}</h3>
            <span class="lane-count">${tasks.length}</span>
          </div>
          <div class="stack">${cards}</div>
        </section>
      `;
    })
    .join('');

  const detail = renderTaskDetail(selectedTask, data);

  elements.surfaces.taskboard.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        ${taskboardViewportStrip}
        ${taskboardDeck}
        ${renderHarnessBriefRegister(harnessBrief)}
        ${bootstrapPanel}
        ${
          data.activeProject
            ? `
              <form class="task-create-form task-create-form-compact taskboard-order-desk" data-form="create-task">
                <div class="taskboard-order-head">
                  <div class="stack">
                    <strong>새 실행 셀</strong>
                    <p class="detail-copy detail-copy-compact">여기서는 새 셀만 빠르게 추가합니다. 현재 상태 판단은 위 카드에서 끝냅니다.</p>
                  </div>
                  <div class="token-row token-row-compact">
                    ${createToken('제목만으로 시작', 'accent')}
                    ${createToken('의도는 선택', 'neutral')}
                  </div>
                </div>
                <div class="field-grid field-grid-compact">
                  <label class="field field-compact">
                    <span class="field-label">제목</span>
                    <input
                      type="text"
                      name="title"
                      value="${escapeHtml(state.taskDraftTitle)}"
                      placeholder="얇은 슬라이스 태스크 제목"
                      ${createDisabled ? 'disabled' : ''}
                    >
                  </label>
                  <label class="field field-compact">
                    <span class="field-label">의도</span>
                    <textarea
                      name="intent"
                      rows="2"
                      placeholder="선택 사항: 원하는 결과나 경계만 짧게 적으세요"
                      ${createDisabled ? 'disabled' : ''}
                    >${escapeHtml(state.taskDraftIntent)}</textarea>
                  </label>
                </div>
                <div class="form-actions form-actions-inline form-actions-compact taskboard-order-actions">
                  <button class="primary-button" type="submit" ${createDisabled ? 'disabled' : ''}>실행 셀 추가</button>
                  <p class="form-help">${escapeHtml(data.activeProject.name)}에 바로 추가하고, 세부 제어는 선택된 셀 상세에서 이어갑니다.</p>
                </div>
              </form>
            `
            : ''
        }
        ${
          !data.activeProject
            ? `
              <div class="empty-state">
                <strong>활성 프로젝트 없음</strong>
                <p>첫 태스크를 만들기 전에 위에서 프로젝트를 등록하거나 고릅니다.</p>
              </div>
            `
            : data.tasks.length > 0
            ? `<div class="lane-grid">${lanes}</div>`
            : `
              <div class="empty-state">
                <strong>아직 태스크 없음</strong>
                <p>활성 프로젝트는 준비됐습니다. 첫 실행 셀을 추가하면 바로 작업판 흐름이 시작됩니다.</p>
              </div>
            `
        }
      </section>
      ${detail}
    </div>
  `;
}

function renderTaskDetail(task, data) {
  if (!task) {
    return `
      <aside class="detail-card">
        <h2>태스크 상세</h2>
        <div class="empty-state">
          <strong>선택된 태스크 없음</strong>
          <p>태스크 카드를 골라 run, 아티팩트, 리뷰, 결정 상태를 확인합니다.</p>
        </div>
      </aside>
    `;
  }

  const taskRuns = getTaskRuns(task.id, data.runs);
  const taskArtifacts = getTaskArtifacts(task.id, data.artifacts);
  const taskApprovals = getTaskApprovals(task.id, data.approvals);
  const taskInboxItems = getTaskInboxItems(task.id, data.inboxItems);
  const pendingTaskApprovals = taskApprovals.filter((approval) => approval.status === 'pending');
  const pendingTaskInboxItems = taskInboxItems.filter((item) => item.status === 'pending');
  const preferredTaskInboxItem = getPreferredTaskInboxItem(task.id, data);
  const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
  const plannerState = getPlannerAvailability(task, data, state.loading || state.mutating);
  const architectState = getArchitectAvailability(task, data, state.loading || state.mutating);
  const taskBreakerState = getTaskBreakerAvailability(task, data, state.loading || state.mutating);
  const builderPreflightState = getBuilderPreflightAvailability(task, data, state.loading || state.mutating);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const executionGateReason = getDevelopmentPackExecutionGateReason(task, data);
  const latestBreakdownDetail =
    state.selectedTaskBreakdownArtifact?.id === latestBreakdownArtifact?.id
      ? state.selectedTaskBreakdownArtifact
      : null;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedBreakdown = latestBreakdownDetail
    ? parseBreakdownArtifact(latestBreakdownDetail.content)
    : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const detectedWorktreeOptions =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.options || []
      : [];
  const worktreeDetectionNotice =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.notice
      : null;
  const currentWorktreeOption = task.worktreeRef
    ? detectedWorktreeOptions.find((option) => option.path === task.worktreeRef) || null
    : null;
  const worktreeRelation = buildTaskWorktreeRelation(task, {
    ...activeProjectLinkedWorktrees,
    options: detectedWorktreeOptions,
  });
  const selectedWorktreeOptionValue =
    currentWorktreeOption?.path || detectedWorktreeOptions[0]?.path || '';
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const preselectedPendingItem =
    selectedInboxItem?.taskId === task.id && selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const plannerDisabled = plannerState.disabled;
  const architectDisabled = architectState.disabled;
  const taskBreakerDisabled = taskBreakerState.disabled;
  const builderPreflightDisabled = builderPreflightState.disabled;
  const plannerBlockedReason = getPrimaryBlockedReason(
    plannerState.reasons,
    'planner readiness unavailable',
  );
  const architectBlockedReason = getPrimaryBlockedReason(
    architectState.reasons,
    'architect readiness unavailable',
  );
  const taskBreakerBlockedReason = getPrimaryBlockedReason(
    taskBreakerState.reasons,
    'task-breaker readiness unavailable',
  );
  const builderPreflightBlockedReason = getPrimaryBlockedReason(
    builderPreflightState.reasons,
    'builder preflight readiness unavailable',
  );
  const worktreeApplyDisabled =
    state.loading ||
    state.mutating ||
    detectedWorktreeOptions.length === 0;
  const worktreeClearDisabled = state.loading || state.mutating || !task.worktreeRef;
  const reviewerState = getReviewerAvailability(task, data, state.loading || state.mutating);
  const commitPackageState = getCommitPackageAvailability(task, data, state.loading || state.mutating);
  const commitExecutionState = getCommitExecutionAvailability(task, data, state.loading || state.mutating);
  const releasePackageState = getReleasePackageAvailability(task, data, state.loading || state.mutating);
  const closeOutState = getCloseOutAvailability(task, data, state.loading || state.mutating);
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';
  const taskDetailEvidenceState = getExecutionEvidenceRail(task, data);
  const taskSnapshot = getTaskboardTaskSnapshot(task, data);
  const pendingTaskApproval = pendingTaskApprovals[0] || null;
  const pendingTaskDecision = pendingTaskInboxItems[0] || null;
  const latestTaskArtifact = taskArtifacts[0] || null;
  const taskboardDetailSignalRow = renderTaskboardOpsEntrySignalRow([
    {
      surface: 'taskboard',
      label: '작업판',
      status: getTaskLifecycleDisplay(task.lifecycleState),
      tone: getTaskLifecycleTone(task.lifecycleState),
    },
    {
      surface: 'logs',
      label: '로그',
      status: latestRun ? getRunStatusDisplay(latestRun.status) : 'run 없음',
      tone: latestRun ? getRunTone(latestRun.status) : 'neutral',
    },
    {
      surface: 'artifacts',
      label: '보관',
      status: latestTaskArtifact ? getArtifactTypeDisplay(latestTaskArtifact.type) : '증적 없음',
      tone:
        latestTaskArtifact?.type === 'close-out'
          ? 'success'
          : latestTaskArtifact
            ? 'accent'
            : 'neutral',
    },
    {
      surface: 'decision-inbox',
      label: '승인',
      status: preferredTaskInboxItem
        ? `${getInboxKindDisplay(preferredTaskInboxItem.kind)} ${getInboxStatusDisplay(preferredTaskInboxItem.status)}`
        : pendingTaskApprovals.length > 0
          ? `승인 ${pendingTaskApprovals.length}건`
          : pendingTaskInboxItems.length > 0
            ? `확인 ${pendingTaskInboxItems.length}건`
            : '대기 없음',
      tone: preferredTaskInboxItem
        ? getInboxTone(preferredTaskInboxItem)
        : pendingTaskApprovals.length > 0
          ? 'accent'
          : pendingTaskInboxItems.length > 0
            ? 'warning'
            : 'success',
    },
  ]);
  const detailHoldTitle = task.flags?.waitingApproval
    ? '승인선 대기'
    : task.flags?.waitingDecision
      ? '결정 대기'
      : executionGateReason || task.flags?.blocked
        ? '차단 상태'
        : '보류 없음';
  const detailHoldCopy = task.flags?.waitingApproval
    ? `${getApprovalActionLabel(pendingTaskApproval?.allowedNextAction) || '현재 승인'} 안건이 아직 승인 대기입니다.`
    : task.flags?.waitingDecision
      ? `${pendingTaskDecision?.title || '현재 결정'} 처리가 남아 있습니다.`
      : executionGateReason
        ? executionGateReason
        : task.flags?.blocked
        ? [
            builderPreflightBlockedReason,
            reviewerState.reasons?.[0],
            commitPackageState.summary.reasons?.[0],
            commitExecutionState.summary.reasons?.[0],
            releasePackageState.summary.reasons?.[0],
            closeOutState.summary.reasons?.[0],
          ].find(Boolean) || '현재 차단 사유를 아래 상세에서 확인합니다.'
        : '현재 보류 사유는 없습니다.';
  let detailNextTitle = '세부 실행 확인';
  let detailNextCopy = '아래 상세 블록에서 현재 단계 제어와 근거를 이어서 확인합니다.';

  if (task.flags?.waitingApproval) {
    detailNextTitle = '승인 처리';
    detailNextCopy = '결재함이나 승인 패널에서 현재 승인선을 먼저 처리합니다.';
  } else if (task.flags?.waitingDecision) {
    detailNextTitle = '결정 처리';
    detailNextCopy = '결재함에서 현재 결정을 먼저 처리합니다.';
  } else if (closeOutState.summary.allowed) {
    detailNextTitle = '종료 정리';
    detailNextCopy = '종료 정리를 이어가며 안건 종료 보고를 닫을 수 있습니다.';
  } else if (releasePackageState.summary.allowed) {
    detailNextTitle = '릴리스 패키지';
    detailNextCopy = '릴리스 패키지를 준비하고 다음 승인선을 확인합니다.';
  } else if (commitExecutionState.summary.allowed) {
    detailNextTitle = '로컬 커밋';
    detailNextCopy = '승인된 커밋 패키지 기준으로 로컬 커밋을 이어갈 수 있습니다.';
  } else if (commitPackageState.summary.allowed) {
    detailNextTitle = '커밋 패키지';
    detailNextCopy = '리뷰 통과 이후 커밋 패키지를 준비할 수 있습니다.';
  } else if (reviewerState.summary.allowed) {
    detailNextTitle = '리뷰어 실행';
    detailNextCopy = '최신 변경 번들을 점검해 리뷰 보고를 남길 수 있습니다.';
  } else if (!latestPlanArtifact) {
    detailNextTitle = '플래너 실행';
    detailNextCopy = '첫 계획을 만들며 실행 셀의 시작점을 엽니다.';
  } else if (!latestArchitectureArtifact) {
    detailNextTitle = '설계 실행';
    detailNextCopy = '현재 계획 위에 설계 방향을 확정합니다.';
  } else if (!latestBreakdownArtifact) {
    detailNextTitle = '태스크 분해';
    detailNextCopy = '설계 이후 첫 실행 단위로 태스크를 자릅니다.';
  } else if (!latestPreflightArtifact) {
    detailNextTitle = '실행 준비 패킷';
    detailNextCopy = '실행 전 프리플라이트를 먼저 남겨 다음 승인선을 엽니다.';
  }

  return `
    <aside class="detail-card">
      <div>
        <p class="eyebrow">태스크 상세</p>
        <h2>${escapeHtml(task.title)}</h2>
      </div>
      ${renderNarrativeDeck({
        eyebrow: '작업판 판단 요약',
        heading: '현재 상태와 다음 실행을 먼저 보는 상세',
        copy: task.intent || '기록된 의도가 없으면 현재 상태와 다음 실행만 먼저 확인합니다.',
        tokens: [
          createToken(
            `현재:${taskDetailEvidenceState.currentOwnerLabel}`,
            taskDetailEvidenceState.blockedReason ? 'danger' : 'accent',
          ),
          createToken(`다음:${taskDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
          createToken(getTaskLifecycleDisplay(task.lifecycleState), 'neutral'),
          ...taskSnapshot.tokens,
          task.flags?.blocked ? createToken('차단', 'danger') : '',
          !task.flags?.blocked && executionGateReason ? createToken('실행차단', 'danger') : '',
          task.flags?.waitingApproval ? createToken('승인대기', 'accent') : '',
          task.flags?.waitingDecision ? createToken('결정대기', 'warning') : '',
        ].filter(Boolean),
        cards: [
          {
            label: '현재 상태',
            title: getTaskLifecycleDisplay(task.lifecycleState),
            copy: taskSnapshot.currentCopy,
          },
          {
            label: '막힌 이유',
            title: detailHoldTitle,
            copy: detailHoldCopy,
          },
          {
            label: '다음 실행',
            title: detailNextTitle,
            copy: detailNextCopy,
          },
        ],
        wide: false,
      })}

      <div class="detail-block">
        <div class="kv-grid">
          <div class="kv-item">
            <p class="detail-key">최신 실행 기록</p>
            <strong>${escapeHtml(latestRun?.id || '아직 없음')}</strong>
            <p class="detail-copy">${latestRun ? `${escapeHtml(getRunStatusDisplay(latestRun.status))} · ${escapeHtml(formatDate(latestRun.startedAt))}` : '아직 실행 기록이 없습니다.'}</p>
          </div>
          <div class="kv-item">
            <p class="detail-key">워크트리</p>
            <strong>${escapeHtml(task.worktreeRef || '아직 연결 안 됨')}</strong>
            <p class="detail-copy">${
              currentWorktreeOption
                ? escapeHtml(formatWorktreeOptionLabel(currentWorktreeOption))
                : task.worktreeRef
                  ? '저장된 워크트리 경로가 현재 탐지된 연결 워크트리 목록 밖에 있습니다.'
                  : '아직 저장된 워크트리 경로가 없습니다.'
            }</p>
          </div>
        </div>
        <div class="taskboard-detail-signal-row">${taskboardDetailSignalRow}</div>
        <div class="relation-strip">
          <div class="card-title-row">
            <strong>저장된 워크트리 경로와 현재 프로젝트 경로</strong>
            ${createToken(worktreeRelation.label, worktreeRelation.tone)}
          </div>
          <p class="detail-copy">${escapeHtml(worktreeRelation.copy)}</p>
          ${
            worktreeRelation.switchOption
              ? `
                <div class="relation-button-row">
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="switch-active-project-worktree"
                    data-path="${escapeHtml(worktreeRelation.switchOption.path)}"
                    ${state.loading || state.mutating ? 'disabled' : ''}
                >
                    활성 프로젝트 전환
                  </button>
                </div>
              `
              : ''
          }
        </div>
        <label class="field">
          <span class="field-label">탐지된 연결 워크트리</span>
          <select id="task-worktree-select" ${worktreeApplyDisabled ? 'disabled' : ''}>
            ${
              detectedWorktreeOptions.length > 0
                ? detectedWorktreeOptions
                    .map(
                      (option) => `
                        <option value="${escapeHtml(option.path)}" ${
                          option.path === selectedWorktreeOptionValue ? 'selected' : ''
                        }>
                          ${escapeHtml(formatWorktreeOptionLabel(option))}
                        </option>
                      `,
                    )
                    .join('')
                : '<option value="">탐지된 연결 워크트리 없음</option>'
            }
          </select>
        </label>
        <div class="form-actions form-actions-inline">
          <button
            class="secondary-button"
            type="button"
            data-action="set-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeApplyDisabled ? 'disabled' : ''}
          >
            워크트리 적용
          </button>
          <button
            class="secondary-button"
            type="button"
            data-action="clear-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeClearDisabled ? 'disabled' : ''}
          >
            워크트리 지우기
          </button>
        </div>
        ${
          worktreeDetectionNotice
            ? `<p class="detail-copy">${escapeHtml(worktreeDetectionNotice)}</p>`
            : detectedWorktreeOptions.length > 0
              ? '<p class="form-help">저장된 워크트리 경로만 바꿉니다. 릴리스 패키지와 종료 정리는 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다.</p>'
              : '<p class="detail-copy">현재 프로젝트 경로에서 탐지된 연결 워크트리가 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">역할 run</p>
        <div class="token-row">
          ${
            latestPlanArtifact
              ? createToken(`plan:${latestPlanArtifact.id}`, 'success')
              : createToken('plan:missing', 'warning')
          }
          ${
            latestArchitectureArtifact
              ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success')
              : createToken('architecture:missing', 'warning')
          }
          ${
            latestBreakdownArtifact
              ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral')
              : createToken('breakdown:none', 'neutral')
          }
          ${
            latestPreflightArtifact
              ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral')
              : createToken('preflight:none', 'neutral')
          }
          ${
            taskBreakerState.pendingBlockingDecisionItemIds.length > 0
              ? createToken(
                  `차단결정:${taskBreakerState.pendingBlockingDecisionItemIds.length}`,
                  'danger',
                )
              : ''
          }
          ${
            taskBreakerState.pendingApprovalIds.length > 0
              ? createToken(`대기승인:${taskBreakerState.pendingApprovalIds.length}`, 'accent')
              : ''
          }
        </div>
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-planner"
            data-id="${escapeHtml(task.id)}"
            ${plannerDisabled ? 'disabled' : ''}
          >
            플래너 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-architect"
            data-id="${escapeHtml(task.id)}"
            ${architectDisabled ? 'disabled' : ''}
          >
            설계 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-task-breaker"
            data-id="${escapeHtml(task.id)}"
            ${taskBreakerDisabled ? 'disabled' : ''}
          >
            태스크 분해 실행
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-builder-preflight"
            data-id="${escapeHtml(task.id)}"
            ${builderPreflightDisabled ? 'disabled' : ''}
          >
            빌더 프리플라이트 실행
          </button>
          <p class="form-help">
            ${
              plannerDisabled
                ? `플래너는 ${escapeHtml(plannerBlockedReason)} 전까지 비활성입니다.`
                : '플래너는 현재 안건 범위를 계획 아티팩트로 정리하고 설계 실행을 다음 단계로 남깁니다.'
            }
          </p>
          <p class="form-help">
            ${
              architectDisabled
                ? `설계 실행은 ${escapeHtml(architectBlockedReason)} 전까지 비활성입니다.`
                : `설계 실행은 ${escapeHtml(architectState.latestPlanArtifact?.id || '최신 계획 아티팩트')}를 읽고 설계 아티팩트를 남긴 뒤 태스크 분해로 넘깁니다.`
            }
          </p>
          <p class="form-help">
            ${
              taskBreakerDisabled
                ? `태스크 분해는 ${escapeHtml(taskBreakerBlockedReason)} 전까지 비활성입니다.`
                : `태스크 분해는 ${escapeHtml(latestPlanArtifact?.id || '최신 계획 아티팩트')}와 ${escapeHtml(latestArchitectureArtifact?.id || '최신 설계 아티팩트')}를 읽고 분해 아티팩트를 쓴 뒤, 아티팩트 화면을 벗어나지 않은 채 차단 결정함 항목만 미리 고릅니다.`
            }
          </p>
          <p class="form-help">
            ${
              builderPreflightDisabled
                ? `빌더 프리플라이트는 ${escapeHtml(builderPreflightBlockedReason)} 전까지 비활성입니다.`
                : `빌더 프리플라이트는 ${escapeHtml(builderPreflightState.latestPlanArtifact?.id || '최신 계획 아티팩트')}, ${escapeHtml(builderPreflightState.latestArchitectureArtifact?.id || '최신 설계 아티팩트')}, ${escapeHtml(builderPreflightState.latestBreakdownArtifact?.id || '최신 분해 아티팩트')}를 읽고 쓰기 없는 프리플라이트 아티팩트를 남긴 뒤 리뷰어를 명시적 후속 단계로 남깁니다.`
            }
          </p>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">생성된 하위 작업</p>
        ${
          latestBreakdownArtifact && parsedBreakdown
            ? `
              <div class="token-row">
                ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                ${createToken('파생 뷰', 'neutral')}
                ${
                  preselectedPendingItem
                    ? createToken(`선택된 결정함:${preselectedPendingItem.id}`, 'warning')
                    : ''
                }
              </div>
              <p class="detail-copy">최신 breakdown 아티팩트를 가능한 범위에서 파싱했습니다. 원문 마크다운은 아티팩트 표면에 그대로 남습니다.</p>
              ${renderStructuredBreakdown(parsedBreakdown, {
                includeExecutionBoundary: false,
                includeExpectedArtifacts: false,
                includeStopConditions: false,
              })}
            `
            : latestBreakdownArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                  ${createToken('원문 대체만 가능', 'warning')}
                </div>
                <p class="detail-copy">최신 breakdown 아티팩트를 구조화하지 못했습니다. 전체 내용은 아티팩트 표면의 원문 마크다운에서 확인합니다.</p>
              `
              : '<p class="detail-copy">아직 breakdown 아티팩트가 없습니다. 계획과 설계 아티팩트가 준비된 뒤 태스크 분해를 실행합니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">최신 빌더 프리플라이트</p>
        ${
          latestPreflightArtifact && parsedPreflight
            ? `
              <div class="token-row">
                ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                ${createToken('간결 요약', 'neutral')}
                ${createToken(`대상파일:${parsedPreflight.targetFiles.length}`, 'neutral')}
                ${createToken(`위험:${parsedPreflight.risks.length}`, parsedPreflight.risks.length > 0 ? 'warning' : 'success')}
              </div>
              <p class="detail-copy">가능한 범위의 간결 요약만 제공합니다. 전체 구조화 미리보기와 원문 마크다운은 아티팩트 표면에서 확인합니다.</p>
              ${renderCompactList('대상 파일', parsedPreflight.targetFiles)}
              ${renderCompactList('위험 요소', parsedPreflight.risks)}
              ${renderCompactList('검증 계획', parsedPreflight.verificationPlan)}
              ${renderBuilderLiveMutationApprovalPanel(task, data)}
            `
            : latestPreflightArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                  ${createToken('원문 대체만 가능', 'warning')}
                </div>
                <p class="detail-copy">구조화 파싱에 실패했습니다. 원문 마크다운 대체는 아티팩트 표면에서 확인합니다.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
            : `
                <p class="detail-copy">아직 빌더 프리플라이트 아티팩트가 없습니다. 계획, 설계, 분해 아티팩트가 준비된 뒤 빌더 프리플라이트를 실행합니다.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
        }
        ${
          showBuilderApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 동작은 현재 화면에서 처리하고, 서버 상태 요약을 그대로 따릅니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">리뷰</p>
        <div class="pill-list">
          ${createToken(`필수:${task.review?.required ? '예' : '아니오'}`, task.review?.required ? 'warning' : 'neutral')}
          ${createToken(`상태:${getReviewStatusDisplay(task.review?.status || 'pending')}`, getReviewTone(task.review?.status))}
          ${createToken(`검증:${task.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
          ${
            reviewerState.summary.sourceBuilderRunId
              ? createToken(`소스run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
              : ''
          }
        </div>
        <p class="detail-copy">${escapeHtml(task.review?.resolution?.note || '기록된 리뷰 해결 메모가 없습니다.')}</p>
        <div class="guard-summary">
          <div class="token-row">
            ${
              reviewerState.summary.allowed
                ? createToken('리뷰어:준비됨', 'success')
                : createToken('리뷰어:차단', 'warning')
            }
            ${
              reviewerState.summary.preflightArtifactId
                ? createToken(`preflight:${reviewerState.summary.preflightArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.changeSummaryArtifactId
                ? createToken(`change-summary:${reviewerState.summary.changeSummaryArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.patchArtifactId
                ? createToken(`patch:${reviewerState.summary.patchArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.diffArtifactId
                ? createToken(`diff:${reviewerState.summary.diffArtifactId}`, 'neutral')
                : ''
            }
          ${
            reviewerState.summary.existingReviewerRunId
              ? createToken(`기존리뷰어:${reviewerState.summary.existingReviewerRunId}`, 'warning')
              : ''
          }
        </div>
        ${
          reviewerState.reasons.length > 0
            ? renderReasonList('리뷰어 비활성 사유', reviewerState.reasons)
            : '<p class="detail-copy">리뷰어는 새 코드 변경 없이 최신 빌더 라이브 변경 번들을 점검할 수 있습니다.</p>'
        }
        <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-reviewer"
            data-id="${escapeHtml(task.id)}"
            ${reviewerState.disabled ? 'disabled' : ''}
          >
            리뷰어 실행
          </button>
          <p class="form-help">
            ${
              reviewerState.disabled
                ? `리뷰어 실행은 ${escapeHtml(reviewerState.reasons.join('; '))} 전까지 비활성 상태입니다.`
                : `리뷰어 실행은 빌더 실행 기록 ${escapeHtml(reviewerState.summary.sourceBuilderRunId)}을 읽고 커밋이나 릴리스 없이 최종 리뷰 아티팩트를 기록합니다.`
            }
          </p>
        </div>
      </div>
    </div>

    <div class="detail-block">
      <p class="detail-key">커밋 패키지</p>
      <div class="pill-list">
        ${createToken(
          `준비:${commitPackageState.summary.allowed ? '예' : '아니오'}`,
          commitPackageState.summary.allowed ? 'success' : 'warning',
        )}
        ${createToken(
          `커밋승인:${getApprovalStatusDisplay(getCommitApprovalDisplayStatus(commitPackageState.summary))}`,
          getApprovalDisplayTone(getCommitApprovalDisplayStatus(commitPackageState.summary)),
        )}
        ${
          commitPackageState.summary.currentCommitPackageArtifactId
            ? createToken(
                `현재패키지:${commitPackageState.summary.currentCommitPackageArtifactId}`,
                'neutral',
              )
            : ''
          }
        </div>
        ${renderCommitPackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showCommitApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 액션은 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">릴리스 패키지</p>
        ${renderReleasePackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showReleaseApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  '승인 액션은 현재 표면에 남고 서버 스냅샷을 그대로 따릅니다. 푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">종료 정리</p>
        <div class="pill-list">
          ${createToken(
            `준비:${closeOutState.summary.allowed ? '예' : '아니오'}`,
            closeOutState.summary.allowed ? 'success' : 'warning',
          )}
          ${createToken(
            `릴리스승인:${getApprovalStatusDisplay(getCloseOutApprovalDisplayStatus(closeOutState.summary))}`,
            getApprovalDisplayTone(getCloseOutApprovalDisplayStatus(closeOutState.summary)),
          )}
          ${
            closeOutState.summary.existingCloseOutArtifactId
              ? createToken(
                  `기존종료정리:${closeOutState.summary.existingCloseOutArtifactId}`,
                  closeOutState.summary.conflict ? 'warning' : 'neutral',
                )
              : ''
          }
        </div>
        ${renderCloseOutPanel(task, data, { currentSurface: 'taskboard' })}
      </div>

      <div class="detail-block">
        <p class="detail-key">승인 기록</p>
        ${
          taskApprovals.length > 0
            ? taskApprovals
                .map(
                  (approval) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(getApprovalActionLabel(approval.allowedNextAction) || approval.scope)}</strong>
                      <div class="token-row">
                        ${createToken(getApprovalStatusDisplay(approval.status), getApprovalTone(approval.status))}
                        ${createToken(`범위:${approval.scope}`, 'neutral')}
                      </div>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">이 태스크에 연결된 승인 기록이 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">결정 기록</p>
        ${
          taskInboxItems.length > 0
            ? taskInboxItems
                .map(
                  (item) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(item.title)}</strong>
                      <div class="token-row">
                        ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
                        ${createToken(getInboxStatusDisplay(item.status), item.status === 'pending' ? 'warning' : 'success')}
                        ${item.blocksTask ? createToken('태스크차단', 'danger') : ''}
                        ${item.id === selectedInboxItem?.id ? createToken('미리선택', 'accent') : ''}
                      </div>
                      <p class="detail-copy">${escapeHtml(item.prompt || item.resolution?.note || '기록된 안내 문구가 없습니다.')}</p>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">이 태스크에 연결된 결정함 항목이 없습니다.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">연결된 출력</p>
        <div class="token-row">
          ${createToken(`run수:${taskRuns.length}`, 'neutral')}
          ${createToken(`아티팩트수:${taskArtifacts.length}`, 'neutral')}
        </div>
      </div>
    </aside>
  `;
}

function renderLogs(data) {
  if (!data.activeProject) {
    elements.surfaces.logs.innerHTML = renderProjectGateSurface(
      '로그 사용 불가',
      getProjectGateCopy(data, '로그'),
    );
    return;
  }

  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedTask = selectedRun
    ? data.taskMap.get(selectedRun.taskId)
    : data.taskMap.get(state.selectedTaskId) || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const runBundle = selectedRun ? getRunArtifactBundle(selectedRun, data) : null;
  const logs = state.selectedRunLogs?.logs || [];
  const logText =
    logs.length > 0
      ? logs.map((entry) => `[${entry.ts}] ${entry.level.toUpperCase()} ${entry.message}`).join('\n')
      : '이 run에 대한 로그 기록이 없습니다.';
  const logsDetailSnapshot = getLogsDetailSnapshot(selectedRun, selectedTask, runBundle, logs);
  const logsDetailEvidenceState = getExecutionEvidenceRail(selectedTask, data);
  const selectedTaskApprovals = selectedTask
    ? data.approvals.filter((approval) => approval.taskId === selectedTask.id && approval.status === 'pending')
    : [];
  const selectedTaskInboxItems = selectedTask
    ? data.inboxItems.filter((item) => item.taskId === selectedTask.id && item.status === 'pending')
    : [];
  const selectedTaskPendingDecisions = selectedTaskInboxItems.filter((item) => item.kind !== 'approval');
  const logsPreferredInboxItem = selectedTask ? getPreferredTaskInboxItem(selectedTask.id, data) : null;
  const logsOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedTask,
    currentRun: selectedRun,
    currentInboxItem: logsPreferredInboxItem,
    pendingApprovalCount: selectedTaskApprovals.length,
    pendingDecisionCount: selectedTaskPendingDecisions.length,
  });
  const logsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(logsOpsEntrySignals);
  const logsDetailSignalRow = `
    <div class="logs-detail-signal-row">
      ${logsOpsEntrySignalRow}
    </div>
  `;
  const logsImmediateCard = selectedTaskApprovals.length > 0
    ? {
        title: `결재함에서 승인 ${selectedTaskApprovals.length}건 처리`,
        copy: '현재 실행 기록보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다.',
        button: {
          action: 'open-surface',
          label: '결재함',
          targetSurface: 'decision-inbox',
          disabled: state.loading || state.mutating,
        },
      }
    : selectedTaskInboxItems.length > 0
      ? {
          title: `결재함에서 확인 ${selectedTaskInboxItems.length}건 처리`,
          copy: '현재 실행 기록보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
        }
      : selectedTask
        ? {
            title: `${selectedTask.title} 열기`,
            copy: '현재 실행 기록이 연결된 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다.',
            button: {
              action: 'open-taskboard-task',
              id: selectedTask.id,
              label: '영향 셀',
              disabled: state.loading || state.mutating,
            },
          }
      : selectedRun
        ? {
            title: `${selectedRun.id} 원문 보기`,
            copy: '지금은 오른쪽 상세에서 이 실행 기록의 상태와 원문 로그를 먼저 읽으면 됩니다.',
            button: null,
          }
        : {
            title: '실행 기록 하나 고르기',
            copy: '왼쪽 실행 기록 목록에서 한 건을 고르면 오른쪽 판단과 원문 로그가 바로 채워집니다.',
            button: null,
          };
  const logsViewportStrip = renderViewportHandoffStrip({
    eyebrow: '로그 인계선',
    heading: '로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다',
    copy:
      '왼쪽은 실행 기록 목록을 보고, 오른쪽은 선택된 실행 기록의 현재 상태와 다음 확인만 먼저 봅니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      selectedTask ? createToken(`실행셀:${selectedTask.id}`, 'accent') : createToken('실행셀:대기', 'warning'),
      createToken(`바로:${selectedTask ? '영향 셀' : selectedRun ? '현재 실행 기록' : '기록 선택'}`, selectedTask ? 'accent' : 'neutral'),
    ].filter(Boolean),
    cards: [
      {
        label: '왼쪽 목록',
        title: '실행 기록 목록 + 현재 상태',
        copy: '왼쪽에서 실행 기록을 고르고, 상태와 다음 확인만 짧게 비교합니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedRun ? '현재 실행 기록 + 원문 확인' : '선택 기록 대기',
        copy: selectedRun
          ? '오른쪽 상세에서 현재 실행 기록, 다음 확인, 연결선, 원문 로그를 순서대로 확인합니다.'
          : '실행 기록을 하나 고르면 오른쪽 판단과 원문 로그가 함께 열립니다.',
      },
      {
        label: '바로',
        title: logsImmediateCard.title,
        copy: logsImmediateCard.copy,
        emphasis: true,
        button: logsImmediateCard.button,
      },
    ],
  });

  const runList = data.runs.length
    ? data.runs
        .map((run) => {
          const runTask = data.taskMap.get(run.taskId);
          const runSnapshot = getRunListSnapshot(run, runTask, data);

          return `
            <button class="card list-button ops-list-button ${run.id === selectedRun?.id ? 'is-selected' : ''}" type="button" data-action="select-run" data-id="${escapeHtml(run.id)}">
              <div class="ops-list-head ops-list-register ops-list-register-primary">
                <div class="card-title-row card-title-row-tight mission-row-head">
                  <strong>${escapeHtml(runSnapshot.title)}</strong>
                  ${createToken(getRunStatusDisplay(run.status), getRunTone(run.status))}
                </div>
                <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(runSnapshot.metaCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register">
                <p class="ops-list-label">현재 상태</p>
                <p class="list-copy list-copy-compact">${escapeHtml(runSnapshot.currentCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register ops-list-register-next">
                <p class="ops-list-label">다음 확인</p>
                <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(runSnapshot.nextCopy)}</p>
              </div>
              <div class="token-row token-row-compact ops-list-foot">
                ${runSnapshot.tokens.join('')}
                ${run.finishedAt ? createToken(`종료:${formatDate(run.finishedAt)}`, 'neutral') : ''}
              </div>
            </button>
          `;
        })
        .join('')
    : `
      <div class="empty-state">
        <strong>아직 실행 기록 없음</strong>
        <p>로그를 보기 전에 태스크 실행을 시작합니다.</p>
      </div>
    `;

  const logsDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 실행 기록만 세 칸으로 요약하는 로그실',
    copy: '아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      selectedTask ? createToken(`실행셀:${selectedTask.id}`, 'accent') : createToken('실행셀:대기', 'warning'),
      createToken(`run:${selectedRun?.id || data.runs.length}`, 'neutral'),
    ],
    signalRow: logsOpsEntrySignalRow,
    cards: [
      {
        label: '현재 실행 기록',
        title: selectedRun ? selectedRun.id : '기록 선택 대기',
        copy: selectedRun
          ? logsDetailSnapshot.currentCopy
          : '왼쪽 목록에서 실행 기록을 고르면 현재 실행 기록 판단이 바로 채워집니다.',
      },
      {
        label: '다음 확인',
        title: selectedRun ? logsDetailSnapshot.nextTitle : '실행 기록 하나 고르기',
        copy: selectedRun
          ? logsDetailSnapshot.nextCopy
          : '왼쪽 목록에서 실행 기록을 하나 고르면 오른쪽 판단과 원문 로그가 함께 열립니다.',
      },
      {
        label: '현재 맥락',
        title: selectedTask ? selectedTask.title : '실행 셀 대기',
        copy: selectedTask
          ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀과 연결돼 있습니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces.logs.innerHTML = `
    <div class="stack">
      ${logsViewportStrip}
      ${logsDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="list-column">${runList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">실행 기록</p>
          <h2>${escapeHtml(selectedRun?.id || '선택된 실행 기록 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 실행 기록과 다음 확인을 먼저 보는 로그 상세',
          copy: selectedTask?.title || '실행 기록을 고르면 현재 실행 기록과 다음 확인만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${logsDetailEvidenceState.currentOwnerLabel}`,
              logsDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${logsDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...logsDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: logsDetailSnapshot.currentTitle,
              copy: logsDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: logsDetailSnapshot.reasonTitle,
              copy: logsDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 확인',
              title: logsDetailSnapshot.nextTitle,
              copy: logsDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedRun
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">실행 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(getRunStatusDisplay(selectedRun.status), getRunTone(selectedRun.status))}
                  ${selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedTask.review.status)}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                </div>
                ${logsDetailSignalRow}
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedTask?.title || '알 수 없는 태스크')}</strong>
                    <p class="detail-copy detail-copy-compact">연결 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedRun.startedAt))}</strong>
                    <p class="detail-copy detail-copy-compact">
                      ${escapeHtml(formatDate(selectedRun.finishedAt))} 종료
                    </p>
                  </div>
                </div>
                <p class="detail-copy detail-copy-compact mono">${escapeHtml(selectedRun.logPath)}</p>
              </div>
              <div class="detail-block detail-block-compact">
                <p class="detail-key">보고 연결선</p>
                <p class="detail-copy detail-copy-compact">실행과 증적 연결만 짧게 봅니다.</p>
                ${
                  runBundle
                    ? renderRelationStrip(runBundle) ||
                      '<p class="detail-copy">이 실행 기록에 직접 연결된 아티팩트 기록이 없습니다.</p>'
                    : '<p class="detail-copy">이 실행 기록에 직접 연결된 아티팩트 기록이 없습니다.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">실행 원문 로그</p>
                <pre class="log-viewer log-viewer-compact">${escapeHtml(logText)}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>선택된 실행 기록 없음</strong>
                <p>왼쪽 목록에서 실행 기록을 골라 출력 내용을 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderArtifacts(data) {
  if (!data.activeProject) {
    elements.surfaces.artifacts.innerHTML = renderProjectGateSurface(
      '아티팩트 사용 불가',
      getProjectGateCopy(data, '아티팩트'),
    );
    return;
  }

  const selectedArtifactMeta = data.artifactMap.get(state.selectedArtifactId) || null;
  const harnessBrief = getHarnessConsumerBrief(data);
  const selectedArtifactTask = selectedArtifactMeta
    ? data.taskMap.get(selectedArtifactMeta.taskId)
    : null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const parsedBreakdown =
    selectedArtifactMeta?.type === 'breakdown' && state.selectedArtifact?.content
      ? parseBreakdownArtifact(state.selectedArtifact.content)
      : null;
  const parsedPreflight =
    selectedArtifactMeta?.type === 'preflight' && state.selectedArtifact?.content
      ? parsePreflightArtifact(state.selectedArtifact.content)
      : null;
  const parsedChangeSummary =
    selectedArtifactMeta?.type === 'change-summary' && state.selectedArtifact?.content
      ? parseChangeSummaryArtifact(state.selectedArtifact.content)
      : null;
  const parsedReview =
    selectedArtifactMeta?.type === 'review' && state.selectedArtifact?.content
      ? parseReviewArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitPackage =
    selectedArtifactMeta?.type === 'commit-package' && state.selectedArtifact?.content
      ? parseCommitPackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitResult =
    selectedArtifactMeta?.type === 'commit-result' && state.selectedArtifact?.content
      ? parseCommitResultArtifact(state.selectedArtifact.content)
      : null;
  const parsedReleasePackage =
    selectedArtifactMeta?.type === 'release-package' && state.selectedArtifact?.content
      ? parseReleasePackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCloseOut =
    selectedArtifactMeta?.type === 'close-out' && state.selectedArtifact?.content
      ? parseCloseOutArtifact(state.selectedArtifact.content)
      : null;
  const parsedUnifiedDiff =
    (selectedArtifactMeta?.type === 'patch' || selectedArtifactMeta?.type === 'diff') &&
    state.selectedArtifact?.content
      ? parseUnifiedDiffArtifact(state.selectedArtifact.content)
      : null;
  const artifactRelationContext = selectedArtifactMeta
      ? getArtifactRelationContext(selectedArtifactMeta, data, {
        parsedChangeSummary,
        parsedCommitResult,
        parsedCommitPackage,
        parsedCloseOut,
        parsedReleasePackage,
        parsedReview,
      })
    : null;
  const selectedArtifactPolicyEntry = selectedArtifactMeta
    ? getArtifactCatalogEntry(selectedArtifactMeta, data)
    : null;
  const selectedArtifactPolicySummary = selectedArtifactMeta
    ? getArtifactPolicySummary(selectedArtifactMeta, data)
    : '';
  const preselectedPendingItem =
    selectedArtifactTask &&
    selectedInboxItem &&
    selectedInboxItem.taskId === selectedArtifactTask.id &&
    selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';
  const artifactDetailSnapshot = getArtifactDetailSnapshot(
    selectedArtifactMeta,
    selectedArtifactTask,
    data,
    selectedArtifactPolicySummary,
  );
  const artifactsDetailEvidenceState = getExecutionEvidenceRail(selectedArtifactTask, data);
  const selectedArtifactApprovals = selectedArtifactTask
    ? data.approvals.filter((approval) => approval.taskId === selectedArtifactTask.id && approval.status === 'pending')
    : [];
  const selectedArtifactInboxItems = selectedArtifactTask
    ? data.inboxItems.filter((item) => item.taskId === selectedArtifactTask.id && item.status === 'pending')
    : [];
  const selectedArtifactPendingDecisions = selectedArtifactInboxItems.filter(
    (item) => item.kind !== 'approval',
  );
  const artifactsPreferredInboxItem = selectedArtifactTask
    ? getPreferredTaskInboxItem(selectedArtifactTask.id, data)
    : null;
  const artifactSourceRun =
    selectedArtifactMeta?.runId ? data.runMap.get(selectedArtifactMeta.runId) || null : null;
  const artifactsOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedArtifactTask,
    currentRun: artifactSourceRun,
    currentArtifact: selectedArtifactMeta,
    currentInboxItem: artifactsPreferredInboxItem,
    pendingApprovalCount: selectedArtifactApprovals.length,
    pendingDecisionCount: selectedArtifactPendingDecisions.length,
  });
  const artifactsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(artifactsOpsEntrySignals);
  const artifactsImmediateCard = selectedArtifactApprovals.length > 0
    ? {
        title: `결재함에서 승인 ${selectedArtifactApprovals.length}건 처리`,
        copy: '현재 증적보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다.',
        button: {
          action: 'open-surface',
          label: '결재함',
          targetSurface: 'decision-inbox',
          disabled: state.loading || state.mutating,
        },
      }
    : selectedArtifactInboxItems.length > 0
      ? {
          title: `결재함에서 확인 ${selectedArtifactInboxItems.length}건 처리`,
          copy: '현재 증적보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다.',
          button: {
            action: 'open-surface',
            label: '결재함',
            targetSurface: 'decision-inbox',
            disabled: state.loading || state.mutating,
          },
        }
      : selectedArtifactTask
        ? {
            title: `${selectedArtifactTask.title} 열기`,
            copy: '현재 증적이 걸린 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다.',
            button: {
              action: 'open-taskboard-task',
              id: selectedArtifactTask.id,
              label: '영향 셀',
              disabled: state.loading || state.mutating,
            },
          }
      : selectedArtifactMeta
        ? {
            title: `${selectedArtifactMeta.id} 미리보기`,
            copy: '지금은 오른쪽 상세에서 이 증적의 상태와 연결선을 먼저 읽으면 됩니다.',
            button: null,
          }
        : {
            title: '증적 하나 고르기',
            copy: '왼쪽 목록에서 증적을 하나 고르면 오른쪽 판단과 미리보기가 바로 채워집니다.',
            button: null,
          };
  const artifactList = data.artifacts.length
    ? data.artifacts
        .map((artifact) => {
          const artifactTask = data.taskMap.get(artifact.taskId) || null;
          const artifactSnapshot = getArtifactListSnapshot(artifact, artifactTask, data);

          return `
            <button class="card list-button ops-list-button ${artifact.id === selectedArtifactMeta?.id ? 'is-selected' : ''}" type="button" data-action="select-artifact" data-id="${escapeHtml(artifact.id)}">
              <div class="ops-list-head ops-list-register ops-list-register-primary">
                <div class="card-title-row card-title-row-tight mission-row-head">
                  <strong>${escapeHtml(artifactSnapshot.title)}</strong>
                  ${createToken(artifact.type, 'neutral')}
                </div>
                <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(artifactSnapshot.metaCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register">
                <p class="ops-list-label">현재 상태</p>
                <p class="list-copy list-copy-compact">${escapeHtml(artifactSnapshot.currentCopy)}</p>
              </div>
              <div class="ops-list-summary ops-list-register ops-list-register-next">
                <p class="ops-list-label">다음 확인</p>
                <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(artifactSnapshot.nextCopy)}</p>
              </div>
              <div class="token-row token-row-compact ops-list-foot">
                ${artifactSnapshot.tokens.join('')}
              </div>
            </button>
          `;
        })
        .join('')
    : `
      <div class="empty-state">
        <strong>아직 아티팩트 없음</strong>
        <p>아티팩트는 런타임 실행이나 리뷰 증거가 기록된 뒤 나타납니다.</p>
      </div>
    `;
  const artifactsViewportStrip = renderViewportHandoffStrip({
    eyebrow: '증적 인계선',
    heading: '보관실 아래는 증적 목록과 현재 증적으로 나눕니다',
    copy:
      '왼쪽은 증적 목록을 보고, 오른쪽은 선택된 증적의 현재 상태와 다음 확인만 먼저 봅니다.',
    tokens: [
      createToken(`증적:${data.artifacts.length}`, 'neutral'),
      selectedArtifactMeta
        ? createToken(`현재:${getArtifactTypeDisplay(selectedArtifactMeta.type)}`, 'accent')
        : createToken('현재:선택대기', 'warning'),
      createToken(
        `바로:${selectedArtifactTask ? '영향 셀' : selectedArtifactMeta ? '현재 증적' : '증적 선택'}`,
        selectedArtifactTask ? 'accent' : 'neutral',
      ),
    ],
    cards: [
      {
        label: '왼쪽 목록',
        title: '증적 목록 + 현재 상태',
        copy: '왼쪽에서 증적을 고르고, 상태와 다음 확인만 짧게 비교합니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedArtifactMeta ? '현재 증적 + 미리보기' : '선택 증적 대기',
        copy: selectedArtifactMeta
          ? '오른쪽 상세에서 현재 증적, 다음 확인, 연결선, 구조 미리보기나 저장 원문을 순서대로 확인합니다.'
          : '증적을 하나 고르면 오른쪽 판단과 미리보기가 함께 열립니다.',
      },
      {
        label: '바로',
        title: artifactsImmediateCard.title,
        copy: artifactsImmediateCard.copy,
        emphasis: true,
        button: artifactsImmediateCard.button,
      },
    ],
  });

  const artifactsDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 증적만 세 칸으로 요약하는 보관실',
    copy: '아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다.',
    tokens: [
      createToken(`증적:${data.artifacts.length}`, 'neutral'),
      selectedArtifactMeta
        ? createToken(`현재:${getArtifactTypeDisplay(selectedArtifactMeta.type)}`, 'accent')
        : createToken('현재:선택대기', 'warning'),
      selectedArtifactTask ? createToken(`실행셀:${selectedArtifactTask.id}`, 'neutral') : '',
    ],
    signalRow: artifactsOpsEntrySignalRow,
    cards: [
      {
        label: '현재 증적',
        title: selectedArtifactMeta ? selectedArtifactMeta.id : '증적 선택 대기',
        copy: selectedArtifactMeta
          ? artifactDetailSnapshot.currentCopy
          : '왼쪽 목록에서 증적을 고르면 현재 증적 판단이 바로 채워집니다.',
      },
      {
        label: '다음 확인',
        title: selectedArtifactMeta ? artifactDetailSnapshot.nextTitle : '증적 하나 고르기',
        copy: selectedArtifactMeta
          ? artifactDetailSnapshot.nextCopy
          : '왼쪽 목록에서 증적을 하나 고르면 오른쪽 판단과 미리보기가 함께 열립니다.',
      },
      {
        label: '현재 맥락',
        title: selectedArtifactTask ? selectedArtifactTask.title : '실행 셀 대기',
        copy: selectedArtifactTask
          ? `${getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState)} 상태의 실행 셀에 연결된 증적입니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces.artifacts.innerHTML = `
    <div class="stack">
      ${artifactsViewportStrip}
      ${artifactsDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="list-column">${artifactList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">증적 상세</p>
          <h2>${escapeHtml(selectedArtifactMeta?.id || '선택된 증적 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 증적과 다음 확인을 먼저 보는 증적 상세',
          copy: selectedArtifactTask?.title || '증적을 고르면 현재 증적과 다음 확인만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${artifactsDetailEvidenceState.currentOwnerLabel}`,
              artifactsDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${artifactsDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...artifactDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: artifactDetailSnapshot.currentTitle,
              copy: artifactDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: artifactDetailSnapshot.reasonTitle,
              copy: artifactDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 확인',
              title: artifactDetailSnapshot.nextTitle,
              copy: artifactDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedArtifactMeta
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">증적 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(selectedArtifactMeta.type, 'neutral')}
                  ${renderArtifactPolicyTokens(selectedArtifactMeta, data)}
                  ${selectedArtifactTask ? createToken(getTaskLifecycleDisplay(selectedArtifactTask.lifecycleState), 'neutral') : ''}
                  ${selectedArtifactTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedArtifactTask.review.status)}`, getReviewTone(selectedArtifactTask.review.status)) : ''}
                </div>
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedArtifactTask?.title || '알 수 없는 태스크')}</strong>
                    <p class="detail-copy detail-copy-compact">연결 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedArtifactMeta.createdAt))}</strong>
                    <p class="detail-copy detail-copy-compact">저장 시각</p>
                  </div>
                </div>
                <p class="detail-copy detail-copy-compact mono">${escapeHtml(selectedArtifactMeta.path)}</p>
                ${
                  selectedArtifactPolicySummary
                    ? `<p class="detail-copy detail-copy-compact">${escapeHtml(selectedArtifactPolicySummary)}</p>`
                    : ''
                }
              </div>
              <div class="detail-block detail-block-compact">
                <p class="detail-key">증적 연결선</p>
                <p class="detail-copy detail-copy-compact">연결 요약만 먼저 봅니다.</p>
                ${
                  renderRelationStrip(artifactRelationContext) ||
                  '<p class="detail-copy">이 아티팩트에 직접 연결된 run 또는 아티팩트 기록이 없습니다.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">보고 미리보기</p>
                ${
                  selectedArtifactMeta.type === 'breakdown' && parsedBreakdown
                    ? `
                      ${renderStructuredBreakdown(parsedBreakdown)}
                    `
                    : selectedArtifactMeta.type === 'breakdown'
                      ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                      : selectedArtifactMeta.type === 'preflight' && parsedPreflight
                        ? `
                          ${renderStructuredPreflight(parsedPreflight)}
                        `
                        : selectedArtifactMeta.type === 'preflight'
                          ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                        : selectedArtifactMeta.type === 'change-summary' && parsedChangeSummary
                          ? `
                            ${renderStructuredChangeSummary(parsedChangeSummary)}
                          `
                          : selectedArtifactMeta.type === 'change-summary'
                            ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                          : selectedArtifactMeta.type === 'review' && parsedReview
                            ? `
                              ${renderStructuredReview(parsedReview, selectedArtifactTask?.review?.status || null)}
                            `
                            : selectedArtifactMeta.type === 'review'
                              ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'commit-package' && parsedCommitPackage
                              ? `
                                ${renderStructuredCommitPackage(parsedCommitPackage)}
                              `
                              : selectedArtifactMeta.type === 'commit-package'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'commit-result' && parsedCommitResult
                              ? `
                                ${renderStructuredCommitResult(parsedCommitResult)}
                              `
                              : selectedArtifactMeta.type === 'commit-result'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'release-package' && parsedReleasePackage
                              ? `
                                ${renderStructuredReleasePackage(parsedReleasePackage)}
                              `
                              : selectedArtifactMeta.type === 'release-package'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'close-out' && parsedCloseOut
                              ? `
                                ${renderStructuredCloseOut(parsedCloseOut)}
                              `
                              : selectedArtifactMeta.type === 'close-out'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'patch' && parsedUnifiedDiff
                              ? `
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'planned patch')}
                              `
                            : selectedArtifactMeta.type === 'patch'
                              ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                            : selectedArtifactMeta.type === 'diff' && parsedUnifiedDiff
                              ? `
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'observed diff')}
                              `
                              : selectedArtifactMeta.type === 'diff'
                                ? '<p class="detail-copy detail-copy-compact">구조 요약이 없으면 원문으로 확인합니다.</p>'
                      : ''
                }
                ${
                  selectedArtifactPolicyEntry?.previewMode === 'raw-only'
                    ? '<p class="detail-copy detail-copy-compact">이 증적은 원문만 확인합니다.</p>'
                    : ''
                }
                ${
                  selectedArtifactMeta.type === 'preflight' && selectedArtifactTask
                    ? renderBuilderLiveMutationApprovalPanel(selectedArtifactTask, data)
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderCommitPackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderReleasePackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package' ||
                    selectedArtifactMeta.type === 'close-out')
                    ? renderCloseOutPanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  showBuilderApprovalHint &&
                  selectedArtifactMeta.type === 'preflight'
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText: '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
                      })
                    : ''
                }
                ${
                  showCommitApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText: '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다.',
                      })
                    : ''
                }
                ${
                  showReleaseApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        signalRow: artifactsOpsEntrySignalRow,
                        helpText:
                          '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다. 푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다.',
                      })
                    : ''
                }
                <p class="detail-key">보관 원문</p>
                <p class="detail-copy detail-copy-compact">저장 원문이 최종 기준입니다.</p>
                <pre class="artifact-preview artifact-preview-compact">${escapeHtml(state.selectedArtifact?.content || '미리보기 가능한 내용이 없습니다.')}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>선택된 증적 없음</strong>
                <p>증적을 골라 저장된 원문과 소스 연결을 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

function renderDecisionInbox(data) {
  if (!data.activeProject) {
    elements.surfaces['decision-inbox'].innerHTML = renderProjectGateSurface(
      '결정함 사용 불가',
      getProjectGateCopy(data, '결정함'),
    );
    return;
  }

  const harnessBrief = getHarnessConsumerBrief(data);
  const pendingItems = data.inboxItems.filter((item) => item.status === 'pending');
  const resolvedItems = data.inboxItems.filter((item) => item.status === 'resolved');
  const selectedItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const selectedTask = selectedItem ? data.taskMap.get(selectedItem.taskId) : null;
  const selectedApproval = selectedItem?.sourceId
    ? data.approvals.find((approval) => approval.id === selectedItem.sourceId) || null
    : null;
  const inboxActionDisabled = state.loading || state.mutating;
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const inboxDetailSnapshot = getInboxDetailSnapshot(selectedItem, selectedTask, selectedApproval);
  const decisionDetailEvidenceState = getExecutionEvidenceRail(selectedTask, data);
  const pendingApprovalItems = pendingItems.filter((item) => item.kind === 'approval');
  const pendingDecisionItems = pendingItems.filter((item) => item.kind !== 'approval');
  const decisionOpsEntrySignals = getAdvancedOpsEntrySignals({
    data,
    task: selectedTask,
    currentInboxItem: selectedItem,
    pendingApprovalCount: pendingApprovalItems.length,
    pendingDecisionCount: pendingDecisionItems.length,
  });
  const decisionOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow(decisionOpsEntrySignals);
  const decisionActionSignalRow = `
    <div class="decision-action-signal-row">
      ${decisionOpsEntrySignalRow}
    </div>
  `;
  const decisionImmediateCard = selectedTask
    ? {
        title: `${selectedTask.title} 열기`,
        copy: '현재 결재가 묶인 실행 셀을 작업판에서 다시 보고 후속 단계를 이어갑니다.',
        button: {
          action: 'open-taskboard-task',
          id: selectedTask.id,
          label: '영향 셀',
          disabled: state.loading || state.mutating,
        },
      }
    : pendingItems.length > 0
      ? {
          title: `대기 결재 ${pendingItems.length}건 확인`,
          copy: '왼쪽 대기 큐에서 한 건을 고르면 오른쪽 처리 판단이 바로 채워집니다.',
          button: null,
        }
      : {
          title: '최근 처리 기록 보기',
          copy: '대기 안건이 없으면 왼쪽 최근 처리 열에서 감사 추적을 이어서 확인합니다.',
          button: null,
        };
  const decisionViewportStrip = renderViewportHandoffStrip({
    eyebrow: '결재 인계선',
    heading: '결재함 아래는 큐와 처리 판단으로 나눕니다',
    copy:
      '왼쪽은 대기 안건과 최근 처리 큐를 보고, 오른쪽은 현재 선택 항목의 상태와 다음 처리만 먼저 봅니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      createToken(`대기:${pendingItems.length}`, pendingItems.length > 0 ? 'warning' : 'success'),
      createToken(`바로:${selectedTask ? '영향 셀' : pendingItems.length > 0 ? '대기 큐' : '최근 처리'}`, selectedTask ? 'accent' : 'neutral'),
    ].filter(Boolean),
    cards: [
      {
        label: '왼쪽 큐',
        title: '대기 결재 + 최근 처리',
        copy: '왼쪽 두 열에서 지금 막힌 안건과 방금 끝난 처리 기록을 고릅니다.',
      },
      {
        label: '오른쪽 판단',
        title: selectedItem ? '현재 상태 + 처리' : '선택 항목 대기',
        copy: selectedItem
          ? '오른쪽 상세에서 승인, 반려, 해결과 다음 연결을 바로 판단합니다.'
          : '항목을 하나 고르면 오른쪽 처리 판단과 액션이 함께 열립니다.',
      },
      {
        label: '바로',
        title: decisionImmediateCard.title,
        copy: decisionImmediateCard.copy,
        emphasis: true,
        button: decisionImmediateCard.button,
      },
    ],
  });
  let actionSurface = '';

  if (selectedItem?.status === 'pending' && selectedItem.kind === 'approval') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 여기서 승인 또는 반려만 결정합니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('승인 요청', 'accent')}
            ${selectedApproval ? createToken(getApprovalActionLabel(selectedApproval.allowedNextAction) || selectedApproval.scope, 'neutral') : ''}
          </div>
        </div>
        ${decisionActionSignalRow}
        <div class="form-actions form-actions-inline decision-action-row">
          <button
            class="primary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="approve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            승인
          </button>
          <button
            class="danger-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="reject"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            반려
          </button>
        </div>
        <p class="form-help decision-action-help">선택한 결재만 여기서 처리하고, 실행 흐름은 아래 연결 맥락을 따릅니다.</p>
      </div>
    `;
  } else if (selectedItem?.status === 'pending' && selectedItem.kind === 'decision') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 여기서 해결만 기록하고 다음 실행 판단으로 넘깁니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('결정 처리', 'warning')}
          </div>
        </div>
        ${decisionActionSignalRow}
        <div class="form-actions form-actions-inline decision-action-row">
          <button
            class="secondary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="resolve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            해결
          </button>
        </div>
        <p class="form-help decision-action-help">해결 뒤 흐름은 영향 셀과 현재 게이트를 따라 이어집니다.</p>
      </div>
    `;
  } else if (selectedItem?.status === 'pending') {
    actionSurface = `
      <div class="detail-block detail-block-action decision-action-block">
        <div class="decision-action-head">
          <div>
            <p class="detail-key">지금 처리</p>
            <p class="decision-action-copy">이 안건은 결정함에서 상태만 확인하고 다른 화면으로 이어집니다.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            )}
            ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
            ${createToken('읽기 전용', 'neutral')}
          </div>
        </div>
        ${decisionActionSignalRow}
        <p class="detail-copy">이 결정함 항목에는 현재 결정함 경로에서 허용된 쓰기 액션이 없습니다.</p>
      </div>
    `;
  }

  const renderInboxList = (items, options) => `
    <section class="surface-panel">
      <div class="panel-header panel-header-tight">
        <div>
          <h2>${escapeHtml(options.title)}</h2>
          <p class="panel-copy panel-copy-tight">${escapeHtml(options.copy)}</p>
        </div>
        <div class="token-row token-row-compact">
          ${createToken(`${options.countLabel}:${items.length}`, options.countTone)}
          ${options.scopeToken ? createToken(options.scopeToken, 'neutral') : ''}
        </div>
      </div>
      ${
        items.length > 0
          ? `<div class="list-column">
              ${items
                .map((item) => {
                  const inboxTask = data.taskMap.get(item.taskId) || null;
                  const inboxApproval = item.sourceId
                    ? data.approvals.find((approval) => approval.id === item.sourceId) || null
                    : null;
                  const inboxEvidenceState = getExecutionEvidenceRail(inboxTask, data);
                  const inboxSnapshot = getInboxListSnapshot(
                    item,
                    inboxTask,
                    inboxApproval,
                    inboxEvidenceState,
                  );

                  return `
                    <button class="card list-button ops-list-button ${item.id === selectedItem?.id ? 'is-selected' : ''}" type="button" data-action="select-inbox-item" data-id="${escapeHtml(item.id)}">
                      <div class="ops-list-head ops-list-register ops-list-register-primary">
                        <div class="card-title-row card-title-row-tight mission-row-head">
                          <strong>${escapeHtml(inboxSnapshot.title)}</strong>
                          ${createToken(getInboxKindDisplay(item.kind), getInboxTone(item))}
                        </div>
                        <p class="list-copy list-copy-compact ops-list-meta">${escapeHtml(inboxSnapshot.metaCopy)}</p>
                      </div>
                      <div class="ops-list-summary ops-list-register">
                        <p class="ops-list-label">현재 상태</p>
                        <p class="list-copy list-copy-compact">${escapeHtml(inboxSnapshot.currentCopy)}</p>
                      </div>
                      <div class="ops-list-summary ops-list-register ops-list-register-next">
                        <p class="ops-list-label">다음 확인</p>
                        <p class="list-copy list-copy-compact ops-list-next">${escapeHtml(inboxSnapshot.nextCopy)}</p>
                      </div>
                      <div class="token-row token-row-compact ops-list-foot">
                        ${createToken(
                          `현재:${inboxEvidenceState.currentOwnerLabel}`,
                          inboxEvidenceState.blockedReason ? 'danger' : 'accent',
                        )}
                        ${createToken(`다음:${inboxEvidenceState.nextHandoffLabel}`, 'neutral')}
                        ${inboxSnapshot.tokens.join('')}
                        ${createToken(formatDate(item.updatedAt || item.createdAt), 'neutral')}
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>`
          : `
            <div class="empty-state">
              <strong>없음</strong>
              <p>${escapeHtml(options.emptyCopy)}</p>
            </div>
          `
      }
    </section>
  `;

  const decisionDeck = renderOpsCenterDeck({
    entryFrame: true,
    heading: '선택된 결재 안건만 세 칸으로 요약하는 결재함',
    copy: '아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다.',
    tokens: [
      selectedMission ? createToken(`안건:${selectedMission.id}`, 'neutral') : '',
      createToken(`대기:${pendingItems.length}`, pendingItems.length > 0 ? 'warning' : 'success'),
      createToken(`처리됨:${resolvedItems.length}`, 'neutral'),
    ],
    signalRow: decisionOpsEntrySignalRow,
    cards: [
      {
        label: '현재 안건',
        title: selectedItem ? selectedItem.title : '선택 대기',
        copy: selectedItem
          ? inboxDetailSnapshot.currentCopy
          : '왼쪽 큐에서 항목을 고르면 현재 상태 판단이 바로 채워집니다.',
      },
      {
        label: '다음 처리',
        title: selectedItem ? inboxDetailSnapshot.nextTitle : pendingItems.length > 0 ? '대기 큐 처리' : '최근 처리 확인',
        copy: selectedItem
          ? inboxDetailSnapshot.nextCopy
          : pendingItems.length > 0
            ? '왼쪽 대기 큐에서 한 건을 고르면 오른쪽 처리 판단과 액션이 함께 열립니다.'
            : '대기 안건이 없으면 최근 처리 열에서 감사 추적을 이어서 확인합니다.',
      },
      {
        label: '현재 맥락',
        title: selectedTask ? selectedTask.title : '영향 실행 셀 대기',
        copy: selectedTask
          ? `${getTaskLifecycleDisplay(selectedTask.lifecycleState)} 상태의 실행 셀과 연결된 ${getInboxKindDisplay(selectedItem?.kind || 'decision')} 안건입니다.`
          : '아직 연결된 실행 셀 맥락이 보이지 않습니다.',
      },
    ],
  });

  elements.surfaces['decision-inbox'].innerHTML = `
    <div class="stack">
      ${decisionViewportStrip}
      ${decisionDeck}
      ${renderHarnessBriefRegister(harnessBrief)}
      <div class="surface-grid surface-grid-inbox">
      <section class="surface-panel">
        ${renderInboxList(pendingItems, {
          title: '대기 결재',
          copy: '지금 막힌 게이트만 고르고 바로 처리합니다.',
          emptyCopy: '사람의 처리를 기다리는 게이트가 아직 남아 있습니다.',
          countLabel: '대기',
          countTone: pendingItems.length > 0 ? 'warning' : 'success',
          scopeToken: '지금 처리',
        })}
      </section>
      ${renderInboxList(resolvedItems, {
        title: '최근 처리',
        copy: '방금 끝난 승인과 해결만 감사 추적으로 확인합니다.',
        emptyCopy: '해결된 결정과 승인은 감사 추적을 위해 계속 보입니다.',
        countLabel: '처리됨',
        countTone: 'neutral',
        scopeToken: '감사 추적',
      })}
      <aside class="detail-card">
        <div>
          <p class="eyebrow">결재 상세</p>
          <h2>${escapeHtml(selectedItem?.title || '선택된 결재 없음')}</h2>
        </div>
        ${renderNarrativeDeck({
          eyebrow: '관제실 판단 요약',
          heading: '현재 상태와 다음 처리를 먼저 보는 결재 상세',
          copy: selectedItem?.prompt || '결재를 고르면 현재 상태와 다음 처리만 먼저 판단합니다.',
          tokens: [
            createToken(
              `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
              decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
            ),
            createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral'),
            ...inboxDetailSnapshot.tokens,
          ],
          cards: [
            {
              label: '현재 상태',
              title: inboxDetailSnapshot.currentTitle,
              copy: inboxDetailSnapshot.currentCopy,
            },
            {
              label: '핵심 이유',
              title: inboxDetailSnapshot.reasonTitle,
              copy: inboxDetailSnapshot.reasonCopy,
            },
            {
              label: '다음 처리',
              title: inboxDetailSnapshot.nextTitle,
              copy: inboxDetailSnapshot.nextCopy,
            },
          ],
          wide: false,
        })}
        ${
          selectedItem
            ? `
              <div class="detail-block detail-block-compact">
                <p class="detail-key">결재 기본 정보</p>
                <div class="token-row token-row-compact">
                  ${createToken(
                    `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
                    decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
                  )}
                  ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
                  ${createToken(getInboxKindDisplay(selectedItem.kind), getInboxTone(selectedItem))}
                  ${createToken(getInboxStatusDisplay(selectedItem.status), selectedItem.status === 'pending' ? 'warning' : 'success')}
                  ${selectedItem.blocksTask ? createToken('태스크차단', 'danger') : ''}
                </div>
                <p class="detail-copy detail-copy-compact">${escapeHtml(selectedItem.prompt || '기록된 안내 문구가 없습니다.')}</p>
                <div class="kv-grid kv-grid-compact">
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(selectedTask?.title || selectedItem.taskId)}</strong>
                    <p class="detail-copy detail-copy-compact">영향 실행 셀</p>
                  </div>
                  <div class="kv-item kv-item-compact">
                    <strong>${escapeHtml(formatDate(selectedItem.updatedAt || selectedItem.createdAt))}</strong>
                    <p class="detail-copy detail-copy-compact">최근 갱신</p>
                  </div>
                </div>
                <div class="token-row token-row-compact">
                  ${selectedTask ? createToken(getTaskLifecycleDisplay(selectedTask.lifecycleState), 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`리뷰:${getReviewStatusDisplay(selectedTask.review.status)}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('차단', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('승인대기', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('결정대기', 'warning') : ''}
                </div>
              </div>
              ${
                selectedApproval
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">결재 기록</p>
                      <div class="kv-item">
                        <strong>${escapeHtml(getApprovalActionLabel(selectedApproval.allowedNextAction) || selectedApproval.scope)}</strong>
                        <div class="token-row">
                          ${createToken(
                            `현재:${decisionDetailEvidenceState.currentOwnerLabel}`,
                            decisionDetailEvidenceState.blockedReason ? 'danger' : 'accent',
                          )}
                          ${createToken(`다음:${decisionDetailEvidenceState.nextHandoffLabel}`, 'neutral')}
                          ${createToken(getApprovalStatusDisplay(selectedApproval.status), getApprovalTone(selectedApproval.status))}
                          ${createToken(`범위:${selectedApproval.scope}`, 'neutral')}
                        </div>
                      </div>
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'builder-live-mutation'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">라이브 변경 결재</p>
                      ${renderBuilderLiveMutationApprovalPanel(selectedTask, data)}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'commit-intent'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">커밋 지시</p>
                      ${renderCommitPackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">릴리스 보고</p>
                      ${renderReleasePackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                        includeAction: false,
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">안건 종료 보고</p>
                      ${renderCloseOutPanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              <div class="detail-block">
                <p class="detail-key">처리 메모</p>
                <p class="detail-copy detail-copy-compact">${escapeHtml(selectedItem.resolution?.note || '기록된 처리 메모가 없습니다.')}</p>
                <div class="token-row token-row-compact">
                  ${selectedItem.resolution?.action ? createToken(`처리:${getInboxResolutionActionDisplay(selectedItem.resolution.action)}`, 'success') : ''}
                  ${createToken(`갱신:${formatDate(selectedItem.updatedAt)}`, 'neutral')}
                </div>
              </div>
              ${actionSurface}
            `
            : `
              <div class="empty-state">
                <strong>선택된 결재 없음</strong>
                <p>항목을 골라 태스크 맥락과 기록된 해결 상태를 확인합니다.</p>
              </div>
            `
        }
      </aside>
      </div>
    </div>
  `;
}

async function copyTextValue({
  value,
  emptyErrorMessage,
  copiedMessage,
  unsupportedMessage,
}) {
  if (!value) {
    throw new Error(emptyErrorMessage);
  }

  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(value);
    elements.refreshStatus.textContent = copiedMessage(value);
    return;
  }

  elements.refreshStatus.textContent = unsupportedMessage(value);
}

async function copyHarnessCommand(command) {
  const emptyCommandCopyMessage = '복사할 하네스 명령이 없습니다.';
  const copiedCommandMessage = (value) => `하네스 명령 템플릿을 복사했습니다: ${value}`;
  const unsupportedCommandCopyMessage = (value) =>
    `클립보드 미지원 환경입니다. 명령 템플릿을 직접 채워 실행하세요: ${value}`;

  await copyTextValue({
    value: command,
    emptyErrorMessage: emptyCommandCopyMessage,
    copiedMessage: copiedCommandMessage,
    unsupportedMessage: unsupportedCommandCopyMessage,
  });
}

async function copyHarnessExecutionOutputPath(outputPath, label = '출력 경로') {
  const outputLabel = label || '출력 경로';
  const emptyOutputPathCopyMessage = `복사할 하네스 ${outputLabel}가 없습니다.`;
  const copiedOutputPathMessage = (value) => `하네스 ${outputLabel}를 복사했습니다: ${value}`;
  const unsupportedOutputPathCopyMessage = (value) =>
    `클립보드 미지원 환경입니다. ${outputLabel}를 직접 확인하세요: ${value}`;

  await copyTextValue({
    value: outputPath,
    emptyErrorMessage: emptyOutputPathCopyMessage,
    copiedMessage: copiedOutputPathMessage,
    unsupportedMessage: unsupportedOutputPathCopyMessage,
  });
}

async function copyHarnessExecutionInputPath(inputPath) {
  const emptyInputPathCopyMessage = '복사할 하네스 입력 경로가 없습니다.';
  const copiedInputPathMessage = (value) => `하네스 입력 경로를 복사했습니다: ${value}`;
  const unsupportedInputPathCopyMessage = (value) =>
    `클립보드 미지원 환경입니다. 입력 경로를 직접 확인하세요: ${value}`;

  await copyTextValue({
    value: inputPath,
    emptyErrorMessage: emptyInputPathCopyMessage,
    copiedMessage: copiedInputPathMessage,
    unsupportedMessage: unsupportedInputPathCopyMessage,
  });
}

async function copyHarnessExecutionRequestId(requestId) {
  const emptyRequestIdCopyMessage = '복사할 하네스 요청 ID가 없습니다.';
  const copiedRequestIdMessage = (value) => `하네스 요청 ID를 복사했습니다: ${value}`;
  const unsupportedRequestIdCopyMessage = (value) =>
    `클립보드 미지원 환경입니다. 요청 ID를 직접 확인하세요: ${value}`;

  await copyTextValue({
    value: requestId,
    emptyErrorMessage: emptyRequestIdCopyMessage,
    copiedMessage: copiedRequestIdMessage,
    unsupportedMessage: unsupportedRequestIdCopyMessage,
  });
}

async function copyHarnessExecutionPreview(previewText) {
  const emptyPreviewCopyMessage = '복사할 하네스 실행 미리보기가 없습니다.';
  const copiedPreviewMessage = () => '하네스 실행 미리보기를 복사했습니다.';
  const unsupportedPreviewCopyMessage = () =>
    '클립보드 미지원 환경입니다. 하네스 실행 미리보기를 직접 확인하세요.';

  await copyTextValue({
    value: previewText,
    emptyErrorMessage: emptyPreviewCopyMessage,
    copiedMessage: copiedPreviewMessage,
    unsupportedMessage: unsupportedPreviewCopyMessage,
  });
}

async function copyHarnessExecutionPacket(packetText) {
  const emptyPacketCopyMessage = '복사할 하네스 실행 패킷이 없습니다.';
  const copiedPacketMessage = () => '하네스 실행 패킷을 복사했습니다.';
  const unsupportedPacketCopyMessage = () =>
    '클립보드 미지원 환경입니다. 하네스 실행 패킷을 직접 확인하세요.';

  await copyTextValue({
    value: packetText,
    emptyErrorMessage: emptyPacketCopyMessage,
    copiedMessage: copiedPacketMessage,
    unsupportedMessage: unsupportedPacketCopyMessage,
  });
}

async function copyHarnessOutputBrief(briefText, label = '출력 요약') {
  const briefLabel = label || '출력 요약';
  const emptyOutputBriefCopyMessage = `복사할 하네스 ${briefLabel}이 없습니다.`;
  const copiedOutputBriefMessage = () => `하네스 ${briefLabel}을 복사했습니다.`;
  const unsupportedOutputBriefCopyMessage = () =>
    `클립보드 미지원 환경입니다. 하네스 ${briefLabel}을 직접 확인하세요.`;

  await copyTextValue({
    value: briefText,
    emptyErrorMessage: emptyOutputBriefCopyMessage,
    copiedMessage: copiedOutputBriefMessage,
    unsupportedMessage: unsupportedOutputBriefCopyMessage,
  });
}

async function copyHarnessPolicyReport(reportText) {
  const emptyPolicyReportCopyMessage = '복사할 하네스 정책 리포트가 없습니다.';
  const copiedPolicyReportMessage = () => '하네스 정책 리포트를 복사했습니다.';
  const unsupportedPolicyReportCopyMessage = () =>
    '클립보드 미지원 환경입니다. 하네스 정책 리포트를 직접 확인하세요.';

  await copyTextValue({
    value: reportText,
    emptyErrorMessage: emptyPolicyReportCopyMessage,
    copiedMessage: copiedPolicyReportMessage,
    unsupportedMessage: unsupportedPolicyReportCopyMessage,
  });
}

async function copyLocalPersonalizationReview() {
  const emptyPersonalizationCopyMessage = '복사할 로컬 선호 설정 묶음이 없습니다.';
  const copiedPersonalizationMessage = () => '로컬 선호 설정 묶음을 복사했습니다.';
  const unsupportedPersonalizationCopyMessage = () =>
    '클립보드 미지원 환경입니다. 화면의 로컬 선호 설정 묶음을 직접 확인하세요.';

  await copyTextValue({
    value: getPortableUiPreferenceReviewText(state.uiPreferences),
    emptyErrorMessage: emptyPersonalizationCopyMessage,
    copiedMessage: copiedPersonalizationMessage,
    unsupportedMessage: unsupportedPersonalizationCopyMessage,
  });
}

async function summarizeHarnessExecutionPreview(actionButton) {
  const previewText = String(actionButton?.dataset.previewText || '').trim();
  const executionKey = String(actionButton?.dataset.executionKey || '').trim();
  const hiddenExecutionKey = String(actionButton?.dataset.hiddenExecutionKey || '').trim();
  const historyIndex = Number.parseInt(actionButton?.dataset.historyIndex || '', 10);
  const statusPayload = getHarnessConsumerStatus(getDerived());
  const currentExecution = getLatestHarnessExecution(
    getDerived(),
    statusPayload,
    state.lastHarnessExecutionResult,
  );
  const currentExecutionKey = getHarnessExecutionResultKey(currentExecution);
  const recentHarnessExecutions = getRecentHarnessExecutions(getDerived(), statusPayload);
  const historyExecution =
    Number.isInteger(historyIndex) && historyIndex >= 0
      ? recentHarnessExecutions[historyIndex] || null
      : null;
  const hiddenExecution =
    hiddenExecutionKey && currentExecutionKey === hiddenExecutionKey ? currentExecution : null;
  const targetExecutionKey =
    getHarnessExecutionResultKey(historyExecution) ||
    getHarnessExecutionResultKey(hiddenExecution) ||
    executionKey;

  if (!previewText || !targetExecutionKey) {
    throw new Error('요약할 하네스 실행 미리보기가 없습니다.');
  }

  state.error = null;
  state.mutating = true;
  const previewSummaryPendingMessage = '하네스 실행 미리보기를 요약하는 중…';
  const previewSummaryDoneMessage = '하네스 실행 미리보기 요약을 만들었습니다.';
  elements.refreshStatus.textContent = previewSummaryPendingMessage;
  render();

  try {
    const payload = await postJson('/api/harness/output-brief', {
      maxLines: 6,
      text: previewText,
    });

    state.lastHarnessOutputBriefResult = {
      executionKey: targetExecutionKey,
      outputBrief: payload.outputBrief || null,
    };
    if (historyExecution) {
      state.hiddenHarnessExecutionResultKey = null;
      state.lastHarnessExecutionResult = historyExecution;
    }
    if (hiddenExecution) {
      state.hiddenHarnessExecutionResultKey = null;
      state.lastHarnessExecutionResult = hiddenExecution;
    }
    render();
    elements.refreshStatus.textContent = previewSummaryDoneMessage;
  } finally {
    state.mutating = false;
    render();
  }
}

function hideHarnessExecutionResult(actionButton) {
  const executionKey = String(actionButton?.dataset.executionKey || '').trim();
  const statusPayload = getHarnessConsumerStatus(getDerived());
  const currentExecution = getLatestHarnessExecution(
    getDerived(),
    statusPayload,
    state.lastHarnessExecutionResult,
  );
  const currentExecutionKey = getHarnessExecutionResultKey(currentExecution);

  if (!executionKey || !currentExecution?.harnessId || currentExecutionKey !== executionKey) {
    throw new Error('숨길 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = executionKey;
  render();

  const currentExecutionTitle = getHarnessExecutionResultTitle(currentExecution);
  const hideHarnessExecutionMessage =
    `${currentExecutionTitle}를 숨겼습니다. 필요하면 실행 기록에서 다시 볼 수 있습니다.`;
  elements.refreshStatus.textContent = hideHarnessExecutionMessage;
}

function getHarnessExecutionDisplayStamp(execution) {
  const modeLabel = getHarnessExecutionModeLabel(execution);
  const harnessId = execution?.harnessId || '미확인';
  const executedAtLabel = getHarnessExecutionTimestampLabel(execution, '최근 실행');

  return `${modeLabel}: ${harnessId} · ${executedAtLabel}`;
}

function getHarnessPolicyReportDataValue(isPolicyReport) {
  return isPolicyReport ? 'true' : 'false';
}

function showHarnessExecutionResult(actionButton, statusPayload) {
  const executionKey = String(actionButton?.dataset.executionKey || '').trim();
  const currentExecution = getLatestHarnessExecution(
    getDerived(),
    statusPayload,
    state.lastHarnessExecutionResult,
  );
  const currentExecutionKey = getHarnessExecutionResultKey(currentExecution);

  if (!executionKey || !currentExecution?.harnessId || currentExecutionKey !== executionKey) {
    throw new Error('다시 표시할 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = currentExecution;
  render();

  const currentExecutionDisplayStamp = getHarnessExecutionDisplayStamp(currentExecution);
  const showHarnessExecutionMessage =
    `숨긴 하네스 실행을 다시 표시했습니다: ${currentExecutionDisplayStamp}`;
  elements.refreshStatus.textContent = showHarnessExecutionMessage;
}

function restoreHarnessExecutionPreview(actionButton, statusPayload) {
  const historyIndex = Number.parseInt(actionButton?.dataset.historyIndex || '', 10);
  const recentHarnessExecutions = getRecentHarnessExecutions(getDerived(), statusPayload);
  const targetExecution =
    Number.isInteger(historyIndex) && historyIndex >= 0
      ? recentHarnessExecutions[historyIndex] || null
      : null;

  if (!targetExecution?.harnessId) {
    throw new Error('다시 볼 하네스 실행 결과를 찾지 못했습니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = targetExecution;
  render();

  const targetExecutionDisplayStamp = getHarnessExecutionDisplayStamp(targetExecution);
  const restoreHarnessExecutionMessage =
    `하네스 실행 기록을 다시 표시했습니다: ${targetExecutionDisplayStamp}`;
  elements.refreshStatus.textContent = restoreHarnessExecutionMessage;
}

function getHarnessExecutionOutputCopy(execution) {
  if (execution?.resolvedOutputPath) {
    return `출력: ${execution.resolvedOutputPath}`;
  }

  if (execution?.stdoutPreview) {
    return '표준 출력 미리보기를 반환했습니다.';
  }

  return '출력 파일 없이 완료됐습니다.';
}

function getHarnessExecutionCompletionCopy({ execution, fallbackHarnessId }) {
  const executionHarnessId = execution?.harnessId || fallbackHarnessId;
  const executionRequestId = getHarnessExecutionRequestId(execution);
  const executionRequestCopy = executionRequestId ? `요청: ${executionRequestId}. ` : '';
  const executionOutputCopy = getHarnessExecutionOutputCopy(execution);
  const executionCompletionLead = getHarnessExecutionCompletionLead(
    execution,
    executionHarnessId,
  );
  const executionCompletionOutputCopy = getHarnessExecutionCompletionOutputCopy(
    execution,
    executionOutputCopy,
  );

  return `${executionCompletionLead} ${executionRequestCopy}${executionCompletionOutputCopy}`;
}

async function executeHarnessOperatorAction({
  inputPath,
  outputPath,
  statusPayload,
  pendingMessage,
  policyReport = false,
}) {
  const operatorAction = statusPayload?.operatorAction || null;
  const statusCard = statusPayload?.statusCard || null;
  const primaryHarnessId = statusCard?.primaryHarnessId || '';
  const operatorActionKind = operatorAction?.kind || '';
  const canRunHarnessOperatorAction =
    primaryHarnessId && operatorActionKind === 'repo-native-run';

  if (!canRunHarnessOperatorAction) {
    throw new Error('현재 실행 가능한 대표 하네스 operator action이 없습니다.');
  }

  if (!inputPath) {
    throw new Error('입력 파일 경로가 필요합니다.');
  }

  state.error = null;
  state.hiddenHarnessExecutionResultKey = null;
  state.lastHarnessExecutionResult = null;
  state.harnessExecutionDraftInputPath = inputPath;
  state.harnessExecutionDraftOutputPath = outputPath;
  state.mutating = true;
  const defaultExecutionPendingMessage =
    `하네스 ${primaryHarnessId} 실행을 시작하는 중…`;
  const executionPendingMessage = pendingMessage || defaultExecutionPendingMessage;
  elements.refreshStatus.textContent = executionPendingMessage;
  render();

  try {
    const payload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
      policyReport,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.hiddenHarnessExecutionResultKey = null;
    state.lastHarnessExecutionResult = payload.harnessExecution || null;
    render();

    const execution = payload.harnessExecution || {};
    const executionCompletionCopy = getHarnessExecutionCompletionCopy({
      execution,
      fallbackHarnessId: primaryHarnessId,
    });

    elements.refreshStatus.textContent = executionCompletionCopy;
  } finally {
    state.mutating = false;
    render();
  }
}

async function previewHarnessPolicyReport(actionButton) {
  const form = actionButton?.closest?.('[data-form="run-harness-operator-action"]');
  const statusPayload = getHarnessConsumerStatus(getDerived());

  if (!form) {
    throw new Error('정책 리포트를 확인할 실행 폼을 찾지 못했습니다.');
  }

  const formData = new FormData(form);
  const inputPath = String(formData.get('inputPath') || '').trim();
  const outputPath = String(formData.get('outputPath') || '').trim();
  const policyReportPendingMessage = '하네스 정책 리포트를 확인하는 중…';

  await executeHarnessOperatorAction({
    inputPath,
    outputPath,
    statusPayload,
    policyReport: true,
    pendingMessage: policyReportPendingMessage,
  });
}

async function runHarnessOperatorAction(form) {
  const data = getDerived();
  const harnessConsumerStatus = getHarnessConsumerStatus(data);
  const formData = new FormData(form);
  const inputPath = String(formData.get('inputPath') || '').trim();
  const outputPath = String(formData.get('outputPath') || '').trim();

  await executeHarnessOperatorAction({
    inputPath,
    outputPath,
    statusPayload: harnessConsumerStatus,
  });
}

async function clearHarnessExecutionHistory(statusPayload) {
  const statusCard = statusPayload?.statusCard || null;

  if (!statusCard?.primaryHarnessId) {
    throw new Error('현재 비울 실행 기록이 없습니다.');
  }

  state.error = null;
  state.mutating = true;
  const clearHistoryPendingMessage = `하네스 ${statusCard.primaryHarnessId}의 실행 기록을 비우는 중…`;
  const clearHistoryDoneMessage = `하네스 ${statusCard.primaryHarnessId}의 실행 기록을 비웠습니다.`;
  elements.refreshStatus.textContent = clearHistoryPendingMessage;
  render();

  try {
    const payload = await postJson('/api/harness/operator-action/clear-history', {
      harnessId: statusCard.primaryHarnessId,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.hiddenHarnessExecutionResultKey = null;
    state.lastHarnessExecutionResult = null;
    render();
    elements.refreshStatus.textContent = clearHistoryDoneMessage;
  } finally {
    state.mutating = false;
    render();
  }
}

function reuseHarnessExecutionPaths(actionButton) {
  const inputPath = String(actionButton?.dataset.inputPath || '').trim();
  const outputPath = String(actionButton?.dataset.outputPath || '').trim();

  if (!inputPath) {
    throw new Error('재사용할 입력 경로가 없습니다.');
  }

  state.harnessExecutionDraftInputPath = inputPath;
  state.harnessExecutionDraftOutputPath = outputPath;
  const reusePathsMessage = `최근 실행 경로를 폼에 다시 채웠습니다: ${inputPath}`;
  elements.refreshStatus.textContent = reusePathsMessage;
  render();
}

async function rerunHarnessExecutionPaths(actionButton) {
  const inputPath = String(actionButton?.dataset.inputPath || '').trim();
  const outputPath = String(actionButton?.dataset.outputPath || '').trim();
  const policyReport = actionButton?.dataset.policyReport === 'true';
  const statusPayload = getHarnessConsumerStatus(getDerived());
  const statusCard = statusPayload?.statusCard || null;
  const rerunHarnessSubjectCopy = statusCard?.primaryHarnessId
    ? `하네스 ${statusCard.primaryHarnessId}`
    : '미확인 하네스';
  const rerunHarnessModeCopy = getHarnessExecutionRerunPendingModeLabel(policyReport);
  const rerunHarnessPendingMessage =
    `${rerunHarnessSubjectCopy}의 최근 실행 경로를 ${rerunHarnessModeCopy}하는 중…`;

  if (!inputPath) {
    throw new Error('재실행할 입력 경로가 없습니다.');
  }

  await executeHarnessOperatorAction({
    inputPath,
    outputPath,
    statusPayload,
    policyReport,
    pendingMessage: rerunHarnessPendingMessage,
  });
}

function renderError(error) {
  const message = escapeHtml(error?.message || '알 수 없는 오류');

  for (const surface of Object.values(elements.surfaces)) {
    surface.innerHTML = `
      <div class="empty-state">
        <strong>런타임 사용 불가</strong>
        <p>${message}</p>
      </div>
    `;
  }
}

function render() {
  const data = getDerived();

  renderNav(data);
  renderControlOverview(data);

  for (const surfaceId of SURFACE_IDS) {
    const isActive = surfaceId === state.surface;
    const surface = elements.surfaces[surfaceId];

    surface.classList.toggle('is-active', isActive);
    surface.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    surface.setAttribute('tabindex', isActive ? '0' : '-1');
  }

  if (state.error) {
    renderError(state.error);
    return;
  }

  renderMission(data);
  renderCouncil(data);
  renderExecution(data);
  renderDeliverables(data);
  renderTaskboard(data);
  renderLogs(data);
  renderArtifacts(data);
  renderDecisionInbox(data);
}

document.addEventListener('click', async (event) => {
  const navButton = event.target.closest('.nav-button[data-surface]');
  const navGroupButton = event.target.closest('[data-nav-group-tab]');
  const actionButton = event.target.closest('[data-action]');

  if (navGroupButton) {
    await handleNavGroupChange(navGroupButton.dataset.navGroupTab);
    return;
  }

  if (navButton) {
    await handleSurfaceChange(navButton.dataset.surface);
    return;
  }

  if (actionButton?.dataset.action === 'open-surface') {
    await handleSurfaceChange(actionButton.dataset.targetSurface || state.surface);
    return;
  }

  if (actionButton?.dataset.action === 'open-surface-for-mission') {
    if (actionButton.dataset.id) {
      syncSelectionsFromMission(actionButton.dataset.id);
    }

    await handleSurfaceChange(actionButton.dataset.targetSurface || 'mission');
    return;
  }

  if (actionButton?.dataset.action === 'open-company-seat') {
    const targetSurface = actionButton.dataset.targetSurface || 'mission';
    state.menuGroup = getNavGroupForSurface(targetSurface);
    state.surface = targetSurface;
    rememberSurfaceVisit(targetSurface);
    render();
    return;
  }

  if (actionButton?.dataset.action === 'set-mission-view') {
    await setMissionViewMode(actionButton.dataset.viewMode);
    return;
  }

  if (actionButton?.dataset.action === 'select-mission-graph-node') {
    selectMissionGraphNode(actionButton.dataset.nodeId);
    return;
  }

  if (actionButton?.dataset.action === 'clear-mission-graph-explorer') {
    resetMissionGraphExplorer();
    render();
    restoreMissionGraphFocus({ controlName: 'missionGraphQuery' });
    return;
  }

  if (actionButton?.dataset.action === 'set-evidence-density') {
    const density = EVIDENCE_DENSITY_OPTIONS.includes(actionButton.dataset.density)
      ? actionButton.dataset.density
      : DEFAULT_UI_PREFERENCES.evidenceDensity;

    state.uiPreferences = {
      ...normalizeUiPreferences(state.uiPreferences),
      evidenceDensity: density,
    };
    persistUiPreferences();
    render();
    return;
  }

  if (actionButton?.dataset.action === 'set-preferred-project-local') {
    setPreferredProjectPreference(actionButton.dataset.projectId);
    render();
    return;
  }

  if (actionButton?.dataset.action === 'reset-local-personalization') {
    resetUiPreferences();
    document.body.dataset.evidenceDensity = state.uiPreferences.evidenceDensity;
    render();
    return;
  }

  if (actionButton?.dataset.action === 'copy-local-personalization-review') {
    await copyLocalPersonalizationReview();
    return;
  }

  if (actionButton?.dataset.action === 'set-ops-editor-group') {
    const targetGroup = actionButton.dataset.targetGroup;
    const normalizedTarget =
      targetGroup === 'all' || Object.prototype.hasOwnProperty.call(NAV_GROUPS, targetGroup)
        ? targetGroup
        : 'all';
    state.opsEditorGroup = normalizedTarget;

    if (normalizedTarget !== 'all') {
      const defaults = OPS_EDITOR_GROUP_DEFAULTS[normalizedTarget] || OPS_EDITOR_GROUP_DEFAULTS.workflows;
      state.companyMemberDraftRole = defaults.role;
      state.companyMemberDraftSurface = defaults.surface;
    }

    render();
    return;
  }

  if (actionButton) {
    try {
      if (actionButton.dataset.action === 'run-planner') {
        await runPlanner(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-architect') {
        await runArchitect(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-task-breaker') {
        await runTaskBreaker(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-preflight') {
        await runBuilderPreflight(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'request-builder-live-mutation-approval') {
        await requestBuilderLiveMutationApproval(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-live-mutation') {
        await runBuilderLiveMutation(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'continue-reviewed-delivery') {
        await submitReviewedDeliveryContinuation(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'persist-delivery-package') {
        await persistDeliveryPackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'accept-delivery-package') {
        await acceptDeliveryPackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'close-out-ai-company-mission') {
        await closeOutAiCompanyMission(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'preview-learning-candidate') {
        await previewMissionLearningCandidate(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'persist-learning-candidate') {
        await persistMissionLearningCandidate(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'review-learning-candidate') {
        await reviewLearningCandidate(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'preview-memory-candidate') {
        await previewLearningCandidateMemory(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'persist-memory-item') {
        await persistLearningCandidateMemoryItem(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'preview-memory-recall') {
        await previewMemoryItemRecall(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'persist-memory-recall') {
        await persistMemoryItemRecall(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'preview-mission-memory-context') {
        await previewMissionMemoryContext(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'preview-workorder-verification-plan') {
        await previewWorkOrderVerificationPlan(
          actionButton.dataset.planId,
          actionButton.dataset.id,
        );
        return;
      }

      if (actionButton.dataset.action === 'persist-workorder-acceptance-criteria') {
        await persistWorkOrderAcceptanceCriteria(
          actionButton.dataset.planId,
          actionButton.dataset.id,
        );
        return;
      }

      if (
        actionButton.dataset.action === 'record-workorder-verification-proof' ||
        actionButton.dataset.action === 'run-workorder-node-check-proof'
      ) {
        await submitWorkOrderVerificationProof(
          actionButton.dataset.planId,
          actionButton.dataset.workOrderId,
          actionButton.dataset.id,
          actionButton.dataset.action === 'run-workorder-node-check-proof',
        );
        return;
      }

      if (actionButton.dataset.action === 'resume-workflow-checkpoint') {
        await submitWorkflowCheckpointAction(
          actionButton.dataset.id,
          actionButton.dataset.checkpointAction,
        );
        return;
      }

      if (actionButton.dataset.action === 'preview-execution-continuation') {
        await previewExecutionPlanContinuation(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'cancel-workflow-checkpoint') {
        await submitWorkflowCheckpointAction(actionButton.dataset.id, 'cancel');
        return;
      }

      if (actionButton.dataset.action === 'set-task-worktree-ref') {
        await applySelectedTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'clear-task-worktree-ref') {
        await clearTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'switch-active-project-worktree') {
        await switchActiveProjectWorktree(actionButton.dataset.path);
        return;
      }

      if (actionButton.dataset.action === 'run-reviewer') {
        await runReviewer(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-commit-package') {
        await runCommitPackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-local-commit') {
        await runLocalCommit(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-release-package') {
        await runReleasePackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-close-out') {
        await runCloseOut(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-inbox-action') {
        await runInboxAction(actionButton.dataset.id, actionButton.dataset.verb);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-command') {
        await copyHarnessCommand(actionButton.dataset.command);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-output-path') {
        await copyHarnessExecutionOutputPath(
          actionButton.dataset.outputPath,
          actionButton.dataset.outputPathLabel,
        );
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-input-path') {
        await copyHarnessExecutionInputPath(actionButton.dataset.inputPath);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-request-id') {
        await copyHarnessExecutionRequestId(actionButton.dataset.requestId);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-execution-preview') {
        await copyHarnessExecutionPreview(actionButton.dataset.previewText);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-execution-packet') {
        await copyHarnessExecutionPacket(actionButton.dataset.executionPacketText);
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-output-brief') {
        await copyHarnessOutputBrief(
          actionButton.dataset.outputBriefText,
          actionButton.dataset.outputBriefLabel,
        );
        return;
      }

      if (actionButton.dataset.action === 'copy-harness-policy-report') {
        await copyHarnessPolicyReport(actionButton.dataset.policyReportText);
        return;
      }

      if (actionButton.dataset.action === 'summarize-harness-execution-preview') {
        await summarizeHarnessExecutionPreview(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'hide-harness-execution-result') {
        hideHarnessExecutionResult(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'show-harness-execution-result') {
        showHarnessExecutionResult(actionButton, getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'restore-harness-execution-preview') {
        restoreHarnessExecutionPreview(actionButton, getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'clear-harness-execution-history') {
        await clearHarnessExecutionHistory(getHarnessConsumerStatus(getDerived()));
        return;
      }

      if (actionButton.dataset.action === 'reuse-harness-execution-paths') {
        reuseHarnessExecutionPaths(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'rerun-harness-execution-paths') {
        await rerunHarnessExecutionPaths(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'preview-harness-policy-report') {
        await previewHarnessPolicyReport(actionButton);
        return;
      }

      if (actionButton.dataset.action === 'remove-company-member') {
        removeCompanyMember(actionButton.dataset.id);
        return;
      }

      await handleSelection(actionButton.dataset.action, actionButton.dataset.id);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '작업 처리에 실패했습니다.';
      render();
    }
  }
});

function handleFormInput(event) {
  const missionGraphExplorerForm = event.target.closest(
    '[data-form="mission-graph-explorer"]',
  );
  const runHarnessOperatorActionForm = event.target.closest(
    '[data-form="run-harness-operator-action"]',
  );
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');
  const createCompanyMemberForm = event.target.closest('[data-form="create-company-member"]');
  const learningCandidateForm = event.target.closest(
    '[data-form="preview-learning-candidate"]',
  );
  const learningCandidateReviewForm = event.target.closest(
    '[data-form="review-learning-candidate"]',
  );
  const memoryCandidateForm = event.target.closest(
    '[data-form="preview-memory-candidate"]',
  );
  const memoryRecallForm = event.target.closest(
    '[data-form="preview-memory-recall"]',
  );
  const memoryRecallRecordForm = event.target.closest(
    '[data-form="persist-memory-recall"]',
  );
  const missionMemoryContextForm = event.target.closest(
    '[data-form="preview-mission-memory-context"]',
  );
  const acceptanceCriteriaForm = event.target.closest(
    '[data-form="persist-workorder-acceptance-criteria"]',
  );
  const verificationProofForm = event.target.closest(
    '[data-form="workorder-verification-proof"]',
  );

  if (missionGraphExplorerForm) {
    if (event.target.name === 'missionGraphQuery') {
      state.missionGraphQuery = event.target.value.slice(0, 120);
    }
    if (event.target.name === 'missionGraphStage') {
      state.missionGraphStage = event.target.value;
    }
    if (event.target.name === 'missionGraphStatusTone') {
      state.missionGraphStatusTone = event.target.value;
    }

    if (event.type === 'change' && event.target.name !== 'missionGraphQuery') {
      reconcileMissionGraphSelection();
      render();
      restoreMissionGraphFocus({ controlName: event.target.name });
    }
    return;
  }

  if (acceptanceCriteriaForm) {
    if (event.target.name === 'acceptanceCriteriaRationale') {
      state.workOrderAcceptanceCriteriaRationale = event.target.value;
    }
    return;
  }

  if (verificationProofForm) {
    const criterionId = verificationProofForm.dataset.criterionId;
    const draft = getWorkOrderProofDraft(criterionId);
    state.workOrderProofDrafts[criterionId] = {
      rationale:
        event.target.name === 'proofRationale' ? event.target.value : draft.rationale,
      status: event.target.name === 'proofStatus' ? event.target.value : draft.status,
    };
    return;
  }

  if (runHarnessOperatorActionForm) {
    if (event.target.name === 'inputPath') {
      state.harnessExecutionDraftInputPath = event.target.value;
    }

    if (event.target.name === 'outputPath') {
      state.harnessExecutionDraftOutputPath = event.target.value;
    }

    return;
  }

  if (learningCandidateReviewForm) {
    readLearningCandidateReviewDraft(learningCandidateReviewForm);
    return;
  }

  if (memoryCandidateForm) {
    if (Object.prototype.hasOwnProperty.call(state.missionMemoryCandidateDraft, event.target.name)) {
      state.missionMemoryCandidateDraft[event.target.name] = event.target.value;
      state.missionMemoryCandidatePreview = null;
      state.missionMemoryRecallPreview = null;
      state.missionMemoryContextPreview = null;
      event.target
        .closest('.memory-candidate-panel')
        ?.querySelector('.memory-candidate-result')
        ?.remove();
    }
    return;
  }

  if (missionMemoryContextForm) {
    if (
      Object.prototype.hasOwnProperty.call(
        state.missionMemoryContextDraft,
        event.target.name,
      )
    ) {
      state.missionMemoryContextDraft[event.target.name] = event.target.value;
      state.missionMemoryContextPreview = null;
      event.target
        .closest('.mission-memory-context-panel')
        ?.querySelector('.mission-memory-context-result')
        ?.remove();
    }
    return;
  }

  if (memoryRecallForm) {
    if (Object.prototype.hasOwnProperty.call(state.missionMemoryRecallDraft, event.target.name)) {
      state.missionMemoryRecallDraft[event.target.name] = event.target.value;
      state.missionMemoryRecallPreview = null;
      state.missionMemoryContextPreview = null;
      event.target
        .closest('.memory-recall-panel')
        ?.querySelector('.memory-recall-result')
        ?.remove();
    }
    return;
  }

  if (memoryRecallRecordForm) {
    if (
      Object.prototype.hasOwnProperty.call(
        state.missionMemoryRecallRecordDraft,
        event.target.name,
      )
    ) {
      state.missionMemoryRecallRecordDraft[event.target.name] = event.target.value;
    }
    return;
  }

  if (learningCandidateForm) {
    if (Object.prototype.hasOwnProperty.call(state.missionLearningCandidateDraft, event.target.name)) {
      state.missionLearningCandidateDraft[event.target.name] = event.target.value;
      state.missionLearningCandidatePreview = null;
      event.target
        .closest('.learning-candidate-panel')
        ?.querySelector('.learning-candidate-result')
        ?.remove();
    }
    return;
  }

  if (createLinkedWorktreeForm) {
    if (event.target.name === 'linkedWorktreeSlug') {
      state.linkedWorktreeDraftSlug = event.target.value;
    }

    return;
  }

  if (createProjectForm || createMissionProjectForm) {
    if (event.target.name === 'projectName') {
      state.projectDraftName = event.target.value;
    }

    if (event.target.name === 'projectPath') {
      state.projectDraftPath = event.target.value;
    }

    if (event.target.name === 'projectPack') {
      state.projectDraftPack =
        event.target.value === 'knowledge-work' ? 'knowledge-work' : 'development';
    }

    if (event.target.name === 'projectProviderMode') {
      state.projectDraftProviderMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'projectProviderModel') {
      state.projectDraftProviderModel = event.target.value;
    }

    if (event.target.name === 'projectProviderApiKeyVar') {
      state.projectDraftProviderApiKeyVar = event.target.value;
    }

    return;
  }

  if (updateProjectProviderForm) {
    if (event.target.name === 'editProjectProviderMode') {
      state.projectProviderDraftMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'editProjectProviderModel') {
      state.projectProviderDraftModel = event.target.value;
    }

    if (event.target.name === 'editProjectProviderApiKeyVar') {
      state.projectProviderDraftApiKeyVar = event.target.value;
    }

    return;
  }

  if (createMissionForm) {
    if (event.target.name === 'missionTitle') {
      state.missionDraftTitle = event.target.value;
    }

    if (event.target.name === 'missionGoal') {
      state.missionDraftGoal = event.target.value;
    }

    if (event.target.name === 'missionConstraints') {
      state.missionDraftConstraints = event.target.value;
    }

    if (event.target.name === 'missionDeliverableType') {
      state.missionDraftDeliverableType =
        event.target.value in KNOWLEDGE_WORK_DELIVERABLES
          ? event.target.value
          : 'decision-memo';
    }

    return;
  }

  if (createCompanyMemberForm) {
    if (event.target.name === 'companyMemberName') {
      state.companyMemberDraftName = event.target.value;
    }

    if (event.target.name === 'companyMemberRole') {
      state.companyMemberDraftRole = hasCompanyRole(event.target.value) ? event.target.value : 'builder';
    }

    if (event.target.name === 'companyMemberSurface') {
      state.companyMemberDraftSurface = hasCompanyDesk(event.target.value) ? event.target.value : 'execution';
    }

    return;
  }

  if (!createTaskForm) {
    return;
  }

  if (event.target.name === 'title') {
    state.taskDraftTitle = event.target.value;
  }

  if (event.target.name === 'intent') {
    state.taskDraftIntent = event.target.value;
  }
}

document.addEventListener('input', handleFormInput);
document.addEventListener('change', handleFormInput);

document.addEventListener('keydown', async (event) => {
  const graphNode = event.target.closest?.('[data-action="select-mission-graph-node"]');
  if (
    graphNode &&
    graphNode.tagName.toLowerCase() !== 'button' &&
    (event.key === 'Enter' || event.key === ' ')
  ) {
    event.preventDefault();
    selectMissionGraphNode(graphNode.dataset.nodeId);
    return;
  }

  await handleNavGroupTabKeydown(event);
});

document.addEventListener('submit', async (event) => {
  const missionGraphExplorerForm = event.target.closest(
    '[data-form="mission-graph-explorer"]',
  );
  const runHarnessOperatorActionForm = event.target.closest(
    '[data-form="run-harness-operator-action"]',
  );
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');
  const createCompanyMemberForm = event.target.closest('[data-form="create-company-member"]');
  const updateCompanyMemberForm = event.target.closest('[data-form="update-company-member"]');

  if (missionGraphExplorerForm) {
    event.preventDefault();
    reconcileMissionGraphSelection();
    render();
    restoreMissionGraphFocus({ controlName: 'missionGraphQuery' });
    return;
  }

  if (runHarnessOperatorActionForm) {
    event.preventDefault();

    try {
      await runHarnessOperatorAction(runHarnessOperatorActionForm);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '하네스 실행에 실패했습니다.';
      render();
    }
    return;
  }

  if (createLinkedWorktreeForm) {
    event.preventDefault();

    try {
      await submitCreateLinkedWorktree();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '연결 워크트리 생성에 실패했습니다.';
      render();
    }
    return;
  }

  if (createProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '프로젝트 등록에 실패했습니다.';
      render();
    }
    return;
  }

  if (createMissionProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject({
        forceLocalStub: true,
        successSurface: 'mission',
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '미션용 프로젝트 등록에 실패했습니다.';
      render();
    }
    return;
  }

  if (updateProjectProviderForm) {
    event.preventDefault();

    try {
      await submitUpdateProjectProvider();
    } catch (error) {
      elements.refreshStatus.textContent =
        error.message || '프로젝트 프로바이더 설정 갱신에 실패했습니다.';
      render();
    }
    return;
  }

  if (createMissionForm) {
    event.preventDefault();

    try {
      await submitCreateMission({
        councilMode: event.submitter?.value || 'legacy-deterministic',
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '미션 생성에 실패했습니다.';
      render();
    }
    return;
  }

  if (createCompanyMemberForm) {
    event.preventDefault();

    try {
      addCompanyMember();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'AI 에이전트 추가에 실패했습니다.';
      render();
    }
    return;
  }

  if (updateCompanyMemberForm) {
    event.preventDefault();

    try {
      const formData = new FormData(updateCompanyMemberForm);
      updateCompanyMember(updateCompanyMemberForm.dataset.id, {
        name: String(formData.get('companyMemberEditName') || ''),
        role: String(formData.get('companyMemberEditRole') || ''),
        surface: String(formData.get('companyMemberEditSurface') || ''),
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || '회사 인력 배정 저장에 실패했습니다.';
      render();
    }
    return;
  }

  if (!createTaskForm) {
    return;
  }

  event.preventDefault();

  try {
    await submitCreateTask();
  } catch (error) {
    elements.refreshStatus.textContent = error.message || '태스크 생성에 실패했습니다.';
    render();
  }
});

elements.refreshButton.addEventListener('click', async () => {
  await refreshData();
});

function registerQaHooks() {
  if (typeof window === 'undefined') {
    return;
  }

  const getQaState = () => ({
    loading: state.loading,
    menuGroup: state.menuGroup,
    mutating: state.mutating,
    selectedInboxItemId: state.selectedInboxItemId,
    selectedTaskId: state.selectedTaskId,
    surface: state.surface,
  });
  const waitForQaIdle = async (timeoutMs = 30_000) => {
    const startedAt = Date.now();

    while (state.loading || state.mutating) {
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error('QA hook idle timeout');
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 100);
      });
    }
  };

  window.__orchestrationQa = {
    getState() {
      return getQaState();
    },
    async refresh() {
      await waitForQaIdle();
      await refreshData();
      await waitForQaIdle();
      return getQaState();
    },
    openSurface(surface, options = {}) {
      if (!SURFACE_IDS.includes(surface)) {
        return false;
      }

      state.menuGroup = getNavGroupForSurface(surface);
      state.surface = surface;
      if (
        surface === 'taskboard' &&
        options &&
        typeof options === 'object' &&
        typeof options.taskId === 'string' &&
        options.taskId
      ) {
        syncSelectionsFromTask(options.taskId);
      }
      render();
      return true;
    },
  };
}

async function bootstrap() {
  render();
  await refreshData();
  state.timerId = window.setInterval(refreshData, 5000);
}

registerQaHooks();
void bootstrap();
