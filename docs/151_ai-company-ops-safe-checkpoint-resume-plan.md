# AI Company Ops Safe Checkpoint Resume Plan

## Purpose

`DEC-221`은 결과가 불확실한 active attempt를 격리하고 늦은 settlement를 막는다. 하지만
격리된 작업을 다시 실행하지 않으므로 Mission은 그 자리에서 멈춘다. Stage 6C의 다음 권한은
하나의 안전한 재개 경로다.

첫 대상은 local-stub QA WorkOrderAttempt다. QA는 allowlisted `node --check`만 실행하고 source
mutation을 거부하며 Review Gate나 provider call을 만들지 않는다. Builder는 source mutation을,
Reviewer는 Review Gate와 Decision Inbox를 동반하므로 이번 경로에 포함하지 않는다.

## Completion Position

현재 required baseline은 schema v27과 `DEC-221`까지 구현됐다. 남은 순서는 다음과 같다.

1. Stage 6C: quarantined QA attempt의 exact safe-checkpoint resume
2. Stage 6D: Reviewer reconciliation 또는 explicit cancellation
3. Stage 7: reviewed `MissionContextAttachment`와 explicit context injection
4. Stage 8: provider-backed read-only role expansion
5. Phase 9: isolated local dogfood와 honest evidence close-out

이번 계획은 Stage 6C만 연다. Builder, Reviewer, specialist, cancellation, retry, worker
termination, automatic recovery는 그대로 닫아 둔다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-requested-ai-company-ops-safe-checkpoint-resume-planning-001` |
| `decisionStatus` | `approve-ai-company-ops-safe-checkpoint-resume-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v28 safe-checkpoint resume from one exact DEC-221 quarantined QA WorkOrderAttempt into one replacement QA WorkOrderAttempt |
| `targetSurface` | docs plus existing OpsAttemptDisposition, WorkflowCheckpoint, WorkOrderAttempt, shell-free QA, Advanced Ops evidence, and verification surfaces |
| `implementationPlanRefs` | this document |
| `sourceEvidenceRefs` | `DEC-097`, `DEC-172`, `DEC-185`, `DEC-219`, `DEC-221`, `docs/64_ai-company-checkpoint-resume-recovery-plan.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/149_ai-company-ops-attempt-quarantine-plan.md`, `src/runtime/workflow-checkpoints.js`, `src/runtime/work-order-attempts.js`, `src/runtime/ops-attempt-dispositions.js`, `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js`, `src/execution/qa-node-check-runner.js` |
| `negativeEvidenceRefs` | schema v27 retains quarantined source attempts as raw active records, active-attempt uniqueness does not distinguish quarantined from runnable work, operator-step settlement is not bound to an explicit attempt id, no immutable source-to-replacement resume record exists, and Builder Reviewer specialist cancel worker-termination automatic recovery remain unsafe or unsupported |
| `rollbackRefs` | disable the future resume entrypoint and UI command, stop new replacement creation, preserve valid schema-v28 resume records, source dispositions, source and replacement attempts, checkpoints, Runs and Artifacts, keep source settlement denial, perform no downgrade or deletion, and rerun focused compatibility UI QA README inventory and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-ops-safe-checkpoint-resume-planning.mjs`; runtime and UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v28 implementation, OpsAttemptResume persistence, replacement attempt creation or execution, Builder Reviewer or specialist resume, cancellation, worker termination, retry, rework, inferred result, automatic selection, parallel dynamic autonomous or background scheduling, provider-backed execution, source mutation, Mission or task close-out, runtime-agent Git or release, memory, policy mutation, approval bypass, collections, and connectors |
| `approvalStatement` | The operator approves planning only for one exact local-stub QA safe-checkpoint resume. Runtime, schema, API, UI, replacement attempt execution, and every wider recovery authority require a separate complete fielded decision. |

This planning authority is recorded as `DEC-222`. The complete implementation handoff is recorded as
`DEC-223`. Implementation remains reserved for an exact `DEC-224`.

## Why QA Comes First

A safe resume must do more than create another attempt. It must show that the old attempt cannot
settle, that the new worker cannot mutate source, and that the result settles only the replacement
attempt.

QA already has the narrowest executable contract:

- local-stub only;
- shell-free `process.execPath --check` commands;
- target allowlist and source digest checks;
- mutation detection;
- no Review Gate, Decision Inbox, provider, or source write;
- a durable `qa-ready` checkpoint and terminal `delivery-ready` boundary.

Reviewer can create a review item and decision while its source attempt is unresolved. Builder can
change source before a late settlement is denied. Those paths need separate reconciliation or
termination contracts and do not inherit QA authority.

## Exact Source Tuple

```text
one exact schema-v27 OpsAttemptDisposition(decision=quarantine)
+ its exact active WorkOrderAttempt(role=qa, action=run-qa)
+ the exact consumed qa-ready WorkflowCheckpoint referenced by that attempt
+ one source-current StaffingEntry-bound ExecutionPlan and QA WorkOrder
+ local-stub project/provider evidence
+ no prior OpsAttemptResume for the source disposition
+ explicit operator confirmation that the source worker has stopped
-> one schema-v28 immutable OpsAttemptResume
+ one replacement QA WorkOrderAttempt(attemptNumber=2)
-> persist both records atomically before one shell-free QA run
-> settle only the replacement attempt by exact id
-> append delivery-ready evidence on pass or stop failed without retry
```

The source disposition, source attempt, checkpoint, ExecutionPlan, and WorkOrder are not rewritten
to make the new attempt appear clean. The sidecar owns the relationship.

## Planned Schema v28

The migration adds only:

```text
schemaVersion = 28
sequences.opsAttemptResume
opsAttemptResumes{}
```

Migration rules:

- preserve every valid schema-v27 value;
- create no resume record or replacement attempt during migration, boot, read, GET, render, or
  invalid input;
- reject future, partial, duplicate, or semantically invalid schema-v28 state;
- validate the complete source tuple and replacement candidate before one atomic migration-plus-
  append save;
- preserve exact replay without sequence increment, worker invocation, or save;
- retain valid v28 evidence during rollback without downgrade, deletion, or source rewrite.

## OpsAttemptResume Contract

```text
id
projectId
executionPlanId
workOrderId
sourceDispositionId
sourceDispositionRecordDigest
sourceAttemptId
sourceAttemptRecordDigest
sourceCheckpointId
sourceCheckpointDigest
sourceInputDigest
sourceAuthorityDigest
replacementAttemptId
replacementAttemptStartDigest
action
role
sourceWorkerStopConfirmedAt
evaluatedAt
decision
authoritySummary
recordDigest
createdAt
```

Fixed values:

```text
action=resume-qa
role=qa
decision=resume-safe-checkpoint
authoritySummary.replacementQaAttemptAllowed=true
authoritySummary.sourceAttemptSettlementAllowed=false
authoritySummary.sourceAttemptMutationAllowed=false
authoritySummary.sourceMutationAllowed=false
authoritySummary.retryAllowed=false
```

Every wider authority flag is false. The record stores identifiers, timestamps, digests, and fixed
authority only. It contains no source bytes, prompt, transcript, command output, provider payload,
environment value, credential, secret, or free-form operator prose.

`recordDigest` is canonical SHA-256 over immutable fields except `id`, `createdAt`, and
`recordDigest`. One source disposition may have at most one resume record.

## Exact Request

The proposed command is:

```text
POST /api/ops/attempt-dispositions/:opsAttemptDispositionId/resume-safe-checkpoint
```

The exact sixteen-key body is:

```text
dispositionRecordDigest
sourceAttemptId
sourceAttemptRecordDigest
executionPlanId
expectedExecutionPlanDigest
checkpointId
checkpointDigest
inputDigest
authorityDigest
expectedWorkOrderId
action=resume-qa
evaluatedAt
sourceWorkerStopConfirmedAt
decision=resume-safe-checkpoint
acknowledgement=source-worker-stopped-and-read-only-qa-confirmed
expectedReplacementAttemptNumber=2
```

`sourceWorkerStopConfirmedAt` is an explicit operator-owned fact. It must be at or after the
quarantine record and no later than `evaluatedAt`. The runtime does not infer process termination.
If the operator cannot confirm the worker stopped, the command remains unavailable.

First write recomputes the current ExecutionPlan, WorkOrder, checkpoint, disposition, source
attempt, dependencies, target allowlist, QA commands, and source digest. Any mismatch fails before
save. Exact replay validates the retained record and request before mutable recomputation and never
runs QA again.

## Semantic Active Attempt Rule

Schema v27 correctly retains the source attempt as `status=active`; changing it would invent a
terminal outcome. Schema v28 therefore distinguishes raw record status from runnable authority.

- an active attempt with an exact retained quarantine disposition is not runnable;
- it remains inspectable and its settlement guard remains authoritative;
- one exact `OpsAttemptResume` may nominate one replacement attempt;
- active-attempt uniqueness counts the replacement, not the quarantined source;
- every generic active-attempt selector must ignore quarantined sources and require the exact
  replacement id when settling resumed work.

This rule is deterministic file-store/runtime logic. The browser cannot decide which attempt is
active.

## Attempt-Specific Settlement

The current operator-step completion path finds an active attempt by plan. That is insufficient
once the immutable source attempt and replacement coexist.

The future implementation must bind every StaffingEntry-backed Builder, Reviewer, and QA
completion/failure request to the `workOrderAttemptId` that started that worker. A source attempt
result names the quarantined id and fails at the DEC-221 guard. A resumed QA result names the
replacement id and may settle only that record.

This compatibility hardening creates no new Builder or Reviewer authority. It prevents an old
worker result from settling the replacement attempt.

## Execution And Stop Rules

The implementation may invoke one existing shell-free QA boundary after the atomic start save.

- Pass: settle replacement QA attempt, preserve source attempt and disposition, append the exact
  terminal delivery-ready checkpoint, and stop before package or close-out work.
- QA failure: settle replacement attempt as failed, leave the plan blocked with exact evidence, and
  stop without retry.
- Interruption: replacement attempt remains active and requires a later decision. It is never
  retried automatically.
- Late source result: settlement is denied by the original disposition and cannot settle the
  replacement id.

No action closes the Mission, persists a DeliveryPackage, retries QA, invokes a provider, changes
source, or creates another resume.

## Exact Inspection And UI

The exact locator is:

```text
GET /api/ops/attempt-resumes/:opsAttemptResumeId
```

No list, history, search, ranking, automatic target selection, or bulk resume is added.

Advanced Ops may show `Resume QA from safe checkpoint` only after loading the exact disposition,
source QA attempt, and current checkpoint evidence. The fixed acknowledgement and worker-stop
confirmation timestamp are mandatory. After start, the UI renders source and replacement evidence
and exposes no second resume, cancel, retry, Builder, Reviewer, provider, Git, or release command.

## Compatibility And Rollback

- Preserve DEC-097 ready-checkpoint resume/cancel for non-StaffingEntry reviewed-delivery plans.
- Preserve DEC-172 operator steps when no active or quarantined attempt exists.
- Preserve DEC-221 source-attempt immutability and settlement denial.
- Preserve non-quarantined WorkOrder and specialist settlement behavior.
- Preserve every standalone task, Council, Growth, provider, memory, commit, and release path.
- Exclude `opsAttemptResumes` from the generic snapshot.
- During rollback, disable creation and execution but keep exact inspection, source settlement
  denial, valid v28 records, attempts, Runs, Artifacts, and checkpoints.

## Planned Implementation Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/ops-attempt-resumes.js
src/runtime/runtime-service.js
src/execution/execution-coordinator.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-ops-safe-checkpoint-resume.mjs
scripts/smoke-ui-slice-715.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, decision docs, inventory, and task ledger may change only to keep evidence current.

## Focused Verification Plan

The runtime/API smoke must prove:

- atomic v27-to-v28 migration and no passive creation;
- exact sixteen-key request and fixed operator acknowledgement;
- QA-only role/action, local-stub mode, exact disposition, source attempt, checkpoint, plan,
  WorkOrder, dependency, source, command, and allowlist binding;
- source worker confirmation ordering and refusal when absent;
- one immutable resume record plus replacement QA attempt #2 in the same first save;
- source attempt, disposition, checkpoint, and parent bytes remain unchanged;
- semantic active-attempt uniqueness and exact replacement settlement;
- late source settlement denial cannot settle the replacement;
- one shell-free QA invocation, pass and fail stops, exact replay, exact inspection, reload, and
  rollback retention;
- Builder, Reviewer, specialist, cancellation, retry, process termination, provider, source,
  package, close-out, Git, memory, scheduling, policy, collection, bypass, and connector refusal;
- DEC-097, DEC-172, DEC-185, and DEC-221 compatibility.

The UI smoke must prove exact eligibility, mandatory acknowledgement and timestamp, safe stale
failure, exact source/replacement rendering, no second resume or wider command, refresh behavior,
and bounded desktop/mobile fit.

## Stop Condition

Planning is complete when DEC-222 and DEC-223, this plan, the handoff, planning smoke, completion
roadmap, README, inventory, and task ledger agree. Schema v28 and every runtime/UI action remain
blocked until one complete value-matching `DEC-224` is accepted.
