# AI Company Real Council For One Mission Implementation Plan

## Purpose

이 문서는 source-backed CompanyBlueprint foundation 위에서 정확히 하나의 Mission을 대상으로
independent local-stub Council positions, deterministic conflict check, Conductor synthesis, human
alignment를 구현하기 위한 Phase 2 계획이다.

이 문서는 runtime implementation 승인이 아니다. 현재 deterministic Council, persisted state,
API, UI, provider adapter를 변경하지 않으며 Council execution authority를 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-real-council-planning-001` |
| `decisionStatus` | `approve-ai-company-real-council-planning-only` |
| `targetAuthority` | `Real Council for one Mission implementation planning using local-stub roles only` |
| `targetSurface` | docs plus existing CompanyBlueprint, deterministic Council runtime/API/UI, local-stub adapter, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `company/blueprint.json`, `company/roles/*.md`, `src/runtime/company-blueprint.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js`, `src/execution/providers/local-stub-adapter.js`, `scripts/serve-ui-slice-01.mjs`, `ui/council-signals.js` |
| `negativeEvidenceRefs` | current Council is one synchronous deterministic transcript; no independent position records, conflict summary, synthesis record, attempt history, revision/stop decision path, real Council routes, or focused Phase 2 smoke exist |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable only new real-Council routes and UI entry, quarantine incomplete real-Council sessions, preserve legacy deterministic routes and schema v6 state, rerun focused and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-real-council-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | real Council implementation, provider-assisted Council, standalone StaffingPlan runtime, WorkOrder compilation/execution, memory/checkpoint persistence expansion, autonomous scheduling, source mutation, approval bypass, runtime-agent commit/push/release |
| `approvalStatement` | The operator approves planning only for one local-stub Real Council vertical slice. Non-critical planning artifacts may be self-approved, but runtime/API/UI implementation and every downstream authority require a separate complete fielded decision. |

## Current Baseline Evidence

- `DEC-079` provides one strict read-only CompanyBlueprint with stable Conductor, Strategist,
  Architect, and Decomposer profiles.
- `src/runtime/runtime-service.js#buildCouncilSessionRecord` creates all four transcript entries in one
  synchronous function. There are no separate role requests or position records.
- Existing session status is `pending-alignment`; alignment supports only the legacy
  `approve-recommendation` action.
- `POST /api/missions/:missionId/draft-council` creates the deterministic prototype and
  `POST /api/missions/:missionId/approve-council` approves it.
- `src/runtime/file-store.js` preserves `councilSessions` inside schema v6 and normalizes legacy fields.
- The existing local-stub adapter supports execution roles but has no Council request/output contract.
- UI Council surfaces render participant and transcript presentation, not independent role evidence.

## Implementation Objective

Add one opt-in real-Council path for one Mission that proves:

1. Strategist, Architect, and Decomposer receive the same frozen agenda independently.
2. Each required role returns a separately validated position record.
3. Deterministic code detects failure, conflict, dissent, and missing evidence before synthesis.
4. Conductor receives only validated positions plus the conflict summary and returns one validated
   synthesis.
5. The operator can `approve`, `request-revision`, or `stop` without opening source mutation, commit,
   push, release, provider, memory, or autonomous follow-up authority.

## Exact Target Surface

A later implementation decision may open only:

```text
src/runtime/council-sessions.js
src/execution/council-coordinator.js
src/execution/providers/council-local-stub-adapter.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
scripts/smoke-ai-company-real-council.mjs
scripts/smoke-ui-slice-651.mjs
scripts/verification_status.mjs
```

Documentation, README, task ledger, and existing verifier pins may change only to keep evidence
honest. `src/runtime/contracts.js`, `src/runtime/file-store.js`, existing provider adapters, source
mutation, commit, release, memory, and growth code are outside the implementation allowlist.

## Runtime Domain Contract

The new path adds fields only to new real-Council session records:

```text
CouncilSession
- existing legacy-compatible fields
- mode: real-local-stub
- phase: intake | collecting-positions | conflict-check | synthesizing | awaiting-alignment | terminal
- companyBlueprintRef
- staffingSnapshot
  - mode: council
  - requiredAgentIds[]
  - providerMode: local-stub
- agenda
- attempts[]
- currentAttemptId
- terminalReason optional

CouncilAttempt
- id
- sequence
- sourceDigest
- status
- positions[]
- conflictSummary
- synthesis
- revisionRequest optional
- createdAt / completedAt
```

Attempt and position ids are derived deterministically from the session id, attempt sequence, and
agent id. The slice does not add a global sequence or standalone `StaffingPlan` object.

## Independent Role Execution Contract

`src/execution/council-coordinator.js` receives an injected Council adapter. Phase 2 uses only the
new deterministic `council-local-stub-adapter.js`; it makes no network or provider call.

Position request invariants:

- Every required role receives the same frozen agenda and source digest.
- A position request cannot contain another role's output.
- Required roles are resolved from the validated CompanyBlueprint, not browser local storage.
- Strategist, Architect, and Decomposer must each return recommendation, assumptions, evidenceRefs,
  objections, risks, confidence, and proposedNextStep.
- Unknown fields, missing fields, duplicate ids, stale digests, or malformed output fail closed.
- Instrumented smoke adapters must prove no prior position content enters another position request.

The existing execution `local-stub-adapter.js` is not modified. Live provider bridging remains a
separate Phase 3 authority decision.

## Conflict And Synthesis Contract

After all required positions validate, deterministic code produces:

```text
ConflictSummary
- requiredRoleFailures[]
- unsupportedEvidenceRefs[]
- sharedAssumptions[]
- conflictingRecommendations[]
- uniqueObjections[]
- dissentPositionRefs[]
- approvalReady
```

Required role failure or invalid output makes `approvalReady=false` and prevents Conductor execution.
The Conductor receives the frozen agenda, validated positions, and conflict summary only. Synthesis
must include missionInterpretation, adoptedRecommendation, adoptedPositionRefs,
rejectedAlternatives, dissentRefs, unresolvedQuestions, proposedExecutionBoundary,
proposedAcceptanceCriteria, and `humanDecisionRequired=true`.

## Alignment And Handoff Contract

Allowed real-Council decisions:

- `approve`: mark the synthesis approved, then reuse the existing linked-task handoff and execution
  chain only up to the existing builder-preflight/approval boundary.
- `request-revision`: require an operator note and target agent ids, append a new attempt, preserve
  prior positions and synthesis, and rerun only targeted roles when the source digest is unchanged.
- `stop`: mark terminal `operator-stopped` and create no linked task or follow-up execution.

Approval does not create WorkOrders and does not grant builder mutation, commit, push, release,
provider, memory, scheduling, or profile mutation authority.

## API Compatibility Plan

Legacy routes remain byte- and behavior-compatible:

```text
POST /api/missions/:missionId/draft-council
POST /api/missions/:missionId/approve-council
```

New opt-in routes:

```text
POST /api/missions/:missionId/council/start
POST /api/council-sessions/:sessionId/resume
POST /api/council-sessions/:sessionId/decision
```

The start route rejects a missing/invalid CompanyBlueprint, missing project path, duplicate active
session, unsupported mode, or stale source digest. Decision accepts only `approve`,
`request-revision`, or `stop`. Existing routes never silently start the new path.

## UI Contract

The existing Council surface gains data-driven sections only for `mode=real-local-stub`:

- agenda and current phase
- required role status rail
- independent position summaries
- evidence, objection, and dissent register
- Conductor synthesis and unresolved questions
- alignment action shelf
- next-authority boundary

Legacy deterministic sessions keep their current transcript presentation. The UI does not show raw
chain-of-thought, typing simulation, ranking, or browser-defined authority.

## Persistence And Compatibility Plan

- Persisted state remains `schemaVersion: 6`.
- `createEmptyState` and file-store normalization are not edited.
- New real-Council fields are complete on creation and remain additive record fields preserved by the
  current `councilSessions` map.
- Existing sessions without `mode` continue through the legacy deterministic path.
- Alignment keeps the current `{ action, decidedAt, status }` shape; revision detail lives in attempts.
- Reload must preserve attempts, positions, synthesis, terminal state, and current attempt id.
- Direct runtime consumers and configured `companyRuntime` snapshot semantics remain unchanged.

## Failure And Recovery

| Failure | Required result | Allowed recovery |
| --- | --- | --- |
| Invalid blueprint or missing required profile | Start rejected, no session | Fix source policy and retry |
| Required role failure | Attempt terminal, no synthesis | Resume failed role or stop |
| Invalid position schema | Position rejected, no synthesis | New attempt for target role |
| Conflict or dissent | Preserved in conflict summary | Operator alignment decision |
| Invalid synthesis | Attempt failed, no alignment | Retry Conductor or stop |
| Stale source digest | Attempt stale | New attempt from refreshed agenda |
| Revision request | Prior attempt immutable | Append bounded attempt |
| Operator stop | Terminal evidence | Explicit new session decision required |
| Process restart | Existing attempt reloaded | Resume only from recorded phase |

No failure path falls back to a successful deterministic transcript or silently opens legacy
approval.

## Focused Smoke Plan

`scripts/smoke-ai-company-real-council.mjs` must prove:

1. Three independent position requests receive identical agenda digest and no peer output.
2. Valid positions produce deterministic conflict evidence and one Conductor synthesis.
3. Required role failure and malformed output block synthesis/alignment.
4. Conflict and dissent remain visible in the saved attempt.
5. Revision appends history and preserves prior evidence.
6. Stop creates no task or downstream run.
7. Approve alone does not mutate source, commit, push, release, persist memory, or call a provider.
8. Reload preserves session/attempt/synthesis/alignment state at schema v6.
9. Legacy deterministic Council runtime and routes remain unchanged.
10. Invalid blueprint fails only the real-Council start path closed.

`scripts/smoke-ui-slice-651.mjs` must prove the real session renders role status, positions, dissent,
synthesis, open questions, alignment actions, and authority boundary while legacy sessions retain
their existing presentation.

## Rollback Plan

1. Disable/remove the three new real-Council routes and UI entry.
2. Stop dispatching new `mode=real-local-stub` sessions.
3. Preserve completed records as evidence; mark incomplete records quarantined rather than converting
   them to legacy deterministic sessions.
4. Preserve schema v6 state and all legacy Council/Mission/task/run/artifact records.
5. Remove coordinator and Council local-stub adapter only after no entrypoint references them.
6. Rerun legacy Council, focused blueprint, UI, and aggregate verification.

## Implementation Sequence

1. Add pure Council record/output validators and deterministic id/digest helpers.
2. Add the isolated Council local-stub adapter and coordinator with dependency injection.
3. Integrate opt-in real session start/resume/decision methods into runtime service.
4. Add new API routes without changing legacy routes.
5. Add real-session UI rendering and alignment controls behind the session mode.
6. Add focused runtime/API/UI smokes and representative legacy regression smokes.
7. Update docs, README, inventory, and task evidence.
8. Run aggregate verification and security/authority review.

## Acceptance Criteria

Implementation is complete only when all focused smoke items pass, legacy Council behavior is
unchanged, schema v6 reload is proven, no provider/network call occurs, and aggregate verification has
zero failures and empty stderr.

## Exclusions

This plan does not authorize:

- live or provider-assisted Council roles
- standalone StaffingPlan CRUD or dynamic staffing
- parallel provider execution or autonomous scheduling
- ExecutionPlan/WorkOrder compilation or execution
- builder source mutation, commit, push, release
- memory/checkpoint schema expansion or skill promotion
- runtime profile editing or browser authority promotion
- raw chain-of-thought storage

## Implementation Decision Required

Runtime/API/UI implementation remains blocked until the operator supplies the complete fielded
decision in `docs/55_ai-company-real-council-implementation-decision-handoff.md`.

## Verification

```bash
node scripts/smoke-ai-company-real-council-planning.mjs
node scripts/verification_status.mjs
```

These commands verify planning evidence and blocked authority only. They do not prove independent
Council role execution exists.
