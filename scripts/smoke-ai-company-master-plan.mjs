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
const staffingPlans = read('src/runtime/staffing-plans.js');
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
assert.match(runtimeContractText, /current schema v17에서도 유지된다/);
assert.match(runtimeContractText, /company policy는 여전히 `state\.json`에 저장되지 않는다/);

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
assert.match(decisionLog, /^### DEC-121$/m);
assert.match(decisionLog, /^### DEC-122$/m);
assert.match(decisionLog, /^### DEC-123$/m);
assert.match(decisionLog, /^### DEC-124$/m);
assert.match(decisionLog, /^### DEC-125$/m);
assert.match(decisionLog, /^### DEC-126$/m);
assert.match(decisionLog, /^### DEC-127$/m);
assert.match(decisionLog, /^### DEC-128$/m);
assert.match(decisionLog, /^### DEC-129$/m);
assert.match(decisionLog, /^### DEC-130$/m);
assert.match(decisionLog, /^### DEC-131$/m);
assert.match(decisionLog, /^### DEC-132$/m);
assert.match(decisionLog, /^### DEC-133$/m);
assert.match(decisionLog, /^### DEC-134$/m);
assert.match(decisionLog, /^### DEC-135$/m);
assert.match(decisionLog, /^### DEC-136$/m);
assert.match(decisionLog, /^### DEC-162$/m);
assert.match(decisionLog, /^### DEC-163$/m);
assert.match(decisionLog, /^### DEC-164$/m);
assert.match(decisionLog, /^### DEC-165$/m);
assert.match(decisionLog, /^### DEC-177$/m);
assert.match(decisionLog, /^### DEC-178$/m);
assert.match(decisionLog, /^### DEC-180$/m);
assert.match(decisionLog, /^### DEC-181$/m);
assert.match(decisionLog, /^### DEC-182$/m);
assert.match(decisionLog, /^### DEC-183$/m);
assert.match(decisionLog, /^### DEC-184$/m);
assert.match(decisionLog, /^### DEC-185$/m);
assert.match(decisionLog, /^### DEC-186$/m);
assert.match(decisionLog, /^### DEC-187$/m);
assert.match(decisionLog, /^### DEC-188$/m);
assert.match(decisionLog, /^### DEC-189$/m);
assert.match(decisionLog, /^### DEC-190$/m);
assert.match(decisionLog, /^### DEC-191$/m);
assert.match(decisionLog, /^### DEC-192$/m);
assert.match(decisionLog, /^### DEC-193$/m);
assert.match(decisionLog, /^### DEC-194$/m);
assert.match(decisionLog, /^### DEC-195$/m);
assert.match(decisionLog, /^### DEC-196$/m);
assert.match(decisionLog, /^### DEC-197$/m);
assert.match(decisionLog, /^### DEC-198$/m);
assert.match(decisionLog, /^### DEC-199$/m);
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
assert.match(deliveryRoadmapText, /exact implementation은 `DEC-121`/);
assert.match(masterPlanText, /MemoryRecall preview planning-only authority는 `DEC-122`/);
assert.match(runtimeContractText, /MemoryRecall preview planning은 `DEC-122`/);
assert.match(councilProtocolText, /MemoryRecall preview planning은 `DEC-122`/);
assert.match(deliveryRoadmapText, /MemoryRecall preview planning-only authority는 `DEC-122`/);
assert.match(masterPlanText, /exact response-only implementation은 `DEC-124`/);
assert.match(runtimeContractText, /exact response-only runtime\/API\/UI implementation은 `DEC-124`/);
assert.match(councilProtocolText, /exact response-only implementation은 `DEC-124`/);
assert.match(deliveryRoadmapText, /exact response-only implementation은 `DEC-124`/);
assert.match(masterPlanText, /Durable MemoryRecall persistence planning-only authority는 `DEC-125`/);
assert.match(runtimeContractText, /Durable MemoryRecall persistence planning은 `DEC-125`/);
assert.match(councilProtocolText, /Durable MemoryRecall persistence planning은 `DEC-125`/);
assert.match(deliveryRoadmapText, /Durable MemoryRecall persistence planning-only authority는 `DEC-125`/);
assert.match(masterPlanText, /Mission memory context preview planning-only authority는 `DEC-128`/);
assert.match(runtimeContractText, /Mission memory context preview planning은 `DEC-128`/);
assert.match(councilProtocolText, /Mission memory context preview planning은 `DEC-128`/);
assert.match(deliveryRoadmapText, /Mission memory context preview planning-only authority는 `DEC-128`/);
assert.match(masterPlanText, /Accepted Multi-Agent Completion Planning Authority/);
assert.match(masterPlanText, /Recorded decisions: `DEC-163` through `DEC-208`/);
assert.match(runtimeContractText, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(runtimeContractText, /implementation-readiness\s+clarification은 `DEC-165`/);
assert.match(councilProtocolText, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(councilProtocolText, /clarification은 `DEC-165`/);
assert.match(deliveryRoadmapText, /VNext Multi-Agent Completion Sequence/);
assert.match(deliveryRoadmapText, /readiness clarification은 `DEC-165`/);
assert.match(masterPlanText, /Planning-only `DEC-177` fixes the Stage 4B/);
assert.match(runtimeContractText, /Planning-only `DEC-177` defines a separate fixed post-Council/);
assert.match(councilProtocolText, /Planning-only `DEC-177` and handoff-only `DEC-178`/);
assert.match(deliveryRoadmapText, /Planning-only `DEC-177`[\s\S]*`DEC-178`/);
assert.match(masterPlanText, /Stage 4C planning: `DEC-180`/);
assert.match(runtimeContractText, /Planning-only `DEC-180`/);
assert.match(councilProtocolText, /Planning-only `DEC-180` and handoff-only `DEC-181`/);
assert.match(deliveryRoadmapText, /Planning-only `DEC-180`[\s\S]*`DEC-181`/);
assert.match(masterPlanText, /Stage 6A planning: `DEC-183`/);
assert.match(runtimeContractText, /Planning-only `DEC-183`/);
assert.match(councilProtocolText, /Planning-only `DEC-183` and handoff-only `DEC-184`/);
assert.match(deliveryRoadmapText, /Planning-only `DEC-183`[\s\S]*`DEC-184`/);
assert.match(masterPlanText, /Stage 5 planning: `DEC-186`/);
assert.match(masterPlanText, /Stage 5 implementation: `DEC-188`/);
assert.match(runtimeContractText, /Planning-only `DEC-186` defines the Stage 5/);
assert.match(councilProtocolText, /Planning-only `DEC-186` and handoff-only `DEC-187`/);
assert.match(deliveryRoadmapText, /`DEC-186`[\s\S]*`DEC-187`/);
assert.match(masterPlanText, /Stage 5B planning: `DEC-189`/);
assert.match(masterPlanText, /Stage 5B implementation: `DEC-191`/);
assert.match(runtimeContractText, /Planning-only `DEC-189` defines one schema-v22 immutable/);
assert.match(councilProtocolText, /Planning-only `DEC-189` and handoff-only `DEC-190`/);
assert.match(deliveryRoadmapText, /`DEC-189`[\s\S]*`DEC-190`/);
assert.match(masterPlanText, /Stage 5C planning: `DEC-192`/);
assert.match(masterPlanText, /Stage 5C implementation: `DEC-194`/);
assert.match(runtimeContractText, /Planning-only `DEC-192` defines one schema-v23/);
assert.match(councilProtocolText, /Planning-only `DEC-192` and handoff-only `DEC-193`/);
assert.match(deliveryRoadmapText, /`DEC-192`[\s\S]*`DEC-193`/);
assert.match(masterPlanText, /Stage 5D planning: `DEC-195`/);
assert.match(masterPlanText, /Stage 5D implementation: `DEC-197`/);
assert.match(runtimeContractText, /Planning-only `DEC-195` defines one future schema-v24/);
assert.match(councilProtocolText, /Planning-only `DEC-195` and handoff-only `DEC-196`/);
assert.match(deliveryRoadmapText, /`DEC-195`[\s\S]*`DEC-196`/);
assert.match(masterPlanText, /Stage 5E planning: `DEC-198`/);
assert.match(runtimeContractText, /Planning-only `DEC-198` defines Stage 5E/);
assert.match(councilProtocolText, /Planning-only `DEC-198` and handoff-only `DEC-199`/);
assert.match(deliveryRoadmapText, /Stage 5E planning-only `DEC-198`/);
assert.match(masterPlanText, /Stage 5F planning: `DEC-201`/);
assert.match(runtimeContractText, /Planning-only `DEC-201` and handoff-only `DEC-202`/);
assert.match(
  councilProtocolText,
  /Planning-only `DEC-201`, handoff-only `DEC-202`, and implementation `DEC-203`/,
);
assert.match(deliveryRoadmapText, /Stage 5F planning-only `DEC-201`/);
assert.match(masterPlanText, /Stage 5G planning: `DEC-204`/);
assert.match(masterPlanText, /Stage 5G implementation: `DEC-206`/);
assert.match(
  runtimeContractText,
  /Planning-only\s+`DEC-204`, handoff-only `DEC-205`, and implementation `DEC-206`/,
);
assert.match(
  councilProtocolText,
  /Planning-only `DEC-204`, handoff-only `DEC-205`, and implementation `DEC-206`/,
);
assert.match(deliveryRoadmapText, /Stage 5G planning-only `DEC-204`/);
assert.match(masterPlanText, /Stage 5H planning: `DEC-207`/);
assert.match(runtimeContractText, /Planning-only `DEC-207` and handoff-only `DEC-208`/);
assert.match(councilProtocolText, /Planning-only `DEC-207` and handoff-only `DEC-208`/);
assert.match(deliveryRoadmapText, /Stage 5H planning-only `DEC-207`/);
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
assert.match(runtimeContracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(companyBlueprintLoader, /function loadCompanyBlueprint/);
assert.match(companyBlueprintLoader, /BLUEPRINT_FORBIDDEN_AUTHORITY/);
assert.match(runtimeService, /companyBlueprintPath/);
assert.match(runtimeService, /companyRuntime/);
assert.match(staffingPlans, /function previewMissionStaffingPlan/);
assert.match(staffingPlans, /function createStaffingPlan/);
assert.match(runtimeService, /function buildCouncilSessionRecord\(state, mission, project, now\)/);
assert.match(runtimeService, /participants: \[[\s\S]*role: 'Conductor'[\s\S]*role: 'Strategist'[\s\S]*role: 'Architect'[\s\S]*role: 'Decomposer'/);
assert.match(companyConfig, /COMPANY_MEMBER_STORAGE_KEY = 'orchestration\.company-members\.v1'/);
assert.match(companyConfig, /DEFAULT_COMPANY_MEMBERS/);

const report = {
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
        'DEC-121',
        'DEC-122',
        'DEC-123',
        'DEC-124',
        'DEC-125',
        'DEC-126',
        'DEC-127',
        'DEC-128',
        'DEC-129',
        'DEC-130',
        'DEC-131',
        'DEC-132',
        'DEC-133',
        'DEC-134',
        'DEC-135',
        'DEC-136',
        'DEC-162',
        'DEC-163',
        'DEC-164',
        'DEC-165',
        'DEC-166',
        'DEC-167',
        'DEC-168',
        'DEC-169',
        'DEC-170',
        'DEC-171',
        'DEC-172',
        'DEC-173',
        'DEC-174',
        'DEC-175',
        'DEC-176',
        'DEC-177',
        'DEC-178',
        'DEC-179',
        'DEC-180',
        'DEC-181',
        'DEC-182',
        'DEC-183',
        'DEC-184',
        'DEC-185',
        'DEC-186',
        'DEC-187',
        'DEC-188',
        'DEC-189',
        'DEC-190',
        'DEC-191',
        'DEC-192',
        'DEC-193',
        'DEC-194',
        'DEC-195',
        'DEC-196',
        'DEC-197',
        'DEC-198',
        'DEC-199',
        'DEC-200',
        'DEC-201',
        'DEC-202',
        'DEC-203',
        'DEC-204',
        'DEC-205',
        'DEC-206',
        'DEC-207',
        'DEC-208',
      ],
      currentRuntime: {
        schemaVersion: 24,
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
        durableMemoryItem: 'schema-v14-exact-stored-record',
        memoryRecallPreview: 'schema-v14-response-only-exact-id-recall-ready',
        durableMemoryRecall: 'schema-v15-exact-recorded-audit',
        missionMemoryContextPreview: 'schema-v17-preserving-response-only-exact-recorded-recall-and-draft-mission',
        workOrderVerificationPlanPreview: 'schema-v17-preserving-response-only-exact-workorder-evidence',
        stateTransactions: 'schema-v17-optimistic-commit-lock-and-stale-revision-guard',
        acceptanceEvidence: 'schema-v17-preserving-immutable-criteria-and-append-only-proofs',
        boundedContinuation: 'schema-v17-preserving-response-only-max-steps-one',
        exactResearchFetch: 'disabled-by-default-operator-installed-sidecar',
        contextBudgetTelemetry: 'response-only-measurement-without-payload-mutation',
        staffingPlan: 'schema-v17-preview-accept-persist-exact-inspection',
        staffingEntry: 'schema-v18-exact-accepted-plan-local-council-binding',
        operatorSteppedScheduler: 'schema-v19-operator-stepped-local-builder-reviewer-qa',
        specialistBatchPreview: 'schema-v19-response-browser-memory-only',
        durableSpecialistBatch: 'schema-v20-request-scoped-researcher-qa-first-attempt',
        specialistCellRetry: 'schema-v21-exact-failed-first-attempt-retry',
        opsSupervisionPreview: 'schema-v21-response-only-exact-active-attempt-inspection',
        reviewerReworkPreview: 'schema-v21-response-only-exact-changes-requested-inspection',
        durableReviewerReworkPlan: 'schema-v22-exact-review-required-record',
        reworkPlanAcceptance: 'schema-v23-exact-append-only-accepted-record',
        builderReworkPreflight: 'schema-v24-exact-local-stub-sidecar-preflight',
        builderReworkMutationApproval: 'schema-v24-exact-source-bound-evidence-only',
        builderReworkSourceMutation: 'schema-v24-exact-bounded-local-stub-mutation',
        reviewerReexecution: 'schema-v24-exact-local-stub-attempt-two',
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
        durableMemoryItemPersistenceAllowed: true,
        memoryRecallPreviewPlanningAllowed: true,
        memoryRecallPreviewImplementationAllowed: true,
        durableMemoryRecallPlanningAllowed: true,
        durableMemoryRecallPersistenceAllowed: true,
        missionMemoryContextPreviewPlanningAllowed: true,
        missionMemoryContextPreviewImplementationAllowed: true,
        workOrderVerificationPlanPreviewAllowed: true,
        stateTransactionGuardAllowed: true,
        acceptanceCriterionAndProofAllowed: true,
        boundedContinuationPreviewAllowed: true,
        optionalExactFetchAllowed: true,
        contextBudgetTelemetryAllowed: true,
        staffingPlanPlanningAllowed: true,
        staffingPlanImplementationAllowed: true,
        staffingPlanPersistenceAllowed: true,
        staffingEntryBindingPlanningAllowed: true,
        staffingPlanCouncilBindingAllowed: true,
        operatorSteppedSchedulerPlanningAllowed: true,
        operatorSteppedSchedulerImplementationAllowed: true,
        workOrderAttemptPersistenceAllowed: true,
        specialistBatchPreviewPlanningAllowed: true,
        specialistBatchPreviewImplementationAllowed: true,
        durableSpecialistBatchPlanningAllowed: true,
        durableSpecialistBatchImplementationAllowed: true,
        requestScopedConcurrentSpecialistExecutionAllowed: true,
        specialistCellRetryPlanningAllowed: true,
        specialistCellRetryImplementationAllowed: true,
        opsSupervisionPreviewPlanningAllowed: true,
        opsSupervisionPreviewImplementationAllowed: true,
        reviewerReworkPreviewPlanningAllowed: true,
        reviewerReworkPreviewImplementationAllowed: true,
        durableReviewerReworkPlanPlanningAllowed: true,
        durableReviewerReworkPlanImplementationAllowed: true,
        reworkPlanAcceptancePlanningAllowed: true,
        reworkPlanAcceptanceImplementationAllowed: true,
        builderReworkPreflightPlanningAllowed: true,
        builderReworkPreflightImplementationAllowed: true,
        builderReworkMutationApprovalImplementationAllowed: true,
        builderReworkSourceMutationPlanningAllowed: true,
        builderReworkSourceMutationImplementationAllowed: true,
        reviewerReexecutionPlanningAllowed: true,
        reviewerReexecutionImplementationAllowed: true,
        reworkQaExecutionPlanningAllowed: true,
        reworkQaExecutionImplementationAllowed: false,
        qaReexecutionAllowed: false,
        activeSpecialistAttemptRecoveryAllowed: false,
        broadParallelStaffingPolicyAllowed: false,
        providerRoleExpansionAllowed: false,
        memoryApplicationAllowed: false,
        autonomousSchedulingAllowed: false,
        agentSourceMutationAllowed: false,
        approvalBypassAllowed: false,
        unattendedCommitAllowed: false,
        unattendedPushAllowed: false,
      },
    nextGate:
      'Rework QA execution is planned by DEC-207 and DEC-208; implementation requires DEC-209',
};
assert.equal(report.authority.durableSpecialistBatchImplementationAllowed, true);
assert.equal(report.authority.requestScopedConcurrentSpecialistExecutionAllowed, true);
assert.equal(report.authority.specialistCellRetryPlanningAllowed, true);
assert.equal(report.authority.specialistCellRetryImplementationAllowed, true);
assert.equal(report.authority.opsSupervisionPreviewPlanningAllowed, true);
assert.equal(report.authority.opsSupervisionPreviewImplementationAllowed, true);
assert.equal(report.authority.reviewerReworkPreviewPlanningAllowed, true);
assert.equal(report.authority.reviewerReworkPreviewImplementationAllowed, true);
assert.equal(report.authority.durableReviewerReworkPlanPlanningAllowed, true);
assert.equal(report.authority.durableReviewerReworkPlanImplementationAllowed, true);
assert.equal(report.authority.reworkPlanAcceptancePlanningAllowed, true);
assert.equal(report.authority.reworkPlanAcceptanceImplementationAllowed, true);
assert.equal(report.authority.builderReworkPreflightPlanningAllowed, true);
assert.equal(report.authority.builderReworkPreflightImplementationAllowed, true);
assert.equal(report.authority.builderReworkMutationApprovalImplementationAllowed, true);
assert.equal(report.authority.builderReworkSourceMutationPlanningAllowed, true);
assert.equal(report.authority.builderReworkSourceMutationImplementationAllowed, true);
assert.equal(report.authority.reviewerReexecutionPlanningAllowed, true);
assert.equal(report.authority.reviewerReexecutionImplementationAllowed, true);
assert.equal(report.authority.reworkQaExecutionPlanningAllowed, true);
assert.equal(report.authority.reworkQaExecutionImplementationAllowed, false);
assert.equal(report.authority.qaReexecutionAllowed, false);
assert.equal(report.authority.activeSpecialistAttemptRecoveryAllowed, false);
assert.equal(report.authority.broadParallelStaffingPolicyAllowed, false);
assert.match(
  report.nextGate,
  /Rework QA execution is planned by DEC-207 and DEC-208/,
);

process.stdout.write(
  `${JSON.stringify(report, null, 2)}\n`,
);
