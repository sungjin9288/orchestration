# AI Company Bounded Parallel Read-Only Specialists Plan

## Purpose

Stage 4 begins with a planning contract, not concurrent execution. `DEC-173` accepts planning only for one response-only `SpecialistBatchPreview` that describes two independent, read-only specialist cells after an exact approved StaffingEntry-bound local Council synthesis and before WorkOrder plan persistence. It keeps schema v19, repository state, CompanyBlueprint policy, and every existing runtime/API/UI behavior unchanged.

The plan deliberately separates a useful reviewable contract from the riskier lifecycle that would execute several workers at once. `WorkOrderAttempt` remains the single-active sequential Builder/Reviewer/QA evidence type; it is not reused for specialist cells.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-bounded-parallel-read-only-specialists-planning-001` |
| `decisionStatus` | `approve-ai-company-bounded-parallel-read-only-specialists-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only Stage 4A SpecialistBatchPreview from one current approved StaffingEntry-bound local Council synthesis |
| `targetSurface` | docs, existing CompanyBlueprint and role contracts, current schema-v19 StaffingPlan/StaffingEntry/Council evidence, planning smoke, README, inventory, and task ledgers |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-163`, `DEC-166`, `DEC-169`, `DEC-170`, `DEC-172`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `company/blueprint.json`, `company/roles/researcher.md`, `company/roles/qa.md`, `src/runtime/company-blueprint.js`, `src/runtime/staffing-plans.js`, and `src/runtime/work-order-attempts.js` |
| `negativeEvidenceRefs` | the CompanyBlueprint sets `parallelSpecialistsAllowed=false`; the loader rejects `true`; current StaffingPlan validation therefore rejects parallel-specialists mode; schema v19 has no SpecialistBatch or SpecialistCellAttempt records; no SpecialistBatchPreview module, route, UI, focused smoke, or persistence exists; and WorkOrderAttempt permits only one active attempt per ExecutionPlan |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable only a future preview entrypoint and UI form, discard response/browser-memory previews, preserve schema-v19 and every source record, then rerun focused and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-bounded-parallel-read-only-specialists-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | SpecialistBatchPreview implementation, schema-v20 migration, SpecialistBatch or SpecialistCellAttempt persistence, actual concurrency, worker execution, provider calls, cancellation, deadline enforcement, retry/recovery, source mutation, Git/release, memory application, scheduling, policy mutation, approval bypass, and connectors |
| `approvalStatement` | This decision authorizes planning, documentation, source-only verification, README/inventory/task synchronization, commit, and push only. Generic approval and delegated self-approval do not authorize the architecture-sensitive implementation handoff in `docs/120_ai-company-specialist-batch-preview-implementation-decision-handoff.md`. |

## Current Gap And Stage Split

The current CompanyBlueprint is intentionally closed: `parallelSpecialistsAllowed=false`, and the strict loader rejects any true value. The existing StaffingPlan accepts the fixed Council roster with no parallel groups. The schema-v19 scheduler then records one active `WorkOrderAttempt` for a single Builder, Reviewer, or QA boundary. That is the correct contract for mutation-aware delivery, but it cannot represent independent, read-only specialist work without weakening the one-active attempt invariant.

Stage 4 is therefore split into three separately authorized slices:

| Stage | Scope | Authority boundary |
| --- | --- | --- |
| 4A | response-only `SpecialistBatchPreview` | schema v19 remains unchanged; no cell executes or persists |
| 4B | future durable concurrent first attempt | separate schema-v20 decision for `SpecialistBatch` and `SpecialistCellAttempt`, one request-scoped bounded execution only |
| 4C | future failed-cell retry and recovery | separate decision for explicit retry, interruption handling, and retained successful cells |

Stage 4A models cancellation, deadlines, and partial outcomes only as fields that Stage 4B must later honor. It creates no `Promise.all`, worker, provider attempt, background loop, start/cancel/retry route, or durable record.

## Stage 4A Source Gate

A future preview must load one state and prove all of the following before returning its response:

1. The active project, Mission with `status=aligned` and `linkedTaskId=null`, accepted council-mode StaffingPlan, immutable StaffingEntry, and CouncilSession form the exact current same-project chain.
2. The StaffingEntry-bound CouncilSession is `real-local-stub`, terminal `approved`, source-current, carries a normalized synthesis, and has no persisted ExecutionPlan.
3. The CompanyBlueprint and both selected role files are current. `agent-researcher` and `agent-qa` must remain source-backed `development` profiles with `workspacePolicy.mode=shared-readonly`, `providerPolicy.allowedModes=[local-stub]`, `concurrencyLimit=1`, empty write policy, and false source/commit/push authority.
4. The operator supplies one bounded `specialistSpec`, one exact bounded `compileSpec`, selected project-relative input paths, and an evaluated time. Every path is normalized, contained in the project, and represented by a digest rather than its raw body.

The future preview response exposes source references and digest proofs, never raw file bodies, Council transcripts, environment values, credentials, provider payloads, or external content.

## Preview Contract

The future `SpecialistBatchPreview` has `persisted=false`, `status=preview-ready`, and exactly two independent cells in stable position order:

| Cell | Profile | Permitted preview scope |
| --- | --- | --- |
| `research-source-evidence` | `agent-researcher` | structure immutable repository evidence, uncertainty, and negative evidence |
| `verify-plan-evidence` | `agent-qa` | describe allowlisted `node --check` verification evidence without running it |

Both cells have no dependencies, no target paths, `maxAttemptsPerCell=1`, `retryAllowed=false`, and `concurrencyLimit=1`. The batch sets `maxConcurrentCells=2`, `maxProviderCalls=0`, and one bounded deadline at or below the CompanyBlueprint's `300000ms` limit; a cell deadline cannot exceed the batch deadline.

The response must include an exact `previewId`, `sourceDigest`, `specialistSpecDigest`, `compileSpecDigest`, current blueprint and role-source digests, per-cell `cellSpecDigest`, project-relative input path digests, a bounded deadline tuple, and `previewDigest`. It is deeply frozen and exists only in the HTTP response and browser memory. A later durable stage may add `authorityDigest`, per-cell input/result digests, and immutable record digests, but Stage 4A does not pre-create those records.

## Future API And UI

The only Stage 4A entrypoint proposed for a separately accepted implementation is:

```text
POST /api/council-sessions/:councilSessionId/specialist-batch-preview
```

The request is bounded and exact. The response is one preview; there is no GET snapshot, list, start, cancel, retry, execution, or persistence endpoint. The Council surface may show one preview form and the two read-only cell contracts in browser memory. It must not show an execution control, result transcript, or downstream WorkOrder mutation control.

Planned implementation targets are `src/runtime/specialist-batch-preview.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/council-signals.js`, `ui/app.js`, `ui/styles.css`, `scripts/smoke-ai-company-specialist-batch-preview.mjs`, `scripts/smoke-ui-slice-699.mjs`, and the verification/UI-QA registries. None exists in this planning slice.

## Future Stage 4B And 4C Boundaries

Stage 4B may only begin after a separate schema-v20 decision. It must persist one `SpecialistBatch` and two `SpecialistCellAttempt` records before request-scoped execution, cap concurrent cells at two, use one serial CAS writer for settlements, and never infer success or automatically rerun an active cell after interruption. Stage 4C may only add an explicit bounded retry for failed cells while retaining successful evidence. Active-attempt recovery belongs with the later Ops supervision decision, not either preview or retry shortcut.

## Rollback, Verification, And Stop Condition

Planning rollback is documentation-only: remove or disable the future implementation entrypoint reference, retain this source evidence, and leave schema v19 untouched. The focused planning smoke must prove `DEC-173`/`DEC-174`, current false policy and loader rejection, Researcher/QA role constraints, documentation and ledger synchronization, absence of future implementation files, and all closed authority. `node scripts/verification_status.mjs` remains the aggregate gate.

This slice stops after those source checks pass. It does not permit schema-v20, policy changes, parallel workers, provider calls, durable records, execution results, source changes, or a new runtime/API/UI behavior.
