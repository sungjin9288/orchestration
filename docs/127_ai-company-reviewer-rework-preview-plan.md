# AI Company Reviewer Rework Preview Plan

## Purpose

이 문서는 schema-v21 operator-stepped WorkOrder path가 Reviewer
`changes-requested`에서 정확히 중단된 뒤, 어떤 mutation이나 retry authority도 열지 않고
Reviewer evidence를 one response-only `ReviewerReworkPlanPreview`로 정규화하는 Stage 5
planning-only vertical slice를 정의한다.

첫 구현 후보는 one operator-selected exact blocked ExecutionPlan과 그 latest Reviewer
WorkOrderAttempt만 검사한다. Source record, WorkOrder, attempt, Run, Artifact, Decision Inbox,
StaffingPlan, StaffingEntry, CouncilSession, Mission, CompanyBlueprint, role source, file-store,
schema, project source는 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-reviewer-rework-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-reviewer-rework-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only schema-v21 ReviewerReworkPlanPreview from one operator-selected exact source-current StaffingEntry-bound ExecutionPlan stopped at Reviewer changes-requested |
| `targetSurface` | docs plus the existing immutable StaffingPlan, StaffingEntry, CouncilSession, ExecutionPlan, WorkOrder, WorkOrderAttempt, Run, Review Artifact, Decision Inbox, Mission, CompanyBlueprint, role-source, and verification evidence surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-163`, `DEC-169`, `DEC-172`, `DEC-185`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md`, `src/runtime/contracts.js`, `src/runtime/work-order-attempts.js`, `src/runtime/mission-workorder-compiler.js`, `src/runtime/runtime-service.js`, `src/execution/coordinator/artifact-content.js`, `src/execution/execution-coordinator.js` |
| `negativeEvidenceRefs` | current schema v21 can persist a source-bound Reviewer WorkOrderAttempt with status changes-requested and structured review evidence, but has no response-only rework preview module, exact source digest contract, bounded finding normalization, unchanged-progress digest, preview route, browser-memory UI, focused runtime smoke, or authority to append or execute another Builder attempt |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove the future response-only module, exact GET route, browser-memory preview, and UI inspection action; preserve schema-v21 state and every source record and project byte-for-byte |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-reviewer-rework-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | `ReviewerReworkPlanPreview` implementation until a complete fielded decision, schema-v22 migration, durable ReworkPlan, new WorkOrder or WorkOrderAttempt append, retry, rework start, Builder preflight, approval creation or resolution, mutation, Reviewer or QA execution, automatic scheduling, provider-backed WorkOrders, source mutation, memory, runtime-agent Git/release, policy mutation, approval bypass, collection/list/search, and external connectors |
| `approvalStatement` | The operator approves planning only for one exact response-only Reviewer rework preview. Runtime, API, UI, schema, durable rework, retry, execution, mutation, approval, scheduling, and every downstream authority require a later complete fielded decision. |

This planning authority is recorded as `DEC-186`. The complete fielded implementation handoff is
recorded separately as `DEC-187`. The exact fielded implementation decision is accepted as
`DEC-188`.

## Current Baseline Evidence

- The source path is limited to one accepted council-mode StaffingPlan, immutable StaffingEntry,
  approved source-current real-local-stub Council synthesis, and its schema-v19-or-later durable
  ExecutionPlan.
- `completeReviewedDeliveryReviewer()` already binds the completed Reviewer Run and review Artifact
  to the Builder completion Run. A `changes_requested` verdict sets the Reviewer WorkOrder and latest
  `run-reviewer` WorkOrderAttempt to `changes-requested`, sets the ExecutionPlan to `blocked`, clears
  `activeWorkOrderId`, records `stopReason=reviewer-changes-requested`, and leaves QA unexecuted.
- `parseReviewerArtifactContent()` already extracts verdict, contract compliance, findings,
  reviewed evidence, verification evidence, next action, source Builder Run, and linked artifact
  ids from the canonical review Artifact.
- The original WorkOrders already persist the accepted `targetPathAllowlist` and
  `verificationCommands`. A rework preview does not need permission to widen either list.
- No contract currently turns that evidence into a canonical no-write preview or proves an
  unchanged-progress stop condition.

## Architecture Choice

The first Stage 5 slice is a deterministic projection, not a rework command:

```text
operator-selected exact blocked ExecutionPlan
-> load current schema-v21 state through the no-migration read path
-> validate accepted StaffingPlan and StaffingEntry source currency
-> validate Builder completion and latest Reviewer changes-requested lineage
-> read and parse one bounded canonical review Artifact
-> inherit the original target allowlist and verification commands exactly
-> normalize bounded redacted findings and compute sourceProgressDigest
-> return one deeply frozen persisted=false ReviewerReworkPlanPreview
-> stop with allowedActions=[]
```

The preview cannot create or approve a Builder retry. A later durable rework decision must bind the
exact preview, source progress digest, current source tuple, and a separately approved append
request.

## Exact Source Gate

Every valid preview requires all of the following:

1. The runtime state is supported schema v21 and is loaded without migration or save.
2. The ExecutionPlan belongs to one current active project and one non-terminal Mission.
3. The plan is bound through one immutable accepted StaffingPlan and StaffingEntry to one approved
   source-current real-local-stub Council synthesis.
4. The ExecutionPlan has `status=blocked`, `stopReason=reviewer-changes-requested`,
   `stoppedAt=reviewer`, and `activeWorkOrderId=null`.
5. Builder is `completed`, Reviewer is `changes-requested`, and QA remains
   `blocked-dependency` without any `run-qa` WorkOrderAttempt.
6. The latest attempt is the exact selected `run-reviewer` WorkOrderAttempt with role `reviewer`,
   `status=changes-requested`, `stopReason=reviewer-changes-requested`, and
   `attemptNumber=1`.
7. The attempt record digest, WorkOrder digest, dependency digest, authority digest, source digest,
   StaffingPlan, StaffingEntry, CouncilSession, plan, Mission, current CompanyBlueprint, and all
   role-source evidence validate through existing contracts.
8. The completed Reviewer Run belongs to the control task, points to the Builder completion Run,
   reports `mappedReviewStatus=changes-requested`, `rawVerdict=changes_requested`,
   `terminal=true`, and names the exact review Artifact.
9. The review Artifact is type `review`, belongs to the same task and Reviewer Run, parses
   successfully, names the exact Builder Run, has verdict `changes_requested`, and contains at least
   one bounded non-empty finding.
10. Any Decision Inbox item referenced by the Reviewer WorkOrder or attempt remains exact,
    source-bound, and read-only. Its presence does not grant rework authority.

Unknown ids, legacy unbound plans, provider-backed plans, terminal or active plans, stale digests,
missing findings, raw `fail` or `pass` verdicts, mismatched runs/artifacts, widened paths or commands,
existing QA execution, and source-current conflicts fail closed.

## Exact GET Contract

The future implementation candidate opens only:

```text
GET /api/execution-plans/:executionPlanId/reviewer-rework-preview
  ?reviewerWorkOrderId=:reviewerWorkOrderId
  &reviewerAttemptId=:reviewerAttemptId
  &reviewerRunId=:reviewerRunId
  &reviewArtifactId=:reviewArtifactId
  &expectedExecutionPlanDigest=:expectedExecutionPlanDigest
  &expectedAttemptRecordDigest=:expectedAttemptRecordDigest
  &evaluatedAt=:evaluatedAt
```

The route path and all seven query keys are required exactly once. Extra, missing, repeated, blank,
malformed, or oversized values fail before runtime dispatch. `evaluatedAt` is an exact canonical UTC
timestamp used only for bounded freshness evidence; it cannot precede Reviewer completion or be more
than five minutes ahead of runtime time.

The caller does not provide a review digest because the current durable Artifact contract has no
persisted record or content digest. The runtime derives `reviewEvidenceDigest` after exact id and
lineage validation as SHA-256 over canonical key-sorted JSON containing only:

```text
artifactId
artifactType
artifactTaskId
artifactRunId
contentSha256
parsedVerdict
sourceBuilderRunId
findingCount
```

`contentSha256` is calculated over the exact review Artifact bytes after enforcing the existing
artifact location plus a 64 KiB pre-read byte cap. Raw content never appears in the preview
response. A later durable rework command must resubmit and bind the returned
`reviewEvidenceDigest`, then recompute it before any write.

The GET route is not a collection, list, search, recommendation, polling command, retry endpoint, or
automatic plan selector. Transport returns `200` for one valid preview, `400` for malformed input,
`404` for an unknown exact source id, and `409` for stale or conflicting source evidence. Error
envelopes remain bounded and reveal no Artifact body, source content, provider payload, logs, or
absolute path.

## Finding Normalization

The parser output is normalized before preview construction:

- accept 1 through 32 findings;
- trim whitespace and collapse internal whitespace;
- reject control characters and values longer than 512 UTF-8 bytes;
- reject credentials, environment assignments, absolute paths, raw command output, prompt content,
  transcript content, provider payload, and artifact-body fragments;
- preserve source order and duplicates because two identical Reviewer findings are still two
  source observations;
- derive `findingId=rework-finding-NN`;
- derive `findingDigest` from `reviewArtifactId`, one-based index, and normalized text;
- return the normalized text only after redaction checks pass.

`contractCompliance`, `evidence`, and `verificationEvidence` contribute only canonical digests and
counts to provenance. Their raw strings are not returned.

## Preview Contract

The response contains exactly:

```text
id
schemaVersion
persisted
status
executionPlanId
reviewerWorkOrderId
reviewerAttemptId
reviewerRunId
reviewArtifactId
executionPlanDigest
attemptRecordDigest
reviewEvidenceDigest
sourceProgressDigest
evaluatedAt
nextAttemptNumber
maxAdditionalBuilderAttempts
targetPathAllowlist
verificationCommands
findings
evidenceRefs
allowedActions
blockedActions
previewDigest
```

Fixed values:

```text
schemaVersion=21
persisted=false
status=rework-review-required
nextAttemptNumber=2
maxAdditionalBuilderAttempts=1
allowedActions=[]
```

`targetPathAllowlist` and `verificationCommands` are byte-equivalent ordered copies from the
original accepted WorkOrder graph. The preview rejects any mismatch across Builder, Reviewer, QA,
ExecutionPlan verification plan, or current source.

`sourceProgressDigest` is canonical SHA-256 over the Builder completion Run id, Builder changed-file
list, Builder Artifact ids, Reviewer Run id, review Artifact id, normalized finding digests,
targetPathAllowlist, and verificationCommands. A future durable rework implementation must reject a
new attempt when the current progress digest equals the prior accepted rework attempt's progress
digest.

`evidenceRefs` contains identifiers and digests only:

```text
missionRef
staffingPlanRef
staffingEntryRef
councilSessionRef
builderWorkOrderRef
builderRunRef
reviewerWorkOrderRef
reviewerAttemptRef
reviewerRunRef
reviewArtifactRef
decisionInboxItemRefs
```

`blockedActions` is the exact ordered array:

```text
persist-rework-plan
append-builder-work-order
append-work-order-attempt
start-rework
run-preflight
request-approval
resolve-approval
mutate-source
run-reviewer
run-qa
retry-automatically
schedule-background
execute-provider
apply-memory
commit
push
release
mutate-policy
bypass-approval
enumerate-rework-plans
```

The preview digest is SHA-256 over canonical key-sorted JSON of every normalized response field
except `id` and `previewDigest`. `id` is
`reviewer-rework-preview-${previewDigest.slice(0, 16)}`. Repeating the exact request against
unchanged state and Artifact bytes returns byte-equivalent content. The complete result is deeply
frozen.

## UI Boundary

The future UI may expose one `Preview rework plan` action only beside an exact source-current
Reviewer `changes-requested` stop already loaded in the authoritative Execution surface. The result
lives only in browser memory and is cleared on refresh, Mission or plan change, source digest change,
input change, failed recomputation, or navigation away from the exact plan.

The UI may show normalized findings, inherited target paths, inherited verification commands,
attempt cap, evidence refs, and blocked actions. It must not show `Retry`, `Start rework`, `Approve`,
`Run Builder`, `Run Reviewer`, `Run QA`, `Commit`, `Push`, or `Release` controls.

## Compatibility And Rollback

- Keep `STATE_SCHEMA_VERSION=21`; do not edit `createEmptyState`, file-store normalization,
  migrations, sequences, maps, or durable record validators.
- Preserve DEC-091 plan persistence, DEC-094 reviewed delivery, DEC-097 checkpoint behavior,
  DEC-169 StaffingEntry binding, DEC-172 stepped scheduling, DEC-176/179/182 specialist paths, and
  DEC-185 Ops inspection.
- Preserve unbound legacy Council and WorkOrder behavior without making it eligible for this preview.
- Create no approval, Decision Inbox item, Run, Artifact, WorkflowCheckpoint, WorkOrder,
  WorkOrderAttempt, ReworkPlan, browser-local durable preference, or provider attempt.
- Rollback removes only the response-only module, route, UI action, and browser-memory result.

## Implementation Target Surface

The future exact implementation decision may touch only:

```text
src/runtime/reviewer-rework-preview.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-reviewer-rework-preview.mjs
scripts/smoke-ui-slice-703.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, docs, and task ledgers may change only to keep evidence current. Contracts, file-store,
execution coordinator, provider adapters, prompts, packs, source files, Git, release, memory, and
policy modules remain out of scope.

## Focused Verification Plan

`scripts/smoke-ai-company-reviewer-rework-preview.mjs` must prove:

- one exact source-current StaffingEntry-bound Reviewer changes-requested stop;
- exact plan, WorkOrder, attempt, Run, Artifact, Builder, Mission, StaffingPlan, StaffingEntry,
  CouncilSession, CompanyBlueprint, and role-source lineage;
- exact seven-key GET transport and 64 KiB pre-read Artifact cap;
- valid structured review parsing, 1..32 bounded redacted findings, duplicate preservation, and
  canonical finding ids and digests;
- byte-equivalent inherited target allowlist and verification commands;
- attempt cap one, next attempt two, source progress digest, allowedActions empty, ordered blocked
  actions, canonical preview digest/id, deep freeze, and byte-equivalent replay;
- malformed, missing, extra, repeated, oversized, unknown, stale, legacy-unbound, provider-backed,
  active, terminal, pass/fail, missing-finding, QA-already-run, path/command-widened, raw-body,
  credential, and lineage-conflict refusal;
- zero `saveState`, migration, record creation, worker/provider invocation, approval/inbox/run/
  artifact/checkpoint creation, source mutation, Git/release, memory, or policy mutation;
- unchanged DEC-091, DEC-094, DEC-097, DEC-169, DEC-172, DEC-179, DEC-182, and DEC-185 behavior.

`scripts/smoke-ui-slice-703.mjs` must prove exact source eligibility, browser-memory invalidation,
bounded safe rendering, absent downstream controls, unchanged existing actions, and desktop/mobile
fit.

## Rollback Plan

1. Disable the exact GET route and UI preview action.
2. Remove the response-only module and browser-memory result.
3. Preserve schema-v21 state, review Artifact bytes, source records, and project files unchanged.
4. Keep exact plan, attempt, run, Artifact, inbox, checkpoint, specialist, and Ops inspection paths.
5. Rerun focused compatibility, README inventory, UI QA, and aggregate verification.

## Acceptance Criteria

1. The implementation preserves schema v21 and performs no state or source write.
2. Only one exact source-current StaffingEntry-bound Reviewer changes-requested stop is accepted.
3. The original target allowlist and verification commands are inherited without widening.
4. Review Artifact bytes are capped before read and never returned.
5. Findings are bounded, source-ordered, duplicate-preserving, and redaction-safe.
6. The source progress digest binds Builder progress and exact Reviewer findings.
7. The preview caps the next Builder attempt at one and does not create it.
8. `allowedActions=[]` and every mutation/execution action remains visibly blocked.
9. No endpoint enumerates or automatically selects plans, attempts, Artifacts, or findings.
10. Exact replay is canonical and the response is deeply frozen.
11. UI stores the preview in browser memory only and exposes no downstream authority controls.
12. Existing Council, WorkOrder, checkpoint, specialist, Ops, provider, source, Git/release, memory,
    and policy behavior remains compatible.
13. Focused runtime/API/UI, UI QA, and aggregate verification pass.

## Implemented Status

`DEC-188` consumes the exact fielded handoff and implements only this response-only boundary:

- `src/runtime/reviewer-rework-preview.js` owns exact request/source/response keys, bounded
  source-ordered duplicate-preserving findings, canonical digests, attempt cap, and deep freeze.
- `src/runtime/runtime-service.js` loads supported schema-v21 state without migration, validates the
  complete source-current bound lineage, enforces a regular non-symlink 64 KiB pre-read Artifact
  cap, and performs no save.
- `GET /api/execution-plans/:executionPlanId/reviewer-rework-preview` requires the exact seven query
  keys once and returns bounded `200`, `400`, `404`, or `409` evidence.
- The UI exposes only `Preview rework plan` on the exact Reviewer stop and clears response-only
  browser memory on refresh, Mission/task/surface change, source change, or failure.
- `scripts/smoke-ai-company-reviewer-rework-preview.mjs` and
  `scripts/smoke-ui-slice-703.mjs` prove the focused runtime/API/UI boundary.
- Planning-only `DEC-189` and handoff-only `DEC-190` now define the next immutable schema-v22
  ReworkPlan record boundary in `docs/129_ai-company-durable-reviewer-rework-plan.md` and
  `docs/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff.md`.

## Still Blocked

Schema-v22 durable ReworkPlan implementation requires the exact DEC-191 decision. Builder WorkOrder
or WorkOrderAttempt append, retry, rework start,
preflight, approval, source mutation, Reviewer/QA execution, automatic scheduling, providers,
memory, runtime-agent Git/release, policy mutation, approval bypass, collections, and connectors
remain separately gated.
