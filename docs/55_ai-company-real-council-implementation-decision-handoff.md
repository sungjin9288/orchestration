# AI Company Real Council Implementation Decision Handoff

## Purpose

이 문서는 `Real Council for one Mission local-stub implementation decision required` gate를 위한
copy-ready operator input이다. 이 문서 자체는 runtime/API/UI implementation authority가 아니다.

## Current Gate

- Phase 1 blueprint foundation: implemented and verified by `DEC-079`
- Phase 2 planning decision: `operator-delegated-ai-company-real-council-planning-001`
- Planning status: accepted for planning only
- Implementation plan: `docs/54_ai-company-real-council-implementation-plan.md`
- Real Council implementation: blocked
- Legacy deterministic Council: preserved and still active
- Current runtime schema: v6
- Current gate: `Real Council for one Mission local-stub implementation decision required`

## Source Evidence

- `DEC-076`
- `DEC-079`
- `DEC-080`
- `DEC-081`
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/54_ai-company-real-council-implementation-plan.md`
- `company/blueprint.json`
- `company/roles/conductor.md`
- `company/roles/strategist.md`
- `company/roles/architect.md`
- `company/roles/decomposer.md`
- `src/runtime/company-blueprint.js`
- `src/runtime/runtime-service.js`
- `src/runtime/file-store.js`
- `src/execution/providers/local-stub-adapter.js`
- `scripts/serve-ui-slice-01.mjs`
- `ui/council-signals.js`
- `node scripts/smoke-ai-company-real-council-planning.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

```text
decisionId=operator-decision-ai-company-real-council-implementation-001
decisionStatus=approve-ai-company-real-council-local-stub-implementation-slice
targetAuthority=one Mission independent local-stub Council positions, deterministic conflict check, Conductor synthesis, and human alignment decisions
targetSurface=src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, scripts/smoke-ai-company-real-council.mjs, scripts/smoke-ui-slice-651.mjs, scripts/verification_status.mjs
implementationPlanRefs=docs/54_ai-company-real-council-implementation-plan.md
runtimePath=resolve the four source-backed Council profiles, execute Strategist Architect and Decomposer independently through one deterministic local-stub Council adapter, compute conflicts in code, synthesize through Conductor, persist additive attempt evidence, and require approve request-revision or stop
compatibilityPlanRefs=keep schemaVersion 6, do not edit createEmptyState or file-store normalization, preserve legacy draft-council and approve-council behavior, add only opt-in real-Council routes and mode-gated UI, preserve direct runtime and companyRuntime snapshots
sourceEvidenceRefs=DEC-076, DEC-079, DEC-080, DEC-081, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/54_ai-company-real-council-implementation-plan.md, company/blueprint.json, company/roles/conductor.md, company/roles/strategist.md, company/roles/architect.md, company/roles/decomposer.md, src/runtime/company-blueprint.js, src/runtime/runtime-service.js, src/runtime/file-store.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js
negativeEvidenceRefs=current Council is one synchronous deterministic transcript, existing routes have no independent position execution, no conflict summary or synthesis record exists, only approve-recommendation is supported, no revision or stop path exists, no Phase 2 focused smoke exists
rollbackRefs=disable the new real-Council routes and UI entry, stop new real-local-stub sessions, quarantine incomplete real sessions without converting them to legacy transcripts, preserve schema v6 and legacy Council records, rerun focused and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-real-council.mjs and scripts/smoke-ui-slice-651.mjs proving independent request isolation, strict output validation, conflict and dissent preservation, required-role failure, synthesis, revision history, stop, approve boundary, schema v6 reload, legacy compatibility, real snapshot UI, and no provider memory source commit push or release authority
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=provider-assisted Council, standalone StaffingPlan runtime, dynamic staffing, autonomous or parallel scheduling, ExecutionPlan and WorkOrder compilation or execution, memory or checkpoint schema expansion, runtime profile mutation, source mutation, approval bypass, runtime-agent commit, runtime-agent push, release
approvalStatement=I approve implementation only for one Mission Real Council path using deterministic local-stub roles as described in docs/54_ai-company-real-council-implementation-plan.md. This approval permits separate Strategist Architect and Decomposer position evidence, deterministic conflict checking, Conductor synthesis, additive session attempt persistence, and approve request-revision or stop decisions while preserving schema v6 and legacy Council behavior. It does not approve live providers, standalone StaffingPlan, autonomous scheduling, WorkOrders, memory persistence expansion, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, or release.
```

## Rejection Decision Shape

```text
decisionId=operator-decision-ai-company-real-council-implementation-001
decisionStatus=reject-ai-company-real-council-local-stub-implementation
targetAuthority=one Mission independent local-stub Council positions, deterministic conflict check, Conductor synthesis, and human alignment decisions
targetSurface=docs/54_ai-company-real-council-implementation-plan.md
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=real Council implementation, provider-assisted Council, StaffingPlan, scheduling, WorkOrders, memory, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release
approvalStatement=I reject the local-stub Real Council implementation slice for now. Planning evidence remains available, but runtime/API/UI and downstream authorities stay blocked.
```

## Invalid Shortcuts

These are not implementation approval:

- `continue`
- `approved`
- `approve all`
- `do everything`
- `build Real Council`
- `self-approve implementation`
- approval that omits exact files, compatibility, rollback, focused smoke, or blocked authority
- approval that also opens live providers, StaffingPlan, WorkOrders, memory, mutation, commit, push, or release

## Minimum Acceptance Criteria

1. Use the exact implementation `decisionStatus`.
2. Reference `docs/54_ai-company-real-council-implementation-plan.md`.
3. Use the exact target allowlist.
4. Keep schema v6 and preserve legacy Council routes.
5. Prove independent role request isolation and strict output validation.
6. Preserve failure, conflict, dissent, revision, stop, and reload evidence.
7. Keep local stub deterministic and network-free.
8. Require human alignment before existing linked execution handoff.
9. Name focused runtime/API/UI smokes and aggregate verification.
10. Keep all downstream authorities blocked.

## Still Blocked After Approval

- live or provider-assisted Council execution
- standalone StaffingPlan and dynamic staffing
- autonomous or provider-parallel scheduling
- ExecutionPlan and WorkOrder compilation/execution
- memory persistence expansion and skill promotion
- runtime profile editing
- source mutation or approval bypass
- runtime-agent commit, push, release, external connectors

## Stop Conditions

Stop before implementation if the decision is incomplete, the target surface widens, schema or
file-store migration becomes necessary, legacy route semantics would change, required-role isolation
cannot be proven, local stub requires network/provider calls, rollback cannot preserve old records,
or any downstream authority opens implicitly.

## Verification

```bash
node scripts/smoke-ai-company-real-council-planning.mjs
node scripts/verification_status.mjs
```

The planning smoke verifies the accepted planning decision, exact future implementation boundary,
copy-ready decision shape, compatibility, rollback, and still-blocked authority. It does not execute
Council roles.
