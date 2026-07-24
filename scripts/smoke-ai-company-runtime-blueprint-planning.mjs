import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-runtime-blueprint-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function compact(source) {
  return source.replace(/\s+/g, ' ').trim();
}

function assertSections(source, sections) {
  for (const section of sections) {
    assert.match(source, new RegExp(`^## ${section}$`, 'm'));
  }
}

function assertAll(source, patterns) {
  for (const pattern of patterns) {
    assert.match(source, pattern);
  }
}

const plan = read('docs/52_ai-company-runtime-blueprint-implementation-plan.md');
const handoff = read('docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const roadmap = read('docs/51_ai-company-delivery-roadmap.md');
const decisionLog = read('docs/01_decision-log.md');
const completionInventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const runtimeContracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const companyBlueprintLoader = read('src/runtime/company-blueprint.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const companyConfig = read('ui/company-config.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const decisionLogText = compact(decisionLog);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);
const taskLedgerText = compact(taskLedger);
const completionInventoryText = compact(completionInventory);

assert.match(plan, /^# AI Company Runtime Blueprint Implementation Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Implementation Outcome',
  'Current Baseline Evidence',
  'Implementation Objective',
  'Exact Target Surface',
  'Company Source Contract',
  'Validation Contract',
  'Runtime Integration Contract',
  'Compatibility And Migration Plan',
  'Failure And Recovery',
  'Focused Smoke Plan',
  'Rollback Plan',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Implementation Decision Status',
  'Verification',
]);

assertAll(planText, [
  /operator-delegated-ai-company-runtime-blueprint-planning-001/,
  /approve-runtime-company-blueprint-planning-only/,
  /runtime CompanyBlueprint and AgentProfile implementation planning/,
  /이 문서는 runtime implementation 승인이 아니다/,
  /company\/blueprint\.json/,
  /company\/roles\/conductor\.md/,
  /company\/roles\/ops\.md/,
  /src\/runtime\/company-blueprint\.js/,
  /src\/runtime\/runtime-service\.js/,
  /scripts\/serve-ui-slice-01\.mjs/,
  /scripts\/smoke-ai-company-runtime-blueprint\.mjs/,
  /ready \| not-configured \| invalid/,
  /Persisted state stays at `schemaVersion: 6`/,
  /do not add company policy fields/,
  /Browser company members cannot override runtime ids or authority/,
  /architecture-sensitive implementation decision was supplied in full and accepted as `DEC-079`/,
]);

for (const role of [
  'Conductor',
  'Strategist',
  'Architect',
  'Decomposer',
  'Researcher',
  'Builder',
  'Reviewer',
  'QA',
  'Ops',
]) {
  assert.match(planText, new RegExp(`\\b${role}\\b`));
}

assert.match(handoff, /^# AI Company Runtime Blueprint Implementation Decision Handoff$/m);
assertSections(handoff, [
  'Purpose',
  'Current Gate',
  'Source Evidence',
  'Valid Implementation Decision Shape',
  'Rejection Decision Shape',
  'Invalid Shortcuts',
  'Minimum Acceptance Criteria',
  'Still Blocked After Approval',
  'Stop Conditions',
  'Verification',
]);

assertAll(handoffText, [
  /operator-decision-ai-company-runtime-blueprint-implementation-001/,
  /approve-ai-company-runtime-blueprint-implementation-slice/,
  /read-only runtime CompanyBlueprint and AgentProfile loading plus additive snapshot exposure/,
  /implementationPlanRefs=docs\/52_ai-company-runtime-blueprint-implementation-plan\.md/,
  /compatibilityPlanRefs=keep schemaVersion 6/,
  /stillBlockedAuthorities=StaffingPlan runtime, independent Council role execution/,
  /This does not approve StaffingPlan or Council role execution, provider calls, memory persistence/,
  /self-approve implementation/,
  /fielded operator decision이 없다/,
  /consumed-by-DEC-079/,
  /accepted and implemented for the exact read-only blueprint path only/,
]);

assertAll(decisionLogText, [
  /DEC-077 .*operator-delegated-ai-company-runtime-blueprint-planning-001/s,
  /DEC-078 .*AI Company runtime blueprint implementation decision handoff/s,
  /DEC-079 .*operator-decision-ai-company-runtime-blueprint-implementation-001/s,
]);
assert.match(masterPlan, /첫 runtime foundation slice는 `DEC-079`로 구현됐다/);
assert.match(masterPlan, /첫 behavior vertical slice는 foundation 검증 이후의 `Real Council for one Mission`/);
assert.match(runtimeContract, /`CompanyBlueprint`와 `AgentProfile` source loading은 `DEC-079`로 구현됐다/);
assert.match(runtimeContract, /company policy는 (?:여전히 )?`state\.json`에 저장되지 않는다/);
assertAll(roadmapText, [
  /decision은 `DEC-079`로 승인됐고 Phase 1 focused smoke가 current implementation evidence/,
  /Fielded implementation decision은 `DEC-079`로 승인됐고/,
  /targetAuthority=one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path/,
]);
assertAll(readmeText, [
  /are consumed by `DEC-079`/,
  /strictly loads one repo-backed blueprint and nine role contracts/,
  /`companyRuntime` remains an additive read-only snapshot/,
]);
assert.match(taskLedgerText, /ai-company-runtime-blueprint-planning-post-m7-1938/);
assert.match(taskLedgerText, /ai-company-runtime-blueprint-implementation-post-m7-1939/);
assert.match(
  lessons,
  /Source-backed company policy does not need persisted-state migration when it is immutable repository configuration/,
);
assert.match(completionInventoryText, /AI Company runtime blueprint planning \| pass/);
assert.match(completionInventoryText, /AI Company runtime blueprint implementation \| pass/);
assert.match(verification, /id: 'ai-company-runtime-blueprint-planning'/);
assert.match(verification, /script: 'scripts\/smoke-ai-company-runtime-blueprint-planning\.mjs'/);
assert.match(verification, /id: 'ai-company-runtime-blueprint-implementation'/);
assert.match(verification, /script: 'scripts\/smoke-ai-company-runtime-blueprint\.mjs'/);

// Consumed planning evidence must point at the implemented, read-only foundation.
assert.equal(fs.existsSync(path.join(repoRoot, 'company', 'blueprint.json')), true);
assert.equal(fs.existsSync(path.join(repoRoot, 'src', 'runtime', 'company-blueprint.js')), true);
assert.match(runtimeContracts, /const STATE_SCHEMA_VERSION = 17/);
assert.doesNotMatch(runtimeContracts, /companyRuntime/);
assert.doesNotMatch(fileStore, /companyBlueprint|companyRuntime/);
assert.match(companyBlueprintLoader, /function loadCompanyBlueprint/);
assert.match(companyBlueprintLoader, /function readCompanyBlueprintStatus/);
assert.match(runtimeService, /companyBlueprintPath/);
assert.match(runtimeService, /companyRuntime/);
assert.match(server, /companyBlueprintPath: path\.join\(repoRoot, 'company', 'blueprint\.json'\)/);
assert.match(companyConfig, /COMPANY_MEMBER_STORAGE_KEY = 'orchestration\.company-members\.v1'/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted',
        implementation: 'accepted-and-implemented',
        provenance: 'consumed-by-dec-079',
      },
      compatibility: {
        currentSchemaVersion: 7,
        plannedAtAcceptanceSchemaVersion: 6,
        policyPersistencePlanned: false,
        snapshotChangePlanned: 'configured-path-additive-only',
      },
      currentRuntime: {
        companyBlueprintExists: true,
        companyBlueprintLoaderExists: true,
        companyRuntime: 'configured-readonly',
        council: 'opt-in-real-local-stub-with-legacy-deterministic-compatibility',
        browserRoster: 'presentation-only',
      },
      currentAuthority: {
        runtimeBlueprintImplementationPresent: true,
        councilRoleExecutionAllowed: true,
        durableWorkOrderRecordsAllowed: true,
        sequentialBuilderPreflightAllowed: true,
        builderLiveMutationAllowed: false,
        reviewerOrQaExecutionAllowed: false,
        providerCallsAllowed: 'explicit-council-opt-in-only',
        memoryPersistenceAllowed: false,
        autonomousSchedulingAllowed: false,
        sourceMutationAllowed: false,
        approvalBypassAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
