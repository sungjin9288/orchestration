import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-council-live-provider-planning-smoke';

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

const plan = read('docs/56_ai-company-council-live-provider-implementation-plan.md');
const handoff = read('docs/57_ai-company-council-live-provider-implementation-decision-handoff.md');
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const roadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionInventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const blueprint = read('company/blueprint.json');
const councilSessions = read('src/runtime/council-sessions.js');
const councilCoordinator = read('src/execution/council-coordinator.js');
const councilLocalStubAdapter = read('src/execution/providers/council-local-stub-adapter.js');
const openAiAdapter = read('src/execution/providers/openai-responses-adapter.js');
const retryPolicy = read('src/execution/providers/openai-responses-retry-policy.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company Council Live Provider Opt-In Implementation Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Implementation Objective',
  'Approved Target Surface',
  'Provider And Role Allowlist',
  'Normalized Output Contract',
  'Prompt And Data-Minimization Contract',
  'Provider Evidence Contract',
  'Execution And Call Budget',
  'Retry Timeout And Cancellation',
  'Runtime And API Compatibility Plan',
  'Persistence And Schema Compatibility',
  'UI Boundary',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Consumed Implementation Decision',
  'Implementation Status',
  'Verification',
]);

assertAll(planText, [
  /operator-delegated-ai-company-council-live-provider-planning-001/,
  /approve-ai-company-council-live-provider-planning-only/,
  /complete fielded decision이 `DEC-085`로 accepted/,
  /`real-local-stub` Council contract/,
  /`real-openai-responses`/,
  /OpenAI Responses provider opt-in/,
  /Strategist, Architect, Decomposer/,
  /Synthesis role: Conductor/,
  /existing normalized Council position and synthesis contracts/,
  /Raw prompt and raw provider response are not persisted/,
  /Retry only HTTP 429 and 5xx/,
  /injected `AbortSignal`/,
  /Missing key\/model\/fetch support fails readiness before the first request/,
  /Persisted state remains `schemaVersion: 6`/,
  /`createEmptyState` and file-store normalization are not edited/,
  /Preserve current synchronous `startRealCouncilForMission`/,
  /optional.*`skipped_missing_env`/,
  /Local-stub synthetic verification remains authoritative and unchanged/,
  /Implemented and verified under `DEC-085`/,
]);

assert.match(handoff, /^# AI Company Council Live Provider Implementation Decision Handoff$/m);
assertSections(handoff, [
  'Purpose',
  'Current Gate',
  'Accepted Outcome',
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
  /operator-decision-ai-company-council-live-provider-implementation-001/,
  /approve-ai-company-council-live-provider-implementation-slice/,
  /one explicit OpenAI Responses opt-in path for the existing Real Council normalized position and synthesis contract/,
  /implementationPlanRefs=docs\/56_ai-company-council-live-provider-implementation-plan\.md/,
  /compatibilityPlanRefs=keep schemaVersion 6/,
  /real-local-stub remains authoritative/,
  /scripts\/smoke-ai-company-council-live-provider-live\.mjs optional and skipped_missing_env/,
  /stillBlockedAuthorities=provider matrix expansion, standalone StaffingPlan runtime/,
  /It does not approve provider expansion, StaffingPlan, parallel scheduling, WorkOrders/,
  /self-approve implementation/,
]);

assert.match(decisionLog, /^### DEC-083$/m);
assert.match(decisionLog, /^### DEC-084$/m);
assert.match(decisionLog, /^### DEC-085$/m);
assert.match(decisionLog, /Accept `operator-delegated-ai-company-council-live-provider-planning-001`/);
assert.match(decisionLog, /records no implementation outcome, reads no credentials, calls no provider/);
assert.match(masterPlan, /^## Accepted Council Live Provider Implementation Authority$/m);
assert.match(runtimeContract, /complete fielded decision은\s+`DEC-085`로 accepted됐다/);
assert.match(councilProtocol, /Local-stub synthetic gate는\s+authoritative/);
assertAll(roadmapText, [
  /Phase 3 provider implementation은 `DEC-085`로 accepted되고 검증됐다/,
  /targetAuthority=planning only for one deterministic Mission-to-ExecutionPlan and inert WorkOrder draft compiler/,
  /complete fielded implementation outcome은 `DEC-085`/,
]);
assert.match(completionInventory, /AI Company Council live-provider implementation \| pass/);
assertAll(readmeText, [
  /Phase 3 Council live-provider implementation is accepted by `DEC-085`/,
  /One explicit `real-openai-responses` mode/,
  /Provider expansion and all downstream authority remain blocked/,
]);
assert.match(taskLedger, /ai-company-council-live-provider-planning-post-m7-1942/);
assert.match(lessons, /A provider-backed Council plan must preserve the local normalized contract/);
assert.match(verification, /id: 'ai-company-council-live-provider-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-council-live-provider-planning\.mjs'/,
);

// Consumed planning evidence must remain aligned with the implemented narrow adapter boundary.
assert.match(blueprint, /"allowedModes": \["local-stub", "openai-responses"\]/);
assert.match(blueprint, /"maxProviderCalls": 5/);
assert.match(councilSessions, /REAL_COUNCIL_MODE = 'real-local-stub'/);
assert.match(councilSessions, /PROVIDER_COUNCIL_MODE = 'real-openai-responses'/);
assert.match(councilCoordinator, /executePosition/);
assert.match(councilCoordinator, /executeSynthesis/);
assert.match(councilLocalStubAdapter, /createCouncilLocalStubAdapter/);
assert.match(openAiAdapter, /createOpenAIResponsesProviderAdapter/);
assert.match(openAiAdapter, /AbortController/);
assert.match(retryPolicy, /429/);
assert.match(retryPolicy, /status >= 500/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/execution/providers/council-openai-responses-adapter.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-council-live-provider.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-council-live-provider-live.mjs')),
  true,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted',
        implementation: 'accepted-dec-085',
        nextGate: 'Phase 4 Mission compiler and inert WorkOrder planning only',
      },
      plannedPath: {
        mode: 'real-openai-responses',
        adapter: 'openai-responses-only',
        requiredPositionRoles: ['strategist', 'architect', 'decomposer'],
        synthesisRole: 'conductor',
        execution: 'sequential-bounded',
        normalizedSchema: 'unchanged-from-real-local-stub',
      },
      compatibility: {
        schemaVersion: 6,
        localStubAuthoritative: true,
        legacyRoutesPreserved: true,
        existingSynchronousRuntimePreserved: true,
        fileStoreMigrationPlanned: false,
      },
      authority: {
        planningAllowed: true,
        providerImplementationAllowed: true,
        providerCallsAllowed: 'explicit-opt-in-only',
        credentialsAllowed: 'configured-project-reference-only',
        runtimeApiUiChangesAllowed: true,
        staffingPlanRuntimeAllowed: false,
        workOrderRuntimeAllowed: false,
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
