import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const plan = read('docs/86_ai-company-mission-memory-context-preview-plan.md');
const handoff = read(
  'docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const runtimeService = read('src/runtime/runtime-service.js');

assert.match(plan, /^# AI Company Mission Memory Context Preview Plan$/m);
assert.match(
  plan,
  /operator-delegated-ai-company-mission-memory-context-preview-planning-001/,
);
assert.match(plan, /approve-ai-company-mission-memory-context-preview-planning-only/);
assert.match(plan, /one deterministic response-only project-local MissionMemoryContextPreview/);
assert.match(plan, /status: context-review-ready/);
assert.match(plan, /operator-selected-recorded-recall-for-mission-context-review/);
assert.match(plan, /memory-context-preview-not-mission-or-prompt-injection/);
assert.match(plan, /POST \/api\/missions\/:missionId\/memory-context-preview/);
assert.match(plan, /uses `loadStateReadonly\(\)`/);
assert.match(plan, /never calls `saveState`/);
assert.match(plan, /Planning-only authority: accepted as `DEC-128`/);
assert.match(plan, /Runtime\/API\/UI implementation: accepted and implemented as `DEC-130`/);

assert.match(
  handoff,
  /^# AI Company Mission Memory Context Preview Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-mission-memory-context-preview-implementation-001/,
);
assert.match(
  handoff,
  /approve-ai-company-mission-memory-context-preview-implementation-slice/,
);
assert.match(handoff, /src\/runtime\/mission-memory-context-preview\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-667\.mjs/);
assert.match(handoff, /complete fielded approval was accepted and implemented as `DEC-130`/);
assert.match(handoff, /delegated self-approval for retrieval-sensitive runtime or UI implementation/);

assert.match(decisionLog, /^### DEC-128$/m);
assert.match(decisionLog, /^### DEC-129$/m);
assert.match(decisionLog, /^### DEC-130$/m);
assert.match(masterPlan, /Mission memory context preview planning-only authority는 `DEC-128`/);
assert.match(runtimeContract, /Mission memory context preview planning은 `DEC-128`/);
assert.match(councilProtocol, /Mission memory context preview planning은 `DEC-128`/);
assert.match(deliveryRoadmap, /Mission memory context preview planning-only authority는 `DEC-128`/);
assert.match(inventory, /AI Company Mission memory context preview planning \| pass/);
assert.match(readme, /Mission memory context preview planning-only authority is accepted by `DEC-128`/);
assert.match(readme, /docs\/86_ai-company-mission-memory-context-preview-plan\.md/);
assert.match(
  readme,
  /docs\/87_ai-company-mission-memory-context-preview-implementation-decision-handoff\.md/,
);
assert.match(
  readme,
  /scripts\/smoke-ai-company-mission-memory-context-preview-planning\.mjs/,
);
assert.match(
  taskLedger,
  /ai-company-mission-memory-context-preview-planning-post-m7-1972/,
);
assert.match(
  lessons,
  /A durable recall record is evidence that memory was reviewed, not permission to steer a Mission/,
);
assert.match(verification, /id: 'ai-company-mission-memory-context-preview-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-mission-memory-context-preview-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 15/);
assert.match(runtimeService, /function createMission\(input\)/);
assert.match(runtimeService, /status: 'draft'/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/mission-memory-context-preview.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-mission-memory-context-preview.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-667.mjs')),
  true,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ai-company-mission-memory-context-preview-planning-smoke',
      decision: {
        planning: 'accepted-dec-128',
        handoff: 'documented-dec-129',
        implementation: 'accepted-dec-130',
      },
      plannedPath: {
        schemaVersion: 15,
        sourceBoundary: 'one-exact-recorded-recall-and-one-exact-draft-mission',
        outputType: 'MissionMemoryContextPreview',
        persisted: false,
        selectionMode: 'exact-id-operator-selected',
      },
      currentRuntime: {
        schemaVersion: 15,
        durableMemoryRecall: true,
        exactMissionInspection: true,
        missionMemoryContextPreview: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: false,
        missionInjectionAllowed: false,
        workOrderInjectionAllowed: false,
        memoryApplicationAllowed: false,
        automaticRetrievalAllowed: false,
        recommendationAllowed: false,
        providerAllowed: false,
        sourceMutationAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
