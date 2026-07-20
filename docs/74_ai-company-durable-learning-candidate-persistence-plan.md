# AI Company Durable LearningCandidate Persistence Plan

## Purpose

이 문서는 `DEC-109`의 deterministic response-only LearningCandidate preview를 one local durable
`review-required` record로 승격하는 Phase 8 두 번째 vertical slice를 계획한다. Planning-only
authority는 exact terminal Mission evidence와 operator-owned `retrospectiveSpec`을 다시 검증하는
schema-v12 persistence boundary까지만 정의한다. Candidate review outcome, memory persistence, skill
promotion, provider generation, source/Git/release, scheduling, next Mission, policy mutation, approval
bypass, and connectors는 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-durable-learning-candidate-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-learning-candidate-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v12 durable LearningCandidate review-required record from one exact source-current schema-v11 response-only preview and completed Mission evidence tuple |
| `targetSurface` | docs plus the existing schema-v11 MissionCloseOut, LearningCandidate preview compiler, read-only runtime loader, Deliverables preview surface, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-100`, `DEC-103`, `DEC-106`, `DEC-107`, `DEC-109`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/70_ai-company-mission-task-close-out-plan.md`, `docs/72_ai-company-learning-candidate-preview-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/learning-candidate-preview.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v11 with no learningCandidate sequence map record validator digest persistence function GET or persist route durable UI focused persistence smoke or candidate review outcome; the current preview is persisted=false and browser-memory-only |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future persist and GET entrypoints and UI controls, stop new candidate creation, preserve valid schema-v12 records and every source Mission evidence record, never downgrade or delete durable evidence, keep the response-only preview available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-durable-learning-candidate-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v12 implementation, durable LearningCandidate creation, candidate acceptance rejection changes-requested expiry mutation quarantine supersession deletion or promotion, memory persistence, cross-Mission retrieval, skill promotion, provider-assisted generation, raw transcript artifact-body source-content or secret ingestion, Mission or task reopen, package mutation, standalone close-out, source mutation, commit, push, release, automatic retry rework scheduling or next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact schema-v12 durable review-required LearningCandidate record from the existing response-only preview. This does not approve schema/runtime/API/UI implementation, candidate review outcome, memory, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Runtime state is schema v11 with immutable MissionCloseOut, DeliveryPackage,
  DeliveryPackageAcceptance, ExecutionPlan, WorkflowCheckpoint, WorkOrder, review, QA, approval, and
  Council evidence for one completed Mission.
- `previewMissionLearningCandidate()` uses `loadStateReadonly()`, recomputes current package and QA
  evidence, validates the exact terminal tuple and retrospectiveSpec, and never calls `saveState`.
- `compileLearningCandidatePreview()` returns a deterministic deeply frozen `persisted=false` object
  with source-contained applicability and negative evidence, `redactionStatus=review-required`,
  `reviewerStatus=review-required`, and `promotionStatus=proposed`.
- The preview exists only in one bounded POST response and browser memory. There is no GET route,
  snapshot field, localStorage entry, sequence, map, durable id, createdAt, or review decision.
- Current runtime files contain no durable LearningCandidate validator or persistence function.
  Existing Growth Evidence Ledger, proposal record, and memory readiness surfaces are separate
  authority domains and cannot persist this candidate.

## Architecture Choice

The first durable learning slice is an immutable record promotion, not learning acceptance:

```text
schema-v11 completed Mission + exact terminal evidence
-> receive exact terminal tuple + retrospectiveSpec + previewId + candidateDigest + decision=persist
-> recompute the DEC-109 response-only preview from current state
-> reject stale, divergent, expired, malformed, redaction-unsafe, or authority-widening input
-> atomically migrate valid state to schema v12 when needed
-> append one immutable review-required LearningCandidate record
-> expose read-only durable evidence
-> stop before review outcome, memory/skill promotion, provider, source, Git, release, or scheduling
```

The persistence request never accepts a browser preview object as authority. It carries the same
operator-owned retrospectiveSpec and exact source tuple used by DEC-109; runtime recomputes the
canonical preview and compares `previewId` and `candidateDigest` before any write.

## Entry Gate

Future persistence must require all of the following:

1. exact Mission is `completed` and its linked control task is `Done`;
2. exact MissionCloseOut, DeliveryPackage, DeliveryPackageAcceptance, ExecutionPlan, terminal
   WorkflowCheckpoint, Builder/Reviewer/QA WorkOrders, passed review, QA artifact, approval, and
   Council evidence remain source-current and internally valid;
3. exact request tuple includes `missionId`, `linkedTaskId`, `executionPlanId`, `deliveryPackageId`,
   `deliveryPackageAcceptanceId`, `missionCloseOutId`, `previewId`, `sourceDigest`, `packageDigest`,
   `acceptanceDigest`, `checkpointId`, `checkpointDigest`, `closeOutDigest`, `candidateDigest`,
   `retrospectiveSpec`, and `decision=persist`;
4. runtime recomputes the current DEC-109 preview from the request retrospectiveSpec;
5. exact `previewId` and `candidateDigest` match that recomputation;
6. preview expiry remains after the persistence time; expiry is still metadata and creates no timer;
7. redaction and reviewer status remain `review-required`, promotion remains `proposed`, and every
   downstream authority remains false;
8. no durable LearningCandidate already exists for this Mission, except an exact idempotent replay.

Migration, boot, GET, snapshot hydration, UI rendering, preview generation, Mission close-out, or broad
continuation wording never creates a candidate.

## Planned State Schema v12

The later complete fielded decision may authorize only this additive migration:

```text
schemaVersion = 12
sequences.learningCandidate
learningCandidates{}
```

No LearningCandidate refs are added to immutable MissionCloseOut, DeliveryPackage, acceptance,
checkpoint, Mission, or task records. Read models resolve candidates by `sourceMissionId` and validate
the unique exact source tuple.

Migration requirements:

- Preserve every valid schema-v11 domain value byte-for-byte after normalization.
- Add an empty sequence and map only; migration creates no candidate.
- Keep each older domain migration predicate tied to its introduction schema version.
- Reject unknown future schemas and partial or semantically invalid schema-v12 records.
- Save migration and record append through the existing atomic temporary-file/rename boundary.
- Preserve valid schema-v12 records during rollback without downgrade, deletion, or source rewrite.

## Durable LearningCandidate Contract

```text
id
projectId
sourceMissionId
sourceMissionCloseOutId
sourceExecutionPlanId
sourceDeliveryPackageId
sourceDeliveryPackageAcceptanceId
sourceTerminalCheckpointId
sourceDeliveryPreviewId
sourceDigest
sourcePackageDigest
sourcePackageAcceptanceDigest
sourceTerminalCheckpointDigest
sourceMissionCloseOutDigest
sourceEvidenceRefs[]
lesson
applicability
  - summary
  - projectId
  - targetPathAllowlist[]
  - verificationCommands[]
negativeEvidence[]
redactionMode: source-summary-only
redactionStatus: review-required
expiry
  - expiresAt
  - status: review-required
reviewerStatus: review-required
promotionStatus: proposed
authoritySummary
previewId
candidateDigest
recordDigest
persisted: true
createdAt
```

All fields are immutable in this slice. The record contains normalized summaries, ids, paths,
commands, and evidence refs only. It excludes raw transcript, artifact body, source content, provider
payload, prompt, environment, credential, secret, chain-of-thought, and new generated prose.

## Digest And Idempotency Binding

- `candidateDigest` remains the DEC-109 canonical digest over source, retrospectiveSpec, fixed
  review-required statuses, and closed authority.
- `recordDigest` binds the immutable durable fields, candidate id, `persisted=true`, and createdAt;
  mutable review or promotion outcome fields do not exist.
- Persistence requires exact current source, package, acceptance, checkpoint, close-out, preview, and
  candidate digests plus the same retrospectiveSpec used for recomputation.
- Exact replay returns the existing record without sequence increment or save.
- A different candidate digest for a Mission that already owns a candidate is a conflict. This slice
  does not create revisions, supersession chains, or multiple candidates per Mission.
- Stale source, changed retrospectiveSpec, expired input, or invalid record evidence fails before
  migration or append and leaves serialized state unchanged.

## Runtime And API Plan

The later implementation decision may open only:

```text
GET  /api/missions/:missionId/learning-candidate
POST /api/missions/:missionId/persist-learning-candidate
```

The GET route is read-only and returns the current durable candidate envelope or an explicit absence.
The POST route accepts bounded JSON only, validates exact keys at transport and runtime boundaries,
recomputes the DEC-109 preview, checks `decision=persist`, and appends one record. It returns no
runtime path and calls no provider, memory, skill, scheduler, source mutation, Git, release, policy, or
connector code.

## UI Boundary

- Keep the response-only preview form and result available.
- Add one explicit `LearningCandidate 기록` action only for an exact current, unexpired preview.
- Require visible confirmation of `review-required`, `promotionStatus=proposed`, and blocked authority.
- Hydrate only durable id/digest/source/status evidence from the GET route.
- Rendering, refresh, or preview generation must never persist a candidate.
- Expose no accept/reject/changes-requested/expire/quarantine/supersede/delete/promote, memory/skill,
  provider, raw evidence, source, Git, release, schedule, next-Mission, policy, bypass, or connector
  control.
- Long ids, paths, commands, and summaries must fit desktop and mobile without horizontal overflow.

## Compatibility And Migration

- Preserve DEC-088/091/094/097/100/103/106/109 behavior, routes, exact tuples, and evidence.
- Preserve the response-only LearningCandidate route and object shape with `persisted=false`.
- Preserve no-bootstrap/no-migration semantics of `loadStateReadonly()`; the explicit persist command
  may use the migration-capable state loader only after exact request validation can still fail
  without candidate creation.
- Preserve standalone task commit/release close-out, Council, Growth Evidence Ledger, proposal, and
  memory readiness paths.
- Create no run, artifact, approval, Decision Inbox item, checkpoint, package, acceptance, close-out,
  memory item, skill, provider attempt, or next Mission.

## Focused Verification Plan

Future `scripts/smoke-ai-company-durable-learning-candidate.mjs` must prove:

- atomic v11-to-v12 migration with empty sequence/map, full value preservation, reload, and strict
  partial/future-schema refusal;
- no candidate on migration, boot, GET, snapshot, hydration, render, preview, invalid input, or expiry;
- exact transport/runtime keys, source tuple, retrospectiveSpec, preview id, candidate digest, and
  `decision=persist` binding;
- runtime recomputation rather than trusting a supplied preview object;
- one immutable normalized `review-required`/`proposed` record with deterministic record digest;
- exact replay idempotency and divergent same-Mission conflict;
- stale, malformed, extra-field, unsupported evidence/path/command, credential-marker, raw-body,
  expired, corrupt-source, digest, or authority-widening refusal with byte-identical state;
- no mutation to Mission, task, plan, WorkOrder, checkpoint, package, acceptance, close-out, run,
  artifact, review, approval, inbox, Council, project source, provider, memory, skill, Git, release,
  scheduling, next-Mission, policy, bypass, or connector evidence;
- DEC-088/091/094/097/100/103/106/109 and standalone/Council/Growth/proposal compatibility.

Future `scripts/smoke-ui-slice-661.mjs` must prove exact-gated persistence, read-only durable
hydration, response-only preview compatibility, safe stale/expired/API failures, absent downstream
controls, browser refresh behavior, and desktop/mobile fit.

## Rollback Plan

1. Disable future persist and GET routes plus the durable UI action and rendering.
2. Stop new candidate creation; do not auto-review, expire, quarantine, promote, or replace records.
3. Preserve valid schema-v12 candidate and every referenced source record.
4. Never downgrade schema, delete records, reopen a Mission/task, or rewrite source evidence.
5. Keep DEC-109 response-only preview available and every downstream authority blocked.
6. Rerun migration, focused runtime/UI, compatibility, README/inventory, UI QA, and aggregate gates.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/learning-candidates.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-durable-learning-candidate.mjs
scripts/smoke-ui-slice-661.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add strict schema-v12 sequence/map migration and durable record validator.
2. Add pure record normalization and digest helpers reusing the DEC-109 preview output.
3. Recompute exact current preview before one idempotent append.
4. Add bounded exact POST persistence and read-only GET entrypoints.
5. Add explicit durable action and read-only evidence rendering.
6. Add focused migration/runtime/API/UI/compatibility smokes.
7. Sync docs, README, inventory, task ledger, UI QA, aggregate verification, review, commit, and push.

## Acceptance Criteria

1. Valid schema-v11 state migrates additively without candidate creation or domain-value loss.
2. Only one exact current unexpired DEC-109 preview can create one immutable candidate.
3. Browser preview objects are never trusted as persistence authority.
4. Exact replay is idempotent; divergent same-Mission persistence fails without write.
5. Candidate remains review-required/proposed and grants no downstream authority.
6. No other runtime/source/provider/memory/skill/Git/release/scheduling/policy effect occurs.
7. Existing response-only preview and prior AI Company/standalone/Growth/proposal behavior is unchanged.
8. Focused runtime/API/UI, compatibility, README/inventory, UI QA, and aggregate gates pass.

## Exclusions

- schema-v12 or runtime/API/UI implementation before a complete fielded decision
- candidate review acceptance, rejection, changes requested, expiry mutation, quarantine,
  supersession, deletion, or promotion
- memory persistence, cross-Mission retrieval, skill creation/promotion, profile/policy learning
- provider-assisted generation or raw transcript/artifact/source/provider/env/secret ingestion
- Mission/task reopen, package mutation, standalone close-out, source mutation, commit, push, release
- retry/rework, parallel/dynamic/autonomous/background scheduling, or next-Mission creation
- provider-backed WorkOrders, provider expansion, approval bypass, or external connectors

## Planning Status

- Planning-only authority: accepted as `DEC-110`.
- Complete fielded implementation handoff: documented as `DEC-111`.
- Schema/runtime/API/UI implementation: blocked pending that complete fielded decision.
- Current runtime remains schema v11 with DEC-109 response-only preview only.
- Candidate review outcome, memory/skill promotion, providers, raw evidence, source/Git/release,
  scheduling, next-Mission, policy, bypass, and connectors remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs
node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs
node scripts/smoke-ai-company-learning-candidate-preview.mjs
node scripts/smoke-ui-slice-660.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
