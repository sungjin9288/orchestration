# AI Company Reviewed Delivery Continuation Plan

## Purpose

이 문서는 `DEC-091`의 schema-v7 durable ExecutionPlan이 Builder live-mutation approval에서
멈춘 뒤, 기존 local-stub mutation/reviewer spine과 제한된 deterministic QA를 순차 연결하고
response-only DeliveryPackage preview를 만드는 Phase 6 최소 pass-path를 정의한다. 이
planning-only 문서는 runtime, schema, API, UI, provider behavior 또는 source를 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-reviewed-delivery-planning-001` |
| `decisionStatus` | `approve-ai-company-reviewed-delivery-planning-only` |
| `targetAuthority` | planning only for one explicit local-stub reviewed-delivery continuation from one schema-v7 ExecutionPlan whose Builder is waiting at the exact live-mutation approval |
| `targetSurface` | docs plus the existing durable ExecutionPlan/WorkOrder records, task-owned live-mutation approval, builder/reviewer coordinator, artifact catalog, Council/Execution/Deliverables UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `DEC-091`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/60_ai-company-workorder-persistence-execution-plan.md`, `src/runtime/contracts.js`, `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js`, `scripts/serve-ui-slice-01.mjs` |
| `negativeEvidenceRefs` | no durable WorkOrder continuation exists after Builder waiting-gate; Builder live mutation is not linked back to the durable plan; Reviewer and QA WorkOrders cannot transition independently; no QA evidence artifact or safe QA runner exists; no DeliveryPackage composer or preview exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the reviewed-delivery continuation entrypoint, stop before new dispatch, restore failed Builder target files through the existing coordinator rollback, retain durable plan/run/artifact/approval evidence, discard response-only DeliveryPackage previews, and preserve the DEC-091 waiting-gate baseline |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-reviewed-delivery-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | reviewed-delivery implementation, source mutation through the WorkOrder path, Reviewer or QA WorkOrder dispatch, arbitrary verification command execution, durable DeliveryPackage records, mission done, changes-requested auto-rework, parallel/dynamic/autonomous/retry scheduling, provider-backed WorkOrders, memory/checkpoint expansion, approval bypass, runtime-agent commit/push/release, external connectors |
| `approvalStatement` | The operator approves planning only for one local-stub pass-path from the exact Builder live-mutation approval through Reviewer and constrained QA to a response-only DeliveryPackage preview. Implementation and all downstream authority require a later complete fielded decision. |

## Current Baseline Evidence

- `DEC-091` persists one source-current plan, three sequential WorkOrders, three handoffs, one linked
  task, and one digest-bound plan approval in schema v7.
- An approved plan can dispatch only Builder through planner, architect, task-breaker, and
  builder-preflight before stopping with Builder `waiting-gate` at a pending targeted live-mutation
  approval.
- `executionCoordinator.runBuilderLiveMutation()` already requires an exact approved preflight,
  target path allowlist, architecture containment, provider readiness, and rollback on failure.
- `executionCoordinator.runReviewer()` already requires the latest successful Builder bundle and
  records an independent review artifact and review-gate outcome.
- Durable WorkOrders do not reconcile those existing runs. Reviewer and QA remain
  `blocked-dependency`, and the durable plan has no reviewed-delivery continuation entrypoint.
- No independent QA runner or QA evidence artifact exists. Current `verificationCommands` are
  operator-owned strings and must not be passed to a shell.
- `DeliveryPackage` is documented as a future contract but has no runtime composer, record, route,
  or UI surface backed by current execution evidence.

## Architecture Choice

The first Phase 6 slice is one explicit sequential pass-path, not a scheduler or general command
runner.

```text
active plan + Builder waiting-gate
-> exact terminal live-mutation approval approved
-> explicit reviewed-delivery continue command
-> existing local-stub Builder live mutation
-> Builder WorkOrder completed
-> existing local-stub Reviewer
-> Reviewer WorkOrder completed only when verdict=passed
-> constrained node syntax QA
-> QA WorkOrder completed
-> response-only DeliveryPackage preview
-> stop with plan delivery-ready and mission not done
```

Any stale provenance, missing artifact, rejected approval, Builder failure, Reviewer
`changes-requested`, or QA failure stops the plan with evidence. The first slice does not create a
new Builder attempt or continue automatically.

## Entry Gate

The future implementation must require all of the following before mutation:

1. schema v7 state with one complete durable ExecutionPlan bundle;
2. plan status `active` and `activeWorkOrderId` pointing to the Builder WorkOrder;
3. Builder status `waiting-gate` with `stoppedAt=request-builder-live-mutation-approval`;
4. exact `terminalGateApprovalId` matching the linked control task, preflight artifact, preflight
   run, and `allowedNextAction=builder-live-mutation`;
5. approval status `approved` through the existing Decision Inbox;
6. source-current Mission, Council, plan digest, project path, and local-stub provider mode;
7. a separate explicit reviewed-delivery continue request bound to the plan and terminal approval.

Plan approval alone, terminal approval alone, server restart, UI refresh, or a repeated request does
not auto-dispatch this continuation.

## Durable Status Transitions

The implementation decision may authorize additive status values without changing schemaVersion 7:

```text
ExecutionPlan: active -> reviewing -> delivery-ready | blocked
Builder WorkOrder: waiting-gate -> active -> completed | blocked
Reviewer WorkOrder: blocked-dependency -> queued -> active -> completed | changes-requested | blocked
QA WorkOrder: blocked-dependency -> queued -> active -> completed | failed | blocked
```

- Every transition records `updatedAt`, run refs, artifact refs, and an explicit stop reason where
  applicable.
- Builder completion requires the exact live-mutation change-summary, patch, and diff bundle.
- Reviewer completion requires a terminal `passed` review artifact bound to that Builder run.
- `changes-requested` blocks QA and package composition. It does not silently requeue Builder.
- QA completion requires every planned safe check to pass and one `qa-evidence` artifact.
- `delivery-ready` is not Mission done and opens no commit or release authority.

## Constrained QA Contract

The first QA runtime is intentionally narrower than the existing free-form
`verificationCommands[]` field.

- Accept only commands that parse exactly as `node --check <relative-path>`.
- Resolve `node` to `process.execPath`; do not invoke a shell.
- Require the path to be repository-relative, non-symlinked outside the project, present in the
  WorkOrder target allowlist, and part of the actual Builder changed-file bundle.
- Reject flags, pipes, redirects, environment assignments, command substitution, extra positional
  arguments, script execution, package managers, network tools, and unsupported check kinds.
- Enforce bounded count, per-check timeout, output cap, deterministic cwd, and redacted environment.
- Capture command argv, exit code, duration, stdout/stderr digest, and truncation status without
  storing secrets or raw environment values.
- Recheck the Builder changed-file set before and after QA. Any additional mutation blocks the plan
  and prevents package composition.

This proves syntax evidence only. It is not a general test runner and does not claim semantic,
integration, security, or production verification.

## QA Evidence Artifact

The implementation may add one provenance-critical `qa-evidence` artifact type containing:

```text
schemaVersion
executionPlanId
workOrderId
builderRunId
reviewerRunId
sourceDigest
changedFiles[]
checks[]
  - kind = node-check
  - argv[]
  - exitCode
  - durationMs
  - stdoutDigest
  - stderrDigest
  - truncated
verdict = passed | failed
createdAt
```

The artifact stores no shell command string, source content, credentials, raw environment, or
provider payload. Failed evidence remains inspectable and cannot satisfy DeliveryPackage readiness.

## Response-Only DeliveryPackage Preview

The first composer returns a deeply frozen response object and creates no DeliveryPackage map,
sequence, artifact, approval, task, checkpoint, commit package, or release package.

```text
id
missionId
executionPlanId
deliveredArtifactRefs[]
workOrderResults[]
reviewerEvidenceRef
qaEvidenceRefs[]
verificationSummary
acceptedRisks[]
unresolvedItems[]
authoritySummary
sourceDigest
generatedAt
persisted = false
missionDone = false
```

Composition fails closed unless all three WorkOrders are complete, all required refs resolve, the
Reviewer verdict passed, QA passed, no blocking inbox item remains, and source/plan provenance is
current. `authoritySummary` must keep commit, push, release, memory, scheduling, provider expansion,
and Mission done false.

## Runtime And API Plan

The future complete fielded decision may open only explicit routes:

```text
POST /api/execution-plans/:id/continue-reviewed-delivery
GET  /api/execution-plans/:id/delivery-preview
```

The continue request requires exact `terminalGateApprovalId` and current `sourceDigest`. It is
one-shot and local-stub-only. The preview route recomputes from durable evidence and never persists
the package.

## UI Boundary

- Show the exact Builder live-mutation approval as the only continuation prerequisite.
- Add one explicit `검토·QA 이어서 실행` command only after that approval is approved.
- Show Builder, Reviewer, and QA status, evidence refs, stop reason, and package readiness.
- Render the DeliveryPackage preview under Deliverables with `response-only`, `mission not done`, and
  blocked downstream authority visible.
- Do not add retry, rework, parallel, provider, commit, push, release, or Mission done controls.

## Compatibility

- Keep schemaVersion 7 and the DEC-091 persistence/start routes unchanged.
- Keep Phase 4 response-only preview and legacy Council auto-chain unchanged.
- Reuse existing Builder live-mutation and Reviewer coordinator methods without changing their
  standalone task routes or provider behavior.
- Reject provider-backed WorkOrder mode for the new continuation.
- Add no CompanyBlueprint, AgentProfile, role prompt, Council schema, memory, checkpoint, commit, or
  release changes.
- Existing tasks that are not linked to a durable ExecutionPlan behave exactly as before.

## Focused Verification Plan

Future `scripts/smoke-ai-company-reviewed-delivery.mjs` must prove:

- exact plan, source digest, terminal approval, preflight artifact/run, and control-task binding;
- no action before the existing live-mutation approval is approved;
- one local-stub Builder mutation through the existing bounded coordinator and rollback behavior;
- durable Builder completion and dependency-ready Reviewer dispatch;
- independent passed Reviewer evidence bound to the Builder bundle;
- shell-free exact `node --check` parsing, allowlist/containment, timeout, output cap, and mutation
  detection;
- one QA evidence artifact and no QA run on changes-requested review;
- deterministic response-only DeliveryPackage preview with complete refs and false downstream
  authority;
- idempotent repeated continuation/preview, reload evidence, and no duplicate runs or artifacts;
- no commit package, commit, push, release, Mission done, checkpoint, memory, or provider expansion;
- DEC-091, Phase 4, legacy task routes, and provider Council compatibility.

Future `scripts/smoke-ui-slice-655.mjs` must prove approval-gated continuation, progress/failure
evidence, response-only package rendering, disabled downstream controls, safe reload, API errors,
and desktop/mobile fit. Aggregate verification remains `node scripts/verification_status.mjs`.

## Rollback Plan

1. Disable the reviewed-delivery continue and preview routes plus their UI commands.
2. Stop before any new dispatch; do not auto-resume a partially advanced plan.
3. Use the existing Builder coordinator rollback for a failed mutation before declaring the Builder
   WorkOrder complete.
4. Mark non-terminal WorkOrders/plan blocked with rollback evidence; preserve schema v7 records,
   source changes already accepted by a successful Builder run, runs, artifacts, approvals, and
   inbox history.
5. Discard response-only DeliveryPackage previews; do not delete review or QA evidence.
6. Keep DEC-091 plan inspection and waiting-gate behavior available and rerun focused plus aggregate
   verification.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/runtime-service.js
src/execution/execution-coordinator.js
src/execution/qa-node-check-runner.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-reviewed-delivery.mjs
scripts/smoke-ui-slice-655.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Documentation, README, task ledgers, artifact retention metadata, and verifier pins may change only
to keep evidence current. Provider adapters, CompanyBlueprint, role sources, Council contracts,
prompts, packs, commit/release coordinators, and unrelated project source files remain out of scope.

## Implementation Sequence

1. Add exact continuation preflight and additive durable status transitions.
2. Reuse the approved Builder live-mutation path and reconcile its exact evidence to Builder.
3. Queue and run existing Reviewer; stop on anything other than a passed terminal review.
4. Add the constrained node syntax QA runner and `qa-evidence` artifact.
5. Compose a deterministic response-only DeliveryPackage preview.
6. Add explicit API/UI controls and blocked downstream states.
7. Add focused runtime/API/UI/compatibility smokes, browser QA, security review, and aggregate proof.

## Acceptance Criteria

1. Invalid or stale input changes no state and starts no run.
2. Only the exact approved terminal live-mutation approval enables the separate continuation.
3. Builder source mutation uses the existing bounded coordinator and exact target rollback.
4. Reviewer runs only after Builder completion and remains independently evidenced.
5. Changes requested or Reviewer failure blocks QA and package composition without auto-rework.
6. QA executes only shell-free allowlisted node syntax checks and records bounded evidence.
7. DeliveryPackage is deterministic, response-only, source-current, and authority-closed.
8. Mission done, commit, push, release, provider expansion, scheduling, memory, and checkpoints remain
   unavailable.
9. DEC-091, Phase 4, legacy task execution, and Council behavior remain compatible.
10. Focused runtime/API/UI gates and aggregate verification pass.

## Exclusions

- durable DeliveryPackage records or schema v8
- Mission done or close-out
- automatic changes-requested rework or new Builder attempt
- arbitrary shell/test command execution
- parallel, dynamic, autonomous, retry, or checkpoint scheduling
- provider-backed WorkOrder execution or provider expansion
- memory persistence or runtime profile/policy mutation
- approval bypass, runtime-agent commit/push/release
- external connectors, multi-user coordination, staffing marketplace, budget/HR semantics

## Planning Status

- Planning authority: accepted as `DEC-092`
- Implementation decision handoff: documented as `DEC-093`
- Runtime/API/UI/source implementation: accepted as `DEC-094` from the complete fielded decision
- DEC-091 schema-v7 durable Builder waiting-gate baseline: preserved as the required entry boundary
- Implemented output: one provenance-critical `qa-evidence` artifact plus one response-only,
  deeply frozen DeliveryPackage preview; schema remains v7 and Mission remains not done
- Every exclusion and downstream authority: still blocked

## Verification

```bash
node scripts/smoke-ai-company-reviewed-delivery-planning.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/smoke-ai-company-workorder-persistence-execution.mjs
node scripts/smoke-ui-slice-654.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
