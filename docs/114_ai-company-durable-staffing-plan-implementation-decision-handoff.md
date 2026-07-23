# AI Company Durable StaffingPlan Implementation Decision Handoff

## Purpose

이 문서는 `docs/113_ai-company-multi-agent-completion-plan.md`의 첫 vertical slice를 operator
decision으로 전달한다. 대상은 one source-current draft Mission과 current CompanyBlueprint에서
preview하고 별도 승인으로 저장하는 immutable StaffingPlan 하나다.

StaffingPlan acceptance는 Council 시작, WorkOrder 생성, scheduler, provider, source mutation,
commit, push, release authority가 아니다.

## Current Gate

- Source-of-truth reconciliation is recorded as `DEC-162`.
- Multi-agent completion planning is accepted as `DEC-163`.
- This complete fielded implementation handoff is recorded as `DEC-164`.
- Runtime and schema implementation remain blocked until one complete valid operator outcome is
  supplied.

## Required Decision Fields

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
migrationPlanRefs
sourceEvidenceRefs
negativeEvidenceRefs
rollbackRefs
focusedSmokeRefs
aggregateVerificationRef
stillBlockedAuthorities
approvalStatement
```

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-durable-staffing-plan-implementation-001
decisionStatus=approve-ai-company-durable-staffing-plan-implementation-slice
targetAuthority=one deterministic local schema-v17 immutable accepted StaffingPlan record from one exact source-current draft Mission and current CompanyBlueprint plus an operator-owned staffingSpec and separate exact accept decision
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/staffing-plans.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-staffing-plan.mjs, scripts/smoke-ui-slice-696.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/113_ai-company-multi-agent-completion-plan.md
runtimePath=require one exact source-current draft Mission and active project plus current strict CompanyBlueprint digest and bounded operator-owned staffingSpec with providerMode=local-stub-only and maxProviderCalls=0, recompute one deterministic response-only preview, require exact preview mission blueprint and source digests plus separate decision=accept and explicit evaluatedAt, derive acceptedAt and createdAt from that evaluatedAt, atomically append one immutable StaffingPlan status=accepted, expose exact-id inspection, reject parallel-specialists while the blueprint disables it, and stop before Council start WorkOrder creation scheduling provider calls source mutation Git release policy bypass or connectors
compatibilityPlanRefs=preserve existing Mission creation and selection, legacy and Real Council routes, Council staffingSnapshot, fixed Builder Reviewer QA compiler, schema-v16 direct consumers before first valid write, checkpoint proof delivery learning memory Growth proposal and browser-local preference behavior, create no CouncilSession ExecutionPlan WorkOrder HandoffPacket approval inbox run artifact provider attempt source write Git action or schedule, and expose no downstream start control
migrationPlanRefs=add schemaVersion 17 staffingPlan sequence and map only, preserve every valid schema-v16 domain value, create no StaffingPlan during migration boot read render or preview, reject unknown future partial or semantically invalid v17 state, validate the complete preview and acceptance tuple before one atomic migration-plus-append save, and retain valid v17 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-097, DEC-130, DEC-131, DEC-132, DEC-133, DEC-134, DEC-135, DEC-136, DEC-162, DEC-163, DEC-164, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, company/blueprint.json, src/runtime/contracts.js, src/runtime/company-blueprint.js, src/runtime/council-sessions.js, src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, src/execution/council-coordinator.js
negativeEvidenceRefs=current schema v16 has no staffingPlan sequence map record digest preview persistence exact inspection or Council entry binding, Council staffingSnapshot is not a durable accepted plan, default blueprint mode is council with parallel specialists disabled, WorkOrder graph is fixed Builder Reviewer QA, and no general scheduler dynamic staffing partial retry rework or context application exists
rollbackRefs=disable StaffingPlan preview acceptance and exact inspection entrypoints and UI controls, stop new record creation, preserve valid schema-v17 records and every schema-v16 source value without downgrade deletion rewrite Mission transition Council start WorkOrder creation or implicit execution, keep existing Council and fixed WorkOrder compatibility paths available, and rerun migration focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-staffing-plan.mjs; scripts/smoke-ui-slice-696.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=accepted StaffingPlan binding to Council or solo execution, automatic provider-assisted or dynamic staffing, parallel-specialists activation, general WorkOrder compilation scheduling dispatch or retry, Researcher or Ops execution, Reviewer rework, durable continuation history, Mission context attachment or injection, provider-backed WorkOrders, source mutation beyond existing exact Builder authority, runtime-agent commit push or release, background autonomy, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v17 immutable accepted StaffingPlan described in docs/113_ai-company-multi-agent-completion-plan.md. This permits preview acceptance persistence and exact inspection only. It does not approve Council start, WorkOrder creation, scheduling, parallel execution, retries, rework, providers, memory application, source mutation, Git, release, policy bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-durable-staffing-plan-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded durable StaffingPlan implementation slice
requestedEvidence=one or more exact missing contract compatibility migration rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before durable StaffingPlan implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-durable-staffing-plan-implementation-001
decisionStatus=reject-ai-company-durable-staffing-plan-implementation
targetAuthority=the same bounded durable StaffingPlan implementation slice
approvalStatement=I reject durable StaffingPlan implementation. Current schema-v16 Council and WorkOrder behavior remains authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-durable-staffing-plan-implementation-001
decisionStatus=defer-ai-company-durable-staffing-plan-implementation
targetAuthority=the same bounded durable StaffingPlan implementation slice
approvalStatement=I defer durable StaffingPlan implementation. No schema, plan record, Council binding, scheduler, provider, source, Git, release, policy, or connector authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `전체 승인`, `계획대로 진행`, or `continue` without every required field
- planning-only authority copied as implementation authority
- delegated self-approval for schema migration or durable record creation
- approval that omits exact Mission and blueprint binding, separate acceptance, migration, rollback, or
  focused smoke
- approval that bundles Council start, WorkOrder creation, scheduling, parallel execution, provider,
  rework, memory application, source mutation, Git, release, policy, bypass, or connectors

## Acceptance Criteria

- The decision identifies the exact immutable record and touched surfaces.
- Runtime recomputes the preview from current Mission, project, and CompanyBlueprint evidence before
  any write.
- One separate exact accept decision and explicit operator-owned `evaluatedAt` are required.
- Schema migration and record append occur in one state transaction.
- The first slice is `local-stub-only`, sets `maxProviderCalls=0`, and makes no provider attempt.
- No record is created by boot, read, migration alone, preview, render, or failed input.
- Exact replay is idempotent and stale or divergent input changes no durable value.
- `parallel-specialists` fails closed while the current blueprint disables it.
- Existing Council, WorkOrder, checkpoint, proof, delivery, learning, memory, and provider behavior is
  preserved.
- Focused runtime/API/UI and aggregate verification prove every blocked downstream authority.

## Stop Condition

Stop before runtime or schema edits while a complete valid decision is absent. After a future approval,
stop before Council start, WorkOrder creation, scheduler, parallel execution, retry, rework, provider,
memory application, source mutation, Git, release, policy mutation, approval bypass, or connectors.
