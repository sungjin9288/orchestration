# AI Company Durable Specialist Batch Implementation Decision Handoff

## Purpose

This document is the complete fielded decision shape for the Stage 4B implementation described in
`docs/121_ai-company-durable-specialist-batch-plan.md`. `DEC-177` accepts planning only and
`DEC-178` records this handoff only. Neither decision authorizes schema v20, durable records, worker
execution, concurrency, deadline enforcement, settlement writes, API/UI mutation, or policy
expansion.

Generic approval, broad continuation, delegated self-approval, and `DEC-176` preview authority are
invalid shortcuts. One complete valid operator decision may be accepted as `DEC-179`.

## Current Gate

- Runtime state is schema v19.
- `DEC-176` provides one exact response/browser-memory-only preview.
- `parallelSpecialistsAllowed=false` still blocks the broad StaffingPlan mode.
- No SpecialistBatch or SpecialistCellAttempt durable lifecycle exists.
- No local specialist coordinator, serial settlement queue, start route, exact durable GET,
  bounded current-chain locator, snapshot exclusion, or UI execution action exists.
- Implementation remains blocked until the operator supplies every required field below.

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
decisionId=operator-decision-ai-company-durable-specialist-batch-implementation-001
decisionStatus=approve-ai-company-durable-specialist-batch-implementation-slice
targetAuthority=one deterministic local schema-v20 durable SpecialistBatch and exactly two SpecialistCellAttempt records with one request-scoped bounded concurrent local first attempt from one exact source-current DEC-176 preview, while parallel-specialists StaffingPlan mode remains disabled
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/specialist-batches.js, src/runtime/specialist-cell-attempts.js, src/runtime/runtime-service.js, src/execution/specialist-batch-coordinator.js, src/execution/specialist-researcher-local-runner.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-specialist-batch.mjs, scripts/smoke-ui-slice-700.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, README.md, docs/01_decision-log.md, docs/22_completion-gate-inventory.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, docs/121_ai-company-durable-specialist-batch-plan.md, docs/122_ai-company-durable-specialist-batch-implementation-decision-handoff.md, tasks/todo.md, tasks/lessons.md
implementationPlanRefs=docs/121_ai-company-durable-specialist-batch-plan.md
runtimePath=require the exact eight-key bounded JSON request and normalized executionApproval, recompute the source-current DEC-176 preview and fresh CompanyBlueprint role and file digests, preserve council StaffingPlan mode and parallelSpecialistsAllowed=false, atomically migrate v19 to v20 and persist one active batch plus two active first attempts with bounded normalized executionApproval exact inputPathDigests durable batchDeadlineMs and per-cell cellDeadlineMs before worker invocation, derive and reload-validate exact batch and cell deadlineAt values from one startedAt, revalidate worker input digests after the active save and before and where applicable after execution, start the fixed Researcher and QA local workers concurrently, settle each completion through one failure-isolated serial fresh-state CAS writer that continues after a prior conflict without retrying it, persist only redacted bounded result evidence observed input digests and allowlisted failure codes, derive the exact active completed partial-failed or failed batch status from cell states, return the exact POST exact-id GET bounded current-chain GET and conflict envelopes, omit both durable maps from generic snapshot, and never rerun or infer success for an active interrupted cell
compatibilityPlanRefs=preserve DEC-176 response-only preview, council-mode StaffingPlan and empty parallelGroups, CompanyBlueprint parallelSpecialistsAllowed=false, schema-v19 WorkOrderAttempt scheduler, existing Council WorkOrder provider task memory Growth commit and release behavior, keep the generic snapshot free of the new durable maps, and create no ExecutionPlan WorkOrder Run Artifact approval inbox or source mutation
migrationPlanRefs=add schemaVersion 20 plus only specialistBatch and specialistCellAttempt sequences and maps, preserve every valid v19 value without rewriting existing records, create no records during boot read preview render or inspection, save migration plus initial active records atomically before execution, reject future partial digest-invalid cross-source duplicate or semantically invalid v20 state, and retain valid v20 evidence during rollback without downgrade deletion or terminal rewrite
sourceEvidenceRefs=DEC-132, DEC-163, DEC-166, DEC-169, DEC-170, DEC-171, DEC-172, DEC-173, DEC-174, DEC-175, DEC-176, docs/00_master-brief.md, docs/03_architecture-roadmap-v1.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, docs/120_ai-company-specialist-batch-preview-implementation-decision-handoff.md, company/blueprint.json, company/roles/researcher.md, company/roles/qa.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/company-blueprint.js, src/runtime/staffing-plans.js, src/runtime/work-order-attempts.js, src/runtime/specialist-batch-preview.js, src/runtime/runtime-service.js, src/execution/qa-node-check-runner.js
negativeEvidenceRefs=current schema-v19 has no SpecialistBatch or SpecialistCellAttempt records validators coordinator settlement writer execution route exact inspection bounded current-chain locator snapshot exclusion or durable UI, broad parallel StaffingPlan policy remains false, no concurrent partial-settlement or failure-isolated queue pattern exists, active-save source drift and Researcher deadline enforcement are not implemented, no durable expected input path list normalized execution approval deadline budgets or allowlisted terminal failure contract exists, exact Stage 4B POST GET and post-active conflict envelopes are absent, QA runner output requires redaction before persistence, and retry cancellation recovery provider result-application and background authorities remain absent
rollbackRefs=disable the specialist batch start route current-chain locator and UI action, stop new worker dispatch and settlement creation, retain schema-v20 validators exact-id GET inspection and generic snapshot exclusion, preserve active partial failed and completed records without downgrade deletion retry or inferred completion, keep DEC-176 preview and schema-v19 scheduler behavior available, and rerun migration focused compatibility UI README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-specialist-batch.mjs; scripts/smoke-ui-slice-700.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=parallel-specialists StaffingPlan policy change, dynamic cells, more than two concurrent cells, provider calls, failed-cell retry, active-attempt recovery or reconciliation, operator cancellation, background autonomous recursive or cross-project scheduling, result application, ExecutionPlan WorkOrder Run Artifact creation, source mutation, memory application, profile or policy mutation, runtime-agent commit push or release, lifecycle collection list search update delete, generic snapshot exposure, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v20 request-scoped local read-only SpecialistBatch first attempt described in docs/121_ai-company-durable-specialist-batch-plan.md. This permits exactly two fixed Researcher and QA workers, active-before-execution persistence, bounded concurrent execution, deadline enforcement, serial CAS settlement, partial durable evidence, and exact inspection while parallel-specialists StaffingPlan mode remains disabled. It does not approve provider calls, retry, recovery, operator cancellation, background scheduling, result application, source mutation, Git or release, memory, policy bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-durable-specialist-batch-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded schema-v20 SpecialistBatch first-attempt slice
requestedEvidence=one or more exact missing policy migration record concurrency settlement deadline crash redaction compatibility rollback focused-smoke or still-blocked-authority refs
approvalStatement=I request the named evidence before durable SpecialistBatch implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-durable-specialist-batch-implementation-001
decisionStatus=reject-ai-company-durable-specialist-batch-implementation
targetAuthority=the same bounded schema-v20 SpecialistBatch first-attempt slice
approvalStatement=I reject durable SpecialistBatch implementation. DEC-176 response-only preview and schema v19 remain authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-durable-specialist-batch-implementation-001
decisionStatus=defer-ai-company-durable-specialist-batch-implementation
targetAuthority=the same bounded schema-v20 SpecialistBatch first-attempt slice
approvalStatement=I defer durable SpecialistBatch implementation. No schema record worker concurrency deadline settlement provider result application or downstream authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `승인`, `전체 승인`, `계획대로 진행`, `continue`, or `do everything`
- delegated self-approval for schema migration, durable records, worker execution, or concurrency
- planning-only `DEC-177`, handoff-only `DEC-178`, or preview implementation `DEC-176`
- setting `parallelSpecialistsAllowed=true` or creating a `parallel-specialists` StaffingPlan
- starting workers before the batch and both active attempts are atomically persisted
- waiting for both workers before the first settlement write
- automatic worker rerun, CAS retry, active-attempt success inference, cancellation, or recovery
- persistence of raw source, stdout, stderr, absolute argv, environment, credential, transcript,
  provider payload, or stack evidence
- result application to Mission, Council, ExecutionPlan, WorkOrder, Run, Artifact, memory, source,
  Git, or release
- omission of migration, partial settlement, crash, rollback, focused-smoke, or blocked-authority
  fields

## Acceptance Criteria

1. Every required field is present and names the exact fixed two-cell local first attempt.
2. The broad parallel StaffingPlan policy remains false and council mode stays authoritative.
3. Schema v20 adds only the two sequences and two maps.
4. One CAS save persists migration, batch, and both active cells before worker invocation.
5. The start route accepts exactly the planned eight keys and uses the fixed canonical
   normalization order with no missing or extra key.
6. The batch preserves the exact normalized execution approval and `batchDeadlineMs`; each cell
   preserves exact bounded `inputPathDigests` and its `cellDeadlineMs`; all record digests remain
   reproducible through exact GET.
7. Batch and cell `deadlineAt` values derive exactly from one `startedAt`, remain validator-checkable
   after reload, and Researcher and QA enforce them independently.
8. Each runner binds completed output to a post-save observed input digest, and QA detects drift
   across execution.
9. Researcher and QA both start before either completion is awaited.
10. Every completion is persisted immediately through one failure-isolated serial fresh-state CAS
   writer; one conflict does not prevent the other cell from settling and is never retried.
11. Active, completed, partial-failed, and failed batch states derive exactly from two cell states;
    failed cells use only the allowlisted bounded failure codes, while valid QA failure verdicts
    remain completed evidence.
12. Partial, failed, timed-out, drifted, conflicted, and interrupted states remain exact and
    inspectable.
13. Replay never reruns workers; retry, recovery, cancellation, and result application remain absent.
14. Durable output is bounded and redacted.
15. POST creation and replay, exact-id GET, bounded current-chain GET, pre-write errors, and
    post-active CAS conflict use the exact planned status and key sets.
16. Generic `/api/snapshot` omits both durable maps, hard refresh uses only the current-chain locator,
    and no collection or list authority opens.
17. Focused runtime/API/UI smokes, UI QA, and aggregate verification pass.
18. Rollback preserves valid schema-v20 evidence without downgrade, deletion, or inferred completion.
19. Every authority outside the named request-scoped local slice remains blocked.

## Completion Rule

Implementation remains blocked until the operator supplies the complete valid approval outcome above.
If accepted as `DEC-179`, implementation must stop after exact durable inspection and verified
request-scoped settlement. No downstream authority is implied.
