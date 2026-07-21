import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const plan = read('docs/82_ai-company-memory-recall-preview-plan.md');
const handoff = read(
  'docs/83_ai-company-memory-recall-preview-implementation-decision-handoff.md',
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
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

assert.match(plan, /^# AI Company MemoryRecall Preview Plan$/m);
assert.match(plan, /operator-delegated-ai-company-memory-recall-preview-planning-001/);
assert.match(plan, /approve-ai-company-memory-recall-preview-planning-only/);
assert.match(plan, /one deterministic response-only project-local MemoryRecallPreview/);
assert.match(plan, /exact-id-operator-selected/);
assert.match(plan, /operator-selected-exact-memory-item-for-read-only-recall/);
assert.match(plan, /recall-preview-not-runtime-application/);
assert.match(plan, /automatic search, ranking, recommendation/);
assert.match(plan, /Runtime schema, durable record, Mission, task/);
assert.match(plan, /Planning-only authority: accepted as `DEC-122`/);
assert.match(plan, /documented as `DEC-123` and consumed by `DEC-124`/);
assert.match(plan, /implementation: accepted and completed/);
assert.match(plan, /POST \/api\/memory-items\/:memoryItemId\/recall-preview/);
assert.match(plan, /calls no\s+`saveState`/);
assert.match(plan, /schema v14 unchanged/);

assert.match(handoff, /^# AI Company MemoryRecall Preview Implementation Decision Handoff$/m);
assert.match(handoff, /operator-decision-ai-company-memory-recall-preview-implementation-001/);
assert.match(handoff, /approve-ai-company-memory-recall-preview-implementation-slice/);
assert.match(handoff, /src\/runtime\/memory-recall-preview\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-665\.mjs/);
assert.match(handoff, /The exact implementation outcome was supplied and consumed by `DEC-124`/);
assert.match(handoff, /delegated self-approval for retrieval-sensitive runtime or UI implementation/);
assert.match(handoff, /consumed by the exact/);

assert.match(decisionLog, /^### DEC-122$/m);
assert.match(decisionLog, /^### DEC-123$/m);
assert.match(decisionLog, /^### DEC-124$/m);
assert.match(masterPlan, /MemoryRecall preview planning-only authority는 `DEC-122`/);
assert.match(runtimeContract, /MemoryRecall preview planning은 `DEC-122`/);
assert.match(councilProtocol, /MemoryRecall preview planning은 `DEC-122`/);
assert.match(deliveryRoadmap, /MemoryRecall preview planning-only authority는 `DEC-122`/);
assert.match(inventory, /AI Company MemoryRecall preview implementation \| pass/);
assert.match(readme, /exact response-only implementation is accepted by `DEC-124`/);
assert.match(readme, /docs\/82_ai-company-memory-recall-preview-plan\.md/);
assert.match(readme, /docs\/83_ai-company-memory-recall-preview-implementation-decision-handoff\.md/);
assert.match(readme, /scripts\/smoke-ai-company-memory-recall-preview-planning\.mjs/);
assert.match(taskLedger, /ai-company-memory-recall-preview-planning-post-m7-1968/);
assert.match(taskLedger, /ai-company-memory-recall-preview-implementation-post-m7-1969/);
assert.match(
  lessons,
  /Exact record inspection and retrieval eligibility are different authorities/,
);
assert.match(verification, /id: 'ai-company-memory-recall-preview-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-memory-recall-preview-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 15/);
assert.match(runtimeService, /function previewMemoryItemRecall\(/);
assert.match(server, /memoryItemRecallPreviewMatch/);
assert.match(ui, /data-action="preview-memory-recall"/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/memory-recall-preview.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-memory-recall-preview.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-665.mjs')),
  true,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ai-company-memory-recall-preview-planning-smoke',
      decision: {
        planning: 'accepted-dec-122',
        handoff: 'documented-dec-123',
        implementation: 'accepted-dec-124',
      },
      plannedPath: {
        schemaVersion: 14,
        sourceBoundary: 'one-exact-unexpired-stored-memory-item',
        outputType: 'MemoryRecallPreview',
        persisted: false,
        retrievalMode: 'exact-id-operator-selected',
        automaticSelection: false,
      },
      currentRuntime: {
        schemaVersion: 14,
        durableMemoryItems: true,
        exactInspection: true,
        recallPreview: true,
        automaticSearchRankingRecommendation: false,
        memoryApplication: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: false,
        durableRecallAllowed: false,
        automaticRetrievalAllowed: false,
        recommendationAllowed: false,
        missionInjectionAllowed: false,
        memoryApplicationAllowed: false,
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
