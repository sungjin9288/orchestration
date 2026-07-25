# AI Company SpecialistBatchPreview Implementation Decision Handoff

## Purpose

This document is the complete fielded approval shape for the smallest Stage 4A implementation: one deterministic response-only `SpecialistBatchPreview` from one exact source-current approved StaffingEntry-bound local Council synthesis. It describes a reviewable contract only. `DEC-174` records this handoff, while `DEC-175` is reserved for a future accepted implementation decision.

Planning-only `DEC-173`, generic approval, broad continuation, and delegated self-approval do not open implementation. A valid operator decision must provide every field below in one request.

## Required Decision Fields

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
schemaPlanRefs
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
decisionId=operator-decision-ai-company-specialist-batch-preview-implementation-001
decisionStatus=approve-ai-company-specialist-batch-preview-implementation-slice
targetAuthority=one deterministic response-only schema-v19 SpecialistBatchPreview from one exact source-current approved StaffingEntry-bound real-local-stub Council synthesis before WorkOrder plan persistence
targetSurface=src/runtime/specialist-batch-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-specialist-batch-preview.mjs, scripts/smoke-ui-slice-699.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, README.md, docs/01_decision-log.md, docs/22_completion-gate-inventory.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, docs/120_ai-company-specialist-batch-preview-implementation-decision-handoff.md, tasks/todo.md, tasks/lessons.md, scripts/smoke-ai-company-master-plan.mjs, scripts/smoke-ai-company-multi-agent-completion-planning.mjs, scripts/smoke-ai-company-bounded-parallel-read-only-specialists-planning.mjs, scripts/smoke-readme-scope-evidence.mjs, and scripts/smoke-completion-gate-inventory-current-evidence.mjs
implementationPlanRefs=docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md
runtimePath=require one exact source-current active project Mission with status=aligned and linkedTaskId=null accepted council-mode StaffingPlan immutable StaffingEntry terminal approved real-local-stub CouncilSession normalized synthesis fresh CompanyBlueprint and current Researcher/QA role sources; validate one bounded operator-owned specialistSpec one exact bounded compileSpec and contained project-relative input path digests; require exactly research-source-evidence for agent-researcher and verify-plan-evidence for agent-qa; require shared-readonly local-stub-only concurrencyLimit=1 empty writes false source/commit/push authority no dependencies no mutable target paths maxConcurrentCells=2 maxAttemptsPerCell=1 retryAllowed=false maxProviderCalls=0 and deadline at or below 300000ms; return one deeply frozen persisted=false preview-ready response with source cell spec path and preview digests, then stop before WorkOrder plan persistence or any execution
compatibilityPlanRefs=preserve schema-v19, the CompanyBlueprint parallelSpecialistsAllowed=false policy and its strict loader rejection, accepted StaffingPlan and StaffingEntry immutability, Council alignment and Stage 3 scheduler behavior, existing WorkOrder preview/persistence/start/step routes, provider contracts, standalone task paths, browser-local preferences, and all historical routes; create no preview during boot read render refresh source change invalid input or failed recomputation
schemaPlanRefs=keep schemaVersion 19 and existing createEmptyState/file-store normalization unchanged; add no sequence map record migration or durable object, and reject any request that attempts to treat a preview as a SpecialistBatch or SpecialistCellAttempt record
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-163, DEC-166, DEC-169, DEC-170, DEC-172, DEC-173, DEC-174, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, company/blueprint.json, company/roles/researcher.md, company/roles/qa.md, src/runtime/company-blueprint.js, src/runtime/staffing-plans.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, and scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=current schema-v19 has no SpecialistBatch/SpecialistCellAttempt sequence map contract preview module route or UI; parallelSpecialistsAllowed is false and true is rejected; WorkOrderAttempt permits one active sequential execution; no provider call worker execution Promise.all persistence GET start cancel retry recovery raw source body transcript credential environment ingestion automatic selection result application or WorkOrder mutation exists
rollbackRefs=disable the preview method POST route and UI form, discard response and browser-memory previews, preserve schema-v19 and all source evidence without downgrade delete rewrite or policy change, keep Council and WorkOrder behavior available, and rerun focused runtime UI README inventory UI-QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-specialist-batch-preview.mjs proving exact source gate stable two-cell ordering profile policy and role-source digest checks bounded spec/path/deadline validation deterministic digest parity deep freeze response-only no-write stale malformed cross-project path-widening raw-body credential provider attempt or downstream mutation rejection and schema-v19 compatibility; scripts/smoke-ui-slice-699.mjs proving one explicit preview form browser-memory lifecycle exact-gated safe failure presentation absent execution controls unchanged Council/WorkOrder behavior and desktop/mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v20 migration, CompanyBlueprint policy change, SpecialistBatch or SpecialistCellAttempt persistence, actual parallel execution Promise.all provider calls cancellation deadline enforcement retry recovery active-attempt reconciliation result application WorkOrder scheduling source mutation Git commit push release memory application background autonomous scheduling policy mutation approval bypass lifecycle search/list/delete and external connectors
approvalStatement=I approve implementation only for one deterministic response-only schema-v19 SpecialistBatchPreview described in docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md. This permits exactly two read-only local-stub cell contracts in a bounded POST response and browser memory. It does not approve policy change, schema migration, durable batch/cell records, worker execution, concurrency, provider calls, cancellation, retry, recovery, source mutation, Git/release, memory, scheduling, policy bypass, or connectors.
```

## Decision Handling

Only an exact valid approval may be accepted as `DEC-175`. Any missing, widened, stale, or contradictory field leaves implementation blocked. An evidence request, rejection, or deferral records no runtime outcome. The future implementation must keep the preview separate from the schema-v20 durable concurrency and retry/recovery stages described in the plan.
