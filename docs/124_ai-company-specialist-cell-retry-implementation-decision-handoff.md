# AI Company Specialist Cell Retry Implementation Decision Handoff

## Implemented Status

The operator supplied the exact `Valid Approval Outcome`; `DEC-182` accepted and consumed it for
the bounded schema-v21 implementation. This handoff remains immutable decision provenance and does
not grant any additional retry, recovery, application, provider, source, Git, release, memory,
policy, collection, or connector authority.

## Purpose

This document is the complete fielded decision shape for the Stage 4C failed-cell-only retry
described in `docs/123_ai-company-specialist-cell-retry-plan.md`. `DEC-180` accepts planning only and
`DEC-181` records this handoff only. Neither decision authorizes schema v21, a retry record,
attempt-number-two execution, settlement, API/UI mutation, or active-attempt recovery.

Generic approval, continuation, delegated self-approval, and DEC-179 first-attempt authority are
invalid implementation shortcuts. One complete valid operator decision may be accepted as
`DEC-182`.

## Gate At Handoff Time

- Runtime remains schema v20.
- Every existing batch keeps exactly two immutable first-attempt ids.
- Every current cell record has `attemptNumber=1`.
- No retry sequence, map, record, approval, request, coordinator, route, exact retry inspection, or
  UI action exists.
- Active-attempt recovery and reconciliation remain later Ops supervision authorities.

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
decisionId=operator-decision-ai-company-specialist-cell-retry-implementation-001
decisionStatus=approve-ai-company-specialist-cell-retry-implementation-slice
targetAuthority=one deterministic local schema-v21 durable SpecialistCellRetry plus one exact attemptNumber=2 execution for one operator-selected failed first-attempt Researcher or QA cell from one terminal source-current DEC-179 SpecialistBatch, while the source batch and both first attempts remain immutable
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/specialist-cell-retries.js, src/runtime/specialist-cell-attempts.js, src/runtime/runtime-service.js, src/execution/specialist-cell-retry-coordinator.js, src/execution/specialist-researcher-local-runner.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-specialist-cell-retry.mjs, scripts/smoke-ui-slice-701.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, README.md, docs/01_decision-log.md, docs/22_completion-gate-inventory.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, docs/121_ai-company-durable-specialist-batch-plan.md, docs/123_ai-company-specialist-cell-retry-plan.md, docs/124_ai-company-specialist-cell-retry-implementation-decision-handoff.md, tasks/todo.md, tasks/lessons.md
implementationPlanRefs=docs/123_ai-company-specialist-cell-retry-plan.md
runtimePath=require the exact twelve-key bounded JSON request and normalized retryApproval, load one terminal partial-failed or failed DEC-179 batch and one exact failed attemptNumber=1 source cell, return an existing active or terminal retry before source-current recomputation only when the complete normalized retryRequestDigest matches exactly, otherwise require no existing retry for that source cell and no active retry for the batch, recompute one fresh current DEC-176 preview, require request previewId and previewDigest parity with that recomputation, preserve those current retry preview refs, and compare only its sourceDigest selected cellSpecDigest inputPathDigests and inputDigest with the immutable source batch and failed attempt because evaluatedAt makes the new preview identity intentionally distinct from the original batch preview, atomically migrate valid v20 state to v21 and append one active SpecialistCellRetry plus one active same-role SpecialistCellAttempt attemptNumber=2 before worker invocation, preserve the source batch and both original attempts byte-for-byte, set retry attempt cellDeadlineMs to one fresh retryDeadlineMs no greater than the source cell duration and derive deadlineAt from the retry startedAt, revalidate descriptor-bound input bytes after the active save, invoke only the selected fixed local Researcher or QA runner once, settle the retry and attempt together through one fresh-state CAS write without conflict retry, persist only bounded redacted result evidence observed input digests and allowlisted failure codes, return the exact 201 creation 200 replay exact-id GET exact batch-plus-source-cell lookup and post-active conflict envelopes, omit the retry map from generic snapshot, and never infer or reconcile an active retry after interruption
compatibilityPlanRefs=preserve DEC-176 preview and DEC-179 first-attempt start replay inspection current-chain and immutable record digests, preserve council StaffingPlan mode empty parallelGroups and parallelSpecialistsAllowed=false, preserve WorkOrderAttempt provider Mission delivery memory Growth commit and release behavior, create no ExecutionPlan WorkOrder Run Artifact approval inbox source mutation or result application, and keep generic snapshot free of SpecialistBatch SpecialistCellAttempt and SpecialistCellRetry maps
migrationPlanRefs=add schemaVersion 21 plus only sequences.specialistCellRetry and specialistCellRetries, reuse the existing specialistCellAttempt sequence and map for attemptNumber=2, preserve every valid schema-v20 value without rewriting existing batches or first attempts, create no retry during boot read preview render or inspection, save migration plus active retry and retry attempt atomically before execution, reject future partial digest-invalid cross-source duplicate retry-of-retry concurrently-active or semantically invalid v21 state, and retain valid v21 evidence during rollback without downgrade deletion rerun terminal rewrite or inferred completion
sourceEvidenceRefs=DEC-173, DEC-174, DEC-175, DEC-176, DEC-177, DEC-178, DEC-179, DEC-180, DEC-181, docs/00_master-brief.md, docs/03_architecture-roadmap-v1.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md, docs/121_ai-company-durable-specialist-batch-plan.md, docs/122_ai-company-durable-specialist-batch-implementation-decision-handoff.md, docs/123_ai-company-specialist-cell-retry-plan.md, company/blueprint.json, company/roles/researcher.md, company/roles/qa.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/specialist-batches.js, src/runtime/specialist-cell-attempts.js, src/runtime/specialist-batch-preview.js, src/runtime/runtime-service.js, src/execution/specialist-batch-coordinator.js, src/execution/specialist-researcher-local-runner.js, src/execution/qa-node-check-runner.js
negativeEvidenceRefs=current schema v20 fixes batch.cellAttemptIds to two original records and SpecialistCellAttempt attemptNumber to one, rejects every unreferenced cell attempt, has no SpecialistCellRetry sequence map contract record digest approval request coordinator route exact retry inspection bounded failed-cell locator UI action focused runtime smoke or UI smoke, and exposes no active-attempt recovery reconciliation cancellation automatic retry provider result-application source Git release memory scheduling policy bypass or connector authority
rollbackRefs=disable retry POST exact-id GET exact source locator and UI action, stop new retry dispatch and settlement, retain schema-v21 validators and every valid retry and attempt record without downgrade delete rewrite rerun or inferred completion, preserve source batches and original first attempts byte-for-byte, keep DEC-176 preview and DEC-179 first-attempt inspection available, and rerun migration focused compatibility UI README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-specialist-cell-retry.mjs; scripts/smoke-ui-slice-701.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=active-attempt recovery reconciliation quarantine cancellation resume or success inference, automatic retry retry-all retries beyond attemptNumber=2 retry of retry dynamic or additional cells concurrent retries broad parallel-specialists StaffingPlan policy provider calls background autonomous recursive or cross-project scheduling result application ExecutionPlan WorkOrder Run Artifact approval inbox creation source mutation memory application profile or policy mutation runtime-agent commit push or release lifecycle collection list search update delete generic snapshot exposure approval bypass external connectors
approvalStatement=I approve implementation only for one exact schema-v21 failed-first-attempt SpecialistCellRetry described in docs/123_ai-company-specialist-cell-retry-plan.md. This permits one separately approved local attemptNumber=2 for one exact failed Researcher or QA first attempt while every original record remains immutable. It does not approve active-attempt recovery, reconciliation, cancellation, automatic or repeated retry, providers, background scheduling, result application, source mutation, Git or release, memory, policy bypass, collections, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-specialist-cell-retry-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded schema-v21 failed-cell retry slice
requestedEvidence=one or more exact missing immutable-source migration retry-record attempt-number source-current approval deadline settlement replay redaction rollback focused-smoke or still-blocked-authority refs
approvalStatement=I request the named evidence before SpecialistCellRetry implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-specialist-cell-retry-implementation-001
decisionStatus=reject-ai-company-specialist-cell-retry-implementation
targetAuthority=the same bounded schema-v21 failed-cell retry slice
approvalStatement=I reject SpecialistCellRetry implementation. Schema v20 and DEC-179 remain authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-specialist-cell-retry-implementation-001
decisionStatus=defer-ai-company-specialist-cell-retry-implementation
targetAuthority=the same bounded schema-v21 failed-cell retry slice
approvalStatement=I defer SpecialistCellRetry implementation. No schema retry record attempt execution settlement API UI recovery or downstream authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `승인`, `전체 승인`, `계획대로 진행`, `continue`, or `do everything`
- delegated self-approval for schema migration, retry records, attempt #2, worker execution, or
  settlement
- planning-only `DEC-180`, handoff-only `DEC-181`, or first-attempt `DEC-179`
- rewriting a source batch or first attempt
- appending a retry attempt id to `SpecialistBatch.cellAttemptIds`
- retrying a completed cell, active cell, retry attempt, or already-retried source cell
- starting a retry before active retry and attempt records are atomically persisted
- automatic CAS retry, worker rerun, active-attempt reconciliation, cancel, or inferred success
- persistence of raw source, stdout, stderr, absolute paths, argv, environment, credentials,
  transcripts, provider payloads, or stacks
- result application to Mission, Council, ExecutionPlan, WorkOrder, Run, Artifact, memory, source,
  Git, or release
- omission of migration, immutable-source, exact replay, interruption, rollback, focused-smoke, or
  blocked-authority fields

## Acceptance Criteria

1. Every required field names one failed first-attempt cell and one attempt #2 only.
2. The parent batch is terminal `partial-failed` or `failed`; the source cell is failed attempt #1.
3. Parent batch and both original attempt bytes and record digests remain unchanged.
4. Schema v21 adds only the retry sequence and map and reuses the cell-attempt sequence/map.
5. One CAS write persists migration, active retry, and active attempt #2 before worker invocation.
6. The exact twelve-key request binds one fresh DEC-176 preview and matches only its source and
   selected-cell evidence to the original immutable digests; timestamp-derived preview identity is
   not required to equal the original batch preview.
7. The retry approval binds exact source record digests and the retry request digest is reproducible.
8. Retry deadline is positive, no longer than the source cell duration, and reload-validatable.
9. Only the selected fixed local Researcher or QA runner executes once.
10. Settlement updates only the retry and attempt #2 through one fresh-state CAS write.
11. Settlement conflict leaves active evidence and never reruns or infers success.
12. Completed-cell, retry-of-retry, duplicate, concurrent, stale, drifted, malformed, and oversized
    requests fail closed before worker execution.
13. Exact replay never invokes the worker.
14. Durable output remains bounded and redacted.
15. Exact creation, replay, post-active conflict, exact-id GET, and exact batch-plus-source-cell
    lookup use closed response shapes.
16. Generic snapshot omits all three specialist durable maps.
17. UI separates original evidence from retry evidence and offers no broad retry or recovery action.
18. Focused runtime/API/UI, UI QA, and aggregate verification pass.
19. Rollback preserves valid schema-v21 evidence without downgrade or mutation.
20. Active-attempt recovery and every authority outside the named slice remain blocked.

## Completion Rule

The exact `Valid Approval Outcome` was supplied and recorded as `DEC-182`. The implementation gate
is consumed; every authority in `stillBlockedAuthorities` remains separately gated.
