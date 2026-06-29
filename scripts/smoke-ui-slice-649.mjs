import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'vnext-reference-driven-ui-audit.md');
const decisionLogPath = path.join(repoRoot, 'docs', '01_decision-log.md');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
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
assert.match(audit, /durable proposal record creation or persistence/);
assert.match(audit, /source mutation/);
assert.match(decisionLog, /### DEC-048/);
assert.match(decisionLog, /review-readiness surface only/);
assert.match(decisionLog, /does not create or persist durable proposal records/);
assert.match(decisionLog, /redaction, export, and expiry rules/);
assert.match(decisionLog, /### DEC-049/);
assert.match(decisionLog, /long-term memory surface is a readiness gate only/);
assert.match(decisionLog, /must not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills/);
assert.match(decisionLog, /workspace\/applicability rules, redaction policy, export format, expiry\/deletion policy/);

assert.match(appJs, /const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(appJs, /const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/);
assert.match(appJs, /providerCallsAllowed: false/);
assert.match(appJs, /memoryPersistenceAllowed: false/);
assert.match(appJs, /longTermMemoryStoreAllowed: false/);
assert.match(appJs, /rawTranscriptIngestionAllowed: false/);
assert.match(appJs, /crossWorkspaceMemoryAllowed: false/);
assert.match(appJs, /skillPromotionAllowed: false/);
assert.match(appJs, /proposalRecordCreationAllowed: false/);
assert.match(appJs, /proposalRecordPersistenceAllowed: false/);
assert.match(appJs, /sourceMutationAllowed: false/);
assert.match(appJs, /commitPushAllowed: false/);
assert.match(appJs, /const PROPOSAL_RECORD_OPEN_REQUIREMENTS = Object\.freeze\(\[/);
assert.match(appJs, /제안 기록 생성은 별도 승인 결정이 필요합니다/);
assert.match(appJs, /이 검토 게이트는 제안 승인과 분리됩니다/);
assert.match(appJs, /장기 기억 전에 redaction, export, expiry 규칙이 필요합니다/);
assert.match(appJs, /const MEMORY_STORE_OPEN_REQUIREMENTS = Object\.freeze\(\[/);
assert.match(appJs, /원문 transcript 수집은 금지 상태로 둡니다/);
assert.match(appJs, /민감정보 제거, 내보내기, 만료 규칙이 먼저 있어야 합니다/);
assert.match(appJs, /스킬 승격은 별도 리뷰와 검증 명령이 필요합니다/);
assert.match(appJs, /function renderIntelligenceOverview\(data, context\)/);
assert.match(appJs, /data-growth-learning-surface="read-only"/);
assert.match(appJs, /data-personalization-scope="local-only"/);
assert.match(appJs, /성장 증거 원장/);
assert.match(appJs, /개선 후보 대기열/);
assert.match(appJs, /로컬 저장만/);
assert.match(appJs, /function renderGrowthCandidateDrilldown\(growth\)/);
assert.match(appJs, /data-growth-candidate-drilldown="true"/);
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
assert.match(appJs, /const UI_PREFERENCE_PACKET_SCHEMA = 'orchestration\.ui-preferences\.portable-review\.v1'/);
assert.match(appJs, /function getPortableUiPreferenceReview\(\)/);
assert.match(appJs, /runtimeMutationAllowed: false/);
assert.match(appJs, /data-local-personalization-portability="copy-review-only"/);
assert.match(appJs, /data-action="copy-local-personalization-review"/);
assert.match(appJs, /function copyLocalPersonalizationReview\(\)/);
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
          'durable proposal record creation/persistence',
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
