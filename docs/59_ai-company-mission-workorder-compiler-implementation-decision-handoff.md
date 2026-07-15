# AI Company Mission Compiler And Inert WorkOrder Implementation Decision Handoff

## Purpose

이 문서는 `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`의 Phase 4
planning evidence를 architecture-sensitive implementation decision으로 넘기기 위한 copy-ready
fielded handoff다. 이 문서 자체는 구현이나 runtime authority를 열지 않는다.

## Current Gate

- Planning authority: accepted as `DEC-086`
- Decision handoff evidence: `DEC-087`
- Current implementation authority: blocked
- Required next input: one complete fielded decision below

## Source Evidence

- `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-086`, `DEC-087`
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`
- `company/blueprint.json`
- `src/runtime/council-sessions.js`
- `src/runtime/runtime-service.js`
- `scripts/serve-ui-slice-01.mjs`
- `node scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

```text
decisionId=operator-decision-ai-company-mission-workorder-compiler-implementation-001
decisionStatus=approve-ai-company-mission-workorder-compiler-implementation-slice
targetAuthority=one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path from one operator-approved source-current Real Council synthesis
targetSurface=src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-mission-workorder-compiler.mjs, scripts/smoke-ui-slice-653.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/58_ai-company-mission-workorder-compiler-implementation-plan.md
runtimePath=require a source-current real-local-stub or real-openai-responses Council session awaiting operator alignment plus exact operator compileSpec, validate the complete candidate graph before persisting the existing Council approval, compile one deeply frozen response-only ExecutionPlan with sequential Builder Reviewer and QA WorkOrder drafts and normalized HandoffPackets from the approved session, and stop before linked-task auto-chain when inert-preview mode is explicit
compatibilityPlanRefs=keep schemaVersion 6, do not edit createEmptyState file-store normalization CompanyBlueprint role sources provider adapters or execution coordinators, preserve default linked-task auto-chain and legacy Council behavior, make the new handoff mode explicit, and create no persisted plan WorkOrder task run artifact approval or checkpoint
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-086, DEC-087, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/58_ai-company-mission-workorder-compiler-implementation-plan.md, company/blueprint.json, src/runtime/council-sessions.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=no ExecutionPlan WorkOrder HandoffPacket compile request graph validator inert preview route or preview UI exists, current Council approval API enters linked-task auto-chain, and Council synthesis lacks target path allowlists verification commands expected artifacts and per-WorkOrder stop conditions
rollbackRefs=disable inert-preview approval and recompute entrypoints, discard response and browser-memory previews, preserve Mission and approved Council evidence, keep schema v6 and the default linked-task compatibility path, rerun focused Council UI and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-mission-workorder-compiler.mjs proving exact compileSpec validation source-current session gating compile preflight before approval no alignment change on invalid input deterministic digest schema parity fixed Builder Reviewer QA graph dependency cycle and collision validation role allowlist authority closure no object persistence schema v6 reload and default auto-chain compatibility; scripts/smoke-ui-slice-653.mjs proving explicit inert-preview selection draft evidence blocked downstream controls desktop/mobile fit and unchanged local-stub provider and legacy Council behavior
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=ExecutionPlan or WorkOrder persistence, WorkOrder approval queueing scheduling or execution, standalone StaffingPlan, dynamic staffing, parallel or autonomous scheduling, provider expansion, memory or checkpoint expansion, runtime profile mutation, source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I approve implementation only for the deterministic response-only Mission compiler and inert Builder Reviewer QA WorkOrder preview path described in docs/58_ai-company-mission-workorder-compiler-implementation-plan.md. This does not approve durable plan or WorkOrder records, WorkOrder approval or execution, StaffingPlan, scheduling, provider expansion, memory persistence, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, or external connectors.
```

## Rejection Decision Shape

```text
decisionId=operator-decision-ai-company-mission-workorder-compiler-implementation-001
decisionStatus=reject-ai-company-mission-workorder-compiler-implementation
targetAuthority=one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path from one operator-approved source-current Real Council synthesis
targetSurface=docs/58_ai-company-mission-workorder-compiler-implementation-plan.md
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=compiler implementation, ExecutionPlan or WorkOrder persistence approval scheduling or execution, StaffingPlan, provider expansion, memory, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I reject the Mission compiler and inert WorkOrder preview implementation slice for now. Planning evidence remains available, but implementation and downstream authorities stay blocked.
```

## Invalid Shortcuts

These are not implementation approval:

- `continue`
- `approved`
- `approve all`
- `do everything`
- `self-approve implementation`
- approval that omits the exact target files, input/output contract, no-persistence guarantee,
  compatibility path, rollback, focused smoke, or still-blocked authority
- approval that also opens WorkOrder persistence/execution, StaffingPlan, scheduling, memory, mutation,
  commit, push, release, or connectors

## Minimum Acceptance Criteria

1. Use the exact implementation `decisionStatus` and target authority.
2. Reference `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`.
3. Use the exact target allowlist and explicit `inert-workorder-preview` path.
4. Require source-current Council evidence and exact operator `compileSpec`, and complete deterministic
   preflight validation before persisting the existing Council approval.
5. Keep output deterministic, deeply frozen, response-only, and authority-closed.
6. Keep schema v6 and avoid file-store, provider, execution-coordinator, and source-policy changes.
7. Prove graph, path, role, ref, unresolved-question, stale-source, and collision rejection.
8. Prove no task, run, artifact, approval, plan, WorkOrder, or checkpoint persistence.
9. Preserve the default linked-task auto-chain and legacy Council behavior.
10. Keep every downstream authority blocked.

## Still Blocked After Approval

- durable ExecutionPlan, WorkOrder, or HandoffPacket records
- WorkOrder approval, queueing, scheduling, execution, retry, cancellation, or checkpointing
- standalone StaffingPlan, dynamic staffing, or parallel-specialist mode
- provider expansion or provider calls during compile
- memory persistence, profile/source mutation, skill promotion, approval bypass
- runtime-agent commit, push, release, external connectors, unattended continuation

## Stop Conditions

Stop before implementation if the decision is incomplete, output must be persisted, schema/file-store
migration becomes necessary, existing auto-chain behavior would change by default, compile input would
be inferred from provider text, unresolved questions could compile, commands could execute, preview
could open downstream actions, or the target surface widens beyond the exact allowlist.

## Verification

```bash
node scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs
node scripts/verification_status.mjs
```

The current checks prove only that the implementation boundary is complete and reviewable. They do
not record an implementation outcome or open runtime authority.
