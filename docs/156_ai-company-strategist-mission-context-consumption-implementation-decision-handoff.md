# AI Company Strategist Mission Context Consumption Implementation Decision Handoff

## Handoff Status

This document records the complete implementation handoff accepted as `DEC-229` after the
planning-only boundary in `DEC-228`. The operator supplied this packet exactly and it was consumed
as `DEC-230`; the packet remains the immutable audit input and grants no authority beyond the
implemented runtime, schema, API, and UI slice.

The packet below is the sole fielded implementation shape. Every line is intentionally kept exact so
an operator can accept or reject the future implementation without broadening the authority.

## Required Fields

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

Every required field name and every corresponding field-value line must appear exactly once.

```text
decisionId=operator-decision-ai-company-strategist-mission-context-consumption-implementation-001
decisionStatus=approve-ai-company-strategist-mission-context-consumption-implementation-slice
targetAuthority=one explicit operator-selected exact-id source-current MissionContextAttachment created under schema-v29 state and consumed by Strategist only during the first attempt of one new schema-v30 real-local-stub StaffingPlan Council start path and stopped at human alignment
targetSurface=src/runtime/contracts.js, src/runtime/mission-context-attachments.js, src/runtime/strategist-context-consumption.js, src/runtime/staffing-entries.js, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-strategist-mission-context-consumption.mjs, scripts/smoke-ui-slice-717.mjs, scripts/smoke-state-transaction-guard.mjs, scripts/smoke-*.mjs current-schema assertion updates, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/155_ai-company-strategist-mission-context-consumption-plan.md
runtimePath=require one exact accepted current local-stub StaffingPlan and one exact current unexpired MissionContextAttachment created under schema-v29 state plus separate contextConsumption decision, load supported state through structural and immutable-lineage validation, return exact retained replay before mutable recomputation, otherwise validate the complete current source tuple, pass one frozen normalized context only to Strategist, run one observable deterministic real-local-stub Council first attempt in memory, persist one context-bound StaffingEntry CouncilSession Strategist position and only the existing Mission staffingEntryId councilSessionId status and updatedAt alignment transition in one atomic schema-v30 save, and stop at human alignment
compatibilityPlanRefs=preserve every schema-v29 record in its original exact shape and digest as a legacy variant without backfill, preserve the contextless StaffingEntry and Council path, provider and legacy Council behavior, Mission content identity fields and unrelated lifecycle behavior, Architect and Decomposer requests without a context key, Conductor input as an allowlisted position projection without attachment identifiers context digests or consumption receipts, raw normalized context and bounded receipts outside generic snapshots, exact-inspection-only receipt hydration, and supported schema-v29 on-disk inspection without migration writes
migrationPlanRefs=add STATE_SCHEMA_VERSION 30 and STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION 30 only, add no top-level sequence map reverse reference placeholder or context bootstrap, preserve every valid schema-v29 value byte-equivalent, use the existing additive file-store rule so boot read GET preview invalid input and exact replay never save while the next successful authorized write may persist normalized v30 without fabricated context fields, require legacy-shaped contextless or exact context-bound v30 record variants, validate post-transition attachment history through attachment targetMissionDigest equals StaffingPlan missionDigest equals StaffingEntry missionDigest plus Mission StaffingEntry CouncilSession project lineage, reject partial mixed stale future or digest-invalid state, and retain valid schema-v30 evidence during rollback without downgrade deletion rewrite or implicit reuse
sourceEvidenceRefs=DEC-130, DEC-169, DEC-225, DEC-226, DEC-227, DEC-228, DEC-229, docs/54_ai-company-real-council-implementation-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/115_ai-company-staffing-entry-binding-plan.md, docs/153_ai-company-reviewed-mission-context-attachment-plan.md, docs/154_ai-company-reviewed-mission-context-attachment-implementation-decision-handoff.md, docs/155_ai-company-strategist-mission-context-consumption-plan.md, src/runtime/mission-context-attachments.js, src/runtime/staffing-entries.js, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/runtime/runtime-service.js
negativeEvidenceRefs=current schema-v29 runtime records and inspects MissionContextAttachment only, roleConsumptionStatus remains blocked, the existing local Council start requires StaffingEntry but accepts no attachment id or digest, coordinator sends no role-specific context, local-stub Strategist consumes agenda only, immutable StaffingEntry CouncilSession and CouncilPosition records have no context selection receipt or consumption ref, file-store draft-only attachment recomputation cannot validate the normal aligning transition, current normalization persists the latest schema on any later successful write, existing smoke-suite current-schema assertions require bounded maintenance, generic snapshots expose CouncilSession records, Conductor currently receives full position objects, and no context-bound downstream scheduler guard exists
rollbackRefs=disable the new POST route and UI opt-in, reject new context-bound starts and direct context calls, preserve existing schema-v30 context-bound StaffingEntry CouncilSession Strategist position and attachment evidence as exact inspect-only records, keep the existing contextless Council entry available, keep generic snapshots redacted, block every downstream use of retained context-bound sessions, perform no downgrade deletion source rewrite or implicit retry, and rerun focused compatibility transaction UI and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-strategist-mission-context-consumption-planning.mjs; scripts/smoke-ai-company-strategist-mission-context-consumption.mjs; scripts/smoke-ui-slice-717.mjs; scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs; scripts/smoke-ai-company-staffing-entry-binding.mjs; scripts/smoke-ai-company-real-council.mjs; scripts/smoke-state-transaction-guard.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Architect or Decomposer context consumption, Conductor raw context, planner consumption, prompt or policy injection, ExecutionPlan or WorkOrder injection, provider context or provider generation, automatic attachment MemoryRecall MemoryItem or Mission retrieval enumeration list search ranking scoring recommendation or selection, source mutation, runtime-agent commit push or release, retry rework revision resume parallel dynamic autonomous background or scheduled execution, profile or policy mutation, approval bypass, collections, and external connectors
approvalStatement=I approve implementation only for one exact MissionContextAttachment created under schema-v29 state and consumed by Strategist through the schema-v30 first-attempt real-local-stub StaffingPlan Council entry described in docs/155_ai-company-strategist-mission-context-consumption-plan.md, including the bounded current-schema assertion maintenance required by the additive migration. This does not approve Architect or Decomposer consumption, Conductor raw context or consumption receipts, planner prompt policy ExecutionPlan or WorkOrder injection, provider use, automatic retrieval search ranking recommendation, source Git release scheduling bypass collections or connectors.
```

## Acceptance Boundary

- The future decision must match the packet byte-for-byte at the fielded line level.
- One first-attempt local-stub Council entry may consume one operator-selected attachment only for
  Strategist and must stop at human alignment.
- Existing v29 records remain legacy evidence. Read-only activity and replay do not save migration;
  the next successful authorized write may persist normalized v30 under the existing file-store
  contract without fabricating context evidence.
- Exact replay resolves before mutable source validation and performs no save or adapter call.
- Attachment, MemoryItem, MemoryRecall, StaffingPlan, source, provider, prompt, policy,
  ExecutionPlan, WorkOrder, Git, and release bytes remain outside the new mutation boundary. Mission
  content identity fields remain unchanged; only its existing StaffingEntry/Council linkage, status,
  and updated timestamp make the named atomic alignment transition.
- Generic snapshots contain neither raw normalized context nor bounded consumption receipts. Exact
  StaffingEntry inspection is the only refresh-hydration source for retained consumption evidence.
- Any mismatch, missing field, stale source, role leak, downstream dispatch, provider use, or
  rollback downgrade is a failed implementation and must leave the source state unchanged.

## Reserved Next Action

`DEC-230` accepted this exact packet. Any follow-up beyond the implemented Strategist-only first
attempt requires a new complete fielded decision and must preserve every still-blocked authority.
