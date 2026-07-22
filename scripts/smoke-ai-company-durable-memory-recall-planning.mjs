import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ai-company-durable-memory-recall-planning-smoke';
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const plan = read('docs/84_ai-company-durable-memory-recall-persistence-plan.md');
const handoff = read(
  'docs/85_ai-company-durable-memory-recall-implementation-decision-handoff.md',
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
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

assert.match(plan, /^# AI Company Durable MemoryRecall Persistence Plan$/m);
assert.match(plan, /operator-delegated-ai-company-durable-memory-recall-planning-001/);
assert.match(plan, /approve-ai-company-durable-memory-recall-planning-only/);
assert.match(plan, /schema-v15 durable recorded MemoryRecall/);
assert.match(plan, /MemoryRecall\(status=recorded\)/);
assert.match(plan, /recordApproval\.decision=record/);
assert.match(plan, /reviewed-exact-memory-recall-for-local-audit/);
assert.match(plan, /one record per source MemoryItem/);
assert.match(plan, /GET  \/api\/memory-items\/:memoryItemId\/memory-recall/);
assert.match(plan, /POST \/api\/memory-items\/:memoryItemId\/persist-memory-recall/);
assert.match(plan, /Planning-only authority: accepted as `DEC-125`/);
assert.match(plan, /Complete fielded implementation handoff: documented as `DEC-126`/);
assert.match(plan, /implementation: accepted as `DEC-127` and implemented as the exact bounded slice/);

assert.match(handoff, /^# AI Company Durable MemoryRecall Implementation Decision Handoff$/m);
assert.match(handoff, /operator-decision-ai-company-durable-memory-recall-implementation-001/);
assert.match(handoff, /approve-ai-company-durable-memory-recall-implementation-slice/);
assert.match(handoff, /src\/runtime\/memory-recalls\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-666\.mjs/);
assert.match(handoff, /delegated self-approval for schema migration/);
assert.match(handoff, /The complete approval was supplied and consumed as `DEC-127`/);
assert.match(handoff, /^## Implementation Outcome$/m);

assert.match(decisionLog, /^### DEC-125$/m);
assert.match(decisionLog, /^### DEC-126$/m);
assert.match(decisionLog, /^### DEC-127$/m);
assert.match(masterPlan, /Durable MemoryRecall persistence planning-only authority는 `DEC-125`/);
assert.match(runtimeContract, /Durable MemoryRecall persistence planning은 `DEC-125`/);
assert.match(councilProtocol, /Durable MemoryRecall persistence planning은 `DEC-125`/);
assert.match(deliveryRoadmap, /Durable MemoryRecall persistence planning-only authority는 `DEC-125`/);
assert.match(
  deliveryRoadmap,
  /docs\/85_ai-company-durable-memory-recall-implementation-decision-handoff\.md/,
);
assert.match(inventory, /AI Company durable MemoryRecall persistence planning \| pass/);
assert.match(inventory, /AI Company durable MemoryRecall persistence implementation \| pass/);
assert.match(readme, /exact implementation is accepted by\s+`DEC-127`/);
assert.match(readme, /docs\/84_ai-company-durable-memory-recall-persistence-plan\.md/);
assert.match(
  readme,
  /docs\/85_ai-company-durable-memory-recall-implementation-decision-handoff\.md/,
);
assert.match(readme, /scripts\/smoke-ai-company-durable-memory-recall-planning\.mjs/);
assert.match(readme, /scripts\/smoke-ai-company-durable-memory-recall\.mjs/);
assert.match(readme, /scripts\/smoke-ui-slice-666\.mjs/);
assert.match(taskLedger, /ai-company-durable-memory-recall-planning-post-m7-1970/);
assert.match(taskLedger, /ai-company-durable-memory-recall-implementation-post-m7-1971/);
assert.match(
  lessons,
  /A response-only recall preview and a durable recall audit record are different authorities/,
);
assert.match(verification, /id: 'ai-company-durable-memory-recall-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-memory-recall-planning\.mjs'/,
);
assert.match(verification, /id: 'ai-company-durable-memory-recall-implementation'/);
assert.match(verification, /script: 'scripts\/smoke-ai-company-durable-memory-recall\.mjs'/);
assert.match(verification, /script: 'scripts\/smoke-ui-slice-666\.mjs'/);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 16/);
assert.match(contracts, /memoryRecall/);
assert.match(fileStore, /memoryRecalls/);
assert.match(runtimeService, /persistMemoryItemRecall/);
assert.match(server, /memoryItemPersistRecallMatch/);
assert.match(ui, /data-action="persist-memory-recall"/);
assert.equal(fs.existsSync(path.join(repoRoot, 'src/runtime/memory-recalls.js')), true);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-durable-memory-recall.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-666.mjs')),
  true,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-125',
        handoff: 'documented-dec-126',
        implementation: 'accepted-dec-127',
      },
      plannedPath: {
        fromSchemaVersion: 14,
        toSchemaVersion: 15,
        source: 'one-exact-source-current-memory-recall-preview',
        recordType: 'MemoryRecall',
        status: 'recorded',
        separateRecordApproval: true,
        oneRecordPerMemoryItem: true,
      },
      currentRuntime: {
        schemaVersion: 15,
        responseOnlyRecallPreview: true,
        durableMemoryRecall: true,
        recallListOrHistory: false,
        automaticRetrieval: false,
        memoryApplication: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableRecallAllowed: true,
        listHistoryAllowed: false,
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
