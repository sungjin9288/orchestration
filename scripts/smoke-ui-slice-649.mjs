import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const growthConfigPath = path.join(repoRoot, 'ui', 'growth-config.js');
const growthLearningPath = path.join(repoRoot, 'ui', 'growth-learning.js');
const personalizationSnapshotPath = path.join(repoRoot, 'ui', 'personalization-snapshot.js');
const preferenceConfigPath = path.join(repoRoot, 'ui', 'preference-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'vnext-reference-driven-ui-audit.md');
const decisionLogPath = path.join(repoRoot, 'docs', '01_decision-log.md');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const growthConfig = fs.readFileSync(growthConfigPath, 'utf8');
const growthLearning = fs.readFileSync(growthLearningPath, 'utf8');
const personalizationSnapshot = fs.readFileSync(personalizationSnapshotPath, 'utf8');
const preferenceConfig = fs.readFileSync(preferenceConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');
const decisionLog = fs.readFileSync(decisionLogPath, 'utf8');
const uiQaStatus = fs.readFileSync(uiQaStatusPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(audit, /Linear/);
assert.match(audit, /LangSmith Studio/);
assert.match(audit, /Retool/);
assert.match(audit, /Dify/);
assert.match(audit, /n8n HITL/);
assert.match(audit, /Zapier/);
assert.match(audit, /NN\/g 2026 UX/);
assert.match(audit, /provider calls/);
assert.match(audit, /memory persistence/);
assert.match(audit, /long-term memory store/);
assert.match(audit, /raw transcript ingestion/);
assert.match(audit, /cross-workspace memory/);
assert.match(audit, /skill promotion/);
assert.match(audit, /UI-side durable proposal record creation or proposal application/);
assert.match(audit, /source mutation/);
assert.match(decisionLog, /### DEC-048/);
assert.match(decisionLog, /review-readiness surface only/);
assert.match(decisionLog, /does not create or persist durable proposal records/);
assert.match(decisionLog, /redaction, export, and expiry rules/);
assert.match(decisionLog, /### DEC-049/);
assert.match(decisionLog, /long-term memory surface is a readiness gate only/);
assert.match(decisionLog, /must not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills/);
assert.match(decisionLog, /workspace\/applicability rules, redaction policy, export format, expiry\/deletion policy/);

assert.match(appJs, /from '\.\/preference-config\.js'/);
assert.match(appJs, /from '\.\/personalization-snapshot\.js'/);
assert.match(preferenceConfig, /export const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(personalizationSnapshot, /export function getPersonalizationSnapshot\(\{/);
assert.match(personalizationSnapshot, /pendingGateCount > 0 \? 'decision-inbox'/);
assert.match(personalizationSnapshot, /surfaceLocationGuidance\[currentSurface\]\?\.targetSurface \|\| 'mission'/);
assert.match(appJs, /from '\.\/growth-config\.js'/);
assert.match(appJs, /from '\.\/growth-learning\.js'/);
assert.match(growthConfig, /export const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/);
assert.match(growthConfig, /providerCallsAllowed: false/);
assert.match(growthConfig, /memoryPersistenceAllowed: false/);
assert.match(growthConfig, /longTermMemoryStoreAllowed: false/);
assert.match(growthConfig, /rawTranscriptIngestionAllowed: false/);
assert.match(growthConfig, /crossWorkspaceMemoryAllowed: false/);
assert.match(growthConfig, /skillPromotionAllowed: false/);
assert.match(growthConfig, /proposalRecordCreationAllowed: false/);
assert.match(growthConfig, /proposalRecordPersistenceAllowed: false/);
assert.match(growthConfig, /sourceMutationAllowed: false/);
assert.match(growthConfig, /commitPushAllowed: false/);
assert.match(growthConfig, /export const PROPOSAL_RECORD_OPEN_REQUIREMENTS = Object\.freeze\(\[/);
assert.match(growthConfig, /생성은 승인된 implementation slice 함수로만 가능합니다/);
assert.match(appJs, /function renderDurableProposalRecordLedger\(growth\)/);
assert.match(appJs, /data-durable-proposal-record-ledger="read-only"/);
assert.match(appJs, /승인된 생성 함수가 기록을 만들면 이 영역에 읽기 전용으로 표시됩니다/);
assert.match(growthConfig, /이 검토 게이트는 제안 승인과 분리됩니다/);
assert.match(growthConfig, /장기 기억 전에 redaction, export, expiry 규칙이 필요합니다/);
assert.match(growthConfig, /export const MEMORY_STORE_OPEN_REQUIREMENTS = Object\.freeze\(\[/);
assert.match(growthConfig, /원문 transcript 수집은 금지 상태로 둡니다/);
assert.match(growthConfig, /민감정보 제거, 내보내기, 만료 규칙이 먼저 있어야 합니다/);
assert.match(growthConfig, /스킬 승격은 별도 리뷰와 검증 명령이 필요합니다/);
assert.match(growthLearning, /const GROWTH_CANDIDATE_BLOCKED_ACTIONS = Object\.freeze\(\[/);
assert.match(growthLearning, /export function getGrowthEvidenceCandidates/);
assert.match(growthLearning, /export function getGrowthFailurePatternGroups\(\{ failedRuns, reviewArtifacts, blockedTasks \}\)/);
assert.match(growthLearning, /export function getGrowthRegressionComparison\(\{ failedRuns, completedRuns \}\)/);
assert.match(growthLearning, /export function getGrowthRollbackEvidenceLinks/);
assert.match(growthLearning, /export function getGrowthLearningSnapshot\(data, context, formatters = \{\}\) \{/);
assert.match(appJs, /function renderIntelligenceOverview\(data, context\)/);
assert.match(appJs, /data-growth-learning-surface="read-only"/);
assert.match(appJs, /data-personalization-scope="local-only"/);
assert.match(appJs, /성장 증거 원장/);
assert.match(appJs, /개선 후보 대기열/);
assert.match(appJs, /로컬 저장만/);
assert.match(appJs, /function renderGrowthCandidateDrilldown\(growth\)/);
assert.match(appJs, /data-growth-candidate-drilldown="true"/);
assert.match(appJs, /function renderGrowthDashboardEvidenceDepth\(growth\)/);
assert.match(appJs, /data-growth-dashboard-evidence-depth="read-only"/);
assert.match(appJs, /data-failure-pattern-groups="true"/);
assert.match(appJs, /data-regression-comparison="read-only"/);
assert.match(appJs, /data-rollback-evidence-links="true"/);
assert.match(appJs, /data-growth-dashboard-action-allowed="false"/);
assert.match(appJs, /실패 묶음, 회귀 비교, 되돌림 근거를 함께 봅니다/);
assert.match(appJs, /묶인 실패 패턴/);
assert.match(appJs, /회귀 비교/);
assert.match(appJs, /되돌림 근거 링크/);
assert.match(appJs, /function renderGrowthProposalReviewPreview\(growth\)/);
assert.match(appJs, /data-growth-proposal-review="blocked"/);
assert.match(appJs, /data-proposal-generation-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalGenerationAllowed\}"/);
assert.match(appJs, /data-proposal-application-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalApplicationAllowed\}"/);
assert.match(appJs, /data-proposal-record-creation-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordCreationAllowed\}"/);
assert.match(appJs, /data-proposal-record-persistence-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordPersistenceAllowed\}"/);
assert.match(appJs, /data-long-term-memory-store-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.longTermMemoryStoreAllowed\}"/);
assert.match(appJs, /data-memory-readiness-gate="blocked"/);
assert.match(appJs, /data-raw-transcript-ingestion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.rawTranscriptIngestionAllowed\}"/);
assert.match(appJs, /data-cross-workspace-memory-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.crossWorkspaceMemoryAllowed\}"/);
assert.match(appJs, /data-skill-promotion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.skillPromotionAllowed\}"/);
assert.match(appJs, /리뷰 질문/);
assert.match(appJs, /제안 검토 게이트/);
assert.match(appJs, /승인 전 적용 차단/);
assert.match(appJs, /장기 기억:false/);
assert.match(appJs, /장기 기억 저장:false/);
assert.match(appJs, /원문 수집:false/);
assert.match(appJs, /스킬 승격:false/);
assert.match(appJs, /제안 기록:false/);
assert.match(appJs, /function renderPersonalizationSettings\(personalization, data\)/);
assert.match(appJs, /data-local-personalization-settings="true"/);
assert.match(preferenceConfig, /export const UI_PREFERENCE_PACKET_SCHEMA = 'orchestration\.ui-preferences\.portable-review\.v1'/);
assert.match(preferenceConfig, /export function getPortableUiPreferenceReview\(preferences = DEFAULT_UI_PREFERENCES\) \{/);
assert.match(preferenceConfig, /runtimeMutationAllowed: false/);
assert.match(appJs, /getPortableUiPreferenceReviewText\(state\.uiPreferences\)/);
assert.match(appJs, /data-local-personalization-portability="copy-review-only"/);
assert.match(appJs, /data-action="copy-local-personalization-review"/);
assert.match(appJs, /function copyLocalPersonalizationReview\(\)/);
assert.match(appJs, /const emptyPersonalizationCopyMessage = '복사할 로컬 선호 설정 묶음이 없습니다\.';/);
assert.match(appJs, /const copiedPersonalizationMessage = \(\) => '로컬 선호 설정 묶음을 복사했습니다\.';/);
assert.match(
  appJs,
  /const unsupportedPersonalizationCopyMessage = \(\) =>\s+'클립보드 미지원 환경입니다\. 화면의 로컬 선호 설정 묶음을 직접 확인하세요\.';/,
);
assert.match(appJs, /emptyErrorMessage: emptyPersonalizationCopyMessage/);
assert.match(appJs, /copiedMessage: copiedPersonalizationMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedPersonalizationCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(\) => '로컬 선호 설정 묶음을 복사했습니다\.'/);
assert.match(appJs, /data-action="set-evidence-density"/);
assert.match(appJs, /data-action="set-preferred-project-local"/);
assert.match(appJs, /data-action="reset-local-personalization"/);
assert.match(appJs, /function resetUiPreferences\(\)/);
assert.match(appJs, /function setPreferredProjectPreference\(projectId\)/);
assert.match(appJs, /rememberSurfaceVisit\(surface\)/);
assert.match(appJs, /document\.body\.dataset\.evidenceDensity/);

assert.match(styles, /--bg-top: #f4efe6/);
assert.match(styles, /--surface-entry-accent: #9a5e2f/);
assert.match(styles, /\.intelligence-overview/);
assert.match(styles, /\.intelligence-panel-growth::before/);
assert.match(styles, /\.growth-dashboard-depth/);
assert.match(styles, /\.growth-pattern-grid/);
assert.match(styles, /\.growth-regression-row/);
assert.match(styles, /\.growth-rollback-list/);
assert.match(styles, /\.growth-candidate-list/);
assert.match(styles, /\.growth-proposal-review/);
assert.match(styles, /\.growth-proposal-readiness/);
assert.match(styles, /\.memory-readiness-gate/);
assert.match(styles, /\.memory-readiness-list/);
assert.match(styles, /\.personalization-settings/);
assert.match(styles, /\.personalization-portability/);
assert.match(styles, /body\[data-evidence-density='compact'\]/);
assert.doesNotMatch(appJs, /data-action="generate-growth-proposal"/);
assert.doesNotMatch(appJs, /data-action="apply-improvement-candidate"/);
assert.doesNotMatch(appJs, /data-action="persist-growth-memory"/);
assert.doesNotMatch(appJs, /data-action="approve-growth-proposal"/);
assert.doesNotMatch(appJs, /data-action="create-proposal-record"/);
assert.doesNotMatch(appJs, /data-action="mutate-growth-source"/);
assert.doesNotMatch(appJs, /data-action="import-local-personalization"/);
assert.doesNotMatch(appJs, /data-action="apply-local-personalization-packet"/);
assert.doesNotMatch(appJs, /data-action="persist-memory"/);
assert.doesNotMatch(appJs, /data-action="store-long-term-memory"/);
assert.doesNotMatch(appJs, /data-action="ingest-raw-transcript"/);
assert.doesNotMatch(appJs, /data-action="enable-cross-workspace-memory"/);
assert.doesNotMatch(appJs, /data-action="promote-memory-skill"/);
assert.doesNotMatch(appJs, /data-action="promote-skill"/);
assert.doesNotMatch(appJs, /data-action="create-memory-record"/);
assert.doesNotMatch(appJs, /data-action="apply-growth-dashboard-evidence"/);
assert.doesNotMatch(appJs, /data-action="create-growth-dashboard-proposal"/);
assert.doesNotMatch(appJs, /data-action="persist-growth-dashboard-memory"/);
assert.doesNotMatch(appJs, /data-action="mutate-growth-dashboard-source"/);
assert.doesNotMatch(appJs, /data-action="apply-authority-expansion"/);
assert.doesNotMatch(appJs, /data-action="approve-authority-expansion"/);
assert.doesNotMatch(appJs, /data-action="open-provider-calls"/);
assert.doesNotMatch(appJs, /data-action="open-source-mutation"/);
assert.doesNotMatch(appJs, /data-action="open-commit-push"/);

assert.match(uiQaStatus, /smoke-ui-slice-649\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-649\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      referenceDrivenUi: {
        audit: path.relative(repoRoot, auditPath),
        growthSurface: 'read-only',
        personalizationScope: 'local-only',
        blockedAuthorities: [
          'provider calls',
          'memory persistence',
          'long-term memory store',
          'raw transcript ingestion',
          'cross-workspace memory',
          'skill promotion',
          'UI-side durable proposal record creation/application',
          'proposal generation/application',
          'source mutation',
          'commit/push',
        ],
      },
    },
    null,
    2,
  ),
);
