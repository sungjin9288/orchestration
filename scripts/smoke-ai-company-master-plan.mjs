import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-master-plan-documentation-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertSections(source, sections) {
  for (const section of sections) {
    assert.match(source, new RegExp(`^## ${section}$`, 'm'));
  }
}

function compact(source) {
  return source.replace(/\s+/g, ' ').trim();
}

const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const decisionLog = read('docs/01_decision-log.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const runtimeContracts = read('src/runtime/contracts.js');
const companyBlueprintLoader = read('src/runtime/company-blueprint.js');
const runtimeService = read('src/runtime/runtime-service.js');
const companyConfig = read('ui/company-config.js');
const masterPlanText = compact(masterPlan);
const runtimeContractText = compact(runtimeContract);
const councilProtocolText = compact(councilProtocol);
const deliveryRoadmapText = compact(deliveryRoadmap);
const decisionLogText = compact(decisionLog);
const taskLedgerText = compact(taskLedger);
const lessonsText = compact(lessons);

assert.match(masterPlan, /^# AI Company Master Plan$/m);
assertSections(masterPlan, [
  'Purpose',
  'Approved Documentation Authority',
  'Approved Runtime Foundation Authority',
  'Current Product Truth',
  'Approved Real Council Planning Authority',
  'Approved Real Council Implementation Authority',
  'Product North Star',
  'Operating Principles',
  'Logical Organization',
  'Core Domain Objects',
  'External Pattern Intake',
  'Product Success Criteria',
  'Non-Goals',
  'First Implementation Target',
  'Verification',
]);
assert.match(masterPlanText, /approve-ai-company-master-plan-documentation/);
assert.match(masterPlanText, /deterministic transcript/);
assert.match(masterPlanText, /browser-side presentation 설정이며 runtime authority가 아니다/);
assert.match(masterPlanText, /read-only runtime blueprint foundation만 별도로 승인했으며 나머지 runtime authority는 계속 차단한다/);
assert.match(masterPlanText, /Recorded decision: `DEC-079`/);
assert.match(masterPlanText, /configured local server snapshot의 read-only `companyRuntime`/);
assert.match(masterPlanText, /Decision status: `approve-ai-company-real-council-planning-only`/);
assert.match(masterPlanText, /Decision status: `approve-ai-company-real-council-local-stub-implementation-slice`/);
assert.match(masterPlanText, /Mission Intake.*Staffing Decision.*Council Positions.*Delivery Package/);
for (const objectName of [
  'CompanyBlueprint',
  'AgentProfile',
  'StaffingPlan',
  'CouncilPosition',
  'ExecutionPlan',
  'WorkOrder',
  'HandoffPacket',
  'Checkpoint',
  'DeliveryPackage',
  'LearningCandidate',
]) {
  assert.match(masterPlanText, new RegExp(`\\b${objectName}\\b`));
}

assert.match(runtimeContract, /^# Agent Runtime Contract$/m);
assertSections(runtimeContract, [
  'Purpose',
  'Contract Principles',
  'Source Layout',
  'CompanyBlueprint',
  'AgentProfile',
  'StaffingPlan',
  'CouncilSession And CouncilPosition',
  'ExecutionPlan And WorkOrder',
  'HandoffPacket',
  'Checkpoint',
  'DeliveryPackage',
  'LearningCandidate',
  'Provider Boundary',
  'API Intent',
  'Observability',
  'Failure And Recovery Matrix',
  'Security Invariants',
  'Implementation Boundary',
  'Verification',
]);
assert.match(runtimeContractText, /company\/blueprint\.json/);
assert.match(runtimeContractText, /solo \| council \| parallel-specialists/);
assert.match(runtimeContractText, /canCommit.*canPush/);
assert.match(runtimeContractText, /Raw chain-of-thought를 저장하거나 전달하지 않는다/);
assert.match(runtimeContractText, /현재 runtime은 schema v8이며 read-only recovery와 exact resume\/cancel routes를 제공한다/);
assert.match(runtimeContractText, /company policy는 `state\.json`에 저장되지 않는다/);

assert.match(councilProtocol, /^# Council Operating Protocol$/m);
assertSections(councilProtocol, [
  'Purpose',
  'Council Entry Criteria',
  'Required Roles',
  'Agenda Packet',
  'Meeting Phases',
  'Termination Policy',
  'Quorum And Required Role Rule',
  'Revision Protocol',
  'Failure Handling',
  'UI Contract',
  'API Compatibility Intent',
  'Acceptance Scenarios',
  'Implementation Boundary',
  'Verification',
]);
assert.match(councilProtocolText, /Independent Positions/);
assert.match(councilProtocolText, /Evidence And Conflict Check/);
assert.match(councilProtocolText, /Conductor Synthesis/);
for (const action of ['approve', 'request-revision', 'stop']) {
  assert.match(councilProtocolText, new RegExp(`\\\`${action}\\\`:`));
}
assert.match(councilProtocolText, /Required role 하나라도 terminal failure이면 자동 synthesis approval-ready 상태로 가지 않는다/);
assert.match(councilProtocolText, /Raw chain-of-thought, typing simulation, decorative chatter, role ranking은 표시하지 않는다/);

assert.match(deliveryRoadmap, /^# AI Company Delivery Roadmap$/m);
assertSections(deliveryRoadmap, [
  'Purpose',
  'Delivery Strategy',
  'Phase 0: Source-Of-Truth Foundation',
  'Phase 1: Runtime Company Blueprint',
  'Phase 2: Real Council For One Mission',
  'Phase 3: Council Live Provider Opt-In',
  'Phase 4: Mission Compiler And WorkOrders',
  'Phase 5: Team Execution And Supervision',
  'Phase 6: Reviewer, QA, And Delivery Package',
  'Phase 7: Checkpoint, Resume, And Recovery',
  'Phase 8: Reviewed Organizational Learning',
  'Phase 9: Dogfood And Productization',
  'Cross-Phase Verification Matrix',
  'Implementation Decision Template',
  'Immediate Next Decision',
  'Verification',
]);
assert.match(deliveryRoadmapText, /Roadmap 항목은 planned work다/);
assert.match(
  deliveryRoadmapText,
  /targetAuthority=one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path/,
);
assert.match(deliveryRoadmapText, /각 phase를 열 때 최소 다음 필드를 제공한다/);
assert.match(deliveryRoadmapText, /`continue`, `do everything`, `approve all` 같은 shortcut은 implementation authority가 아니다/);

assert.match(decisionLog, /^### DEC-076$/m);
assert.match(decisionLog, /^### DEC-079$/m);
assert.match(decisionLog, /^### DEC-080$/m);
assert.match(decisionLog, /^### DEC-081$/m);
assert.match(decisionLog, /^### DEC-082$/m);
assert.match(decisionLog, /^### DEC-083$/m);
assert.match(decisionLog, /^### DEC-084$/m);
assert.match(decisionLog, /^### DEC-085$/m);
assert.match(decisionLog, /^### DEC-086$/m);
assert.match(decisionLog, /^### DEC-087$/m);
assert.match(decisionLog, /^### DEC-088$/m);
assert.match(decisionLog, /^### DEC-089$/m);
assert.match(decisionLog, /^### DEC-090$/m);
assert.match(decisionLog, /^### DEC-091$/m);
assert.match(decisionLog, /^### DEC-092$/m);
assert.match(decisionLog, /^### DEC-093$/m);
assert.match(decisionLog, /^### DEC-094$/m);
assert.match(decisionLog, /^### DEC-095$/m);
assert.match(decisionLog, /^### DEC-096$/m);
assert.match(decisionLog, /^### DEC-097$/m);
assert.match(decisionLog, /^### DEC-098$/m);
assert.match(decisionLog, /^### DEC-099$/m);
assert.match(decisionLog, /^### DEC-100$/m);
assert.match(decisionLog, /^### DEC-101$/m);
assert.match(decisionLog, /^### DEC-102$/m);
assert.match(decisionLog, /^### DEC-103$/m);
assert.match(decisionLog, /^### DEC-104$/m);
assert.match(decisionLog, /^### DEC-105$/m);
assert.match(decisionLog, /^### DEC-106$/m);
assert.match(decisionLog, /^### DEC-107$/m);
assert.match(decisionLog, /^### DEC-108$/m);
assert.match(decisionLog, /^### DEC-109$/m);
assert.match(decisionLog, /^### DEC-110$/m);
assert.match(decisionLog, /^### DEC-111$/m);
assert.match(decisionLog, /^### DEC-112$/m);
assert.match(decisionLog, /^### DEC-113$/m);
assert.match(decisionLog, /^### DEC-114$/m);
assert.match(decisionLog, /^### DEC-115$/m);
assert.match(decisionLog, /^### DEC-116$/m);
assert.match(decisionLog, /^### DEC-117$/m);
assert.match(decisionLog, /^### DEC-118$/m);
assert.match(decisionLog, /^### DEC-119$/m);
assert.match(decisionLog, /^### DEC-120$/m);
assert.match(masterPlanText, /Durable LearningCandidate persistence planning-only authority는 `DEC-110`/);
assert.match(runtimeContractText, /Durable LearningCandidate persistence planning은 `DEC-110`/);
assert.match(councilProtocolText, /Durable LearningCandidate persistence planning은 `DEC-110`/);
assert.match(deliveryRoadmapText, /Durable LearningCandidate persistence planning-only authority는 `DEC-110`/);
assert.match(masterPlanText, /LearningCandidate review outcome planning-only authority는 `DEC-113`/);
assert.match(runtimeContractText, /LearningCandidate review outcome planning은 `DEC-113`/);
assert.match(councilProtocolText, /LearningCandidate review outcome planning은 `DEC-113`/);
assert.match(deliveryRoadmapText, /LearningCandidate review outcome planning-only authority는 `DEC-113`/);
assert.match(masterPlanText, /MemoryCandidate preview planning-only authority는 `DEC-116`/);
assert.match(runtimeContractText, /MemoryCandidate preview planning은 `DEC-116`/);
assert.match(councilProtocolText, /MemoryCandidate preview planning은 `DEC-116`/);
assert.match(deliveryRoadmapText, /MemoryCandidate preview planning-only authority는 `DEC-116`/);
assert.match(masterPlanText, /exact response-only implementation은 `DEC-118`/);
assert.match(runtimeContractText, /exact response-only runtime\/API\/UI implementation은 `DEC-118`/);
assert.match(councilProtocolText, /exact response-only implementation은 `DEC-118`/);
assert.match(deliveryRoadmapText, /exact response-only implementation은 `DEC-118`/);
assert.match(masterPlanText, /Durable MemoryItem persistence planning-only authority는 `DEC-119`/);
assert.match(runtimeContractText, /Durable MemoryItem persistence planning은 `DEC-119`/);
assert.match(councilProtocolText, /Durable MemoryItem persistence planning은 `DEC-119`/);
assert.match(deliveryRoadmapText, /Durable MemoryItem persistence planning-only authority는 `DEC-119`/);
assert.match(deliveryRoadmapText, /Schema-v14 implementation은 complete fielded decision 전까지 blocked/);
assert.match(masterPlanText, /Phase 7 checkpoint\/resume\/recovery planning은 `DEC-095`/);
assert.match(runtimeContractText, /Phase 7 safe-boundary recovery planning은 `DEC-095`/);
assert.match(councilProtocolText, /Phase 7 recovery planning은 `DEC-095`/);
assert.match(deliveryRoadmapText, /Phase 7 planning-only authority는 `DEC-095`/);
assert.match(decisionLogText, /approve-ai-company-master-plan-documentation/);
assert.match(decisionLogText, /It does not change runtime schema or behavior/);
assert.match(decisionLogText, /runtime CompanyBlueprint and AgentProfile implementation planning/);
assert.match(taskLedgerText, /ai-company-master-plan-documentation-post-m7-1937/);
assert.match(lessonsText, /AI Company planning must distinguish presentation roster, runtime identity, and execution authority/);
assert.match(verification, /id: 'ai-company-master-plan-documentation'/);
assert.match(verification, /script: 'scripts\/smoke-ai-company-master-plan\.mjs'/);

// Pin the current baseline and exact Phase 2 authority without opening downstream capability.
assert.match(runtimeContracts, /const STATE_SCHEMA_VERSION = 13/);
assert.match(companyBlueprintLoader, /function loadCompanyBlueprint/);
assert.match(companyBlueprintLoader, /BLUEPRINT_FORBIDDEN_AUTHORITY/);
assert.match(runtimeService, /companyBlueprintPath/);
assert.match(runtimeService, /companyRuntime/);
assert.match(runtimeService, /function buildCouncilSessionRecord\(state, mission, project, now\)/);
assert.match(runtimeService, /participants: \[[\s\S]*role: 'Conductor'[\s\S]*role: 'Strategist'[\s\S]*role: 'Architect'[\s\S]*role: 'Decomposer'/);
assert.match(companyConfig, /COMPANY_MEMBER_STORAGE_KEY = 'orchestration\.company-members\.v1'/);
assert.match(companyConfig, /DEFAULT_COMPANY_MEMBERS/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      phase: 'phase-0-source-of-truth-foundation',
      documents: [
        'docs/48_ai-company-master-plan.md',
        'docs/49_agent-runtime-contract.md',
        'docs/50_council-operating-protocol.md',
        'docs/51_ai-company-delivery-roadmap.md',
      ],
      decisions: [
        'DEC-076',
        'DEC-079',
        'DEC-080',
        'DEC-081',
        'DEC-082',
        'DEC-083',
        'DEC-084',
        'DEC-085',
        'DEC-086',
        'DEC-087',
        'DEC-088',
        'DEC-089',
        'DEC-090',
        'DEC-091',
        'DEC-092',
        'DEC-093',
        'DEC-094',
        'DEC-095',
        'DEC-096',
        'DEC-097',
        'DEC-098',
        'DEC-099',
        'DEC-100',
        'DEC-101',
        'DEC-102',
        'DEC-103',
        'DEC-104',
        'DEC-105',
        'DEC-106',
        'DEC-107',
        'DEC-108',
        'DEC-109',
        'DEC-110',
        'DEC-111',
        'DEC-112',
        'DEC-113',
        'DEC-114',
        'DEC-115',
        'DEC-116',
        'DEC-117',
        'DEC-118',
        'DEC-119',
        'DEC-120',
      ],
      currentRuntime: {
        schemaVersion: 13,
        companyBlueprint: 'ready-readonly',
        council: 'opt-in-local-stub-and-openai-responses-with-legacy-deterministic-compatibility',
        missionCompiler: 'response-only-preview-and-explicit-schema-v7-durable-promotion',
        workOrderExecution: 'local-stub-sequential-builder-to-live-mutation-approval-gate',
        reviewedDelivery: 'exact-gated-local-reviewed-delivery-response-only-package',
        checkpointRecovery: 'schema-v8-exact-local-reviewer-or-qa-resume',
        durableDeliveryPackage: 'schema-v9-exact-review-required-record',
        deliveryPackageAcceptance: 'schema-v10-exact-append-only-accepted-record',
        missionTaskCloseOut: 'schema-v11-exact-atomic-terminal-transaction',
        learningCandidatePreview: 'schema-v11-response-only-review-required',
        durableLearningCandidate: 'schema-v12-exact-review-required-record',
        learningCandidateReview: 'schema-v13-exact-append-only-outcome',
        memoryCandidatePreview: 'schema-v13-response-only-review-ready',
        companyRoster: 'browser-presentation-config',
      },
      authority: {
        documentationApproved: true,
        runtimeBlueprintImplementationPresent: true,
        councilRoleExecutionAllowed: true,
        durableWorkOrderRecordsAllowed: true,
        sequentialBuilderPreflightAllowed: true,
        reviewedDeliveryPlanningAllowed: true,
        reviewedDeliverySourceMutationAllowed: true,
        reviewerOrQaExecutionAllowed: true,
        checkpointRecoveryPlanningAllowed: true,
        checkpointPersistenceAllowed: true,
        durableDeliveryPackagePlanningAllowed: true,
        durableDeliveryPackagePersistenceAllowed: true,
        deliveryPackageAcceptancePlanningAllowed: true,
        deliveryPackageAcceptanceAllowed: true,
        missionTaskCloseOutPlanningAllowed: true,
        missionTaskCloseOutAllowed: true,
        learningCandidatePreviewPlanningAllowed: true,
        learningCandidatePreviewImplementationAllowed: true,
        durableLearningCandidatePlanningAllowed: true,
        durableLearningCandidateAllowed: true,
        learningCandidateReviewPlanningAllowed: true,
        learningCandidateReviewAllowed: true,
        memoryCandidatePreviewPlanningAllowed: true,
        memoryCandidatePreviewImplementationAllowed: true,
        durableMemoryItemPlanningAllowed: true,
        providerRoleExpansionAllowed: false,
        memoryPersistenceAllowed: false,
        autonomousSchedulingAllowed: false,
        agentSourceMutationAllowed: false,
        approvalBypassAllowed: false,
        unattendedCommitAllowed: false,
        unattendedPushAllowed: false,
      },
      nextGate: 'Complete fielded schema-v14 durable MemoryItem implementation decision required',
    },
    null,
    2,
  )}\n`,
);
