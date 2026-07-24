# AI Company StaffingEntry Council Binding Implementation Decision Handoff

## Purpose

이 문서는 `docs/115_ai-company-staffing-entry-binding-plan.md`를 one architecture-sensitive
implementation decision으로 전달한다. 대상은 one exact accepted council-mode StaffingPlan, separate
entry approval, immutable schema-v18 StaffingEntry, and one existing deterministic local-stub Council
first entry다.

이 문서 자체는 implementation authority가 아니다. Generic continuation, broad approval,
non-critical self-approval delegation, or the planning decision cannot authorize schema migration,
durable entry creation, Council start, API/UI mutation, or downstream execution.

## Consumed Implementation Decision

`DEC-169` records that the operator supplied the complete valid approval outcome below. The
schema-v18 StaffingEntry Council binding slice is implemented and verified; the planning and handoff
text remains as immutable decision provenance. Every authority listed under
`stillBlockedAuthorities` remains closed.

## Current Gate

- Durable StaffingPlan planning and implementation are accepted through `DEC-163` to `DEC-166`.
- Council-first StaffingEntry binding planning is accepted as `DEC-167`.
- This complete fielded implementation handoff is recorded as `DEC-168`.
- Current runtime is schema v17.
- StaffingPlan remains unbound and immutable.
- Implementation remains blocked until one complete valid operator decision below is supplied.

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
decisionId=operator-decision-ai-company-staffing-entry-council-binding-implementation-001
decisionStatus=approve-ai-company-staffing-entry-council-binding-implementation-slice
targetAuthority=one deterministic local schema-v18 immutable StaffingEntry binding from one exact source-current schema-v17 accepted council-mode StaffingPlan and separate exact entry approval to one existing real-local-stub Council first attempt stopping at human alignment
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/staffing-entries.js, src/runtime/staffing-plans.js, src/runtime/council-sessions.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-staffing-entry-binding.mjs, scripts/smoke-ui-slice-697.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, README.md, docs/01_decision-log.md, docs/22_completion-gate-inventory.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/115_ai-company-staffing-entry-binding-plan.md, docs/116_ai-company-staffing-entry-binding-implementation-decision-handoff.md, tasks/todo.md, tasks/lessons.md, scripts/smoke-ai-company-master-plan.mjs, scripts/smoke-ai-company-multi-agent-completion-planning.mjs, scripts/smoke-ai-company-staffing-entry-binding-planning.mjs, scripts/smoke-readme-scope-evidence.mjs, scripts/smoke-completion-gate-inventory-current-evidence.mjs, and schema-sensitive fixtures or direct local-Council setup helpers only where schema 17 becomes 18 future schema 18 becomes 19 or an operator-facing or public-runtime unbound local start is replaced without weakening historical compatibility evidence
implementationPlanRefs=docs/115_ai-company-staffing-entry-binding-plan.md
runtimePath=require state.activeProjectId and one current draft unlinked unbound Mission to match one immutable accepted mode=council StaffingPlan, freshly reload and validate CompanyBlueprint plus nine role sources, reconstruct the durable staffingSpec and exact preview digest tuple from current evidence, require exact plan record source mission blueprint and staffingSpec digests plus one separate entryApproval decision=enter acknowledgement=bind-exact-accepted-staffing-plan-to-local-council rationale and requestedAt, compute canonical approval source and record digests, build one StaffingEntry and one CouncilSession carrying non-circular staffingEntryRef evidence in memory, run exactly one existing deterministic real-local-stub Council attempt, require awaiting-alignment, atomically migrate schema v17 to v18 and persist the entry session Mission refs and sequences once, return exact replay idempotently, allow bound Council approve as alignment-only or stop, and block bound revision resume auto-chain preview compilation WorkOrder scheduling provider source Git release or policy actions
compatibilityPlanRefs=keep accepted StaffingPlan immutable and digest-stable, preserve legacy deterministic Council and all historical unbound Real Council and provider sessions, preserve the explicit real-openai-responses compatibility path without treating it as StaffingPlan-bound, preserve normalized Council position conflict synthesis and local-stub coordinator contracts, preserve WorkOrder checkpoint proof delivery learning memory Growth source mutation commit and release behavior outside the new bound branch, block every new operator-facing or public-runtime unbound real-local-stub start while allowing focused fixture helpers to construct valid bound setup evidence only, create no task run artifact approval ExecutionPlan WorkOrder HandoffPacket checkpoint provider attempt source mutation Git action or schedule, and expose no solo or downstream execution control
migrationPlanRefs=add schemaVersion 18 sequences.staffingEntry staffingEntries and nullable Mission.staffingEntryId only, preserve every valid schema-v17 domain value, create no entry during migration boot read render preview or inspection, reject schema v19 plus partial semantically invalid duplicate-reference key-mismatched or digest-invalid v18 state without changing bytes, validate the complete current plan and entry approval then run the deterministic local Council attempt before one atomic migration-plus-append save, and retain valid v18 evidence during rollback without downgrade deletion rewrite or retroactive binding
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-097, DEC-130, DEC-131, DEC-132, DEC-133, DEC-134, DEC-135, DEC-136, DEC-162, DEC-163, DEC-164, DEC-165, DEC-166, DEC-167, DEC-168, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/114_ai-company-durable-staffing-plan-implementation-decision-handoff.md, docs/115_ai-company-staffing-entry-binding-plan.md, company/blueprint.json, company/roles/conductor.md, company/roles/strategist.md, company/roles/architect.md, company/roles/decomposer.md, company/roles/researcher.md, company/roles/builder.md, company/roles/reviewer.md, company/roles/qa.md, company/roles/ops.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/staffing-plans.js, src/runtime/council-sessions.js, src/runtime/runtime-service.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current schema v17 has no sequences.staffingEntry staffingEntries Mission.staffingEntryId immutable entry record entry approval entry digest or exact inspection, accepted StaffingPlan blockedActions still includes council-start, current local Council start accepts only Mission and mode and rebuilds staffingSnapshot from blueprint without durable plan evidence, current local Council approve can enter Mission auto-chain, no bound-session revision resume or alignment-only guards exist, current UI exposes unbound local start, no focused binding runtime or UI smoke exists, and no solo adapter session attempt state transition failure contract or verification path exists
rollbackRefs=disable StaffingEntry creation POST and UI entry command, retain exact GET inspection for valid schema-v18 evidence, reject new bound session creation, preserve valid schema-v18 entries Mission refs Council refs accepted plans and every historical record without downgrade delete rewrite retroactive binding or conversion to an unbound session, leave bound sessions inspect-only with revision resume and auto-chain blocked, preserve historical Council and downstream compatibility behavior, and rerun migration focused runtime API UI README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-staffing-entry-binding.mjs proving one-save v17-to-v18 migration exact plan approval source and record digest binding current blueprint and nine role sources exact Council roster one deterministic local attempt exact replay divergent stale malformed and failed-attempt no-write behavior exact GET reload and rollback inspection bound alignment-only approve and stop blocked operator-facing and public-runtime unbound start revision resume auto-chain preview WorkOrder scheduler provider source Git release policy bypass and connector authority historical legacy Real provider compatibility schema-v19 and partial-v18 refusal plus immutable StaffingPlan evidence; scripts/smoke-ui-slice-697.mjs proving exact-gated Council entry read-only durable evidence solo-without-action safe stale failure hidden unbound and downstream controls historical compatibility and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=solo StaffingEntry or solo role execution, dynamic staffing, parallel specialists, general scheduler, ExecutionPlan or WorkOrder creation dispatch retry or rework, bound Council revision resume retry rework or auto-chain, Researcher or Ops execution, provider-backed StaffingEntry or WorkOrders, provider expansion, durable continuation history, Ops supervision commands, Mission memory context application, source mutation expansion, runtime-agent commit push or release, background autonomy, profile or policy mutation, approval bypass, list search update delete lifecycle, external connectors
approvalStatement=I approve implementation only for one exact schema-v18 immutable StaffingEntry binding from one source-current accepted council-mode StaffingPlan to one deterministic real-local-stub Council first attempt as described in docs/115_ai-company-staffing-entry-binding-plan.md. This permits one separate exact entry approval, atomic entry session and Mission binding persistence, exact inspection, alignment-only approve, and stop. It does not approve solo execution, scheduling, WorkOrders, revision, resume, retry, rework, auto-chain, providers, memory application, source mutation, Git, release, policy mutation, approval bypass, lifecycle search or deletion, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-staffing-entry-council-binding-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded schema-v18 StaffingEntry Council binding slice
requestedEvidence=one or more exact missing schema source-current transaction compatibility rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before StaffingEntry Council binding implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-staffing-entry-council-binding-implementation-001
decisionStatus=reject-ai-company-staffing-entry-council-binding-implementation
targetAuthority=the same bounded schema-v18 StaffingEntry Council binding slice
approvalStatement=I reject StaffingEntry Council binding implementation. Schema-v17 accepted StaffingPlan inspection and existing historical Council behavior remain authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-staffing-entry-council-binding-implementation-001
decisionStatus=defer-ai-company-staffing-entry-council-binding-implementation
targetAuthority=the same bounded schema-v18 StaffingEntry Council binding slice
approvalStatement=I defer StaffingEntry Council binding implementation. No schema entry Council solo scheduler WorkOrder provider source Git release policy bypass or connector authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `전체 승인`, `계획대로 진행`, `continue`, or `do everything`
- delegated self-approval for schema migration, durable record creation, or Council authority
- planning-only `DEC-167` or handoff-only `DEC-168` copied as implementation authority
- approval that omits atomic pre-save Council success, exact plan and blueprint recomputation, separate
  entry approval, bound-session downstream guards, migration, rollback, focused smoke, or still-blocked
  authorities
- approval that silently treats an inert solo marker as solo execution
- approval that bundles scheduler, WorkOrders, revision, retry/rework, providers, memory application,
  source mutation, Git, release, policy bypass, lifecycle deletion, or connectors

## Acceptance Criteria

1. The decision uses every required field and exact bounded target surface.
2. The accepted StaffingPlan remains immutable and source-current recomputation reproduces its exact
   Mission, blueprint, staffingSpec, and source digest tuple.
3. CompanyBlueprint and all nine role sources are freshly loaded before output.
4. Only `mode=council`, the exact four current required ids including Conductor, local-stub, empty
   parallel groups, and zero provider calls are accepted.
5. Entry approval is separate from StaffingPlan acceptance and is retained with canonical digest.
6. Migration, entry append, CouncilSession append, Mission refs, and sequence changes save once only
   after the deterministic Council attempt reaches awaiting alignment.
7. Failed pre-save execution, stale input, invalid approval, unsupported schema, and divergent replay
   leave bytes unchanged.
8. Exact replay returns existing evidence without a save.
9. Bound approve stops at alignment; bound stop works; revision, resume, auto-chain, preview
   compilation, WorkOrder, provider, and mutation paths remain blocked.
10. No new operator-facing or public-runtime unbound local Council start remains.
11. Historical legacy, Real local-stub, and provider sessions retain inspect and existing decision
    compatibility.
12. Solo remains read-only unimplemented evidence with no lifecycle transition or action.
13. Focused runtime/API/UI and aggregate verification prove all blocked authorities.

## Stop Condition

Stop before implementation if any required field is missing, the schema or target surface widens,
the accepted plan must be mutated, a failed Council attempt would partially persist, unbound local
start remains operator-accessible, bound approve can auto-chain, solo lifecycle state is fabricated,
historical records must be rewritten, or any blocked authority opens implicitly.
