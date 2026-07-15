# AI Company Mission Compiler And Inert WorkOrder Implementation Plan

## Purpose

이 문서는 승인된 Real Council synthesis를 deterministic `ExecutionPlan`, inert `WorkOrder`,
normalized `HandoffPacket` preview로 compile하는 Phase 4 최소 vertical slice를 정의한다.
현재 승인은 planning only다. Runtime/API/UI 구현, preview persistence, WorkOrder execution, source
mutation, commit, push, release authority는 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-mission-workorder-compiler-planning-001` |
| `decisionStatus` | `approve-ai-company-mission-workorder-compiler-planning-only` |
| `targetAuthority` | `planning only for one deterministic Mission-to-ExecutionPlan and inert WorkOrder draft compiler` |
| `targetSurface` | docs plus the existing Mission, approved Real Council, CompanyBlueprint, linked-task compatibility path, UI/API handoff boundary, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `src/runtime/council-sessions.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `company/blueprint.json` |
| `negativeEvidenceRefs` | no ExecutionPlan, WorkOrder, HandoffPacket, compile request, graph validator, inert preview route, or preview UI exists; current Council approval API enters the linked-task auto-chain; Council synthesis does not contain target path allowlists or verification commands |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future inert-preview entrypoint, discard in-memory preview objects, preserve approved Council evidence and schema v6 state, keep the existing linked-task auto-chain as compatibility behavior, rerun focused and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | compiler implementation, ExecutionPlan or WorkOrder persistence, WorkOrder approval or execution, standalone StaffingPlan, dynamic or parallel scheduling, provider expansion, memory/checkpoint expansion, profile/source mutation, approval bypass, runtime-agent commit/push/release, external connectors |
| `approvalStatement` | The operator approves planning only for one deterministic Mission-to-ExecutionPlan and inert WorkOrder draft compiler. Non-critical planning artifacts may be self-approved, but implementation and every downstream authority require a later complete fielded decision. |

## Current Baseline Evidence

- `DEC-082` and `DEC-085` produce the same normalized Real Council position and synthesis contract
  through authoritative local-stub and explicit OpenAI Responses modes.
- Real Council approval persists alignment evidence but the server currently continues into the
  existing linked-task planner/architect/task-breaker/builder-preflight auto-chain.
- No `ExecutionPlan`, `WorkOrder`, or `HandoffPacket` runtime object exists in schema v6 state.
- Council synthesis contains objective, recommendation, refs, dissent, unresolved questions,
  execution boundary, and acceptance criteria. It does not contain target path allowlists,
  verification commands, expected artifacts, or per-WorkOrder stop conditions.
- CompanyBlueprint exposes Builder, Reviewer, and QA identities, but their source policy grants no
  mutation, commit, push, or release authority.

## Implementation Objective

Add one explicit `handoffMode=inert-workorder-preview` path that:

1. Validates a source-current Real Council session awaiting explicit operator approval and returns a
   final preview only after that existing approval decision is persisted.
2. Requires an explicit operator `compileSpec` for fields the Council contract cannot supply.
3. Produces a deeply frozen, deterministic, in-memory preview bundle only.
4. Validates exact fields, refs, dependencies, cycles, mutable-target collisions, and authority.
5. Creates no task, run, artifact, approval, persisted plan, WorkOrder, or checkpoint.
6. Preserves the existing linked-task auto-chain when the new handoff mode is not selected.

## Approved Future Target Surface

The later implementation decision may open only:

```text
src/runtime/mission-workorder-compiler.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-mission-workorder-compiler.mjs
scripts/smoke-ui-slice-653.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Documentation, README, task ledgers, and existing verifier pins may change only to keep evidence
current. `src/runtime/contracts.js`, `src/runtime/file-store.js`, `createEmptyState`, provider
adapters, execution coordinators, CompanyBlueprint policy, and role source files are out of scope.

## Compile Input Contract

The pure compiler receives repository-owned records and one explicit operator-owned spec:

```text
MissionCompileInput
- mission
- project
- councilSession
- companyBlueprint
- compileSpec
  - targetPathAllowlist[]
  - expectedArtifacts[]
  - verificationCommands[]
  - stopConditions[]
```

Rules:

- Mission, project, Council session, current attempt, alignment decision, and source digest must agree.
- Council mode must be `real-local-stub` or `real-openai-responses`; preflight requires
  `awaiting-alignment` with validated synthesis and explicit `action=approve`, while final compilation
  requires the same session to carry approved status and alignment.
- `unresolvedQuestions` must be empty. Dissent may remain only as preserved evidence refs.
- Every `compileSpec` field is required, non-empty, deduplicated, bounded, and exact-key validated.
- Target paths are project-relative POSIX-style paths. Absolute paths, traversal, empty segments,
  glob expansion, symlink resolution, and filesystem writes are not performed by this compiler.
- Verification commands are inert strings for preview only. They are never executed by this slice.
- Unknown input fields fail closed. Raw prompts, provider responses, secrets, env values, absolute
  `projectPath`, and chain-of-thought are excluded from compiler output.

## Deterministic Output Contract

The compiler returns a deeply frozen bundle with a digest derived from canonical normalized input:

```text
MissionWorkOrderPreview
- schemaVersion: 1
- previewId
- sourceDigest
- executionPlan
- workOrders[]
- handoffPackets[]
- validation
  - dependencyCycleFree
  - mutableTargetCollisionFree
  - authorityClosed
- persistenceAllowed: false
- executionAllowed: false
- approvalAllowed: false
```

The `ExecutionPlan`, `WorkOrder`, and `HandoffPacket` fields follow
`docs/49_agent-runtime-contract.md`. All statuses are `draft`; `authorityBoundary` explicitly denies
execution, mutation, commit, push, and release.

## Fixed WorkOrder Graph

The first slice compiles exactly three sequential development-pack drafts:

```text
builder-preflight -> reviewer -> qa
```

- Builder receives the approved decisions, constraints, target allowlist, expected artifacts,
  acceptance criteria, verification commands, and stop conditions for read-only preflight planning.
- Reviewer depends on Builder and independently evaluates contract and evidence completeness.
- QA depends on Reviewer and defines or evaluates the supplied verification evidence without running
  commands in this slice.
- Agent ids resolve from the source-backed CompanyBlueprint by role and must support the selected pack.
- Unknown role, duplicate id, missing dependency, self-dependency, cycle, or out-of-graph dependency
  fails closed.

This fixed linear graph intentionally excludes standalone StaffingPlan, dynamic staffing, parallel
groups, scheduling, retry, execution attempts, and provider calls.

## Dependency And Collision Validation

- Dependency ids must resolve inside the same preview and the graph must be acyclic.
- Every WorkOrder using mutable targets carries the same explicit normalized target allowlist.
- The first graph is sequential, so no mutable target overlap can be scheduled concurrently.
- The validator still emits collision evidence so a later scheduling phase cannot infer safety from
  absent data.
- Validation failure returns a stable error and no partial preview.

## Runtime And API Compatibility Plan

- Add a pure compiler module and one runtime preview method; the method loads existing records but
  never calls `saveState`.
- Add an explicit inert-preview branch to Real Council approval. The branch validates the exact
  compile input and complete candidate graph before calling the existing Council decision method.
  Only after preflight succeeds may it persist the existing alignment decision, compile the final
  canonical preview from that approved session, and stop before linked-task auto-chain.
- Add a read-only recompute endpoint for an already approved source-current session using the same
  `compileSpec` contract.
- Requests without `handoffMode=inert-workorder-preview` retain the current linked-task auto-chain.
- Local-stub/provider Council modes share one compiler contract; no provider call is made during compile.
- Compile validation failure leaves Council alignment unchanged and creates no task, run, artifact,
  approval, plan, WorkOrder, or checkpoint.

## Persistence And Schema Compatibility

- Persisted state remains `schemaVersion: 6`.
- `createEmptyState` and file-store normalization are not edited.
- Preview objects are response-local and browser-memory-only; reload requires deterministic recompute.
- Preview ids and digests are evidence identifiers, not durable record ids.
- Existing Mission, CouncilSession, task, run, artifact, and approval shapes remain unchanged.

## UI Boundary

- The Council alignment surface may explicitly select `inert-workorder-preview` before approve.
- The preview renders objective, three draft WorkOrders, dependencies, assigned source-backed roles,
  target allowlist, acceptance/verification, handoff evidence, and blocked authority.
- No `run`, `approve WorkOrders`, `persist`, `mutate`, `commit`, `push`, or `release` control is added.
- Existing local-stub/provider progress, failure evidence, and legacy auto-chain behavior remain intact.

## Focused Verification Plan

Future implementation smoke must prove:

1. Approved local-stub and provider-shaped sessions compile to schema-identical deterministic previews.
2. Repeated canonical input produces byte-equivalent output and digest.
3. Pending, revised, stopped, failed, stale-source, missing-synthesis, or unresolved-question sessions fail.
4. Missing/unknown compile fields, unsafe paths, duplicate refs, empty acceptance/verification, unknown
   roles, missing dependencies, cycles, and collision ambiguity fail closed.
5. Exact Builder -> Reviewer -> QA graph, source-backed agent assignment, HandoffPackets, and blocked
   authority are present.
6. Invalid compile input does not approve Council or create task/run/artifact/approval/plan/WorkOrder/
   checkpoint state; successful preview approval changes only the existing Council/Mission alignment.
7. Schema v6 reload is unchanged, explicit inert-preview approval stops before auto-chain, and the
   default compatibility path is unchanged.
8. UI preview is mode-gated, labels drafts as inert, exposes no downstream action, and fits desktop/mobile.

Required future checks:

```bash
node scripts/smoke-ai-company-mission-workorder-compiler.mjs
node scripts/smoke-ui-slice-653.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

## Rollback Plan

1. Disable the inert-preview approval and recompute entrypoints.
2. Remove response-only preview rendering and discard browser-memory previews.
3. Preserve Mission, approved Council alignment, synthesis, dissent, and source digest evidence.
4. Keep schema v6 and the existing linked-task auto-chain unchanged.
5. Rerun Phase 2/3 Council, UI compatibility, focused compiler, and aggregate verification.

No persisted preview migration or cleanup is required because this slice creates no durable objects.

## Implementation Sequence

1. Add pure exact-field normalization, canonical digest, graph validation, and preview compilation.
2. Add runtime read-only compile method with source-current approved-session gating.
3. Add explicit API handoff mode and recompute endpoint without state-object persistence.
4. Add inert preview rendering and blocked-authority copy.
5. Add focused runtime/API/UI smokes and aggregate/UI QA registration.
6. Run focused, compatibility, UI QA, and aggregate verification before commit/push.

## Acceptance Criteria

- One explicit compiler path produces only a deterministic in-memory preview.
- Compiler-required fields absent from Council synthesis come only from exact operator `compileSpec`.
- The output follows the documented ExecutionPlan, WorkOrder, and HandoffPacket contracts.
- Cycle, dependency, path, role, stale-source, unresolved-question, and authority failures are terminal.
- No execution or persistence authority is inferable from draft creation or Council approval.
- Schema v6, provider/local Council parity, and existing linked-task behavior remain compatible.

## Exclusions

- standalone StaffingPlan, dynamic role selection, parallel-specialist mode
- WorkOrder persistence, approval, queueing, scheduling, execution, retry, cancellation, checkpointing
- provider calls during compilation or provider matrix expansion
- source/profile mutation, memory persistence, skill promotion
- commit, push, release, external connectors, unattended continuation

## Planning Status

- Planning decision: accepted as `DEC-086`
- Implementation decision handoff: documented as `DEC-087`
- Runtime/API/UI implementation: blocked pending the complete fielded decision in
  `docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md`

## Verification

```bash
node scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs
node scripts/verification_status.mjs
```

These checks verify planning evidence and blocked authority only. They do not compile, persist,
approve, schedule, or execute any WorkOrder.
