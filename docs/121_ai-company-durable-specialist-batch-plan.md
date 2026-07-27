# AI Company Durable Specialist Batch Plan

## Purpose

Stage 4B turns the exact `DEC-176` response-only contract into one durable, request-scoped local
first attempt. It does not open a general parallel scheduler. One operator-approved request may
create one `SpecialistBatch` and exactly two `SpecialistCellAttempt` records, start the fixed
Researcher and QA workers concurrently, settle each result through the existing file-store CAS
boundary, and stop after exact inspection.

`parallelSpecialistsAllowed=false` remains authoritative for `StaffingPlan.mode=parallel-specialists`.
Stage 4B is a different and narrower authority: one post-Council evidence batch whose cell identities,
inputs, provider budget, attempt count, and output schemas were already fixed by `DEC-176`. Council
remains the default staffing mode, `parallelGroups=[]`, and no dynamic staffing policy is introduced.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-durable-specialist-batch-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-specialist-batch-planning-only` |
| `targetAuthority` | planning only for one schema-v20 durable SpecialistBatch and two SpecialistCellAttempt records with one request-scoped bounded concurrent local first attempt from one exact source-current DEC-176 preview |
| `targetSurface` | docs, current schema-v19 state and file-store CAS evidence, CompanyBlueprint and fixed role contracts, Stage 4B planning smoke, README, completion inventory, and task ledgers |
| `sourceEvidenceRefs` | `DEC-132`, `DEC-163`, `DEC-166`, `DEC-169`, `DEC-172`, `DEC-173` through `DEC-176`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md`, `docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md`, `company/blueprint.json`, `src/runtime/file-store.js`, `src/runtime/work-order-attempts.js`, `src/runtime/specialist-batch-preview.js`, and `src/execution/qa-node-check-runner.js` |
| `negativeEvidenceRefs` | schema v19 has no batch or cell sequence, map, validator, coordinator, settlement writer, execution route, exact durable inspection, or UI; the broad parallel StaffingPlan policy remains false; QA output is not persistence-redacted; retry, cancellation, recovery, provider, result-application, and background authority remain absent |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove planning-only Stage 4B docs and smoke while preserving DEC-176 runtime behavior and schema v19 |
| `focusedSmokeRefs` | `scripts/smoke-ai-company-durable-specialist-batch-planning.mjs` |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v20 migration, durable batch or cell creation, worker execution, actual concurrency, deadline enforcement, settlement writes, policy change, provider calls, retry, recovery, cancellation, result application, source mutation, Git/release, memory application, background scheduling, approval bypass, lifecycle mutation, and connectors |
| `approvalStatement` | The operator explicitly authorizes Stage 4B planning, evidence synchronization, one cohesive planning commit, and push through the active task. It does not authorize Stage 4B runtime implementation. |

`DEC-177` records this planning-only boundary. `DEC-178` records the complete fielded implementation
handoff in `docs/122_ai-company-durable-specialist-batch-implementation-decision-handoff.md`.
Neither decision authorizes schema migration, durable records, execution, concurrency, or policy
change. A complete valid operator implementation decision is reserved for `DEC-179`.

## Accepted Implementation Decision

`DEC-179` consumes the exact complete approval in the handoff and implements only this plan's
request-scoped first attempt. The runtime is now schema v20, persists one active batch plus its two
active cells atomically before worker invocation, launches the fixed local Researcher and QA
workers together, and settles each result through the planned failure-isolated serial fresh-state
CAS queue. Exact-id and current-chain inspection are available, while both durable maps remain
excluded from the generic snapshot.

This does not change `parallelSpecialistsAllowed=false`, create a `parallel-specialists`
StaffingPlan, or authorize retry, recovery, cancellation, providers, background scheduling, result
application, downstream records, source mutation, memory application, Git/release, policy bypass,
or connectors.

Planning-only `DEC-180` and handoff-only `DEC-181` now define the next failed-cell-only retry as a
separate schema-v21 append relationship. They do not change this schema-v20 first-attempt contract.
Implementation remains reserved for `DEC-182`, and active-attempt recovery remains a later Ops
authority.

## Current Evidence And Gap

Stage 4A already provides the exact source-current request, canonical digests, two fixed cell
contracts, contained file evidence, deadlines, and browser invalidation. The file store already
provides a regular-file guard, process lock, state-byte SHA-256 revision, fsync, atomic rename, and
compare-and-swap rejection. Stage 3 already proves active-before-execution attempt persistence and
interrupted-active blocking for sequential WorkOrders.

Stage 4B must add the missing lifecycle without reusing `WorkOrderAttempt`. Specialist cells are
independent read-only evidence workers, not Builder/Reviewer/QA delivery graph nodes. Reusing the
sequential attempt type would weaken its one-active-per-ExecutionPlan invariant and would incorrectly
attach specialist evidence to WorkOrders, Runs, Artifacts, or checkpoints.

## Policy Boundary

The implementation decision must preserve all of these statements together:

1. `CompanyBlueprint.defaultStaffingPolicy.defaultMode` remains `council`.
2. `parallelSpecialistsAllowed` remains `false`, and the loader continues to reject `true`.
3. No `parallel-specialists` StaffingPlan or `parallelGroups` is created.
4. The Stage 4B route accepts only the exact fixed `research-source-evidence` and
   `verify-plan-evidence` cells from a current `DEC-176` preview.
5. The separate operator execution approval authorizes one local first attempt only.

This is not a reusable policy exception. Dynamic cell selection, a third cell, provider mode,
automatic scheduling, or a second attempt fails closed.

## Schema V20

Schema v20 adds only:

```text
sequences.specialistBatch
sequences.specialistCellAttempt
specialistBatches
specialistCellAttempts
```

No existing record gains a reverse reference. Migration preserves every valid schema-v19 value and
creates no batch during boot, read, preview, render, or exact inspection.

### SpecialistBatch

One batch has exactly:

```text
id
persisted
projectId
missionId
staffingPlanId
staffingEntryId
councilSessionId
currentAttemptId
previewId
previewDigest
sourceDigest
executionApproval
executionApprovalDigest
cellAttemptIds
status
maxConcurrentCells
maxProviderCalls
batchDeadlineMs
deadlineAt
startedAt
completedAt
recordDigest
```

`persisted=true`, `maxConcurrentCells=2`, and `maxProviderCalls=0`. `cellAttemptIds` contains exactly
two ids in Researcher then QA position order. `executionApproval` preserves exactly `decision`,
`acknowledgement`, normalized `rationale`, and `reviewedAt`; rationale is trimmed, bounded to 500
characters, and rejected when credential-marker validation fails. `executionApprovalDigest` covers
that complete object so exact inspection can reproduce the authority digest. Status is `active`,
`completed`, `partial-failed`, or `failed`. It is `active` while either cell is active, `completed`
when both cells completed, `partial-failed` when exactly one completed and one failed, and `failed`
when both failed. A terminal batch uses the later cell `completedAt`; an active batch has
`completedAt=null`. `batchDeadlineMs` is the exact bounded Stage 4A request value, and
`deadlineAt` must equal `startedAt + batchDeadlineMs`.

### SpecialistCellAttempt

Each cell attempt has exactly:

```text
id
persisted
specialistBatchId
cellId
agentProfileId
role
position
attemptNumber
status
cellSpecDigest
sourceDigest
inputPathDigests
inputDigest
observedInputDigest
cellDeadlineMs
deadlineAt
resultSummary
resultDigest
failureReason
startedAt
completedAt
recordDigest
```

`attemptNumber=1`. Status is `active`, `completed`, or `failed`. `cellDeadlineMs` is the exact
bounded value from the matching Stage 4A cell spec, and `deadlineAt` must equal the smaller of
`startedAt + cellDeadlineMs` and the parent batch deadline. An active record has
`observedInputDigest=null` plus null result, failure, and completion fields. A completed record has
an exact `observedInputDigest` equal to `inputDigest`, a bounded `resultSummary`, its
`resultDigest`, `failureReason=null`, and a non-null `completedAt`. A failed record has null result
fields, one allowlisted `failureReason`, a non-null `completedAt`, and may retain a safely computed
observed digest or null when validation stopped before one could be computed. It may transition
once. Terminal records are never rewritten, deleted, retried, or inferred from process state.

`inputPathDigests` is the exact path-sorted bounded array inherited from the current preview. Every
entry has exactly `byteLength`, `path`, and `sha256`; path is project-relative and source-contained.
`recordDigest` covers the complete record except itself. `inputDigest` covers canonical
`inputPathDigests`, allowing validators and exact GET consumers to recompute the expected evidence
after a crash. `observedInputDigest` records the bounded bytes actually observed by the worker.
`resultDigest` covers the exact redacted terminal `resultSummary`.

`failureReason` is null unless status is `failed`. A failed record accepts exactly one of these
bounded codes:

```text
deadline-expired-before-worker
cell-deadline-exceeded
source-drift-before-worker
source-drift-during-worker
source-unavailable-after-start
source-byte-cap-exceeded-after-start
qa-spawn-failed
qa-output-cap-exceeded
runner-contract-failed
```

Every code is fixed ASCII contract text shorter than 64 characters. A valid QA syntax-check result
with a non-zero exit code is a completed evidence result whose summary verdict is failed; it is not
a runner failure and does not populate `failureReason`.

## Exact Start Request

The bounded JSON route is:

```text
POST /api/council-sessions/:councilSessionId/specialist-batches
```

The body has exactly these eight keys:

```text
compileSpec
evaluatedAt
executionApproval
previewDigest
previewId
sourceDigest
sourceRefs
specialistSpec
```

Incoming JSON member order has no meaning, but no missing or extra key is accepted. Canonical
normalization and digest input use the order above, while the four inherited Stage 4A objects keep
their existing exact nested-key orders.

`executionApproval` has exactly:

```text
decision=start-first-attempt
acknowledgement=execute-exact-readonly-specialist-batch-once
rationale
reviewedAt
```

The runtime recomputes the Stage 4A preview from the complete request and current state before any
write. `previewId`, `previewDigest`, and `sourceDigest` must match that recomputation.
`reviewedAt` is an exact ISO timestamp at or after the preview evaluation time and no more than five
minutes after the runtime clock. The complete normalized approval is hashed into
`executionApprovalDigest`.

Same-request replay returns the existing batch and never starts workers again. A different preview,
source, approval, or request for the same source chain returns `409`.

## Exact Transport Envelopes

The first successful POST returns `201`; exact replay returns `200`. Both success bodies have exactly:

```text
generatedAt
idempotent
specialistBatch
specialistCellAttempts
```

`idempotent` is boolean. `specialistCellAttempts` contains exactly two durable records sorted by
position then id. Exact GET returns `200` with exactly:

```text
generatedAt
specialistBatch
specialistCellAttempts
```

Malformed, missing, oversized, unsupported-content, stale-before-write, and exact-GET-not-found
failures return only `{error}` with the already planned `400`, `404`, `409`, `413`, or `415` status.
A settlement CAS conflict occurs after active evidence exists, so its `409` body has exactly
`{error, specialistBatchId}`. The error string is bounded contract text, never raw runner, path,
stdout, stderr, environment, stack, provider, or credential content. A runner failure or deadline is
durable cell evidence and therefore returns the normal success envelope after settlement rather than
an untracked transport error.

## Active-Before-Execution Transaction

Before either worker is invoked, the runtime:

1. loads one supported state and recomputes the complete `DEC-176` source gate;
2. validates both worker inputs without executing them;
3. constructs one active batch and two active first-attempt cells in memory;
4. migrates schema v19 to v20 additively;
5. saves the migration and all three active records in one CAS write;
6. reloads exact durable evidence;
7. only then starts the two local workers with immutable expected path, digest, and deadline input.

Invalid input, stale evidence, divergent replay, failed preflight, or migration validation creates no
record and leaves state bytes unchanged.

The save is not permission to trust the earlier preview bytes forever. Each runner must revalidate
its contained regular files against the active attempt's exact `inputDigest` after the active save.
Researcher builds its manifest from that same bounded byte snapshot rather than reading the files a
second time. QA hashes before checks, runs only against that observed source, and hashes again after
the final check. A pre-run mismatch fails with `source-drift-before-worker`; a post-run mismatch fails
with `source-drift-during-worker`. Neither outcome may report completed evidence.

## Request-Scoped Concurrency And Settlement

Researcher and QA start in the same request without awaiting one before starting the other. The
maximum in-flight worker count is two. There is no timer-driven scheduler, queue consumer, recursive
dispatch, background process, or cross-project worker.

Each worker completion enters one request-local settlement queue. The queue:

1. reloads the latest schema-v20 state;
2. requires the exact batch and cell to remain active with matching source and result input digests;
3. transitions only that cell;
4. recomputes the batch status from both current cells;
5. saves through the existing revision-bound CAS writer;
6. returns the exact persisted settlement.

The implementation must not wait for both workers and then perform one combined terminal save,
because that loses partial evidence after a crash. It also must not automatically retry a CAS
conflict. A conflict returns `409`; the affected cell remains active and inspectable for a later
separately authorized recovery decision.

One failed queue item must not poison the queue tail. The queue catches the previous item's failure
only to continue with the next fresh-state settlement; it returns each item's own success or failure
to the request join. Therefore a CAS conflict for the first completion may leave that cell active
while the second completion still settles durably. After all settlement attempts finish, any
conflict makes the POST return `409` with the batch id for exact GET inspection. It never retries or
rewrites the conflicted cell.

The response waits until both worker promises and their queued settlements finish. `Promise.allSettled`
may join already settlement-bound promises, but it cannot become a shortcut that delays all writes
until every worker returns.

## Worker And Output Contracts

### Researcher

The local Researcher produces a deterministic source evidence manifest, not a semantic LLM summary.
It consumes only the post-save revalidated bounded byte snapshot. Each canonical contained target is
opened once with `O_NOFOLLOW`; the descriptor's regular-file identity is matched back to the current
contained path before reading, and the read stops at the smaller remaining file or aggregate cap plus
one byte. A path swap or file growth therefore fails before outside or unbounded bytes can enter the
manifest. It returns:

```text
kind=source-evidence-manifest
files[] with relative path, byteLength, and sha256
totalByteLength
```

It does not persist source bodies, snippets, inferred findings, credentials, absolute paths, or
external content.

### QA

QA may run only the exact allowlisted shell-free `node --check <relative-path>` commands. Each check
uses the smaller remaining cell or batch deadline, a bounded output cap, an empty child environment,
and the same descriptor-bound contained byte capture. `node --check -` receives only the captured
bounded bytes, so command execution never resolves the source path a second time.

The durable summary contains only:

```text
kind=node-syntax-check
checks[] with relativePath, exitCode, timedOut, truncated, passed, stdoutDigest, stderrDigest
mutationDetected
verdict
```

Absolute executable paths, raw argv, stdout or stderr bodies, spawn error text, stack traces, process
environment, credentials, and source bodies are excluded. Spawn failures map to a bounded reason
code rather than raw error text.

### Deadline

One runtime `startedAt` value is captured before the initial active-record save:

```text
batch.deadlineAt = startedAt + batchDeadlineMs
cell.deadlineAt = min(startedAt + cellDeadlineMs, batch.deadlineAt)
```

The Stage 4A request supplies the batch budget and one budget for each fixed cell. The batch stores
`batchDeadlineMs`; each cell stores its matching `cellDeadlineMs`; all records store the resulting
ISO timestamps. Validators recompute both equations after reload and reject any mismatch. After the
active save and reload, a runner whose deadline is already reached settles failed with
`deadline-expired-before-worker`.

Researcher checks the remaining deadline before each bounded file read and after each hash. Crossing
the limit settles `cell-deadline-exceeded` without a completed manifest. QA uses the smaller remaining
cell or batch duration for every subprocess and checks the deadline again after every check and final
source hash. Internal QA subprocess termination after timeout or output-cap breach is safety
enforcement, not an operator cancellation authority. There is no cancel route or cancel status.
The serial settlement writer checks the clock again. If a worker returned on time but waited behind
another settlement until its deadline, the writer records `cell-deadline-exceeded` instead of storing
late completed evidence. Core cell validation rejects any completed record at or after its deadline.

## Inspection And UI

Exact inspection is:

```text
GET /api/specialist-batches/:specialistBatchId
```

Hard-refresh recovery uses one separate bounded current-chain locator:

```text
GET /api/council-sessions/:councilSessionId/specialist-batch
  ?staffingEntryId=:staffingEntryId
  &currentAttemptId=:currentAttemptId
```

The locator requires exactly those two query keys, validates all three ids against the current
Council and bound StaffingEntry source chain, and returns at most that chain's one immutable batch
with the same exact GET envelope. Missing input is `400`, no matching batch is `404`, and a stale
current chain is `409`. It is not a collection projection and accepts no pagination, filter, search,
or history input.

Both GET routes return one batch and its two cells only. The generic `/api/snapshot` projection
explicitly omits `specialistBatches` and `specialistCellAttempts`; the durable maps never become an
implicit list surface. There is no list, search, history, retry, recovery, cancel, delete,
result-application, WorkOrder, Mission injection, provider, source mutation, Git, or release route.

The Council UI may show one explicit `Run first attempt` action only while the `DEC-176` preview is
source-current and no batch exists. It renders active, partial, completed, or failed durable evidence
and provides no follow-up authority controls. Hard refresh reads the current Council,
StaffingEntry, and attempt ids from the existing snapshot, then uses the bounded current-chain
locator. It never enumerates a durable map or infers a batch id in the browser.

## Migration, Compatibility, And Rollback

- preserve every schema-v19 record and historical route;
- preserve `DEC-176` response-only preview behavior;
- preserve council-mode StaffingPlan, empty parallel groups, and the false broad parallel policy;
- preserve the schema-v19 WorkOrderAttempt scheduler and one-active-per-plan invariant;
- create no ExecutionPlan, WorkOrder, Run, Artifact, approval, inbox, checkpoint, Mission mutation,
  source mutation, provider attempt, memory item, commit, push, or release evidence;
- reject future, partial, key-mismatched, digest-invalid, cross-source, duplicate, or semantically
  invalid schema-v20 state;
- retain valid v20 records during rollback without downgrade, deletion, terminal rewrite, retry, or
  inferred completion.

Rollback disables the start route, UI action, and new settlement creation. Exact GET and validators
remain available so active and partial evidence stays inspectable.

## Verification Matrix

Focused runtime/API smoke must prove:

- additive v19-to-v20 migration and no record on boot, read, preview, render, or invalid input;
- one CAS save containing batch plus two active cells before either worker spy is called;
- exact eight-key start-request validation and canonical normalization with no missing or extra keys;
- both workers started before the first completion and maximum in-flight equals two;
- post-active-save source drift before either runner, source drift during QA, and exact
  `observedInputDigest` success binding;
- Researcher-first and QA-first settlement, one failure, two failures, partial reload, and terminal
  status derivation;
- first-settlement CAS conflict followed by successful second-cell settlement without queue poisoning
  or automatic retry;
- initial-save interruption and one-settlement interruption leave exact active evidence;
- exact replay never reruns a worker; divergent replay and CAS conflict do not overwrite evidence;
- durable `batchDeadlineMs` and per-cell `cellDeadlineMs`, exact reload-time `deadlineAt` arithmetic,
  expired-before-launch and Researcher deadline failure, real QA timeout/output cap, contained paths,
  empty child environment, and project-byte stability;
- exact active/completed/partial-failed/failed derivation, allowlisted failure codes, completed QA
  failure verdict evidence, and no raw-error fallback;
- no raw source, output body, absolute path, raw error, credential, transcript, provider payload, or
  downstream record;
- exact POST/GET envelopes and `400`, `404`, `409`, `413`, and `415` mappings;
- `201` first creation, `200` replay and GET, exact success keys, pre-write `{error}`, and
  post-active CAS-conflict `{error, specialistBatchId}` envelopes;
- exact id inspection plus the bounded current-chain locator, hard-refresh restoration, and explicit
  exclusion of both durable maps from generic `/api/snapshot`;
- `DEC-176`, schema-v19 WorkOrderAttempt, CompanyBlueprint, Council, provider, and historical route
  compatibility.

Focused UI smoke must prove exact source gating, explicit one-time action, durable refresh rendering,
safe partial and failure evidence, no duplicate dispatch, no cancel/retry/provider/downstream
controls, and desktop/mobile fit.

`node scripts/ui_qa_status.mjs` and `node scripts/verification_status.mjs` remain the aggregate gates.

## Stop Condition

Implementation stops with the exact schema-v20 durable first-attempt records, bounded local worker
execution, serial settlement, exact inspection, focused runtime/API/UI smoke, synchronized public
evidence, and one cohesive commit and push. Stage 4C retry/recovery and every downstream authority
remain blocked.
