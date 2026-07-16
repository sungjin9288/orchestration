# AI Company Mission And Task Close-Out Plan

## Purpose

이 문서는 `DEC-103`의 exact append-only DeliveryPackage acceptance를 소비해 one AI Company
Mission과 그 linked control task를 명시적으로 종료하는 다음 최소 vertical slice를 정의한다.
계획 대상은 one schema-v11 `MissionCloseOut` event와 같은 atomic save 안의 task `Review -> Done`,
Mission `executing -> completed` transition이다. Standalone task commit/release/close-out coordinator,
local commit, push, release, learning 또는 다음 Mission 자동 생성은 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-mission-task-close-out-planning-001` |
| `decisionStatus` | `approve-ai-company-mission-task-close-out-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v11 atomic Mission and linked control-task close-out from one exact source-current schema-v10 accepted DeliveryPackage evidence tuple |
| `targetSurface` | docs plus the existing schema-v10 DeliveryPackage, DeliveryPackageAcceptance, ExecutionPlan, WorkflowCheckpoint, Mission, linked control task, and read-only Deliverables evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-100`, `DEC-101`, `DEC-103`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/68_ai-company-delivery-package-acceptance-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/delivery-package-acceptances.js`, `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v10 with accepted package evidence only; no missionCloseOut sequence map record digest exact route UI action focused close-out smoke or atomic Mission/task terminal transition exists, and the standalone close-out coordinator requires commit/release evidence that this slice must not invoke |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future mission close-out get/post entrypoints and UI action, stop new terminal transitions, preserve valid schema-v11 close-out records and completed Mission/task state without downgrade or synthetic reopen, keep schema-v10 package/acceptance inspection available, and rerun migration focused UI compatibility README inventory and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-mission-task-close-out-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v11 implementation, Mission close-out or completed transition, linked control task close-out or Done transition, MissionCloseOut record creation, close-out reversal reopening cancellation supersession or deletion, DeliveryPackage rejection changes-requested supersession or deletion, standalone commit-package local commit release-package or close-out execution, runtime-agent commit, push, release, LearningCandidate generation, memory or skill persistence, automatic retry rework or next-Mission creation, parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact atomic AI Company Mission and linked control-task close-out. Schema/runtime/API/UI implementation and every commit, release, learning, scheduling, provider, policy, or connector authority require a later complete fielded decision. |

## Current Baseline Evidence

- Current runtime is schema v10 with immutable schema-v9 DeliveryPackage records and append-only
  schema-v10 DeliveryPackageAcceptance records.
- A valid acceptance is bound to the exact package, preview, source, and terminal-checkpoint digests.
- The accepted source package remains `review-required`; only the read model derives `accepted`.
- The linked ExecutionPlan remains `delivery-ready`, required Builder/Reviewer/QA WorkOrders are
  completed, the terminal WorkflowCheckpoint remains `delivery-ready`, and unresolved items are empty.
- The linked control task remains `Review` with passed review evidence and the Mission remains
  `executing` because package acceptance deliberately opened no lifecycle transition.
- `transitionTaskLifecycle` already enforces review and active-gate closure before `Done`, while
  `syncMissionExecutionStateFromTask` derives `completed` from a reviewed Done task. Neither method is
  currently bound to accepted package evidence or one atomic Mission close-out command. A direct
  runtime consumer could therefore terminalize the linked control task and then synchronize the
  Mission without creating MissionCloseOut evidence unless the future implementation adds a guard.
- The standalone `executionCoordinator.runCloseOut` path requires a commit package, local commit,
  release package, release-ready approval, clean dedicated worktree, run, and close-out artifact. It is
  a separate v1 task delivery path and must remain unchanged.

## Architecture Choice

Close-out is one append-only event plus one atomic lifecycle transaction:

```text
schema-v10 accepted DeliveryPackage evidence
-> recompute and compare current package/acceptance/plan/checkpoint tuple
-> verify completed WorkOrders and passed linked control-task review with no active gates
-> explicit operator decision=close-out
-> append one immutable MissionCloseOut record
-> in the same state save: task Review -> Done and Mission executing -> completed
-> expose read-only terminal evidence
-> stop before commit, push, release, learning, scheduling, or next-Mission creation
```

The new path is specific to the AI Company linked control task created by `DEC-091`. It does not call,
weaken, or impersonate the standalone task close-out coordinator and creates no run, artifact, approval,
Decision Inbox item, commit package, release package, commit, push, or external release.

## Entry Gate

Future close-out must require all of the following in one loaded state:

1. exact Mission exists, is `executing`, and has one linked control task;
2. exact linked task belongs to the Mission and is the ExecutionPlan `controlTaskId`;
3. linked task is `Review`, review is required and `passed`, and no blocked, waitingApproval,
   waitingDecision, pending blocking inbox item, or active gate remains;
4. exact ExecutionPlan is source-current and `delivery-ready` with no active WorkOrder;
5. Builder, Reviewer, and QA WorkOrders are all `completed` and retain required run/artifact evidence;
6. exact latest DeliveryPackage exists, remains strict-loader valid and `review-required`, and has no
   unresolved items;
7. exact DeliveryPackageAcceptance exists, is `accepted`, and its digest and all source refs match;
8. a freshly recomputed preview matches package/acceptance preview, source, package, and terminal
   checkpoint digests;
9. latest WorkflowCheckpoint is terminal `delivery-ready` and exact-digest matched;
10. request keys are exact and contain the complete evidence tuple plus `decision=close-out`;
11. no standalone commit/release close-out, package rejection, learning, provider, scheduling, policy,
    next-Mission, or connector authority is inferred.

Any mismatch fails before write. Migration, boot, read, preview, hydration, and rendering never create
close-out evidence or change Mission/task lifecycle.

Before applying these pre-close-out gates, the runtime must check for an existing MissionCloseOut by
Mission id. An exact request against a strict existing record and already-terminal Mission/task state
returns idempotently. A divergent request conflicts. This terminal replay branch is evaluated before
the `executing`/`Review` preconditions because those source states no longer exist after success.

## Planned State Schema v11

```text
schemaVersion: 11
sequences.missionCloseOut
missionCloseOuts: {
  [missionCloseOutId]: MissionCloseOut
}
```

Migration from valid schema v10 is additive:

- preserve every existing domain value after normalization;
- initialize only an empty MissionCloseOut sequence/map;
- create no close-out record and perform no lifecycle transition during migration;
- reject unknown future schemas and partial or semantically invalid v11 records;
- save migration and the later record plus both lifecycle transitions atomically;
- never downgrade valid v11 evidence or reopen completed state during rollback.

No mutable close-out ref is added to Mission, task, plan, package, or acceptance. Read models find the
unique strict record by `missionId`, `linkedTaskId`, and `deliveryPackageAcceptanceId`.

## MissionCloseOut Contract

```text
MissionCloseOut
- id
- projectId
- missionId
- linkedTaskId
- executionPlanId
- deliveryPackageId
- deliveryPackageAcceptanceId
- previewId
- sourceDigest
- packageDigest
- acceptanceDigest
- terminalCheckpointId
- terminalCheckpointDigest
- decision: closed-out
- taskLifecycleTransition: Review -> Done
- missionStatusTransition: executing -> completed
- authoritySummary
- closeOutDigest
- createdAt
```

Contract rules:

- Records are immutable and append-only; at most one valid close-out exists per Mission, linked task,
  package, and acceptance.
- Every identity and digest matches the strict source package, acceptance, plan, checkpoint, Mission,
  and task terminal state.
- The strict loader requires the source task to be `Done`, Mission to be `completed`, plan to remain
  `delivery-ready`, package to remain `review-required`, and acceptance to remain `accepted`.
- `authoritySummary` permits only the named AI Company Mission/task terminal transition. Commit,
  push, release, learning, memory, retry/rework, next-Mission creation, scheduling, providers, policy
  mutation, approval bypass, and connectors remain false.
- No prompt, provider payload, secret, arbitrary filesystem path, mutable source content, run, or
  artifact body is persisted.

## Digest And Idempotency Binding

`closeOutDigest` is SHA-256 over a canonical key-sorted payload containing the Mission/task/plan/
package/acceptance/checkpoint identity and digest tuple, `decision`, the two fixed transitions, and the
closed authority summary. Record id and timestamp are excluded, matching existing package and
acceptance digest conventions.

The exact request tuple is:

```text
missionId
linkedTaskId
executionPlanId
deliveryPackageId
deliveryPackageAcceptanceId
previewId
sourceDigest
packageDigest
acceptanceDigest
checkpointId
checkpointDigest
decision=close-out
```

- Exact replay returns the existing terminal record with `idempotent=true` and performs no write.
- Replay validates the record and current `completed`/`Done` state before evaluating pre-close-out
  status requirements; otherwise a successful first transition would make every replay fail.
- Any divergent tuple for a closed Mission conflicts without mutation.
- If a close-out record and terminal lifecycle state ever diverge, strict load fails closed rather than
  synthesizing, deleting, reopening, or repeating the transition.

## Runtime And API Plan

Planned runtime methods:

```text
getMissionCloseOut(missionId)
closeOutMissionAndTask(input)
```

Planned routes:

```text
GET  /api/missions/:missionId/close-out
POST /api/missions/:missionId/close-out
```

The POST route accepts only the exact tuple and `decision=close-out`. The runtime validates the full
path-plus-body shape again, appends one MissionCloseOut record, and updates the linked task and Mission
in one `saveState` call. It does not call `executionCoordinator.runCloseOut`, create a run/artifact/
approval/inbox record, inspect or mutate Git, or invoke provider, commit, push, release, learning,
scheduler, memory, policy, or connector code.

The specialized method mutates the already-loaded in-memory state directly after all gates pass; it
does not call public `transitionTaskLifecycle` or `syncMissionExecutionStateFromTask`, which each load
and save independently. The future implementation must also guard those two generic methods: when a
task is the `controlTaskId` of a durable AI Company ExecutionPlan, direct transition to `Done` and
derived Mission `completed` are rejected unless a matching strict MissionCloseOut record already
exists. This closes the direct-consumer bypass without changing standalone task behavior.

Atomicity in this slice means one `saveState(normalizeState(...))` for record plus both transitions,
using the existing same-filesystem temporary-file rename. Migration from v10 to v11 is its own prior
atomic normalization write. Cross-process compare-and-swap and fsync durability are not claimed; the
supported authority remains the single-process local server/runtime, and concurrent exact HTTP
requests must serialize into one creation plus one idempotent result.

## UI Boundary

- Add one explicit `미션 종료` command only when the exact accepted package tuple is current and every
  entry gate passes.
- Show MissionCloseOut id/digest/timestamp plus `Mission completed` and `Task Done` evidence after reload.
- Keep package and acceptance records immutable and visible beside the terminal event.
- State clearly that commit, push, release, learning, and next-Mission creation remain separate blocked
  decisions.
- Expose no reopen, cancel, reject, changes-requested, retry, commit, push, release, learning, memory,
  provider, scheduler, policy, or connector action.
- Long ids and digests must fit desktop and mobile without horizontal overflow.

## Compatibility And Migration

- Preserve DEC-091 durable plan/task graph, DEC-094 reviewed delivery, DEC-097 checkpoint recovery,
  DEC-100 durable package, and DEC-103 acceptance behavior.
- Keep ExecutionPlan `delivery-ready`, WorkOrders completed, checkpoint terminal, package
  `review-required`, and acceptance `accepted`; terminal state is added only to Mission/control task.
- Preserve standalone task lifecycle, commit-package, local-commit, release-package, and
  `executionCoordinator.runCloseOut` behavior outside the new Mission route.
- Guard only durable AI Company `controlTaskId` terminalization through generic lifecycle/sync methods;
  direct tasks and legacy Mission/task consumers without such a plan keep existing behavior.
- Preserve legacy Council and direct task consumers with no MissionCloseOut record.
- Create no approval or Decision Inbox item; the exact close-out request is the operator decision.

## Focused Verification Plan

Future implementation smoke must prove:

- atomic v10-to-v11 migration and zero record/transition on migration/read/boot/preview/render;
- exact request-key and full Mission/task/plan/package/acceptance/checkpoint tuple validation at API
  and runtime boundaries;
- source-current plan, terminal checkpoint, completed WorkOrders, accepted package, passed task review,
  and no-active-gate requirements before write;
- one immutable MissionCloseOut, canonical digest, exact idempotent replay, and reload retention;
- terminal-state replay is checked before pre-close-out statuses, concurrent exact HTTP requests yield
  one record, and divergent terminal replay performs no write;
- one atomic `Review -> Done` plus `executing -> completed` transition with matching timestamps;
- stale, malformed, extra-field, missing-evidence, active-gate, divergent, duplicate, partial-v11, and
  corrupt-record refusal with unchanged bytes;
- package, acceptance, plan, WorkOrder, checkpoint, run, artifact, approval, inbox, and source evidence
  remain unchanged;
- no standalone close-out run/artifact, Git inspection/mutation, commit package, local commit, push,
  release package, release, learning, memory, scheduling, provider, policy, or connector effect;
- generic lifecycle and Mission sync methods reject a durable control-task terminal bypass while
  preserving standalone task and legacy Mission behavior;
- DEC-091/094/097/100/103 and standalone task/Council compatibility;
- read-only UI hydration, exact-gated command, safe stale failure, idempotent replay, terminal reload
  evidence, absent downstream controls, and responsive desktop/mobile fit.

## Rollback Plan

1. Disable future Mission close-out GET/POST entrypoints and UI action.
2. Stop new close-out creation and lifecycle transitions.
3. Preserve every valid schema-v11 MissionCloseOut and its completed Mission/task state; never delete,
   downgrade, or synthesize a reopen.
4. Quarantine invalid or partial runtime files for operator repair without creating replacement records.
5. Keep schema-v10 package/acceptance inspection and pre-close-out evidence available.
6. Leave commit, push, release, learning, scheduling, providers, policy mutation, and connectors blocked.
7. Rerun migration, focused runtime/UI, compatibility, README inventory, and aggregate verification.

## Implementation Target Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/mission-close-outs.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-mission-task-close-out.mjs
scripts/smoke-ui-slice-659.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add schema-v11 constants and additive empty MissionCloseOut sequence/map migration.
2. Add strict exact-field, identity, transition, reference, digest, uniqueness, and terminal-state validation.
3. Implement canonical close-out digest and one atomic exact-tuple record plus lifecycle transaction.
4. Add terminal-record-first replay and durable control-task guards to generic lifecycle/sync methods.
5. Add read-only GET and explicit close-out POST routes with transport and runtime key allowlists.
6. Add exact-gated Deliverables command and durable terminal evidence.
7. Add focused migration/runtime/API/UI smokes and compatibility checks.
8. Synchronize docs, README, inventory, task ledger, UI QA, and aggregate verification.
9. Perform adversarial lifecycle/atomicity review before operator-side commit and push.

## Acceptance Criteria

1. Migration creates no close-out record and changes no Mission/task lifecycle.
2. Only one exact source-current accepted package may close its linked Mission/control task.
3. One explicit request atomically appends one immutable record and performs both fixed transitions.
4. Exact replay is idempotent; stale, invalid, active-gate, or divergent requests never write.
5. Package, acceptance, plan, checkpoint, WorkOrder, run, artifact, approval, inbox, and source evidence
   remain unchanged.
6. Terminal evidence survives reload and fits desktop/mobile.
7. Standalone task close-out and every commit/release/learning or broader authority stay unchanged.
8. Focused, compatibility, UI QA, README inventory, and aggregate verification pass.

## Exclusions

- DeliveryPackage rejection, changes-requested, supersession, deletion, or automatic rework
- Mission/task reopen, close-out cancellation, supersession, deletion, or automatic next-Mission creation
- standalone commit package, local commit, release package, close-out run/artifact, push, release, merge,
  publish, or Git mutation
- LearningCandidate generation, memory persistence, skill promotion, or organizational learning
- retry scheduling, parallel/dynamic/autonomous/background execution, provider-backed WorkOrders
- provider expansion, profile/policy mutation, approval bypass, or external connectors

## Planning Status

- Planning-only authority: accepted as `DEC-104`.
- Complete fielded implementation handoff: documented as `DEC-105`.
- Schema/runtime/API/UI implementation: accepted as `DEC-106` and verified on current schema v11.
- Planning and handoff remain consumed provenance for the exact implementation boundary.
- Standalone close-out, Git/release, reopen, package lifecycle expansion, learning, scheduling, provider,
  policy, next-Mission, bypass, and connector authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-mission-task-close-out-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Current schema v11 permits only the exact `DEC-106` MissionCloseOut record and atomic linked task/Mission
terminal transaction. Package and acceptance evidence remain immutable; standalone close-out,
commit/push/release, reopen, learning/memory, retry/rework, scheduling, providers, policy mutation,
automatic next-Mission creation, approval bypass, and connectors remain blocked.
