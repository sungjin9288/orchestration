# AI Company Bounded Parallel Read-Only Specialists Plan

## Purpose

Stage 4 begins with a planning contract, not concurrent execution. `DEC-173` accepts planning only for one response-only `SpecialistBatchPreview` that describes two independent, read-only specialist cells after an exact approved StaffingEntry-bound local Council synthesis and before WorkOrder plan persistence. `DEC-175` closes the implementation-readiness gaps in the request, digest, path, deadline, transport, and browser-lifecycle contracts. It keeps schema v19, repository state, CompanyBlueprint policy, and every existing runtime/API/UI behavior unchanged.

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

## Exact Request Contract

The future route accepts `Content-Type: application/json` and at most `65536` request bytes. The
body has exactly four top-level fields:

```json
{
  "compileSpec": {},
  "evaluatedAt": "2026-07-25T00:00:00.000Z",
  "sourceRefs": {},
  "specialistSpec": {}
}
```

Unknown, missing, inherited, or additional fields fail before any file read beyond the current
source gate. `evaluatedAt` is one exact ISO timestamp at or after the Council alignment
`decidedAt` and no more than five minutes after the runtime clock.

`sourceRefs` has exactly these fields:

```text
blueprintDigest
councilSessionSourceDigest
councilSynthesisDigest
currentAttemptId
missionId
projectId
qaRoleSourceDigest
researcherRoleSourceDigest
staffingEntryId
staffingEntryRecordDigest
staffingPlanId
staffingPlanRecordDigest
```

Every digest is lowercase 64-character SHA-256 hex. The route path supplies `councilSessionId`;
the body does not repeat it. The runtime recomputes the complete tuple from one
`loadStateSupportedReadonly()` state and the freshly loaded CompanyBlueprint evidence, then rejects
any mismatch as stale evidence.

`specialistSpec` has exactly `batchDeadlineMs`, `cells`, `maxConcurrentCells`, and
`maxProviderCalls`. `maxConcurrentCells` is exactly `2`; `maxProviderCalls` is exactly `0`;
`batchDeadlineMs` is an integer from `1` through `300000`. `cells` contains exactly these entries in
this order:

| `cellId` | `agentProfileId` | `evidenceMode` |
| --- | --- | --- |
| `research-source-evidence` | `agent-researcher` | `source-evidence-summary` |
| `verify-plan-evidence` | `agent-qa` | `node-check-plan` |

Each cell has exactly `agentProfileId`, `cellDeadlineMs`, `cellId`, `evidenceMode`, `inputPaths`,
`maxAttempts`, and `retryAllowed`. `cellDeadlineMs` is an integer from `1` through
`batchDeadlineMs`; `maxAttempts` is exactly `1`; `retryAllowed` is exactly `false`. Each cell
supplies between one and sixteen distinct input paths, and the batch may name at most thirty-two
distinct paths.

`compileSpec` reuses the current compiler vocabulary exactly:
`expectedArtifacts`, `stopConditions`, `targetPathAllowlist`, and `verificationCommands`. Each
value is a non-empty array with at most thirty-two distinct strings; strings are trimmed, retain
operator order, and contain at most 1024 characters. Target paths use the same literal
project-relative POSIX grammar as the current compiler. `verificationCommands` is further narrowed
to at most ten exact `node --check <relative-path>` commands. Every command path must appear in both
`targetPathAllowlist` and the QA cell's `inputPaths`. This slice parses and describes those commands;
it never runs them.

## Path And Source Rules

Every input or target path must be a normalized literal project-relative POSIX path. Absolute paths,
drive prefixes, backslashes, glob metacharacters, null bytes, empty segments, `.` segments, and `..`
segments are rejected. For each input path, the implementation resolves the project root and target
with `realpath`, proves the resolved regular file remains inside the project, and hashes the file's
raw bytes. An in-project symlink may resolve to a contained regular file; a missing path, directory,
or escaping symlink fails closed.

Each file is capped at 1 MiB and all distinct input files together are capped at 8 MiB. The response
contains only stable `{ path, byteLength, sha256 }` entries sorted by path. A path shared by both
cells is read and counted once for the aggregate cap, while each cell keeps its own sorted digest
references.

The source-current gate runs in this order:

1. Load one schema-v19 state with `loadStateSupportedReadonly()` and resolve the route's CouncilSession.
2. Reuse `assertBoundStaffingSchedulerSourceCurrent(..., { requireUnlinkedMission: true })`.
3. Require the active Mission to remain `status=aligned`, `linkedTaskId=null`, and without a
   MissionCloseOut.
4. Require zero ExecutionPlans whose `councilSessionId` or `missionId` matches the source chain.
5. Freshly reload CompanyBlueprint plus all nine role sources, then prove the accepted plan remains
   source-current and the Researcher/QA profiles retain the exact closed authority described above.
6. Recompute the normalized Council synthesis digest, selected role-source digests, compileSpec,
   specialistSpec, and contained path digests before returning anything.

No failed gate may call `saveState`, create a record, or leave a response/browser-memory preview.

## Digest And Preview Contract

Canonical JSON recursively sorts object keys and preserves array order after the schema-specific
normalization above. Every digest uses SHA-256 over the UTF-8 canonical JSON, except file digests,
which hash raw file bytes.

- `councilSynthesisDigest` covers the normalized current-attempt synthesis.
- `specialistSpecDigest` and `compileSpecDigest` cover their complete normalized request objects.
- `sourceDigest` covers the exact project, Mission, StaffingPlan, StaffingEntry, CouncilSession,
  current attempt, normalized synthesis, current blueprint and selected role-source tuple, plus the
  unique sorted input-path digest list.
- Each `cellSpecDigest` covers the normalized cell, its source-backed profile projection, its sorted
  input-path digests, and `compileSpecDigest`.
- `previewDigest` covers the complete preview payload before `id` and `previewDigest` are attached.
  The id is `specialist-batch-preview-${previewDigest.slice(0, 16)}`.

The future `SpecialistBatchPreview` has `schemaVersion=1`, `persisted=false`,
`status=preview-ready`, and exactly two independent cells in stable position order:

| Cell | Profile | Permitted preview scope |
| --- | --- | --- |
| `research-source-evidence` | `agent-researcher` | structure immutable repository evidence, uncertainty, and negative evidence |
| `verify-plan-evidence` | `agent-qa` | describe allowlisted `node --check` verification evidence without running it |

Both cells have `status=contract-ready`, no dependencies, no mutable target paths,
`maxAttempts=1`, `retryAllowed=false`, and profile `concurrencyLimit=1`. The batch sets
`maxConcurrentCells=2`, `maxProviderCalls=0`, and one bounded deadline at or below `300000ms`. The
deadline tuple is `{ batchDeadlineMs, deadlineAt }`, where `deadlineAt` is exactly `evaluatedAt` plus
`batchDeadlineMs`. It describes a future execution limit only; Stage 4A schedules no timer and
enforces no runtime cancellation.

The preview object has exactly `blockedActions`, `blueprintDigest`, `cells`,
`compileSpecDigest`, `councilSessionId`, `councilSessionSourceDigest`,
`councilSynthesisDigest`, `currentAttemptId`, `deadline`, `evaluatedAt`, `executionAllowed`, `id`,
`maxConcurrentCells`, `maxProviderCalls`, `missionId`, `persisted`, `persistenceAllowed`,
`previewDigest`, `projectId`, `roleSourceDigests`, `schemaVersion`, `sourceDigest`, `sourceRefs`,
`specialistSpecDigest`, `staffingEntryId`, `staffingEntryRecordDigest`, `staffingPlanId`,
`staffingPlanRecordDigest`, and `status`. Each cell has exactly `agentProfileId`,
`cellDeadlineMs`, `cellId`, `cellSpecDigest`, `dependencies`, `evidenceMode`, `inputPathDigests`,
`maxAttempts`, `position`, `retryAllowed`, `role`, `status`, and `targetPaths`.

Nested evidence is also exact:

- `deadline` has exactly `batchDeadlineMs` and `deadlineAt`.
- `roleSourceDigests` contains exactly two entries in cell order. Each entry has exactly
  `agentProfileId`, `ref`, and `sha256`.
- `sourceRefs` is one sorted, duplicate-free string array containing the project, Mission,
  StaffingPlan, StaffingEntry, CouncilSession, current attempt, `company/blueprint.json`, the
  Researcher and QA role files, and every selected `path:<normalized-relative-path>` ref.
- Every `inputPathDigests` entry has exactly `byteLength`, `path`, and `sha256`, sorted by path.
- The Researcher cell has `position=0`, `role=researcher`; the QA cell has `position=1`, `role=qa`.
  Both have `dependencies=[]` and `targetPaths=[]`.

`executionAllowed` and `persistenceAllowed` are false. `blockedActions` is this exact sorted array:
`approval-bypass`, `cancel`, `commit`, `connectors`, `execute`, `memory-application`, `persist`,
`policy-mutation`, `provider-call`, `push`, `recovery`, `release`, `result-application`, `retry`,
`schedule`, `source-mutation`, `start`, and `workorder-persistence`. The preview is deeply frozen and
exists only in the HTTP response and browser memory. A later durable stage may add authority, result,
and immutable record digests, but Stage 4A does not pre-create those records.

## Future API And UI

The only Stage 4A entrypoint proposed for a separately accepted implementation is:

```text
POST /api/council-sessions/:councilSessionId/specialist-batch-preview
```

The success envelope has exactly `generatedAt` and `specialistBatchPreview`; it never includes
`snapshot`, `derived`, `transcript`, `providerEvidence`, file bodies, or raw source content.
`generatedAt` is transport metadata and is excluded from preview digests. The same current state and
same normalized request return an identical preview object; changing `evaluatedAt` produces a new
preview identity.

Errors use the existing `{ error }` envelope: `400` for malformed, unknown, widened, or invalid
spec/path/command/timestamp input; `404` for a missing route source or selected file; `409` for stale
or lifecycle-conflicting evidence; `413` for request or file-byte limits; and `415` for a non-JSON
content type. There is no GET snapshot, list, start, cancel, retry, execution, or persistence
endpoint.

The Council surface uses `state.councilSpecialistBatchDraft` and
`state.councilSpecialistBatchPreview`. A hard refresh initializes the preview to null. The UI clears
it on Mission or Council selection change, any draft-field edit, failed recomputation, or source
tuple drift observed during snapshot refresh. It may retain the preview across a source-identical
periodic render. The form shows the two read-only contracts and no execution, result transcript,
start, cancel, retry, persistence, or downstream WorkOrder mutation control.

Planned implementation targets are `src/runtime/specialist-batch-preview.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/council-signals.js`, `ui/app.js`, `ui/styles.css`, `scripts/smoke-ai-company-specialist-batch-preview.mjs`, `scripts/smoke-ui-slice-699.mjs`, and the verification/UI-QA registries. None exists in this planning slice.

## Future Stage 4B And 4C Boundaries

Stage 4B may only begin after a separate schema-v20 decision. It must persist one `SpecialistBatch` and two `SpecialistCellAttempt` records before request-scoped execution, cap concurrent cells at two, use one serial CAS writer for settlements, and never infer success or automatically rerun an active cell after interruption. Stage 4C may only add an explicit bounded retry for failed cells while retaining successful evidence. Active-attempt recovery belongs with the later Ops supervision decision, not either preview or retry shortcut.

## Rollback, Verification, And Stop Condition

Planning rollback is documentation-only: revert this clarification while retaining the original
planning evidence and leave schema v19 untouched. Future implementation rollback requires removing
the preview runtime method, POST route, UI form, and browser-memory state together; no feature flag
is assumed. It discards only ephemeral previews and preserves all source records.

The focused planning smoke must prove `DEC-173` through `DEC-175`, the exact request/spec/path/digest/
deadline/transport/browser contracts, current false policy and loader rejection, Researcher/QA role
constraints, documentation and ledger synchronization, absence of future implementation files, and
all closed authority. Future runtime/API/UI smokes must use one source-current bound fixture; compare
state bytes before and after success, replay, and every failure; assert exact request/response keys,
deep freeze, digest parity, stable same-input preview identity, redaction, status/error mapping, and
browser invalidation. `node scripts/verification_status.mjs` remains the aggregate gate.

This slice stops after those source checks pass. It does not permit schema-v20, policy changes, parallel workers, provider calls, durable records, execution results, source changes, or a new runtime/API/UI behavior.
