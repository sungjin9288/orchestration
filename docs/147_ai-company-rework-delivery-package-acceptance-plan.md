# AI Company ReworkDeliveryPackage Acceptance Plan

## Purpose

This document defines the next smallest vertical slice after `DEC-215`: one explicit append-only
acceptance fact for one exact immutable schema-v25
`ReworkDeliveryPackage(status=review-required)`. The source package remains unchanged. Acceptance
does not close Mission or task state, start retry or recovery, execute another role, mutate source,
or open Git, release, learning, scheduling, policy, collection, bypass, or connector authority.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-rework-delivery-package-acceptance-planning-001` |
| `decisionStatus` | `approve-ai-company-rework-delivery-package-acceptance-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v26 append-only ReworkDeliveryPackageAcceptance record from one exact source-current schema-v25 review-required ReworkDeliveryPackage |
| `targetSurface` | docs plus the existing schema-v25 ReworkDeliveryPackage record, bounded ReworkPlan inspection, read-only rework delivery UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-188`, `DEC-191`, `DEC-194`, `DEC-197`, `DEC-200`, `DEC-203`, `DEC-206`, `DEC-209`, `DEC-212`, `DEC-213`, `DEC-215`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/145_ai-company-durable-rework-delivery-package-plan.md`, `src/runtime/rework-delivery-packages.js`, `src/runtime/runtime-service.js` |
| `negativeEvidenceRefs` | current state is schema v25 with immutable review-required ReworkDeliveryPackage records and exact inspection only; no reworkDeliveryPackageAcceptance sequence map record digest accept route accepted read model UI action focused smoke or Mission/task close-out authority exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future accept and exact inspection entrypoints and UI action, stop new acceptance creation, preserve every valid schema-v26 acceptance and schema-v25 source record without downgrade deletion rewrite reopening or implicit close-out, keep DEC-215 package inspection available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-rework-delivery-package-acceptance-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v26 implementation, durable ReworkDeliveryPackageAcceptance creation, package rejection changes-requested supersession deletion replacement quarantine or source-package status mutation, Mission or task close-out or done, another QA attempt retry recovery resume cancellation or rework, provider-backed execution, source mutation expansion, runtime-agent commit push or release, memory or learning application, automatic parallel dynamic autonomous or background scheduling, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors |
| `approvalStatement` | The operator approves planning only for one exact append-only ReworkDeliveryPackage acceptance record. Implementation and every downstream lifecycle or execution authority require a later complete fielded decision. |

## Current Baseline Evidence

- `DEC-215` adds only schema v25, `sequences.reworkDeliveryPackage`, and
  `reworkDeliveryPackages`.
- A durable package is immutable, `persisted=true`, `status=review-required`, and
  `allowedActions=[]`.
- First package creation requires a fresh exact DEC-212 recomputation and separate bounded record
  approval.
- Exact package replay validates the retained record before mutable source recomputation.
- Exact-id and bounded ReworkPlan inspection do not require current source bytes and do not imply
  executability, acceptance, or close-out.
- The generic DeliveryPackage and DeliveryPackageAcceptance contracts remain ineligible for rework
  evidence.
- No ReworkDeliveryPackage decision record or accepted read model exists.

## Architecture Choice

Acceptance is a separate append-only fact:

```text
schema-v25 ReworkDeliveryPackage(status=review-required)
-> validate the immutable package and exact operator request
-> on first acceptance, freshly recompute DEC-212 from current source evidence
-> compare package, preview, evidence, source, checkpoint, attempt, Run, and Artifact digests
-> require decision=accept
-> atomically migrate and append one ReworkDeliveryPackageAcceptance
-> expose exact package-bound accepted evidence
-> stop before rejection, changes-requested, close-out, retry, recovery, or execution
```

The package record and every source record stay byte-equivalent after normalized serialization. The
read model may derive `reviewStatus=accepted`; it must not rewrite package `status`.

## Entry Gate

First acceptance requires all of the following:

1. one strict-loader-valid schema-v25 or valid migrated schema-v26 state;
2. one exact immutable `ReworkDeliveryPackage(status=review-required)` with no acceptance;
3. one exact accepted ReworkPlan and ReworkPlanAcceptance;
4. the exact DEC-203 mutation, DEC-206 Reviewer pass, DEC-209 QA pass, raw bounded Artifacts,
   current target bytes, and terminal `DELIVERY_READY` checkpoint;
5. a fresh complete DEC-212 recomputation using the exact nine source fields;
6. exact package `recordDigest`, `previewId`, `previewDigest`, `sourceDigest`, and
   `reworkDeliveryEvidenceDigest`;
7. exact `decision=accept` and canonical `evaluatedAt`;
8. empty unresolved items and no downstream package, Mission, task, retry, recovery, or execution
   record;
9. no divergent acceptance for the package, ReworkPlan, preview, or evidence lineage.

Malformed, stale, drifted, provider-backed, widened, raw-body-bearing, future-timestamped, or
downstream-authority input fails before sequence increment or save. Boot, migration, read, GET,
render, hydration, preview, or package persistence never creates acceptance.

## Planned State Schema v26

```text
schemaVersion = 26
sequences.reworkDeliveryPackageAcceptance
reworkDeliveryPackageAcceptances{}
```

Migration rules:

- preserve every valid schema-v25 domain value;
- initialize only the empty acceptance sequence/map;
- create no acceptance during migration, boot, read, GET, hydration, preview, or render;
- reject unknown future schemas and partial or semantically invalid schema-v26 state;
- validate the complete request, source recomputation, prospective record, uniqueness, and candidate
  state before one atomic migration-plus-append save;
- preserve valid schema-v26 evidence during rollback without downgrade or deletion.

## ReworkDeliveryPackageAcceptance Contract

```text
id
projectId
missionId
executionPlanId
reworkPlanId
reworkDeliveryPackageId
previewId
previewDigest
sourceDigest
reworkDeliveryEvidenceDigest
reworkDeliveryPackageRecordDigest
decision
authoritySummary
acceptanceDigest
createdAt
```

Fixed values:

```text
decision=accepted
authoritySummary.packageAcceptanceEvidenceAllowed=true
```

Every Mission/task close-out, package rejection or changes-requested, retry, recovery, execution,
provider, source, Git, release, memory, learning, scheduling, policy, collection, bypass, and
connector authority flag is false. No raw Artifact body, source bytes, absolute path, command output,
provider payload, prompt, transcript, environment value, credential, secret, or arbitrary prose is
persisted.

## Exact Request And Digest Binding

The route is:

```text
POST /api/rework-delivery-packages/:reworkDeliveryPackageId/accept
```

The body contains exactly:

```text
reworkPlanId
qaWorkOrderAttemptId
qaWorkOrderAttemptRecordDigest
qaRunId
qaEvidenceArtifactId
deliveryReadyCheckpointId
checkpointDigest
sourceDigest
qaInputDigest
evaluatedAt
previewId
previewDigest
reworkDeliveryEvidenceDigest
reworkDeliveryPackageRecordDigest
decision=accept
```

`acceptanceDigest` is canonical SHA-256 over every immutable identity, source/package/preview/evidence
digest, accepted decision, and closed authority summary. Only `id`, `createdAt`, and
`acceptanceDigest` itself are excluded.

- First valid acceptance returns `201` with one sequence increment and one record.
- Exact normalized replay validates the existing acceptance and immutable package before mutable
  source recomputation, returns `200` with `idempotent=true`, and performs no save.
- A divergent replay conflicts even if later source happens to match.
- Later source drift preserves valid package and acceptance evidence but cannot create a new
  acceptance, rewrite either record, or open close-out.
- At most one acceptance may bind a package, ReworkPlan, preview, and evidence lineage.

## Exact Inspection

```text
GET /api/rework-delivery-packages/:reworkDeliveryPackageId/acceptance
```

The response contains the immutable package, optional exact acceptance, and derived
`reviewStatus=review-required|accepted`. It is an exact locator, not a list, history, search, ranking,
recommendation, or automatic selection surface. Generic `/api/snapshot` excludes the acceptance map.
Inspection validates exact keys, source references, uniqueness, fixed authority, and canonical
digests without requiring current source bytes.

## UI Boundary

- Show one explicit `재작업 DeliveryPackage 승인` command only for a source-current package with no
  acceptance.
- Require exact acknowledgement of acceptance-only authority and show package, preview, evidence,
  record, and acceptance digests.
- Refresh may hydrate acceptance only through the exact package-bound locator.
- Accepted evidence is read-only and survives later QA/source projection drift.
- Render no reject, changes-requested, Mission/task close-out, retry, recovery, another QA,
  provider/source, commit, push, release, memory, scheduling, policy, bypass, or connector control.

## Compatibility And Rollback

- Preserve DEC-188 through DEC-215 behavior and all immutable records.
- Preserve schema-v24 DEC-212 preview response shape and schema-v25 package exact GET/persist routes.
- Keep the generic DeliveryPackageAcceptance and Mission close-out paths ineligible for rework
  evidence.
- Create no Approval, Decision Inbox item, Run, Artifact, WorkOrderAttempt, or checkpoint.
- Disable new accept/get/UI entrypoints during rollback, preserve valid schema-v26 evidence, keep
  package inspection available, and never downgrade or synthesize replacement evidence.

## Focused Verification Plan

Future implementation smoke must prove:

- exact additive schema-v25-to-v26 migration and no passive acceptance creation;
- exact fifteen-key body and `decision=accept` validation before write;
- first-write fresh DEC-212 recomputation over current bytes and bounded raw Artifacts;
- immutable package/source records, one canonical acceptance, unique lineage, and exact replay;
- replay-before-source-recompute and later source-drift retention;
- stale, malformed, divergent, extra/missing field, provider, future, raw-body, partial-schema, and
  downstream-record refusal with unchanged bytes;
- exact inspection, accepted read status, snapshot exclusion, reload, rollback retention;
- no Mission/task/plan/WorkOrder/attempt/checkpoint/Run/Artifact/Approval/Inbox/source/provider/Git/
  release/memory/learning/scheduling/policy mutation;
- DEC-212 and DEC-215 compatibility plus unchanged generic DeliveryPackage acceptance behavior;
- exact-gated UI action, safe failure, reload hydration, absent downstream controls, and desktop/mobile
  fit.

## Implementation Target Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/rework-delivery-package-acceptances.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-rework-delivery-package-acceptance.mjs
scripts/smoke-ui-slice-713.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add only the schema-v26 acceptance sequence/map.
2. Add strict record, source-reference, digest, semantic, and uniqueness validation.
3. Implement first-write source-current recomputation and replay-before-recompute.
4. Add exact package-bound GET and bounded POST routes.
5. Add acceptance-only UI command and read-only durable evidence.
6. Add focused migration/runtime/API/UI and compatibility smokes.
7. Synchronize README, inventory, decision docs, task ledger, UI QA, and aggregate evidence.
8. Perform adversarial review before operator-side commit and push.

## Acceptance Criteria

1. Schema v25 stays current until exact implementation approval.
2. Migration creates no acceptance and preserves every source record.
3. Only a fresh source-current exact DEC-215 package may receive first acceptance.
4. One explicit decision appends one immutable accepted fact.
5. Exact replay is no-write and remains available after later source drift.
6. Package status and digest never change.
7. Exact inspection and UI expose evidence only.
8. Every downstream authority remains blocked.
9. Focused, compatibility, README inventory, UI QA, and aggregate gates pass.

## Exclusions

- package rejection, changes-requested, supersession, deletion, replacement, quarantine, or mutation
- Mission/task close-out or done
- another QA attempt, retry, recovery, resume, cancellation, or rework execution
- provider-backed WorkOrders or source mutation expansion
- runtime-agent commit, push, release, merge, publish, or external deployment
- LearningCandidate, memory/skill application, next Mission, or policy mutation
- collection/list/history/search/ranking/recommendation/automatic selection
- automatic, parallel, dynamic, autonomous, or background scheduling
- approval bypass or external connectors

## Planning Status

Planning is complete as `DEC-216`. The complete fielded implementation handoff is `DEC-217` in
`docs/148_ai-company-rework-delivery-package-acceptance-implementation-decision-handoff.md`.
Schema/runtime/API/UI implementation remains blocked until one exact value-matching `DEC-218`.

## Verification

```bash
node scripts/smoke-ai-company-rework-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-durable-rework-delivery-package.mjs
node scripts/smoke-ui-slice-712.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
