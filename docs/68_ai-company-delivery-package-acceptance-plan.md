# AI Company DeliveryPackage Acceptance Plan

## Purpose

이 문서는 `DEC-100`이 만든 schema-v9 immutable `review-required` DeliveryPackage를 operator가
명시적으로 승인하는 다음 최소 vertical slice를 정의한다. 계획 대상은 exact source/package/
checkpoint digest에 결속된 append-only acceptance evidence 하나다. 기존 DeliveryPackage record는
수정하지 않으며 Mission/task close-out, done, commit, push, release 또는 learning을 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-delivery-package-acceptance-planning-001` |
| `decisionStatus` | `approve-ai-company-delivery-package-acceptance-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v10 append-only DeliveryPackageAcceptance record from one exact source-current schema-v9 review-required DeliveryPackage |
| `targetSurface` | docs plus the existing schema-v9 DeliveryPackage record, read-only Deliverables surface, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-098`, `DEC-100`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/66_ai-company-durable-delivery-package-persistence-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/delivery-packages.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v9 with immutable review-required packages only; no acceptance sequence map record digest route UI action focused smoke or Mission close-out authority exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future accept/get entrypoints and UI action, stop new acceptance creation, preserve valid schema-v10 acceptance and all source package/plan/checkpoint evidence, quarantine invalid records without deletion or downgrade, keep schema-v9 package inspection available, and rerun migration focused UI compatibility and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v10 implementation, durable acceptance creation, package rejection changes-requested supersession or deletion, Mission close-out or done, task close-out, commit package, local commit, push, release, LearningCandidate generation, memory or skill persistence, automatic retry or rework, parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact append-only DeliveryPackage acceptance record. Implementation and every downstream lifecycle or execution authority require a later complete fielded decision. |

## Current Baseline Evidence

- Current runtime state is schema v10; the immutable `deliveryPackage` sequence/map and per-plan refs
  introduced in schema v9 remain unchanged.
- A package can exist only for a source-current `delivery-ready` ExecutionPlan and its latest terminal
  `delivery-ready` WorkflowCheckpoint.
- The package digest covers normalized WorkOrder results, Reviewer/QA evidence, accepted risks,
  unresolved items, and the closed authority summary.
- Package creation is explicit, stale-safe, idempotent, reload-safe, and read-only after append.
- `DELIVERY_PACKAGE_STATUS` currently allows only `review-required`.
- `DEC-103` adds one exact acceptance record/get/action path and a derived accepted status. Mission
  done and task close-out linkage do not exist.

## Architecture Choice

Acceptance is a separate append-only fact, not an update to the immutable DeliveryPackage:

```text
schema-v9 review-required DeliveryPackage
-> recompute and compare current source/package/checkpoint tuple
-> explicit operator decision=accept
-> append one immutable DeliveryPackageAcceptance record
-> expose package + acceptance as a read-only review envelope
-> stop before Mission/task close-out or any commit/release authority
```

This preserves the package digest and audit history. The package record keeps its persisted
`status=review-required`; the read model may expose `reviewStatus=accepted` only when a valid matching
acceptance record exists. No package field is rewritten to simulate an event.

## Entry Gate

Future acceptance must require all of the following in one loaded state:

1. exact `deliveryPackageId` exists and remains strict-loader valid;
2. package status is `review-required` and no acceptance already exists for another tuple;
3. linked ExecutionPlan remains `delivery-ready` and source-current;
4. linked terminal WorkflowCheckpoint remains latest, terminal, and digest-matched;
5. a freshly recomputed response-only preview matches the persisted `previewId`, `sourceDigest`,
   `packageDigest`, `checkpointId`, and `checkpointDigest`;
6. every required WorkOrder is completed and Reviewer/QA evidence remains present and passed;
7. `unresolvedItems` is empty;
8. request shape is exact and contains `decision=accept` plus the complete digest tuple;
9. no Mission, task, commit, release, learning, provider, scheduling, or policy authority is inferred.

Any mismatch fails before write. Read, boot, migration, preview, hydration, and rendering never create
acceptance evidence.

## Planned State Schema v10

```text
schemaVersion: 10
sequences.deliveryPackageAcceptance
deliveryPackageAcceptances: {
  [acceptanceId]: DeliveryPackageAcceptance
}
```

Migration from valid schema v9 is additive:

- preserve every existing domain value byte-for-byte after normalization;
- initialize only an empty acceptance sequence/map;
- create no acceptance during migration;
- reject unknown future schemas and partial or semantically invalid v10 records;
- save migration and later append atomically;
- never downgrade valid v10 evidence during rollback.

## DeliveryPackageAcceptance Contract

```text
DeliveryPackageAcceptance
- id
- projectId
- missionId
- executionPlanId
- deliveryPackageId
- previewId
- sourceDigest
- packageDigest
- terminalCheckpointId
- terminalCheckpointDigest
- decision: accepted
- authoritySummary
- acceptanceDigest
- createdAt
```

Contract rules:

- Records are immutable and append-only.
- `decision` has one allowed value in this slice: `accepted`.
- At most one valid acceptance may exist per DeliveryPackage.
- Every identity and digest must match the source package and current runtime evidence.
- `authoritySummary` permits package acceptance evidence only. Mission/task close-out, done,
  commit/push/release, learning/memory, scheduling/providers, and policy mutation remain false.
- No prompt, raw provider output, transcript, secret, arbitrary filesystem path, or mutable source data
  is persisted.

## Digest And Idempotency Binding

`acceptanceDigest` is SHA-256 over a canonical key-sorted payload containing package identity,
preview/source/package/checkpoint digests, `decision`, and the closed authority summary. `id` and
timestamps are excluded from that digest.

The exact request tuple is:

```text
deliveryPackageId
previewId
sourceDigest
packageDigest
checkpointId
checkpointDigest
decision=accept
```

- Exact replay returns the existing record with `idempotent=true` and performs no write.
- Any differing tuple for a package with an acceptance fails as conflict without mutation.
- A stale request before first acceptance also fails without mutation.

## Runtime And API Plan

Planned runtime methods:

```text
getDeliveryPackageAcceptance(deliveryPackageId)
acceptDeliveryPackage(input)
```

Planned routes:

```text
GET  /api/delivery-packages/:deliveryPackageId/acceptance
POST /api/delivery-packages/:deliveryPackageId/accept
```

The POST route accepts only the exact tuple and `decision=accept`. It does not transition Mission,
task, ExecutionPlan, WorkOrder, checkpoint, run, artifact, approval, or inbox state and invokes no
existing commit/release coordinator.

## UI Boundary

- Add one explicit `패키지 승인` command only for a source-current package with no acceptance.
- Show package and acceptance digests, timestamp, and `accepted` evidence after reload.
- Label Mission/task close-out as a separate blocked next decision.
- Expose no reject, changes-requested, retry, Mission done, task close-out, commit, push, release,
  learning, memory, provider, scheduler, or policy action.
- Long ids and digests must fit desktop and mobile without horizontal overflow.

## Compatibility And Migration

- Preserve DEC-091 plan persistence, DEC-094 reviewed delivery, DEC-097 checkpoint recovery, and
  DEC-100 package persistence behavior.
- Keep the schema-v9 package record immutable and digest-stable.
- Preserve response-only preview and existing package GET/persist routes.
- Preserve standalone task commit-package/local-commit/release-package/close-out behavior outside
  the AI Company acceptance routes; acceptance must not invoke or bypass those gates.
- Create no approval or Decision Inbox item in this slice. The explicit accept request is the operator
  decision and is bound directly to the exact package tuple.

## Focused Verification Plan

Future implementation smoke must prove:

- atomic v9-to-v10 migration and zero acceptance creation on migration/read/boot/preview/render;
- exact tuple and `decision=accept` validation before write;
- source-current plan, terminal checkpoint, package digest, evidence, and empty unresolved items gate;
- one immutable acceptance, canonical digest, exact idempotent replay, reload retention;
- stale, malformed, duplicate-different, extra-field, missing-evidence, and invalid-v10 rejection with
  unchanged bytes;
- package record digest and all source Mission/plan/WorkOrder/checkpoint/run/artifact/approval/inbox
  evidence remain unchanged;
- Mission stays `executing`, plan stays `delivery-ready`, linked task stays out of `Done`;
- no commit package, local commit, push, release, LearningCandidate, memory, provider, scheduling, or
  policy mutation;
- DEC-091/094/097/100 and legacy Council/task compatibility;
- read-only UI hydration, exact-gated command, safe stale errors, idempotent replay, reload evidence,
  absent downstream controls, and responsive fit.

## Rollback Plan

1. Disable future accept/get entrypoints and UI action.
2. Stop new acceptance creation.
3. Preserve valid schema-v10 acceptance and every source record; never delete or downgrade evidence.
4. Quarantine invalid or partial records without synthesizing replacement acceptance.
5. Keep schema-v9 package inspection and response-only preview available.
6. Leave Mission `executing`, plan `delivery-ready`, task lifecycle unchanged, and all downstream
   authority blocked.
7. Rerun migration, focused runtime/UI, compatibility, README inventory, and aggregate verification.

## Implementation Target Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/delivery-package-acceptances.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-delivery-package-acceptance.mjs
scripts/smoke-ui-slice-658.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add schema-v10 constants and additive empty acceptance sequence/map migration.
2. Add strict exact-field, reference, digest, semantic, and uniqueness validation.
3. Implement canonical acceptance digest and one atomic exact-tuple append path.
4. Add read-only GET and explicit accept POST routes.
5. Add exact-gated Deliverables UI command and durable acceptance evidence.
6. Add focused migration/runtime/API/UI smokes and compatibility checks.
7. Synchronize docs, README, inventory, task ledger, UI QA, and aggregate verification.
8. Perform adversarial review before operator-side commit and push.

## Acceptance Criteria

1. Migration creates no acceptance and preserves schema-v9 evidence.
2. Only an exact source-current review-required package may be accepted.
3. One explicit request appends one immutable `accepted` record.
4. Exact replay is idempotent; stale or divergent requests never write.
5. Package content and digest never change.
6. Read-only acceptance evidence survives reload and fits desktop/mobile.
7. Mission/task/plan lifecycle and every downstream authority remain unchanged and blocked.
8. Focused, compatibility, UI QA, README inventory, and aggregate verification pass.

## Exclusions

- package rejection, changes-requested, supersession, deletion, or automatic rework
- Mission close-out/done or task close-out/Done
- commit package, local commit, push, release, merge, or publish
- LearningCandidate generation, memory persistence, skill promotion, or organizational learning
- retry scheduling, parallel/dynamic/autonomous/background execution, provider-backed WorkOrders
- provider expansion, profile/policy mutation, approval bypass, or external connectors

## Planning Status

- Planning-only authority: accepted as `DEC-101`.
- Complete fielded implementation handoff: documented as `DEC-102`.
- Schema/runtime/API/UI implementation: accepted as `DEC-103` and verified on current schema v10.
- Package acceptance is intentionally separate from Mission/task close-out.

## Verification

```bash
node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Current schema v10 permits only the exact append-only acceptance path accepted by `DEC-103`. Package
rejection/changes-requested, Mission/task close-out, done, commit/push/release, learning/memory, and
every broader authority remain blocked.
