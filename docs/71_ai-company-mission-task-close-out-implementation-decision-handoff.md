# AI Company Mission And Task Close-Out Implementation Decision Handoff

## Purpose

`docs/70_ai-company-mission-task-close-out-plan.md`의 planning-only 결과를 schema-v11
MissionCloseOut record와 atomic Mission/task terminal transition으로 넓힐지 operator가 complete
fielded decision으로 결정하도록 한다. 이 문서는 구현하지 않고 decision shape, compatibility,
rollback, focused evidence, and stop boundary를 고정했다. Complete fielded decision은 `DEC-106`으로
accepted됐으며 이 문서는 consumed implementation input으로 보존한다.

## Current Gate

- Planning-only authority is accepted as `DEC-104`.
- The implementation decision handoff is recorded as `DEC-105`.
- The complete fielded implementation decision is accepted as `DEC-106`.
- Current runtime is schema v11 with one exact MissionCloseOut path.
- DeliveryPackage stays immutable `review-required`; read model derives `accepted`.
- Before close-out, Mission remains `executing` and the linked control task remains `Review`; one exact
  request may atomically create terminal evidence and move them to `completed` and `Done`.
- Standalone task commit/release/close-out behavior remains authoritative and unchanged.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
migrationPlanRefs=
sourceEvidenceRefs=
negativeEvidenceRefs=
rollbackRefs=
focusedSmokeRefs=
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=
approvalStatement=
```

## Recommended Approval Shape

```text
decisionId=operator-decision-ai-company-mission-task-close-out-implementation-001
decisionStatus=approve-ai-company-mission-task-close-out-implementation-slice
targetAuthority=one deterministic local schema-v11 atomic Mission and linked control-task close-out from one exact source-current schema-v10 accepted DeliveryPackage evidence tuple
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/mission-close-outs.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-mission-task-close-out.mjs, scripts/smoke-ui-slice-659.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/70_ai-company-mission-task-close-out-plan.md
runtimePath=first resolve any existing strict MissionCloseOut by Mission id so an exact already-terminal request returns idempotently before pre-close-out status checks and a divergent replay conflicts, otherwise require one exact source-current schema-v10 accepted DeliveryPackage tuple plus delivery-ready plan terminal checkpoint completed Builder Reviewer QA WorkOrders and one linked control task in Review with passed review and recomputed no-active-gate state, recompute and compare every package acceptance source and checkpoint digest, require one exact decision=close-out operator request, mutate one loaded state directly and atomically append one immutable MissionCloseOut record plus task Review-to-Done and Mission executing-to-completed transitions in one saveState call, expose read-only terminal evidence, and stop before standalone close-out commit push release learning scheduling providers policy or connectors
compatibilityPlanRefs=keep DeliveryPackage immutable review-required and acceptance append-only accepted, preserve DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 routes and behavior, preserve standalone task commit-package local-commit release-package and executionCoordinator.runCloseOut outside the new Mission route, guard generic transitionTaskLifecycle and syncMissionExecutionStateFromTask only against direct terminalization bypass for durable AI Company controlTaskId records without a matching MissionCloseOut, create no run artifact approval or Decision Inbox item, and keep legacy Council and direct task consumers unchanged
migrationPlanRefs=add schemaVersion 11 missionCloseOut sequence and map only, preserve every valid schema-v10 domain value, create no close-out or lifecycle transition during migration boot read preview hydration or render, reject future partial or semantically invalid v11 records, save the exact close-out record plus both lifecycle transitions atomically, and retain valid v11 terminal evidence during rollback without downgrade deletion or reopen
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-100, DEC-101, DEC-103, DEC-104, DEC-105, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/51_ai-company-delivery-roadmap.md, docs/68_ai-company-delivery-package-acceptance-plan.md, docs/70_ai-company-mission-task-close-out-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/delivery-package-acceptances.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v10 with accepted package evidence only and no missionCloseOut sequence map record digest exact get post route UI action focused implementation smoke or atomic Mission task terminal transaction; Mission remains executing, linked task remains Review, and standalone close-out requires commit release evidence that the new route must not invoke
rollbackRefs=disable Mission close-out get post entrypoints and UI action, stop new record creation and lifecycle transitions, preserve valid schema-v11 MissionCloseOut records and completed Mission task state without downgrade deletion or synthetic reopen, keep schema-v10 package acceptance inspection available, quarantine invalid runtime files for operator repair, and rerun migration focused UI compatibility README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-mission-task-close-out.mjs proving atomic v10-to-v11 migration exact request keys and full Mission task plan package acceptance checkpoint tuple source-current recompute completed WorkOrders passed review recomputed no-active-gate preconditions one immutable close-out record canonical digest one-saveState Review-to-Done and executing-to-completed transitions terminal-record-first exact idempotent replay concurrent exact request convergence reload retention stale malformed active-gate divergent duplicate partial-v11 and corrupt refusal generic lifecycle and Mission sync bypass rejection standalone and legacy compatibility unchanged source evidence no run artifact approval inbox Git commit push release learning provider scheduler policy or connector effect and DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 compatibility; scripts/smoke-ui-slice-659.mjs proving exact-gated close-out action read-only terminal rendering safe stale failures idempotent replay immutable package acceptance evidence blocked downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Mission or task reopen, close-out cancellation supersession deletion or automatic next-Mission creation, DeliveryPackage rejection changes-requested supersession or deletion, standalone commit package local commit release package or close-out execution, runtime-agent commit, push, release, LearningCandidate generation, memory or skill persistence, automatic retry or rework, parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v11 atomic AI Company Mission and linked control-task close-out described in docs/70_ai-company-mission-task-close-out-plan.md. This permits one immutable MissionCloseOut record plus task Review-to-Done and Mission executing-to-completed transitions in one state save. It does not approve standalone close-out, commit, push, release, package rejection or changes-requested, reopen, learning, memory, scheduling, provider expansion, policy mutation, approval bypass, automatic next-Mission creation, or external connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-evidence
approvalStatement=I request the named evidence before Mission and linked control-task close-out implementation authority can open.
```

Rejection:

```text
decisionStatus=reject
approvalStatement=I reject AI Company Mission and task close-out implementation. Schema-v10 accepted package evidence remains authoritative.
```

Deferral:

```text
decisionStatus=defer
approvalStatement=I defer AI Company Mission and task close-out implementation. No schema, record, route, UI action, or lifecycle authority opens.
```

## Invalid Shortcuts

The following do not open implementation authority:

- `approval`, `approved`, `continue`, `do everything`, `approve all`, `self approve`, or
  `use your judgment`;
- planning approval without the complete fielded implementation decision;
- prior package persistence or acceptance approval;
- a package acceptance record interpreted as Mission/task completion;
- direct task `Done` transition without the exact accepted package tuple and atomic MissionCloseOut;
- reuse of standalone close-out as permission to create commit/release evidence in this slice.

## Minimum Acceptance Criteria

The implementation decision must explicitly:

1. select additive schema v11 and one append-only MissionCloseOut record;
2. preserve immutable package and acceptance evidence;
3. require exact current Mission/task/plan/package/acceptance/checkpoint tuple plus
   `decision=close-out`;
4. require completed WorkOrders, passed linked-task review, and no active task gate;
5. create no record or transition during migration, boot, read, preview, hydration, or render;
6. atomically append the record and perform only `Review -> Done` plus `executing -> completed`;
7. evaluate strict existing-record replay before pre-close-out statuses, return exact terminal replay
   idempotently, and reject divergent terminal replay without write;
8. guard generic task lifecycle and Mission sync methods against durable control-task terminal bypass;
9. fail stale, malformed, divergent, active-gate, partial, or corrupt input before write;
10. avoid standalone close-out coordinator, runs, artifacts, approvals, inbox items, and Git access;
11. keep commit/push/release/learning/scheduling/provider/policy/connector authority closed;
12. preserve DEC-091/094/097/100/103 and standalone task/Council compatibility;
13. name rollback retention and focused runtime/API/UI/browser verification.

## Stop Conditions

Stop without writing if:

- any required decision field is missing or conflicts with the plan;
- Mission, linked task, plan, WorkOrder, package, acceptance, checkpoint, preview, review, gate, or
  digest evidence is stale or invalid;
- migration or a read path would create a record or change lifecycle;
- record append and both lifecycle transitions cannot be guaranteed in one atomic state save;
- implementation calls the standalone close-out coordinator or opens run/artifact/approval/inbox/Git
  effects;
- implementation opens package rejection/changes-requested, reopen, commit/push/release,
  learning/memory, next-Mission creation, scheduling/providers, policy mutation, bypass, or connectors;
- focused migration/runtime/API/UI, compatibility, README inventory, UI QA, or aggregate verification
  fails.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-mission-task-close-out-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The complete fielded shape is consumed by `DEC-106`. Current schema v11 implements only the named
MissionCloseOut transaction; every still-blocked authority in the decision remains outside this path.
