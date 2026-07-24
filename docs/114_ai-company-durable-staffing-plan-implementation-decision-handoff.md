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
- Readiness clarification for the exact digest, spec, acceptance, migration, and compatibility
  contracts is recorded as `DEC-165`.
- The complete valid operator approval was supplied and implementation is accepted as `DEC-166`.
- This handoff is consumed for preview, acceptance, schema-v17 persistence, and exact inspection
  only. Council/solo binding and every downstream authority remain blocked.

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
targetAuthority=one deterministic local schema-v17 immutable accepted StaffingPlan record from one exact source-current draft Mission active project current project pack freshly reloaded strict CompanyBlueprint and nine role sources plus one exact operator-owned staffingSpec evaluatedAt and separate acceptance evidence
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/company-blueprint.js, src/runtime/staffing-plans.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-staffing-plan.mjs, scripts/smoke-ui-slice-696.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, and existing schema-sensitive smoke fixtures only where current schema 16 becomes 17 or future schema 17 becomes 18 without reducing coverage
implementationPlanRefs=docs/113_ai-company-multi-agent-completion-plan.md
runtimePath=require state.activeProjectId to equal one exact source-current draft unlinked Mission projectId, reload and strictly validate CompanyBlueprint plus nine role sources for every preview and acceptance, compute canonical mission blueprint role-source staffingSpec and combined source digests, accept exact staffingSpec keys mode selectedAgentIds selectionRationale parallelGroups providerMode=local-stub and one terminationPolicy with maxProviderCalls=0, require preview evaluatedAt and exact preview digest tuple, require separate acceptance decision=accept acknowledgement=reviewed-exact-staffing-plan-for-local-record rationale and reviewedAt, derive acceptedAt createdAt and updatedAt from reviewedAt, atomically append one immutable StaffingPlan status=accepted with source refs acceptance blockedActions and recordDigest, expose exact-id inspection, reject parallel-specialists while the blueprint disables it, and stop before Council start WorkOrder creation scheduling provider calls source mutation Git release policy bypass or connectors
compatibilityPlanRefs=preserve existing Mission creation and selection, legacy and Real Council routes, Council staffingSnapshot, fixed Builder Reviewer QA compiler, checkpoint proof delivery learning memory Growth proposal and browser-local preference behavior, re-read blueprint sources only for the new StaffingPlan path, update schema-sensitive smoke expectations from current 16 to 17 and future 17 to 18 without weakening assertions, create no CouncilSession ExecutionPlan WorkOrder HandoffPacket approval inbox run artifact provider attempt source write Git action or schedule, and expose no downstream start control
migrationPlanRefs=add schemaVersion 17 with sequences.staffingPlan and staffingPlans only, preserve every valid schema-v16 domain value, create no StaffingPlan during migration boot read render snapshot or preview, reject schema v18 plus partial semantically invalid key-mismatched or digest-invalid v17 state without changing bytes, validate the complete recomputed preview and acceptance tuple before one atomic migration-plus-append save, and retain valid v17 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-097, DEC-130, DEC-131, DEC-132, DEC-133, DEC-134, DEC-135, DEC-136, DEC-162, DEC-163, DEC-164, DEC-165, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, company/blueprint.json, company/roles/conductor.md, company/roles/strategist.md, company/roles/architect.md, company/roles/decomposer.md, company/roles/researcher.md, company/roles/builder.md, company/roles/reviewer.md, company/roles/qa.md, company/roles/ops.md, src/runtime/contracts.js, src/runtime/company-blueprint.js, src/runtime/council-sessions.js, src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, src/execution/council-coordinator.js
negativeEvidenceRefs=current schema v16 has no sequences.staffingPlan staffingPlans record digest preview persistence exact inspection or Council entry binding, strict blueprint loading returns no blueprint and role-source digest, AgentProfile has no capability vocabulary so the first staffingSpec must use existing role profile pack provider tool and authority fields only, Council staffingSnapshot is not a durable accepted plan, default blueprint mode is council with four required ids including Conductor and parallel specialists disabled, WorkOrder graph is fixed Builder Reviewer QA, response-only preview requires full staffingSpec and evaluatedAt resubmission during acceptance, and no general scheduler dynamic staffing partial retry rework or context application exists
rollbackRefs=disable StaffingPlan preview acceptance and exact inspection entrypoints and UI controls, stop new record creation, preserve valid schema-v17 records and every schema-v16 source value without downgrade deletion rewrite Mission transition Council start WorkOrder creation or implicit execution, keep existing Council and fixed WorkOrder compatibility paths available, and rerun migration focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-staffing-plan.mjs; scripts/smoke-ui-slice-696.mjs; existing Council WorkOrder checkpoint proof delivery learning memory and schema-sensitive compatibility smokes
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
- Runtime reloads CompanyBlueprint and nine role sources and recomputes the complete preview from the
  current active project, Mission, project pack, staffingSpec, and evaluatedAt before any write.
- The digest contract covers the normalized blueprint, raw role-source digests, stable draft Mission,
  normalized staffingSpec, and combined source tuple.
- Acceptance resubmits the same staffingSpec and evaluatedAt plus the exact preview tuple.
- One separate exact acceptance object with decision, acknowledgement, rationale, and reviewedAt is
  required and preserved in the record.
- Schema migration and record append occur in one state transaction.
- The first slice uses the existing `local-stub` provider value, sets `maxProviderCalls=0`, and makes
  no provider attempt.
- `selectedAgentIds` uses existing profiles only; council means the exact four required ids including
  Conductor. No new AgentProfile capability field is introduced.
- The record retains project pack, workspace scope, source refs, blueprint source refs, complete
  digest lineage, acceptance evidence, blockedActions, and canonical recordDigest.
- `evaluatedAt` and `reviewedAt` are exact ISO timestamps bounded by source timestamps and five-minute
  future skew; acceptedAt, createdAt, and updatedAt equal reviewedAt.
- No record is created by boot, read, migration alone, preview, render, or failed input.
- Exact replay is idempotent and stale or divergent input changes no durable value.
- `parallel-specialists` fails closed while the current blueprint disables it.
- Existing Council, WorkOrder, checkpoint, proof, delivery, learning, memory, and provider behavior is
  preserved.
- Focused runtime/API/UI and aggregate verification prove every blocked downstream authority.

## Stop Condition

The complete valid decision is consumed by `DEC-166`. The implemented slice stops before Council
start, WorkOrder creation, scheduler, parallel execution, retry, rework, provider, memory
application, source mutation, Git, release, policy mutation, approval bypass, or connectors.
